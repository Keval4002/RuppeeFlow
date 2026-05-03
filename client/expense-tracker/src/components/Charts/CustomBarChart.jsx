import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

function CustomBarChart({ data }) {

  const BAR_COLORS = ['#C8F73A', '#FFE600', '#3DBAFF', '#FF3DAC', '#C8F73A', '#FFE600'];

  const getBarColor = (index) => BAR_COLORS[index % BAR_COLORS.length];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: '#111', borderRadius: 12, padding: '8px 14px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#C8F73A', marginBottom: 4 }}>{payload[0].payload.category}</p>
          <p style={{ fontSize: 13, color: '#fff' }}>
            ₹<span style={{ fontWeight: 700 }}>{Number(payload[0].payload.amount).toFixed(2)}</span>
          </p>
        </div>
      )
    }
    return null;
  };

  return (
    <div style={{ background: 'transparent', marginTop: 16 }}>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} barCategoryGap="30%">
          <CartesianGrid stroke='#EAEEF5' strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#999", fontWeight: 500 }} stroke='none' />
          <YAxis tick={{ fontSize: 11, fill: "#999" }} stroke='none' />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(200,247,58,0.07)' }} />
          <Bar dataKey="amount" radius={[10, 10, 4, 4]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={getBarColor(index)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default CustomBarChart