import express from 'express';

import { AuthorsController } from '../controllers';
import { adminMiddleware, errorHandler } from '../middleware';

const router = express.Router();

const path = '/authors';

router.get(path, adminMiddleware, errorHandler(AuthorsController.getAll));
router.get(
  `${path}/:id`,
  adminMiddleware,
  errorHandler(AuthorsController.getOne),
);
router.post(path, adminMiddleware, errorHandler(AuthorsController.create));
router.put(
  `${path}/:id`,
  adminMiddleware,
  errorHandler(AuthorsController.update),
);
router.delete(
  `${path}/:id`,
  adminMiddleware,
  errorHandler(AuthorsController.delete),
);

/**
 * @openapi
 * /authors:
 *   security: []
 *   get:
 *     tags:
 *       - Authors
 *       - Admin Methods
 *     security:
 *	     - bearerAuth: []
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
 *     security:
 *	     - bearerAuth: []
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
 *   parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       description: 'author id'
 *       type: string
 *   get:
 *     tags:
 *       - Authors
 *       - Admin Methods
 *     security:
 *	     - bearerAuth: []
 *     description: Return author. Only for admin
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
 *     security:
 *	     - bearerAuth: []
 *     description: "Update author. Only for admin"
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
 *     security:
 *	     - bearerAuth: []
 *     description: Remove author. Only for admin
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
