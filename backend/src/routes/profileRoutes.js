import { Router } from "express";
import multer from "multer";

import { protect } from "../middleware/auth.js";
import {
  getProfile,
  updateProfile,
  addQualification,
  deleteQualification,
  addExperience,
  deleteExperience,
  uploadResume,
} from "../controllers/profileController.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed."));
    }
  },
});

const router = Router();

// Protect all profile endpoints
router.use(protect);

router.route("/")
  .get(getProfile)
  .put(updateProfile);

router.post("/resume", upload.single("resume"), uploadResume);

router.post("/qualifications", addQualification);
router.delete("/qualifications/:id", deleteQualification);

router.post("/experiences", addExperience);
router.delete("/experiences/:id", deleteExperience);

export default router;
