import express from 'express';

import { PostsDraftsController } from '../controllers/index';
import { authMiddleware } from '../middleware/index';

const router = express.Router();

const postPath = '/posts';
const draftsPath = '/drafts';

const drafts = `${postPath}/:id${draftsPath}`;
const draft = `${postPath}/:id${draftsPath}/:did`;

router.get(drafts, authMiddleware, PostsDraftsController.getAll);
router.get(draft, authMiddleware, PostsDraftsController.getOne);
router.get(`${draft}/publish`, authMiddleware, PostsDraftsController.publish);
router.post(drafts, authMiddleware, PostsDraftsController.create);
router.put(draft, authMiddleware, PostsDraftsController.update);
router.delete(draft, authMiddleware, PostsDraftsController.delete);

/**
 * @openapi
 * /posts/{post_id}/drafts:
 *   get:
 *     tags:
 *       - Posts
 *       - Drafts
 *       - Authorized
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
 *     description: Method for create post. Only for authorized
 *     parameters:
 *       - name: post_id
 *         in: path
 *         required: true
 *         description: post id
 *         type: string
 *     responses:
 *       200:
 *         description: Return created draft.
 *         content:
 *           application/json:
 *             schema:
 *                type: object
 *                $ref: "#/components/schemas/Draft"
 * /posts/{post_id}/drafts/{draft_id}:
 *   get:
 *     tags:
 *       - Posts
 *       - Drafts
 *       - Authorized
 *     description: Return draft. Only for authorized
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
 *     description: Method for update draft. Only for authorized
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
 *         description: Returns updated draft.
 *         content:
 *           application/json:
 *             schema:
 *                type: object
 *                $ref: "#/components/schemas/Draft"
 *   delete:
 *     tags:
 *       - Posts
 *       - Drafts
 *       - Authorized
 *     description: Method for delete draft. Only for authorized
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
