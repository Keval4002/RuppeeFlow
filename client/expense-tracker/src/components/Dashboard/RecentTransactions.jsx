import React from 'react'
import { LuArrowRight } from 'react-icons/lu'
import TransactionInfoCard from '../Cards/TransactionInfoCard'
import moment from 'moment'

function RecentTransactions({ transactions, onSeeMore }) {
  return (
    <div className='card animate-fadeSlideUp'>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div>
          <h5 style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>Recent Transactions</h5>
          <p style={{ fontSize: 11, color: '#999', marginTop: 2 }}>Your latest financial activity</p>
        </div>
        <button className='card-btn' onClick={onSeeMore}>
          See All <LuArrowRight />
        </button>
      </div>

      <div style={{ marginTop: 8 }}>
        {transactions?.slice(0, 5)?.map(item => (
          <TransactionInfoCard
            key={item._id || item.id}
            title={item.type === "expense" ? item.category : item.source}
            icon={item.icon}
            date={moment(item.date).format("Do MMM YYYY")}
            amount={item.amount}
            type={item.type}
            hideDeleteBtn
          />
        ))}
        {(!transactions || transactions.length === 0) && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#bbb' }}>
            <span style={{ fontSize: 32 }}>📭</span>
            <p style={{ marginTop: 8, fontSize: 13 }}>No transactions yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default RecentTransactions