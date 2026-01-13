from waitress import serve
from app import app, init_db
import os

if __name__ == "__main__":
    print("Initializing Database...")
    init_db()
    
    port = int(os.getenv("PORT", 8000))
    print(f"Backend running on http://0.0.0.0:{port}")
    print("Press Ctrl+C to stop")
    
    # Use waitress for robust serving on Windows
    serve(app, host="0.0.0.0", port=port, threads=6)
