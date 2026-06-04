const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { get } = require('../database/db');
const { logger } = require('../middleware/logger.middleware');

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = get('SELECT * FROM users WHERE email = ?', [email]);

    if (!user) return res.status(401).json({ success:false, message:'Invalid email or password', code:'INVALID_CREDENTIALS' });
    if (user.status === 'locked')   return res.status(403).json({ success:false, message:'Account is locked. Contact support.', code:'ACCOUNT_LOCKED' });
    if (user.status === 'inactive') return res.status(403).json({ success:false, message:'Account is inactive.', code:'ACCOUNT_INACTIVE' });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ success:false, message:'Invalid email or password', code:'INVALID_CREDENTIALS' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    logger.info(`User logged in: ${user.email} [${user.role}]`);
    res.json({ success:true, message:'Login successful', data: { token, user: { id:user.id, name:user.name, email:user.email, role:user.role } } });
  } catch (err) { next(err); }
}

function getProfile(req, res, next) {
  try {
    const user = get('SELECT id,name,email,role,status,created_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) return res.status(404).json({ success:false, message:'User not found' });
    res.json({ success:true, data:user });
  } catch (err) { next(err); }
}

function logout(req, res) {
  logger.info(`User logged out: ${req.user.email}`);
  res.json({ success:true, message:'Logged out successfully' });
}

module.exports = { login, getProfile, logout };
