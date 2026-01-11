# BlockWitness - Blockchain Evidence Management System

## Overview

BlockWitness is a blockchain-based evidence verification system that creates immutable records of incident reports. It uses a local blockchain ledger to ensure data integrity and provides cryptographic verification of evidence.

## Project Structure

- **Backend**: Python Flask API (`backend/`)
  - SQLite database for storing blockchain data
  - Cryptographic signing and hashing
  - PDF certificate generation
  - QR code generation for block verification
  
- **Frontend**: React + Vite application (`frontend/`)
  - Create incident reports with evidence files
  - Browse blockchain explorer
  - Verify file authenticity
  - Search reports
  - View blockchain timeline

## Technology Stack

### Backend
- Python 3.11
- Flask 2.3.2 (Web framework)
- Flask-CORS (Cross-origin resource sharing)
- PyCryptodome (Cryptographic operations)
- ReportLab (PDF generation)
- qrcode + Pillow (QR code generation)
- SQLite (Database)

### Frontend
- React 19.2.0
- Vite 7.2.4 (Build tool)
- React Router 7.9.6 (Navigation)
- Tailwind CSS 4.1.17 (Styling)

## Design System

### Color Palette (Updated November 2025)
- **Primary**: Vibrant Cyan (#06B6D4) - Modern, energetic, tech-forward
- **Secondary**: Rich Purple (#A855F7) - Sophisticated, futuristic
- **Accent**: Bold Pink/Red (#FF3B71) - Eye-catching, dynamic
- **Success**: Fresh Emerald (#10B981) - Positive, reassuring
- **Warning**: Bright Orange (#F97316) - Attention-grabbing
- **Dark Grays**: 50-900 scale for typography and backgrounds

### UI Components
- **Button**: 5 variants (primary, secondary, accent, success, danger) with gradient backgrounds, ripple effects, scale animations on hover, icon support, and loading states
- **Card**: Glass-morphism effects with backdrop blur, enhanced hover animations (scale + shadow), and GlassCard variant
- **Input/TextArea**: Modern focus states with glow effects, ring animations, scale transitions, error handling
- **Badge**: Compact pill design with vibrant colors for tags and labels
- **FileUpload**: Controlled component with gradient backgrounds, drag-and-drop, animated states, file previews, and proper state management

### Design Principles
- Vibrant, modern color palette with electric/neon tones
- Glass-morphism effects with backdrop-blur
- Multi-color gradient backgrounds (primary → secondary → accent)
- Smooth animations: fade-in-up, scale, pulse, glow effects
- 200-300ms transitions for micro-interactions
- Reduced-motion support for accessibility
- High contrast minimalist design
- Inspired by modern tech aesthetics (Apple, Linear, Notion, Stripe)

## Development Setup

### Backend (Port 8000)
- Located in `backend/` directory
- Runs on `http://localhost:8000`
- Database: SQLite (`backend/chain.db`)
- Uploads stored in `backend/uploads/`

### Frontend (Port 5000)
- Located in `frontend/` directory
- Runs on `http://0.0.0.0:5000`
- Connects to backend via environment variable `VITE_API_URL`

## Workflows

Two workflows are configured:

1. **Frontend**: Vite development server
   - Command: `cd frontend && npm run dev`
   - Port: 5000 (webview)
   - Uses Vite proxy to forward /api requests to backend

2. **Backend**: Gunicorn WSGI server
   - Command: `cd backend && python -c "from app import init_db; init_db()" && gunicorn --bind 0.0.0.0:8000 --workers 2 app:app`
   - Port: 8000 (console)
   - Initializes database on startup

## Key Features

1. **Create Reports**: Upload incident reports with evidence files
2. **Block Explorer**: Browse all blocks in the blockchain
3. **File Verification**: Verify if a file exists in the blockchain
4. **Search**: Search reports by keywords
5. **Timeline**: View chronological chain timeline
6. **Certificate Generation**: Download PDF certificates for reports
7. **Merkle Proofs**: Cryptographic proof of file inclusion
8. **Chain Verification**: Verify blockchain integrity

## Database Schema

- **blocks**: Stores blockchain blocks
  - idx, timestamp, previous_hash, merkle_root, block_hash
  
- **transactions**: Stores report transactions
  - tx_id, block_idx, report_id, title, uploader, metadata, report_hash

## API Endpoints

- `POST /api/report` - Create new report
- `GET /api/explorer` - Get all blocks
- `GET /api/block/<idx>` - Get specific block
- `POST /api/verify` - Verify file exists
- `GET /api/search?q=<query>` - Search reports
- `GET /api/chain/timeline` - Get timeline view
- `GET /api/chain/verify` - Verify chain integrity
- `GET /api/block/<idx>/merkle?leaf=<hash>` - Get merkle proof
- `GET /api/report/<id>/certificate` - Download PDF certificate

## Deployment

Configured for VM deployment:
- Build: `cd frontend && npm run build`
- Run: Backend and frontend preview server together
- Frontend serves on port 5000
- Backend API on port 8000

## Recent Changes

- 2025-11-22: Vibrant UI Revamp
  - **Backend fixes**: Resolved all LSP errors in backend/app.py (reportlab type checking)
  - **New color palette**: Vibrant cyan (primary), rich purple (secondary), bold pink/red (accent), fresh emerald (success), bright orange (warning)
  - **Tailwind enhancements**: Added gradient utilities, enhanced shadows, animation keyframes (fade-in, fade-in-up, slide-up, pulse-scale, float, glow), safelist for custom gradient classes
  - **Component updates**: 
    - Button: New gradient variants, ripple effects, scale hover animations
    - Card: Enhanced hover effects, fade-in-up animations
    - Input/TextArea: Glow effects on focus, scale transitions
    - FileUpload: Vibrant gradients, enhanced animations, controlled state
  - **Page updates**: All 5 pages (CreateReport, Explorer, Verify, Search, Timeline) updated with new vibrant gradient titles and modern animations
  - **Navbar**: Updated with vibrant gradient logo and enhanced nav link animations
  - **Accessibility**: Added prefers-reduced-motion support for animations
  - **Removed** problematic @apply directives that caused Tailwind v4 errors
  - Application running successfully on port 5000

- 2025-11-21: Initial Replit setup
  - Installed Python 3.11 and Node.js 20
  - Configured Vite for Replit environment (0.0.0.0:5000)
  - Added Vite proxy configuration for /api requests
  - Updated backend port to 8000 (from 5001)
  - Changed backend to bind to 0.0.0.0 for external access
  - Switched from Flask development server to Gunicorn for production-ready serving
  - Set up workflows for frontend (Vite) and backend (Gunicorn)
  - Configured deployment settings for VM deployment

## Notes

- The WebSocket connection warning in browser console is expected (Vite HMR in Replit environment)
- Database is automatically initialized on backend startup via workflow command
- All cryptographic keys are stored in `backend/issuer_priv.pem` and `backend/issuer_pub.pem`
- Frontend uses Vite's proxy feature to route /api requests to backend on localhost:8000
- Backend uses Gunicorn with 2 workers for better performance and reliability
- The API is accessible via relative path "/api" from the frontend
