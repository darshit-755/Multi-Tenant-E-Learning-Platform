import express from "express";
import {config} from "dotenv";
import { dbConnect } from "./configs/dbConnect.js";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import adminRoutes from "./routes/admin.routes.js";
import authRoutes from "./routes/auth.routes.js";
import tenantRoutes from "./routes/tenant.routes.js";
import tutorRoutes from "./routes/tutor.routes.js";
import studentRoutes from "./routes/student.routes.js"
import classRoutes from "./routes/class.routes.js"
import meetRoutes from "./routes/meet.routes.js"
import attendanceRoutes from "./routes/attendance.routes.js"
import classDoubtRoutes from "./routes/classDoubt.routes.js"
import classNoteRoutes from "./routes/classNote.routes.js"

config();
dbConnect();
import "./services/reminderJob.js"
import "./services/classCompletionJob.js"

const isProduction = process.env.NODE_ENV === "production";

const app = express();

// --- CORS Configuration ---
const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map(o => o.trim())
    : ["http://localhost:5173"];

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Backward compatibility for legacy image paths stored as /uploads/<filename>
app.get("/uploads/:filename", (req, res, next) => {
    const { filename } = req.params;
    const uploadsRoot = path.join(__dirname, "uploads");

    const directPath = path.join(uploadsRoot, filename);
    if (fs.existsSync(directPath)) {
        return res.sendFile(directPath);
    }

    const knownFolders = ["superadmin", "tenant", "tutor", "student", "notes", "lectures", "doubt"];
    for (const folder of knownFolders) {
        const candidatePath = path.join(uploadsRoot, folder, filename);
        if (fs.existsSync(candidatePath)) {
            return res.sendFile(candidatePath);
        }
    }

    return next();
});


const Port = process.env.PORT || 4000

app.use(express.json());
app.use(express.urlencoded({extended : true}))

// --- API Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/tenant", tenantRoutes);
app.use("/api/tutor", tutorRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/class", classRoutes);
app.use("/api/meet", meetRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/class-doubts", classDoubtRoutes);
app.use("/api/class-notes", classNoteRoutes);

// --- Serve Frontend in Production ---
if (isProduction) {
    const clientDistPath = path.join(__dirname, "..", "dist");
    app.use(express.static(clientDistPath));

    // All non-API, non-upload routes serve the React SPA
    app.get("*", (req, res) => {
        res.sendFile(path.join(clientDistPath, "index.html"));
    });
} else {
    app.get("/", (req, res) => {
        res.json({ message: "API is running", environment: "development" });
    });
}

app.listen(Port , ()=>{
    console.log(`Server is running in ${isProduction ? "production" : "development"} mode on port ${Port}`)
})