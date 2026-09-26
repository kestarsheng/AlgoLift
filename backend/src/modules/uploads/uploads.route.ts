// 图片上传路由：POST /api/uploads/image，需鉴权。
import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { upload, uploadImage } from './uploads.controller';

export const uploadsRouter = Router();

const handleUpload = (req: Request, res: Response, next: NextFunction): void => {
  upload.single('image')(req, res, (err: unknown) => {
    if (!err) return next();
    const code = (err as { code?: string }).code;
    if (code === 'LIMIT_FILE_SIZE') { res.status(400).json({ code: 'FILE_TOO_LARGE', message: 'File exceeds 10MB limit' }); return; }
    if ((err as Error).message === 'UNSUPPORTED_FILE_TYPE') { res.status(400).json({ code: 'UNSUPPORTED_FILE_TYPE', message: 'Only JPEG, PNG, GIF, WebP are allowed' }); return; }
    res.status(400).json({ code: 'UPLOAD_ERROR', message: (err as Error).message });
  });
};

/**
 * @swagger
 * /uploads/image:
 *   post:
 *     summary: Upload an image
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: image
 *         type: file
 *         required: true
 *     responses:
 *       201:
 *         description: Image uploaded
 *       400:
 *         description: No file or unsupported type
 *       401:
 *         description: Authentication required
 */
uploadsRouter.post('/uploads/image', requireAuth, handleUpload, uploadImage);