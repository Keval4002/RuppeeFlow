import User from '../models/User.js'
import Expense from '../models/Expense.js';
import xlsx from 'xlsx';
import fs from 'fs';
import { eventBus } from '../utils/eventBus.js';

const safeUnlink = async (filePath) => {
    if (!filePath) {
        return;
    }

    try {
        await fs.promises.unlink(filePath);
    } catch (error) {
        if (error.code !== 'ENOENT') {
            throw error;
        }
    }
};

//Add Expense Category
const addExpense = async(req, res)=>{
    const userId = req.user.id;

    try {
        const {icon, category, amount, date} = req.body;

        //validate missing fields
        if(!category ||!amount|| !date){
            return res.status(400).json({message:"All fields are required"});
        }

        if (isNaN(amount) || Number(amount) <= 0) {
            return res.status(400).json({message:"Amount must be a positive number"});
        }

        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
            return res.status(400).json({message:"Invalid date format"});
        }

        const newExpense = new Expense({
            userId, icon, category, amount: parseFloat(amount), date: parsedDate
        })

        await newExpense.save();
        eventBus.emit('dataUpdated', userId);
        res.status(200).json(newExpense);
    } catch (error) {
        res.status(500).json({message:"Server Error"});
    }
}

//Get All Expense category
const getAllExpense = async(req, res)=>{
    const userId = req.user.id;

    try {
        const expense = await Expense.find({userId}).sort({date:-1});
        res.json(expense);
    } catch (error) {
        res.status(500).json({message:"Server Error"});
    }
}

//Delete Expense category
const deleteExpense = async(req, res)=>{
    const userId = req.user.id;
    try {
        const deleted = await Expense.findOneAndDelete({ _id: req.params.id, userId });
        if (!deleted) {
            return res.status(404).json({message:"Expense not found"});
        }
        eventBus.emit('dataUpdated', userId);
        res.json({message:"Expense deleted successfully"});
    } catch (error) {
        res.status(500).json({message:"Server Error"});
    }
}

//Update Expense Amount
const updateExpense = async(req, res)=>{
    const userId = req.user.id;
    try {
        const { amount } = req.body;

        if (!amount || isNaN(amount) || Number(amount) <= 0) {
            return res.status(400).json({message:"Amount must be a positive number"});
        }

        const updated = await Expense.findOneAndUpdate(
            { _id: req.params.id, userId },
            { $set: { amount: parseFloat(amount) } },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({message:"Expense not found"});
        }

        eventBus.emit('dataUpdated', userId);
        res.json(updated);
    } catch (error) {
        res.status(500).json({message:"Server Error"});
    }
}

//Delete All Expenses by interval (all, month, day)
const deleteExpensesByInterval = async(req, res)=>{
    const userId = req.user.id;
    const {interval} = req.body; // 'all', 'month', or 'day'

    try {
        let query = {userId};
        const now = new Date();

        if (!['all', 'month', 'day'].includes(interval)) {
            return res.status(400).json({message:"Invalid interval. Use 'all', 'month', or 'day'."});
        }

        if(interval === 'month'){
            // Delete expenses from past 30 days
            const thirtyDaysAgo = new Date(now);
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            query.date = {$gte: thirtyDaysAgo};
        } else if(interval === 'day'){
            // Delete expenses from past 24 hours
            const oneDayAgo = new Date(now);
            oneDayAgo.setDate(oneDayAgo.getDate() - 1);
            query.date = {$gte: oneDayAgo};
        }
        // For 'all', query only has userId, so all expenses will be deleted

        const result = await Expense.deleteMany(query);
        eventBus.emit('dataUpdated', userId);
        
        if(result.deletedCount === 0){
            return res.status(404).json({message: `No expenses found for the specified interval`});
        }

        res.json({
            message: `Successfully deleted ${result.deletedCount} expense(s) for the ${interval} interval`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        res.status(500).json({message:"Server Error: " + error.message});
    }
}

//Download Excel
const downloadExpenseExcel = async(req, res)=>{
    const userId = req.user.id;
    try {
        const expense = await Expense.find({userId}).sort({date:-1});

        const data = expense.map((item)=>({
            Category: item.category, 
            Amount: item.amount,
            Date: item.date,
        }));

        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet(data);
        xlsx.utils.book_append_sheet(wb, ws, "Expense");
        const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
        res.setHeader('Content-Disposition', 'attachment; filename="expense_details.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } catch (error) {
        res.status(500).json({message:"Server Error"});
    }
}

//Upload Expense from Excel
const uploadExpenseExcel = async(req, res)=>{
    const userId = req.user.id;

    try {
        if(!req.file){
            return res.status(400).json({message:"No file uploaded"});
        }

        // Read the Excel file; cellDates:true converts Excel date serials to JS Dates
        const workbook = xlsx.readFile(req.file.path, { cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        // Validate and insert data
        const errors = [];
        const validExpenses = [];

        for (let i = 0; i < data.length; i++) {
            const row = data[i];

            // Validate required fields
            if (!row.Category || !row.Amount || !row.Date) {
                errors.push(`Row ${i + 2}: Missing required fields. Please ensure Category, Amount, and Date columns exist.`);
                continue;
            }

            // Validate amount is a number
            if (isNaN(row.Amount) || row.Amount <= 0) {
                errors.push(`Row ${i + 2}: Amount must be a positive number.`);
                continue;
            }

            // Validate date
            const dateObj = new Date(row.Date);
            if (isNaN(dateObj.getTime())) {
                errors.push(`Row ${i + 2}: Invalid date format. Please use a valid date.`);
                continue;
            }

            validExpenses.push({
                userId,
                icon: row.Icon || '',
                category: row.Category,
                amount: parseFloat(row.Amount),
                date: dateObj
            });
        }

        let insertedCount = 0;
        if (validExpenses.length > 0) {
            const inserted = await Expense.insertMany(validExpenses, { ordered: false });
            insertedCount = inserted.length;
        }

        // Clean up uploaded file
        await safeUnlink(req.file.path);

        eventBus.emit('dataUpdated', userId);

        res.status(200).json({
            message: `Successfully imported ${insertedCount} expenses`,
            successCount: insertedCount,
            errors: errors.length > 0 ? errors : null,
            totalRows: data.length
        });
    } catch (error) {
        if (req.file) {
            safeUnlink(req.file.path).catch(() => {});
        }
        res.status(500).json({message:"Error processing file: " + error.message});
    }
}

export {addExpense, getAllExpense, deleteExpense, updateExpense, deleteExpensesByInterval, downloadExpenseExcel, uploadExpenseExcel}
