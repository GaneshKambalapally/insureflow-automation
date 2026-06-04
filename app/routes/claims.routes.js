const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { raiseClaim, getAllClaims, getClaimById, approveClaim, rejectClaim, disburseClaim } = require('../controllers/claims.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.post('/',              authenticate, raiseClaim);
router.get('/',               authenticate, getAllClaims);
router.get('/:id',            authenticate, getClaimById);
router.put('/:id/approve',    authenticate, authorize('admin','agent'), approveClaim);
router.put('/:id/reject',     authenticate, authorize('admin','agent'), rejectClaim);
router.put('/:id/disburse',   authenticate, authorize('admin'), disburseClaim);

module.exports = router;
