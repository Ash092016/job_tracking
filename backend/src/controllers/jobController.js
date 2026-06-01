import JobApplication       from "../models/JobApplication.js";
import Profile               from "../models/Profile.js";
import { runAiAnalysis,
         ServiceError }      from "../services/aiService.js";


const dollarsToCents = (dollars) =>
  dollars != null ? Math.round(Number(dollars) * 100) : null;

const centsToDollars = (cents) =>
  cents != null ? Math.round(cents / 100) : null;

const formatApplication = (doc) => {
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  if (obj.salaryExpectation != null) {
    obj.salaryExpectation = centsToDollars(obj.salaryExpectation);
  }
  return obj;
};

export const getAllJobs = async (req, res) => {
  try {
    const query = { userId: req.user._id };

    if (req.query.status) {
      const VALID_STATUSES = ["WISHLIST", "APPLIED", "INTERVIEWING", "OFFERED", "REJECTED"];
      if (!VALID_STATUSES.includes(req.query.status.toUpperCase())) {
        return res.status(400).json({
          success: false,
          message: `Invalid status filter. Must be one of: ${VALID_STATUSES.join(", ")}`,
        });
      }
      query.status = req.query.status.toUpperCase();
    }

    const applications = await JobApplication
      .find(query)
      .sort({ createdAt: -1 })           
      .select("-rawJobDescription");      

    const formatted = applications.map(formatApplication);

    return res.status(200).json({
      success: true,
      count:   formatted.length,
      data:    { applications: formatted },
    });
  } catch (err) {
    console.error("[getAllJobs]", err);
    return res.status(500).json({ success: false, message: "Failed to retrieve applications." });
  }
};

export const getJobById = async (req, res) => {
  try {
    const application = await JobApplication.findOne({
      _id:    req.params.id,
      userId: req.user._id,         
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data:    { application: formatApplication(application) },
    });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid application ID format." });
    }
    console.error("[getJobById]", err);
    return res.status(500).json({ success: false, message: "Failed to retrieve application." });
  }
};

export const createJob = async (req, res) => {
  try {
    const {
      companyName,
      jobTitle,
      jobUrl,
      rawJobDescription,
      status,
      salaryExpectation,   
      appliedDate,
      notes,
    } = req.body;

    if (!companyName?.trim() || !jobTitle?.trim()) {
      return res.status(400).json({
        success: false,
        message: "companyName and jobTitle are required.",
      });
    }

    const newApplication = await JobApplication.create({
      userId:            req.user._id,
      companyName:       companyName.trim(),
      jobTitle:          jobTitle.trim(),
      jobUrl:            jobUrl?.trim() ?? null,
      rawJobDescription: rawJobDescription?.trim() ?? null,
      status:            status?.toUpperCase() ?? "WISHLIST",
      salaryExpectation: dollarsToCents(salaryExpectation), 
      appliedDate:       appliedDate ? new Date(appliedDate) : null,
      notes:             notes?.trim() ?? null,
    });

    return res.status(201).json({
      success: true,
      message: "Application created.",
      data:    { application: formatApplication(newApplication) },
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(" ") });
    }
    console.error("[createJob]", err);
    return res.status(500).json({ success: false, message: "Failed to create application." });
  }
};

export const updateJob = async (req, res) => {
  try {
    const {
      companyName,
      jobTitle,
      jobUrl,
      rawJobDescription,
      status,
      salaryExpectation,
      appliedDate,
      notes,
    } = req.body;

    const updateFields = {};
    if (companyName       !== undefined) updateFields.companyName       = companyName.trim();
    if (jobTitle          !== undefined) updateFields.jobTitle          = jobTitle.trim();
    if (jobUrl            !== undefined) updateFields.jobUrl            = jobUrl?.trim() ?? null;
    if (rawJobDescription !== undefined) updateFields.rawJobDescription = rawJobDescription?.trim() ?? null;
    if (status            !== undefined) updateFields.status            = status.toUpperCase();
    if (salaryExpectation !== undefined) updateFields.salaryExpectation = dollarsToCents(salaryExpectation);
    if (appliedDate       !== undefined) updateFields.appliedDate       = appliedDate ? new Date(appliedDate) : null;
    if (notes             !== undefined) updateFields.notes             = notes?.trim() ?? null;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update.",
      });
    }

    const updated = await JobApplication.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id }, 
      { $set: updateFields },
      { new: true, runValidators: true }             
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Application not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Application updated.",
      data:    { application: formatApplication(updated) },
    });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid application ID format." });
    }
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(" ") });
    }
    console.error("[updateJob]", err);
    return res.status(500).json({ success: false, message: "Failed to update application." });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const deleted = await JobApplication.findOneAndDelete({
      _id:    req.params.id,
      userId: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Application not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Application deleted.",
      data:    { deletedId: deleted._id },
    });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid application ID format." });
    }
    console.error("[deleteJob]", err);
    return res.status(500).json({ success: false, message: "Failed to delete application." });
  }
};

export const analyseJob = async (req, res) => {
  try {
    const application = await JobApplication.findOne({
      _id:    req.params.id,
      userId: req.user._id,
    });

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found." });
    }

    if (!application.rawJobDescription?.trim()) {
      return res.status(400).json({
        success: false,
        message: "This application has no job description. Please add one before running analysis.",
      });
    }

    const profile = await Profile
      .findOne({ userId: req.user._id })
      .select("+resumeText");

    if (!profile?.resumeText?.trim()) {
      return res.status(400).json({
        success: false,
        message: "No resume found on your profile. Please upload a resume before running analysis.",
      });
    }

    const analysisResult = await runAiAnalysis(
      profile.resumeText,
      application.rawJobDescription
    );

    const updated = await JobApplication.findByIdAndUpdate(
      application._id,
      { $set: { aiAnalysis: analysisResult } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "AI analysis complete.",
      data:    { application: formatApplication(updated) },
    });

  } catch (err) {
    if (err instanceof ServiceError) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid application ID format." });
    }
    console.error("[analyseJob]", err);
    return res.status(500).json({ success: false, message: "AI analysis failed. Please try again." });
  }
};
