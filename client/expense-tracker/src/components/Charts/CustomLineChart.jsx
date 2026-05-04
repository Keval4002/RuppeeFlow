import React from 'react'
import { XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from 'recharts'

function CustomLineChart({ data }) {

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: '#111', borderRadius: 12, padding: '8px 14px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#FF3DAC', marginBottom: 4 }}>{payload[0].payload.category}</p>
          <p style={{ fontSize: 13, color: '#fff' }}>
            ₹<span style={{ fontWeight: 700 }}>{Number(payload[0].payload.amount).toFixed(2)}</span>
          </p>
        </div>
      )
    }
    return null;
  }

  return (
    <div style={{ background: 'transparent' }}>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id='expenseGradient' x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor='#FF3DAC' stopOpacity={0.25} />
              <stop offset="95%" stopColor='#FF3DAC' stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid stroke='#EAEEF5' strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#999', fontWeight: 500 }} stroke='none' tickMargin={8} minTickGap={10} angle={window.innerWidth < 600 ? -45 : 0} textAnchor={window.innerWidth < 600 ? "end" : "middle"} />
          <YAxis tick={{ fontSize: 11, fill: '#999' }} stroke='none' />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#FF3DAC40', strokeWidth: 1 }} />

          <Area
            type="monotone"
            dataKey="amount"
            stroke='#FF3DAC'
            fill='url(#expenseGradient)'
            strokeWidth={2.5}
            dot={{ r: 4, fill: "#FF3DAC", strokeWidth: 2, stroke: '#fff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default CustomLineChart