import express from 'express';

import { CategoriesController } from '../controllers';
import { adminMiddleware, errorHandler } from '../middleware';

const router = express.Router();

const categories = '/categories';
const category = `${categories}/:id`;

router.get(categories, errorHandler(CategoriesController.getAll));
router.get(category, errorHandler(CategoriesController.getOne));
router.post(
  categories,
  adminMiddleware,
  errorHandler(CategoriesController.create),
);
router.put(
  category,
  adminMiddleware,
  errorHandler(CategoriesController.update),
);
router.delete(
  category,
  adminMiddleware,
  errorHandler(CategoriesController.delete),
);

/**
 * @openapi
 * /categories:
 *   get:
 *     tags:
 *       - Categories
 *     security: []
 *     description: Returns a list of categories.
 *     responses:
 *       200:
 *         description: Returns a list of categories.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/Pagination"
 *                 - properties:
 *                     data:
 *                       $ref: "#/components/schemas/Categories"
 *   post:
 *     tags:
 *       - Categories
 *       - Admin Methods
 *     description: Create category. Only for admin
 *     security:
 *	     - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             $ref: '#/components/schemas/CategoryPost'
 *     responses:
 *       200:
 *         description: Return created category.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: "#/components/schemas/Category"
 * /categories/{id}:
 *   parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       description: category id
 *       type: string
 *   get:
 *     tags:
 *       - Categories
 *     security: []
 *     description: Return category.
 *     responses:
 *       200:
 *         description: Return category.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: "#/components/schemas/Category"
 *   put:
 *     tags:
 *       - Categories
 *       - Admin Methods
 *     security:
 *	     - bearerAuth: []
 *     description: Method for update category. Only for admin
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             $ref: '#/components/schemas/CategoryPost'
 *     responses:
 *       200:
 *         description: Return category.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: "#/components/schemas/Category"
 *   delete:
 *     tags:
 *       - Categories
 *       - Admin Methods
 *     security:
 *	     - bearerAuth: []
 *     description: Method for delete category. Only for admin
 *     responses:
 *       200:
 *         description: Return remove category
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: "#/components/schemas/Category"
 */

export default router;
