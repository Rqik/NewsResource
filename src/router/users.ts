import express from 'express';

import { UsersController } from '../controllers';
import { adminMiddleware } from '../middleware';

const router = express.Router();

const path = '/users';
const currentAuthUser = '/user';

router.get(currentAuthUser, UsersController.getCurrentAuth);
router.post(path, UsersController.create);
router.get(path, adminMiddleware, UsersController.getAll);
router.put(`${path}/:id`, adminMiddleware, UsersController.update);
router.get(`${path}/:login`, adminMiddleware, UsersController.getOne);
router.patch(`${path}/:login`, adminMiddleware, UsersController.partialUpdate);
router.delete(`${path}/:id`, adminMiddleware, UsersController.delete);

export default router;
