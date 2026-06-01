import { Router } from "express";

import { protect }          from "../middleware/auth.js";
import {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  analyseJob,
}                           from "../controllers/jobController.js";

const router = Router();

router.use(protect);

router.route("/")
  .get(getAllJobs)    
  .post(createJob);   

router.post("/:id/analyse", analyseJob);

router.route("/:id")
  .get(getJobById)    
  .put(updateJob)     
  .delete(deleteJob); 

export default router;
