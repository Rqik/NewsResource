import express from 'express';
import { PostsDraftsController } from '../controllers/index';

const router = express.Router();

const postPath = '/posts';
const path = '/drafts';

router.get(`${postPath}/:id${path}`, PostsDraftsController.getAll);
router.get(`${postPath}/:id${path}/:did`, PostsDraftsController.getOne);
router.post(`${postPath}/:id${path}`, PostsDraftsController.create);
router.put(`${postPath}/:id${path}/:did`, PostsDraftsController.update);
router.delete(`${postPath}/:id${path}/:did`, PostsDraftsController.delete);

export default router;
