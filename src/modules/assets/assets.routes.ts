import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AssetsController } from './assets.controller';
import { validateRequest } from '../../middlewares/validation.middleware';
import { registerAssetSchema, getAssetsQuerySchema } from './assets.dto';
import { authenticateJwt } from '../../middlewares/auth.middleware';

// Ensure uploads/challans directory exists
const uploadDir = path.resolve(process.cwd(), 'uploads/challans');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const sanitizedBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${sanitizedBase}_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    const allowed = ['.pdf', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Allowed formats: PDF, JPG, PNG'));
    }
  },
});

export function createAssetsRouter(): Router {
  const router = Router();
  const controller = new AssetsController();

  // All endpoints require valid JWT authentication
  router.use(authenticateJwt);

  router.get('/', validateRequest({ query: getAssetsQuerySchema }), controller.getAssets);
  router.post('/register', validateRequest({ body: registerAssetSchema }), controller.registerAsset);
  router.post('/upload-challan', upload.single('file'), controller.uploadChallan);
  router.post('/:id/ping', controller.pingAsset);

  return router;
}
