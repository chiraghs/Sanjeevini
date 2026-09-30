# Walkthrough: संजीवनी सेतु (SanjeevaniSetu)

### *Federated AI Platform for National Health Resource & Supply Chain Resilience across India's PHC Network*

We have engineered and verified the complete end-to-end platform in [`/Volumes/DiskD/HACKATHONS/smart-health`](file:///Volumes/DiskD/HACKATHONS/smart-health), adopting the architecture, UX, and engineering patterns of [`Civic-Pulse`](file:///Volumes/DiskD/HACKATHONS/Civic-Pulse).

---

## 1. What Was Built

### A. Dedicated Skill
- [`.agent/skills/smart-health-resilience/SKILL.md`](file:///Volumes/DiskD/HACKATHONS/smart-health/.agent/skills/smart-health-resilience/SKILL.md): Comprehensive reference guide covering Google AI integrations (Gemini 1.5 Flash Vision OCR, Vertex AI Time-Series, Cloud STT/TTS, Indic Translation), federated multi-state learning patterns, and NLEM pharmaceutical supply chain workflows.

### B. Indic Application Brand
- **Name**: **संजीवनी सेतु (SanjeevaniSetu)**
- **Subtitle**: *National Health Resource & Supply Chain Resilience Platform (राष्ट्रीय स्वास्थ्य संसाधन एवं आपूर्ति श्रृंखला लचीलापन मंच)*
- **Etymology**: *Sanjeevani* (the mythical Himalayan herb that revived Lakshmana in the Ramayana, flown across provinces in record time) + *Setu* (the resilient bridge connecting remote PHCs to national lifelines).

---

## 2. Technical Components Delivered

### Backend Service ([`backend/`](file:///Volumes/DiskD/HACKATHONS/smart-health/backend))
- **Framework**: FastAPI + SQLAlchemy 2.0 + Pydantic v2 + Prometheus Instrumentor.
- **Database**: SQLite default (zero-configuration local run) with seamless auto-switch to PostgreSQL / Cloud SQL.
- **Data Models**:
  - `Facility`: PHC, CHC, and District Hospital models with beds, ICU, oxygen points, and cold-chain status.
  - `Medicine`: National List of Essential Medicines (NLEM) catalogue (antivenom, oxytocin, insulin, IV fluids, ORS, antibiotics).
  - `Inventory`: Real-time stock levels, batch tracking, expiry countdowns, and daily burn rates.
  - `RedistributionTransfer`: Inter-facility logistics records, dispatch status, vehicle tracking, cold-chain temperature telemetry, and e-Challan codes.
  - `HealthAlert`: Active vector-borne, monsoon flood, and snakebite surveillance alerts.
  - `FederatedRound`: Multi-state FedAvg weight aggregation models with differential privacy tracking ($\epsilon=0.85$).
- **AI & Analytics Services**:
  - [`gemini_client.py`](file:///Volumes/DiskD/HACKATHONS/smart-health/backend/app/services/gemini_client.py): Google Gemini 1.5 Flash client with structured JSON output and intelligent fallback simulator.
  - [`multimodal_ocr.py`](file:///Volumes/DiskD/HACKATHONS/smart-health/backend/app/services/multimodal_ocr.py): Vision OCR extracting handwritten stock ledgers and drug blister packs.
  - [`demand_forecasting.py`](file:///Volumes/DiskD/HACKATHONS/smart-health/backend/app/services/demand_forecasting.py): Hybrid statistical + epidemiological surge demand modeling (e.g. Flood $\rightarrow$ $+220\%$ ORS surge).
  - [`redistribution_engine.py`](file:///Volumes/DiskD/HACKATHONS/smart-health/backend/app/services/redistribution_engine.py): Multi-objective optimization pairing deficit PHCs with nearby surplus donor hubs while prioritizing near-expiry stock.
  - [`federated_engine.py`](file:///Volumes/DiskD/HACKATHONS/smart-health/backend/app/services/federated_engine.py): Simulated FedAvg orchestrator for 6 state health nodes (MH, UP, AS, KL, RJ, BR).
  - [`voice_indic.py`](file:///Volumes/DiskD/HACKATHONS/smart-health/backend/app/services/voice_indic.py): Multilingual speech processing supporting 8 Indic languages.

### Frontend Application ([`frontend/`](file:///Volumes/DiskD/HACKATHONS/smart-health/frontend))
- **Stack**: Vite + React 18 + TypeScript + Leaflet GIS + Chart.js + Lucide Icons.
- **Styling**: `Civic-Pulse` glassmorphism palette adapted for healthcare (Ashoka Navy, Sanjeevani Emerald, Emergency Saffron, Stockout Danger Red, dark/light theme toggle).
- **Views**:
  1. [`NationalCommand.tsx`](file:///Volumes/DiskD/HACKATHONS/smart-health/frontend/src/pages/NationalCommand.tsx): MoHFW Executive Command Deck with national resilience scores, active outbreaks, and critical stockout watchlist.
  2. [`LiveResourceMap.tsx`](file:///Volumes/DiskD/HACKATHONS/smart-health/frontend/src/pages/LiveResourceMap.tsx): Full-screen Leaflet GIS map with clustered PHC markers color-coded by stock risk, bed occupancy popups, and outbreak heat zones.
  3. [`DistrictLogistics.tsx`](file:///Volumes/DiskD/HACKATHONS/smart-health/frontend/src/pages/DistrictLogistics.tsx): AI redistribution recommendation hub with 1-click dispatch approval, e-Challan generation, and active convoy tracking.
  4. [`PhcGroundConsole.tsx`](file:///Volumes/DiskD/HACKATHONS/smart-health/frontend/src/pages/PhcGroundConsole.tsx): Fast ground terminal for PHC pharmacists to adjust stock levels and log doctor attendance.
  5. [`MultimodalScanner.tsx`](file:///Volumes/DiskD/HACKATHONS/smart-health/frontend/src/pages/MultimodalScanner.tsx): Gemini 1.5 Flash Vision OCR camera interface to scan physical paper registers into structured database rows.
  6. [`VoiceAssistant.tsx`](file:///Volumes/DiskD/HACKATHONS/smart-health/frontend/src/pages/VoiceAssistant.tsx): Indic voice assistant for ASHA/ANM workers with speech synthesis confirmation.
  7. [`FederatedSimulator.tsx`](file:///Volumes/DiskD/HACKATHONS/smart-health/frontend/src/pages/FederatedSimulator.tsx): Visualizer for state-level model training, convergence curves, and data sovereignty compliance.

---

## 3. Verification Results

### Backend Automated Test Suite
Executed in `/Volumes/DiskD/HACKATHONS/smart-health/backend`:
```
======================== 7 passed, 20 warnings in 0.40s ========================
```
- ✅ `test_health`: Verified `/health` endpoint and Gemini model configuration.
- ✅ `test_national_summary`: Verified aggregation of total facilities, beds, and resilience index.
- ✅ `test_facilities_and_markers`: Verified facility catalog and Leaflet GeoJSON markers.
- ✅ `test_inventory_and_update`: Verified live stock delta adjustments and recalculation of days-to-stockout.
- ✅ `test_redistribution_recommendations`: Verified AI bipartite transfer pairing.
- ✅ `test_federated_learning`: Verified 6-state gradient tracking and collaborative training round progression.
- ✅ `test_voice_indic`: Verified Indic voice parsing and intent extraction.

### Frontend Production Build
Executed in `/Volumes/DiskD/HACKATHONS/smart-health/frontend`:
```
✓ 1614 modules transformed.
dist/index.html                   1.07 kB │ gzip:   0.62 kB
dist/assets/index-D3PanwE4.css    3.74 kB │ gzip:   1.35 kB
dist/assets/index-6E5V2JRR.js   548.21 kB │ gzip: 176.76 kB
✓ built in 1.02s
```
- ✅ Zero TypeScript or linter errors.
- ✅ Production bundle generated ready for deployment on Cloud Run, Firebase Hosting, or Render.

---

## 4. How to Run the Platform

From the project root:
```bash
cd /Volumes/DiskD/HACKATHONS/smart-health
./setup.sh
```

Or run services independently:

**Terminal 1 (Backend API):**
```bash
cd /Volumes/DiskD/HACKATHONS/smart-health/backend
PYTHONPATH=. ./venv/bin/uvicorn app.main:app --reload --port 8000
```

**Terminal 2 (Frontend UI):**
```bash
cd /Volumes/DiskD/HACKATHONS/smart-health/frontend
npm run dev
```

Open:
- **Interactive UI**: `http://localhost:5173`
- **Swagger Documentation**: `http://localhost:8000/docs`
- **Prometheus Metrics**: `http://localhost:8000/metrics`
