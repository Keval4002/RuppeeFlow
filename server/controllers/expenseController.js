import User from '../models/User.js'
import Expense from '../models/Expense.js';
import xlsx from 'xlsx';
import fs from 'fs';

//Add Expense Category
const addExpense = async(req, res)=>{
    const userId = req.user.id;

    try {
        const {icon, category, amount, date} = req.body;

        //validate missing fields
        if(!category ||!amount|| !date){
            return res.status(400).json({message:"All fields are required"});
        }

        const newExpense = new Expense({
            userId, icon, category, amount, date: new Date(date)
        })

        await newExpense.save();
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
    try {
        await Expense.findByIdAndDelete(req.params.id);
        res.json({message:"Expense deleted successfully"});
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
        xlsx.writeFile(wb, 'expense_details.xlsx');
        res.download('expense_details.xlsx');
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

        // Read the Excel file
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        // Validate and insert data
        const errors = [];
        const successCount = {count: 0};
        
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

            try {
                const newExpense = new Expense({
                    userId,
                    icon: row.Icon || '',
                    category: row.Category,
                    amount: parseFloat(row.Amount),
                    date: dateObj
                });

                await newExpense.save();
                successCount.count++;
            } catch (error) {
                errors.push(`Row ${i + 2}: ${error.message}`);
            }
        }

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        res.status(200).json({
            message: `Successfully imported ${successCount.count} expenses`,
            successCount: successCount.count,
            errors: errors.length > 0 ? errors : null,
            totalRows: data.length
        });
    } catch (error) {
        if(req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({message:"Error processing file: " + error.message});
    }
}

export {addExpense, getAllExpense, deleteExpense, deleteExpensesByInterval, downloadExpenseExcel, uploadExpenseExcel} 