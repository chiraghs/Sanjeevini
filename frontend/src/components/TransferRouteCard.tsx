import React, { useState } from 'react';
import { RedistributionRecommendation } from '../types';
import { Truck, ArrowRight, ShieldCheck, Thermometer, MapPin } from 'lucide-react';
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
    <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #34d399' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 700 }}>{rec.medicine_name}</span>
            <span className="badge badge-emergency" style={{ fontSize: '0.65rem' }}>{rec.urgency}</span>
            {rec.requires_cold_chain && (
              <span className="badge badge-stable" style={{ fontSize: '0.65rem' }}>
                <Thermometer size={11} /> Cold Chain (2-8°C)
              </span>
            )}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Category: {rec.medicine_category} | Requisition: <strong>{rec.quantity} units</strong>
          </span>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#34d399' }}>
            {rec.distance_km} km
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
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
          background: 'hsla(220, 20%, 30%, 0.15)',
          padding: '14px',
          borderRadius: 10,
          marginBottom: 14,
        }}
      >
        {/* Donor */}
        <div>
          <div style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 600, textTransform: 'uppercase' }}>
            Donor (Surplus Hub)
          </div>
          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{rec.donor_facility.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {rec.donor_facility.district}, {rec.donor_facility.state}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#34d399', marginTop: 4 }}>
            Current Stock: {rec.donor_facility.current_stock} ({rec.donor_facility.days_to_stockout} days buffer)
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#34d399' }}>
          <Truck size={20} />
          <ArrowRight size={18} />
        </div>

        {/* Recipient */}
        <div>
          <div style={{ fontSize: '0.7rem', color: '#f87171', fontWeight: 600, textTransform: 'uppercase' }}>
            Recipient (Critical Deficit)
          </div>
          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{rec.recipient_facility.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {rec.recipient_facility.district}, {rec.recipient_facility.state}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#f87171', marginTop: 4 }}>
            Current Stock: {rec.recipient_facility.current_stock} ({rec.recipient_facility.days_to_stockout} days to zero)
          </div>
        </div>
      </div>

      {/* AI Rationale */}
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.4 }}>
        <strong style={{ color: 'var(--text-main)' }}>AI Supply Optimization Rationale:</strong> {rec.ai_rationale}
      </div>

      {/* Action Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Rec ID: {rec.recommendation_id}
        </span>

        {dispatchedCode ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#34d399', fontWeight: 600, fontSize: '0.85rem' }}>
            <ShieldCheck size={16} />
            <span>Dispatched! e-Challan: {dispatchedCode}</span>
          </div>
        ) : (
          <button className="btn-primary" onClick={handleApprove} disabled={loading}>
            <Truck size={15} />
            <span>{loading ? 'Authorizing Dispatch...' : 'Approve & Issue e-Challan'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
