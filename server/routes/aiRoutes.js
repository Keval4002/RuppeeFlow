import express from "express";
import { chatHandler, summaryHandler } from "../controllers/aiController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All AI routes require authentication
router.use(protect);

// POST /api/v1/ai/chat    → streaming SSE chat
router.post("/chat", chatHandler);

// GET  /api/v1/ai/summary → cached financial summary
router.get("/summary", summaryHandler);

export default router;
