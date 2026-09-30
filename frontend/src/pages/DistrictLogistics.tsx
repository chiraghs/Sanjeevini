import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { RedistributionRecommendation } from '../types';
import { TransferRouteCard } from '../components/TransferRouteCard';
import { Truck, ShieldCheck, RefreshCw, Clock } from 'lucide-react';

export const DistrictLogistics: React.FC = () => {
  const [recommendations, setRecommendations] = useState<RedistributionRecommendation[]>([]);
  const [activeTransfers, setActiveTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [recRes, trfRes] = await Promise.all([
        api.getRecommendations(),
        api.getActiveTransfers(),
      ]);
      setRecommendations(recRes.data.recommendations);
      setActiveTransfers(trfRes.data.transfers);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <main className="app-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 4 }}>
            District Emergency Medicine Redistribution Hub
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Cross-district resource balancing: pairing critical deficit health centres with nearby surplus and near-expiry hospital depots
          </p>
        </div>

        <button className="btn-outline" onClick={fetchData}>
          <RefreshCw size={14} />
          <span>Refresh Recommendations</span>
        </button>
      </div>

      {/* Recommendations Column */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Urgent Requisition Proposals</h3>
            <span className="badge badge-warning">{recommendations.length} Pending Approval</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Objective: Minimize transit time and eliminate shelf-life expiry wastage
          </span>
        </div>

        {recommendations.length === 0 ? (
          <div className="glass-panel" style={{ padding: '28px', textAlign: 'center', color: 'var(--emerald)' }}>
            <ShieldCheck size={32} style={{ margin: '0 auto 8px' }} />
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>All Primary Health Centre inventories are currently within safety stock thresholds.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recommendations.map((rec) => (
              <TransferRouteCard key={rec.recommendation_id} rec={rec} onDispatched={fetchData} />
            ))}
          </div>
        )}
      </div>

      {/* Active In-Transit Fleet Tracking */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Truck size={18} color="var(--emerald)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Active In-Transit Emergency Convoys</h3>
          </div>
          <span className="badge badge-stable">{activeTransfers.length} Active Dispatches</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>e-Challan Pass</th>
                <th>Medicine & Quantity</th>
                <th>Donor Hub</th>
                <th>Destination PHC</th>
                <th>Vehicle & Driver</th>
                <th>Urgency</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {activeTransfers.map((t) => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 600, color: 'var(--emerald)' }}>{t.code}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{t.medicine}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t.quantity} units</div>
                  </td>
                  <td>{t.source}</td>
                  <td style={{ fontWeight: 600 }}>{t.destination}</td>
                  <td>
                    <div>{t.vehicle_no}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t.driver_name}</div>
                  </td>
                  <td>
                    <span className="badge badge-warning">{t.urgency}</span>
                  </td>
                  <td>
                    <span className="badge badge-stable" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={11} /> {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};
