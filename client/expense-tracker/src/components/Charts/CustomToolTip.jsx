import React from 'react'
import { formatAmountINR } from '../../utils/helper'

const CustomToolTip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#111',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: '8px 14px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
      }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#C8F73A', marginBottom: 4 }}>
          {payload[0].name}
        </p>
        <p style={{ fontSize: 13, color: '#fff' }}>
          ₹ <span style={{ fontWeight: 700 }}>{formatAmountINR(payload[0].value)}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default CustomToolTip;