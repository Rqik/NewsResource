import express from 'express';

import { AuthController } from '../controllers';
import { errorHandler } from '../middleware';

const router = express.Router();

router.post('/login', errorHandler(AuthController.login));
router.get('/logout', errorHandler(AuthController.logout));
router.get('/activate/:link', errorHandler(AuthController.activate));
router.get('/refresh', errorHandler(AuthController.refresh));

/**
 * @openapi
 * /login:
 *   post:
 *     tags:
 *       - Auth
 *     description: For authorization
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               login:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 * /logout:
 *   security: []
 *   post:
 *     tags:
 *       - Auth
 *     description: For logout
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 * /activate/{activate_link}:
 *   security: []
 *   get:
 *     tags:
 *      - Auth
 *     description: Verify user email
 * /refresh:
 *   security: []
 *   get:
 *     tags:
 *       - Auth
 *     description: Refresh refreshToken
 */

export default router;
