# backend/app.py
import os
import uuid
import json
import qrcode
from io import BytesIO
from datetime import datetime
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from sqlalchemy import create_engine, Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import sessionmaker, relationship, declarative_base
from fpdf import FPDF

from config import Config
from chain_utils import sha256_file, sha256_bytes, merkle_root
from crypto_utils import sign_hex, verify_hex, generate_keys_if_missing

# -----------------------------
# 1️⃣ Flask app setup
# -----------------------------
app = Flask(__name__)
CORS(app)

# -----------------------------
# 2️⃣ Database setup
# -----------------------------
DATABASE_URI = Config.get_database_uri()
print(f"🗄️  Using database: {DATABASE_URI}")

engine = create_engine(
    DATABASE_URI,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URI else {}
)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

# -----------------------------
# 3️⃣ Models
# -----------------------------
class Block(Base):
    __tablename__ = "blocks"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    idx = Column(Integer, unique=True, nullable=False)
    timestamp = Column(String(100))
    previous_hash = Column(String(256))
    merkle_root = Column(String(256))
    block_hash = Column(String(256), unique=True, nullable=False)
    
    transactions = relationship("Transaction", back_populates="block")

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    block_id = Column(Integer, ForeignKey("blocks.id"))
    tx_id = Column(String(256), unique=True, nullable=False)
    report_id = Column(String(256), unique=True, nullable=False)
    title = Column(String(500))
    uploader = Column(String(256))
    description = Column(Text)
    metadata = Column(Text)  # JSON string with file hashes
    
    block = relationship("Block", back_populates="transactions")

# -----------------------------
# 4️⃣ Initialize database
# -----------------------------
def init_db():
    """Initialize database and generate keys"""
    print("🔧 Initializing database...")
    Base.metadata.create_all(engine)
    generate_keys_if_missing()
    print("✅ Database initialized!")

# -----------------------------
# 5️⃣ Helper functions
# -----------------------------
def get_latest_block():
    """Get the latest block in the chain"""
    with SessionLocal() as session:
        return session.query(Block).order_by(Block.idx.desc()).first()

def create_block(transactions_data, previous_hash):
    """Create a new block with transactions"""
    # Calculate merkle root from file hashes
    all_hashes = []
    for tx_data in transactions_data:
        metadata = json.loads(tx_data['metadata'])
        all_hashes.extend([f['hash'] for f in metadata['files']])
    
    merkle = merkle_root(all_hashes) if all_hashes else sha256_bytes(b"genesis").hex()
    
    # Create block data
    latest_block = get_latest_block()
    idx = (latest_block.idx + 1) if latest_block else 0
    timestamp = datetime.utcnow().isoformat() + "Z"
    
    # Compute block hash
    block_data = f"{idx}{timestamp}{previous_hash}{merkle}"
    block_hash = sha256_bytes(block_data.encode()).hex()
    
    # Save block
    with SessionLocal() as session:
        new_block = Block(
            idx=idx,
            timestamp=timestamp,
            previous_hash=previous_hash,
            merkle_root=merkle,
            block_hash=block_hash
        )
        session.add(new_block)
        session.commit()
        session.refresh(new_block)
        
        # Save transactions
        for tx_data in transactions_data:
            new_tx = Transaction(
                block_id=new_block.id,
                tx_id=tx_data['tx_id'],
                report_id=tx_data['report_id'],
                title=tx_data['title'],
                uploader=tx_data['uploader'],
                description=tx_data['description'],
                metadata=tx_data['metadata']
            )
            session.add(new_tx)
        
        session.commit()
        
        return {
            'idx': new_block.idx,
            'block_hash': new_block.block_hash,
            'merkle_root': new_block.merkle_root
        }

# -----------------------------
# 6️⃣ Routes
# -----------------------------
@app.route("/", methods=["GET"])
def home():
    return {"status": "BlockWitness Backend Running 🎉"}

@app.route("/api/report", methods=["POST"])
def create_report():
    """Create a new incident report with evidence files"""
    try:
        # Get form data
        title = request.form.get("title", "Untitled Report")
        description = request.form.get("description", "")
        uploader = request.form.get("uploader", "anonymous")
        files = request.files.getlist("files")
        
        if not files:
            return jsonify({"error": "No files uploaded"}), 400
        
        # Generate report ID
        report_id = f"RPT-{uuid.uuid4().hex[:12].upper()}"
        tx_id = f"TX-{uuid.uuid4().hex[:16].upper()}"
        
        # Process files
        evidence_files = []
        for file in files:
            if file.filename:
                # Save file
                filename = f"{uuid.uuid4().hex}_{file.filename}"
                filepath = os.path.join(Config.UPLOAD_FOLDER, filename)
                file.save(filepath)
                
                # Compute hash
                file_hash = sha256_file(filepath)
                
                evidence_files.append({
                    "filename": file.filename,
                    "hash": file_hash,
                    "stored_as": filename
                })
        
        # Create transaction data
        tx_data = {
            'tx_id': tx_id,
            'report_id': report_id,
            'title': title,
            'uploader': uploader,
            'description': description,
            'metadata': json.dumps({
                'files': evidence_files,
                'created_at': datetime.utcnow().isoformat()
            })
        }
        
        # Get previous block hash
        latest_block = get_latest_block()
        previous_hash = latest_block.block_hash if latest_block else "0" * 64
        
        # Create new block
        block_info = create_block([tx_data], previous_hash)
        
        return jsonify({
            "message": "Report created successfully",
            "report_id": report_id,
            "block_index": block_info['idx'],
            "merkle_root": block_info['merkle_root'],
            "evidence": evidence_files
        }), 201
        
    except Exception as e:
        print(f"Error creating report: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/explorer", methods=["GET"])
def explorer():
    """Get all blocks in the blockchain"""
    with SessionLocal() as session:
        blocks = session.query(Block).order_by(Block.idx.asc()).all()
        result = []
        for block in blocks:
            result.append({
                "idx": block.idx,
                "timestamp": block.timestamp,
                "merkle_root": block.merkle_root,
                "block_hash": block.block_hash,
                "tx_count": len(block.transactions)
            })
        return jsonify(result)

@app.route("/api/block/<int:idx>", methods=["GET"])
def get_block(idx):
    """Get detailed block information"""
    with SessionLocal() as session:
        block = session.query(Block).filter(Block.idx == idx).first()
        if not block:
            return jsonify({"error": "Block not found"}), 404
        
        transactions = []
        for tx in block.transactions:
            transactions.append({
                "tx_id": tx.tx_id,
                "report_id": tx.report_id,
                "title": tx.title,
                "uploader": tx.uploader,
                "description": tx.description,
                "metadata": json.loads(tx.metadata)
            })
        
        return jsonify({
            "idx": block.idx,
            "timestamp": block.timestamp,
            "previous_hash": block.previous_hash,
            "merkle_root": block.merkle_root,
            "block_hash": block.block_hash,
            "transactions": transactions
        })

@app.route("/api/verify", methods=["POST"])
def verify_file():
    """Verify if a file exists in the blockchain"""
    try:
        file = request.files.get("file")
        if not file:
            return jsonify({"error": "No file uploaded"}), 400
        
        # Compute file hash
        temp_path = os.path.join(Config.UPLOAD_FOLDER, f"temp_{uuid.uuid4().hex}")
        file.save(temp_path)
        file_hash = sha256_file(temp_path)
        os.remove(temp_path)
        
        # Search for hash in database
        with SessionLocal() as session:
            transactions = session.query(Transaction).all()
            for tx in transactions:
                metadata = json.loads(tx.metadata)
                for f in metadata['files']:
                    if f['hash'] == file_hash:
                        block = session.query(Block).filter(Block.id == tx.block_id).first()
                        return jsonify({
                            "found": True,
                            "match": {
                                "hash": file_hash,
                                "report_id": tx.report_id,
                                "title": tx.title,
                                "uploader": tx.uploader,
                                "block_index": block.idx,
                                "timestamp": block.timestamp,
                                "merkle_root": block.merkle_root
                            }
                        })
            
            return jsonify({"found": False})
            
    except Exception as e:
        print(f"Error verifying file: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/search", methods=["GET"])
def search():
    """Search reports by keyword"""
    query = request.args.get("q", "").lower()
    if not query:
        return jsonify([])
    
    with SessionLocal() as session:
        transactions = session.query(Transaction).all()
        results = []
        
        for tx in transactions:
            block = session.query(Block).filter(Block.id == tx.block_id).first()
            
            # Search in title, uploader, report_id
            if (query in tx.title.lower() or 
                query in tx.uploader.lower() or 
                query in tx.report_id.lower() or
                query == str(block.idx)):
                
                results.append({
                    "tx_id": tx.tx_id,
                    "report_id": tx.report_id,
                    "title": tx.title,
                    "uploader": tx.uploader,
                    "description": tx.description,
                    "block_index": block.idx
                })
        
        return jsonify(results)

@app.route("/api/chain/timeline", methods=["GET"])
def timeline():
    """Get chronological timeline of all blocks"""
    with SessionLocal() as session:
        blocks = session.query(Block).order_by(Block.idx.asc()).all()
        result = []
        
        for block in blocks:
            transactions = []
            for tx in block.transactions:
                transactions.append({
                    "tx_id": tx.tx_id,
                    "report_id": tx.report_id,
                    "title": tx.title,
                    "uploader": tx.uploader
                })
            
            result.append({
                "idx": block.idx,
                "timestamp": block.timestamp,
                "block_hash": block.block_hash,
                "transactions": transactions
            })
        
        return jsonify(result)

@app.route("/api/chain/verify", methods=["GET"])
def verify_chain():
    """Verify the integrity of the entire blockchain"""
    with SessionLocal() as session:
        blocks = session.query(Block).order_by(Block.idx.asc()).all()
        
        problems = []
        for i, block in enumerate(blocks):
            # Check previous hash linkage
            if i > 0:
                expected_prev = blocks[i-1].block_hash
                if block.previous_hash != expected_prev:
                    problems.append(f"Block {block.idx}: previous_hash mismatch")
            
            # Verify block hash
            block_data = f"{block.idx}{block.timestamp}{block.previous_hash}{block.merkle_root}"
            expected_hash = sha256_bytes(block_data.encode()).hex()
            if block.block_hash != expected_hash:
                problems.append(f"Block {block.idx}: block_hash invalid")
        
        return jsonify({
            "ok": len(problems) == 0,
            "total_blocks": len(blocks),
            "problems": problems
        })

@app.route("/api/report/<report_id>/certificate", methods=["GET"])
def download_certificate(report_id):
    """Generate and download PDF certificate for a report"""
    try:
        with SessionLocal() as session:
            tx = session.query(Transaction).filter(Transaction.report_id == report_id).first()
            if not tx:
                return jsonify({"error": "Report not found"}), 404
            
            block = session.query(Block).filter(Block.id == tx.block_id).first()
            
            # Generate PDF
            pdf = FPDF()
            pdf.add_page()
            
            # Title
            pdf.set_font("Arial", "B", 24)
            pdf.cell(0, 20, "CERTIFICATE OF AUTHENTICITY", align="C", ln=True)
            
            # Report details
            pdf.set_font("Arial", "", 12)
            pdf.ln(10)
            pdf.cell(0, 10, f"Report ID: {tx.report_id}", ln=True)
            pdf.cell(0, 10, f"Title: {tx.title}", ln=True)
            pdf.cell(0, 10, f"Submitted by: {tx.uploader}", ln=True)
            pdf.cell(0, 10, f"Block: #{block.idx}", ln=True)
            pdf.cell(0, 10, f"Timestamp: {block.timestamp}", ln=True)
            pdf.ln(5)
            pdf.multi_cell(0, 10, f"Block Hash: {block.block_hash}")
            pdf.multi_cell(0, 10, f"Merkle Root: {block.merkle_root}")
            
            # Generate QR code
            qr = qrcode.QRCode(version=1, box_size=10, border=4)
            qr.add_data(f"Report: {report_id}\nBlock: {block.idx}\nHash: {block.block_hash}")
            qr.make(fit=True)
            qr_img = qr.make_image(fill_color="black", back_color="white")
            
            qr_path = os.path.join(Config.CERTIFICATES_FOLDER, f"qr_{report_id}.png")
            qr_img.save(qr_path)
            
            pdf.image(qr_path, x=80, y=150, w=50)
            
            # Save PDF
            pdf_path = os.path.join(Config.CERTIFICATES_FOLDER, f"cert_{report_id}.pdf")
            pdf.output(pdf_path)
            
            return send_file(pdf_path, as_attachment=True, download_name=f"certificate_{report_id}.pdf")
            
    except Exception as e:
        print(f"Error generating certificate: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/block/<int:idx>/qr", methods=["GET"])
def get_block_qr(idx):
    """Generate QR code for block verification"""
    try:
        with SessionLocal() as session:
            block = session.query(Block).filter(Block.idx == idx).first()
            if not block:
                return jsonify({"error": "Block not found"}), 404
            
            # Generate QR code
            qr = qrcode.QRCode(version=1, box_size=10, border=4)
            qr.add_data(f"Block: {block.idx}\nHash: {block.block_hash}\nMerkle: {block.merkle_root}")
            qr.make(fit=True)
            qr_img = qr.make_image(fill_color="black", back_color="white")
            
            # Convert to base64
            buffered = BytesIO()
            qr_img.save(buffered, format="PNG")
            import base64
            qr_base64 = base64.b64encode(buffered.getvalue()).decode()
            
            return jsonify({
                "qr_base64": qr_base64,
                "verification_url": f"/api/block/{idx}"
            })
            
    except Exception as e:
        print(f"Error generating QR: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/block/<int:idx>/merkle", methods=["GET"])
def get_merkle_proof(idx):
    """Generate Merkle proof for a file in a block"""
    leaf_hash = request.args.get("leaf", "")
    
    with SessionLocal() as session:
        block = session.query(Block).filter(Block.idx == idx).first()
        if not block:
            return jsonify({"error": "Block not found"}), 404
        
        # Get all file hashes from transactions
        all_hashes = []
        for tx in block.transactions:
            metadata = json.loads(tx.metadata)
            all_hashes.extend([f['hash'] for f in metadata['files']])
        
        if not all_hashes:
            return jsonify({"error": "No files in block"}), 404
        
        # Use first hash if no leaf specified
        if not leaf_hash:
            leaf_hash = all_hashes[0]
        
        # Generate simple proof (for demonstration)
        # In production, implement full Merkle tree proof generation
        proof = [{"sibling": h, "position": "right"} for h in all_hashes if h != leaf_hash]
        
        return jsonify({
            "leaf": leaf_hash,
            "root": block.merkle_root,
            "proof": proof[:3],  # Limit for demo
            "valid": leaf_hash in all_hashes
        })

# -----------------------------
# 7️⃣ Run the app
# -----------------------------
if __name__ == "__main__":
    init_db()
    port = int(os.getenv("PORT", 8000))
    app.run(host="0.0.0.0", port=port, debug=True)