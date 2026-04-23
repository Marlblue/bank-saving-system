const DepositoType = require('../models/DepositoType');

/**
 * @swagger
 * components:
 *   schemas:
 *     DepositoType:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *           example: "Deposito Gold"
 *         yearly_return:
 *           type: number
 *           example: 7.0
 *           description: Yearly interest rate in percentage
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/deposito-types:
 *   get:
 *     summary: Get all deposito types
 *     description: Returns all deposito types sorted by yearly return (ascending).
 *     tags: [Deposito Types]
 *     responses:
 *       200:
 *         description: List of deposito types retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DepositoType'
 *             example:
 *               success: true
 *               data:
 *                 - id: "uuid-1"
 *                   name: "Deposito Bronze"
 *                   yearly_return: 3.0
 *                 - id: "uuid-2"
 *                   name: "Deposito Silver"
 *                   yearly_return: 5.0
 *                 - id: "uuid-3"
 *                   name: "Deposito Gold"
 *                   yearly_return: 7.0
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
 *     description: Returns a single deposito type by its UUID.
 *     tags: [Deposito Types]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Deposito Type UUID
 *     responses:
 *       200:
 *         description: Deposito type found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/DepositoType'
 *       404:
 *         description: Deposito type not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 *     description: Creates a new deposito type with a unique name and yearly return rate. Name must be unique (case-insensitive).
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
 *                 example: "Deposito Platinum"
 *                 description: Unique name for the deposito type
 *               yearly_return:
 *                 type: number
 *                 example: 10.0
 *                 description: Yearly interest rate in percentage (must be > 0)
 *     responses:
 *       201:
 *         description: Deposito type created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/DepositoType'
 *       400:
 *         description: Validation error (missing fields or invalid yearly return)
 *       409:
 *         description: Deposito type name already exists
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
 *     description: Updates the name and/or yearly return of a deposito type. Name uniqueness is enforced.
 *     tags: [Deposito Types]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Deposito Type UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Deposito Platinum Plus"
 *               yearly_return:
 *                 type: number
 *                 example: 12.0
 *     responses:
 *       200:
 *         description: Deposito type updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/DepositoType'
 *       400:
 *         description: Invalid yearly return value
 *       404:
 *         description: Deposito type not found
 *       409:
 *         description: Deposito type name already exists
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
 *     description: Deletes a deposito type. Will fail with 409 if the type is assigned to active accounts.
 *     tags: [Deposito Types]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Deposito Type UUID
 *     responses:
 *       200:
 *         description: Deposito type deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Deposito type deleted successfully"
 *       404:
 *         description: Deposito type not found
 *       409:
 *         description: Deposito type is assigned to active accounts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
