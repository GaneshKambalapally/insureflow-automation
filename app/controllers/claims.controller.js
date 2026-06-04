const { query, get, run } = require('../database/db');
const { logger } = require('../middleware/logger.middleware');

function generateClaimNumber() { return `CLM-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`; }

function raiseClaim(req, res, next) {
  try {
    const { policy_id, amount, reason, description } = req.body;
    const policy = get('SELECT * FROM policies WHERE id = ?', [policy_id]);
    if (!policy) return res.status(404).json({ success:false, message:'Policy not found' });
    if (policy.status !== 'active') return res.status(400).json({ success:false, message:'Claims can only be raised on active policies' });
    if (req.user.role === 'policyholder' && policy.holder_id !== req.user.id)
      return res.status(403).json({ success:false, message:'Access denied' });

    const claim_number = generateClaimNumber();
    const result = run('INSERT INTO claims (claim_number,policy_id,claimant_id,amount,reason,description,status) VALUES (?,?,?,?,?,?,?)',
      [claim_number, policy_id, req.user.id, amount, reason, description||'', 'pending']);

    logger.info(`Claim raised: ${claim_number}`);
    res.status(201).json({ success:true, message:'Claim filed successfully', data:{ id:result.lastInsertRowid, claim_number, status:'pending' } });
  } catch (err) { next(err); }
}

function getAllClaims(req, res, next) {
  try {
    let claims;
    if (req.user.role === 'policyholder') {
      claims = query('SELECT c.*, pol.policy_number, pol.plan_type FROM claims c JOIN policies pol ON c.policy_id = pol.id WHERE c.claimant_id = ? ORDER BY c.id DESC', [req.user.id]);
    } else {
      claims = query('SELECT c.*, pol.policy_number, pol.plan_type, u.name as claimant_name FROM claims c JOIN policies pol ON c.policy_id = pol.id JOIN users u ON c.claimant_id = u.id ORDER BY c.id DESC', []);
    }
    res.json({ success:true, count:claims.length, data:claims });
  } catch (err) { next(err); }
}

function getClaimById(req, res, next) {
  try {
    const claim = get('SELECT c.*, pol.policy_number FROM claims c JOIN policies pol ON c.policy_id = pol.id WHERE c.id = ?', [req.params.id]);
    if (!claim) return res.status(404).json({ success:false, message:'Claim not found' });
    res.json({ success:true, data:claim });
  } catch (err) { next(err); }
}

function approveClaim(req, res, next) {
  try {
    const { approved_amount } = req.body;
    const claim = get('SELECT * FROM claims WHERE id = ?', [req.params.id]);
    if (!claim) return res.status(404).json({ success:false, message:'Claim not found' });
    if (!['pending','under_review'].includes(claim.status))
      return res.status(400).json({ success:false, message:'Claim is not in a reviewable state' });

    run('UPDATE claims SET status=?,reviewed_by=?,approved_amount=? WHERE id=?',
      ['approved', req.user.id, approved_amount||claim.amount, req.params.id]);
    logger.info(`Claim approved: ${claim.claim_number}`);
    res.json({ success:true, message:'Claim approved successfully' });
  } catch (err) { next(err); }
}

function rejectClaim(req, res, next) {
  try {
    const { rejection_reason } = req.body;
    const claim = get('SELECT * FROM claims WHERE id = ?', [req.params.id]);
    if (!claim) return res.status(404).json({ success:false, message:'Claim not found' });
    run('UPDATE claims SET status=?,reviewed_by=?,rejection_reason=? WHERE id=?',
      ['rejected', req.user.id, rejection_reason||'Does not meet policy criteria', req.params.id]);
    res.json({ success:true, message:'Claim rejected' });
  } catch (err) { next(err); }
}

function disburseClaim(req, res, next) {
  try {
    const claim = get('SELECT * FROM claims WHERE id = ?', [req.params.id]);
    if (!claim) return res.status(404).json({ success:false, message:'Claim not found' });
    if (claim.status !== 'approved') return res.status(400).json({ success:false, message:'Only approved claims can be disbursed' });
    run('UPDATE claims SET status=?,settled_at=? WHERE id=?', ['disbursed', new Date().toISOString(), req.params.id]);
    logger.info(`Claim disbursed: ${claim.claim_number}`);
    res.json({ success:true, message:`Claim disbursed. Amount Rs.${claim.approved_amount} transferred.` });
  } catch (err) { next(err); }
}

module.exports = { raiseClaim, getAllClaims, getClaimById, approveClaim, rejectClaim, disburseClaim };
