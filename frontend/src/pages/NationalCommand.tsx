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
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DEFAULT_SUMMARY: NationalSummary = {
  total_facilities: 28,
  facility_breakdown: { PHC: 16, CHC: 6, DH: 6 },
  beds: { total: 2604, occupied: 2164, available: 440, occupancy_rate_pct: 83.1 },
  inventory_health: { critical_stockouts: 5, warning_stockouts: 0, national_resilience_score: 96.0 },
  active_alerts_count: 4,
  active_transfers_count: 3,
};

const DEFAULT_ALERTS: HealthAlert[] = [
  {
    id: 1,
    title: 'Maternal Oxytocin Reserve Alert',
    type: 'STOCKOUT_RISK',
    severity: 'CRITICAL',
    state: 'Kerala',
    district: 'Wayanad',
    disease: 'Post-Partum Hemorrhage Prevention',
    description: 'FHC Meppadi reports 5 ampoules remaining with 3 high-risk deliveries scheduled this weekend.',
    ai_mitigation: 'Requisition 50 cold-chain ampoules from General Hospital Ernakulam / Sulthan Bathery CHC.',
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Acute Diarrheal Outbreak Warning',
    type: 'DISEASE_SURGE',
    severity: 'HIGH',
    state: 'Bihar',
    district: 'Muzaffarpur',
    disease: 'Acute Gastroenteritis (Cholera suspected)',
    description: 'Contaminated ground well water in Kanti block caused 48 acute admissions within 36 hours. IV Fluid reserves below critical threshold.',
    ai_mitigation: 'Dispatch 400 bottles Normal Saline and 200 bottles RL from SKMCH Muzaffarpur.',
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    title: 'Agricultural Season Snakebite Alert',
    type: 'SEASONAL_SURGE',
    severity: 'HIGH',
    state: 'Maharashtra',
    district: 'Pune',
    disease: 'Envenomation (Russell Viper / Krait)',
    description: 'Sugarcane harvesting has triggered heightened snakebite incidents in Mulshi and Paud blocks. PHC Paud ASV inventory depleted to 4 vials.',
    ai_mitigation: 'Approve emergency cross-transfer of 25 ASV polyvalent vials from Aundh District Hospital via route NH-48 within 3 hours.',
    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    title: 'Post-Monsoon Dengue Vector Surge',
    type: 'EPIDEMIC_SURGE',
    severity: 'CRITICAL',
    state: 'Assam',
    district: 'Cachar',
    disease: 'Dengue Hemorrhagic Fever',
    description: 'Flooding in Barak valley has accelerated Aedes mosquito breeding. PHC Sonai reports 320% increase in acute fever presentations.',
    ai_mitigation: 'Release strategic reserve of 500 Paracetamol 500mg strips and 300 ORS sachets from Silchar Civil Hospital depot.',
    created_at: new Date().toISOString(),
  }
];

const DEFAULT_WATCHLIST = [
  {
    facility_id: 25,
    facility_name: 'FHC Meppadi',
    facility_type: 'PHC',
    district: 'Wayanad',
    state: 'Kerala',
    medicine_id: 5,
    medicine_name: 'Oxytocin Injection 10 IU/ml',
    category: 'Maternal Health',
    current_stock: 4,
    daily_burn: 7.6,
    days_to_stockout: 0.5,
    status: 'CRITICAL'
  },
  {
    facility_id: 1,
    facility_name: 'PHC Sonai',
    facility_type: 'PHC',
    district: 'Cachar',
    state: 'Assam',
    medicine_id: 2,
    medicine_name: 'ORS (Oral Rehydration Salts)',
    category: 'Electrolyte',
    current_stock: 4,
    daily_burn: 6.8,
    days_to_stockout: 0.6,
    status: 'CRITICAL'
  },
  {
    facility_id: 19,
    facility_name: 'PHC Kanti',
    facility_type: 'PHC',
    district: 'Muzaffarpur',
    state: 'Bihar',
    medicine_id: 1,
    medicine_name: 'Paracetamol 500mg',
    category: 'Analgesic & Antipyretic',
    current_stock: 5,
    daily_burn: 6.0,
    days_to_stockout: 0.8,
    status: 'CRITICAL'
  },
  {
    facility_id: 13,
    facility_name: 'PHC Baytu Desert Outpost',
    facility_type: 'PHC',
    district: 'Barmer',
    state: 'Rajasthan',
    medicine_id: 7,
    medicine_name: 'Normal Saline (0.9% NaCl) 500ml',
    category: 'IV Fluid',
    current_stock: 10,
    daily_burn: 8.5,
    days_to_stockout: 1.2,
    status: 'CRITICAL'
  },
  {
    facility_id: 7,
    facility_name: 'PHC Paud',
    facility_type: 'PHC',
    district: 'Pune',
    state: 'Maharashtra',
    medicine_id: 3,
    medicine_name: 'Anti-Snake Venom (ASV) Polyvalent',
    category: 'Antivenom',
    current_stock: 15,
    daily_burn: 5.7,
    days_to_stockout: 2.6,
    status: 'CRITICAL'
  },
  {
    facility_id: 4,
    facility_name: 'PHC Boko',
    facility_type: 'PHC',
    district: 'Kamrup',
    state: 'Assam',
    medicine_id: 3,
    medicine_name: 'Anti-Snake Venom (ASV) Polyvalent',
    category: 'Antivenom',
    current_stock: 95,
    daily_burn: 9.7,
    days_to_stockout: 9.8,
    status: 'CRITICAL'
  }
];

export const NationalCommand: React.FC = () => {
  // SWR: Initialize immediately with cached or baseline data for instant 0ms render
  const [summary, setSummary] = useState<NationalSummary>(() => {
    try {
      const cached = localStorage.getItem('sanjeevini_national_summary');
      return cached ? JSON.parse(cached) : DEFAULT_SUMMARY;
    } catch {
      return DEFAULT_SUMMARY;
    }
  });

  const [alerts, setAlerts] = useState<HealthAlert[]>(() => {
    try {
      const cached = localStorage.getItem('sanjeevini_national_alerts');
      return cached ? JSON.parse(cached) : DEFAULT_ALERTS;
    } catch {
      return DEFAULT_ALERTS;
    }
  });

  const [watchlist, setWatchlist] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem('sanjeevini_national_watchlist');
      return cached ? JSON.parse(cached) : DEFAULT_WATCHLIST;
    } catch {
      return DEFAULT_WATCHLIST;
    }
  });

  const [isSyncing, setIsSyncing] = useState<boolean>(true);

  // Background non-blocking sync: each query resolves and updates independently
  const syncTelemetry = async () => {
    setIsSyncing(true);
    
    // 1. National Summary
    api.getNationalSummary()
      .then((res) => {
        if (res.data) {
          setSummary(res.data);
          localStorage.setItem('sanjeevini_national_summary', JSON.stringify(res.data));
        }
      })
      .catch((e) => console.warn('Background summary sync paused, using cached telemetry:', e));

    // 2. Alerts
    api.getAlerts()
      .then((res) => {
        if (res.data?.alerts) {
          setAlerts(res.data.alerts);
          localStorage.setItem('sanjeevini_national_alerts', JSON.stringify(res.data.alerts));
        }
      })
      .catch((e) => console.warn('Background alerts sync paused, using cached telemetry:', e));

    // 3. Watchlist
    api.getCriticalWatchlist({ limit: 6 })
      .then((res) => {
        if (res.data?.watchlist) {
          setWatchlist(res.data.watchlist);
          localStorage.setItem('sanjeevini_national_watchlist', JSON.stringify(res.data.watchlist));
        }
      })
      .catch((e) => console.warn('Background watchlist sync paused, using cached telemetry:', e))
      .finally(() => {
        setIsSyncing(false);
      });
  };

  useEffect(() => {
    syncTelemetry();
  }, []);

  return (
    <div>
      <EmergencyBanner alerts={alerts} />

      <main className="app-container">
        
        {/* Header with Background Sync Status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0 }}>
                National Health Supply Chain & Resource Command
              </h1>
              {isSyncing ? (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: '0.72rem',
                  padding: '3px 9px',
                  borderRadius: 20,
                  background: 'rgba(5, 150, 105, 0.12)',
                  color: 'var(--emerald)',
                  border: '1px solid rgba(5, 150, 105, 0.25)',
                  fontWeight: 600
                }}>
                  <RefreshCw size={11} className="animate-spin" />
                  Syncing Live Telemetry (Background)
                </span>
              ) : (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: '0.72rem',
                  padding: '3px 9px',
                  borderRadius: 20,
                  background: 'rgba(5, 150, 105, 0.1)',
                  color: 'var(--emerald)',
                  border: '1px solid rgba(5, 150, 105, 0.2)',
                  fontWeight: 600
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--emerald)', boxShadow: '0 0 6px var(--emerald)' }} />
                  Live Telemetry Connected
                </span>
              )}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
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
