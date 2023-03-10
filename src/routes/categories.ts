import express from 'express';

import { CategoriesController } from '../controllers/index';
import { adminMiddleware } from '../middleware/index';

const router = express.Router();

const categories = '/categories';
const category = `${categories}/:id`;

router.get(categories, CategoriesController.getAll);
router.get(category, CategoriesController.getOne);
router.post(categories, adminMiddleware, CategoriesController.create);
router.put(category, adminMiddleware, CategoriesController.update);
router.delete(category, adminMiddleware, CategoriesController.delete);

/**
 * @openapi
 * /categories:
 *   get:
 *     tags:
 *       - Categories
 *     description: Returns a list of categories.
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
 *                       $ref: "#/components/schemas/Categories"
 *   post:
 *     tags:
 *       - Categories
 *       - Admin Methods
 *     description: Create category. Only for admin
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             $ref: '#/components/schemas/CategoryPost'
 *     responses:
 *       200:
 *         description: Returns a list of plants by common name.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: "#/components/schemas/Category"
 * /categories/{id}:
 *   get:
 *     tags:
 *       - Categories
 *     description: Return category.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: category id
 *         type: string
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
 *     description: Method for update category. Only for admin
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: category id
 *         type: string
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
 *     description: Method for delete category. Only for admin
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: category id
 *         type: string
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
