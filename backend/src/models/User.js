import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    email: {
      type:      String,
      required:  [true, "Email is required."],
      unique:    true,    
      lowercase: true,    
      trim:      true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address.",
      ],
    },

    passwordHash: {
      type:     String,
      required: [true, "Password hash is required."],
      select:   false,
    },
  },
  {
    timestamps: true,

    toJSON: {
      versionKey: false,
      transform(_doc, ret) {
        delete ret.passwordHash;
        return ret;
      },
    },
  }
);


userSchema.index({ email: 1 });

const User = model("User", userSchema);

export default User;
