import React, { useEffect, useState } from 'react'
import { preparedExpenseBarChartData } from '../../utils/helper';
import CustomBarChart from '../Charts/CustomBarChart';

function Last30DaysExpenses({ data }) {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const result = preparedExpenseBarChartData(data);
    setChartData(result);
    return () => {};
  }, [data]);

  return (
    <div className='card col-span-1 animate-fadeSlideUp' style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Decorative pill blob */}
      <div style={{
        position: 'absolute', top: -16, right: -10,
        width: 80, height: 36, borderRadius: 999,
        background: '#FF3DAC', opacity: 0.1, transform: 'rotate(-15deg)',
      }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4, position: 'relative', zIndex: 1 }}>
        <div>
          <h5 style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>Last 30 Days</h5>
          <p style={{ fontSize: 11, color: '#999', marginTop: 2 }}>Expense trends</p>
        </div>
        <span style={{
          background: '#FFE4F5', color: '#C00080',
          borderRadius: 999, padding: '4px 12px', fontSize: 11, fontWeight: 700,
        }}>💸 Spending</span>
      </div>

      {chartData.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#bbb' }}>
          <span style={{ fontSize: 40 }}>🎉</span>
          <p style={{ marginTop: 8, fontSize: 13 }}>No expenses in 30 days!</p>
        </div>
      ) : (
        <CustomBarChart data={chartData} />
      )}
    </div>
  )
}

export default Last30DaysExpenses