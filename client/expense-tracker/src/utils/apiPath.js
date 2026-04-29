///utils/apiPath.js

export const API_PATH={
    AUTH:{
        LOGIN: "api/v1/auth/login", 
        REGISTER: "api/v1/auth/register",
        GET_USER_INFO: "api/v1/auth/getUser",
    }, 
    DASHBOARD:{
        GET_DATA: "api/v1/dashboard",
    },
    INCOME:{
        ADD_INCOME: "api/v1/income/add", 
        GET_ALL_INCOME: "api/v1/income/get",
        DELETE_INCOME: (incomeId)=>`api/v1/income/${incomeId}`,
        DOWNLOAD_INCOME: "api/v1/income/downloadExcel",
        UPLOAD_INCOME: "api/v1/income/uploadExcel",
        DELETE_INCOME_BY_INTERVAL: "api/v1/income/deleteByInterval"
    },
    EXPENSE:{
        ADD_EXPENSE: "api/v1/expense/add",
        GET_ALL_EXPENSE: "api/v1/expense/get",
        DELETE_EXPENSE: (expenseId)=>`api/v1/expense/${expenseId}`,
        DOWNLOAD_EXPENSE: "api/v1/expense/downloadExcel",
        UPLOAD_EXPENSE: "api/v1/expense/uploadExcel",
        DELETE_EXPENSE_BY_INTERVAL: "api/v1/expense/deleteByInterval"
    },
    BULK:{
        UPLOAD_EXCEL: "api/v1/bulk/uploadExcel",
        DOWNLOAD_TEMPLATE: "api/v1/bulk/downloadTemplate"
    },
    IMAGE:{
        UPLOAD_IMAGE: "api/v1/auth/upload-image"
    }
}
