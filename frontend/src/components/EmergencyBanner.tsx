import React from 'react';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HealthAlert } from '../types';

interface EmergencyBannerProps {
  alerts: HealthAlert[];
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({ alerts }) => {
  if (!alerts || alerts.length === 0) return null;
  const topAlert = alerts[0];

  return (
    <div
      style={{
        background: 'linear-gradient(90deg, hsla(28, 95%, 45%, 0.25), hsla(4, 78%, 45%, 0.25))',
        borderBottom: '1px solid hsla(28, 95%, 55%, 0.4)',
        padding: '8px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.825rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, maxWidth: '85%' }}>
        <AlertCircle size={16} color="#fb923c" style={{ flexShrink: 0 }} />
        <span>
          <strong style={{ color: '#fb923c', marginRight: 6 }}>
            [EPIDEMIOLOGICAL SURGE ALERT - {topAlert.district?.toUpperCase()}, {topAlert.state?.toUpperCase()}]:
          </strong>
          {topAlert.title} — {topAlert.description}
        </span>
      </div>

      <Link
        to="/logistics"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          color: '#fb923c',
          textDecoration: 'none',
          fontWeight: 600,
          whiteSpace: 'nowrap',
        }}
      >
        <span>Deploy Redistribution</span>
        <ArrowRight size={14} />
      </Link>
    </div>
  );
};
