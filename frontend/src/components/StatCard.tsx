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
    if (trendType === 'positive') return '#34d399';
    if (trendType === 'negative') return '#f87171';
    return 'var(--text-muted)';
  };

  return (
    <div className="glass-panel glass-panel-hover" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          {title}
        </span>
        {icon && (
          <div style={{ color: '#34d399', opacity: 0.9 }}>
            {icon}
          </div>
        )}
      </div>

      <div style={{ fontSize: '1.9rem', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 6 }}>
        {value}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
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
