import React from 'react'
import { LuDownload } from 'react-icons/lu'
import TransactionInfoCard from '../Cards/TransactionInfoCard'
import moment from 'moment'
import useUserAuth from '../../hooks/useUserAuth'


function ExpenseList({transactions, onDelete, onDownload, onDeleteAll}) {

    useUserAuth();
  return (
    <div className='card'>
        <div className="flex items-center justify-between">
            <h5 className='text-lg'>Expense Categories</h5>

            <div className='flex gap-2'>
                <button className='card-btn' onClick={onDownload}>
                    <LuDownload /> Download
                </button>
                {onDeleteAll && (
                    <button className='card-btn' onClick={onDeleteAll} style={{color: '#FA2C37'}}>
                        🗑️ Delete All
                    </button>
                )}
            </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2'>
            {transactions?.map(expense=>{
                return (
                    <TransactionInfoCard 
                    key={expense._id}
                    title={expense.category}
                    icon={expense.icon}
                    date={moment(expense.date).format("Do MMM YYYY")}
                    amount={expense.amount}
                    type="expense"
                    onDelete={()=>{onDelete(expense._id)}}
                    />
                )
            })}
        </div>
    </div>
  )
}

export default ExpenseList
