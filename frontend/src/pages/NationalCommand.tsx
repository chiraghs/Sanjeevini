import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { NationalSummary, HealthAlert, InventoryItem } from '../types';
import { StatCard } from '../components/StatCard';
import { EmergencyBanner } from '../components/EmergencyBanner';
import { 
  Building2, 
  Bed, 
  Activity, 
  AlertTriangle, 
  Truck, 
  ShieldCheck, 
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const NationalCommand: React.FC = () => {
  const [summary, setSummary] = useState<NationalSummary | null>(null);
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumRes, alertRes, watchRes] = await Promise.all([
          api.getNationalSummary(),
          api.getAlerts(),
          api.getCriticalWatchlist({ limit: 6 })
        ]);
        setSummary(sumRes.data);
        setAlerts(alertRes.data.alerts);
        setWatchlist(watchRes.data.watchlist);
      } catch (e) {
        console.error('Failed to fetch national data:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="app-container" style={{ textAlign: 'center', padding: '80px 0' }}>
        <div style={{ fontSize: '1.2rem', color: '#34d399' }}>🌿 Connecting to MoHFW National Health Data Stream...</div>
      </div>
    );
  }

  return (
    <div>
      <EmergencyBanner alerts={alerts} />

      <main className="app-container">
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 4 }}>
              National Health Supply Chain & Resource Command
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Real-time federated visibility across 30,000+ PHCs, CHCs, and District Hospitals
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/map" className="btn-outline">
              <span>View National GIS Map</span>
              <ArrowUpRight size={15} />
            </Link>
            <Link to="/logistics" className="btn-primary">
              <Truck size={15} />
              <span>Automated Redistribution</span>
            </Link>
          </div>
        </div>

        {/* Top KPI Grid */}
        <div className="grid-stats">
          <StatCard
            title="National Resilience Score"
            value={`${summary?.inventory_health.national_resilience_score}%`}
            subtitle="Based on NLEM drug buffer index"
            trend="+2.4% vs last week"
            trendType="positive"
            icon={<ShieldCheck size={22} />}
          />
          <StatCard
            title="Total Registered Facilities"
            value={summary?.total_facilities.toLocaleString() || '0'}
            subtitle={`${summary?.facility_breakdown.PHC} PHCs | ${summary?.facility_breakdown.CHC} CHCs | ${summary?.facility_breakdown.DH} DHs`}
            trend="100% reporting"
            trendType="positive"
            icon={<Building2 size={22} />}
          />
          <StatCard
            title="Bed Capacity & Utilization"
            value={`${summary?.beds.occupancy_rate_pct}%`}
            subtitle={`${summary?.beds.occupied} of ${summary?.beds.total} occupied`}
            trend={`${summary?.beds.available} available`}
            trendType="neutral"
            icon={<Bed size={22} />}
          />
          <StatCard
            title="Critical Stockouts (<3 Days)"
            value={summary?.inventory_health.critical_stockouts || 0}
            subtitle={`${summary?.inventory_health.warning_stockouts} at warning level (<7d)`}
            trend="High Priority"
            trendType="negative"
            icon={<AlertTriangle size={22} />}
          />
        </div>

        {/* Dual Column: Watchlist + Active Outbreaks */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
          
          {/* Critical Watchlist */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Imminent Stockout Watchlist</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Facilities with life-saving drugs depleting within 7 days</p>
              </div>
              <Link to="/logistics" style={{ color: '#34d399', fontSize: '0.8rem', textDecoration: 'none', fontWeight: 600 }}>
                Resolve All →
              </Link>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Facility</th>
                    <th>Medicine</th>
                    <th>Stock</th>
                    <th>Days Left</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {watchlist.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{item.facility_name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {item.district}, {item.state}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{item.medicine_name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.category}</div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{item.current_stock}</td>
                      <td>
                        <span className="badge badge-critical">
                          {item.days_to_stockout} days
                        </span>
                      </td>
                      <td>
                        <Link to="/logistics" className="btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                          Transfer
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Epidemiological Outbreak Alerts */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Active Health & Climate Alerts</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Surveillance triggers driving localized consumption spikes</p>
              </div>
              <span className="badge badge-emergency">{alerts.length} Active</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  style={{
                    background: 'hsla(220, 20%, 30%, 0.15)',
                    padding: '14px',
                    borderRadius: 10,
                    borderLeft: alert.severity === 'CRITICAL' ? '4px solid #f87171' : '4px solid #fb923c'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{alert.title}</span>
                    <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>
                      {alert.district}, {alert.state}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                    {alert.description}
                  </p>
                  <div style={{ fontSize: '0.75rem', color: '#34d399', background: 'hsla(150, 70%, 42%, 0.1)', padding: '6px 10px', borderRadius: 6 }}>
                    <strong>AI Recommendation:</strong> {alert.ai_mitigation}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
};
