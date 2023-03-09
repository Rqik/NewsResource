import express from 'express';

import { PostsDraftsController } from '../controllers/index';
import { authMiddleware } from '../middleware/index';

const router = express.Router();

const postPath = '/posts';
const draftsPath = '/drafts';

router.get(
  `${postPath}/:id${draftsPath}`,
  authMiddleware,
  PostsDraftsController.getAll,
);

router.get(
  `${postPath}/:id${draftsPath}/:did`,
  authMiddleware,
  PostsDraftsController.getOne,
);

router.get(
  `${postPath}/:id${draftsPath}/:did/publish`,
  authMiddleware,
  PostsDraftsController.publish,
);

router.post(
  `${postPath}/:id${draftsPath}`,
  authMiddleware,
  PostsDraftsController.create,
);

router.put(
  `${postPath}/:id${draftsPath}/:did`,
  authMiddleware,
  PostsDraftsController.update,
);

router.delete(
  `${postPath}/:id${draftsPath}/:did`,
  authMiddleware,
  PostsDraftsController.delete,
);

export default router;
