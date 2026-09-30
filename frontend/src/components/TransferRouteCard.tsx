import React, { useState } from 'react';
import { RedistributionRecommendation } from '../types';
import { Truck, ArrowRight, ShieldCheck, Thermometer } from 'lucide-react';
import { api } from '../services/api';

interface TransferRouteCardProps {
  rec: RedistributionRecommendation;
  onDispatched?: () => void;
}

export const TransferRouteCard: React.FC<TransferRouteCardProps> = ({ rec, onDispatched }) => {
  const [loading, setLoading] = useState(false);
  const [dispatchedCode, setDispatchedCode] = useState<string | null>(null);

  const handleApprove = async () => {
    setLoading(true);
    try {
      const res = await api.approveDispatch({
        source_facility_id: rec.donor_facility.id,
        destination_facility_id: rec.recipient_facility.id,
        medicine_id: rec.medicine_id,
        quantity: rec.quantity,
        vehicle_no: 'AS-11-C-4092 (Cold-Van)',
        driver_name: 'Biren Das',
      });
      setDispatchedCode(res.data.transfer_code);
      if (onDispatched) onDispatched();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '16px', borderLeft: '4px solid var(--emerald)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: '1rem', fontWeight: 600 }}>{rec.medicine_name}</span>
            <span className="badge badge-warning" style={{ fontSize: '0.62rem' }}>{rec.urgency}</span>
            {rec.requires_cold_chain && (
              <span className="badge badge-stable" style={{ fontSize: '0.62rem' }}>
                <Thermometer size={10} /> Cold Chain (2-8°C)
              </span>
            )}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Category: {rec.medicine_category} | Requisition: <strong>{rec.quantity} units</strong>
          </span>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {rec.distance_km} km
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            ~{rec.estimated_transit_hours} hrs transit
          </div>
        </div>
      </div>

      {/* Origin -> Destination Route Flow */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          gap: 12,
          background: 'var(--bg-app)',
          padding: '10px 12px',
          borderRadius: 6,
          border: '1px solid var(--border-subtle)',
          marginBottom: 12,
        }}
      >
        {/* Donor */}
        <div>
          <div style={{ fontSize: '0.68rem', color: 'var(--emerald)', fontWeight: 600, textTransform: 'uppercase' }}>
            Donor Facility (Surplus Hub)
          </div>
          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{rec.donor_facility.name}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {rec.donor_facility.district}, {rec.donor_facility.state}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Stock: {rec.donor_facility.current_stock} ({rec.donor_facility.days_to_stockout}d buffer)
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-muted)' }}>
          <Truck size={18} />
          <ArrowRight size={14} />
        </div>

        {/* Recipient */}
        <div>
          <div style={{ fontSize: '0.68rem', color: 'var(--danger)', fontWeight: 600, textTransform: 'uppercase' }}>
            Recipient PHC (Deficit Outpost)
          </div>
          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{rec.recipient_facility.name}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {rec.recipient_facility.district}, {rec.recipient_facility.state}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--danger)', marginTop: 2 }}>
            Stock: {rec.recipient_facility.current_stock} ({rec.recipient_facility.days_to_stockout}d to zero)
          </div>
        </div>
      </div>

      {/* Logistics Rationale */}
      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.4 }}>
        <strong style={{ color: 'var(--text-main)' }}>Logistics Optimization Protocol:</strong> {rec.ai_rationale}
      </div>

      {/* Action Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          Rec ID: {rec.recommendation_id}
        </span>

        {dispatchedCode ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--emerald)', fontWeight: 600, fontSize: '0.8rem' }}>
            <ShieldCheck size={15} />
            <span>Authorized. e-Challan: {dispatchedCode}</span>
          </div>
        ) : (
          <button className="btn-primary" onClick={handleApprove} disabled={loading}>
            <Truck size={14} />
            <span>{loading ? 'Authorizing Dispatch...' : 'Authorize Dispatch & Issue e-Challan'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
