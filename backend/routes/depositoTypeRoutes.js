const express = require('express');
const router = express.Router();
const depositoTypeController = require('../controllers/depositoTypeController');

router.get('/', depositoTypeController.getAll);
router.get('/:id', depositoTypeController.getById);
router.post('/', depositoTypeController.create);
router.put('/:id', depositoTypeController.update);
router.delete('/:id', depositoTypeController.delete);

module.exports = router;
