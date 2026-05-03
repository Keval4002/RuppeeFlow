import mongoose from "mongoose";
import Expense from "../models/Expense.js";
import Income from "../models/Income.js";
import FinancialContext from "../models/FinancialContext.js";
import { markSummaryStale } from "./summaryService.js";

export const updateFinancialContext = async (userId) => {
    try {
        const objectId = new mongoose.Types.ObjectId(userId);
        
        // 1. Setup Time Boundaries
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const currentDay = now.getDate() || 1; // Prevent division by zero on 1st of month

        // 2. Fetch Data using MongoDB $facet (Ultra-fast concurrent aggregations)
        const [expenseStats, incomeStats] = await Promise.all([
            Expense.aggregate([
                { $match: { userId: objectId } },
                {
                    $facet: {
                        mtdTotals: [
                            { $match: { date: { $gte: startOfMonth } } },
                            { $group: { _id: null, total: { $sum: "$amount" } } }
                        ],
                        ytdTotals: [
                            { $match: { date: { $gte: startOfYear } } },
                            { $group: { _id: null, total: { $sum: "$amount" } } }
                        ],
                        topCategories: [
                            { $match: { date: { $gte: startOfMonth } } },
                            { $group: { _id: "$category", amount: { $sum: "$amount" } } },
                            { $sort: { amount: -1 } },
                            { $limit: 3 }
                        ],
                        largestTransactions: [
                            { $match: { date: { $gte: startOfMonth } } },
                            { $sort: { amount: -1 } },
                            { $limit: 3 }
                        ]
                    }
                }
            ]),
            Income.aggregate([
                { $match: { userId: objectId } },
                {
                    $facet: {
                        mtdTotals: [
                            { $match: { date: { $gte: startOfMonth } } },
                            { $group: { _id: null, total: { $sum: "$amount" } } }
                        ],
                        ytdTotals: [
                            { $match: { date: { $gte: startOfYear } } },
                            { $group: { _id: null, total: { $sum: "$amount" } } }
                        ],
                        topSources: [
                            { $match: { date: { $gte: startOfMonth } } },
                            { $group: { _id: "$source", amount: { $sum: "$amount" } } },
                            { $sort: { amount: -1 } },
                            { $limit: 3 }
                        ],
                        largestTransactions: [
                            { $match: { date: { $gte: startOfMonth } } },
                            { $sort: { amount: -1 } },
                            { $limit: 3 }
                        ]
                    }
                }
            ])
        ]);

        // 3. Safely Extract Aggregated Values
        const eData = expenseStats[0];
        const iData = incomeStats[0];

        const expenseMtd = eData.mtdTotals[0]?.total || 0;
        const expenseYtd = eData.ytdTotals[0]?.total || 0;
        const incomeMtd = iData.mtdTotals[0]?.total || 0;
        const incomeYtd = iData.ytdTotals[0]?.total || 0;

        // 4. Calculate Velocity & Math
        const dailyBurnRate = expenseMtd / currentDay;
        const projectedEomSpend = dailyBurnRate * daysInMonth;
        let savingsRateMtd = 0;
        if (incomeMtd > 0) {
            savingsRateMtd = Math.round(((incomeMtd - expenseMtd) / incomeMtd) * 100);
        }

        // 5. Format Arrays for the Schema
        const topCategoriesMtd = eData.topCategories.map(cat => ({
            category: cat._id,
            amount: cat.amount,
            percentageOfTotal: expenseMtd > 0 ? Math.round((cat.amount / expenseMtd) * 100) : 0
        }));

        const topIncomeSourcesMtd = iData.topSources.map(src => ({
            source: src._id,
            amount: src.amount,
            percentageOfTotal: incomeMtd > 0 ? Math.round((src.amount / incomeMtd) * 100) : 0
        }));

        const expenseLargest = eData.largestTransactions.map(trx => ({
            transactionId: trx._id,
            type: "Expense",
            categoryOrSource: trx.category,
            amount: trx.amount,
            date: trx.date
        }));

        const incomeLargest = iData.largestTransactions.map(trx => ({
            transactionId: trx._id,
            type: "Income",
            categoryOrSource: trx.source,
            amount: trx.amount,
            date: trx.date
        }));

        const largestTransactionsMtd = [...expenseLargest, ...incomeLargest]
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 3);

        // 6. Generate AI Anomalies (Pre-computed insights)
        const anomalies = [];
        if (projectedEomSpend > incomeMtd && incomeMtd > 0) {
            anomalies.push(`Warning: Projected end-of-month spend (₹${Math.round(projectedEomSpend)} INR) exceeds current month's income.`);
        }
        if (topCategoriesMtd.length > 0 && topCategoriesMtd[0].percentageOfTotal > 50) {
            anomalies.push(`Alert: Your largest category (${topCategoriesMtd[0].category}) is consuming ${topCategoriesMtd[0].percentageOfTotal}% of your monthly spending (INR).`);
        }
        if (topIncomeSourcesMtd.length > 0 && topIncomeSourcesMtd[0].percentageOfTotal > 70) {
            anomalies.push(`Notice: Your top income source (${topIncomeSourcesMtd[0].source}) accounts for ${topIncomeSourcesMtd[0].percentageOfTotal}% of monthly income (INR).`);
        }
        if (savingsRateMtd < 0) {
            anomalies.push(`You are currently operating at a net loss this month (INR).`);
        }

        // 7. Upsert the Financial Context Document
        const updatedContext = await FinancialContext.findOneAndUpdate(
            { userId: objectId },
            {
                $set: {
                    needsRecalculation: false,
                    lastCalculatedAt: new Date(),
                    macro: { incomeMtd, expenseMtd, incomeYtd, expenseYtd, savingsRateMtd, currency: 'INR' },
                    velocity: { dailyBurnRate: Number(dailyBurnRate.toFixed(2)), projectedEomSpend: Number(projectedEomSpend.toFixed(2)), momSpendDeltaPercentage: 0, currency: 'INR' },
                    topCategoriesMtd,
                    topIncomeSourcesMtd,
                    largestTransactionsMtd,
                    anomalies
                }
            },
            { new: true, upsert: true } // Create if it doesn't exist
        );

        // Mark the AI summary as stale — it will be lazily regenerated on next request
        await markSummaryStale(userId);

        return updatedContext;


    } catch (error) {
        console.error("Error updating financial context:", error);
        throw error;
    }
};