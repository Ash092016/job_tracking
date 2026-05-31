import mongoose from "mongoose";
import "dotenv/config";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌  MONGODB_URI is not set in .env — aborting.");
  process.exit(1);
}

mongoose.connection.on("connected", () => {
  console.log(`✅  MongoDB connected → ${sanitizeUri(MONGODB_URI)}`);
});

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️   MongoDB disconnected.");
});

mongoose.connection.on("error", (err) => {
  console.error("❌  MongoDB connection error:", err.message);
});

process.on("SIGINT",  gracefulShutdown("SIGINT"));
process.on("SIGTERM", gracefulShutdown("SIGTERM"));

function gracefulShutdown(signal) {
  return async () => {
    console.log(`\n🔌  ${signal} received — closing MongoDB connection...`);
    await mongoose.disconnect();
    console.log("   MongoDB connection closed. Exiting.");
    process.exit(0);
  };
}

export async function connectDB() {
  await mongoose.connect(MONGODB_URI, {
    maxPoolSize:               10,    // max simultaneous connections
    serverSelectionTimeoutMS:  5000,  // fail fast if host unreachable
    socketTimeoutMS:           45000, // close idle sockets after 45 s
  });
}

function sanitizeUri(uri) {
  try {
    const url = new URL(uri);
    if (url.password) url.password = "***";
    if (url.username) url.username = "***";
    return url.toString();
  } catch {
    return "<invalid URI>";
  }
}
