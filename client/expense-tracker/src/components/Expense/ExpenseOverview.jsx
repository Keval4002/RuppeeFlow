import React, { useEffect, useState } from 'react'
import { LuPlus } from 'react-icons/lu';
import { preparedExpenseLineChartData } from '../../utils/helper';
import CustomLineChart from '../Charts/CustomLineChart'

function ExpenseOverview({ transactions, onAddExpense }) {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const result = preparedExpenseLineChartData(transactions);
    setChartData(result);
  }, [transactions]);

  return (
    <div className='card animate-fadeSlideUp' style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Pink blob art */}
      <div style={{
        position: 'absolute', top: -30, right: -30,
        width: 130, height: 130, borderRadius: '50%',
        background: '#FF3DAC', opacity: 0.09,
      }} />
      {/* Pink pill */}
      <div style={{
        position: 'absolute', bottom: 40, left: -15,
        width: 70, height: 28, borderRadius: 999,
        background: '#FF3DAC', opacity: 0.11, transform: 'rotate(15deg)',
      }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
        <div>
          <h5 style={{ fontSize: 18, fontWeight: 800, color: '#111' }}>Expense Overview</h5>
          <p style={{ fontSize: 12, color: '#999', marginTop: 3 }}>Track spending trends and gain insight on where money goes.</p>
        </div>

        <button className='add-btn' onClick={onAddExpense}
          style={{
            background: '#FF3DAC',
            boxShadow: '0 4px 16px rgba(255,61,172,0.35)',
          }}
        >
          <LuPlus style={{ fontSize: 16 }} />
          Add Expense
        </button>
      </div>

      <div style={{ marginTop: 16, position: 'relative', zIndex: 1 }}>
        <CustomLineChart data={chartData} />
      </div>
    </div>
  )
}

export default ExpenseOverview