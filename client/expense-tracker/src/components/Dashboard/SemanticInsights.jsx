import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATH } from '../../utils/apiPath';
import { useNavigate } from 'react-router-dom';
import { BsActivity, BsLightningCharge, BsGraphUpArrow, BsGraphDownArrow } from 'react-icons/bs';
import { appCache } from '../../utils/dataCache';

function SemanticInsights() {
  const [contextData, setContextData] = useState(appCache.semanticContext);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchContext(force = false) {
      if (!force && appCache.semanticContext) return;
      if (loading) return;
      setLoading(true);
      try {
        const response = await axiosInstance.get(API_PATH.AI.CONTEXT);
        if (response.data && response.data.context) {
          setContextData(response.data.context);
          appCache.semanticContext = response.data.context;
        }
      } catch (error) {
        console.error("Failed to fetch AI context:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchContext();
    
    const handleUpdate = () => fetchContext(true);
    window.addEventListener('app-data-updated', handleUpdate);
    return () => window.removeEventListener('app-data-updated', handleUpdate);
  }, []);

  if (loading) return null;
  if (!contextData) return null;

  const { behavioural = {}, comparative = {} } = contextData;
  const healthScore = behavioural.financialHealthScore ?? 0;
  const momDelta = comparative.momSpendDeltaPercentage ?? 0;
  const habits = behavioural.habitualSpends || [];

  const getHealthColor = (score) => {
    if (score < 40) return '#FF4D4D';
    if (score < 70) return '#FFAE42';
    return '#C8F73A';
  };

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-5 mb-6'>
      
      {/* Financial Health Score */}
      <div 
        onClick={() => navigate('/insights')}
        style={{
        background: '#1A1A1A',
        borderRadius: 24, padding: '24px',
        color: '#FFFFFF',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center', gap: 20,
        cursor: 'pointer'
      }}>
        <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: `conic-gradient(${getHealthColor(healthScore)} ${healthScore}%, #333 ${healthScore}%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{ width: 66, height: 66, borderRadius: '50%', background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 'bold' }}>
                {healthScore}
            </div>
        </div>
        <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#AAA' }}>Financial Health</h3>
            <p style={{ fontSize: 14, color: '#E0E0E0', marginTop: 4 }}>
                {healthScore >= 70 ? "Excellent standing! You're managing well." : 
                 healthScore >= 40 ? "Fair condition. Watch your spending habits." : 
                 "Needs attention. Consider reviewing your budgets."}
            </p>
        </div>
      </div>

      {/* MoM Delta and Habits */}
      <div 
        onClick={() => navigate('/insights')}
        style={{
        background: '#1A1A1A',
        borderRadius: 24, padding: '24px',
        color: '#FFFFFF',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        position: 'relative', overflow: 'hidden',
        cursor: 'pointer'
      }}>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#AAA' }}>Spend Velocity</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                    {momDelta > 0 ? <BsGraphUpArrow color="#FF4D4D" /> : <BsGraphDownArrow color="#C8F73A" />}
                    <span style={{ fontSize: 20, fontWeight: 'bold', color: momDelta > 0 ? '#FF4D4D' : '#C8F73A' }}>
                        {momDelta > 0 ? '+' : ''}{momDelta}% 
                    </span>
                    <span style={{ fontSize: 14, color: '#888' }}>vs last month</span>
                </div>
            </div>
            {habits.length > 0 && (
                <div className="sm:text-right">
                    <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: '#AAA' }}><BsActivity style={{display:'inline', marginRight:4}}/> Top Habit</h3>
                    <p style={{ fontSize: 14, color: '#E0E0E0', marginTop: 4 }}>
                        {habits[0].category} ({habits[0].frequency}x)
                    </p>
                </div>
            )}
        </div>
      </div>

    </div>
  );
}

export default SemanticInsights;
