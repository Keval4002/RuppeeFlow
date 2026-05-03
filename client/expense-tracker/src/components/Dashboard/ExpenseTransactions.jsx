import React from 'react'
import { LuArrowRight } from 'react-icons/lu'
import TransactionInfoCard from '../Cards/TransactionInfoCard'
import moment from 'moment'

function ExpenseTransactions({ transactions, onSeeMore }) {
  return (
    <div className='card animate-fadeSlideUp'>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div>
          <h5 style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>Expenses</h5>
          <p style={{ fontSize: 11, color: '#999', marginTop: 2 }}>Recent spending breakdown</p>
        </div>
        <button className='card-btn' onClick={onSeeMore}>
          See All <LuArrowRight style={{ fontSize: 14 }} />
        </button>
      </div>
      <div>
        {transactions?.slice(0, 5)?.map(expense => (
          <TransactionInfoCard
            key={expense._id}
            title={expense.category}
            icon={expense.icon}
            date={moment(expense.date).format("Do MMM YYYY")}
            amount={expense.amount}
            type="expense"
            hideDeleteBtn
          />
        ))}
        {(!transactions || transactions.length === 0) && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#bbb' }}>
            <span style={{ fontSize: 32 }}>🧾</span>
            <p style={{ marginTop: 8, fontSize: 13 }}>No expenses recorded</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ExpenseTransactions