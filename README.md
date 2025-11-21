Got you.
Here is a **super short, localhost-only setup + run guide**, inside **one code block**, ready to paste.

No ngrok, no phone setup — just localhost.

---

````markdown
# Localhost Installation & Running Instructions

These steps run BlockWitness **fully on localhost**.

---

## 1️⃣ Backend Setup (Flask API)

```powershell
cd blockwitness/backend

# Create virtual env (first time)
python -m venv venv

# Activate venv
venv\Scripts\Activate.ps1

# Install dependencies
pip install flask flask-cors
pip install reportlab qrcode[pil]   # for PDF + QR

# Start backend
python app.py
````

Backend will run at:

```
http://127.0.0.1:5001
```

---

## 2️⃣ Frontend Setup (React + Vite)

Open a NEW PowerShell window:

```powershell
cd blockwitness/frontend

# Install node modules
npm install

# Start frontend
npm run dev
```

Frontend will run at:

```
http://localhost:5173
```

---

## 3️⃣ Quick Local Test

1. Open `http://localhost:5173`
2. Go to **Create Report**
3. Fill details + upload any image

   * You may use this sample file if needed:
     `/mnt/data/8c099852-aacd-4177-bd7b-db36ae98c0d2.png`
4. Submit
5. Open **Explorer** → new block appears
6. Test:

   * Merkle Path
   * PDF Download
   * Verify Chain
   * Timeline
   * Search
   * File Verification

Everything works **completely offline** on `localhost`.

---

```

---
