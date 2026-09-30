import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { FederatedStatus } from '../types';
import { Network, ShieldCheck, Play, RefreshCw, Lock, Database } from 'lucide-react';
import { Line } from 'react-chartjs-2';

export const FederatedSimulator: React.FC = () => {
  const [status, setStatus] = useState<FederatedStatus | null>(null);
  const [training, setTraining] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await api.getFederatedStatus();
      setStatus(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleTrainRound = async () => {
    setTraining(true);
    try {
      const res = await api.trainFederatedRound();
      setStatus(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setTraining(false);
    }
  };

  const chartData = {
    labels: status?.training_history.map((h) => `Round ${h.round}`) || [],
    datasets: [
      {
        label: 'Global Model Loss (Cross-State Convergence)',
        data: status?.training_history.map((h) => h.global_loss) || [],
        borderColor: '#34d399',
        backgroundColor: 'rgba(52, 211, 153, 0.15)',
        fill: true,
        tension: 0.3,
      },
      {
        label: 'Predictive Stockout Accuracy',
        data: status?.training_history.map((h) => h.global_accuracy) || [],
        borderColor: '#60a5fa',
        tension: 0.3,
      },
    ],
  };

  return (
    <main className="app-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Network size={24} color="#34d399" />
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
              Federated Predictive Modeling & Data Sovereignty
            </h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Shared epidemiological time-series learning across India's states while respecting Schedule 7 on-premise healthcare data boundaries
          </p>
        </div>

        <button className="btn-primary" onClick={handleTrainRound} disabled={training}>
          <Play size={16} />
          <span>{training ? 'Aggregating Gradients...' : 'Run Federated Aggregation Round (FedAvg)'}</span>
        </button>
      </div>

      {/* Compliance Pill */}
      <div style={{ background: 'hsla(150, 70%, 42%, 0.15)', border: '1px solid hsla(150, 70%, 42%, 0.3)', padding: '12px 18px', borderRadius: 10, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        <Lock size={18} color="#34d399" />
        <span style={{ fontSize: '0.825rem' }}>
          <strong>Data Sovereignty Guarantee:</strong> {status?.data_sovereignty_compliance}. Differential Privacy Budget: <strong>ε = {status?.differential_privacy_epsilon}</strong>. No identifiable patient record ever crosses state border servers.
        </span>
      </div>

      {/* Top Metrics */}
      <div className="grid-stats">
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Current Federated Round</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#34d399' }}>Round #{status?.current_round}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Model Version: {status?.global_model_version}</div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Global Cross-Entropy Loss</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{status?.global_loss}</div>
          <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: 4 }}>Converging steadily</div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Stockout Prediction Accuracy</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#60a5fa' }}>{((status?.global_accuracy || 0) * 100).toFixed(1)}%</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Across all 6 state clusters</div>
        </div>
      </div>

      {/* Training Chart */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: 24 }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>Multi-Round Convergence Trajectory</h3>
        <div style={{ height: 260 }}>
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
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>Participating State Edge Nodes</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>State Node</th>
                <th>Active PHC Network</th>
                <th>Local Samples Trained</th>
                <th>Local Loss</th>
                <th>Accuracy</th>
                <th>Privacy Budget (ε)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {status?.state_nodes.map((node) => (
                <tr key={node.state_code}>
                  <td style={{ fontWeight: 600 }}>{node.state_name} ({node.state_code})</td>
                  <td>{node.active_phcs.toLocaleString()} facilities</td>
                  <td>{node.samples_trained.toLocaleString()} records</td>
                  <td style={{ color: '#34d399', fontWeight: 600 }}>{node.local_loss}</td>
                  <td style={{ color: '#60a5fa', fontWeight: 600 }}>{(node.local_accuracy * 100).toFixed(1)}%</td>
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
    </main>
  );
};
