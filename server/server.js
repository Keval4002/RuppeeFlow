import dotenv from "dotenv"
import express from "express"
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url"
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import incomeRoutes from './routes/incomeRoutes.js'
import expenseRoutes from './routes/expenseRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'

dotenv.config();

const app = express();

app.use(
    cors({
        origin: ["http://localhost:5000","https://ruppeeflow.onrender.com"],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders:['Content-type', 'Authorization']
    })
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

connectDB();

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/income", incomeRoutes);
app.use("/api/v1/expense", expenseRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

//Serve Uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>{console.log(`Listening on port ${PORT}`)});

 