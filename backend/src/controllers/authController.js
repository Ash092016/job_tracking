import bcrypt from "bcryptjs";
import jwt    from "jsonwebtoken";
import User   from "../models/User.js";

const COOKIE_NAME    = "token";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; 

const attachAuthCookie = (res, userId) => {
  const token = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN ?? "7d" }
  );

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:   COOKIE_MAX_AGE,
  });

  return token;
};

const sanitizeUser = (user) => ({
  _id:       user._id,
  email:     user.email,
  createdAt: user.createdAt,
});

export const register = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required.",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email address.",
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters.",
    });
  }

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with that email already exists.",
      });
    }
    const salt         = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      email:        email.toLowerCase().trim(),
      passwordHash: passwordHash,
    });

    attachAuthCookie(res, newUser._id.toString());

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      data: {
        user: sanitizeUser(newUser),
      },
    });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with that email already exists.",
      });
    }

    console.error("[register] Unexpected error:", err);
    return res.status(500).json({
      success: false,
      message: "Registration failed due to a server error. Please try again.",
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required.",
    });
  }

  try {
    const user = await User
      .findOne({ email: email.toLowerCase().trim() })
      .select("+passwordHash");
    const DUMMY_HASH    = "$2b$12$invalidhashpaddingtomatchbcryptlength000000000000000000";
    const hashToCompare = user ? user.passwordHash : DUMMY_HASH;
    const isPasswordValid = await bcrypt.compare(password, hashToCompare);

    if (!user || !isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    attachAuthCookie(res, user._id.toString());

    return res.status(200).json({
      success: true,
      message: "Logged in successfully.",
      data: {
        user: sanitizeUser(user),
      },
    });

  } catch (err) {
    console.error("[login] Unexpected error:", err);
    return res.status(500).json({
      success: false,
      message: "Login failed due to a server error. Please try again.",
    });
  }
};

export const logout = (_req, res) => {
  res.cookie(COOKIE_NAME, "", {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires:  new Date(0), 
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
};

export const getMe = async (req, res) => {
  try {
    const user = await User
      .findById(req.user._id)
      .select("-passwordHash");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: { user },
    });

  } catch (err) {
    console.error("[getMe] Unexpected error:", err);
    return res.status(500).json({
      success: false,
      message: "Could not retrieve user data.",
    });
  }
};
