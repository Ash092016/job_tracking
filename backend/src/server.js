import "dotenv/config";
import express      from "express";
import helmet       from "helmet";
import cors         from "cors";
import cookieParser from "cookie-parser";
import morgan       from "morgan";

import { connectDB }  from "./config/db.js";
import authRoutes     from "./routes/authRoutes.js";
import jobRoutes      from "./routes/jobRoutes.js";

const app  = express();
const PORT = process.env.PORT ?? 4000;

app.use(helmet());

app.use(cors({
  origin:      process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  credentials: true,
  methods:     ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); 

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.get("/health", (_req, res) => {
  res.status(200).json({
    status:    "ok",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);  

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode ?? 500;
  const isDev      = process.env.NODE_ENV !== "production";

  console.error(`[${req.method} ${req.originalUrl}] ${err.message}`);

  res.status(statusCode).json({
    success: false,
    message: err.message ?? "An unexpected server error occurred.",
    ...(isDev && { stack: err.stack }),
  });
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`\n🚀  Server running  →  http://localhost:${PORT}`);
      console.log(`   Environment      :  ${process.env.NODE_ENV ?? "development"}`);
      console.log(`   Client origin    :  ${process.env.CLIENT_ORIGIN ?? "http://localhost:5173"}\n`);
    });
  } catch (err) {
    console.error("❌  Failed to start server:", err.message);
    process.exit(1);
  }
};

startServer();

export default app;
