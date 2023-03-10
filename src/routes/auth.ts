import express from 'express';

import { AuthController } from '../controllers/index';

const router = express.Router();

router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/activate/:link', AuthController.activate);
router.get('/refresh', AuthController.refresh);

/**
 * @openapi
 * /login:
 *   post:
 *     tags:
 *       - Auth
 *     description: For authorization
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 * /logout:
 *   post:
 *     tags:
 *       - Auth
 *     description: For logout
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 * /activate/{activate_link}:
 *    get:
 *      tags:
 *       - Auth
 *      description: Verify user email
 * /refresh:
 *   get:
 *     tags:
 *       - Auth
 *     description: Refresh refreshToken
 */

export default router;
