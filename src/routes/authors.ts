import express from 'express';

import { AuthorsController } from '../controllers/index';
import { adminMiddleware } from '../middleware/index';

const router = express.Router();

const path = '/authors';
/**
 * @swagger
 * /plants/{name}:
 *   get:
 *     description: Returns a list of plants by common name.
 *     responses:
 *       200:
 *         description: Returns a list of plants by common name.
 *     parameters:
 *      - in: path
 *        name: name
 */
router.get(path, adminMiddleware, AuthorsController.getAll);
router.get(`${path}/:id`, adminMiddleware, AuthorsController.getOne);
router.post(path, adminMiddleware, AuthorsController.create);
router.put(`${path}/:id`, adminMiddleware, AuthorsController.update);
router.delete(`${path}/:id`, adminMiddleware, AuthorsController.delete);

export default router;
