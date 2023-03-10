import express from 'express';

import { PostsController } from '../controllers/index';
import { authMiddleware } from '../middleware/index';

const router = express.Router();
const path = '/posts';

router.get(path, PostsController.getAll);
router.get(`${path}/:id`, PostsController.getOne);
router.post(path, authMiddleware, PostsController.create);
router.put(`${path}/:id`, authMiddleware, PostsController.update);
router.patch(`${path}/:id`, authMiddleware, PostsController.partialUpdate);
router.delete(`${path}/:id`, authMiddleware, PostsController.delete);

/**
 * @openapi
 * /posts:
 *   get:
 *     tags:
 *       - Posts
 *     description: Returns a list of post
 *     responses:
 *       200:
 *         description: Posts list.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/Pagination"
 *                 - properties:
 *                     data:
 *                       $ref: "#/components/schemas/Posts"
 *   post:
 *     tags:
 *       - Posts
 *       - Authorized
 *     description: Method for create post. Only for authorized
 *     responses:
 *       200:
 *         description: Returns a list of plants by common name.
 *     parameters:
 *      - in: path
 *        name: name
 * /posts/{id}:
 *   get:
 *     tags:
 *       - Posts
 *     description: Return post.
 *     parameters:
 *      - name: id
 *        in: path
 *        required: true
 *        description: post id
 *        type: string
 *      - name: created_at
 *        in: query
 *        type: string
 *        description: 2022-12-15
 *      - name: created_at__lt
 *        in: query
 *        type: string
 *        description: 2022-12-16
 *      - name: created_at__gt
 *        in: query
 *        type: string
 *        description: 2022-12-14
 *      - name: categories__in
 *        in: query
 *        type: string
 *        description: '[1]'
 *      - name: categories_all
 *        in: query
 *        type: string
 *        description: '[1,3]'
 *      - name: category
 *        in: query
 *        type: string
 *        description: 'filter by category id'
 *      - name: tag
 *        in: query
 *        type: string
 *        description: 'filter by tag id'
 *      - name: tags_all
 *        in: query
 *        type: string
 *        description: '[1,3]'
 *      - name: tags_in
 *        in: query
 *        type: string
 *        description: '[1,3]'
 *      - name: title
 *        in: query
 *        type: string
 *        description: 'find string'
 *      - name: body
 *        in: query
 *        type: string
 *        description: 'find string'
 *      - name: search
 *        in: query
 *        type: string
 *        description: 'find string'
 *     responses:
 *       200:
 *         description: Returns a list of plants by common name.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Post"
 *   put:
 *     tags:
 *       - Posts
 *       - Authorized
 *     description: Method for update post. Only for authorized
 *     parameters:
 *      - in: path
 *        post_id: id
 *        required: true
 *        description: post id
 *        type: string
 *     requestBody:
 *       description: Create a new post
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Post'
 *     responses:
 *       200:
 *         description: Returns a list of plants by common name.
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  $ref: "#/components/schemas/Post"
 *   patch:
 *     tags:
 *       - Posts
 *       - Authorized
 *     description: Partial update post. Only for authorized
 *     responses:
 *       200:
 *         description: Returns a list of plants by common name.
 *     parameters:
 *      - in: path
 *        name: name
 *   delete:
 *     tags:
 *       - Posts
 *       - Authorized
 *     description: Method for remove post. Only for authorized
 *     responses:
 *       200:
 *         description: Returns a list of plants by common name.
 *     parameters:
 *      - in: path
 *        name: name
 */

export default router;
