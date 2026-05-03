import React from 'react'

const CustomLegend = ({ payload }) => {
  return (
    <div style={{
      display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 10, marginTop: 8
    }}>
      {payload?.map((entry, index) => (
        <div key={index} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: '#F7F8FA', border: '1px solid #EAEEF5',
          borderRadius: 999, padding: '4px 12px',
        }}>
          <div style={{
            width: 10, height: 10, borderRadius: '50%',
            background: entry.color, flexShrink: 0,
          }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: '#555' }}>{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export default CustomLegend;