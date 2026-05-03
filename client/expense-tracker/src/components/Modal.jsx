import React from 'react'

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      background: 'rgba(0,0,0,0.25)',
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        position: 'relative', width: '100%', maxWidth: 560,
        margin: '0 16px', maxHeight: '90vh', overflowY: 'auto',
        animation: 'fadeSlideUp 0.3s cubic-bezier(0.22, 1, 0.36, 1) both',
      }}>
        <div style={{
          background: '#FFFFFF',
          borderRadius: 28,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          border: '1.5px solid #EAEEF5',
          overflow: 'hidden',
        }}>
          {/* Rainbow top stripe */}
          <div style={{
            height: 4,
            background: 'linear-gradient(90deg, #C8F73A, #FFE600, #FF3DAC, #3DBAFF)',
          }} />

          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '20px 24px 16px',
            borderBottom: '1px solid #EAEEF5',
          }}>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#111' }}>{title}</h3>

            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: '#F4F6FA', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#666', fontSize: 14, transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#FFE4F5'}
              onMouseLeave={e => e.currentTarget.style.background = '#F4F6FA'}
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '20px 24px 24px' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Modal