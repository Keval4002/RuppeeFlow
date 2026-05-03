import Income from '../models/Income.js'
import Expense from '../models/Expense.js'
import FinancialContext from '../models/FinancialContext.js'
import { Types } from 'mongoose'


const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};
//Dashboard Data
const getDashboardData = async(req, res)=>{
    try {
        const userId = req.user.id;
        const userObjectId = new Types.ObjectId(String(userId));
        
        //Fetch Total Income and Expense

        const totalIncome = await Income.aggregate([
            {$match: {userId: userObjectId}},
            {$group: {_id:null, total: {$sum: "$amount"}}},
        ]);

        const totalExpense = await Expense.aggregate([
        {$match: {userId: userObjectId}},
        {$group: {_id:null, total: {$sum: "$amount"}}},
        ]);
        //Get income transactions from last 60 days
        const last60DaysIncomeTransactions = await Income.find({
            userId, 
            date: {$gte : daysAgo(60)},
        }).sort({date:-1})

        //Get total income for last 60 days
        const incomeLast60Days = last60DaysIncomeTransactions.reduce((sum, transaction)=>{
            return sum + transaction.amount;
        }, 0);

        //Get expense transactions from last 30 days 
        const last30DaysExpenseTransactions = await Expense.find({
            userId, 
            date: {$gte: daysAgo(30)},
        }).sort({date:-1})

        //Get total expenses for last 30 days
        const expensesLast30Days = last30DaysExpenseTransactions.reduce((sum, transaction)=>sum+transaction.amount, 0);

        //Fetch last 5 transactions income + expense
        const lastTransactions = [
            ...(await Income.find({userId}).sort({date:-1}).limit(5)).map((txn)=>({
                ...txn.toObject(),
                type:"income",
            })), 
            ...(await Expense.find({userId}).sort({date:-1}).limit(5)).map((txn)=>({
                ...txn.toObject(),
                type:"expense",
            })),
        ].sort((a,b)=>b.date-a.date)//Sort the latest first

        const financialContext = await FinancialContext.findOne({ userId: userObjectId }).lean();

        res.json({
            totalBalance: parseFloat(((totalIncome[0]?.total||0) - (totalExpense[0]?.total||0)).toFixed(2)),
            totalIncome: parseFloat((totalIncome[0]?.total||0).toFixed(2)),
            totalExpenses: parseFloat((totalExpense[0]?.total||0).toFixed(2)),
            last30DaysExpenses: {
                total: parseFloat(expensesLast30Days.toFixed(2)),
                transactions: last30DaysExpenseTransactions
            },
            last60DaysIncome:{
                total: parseFloat(incomeLast60Days.toFixed(2)),
                transactions: last60DaysIncomeTransactions
            }, 
            recentTransactions: lastTransactions,
            financialContext
        })
    } catch (error) {
        res.status(500).json({message:"Server Error", error});
    }
}

export {getDashboardData}
