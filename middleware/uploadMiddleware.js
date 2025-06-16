import multer from "multer";
import path from "path";

// Define storage strategy
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/"); // folder to save
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  },
});

// File filter (only image types)
const fileFilter = (req, file, cb) => {
  // Check if the file is an image
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

export default upload;
