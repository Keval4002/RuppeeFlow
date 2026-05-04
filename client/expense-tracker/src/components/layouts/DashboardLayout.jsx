import React, { useContext, useEffect, useState } from 'react'
import { UserContext } from '../../context/userContext';
import Navbar from './Navbar'
import SideMenu from './SideMenu'
import AIChat from '../Dashboard/AIChat'

function DashboardLayout({ activeMenu, children }) {
  const { user } = useContext(UserContext);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const showSidebar = windowWidth >= 1024;

  return (
    <div style={{ minHeight: '100vh', background: '#F7F8FA' }}>
      <Navbar activeMenu={activeMenu} />

      {user && (
        <div style={{ display: 'flex' }}>
          {showSidebar && (
            <div className='hidden lg:block'>
              <SideMenu activeMenu={activeMenu} />
            </div>
          )}

          <div style={{ flex: 1, padding: '24px 28px', paddingBottom: '100px', maxWidth: 1400, overflowX: 'hidden' }}>
            {children}
          </div>
        </div>
      )}
      <AIChat />
    </div>
  )
}

export default DashboardLayout