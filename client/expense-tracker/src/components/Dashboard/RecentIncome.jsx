import React from 'react'
import { LuArrowRight } from 'react-icons/lu'
import TransactionInfoCard from '../Cards/TransactionInfoCard'
import moment from 'moment'

function RecentIncome({ transactions, onSeeMore }) {
  return (
    <div className='card animate-fadeSlideUp'>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div>
          <h5 style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>Recent Income</h5>
          <p style={{ fontSize: 11, color: '#999', marginTop: 2 }}>Latest 60 days earnings</p>
        </div>
        <button className='card-btn' onClick={onSeeMore}>
          See All <LuArrowRight style={{ fontSize: 14 }} />
        </button>
      </div>

      <div style={{ marginTop: 8 }}>
        {transactions?.slice(0, 5)?.map((item) => (
          <TransactionInfoCard
            key={item._id}
            title={item.source}
            icon={item.icon}
            date={moment(item.date).format("Do MMM YYYY")}
            amount={item.amount}
            type="income"
            hideDeleteBtn
          />
        ))}
        {(!transactions || transactions.length === 0) && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#bbb' }}>
            <span style={{ fontSize: 32 }}>💸</span>
            <p style={{ marginTop: 8, fontSize: 13 }}>No income recorded yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default RecentIncome;