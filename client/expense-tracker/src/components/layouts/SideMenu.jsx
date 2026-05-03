import React, { useState, useContext } from 'react'
import { SIDE_MENU_DATA } from '../../utils/data'
import { UserContext } from '../../context/userContext'
import { useNavigate } from "react-router-dom";
import CharAvatar from '../../components/Cards/CharAvatar'
import ExcelUploadModal from './ExcelUploadModal'
import { clearAppCache } from '../../utils/dataCache'

function SideMenu({ activeMenu, isMobile }) {
  const { user, clearUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [showExcelModal, setShowExcelModal] = useState(null);

  const handleClick = (route) => {
    if (route === "logout") { handleLogout(); return; }
    if (route === "import-excel") { setShowExcelModal('combined'); return; }
    navigate(route);
  }

  const handleLogout = () => {
    localStorage.clear();
    clearUser();
    navigate("/login");
  }

  return (
    <>
      <div style={{
        width: 256, height: isMobile ? '100%' : 'calc(100vh - 61px)',
        background: '#FFFFFF',
        borderRight: '1.5px solid #EAEEF5',
        padding: '24px 16px',
        position: isMobile ? 'static' : 'sticky', top: isMobile ? 0 : 61, zIndex: 20,
        overflowY: 'auto',
      }}>
        {/* User profile section */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 10, marginBottom: 28,
        }}>
          {/* Avatar with lime ring */}
          <div style={{
            padding: 3, borderRadius: '50%',
            background: 'linear-gradient(135deg, #C8F73A, #FFE600)',
            boxShadow: '0 4px 16px rgba(200,247,58,0.35)',
          }}>
            {user?.profileImageUrl ? (
              <img
                src={user?.profileImageUrl || ""}
                alt="ProfileImage"
                style={{ width: 72, height: 72, borderRadius: '50%', border: '3px solid #fff', display: 'block' }}
              />
            ) : (
              <div style={{ border: '3px solid #fff', borderRadius: '50%', overflow: 'hidden' }}>
                <CharAvatar fullName={user?.fullName} width="w-[72px]" height="h-[72px]" style="text-xl" />
              </div>
            )}
          </div>

          <div style={{ textAlign: 'center' }}>
            <p style={{ fontWeight: 700, fontSize: 15, color: '#111', marginBottom: 2 }}>
              {user?.fullName || ""}
            </p>
            {/* Decorative pill tag */}
            <span style={{
              display: 'inline-block', background: '#F0FBD0', color: '#5A8000',
              borderRadius: 999, padding: '2px 12px', fontSize: 11, fontWeight: 600,
            }}>
              💰 Gullak Member
            </span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: '#EAEEF5', marginBottom: 16 }} />

        {/* Menu items */}
        {SIDE_MENU_DATA.map((item, index) => {
          const isActive = activeMenu === item.label;
          return (
            <button
              key={`menu_${index}`}
              onClick={() => handleClick(item.path)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                fontSize: 14, fontWeight: isActive ? 700 : 500,
                padding: '11px 16px', borderRadius: 16, marginBottom: 6,
                background: isActive ? '#C8F73A' : 'transparent',
                color: isActive ? '#111' : '#555',
                border: 'none', cursor: 'pointer',
                boxShadow: isActive ? '0 4px 16px rgba(200,247,58,0.35)' : 'none',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = '#F7FCE8'; e.currentTarget.style.color = '#111'; } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#555'; } }}
            >
              <item.icon style={{ fontSize: 18, flexShrink: 0 }} />
              {item.label}
            </button>
          )
        })}


      </div>

      {showExcelModal && (
        <ExcelUploadModal
          type={showExcelModal}
          onClose={() => setShowExcelModal(null)}
          onSuccess={() => { 
            setShowExcelModal(null); 
            clearAppCache();
            window.dispatchEvent(new Event('app-data-updated')); 
          }}
        />
      )}
    </>
  )
}

export default SideMenu