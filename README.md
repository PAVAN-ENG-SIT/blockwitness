BlockWitness 🚀

BlockWitness is a full-stack blockchain web application that allows users to upload files, generate verifiable reports, view blockchain proofs (like Merkle paths), and interactively verify integrity and authenticity.
Built with a Python Flask backend and a React + Vite frontend, it’s ideal for learning and demonstrating basic blockchain proof techniques.

📌 Table of Contents

🧠 What is BlockWitness

🛠️ Features

🧩 Architecture

🚀 Quick Start

📁 Folder Structure

📊 How it Works

🧪 Testing Locally

📦 Deployment

📜 License

🧠 What is BlockWitness?

BlockWitness is a decentralized-style webapp that lets users:

✅ Upload any file
✅ Create a cryptographically anchored “report”
✅ Explore Merkle proofs & blockchain-style block chains
✅ Verify file integrity through proofs
✅ Download PDF reports with QR codes
✔ Everything works offline on localhost

It’s a perfect project for experimenting with blockchain proof structures and file immutability.

🛠️ Key Features

🔗 Merkle Chain Explorer – Browse created blocks and proofs

📄 PDF Reports with QR – Generate printable reports

🔍 File Verification – Validate any uploaded file

🪪 Timeline View – See sequencing of uploaded items

🔐 Chain Verification Tools – Confirm on-chain integrity

🧪 Offline/localhost support
(All features run locally for development)

🧩 Architecture
Component	Framework/Tech
Backend	Python + Flask
API	REST endpoints
Frontend	React + Vite
PDF & QR Generation	ReportLab, qrcode
Deployment	Render / Docker (optional)

The backend handles file upload, Merkle proof generation, plaintext hashing, PDF creation, and serving data to the frontend. The frontend provides an interactive UI to create, view, and verify blockchain proof artifacts.

🚀 Quick Start
1. Clone the repository
git clone https://github.com/PAVAN-ENG-SIT/blockwitness.git
cd blockwitness

2. Backend Setup (Flask)
cd backend
python -m venv venv
# Activate venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
# or manually:
pip install flask flask-cors reportlab qrcode[pil]

python app.py


🟢 Backend will run at: http://127.0.0.1:5001

3. Frontend Setup (React + Vite)
cd ../frontend
npm install
npm run dev


🟢 Frontend will run at: http://localhost:5173

📁 Folder Structure
/blockwitness
├── backend/         # Flask API server
├── frontend/        # React app (Vite)
├── README.md        # Project overview
├── Deployment.md    # Deploy notes
├── Dockerfile       # Optional container config
├── render.yaml      # Render deployment config
└── start.sh         # Startup script

📊 How It Works
🗂️ File Upload & Report

User uploads a file via the frontend UI.

Backend accepts file, hashes it, and creates a Merkle proof.

A PDF report is generated that includes:

File metadata

Hash values

QR for quick mobile access

Reports can be downloaded or re-verified.

📜 Blockchain Proofs

Each uploaded file becomes a “block” in an offline Merkle chain.

A Merkle path + QR code illustrates proof of existence and integrity.

Users can validate chain integrity with built-in verification tools.

(This is conceptually similar to how blockchain witnesses provide proof of block data, though simplified for educational use.)

🧪 Testing Locally

If you want to test all features:

Start backend

Start frontend

Create a few reports

Try:

Merkle path inspection

Timeline views

Offline chain verification

Downloading PDFs

📦 Deployment

You can deploy on platforms like Render, Railway, or Vercel.

✔ Define environment variables in .env
✔ Configure build scripts for backend and frontend
✔ Use docker or platform-native deployment

(See Deployment.md for details.)

📜 License

This project is open source — feel free to explore, improve, and reuse in your own learning and development.
Add a license section here (MIT, Apache, etc.) as appropriate.

❤️ Contributing

Contributions are welcome!
Feel free to open issues or submit pull requests.