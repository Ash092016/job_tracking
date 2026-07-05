# 🚀 JobTracker AI

A premium, AI-powered Job Application Tracker built with the MERN stack (MongoDB, Express, React, Node.js). This application features a pipeline overview dashboard, a Kanban application board, a details profile builder, PDF resume parsing, and Google Gemini-powered match evaluation.

---

## ✨ Features

- **🧠 Google Gemini Match Analysis**: Compares your resume against any job description to output a calibrated ATS match score, list missing keywords, outline target actions, and suggest specific bullet point rewrites.
- **📄 PDF Resume Parsing**: Upload your PDF resume file; the backend automatically extracts and parses the text to populate your profile.
- **📋 Kanban Application Board**: Visually track your job applications through various stages: *Wishlist*, *Applied*, *Interviewing*, *Offered*, and *Rejected*.
- **📊 Overview Dashboard**: Visualizes your pipeline with total job counts, average match score indicators, stage progress bars, and recent application updates.
- **📝 Profile Wizard**: A multi-tab interface to manage your contact details, portfolio links, educational qualifications, and work history.
- **🔐 Secure Authentication**: JWT session management utilizing secure HTTP-only cookies and bcryptjs password encryption.
- **🌓 Premium Aesthetics**: Modern dark theme with custom glassmorphism, responsive flex layouts, and smooth animations.

---

## 🛠️ Tech Stack

### Frontend
- **React (Vite)**: For state-of-the-art developer builds.
- **Tailwind CSS**: Modern utility styling and visual configurations.
- **Axios**: Promised-based API requests with session cookie sync.
- **Lucide React**: Clean icons for widgets and sidebar navigation.

### Backend
- **Node.js & Express**: High-performance API server.
- **MongoDB & Mongoose**: Flexible NoSQL database modeling.
- **Google GenAI SDK (`@google/genai`)**: Integrates `gemini-2.5-flash` with JSON output schemas.
- **pdf-parse & Multer**: Handles binary file uploads and extracts text from PDF resumes.
- **jsonwebtoken (JWT) & bcryptjs**: Handles auth token creation, verification, and hashing.

---

## 🚀 Local Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Ash092016/job_tracking.git
   cd job_tracking
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   # Create a .env file based on .env.example
   npm run dev
   ```

3. **Frontend Setup**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

---

## 🌐 Deployment (Vercel)

This application is designed to be deployed as two separate service instances (Backend and Frontend) on Vercel.

### 1. Backend Project Configuration
- **Root Directory**: `backend`
- **Application Preset**: `Express` (Node.js)
- **Environment Variables**:
  - `MONGODB_URI`: Your MongoDB Atlas connection string.
  - `JWT_SECRET`: A secure random secret key.
  - `GEMINI_API_KEY`: Your API key generated from Google AI Studio.
  - `NODE_ENV`: `production`
  - `CLIENT_ORIGIN`: Your live frontend URL (e.g., `https://job-tracking-p4ld.vercel.app`)

### 2. Frontend Project Configuration
- **Root Directory**: `frontend`
- **Framework Preset**: `Vite`
- **Environment Variables**:
  - `VITE_API_URL`: Your live backend URL with `/api` suffix (e.g., `https://job-tracking-mu.vercel.app/api`)

---

## 📄 License

This project is open-source and available under the [ISC License](LICENSE).
