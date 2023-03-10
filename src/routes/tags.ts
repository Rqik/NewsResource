import express from 'express';

import { TagsController } from '../controllers/index';
import { adminMiddleware } from '../middleware/index';

const router = express.Router();

const path = '/tags';

router.get(path, TagsController.getAll);
router.get(`${path}/:id`, TagsController.getOne);
router.post(path, adminMiddleware, TagsController.create);
router.put(`${path}/:id`, adminMiddleware, TagsController.update);
router.delete(`${path}/:id`, adminMiddleware, TagsController.delete);

/**
 * @openapi
 * /tags:
 *   get:
 *     tags:
 *       - Tags
 *     description: Returns a list of tags
 *     responses:
 *       200:
 *         description: Success returns a list of tags
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/Pagination"
 *                 - properties:
 *                     data:
 *                       $ref: "#/components/schemas/Tags"
 *   post:
 *     tags:
 *       - Tags
 *       - Admin Methods
 *     description: Method for create tag. Only for admin
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                title:
 *                  type: string
 *     responses:
 *       200:
 *         description: Return created tag.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: "#/components/schemas/Tag"
 * /tags/{id}:
 *   parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       description: tag id
 *       type: string
 *   get:
 *     tags:
 *       - Tags
 *     description: Return tag.
 *     responses:
 *       200:
 *         description: Return tag.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: "#/components/schemas/Tag"
 *   put:
 *     tags:
 *       - Tags
 *       - Admin Methods
 *     description: Method for update tag. Only for admin
 *     responses:
 *       200:
 *         description: Return tag.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: "#/components/schemas/Tag"
 *   delete:
 *     tags:
 *       - Tags
 *       - Admin Methods
 *     description: Method for remove tag. Only for admin
 *     responses:
 *       200:
 *         description: Return removed tag.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: "#/components/schemas/Tag"
 */

export default router;
