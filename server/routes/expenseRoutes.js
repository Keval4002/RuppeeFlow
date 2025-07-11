import express from "express";
import { Router } from "express";
import {addExpense, getAllExpense, deleteExpense, downloadExpenseExcel} from "../controllers/expenseController.js"
import { protect } from "../middleware/authMiddleware.js";


const router = express.Router();

router.post('/add', protect, addExpense);
router.get('/get', protect, getAllExpense);
router.get('/downloadExcel', protect, downloadExpenseExcel);
router.delete("/:id", protect, deleteExpense);

export default router;
