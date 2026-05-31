import mongoose from "mongoose";

const { Schema, model } = mongoose;

const qualificationSchema = new Schema(
  {
    type: {
      type:     String,
      required: [true, "Qualification type is required."],
      enum: {
        values:  ["EDUCATION", "CERTIFICATION"],
        message: "Type must be EDUCATION or CERTIFICATION.",
      },
    },

    institution: {
      type:     String,
      required: [true, "Institution name is required."],
      trim:     true,
    },

    major: {
      type: String,
      trim: true,
    },

    startDate: { type: Date },
    endDate:   { type: Date }, 

    gpa: {
      type: Number,
      min:  [0,   "GPA cannot be negative."],
      validate: {
        validator: function(value){
            return !this.gpaMax || value <= this.gpaMax;
        },
        message: "GPA cannot exceed the maximum scale value",
      },
    },
    gpaMax: {
      type: Number,
      min: [1,"Maximum GPA scale must be atleast 1"],
      default: 4.0,
    },
  },
  { _id: true } 
);


const experienceSchema = new Schema(
  {
    company: {
      type:     String,
      required: [true, "Company name is required."],
      trim:     true,
    },

    role: {
      type:     String,
      required: [true, "Job role/title is required."],
      trim:     true,
    },

    startDate: { type: Date },
    endDate:   { type: Date }, 

    description: {
      type: String,
      trim: true,
    },

    skillsUsed: {
      type:    [String],
      default: [],
    },
  },
  { _id: true }
);


const profileSchema = new Schema(
  {
    userId: {
      type:     Schema.Types.ObjectId,
      ref:      "User",
      required: [true, "userId is required."],
      unique:   true,   
    },

    firstName: {
      type:     String,
      required: [true, "First name is required."],
      trim:     true,
    },

    lastName: {
      type:     String,
      required: [true, "Last name is required."],
      trim:     true,
    },

    phone: {
      type: String,
      trim: true,
    },

    portfolioUrl: {
      type: String,
      trim: true,
    },

    githubUrl: {
      type: String,
      trim: true,
    },

    linkedinUrl: {
      type: String,
      trim: true,
    },

    resumeText: {
      type:   String,
      select: false, 
    },

    qualifications: {
      type:    [qualificationSchema],
      default: [],
    },

    experiences: {
      type:    [experienceSchema],
      default: [],
    },
  },
  {
    timestamps:  true,
    toJSON:      { versionKey: false },
  }
);

profileSchema.index({ userId: 1 });

const Profile = model("Profile", profileSchema);

export default Profile;
