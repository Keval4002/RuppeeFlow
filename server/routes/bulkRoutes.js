import express from "express";
import { uploadBulkExcel, downloadBulkTemplate } from "../controllers/bulkController.js"
import { protect } from "../middleware/authMiddleware.js";
import { uploadExcel } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post('/uploadExcel', protect, uploadExcel.single('file'), uploadBulkExcel);
router.get('/downloadTemplate', protect, downloadBulkTemplate);

export default router;
