import React, { useState, useEffect } from 'react'
import CustomPieChart from '../Charts/CustomPieChart';

const COLORS = ["#C8F73A", "#FF3DAC", "#FFE600", "#3DBAFF"]

function RecentIncomeWithChart({ data, totalIncome }) {
  const [chartData, setChartData] = useState([]);

  const prepareChartData = () => {
    const dataArr = data?.map((item) => ({
      name: item?.source,
      amount: item?.amount
    }));
    setChartData(dataArr);
  };

  useEffect(() => {
    prepareChartData();
    return () => {};
  }, [data])

  return (
    <div className='card animate-fadeSlideUp' style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Lime blob art */}
      <div style={{
        position: 'absolute', top: -24, left: -24,
        width: 100, height: 100, borderRadius: '50%',
        background: '#C8F73A', opacity: 0.1,
      }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
        <div>
          <h5 style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>Last 60 Days Income</h5>
          <p style={{ fontSize: 11, color: '#999', marginTop: 2 }}>Income sources breakdown</p>
        </div>
        <span style={{
          background: '#F0FBD0', color: '#4A6E00',
          borderRadius: 999, padding: '4px 12px', fontSize: 11, fontWeight: 700,
        }}>💰 Earnings</span>
      </div>

      <CustomPieChart
        data={chartData}
        label="Total Income"
        totalAmount={`₹${totalIncome}`}
        showTextAnchor
        colors={COLORS}
      />
    </div>
  )
}

export default RecentIncomeWithChart