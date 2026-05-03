import React, { useState } from 'react'
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi"
import SideMenu from './SideMenu'

function Navbar({ activeMenu }) {
  const [openSideMenu, setOpenSideMenu] = useState(false);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16,
      background: '#FFFFFF',
      borderBottom: '1.5px solid #EAEEF5',
      padding: '14px 28px',
      position: 'sticky', top: 0, zIndex: 30,
      backdropFilter: 'blur(12px)',
    }}>
      {/* Mobile hamburger */}
      <button
        className='block lg:hidden'
        style={{ color: '#111', background: 'none', border: 'none', cursor: 'pointer' }}
        onClick={() => setOpenSideMenu(!openSideMenu)}
      >
        {openSideMenu
          ? <HiOutlineX style={{ fontSize: 24 }} />
          : <HiOutlineMenu style={{ fontSize: 24 }} />
        }
      </button>

      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Gullak coin icon */}
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
          Gullak
        </span>
      </div>

      {/* Rainbow top-bar accent */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: 'linear-gradient(90deg, #C8F73A, #FFE600, #FF3DAC, #3DBAFF)',
        borderRadius: '0 0 0 0',
      }} />

      {/* Mobile slide-down menu */}
      <div 
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${openSideMenu ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setOpenSideMenu(false)}
      >
        <div 
          className={`fixed inset-y-0 left-0 bg-white w-64 transform transition-transform duration-300 ease-in-out ${openSideMenu ? 'translate-x-0' : '-translate-x-full'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <SideMenu activeMenu={activeMenu} isMobile={true} />
        </div>
      </div>
    </div>
  )
}

export default Navbar