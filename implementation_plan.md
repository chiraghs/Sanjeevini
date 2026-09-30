# Implementation Plan: Federated National Health Supply Chain & Resource Resilience Platform

A federated AI platform for national-scale health resource and pharmaceutical supply chain management across India's Primary Health Centres (PHCs), Community Health Centres (CHCs), and District Hospitals (DHs). It delivers real-time visibility into medicine stocks, bed availability, and medical staff attendance, forecasts demand spikes during epidemiological and climate emergencies, and automates cross-district resource redistribution while respecting state-level healthcare data sovereignty through federated learning.

Modeled after and referencing the production architectural and UI design patterns established in [Civic-Pulse](file:///Volumes/DiskD/HACKATHONS/Civic-Pulse), tailored specifically for India's public health logistics and the hackathon's evaluation parameters (100% total: 20% Problem-Solution Fit, 25% AI/Technical Execution, 20% Depth & Reach Across India, 15% Impact Potential, 20% Deployability & Scalability).

---

## 1. Application Name Suggestions (Indic Names)

We have evaluated culturally resonant, Indic names deeply rooted in Indian healthcare, mythology, and public resilience:

### **Option 1: संजीवनी सेतु (SanjeevaniSetu) — RECOMMENDED**
- **Etymology**: *Sanjeevani* (the mythical Himalayan herb that revived Lakshmana in the Ramayana, transported across provinces in record time) + *Setu* (the resilient bridge connecting remote outposts to central lifelines).
- **Tagline**: *"Bridging the Last Mile in India's Healthcare Supply Chain"*
- **Why it wins**: Immediately understood across Hindi, Bengali, Marathi, Gujarati, and southern states. Perfectly embodies urgent cross-district medicine redistribution and emergency life-saving logistics.

### **Option 2: आरोग्य प्रवाह (ArogyaPravah)**
- **Etymology**: *Arogya* (wellbeing / disease-free state) + *Pravah* (uninterrupted, continuous dynamic flow).
- **Tagline**: *"Uninterrupted Flow of Medicines, Beds, and Care Across India's PHCs"*
- **Why it fits**: Emphasizes supply chain continuity and eliminating drug stockouts and bottlenecks.

### **Option 3: प्राणसेतु (PranaSetu)**
- **Etymology**: *Prana* (vital life force / breath) + *Setu* (bridge).
- **Tagline**: *"AI-Powered Lifeline for Primary Health Centers"*
- **Why it fits**: Highly impactful, concise, and symbolizes life-critical medicines (oxygen, antivenom, insulin, oxytocin).

### **Option 4: औषध चक्र (AushadhChakra)**
- **Etymology**: *Aushadh* (medicine / pharmaceutical) + *Chakra* (dynamic cycle, circular resilience and redistribution).
- **Tagline**: *"Dynamic National Pharmaceutical Redistribution Network"*

> [!NOTE]
> Throughout this plan, we will reference the platform as **SanjeevaniSetu (संजीवनी सेतु)**, while allowing easy rebranding if the user selects another option.

---

## User Review Required

> [!IMPORTANT]
> **Key Architectural Decisions for Approval**:
> 1. **Default Database**: Local development defaults to SQLite with automated migrations; production connects seamlessly to PostgreSQL / Cloud SQL via environment variables.
> 2. **Google AI Dual-Mode**: Every AI service (Gemini 1.5 Flash Vision, Gemini Text, Cloud STT/TTS, Vertex AI Time Series) includes an **intelligent local heuristic / simulation fallback**. This guarantees that judges and reviewers can run the entire application end-to-end even without active Google Cloud API keys or credits.
> 3. **Federated Learning Approach**: Because health is a State subject under Schedule 7 of the Indian Constitution, individual PHC OPD records cannot be centralized. We implement a simulated **Federated Averaging (FedAvg)** server in FastAPI that aggregates differential-privacy model weight updates across State Nodes (e.g. Maharashtra, Uttar Pradesh, Kerala, Assam) without exposing raw patient records.

---

## Open Questions

> [!NOTE]
> 1. Which Indic name do you prefer for the platform? We recommend **SanjeevaniSetu (संजीवनी सेतु)**.
> 2. Should we pre-seed specific high-profile emergency scenarios for the demo (e.g., *Post-Monsoon Dengue Surge in Assam/Bihar*, *Antivenom Shortage in Rural Maharashtra*, and *Heatwave IV-Fluid Requisition in Rajasthan*)? We have designed realistic demo seeds for these exact scenarios.

---

## Proposed Architecture & Component Overview

Modeled directly after `Civic-Pulse`'s proven frontend and backend design:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        SANJEEVANISETU ARCHITECTURE OVERVIEW                           │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  [ FRONTEND - Vite + React 18 + TS + Tailwind/CSS Variables + Leaflet GIS + Chart.js ] │
│  ├── National MoHFW Executive Command View (Pan-India stockouts, epidemic heatmaps)   │
│  ├── District Health Officer (DMO) Redistribution Hub (Approval & transfer routes)     │
│  ├── PHC Clinic Console (Real-time stock balance, bed occupancy, doctor check-in)      │
│  ├── Multimodal Scanner (Camera upload of physical register / medicine packaging)       │
│  ├── Voice-First Indic Assistant (Web Audio -> STT -> Gemini Entity Extraction -> TTS) │
│  └── Federated Learning Simulator (Cross-state weight aggregation & model accuracy)    │
│                                                                                        │
│                                  │ HTTP / SSE / REST                                   │
│                                  ▼                                                     │
│  [ BACKEND - FastAPI + SQLAlchemy 2.0 + Pydantic v2 + Prometheus Instrumentor ]        │
│  ├── api/v1/facilities: PHC/CHC/DH geolocation, capacity, tier hierarchy               │
│  ├── api/v1/inventory: NLEM drug stocks, batch tracking, expiry countdowns            │
│  ├── api/v1/forecast: Time-series burn rates + Gemini epidemic impact reasoning        │
│  ├── api/v1/redistribution: Graph-based supply redistribution optimizer                │
│  ├── api/v1/multimodal: Gemini 1.5 Flash vision OCR for paper register digitization    │
│  ├── api/v1/voice: Multilingual Indic speech recognition & text-to-speech              │
│  └── api/v1/federated: Simulated FedAvg coordinator for inter-state model training     │
│                                                                                        │
│                                  │                                                     │
│            ┌─────────────────────┼──────────────────────┬────────────────────┐         │
│            ▼                     ▼                      ▼                    ▼         │
│     [ Local / Cloud DB ]    [ Google AI ]        [ Analytics/Cache ]   [ Public Data ] │
│     - SQLite / Postgres     - Gemini 1.5 Flash   - BigQuery Client     - data.gov.in   │
│     - Automatic migrations  - Vertex AI Model    - Redis (TokenBucket) - HMIS / IDSP   │
│     - Deterministic seeds   - Cloud STT / TTS    - In-memory fallback  - IMD Weather   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Proposed Changes & File Structure

All code will be created inside `/Volumes/DiskD/HACKATHONS/smart-health`.

### 1. Root Configuration & Project Scaffold

#### [NEW] [README.md](file:///Volumes/DiskD/HACKATHONS/smart-health/README.md)
Comprehensive project documentation, problem statement, Google AI architectural diagrams, Indic name rationale, setup instructions, hackathon evaluation checklist, and API schema docs.

#### [NEW] [setup.sh](file:///Volumes/DiskD/HACKATHONS/smart-health/setup.sh)
Single-command developer bootstrapper that provisions Python virtualenv, installs backend and frontend dependencies, initializes the database with 1,000+ PHCs across 15 states, and launches both servers concurrently.

#### [NEW] [docker-compose.yml](file:///Volumes/DiskD/HACKATHONS/smart-health/docker-compose.yml)
Container orchestration for FastAPI backend, Vite React frontend, Redis, and optional PostgreSQL for production deployment.

#### [NEW] [Dockerfile](file:///Volumes/DiskD/HACKATHONS/smart-health/Dockerfile)
Multi-stage production build suitable for deployment on Google Cloud Run or Render.

---

### 2. Backend Service (`backend/`)

Built on **FastAPI** + **SQLAlchemy 2.0** + **Pydantic v2** + **Google Generative AI SDK**.

#### [NEW] [backend/requirements.txt](file:///Volumes/DiskD/HACKATHONS/smart-health/backend/requirements.txt)
- `fastapi==0.111.0`, `uvicorn[standard]==0.30.1`
- `sqlalchemy==2.0.31`, `pydantic==2.8.2`, `pydantic-settings==2.3.4`
- `google-generativeai==0.7.2`, `google-cloud-bigquery==3.25.0`
- `httpx==0.27.0`, `prometheus-fastapi-instrumentator==7.0.0`
- `redis==5.0.7`, `pytest==8.2.2`, `python-multipart==0.0.9`

#### [NEW] [backend/app/core/config.py](file:///Volumes/DiskD/HACKATHONS/smart-health/backend/app/core/config.py)
Config class handling Gemini API keys, Google Cloud project ID, BigQuery credentials, database connection strings (defaulting to SQLite if Postgres is unset), CORS origins, and feature flags.

#### [NEW] [backend/app/db/models/](file:///Volumes/DiskD/HACKATHONS/smart-health/backend/app/db/models/)
- `facility.py`: PHC, CHC, and District Hospital models (name, code, state, district, sub-district, pincode, lat/lng, bed count, ICU beds, oxygen points, power backup, cold-chain status).
- `medicine.py`: National List of Essential Medicines (NLEM) catalogue (drug code, name, category, dosage form, critical threshold days, storage requirements).
- `inventory.py`: Facility stock balances, batch numbers, manufacture & expiry dates, current quantity, minimum safety stock, daily burn rate.
- `footfall.py`: Daily patient footfall by department (OPD, IPD, Emergency, Maternal, Pediatric).
- `attendance.py`: Medical personnel attendance (Duty Doctors, Staff Nurses, ANMs, Pharmacists, Lab Techs).
- `redistribution.py`: Inter-facility transfer orders, dispatch status (Proposed, Approved, In-Transit, Delivered), sender/receiver PHCs, quantity, transit vehicle details.
- `alert.py`: Stockout early warnings, disease outbreak alerts, weather disruption warnings.

#### [NEW] [backend/app/services/](file:///Volumes/DiskD/HACKATHONS/smart-health/backend/app/services/)
- `gemini_client.py`: Robust client with automatic retry, exponential backoff, structured JSON response extraction, and fallback mocking.
- `multimodal_ocr.py`: Vision AI service parsing images of paper stock registers, medicine cartons, and blister packs with batch/expiry recognition.
- `demand_forecasting.py`: Hybrid forecasting engine blending historical statistical decay with Vertex AI / Gemini reasoning for epidemiological spikes (monsoon floods, dengue outbreaks).
- `redistribution_engine.py`: Cost-distance-expiry multi-objective matching algorithm pairing deficit PHCs with nearby surplus facilities.
- `federated_engine.py`: Simulated FedAvg engine aggregating state-level local model updates into a pan-India disease & demand model.
- `voice_indic.py`: Multilingual speech recognition and translation supporting 10 Indic languages (Hindi, Tamil, Telugu, Bengali, Marathi, etc.).
- `bigquery_service.py`: Federated bridge to query national HMIS and IDSP public health data.

#### [NEW] [backend/app/api/v1/](file:///Volumes/DiskD/HACKATHONS/smart-health/backend/app/api/v1/)
- `facilities.py`: GeoJSON endpoints for map visualization, facility directory, capacity metrics.
- `inventory.py`: Real-time stock levels, low-stock alerts, manual stock updates.
- `forecasting.py`: 7-day, 14-day, and 30-day stockout projections and burn-rate anomalies.
- `redistribution.py`: Generated transfer recommendations, dispatch approval, e-Challan generation.
- `multimodal.py`: Image upload endpoint for instant OCR register transcription.
- `voice.py`: Audio intake endpoint for field staff stock reporting.
- `federated.py`: Node registration, local weight upload, global model rounds.
- `analytics.py`: National and district level KPI aggregation for executive dashboards.

#### [NEW] [backend/app/scripts/seed_health_data.py](file:///Volumes/DiskD/HACKATHONS/smart-health/backend/app/scripts/seed_health_data.py)
High-fidelity seed script generating 1,000+ realistic facilities across 15 Indian states (Uttar Pradesh, Maharashtra, Bihar, Kerala, Assam, Rajasthan, Tamil Nadu, etc.), real NLEM medicines, dynamic stock levels, simulated dengue outbreaks in flood zones, and ready-to-resolve transfer requisitions.

---

### 3. Frontend Web Application (`frontend/`)

Built on **Vite** + **React 18** + **TypeScript** + **Leaflet GIS** + **Chart.js** + **Lucide Icons** following Civic-Pulse's glassmorphism and Indic civic aesthetic.

#### [NEW] [frontend/package.json](file:///Volumes/DiskD/HACKATHONS/smart-health/frontend/package.json)
React 18, TypeScript 5, Vite 5, Axios, Leaflet, React-Leaflet, Chart.js, React-Chartjs-2, Lucide-react.

#### [NEW] [frontend/src/styles/index.css](file:///Volumes/DiskD/HACKATHONS/smart-health/frontend/src/styles/index.css)
Custom CSS design system adapted from Civic-Pulse:
- Medical Resilience Palette: Ashoka Navy (`hsl(222, 70%, 52%)`), Emerald Healing (`hsl(150, 70%, 40%)`), Emergency Saffron (`hsl(28, 95%, 55%)`), Stockout Danger (`hsl(4, 78%, 56%)`).
- Glassmorphism panels, interactive glow borders, dark/light theme switching, mobile-responsive layout.

#### [NEW] [frontend/src/pages/](file:///Volumes/DiskD/HACKATHONS/smart-health/frontend/src/pages/)
1. `NationalCommand.tsx`: Pan-India strategic overview with national stock health score, live outbreak alerts, high-risk districts, and critical drug stockout countdowns.
2. `LiveResourceMap.tsx`: Full-screen Leaflet GIS map with clustered PHC markers color-coded by stock/bed health (Green = Stable, Yellow = Warning, Red = Imminent Stockout), overlaying disease outbreak heat zones and active redistribution transit routes.
3. `DistrictLogistics.tsx`: District Magistrate & DMO control board for reviewing AI-suggested cross-district transfers, approving dispatch routes, and generating e-Challan passes.
4. `PhcGroundConsole.tsx`: High-speed touch-friendly terminal for PHC pharmacists to log daily OPD counts, adjust stock levels, verify doctor attendance, and view buffer days.
5. `MultimodalScanner.tsx`: Interactive camera scanner letting users photograph paper registers or medicine packs, receiving real-time Gemini OCR extraction with instant confirmation.
6. `VoiceAssistant.tsx`: Push-to-talk voice console allowing field workers (ASHAs/ANMs) to report stock or patient footfall in Indic languages with audio speech responses.
7. `FederatedSimulator.tsx`: Visualizer displaying state-level training nodes (e.g. Kerala Node, Maharashtra Node, UP Node), simulated gradient uploads, and pan-India model convergence curves.

#### [NEW] [frontend/src/components/](file:///Volumes/DiskD/HACKATHONS/smart-health/frontend/src/components/)
- `Navbar.tsx`: Navigation bar with role switcher (National MoHFW / District DMO / PHC Staff), language picker (10 Indic languages), live alert counter, and dark/light theme toggle.
- `StatCard.tsx`: Glassmorphism metric cards with trend indicators and status badges.
- `StockoutTimelineChart.tsx`: Chart.js visualization of predicted stock trajectories versus critical depletion thresholds.
- `TransferRouteCard.tsx`: Visual card displaying source surplus PHC, destination deficit PHC, route distance, transit time, and drug quantities.
- `EmergencyBanner.tsx`: Top notification alert for active epidemiological crises (e.g. Dengue spike in Cachar district, Assam).

---

## Verification Plan

### Automated Verification
1. **Backend Unit & Integration Tests**:
   ```bash
   cd /Volumes/DiskD/HACKATHONS/smart-health/backend
   pytest tests/
   ```
   - Test facility CRUD and geo-query endpoints.
   - Test inventory burn rate calculation and stockout countdown logic.
   - Test automated redistribution optimizer ensuring supply conservation and distance minimization.
   - Test Gemini multimodal OCR parser with mock image payloads.
   - Test federated weight aggregation math.

2. **Frontend Typecheck & Build**:
   ```bash
   cd /Volumes/DiskD/HACKATHONS/smart-health/frontend
   npm run typecheck
   npm run build
   ```

### Manual & Interactive Verification
1. **End-to-End Boot Verification**: Run `./setup.sh` and verify that both FastAPI (port 8000) and Vite (port 5173) start without errors.
2. **Interactive GIS Map Exploration**: Open `http://localhost:5173/map`, zoom into various states (Maharashtra, Assam, Kerala, Uttar Pradesh), filter by critical medicines (e.g. *Anti-Snake Venom*, *Oxytocin*, *Paracetamol*), and verify color-coded cluster rendering.
3. **Multimodal Register Scanning Demo**: Upload sample stock register photos via `http://localhost:5173/scan` and verify structured drug/batch/quantity extraction.
4. **Voice Reporting Demo**: Speak or record a stock update in Hindi/English on `http://localhost:5173/voice` and verify transcription, entity extraction, and audio synthesis feedback.
5. **Redistribution Optimization Flow**: Navigate to the District Logistics view, trigger a simulated supply crisis, inspect the AI-calculated cross-district transfer proposal, and click "Approve Dispatch" to generate the transfer e-Challan.
6. **Federated Learning Visualizer**: Trigger a federated training round across state nodes and observe global loss reduction and model synchronization in real-time.
