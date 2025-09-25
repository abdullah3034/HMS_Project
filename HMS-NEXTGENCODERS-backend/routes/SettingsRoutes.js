import express from "express";
import multer from "multer";
import path from "path";
import { getSettings, updateSettings } from "../controllers/SettingsController.js";

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, "site-logo" + ext); // Save as site-logo.png, etc.
  },
});
const upload = multer({ storage });

// GET and PUT endpoints
router.get("/", getSettings);
router.put("/", upload.single("logo"), updateSettings);

export default router;