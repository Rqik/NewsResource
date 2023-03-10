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
 *                       type: object
 *                       $ref: "#/components/schemas/Posts"
 *   post:
 *     tags:
 *       - Posts
 *       - Authorized
 *     security:
 *	     - bearerAuth: []
 *     description: Method for create post. Only for authorized
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             $ref: '#/components/schemas/PostPost'
 *     responses:
 *       200:
 *         description: Return post.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/Post'
 * /posts/{id}:
 *   parameters:
 *    - name: id
 *      in: path
 *      required: true
 *      description: post id
 *      type: string
 *   get:
 *     tags:
 *       - Posts
 *     description: Return post.
 *     parameters:
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
 *         description: Returns a list of posts.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/Pagination"
 *                 - properties:
 *                     data:
 *                       $ref: "#/components/schemas/Posts"
 *   put:
 *     tags:
 *       - Posts
 *       - Authorized
 *     security:
 *	     - bearerAuth: []
 *     description: Method for update post. Only for authorized
 *     requestBody:
 *       description: Create a new post
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/PostPost'
 *     responses:
 *       200:
 *         description: Return post.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               ref: "#/components/schemas/Post"
 *   patch:
 *     tags:
 *       - Posts
 *       - Authorized
 *     security:
 *	     - bearerAuth: []
 *     description: Partial update post. Only for authorized
 *     responses:
 *       200:
 *         description: Return post.
 *   delete:
 *     tags:
 *       - Posts
 *       - Authorized
 *     security:
 *	     - bearerAuth: []
 *     description: Method for remove post. Only for authorized
 *     responses:
 *       200:
 *         description: Return post.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               ref: "#/components/schemas/Post"
 */

export default router;
