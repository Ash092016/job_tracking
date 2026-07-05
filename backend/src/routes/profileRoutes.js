import { Router } from "express";

import { protect } from "../middleware/auth.js";
import {
  getProfile,
  updateProfile,
  addQualification,
  deleteQualification,
  addExperience,
  deleteExperience,
} from "../controllers/profileController.js";

const router = Router();

// Protect all profile endpoints
router.use(protect);

router.route("/")
  .get(getProfile)
  .put(updateProfile);

router.post("/qualifications", addQualification);
router.delete("/qualifications/:id", deleteQualification);

router.post("/experiences", addExperience);
router.delete("/experiences/:id", deleteExperience);

export default router;
