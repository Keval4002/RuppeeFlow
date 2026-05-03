// ─────────────────────────────────────────────────────────────────────────────
// summaryScheduler.js
// Runs every 6 hours to proactively refresh summaries for all users
// who have stale data (avoids cold-start latency on first dashboard load).
// ─────────────────────────────────────────────────────────────────────────────

import cron from "node-cron";
import FinancialContext from "../models/FinancialContext.js";
import { forceRegenerateSummary } from "./summaryService.js";

/**
 * Finds all users whose summary is stale or flagged for refresh
 * and regenerates them in the background.
 */
const runSummaryRefreshJob = async () => {
    const SIX_HOURS_AGO = new Date(Date.now() - 6 * 60 * 60 * 1000);

    try {
        // Find users that need a refresh:
        //   • summaryNeedsRefresh flag is true, OR
        //   • summary was never generated, OR
        //   • summary is older than 6 hours
        const staleContexts = await FinancialContext.find({
            $or: [
                { summaryNeedsRefresh: true },
                { summaryGeneratedAt: null },
                { summaryGeneratedAt: { $lt: SIX_HOURS_AGO } },
            ],
        }).select("userId").lean();

        if (staleContexts.length === 0) {
            console.log("[SummaryScheduler] ✅ All summaries are fresh. Nothing to do.");
            return;
        }

        console.log(`[SummaryScheduler] 🔄 Refreshing summaries for ${staleContexts.length} user(s)...`);

        // Process in parallel (Groq is fast; limit parallelism if needed for large user bases)
        await Promise.allSettled(
            staleContexts.map(({ userId }) =>
                forceRegenerateSummary(userId.toString()).catch((err) =>
                    console.error(`[SummaryScheduler] ❌ Failed for user ${userId}:`, err.message)
                )
            )
        );

        // Clear the stale flags for all processed users
        const userIds = staleContexts.map((c) => c.userId);
        await FinancialContext.updateMany(
            { userId: { $in: userIds } },
            { $set: { summaryNeedsRefresh: false } }
        );

        console.log(`[SummaryScheduler] ✅ Done refreshing ${staleContexts.length} summary/summaries.`);

    } catch (err) {
        console.error("[SummaryScheduler] ❌ Job failed:", err);
    }
};

/**
 * Registers the cron job. Call once at server startup.
 * Schedule: every 6 hours at :00 minutes.
 */
export const startSummaryScheduler = () => {
    // "0 */6 * * *" → at minute 0, every 6th hour
    cron.schedule("0 */6 * * *", runSummaryRefreshJob, {
        scheduled: true,
        timezone: "Asia/Kolkata",
    });

    console.log("[SummaryScheduler] 🕐 Scheduled summary refresh every 6 hours (IST).");

    // Optionally kick off an immediate run on startup to warm the cache
    // Comment this out in production if you prefer lazy generation
    setTimeout(runSummaryRefreshJob, 5000);
};
