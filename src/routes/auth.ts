import express from 'express';

import { AuthController } from '../controllers/index';

const router = express.Router();

/**
 * @swagger
 * /:
 *   get:
 *     description: Welcome to swagger-jsdoc!
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 */

router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/activate/:link', AuthController.activate);
router.get('/refresh', AuthController.refresh);

export default router;
