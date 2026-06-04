const PDFDocument = require('pdfkit');
const { query, get, run } = require('../database/db');
const { logger } = require('../middleware/logger.middleware');

function makePayment(req, res, next) {
  try {
    const { policy_id, amount, payment_method, remarks } = req.body;
    const policy = get('SELECT * FROM policies WHERE id = ?', [policy_id]);
    if (!policy) return res.status(404).json({ success:false, message:'Policy not found', code:'POLICY_NOT_FOUND' });
    if (policy.status === 'cancelled') return res.status(400).json({ success:false, message:'Cannot pay for a cancelled policy' });
    if (req.user.role === 'policyholder' && policy.holder_id !== req.user.id)
      return res.status(403).json({ success:false, message:'Access denied' });

    const transaction_ref = `TXN-${Date.now()}-${Math.random().toString(36).substr(2,5).toUpperCase()}`;
    const isSuccess = Math.random() > 0.05;
    const status = isSuccess ? 'success' : 'failed';
    const failure_reason = isSuccess ? null : 'Payment gateway timeout';
    const paid_at = isSuccess ? new Date().toISOString() : null;

    const result = run(
      'INSERT INTO payments (transaction_ref,policy_id,amount,payment_method,status,remarks,failure_reason,paid_at) VALUES (?,?,?,?,?,?,?,?)',
      [transaction_ref, policy_id, amount, payment_method, status, remarks||'', failure_reason, paid_at]
    );

    logger.info(`Payment ${status}: ${transaction_ref} | ${policy.policy_number} | ${amount}`);
    res.status(201).json({ success:true, message: isSuccess?'Payment successful':'Payment failed',
      data:{ id:result.lastInsertRowid, transaction_ref, policy_id, policy_number:policy.policy_number, amount, payment_method, status, failure_reason, paid_at }
    });
  } catch (err) { next(err); }
}

function getPaymentHistory(req, res, next) {
  try {
    const { status, payment_method, from_date, to_date, policy_id, page=1, limit=10 } = req.query;
    let sql = 'SELECT pay.*, pol.policy_number, u.name as holder_name FROM payments pay JOIN policies pol ON pay.policy_id = pol.id JOIN users u ON pol.holder_id = u.id WHERE 1=1';
    const params = [];

    if (req.user.role === 'policyholder') { sql += ' AND pol.holder_id = ?'; params.push(req.user.id); }
    if (status)         { sql += ' AND pay.status = ?'; params.push(status); }
    if (payment_method) { sql += ' AND pay.payment_method = ?'; params.push(payment_method); }
    if (policy_id)      { sql += ' AND pay.policy_id = ?'; params.push(policy_id); }
    if (from_date)      { sql += ' AND DATE(pay.created_at) >= ?'; params.push(from_date); }
    if (to_date)        { sql += ' AND DATE(pay.created_at) <= ?'; params.push(to_date); }
    sql += ` ORDER BY pay.id DESC LIMIT ${Number(limit)} OFFSET ${(Number(page)-1)*Number(limit)}`;

    const payments = query(sql, params);
    res.json({ success:true, count:payments.length, page:Number(page), data:payments });
  } catch (err) { next(err); }
}

function getPaymentById(req, res, next) {
  try {
    const payment = get('SELECT pay.*, pol.policy_number, u.name as holder_name FROM payments pay JOIN policies pol ON pay.policy_id = pol.id JOIN users u ON pol.holder_id = u.id WHERE pay.id = ?', [req.params.id]);
    if (!payment) return res.status(404).json({ success:false, message:'Payment not found' });
    res.json({ success:true, data:payment });
  } catch (err) { next(err); }
}

function retryPayment(req, res, next) {
  try {
    const payment = get('SELECT * FROM payments WHERE id = ?', [req.params.id]);
    if (!payment) return res.status(404).json({ success:false, message:'Payment not found' });
    if (payment.status !== 'failed') return res.status(400).json({ success:false, message:'Only failed payments can be retried' });
    if (payment.retry_count >= 3) return res.status(400).json({ success:false, message:'Maximum retry attempts reached', code:'MAX_RETRIES' });

    const isSuccess = Math.random() > 0.3;
    const newStatus = isSuccess ? 'success' : 'failed';
    const paid_at = isSuccess ? new Date().toISOString() : null;
    run('UPDATE payments SET status=?, retry_count=retry_count+1, paid_at=?, failure_reason=? WHERE id=?',
      [newStatus, paid_at, isSuccess ? null : 'Retry failed - contact bank', req.params.id]);

    res.json({ success:true, message: isSuccess?'Payment retry successful':'Payment retry failed',
      data:{ id:payment.id, status:newStatus, retry_count:payment.retry_count+1 }
    });
  } catch (err) { next(err); }
}

function downloadReceipt(req, res, next) {
  try {
    const payment = get(`SELECT pay.*, pol.policy_number, pol.plan_type, u.name as holder_name, u.email as holder_email
      FROM payments pay JOIN policies pol ON pay.policy_id = pol.id JOIN users u ON pol.holder_id = u.id
      WHERE pay.id = ? AND pay.status = 'success'`, [req.params.id]);

    if (!payment) return res.status(404).json({ success:false, message:'Receipt not available' });

    const doc = new PDFDocument({ margin:50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="receipt-${payment.transaction_ref}.pdf"`);
    doc.pipe(res);

    doc.fontSize(22).font('Helvetica-Bold').text('InsureFlow Payment Receipt', { align:'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').fillColor('#666').text('Insurance Premium Payment Confirmation', { align:'center' });
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#ccc');
    doc.moveDown();

    const details = [
      ['Transaction Reference', payment.transaction_ref],
      ['Policy Number', payment.policy_number],
      ['Plan Type', payment.plan_type?.toUpperCase() || ''],
      ['Policyholder', payment.holder_name],
      ['Email', payment.holder_email],
      ['Amount Paid', `Rs. ${Number(payment.amount).toLocaleString('en-IN')}`],
      ['Payment Method', payment.payment_method],
      ['Payment Date', new Date(payment.paid_at).toLocaleString('en-IN')],
      ['Status', 'SUCCESSFUL']
    ];
    details.forEach(([label, value]) => {
      doc.fontSize(11).fillColor('#000').font('Helvetica-Bold').text(label + ': ', { continued:true });
      doc.font('Helvetica').text(value);
    });

    doc.moveDown(2);
    doc.fontSize(9).fillColor('#888').text('This is a computer-generated receipt.', { align:'center' });
    doc.end();
    logger.info(`Receipt downloaded: ${payment.transaction_ref}`);
  } catch (err) { next(err); }
}

module.exports = { makePayment, getPaymentHistory, getPaymentById, retryPayment, downloadReceipt };
