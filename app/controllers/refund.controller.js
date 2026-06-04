const { query, get, run } = require('../database/db');
const { logger } = require('../middleware/logger.middleware');

function initiateRefund(req, res, next) {
  try {
    const { payment_id, amount, reason } = req.body;
    const payment = get('SELECT * FROM payments WHERE id = ?', [payment_id]);
    if (!payment) return res.status(404).json({ success:false, message:'Payment not found' });
    if (!['success','reversed'].includes(payment.status))
      return res.status(400).json({ success:false, message:'Refund can only be raised for successful payments' });

    const refund_ref = `REF-${Date.now()}-${Math.random().toString(36).substr(2,4).toUpperCase()}`;
    const result = run('INSERT INTO refunds (refund_ref,payment_id,amount,reason,status) VALUES (?,?,?,?,?)',
      [refund_ref, payment_id, amount||payment.amount, reason, 'initiated']);

    res.status(201).json({ success:true, message:'Refund initiated successfully',
      data:{ id:result.lastInsertRowid, refund_ref, status:'initiated' } });
  } catch (err) { next(err); }
}

function getAllRefunds(req, res, next) {
  try {
    const refunds = query(`SELECT r.*, pay.transaction_ref, pay.amount as payment_amount,
      pol.policy_number, u.name as processed_by_name
      FROM refunds r JOIN payments pay ON r.payment_id = pay.id
      JOIN policies pol ON pay.policy_id = pol.id
      LEFT JOIN users u ON r.processed_by = u.id
      ORDER BY r.id DESC`, []);
    res.json({ success:true, count:refunds.length, data:refunds });
  } catch (err) { next(err); }
}

function getRefundById(req, res, next) {
  try {
    const refund = get('SELECT r.*, pay.transaction_ref, pol.policy_number FROM refunds r JOIN payments pay ON r.payment_id = pay.id JOIN policies pol ON pay.policy_id = pol.id WHERE r.id = ?', [req.params.id]);
    if (!refund) return res.status(404).json({ success:false, message:'Refund not found' });
    res.json({ success:true, data:refund });
  } catch (err) { next(err); }
}

function processRefund(req, res, next) {
  try {
    const refund = get('SELECT * FROM refunds WHERE id = ?', [req.params.id]);
    if (!refund) return res.status(404).json({ success:false, message:'Refund not found' });
    if (!['initiated','processing'].includes(refund.status))
      return res.status(400).json({ success:false, message:'Refund is already processed or rejected' });

    run('UPDATE refunds SET status=?,processed_by=?,processed_at=? WHERE id=?',
      ['processed', req.user.id, new Date().toISOString(), req.params.id]);
    res.json({ success:true, message:`Refund of Rs.${refund.amount} processed successfully` });
  } catch (err) { next(err); }
}

module.exports = { initiateRefund, getAllRefunds, getRefundById, processRefund };
