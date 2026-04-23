const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const transactionController = require('../controllers/transactionController');

// Account CRUD
router.get('/', accountController.getAll);
router.get('/:id', accountController.getById);
router.post('/', accountController.create);
router.put('/:id', accountController.update);
router.delete('/:id', accountController.delete);

// Transaction operations (nested under accounts)
router.post('/:id/deposit', transactionController.deposit);
router.post('/:id/withdraw', transactionController.withdraw);
router.get('/:id/transactions', transactionController.getHistory);

module.exports = router;
