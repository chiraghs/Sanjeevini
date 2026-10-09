# 📱 Sanjeevini (संजीविनी) — Mobile & Offline Channel Architecture

### *Resilient Telemetry, Local-First Caching, and Multi-Channel Ingestion for Low-Connectivity Primary Health Centres*

> **Context**: Over 40% of India's rural Primary Health Centres (PHCs) and tribal sub-centres are located in areas with intermittent 2G/3G connectivity or periodic power outages. A health logistics platform that requires constant high-speed internet will inevitably fail when emergencies strike. Sanjeevini is engineered **offline-first**.

---

## 🗺️ Multi-Channel Architecture Overview

```
                      ┌──────────────── Frontline Ingestion Channels ────────────────┐
                      │                                                              │
         [Mobile App (Flutter / PWA)]              [WhatsApp Business]          [Basic 2G SMS]
                      │                                     │                         │
             (Local SQLite Queue)                    (Dialogflow CX)           (SMS Gateway API)
                      │                                     │                         │
                      ▼                                     ▼                         ▼
         ┌───────────────────────────────────────────────────────────────────────────────────┐
         │                    Sanjeevini HTTPS API Gateway (FastAPI v1)                      │
         └───────────────────────────────────────────────────────────────────────────────────┘
                                                       │
                                 ┌─────────────────────┴─────────────────────┐
                                 ▼                                           ▼
         ┌───────────────────────────────────────────┐ ┌───────────────────────────────────────────┐
         │     Core Inventory & Telemetry DB         │ │      District Redistribution Engine       │
         │   (PostgreSQL / SQLite Cloud Engine)      │ │   (Automated Bipartite Route Dispatch)    │
         └───────────────────────────────────────────┘ └───────────────────────────────────────────┘
```

---

## 📱 1. Mobile App Channel (Flutter / Android & PWA)

*Showcase Status: Interactive Simulator Live at [`/simulator`](https://sanjeevini-ui.onrender.com/simulator)*

Designed specifically for remote field pharmacists, Medical Officers, and ASHA cadres working in remote terrain (e.g., desert outposts in Barmer, Rajasthan or flood-prone tea gardens in Cachar, Assam).

### Key Technical Capabilities:
1. **Local-First Database (SQLite / IndexedDB / Hive)**:
   - When the health centre loses internet, the pharmacist continues recording daily dispensary dispensations and stock receipts without any interruptions.
   - All transactions are stored locally with high integrity.
2. **Offline Store-and-Forward Queue**:
   - Every offline action (stock decrement, voice report, SOS request) receives a local timestamp and unique `device_uuid`.
   - The app's background worker monitors network availability (`WorkManager` on Android, `JobScheduler`, or browser `navigator.onLine`).
   - The instant network connectivity is detected (even a brief 10-second 2G signal), the queue automatically flushes to the central backend.
3. **Low-Bandwidth Media Compression**:
   - Stock ledger photos captured via mobile camera are compressed to lightweight WebP formats ($\le 250\text{ KB}$) prior to cloud upload.
   - Voice recordings are compressed using Opus / AAC codecs to minimize cellular data overhead.
4. **Interactive Simulator Interface**:
   - Evaluators and judges can open **`/simulator`** on the web client to test this offline behavior:
     - Click **"Simulate Zero-Connectivity Outpost"** $\rightarrow$ Status switches to *Offline Outpost*.
     - Tap `+` / `-` stock adjustments $\rightarrow$ Notice actions queue locally in the SQLite queue.
     - Click **"4G / 5G Online Mode"** $\rightarrow$ Click **"Sync Pending Items to Cloud"** $\rightarrow$ All transactions synchronize instantly with the national database!

---

## 💬 2. WhatsApp Business API Channel

*Showcase Status: Dialogflow CX Conversational Bridge Integration*

WhatsApp is ubiquitous across India, including in rural areas. Enabling frontline healthcare workers to interact via WhatsApp removes any need for training or complex software installation.

### Key Workflows:
* **No App Installation**: ASHA workers simply message the MoHFW verified WhatsApp Business Bot.
* **Conversational Stock Inquiries**:
  - Worker: *"Do we have anti-snake venom at PHC Paud?"*
  - Bot: *"PHC Paud has 4 vials remaining (Critical buffer: 1.5 days). Nearest surplus stock is available at Aundh District Hospital (25 vials)."*
* **Emergency Stockout Reporting**:
  - Worker: *"We only have 15 strips of Paracetamol remaining and ORS is out of stock."*
  - Bot: *"Urgent stockout logged for PHC Sonai. Requisition proposal automatically forwarded to Cachar District Health Officer."*
* **Photo Ledger Submission**:
  - Pharmacists can snap and send a photo of the dispensary register directly to the WhatsApp chat. The webhook pipes the image to the Gemini 1.5 Flash Vision OCR service and replies with an itemized digital summary for one-tap verification.

---

## 📟 3. Basic SMS Gateway Channel (2G Feature Phones)

*Showcase Status: Low-Bandwidth Gateway Intake*

In deep tribal belts where smartphones and data connectivity do not exist, health sub-centre workers use standard feature phones over 2G GSM cellular networks.

```
[ASHA Feature Phone]
         │
         ▼ (SMS over GSM / SS7)
[Telecom SMS Gateway (e.g. CDAC / NIC / Twilio / Gupshup)]
         │
         ▼ (HTTP POST Webhook Callback)
[Sanjeevini FastAPI Webhook (/api/v1/sms/intake)]
         │
         ▼ (Database Commit & Requisition Check)
[PostgreSQL / SQLite Database]
         │
         ▼ (Automated Reply SMS)
[ASHA Feature Phone receives: "SOS #ASV-991 Logged. 10 vials dispatched from District Hospital. ETA 2 hrs."]
```

### Protocol & Keyword Formats:
* **Emergency SOS**:
  `SOS [MEDICINE_CODE] [QUANTITY] [FACILITY_CODE]`
  *Example*: `SOS ASV 10 PHC-01`
* **Daily Stock Balance**:
  `STOCK [MEDICINE_CODE] [COUNT] [FACILITY_CODE]`
  *Example*: `STOCK PCM 15 PHC-01`
* **Automated Confirmation**:
  The system immediately replies with an SMS containing a requisition tracking code and transit ETA.

---

## 🔌 4. Webhook & Idempotency Architecture

When offline mobile queues or external messaging gateways sync, network unreliability can cause duplicate HTTP retries. Sanjeevini enforces strict **idempotency**:

```
Client Payload ──► Idempotency Filter (UUID Check) ──► Transaction Ledger ──► Response Mapping
```

### Idempotency & Batch Sync Protocol:
1. **Endpoint**: `POST /api/v1/inventory/sync-queue`
2. **Payload Structure**:
```json
{
  "facility_id": 1,
  "device_id": "MOBI-ASHA-0492",
  "batch_timestamp": "2026-10-01T10:15:30Z",
  "queue_items": [
    {
      "client_uuid": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "action_type": "DISPENSE",
      "medicine_id": 1,
      "quantity_delta": -5,
      "recorded_at": "2026-10-01T09:45:00Z"
    },
    {
      "client_uuid": "a82bc91d-44dd-4211-b123-9c84d3e2b101",
      "action_type": "EMERGENCY_SOS",
      "medicine_id": 3,
      "quantity_delta": 0,
      "details": "Urgent ASV shortage",
      "recorded_at": "2026-10-01T10:00:15Z"
    }
  ]
}
```
3. **Conflict Resolution**:
   - `client_uuid` is stored in the database transaction log with a unique constraint. If a duplicated payload arrives due to poor cellular handover, the backend safely ignores the duplicate and returns the existing transaction status without double-decrementing stock.
   - Vector-clock timestamps ensure that late-arriving offline logs adjust the chronological inventory balance accurately.

---

## 🗺️ 5. Production Rollout & Integration Plan

| Integration Component | Target Service / Provider | Operational Responsibility |
| :--- | :--- | :--- |
| **Mobile PWA & Flutter App** | WorkManager / SQLite / Hive | Local cache persistence, biometric auth for pharmacists, automatic sync worker. |
| **Government SMS Gateway** | NIC SMS Gateway / C-DAC Mobile Seva | Toll-free shortcode routing for frontline ASHAs on basic phones. |
| **WhatsApp Enterprise Bot** | Google Dialogflow CX + Gupshup / Meta Cloud API | Multi-turn conversational triage, vision OCR photo intake, status inquiries. |
| **Central Sync Endpoint** | FastAPI Core Service (`/api/v1/inventory/sync-queue`) | Idempotent transaction processing, conflict resolution, automated redistribution trigger. |
