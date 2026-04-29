import express from "express";
import { Router } from "express";
import {addExpense, getAllExpense, deleteExpense, deleteExpensesByInterval, downloadExpenseExcel, uploadExpenseExcel} from "../controllers/expenseController.js"
import { protect } from "../middleware/authMiddleware.js";
import { uploadExcel } from "../middleware/uploadMiddleware.js";


const router = express.Router();

router.post('/add', protect, addExpense);
router.get('/get', protect, getAllExpense);
router.get('/downloadExcel', protect, downloadExpenseExcel);
router.post('/uploadExcel', protect, uploadExcel.single('file'), uploadExpenseExcel);
router.post('/deleteByInterval', protect, deleteExpensesByInterval);
router.delete("/:id", protect, deleteExpense);

export default router;
