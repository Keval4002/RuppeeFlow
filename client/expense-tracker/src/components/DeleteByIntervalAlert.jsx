import React, { useState } from 'react'

function DeleteByIntervalAlert({ type = 'expense', onDelete, onCancel }) {
  const [selectedInterval, setSelectedInterval] = useState('day')
  const [loading, setLoading] = useState(false)

  const intervals = [
    { value: 'day',   label: 'Past Day (24 hours)',   description: 'Delete records from the last 24 hours', emoji: '🕐' },
    { value: 'month', label: 'Past Month (30 days)',  description: 'Delete records from the last 30 days',  emoji: '📅' },
    { value: 'all',   label: 'All Time',              description: 'Delete ALL records — cannot be undone!', emoji: '🗑️' },
  ]

  const handleDelete = async () => {
    setLoading(true)
    try { await onDelete(selectedInterval) }
    catch (error) { console.error('Delete error:', error) }
    finally { setLoading(false) }
  }

  const typeLabel = type === 'expense' ? 'Expenses' : 'Income'
  const isAllTime = selectedInterval === 'all'

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20 }}>
        <span style={{ fontSize: 28, flexShrink: 0 }}>🗂️</span>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#111', marginBottom: 4 }}>Delete {typeLabel}</h3>
          <p style={{ fontSize: 13, color: '#777' }}>Select the time interval. This action cannot be undone.</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {intervals.map((interval) => {
          const isSelected = selectedInterval === interval.value;
          return (
            <label key={interval.value} style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              padding: '12px 16px', borderRadius: 16, cursor: 'pointer',
              border: `2px solid ${isSelected ? '#C8F73A' : '#EAEEF5'}`,
              background: isSelected ? '#F0FBD0' : '#FAFAFA',
              transition: 'all 0.2s ease',
            }}>
              <input
                type='radio'
                name='interval'
                value={interval.value}
                checked={isSelected}
                onChange={(e) => setSelectedInterval(e.target.value)}
                style={{ marginTop: 2, accentColor: '#C8F73A' }}
              />
              <span style={{ fontSize: 18, flexShrink: 0 }}>{interval.emoji}</span>
              <div>
                <p style={{ fontWeight: 700, color: '#111', fontSize: 13 }}>{interval.label}</p>
                <p style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{interval.description}</p>
              </div>
            </label>
          )
        })}
      </div>

      {isAllTime && (
        <div style={{
          marginBottom: 20, padding: '12px 16px',
          background: '#FFE4F5', border: '1.5px solid #FF3DAC40', borderRadius: 16,
          display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: 18 }}>⚠️</span>
          <p style={{ fontSize: 13, color: '#C00080', fontWeight: 600 }}>
            This will permanently delete ALL {typeLabel.toLowerCase()} records!
          </p>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <button
          type='button'
          onClick={onCancel}
          disabled={loading}
          style={{
            padding: '10px 22px', borderRadius: 999, fontSize: 13, fontWeight: 600,
            border: '1.5px solid #EAEEF5', background: '#fff', color: '#555',
            cursor: 'pointer', transition: 'background 0.2s',
          }}
        >
          Cancel
        </button>
        <button
          type='button'
          onClick={handleDelete}
          disabled={loading}
          style={{
            padding: '10px 22px', borderRadius: 999, fontSize: 13, fontWeight: 700,
            border: 'none', cursor: 'pointer',
            background: isAllTime ? '#FF3DAC' : '#C8F73A',
            color: isAllTime ? '#fff' : '#111',
            boxShadow: isAllTime ? '0 4px 16px rgba(255,61,172,0.3)' : '0 4px 16px rgba(200,247,58,0.35)',
            opacity: loading ? 0.7 : 1,
            transition: 'transform 0.18s ease',
          }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          {loading ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  )
}

export default DeleteByIntervalAlert
