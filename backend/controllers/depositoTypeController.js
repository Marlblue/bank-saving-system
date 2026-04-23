const DepositoType = require('../models/DepositoType');

/**
 * @swagger
 * /api/deposito-types:
 *   get:
 *     summary: Get all deposito types
 *     tags: [Deposito Types]
 *     responses:
 *       200:
 *         description: List of deposito types
 */
exports.getAll = (req, res, next) => {
  try {
    const types = DepositoType.getAll();
    res.json({ success: true, data: types });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /api/deposito-types/{id}:
 *   get:
 *     summary: Get a deposito type by ID
 *     tags: [Deposito Types]
 */
exports.getById = (req, res, next) => {
  try {
    const type = DepositoType.getById(req.params.id);
    if (!type) {
      return res.status(404).json({ success: false, error: 'Deposito type not found' });
    }
    res.json({ success: true, data: type });
  } catch (err) {
    next(err);
  }
};

/**
 * @swagger
 * /api/deposito-types:
 *   post:
 *     summary: Create a new deposito type
 *     tags: [Deposito Types]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, yearly_return]
 *             properties:
 *               name:
 *                 type: string
 *               yearly_return:
 *                 type: number
 */
exports.create = (req, res, next) => {
  try {
    const { name, yearly_return } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }
    if (yearly_return === undefined || yearly_return === null || isNaN(yearly_return) || yearly_return <= 0) {
      return res.status(400).json({ success: false, error: 'Yearly return must be a positive number' });
    }

    const type = DepositoType.create(name.trim(), parseFloat(yearly_return));
    res.status(201).json({ success: true, data: type });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ success: false, error: err.message });
    }
    next(err);
  }
};

/**
 * @swagger
 * /api/deposito-types/{id}:
 *   put:
 *     summary: Update a deposito type
 *     tags: [Deposito Types]
 */
exports.update = (req, res, next) => {
  try {
    const { name, yearly_return } = req.body;

    if (yearly_return !== undefined && (isNaN(yearly_return) || yearly_return <= 0)) {
      return res.status(400).json({ success: false, error: 'Yearly return must be a positive number' });
    }

    const type = DepositoType.update(
      req.params.id,
      name ? name.trim() : undefined,
      yearly_return !== undefined ? parseFloat(yearly_return) : undefined
    );

    if (!type) {
      return res.status(404).json({ success: false, error: 'Deposito type not found' });
    }
    res.json({ success: true, data: type });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ success: false, error: err.message });
    }
    next(err);
  }
};

/**
 * @swagger
 * /api/deposito-types/{id}:
 *   delete:
 *     summary: Delete a deposito type
 *     tags: [Deposito Types]
 */
exports.delete = (req, res, next) => {
  try {
    const deleted = DepositoType.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Deposito type not found' });
    }
    res.json({ success: true, message: 'Deposito type deleted successfully' });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ success: false, error: err.message });
    }
    next(err);
  }
};
