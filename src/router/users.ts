import express from 'express';
import { UsersController } from '../controllers';

const router = express.Router();

const path = '/users';

router.get(path, UsersController.getAll);
router.get(`${path}/:login`, UsersController.getOne);
router.post(path, UsersController.create);
router.put(`${path}/:login`, UsersController.update);
router.patch(`${path}/:login`, UsersController.partialUpdate);
router.delete(`${path}/:id`, UsersController.delete);

export default router;
