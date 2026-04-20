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


const app = express();
app.use(cors({
    origin : "http://localhost:5173"

}))
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

app.get('/',(req,res)=>{
    res.end("Hello")
})

app.use(express.json());
app.use(express.urlencoded({extended : true}))

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

app.listen(Port , ()=>{
    console.log(`Server is running on port ${Port}`)
})