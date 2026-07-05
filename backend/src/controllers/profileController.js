import Profile from "../models/Profile.js";

export const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found.",
      });
    }
    return res.status(200).json({
      success: true,
      data: { profile },
    });
  } catch (err) {
    console.error("[getProfile]", err);
    return res.status(500).json({ success: false, message: "Failed to retrieve profile." });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, githubUrl, linkedinUrl, portfolioUrl } = req.body;

    const updateFields = {
      firstName,
      lastName,
      phone,
      githubUrl,
      linkedinUrl,
      portfolioUrl,
    };

    // Remove undefined fields
    Object.keys(updateFields).forEach((key) => {
      if (updateFields[key] === undefined) {
        delete updateFields[key];
      }
    });

    const profile = await Profile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: updateFields },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated.",
      data: { profile },
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(" ") });
    }
    console.error("[updateProfile]", err);
    return res.status(500).json({ success: false, message: "Failed to update profile." });
  }
};

export const addQualification = async (req, res) => {
  try {
    const { type, institution, major, startDate, endDate, gpa } = req.body;

    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(400).json({
        success: false,
        message: "Profile must be created first before adding qualifications.",
      });
    }

    profile.qualifications.push({
      type,
      institution,
      major,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      gpa: gpa ? Number(gpa) : undefined,
    });

    await profile.save();

    return res.status(201).json({
      success: true,
      message: "Qualification added.",
      data: { qualifications: profile.qualifications },
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(" ") });
    }
    console.error("[addQualification]", err);
    return res.status(500).json({ success: false, message: "Failed to add qualification." });
  }
};

export const deleteQualification = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found." });
    }

    const hasQual = profile.qualifications.some((q) => q._id.toString() === req.params.id);
    if (!hasQual) {
      return res.status(404).json({ success: false, message: "Qualification not found." });
    }

    profile.qualifications.pull({ _id: req.params.id });
    await profile.save();

    return res.status(200).json({
      success: true,
      message: "Qualification deleted.",
      data: { qualifications: profile.qualifications },
    });
  } catch (err) {
    console.error("[deleteQualification]", err);
    return res.status(500).json({ success: false, message: "Failed to delete qualification." });
  }
};

export const addExperience = async (req, res) => {
  try {
    const { company, role, startDate, endDate, description, skillsUsed } = req.body;

    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(400).json({
        success: false,
        message: "Profile must be created first before adding experience.",
      });
    }

    profile.experiences.push({
      company,
      role,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      description,
      skillsUsed: Array.isArray(skillsUsed) ? skillsUsed : [],
    });

    await profile.save();

    return res.status(201).json({
      success: true,
      message: "Experience added.",
      data: { experiences: profile.experiences },
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(" ") });
    }
    console.error("[addExperience]", err);
    return res.status(500).json({ success: false, message: "Failed to add experience." });
  }
};

export const deleteExperience = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found." });
    }

    const hasExp = profile.experiences.some((e) => e._id.toString() === req.params.id);
    if (!hasExp) {
      return res.status(404).json({ success: false, message: "Experience not found." });
    }

    profile.experiences.pull({ _id: req.params.id });
    await profile.save();

    return res.status(200).json({
      success: true,
      message: "Experience deleted.",
      data: { experiences: profile.experiences },
    });
  } catch (err) {
    console.error("[deleteExperience]", err);
    return res.status(500).json({ success: false, message: "Failed to delete experience." });
  }
};
