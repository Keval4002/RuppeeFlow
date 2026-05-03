import React, { useState } from 'react'
import EmojiPicker from "emoji-picker-react"
import { LuImage, LuX } from 'react-icons/lu'

function EmojiPickerPopup({ onSelect, icon }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
      {/* Trigger */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
        onClick={() => setIsOpen(true)}>
        <div style={{
          width: 52, height: 52, borderRadius: 16,
          background: '#F0FBD0', border: '2px dashed #C8F73A',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, color: '#4A6E00', transition: 'border-color 0.2s',
        }}>
          {icon ? (
            <img src={icon} alt="Icon" style={{ width: 40, height: 40, borderRadius: 8 }} />
          ) : <LuImage />}
        </div>

        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>
            {icon ? "Change Icon" : "Pick an Icon"}
          </p>
          <p style={{ fontSize: 11, color: '#999', marginTop: 2 }}>Click to select emoji</p>
        </div>
      </div>

      {/* Picker */}
      {isOpen && (
        <div style={{ position: 'relative', zIndex: 10 }}>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              position: 'absolute', top: -12, right: -12, zIndex: 11,
              width: 28, height: 28, borderRadius: '50%',
              background: '#FF3DAC', color: '#fff',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700,
              boxShadow: '0 2px 8px rgba(255,61,172,0.3)',
            }}
          >
            <LuX size={14} />
          </button>
          <EmojiPicker
            open={isOpen}
            onEmojiClick={(emoji) => { onSelect(emoji?.imageUrl || ""); setIsOpen(false); }}
          />
        </div>
      )}
    </div>
  )
}

export default EmojiPickerPopup