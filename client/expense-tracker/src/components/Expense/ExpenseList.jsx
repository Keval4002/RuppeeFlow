import React, { useState, useMemo, useEffect } from 'react'
import { LuDownload } from 'react-icons/lu'
import TransactionInfoCard from '../Cards/TransactionInfoCard'
import moment from 'moment'
import useUserAuth from '../../hooks/useUserAuth'
import Modal from '../Modal'

function ExpenseList({ transactions, onDelete, onDownload, onDeleteAll }) {
  useUserAuth();

  const [selectedGroupKey, setSelectedGroupKey] = useState(null);

  const groupedExpenses = useMemo(() => {
    if (!Array.isArray(transactions)) return {};
    return transactions.reduce((acc, current) => {
      const key = current?.category || 'Unknown';
      if (!acc[key]) {
        acc[key] = {
          key,
          category: key,
          icon: current?.icon,
          amount: 0,
          transactions: []
        }
      }
      acc[key].amount += (current?.amount || 0);
      acc[key].transactions.push(current);
      return acc;
    }, {});
  }, [transactions]);

  const groupedArray = Object.values(groupedExpenses);
  const selectedGroup = selectedGroupKey ? groupedExpenses[selectedGroupKey] : null;

  useEffect(() => {
    if (selectedGroupKey && !groupedExpenses[selectedGroupKey]) {
      setSelectedGroupKey(null);
    }
  }, [groupedExpenses, selectedGroupKey]);

  return (
    <>
      <div className='card animate-fadeSlideUp' style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Pink blob art */}
        <div style={{
          position: 'absolute', top: -20, left: -20,
          width: 70, height: 70, borderRadius: '50%',
          background: '#FF3DAC', opacity: 0.08,
        }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', position: 'relative', zIndex: 1 }}>
          <div>
            <h5 style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>Expense Categories</h5>
            <p style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{groupedArray.length} categories</p>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className='card-btn' onClick={onDownload}>
              <LuDownload /> Download
            </button>
            {onDeleteAll && (
              <button className='card-btn' onClick={onDeleteAll}
                style={{ color: '#FF3DAC', borderColor: '#FF3DAC30' }}
                onMouseEnter={e => e.currentTarget.style.background = '#FFE4F5'}
                onMouseLeave={e => e.currentTarget.style.background = '#F9F9F9'}
              >
                🗑️ Delete All
              </button>
            )}
          </div>
        </div>

        <div style={{ marginTop: 8, position: 'relative', zIndex: 1 }}>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
            {groupedArray.map(group => (
              <TransactionInfoCard
                key={group.key}
                title={group.category}
                icon={group.icon}
                date={`${group?.transactions?.length || 0} transaction(s)`}
                amount={group.amount}
                type="expense"
                hideDeleteBtn={true}
                onClick={() => setSelectedGroupKey(group.key)}
              />
            ))}
          </div>
          {groupedArray.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#bbb' }}>
              <span style={{ fontSize: 40 }}>🛍️</span>
              <p style={{ marginTop: 8, fontSize: 13 }}>No expenses recorded yet</p>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={!!selectedGroup} onClose={() => setSelectedGroupKey(null)} title={`${selectedGroup?.category || 'Group'} Transactions`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '60vh', overflowY: 'auto' }}>
          {selectedGroup?.transactions?.map(expense => (
            <TransactionInfoCard
              key={expense._id}
              title={expense.category}
              icon={expense.icon}
              date={moment(expense.date).format("Do MMM YYYY")}
              amount={expense.amount}
              type="expense"
              onDelete={() => onDelete(expense._id)}
            />
          ))}
        </div>
      </Modal>
    </>
  )
}

export default ExpenseList
