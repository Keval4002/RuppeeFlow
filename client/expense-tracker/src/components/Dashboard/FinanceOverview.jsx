import React from 'react'
import CustomPieChart from '../Charts/CustomPieChart'
import { addThousandsSeperator } from '../../utils/helper'

const COLORS = ['#C8F73A', '#FF3DAC', '#FFE600']

function FinanceOverview({ totalBalance, totalIncome, totalExpenses }) {
  const balanceData = [
    { name: "Total Balance", amount: Number(totalBalance).toFixed(2) },
    { name: "Total Income",  amount: Number(totalIncome).toFixed(2) },
    { name: "Total Expense", amount: Number(totalExpenses).toFixed(2) },
  ]

  return (
    <div className='card animate-fadeSlideUp' style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Playful blob art */}
      <div style={{
        position: 'absolute', top: -30, right: -30,
        width: 120, height: 120, borderRadius: '50%',
        background: '#C8F73A', opacity: 0.08,
      }} />
      <div style={{
        position: 'absolute', bottom: -20, left: -20,
        width: 80, height: 80, borderRadius: '50%',
        background: '#FF3DAC', opacity: 0.07,
      }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
        <div>
          <h5 style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>Financial Overview</h5>
          <p style={{ fontSize: 11, color: '#999', marginTop: 2 }}>Balance · Income · Expense</p>
        </div>
        <span style={{
          background: '#F0FBD0', color: '#4A6E00', borderRadius: 999,
          padding: '4px 12px', fontSize: 11, fontWeight: 700,
        }}>📊 Live</span>
      </div>

      <CustomPieChart
        data={balanceData}
        label="Total Balance"
        totalAmount={addThousandsSeperator(totalBalance)}
        colors={COLORS}
        showTextAnchor
      />
    </div>
  )
}

export default FinanceOverview