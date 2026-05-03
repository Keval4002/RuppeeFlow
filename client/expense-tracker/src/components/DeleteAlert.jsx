import React from 'react'

function DeleteAlert({ content, onDelete }) {
  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        background: '#FFF9CC', border: '1px solid #FFE600',
        borderRadius: 16, padding: '14px 16px', marginBottom: 20,
      }}>
        <span style={{ fontSize: 22, flexShrink: 0 }}>⚠️</span>
        <p style={{ fontSize: 14, color: '#6A5000', lineHeight: 1.6 }}>{content}</p>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type='button'
          onClick={onDelete}
          style={{
            background: '#FF3DAC',
            color: '#fff',
            border: 'none',
            borderRadius: 999,
            padding: '10px 24px',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(255,61,172,0.35)',
            transition: 'transform 0.18s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          Delete
        </button>
      </div>
    </div>
  )
}

export default DeleteAlert