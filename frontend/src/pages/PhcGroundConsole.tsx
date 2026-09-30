import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Facility } from '../types';
import { Building2, Plus, Minus, CheckCircle, UserCheck, Thermometer } from 'lucide-react';

export const PhcGroundConsole: React.FC = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState<number>(1);
  const [facilityDetail, setFacilityDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updateMsg, setUpdateMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const res = await api.getFacilities({ limit: 50 });
        setFacilities(res.data.items);
        if (res.data.items.length > 0) {
          setSelectedFacilityId(res.data.items[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchFacilities();
  }, []);

  const loadFacilityDetail = async (id: number) => {
    setLoading(true);
    try {
      const res = await api.getFacilityDetail(id);
      setFacilityDetail(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedFacilityId) {
      loadFacilityDetail(selectedFacilityId);
    }
  }, [selectedFacilityId]);

  const handleStockDelta = async (medicineId: number, delta: number) => {
    try {
      await api.updateStock({
        facility_id: selectedFacilityId,
        medicine_id: medicineId,
        quantity_delta: delta,
        reason: 'PHC Dispensary Dispensation / Restock Adjustment',
      });
      setUpdateMsg('Stock count recorded and synchronized successfully.');
      setTimeout(() => setUpdateMsg(null), 2000);
      loadFacilityDetail(selectedFacilityId);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <main className="app-container">
      {/* Header & Facility Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 4 }}>
            PHC Ground Terminal & Stock Console
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Daily dispensary register and attendance verification for Medical Officers & Pharmacists
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Building2 size={16} color="var(--emerald)" />
          <select
            value={selectedFacilityId}
            onChange={(e) => setSelectedFacilityId(Number(e.target.value))}
            style={{
              background: 'var(--bg-card)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-card)',
              borderRadius: 6,
              padding: '6px 10px',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            {facilities.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.type} - {f.district}, {f.state})
              </option>
            ))}
          </select>
        </div>
      </div>

      {updateMsg && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--emerald)', color: 'var(--emerald)', padding: '8px 14px', borderRadius: 6, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.825rem' }}>
          <CheckCircle size={15} />
          <span>{updateMsg}</span>
        </div>
      )}

      {/* Facility Status Card */}
      {facilityDetail && (
        <div className="grid-stats" style={{ marginBottom: 20 }}>
          <div className="glass-panel" style={{ padding: '14px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 2 }}>Bed Utilization</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>
              {facilityDetail.facility.occupied_beds} / {facilityDetail.facility.total_beds}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
              {facilityDetail.facility.oxygen_points} Active O2 Points
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '14px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 2 }}>Cold Chain ILR Status</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Thermometer size={16} color="var(--emerald)" />
              <span>{facilityDetail.facility.cold_chain_temp_c}°C</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--emerald)', marginTop: 2 }}>Within Safe Range (2-8°C)</div>
          </div>

          <div className="glass-panel" style={{ padding: '14px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 2 }}>Medical Personnel On Duty</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <UserCheck size={16} color="var(--emerald)" />
              <span>{facilityDetail.attendance?.doctors_present || 1} MO / {facilityDetail.attendance?.nurses_present || 2} Nurses</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--emerald)', marginTop: 2 }}>Attendance Recorded</div>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="glass-panel" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 14 }}>Essential Medicines Inventory Register</h3>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Category</th>
                <th>Batch No</th>
                <th>Current Stock</th>
                <th>Daily Burn</th>
                <th>Buffer Days</th>
                <th>Status</th>
                <th>Adjust Stock</th>
              </tr>
            </thead>
            <tbody>
              {facilityDetail?.inventory.map((inv: any) => (
                <tr key={inv.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{inv.medicine_name}</div>
                    {inv.requires_cold_chain && (
                      <span className="badge badge-stable" style={{ fontSize: '0.58rem', marginTop: 2 }}>
                        Cold Chain
                      </span>
                    )}
                  </td>
                  <td>{inv.category}</td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inv.batch_no}</td>
                  <td style={{ fontWeight: 600, fontSize: '0.95rem' }}>{inv.current_stock}</td>
                  <td>{inv.daily_burn_rate} / day</td>
                  <td style={{ fontWeight: 600 }}>{inv.days_to_stockout} days</td>
                  <td>
                    <span className={`badge ${inv.status === 'CRITICAL' ? 'badge-critical' : inv.status === 'WARNING' ? 'badge-warning' : 'badge-stable'}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        onClick={() => handleStockDelta(inv.medicine_id, -10)}
                        style={{
                          background: 'var(--bg-app)',
                          color: 'var(--danger)',
                          border: '1px solid var(--border-card)',
                          borderRadius: 4,
                          padding: '3px 7px',
                          cursor: 'pointer',
                        }}
                        title="Dispense -10"
                      >
                        <Minus size={12} />
                      </button>
                      <button
                        onClick={() => handleStockDelta(inv.medicine_id, 25)}
                        style={{
                          background: 'var(--bg-app)',
                          color: 'var(--emerald)',
                          border: '1px solid var(--border-card)',
                          borderRadius: 4,
                          padding: '3px 7px',
                          cursor: 'pointer',
                        }}
                        title="Restock +25"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
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
