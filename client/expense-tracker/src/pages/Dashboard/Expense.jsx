import React, { useEffect, useState } from 'react'
import useUserAuth from '../../hooks/useUserAuth'
import { API_PATH } from '../../utils/apiPath';
import axiosInstance from '../../utils/axiosInstance';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import ExpenseOverview from '../../components/Expense/ExpenseOverview';
import AddExpenseForm from "../../components/Expense/AddExpenseForm"
import Modal from '../../components/Modal'
import { toast } from 'react-hot-toast';
import ExpenseList from '../../components/Expense/ExpenseList';
import DeleteAlert from '../../components/DeleteAlert';
import DeleteByIntervalAlert from '../../components/DeleteByIntervalAlert';

import { appCache, clearAppCache } from '../../utils/dataCache';

function Expense() {

  useUserAuth();

  const [openAddExpenseModal,setOpenAddExpenseModal] = useState(false); 
  const [expenseData, setExpenseData] = useState(appCache.expenseData || []);
  const [loading,setLoading] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    show:false, 
    data:null
  });
  const [openDeleteByIntervalModal, setOpenDeleteByIntervalModal] = useState(false);
  
  //Get all expense details
  const fetchExpenseDetails = async (force = false)=>{
    if(!force && appCache.expenseData) return;
    if(loading) return;

    setLoading(true);

    try {
      const response = await axiosInstance.get(`${API_PATH.EXPENSE.GET_ALL_EXPENSE}`);

      if(response.data){
        setExpenseData(response.data);
        appCache.expenseData = response.data;
      }
    } catch (error) {
      console.log("Something went wrong. Please try again.", error);
    } finally{
      setLoading(false);
    }
  }
  
  //Add Expense
  const handleAddExpense = async(expense) =>{
    const {category, amount, date, icon } = expense;

    if(!category.trim()){
      toast.error("Category is required");
      return;
    }

    if(!amount||isNaN(amount)||Number(amount)<=0){
      toast.error("Amount should be a valid number greater than 0.");
      return;
    }
    if(!date){
      toast.error("Date is required.");
    }

    try{
      await axiosInstance.post(API_PATH.EXPENSE.ADD_EXPENSE, {
        category, amount, date, icon
      });

      setOpenAddExpenseModal(false);
      toast.success("Expense added successfully");
      clearAppCache();
      fetchExpenseDetails(true);
    } catch(error){
      console.error("Error adding expesne", error.response?.data?.message || error.message)
    }
  }

  const deleteExpense = async(id)=>{
    try {
      await axiosInstance.delete(API_PATH.EXPENSE.DELETE_EXPENSE(id));
      setOpenDeleteAlert({show:false, data:null});
      toast.success("Deleted expense detail.")
      clearAppCache();
      fetchExpenseDetails(true);
    } catch (error) {
      console.error("Error deleting the detail : ", error.response?.data?.message || error.message);
    }
  }

  const deleteExpenseByInterval = async(interval) => {
    try {
      const response = await axiosInstance.post(API_PATH.EXPENSE.DELETE_EXPENSE_BY_INTERVAL, {
        interval
      });
      setOpenDeleteByIntervalModal(false);
      toast.success(response.data.message);
      clearAppCache();
      fetchExpenseDetails(true);
    } catch (error) {
      console.error("Error deleting expenses:", error);
      toast.error(error.response?.data?.message || "Failed to delete expenses");
    }
  }

  const handleDownloadExpenseDetails = async()=>{
    try {
      const response = await axiosInstance.get(API_PATH.EXPENSE.DOWNLOAD_EXPENSE, 
        {
          responseType:"blob"
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "expense_details.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {

      console.error("Error downloading expense details", error);
      toast.error("Failed to download, try again later.")
    }

  };

  useEffect(()=>{
    fetchExpenseDetails();
    const handleUpdate = () => fetchExpenseDetails(true);
    window.addEventListener('app-data-updated', handleUpdate);
    return () => window.removeEventListener('app-data-updated', handleUpdate);
  }, []);

  return (
    <DashboardLayout activeMenu="Expense">
      <div className='my-5 mx-auto'>
        <div className='grid grid-cols-1 gap-6'>
          <div>
            <ExpenseOverview 
            transactions={expenseData}
            onAddExpense={()=>setOpenAddExpenseModal(true)}
            />
          </div>

          <ExpenseList 
          transactions={expenseData}
          onDelete={(id)=>{
            setOpenDeleteAlert({show:true, data:id})
          }}
          onDownload={handleDownloadExpenseDetails}
          onDeleteAll={() => setOpenDeleteByIntervalModal(true)}
          />
        </div>

        <Modal
        isOpen={openAddExpenseModal}
        onClose={()=>{setOpenAddExpenseModal(false)}}
        title="Add Expense"
        >
          <AddExpenseForm onAddExpense={handleAddExpense}/>
        </Modal>

        <Modal
          isOpen={openDeleteAlert.show}
          onClose={()=>{setOpenDeleteAlert({show:false, data:null})}}
          title="Delete Expense"
        >
          <DeleteAlert
          content="Are you sure you want to delete this expense detail"
          onDelete={()=>{deleteExpense(openDeleteAlert.data)}}
          />
        </Modal>
        
        <Modal
          isOpen={openDeleteByIntervalModal}
          onClose={() => setOpenDeleteByIntervalModal(false)}
          title="Delete Expenses by Interval"
        >
          <DeleteByIntervalAlert
            type="expense"
            onDelete={deleteExpenseByInterval}
            onCancel={() => setOpenDeleteByIntervalModal(false)}
          />
        </Modal>
      </div>
    </DashboardLayout>
  )
}

export default Expense
