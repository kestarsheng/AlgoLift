// 定义用户注册、登录和当前用户查询路由及 Swagger 文档。
import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { currentUser, loginUser, registerUser } from './auth.controller';

export const authRouter = Router();

/** @swagger
 * /auth/register:
 *   post:
 *     summary: Register a user
 *     requestBody:
 *       required: true
 *       content: { application/json: { schema: { $ref: '#/components/schemas/RegisterRequest' } } }
 *     responses: { 201: { description: Registered }, 400: { description: Invalid payload }, 409: { description: Email exists } }
 */
authRouter.post('/auth/register', registerUser);

/** @swagger
 * /auth/login:
 *   post:
 *     summary: Login and receive a JWT
 *     requestBody:
 *       required: true
 *       content: { application/json: { schema: { $ref: '#/components/schemas/LoginRequest' } } }
 *     responses: { 200: { description: Logged in }, 401: { description: Invalid credentials } }
 */
authRouter.post('/auth/login', loginUser);

/** @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: Current user }, 401: { description: Unauthorized } }
 */
authRouter.get('/auth/me', requireAuth, currentUser);
