import express from 'express';

import { UsersController } from '../controllers';
import { adminMiddleware, errorHandler } from '../middleware';

const router = express.Router();

const path = '/users';
const currentAuthUser = '/user';

router.get(currentAuthUser, errorHandler(UsersController.getCurrentAuth));
router.get(path, adminMiddleware, errorHandler(UsersController.getAll));
router.get(
  `${path}/:login`,
  adminMiddleware,
  errorHandler(UsersController.getOne),
);
router.post(path, UsersController.create);
router.put(
  `${path}/:id`,
  adminMiddleware,
  errorHandler(UsersController.update),
);
router.patch(
  `${path}/:login`,
  adminMiddleware,
  errorHandler(UsersController.partialUpdate),
);
router.delete(
  `${path}/:id`,
  adminMiddleware,
  errorHandler(UsersController.delete),
);

/**
 * @openapi
 * /users:
 *   get:
 *     tags:
 *       - Users
 *       - Admin Methods
 *     security:
 *	     - bearerAuth: []
 *     description: Returns a list of users. Only for admin
 *     responses:
 *       200:
 *         description: The list of users
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/Pagination"
 *                 - properties:
 *                     data:
 *                       $ref: "#/components/schemas/Users"
 *   post:
 *     tags:
 *       - Users
 *     description: Method for create user.
 *     responses:
 *       200:
 *         description: Returns a list of users.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/User"
 * /users/{id}:
 *   put:
 *     tags:
 *       - Users
 *       - Admin Methods
 *     security:
 *	     - bearerAuth: []
 *     description: Method for update user. Only for admin
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: user id
 *         type: string
 *     responses:
 *       200:
 *         description: Return user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: "#/components/schemas/User"
 *   delete:
 *     tags:
 *       - Users
 *       - Admin Methods
 *     security:
 *	     - bearerAuth: []
 *     description: Method for remove user. Only for admin.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: user id
 *         type: string
 *     responses:
 *       200:
 *         description: Return user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: "#/components/schemas/User"
 * /users/{user_login}:
 *   get:
 *     tags:
 *       - Users
 *       - Admin Methods
 *     security:
 *	     - bearerAuth: []
 *     description: Return user. Only for admin
 *     parameters:
 *       - name: user_login
 *         in: path
 *         required: true
 *         description: user login
 *         type: string
 *     responses:
 *       200:
 *         description: Return user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: "#/components/schemas/User"
 *   patch:
 *     tags:
 *       - Users
 *       - Admin Methods
 *     security:
 *	     - bearerAuth: []
 *     description: Partial update user fields. Only for admin
 *     parameters:
 *       - name: user_login
 *         in: path
 *         required: true
 *         description: user login
 *         type: string
 *     responses:
 *       200:
 *         description: Return user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: "#/components/schemas/User"
 */

export default router;
