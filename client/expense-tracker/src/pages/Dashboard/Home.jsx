import React, { useEffect, useState, useContext } from 'react'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import useUserAuth from '../../hooks/useUserAuth';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATH } from '../../utils/apiPath';
import InfoCard from '../../components/Cards/InfoCard';
import { IoMdCard } from 'react-icons/io'
import { LuHandCoins, LuWalletMinimal } from 'react-icons/lu';
import { addThousandsSeperator } from '../../utils/helper'
import RecentTransactions from '../../components/Dashboard/RecentTransactions';
import FinanceOverview from '../../components/Dashboard/FinanceOverview';
import ExpenseTransactions from '../../components/Dashboard/ExpenseTransactions'
import Last30DaysExpenses from '../../components/Dashboard/Last30DaysExpenses';
import RecentIncomeWithChart from '../../components/Dashboard/RecentIncomeWithChart';
import RecentIncome from '../../components/Dashboard/RecentIncome';
import AIInsights from '../../components/Dashboard/AIInsights';
import { UserContext } from '../../context/userContext';

import { appCache } from '../../utils/dataCache';

function Home() {
  useUserAuth();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [dashboardData, setDashboardData] = useState(appCache.dashboardData);
  const [loading, setLoading] = useState(false);

  async function fetchDashboardData(force = false) {
    if (!force && appCache.dashboardData) return;
    if (loading) return;
    setLoading(true);
    try {
      const response = await axiosInstance.get(`${API_PATH.DASHBOARD.GET_DATA}`);
      if (response.data) {
        setDashboardData(response.data);
        appCache.dashboardData = response.data;
      }
    } catch (error) {
      console.log("Something went wrong. Please try again later.", error);
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData();
    const handleUpdate = () => fetchDashboardData(true);
    window.addEventListener('app-data-updated', handleUpdate);
    return () => window.removeEventListener('app-data-updated', handleUpdate);
  }, [])

  const last30DayExpenses = dashboardData?.last30DaysExpenses?.transactions || [];
  const recentExpenseFallback = (dashboardData?.recentTransactions || []).filter(t => t.type === "expense");
  const expenseTransactions = last30DayExpenses.length ? last30DayExpenses : recentExpenseFallback;

  const greetHour = new Date().getHours();
  const greeting = greetHour < 12 ? '☀️ Good morning' : greetHour < 17 ? '🌤️ Good afternoon' : '🌙 Good evening';

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div style={{ maxWidth: 1400 }}>

        {/* ── Hero banner ──────────────────────────── */}
        <div style={{
          position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(135deg, #111111 0%, #1A1A1A 100%)',
          borderRadius: 28, padding: '28px 32px', marginBottom: 24,
        }}>
          {/* Art blobs */}
          <div style={{
            position: 'absolute', top: -40, right: -40,
            width: 200, height: 200, borderRadius: '50%',
            background: '#C8F73A', opacity: 0.13,
          }} />
          <div style={{
            position: 'absolute', bottom: -30, right: 120,
            width: 110, height: 110, borderRadius: '50%',
            background: '#FF3DAC', opacity: 0.1,
          }} />
          <div style={{
            position: 'absolute', top: 20, right: 180,
            width: 70, height: 28, borderRadius: 999,
            background: '#FFE600', opacity: 0.14, transform: 'rotate(-15deg)',
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <span style={{
              display: 'inline-block', background: 'rgba(200,247,58,0.15)',
              color: '#C8F73A', borderRadius: 999,
              padding: '4px 14px', fontSize: 12, fontWeight: 700, marginBottom: 12,
              border: '1px solid rgba(200,247,58,0.25)',
            }}>
              {greeting}, {user?.fullName?.split(' ')[0] || 'there'}!
            </span>

            <h1 style={{
              fontSize: 30, fontWeight: 800, color: '#FFFFFF',
              lineHeight: 1.2, marginBottom: 8,
            }}>
              Your financial story,<br />
              <span style={{ color: '#C8F73A' }}>at a glance 📊</span>
            </h1>

            <p style={{ fontSize: 14, color: '#888', maxWidth: 420, lineHeight: 1.7 }}>
              Track every rupee, understand your habits, and grow your savings — all in one place.
            </p>

            {/* Quick action pills */}
            <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/income')} style={{
                background: '#C8F73A', color: '#111', border: 'none',
                borderRadius: 999, padding: '8px 20px', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', boxShadow: '0 4px 16px rgba(200,247,58,0.4)',
                transition: 'transform 0.18s ease',
              }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                + Add Income
              </button>
              <button onClick={() => navigate('/expense')} style={{
                background: '#FF3DAC', color: '#fff', border: 'none',
                borderRadius: 999, padding: '8px 20px', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', boxShadow: '0 4px 16px rgba(255,61,172,0.35)',
                transition: 'transform 0.18s ease',
              }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                + Add Expense
              </button>
            </div>
          </div>
        </div>

        {/* ── AI Insights ────────────────────────────── */}
        <div style={{ marginBottom: 24 }}>
          <AIInsights />
        </div>

        {/* ── Stat cards ───────────────────────────── */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-5' style={{ marginBottom: 24 }}>
          <InfoCard
            icon={<IoMdCard />}
            label={"Total Balance"}
            value={addThousandsSeperator(dashboardData?.totalBalance || 0)}
            color="bg-primary"
          />
          <InfoCard
            icon={<LuWalletMinimal />}
            label={"Total Income"}
            value={addThousandsSeperator(dashboardData?.totalIncome || 0)}
            color="bg-orange-500"
          />
          <InfoCard
            icon={<LuHandCoins />}
            label={"Total Expense"}
            value={addThousandsSeperator(dashboardData?.totalExpenses || 0)}
            color="bg-red-500"
          />
        </div>

        {/* ── Dashboard widgets ────────────────────── */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
          <RecentTransactions
            transactions={dashboardData?.recentTransactions || []}
            onSeeMore={() => navigate("/expense")}
          />
          <FinanceOverview
            totalBalance={dashboardData?.totalBalance || 0}
            totalIncome={dashboardData?.totalIncome || 0}
            totalExpenses={dashboardData?.totalExpenses || 0}
          />
          <ExpenseTransactions
            transactions={expenseTransactions}
            onSeeMore={() => navigate("/expense")}
          />
          <Last30DaysExpenses data={last30DayExpenses} />
          <RecentIncomeWithChart
            data={dashboardData?.last60DaysIncome?.transactions?.slice(0, 4) || []}
            totalIncome={dashboardData?.totalIncome || 0}
          />
          <RecentIncome
            transactions={dashboardData?.last60DaysIncome?.transactions || []}
            onSeeMore={() => navigate("/income")}
          />
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Home