---
name: smart-health-resilience
description: >-
  Architectural patterns, Google AI integrations (Gemini 1.5/2.0, Vertex AI, Multimodal Vision,
  Speech-to-Text, Indic Translation), federated resource modeling, and supply chain resilience
  workflows for national-scale Indian public healthcare (PHC/CHC/DH network).
---

# Smart Health & Supply Chain Resilience Skill

This skill guides the design, engineering, and deployment of a federated, AI-driven national health resource and pharmaceutical supply chain resilience platform across India's Primary Health Centres (PHCs), Community Health Centres (CHCs), and District Hospitals (DHs).

---

## 1. Domain & Problem Context

### The Challenge in India's Public Healthcare
- Over 30,000 PHCs and 6,000 CHCs cater to over 1.4 billion citizens across rural and semi-urban India.
- **Stock-outs & Blindspots**: Paper-based stock registers and siloed monthly reporting lead to catastrophic stock-outs of critical drugs (oxytocin, antivenom, anti-rabies, insulin, ORS, IV fluids, basic antibiotics).
- **Epidemiological Surges**: Monsoon floods, vector-borne outbreaks (dengue, malaria), and acute respiratory infections spike local consumption by 300–500% overnight.
- **Supply Inefficiencies**: While one district hospital faces acute stock-outs, an adjacent district's warehouse often holds expiring surplus due to lack of cross-district visibility.
- **Connectivity & Language**: Frontline health workers (ANMs, ASHAs, PHC pharmacists) operate in low-bandwidth rural environments across 22+ official languages.

---

## 2. Technical Stack Reference Architecture

Modeled after enterprise civic architectures (such as `Civic-Pulse`):

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION TIER (React + TS)                  │
│  - National Command Center (MoHFW)        - District Supply Coordinator│
│  - PHC Stock & Bed Dashboard              - ASHA/ANM Mobile PWA        │
│  - Multimodal Camera Stock Scanner        - Voice-First Indic Input    │
│  - GIS Outbreak & Redistribution Map (Leaflet)                         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ REST / SSE
┌───────────────────────────────────▼────────────────────────────────────┐
│                         APPLICATION API (FastAPI)                      │
│  - /api/v1/facilities (PHC/CHC/DH registry & geo-coordinates)          │
│  - /api/v1/inventory (Stock levels, batch expiry, consumption logs)    │
│  - /api/v1/demand-forecast (Vertex AI & Gemini predictive models)      │
│  - /api/v1/redistribution (Automated cross-district transfer matching) │
│  - /api/v1/multimodal (OCR register parsing & drug pack verification)  │
│  - /api/v1/voice-indic (Bhashini / Cloud STT + Indic Translation + TTS)│
│  - /api/v1/federated (State-level gradient aggregation & shared models)│
└──────────────────┬─────────────────┬───────────────────┬───────────────┘
                   │                 │                   │
┌──────────────────▼──────┐ ┌────────▼─────────┐ ┌──────▼───────────────┐
│     STORAGE & CACHE     │ │     GOOGLE AI    │ │    DATA & ANALYTICS  │
│ - SQLite (Dev/Offline)  │ │ - Gemini 1.5/2.0 │ │ - BigQuery (HMIS/IDSP│
│ - PostgreSQL (CloudSQL) │ │ - Multimodal OCR │ │   National Data Hub) │
│ - Redis (Queue & Cache) │ │ - Cloud STT / TTS│ │ - IMD Weather Alerts │
│ - IndexedDB (Local PWA) │ │ - Translation API│ │ - Open Data (data.gov)│
└─────────────────────────┘ └──────────────────┘ └──────────────────────┘
```

---

## 3. Core AI & Technical Capabilities

### A. Multimodal Inventory & Register Scanner (`Gemini 1.5 Flash Vision`)
- **Use Case**: PHC pharmacists and ANMs photograph hand-written paper ledger registers, daily stock balance boards, or medicine cartons/blister packs.
- **Workflow**:
  1. Frontend captures or uploads an image.
  2. Backend sends the image buffer to Gemini 1.5 Flash with structured schema extraction prompt.
  3. Returns JSON array: `[{ drug_name, batch_no, expiry_date, quantity, unit, confidence }]`.
  4. Auto-maps to the National List of Essential Medicines (NLEM/EML) standard catalogue.

### B. Predictive Demand & Stockout Early Warning (`Vertex AI + Gemini Time-Series Hybrid`)
- **Use Case**: Predict medicine depletion dates 14–30 days in advance based on:
  - Historical consumption rates.
  - Footfall patterns (OPD/IPD).
  - Seasonal weather variables (IMD rainfall/humidity triggering malaria/dengue/diarrhea).
  - Surrounding PHC epidemiological disease surveillance signals (IDSP).
- **Heuristic + AI Ensemble**:
  $$\text{BurnRate}_{\text{effective}} = \text{BaseBurn} \times (1 + \alpha_{\text{monsoon}} + \beta_{\text{epidemic\_signal}})$$
  $$\text{DaysToStockout} = \frac{\text{CurrentStock}}{\text{BurnRate}_{\text{effective}}}$$

### C. Automated Cross-District Resource Redistribution Engine
- **Problem**: Traditional re-ordering takes 4–8 weeks via central medical stores.
- **Solution**: Dynamic bipartite matching algorithm:
  - Identifies **Deficit PHCs** (Critical stockout projected < 7 days).
  - Identifies **Surplus Nodes** (Stock > 60 days buffer or near-expiry batches within 90 days).
  - Optimizes transfer route using Google Maps Distance Matrix minimizing transport distance, cold chain decay, and logistical transit time.
  - Generates ready-to-dispatch digital Gate Passes and e-Challans.

### D. Federated Predictive Modeling Across States
- **Data Sovereignty & Scalability**: Health is a State subject in India (Schedule 7, Constitution of India). States cannot centralize raw patient OPD records.
- **Federated Architecture**:
  - Each State/District node trains local time-series regression and outbreak models locally.
  - Only anonymous model weights/gradient updates (differential privacy $\epsilon < 1.0$) are shared to the Central MoHFW Federated Orchestrator.
  - The shared global model broadcasts improved outbreak prediction weights back to all states.

### E. Multilingual Voice-First Interface for Frontline Cadres (ASHA/ANM)
- Supports voice-to-stock reporting in Hindi, Marathi, Bengali, Tamil, Telugu, Kannada, Gujarati, and English.
- Pipeline: Audio Input $\rightarrow$ Cloud STT / Whisper $\rightarrow$ Google Cloud Translation $\rightarrow$ Gemini Entity Extraction $\rightarrow$ Spoken Audio Confirmation (TTS).

---

## 4. UI/UX Design Standards (Aligned with Civic-Pulse)

- **Color Palette**:
  - Primary: Ashoka Navy (`hsl(222, 70%, 52%)`)
  - Health/Resilience Emerald: (`hsl(150, 70%, 40%)`)
  - Saffron Critical Alert: (`hsl(28, 95%, 55%)`)
  - Danger / Stockout Red: (`hsl(4, 78%, 56%)`)
  - Dark Theme Default with full Light Theme toggle.
  - Glassmorphism panels: `background: hsla(222, 34%, 14%, 0.66)`, `backdrop-filter: blur(16px)`.
- **Key Views**:
  1. **National MoHFW Command Deck**: Pan-India heatmaps, aggregate stock health index, active outbreak alerts, interstate transfer corridors.
  2. **District Health Officer (DMO) Dashboard**: Redistribution approval queue, bed occupancy & doctor availability matrix, buffer stock tracking.
  3. **PHC Ground Console**: Quick stock adjustment, patient footfall counter, one-click camera register scan, voice update widget.
  4. **Live Logistics & Emergency Dispatch**: Interactive Leaflet GIS map with vehicle tracking, transfer routes, cold chain temperature monitors.
  5. **Federated Model Visualizer**: Interactive state-by-state gradient convergence and cross-state collaborative learning metrics.

---

## 5. Development Principles & Fallbacks

- **Zero-Failure Local Bootstrapping**:
  - Default to SQLite and local mock engines when Postgres, Redis, or Google Cloud credentials are not configured.
  - Deterministic seed scripts generating realistic Indian health scenarios (1,000+ PHCs across 15 states, 50 essential medicines, live outbreak scenarios like Assam flood or Kerala dengue surge).
- **FastAPI Clean Architecture**:
  - `app/api/v1/`: Thin controllers.
  - `app/services/`: Reusable business logic (AI, GIS, optimization, forecasting).
  - `app/db/models/`: SQLAlchemy 2.0 models with indexed foreign keys.
  - `app/core/`: Settings with `pydantic-settings`.
- **Production Readiness**:
  - Prometheus metrics instrumentation (`/metrics`).
  - Health check endpoints (`/health`).
  - Dockerized multi-stage builds.
