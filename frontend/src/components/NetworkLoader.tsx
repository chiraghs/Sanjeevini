import React, { useEffect, useState } from 'react';
import { Activity, RefreshCw, Server, ShieldCheck, Wifi } from 'lucide-react';

interface NetworkLoaderProps {
  message?: string;
  onRetry?: () => void;
}

const STEPS = [
  'Connecting to MoHFW Health Resource Network...',
  'Ingesting real-time telemetry from 1,000+ PHC nodes...',
  'Synchronizing NLEM critical medicine inventory levels...',
  'Calibrating epidemiological surge & redistribution models...',
];

export const NetworkLoader: React.FC<NetworkLoaderProps> = ({
  message,
  onRetry,
}) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % STEPS.length);
    }, 2800);

    const timerInterval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(stepInterval);
      clearInterval(timerInterval);
    };
  }, []);

  const activeMessage = message || STEPS[stepIndex];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '440px',
        padding: '40px 20px',
        textAlign: 'center',
      }}
    >
      {/* Outer Pulse Rings with Central Health Icon */}
      <div
        style={{
          position: 'relative',
          width: '90px',
          height: '90px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
        }}
      >
        {/* Radar Ring 1 */}
        <div
          className="animate-ping"
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            backgroundColor: 'rgba(5, 150, 105, 0.25)',
          }}
        />

        {/* Radar Ring 2 - Rotating Spinner Ring */}
        <div
          className="animate-spin"
          style={{
            position: 'absolute',
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            border: '3px solid transparent',
            borderTopColor: 'var(--emerald)',
            borderRightColor: 'var(--primary)',
          }}
        />

        {/* Central Core Pulse Orb */}
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--emerald) 0%, #1e40af 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 8px 20px rgba(5, 150, 105, 0.35)',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <Activity size={26} className="animate-pulse" />
        </div>
      </div>

      {/* Main Status Text */}
      <div
        style={{
          fontSize: '1.05rem',
          fontWeight: 700,
          color: 'var(--text-main)',
          marginBottom: '6px',
          letterSpacing: '-0.01em',
          minHeight: '28px',
          transition: 'all 0.3s ease',
        }}
      >
        {activeMessage}
      </div>

      {/* Subtitle / Telemetry Detail */}
      <div
        style={{
          fontSize: '0.825rem',
          color: 'var(--text-muted)',
          maxWidth: '460px',
          lineHeight: 1.5,
          marginBottom: '18px',
        }}
      >
        Real-time telemetry link &bull; Ministry of Health & Family Welfare (MoHFW) Data Grid
      </div>

      {/* Progress Shimmer Bar */}
      <div
        style={{
          width: '260px',
          height: '6px',
          borderRadius: '999px',
          background: 'var(--border-card)',
          overflow: 'hidden',
          marginBottom: '16px',
        }}
      >
        <div
          className="shimmer-bar"
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      </div>

      {/* Connection Metadata / Cold-Start Indicator */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.75rem',
          color: 'var(--text-subtle)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          padding: '4px 12px',
          borderRadius: '20px',
        }}
      >
        <Server size={12} color="var(--emerald)" />
        <span>Syncing telemetry ({elapsedSeconds}s)</span>
        {elapsedSeconds > 6 && (
          <span style={{ color: 'var(--text-muted)' }}>
            &bull; Initializing cloud containers
          </span>
        )}
      </div>

      {/* Reassurance Alert after 12 seconds (typical for Render cold-starts) */}
      {elapsedSeconds >= 10 && (
        <div
          style={{
            marginTop: '16px',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            background: 'var(--bg-card)',
            border: '1px dashed var(--border-card)',
            borderRadius: '6px',
            padding: '8px 14px',
            maxWidth: '440px',
          }}
        >
          Cloud instance is waking up from standby. Your dashboard will appear automatically momentarily.
        </div>
      )}

      {/* Manual Retry Option if taking long */}
      {elapsedSeconds >= 20 && onRetry && (
        <button
          onClick={onRetry}
          className="btn-outline"
          style={{ marginTop: '16px', fontSize: '0.8rem', padding: '6px 14px' }}
        >
          <RefreshCw size={13} />
          <span>Retry Connection</span>
        </button>
      )}
    </div>
  );
};
