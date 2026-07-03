import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// Replicate __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define storage location and filename
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Save uploaded images to "backend/uploads/plants/"
    const uploadPath = path.join(__dirname, '../uploads/plants');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Create unique filename: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter: only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp).'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB limit
});

export default upload;