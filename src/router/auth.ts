import express from 'express';

import { AuthController } from '../controllers';

const router = express.Router();

router.post('/registration', AuthController.registration);
router.post('/login', AuthController.login);

export default router;
