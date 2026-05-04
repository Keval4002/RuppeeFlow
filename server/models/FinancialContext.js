import mongoose from "mongoose";

// ------------------------------------------------------------------
// Sub-schemas (Embedded Objects)
// We set _id: false because these don't need their own ObjectIds. 
// This keeps the JSON payload lighter for the AI.
// ------------------------------------------------------------------

const CategorySummarySchema = new mongoose.Schema({
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    percentageOfTotal: { type: Number, required: true }
}, { _id: false });

const IncomeSourceSummarySchema = new mongoose.Schema({
    source: { type: String, required: true },
    amount: { type: Number, required: true },
    percentageOfTotal: { type: Number, required: true }
}, { _id: false });

const TransactionSnapshotSchema = new mongoose.Schema({
    transactionId: { type: mongoose.Schema.Types.ObjectId }, // Flexible ref (could be Income or Expense)
    type: { type: String, enum: ['Income', 'Expense'], required: true },
    categoryOrSource: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true }
}, { _id: false });

const HabitSchema = new mongoose.Schema({
    category: { type: String, required: true },
    frequency: { type: Number, required: true }, // transactions over a period
    averageAmount: { type: Number, required: true },
    trend: { type: String, enum: ['Increasing', 'Decreasing', 'Stable'], default: 'Stable' }
}, { _id: false });

const MomCategoryDeltaSchema = new mongoose.Schema({
    category: { type: String, required: true },
    deltaPercentage: { type: Number, required: true },
    absoluteDelta: { type: Number, required: true }
}, { _id: false });

const RecurringItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    estimatedMonthlyCost: { type: Number, required: true }
}, { _id: false });

// ------------------------------------------------------------------
// Main Schema
// ------------------------------------------------------------------

const FinancialContextSchema = new mongoose.Schema({
    // 1-to-1 relationship with User. A user only ever has ONE active context document.
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    
    // SMART TRIGGER: Instead of recalculating on every single DB insert, 
    // we set this to true when an expense/income is added. A background worker 
    // picks this up, calculates, and sets it back to false.
    needsRecalculation: { type: Boolean, default: true },
    lastCalculatedAt: { type: Date, default: null },

    // 1. MACRO METRICS
    macro: {
        incomeMtd: { type: Number, default: 0 },
        expenseMtd: { type: Number, default: 0 },
        incomeYtd: { type: Number, default: 0 },
        expenseYtd: { type: Number, default: 0 },
        savingsRateMtd: { type: Number, default: 0 }, // % of income saved MTD
        savingsRateYtd: { type: Number, default: 0 }  // % of income saved YTD
    },

    // 2. VELOCITY METRICS
    velocity: {
        dailyBurnRate: { type: Number, default: 0 }, // expenseMtd / current day of month
        projectedEomSpend: { type: Number, default: 0 }, // dailyBurnRate * days in month
        momSpendDeltaPercentage: { type: Number, default: 0 } // e.g., +15% compared to last month
    },

    // 3. BEHAVIOURAL ANALYTICS
    behavioural: {
        financialHealthScore: { type: Number, default: 0 }, // 0 to 100
        habitualSpends: [HabitSchema],
        spendingPatterns: [{ type: String }],
    },

    // 4. COMPARATIVE INTELLIGENCE & MEMORY
    comparative: {
        momSpendDeltaPercentage: { type: Number, default: 0 }, // E.g. +15% compared to last month
        yoySpendDeltaPercentage: { type: Number, default: 0 },
        momCategoryDeltas: [MomCategoryDeltaSchema],
    },
    
    personalisationMemory: {
        userPersona: { type: String, default: "Standard User" }, // e.g. "Frugal", "Impulse Buyer", "Saver"
        longTermGoals: [{ type: String }],
    },

    // 5. EMBEDDED ARRAYS
    // Top categories for the current month
    topCategoriesMtd: [CategorySummarySchema],
    
    // Top categories for the current year (YTD)
    topCategoriesYtd: [CategorySummarySchema],

    // Top income sources for the current month
    topIncomeSourcesMtd: [IncomeSourceSummarySchema],
    
    // Top income sources for the current year (YTD)
    topIncomeSourcesYtd: [IncomeSourceSummarySchema],
    
    // The 3-5 largest transactions this month (helps AI catch big irregular spends)
    largestTransactionsMtd: [TransactionSnapshotSchema],
    
    // Detected subscriptions (e.g., Netflix, Gym)
    recurringSubscriptions: [RecurringItemSchema],

    // 6. PRE-COMPUTED AI INSIGHTS
    // Array of plain text strings. Saves the AI from doing math.
    // Example: "Dining out is 40% higher than your 3-month average."
    anomalies: [{ type: String }],

    // 5. AI SUMMARY CACHE
    // A natural-language monthly summary generated by the AI.
    // Regenerated when needsRecalculation is cleared OR the summary is older than 6h.
    aiSummary: { type: String, default: null },
    summaryGeneratedAt: { type: Date, default: null },
    summaryNeedsRefresh: { type: Boolean, default: false }

}, {
    timestamps: true
});

export default mongoose.model("FinancialContext", FinancialContextSchema);