import os

class Config:
    """Base configuration"""
    # Database configuration
    USE_POSTGRES = os.getenv("USE_POSTGRES", "false").lower() == "true"
    DATABASE_URL = os.getenv("DATABASE_URL")
    
    # Local SQLite path
    SQLITE_PATH = os.path.join(os.path.dirname(__file__), "chain.db")
    
    # Upload directory
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads")
    CERTIFICATES_FOLDER = os.path.join(os.path.dirname(__file__), "certificates")
    KEYS_FOLDER = os.path.join(os.path.dirname(__file__), "keys")
    
    # Ensure directories exist
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    os.makedirs(CERTIFICATES_FOLDER, exist_ok=True)
    os.makedirs(KEYS_FOLDER, exist_ok=True)
    
    @classmethod
    def get_database_uri(cls):
        """Get the appropriate database URI"""
        if cls.USE_POSTGRES and cls.DATABASE_URL:
            # Render fix: replace old postgres URI scheme
            if cls.DATABASE_URL.startswith("postgres://"):
                return cls.DATABASE_URL.replace("postgres://", "postgresql://")
            return cls.DATABASE_URL
        else:
            # Use SQLite for local development
            return f"sqlite:///{cls.SQLITE_PATH}"