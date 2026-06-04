const { query, get, run } = require('../database/db');

function getAllPolicies(req, res, next) {
  try {
    let policies;
    if (req.user.role === 'policyholder') {
      policies = query('SELECT p.*, u.name as holder_name, u.email as holder_email FROM policies p JOIN users u ON p.holder_id = u.id WHERE p.holder_id = ? ORDER BY p.id DESC', [req.user.id]);
    } else {
      policies = query('SELECT p.*, u.name as holder_name, u.email as holder_email, a.name as agent_name FROM policies p JOIN users u ON p.holder_id = u.id LEFT JOIN users a ON p.agent_id = a.id ORDER BY p.id DESC', []);
    }
    res.json({ success:true, count:policies.length, data:policies });
  } catch (err) { next(err); }
}

function getPolicyById(req, res, next) {
  try {
    const policy = get('SELECT p.*, u.name as holder_name FROM policies p JOIN users u ON p.holder_id = u.id WHERE p.id = ?', [req.params.id]);
    if (!policy) return res.status(404).json({ success:false, message:'Policy not found' });
    if (req.user.role === 'policyholder' && policy.holder_id !== req.user.id)
      return res.status(403).json({ success:false, message:'Access denied', code:'FORBIDDEN' });
    res.json({ success:true, data:policy });
  } catch (err) { next(err); }
}

function updatePolicyStatus(req, res, next) {
  try {
    const { status } = req.body;
    const policy = get('SELECT * FROM policies WHERE id = ?', [req.params.id]);
    if (!policy) return res.status(404).json({ success:false, message:'Policy not found' });
    run('UPDATE policies SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success:true, message:`Policy status updated to ${status}` });
  } catch (err) { next(err); }
}

module.exports = { getAllPolicies, getPolicyById, updatePolicyStatus };
