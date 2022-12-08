import express from 'express';
import { UsersController } from '../controllers';

const router = express.Router();

const path = '/users';

// TODO: ix
router.get(path, UsersController.get);
router.get(`${path}/:id`, UsersController.getOne);

// --worked
router.post(path, UsersController.create);
//
// TODO: ix
router.put(`${path}/:id`, UsersController.update);
router.delete(`${path}/:id`, UsersController.delete);

export default router;
