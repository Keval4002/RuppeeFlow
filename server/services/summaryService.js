// ─────────────────────────────────────────────────────────────────────────────
// summaryService.js
// Generates and caches a natural-language financial summary for each user.
//
// Caching strategy (dual-trigger):
//   1. Context recalculation trigger  → needsRecalculation flag was just cleared
//      (called from financialContextBuilder after a fresh build)
//   2. Staleness trigger (max age)    → Summary is older than SUMMARY_TTL_HOURS
//      (enforced on every getOrCreateSummary call)
// ─────────────────────────────────────────────────────────────────────────────

import FinancialContext from "../models/FinancialContext.js";
import { buildFinancialPrompt } from "./financialPromptService.js";
import { generateCompletion } from "./aiService.js";

// How many hours a summary can sit before being treated as stale
const SUMMARY_TTL_HOURS = 6;

const SUMMARY_PROMPT_USER_MSG =
    "Generate a concise, highly personalised financial health summary covering both THIS MONTH'S velocity and THIS YEAR'S trajectory. " +
    "Analyze any behavioural habits, MoM spending changes, or specific categories of concern based on the provided data. " +
    "Keep it under 150 words. Avoid generic advice; use the user's actual numbers and health score. Use ₹ for currency.";

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns true if the cached summary is still fresh.
 * @param {Date|null} lastGeneratedAt
 */
const isSummaryFresh = (lastGeneratedAt) => {
    if (!lastGeneratedAt) return false;
    const ageMs = Date.now() - new Date(lastGeneratedAt).getTime();
    const ageLimitMs = SUMMARY_TTL_HOURS * 60 * 60 * 1000;
    return ageMs < ageLimitMs;
};

/**
 * Calls the AI and writes the result into the FinancialContext document.
 * @param {Object} ctxDoc - Mongoose FinancialContext document
 * @returns {string} The generated summary text
 */
const regenerateSummary = async (ctxDoc) => {
    const { systemPrompt } = buildFinancialPrompt(ctxDoc.toObject());

    const summary = await generateCompletion({
        systemPrompt,
        userMessage: SUMMARY_PROMPT_USER_MSG,
    });

    // Persist summary and timestamp back into the context doc
    ctxDoc.aiSummary = summary;
    ctxDoc.summaryGeneratedAt = new Date();
    await ctxDoc.save();

    console.log(`[summaryService] Summary regenerated for user ${ctxDoc.userId}`);
    return summary;
};

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the user's financial summary, generating/refreshing it as needed.
 *
 * Call order:
 *   1. If summary exists AND is fresh AND context hasn't been recalculated → return cache
 *   2. Otherwise → call AI, store, return fresh summary
 *
 * @param {string} userId - The user's MongoDB ObjectId string
 * @returns {Promise<{ summary: string, fromCache: boolean }>}
 */
export const getOrCreateSummary = async (userId) => {
    const ctx = await FinancialContext.findOne({ userId });

    if (!ctx) {
        return {
            summary: "No financial data found. Add some expenses or income to get your summary.",
            fromCache: false,
        };
    }

    // Cache hit: summary is fresh and no new data was added since last build
    const fresh = isSummaryFresh(ctx.summaryGeneratedAt);
    const noNewData = !ctx.summaryNeedsRefresh;

    if (ctx.aiSummary && fresh && noNewData) {
        return { summary: ctx.aiSummary, fromCache: true };
    }

    // Cache miss or stale → regenerate
    const summary = await regenerateSummary(ctx);

    // Clear the refresh flag after successful generation
    await FinancialContext.updateOne({ userId }, { $set: { summaryNeedsRefresh: false } });

    return { summary, fromCache: false };
};

/**
 * Marks a user's summary as needing a refresh (called after financial context rebuild).
 * The summary itself is NOT regenerated here — it's lazy (on next request).
 * @param {string} userId
 */
export const markSummaryStale = async (userId) => {
    await FinancialContext.updateOne(
        { userId },
        { $set: { summaryNeedsRefresh: true } }
    );
};

/**
 * Force-regenerate the summary immediately (used by the cron scheduler).
 * @param {string} userId
 * @returns {Promise<string>} The new summary text
 */
export const forceRegenerateSummary = async (userId) => {
    const ctx = await FinancialContext.findOne({ userId });
    if (!ctx) return null;
    return regenerateSummary(ctx);
};
