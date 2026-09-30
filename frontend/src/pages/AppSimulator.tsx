import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Wifi, 
  WifiOff, 
  Mic, 
  Camera, 
  AlertTriangle, 
  Plus, 
  Minus, 
  CheckCircle2, 
  RefreshCw, 
  Send, 
  ShieldAlert, 
  Package, 
  Building2,
  Clock,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';

interface OfflineItem {
  id: string;
  type: 'STOCK_ADJUST' | 'VOICE_REPORT' | 'EMERGENCY_SOS';
  details: string;
  timestamp: string;
}

export const AppSimulator: React.FC = () => {
  // Mobile Network Simulation
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'stock' | 'voice' | 'camera' | 'sos'>('stock');
  const [offlineQueue, setOfflineQueue] = useState<OfflineItem[]>([]);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Mobile App State
  const [phcStock, setPhcStock] = useState([
    { id: 1, name: 'Paracetamol 500mg', count: 18, unit: 'Strips', status: 'CRITICAL', days: 2.1 },
    { id: 2, name: 'ORS 21g Sachets', count: 65, unit: 'Sachets', status: 'WARNING', days: 5.4 },
    { id: 3, name: 'Anti-Snake Venom (ASV)', count: 4, unit: 'Vials', status: 'CRITICAL', days: 1.5 },
    { id: 4, name: 'Oxytocin 10 IU', count: 32, unit: 'Ampoules', status: 'STABLE', days: 12.0 },
    { id: 5, name: 'Normal Saline 500ml', count: 80, unit: 'Bottles', status: 'STABLE', days: 16.0 },
  ]);

  // Voice Tab State
  const [recording, setRecording] = useState(false);
  const [voiceQuery, setVoiceQuery] = useState('We have only 10 strips of Paracetamol remaining');
  const [voiceResult, setVoiceResult] = useState<any>(null);

  // Camera Tab State
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);

  // SOS Tab State
  const [sosSent, setSosSent] = useState(false);

  const handleStockDelta = (medId: number, delta: number) => {
    const item = phcStock.find((s) => s.id === medId);
    if (!item) return;

    if (!isOnline) {
      const qItem: OfflineItem = {
        id: `OFF-${Date.now()}`,
        type: 'STOCK_ADJUST',
        details: `${item.name}: ${delta > 0 ? '+' : ''}${delta} units`,
        timestamp: new Date().toLocaleTimeString(),
      };
      setOfflineQueue((prev) => [...prev, qItem]);
      setPhcStock((prev) =>
        prev.map((s) => (s.id === medId ? { ...s, count: Math.max(0, s.count + delta) } : s))
      );
      setSyncMessage('Saved offline! Will sync when 4G network reconnects.');
      setTimeout(() => setSyncMessage(null), 2500);
    } else {
      setPhcStock((prev) =>
        prev.map((s) => (s.id === medId ? { ...s, count: Math.max(0, s.count + delta) } : s))
      );
      setSyncMessage('Stock adjusted and synced to National Database!');
      setTimeout(() => setSyncMessage(null), 2000);
    }
  };

  const handleProcessVoice = async () => {
    if (!isOnline) {
      const qItem: OfflineItem = {
        id: `VOICE-${Date.now()}`,
        type: 'VOICE_REPORT',
        details: voiceQuery,
        timestamp: new Date().toLocaleTimeString(),
      };
      setOfflineQueue((prev) => [...prev, qItem]);
      setSyncMessage('Voice note queued offline.');
      setTimeout(() => setSyncMessage(null), 2500);
      return;
    }

    try {
      const res = await api.processVoice({ transcript: voiceQuery, language_code: 'hi', facility_id: 1 });
      setVoiceResult(res.data.processed);
    } catch (e) {
      console.error(e);
    }
  };

  const handleScanLedger = async () => {
    setScanning(true);
    try {
      const blob = new Blob(['sample'], { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', blob, 'ledger.jpg');
      formData.append('facility_id', '1');
      const res = await api.scanRegister(formData);
      setScannedData(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setScanning(false);
    }
  };

  const handleTriggerSos = () => {
    if (!isOnline) {
      const qItem: OfflineItem = {
        id: `SOS-${Date.now()}`,
        type: 'EMERGENCY_SOS',
        details: 'Urgent Anti-Snake Venom (ASV) Stockout SOS',
        timestamp: new Date().toLocaleTimeString(),
      };
      setOfflineQueue((prev) => [...prev, qItem]);
      setSosSent(true);
      setSyncMessage('SOS Alert recorded offline. Will broadcast on reconnect!');
      setTimeout(() => setSyncMessage(null), 3000);
    } else {
      setSosSent(true);
      setSyncMessage('Emergency SOS Broadcasted to District Health Officer & Nearest CHC!');
      setTimeout(() => setSyncMessage(null), 3000);
    }
  };

  const handleSyncQueue = () => {
    if (offlineQueue.length === 0) return;
    setSyncing(true);
    setTimeout(() => {
      setOfflineQueue([]);
      setSyncing(false);
      setSyncMessage('All offline records synchronized successfully!');
      setTimeout(() => setSyncMessage(null), 3000);
    }, 1200);
  };

  return (
    <main className="app-container">
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 4 }}>
          📱 ASHA / ANM Mobile App & Offline-Sync Simulator
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Simulates the frontline mobile application: offline local caching for remote tribal outposts, rapid dispensing, speech reporting, and emergency SOS
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 32, alignItems: 'flex-start' }}>
        
        {/* Smartphone Hardware Frame */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div
            style={{
              width: '360px',
              height: '710px',
              background: '#090d16',
              borderRadius: '44px',
              border: '10px solid #1e293b',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Top Phone Speaker / Punch Hole */}
            <div
              style={{
                width: '110px',
                height: '22px',
                background: '#1e293b',
                borderRadius: '0 0 14px 14px',
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <div style={{ width: 40, height: 4, background: '#334155', borderRadius: 2 }}></div>
              <div style={{ width: 6, height: 6, background: '#0284c7', borderRadius: '50%' }}></div>
            </div>

            {/* Mobile Status Bar */}
            <div
              style={{
                padding: '12px 18px 6px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.72rem',
                color: '#94a3b8',
                background: '#0f172a',
                borderBottom: '1px solid #1e293b',
              }}
            >
              <span>09:41</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {isOnline ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#10b981' }}>
                    <Wifi size={12} /> 4G Online
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#f87171' }}>
                    <WifiOff size={12} /> Offline Outpost
                  </span>
                )}
                <span>100% 🔋</span>
              </div>
            </div>

            {/* Mobile App Header */}
            <div style={{ padding: '10px 14px', background: '#131c31', borderBottom: '1px solid #1e293b' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f1f5f9' }}>संजीविनी Mobile</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>PHC Sonai, Cachar</div>
                </div>
                {offlineQueue.length > 0 && (
                  <span className="badge badge-warning" style={{ fontSize: '0.62rem' }}>
                    {offlineQueue.length} Offline Items
                  </span>
                )}
              </div>
            </div>

            {/* In-App Flash Feedback */}
            {syncMessage && (
              <div style={{ background: '#047857', color: '#ffffff', padding: '6px 10px', fontSize: '0.72rem', textAlign: 'center' }}>
                {syncMessage}
              </div>
            )}

            {/* Phone Screen Scrollable Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px', background: '#0b1120' }}>
              
              {/* TAB 1: Stock Quick-Action */}
              {activeTab === 'stock' && (
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', marginBottom: 10, textTransform: 'uppercase' }}>
                    Daily Dispensary Stock
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {phcStock.map((med) => (
                      <div
                        key={med.id}
                        style={{
                          background: '#131c31',
                          border: '1px solid #1e293b',
                          borderRadius: 8,
                          padding: '10px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.825rem', color: '#f1f5f9' }}>{med.name}</div>
                          <div style={{ fontSize: '0.7rem', color: med.count <= 10 ? '#f87171' : '#94a3b8' }}>
                            {med.count} {med.unit} left ({med.days}d buffer)
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <button
                            onClick={() => handleStockDelta(med.id, -5)}
                            style={{
                              background: '#7f1d1d',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: 4,
                              width: 26,
                              height: 26,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                            }}
                          >
                            <Minus size={13} />
                          </button>
                          <button
                            onClick={() => handleStockDelta(med.id, 10)}
                            style={{
                              background: '#047857',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: 4,
                              width: 26,
                              height: 26,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                            }}
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: Voice Report */}
              {activeTab === 'voice' && (
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: 12 }}>
                    Voice Recording for Frontline ASHA Workers
                  </div>

                  <div
                    onClick={() => {
                      setRecording(!recording);
                      if (!recording) handleProcessVoice();
                    }}
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: '50%',
                      background: recording ? '#dc2626' : '#059669',
                      margin: '0 auto 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                    }}
                  >
                    <Mic size={30} />
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: 14 }}>
                    {recording ? 'Listening in Hindi / Local language...' : 'Tap Mic to Speak Field Update'}
                  </div>

                  <div style={{ background: '#131c31', padding: '10px', borderRadius: 8, fontSize: '0.78rem', textAlign: 'left', border: '1px solid #1e293b', marginBottom: 12 }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.68rem', marginBottom: 2 }}>Spoken Audio:</div>
                    <div style={{ color: '#f1f5f9' }}>"{voiceQuery}"</div>
                  </div>

                  {voiceResult && (
                    <div style={{ background: '#064e3b', border: '1px solid #059669', borderRadius: 6, padding: '8px 10px', textAlign: 'left', fontSize: '0.75rem' }}>
                      <div style={{ color: '#a7f3d0', fontWeight: 600 }}>Action: {voiceResult.intent}</div>
                      <div style={{ color: '#ffffff', marginTop: 2 }}>{voiceResult.spoken_reply_indic}</div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: Camera Scanner */}
              {activeTab === 'camera' && (
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: 10 }}>
                    Physical Ledger & Blister Pack Scanner
                  </div>

                  <div
                    onClick={handleScanLedger}
                    style={{
                      border: '2px dashed #334155',
                      borderRadius: 10,
                      padding: '24px 12px',
                      textAlign: 'center',
                      background: '#131c31',
                      cursor: 'pointer',
                      marginBottom: 12,
                    }}
                  >
                    <Camera size={32} color="#059669" style={{ margin: '0 auto 6px' }} />
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f1f5f9' }}>
                      {scanning ? 'Gemini 1.5 Extracting...' : 'Tap to photograph stock ledger'}
                    </div>
                  </div>

                  {scannedData && (
                    <div style={{ background: '#131c31', padding: '10px', borderRadius: 8, border: '1px solid #1e293b', fontSize: '0.72rem' }}>
                      <div style={{ color: '#059669', fontWeight: 600, marginBottom: 4 }}>Extracted Ledger Rows:</div>
                      {scannedData.extracted_items?.slice(0, 3).map((item: any, idx: number) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #1e293b' }}>
                          <span>{item.drug_name}</span>
                          <strong style={{ color: '#10b981' }}>{item.quantity_recorded} {item.unit}</strong>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: Emergency SOS */}
              {activeTab === 'sos' && (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <ShieldAlert size={44} color="#dc2626" style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f1f5f9', marginBottom: 6 }}>
                    Emergency Stockout SOS
                  </div>
                  <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 18 }}>
                    Immediate fast-track requisition to District Medical Officer & nearest Community Health Centre
                  </p>

                  <button
                    onClick={handleTriggerSos}
                    style={{
                      width: '100%',
                      background: '#dc2626',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 8,
                      padding: '12px',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    {sosSent ? '🚨 SOS Dispatched!' : 'BROADCAST ASV / OXYTOCIN SOS'}
                  </button>
                </div>
              )}

            </div>

            {/* Bottom App Navigation Bar */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                background: '#0f172a',
                borderTop: '1px solid #1e293b',
                padding: '8px 0',
              }}
            >
              <button
                onClick={() => setActiveTab('stock')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: activeTab === 'stock' ? '#10b981' : '#64748b',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                  fontSize: '0.65rem',
                  cursor: 'pointer',
                }}
              >
                <Package size={16} />
                <span>Stock</span>
              </button>

              <button
                onClick={() => setActiveTab('voice')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: activeTab === 'voice' ? '#10b981' : '#64748b',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                  fontSize: '0.65rem',
                  cursor: 'pointer',
                }}
              >
                <Mic size={16} />
                <span>Voice</span>
              </button>

              <button
                onClick={() => setActiveTab('camera')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: activeTab === 'camera' ? '#10b981' : '#64748b',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                  fontSize: '0.65rem',
                  cursor: 'pointer',
                }}
              >
                <Camera size={16} />
                <span>Scan</span>
              </button>

              <button
                onClick={() => setActiveTab('sos')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: activeTab === 'sos' ? '#dc2626' : '#64748b',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                  fontSize: '0.65rem',
                  cursor: 'pointer',
                }}
              >
                <AlertTriangle size={16} />
                <span>SOS</span>
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Inspector & Controls Panel */}
        <div>
          {/* Simulator Control Card */}
          <div className="glass-panel" style={{ padding: '20px', marginBottom: 20 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: 12 }}>
              Connectivity & Environment Controls
            </h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <button
                className={isOnline ? 'btn-primary' : 'btn-outline'}
                onClick={() => setIsOnline(true)}
              >
                <Wifi size={15} />
                <span>4G / 5G Online Mode</span>
              </button>
              <button
                className={!isOnline ? 'btn-primary' : 'btn-outline'}
                onClick={() => setIsOnline(false)}
                style={!isOnline ? { background: '#dc2626', borderColor: '#b91c1c' } : {}}
              >
                <WifiOff size={15} />
                <span>Simulate Zero-Connectivity Outpost</span>
              </button>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              In rural and tribal primary health centres, internet connectivity is intermittent. Sanjeevini's mobile client queues stock adjustments, voice notes, and emergency requisitions in local IndexedDB storage, and automatically flushes them when internet returns.
            </p>
          </div>

          {/* Offline Queue Inspector */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Local Offline Queue</h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {offlineQueue.length} transactions pending synchronization
                </div>
              </div>

              <button
                className="btn-primary"
                onClick={handleSyncQueue}
                disabled={offlineQueue.length === 0 || syncing || !isOnline}
              >
                <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
                <span>{syncing ? 'Flushing Queue...' : 'Sync Pending Items to Cloud'}</span>
              </button>
            </div>

            {offlineQueue.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                <CheckCircle2 size={24} color="#059669" style={{ margin: '0 auto 6px' }} />
                <div>Queue is clean. All field transactions are synced in real time.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {offlineQueue.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: 'var(--bg-app)',
                      border: '1px solid var(--border-card)',
                      borderRadius: 6,
                      padding: '10px 12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span className="badge badge-warning" style={{ fontSize: '0.62rem' }}>{item.type}</span>
                        <span style={{ fontSize: '0.825rem', fontWeight: 600 }}>{item.details}</span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        Captured at {item.timestamp} (Local Cache)
                      </div>
                    </div>
                    <Clock size={15} color="var(--text-muted)" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
};
