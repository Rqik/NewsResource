import express from 'express';

import { AuthorsController } from '../controllers/index';
import { adminMiddleware } from '../middleware/index';

const router = express.Router();

const path = '/authors';

router.get(path, adminMiddleware, AuthorsController.getAll);
router.get(`${path}/:id`, adminMiddleware, AuthorsController.getOne);
router.post(path, adminMiddleware, AuthorsController.create);
router.put(`${path}/:id`, adminMiddleware, AuthorsController.update);
router.delete(`${path}/:id`, adminMiddleware, AuthorsController.delete);

/**
 * @openapi
 * /authors:
 *   get:
 *     tags:
 *       - Authors
 *       - Admin Methods
 *     description: Returns a list of authors. Only for admin
 *     responses:
 *       200:
 *         description: Returns a list of plants by common name.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/Pagination"
 *                 - properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: "#/components/schemas/Authors"
 *   post:
 *     tags:
 *       - Authors
 *       - Admin Methods
 *     description: Method for create author. Only for admin
 *     responses:
 *       200:
 *         description: Returns a list of plants by common name.
 *     parameters:
 *      - in: path
 *        name: name
 * /authors/{id}:
 *   get:
 *     tags:
 *       - Authors
 *       - Admin Methods
 *     description: Return author. Only for admin
 *     responses:
 *       200:
 *         description: Returns a list of plants by common name.
 *     parameters:
 *      - in: path
 *        name: name
 *   put:
 *     tags:
 *       - Authors
 *       - Admin Methods
 *     description: Update author. Only for admin
 *     responses:
 *       200:
 *         description: Returns a list of plants by common name.
 *     parameters:
 *      - in: path
 *        name: name
 *   delete:
 *     tags:
 *       - Authors
 *       - Admin Methods
 *     description: Remove author. Only for admin
 *     responses:
 *       200:
 *         description: Returns a list of plants by common name.
 *     parameters:
 *      - in: path
 *        name: name
 */

export default router;
