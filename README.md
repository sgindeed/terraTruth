# 🌍 TerraTruth // Autonomous Exploitation Detection Engine

<div align="center">

![Status](https://img.shields.io/badge/Status-Active-00e5ff?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Google Earth Engine](https://img.shields.io/badge/Google_Earth_Engine-4285F4?style=for-the-badge&logo=google)
![Machine Learning](https://img.shields.io/badge/Machine_Learning-Scikit_Learn-F7931E?style=for-the-badge&logo=scikit-learn)
![License](https://img.shields.io/badge/License-MIT-success?style=for-the-badge)

### **AI-Powered Geospatial Intelligence Platform for Environmental Crime Detection**

*Autonomously detecting environmental exploitation through satellite intelligence, machine learning, and legal AI.*

</div>

---

## 🌟 Overview

Environmental exploitation often flourishes where monitoring is sparse, regulations are delayed, and evidence is difficult to obtain. Illegal mining, industrial pollution, illegal deforestation, and unauthorized land-use changes frequently go unnoticed until irreversible damage has already occurred.

**TerraTruth** is a next-generation Geospatial Intelligence Platform that transforms raw satellite imagery into legally actionable environmental evidence.

Instead of requiring experts to manually inspect satellite imagery and environmental datasets, TerraTruth automates the entire investigation pipeline by combining:

- 🛰 Multi-Satellite Remote Sensing
- 🤖 Machine Learning Anomaly Detection
- 🧠 Retrieval-Augmented Generation (RAG)
- ⚖ Legal Intelligence
- 📍 Industrial Target Identification
- 🔐 Cryptographic Evidence Verification

Within seconds, TerraTruth converts millions of environmental observations into an executive intelligence dossier capable of assisting researchers, journalists, NGOs, regulators, and legal professionals.

---

# ✨ Key Features

## 🛰 Multi-Satellite Sensor Fusion

Collects and synchronizes environmental observations from multiple orbital platforms.

Supported datasets include:

- Sentinel-5P Atmospheric Pollution
- MODIS Land Surface Temperature
- MODIS Aerosol Optical Depth
- Sentinel-1 SAR Backscatter
- Historical Time-Series Generation
- Automatic Temporal Interpolation

---

## 🌲 Deforestation Intelligence

Utilizes Sentinel-1 Synthetic Aperture Radar (SAR) to detect:

- Illegal Logging
- Forest Cover Loss
- Biomass Reduction
- Hidden Deforestation beneath Cloud Cover
- Land Surface Structural Changes

Unlike optical satellites, SAR imagery continues functioning during heavy cloud cover and at night.

---

## 🌡 Environmental Anomaly Detection

Instead of relying on manually defined thresholds, TerraTruth uses Machine Learning.

The platform:

- Normalizes satellite observations
- Combines multiple environmental variables
- Detects synchronized anomalies
- Calculates anomaly severity
- Identifies environmental hotspots

Powered by:

```
Isolation Forest
```

This allows TerraTruth to discover suspicious environmental events without prior labeling.

---

## 🏭 Corporate Target Identification

Once anomalies are detected, TerraTruth automatically investigates nearby industrial entities using OpenStreetMap.

The engine can identify:

- Factories
- Industrial Complexes
- Mines
- Processing Plants
- Corporate Facilities
- Nearby Infrastructure

This dramatically reduces manual investigative work.

---

## ⚖ AI Legal Intelligence (Cipher.AI)

One of TerraTruth's strongest capabilities is its integrated Legal AI.

Cipher.AI uses Retrieval-Augmented Generation (RAG) to search environmental laws stored inside a ChromaDB vector database.

Capabilities include:

- Environmental Law Retrieval
- Legal Citation Generation
- Statute Search
- Regulatory Cross-Referencing
- Legal Summaries
- Jurisdiction-Specific Context

Instead of hallucinating legal information, Cipher.AI grounds every response using indexed legal documents.

---

## 📑 Automated Executive Dossier

After every investigation TerraTruth automatically generates a professional legal report including:

- Executive Summary
- Target Organization
- Environmental Findings
- Satellite Evidence
- AI Analysis
- Risk Assessment
- Recommended Legal Action
- Supporting Statutes
- Environmental Impact Summary

The generated report is immediately available inside the dashboard.

---

## 🔐 Cryptographic Evidence Chain

Every investigation generates:

- SHA-256 Evidence Hash
- Immutable Report Signature
- Dataset Verification Fingerprint

This ensures report integrity and assists future legal verification.

---

# 🧠 System Architecture

```
                User Coordinates
                       │
                       ▼
            TerraTruth Dashboard
                       │
                       ▼
            FastAPI Backend Engine
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
 Google Earth     ML Detection     OpenStreetMap
    Engine        IsolationForest    Overpass API
        │              │              │
        └──────────────┼──────────────┘
                       ▼
             Intelligence Fusion Layer
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
       Cipher.AI RAG        Executive Dossier
             │
             ▼
        ChromaDB Vector Store
```

---

# 🚀 Core Capabilities

- Autonomous Satellite Intelligence
- Environmental Crime Detection
- AI-Powered Legal Analysis
- Retrieval-Augmented Generation
- Geospatial Visualization
- Interactive Dashboard
- Time-Series Analytics
- Live Satellite Mapping
- Industrial Entity Identification
- Machine Learning Anomaly Detection
- Environmental Evidence Generation
- Cryptographic Evidence Verification

---

# 🛠 Technology Stack

## Backend

| Technology | Purpose |
|------------|---------|
| FastAPI | REST API |
| Python | Backend Logic |
| Google Earth Engine | Satellite Processing |
| Pandas | Data Processing |
| NumPy | Numerical Computing |
| Scikit-Learn | Machine Learning |
| ChromaDB | Vector Database |
| Groq API | LLM Inference |
| Requests | External APIs |
| Python Dotenv | Environment Variables |

---

## Frontend

| Technology | Purpose |
|------------|---------|
| React | UI Framework |
| Vite | Build Tool |
| TailwindCSS | Styling |
| Recharts | Data Visualization |
| React Leaflet | Interactive Maps |
| Lucide Icons | Icon Library |
| Leaflet | GIS Rendering |

---

# 📂 Project Structure

```
terraTruth
│
├── backend
│   ├── api
│   ├── services
│   ├── ml
│   ├── rag
│   ├── utils
│   ├── main.py
│   └── .env
│
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── assets
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   └── package.json
│
└── README.md
```

---

# ⚙ Installation

## Prerequisites

- Python 3.10+
- Node.js 18+
- Google Earth Engine Account
- Google Cloud Project
- Groq API Key

---

# 1️⃣ Clone Repository

```bash
git clone https://github.com/sgindeed/terraTruth.git

cd terraTruth
```

---

# 2️⃣ Backend Setup

```bash
cd backend

python -m venv venv
```

### Windows

```bash
venv\Scripts\activate
```

### Linux / macOS

```bash
source venv/bin/activate
```

Install dependencies

```bash
pip install fastapi
pip install uvicorn
pip install pandas
pip install numpy
pip install scikit-learn
pip install earthengine-api
pip install chromadb
pip install groq
pip install python-dotenv
pip install requests
```

---

## Environment Variables

Create a `.env` file.

```env
EE_PROJECT_ID=your_google_cloud_project_id

GROQ_API_KEY=your_groq_api_key
```

---

## Run Backend

```bash
python main.py
```

Server:

```
http://127.0.0.1:8000
```

---

# 3️⃣ Frontend Setup

```bash
cd frontend

npm install

npm install react

npm install lucide-react

npm install recharts

npm install react-leaflet leaflet
```

Run the development server.

```bash
npm run dev
```

Dashboard:

```
http://localhost:5173
```

---

# 📡 Operational Workflow

## Step 1

Open TerraTruth Dashboard.

---

## Step 2

Enter the latitude and longitude of a suspected environmental exploitation site.

Or use browser geolocation.

---

## Step 3

Select scan mode.

- Environmental Intelligence
- SAR Deforestation Intelligence

---

## Step 4

Launch analysis.

TerraTruth automatically:

- Downloads satellite imagery
- Extracts environmental variables
- Synchronizes datasets
- Runs anomaly detection
- Finds nearby industries
- Generates legal evidence

---

## Step 5

Review dashboard visualizations.

Available widgets include:

- Interactive Satellite Map
- Environmental Timeline
- Risk Indicators
- Threat Statistics
- AI Confidence
- Executive Dossier

---

## Step 6

Open Cipher.AI.

Ask questions like:

> Which environmental laws apply?

> What legal violations are detected?

> Explain the pollution evidence.

> Generate prosecution summary.

---

# 🔍 Machine Learning Pipeline

```
Satellite Data

↓

Cleaning

↓

Interpolation

↓

Feature Engineering

↓

Isolation Forest

↓

Anomaly Scores

↓

Target Identification

↓

Legal Analysis

↓

Executive Report
```

---

# 🌍 Future Roadmap

- Multi-country Legal Database
- Live Satellite Streaming
- AI Environmental Predictions
- Real-Time Alert System
- NGO Collaboration Dashboard
- Multi-Language Support
- Drone Integration
- Mobile Application
- PDF & DOCX Report Export
- Temporal Heatmaps
- 3D Terrain Visualization
- Explainable AI (XAI)
- Satellite Image Segmentation
- Environmental Risk Forecasting

---

# 👨‍💻 Author

## **Supratim Ghosh**

**AI Engineer • Full Stack Developer • Geospatial AI Enthusiast**

Building intelligent systems that combine:

- Artificial Intelligence
- Machine Learning
- Large Language Models
- Remote Sensing
- Computer Vision
- Geospatial Analytics
- Knowledge Graphs
- Retrieval-Augmented Generation

---

<div align="center">

### 🌍 TerraTruth

**Turning Satellite Intelligence into Legal Evidence**

*"Observe from Orbit. Detect with AI. Act with Evidence."*

⭐ **If you found this project interesting, consider giving it a star!**

</div>
