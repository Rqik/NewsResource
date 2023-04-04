import express from 'express';

import { PostsDraftsController } from '../controllers/index';
import { authMiddleware, errorHandler } from '../middleware';

const router = express.Router();

const postPath = '/posts';
const draftsPath = '/drafts';

const drafts = `${postPath}/:id${draftsPath}`;
const draft = `${postPath}/:id${draftsPath}/:did`;

router.get(drafts, authMiddleware, errorHandler(PostsDraftsController.getAll));
router.get(draft, authMiddleware, errorHandler(PostsDraftsController.getOne));
router.get(
  `${draft}/publish`,
  authMiddleware,
  errorHandler(PostsDraftsController.publish),
);
router.post(drafts, authMiddleware, errorHandler(PostsDraftsController.create));
router.put(draft, authMiddleware, errorHandler(PostsDraftsController.update));
router.delete(
  draft,
  authMiddleware,
  errorHandler(PostsDraftsController.delete),
);

/**
 * @openapi
 * /posts/{post_id}/drafts:
 *   get:
 *     tags:
 *       - Posts
 *       - Drafts
 *       - Authorized
 *     security:
 *	     - bearerAuth: []
 *     description: Returns a list of draft for news. Only for authorized
 *     parameters:
 *       - name: post_id
 *         in: path
 *         required: true
 *         description: post id
 *         type: string
 *     responses:
 *       200:
 *         description: Returns draft.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/Pagination"
 *                 - properties:
 *                     data:
 *                       $ref: "#/components/schemas/Drafts"
 *   post:
 *     tags:
 *       - Posts
 *       - Drafts
 *       - Authorized
 *     security:
 *	     - bearerAuth: []
 *     description: Method for create post. Only for authorized
 *     responses:
 *       200:
 *         description: Return created draft.
 *         content:
 *           multipart/form-data:
 *             schema:
 *                type: object
 *                $ref: "#/components/schemas/DraftPost"
 * /posts/{post_id}/drafts/{draft_id}:
 *   parameters:
 *     - name: post_id
 *       in: path
 *       required: true
 *       description: post id
 *       type: string
 *     - name: draft_id
 *       in: path
 *       required: true
 *       description: draft id
 *       type: string
 *   get:
 *     tags:
 *       - Posts
 *       - Drafts
 *       - Authorized
 *     security:
 *	     - bearerAuth: []
 *     description: Return draft. Only for authorized
 *     responses:
 *       200:
 *         description: Return drafts.
 *         content:
 *           application/json:
 *             schema:
 *                type: object
 *                $ref: "#/components/schemas/Draft"
 *   put:
 *     tags:
 *       - Posts
 *       - Drafts
 *       - Authorized
 *     security:
 *	     - bearerAuth: []
 *     description: Method for update draft. Only for authorized
 *     responses:
 *       200:
 *         description: Returns updated draft.
 *         content:
 *           multipart/form-data:
 *             schema:
 *                type: object
 *                $ref: "#/components/schemas/DraftPost"
 *   delete:
 *     tags:
 *       - Posts
 *       - Drafts
 *       - Authorized
 *     security:
 *	     - bearerAuth: []
 *     description: Method for delete draft. Only for authorized
 *     responses:
 *       200:
 *         description: Return removed draft.
 *         content:
 *           application/json:
 *             schema:
 *                type: object
 *                $ref: "#/components/schemas/Draft"
 * /posts/{post_id}/drafts/{draft_id}/publish:
 *   get:
 *     tags:
 *       - Posts
 *       - Drafts
 *       - Authorized
 *     security:
 *	     - bearerAuth: []
 *     description: Publish draft and update news. Only for authorized
 *     parameters:
 *       - name: post_id
 *         in: path
 *         required: true
 *         description: post id
 *         type: string
 *       - name: draft_id
 *         in: path
 *         required: true
 *         description: draft id
 *         type: string
 *     responses:
 *       200:
 *         description: Returns publish draft.
 *         content:
 *           application/json:
 *             schema:
 *                type: object
 *                $ref: "#/components/schemas/Draft"
 */

export default router;
