# Swasthya Pathway - Smart Cow Health Monitoring System

A real-time bovine health monitoring web application with AI-powered disease detection.

## 🚀 Quick Start

### Backend
```bash
cd swasthya-backend
npm install
npm run dev
# Runs on http://localhost:5000
```

### Frontend
```bash
cd swasthya-frontend
npm install
npm run dev
# Opens at http://localhost:3000
```

## 📱 Features

| Page | Description |
|------|-------------|
| **Dashboard** | Intelligence Hub with 2x2 chart grid and analysis panel |
| **Live Monitoring** | Real-time sensor data display |
| **Charts** | Auto-refresh graphs (weight, temp, gait, activity) |
| **Health Analysis** | AI diagnostics with camera feed |
| **Disease Detection** | Risk-based disease identification |
| **Alerts** | Real-time popup and sound notifications |
| **Reports** | PDF generation with download/print/share |
| **History** | Trend comparison and filtering |

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS, Recharts, Lucide-React, Socket.io-client
- **Backend**: Node.js, Express, Socket.io

## 📊 Sensor Thresholds

| Metric | Normal Range | Abnormal Trigger |
|--------|--------------|------------------|
| Temperature | 100.5-102.5°F | > 103°F |
| Activity | 40-80% | < 20% |
| Gait Score | 1-2 | ≥ 3 |
| Load Imbalance | 0-8% | > 15% |

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |
| GET | `/api/cows/:id/history` | Get cow history |
| GET | `/api/cows/:id/report` | Generate health report |
| GET | `/api/diseases` | List disease definitions |
| POST | `/api/auth/send-otp` | Send OTP for login |
| POST | `/api/auth/verify-otp` | Verify OTP |

## 📡 Socket.io Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `monitor:start` | Client → Server | Start monitoring a cow |
| `monitor:stop` | Client → Server | Stop monitoring |
| `sensor:data` | Server → Client | Real-time sensor data |
| `alert:triggered` | Server → Client | Abnormality alert |

## 📁 Project Structure

```
pathway/
├── swasthya-backend/
│   ├── server.js           # Express + Socket.io server
│   ├── mockSensors.js      # Sensor data generator
│   └── diseaseDetection.js # AI disease logic
├── swasthya-frontend/
│   ├── src/app/            # Next.js pages
│   ├── src/components/     # React components
│   └── src/hooks/          # Custom hooks (useSocket)
└── README.md
```
