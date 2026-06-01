import jwt  from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authenticated. Please log in.",
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    const message =
      err.name === "TokenExpiredError"
        ? "Session expired. Please log in again."
        : "Invalid token. Please log in again.";

    return res.status(401).json({ success: false, message });
  }

  let currentUser;
  try {
    currentUser = await User
      .findById(decoded.id)
      .select("-passwordHash");
  } catch (dbErr) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while authenticating. Please try again.",
    });
  }

  if (!currentUser) {
    return res.status(401).json({
      success: false,
      message: "The account belonging to this token no longer exists.",
    });
  }
  req.user = currentUser;
  next();
};
