# backend/app.py

import os
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, Text, text
from sqlalchemy.orm import sessionmaker, relationship, declarative_base
from sqlalchemy.exc import SQLAlchemyError
from fpdf import FPDF
from chain_utils import sha256_bytes, merkle_root
from crypto_utils import sign_hex, verify_hex

# -----------------------------
# 1️⃣ Flask app setup
# -----------------------------
app = Flask(__name__)
CORS(app)

# -----------------------------
# 2️⃣ PostgreSQL connection
# -----------------------------
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise Exception("DATABASE_URL environment variable not set")

# Render fix: replace old postgres URI scheme
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://")

engine = create_engine(DATABASE_URL, connect_args={"sslmode": "require"})
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

# -----------------------------
# 3️⃣ Models
# -----------------------------
class Block(Base):
    __tablename__ = "blocks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    block_hash = Column(String(256), unique=True, nullable=False)
    previous_hash = Column(String(256))
    nonce = Column(String(256))
    data = Column(Text)
    block_metadata = Column(Text)

    transactions = relationship("Transaction", back_populates="block")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    block_id = Column(Integer, ForeignKey("blocks.id"))
    sender = Column(String(256))
    receiver = Column(String(256))
    amount = Column(String(100))
    tx_hash = Column(String(256))

    block = relationship("Block", back_populates="transactions")


# -----------------------------
# 4️⃣ Create tables if not exist
# -----------------------------
Base.metadata.create_all(engine)

# -----------------------------
# 5️⃣ Routes
# -----------------------------
@app.route("/", methods=["GET"])
def home():
    return {"status": "Backend running with PostgreSQL 🎉"}

@app.route("/db-test", methods=["GET"])
def db_test():
    """Simple test to confirm database connection"""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "Database Connected 🎉"}
    except Exception as e:
        return {"status": "Database Error", "message": str(e)}

# -----------------------------
# Generate certificate
# -----------------------------
@app.route("/generate_certificate", methods=["POST"])
def generate_certificate():
    data = request.json
    student_name = data.get("student_name")
    course = data.get("course")
    date = data.get("date")

    if not all([student_name, course, date]):
        return {"error": "Missing data"}, 400

    # Create PDF certificate
    os.makedirs("certificates", exist_ok=True)
    cert_file_path = os.path.join("certificates", f"{student_name}_certificate.pdf")
    cert_content = f"Certificate of Completion\n\nStudent: {student_name}\nCourse: {course}\nDate: {date}"

    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=16)
    pdf.multi_cell(0, 10, cert_content)
    pdf.output(cert_file_path)

    # Hash PDF
    with open(cert_file_path, "rb") as f:
        pdf_bytes = f.read()
    cert_hash = sha256_bytes(pdf_bytes)

    # Sign hash
    priv_key_path = os.path.join("keys", "issuer_priv.pem")
    signature_hex = sign_hex(priv_key_path, cert_hash)

    # Return PDF, hash, signature
    return send_file(cert_file_path, as_attachment=True), 200

# -----------------------------
# Add block
# -----------------------------
@app.route("/add_block", methods=["POST"])
def add_block():
    data = request.json
    with SessionLocal() as session:
        try:
            new_block = Block(
                block_hash=data["block_hash"],
                previous_hash=data.get("previous_hash"),
                nonce=data.get("nonce"),
                data=data.get("data"),
                block_metadata=data.get("metadata")
            )
            session.add(new_block)
            session.commit()
            return jsonify({"message": "Block added successfully"}), 201
        except SQLAlchemyError as e:
            session.rollback()
            return jsonify({"error": str(e)}), 500

# -----------------------------
# Add transaction
# -----------------------------
@app.route("/add_transaction", methods=["POST"])
def add_transaction():
    data = request.json
    with SessionLocal() as session:
        try:
            new_tx = Transaction(
                block_id=data["block_id"],
                sender=data["sender"],
                receiver=data["receiver"],
                amount=data["amount"],
                tx_hash=data["tx_hash"]
            )
            session.add(new_tx)
            session.commit()
            return jsonify({"message": "Transaction added successfully"}), 201
        except SQLAlchemyError as e:
            session.rollback()
            return jsonify({"error": str(e)}), 500

# -----------------------------
# Get blocks
# -----------------------------
@app.route("/blocks", methods=["GET"])
def get_blocks_alias():
    return get_blocks()

@app.route("/get_blocks", methods=["GET"])
def get_blocks():
    with SessionLocal() as session:
        blocks = session.query(Block).all()
        result = []
        for block in blocks:
            result.append({
                "id": block.id,
                "block_hash": block.block_hash,
                "previous_hash": block.previous_hash,
                "nonce": block.nonce,
                "data": block.data,
                "metadata": block.block_metadata,
                "transactions": [
                    {
                        "id": tx.id,
                        "sender": tx.sender,
                        "receiver": tx.receiver,
                        "amount": tx.amount,
                        "tx_hash": tx.tx_hash
                    } for tx in block.transactions
                ]
            })
        return jsonify(result)

# -----------------------------
# 6️⃣ Run the app
# -----------------------------
if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))  # Render requires using PORT env variable
    app.run(host="0.0.0.0", port=port)
