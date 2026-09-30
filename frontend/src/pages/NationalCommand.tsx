import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { NationalSummary, HealthAlert } from '../types';
import { StatCard } from '../components/StatCard';
import { EmergencyBanner } from '../components/EmergencyBanner';
import { 
  Building2, 
  Bed, 
  AlertTriangle, 
  Truck, 
  ShieldCheck, 
  ArrowUpRight 
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
      <div className="app-container" style={{ textAlign: 'center', padding: '60px 0' }}>
        <div style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Connecting to MoHFW Health Resource Network...</div>
      </div>
    );
  }

  return (
    <div>
      <EmergencyBanner alerts={alerts} />

      <main className="app-container">
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 4 }}>
              National Health Supply Chain & Resource Command
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Real-time monitoring across 30,000+ Primary Health Centres, Community Health Centres, and District Hospitals
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <Link to="/map" className="btn-outline">
              <span>National GIS Map</span>
              <ArrowUpRight size={14} />
            </Link>
            <Link to="/logistics" className="btn-primary">
              <Truck size={14} />
              <span>Cross-District Redistribution</span>
            </Link>
          </div>
        </div>

        {/* Top KPI Grid */}
        <div className="grid-stats">
          <StatCard
            title="National Buffer Index"
            value={`${summary?.inventory_health.national_resilience_score}%`}
            subtitle="Based on NLEM drug safety stock"
            trend="+2.4% vs last week"
            trendType="positive"
            icon={<ShieldCheck size={20} />}
          />
          <StatCard
            title="Active Facilities Reporting"
            value={summary?.total_facilities.toLocaleString() || '0'}
            subtitle={`${summary?.facility_breakdown.PHC} PHCs | ${summary?.facility_breakdown.CHC} CHCs | ${summary?.facility_breakdown.DH} DHs`}
            trend="100% connected"
            trendType="positive"
            icon={<Building2 size={20} />}
          />
          <StatCard
            title="Bed Capacity & Utilization"
            value={`${summary?.beds.occupancy_rate_pct}%`}
            subtitle={`${summary?.beds.occupied} of ${summary?.beds.total} occupied`}
            trend={`${summary?.beds.available} available`}
            trendType="neutral"
            icon={<Bed size={20} />}
          />
          <StatCard
            title="Critical Stockouts (≤3 Days)"
            value={summary?.inventory_health.critical_stockouts || 0}
            subtitle={`${summary?.inventory_health.warning_stockouts} at warning level (4-7d)`}
            trend="Immediate Attention"
            trendType="negative"
            icon={<AlertTriangle size={20} />}
          />
        </div>

        {/* Dual Column: Watchlist + Active Alerts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
          
          {/* Critical Watchlist */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Imminent Stockout Watchlist</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Primary Health Centres facing depletion within 7 days</p>
              </div>
              <Link to="/logistics" style={{ color: 'var(--emerald)', fontSize: '0.8rem', textDecoration: 'none', fontWeight: 600 }}>
                View Requisitions →
              </Link>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Facility</th>
                    <th>Medicine</th>
                    <th>Stock</th>
                    <th>Buffer</th>
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
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.category}</div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{item.current_stock}</td>
                      <td>
                        <span className="badge badge-critical">
                          {item.days_to_stockout} days
                        </span>
                      </td>
                      <td>
                        <Link to="/logistics" className="btn-primary" style={{ padding: '3px 8px', fontSize: '0.72rem' }}>
                          Dispatch
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Epidemiological Surveillance Alerts */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Surveillance & Outbreak Triggers</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Early warning signals driving local consumption spikes</p>
              </div>
              <span className="badge badge-warning">{alerts.length} Active</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  style={{
                    background: 'var(--bg-app)',
                    padding: '12px',
                    borderRadius: 6,
                    border: '1px solid var(--border-subtle)',
                    borderLeft: alert.severity === 'CRITICAL' ? '4px solid var(--danger)' : '4px solid var(--warning)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{alert.title}</span>
                    <span className="badge badge-warning" style={{ fontSize: '0.62rem' }}>
                      {alert.district}, {alert.state}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                    {alert.description}
                  </p>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-main)', background: 'var(--border-subtle)', padding: '6px 8px', borderRadius: 4 }}>
                    <strong>Action Protocol:</strong> {alert.ai_mitigation}
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
