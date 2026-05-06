import User from '../models/User.js'
import Income from '../models/Income.js';
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

//Add Income Source
const addIncome = async(req, res)=>{
    const userId = req.user.id;

    try {
        const {icon, source, amount, date} = req.body;

        //validate missing fields
        if(!source ||!amount|| !date){
            return res.status(400).json({message:"All fields are required"});
        }

        if (isNaN(amount) || Number(amount) <= 0) {
            return res.status(400).json({message:"Amount must be a positive number"});
        }

        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
            return res.status(400).json({message:"Invalid date format"});
        }

        const newIncome = new Income({
            userId, icon, source, amount: parseFloat(amount), date: parsedDate
        })

        await newIncome.save();
        eventBus.emit('dataUpdated', userId);
        res.status(200).json(newIncome);
    } catch (error) {
        res.status(500).json({message:"Server Error"});
    }
}

//Get All Income Source 
const getAllIncome = async(req, res)=>{
    const userId = req.user.id;

    try {
        const income = await Income.find({userId}).sort({date:-1});
        res.json(income);
    } catch (error) {
        res.status(500).json({message:"Server Error"});
    }
}

//Delete Income Source
const deleteIncome = async(req, res)=>{
    const userId = req.user.id;
    try {
        const deleted = await Income.findOneAndDelete({ _id: req.params.id, userId });
        if (!deleted) {
            return res.status(404).json({message:"Income not found"});
        }
        eventBus.emit('dataUpdated', userId);
        res.json({message:"Income deleted successfully"});
    } catch (error) {
        res.status(500).json({message:"Server Error"});
    }
}

//Update Income Amount
const updateIncome = async(req, res)=>{
    const userId = req.user.id;
    try {
        const { amount } = req.body;

        if (!amount || isNaN(amount) || Number(amount) <= 0) {
            return res.status(400).json({message:"Amount must be a positive number"});
        }

        const updated = await Income.findOneAndUpdate(
            { _id: req.params.id, userId },
            { $set: { amount: parseFloat(amount) } },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({message:"Income not found"});
        }

        eventBus.emit('dataUpdated', userId);
        res.json(updated);
    } catch (error) {
        res.status(500).json({message:"Server Error"});
    }
}

//Delete All Income by interval (all, month, day)
const deleteIncomeByInterval = async(req, res)=>{
    const userId = req.user.id;
    const {interval} = req.body; // 'all', 'month', or 'day'

    try {
        let query = {userId};
        const now = new Date();

        if (!['all', 'month', 'day'].includes(interval)) {
            return res.status(400).json({message:"Invalid interval. Use 'all', 'month', or 'day'."});
        }

        if(interval === 'month'){
            // Delete income from past 30 days
            const thirtyDaysAgo = new Date(now);
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            query.date = {$gte: thirtyDaysAgo};
        } else if(interval === 'day'){
            // Delete income from past 24 hours
            const oneDayAgo = new Date(now);
            oneDayAgo.setDate(oneDayAgo.getDate() - 1);
            query.date = {$gte: oneDayAgo};
        }
        // For 'all', query only has userId, so all income will be deleted

        const result = await Income.deleteMany(query);
        eventBus.emit('dataUpdated', userId);
        
        if(result.deletedCount === 0){
            return res.status(404).json({message: `No income found for the specified interval`});
        }

        res.json({
            message: `Successfully deleted ${result.deletedCount} income record(s) for the ${interval} interval`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        res.status(500).json({message:"Server Error: " + error.message});
    }
}

//Download Excel
const downloadIncomeExcel = async(req, res)=>{
    const userId = req.user.id;
    try {
        const income = await Income.find({userId}).sort({date:-1});

        const data = income.map((item)=>({
            Source: item.source, 
            Amount: item.amount,
            Date: item.date,
        }));

        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet(data);
        xlsx.utils.book_append_sheet(wb, ws, "Income");
        const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
        res.setHeader('Content-Disposition', 'attachment; filename="income_details.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } catch (error) {
        res.status(500).json({message:"Server Error"});
    }
}

//Upload Income from Excel
const uploadIncomeExcel = async(req, res)=>{
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
        const validIncome = [];

        for (let i = 0; i < data.length; i++) {
            const row = data[i];

            // Validate required fields
            if (!row.Source || !row.Amount || !row.Date) {
                errors.push(`Row ${i + 2}: Missing required fields. Please ensure Source, Amount, and Date columns exist.`);
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

            validIncome.push({
                userId,
                icon: row.Icon || '',
                source: row.Source,
                amount: parseFloat(row.Amount),
                date: dateObj
            });
        }

        let insertedCount = 0;
        if (validIncome.length > 0) {
            const inserted = await Income.insertMany(validIncome, { ordered: false });
            insertedCount = inserted.length;
        }

        // Clean up uploaded file
        await safeUnlink(req.file.path);

        eventBus.emit('dataUpdated', userId);

        res.status(200).json({
            message: `Successfully imported ${insertedCount} income entries`,
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

export {addIncome, getAllIncome, deleteIncome, updateIncome, deleteIncomeByInterval, downloadIncomeExcel, uploadIncomeExcel}
