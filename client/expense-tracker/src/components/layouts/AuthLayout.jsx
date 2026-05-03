import React from 'react'
import { LuTrendingUpDown } from 'react-icons/lu'

/* ── Playful floating pill / blob decorations ─────────────── */
function PlayfulBg() {
  return (
    <>
      {/* Large lime blob top-right */}
      <div className="art-blob animate-blobPulse"
        style={{ width: 320, height: 320, background: '#C8F73A', top: -60, right: -80, zIndex: 0 }} />
      {/* Pink pill mid-left */}
      <div className="art-pill animate-pillFloat"
        style={{ width: 120, height: 50, background: '#FF3DAC', opacity: 0.18, top: '38%', left: -30, zIndex: 0 }} />
      {/* Yellow pill bottom-right */}
      <div className="art-pill animate-pillFloat"
        style={{ width: 90, height: 36, background: '#FFE600', opacity: 0.22, bottom: '18%', right: 30, zIndex: 0, animationDelay: '1.5s' }} />
      {/* Small blue circle */}
      <div className="art-pill"
        style={{ width: 44, height: 44, background: '#3DBAFF', opacity: 0.2, bottom: '40%', left: '20%', borderRadius: '50%', zIndex: 0 }} />
      {/* Tiny lime pill */}
      <div className="art-pill animate-pillFloat"
        style={{ width: 60, height: 24, background: '#C8F73A', opacity: 0.22, top: '55%', right: '15%', zIndex: 0, animationDelay: '3s' }} />
    </>
  )
}

function AuthLayout({ children }) {
  return (
    <div className='flex min-h-screen'>
      {/* ── Left: form panel ──────────────────── */}
      <div className='w-screen md:w-[58vw] min-h-screen bg-white flex flex-col px-10 pt-10 pb-12 relative overflow-hidden'>
        {/* Subtle lime shimmer stripe */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 4,
          background: 'linear-gradient(90deg, #C8F73A, #FFE600, #FF3DAC, #3DBAFF, #C8F73A)',
          backgroundSize: '300% 100%',
          animation: 'shimmer 4s linear infinite',
        }} />

        <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: '-0.5px' }}>
          <span style={{ color: '#111' }}>Gullak</span>
          <span style={{
            display: 'inline-block', marginLeft: 6, width: 10, height: 10,
            background: '#C8F73A', borderRadius: '50%', verticalAlign: 'middle',
            animation: 'bounceBadge 2s ease-in-out infinite',
          }} />
        </h2>

        <div className='flex-1 flex flex-col justify-center'>
          {children}
        </div>
      </div>

      {/* ── Right: art panel ──────────────────── */}
      <div className='hidden md:flex w-[42vw] min-h-screen relative overflow-hidden flex-col items-center justify-center'
        style={{ background: 'linear-gradient(145deg, #0D0D0D 0%, #1A1A1A 100%)' }}>
        <PlayfulBg />

        {/* Hero content */}
        <div className='relative z-10 text-center px-10 animate-fadeSlideUp'>
          <div style={{
            display: 'inline-block', background: '#C8F73A', borderRadius: 999,
            padding: '8px 20px', fontSize: 13, fontWeight: 700, color: '#111',
            marginBottom: 24, letterSpacing: 0.5,
          }}>
            🪙 Your Money. Your Story.
          </div>

          <h1 style={{
            fontFamily: "'DM Sans', sans-serif", fontWeight: 800,
            fontSize: 42, lineHeight: 1.1, color: '#FFFFFF', marginBottom: 16,
          }}>
            Track money.<br />
            <span style={{ color: '#C8F73A' }}>Grow wealth.</span>
          </h1>

          <p style={{ color: '#888', fontSize: 15, lineHeight: 1.7, marginBottom: 36 }}>
            Effortlessly manage income, expenses,<br />
            and understand your financial story.
          </p>

          {/* Stat pill cards */}
          <StatusInfoCard
            icon={<LuTrendingUpDown size={20} />}
            label='Track your Income & Expenses'
            value='₹43,00,000'
            accent='#C8F73A'
          />
        </div>

        {/* Decorative grid of pill shapes at bottom */}
        <div className='absolute bottom-8 left-0 right-0 flex justify-center gap-3 px-6 z-10'>
          {['Savings', 'Investments', 'Bills', 'Food', 'Travel'].map((tag, i) => (
            <span key={i} style={{
              background: i % 2 === 0 ? 'rgba(200,247,58,0.15)' : 'rgba(255,61,172,0.13)',
              color: i % 2 === 0 ? '#C8F73A' : '#FF3DAC',
              border: `1px solid ${i % 2 === 0 ? '#C8F73A40' : '#FF3DAC40'}`,
              borderRadius: 999, padding: '5px 14px', fontSize: 11, fontWeight: 600,
            }}>{tag}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AuthLayout

function StatusInfoCard({ icon, label, value, accent }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(255,255,255,0.07)',
      border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20,
      padding: '16px 20px', backdropFilter: 'blur(12px)',
    }}>
      <div style={{
        width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: accent, borderRadius: '50%', color: '#111', fontSize: 20, flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ textAlign: 'left' }}>
        <p style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>{label}</p>
        <span style={{ fontSize: 22, fontWeight: 700, color: '#FFF' }}>{value}</span>
      </div>
    </div>
  )
}