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
  AlertTriangle,
  Smartphone
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
    { path: '/', label: t('nav_national'), icon: <ShieldCheck size={16} /> },
    { path: '/map', label: t('nav_map'), icon: <MapPin size={16} /> },
    { path: '/logistics', label: t('nav_logistics'), icon: <RefreshCw size={16} /> },
    { path: '/phc', label: t('nav_phc'), icon: <Building2 size={16} /> },
    { path: '/scan', label: t('nav_scan'), icon: <Camera size={16} /> },
    { path: '/voice', label: t('nav_voice'), icon: <Mic size={16} /> },
    { path: '/federated', label: t('nav_federated'), icon: <Network size={16} /> },
    { path: '/simulator', label: 'Mobile App', icon: <Smartphone size={16} /> },
  ];

  return (
    <header style={{ 
      background: 'var(--bg-card)', 
      borderBottom: '1px solid var(--border-card)', 
      position: 'sticky', 
      top: 0, 
      zIndex: 1000, 
      padding: '8px 20px' 
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 1440, margin: '0 auto' }}>
        
        {/* Brand matching favicon exactly */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit' }}>
          <img 
            src="/favicon.svg" 
            alt="Sanjeevini Logo" 
            style={{ width: 34, height: 34, borderRadius: 8, display: 'block' }} 
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {t('app_name')}
              </span>
              <span className="badge badge-stable" style={{ fontSize: '0.62rem' }}>NHM GOV</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              National Health Resource & Supply Chain Platform
            </div>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '5px 10px',
                  borderRadius: 6,
                  fontSize: '0.8rem',
                  fontWeight: isActive ? 600 : 500,
                  textDecoration: 'none',
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  background: isActive ? 'var(--emerald)' : 'transparent',
                  transition: 'background-color 0.15s ease'
                }}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          
          {/* Active Alerts Pill */}
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div className="badge badge-warning" style={{ cursor: 'pointer', padding: '4px 8px', fontSize: '0.72rem' }}>
              <AlertTriangle size={13} />
              <span>{alertsCount} Active Alerts</span>
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
              borderRadius: 4,
              padding: '4px 6px',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            <option value="national">MoHFW National</option>
            <option value="district">District DMO</option>
            <option value="phc">PHC Officer</option>
          </select>

          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            style={{
              background: 'var(--bg-app)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-card)',
              borderRadius: 4,
              padding: '4px 6px',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="mr">मराठी</option>
            <option value="bn">বাংলা</option>
            <option value="ta">தமிழ்</option>
            <option value="te">తెలుగు</option>
            <option value="kn">ಕನ್ನಡ</option>
            <option value="gu">ગુજરાતી</option>
          </select>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-card)',
              color: 'var(--text-main)',
              padding: '5px',
              borderRadius: 4,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>

      </div>
    </header>
  );
};
