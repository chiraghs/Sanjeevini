import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { FederatedStatus } from '../types';
import { NetworkLoader } from '../components/NetworkLoader';
import { Network, Play, Lock, RefreshCw, CheckCircle2 } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Ensure Chart.js controllers and scales are registered
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const DEFAULT_FEDERATED: FederatedStatus = {
  current_round: 15,
  global_model_version: 'v4.0.0',
  global_loss: 0.1653,
  global_accuracy: 0.944,
  differential_privacy_epsilon: 0.85,
  data_sovereignty_compliance: '100% On-Premise (No PII / OPD records leave state boundaries)',
  state_nodes: [
    { state_code: 'MH', state_name: 'Maharashtra', active_phcs: 1824, samples_trained: 42000, local_loss: 0.1692, local_accuracy: 0.956, privacy_budget_consumed: 0.87, last_gradient_sync: 'Just now', status: 'ONLINE_SYNCED' },
    { state_code: 'UP', state_name: 'Uttar Pradesh', active_phcs: 3620, samples_trained: 88000, local_loss: 0.1741, local_accuracy: 0.938, privacy_budget_consumed: 0.82, last_gradient_sync: 'Just now', status: 'ONLINE_SYNCED' },
    { state_code: 'AS', state_name: 'Assam', active_phcs: 1048, samples_trained: 26000, local_loss: 0.1584, local_accuracy: 0.949, privacy_budget_consumed: 0.85, last_gradient_sync: 'Just now', status: 'ONLINE_SYNCED' },
    { state_code: 'KL', state_name: 'Kerala', active_phcs: 920, samples_trained: 31000, local_loss: 0.1498, local_accuracy: 0.962, privacy_budget_consumed: 0.90, last_gradient_sync: 'Just now', status: 'ONLINE_SYNCED' },
    { state_code: 'RJ', state_name: 'Rajasthan', active_phcs: 2150, samples_trained: 49000, local_loss: 0.1685, local_accuracy: 0.941, privacy_budget_consumed: 0.84, last_gradient_sync: 'Just now', status: 'ONLINE_SYNCED' },
    { state_code: 'BR', state_name: 'Bihar', active_phcs: 2480, samples_trained: 58000, local_loss: 0.1712, local_accuracy: 0.935, privacy_budget_consumed: 0.81, last_gradient_sync: 'Just now', status: 'ONLINE_SYNCED' }
  ],
  training_history: [
    { round: 1, global_loss: 0.48, global_accuracy: 0.72, participating_nodes: 6 },
    { round: 5, global_loss: 0.35, global_accuracy: 0.81, participating_nodes: 6 },
    { round: 10, global_loss: 0.22, global_accuracy: 0.89, participating_nodes: 6 },
    { round: 15, global_loss: 0.1653, global_accuracy: 0.944, participating_nodes: 6 }
  ]
};

export const FederatedSimulator: React.FC = () => {
  const [status, setStatus] = useState<FederatedStatus>(() => {
    try {
      const cached = localStorage.getItem('sanjeevini_federated_status');
      return cached ? JSON.parse(cached) : DEFAULT_FEDERATED;
    } catch {
      return DEFAULT_FEDERATED;
    }
  });
  const [isSyncing, setIsSyncing] = useState(true);
  const [training, setTraining] = useState(false);
  const [roundMessage, setRoundMessage] = useState<string | null>(null);

  const fetchStatus = async () => {
    setIsSyncing(true);
    try {
      const res = await api.getFederatedStatus();
      if (res.data) {
        setStatus(res.data);
        localStorage.setItem('sanjeevini_federated_status', JSON.stringify(res.data));
      }
    } catch (e) {
      console.warn('Federated status background sync paused, using cached status:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleTrainRound = async () => {
    setTraining(true);
    setRoundMessage(null);
    try {
      const res = await api.trainFederatedRound();
      setStatus(res.data);
      localStorage.setItem('sanjeevini_federated_status', JSON.stringify(res.data));
      setRoundMessage(`Round #${res.data.current_round} aggregated successfully! Global loss reduced to ${res.data.global_loss}`);
      setTimeout(() => setRoundMessage(null), 4000);
    } catch (e) {
      console.error('Failed to trigger federated round:', e);
    } finally {
      setTraining(false);
    }
  };

  const chartData = {
    labels: (status.training_history || []).map((h) => `Round ${h.round}`),
    datasets: [
      {
        label: 'Global Model Loss (Cross-State Convergence)',
        data: (status.training_history || []).map((h) => h.global_loss),
        borderColor: '#059669',
        backgroundColor: 'rgba(5, 150, 105, 0.1)',
        fill: true,
        tension: 0.2,
      },
      {
        label: 'Stockout Prediction Accuracy',
        data: (status.training_history || []).map((h) => h.global_accuracy),
        borderColor: '#1d4ed8',
        tension: 0.2,
      },
    ],
  };

  return (
    <main className="app-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0 }}>
              Federated Predictive Modeling & Data Sovereignty
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
                Syncing Nodes (Background)
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
                6 State Nodes Connected
              </span>
            )}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
            Collaborative epidemiological forecasting across India's states while respecting Schedule 7 on-premise healthcare data boundaries
          </p>
        </div>

        <button className="btn-primary" onClick={handleTrainRound} disabled={training}>
          <Play size={14} />
          <span>{training ? 'Aggregating Gradients...' : 'Run Federated Aggregation Round (FedAvg)'}</span>
        </button>
      </div>

      {roundMessage && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--emerald)', color: 'var(--emerald)', padding: '10px 14px', borderRadius: 6, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
          <CheckCircle2 size={16} />
          <span>{roundMessage}</span>
        </div>
      )}

      {/* Compliance Pill */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', padding: '10px 14px', borderRadius: 6, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Lock size={16} color="var(--emerald)" />
        <span style={{ fontSize: '0.8rem' }}>
          <strong>Healthcare Data Sovereignty:</strong> {status.data_sovereignty_compliance}. Differential Privacy Budget: <strong>ε = {status.differential_privacy_epsilon}</strong>. No identifiable patient record ever crosses state boundaries.
        </span>
      </div>

      {/* Top Metrics */}
      <div className="grid-stats">
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current Federated Round</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--emerald)' }}>Round #{status.current_round}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>Model: {status.global_model_version}</div>
        </div>

        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Global Cross-Entropy Loss</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{status.global_loss}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--emerald)', marginTop: 2 }}>Converging steadily</div>
        </div>

        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Stockout Prediction Accuracy</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1d4ed8' }}>{((status.global_accuracy || 0) * 100).toFixed(1)}%</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>Across all 6 state clusters</div>
        </div>
      </div>

      {/* Training Chart */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: 20 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 14 }}>Multi-Round Convergence Trajectory</h3>
        <div style={{ height: 240 }}>
          <Line
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: 'top', labels: { color: '#94a3b8' } },
              },
              scales: {
                x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
                y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#94a3b8' } },
              },
            }}
          />
        </div>
      </div>

      {/* Participating State Nodes */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>National Inter-State Edge Nodes (India)</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Schedule 7 on-premise boundary enforcement — models train locally inside state health data centers
            </p>
          </div>
          <span className="badge badge-stable">6 State Clusters Active</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>State Node</th>
                <th>Active PHC Network</th>
                <th>Local Records</th>
                <th>Local Loss</th>
                <th>Accuracy</th>
                <th>Privacy Budget (ε)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(status.state_nodes || []).map((node) => (
                <tr key={node.state_code}>
                  <td style={{ fontWeight: 600 }}>{node.state_name} ({node.state_code})</td>
                  <td>{node.active_phcs.toLocaleString()} facilities</td>
                  <td>{node.samples_trained.toLocaleString()} records</td>
                  <td style={{ color: 'var(--emerald)', fontWeight: 600 }}>{node.local_loss}</td>
                  <td style={{ color: '#1d4ed8', fontWeight: 600 }}>{(node.local_accuracy * 100).toFixed(1)}%</td>
                  <td>{node.privacy_budget_consumed}</td>
                  <td>
                    <span className="badge badge-stable">{node.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* BRICS International Shared Predictive Modeling */}
      <div className="glass-panel" style={{ padding: '20px', borderLeft: '4px solid #1e40af' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.2rem' }}>🌍</span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                BRICS Health Partnership: Shared Predictive Modeling Consortium
              </h3>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Cross-nation collaborative epidemiological demand modeling across Brazil, Russia, India, China, and South Africa with zero cross-border health data leakage
            </p>
          </div>
          <span className="badge badge-stable" style={{ background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' }}>
            5 Sovereign Nations Synced
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Partner Nation</th>
                <th>Designated Health Grid Institution</th>
                <th>Active Primary Centers</th>
                <th>Epidemiological Focus Area</th>
                <th>Privacy Protocol</th>
                <th>Local Accuracy</th>
                <th>Sovereignty Link</th>
              </tr>
            </thead>
            <tbody>
              {(status.brics_nodes || []).map((brics) => (
                <tr key={brics.country_code}>
                  <td style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                    <span style={{ marginRight: 6, fontSize: '1.1rem' }}>{brics.flag}</span>
                    {brics.country_name}
                  </td>
                  <td style={{ fontSize: '0.8rem', fontWeight: 500 }}>{brics.institution}</td>
                  <td style={{ fontWeight: 600 }}>{brics.active_centers.toLocaleString()} centers</td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{brics.focus_area}</td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--emerald)' }}>{brics.privacy_model}</td>
                  <td style={{ color: '#1d4ed8', fontWeight: 600 }}>{(brics.local_accuracy * 100).toFixed(1)}%</td>
                  <td>
                    <span className="badge badge-stable" style={{ fontSize: '0.65rem' }}>
                      {brics.status}
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
