import React from 'react'

/* Color map for each card type */
const CARD_THEMES = {
  lime:   { bg: 'linear-gradient(135deg, #F0FBD0 0%, #E6F9B0 100%)', accent: '#C8F73A', text: '#4A6E00', shadow: 'rgba(200,247,58,0.25)' },
  yellow: { bg: 'linear-gradient(135deg, #FFF9CC 0%, #FFF3A0 100%)', accent: '#FFE600', text: '#8A6E00', shadow: 'rgba(255,230,0,0.25)' },
  pink:   { bg: 'linear-gradient(135deg, #FFE4F5 0%, #FFD0EE 100%)', accent: '#FF3DAC', text: '#C00080', shadow: 'rgba(255,61,172,0.2)' },
  blue:   { bg: 'linear-gradient(135deg, #E0F5FF 0%, #C8EDFF 100%)', accent: '#3DBAFF', text: '#005E8A', shadow: 'rgba(61,186,255,0.2)' },
};

function InfoCard({ icon, label, color, value }) {
  /* Map old bg class names → theme keys */
  const themeMap = {
    'bg-primary':    'lime',
    'bg-orange-500': 'yellow',
    'bg-red-500':    'pink',
    'bg-blue-500':   'blue',
  };
  const theme = CARD_THEMES[themeMap[color] || 'lime'];

  return (
    <div className='pill-card animate-fadeSlideUp' style={{
      background: theme.bg,
      border: `1.5px solid ${theme.accent}30`,
      boxShadow: `0 4px 24px ${theme.shadow}`,
    }}>
      {/* Decorative blob */}
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 100, height: 100, borderRadius: '50%',
        background: theme.accent, opacity: 0.12,
      }} />
      <div style={{
        position: 'absolute', bottom: -14, right: 24,
        width: 56, height: 56, borderRadius: '50%',
        background: theme.accent, opacity: 0.09,
      }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative', zIndex: 1 }}>
        {/* Icon pill */}
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: theme.accent, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 22, color: '#111',
          boxShadow: `0 4px 16px ${theme.shadow}`,
          flexShrink: 0,
        }}>
          {icon}
        </div>

        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: theme.text, marginBottom: 4, opacity: 0.8 }}>{label}</p>
          <p style={{ fontSize: 24, fontWeight: 800, color: '#111', lineHeight: 1 }}>₹ {value}</p>
        </div>
      </div>
    </div>
  )
}

export default InfoCard