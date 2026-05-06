import Expense from '../models/Expense.js';
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

// Upload combined Income and Expense from Excel
const uploadBulkExcel = async(req, res)=>{
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
        const validIncome = [];
        
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            
            // Validate required fields
            if (!row.Name || !row.Type || !row.Amount || !row.Date) {
                errors.push(`Row ${i + 2}: Missing required fields. Please ensure Name, Type, Amount, and Date columns exist.`);
                continue;
            }

            // Validate type
            const type = row.Type.trim().toLowerCase();
            if (type !== 'income' && type !== 'expense') {
                errors.push(`Row ${i + 2}: Type must be either "Income" or "Expense" (case-insensitive).`);
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

            // Normalize icon: accept legacy "Icon" header or "Icon (optional)"
            const iconValue = row.Icon || row["Icon (optional)"] || '';

            if (type === 'expense') {
                validExpenses.push({
                    userId,
                    icon: iconValue,
                    category: row.Name,
                    amount: parseFloat(row.Amount),
                    date: dateObj
                });
            } else {
                validIncome.push({
                    userId,
                    icon: iconValue,
                    source: row.Name,
                    amount: parseFloat(row.Amount),
                    date: dateObj
                });
            }
        }

        // Batch insert validated records (2 DB calls max instead of N individual saves)
        const successCount = { expenses: 0, income: 0 };

        if (validExpenses.length > 0) {
            const inserted = await Expense.insertMany(validExpenses, { ordered: false });
            successCount.expenses = inserted.length;
        }
        if (validIncome.length > 0) {
            const inserted = await Income.insertMany(validIncome, { ordered: false });
            successCount.income = inserted.length;
        }

        // Clean up uploaded file
        await safeUnlink(req.file.path);

        const totalSuccess = successCount.expenses + successCount.income;
        if (totalSuccess > 0) {
            eventBus.emit('dataUpdated', userId);
        }
        res.status(200).json({
            message: `Successfully imported ${totalSuccess} records (${successCount.expenses} expenses, ${successCount.income} income)`,
            successCount: totalSuccess,
            breakdown: {
                expenses: successCount.expenses,
                income: successCount.income
            },
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

// Download combined template
const downloadBulkTemplate = async(req, res)=>{
    try {
        const data = [
            {
                Name: 'Food Expenses',
                Type: 'Expense',
                Amount: 500,
                Date: new Date('2024-01-15'),
                Icon: '🍔'
            },
            {
                Name: 'Monthly Salary',
                Type: 'Income',
                Amount: 50000,
                Date: new Date('2024-01-01'),
                Icon: '💰'
            },
            {
                Name: 'Transport',
                Type: 'Expense',
                Amount: 200,
                Date: new Date('2024-01-16'),
                Icon: '🚗'
            },
            {
                Name: 'Freelance Project',
                Type: 'Income',
                Amount: 5000,
                Date: new Date('2024-01-10'),
                Icon: '💻'
            }
        ];

        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet(data);
        
        // Set column widths
        ws['!cols'] = [
            { wch: 20 },
            { wch: 12 },
            { wch: 12 },
            { wch: 15 },
            { wch: 10 }
        ];

        xlsx.utils.book_append_sheet(wb, ws, "Combined");
        const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
        res.setHeader('Content-Disposition', 'attachment; filename="bulk_import_template.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } catch (error) {
        res.status(500).json({message:"Error generating template: " + error.message});
    }
}

export { uploadBulkExcel, downloadBulkTemplate }
