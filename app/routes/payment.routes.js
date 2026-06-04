const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { makePayment, getPaymentHistory, getPaymentById, retryPayment, downloadReceipt } = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/', authenticate, [
  body('policy_id').isInt().withMessage('Valid policy ID required'),
  body('amount').isFloat({ min: 1 }).withMessage('Valid amount required'),
  body('payment_method').isIn(['NEFT','NACH','CARD','UPI','CHEQUE']).withMessage('Invalid payment method')
], makePayment);

router.get('/history',      authenticate, getPaymentHistory);
router.get('/receipt/:id',  authenticate, downloadReceipt);
router.get('/:id',          authenticate, getPaymentById);
router.put('/:id/retry',    authenticate, retryPayment);

module.exports = router;
