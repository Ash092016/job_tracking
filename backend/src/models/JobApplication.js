import mongoose from "mongoose";

const { Schema, model } = mongoose;

const aiAnalysisSchema = new Schema(
  {
    matchScore: {
      type:     Number,
      min:      [0,   "Match score cannot be below 0."],
      max:      [100, "Match score cannot exceed 100."],
      required: [true, "matchScore is required."],
    },

    missingKeywords: {
      type:    [String],
      default: [],
    },

    dos: {
      type:    [String],
      default: [],
    },

    donts: {
      type:    [String],
      default: [],
    },

    tailoringSuggestions: {
      type: String,
    },

    analyzedAt: {
      type:    Date,
      default: Date.now,
    },
  },
  {
    _id:        false,
    versionKey: false,
  }
);


const jobApplicationSchema = new Schema(
  {
    userId: {
      type:     Schema.Types.ObjectId,
      ref:      "User",
      required: [true, "userId is required."],
    },

    companyName: {
      type:     String,
      required: [true, "Company name is required."],
      trim:     true,
    },

    jobTitle: {
      type:     String,
      required: [true, "Job title is required."],
      trim:     true,
    },

    jobUrl: {
      type: String,
      trim: true,
    },

    rawJobDescription: {
      type: String,
    },

    status: {
      type:    String,
      enum: {
        values: ["WISHLIST", "APPLIED", "INTERVIEWING", "OFFERED", "REJECTED"],
        message: "'{VALUE}' is not a valid application status.",
      },
      default: "WISHLIST",
    },

    salaryExpectation: {
      type: Number,
      min:  [0, "Salary expectation cannot be negative."],
    },

    appliedDate: {
      type: Date,
    },

    notes: {
      type: String,
      trim: true,
    },

    aiAnalysis: {
      type:    aiAnalysisSchema,
      default: null,
    },
  },
  {
    timestamps:  true,
    toJSON:      { versionKey: false },
  }
);

jobApplicationSchema.index({ userId: 1, status: 1 });

jobApplicationSchema.index({ status: 1 });

jobApplicationSchema.index({ createdAt: -1 });

const JobApplication = model("JobApplication", jobApplicationSchema);

export default JobApplication;
