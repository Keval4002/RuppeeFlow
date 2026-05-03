import React from 'react'
import { LuUtensils, LuTrendingUp, LuTrendingDown, LuTrash2 } from 'react-icons/lu'

function TransactionInfoCard({ title, icon, date, amount, type, hideDeleteBtn, onDelete, onClick }) {

  const isIncome = type === "income";

  const badgeStyle = isIncome
    ? { background: '#F0FBD0', color: '#4A6E00', border: '1px solid #C8F73A40' }
    : { background: '#FFE4F5', color: '#C00080', border: '1px solid #FF3DAC40' };

  const isEmoji = (str) => {
    if (!str) return false;
    const emojiRegex = /^[\p{Emoji_Presentation}]+$/u;
    return emojiRegex.test(str) || /^[\uD800-\uDBFF][\uDC00-\uDFFF]$/.test(str);
  }

  return (
    <div className='group relative' style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 12px', borderRadius: 16, marginTop: 6,
      transition: 'background 0.2s ease',
      cursor: onClick ? 'pointer' : 'default'
    }}
      onMouseEnter={e => e.currentTarget.style.background = '#F7F8FA'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      onClick={onClick}
    >
      {/* Icon circle */}
      <div style={{
        width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
        background: isIncome ? '#F0FBD0' : '#FFE4F5',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20,
      }}>
        {icon ? (
          isEmoji(icon)
            ? <span style={{ fontSize: 20 }}>{icon}</span>
            : <img src={icon} alt={title} style={{ width: 22, height: 22 }}
              onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<span style="font-size:18px">💰</span>'; }}
            />
        ) : <LuUtensils />}
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, minWidth: 0 }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</p>
          <p style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{date}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {!hideDeleteBtn && (
            <button
              style={{
                color: '#ccc', background: 'none', border: 'none', cursor: 'pointer',
                opacity: 0, transition: 'opacity 0.2s ease, color 0.2s ease',
                padding: 4,
              }}
              className='group-hover:!opacity-100'
              onMouseEnter={e => e.currentTarget.style.color = '#FF3DAC'}
              onMouseLeave={e => e.currentTarget.style.color = '#ccc'}
              onClick={(e) => {
                e.stopPropagation();
                if (onDelete) onDelete(e);
              }}
            >
              <LuTrash2 size={15} />
            </button>
          )}

          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '5px 10px', borderRadius: 999,
            ...badgeStyle, fontSize: 12, fontWeight: 700,
          }}>
            {isIncome ? '+' : '-'} ₹{Number(amount).toFixed(2)}
            {isIncome ? <LuTrendingUp size={13} /> : <LuTrendingDown size={13} />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TransactionInfoCard