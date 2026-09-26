// 图片上传控制器：使用 multer 将图片落盘到 backend/uploads，返回可访问的相对路径。
import fs from 'fs';
import path from 'path';
import multer from 'multer';

const uploadDir = path.join(process.cwd(), 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const allowedMime = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (allowedMime.includes(file.mimetype)) cb(null, true);
    else cb(new Error('UNSUPPORTED_FILE_TYPE'));
  },
});

export const uploadImage = (req: import('express').Request, res: import('express').Response): void => {
  if (!req.file) { res.status(400).json({ code: 'NO_FILE', message: 'No file uploaded' }); return; }
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
};