const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads/campanas');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '-');
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

const allowedTypes = /jpeg|jpg|png|gif|webp/;

const fileFilter = (req, file, cb) => {
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
  }
};

const uploadCampaign = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter
});

module.exports = uploadCampaign;

