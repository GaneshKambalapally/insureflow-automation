const express = require('express');
const router = express.Router();
const { initiateRefund, getAllRefunds, getRefundById, processRefund } = require('../controllers/refund.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.post('/',           authenticate, initiateRefund);
router.get('/',            authenticate, authorize('admin','agent'), getAllRefunds);
router.get('/:id',         authenticate, getRefundById);
router.put('/:id/process', authenticate, authorize('admin'), processRefund);

module.exports = router;
