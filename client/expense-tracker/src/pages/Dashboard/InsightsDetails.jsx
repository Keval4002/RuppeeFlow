import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { appCache } from '../../utils/dataCache';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATH } from '../../utils/apiPath';
import { BsActivity, BsLightningCharge, BsGraphUpArrow, BsGraphDownArrow, BsStars } from 'react-icons/bs';
import { FaHeartbeat, FaChartLine } from 'react-icons/fa';

function InsightsDetails() {
  const [contextData, setContextData] = useState(appCache.semanticContext);
  const [summary, setSummary] = useState(appCache.aiSummary || '');
  const [loading, setLoading] = useState(!appCache.semanticContext || !appCache.aiSummary);

  useEffect(() => {
    async function fetchData() {
      try {
        if (!appCache.semanticContext) {
          const ctxRes = await axiosInstance.get(API_PATH.AI.CONTEXT);
          if (ctxRes.data?.context) {
            setContextData(ctxRes.data.context);
            appCache.semanticContext = ctxRes.data.context;
          }
        }
        if (!appCache.aiSummary) {
          const sumRes = await axiosInstance.get(API_PATH.AI.SUMMARY);
          if (sumRes.data?.summary) {
            setSummary(sumRes.data.summary);
            appCache.aiSummary = sumRes.data.summary;
          }
        }
      } catch (err) {
        console.error("Failed to fetch insights", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const formatText = (text) => {
    if (!text) return { __html: "" };
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return { __html: formatted };
  };

  const getHealthColor = (score) => {
    if (score < 40) return '#FF4D4D';
    if (score < 70) return '#FFAE42';
    return '#C8F73A';
  };

  const { behavioural = {}, comparative = {}, macro = {}, largestTransactionsMtd = [] } = contextData || {};
  const healthScore = behavioural.financialHealthScore ?? 0;
  const momDelta = comparative.momSpendDeltaPercentage ?? 0;
  const habits = behavioural.habitualSpends || [];
  
  const activeSavingsRate = (macro.incomeMtd === 0 && macro.expenseMtd === 0) ? macro.savingsRateYtd : macro.savingsRateMtd;

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div style={{ maxWidth: 1000, margin: '0 auto', color: '#fff' }}>
        <h1 style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 24, color: '#C8F73A' }}>
          Your Financial Insights Explained
        </h1>
        
        {loading ? (
          <div>Loading insights...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* AI Summary Block */}
            <div style={{
              background: '#1A1A1A', borderRadius: 20, padding: 24,
              border: '1px solid #333'
            }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 20, marginBottom: 16 }}>
                <BsStars color="#FF3DAC" /> Semantic AI Analysis
              </h2>
              <div 
                style={{ fontSize: 15, lineHeight: 1.6, color: '#E0E0E0', whiteSpace: 'pre-wrap', marginBottom: 20 }}
                dangerouslySetInnerHTML={formatText(summary)}
              />
              <div style={{ fontSize: 14, color: '#aaa', background: '#222', padding: 16, borderRadius: 12 }}>
                <strong style={{ color: '#fff', fontSize: 16, display: 'block', marginBottom: 8 }}>How did the AI know this?</strong>
                <p style={{ marginBottom: 8 }}>The AI reads your transactions just like a human accountant would. Instead of just looking at raw numbers, it looked at your real-world activities.</p>
                <ul style={{ listStyle: 'disc', paddingLeft: 20, marginTop: 8 }}>
                    {largestTransactionsMtd.length > 0 && (
                        <li>It noticed your biggest transaction this month was <strong>₹{largestTransactionsMtd[0]?.amount}</strong> for <strong>{largestTransactionsMtd[0]?.categoryOrSource}</strong>.</li>
                    )}
                    <li>It checked if you spent more or less than last month (Spend Velocity).</li>
                    <li>It compared your monthly habits to your yearly totals to see if you are staying on track.</li>
                </ul>
              </div>
            </div>

            {/* Financial Health Block */}
            <div style={{
              background: '#1A1A1A', borderRadius: 20, padding: 24,
              border: '1px solid #333'
            }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 20, marginBottom: 16 }}>
                <FaHeartbeat color="#C8F73A" /> Financial Health Score: {healthScore}/100
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
                <div style={{
                    width: 80, height: 80, borderRadius: '50%',
                    background: `conic-gradient(${getHealthColor(healthScore)} ${healthScore}%, #333 ${healthScore}%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                    <div style={{ width: 66, height: 66, borderRadius: '50%', background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 'bold' }}>
                        {healthScore}
                    </div>
                </div>
                <p style={{ flex: 1, fontSize: 16, color: '#ccc', lineHeight: 1.5 }}>
                  Think of this score like a report card for your wallet. A score of 100 means you are saving lots of money and keeping your spending low. A lower score means you are spending too fast or earning less than you spend.
                </p>
              </div>

              <div style={{ fontSize: 14, color: '#aaa', background: '#222', padding: 16, borderRadius: 12 }}>
                <strong style={{ color: '#fff', fontSize: 16, display: 'block', marginBottom: 12 }}>Here is exactly how your {healthScore} score was calculated:</strong>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', paddingBottom: 8 }}>
                        <span>1. <strong>Starting Baseline</strong>: Everyone starts with an average score.</span>
                        <span style={{ color: '#fff' }}>50 points</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', paddingBottom: 8 }}>
                        <span>
                            2. <strong>Your Savings Rate</strong>: You saved <strong>{activeSavingsRate}%</strong> of your income. <br/>
                            <span style={{ fontSize: 12, color: '#888' }}>
                                {activeSavingsRate > 20 ? "(Saving over 20% is excellent! We added 20 points.)" : 
                                 activeSavingsRate > 0 ? "(You saved some money, which is good! We added 10 points.)" : 
                                 "(You spent more than you earned. We deducted 20 points.)"}
                            </span>
                        </span>
                        <span style={{ color: activeSavingsRate > 0 ? '#C8F73A' : '#FF4D4D' }}>
                            {activeSavingsRate > 20 ? '+20 points' : activeSavingsRate > 0 ? '+10 points' : '-20 points'}
                        </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8 }}>
                        <span>
                            3. <strong>Your Spending Control</strong>: Your spending {momDelta > 0 ? 'increased' : 'decreased'} by <strong>{momDelta}%</strong> compared to last month. <br/>
                            <span style={{ fontSize: 12, color: '#888' }}>
                                {momDelta < 0 ? "(Spending less than last month is great! We added 10 points.)" : 
                                 momDelta > 20 ? "(Your spending spiked by more than 20%. We deducted 15 points.)" : 
                                 "(Your spending was stable. No points changed.)"}
                            </span>
                        </span>
                        <span style={{ color: momDelta < 0 ? '#C8F73A' : (momDelta > 20 ? '#FF4D4D' : '#fff') }}>
                            {momDelta < 0 ? '+10 points' : (momDelta > 20 ? '-15 points' : '0 points')}
                        </span>
                    </div>
                </div>
              </div>
            </div>

            {/* Spend Velocity & Habits Block */}
            <div style={{
              background: '#1A1A1A', borderRadius: 20, padding: 24,
              border: '1px solid #333'
            }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 20, marginBottom: 16 }}>
                <FaChartLine color="#3DBAFF" /> Spend Velocity & Habit Tracking
              </h2>
              
              <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', marginBottom: 24 }}>
                <div>
                  <h3 style={{ fontSize: 15, color: '#AAA', marginBottom: 8 }}>Month-over-Month Speed</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {momDelta > 0 ? <BsGraphUpArrow color="#FF4D4D" size={24}/> : <BsGraphDownArrow color="#C8F73A" size={24}/>}
                      <span style={{ fontSize: 28, fontWeight: 'bold', color: momDelta > 0 ? '#FF4D4D' : '#C8F73A' }}>
                          {momDelta > 0 ? '+' : ''}{momDelta}% 
                      </span>
                  </div>
                </div>
                
                {habits.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: 15, color: '#AAA', marginBottom: 8 }}>Your Top Detected Habit</h3>
                    <div style={{ fontSize: 20, color: '#fff', fontWeight: 'bold' }}>
                      {habits[0].category} <span style={{color:'#888', fontWeight: 'normal', fontSize: 16}}>({habits[0].frequency} transactions)</span>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ fontSize: 14, color: '#aaa', background: '#222', padding: 16, borderRadius: 12 }}>
                <strong style={{ color: '#fff', fontSize: 16, display: 'block', marginBottom: 12 }}>What does this mean for you?</strong>
                <p style={{ marginBottom: 12 }}>
                    <strong>Spend Velocity</strong> simply means: "Are you spending money faster or slower than last month?" <br/><br/>
                    If the number is <span style={{color: '#FF4D4D'}}>Red (+)</span>, you are spending more. If it is <span style={{color: '#C8F73A'}}>Green (-)</span>, you are successfully cutting back on expenses.
                </p>
                <p>
                    <strong>Habit Tracking</strong> looks at how <em>often</em> you buy things, not just how much they cost. If you buy coffee 20 times a month, the system detects it as a habit. Our system noticed you spend quite often on <strong>{habits.length > 0 ? habits[0].category : "certain categories"}</strong>.
                </p>
              </div>
            </div>

          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default InsightsDetails;
