import React, { useEffect, useState } from 'react'
import CustomBarChart from '../Charts/CustomBarChart'
import { LuPlus } from 'react-icons/lu'
import { preparedIncomeBarChartData } from '../../utils/helper';

function IncomeOverview({ transactions, onAddIncome }) {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const result = preparedIncomeBarChartData(transactions);
    setChartData(result);
    return () => {};
  }, [transactions]);

  return (
    <div className='card animate-fadeSlideUp' style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Lime blob */}
      <div style={{
        position: 'absolute', top: -30, right: -30,
        width: 130, height: 130, borderRadius: '50%',
        background: '#C8F73A', opacity: 0.1,
      }} />
      {/* Yellow pill */}
      <div style={{
        position: 'absolute', bottom: 30, right: -20,
        width: 80, height: 32, borderRadius: 999,
        background: '#FFE600', opacity: 0.13, transform: 'rotate(-20deg)',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', position: 'relative', zIndex: 1 }}>
        <div>
          <h5 style={{ fontSize: 18, fontWeight: 800, color: '#111' }}>Income Overview</h5>
          <p style={{ fontSize: 12, color: '#999', marginTop: 3 }}>Track your earnings over time and analyze income trends.</p>
        </div>

        <button className='add-btn' onClick={onAddIncome}>
          <LuPlus style={{ fontSize: 16 }} />
          Add Income
        </button>
      </div>

      <div style={{ marginTop: 16, position: 'relative', zIndex: 1 }}>
        <CustomBarChart data={chartData} />
      </div>
    </div>
  )
}

export default IncomeOverview