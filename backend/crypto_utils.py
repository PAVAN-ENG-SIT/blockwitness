# backend/crypto_utils.py
from Crypto.PublicKey import RSA
from Crypto.Signature import pkcs1_15
from Crypto.Hash import SHA256
import os

def generate_keys_if_missing():
    """Generate RSA keys if they don't exist"""
    keys_folder = os.path.join(os.path.dirname(__file__), "keys")
    private_key_path = os.path.join(keys_folder, "issuer_priv.pem")
    public_key_path = os.path.join(keys_folder, "issuer_pub.pem")
    
    if not os.path.exists(private_key_path) or not os.path.exists(public_key_path):
        print("🔑 Generating RSA keys...")
        key = RSA.generate(2048)
        
        with open(private_key_path, 'wb') as f:
            f.write(key.export_key())
        
        with open(public_key_path, 'wb') as f:
            f.write(key.publickey().export_key())
        
        print("✅ Keys generated successfully!")

def sign_hex(private_key_path, data_hex):
    """
    Sign a hex string with RSA private key
    
    Args:
        private_key_path: Path to private key PEM file
        data_hex: Hex string to sign
    
    Returns:
        Hex signature string
    """
    with open(private_key_path, 'rb') as f:
        key = RSA.import_key(f.read())
    
    # Convert hex to bytes
    data_bytes = bytes.fromhex(data_hex)
    
    # Create hash and sign
    h = SHA256.new(data_bytes)
    signature = pkcs1_15.new(key).sign(h)
    
    return signature.hex()

def verify_hex(public_key_path, data_hex, signature_hex):
    """
    Verify a signature
    
    Args:
        public_key_path: Path to public key PEM file
        data_hex: Original data hex string
        signature_hex: Signature hex string
    
    Returns:
        Boolean indicating if signature is valid
    """
    try:
        with open(public_key_path, 'rb') as f:
            key = RSA.import_key(f.read())
        
        # Convert hex to bytes
        data_bytes = bytes.fromhex(data_hex)
        signature_bytes = bytes.fromhex(signature_hex)
        
        # Create hash and verify
        h = SHA256.new(data_bytes)
        pkcs1_15.new(key).verify(h, signature_bytes)
        
        return True
    except (ValueError, TypeError):
        return False