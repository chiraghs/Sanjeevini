import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { NationalCommand } from './pages/NationalCommand';
import { LiveResourceMap } from './pages/LiveResourceMap';
import { DistrictLogistics } from './pages/DistrictLogistics';
import { PhcGroundConsole } from './pages/PhcGroundConsole';
import { MultimodalScanner } from './pages/MultimodalScanner';
import { VoiceAssistant } from './pages/VoiceAssistant';
import { FederatedSimulator } from './pages/FederatedSimulator';

export const App: React.FC = () => {
  const [activeRole, setActiveRole] = useState<string>('national');

  return (
    <LanguageProvider>
      <Router>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar activeRole={activeRole} setActiveRole={setActiveRole} />
          <div style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<NationalCommand />} />
              <Route path="/map" element={<LiveResourceMap />} />
              <Route path="/logistics" element={<DistrictLogistics />} />
              <Route path="/phc" element={<PhcGroundConsole />} />
              <Route path="/scan" element={<MultimodalScanner />} />
              <Route path="/voice" element={<VoiceAssistant />} />
              <Route path="/federated" element={<FederatedSimulator />} />
            </Routes>
          </div>
          <footer style={{ borderTop: '1px solid var(--border-card)', padding: '16px 24px', textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <div>
              <strong>संजीविनी (Sanjeevini)</strong> — Federated AI for National Health Resource & Supply Chain Resilience
            </div>
            <div style={{ marginTop: 4 }}>
              Powered by Google AI (Gemini 1.5 Flash Vision, Vertex AI Time-Series, Cloud STT/TTS & Indic Translation) | MoHFW & State Health Missions
            </div>
          </footer>
        </div>
      </Router>
    </LanguageProvider>
  );
};

export default App;
