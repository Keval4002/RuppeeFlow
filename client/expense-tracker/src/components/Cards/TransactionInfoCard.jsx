import React, { useState, useRef, useEffect } from 'react'
import { LuUtensils, LuTrendingUp, LuTrendingDown, LuTrash2, LuCheck, LuX } from 'react-icons/lu'
import { formatAmountINR } from '../../utils/helper'

function TransactionInfoCard({ title, icon, date, amount, type, hideDeleteBtn, onDelete, onClick, onAmountUpdate, id }) {

  const isIncome = type === "income";
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef(null);

  const badgeStyle = isIncome
    ? { background: '#F0FBD0', color: '#4A6E00', border: '1px solid #C8F73A40' }
    : { background: '#FFE4F5', color: '#C00080', border: '1px solid #FF3DAC40' };

  const isEmoji = (str) => {
    if (!str) return false;
    const emojiRegex = /^[\p{Emoji_Presentation}]+$/u;
    return emojiRegex.test(str) || /^[\uD800-\uDBFF][\uDC00-\uDFFF]$/.test(str);
  }

  const handleAmountClick = (e) => {
    e.stopPropagation();
    if (!onAmountUpdate) return; // not editable if no handler
    setEditValue(Number(amount).toString());
    setEditing(true);
  };

  const handleSave = (e) => {
    e.stopPropagation();
    const newAmount = parseFloat(editValue);
    if (!editValue || isNaN(newAmount) || newAmount <= 0) {
      setEditing(false);
      return;
    }
    if (newAmount !== Number(amount)) {
      onAmountUpdate(id, newAmount);
    }
    setEditing(false);
  };

  const handleCancel = (e) => {
    e.stopPropagation();
    setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave(e);
    if (e.key === 'Escape') handleCancel(e);
  };

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

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

          {editing ? (
            /* Inline edit mode */
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '3px 6px', borderRadius: 999,
              ...badgeStyle, fontSize: 12, fontWeight: 700,
            }}
              onClick={e => e.stopPropagation()}
            >
              <span style={{ fontSize: 12 }}>₹</span>
              <input
                ref={inputRef}
                type="number"
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{
                  width: 80, border: 'none', outline: 'none',
                  background: 'transparent', color: 'inherit',
                  fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
                  MozAppearance: 'textfield',
                }}
                min="0.01"
                step="0.01"
              />
              <button onClick={handleSave} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#4A6E00', padding: 2, display: 'flex',
              }}>
                <LuCheck size={14} />
              </button>
              <button onClick={handleCancel} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#C00080', padding: 2, display: 'flex',
              }}>
                <LuX size={14} />
              </button>
            </div>
          ) : (
            /* Display mode */
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 10px', borderRadius: 999,
                ...badgeStyle, fontSize: 12, fontWeight: 700,
                cursor: onAmountUpdate ? 'pointer' : 'default',
                transition: 'box-shadow 0.2s ease',
              }}
              onClick={handleAmountClick}
              onMouseEnter={e => { if (onAmountUpdate) e.currentTarget.style.boxShadow = '0 0 0 2px ' + (isIncome ? '#C8F73A60' : '#FF3DAC40'); }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
              title={onAmountUpdate ? 'Click to edit amount' : ''}
            >
              {isIncome ? '+' : '-'} ₹{formatAmountINR(amount)}
              {isIncome ? <LuTrendingUp size={13} /> : <LuTrendingDown size={13} />}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TransactionInfoCard