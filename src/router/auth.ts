import express from 'express';

import { AuthController } from '../controllers';

const router = express.Router();

router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/activate/:link', AuthController.activate);
router.get('/refresh', AuthController.refresh);

export default router;
