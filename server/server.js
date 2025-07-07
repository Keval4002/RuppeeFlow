import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import incomeRoutes from './routes/incomeRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cors({
    origin: [
        "http://localhost:5173","https://ruppeeflow-1.onrender.com","https://ruppeeflow.netlify.app/"
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-type', 'Authorization']
}));



app.use(express.static(path.join(__dirname, '../client/expense-tracker/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/expense-tracker/dist', 'index.html'));
});


// Serve static files (like uploaded images)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Basic root route for visibility
app.get("/", (req, res) => {
    res.status(200).json({
        status: "🟢 Backend is live",
        version: "1.0.0",
        timestamp: new Date(),
        uptime: process.uptime(),
        routes: {
            auth: "/api/v1/auth",
            income: "/api/v1/income",
            expense: "/api/v1/expense",
            dashboard: "/api/v1/dashboard"
        }
    });
});

// API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/income", incomeRoutes);
app.use("/api/v1/expense", expenseRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);



// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
