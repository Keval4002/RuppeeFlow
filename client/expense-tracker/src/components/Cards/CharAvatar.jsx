import React from 'react'
import { getInitials } from '../../utils/helper'

function CharAvatar({ fullName, width, height, style }) {
  return (
    <div
      style={{
        width: width ? undefined : 48,
        height: height ? undefined : 48,
        background: 'linear-gradient(135deg, #C8F73A 0%, #FFE600 100%)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#111',
        fontWeight: 800,
        fontSize: style ? undefined : 18,
      }}
      className={`${width || ''} ${height || ''} ${style || ''}`}
    >
      {getInitials(fullName || "")}
    </div>
  )
}

export default CharAvatar