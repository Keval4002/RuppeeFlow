import React, { useState, useEffect } from 'react'
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi"
import SideMenu from './SideMenu'

function Navbar({ activeMenu }) {
  const [openMenu, setOpenMenu] = useState(false);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (openMenu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [openMenu]);

  return (
    <>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        background: '#FFFFFF',
        borderBottom: '1.5px solid #EAEEF5',
        padding: '14px 28px',
        position: 'sticky', top: 0, zIndex: 30,
        backdropFilter: 'blur(12px)',
      }}>
        {/* Rainbow top-bar accent */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: 'linear-gradient(90deg, #C8F73A, #FFE600, #FF3DAC, #3DBAFF)',
        }} />

        {/* Mobile hamburger — visible only below lg (1024px) */}
        <button
          className='block lg:hidden'
          style={{ color: '#111', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 0 }}
          onClick={() => setOpenMenu(true)}
          aria-label="Open navigation menu"
        >
          <HiOutlineMenu style={{ fontSize: 24 }} />
        </button>

        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, #C8F73A 0%, #FFE600 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, boxShadow: '0 3px 12px rgba(200,247,58,0.4)',
            animation: 'bounceBadge 2.5s ease-in-out infinite',
          }}>
            🪙
          </div>
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 800, fontSize: 20, color: '#111',
            letterSpacing: '-0.5px',
          }}>
            Ruppeeflow
          </span>
        </div>
      </div>

      {/* ── Mobile Navigation Modal (< 1024 px) ── */}
      {openMenu && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(6px)',
            animation: 'navModalBgIn 0.22s ease both',
          }}
          onClick={() => setOpenMenu(false)}
        >
          <div
            style={{
              width: '88%', maxWidth: 360,
              background: '#FFFFFF',
              borderRadius: 24,
              boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
              border: '1.5px solid #EAEEF5',
              overflow: 'hidden',
              animation: 'navModalIn 0.28s cubic-bezier(0.22,1,0.36,1) both',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Rainbow stripe */}
            <div style={{
              height: 4,
              background: 'linear-gradient(90deg, #C8F73A, #FFE600, #FF3DAC, #3DBAFF)',
            }} />

            {/* Modal header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px 12px',
              borderBottom: '1px solid #EAEEF5',
            }}>
              <span style={{ fontWeight: 800, fontSize: 16, color: '#111', fontFamily: "'DM Sans', sans-serif" }}>
                Navigation
              </span>
              <button
                onClick={() => setOpenMenu(false)}
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: '#F4F6FA', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#555', fontSize: 16, lineHeight: 0,
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#FFE4F5'}
                onMouseLeave={e => e.currentTarget.style.background = '#F4F6FA'}
                aria-label="Close navigation menu"
              >
                <HiOutlineX style={{ fontSize: 18 }} />
              </button>
            </div>

            {/* Embed SideMenu — pass onNavigate to close modal after navigation */}
            <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <SideMenu
                activeMenu={activeMenu}
                isMobile={true}
                onNavigate={() => setOpenMenu(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Keyframe animations injected once */}
      <style>{`
        @keyframes navModalBgIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes navModalIn {
          from { opacity: 0; transform: scale(0.92) translateY(16px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
      `}</style>
    </>
  )
}

export default Navbar