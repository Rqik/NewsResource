import express from 'express';

import { UsersController } from '../controllers/index';
import { adminMiddleware } from '../middleware/index';

const router = express.Router();

const path = '/users';
const currentAuthUser = '/user';

router.get(currentAuthUser, UsersController.getCurrentAuth);
router.get(path, adminMiddleware, UsersController.getAll);
router.get(`${path}/:login`, adminMiddleware, UsersController.getOne);
router.post(path, UsersController.create);
router.put(`${path}/:id`, adminMiddleware, UsersController.update);
router.patch(`${path}/:login`, adminMiddleware, UsersController.partialUpdate);
router.delete(`${path}/:id`, adminMiddleware, UsersController.delete);

/**
 * @openapi
 * /users:
 *   get:
 *     tags:
 *       - Users
 *       - Admin Methods
 *     description: Returns a list of users. Only for admin
 *     responses:
 *       200:
 *         description: The list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/User"
 *   post:
 *     tags:
 *       - Users
 *     description: Method for create user.
 *     responses:
 *       200:
 *         description: Returns a list of plants by common name.
 *     parameters:
 *      - in: path
 *        name: name
 * /users/{id}:
 *   put:
 *     tags:
 *       - Users
 *       - Admin Methods
 *     description: Method for update user. Only for admin
 *     responses:
 *       200:
 *         description: Returns a list of plants by common name.
 *     parameters:
 *      - in: path
 *        name: name
 *   delete:
 *     tags:
 *       - Users
 *       - Admin Methods
 *     description: Method for remove user. Only for admin.
 *     responses:
 *       200:
 *         description: Returns a list of plants by common name.
 *     parameters:
 *      - in: path
 *        name: name
 * /users/{user_login}:
 *   get:
 *     tags:
 *       - Users
 *       - Admin Methods
 *     description: Return user. Only for admin
 *     responses:
 *       200:
 *         description: Returns a list of plants by common name.
 *     parameters:
 *      - in: path
 *        name: name
 *   patch:
 *     tags:
 *       - Users
 *       - Admin Methods
 *     description: Partial update user fields. Only for admin
 *     responses:
 *       200:
 *         description: Returns a list of plants by common name.
 *     parameters:
 *      - in: path
 *        name: name
 */

export default router;
