import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { RedistributionRecommendation } from '../types';
import { TransferRouteCard } from '../components/TransferRouteCard';
import { Truck, ShieldCheck, RefreshCw, AlertCircle, Clock } from 'lucide-react';

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 4 }}>
            Automated Cross-District Redistribution Hub
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            AI-driven bipartite matching: pairing imminent deficit PHCs with nearby surplus & near-expiry donor hubs
          </p>
        </div>

        <button className="btn-outline" onClick={fetchData}>
          <RefreshCw size={15} />
          <span>Refresh Requisitions</span>
        </button>
      </div>

      {/* Recommendations Column */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>AI Transfer Recommendations</h3>
            <span className="badge badge-emergency">{recommendations.length} Pending Approval</span>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Objective: Minimize transit distance & eliminate shelf-life expiry wastage
          </span>
        </div>

        {recommendations.length === 0 ? (
          <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', color: '#34d399' }}>
            <ShieldCheck size={36} style={{ margin: '0 auto 8px' }} />
            <div style={{ fontWeight: 600 }}>All district inventories currently within safe operating thresholds.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {recommendations.map((rec) => (
              <TransferRouteCard key={rec.recommendation_id} rec={rec} onDispatched={fetchData} />
            ))}
          </div>
        )}
      </div>

      {/* Active In-Transit Fleet Tracking */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Truck size={20} color="#34d399" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Active In-Transit Emergency Convoys</h3>
          </div>
          <span className="badge badge-stable">{activeTransfers.length} Vehicles En Route</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>e-Challan Code</th>
                <th>Medicine & Quantity</th>
                <th>Source Hub</th>
                <th>Destination PHC</th>
                <th>Vehicle & Driver</th>
                <th>Urgency</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {activeTransfers.map((t) => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 600, color: '#34d399' }}>{t.code}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{t.medicine}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.quantity} units</div>
                  </td>
                  <td>{t.source}</td>
                  <td style={{ fontWeight: 600 }}>{t.destination}</td>
                  <td>
                    <div>{t.vehicle_no}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.driver_name}</div>
                  </td>
                  <td>
                    <span className="badge badge-emergency">{t.urgency}</span>
                  </td>
                  <td>
                    <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} /> {t.status}
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
