import User from '../models/User.js'
import Income from '../models/Income.js';
import xlsx from 'xlsx';
import fs from 'fs';

//Add Income Source
const addIncome = async(req, res)=>{
    const userId = req.user.id;

    try {
        const {icon, source, amount, date} = req.body;

        //validate missing fields
        if(!source ||!amount|| !date){
            return res.status(400).json({message:"All fields are required"});
        }

        const newIncome = new Income({
            userId, icon, source, amount, date: new Date(date)
        })

        await newIncome.save();
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
    try {
        await Income.findByIdAndDelete(req.params.id);
        res.json({message:"Income deleted successfully"});
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
        xlsx.writeFile(wb, 'income_details.xlsx');
        res.download('income_details.xlsx');
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

            try {
                const newIncome = new Income({
                    userId,
                    icon: row.Icon || '',
                    source: row.Source,
                    amount: parseFloat(row.Amount),
                    date: dateObj
                });

                await newIncome.save();
                successCount.count++;
            } catch (error) {
                errors.push(`Row ${i + 2}: ${error.message}`);
            }
        }

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        res.status(200).json({
            message: `Successfully imported ${successCount.count} income entries`,
            successCount: successCount.count,
            errors: errors.length > 0 ? errors : null,
            totalRows: data.length
        });
    } catch (error) {
        if(req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({message:"Error processing file: " + error.message});
    }
}

export {addIncome, getAllIncome, deleteIncome, deleteIncomeByInterval, downloadIncomeExcel, uploadIncomeExcel} 