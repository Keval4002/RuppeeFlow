import { EventEmitter } from "events";
import mongoose from "mongoose";
import FinancialContext from "../models/FinancialContext.js";
import { updateFinancialContext } from "../services/financialContextService.js";

const eventBus = new EventEmitter();
const WORKER_INTERVAL_MS = 5000;
let workerRunning = false;

const markRecalculationNeeded = async (userId) => {
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return;
    }

    await FinancialContext.updateOne(
        { userId: new mongoose.Types.ObjectId(userId) },
        { $set: { needsRecalculation: true } },
        { upsert: true }
    );
};

eventBus.on("dataUpdated", (userId) => {
    markRecalculationNeeded(userId).catch((error) => {
        console.error("Error flagging financial context for recalculation:", error);
    });
});

const runRecalculationWorker = async () => {
    if (workerRunning) {
        return;
    }

    workerRunning = true;
    try {
        const contexts = await FinancialContext.find({ needsRecalculation: true })
            .select("userId")
            .limit(25);

        for (const context of contexts) {
            try {
                await updateFinancialContext(context.userId.toString());
            } catch (error) {
                console.error("Error updating financial context:", error);
            }
        }
    } finally {
        workerRunning = false;
    }
};

setInterval(() => {
    runRecalculationWorker().catch((error) => {
        console.error("Financial context worker failed:", error);
    });
}, WORKER_INTERVAL_MS);

export { eventBus };
