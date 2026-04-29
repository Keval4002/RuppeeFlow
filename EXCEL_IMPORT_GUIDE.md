# Excel Import Format Guide

This document describes the required format for importing expense and income data via Excel files in the Expense Tracker application.

## Overview

You can import expense and income records in bulk using Excel files (.xlsx or .xls format). The system will validate each row and provide a detailed report of successful imports and any errors.

---

## Expense Excel Format

### Required Columns

Create an Excel file with the following columns in the **first row**:

| Column Name | Type | Required | Description |
|-------------|------|----------|-------------|
| Category | Text | ✅ Yes | The expense category (e.g., Food, Transport, Rent, Entertainment) |
| Amount | Number | ✅ Yes | The expense amount (must be positive) |
| Date | Date | ✅ Yes | The transaction date (YYYY-MM-DD or any valid date format) |
| Icon | Text | ❌ No | Optional emoji or icon (e.g., 🍔, 🚗, 🏠) |

### Example Expense Sheet

```
| Category      | Amount  | Date       | Icon |
|---------------|---------|------------|------|
| Food          | 500     | 2024-01-15 | 🍔   |
| Transport     | 200     | 2024-01-16 | 🚗   |
| Rent          | 15000   | 2024-01-01 | 🏠   |
| Entertainment | 1200    | 2024-01-17 | 🎬   |
| Utilities     | 3000    | 2024-01-10 |      |
```

### Download Template

1. Navigate to the "Import Excel" option in the side menu
2. Select "Expense"
3. Click "Download Template" to get a pre-formatted Excel file
4. Fill in your data following the format above
5. Upload the file back through the same interface

---

## Income Excel Format

### Required Columns

Create an Excel file with the following columns in the **first row**:

| Column Name | Type | Required | Description |
|-------------|------|----------|-------------|
| Source | Text | ✅ Yes | The income source (e.g., Salary, Freelance, Investment, Bonus) |
| Amount | Number | ✅ Yes | The income amount (must be positive) |
| Date | Date | ✅ Yes | The transaction date (YYYY-MM-DD or any valid date format) |
| Icon | Text | ❌ No | Optional emoji or icon (e.g., 💰, 💻, 📈) |

### Example Income Sheet

```
| Source      | Amount  | Date       | Icon |
|-------------|---------|------------|------|
| Salary      | 50000   | 2024-01-01 | 💰   |
| Freelance   | 5000    | 2024-01-10 | 💻   |
| Investment  | 2000    | 2024-01-15 | 📈   |
| Bonus       | 10000   | 2024-01-20 | 🎁   |
| Interest    | 500     | 2024-01-25 |      |
```

### Download Template

1. Navigate to the "Import Excel" option in the side menu
2. Select "Income"
3. Click "Download Template" to get a pre-formatted Excel file
4. Fill in your data following the format above
5. Upload the file back through the same interface

---

## Important Notes

### Header Row Requirements
- **Headers MUST be in the first row** exactly as shown above
- Headers are **case-sensitive** (use exact capitalization)
- Column order doesn't matter, but all required columns must be present
- You can have additional columns - they will be ignored

### Data Validation Rules

#### Category/Source Field
- Cannot be empty
- Must be text
- Maximum 100 characters recommended

#### Amount Field
- Must be a positive number (> 0)
- Can be decimal (e.g., 100.50)
- Negative values will be rejected

#### Date Field
- Must be a valid date
- Supported formats:
  - YYYY-MM-DD (2024-01-15)
  - MM/DD/YYYY (01/15/2024)
  - DD-MM-YYYY (15-01-2024)
  - Or any other recognized date format
- Invalid dates will be rejected with an error message

#### Icon Field (Optional)
- Can contain emojis or text
- Leave blank if not needed
- Maximum 10 characters recommended

---

## Upload Process

### Step-by-Step Guide

1. **Open Import Dialog**
   - Click "Import Excel" in the side menu
   - Choose between "Expense" or "Income"

2. **Select File**
   - Click the upload area or drag & drop your Excel file
   - File must be .xlsx or .xls format

3. **Review Format** (Optional)
   - Click "Excel File Format Required" to see the required columns
   - Check the example table to ensure your format matches

4. **Download Template** (Optional)
   - Click "Download Template" to get a pre-formatted file
   - You can use this as a base and fill in your data

5. **Upload File**
   - Click "Upload" button
   - Wait for processing

6. **Review Results**
   - Success message shows number of imported records
   - Any errors are listed with row numbers and descriptions
   - You can fix the errors and re-upload

---

## Error Messages & Solutions

### "Missing required fields"
- **Cause:** A required column (Category/Source, Amount, Date) is missing or empty
- **Solution:** Ensure the column header exists and all rows have values

### "Amount must be a positive number"
- **Cause:** Amount is zero, negative, or not a number
- **Solution:** Enter only positive numeric values

### "Invalid date format"
- **Cause:** Date value cannot be recognized
- **Solution:** Use standard date formats like YYYY-MM-DD

### "Row X: Missing required fields"
- **Cause:** A specific row is missing data
- **Solution:** Fill in all required columns for that row, then re-upload

---

## Best Practices

✅ **DO:**
- Use the "Download Template" feature to get started
- Verify headers match exactly (case-sensitive)
- Use clear, consistent category/source names
- Include dates for all transactions
- Add icons for better visualization
- Review error messages carefully

❌ **DON'T:**
- Leave required fields empty
- Use formulas - use values instead
- Include extra header rows
- Use special characters in Category/Source (except spaces)
- Import duplicate records without checking

---

## File Size Limits

- Maximum file size: No strict limit, but reasonable files (< 10MB) are recommended
- Maximum rows per import: Technically unlimited, but 1000-5000 rows per file is recommended for better performance

---

## Troubleshooting

### "No file uploaded"
- Make sure you selected a file before clicking Upload
- Ensure the file is accessible

### "Only .xlsx and .xls files allowed"
- The uploaded file is not in Excel format
- Convert your file to .xlsx or .xls format

### Import appears to hang
- For very large files (5000+ rows), processing may take a moment
- Do not close the dialog during upload

### Data not appearing after successful import
- Refresh the page (F5)
- Navigate away and back to the section
- Data should appear sorted by most recent date first

---

## Support

If you encounter issues:
1. Check this guide for the required format
2. Verify your Excel file has the correct headers
3. Ensure all required fields are filled
4. Try uploading a smaller test file first
5. Check the error messages for specific row issues

---

## Version History

- **v1.0** - Initial release supporting Expense and Income imports
- Features: File validation, row-by-row error reporting, template download
