import React, { useContext } from 'react'
import { UserContext } from '../../context/userContext';
import Navbar from './Navbar'
import SideMenu from './SideMenu'
import AIChat from '../Dashboard/AIChat'

function DashboardLayout({ activeMenu, children }) {
  const { user } = useContext(UserContext);
  return (
    <div style={{ minHeight: '100vh', background: '#F7F8FA' }}>
      <Navbar activeMenu={activeMenu} />

      {user && (
        <div style={{ display: 'flex' }}>
          <div className='hidden lg:block'>
            <SideMenu activeMenu={activeMenu} />
          </div>

          <div style={{ flex: 1, padding: '24px 28px', maxWidth: 1400 }}>
            {children}
          </div>
        </div>
      )}
      <AIChat />
    </div>
  )
}

export default DashboardLayout