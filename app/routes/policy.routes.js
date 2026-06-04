const express = require('express');
const router = express.Router();
const { getAllPolicies, getPolicyById, updatePolicyStatus } = require('../controllers/policy.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.get('/',    authenticate, getAllPolicies);
router.get('/:id', authenticate, getPolicyById);
router.put('/:id/status', authenticate, authorize('admin'), updatePolicyStatus);

module.exports = router;
