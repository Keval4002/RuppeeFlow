import React from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import CustomToolTip from './CustomToolTip';
import CustomLegend from './CustomLegend';

function CustomPieChart({ data, label, totalAmount, colors, showTextAnchor }) {
  return (
    <ResponsiveContainer width="100%" height={360}>
      <PieChart>
        <Pie
          data={data}
          dataKey="amount"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={130}
          innerRadius={100}
          labelLine={false}
          strokeWidth={3}
          stroke="#F7F8FA"
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={colors[index % colors.length]}
            />
          ))}
        </Pie>
        <Tooltip content={CustomToolTip} />
        <Legend content={CustomLegend} />

        {showTextAnchor && (
          <>
            <text x="50%" y="50%" dy={-20} textAnchor='middle' fill='#999' fontSize="12px" fontWeight="600">
              {label}
            </text>
            <text x="50%" y="50%" dy={10} textAnchor='middle' fill='#111' fontSize="22px" fontWeight="800">
              {totalAmount}
            </text>
          </>
        )}
      </PieChart>
    </ResponsiveContainer>
  )
}

export default CustomPieChart