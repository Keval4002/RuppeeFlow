import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import useUserAuth from '../../hooks/useUserAuth';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATH } from '../../utils/apiPath';
import { BsStars } from 'react-icons/bs';

function Insights() {
  useUserAuth();
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInsights() {
      try {
        // Fix the endpoint to point to /api/v1/ai/summary
        const response = await axiosInstance.get(API_PATH.AI.SUMMARY);
        if (response.data && response.data.summary) {
          setSummary(response.data.summary);
        } else {
          setSummary("No insights available at the moment. Add more transactions to generate insights!");
        }
      } catch (error) {
        console.error("Failed to fetch AI insights:", error);
        setSummary("Failed to generate financial insights. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    fetchInsights();
    
    const handleUpdate = () => fetchInsights();
    window.addEventListener('app-data-updated', handleUpdate);
    return () => window.removeEventListener('app-data-updated', handleUpdate);
  }, []);

  const formatText = (text) => {
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return { __html: formatted };
  };

  return (
    <DashboardLayout activeMenu="Insights">
      <div style={{ maxWidth: 1400 }}>
        {/* ── Hero banner ──────────────────────────── */}
        <div style={{
          position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(135deg, #111111 0%, #1A1A1A 100%)',
          borderRadius: 28, padding: '28px 32px', marginBottom: 24,
        }}>
          <div style={{
            position: 'absolute', top: -40, right: -40,
            width: 200, height: 200, borderRadius: '50%',
            background: 'linear-gradient(135deg, #FF3DAC 0%, #3DBAFF 100%)',
            opacity: 0.15, filter: 'blur(20px)',
          }} />
          <div style={{
            position: 'absolute', bottom: -30, right: 120,
            width: 110, height: 110, borderRadius: '50%',
            background: '#C8F73A', opacity: 0.1, filter: 'blur(15px)',
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(200,247,58,0.15)',
              color: '#C8F73A', borderRadius: 999,
              padding: '6px 14px', fontSize: 12, fontWeight: 700, marginBottom: 16,
              border: '1px solid rgba(200,247,58,0.25)',
            }}>
              <BsStars style={{ fontSize: 14 }} /> Gullak Intelligence
            </span>

            <h1 style={{
              fontSize: 30, fontWeight: 800, color: '#FFFFFF',
              lineHeight: 1.2, marginBottom: 8,
            }}>
              Your Financial <br />
              <span style={{ color: '#C8F73A' }}>Insights & Summary ✨</span>
            </h1>

            <p style={{ fontSize: 14, color: '#888', maxWidth: 420, lineHeight: 1.7 }}>
              Deep dive into your financial health. Our AI analyzes your habits to bring you actionable advice.
            </p>
          </div>
        </div>

        {/* ── Insights Card ────────────────────────────── */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: 24, padding: '32px',
          color: '#111',
          boxShadow: '0 8px 32px rgba(0,0,0,0.03)',
          border: '1px solid #EAEEF5',
          position: 'relative', overflow: 'hidden',
        }}>
          {loading ? (
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '40px 0', justifyContent: 'center' }}>
              <div className="animate-spin" style={{
                width: 28, height: 28, border: '3px solid rgba(0,0,0,0.1)', borderTopColor: '#C8F73A', borderRadius: '50%'
              }} />
              <span style={{ color: '#555', fontSize: 16, fontWeight: 500 }}>Analyzing your financial patterns...</span>
            </div>
          ) : (
            <div 
              style={{ 
                fontSize: 16, lineHeight: 1.8, color: '#333', 
                whiteSpace: 'pre-wrap', maxWidth: 800 
              }}
              dangerouslySetInnerHTML={formatText(summary)}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Insights;
