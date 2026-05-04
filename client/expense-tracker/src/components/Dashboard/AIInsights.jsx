import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATH } from '../../utils/apiPath';
import { BsStars } from 'react-icons/bs';

import { useNavigate } from 'react-router-dom';
import { appCache } from '../../utils/dataCache';

function AIInsights() {
  const [summary, setSummary] = useState(appCache.aiSummary || '');
  const [loading, setLoading] = useState(!appCache.aiSummary);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchInsights(force = false) {
      if (!force && appCache.aiSummary) return;
      if (loading && !appCache.aiSummary) setLoading(true);
      try {
        const response = await axiosInstance.get(API_PATH.AI.SUMMARY);
        if (response.data && response.data.summary) {
          setSummary(response.data.summary);
          appCache.aiSummary = response.data.summary;
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
    
    const handleUpdate = () => fetchInsights(true);
    window.addEventListener('app-data-updated', handleUpdate);
    return () => window.removeEventListener('app-data-updated', handleUpdate);
  }, []);

  const formatText = (text) => {
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return { __html: formatted };
  };

  return (
    <div 
      onClick={() => navigate('/insights')}
      style={{
      background: 'linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%)',
      borderRadius: 24, padding: '24px',
      color: '#FFFFFF',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      position: 'relative', overflow: 'hidden',
      cursor: 'pointer'
    }}>
      {/* Decorative blobs */}
      <div style={{
        position: 'absolute', top: -30, right: -30,
        width: 150, height: 150, borderRadius: '50%',
        background: 'linear-gradient(135deg, #FF3DAC 0%, #3DBAFF 100%)',
        opacity: 0.15, filter: 'blur(20px)',
      }} />
      <div style={{
        position: 'absolute', bottom: -50, left: -20,
        width: 120, height: 120, borderRadius: '50%',
        background: '#C8F73A',
        opacity: 0.1, filter: 'blur(15px)',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{
            background: 'linear-gradient(135deg, #FF3DAC, #3DBAFF)',
            padding: 8, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <BsStars style={{ color: '#FFF', fontSize: 20 }} />
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Gullak AI Insights</h2>
        </div>

        {loading ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '20px 0' }}>
            <div className="animate-spin" style={{
              width: 20, height: 20, border: '3px solid rgba(255,255,255,0.2)', borderTopColor: '#C8F73A', borderRadius: '50%'
            }} />
            <span style={{ color: '#AAA', fontSize: 14 }}>Analyzing your financial patterns...</span>
          </div>
        ) : (
          <div 
            style={{ 
              fontSize: 14, lineHeight: 1.6, color: '#E0E0E0', 
              whiteSpace: 'pre-wrap' 
            }}
            dangerouslySetInnerHTML={formatText(summary)}
          />
        )}
      </div>
    </div>
  );
}

export default AIInsights;
