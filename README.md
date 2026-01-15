# 🔗 BlockWitness

**BlockWitness** is a full-stack blockchain-inspired web application that enables **tamper-proof file verification** using cryptographic hashing, Merkle trees, and immutable block chaining.

Users can upload files, generate verifiable blockchain records, explore blocks and proofs, and download **PDF verification certificates with QR codes** — all backed by **Supabase (PostgreSQL)**.

---

## 📌 Table of Contents

* [Overview](#-overview)
* [Key Features](#-key-features)
* [Tech Stack](#-tech-stack)
* [Project Structure](#-project-structure)
* [How It Works](#-how-it-works)
* [Prerequisites](#-prerequisites)
* [Local Setup](#-local-setup)
* [Environment Variables](#-environment-variables)
* [Running the Application](#-running-the-application)
* [Deployment](#-deployment)
* [License](#-license)

---

## 🧠 Overview

BlockWitness demonstrates how blockchain concepts can be applied to **file integrity, authenticity, and verification** without requiring a public blockchain network.

Each uploaded file is:

* Cryptographically hashed
* Stored as a transaction
* Grouped into blocks
* Anchored with a Merkle root
* Persisted in PostgreSQL
* Verifiable at any time

---

## ✨ Key Features

* 🔐 **Cryptographic Hashing** (SHA-based)
* 🌳 **Merkle Tree Proofs**
* 🧱 **Blockchain-Style Block Chaining**
* 🗄️ **Supabase PostgreSQL Storage**
* 📄 **PDF Certificates with QR Codes**
* 🔍 **Block & Transaction Explorer**
* ⏳ **Timeline View**
* 🪟 **Windows-Optimized Backend (Waitress)**

---

## 🧩 Tech Stack

| Layer    | Technology              |
| -------- | ----------------------- |
| Backend  | Python, Flask, Waitress |
| Database | Supabase (PostgreSQL)   |
| ORM      | SQLAlchemy              |
| Frontend | React, Vite             |
| Styling  | Tailwind CSS            |
| PDF & QR | ReportLab, qrcode       |
| Config   | python-dotenv           |

---

## 🏗️ Project Structure

```
blockwitness/
├── backend/
│   ├── app.py               # Flask API & routes
│   ├── chain_utils.py       # Blockchain & Merkle logic
│   ├── crypto_utils.py      # Hashing & cryptography utilities
│   ├── config.py            # Environment & DB configuration
│   ├── run_waitress.py      # Windows-safe server runner
│   ├── chain.db             # Local SQLite (dev/testing)
│   ├── uploads/             # Uploaded files
│   ├── certificates/        # Generated PDF certificates
│   ├── keys/                # Cryptographic keys
│   └── requirements.txt
│
├── frontend/
│   ├── src/                 # React source code
│   ├── public/
│   ├── index.html
│   └── vite.config.js
│
├── .env                     # Environment variables
├── render.yaml              # Render deployment config
├── start.sh                 # Linux start script
└── README.md
```

---

## 🔄 How It Works

1. **File Upload**

   * User uploads a file from the frontend
2. **Hash Generation**

   * Backend computes a cryptographic hash
3. **Transaction Creation**

   * File metadata and hash stored as a transaction
4. **Block Formation**

   * Transactions grouped into blocks
   * Merkle root calculated
5. **Database Storage**

   * Data persisted in Supabase PostgreSQL
6. **Verification**

   * File integrity verified using Merkle proofs
7. **Certificate Generation**

   * Downloadable PDF with QR code for validation

## 🖼️ Application Screenshots

<table>
   <tr>
    <td align="center">
      <b>Create</b><br/>
      <img src="images/signup.png" width="450"/>
    </td>
    <td align="center">
      <b>Explorer</b><br/>
      <img src="images/login.png" width="450"/>
    </td>
    
  </tr
  <tr>
    <td align="center">
      <b>Create</b><br/>
      <img src="images/create-section.png" width="450"/>
    </td>
    <td align="center">
      <b>Explorer</b><br/>
      <img src="images/explorer-section.png" width="450"/>
    </td>
    
  </tr>
  <tr>
    <td align="center">
      <b>Search</b><br/>
      <img src="images/search-section.png" width="450"/>
    </td>
    <td align="center">
      <b>Timeline</b><br/>
      <img src="images/timeline-section.png" width="450"/>
    </td>
  </tr>
  <tr>
    <td align="center">
      <b>Verify</b><br/>
      <img src="images/verify-section.png" width="450"/>
    </td>
    <td align="center">
      <b>Certificate</b><br/>
      <img src="images/blockchain-certificate.png" width="450"/>
    </td>
  </tr>
</table>

---

## 📋 Prerequisites

Before running the project, ensure you have:

* **Python 3.10+** (tested up to 3.14)
* **Node.js (LTS recommended)**
* **Supabase account**

  * Project ID
  * Database password

---

## ⚙️ Local Setup

### 1️⃣ Clone the Repository

```
git clone https://github.com/PAVAN-ENG-SIT/blockwitness.git
cd blockwitness
```

---

### 2️⃣ Environment Variables

Create a `.env` file in the project root:

```env
# Backend
USE_POSTGRES=true
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.[YOUR_PROJECT_ID].supabase.co:6543/postgres
PORT=8000

# Frontend
VITE_API_URL=/api
```

📌 Use **port 6543** for Supabase connection pooling.

---

### 3️⃣ Backend Setup

```
cd backend

python -m venv venv
# Activate:
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate

pip install -r requirements.txt
python run_waitress.py
```

Backend will run at:
👉 **[http://localhost:8000](http://localhost:8000)**



### 4️⃣ Frontend Setup

Open a new terminal:
```
cd frontend
npm install
npm run dev
```

Frontend will run at:
👉 **[http://localhost:5000](http://localhost:5000)**



## 🚀 Deployment

BlockWitness can be deployed on platforms like **Render**, **Railway**, or **Vercel (frontend)**.

### Backend


python run_waitress.py
# or (Linux)
gunicorn app:app


### Frontend


npm run build


Ensure `DATABASE_URL` and environment variables are set in the hosting platform.



## 📜 License

This project is **open-source** and available under the **MIT License**.


### ⭐ If you like this project, consider starring the repository!

