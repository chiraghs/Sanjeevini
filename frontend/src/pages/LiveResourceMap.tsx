import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { api } from '../services/api';
import { MapMarker } from '../types';
import { Building2, Bed, AlertTriangle, ShieldCheck, Thermometer, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

// Custom SVG Icons for Leaflet markers
const createCustomIcon = (status: string, count: number) => {
  let color = '#34d399';
  if (status === 'CRITICAL') color = '#f87171';
  else if (status === 'WARNING') color = '#fbbf24';

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="36" height="36">
      <circle cx="18" cy="18" r="14" fill="${color}" fill-opacity="0.3" stroke="${color}" stroke-width="2"/>
      <circle cx="18" cy="18" r="8" fill="${color}"/>
      ${count > 0 ? `<text x="18" y="22" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">${count}</text>` : ''}
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: 'custom-map-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

export const LiveResourceMap: React.FC = () => {
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarkers = async () => {
      try {
        const res = await api.getMapMarkers();
        setMarkers(res.data.markers);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchMarkers();
  }, []);

  const filteredMarkers = markers.filter((m) => {
    if (selectedState !== 'ALL' && m.state !== selectedState) return false;
    if (selectedStatus !== 'ALL' && m.status !== selectedStatus) return false;
    return true;
  });

  const states = Array.from(new Set(markers.map((m) => m.state)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 65px)' }}>
      {/* Map Control Toolbar */}
      <div className="glass-panel" style={{ borderRadius: 0, padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 500 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter size={16} color="#34d399" />
            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Map Filters:</span>
          </div>

          {/* State Filter */}
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            style={{
              background: 'var(--bg-app)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-card)',
              borderRadius: 6,
              padding: '6px 10px',
              fontSize: '0.8rem',
            }}
          >
            <option value="ALL">All States (Pan-India)</option>
            {states.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{
              background: 'var(--bg-app)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-card)',
              borderRadius: 6,
              padding: '6px 10px',
              fontSize: '0.8rem',
            }}
          >
            <option value="ALL">All Health Statuses</option>
            <option value="CRITICAL">🔴 Critical Stockouts</option>
            <option value="WARNING">🟡 Warning Buffer</option>
            <option value="STABLE">🟢 Stable Supply</option>
          </select>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: '0.78rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#34d399' }}></span>
            <span>Stable Supply</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#fbbf24' }}></span>
            <span>Warning (4-7 Days)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f87171' }}></span>
            <span>Critical Deficit (≤3 Days)</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div style={{ flex: 1, position: 'relative' }}>
        <MapContainer
          center={[22.5937, 78.9629]} // Center of India
          zoom={5}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          {/* Outbreak Heat Circles */}
          {/* Cachar Flood Zone */}
          <Circle
            center={[24.8333, 92.7789]}
            radius={45000}
            pathOptions={{ color: '#f87171', fillColor: '#f87171', fillOpacity: 0.15 }}
          />
          {/* Pune Vector Outbreak Zone */}
          <Circle
            center={[18.5284, 73.8567]}
            radius={55000}
            pathOptions={{ color: '#fb923c', fillColor: '#fb923c', fillOpacity: 0.12 }}
          />

          {/* Facility Markers */}
          {filteredMarkers.map((marker) => (
            <Marker
              key={marker.id}
              position={[marker.lat, marker.lng]}
              icon={createCustomIcon(marker.status, marker.critical_stockouts_count)}
            >
              <Popup>
                <div style={{ padding: 4, minWidth: 220 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span className="badge badge-stable" style={{ fontSize: '0.65rem' }}>{marker.type}</span>
                    <span className={`badge ${marker.status === 'CRITICAL' ? 'badge-critical' : marker.status === 'WARNING' ? 'badge-warning' : 'badge-stable'}`}>
                      {marker.status}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '4px 0' }}>{marker.name}</h4>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 8 }}>
                    {marker.district}, {marker.state}
                  </div>

                  <div style={{ fontSize: '0.78rem', marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
                    <span>Bed Occupancy:</span>
                    <strong>{marker.beds_occupied} / {marker.beds_total}</strong>
                  </div>

                  <div style={{ fontSize: '0.78rem', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                    <span>Critical Deficits:</span>
                    <strong style={{ color: marker.critical_stockouts_count > 0 ? '#f87171' : '#34d399' }}>
                      {marker.critical_stockouts_count} items
                    </strong>
                  </div>

                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    <Link
                      to="/logistics"
                      style={{
                        flex: 1,
                        background: '#34d399',
                        color: '#064e3b',
                        padding: '6px 8px',
                        borderRadius: 6,
                        textAlign: 'center',
                        textDecoration: 'none',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      Redistribute
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};
