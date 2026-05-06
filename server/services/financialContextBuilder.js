import mongoose from "mongoose";
import Expense from "../models/Expense.js";
import Income from "../models/Income.js";
import FinancialContext from "../models/FinancialContext.js";

export const updateFinancialContext = async (userId) => {
    try {
        const objectId = new mongoose.Types.ObjectId(userId);
        
        // 1. Setup Time Boundaries
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const currentDay = now.getDate() || 1; // Prevent division by zero on 1st of month

        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1);
        const startOfLastYearMonth = new Date(now.getFullYear() - 1, now.getMonth() + 1, 0, 23, 59, 59, 999); // YTD up to same month last year

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
                        topCategoriesYtd: [
                            { $match: { date: { $gte: startOfYear } } },
                            { $group: { _id: "$category", amount: { $sum: "$amount" } } },
                            { $sort: { amount: -1 } },
                            { $limit: 3 }
                        ],
                        largestTransactions: [
                            { $match: { date: { $gte: startOfMonth } } },
                            { $sort: { amount: -1 } },
                            { $limit: 3 }
                        ],
                        lastMonthTotals: [
                            { $match: { date: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
                            { $group: { _id: null, total: { $sum: "$amount" } } }
                        ],
                        lastYearYtdTotals: [
                            { $match: { date: { $gte: startOfLastYear, $lte: startOfLastYearMonth } } },
                            { $group: { _id: null, total: { $sum: "$amount" } } }
                        ],
                        lastMonthCategories: [
                            { $match: { date: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
                            { $group: { _id: "$category", amount: { $sum: "$amount" } } }
                        ],
                        frequencyStats: [
                            { $match: { date: { $gte: startOfYear } } },
                            { $group: { _id: "$category", count: { $sum: 1 }, total: { $sum: "$amount" } } },
                            { $sort: { count: -1 } },
                            { $limit: 5 }
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
                        topSourcesYtd: [
                            { $match: { date: { $gte: startOfYear } } },
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
        
        const expenseLastMonth = eData.lastMonthTotals?.[0]?.total || 0;
        const expenseLastYearYtd = eData.lastYearYtdTotals?.[0]?.total || 0;

        const dailyBurnRate = expenseMtd / currentDay;
        const projectedEomSpend = dailyBurnRate * daysInMonth;
        let savingsRateMtd = 0;
        if (incomeMtd > 0) {
            savingsRateMtd = Math.round(((incomeMtd - expenseMtd) / incomeMtd) * 100);
        } else if (expenseMtd > 0) {
            savingsRateMtd = -100;
        }
        
        let savingsRateYtd = 0;
        if (incomeYtd > 0) {
            savingsRateYtd = Math.round(((incomeYtd - expenseYtd) / incomeYtd) * 100);
        } else if (expenseYtd > 0) {
            savingsRateYtd = -100;
        }

        // Comparative Intelligence
        let momSpendDeltaPercentage = 0;
        if (expenseLastMonth > 0) {
            momSpendDeltaPercentage = Math.round(((expenseMtd - expenseLastMonth) / expenseLastMonth) * 100);
        } else if (expenseLastMonth === 0 && expenseMtd > 0) {
            momSpendDeltaPercentage = 100;
        }

        let yoySpendDeltaPercentage = 0;
        if (expenseLastYearYtd > 0) {
            yoySpendDeltaPercentage = Math.round(((expenseYtd - expenseLastYearYtd) / expenseLastYearYtd) * 100);
        }

        const momCategoryDeltas = [];
        eData.topCategories.forEach(cat => {
            const lastMonthCat = eData.lastMonthCategories?.find(l => l._id === cat._id);
            const lastMonthAmt = lastMonthCat?.amount || 0;
            const deltaAbsolute = cat.amount - lastMonthAmt;
            const deltaPercent = lastMonthAmt > 0 ? Math.round((deltaAbsolute / lastMonthAmt) * 100) : (cat.amount > 0 ? 100 : 0);
            
            momCategoryDeltas.push({
                category: cat._id,
                deltaPercentage: deltaPercent,
                absoluteDelta: deltaAbsolute
            });
        });

        // 5. Format Arrays for the Schema
        const topCategoriesMtd = eData.topCategories.map(cat => ({
            category: cat._id,
            amount: cat.amount,
            percentageOfTotal: expenseMtd > 0 ? Math.round((cat.amount / expenseMtd) * 100) : 0
        }));
        
        const topCategoriesYtd = eData.topCategoriesYtd?.map(cat => ({
            category: cat._id,
            amount: cat.amount,
            percentageOfTotal: expenseYtd > 0 ? Math.round((cat.amount / expenseYtd) * 100) : 0
        })) || [];

        const topIncomeSourcesMtd = iData.topSources.map(src => ({
            source: src._id,
            amount: src.amount,
            percentageOfTotal: incomeMtd > 0 ? Math.round((src.amount / incomeMtd) * 100) : 0
        }));
        
        const topIncomeSourcesYtd = iData.topSourcesYtd?.map(src => ({
            source: src._id,
            amount: src.amount,
            percentageOfTotal: incomeYtd > 0 ? Math.round((src.amount / incomeYtd) * 100) : 0
        })) || [];

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
            
        // Behavioural Analytics
        const habitualSpends = (eData.frequencyStats || []).map(stat => ({
            category: stat._id,
            frequency: stat.count,
            averageAmount: Math.round(stat.total / stat.count),
            trend: 'Stable' // Can be enhanced later
        }));
        
        let financialHealthScore = 50; // Baseline
        
        // Use YTD if MTD is zero
        const activeSavingsRate = (incomeMtd === 0 && expenseMtd === 0) ? savingsRateYtd : savingsRateMtd;
        
        if (activeSavingsRate > 20) financialHealthScore += 20;
        else if (activeSavingsRate > 0) financialHealthScore += 10;
        else if (activeSavingsRate < 0) financialHealthScore -= 20;
        
        if (momSpendDeltaPercentage < 0) financialHealthScore += 10;
        else if (momSpendDeltaPercentage > 20) financialHealthScore -= 15;
        
        financialHealthScore = Math.max(0, Math.min(100, financialHealthScore));

        const spendingPatterns = [];
        if (habitualSpends.length > 0 && habitualSpends[0].frequency > 10) {
            spendingPatterns.push(`High frequency spending in ${habitualSpends[0].category} (${habitualSpends[0].frequency} times recently).`);
        }
        if (momSpendDeltaPercentage > 30) {
            spendingPatterns.push(`Significant spending increase this month compared to last month.`);
        }

        // 6. Generate AI Anomalies (Pre-computed insights)
        const anomalies = [];
        if (projectedEomSpend > incomeMtd && incomeMtd > 0) {
            anomalies.push(`Warning: Projected end-of-month spend (₹${Math.round(projectedEomSpend)} INR) exceeds current month's income.`);
        }
        if (topCategoriesMtd.length > 0 && topCategoriesMtd[0].percentageOfTotal > 50) {
            anomalies.push(`Alert: Your largest category (${topCategoriesMtd[0].category}) is consuming ${topCategoriesMtd[0].percentageOfTotal}% of your monthly spending (INR).`);
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
                    summaryNeedsRefresh: true, // Mark AI summary as stale (lazily regenerated on next request)
                    macro: { incomeMtd, expenseMtd, incomeYtd, expenseYtd, savingsRateMtd, savingsRateYtd, currency: 'INR' },
                    velocity: { dailyBurnRate: Number(dailyBurnRate.toFixed(2)), projectedEomSpend: Number(projectedEomSpend.toFixed(2)), momSpendDeltaPercentage: Number(momSpendDeltaPercentage), currency: 'INR' },
                    behavioural: { financialHealthScore, habitualSpends, spendingPatterns },
                    comparative: { momSpendDeltaPercentage, yoySpendDeltaPercentage, momCategoryDeltas },
                    topCategoriesMtd,
                    topCategoriesYtd,
                    topIncomeSourcesMtd,
                    topIncomeSourcesYtd,
                    largestTransactionsMtd,
                    anomalies
                }
            },
            { new: true, upsert: true } // Create if it doesn't exist
        );

        return updatedContext;


    } catch (error) {
        console.error("Error updating financial context:", error);
        throw error;
    }
};