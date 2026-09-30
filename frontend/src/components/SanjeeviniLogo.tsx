import React from 'react';

interface SanjeeviniLogoProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const SanjeeviniLogo: React.FC<SanjeeviniLogoProps> = ({ 
  size = 34, 
  className = '', 
  style = {} 
}) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 64 64" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ borderRadius: `${Math.round(size * 0.22)}px`, flexShrink: 0, display: 'block', ...style }}
    >
      <defs>
        <linearGradient id="sanjeevini_nav_grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
      </defs>
      
      {/* Background Badge */}
      <rect width="64" height="64" rx="14" fill="url(#sanjeevini_nav_grad)" />
      
      {/* Subtle border highlight */}
      <rect x="2" y="2" width="60" height="60" rx="12" fill="none" stroke="#34d399" strokeWidth="1.5" strokeOpacity="0.5" />
      
      {/* Health Cross */}
      <rect x="26" y="14" width="12" height="36" rx="3.5" fill="#ffffff" />
      <rect x="14" y="26" width="36" height="12" rx="3.5" fill="#ffffff" />
      
      {/* Center Vitality Emblem */}
      <circle cx="32" cy="32" r="3.5" fill="#059669" />
    </svg>
  );
};
