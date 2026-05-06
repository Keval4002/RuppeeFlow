import React, { useState, useMemo, useEffect } from 'react'
import { LuDownload } from 'react-icons/lu'
import TransactionInfoCard from '../Cards/TransactionInfoCard'
import moment from 'moment'
import useUserAuth from '../../hooks/useUserAuth'
import Modal from '../Modal'

function IncomeList({ transactions, onDelete, onDownload, onDeleteAll, onAmountUpdate }) {
  useUserAuth();

  const [selectedGroupKey, setSelectedGroupKey] = useState(null);

  const groupedIncomes = useMemo(() => {
    if (!Array.isArray(transactions)) return {};
    return transactions.reduce((acc, current) => {
      const key = current?.source || 'Unknown';
      if (!acc[key]) {
        acc[key] = {
          key,
          source: key,
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

  const groupedArray = Object.values(groupedIncomes);
  const selectedGroup = selectedGroupKey ? groupedIncomes[selectedGroupKey] : null;

  useEffect(() => {
    if (selectedGroupKey && !groupedIncomes[selectedGroupKey]) {
      setSelectedGroupKey(null);
    }
  }, [groupedIncomes, selectedGroupKey]);

  return (
    <>
      <div className='card animate-fadeSlideUp' style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Art: small floating blobs */}
        <div style={{
          position: 'absolute', top: -20, left: -20,
          width: 70, height: 70, borderRadius: '50%',
          background: '#C8F73A', opacity: 0.1,
        }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', position: 'relative', zIndex: 1 }}>
          <div>
            <h5 style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>Income Sources</h5>
            <p style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{groupedArray.length} categories</p>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className='card-btn' onClick={onDownload}>
              <LuDownload /> Download
            </button>
            {onDeleteAll && (
              <button className='card-btn' onClick={onDeleteAll}
                style={{ color: '#FF3DAC', borderColor: '#FF3DAC30' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#FFE4F5'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#F9F9F9'; }}
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
                title={group.source}
                icon={group.icon}
                date={`${group?.transactions?.length || 0} transaction(s)`}
                amount={group.amount}
                type="income"
                hideDeleteBtn={true}
                onClick={() => setSelectedGroupKey(group.key)}
              />
            ))}
          </div>
          {groupedArray.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#bbb' }}>
              <span style={{ fontSize: 40 }}>💳</span>
              <p style={{ marginTop: 8, fontSize: 13 }}>Add your first income source</p>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={!!selectedGroup} onClose={() => setSelectedGroupKey(null)} title={`${selectedGroup?.source || 'Group'} Transactions`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '60vh', overflowY: 'auto' }}>
          {selectedGroup?.transactions?.map(income => (
            <TransactionInfoCard
              key={income._id}
              id={income._id}
              title={income.source}
              icon={income.icon}
              date={moment(income.date).format("Do MMM YYYY")}
              amount={income.amount}
              type="income"
              onDelete={() => onDelete(income._id)}
              onAmountUpdate={onAmountUpdate}
            />
          ))}
        </div>
      </Modal>
    </>
  )
}

export default IncomeList