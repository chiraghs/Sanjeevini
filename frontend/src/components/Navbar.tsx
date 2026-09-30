import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { 
  ShieldCheck, 
  MapPin, 
  RefreshCw, 
  Building2, 
  Camera, 
  Mic, 
  Network, 
  Sun, 
  Moon, 
  AlertTriangle 
} from 'lucide-react';

interface NavbarProps {
  activeRole: string;
  setActiveRole: (role: string) => void;
  alertsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeRole, setActiveRole, alertsCount = 4 }) => {
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  const navLinks = [
    { path: '/', label: t('nav_national'), icon: <ShieldCheck size={18} /> },
    { path: '/map', label: t('nav_map'), icon: <MapPin size={18} /> },
    { path: '/logistics', label: t('nav_logistics'), icon: <RefreshCw size={18} /> },
    { path: '/phc', label: t('nav_phc'), icon: <Building2 size={18} /> },
    { path: '/scan', label: t('nav_scan'), icon: <Camera size={18} /> },
    { path: '/voice', label: t('nav_voice'), icon: <Mic size={18} /> },
    { path: '/federated', label: t('nav_federated'), icon: <Network size={18} /> },
  ];

  return (
    <header className="glass-panel" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none', position: 'sticky', top: 0, zIndex: 1000, padding: '10px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 1440, margin: '0 auto' }}>
        
        {/* Brand */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: 'inherit' }}>
          <div style={{ 
            width: 40, 
            height: 40, 
            borderRadius: 10, 
            background: 'linear-gradient(135deg, hsl(150, 70%, 40%), hsl(222, 70%, 45%))', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '1.4rem' 
          }}>
            🌿
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #34d399, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {t('app_name')}
              </span>
              <span className="badge badge-stable" style={{ fontSize: '0.65rem' }}>AI RESILIENCE</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              MoHFW Federated Health Supply Chain
            </div>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: '0.825rem',
                  fontWeight: isActive ? 600 : 500,
                  textDecoration: 'none',
                  color: isActive ? '#34d399' : 'var(--text-muted)',
                  background: isActive ? 'hsla(150, 70%, 42%, 0.14)' : 'transparent',
                  border: isActive ? '1px solid hsla(150, 70%, 42%, 0.3)' : '1px solid transparent',
                  transition: 'all 0.15s ease'
                }}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          
          {/* Active Alerts Pill */}
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div className="badge badge-emergency" style={{ cursor: 'pointer', padding: '5px 10px', fontSize: '0.75rem' }}>
              <AlertTriangle size={14} />
              <span>{alertsCount} Outbreaks Active</span>
            </div>
          </Link>

          {/* Role Switcher */}
          <select
            value={activeRole}
            onChange={(e) => setActiveRole(e.target.value)}
            style={{
              background: 'var(--bg-app)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-card)',
              borderRadius: 6,
              padding: '5px 8px',
              fontSize: '0.78rem',
              cursor: 'pointer'
            }}
          >
            <option value="national">National MoHFW View</option>
            <option value="district">District DMO View</option>
            <option value="phc">PHC Staff View</option>
          </select>

          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            style={{
              background: 'var(--bg-app)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-card)',
              borderRadius: 6,
              padding: '5px 8px',
              fontSize: '0.78rem',
              cursor: 'pointer'
            }}
          >
            <option value="en">English (EN)</option>
            <option value="hi">हिन्दी (HI)</option>
            <option value="mr">मराठी (MR)</option>
            <option value="bn">বাংলা (BN)</option>
            <option value="ta">தமிழ் (TA)</option>
            <option value="te">తెలుగు (TE)</option>
            <option value="kn">ಕನ್ನಡ (KN)</option>
            <option value="gu">ગુજરાતી (GU)</option>
          </select>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-card)',
              color: 'var(--text-main)',
              padding: '6px',
              borderRadius: 8,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Toggle Dark/Light Mode"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

      </div>
    </header>
  );
};
