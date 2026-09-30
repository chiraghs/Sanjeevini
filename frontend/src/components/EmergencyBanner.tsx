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
        background: '#7c2d12',
        borderBottom: '1px solid #9a3412',
        color: '#ffedd5',
        padding: '7px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.8rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, maxWidth: '85%' }}>
        <AlertCircle size={15} color="#fdba74" style={{ flexShrink: 0 }} />
        <span>
          <strong style={{ color: '#fed7aa', marginRight: 6 }}>
            [SURVEILLANCE ALERT - {topAlert.district?.toUpperCase()}, {topAlert.state?.toUpperCase()}]:
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
          color: '#ffffff',
          textDecoration: 'none',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          fontSize: '0.75rem',
          background: 'rgba(255, 255, 255, 0.15)',
          padding: '3px 8px',
          borderRadius: 4
        }}
      >
        <span>Redistribution Protocol</span>
        <ArrowRight size={13} />
      </Link>
    </div>
  );
};
