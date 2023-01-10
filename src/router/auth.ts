import express from 'express';

import { AuthController } from '../controllers';

const router = express.Router();

router.post('/registration', AuthController.registration);
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.post('/activate/:link', AuthController.activate);
router.post('/refresh', AuthController.refresh);

export default router;
