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
    pool_pre_ping=True,
    pool_recycle=300,
    pool_size=5,
    max_overflow=0
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
    tx_metadata = Column(Text)  # JSON string with file hashes
    block = relationship("Block", back_populates="transactions")

# -----------------------------
# 4️⃣ Initialize database
# -----------------------------
def init_db():
    """Initialize database and generate keys"""
    print("Initializing database...")
    try:
        Base.metadata.create_all(engine)
        generate_keys_if_missing()
        print("✅ Database initialized!")
    except Exception as e:
        print(f"⚠️ Database init skipped or failed: {e}")

# -----------------------------
# 5️⃣ Helper functions
# -----------------------------
def get_latest_block():
    with SessionLocal() as session:
        return session.query(Block).order_by(Block.idx.desc()).first()

def create_block(transactions_data, previous_hash):
    all_hashes = []
    for tx_data in transactions_data:
        metadata = json.loads(tx_data['tx_metadata'])
        all_hashes.extend([f['hash'] for f in metadata['files']])
    merkle = merkle_root(all_hashes) if all_hashes else sha256_bytes(b"genesis")
    
    latest_block = get_latest_block()
    idx = (latest_block.idx + 1) if latest_block else 0
    timestamp = datetime.utcnow().isoformat() + "Z"
    block_data = f"{idx}{timestamp}{previous_hash}{merkle}"
    block_hash = sha256_bytes(block_data.encode())
    
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
        
        for tx_data in transactions_data:
            new_tx = Transaction(
                block_id=new_block.id,
                tx_id=tx_data['tx_id'],
                report_id=tx_data['report_id'],
                title=tx_data['title'],
                uploader=tx_data['uploader'],
                description=tx_data['description'],
                tx_metadata=tx_data['tx_metadata']
            )
            session.add(new_tx)
        session.commit()
        
        return {
            'idx': new_block.idx,
            'block_hash': new_block.block_hash,
            'merkle_root': new_block.merkle_root
        }

# -----------------------------
# 6️⃣ API Routes (all /api prefix)
# -----------------------------
@app.route("/api/status", methods=["GET"])
def home():
    return {"status": "BlockWitness Backend Running 🎉"}

@app.route("/api/report", methods=["POST"])
def create_report():
    try:
        title = request.form.get("title", "Untitled Report")
        description = request.form.get("description", "")
        uploader = request.form.get("uploader", "anonymous")
        files = request.files.getlist("files")
        if not files:
            return jsonify({"error": "No files uploaded"}), 400

        report_id = f"RPT-{uuid.uuid4().hex[:12].upper()}"
        tx_id = f"TX-{uuid.uuid4().hex[:16].upper()}"
        
        evidence_files = []
        os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
        for file in files:
            if file.filename:
                filename = f"{uuid.uuid4().hex}_{file.filename}"
                filepath = os.path.join(Config.UPLOAD_FOLDER, filename)
                file.save(filepath)
                file_hash = sha256_file(filepath)
                evidence_files.append({"filename": file.filename, "hash": file_hash, "stored_as": filename})
        
        tx_data = {
            'tx_id': tx_id,
            'report_id': report_id,
            'title': title,
            'uploader': uploader,
            'description': description,
            'tx_metadata': json.dumps({'files': evidence_files, 'created_at': datetime.utcnow().isoformat()})
        }
        
        latest_block = get_latest_block()
        previous_hash = latest_block.block_hash if latest_block else "0" * 64
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

@app.route("/api/blocks", methods=["GET"])
def explorer():
    with SessionLocal() as session:
        blocks = session.query(Block).order_by(Block.idx.asc()).all()
        return jsonify([{
            "idx": b.idx,
            "timestamp": b.timestamp,
            "merkle_root": b.merkle_root,
            "block_hash": b.block_hash,
            "tx_count": len(b.transactions)
        } for b in blocks])

@app.route("/api/block/<int:idx>", methods=["GET"])
def get_block(idx):
    with SessionLocal() as session:
        block = session.query(Block).filter(Block.idx == idx).first()
        if not block:
            return jsonify({"error": "Block not found"}), 404
        transactions = [{
            "tx_id": tx.tx_id,
            "report_id": tx.report_id,
            "title": tx.title,
            "uploader": tx.uploader,
            "description": tx.description,
            "metadata": json.loads(tx.tx_metadata)
        } for tx in block.transactions]
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
    try:
        file = request.files.get("file")
        if not file:
            return jsonify({"error": "No file uploaded"}), 400
        os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
        temp_path = os.path.join(Config.UPLOAD_FOLDER, f"temp_{uuid.uuid4().hex}")
        file.save(temp_path)
        file_hash = sha256_file(temp_path)
        os.remove(temp_path)
        
        with SessionLocal() as session:
            for tx in session.query(Transaction).all():
                metadata = json.loads(tx.tx_metadata)
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
    query = request.args.get("q", "").lower()
    if not query:
        return jsonify([])
    with SessionLocal() as session:
        results = []
        for tx in session.query(Transaction).all():
            block = session.query(Block).filter(Block.id == tx.block_id).first()
            if any(query in str(field).lower() for field in [tx.title, tx.uploader, tx.report_id, str(block.idx)]):
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
    with SessionLocal() as session:
        return jsonify([{
            "idx": b.idx,
            "timestamp": b.timestamp,
            "block_hash": b.block_hash,
            "transactions": [{"tx_id": t.tx_id, "report_id": t.report_id, "title": t.title, "uploader": t.uploader} for t in b.transactions]
        } for b in session.query(Block).order_by(Block.idx.asc()).all()])

@app.route("/api/chain/verify", methods=["GET"])
def verify_chain():
    with SessionLocal() as session:
        blocks = session.query(Block).order_by(Block.idx.asc()).all()
        problems = []
        for i, block in enumerate(blocks):
            if i > 0 and block.previous_hash != blocks[i-1].block_hash:
                problems.append(f"Block {block.idx}: previous_hash mismatch")
            expected_hash = sha256_bytes(f"{block.idx}{block.timestamp}{block.previous_hash}{block.merkle_root}".encode()).hex()
            if block.block_hash != expected_hash:
                problems.append(f"Block {block.idx}: block_hash invalid")
        return jsonify({"ok": len(problems)==0, "total_blocks": len(blocks), "problems": problems})

# -----------------------------
# 7️⃣ Run the app
# -----------------------------
if __name__ == "__main__":
    init_db()
    port = int(os.getenv("PORT", 8000))
    app.run(host="0.0.0.0", port=port, debug=True)
