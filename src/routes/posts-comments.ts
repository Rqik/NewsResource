import express from 'express';

import { PostsCommentsController } from '../controllers/index';
import authMiddleware from '../middleware/auth-middleware';

const router = express.Router();

const postPath = '/posts';
const commentPath = '/comments';

const comments = `${postPath}/:id${commentPath}`;
const comment = `${postPath}/:id${commentPath}/:cid`;

router.get(comments, PostsCommentsController.getCommentsPost);
router.post(comments, authMiddleware, PostsCommentsController.create);
router.delete(comment, authMiddleware, PostsCommentsController.delete);

/**
 * @openapi
 * /posts/{post_id}/comments:
 *   parameters:
 *     - name: post_id
 *       in: path
 *       required: true
 *       description: post id
 *       type: string
 *   get:
 *     tags:
 *       - Posts
 *       - Comments
 *     description: Returns a list of comments for post.
 *     responses:
 *       200:
 *         description: Returns a list of comments.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/Pagination"
 *                 - properties:
 *                     data:
 *                       $ref: "#/components/schemas/Comments"
 *   post:
 *     tags:
 *       - Posts
 *       - Comments
 *      - Authorized
 *     description: Method for create comment. Only for authorized
 *     responses:
 *       200:
 *         description: Return created comment.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: "#/components/schemas/Comment"
 * /posts/{post_id}/comments/{comment_id}:
 *   parameters:
 *     - name: post_id
 *       in: path
 *       required: true
 *       description: post id
 *       type: string
 *     - name: comment_id
 *       in: path
 *       required: true
 *       description: comment id
 *       type: string
 *   delete:
 *     tags:
 *       - Posts
 *       - Comments
 *       - Authorized
 *     description: Method for remove comment. Only for authorized
 *     responses:
 *       200:
 *         description: return removed comment.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: "#/components/schemas/Comment"
 */

export default router;
