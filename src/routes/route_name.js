const express = require('express');
const authController = require('../controllers/auth_controller');
const transactionController = require('../controllers/transaction_controller');
const spendingLimitController = require('../controllers/spending_limit_controller');
const router = express.Router();

// User
router.post('/signup', authController.signUp);
router.post('/signin', authController.signIn);
router.put('/updateUser', authController.updateUser);
router.get('/getAllUser', authController.getAllUser);
router.post('/requestPasswordReset', authController.requestPasswordReset);// check lai
router.post('/resetPassword', authController.resetPassword); // check lai
router.get('/searchUser/:full_name', authController.searchUserByFullName);

// Transaction
router.post('/createTransaction', transactionController.createTransaction);
router.get('/getTransactionType', transactionController.getTransactionType);

// Spending_limit
router.post('/createSpendingLimit', spendingLimitController.createSpendingLimit);
router.get('/getAllSpendingLimit', spendingLimitController.getAllSpendingLimit)
router.delete('/deleteLimit/:id', spendingLimitController.deleteSpendingLimit);
router.put('/updateLimit', spendingLimitController.updateLimit);

module.exports = router;