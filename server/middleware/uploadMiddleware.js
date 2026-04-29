import multer from "multer"

//configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, "uploads/");
    },
    filename: (req, file, cb)=>{
        cb(null, `${Date.now()}-${file.originalname}`)
    }
});

//file filter for images
const imageFileFilter = (req, file, cb)=>{
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if(allowedTypes.includes(file.mimetype)){
        cb(null, true);
    }else{
        cb(new Error('Only .jpeg, .jpg and .png file formats are allowed'), false);
    }
};

//file filter for Excel files
const excelFileFilter = (req, file, cb)=>{
    const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
    ];
    if(allowedTypes.includes(file.mimetype) || file.originalname.endsWith('.xlsx') || file.originalname.endsWith('.xls')){
        cb(null, true);
    }else{
        cb(new Error('Only .xlsx and .xls file formats are allowed'), false);
    }
};

const upload = multer({storage, fileFilter: imageFileFilter});
const uploadExcel = multer({storage, fileFilter: excelFileFilter});

export {upload, uploadExcel};

