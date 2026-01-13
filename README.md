# BlockWitness 🚀

BlockWitness is a full-stack blockchain web application that allows users to upload files, generate verifiable reports, view blockchain proofs (like Merkle paths), and interactively verify integrity and authenticity.

Built with a **Python Flask (Waitress)** backend connected to **Supabase (PostgreSQL)** and a **React + Vite** frontend.

## 📌 Table of Contents

- [What is BlockWitness](#-what-is-blockwitness)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Quick Start (Local Setup)](#-quick-start-local-setup)
- [Environment Configuration](#-environment-configuration)
- [Deployment](#-deployment)
- [License](#-license)

## 🧠 What is BlockWitness?

BlockWitness is a decentralized-style webapp that lets users:
✅ Upload any file
✅ Create a cryptographically anchored “report”
✅ Store transactions securely in **Supabase**
✅ Explore Merkle proofs & blockchain-style block chains
✅ Verify file integrity through proofs
✅ Download PDF reports with QR codes

## 🛠️ Features

- **Supabase Integration**: Robust PostgreSQL database storage for blocks and transactions.
- **Merkle Chain Explorer**: Browse created blocks and proofs visually.
- **PDF Reports with QR**: Generate printable reports for offline verification.
- **File Verification**: Validate any uploaded file against the blockchain ledger.
- **Timeline View**: See sequencing of uploaded items.
- **Windows Optimized**: Uses `waitress` to run stably on Windows environments.

## 🧩 Tech Stack

| Component | Technology |
|-----------|------------|
| **Backend** | Python 3.14+, Flask, Waitress (Server), SQLAlchemy |
| **Database** | Supabase (PostgreSQL) |
| **Frontend** | React, Vite |
| **Utilities** | ReportLab (PDF), QRCode, Dotenv |

## 📋 Prerequisites

Before running the project, ensure you have the following installed:

1.  **Python 3.10+** (tested on 3.14)
2.  **Node.js & npm** (LTS version recommended)
3.  **Supabase Account**: You need a project URL and Database Password.

## 🚀 Quick Start (Local Setup)

### 1. Clone the Repository
```bash
git clone https://github.com/PAVAN-ENG-SIT/blockwitness.git
cd blockwitness
```

### 2. Configure Environment (`.env`)
Create a `.env` file in the **root directory** of the project (`blockwitness/.env`).
Add your Supabase details (use port **6543** for IPv6/Connection Pooling support if needed):

```env
# Backend Configuration
USE_POSTGRES=true
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-ID].supabase.co:6543/postgres?connect_timeout=10
PORT=8000

# Frontend Configuration
VITE_API_URL=/api
```

### 3. Backend Setup (Python)
Open a terminal in the `backend` folder:

```bash
cd backend
# Create virtual environment (optional but recommended)
python -m venv venv
# Activate venv:
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server (Windows optimized)
python run_waitress.py
```
*You should see: `Backend running on http://0.0.0.0:8000`*

### 4. Frontend Setup (React)
Open a **new terminal** in the `frontend` folder:

```bash
cd frontend
npm install
npm run dev
```
*You should see: `Local: http://localhost:5000`*

👉 **Open your browser:** [http://localhost:5000](http://localhost:5000)

## 📊 How It Works

1.  **Upload**: User uploads a file via the frontend.
2.  **Process**: Backend hashes the file, creates a transaction, and enters it into the Database.
3.  **Merkle Proof**: A Merkle root is calculated for the block.
4.  **Verification**: Users can download a PDF validation certificate containing the proof and QR code.

## 📦 Deployment

You can deploy on platforms like Render, Railway, or Vercel.

1.  **Database**: Ensure your `DATABASE_URL` environment variable is set on the cloud provider.
2.  **Backend**: Command to run: `python run_waitress.py` (or `gunicorn app:app` for Linux).
3.  **Frontend**: Build command: `npm run build`, Publish directory: `dist`.

## 📜 License

This project is open source.