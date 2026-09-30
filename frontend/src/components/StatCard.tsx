import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  trendType = 'neutral',
  icon,
}) => {
  const getTrendColor = () => {
    if (trendType === 'positive') return 'var(--emerald)';
    if (trendType === 'negative') return 'var(--danger)';
    return 'var(--text-muted)';
  };

  return (
    <div className="glass-panel" style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          {title}
        </span>
        {icon && (
          <div style={{ color: 'var(--text-muted)' }}>
            {icon}
          </div>
        )}
      </div>

      <div style={{ fontSize: '1.7rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4, color: 'var(--text-main)' }}>
        {value}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
        {subtitle && <span style={{ color: 'var(--text-muted)' }}>{subtitle}</span>}
        {trend && (
          <span style={{ color: getTrendColor(), fontWeight: 600 }}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
};
