import React from 'react'
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import Login from './pages/Auth/Login'
import SignUp from './pages/Auth/SignUp'
import Home from './pages/Dashboard/Home'
import Income from './pages/Dashboard/Income'
import Expense from './pages/Dashboard/Expense'
import InsightsDetails from './pages/Dashboard/InsightsDetails'
import UserProvider from './context/userContext';
import {Toaster} from 'react-hot-toast'

function App() {
  return (
    <UserProvider>
      <div>
        <Router>
          <Routes>
              <Route path="/" element={<Root/>}/>
              <Route path="/login" element={<Login/>}/>
              <Route path='/signUp' element={<SignUp/>}/>
              <Route path='/dashboard' element={<Home/>}/>
              <Route path='/income' element={<Income/>}/>
              <Route path='/expense' element={<Expense/>}/>
              <Route path='/insights' element={<InsightsDetails/>}/>
          </Routes>
        </Router>
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '13px',
            fontWeight: 600,
            borderRadius: '999px',
            padding: '10px 20px',
            background: '#111',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
          },
          success: {
            style: { background: '#C8F73A', color: '#111' },
            iconTheme: { primary: '#111', secondary: '#C8F73A' },
          },
          error: {
            style: { background: '#FF3DAC', color: '#fff' },
            iconTheme: { primary: '#fff', secondary: '#FF3DAC' },
          },
        }}
      />
    </UserProvider>
  )
}

export default App;

const Root=()=>{
  const isAuthenticated = !!localStorage.getItem('token');

  return isAuthenticated?(
    <Navigate to='/dashboard'/>
  ):(
    <Navigate to='/Login'/>
  );
}