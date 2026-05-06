import express from "express"
import {addIncome, getAllIncome, deleteIncome, updateIncome, deleteIncomeByInterval, downloadIncomeExcel, uploadIncomeExcel} from '../controllers/incomeController.js'
import { protect } from "../middleware/authMiddleware.js"
import { Router } from "express"
import { uploadExcel } from "../middleware/uploadMiddleware.js"

const router = express.Router();

router.post('/add', protect, addIncome);
router.get('/get', protect, getAllIncome);
router.get('/downloadExcel', protect, downloadIncomeExcel);
router.post('/uploadExcel', protect, uploadExcel.single('file'), uploadIncomeExcel);
router.post('/deleteByInterval', protect, deleteIncomeByInterval);
router.put("/:id", protect, updateIncome);
router.delete("/:id", protect, deleteIncome);

export default router;
