// ─────────────────────────────────────────────────────────────────────────────
// aiController.js
// Handles:
//   POST /api/v1/ai/chat    → streaming SSE chat
//   GET  /api/v1/ai/summary → get (or generate) cached monthly summary
// ─────────────────────────────────────────────────────────────────────────────

import FinancialContext from "../models/FinancialContext.js";
import { updateFinancialContext } from "../services/financialContextBuilder.js";
import { buildFinancialPrompt } from "../services/financialPromptService.js";
import { streamChat } from "../services/aiService.js";
import { getOrCreateSummary } from "../services/summaryService.js";

// ── POST /api/v1/ai/chat ─────────────────────────────────────────────────────
/**
 * Body: { messages: [{ role: "user"|"assistant", content: string }] }
 * Streams tokens back as SSE: `data: {"delta": "..."}\n\n`
 * Ends with:                  `data: {"done": true}\n\n`
 */
export const chatHandler = async (req, res) => {
    const userId = req.user.id;
    const { messages = [] } = req.body;

    if (!messages.length) {
        return res.status(400).json({ error: "messages array is required." });
    }

    // Fetch or build financial context
    let ctx = await FinancialContext.findOne({ userId });
    if (!ctx || ctx.needsRecalculation) {
        ctx = await updateFinancialContext(userId);
    }

    // Extract the latest user question for context injection
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    const { systemPrompt } = buildFinancialPrompt(ctx.toObject(), {
        userQuestion: lastUserMsg?.content,
    });

    // Stream response via SSE
    await streamChat({ systemPrompt, messages, res });
};

// ── GET /api/v1/ai/summary ───────────────────────────────────────────────────
/**
 * Returns the user's cached monthly financial summary.
 * Generates a fresh one via Groq if the cache is stale.
 */
export const summaryHandler = async (req, res) => {
    const userId = req.user.id;

    try {
        const { summary, fromCache } = await getOrCreateSummary(userId);
        return res.status(200).json({
            success: true,
            fromCache,
            summary,
        });
    } catch (error) {
        console.error("[aiController] summaryHandler error:", error);
        return res.status(500).json({ error: "Failed to generate financial summary." });
    }
};
