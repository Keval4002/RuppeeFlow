import express from "express";
import { chatHandler, summaryHandler, contextHandler } from "../controllers/aiController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All AI routes require authentication
router.use(protect);

// POST /api/v1/ai/chat    → streaming SSE chat
router.post("/chat", chatHandler);

// GET  /api/v1/ai/summary → cached financial summary
router.get("/summary", summaryHandler);

// GET  /api/v1/ai/context → raw financial context for UI widgets
router.get("/context", contextHandler);

export default router;
