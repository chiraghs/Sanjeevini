import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { api } from '../services/api';
import { MapMarker } from '../types';
import { Building2, Bed, AlertTriangle, Filter, Key, HelpCircle, Layers, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

// Clean standard SVG icons (no glowing neo-effects)
const createCleanMarkerIcon = (status: string, count: number) => {
  let fillColor = '#059669'; // Stable Forest Green
  let strokeColor = '#064e3b';
  if (status === 'CRITICAL') {
    fillColor = '#dc2626'; // Crimson
    strokeColor = '#7f1d1d';
  } else if (status === 'WARNING') {
    fillColor = '#d97706'; // Amber
    strokeColor = '#78350f';
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
      <circle cx="16" cy="16" r="13" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2"/>
      ${count > 0 ? `<text x="16" y="20" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">${count}</text>` : ''}
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: 'clean-map-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

export const LiveResourceMap: React.FC = () => {
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  
  // Map Engine State: CARTO Positron (Default Light), Voyager, Dark Matter, OSM, or Google Maps
  const [mapEngine, setMapEngine] = useState<'carto_positron' | 'carto_voyager' | 'carto_dark' | 'osm' | 'google_roadmap' | 'google_satellite'>(() => {
    return (localStorage.getItem('map_engine') as any) || 'osm';
  });
  const [googleMapsKey, setGoogleMapsKey] = useState<string>(() => {
    return localStorage.getItem('google_maps_key') || (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';
  });
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [tempKeyInput, setTempKeyInput] = useState<string>('');

  useEffect(() => {
    const fetchMarkers = async () => {
      try {
        const res = await api.getMapMarkers();
        setMarkers(res.data.markers);
      } catch (e) {
        console.error(e);
      }
    };
    fetchMarkers();
  }, []);

  const handleSaveKey = () => {
    setGoogleMapsKey(tempKeyInput);
    localStorage.setItem('google_maps_key', tempKeyInput);
    setShowKeyModal(false);
  };

  const handleEngineChange = (engine: 'carto_positron' | 'carto_voyager' | 'carto_dark' | 'osm' | 'google_roadmap' | 'google_satellite') => {
    setMapEngine(engine);
    localStorage.setItem('map_engine', engine);
    if ((engine === 'google_roadmap' || engine === 'google_satellite') && !googleMapsKey) {
      setShowKeyModal(true);
    }
  };

  // Determine Tile Layer URL
  const getTileConfig = () => {
    if (mapEngine === 'carto_positron') {
      return {
        url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd'
      };
    } else if (mapEngine === 'carto_voyager') {
      return {
        url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd'
      };
    } else if (mapEngine === 'carto_dark') {
      return {
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd'
      };
    } else if (mapEngine === 'google_roadmap') {
      const keyParam = googleMapsKey ? `&key=${googleMapsKey}` : '';
      return {
        url: `https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}${keyParam}`,
        attribution: '&copy; Google Maps Platform',
        subdomains: 'abc'
      };
    } else if (mapEngine === 'google_satellite') {
      const keyParam = googleMapsKey ? `&key=${googleMapsKey}` : '';
      return {
        url: `https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}${keyParam}`,
        attribution: '&copy; Google Maps Platform Imagery',
        subdomains: 'abc'
      };
    } else {
      // Default: OpenStreetMap (Zero configuration, 100% Free, No API key)
      return {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: 'abc'
      };
    }
  };

  const tileConfig = getTileConfig();

  const filteredMarkers = markers.filter((m) => {
    if (selectedState !== 'ALL' && m.state !== selectedState) return false;
    if (selectedStatus !== 'ALL' && m.status !== selectedStatus) return false;
    return true;
  });

  const states = Array.from(new Set(markers.map((m) => m.state)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)' }}>
      {/* Map Control Toolbar */}
      <div className="glass-panel" style={{ borderRadius: 0, padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 500 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Filter size={15} color="var(--emerald)" />
            <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Filters:</span>
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
              padding: '5px 8px',
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
              padding: '5px 8px',
              fontSize: '0.8rem',
            }}
          >
            <option value="ALL">All Stock Statuses</option>
            <option value="CRITICAL">🔴 Critical Stockouts (≤3d)</option>
            <option value="WARNING">🟡 Warning Buffer (4-7d)</option>
            <option value="STABLE">🟢 Stable Supply (&gt;7d)</option>
          </select>

          {/* Map Engine Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 12, borderLeft: '1px solid var(--border-card)', paddingLeft: 14 }}>
            <Layers size={14} color="var(--text-muted)" />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Layer:</span>
            <select
              value={mapEngine}
              onChange={(e) => handleEngineChange(e.target.value as any)}
              style={{
                background: 'var(--bg-app)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-card)',
                borderRadius: 6,
                padding: '5px 8px',
                fontSize: '0.8rem',
                fontWeight: 600
              }}
            >
              <optgroup label="CARTO Basemaps (Fast &amp; Free)">
                <option value="carto_positron">CARTO Positron (Clean Light)</option>
                <option value="carto_voyager">CARTO Voyager (Detailed Clean)</option>
                <option value="carto_dark">CARTO Dark Matter (Clean Dark)</option>
              </optgroup>
              <optgroup label="OpenStreetMap Standard">
                <option value="osm">OpenStreetMap Standard</option>
              </optgroup>
              <optgroup label="Google Maps Platform">
                <option value="google_roadmap">Google Maps (Roadmap)</option>
                <option value="google_satellite">Google Maps (Satellite / Hybrid)</option>
              </optgroup>
            </select>

            <button
              onClick={() => {
                setTempKeyInput(googleMapsKey);
                setShowKeyModal(true);
              }}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-card)',
                borderRadius: 6,
                padding: '5px 8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: '0.75rem',
                color: googleMapsKey ? 'var(--emerald)' : 'var(--text-muted)'
              }}
              title="Configure Google Maps API Key"
            >
              <Key size={13} />
              <span>{googleMapsKey ? 'Key Configured' : 'Set Google Key'}</span>
            </button>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: '0.78rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#059669' }}></span>
            <span>Stable Supply</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#d97706' }}></span>
            <span>Warning (4-7 Days)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#dc2626' }}></span>
            <span>Critical Deficit (≤3 Days)</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div style={{ flex: 1, position: 'relative' }}>
        <MapContainer
          key={mapEngine} // Force re-render on map engine toggle
          center={[22.5937, 78.9629]} // Geographic center of India
          zoom={5}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            key={tileConfig.url}
            attribution={tileConfig.attribution}
            url={tileConfig.url}
            subdomains={tileConfig.subdomains || 'abc'}
          />

          {/* Outbreak Heat Circles */}
          {/* Cachar Flood Zone */}
          <Circle
            center={[24.8333, 92.7789]}
            radius={45000}
            pathOptions={{ color: '#dc2626', fillColor: '#dc2626', fillOpacity: 0.15 }}
          />
          {/* Pune Vector Outbreak Zone */}
          <Circle
            center={[18.5284, 73.8567]}
            radius={55000}
            pathOptions={{ color: '#d97706', fillColor: '#d97706', fillOpacity: 0.12 }}
          />

          {/* Facility Markers */}
          {filteredMarkers.map((marker) => (
            <Marker
              key={marker.id}
              position={[marker.lat, marker.lng]}
              icon={createCleanMarkerIcon(marker.status, marker.critical_stockouts_count)}
            >
              <Popup>
                <div style={{ padding: 4, minWidth: 220 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span className="badge badge-stable" style={{ fontSize: '0.65rem' }}>{marker.type}</span>
                    <span className={`badge ${marker.status === 'CRITICAL' ? 'badge-critical' : marker.status === 'WARNING' ? 'badge-warning' : 'badge-stable'}`}>
                      {marker.status}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '4px 0' }}>{marker.name}</h4>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 8 }}>
                    {marker.district}, {marker.state}
                  </div>

                  <div style={{ fontSize: '0.78rem', marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
                    <span>Bed Occupancy:</span>
                    <strong>{marker.beds_occupied} / {marker.beds_total}</strong>
                  </div>

                  <div style={{ fontSize: '0.78rem', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                    <span>Critical Deficits:</span>
                    <strong style={{ color: marker.critical_stockouts_count > 0 ? '#dc2626' : '#059669' }}>
                      {marker.critical_stockouts_count} items
                    </strong>
                  </div>

                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    <Link
                      to="/logistics"
                      style={{
                        flex: 1,
                        background: '#059669',
                        color: '#ffffff',
                        padding: '6px 8px',
                        borderRadius: 4,
                        textAlign: 'center',
                        textDecoration: 'none',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                      }}
                    >
                      Redistribute Stock
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Google Maps API Key Modal */}
      {showKeyModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
          }}
        >
          <div className="glass-panel" style={{ maxWidth: 540, width: '90%', padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Key size={18} color="var(--emerald)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Google Maps Platform Configuration</h3>
            </div>

            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.5 }}>
              Sanjeevini supports both <strong>OpenStreetMap (Default, 100% Free, No key needed)</strong> and native <strong>Google Maps (Roadmap & Satellite)</strong>.
            </p>

            <div style={{ background: 'var(--bg-app)', border: '1px solid var(--border-card)', padding: 12, borderRadius: 6, fontSize: '0.78rem', marginBottom: 16 }}>
              <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: 4 }}>How to get a Google Maps API Key:</div>
              <ol style={{ paddingLeft: 18, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                <li>Visit <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer" style={{ color: 'var(--emerald)' }}>Google Cloud Console</a>.</li>
                <li>Create or select your hackathon project.</li>
                <li>Navigate to <strong>APIs & Services &gt; Library</strong>, search for <strong>Maps JavaScript API</strong> and click <strong>Enable</strong>.</li>
                <li>Go to <strong>APIs & Services &gt; Credentials</strong>, click <strong>Create Credentials &gt; API Key</strong>.</li>
                <li>Paste the key below or add <code style={{ color: 'var(--emerald)' }}>VITE_GOOGLE_MAPS_API_KEY</code> to your <code style={{ color: 'var(--emerald)' }}>frontend/.env</code> file.</li>
              </ol>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                Enter Google Maps API Key:
              </label>
              <input
                type="text"
                value={tempKeyInput}
                onChange={(e) => setTempKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                style={{
                  width: '100%',
                  background: 'var(--bg-app)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-card)',
                  borderRadius: 6,
                  padding: '8px 12px',
                  fontSize: '0.85rem',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                className="btn-outline"
                onClick={() => {
                  setMapEngine('osm');
                  setShowKeyModal(false);
                }}
              >
                Use OpenStreetMap (No Key)
              </button>
              <button className="btn-primary" onClick={handleSaveKey}>
                <Check size={14} />
                <span>Save Key & Activate Google Maps</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
