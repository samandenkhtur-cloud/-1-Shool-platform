const multer = require('multer');
const path   = require('path');
const fs     = require('fs');
require('dotenv').config();

const MAX_MB   = parseInt(process.env.MAX_FILE_SIZE_MB || '100');
const UPLOAD   = process.env.UPLOAD_DIR || 'uploads';

const ensureDir = (dir) => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); };

// ── Storage factory ────────────────────────────────────────────
const makeStorage = (subdir) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(UPLOAD, subdir);
      ensureDir(dir);
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext  = path.extname(file.originalname).toLowerCase();
      const name = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
      cb(null, name);
    },
  });

// ── Filter factories ───────────────────────────────────────────
const imageFilter = (req, file, cb) => {
  const allowed = (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp,image/gif').split(',');
  allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Invalid image type'), false);
};

const videoFilter = (req, file, cb) => {
  const allowed = (process.env.ALLOWED_VIDEO_TYPES || 'video/mp4,video/webm,video/ogg').split(',');
  allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Invalid video type'), false);
};

const fileFilter = (req, file, cb) => {
  const allowed = ['application/pdf','application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain'];
  allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Invalid file type'), false);
};

// ── Exported upload instances ──────────────────────────────────
const uploadAvatar  = multer({ storage: makeStorage('avatars'),   fileFilter: imageFilter, limits: { fileSize: 5  * 1024 * 1024 } });
const uploadThumbnail = multer({ storage: makeStorage('thumbnails'), fileFilter: imageFilter, limits: { fileSize: 10 * 1024 * 1024 } });
const uploadVideo   = multer({ storage: makeStorage('videos'),    fileFilter: videoFilter, limits: { fileSize: MAX_MB * 1024 * 1024 } });
const uploadMaterial = multer({ storage: makeStorage('materials'), fileFilter: fileFilter,  limits: { fileSize: 50 * 1024 * 1024 } });

// ── URL helper ─────────────────────────────────────────────────
const fileUrl = (req, subdir, filename) =>
  `${req.protocol}://${req.get('host')}/${UPLOAD}/${subdir}/${filename}`;

module.exports = { uploadAvatar, uploadThumbnail, uploadVideo, uploadMaterial, fileUrl };
