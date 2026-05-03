import React, { useState } from 'react'
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa6'

function Input({ value, onChange, label, type, placeHolder }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div style={{ marginBottom: 4 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 6 }}>
        {label}
      </label>
      <div className='input-box'>
        <input
          type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
          placeholder={placeHolder}
          style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 14, color: '#111', width: '100%' }}
          value={value || ""}
          onChange={(e) => onChange(e)}
        />
        {type === "password" && (
          <>
            {showPassword ? (
              <FaRegEye size={20} style={{ color: '#C8F73A', cursor: 'pointer', flexShrink: 0 }} onClick={() => setShowPassword(false)} />
            ) : (
              <FaRegEyeSlash size={20} style={{ color: '#bbb', cursor: 'pointer', flexShrink: 0 }} onClick={() => setShowPassword(true)} />
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Input