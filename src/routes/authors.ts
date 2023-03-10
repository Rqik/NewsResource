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
 *   security:[]
 *   get:
 *     tags:
 *       - Authors
 *       - Admin Methods
 *     description: Returns a list of authors. Only for admin
 *     responses:
 *       200:
 *         description: Returns a list of authors
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/Pagination"
 *                 - properties:
 *                     data:
 *                       $ref: "#/components/schemas/Authors"
 *   post:
 *     tags:
 *       - Authors
 *       - Admin Methods
 *     description: Method for create author. Only for admin
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             $ref: '#/components/schemas/AuthorPost'
 *     responses:
 *       200:
 *         description: Returns created author.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: "#/components/schemas/Author"
 * /authors/{id}:
 *   get:
 *     tags:
 *       - Authors
 *       - Admin Methods
 *     description: Return author. Only for admin
 *       - name: id
 *         in: path
 *         required: true
 *         description: author id
 *         type: string
 *     responses:
 *       200:
 *         description: Returns author.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: "#/components/schemas/Author"
 *   put:
 *     tags:
 *       - Authors
 *       - Admin Methods
 *     description: Update author. Only for admin
 *       - name: id
 *         in: path
 *         required: true
 *         description: author id
 *         type: string
 *     responses:
 *       200:
 *         description: Return updated author.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: "#/components/schemas/Author"
 *   delete:
 *     tags:
 *       - Authors
 *       - Admin Methods
 *     description: Remove author. Only for admin
 *       - name: id
 *         in: path
 *         required: true
 *         description: author id
 *         type: string
 *     responses:
 *       200:
 *         description: Return removed author.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: "#/components/schemas/Author"
 */

export default router;
