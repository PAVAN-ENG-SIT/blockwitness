# backend/app.py

import os
from sqlalchemy import create_engine, text

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS

import time
import json
import uuid
import hashlib
import base64
from io import BytesIO
from pathlib import Path

# Optional libs
try:
    import qrcode
except Exception:
    qrcode = None


# ----------------------------------------
# 1. DATABASE CONNECTION (PostgreSQL)
# ----------------------------------------

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)


# ----------------------------------------
# 2. FLASK APP SETUP
# ----------------------------------------

app = Flask(__name__)
CORS(app)


# ----------------------------------------
# 3. DB TEST ROUTE
# ----------------------------------------

@app.route("/db-test", methods=["GET"])
def test_db():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "Database Connected"}
    except Exception as e:
        return {"status": "Database Error", "message": str(e)}

try:
    from reportlab.lib.pagesizes import A4
    from reportlab.pdfgen import canvas
    from reportlab.lib.utils import ImageReader
except Exception:
    canvas = None
    A4 = None
    ImageReader = None

BASE_DIR = Path(__file__).parent
UPLOAD_DIR = BASE_DIR / "uploads"
DB_PATH = BASE_DIR / "chain.db"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Single Flask app
app = Flask(__name__)

# CORS: allow only FRONTEND_ORIGIN if provided, else allow all (useful for quick testing)
FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN")  # set this to your Vercel URL in Render env vars
if FRONTEND_ORIGIN:
    CORS(app, origins=[FRONTEND_ORIGIN])
else:
    CORS(app)  # fallback during testing

# ----------------------
# Utilities
# ----------------------
def sha256_bytes(b: bytes) -> str:
    return hashlib.sha256(b).hexdigest()

def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()

def merkle_root(hash_list):
    if not hash_list:
        return ""
    cur = [h for h in hash_list]
    while len(cur) > 1:
        nxt = []
        for i in range(0, len(cur), 2):
            a = cur[i]
            b = cur[i+1] if i+1 < len(cur) else cur[i]
            nxt.append(hashlib.sha256((a + b).encode()).hexdigest())
        cur = nxt
    return cur[0]

def merkle_proof(hash_list, leaf):
    if leaf not in hash_list:
        return None
    layer = [h for h in hash_list]
    proof = []
    idx = layer.index(leaf)
    while len(layer) > 1:
        nxt = []
        for i in range(0, len(layer), 2):
            a = layer[i]
            b = layer[i+1] if i+1 < len(layer) else layer[i]
            if i == idx or i+1 == idx:
                if i == idx:
                    sibling = b
                    position = "right"
                else:
                    sibling = a
                    position = "left"
                proof.append({"sibling": sibling, "position": position})
                new_hash = hashlib.sha256((a + b).encode()).hexdigest()
                nxt.append(new_hash)
                idx = len(nxt) - 1
            else:
                new_hash = hashlib.sha256((a + b).encode()).hexdigest()
                nxt.append(new_hash)
        layer = nxt
    return proof

# ----------------------
# DB init
# ----------------------
def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_conn()
    c = conn.cursor()
    c.execute("""
    CREATE TABLE IF NOT EXISTS blocks (
        idx INTEGER PRIMARY KEY,
        timestamp TEXT,
        previous_hash TEXT,
        merkle_root TEXT,
        block_hash TEXT
    )
    """)
    c.execute("""
    CREATE TABLE IF NOT EXISTS transactions (
        tx_id TEXT PRIMARY KEY,
        block_idx INTEGER,
        report_id TEXT,
        title TEXT,
        uploader TEXT,
        metadata TEXT,
        report_hash TEXT
    )
    """)
    conn.commit()
    conn.close()

init_db()

# ----------------------
# Health
# ----------------------
@app.get("/")
def home():
    return {"status": "BlockWitness backend running successfully!"}

# ----------------------
# Explorer & block endpoints
# ----------------------
@app.route("/api/explorer", methods=["GET"])
def explorer():
    conn = get_conn()
    c = conn.cursor()
    c.execute("SELECT idx, timestamp, block_hash, merkle_root FROM blocks ORDER BY idx DESC LIMIT 100")
    rows = [dict(r) for r in c.fetchall()]
    conn.close()
    return jsonify(rows)

@app.route("/api/block/<int:idx>", methods=["GET"])
def get_block(idx):
    conn = get_conn()
    c = conn.cursor()
    c.execute("SELECT * FROM blocks WHERE idx=?", (idx,))
    b = c.fetchone()
    if not b:
        conn.close()
        return jsonify({"error": "block not found"}), 404
    c.execute("SELECT * FROM transactions WHERE block_idx=?", (idx,))
    txs = [dict(r) for r in c.fetchall()]
    conn.close()
    out = dict(b)
    out["transactions"] = txs
    return jsonify(out)

# ----------------------
# Create report (upload + block creation)
# ----------------------
@app.route("/api/report", methods=["POST"])
def create_report():
    title = request.form.get("title", "Untitled")
    uploader = request.form.get("uploader", "anonymous")
    description = request.form.get("description", "")
    metadata = {
        "description": description,
        "location": request.form.get("location", ""),
        "time": request.form.get("time", "")
    }

    files = request.files.getlist("files")
    evidence = []
    for f in files:
        filename = f.filename or ("file_" + uuid.uuid4().hex)
        unique = f"{uuid.uuid4().hex}_{filename}"
        path = UPLOAD_DIR / unique
        f.save(path)
        file_hash = sha256_file(path)
        evidence.append({
            "filename": unique,
            "sha256": file_hash,
            "mimetype": f.mimetype,
            "size": path.stat().st_size
        })

    report = {
        "report_id": uuid.uuid4().hex,
        "title": title,
        "uploader": uploader,
        "metadata": metadata,
        "evidence": evidence
    }
    report_bytes = json.dumps(report, sort_keys=True).encode()
    report_hash = sha256_bytes(report_bytes)

    tx_id = "tx_" + uuid.uuid4().hex
    ev_hashes = [e["sha256"] for e in evidence] + [report_hash]
    root = merkle_root(ev_hashes)

    conn = get_conn()
    last = get_last_block_row(conn := conn)  # helper below uses conn directly
    conn = get_conn()
    last = get_last_block_row(conn)
    prev_hash = last["block_hash"] if last else "0" * 64
    timestamp = time.strftime("%Y-%m-%dT%H:%M:%S%z")
    c = conn.cursor()
    idx = (last["idx"] + 1) if last else 0
    block_payload = {"idx": idx, "timestamp": timestamp, "previous_hash": prev_hash, "merkle_root": root, "transactions": [tx_id]}
    block_hash = sha256_bytes(json.dumps(block_payload, sort_keys=True).encode())

    c.execute("INSERT INTO blocks (idx, timestamp, previous_hash, merkle_root, block_hash) VALUES (?, ?, ?, ?, ?)",
              (idx, timestamp, prev_hash, root, block_hash))
    c.execute("INSERT INTO transactions (tx_id, block_idx, report_id, title, uploader, metadata, report_hash) VALUES (?, ?, ?, ?, ?, ?, ?)",
              (tx_id, idx, report["report_id"], title, uploader, json.dumps(metadata), report_hash))
    conn.commit()
    conn.close()

    with open(UPLOAD_DIR / (report["report_id"] + ".json"), "wb") as fh:
        fh.write(report_bytes)

    return jsonify({
        "report_id": report["report_id"],
        "tx_id": tx_id,
        "block_index": idx,
        "block_hash": block_hash
    }), 201

# ----------------------
# Verify file
# ----------------------
@app.route("/api/verify", methods=["POST"])
def verify_file():
    f = request.files.get("file")
    if not f:
        return jsonify({"error": "no file provided"}), 400
    tmp = UPLOAD_DIR / ("tmp_" + uuid.uuid4().hex)
    f.save(tmp)
    h = sha256_file(tmp)
    matches = []
    conn = get_conn()
    c = conn.cursor()
    c.execute("SELECT t.*, b.block_hash, b.merkle_root, b.idx FROM transactions t JOIN blocks b ON t.block_idx=b.idx")
    for r in c.fetchall():
        report_id = r["report_id"]
        report_path = UPLOAD_DIR / (report_id + ".json")
        if report_path.exists():
            rep = json.loads(report_path.read_bytes())
            for e in rep.get("evidence", []):
                if e.get("sha256") == h:
                    matches.append({
                        "tx_id": r["tx_id"],
                        "report_id": report_id,
                        "block_idx": r["block_idx"],
                        "block_hash": r["block_hash"],
                        "merkle_root": r["merkle_root"]
                    })
    conn.close()
    tmp.unlink(missing_ok=True)
    return jsonify({"matches": matches})

# ----------------------
# QR endpoint
# ----------------------
@app.route("/api/block/<int:idx>/qr", methods=["GET"])
def block_qr(idx):
    frontend_origin = os.environ.get("FRONTEND_ORIGIN", FRONTEND_ORIGIN or "http://localhost:5173")
    verification_url = f"{frontend_origin}/explorer?block={idx}"
    if qrcode is None:
        return jsonify({"error": "qrcode not installed", "verification_url": verification_url})
    img = qrcode.make(verification_url)
    buf = BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    b64 = base64.b64encode(buf.read()).decode()
    return jsonify({"qr_base64": b64, "verification_url": verification_url})

# ----------------------
# Merkle proof endpoint
# ----------------------
@app.route("/api/block/<int:idx>/merkle", methods=["GET"])
def block_merkle(idx):
    leaf = request.args.get("leaf", "").strip()
    conn = get_conn()
    c = conn.cursor()
    c.execute("SELECT * FROM blocks WHERE idx=?", (idx,))
    b = c.fetchone()
    if not b:
        conn.close()
        return jsonify({"error": "block not found"}), 404
    c.execute("SELECT report_id FROM transactions WHERE block_idx=?", (idx,))
    rows = c.fetchall()
    ev_hashes = []
    for r in rows:
        report_id = r["report_id"]
        report_path = UPLOAD_DIR / (report_id + ".json")
        if report_path.exists():
            rep = json.loads(report_path.read_bytes())
            for e in rep.get("evidence", []):
                ev_hashes.append(e.get("sha256"))
            rep_bytes = json.dumps(rep, sort_keys=True).encode()
            rep_hash = sha256_bytes(rep_bytes)
            ev_hashes.append(rep_hash)
    ev_hashes = [h for i, h in enumerate(ev_hashes) if h and h not in ev_hashes[:i]]
    root = b["merkle_root"]
    if not ev_hashes:
        conn.close()
        return jsonify({"error": "no evidence hashes for block"}), 400
    if not leaf:
        leaf = ev_hashes[-1]
    proof = merkle_proof(ev_hashes, leaf)
    valid = False
    if proof is not None:
        cur = leaf
        for p in proof:
            sib = p["sibling"]
            if p["position"] == "left":
                cur = hashlib.sha256((sib + cur).encode()).hexdigest()
            else:
                cur = hashlib.sha256((cur + sib).encode()).hexdigest()
        valid = (cur == root)
    conn.close()
    return jsonify({"root": root, "proof": proof, "leaf": leaf, "valid": valid, "all_leaves": ev_hashes})

# ----------------------
# Certificate (PDF) endpoint
# ----------------------
@app.route("/api/report/<report_id>/certificate", methods=["GET"])
def report_certificate(report_id):
    report_path = UPLOAD_DIR / (f"{report_id}.json")
    if not report_path.exists():
        return jsonify({"error": "report JSON not found"}), 404
    report = json.loads(report_path.read_bytes())
    conn = get_conn()
    c = conn.cursor()
    c.execute("SELECT * FROM transactions WHERE report_id=?", (report_id,))
    tx = c.fetchone()
    if not tx:
        conn.close()
        return jsonify({"error": "transaction not found"}), 404
    block_idx = tx["block_idx"]
    c.execute("SELECT * FROM blocks WHERE idx=?", (block_idx,))
    blk = c.fetchone()
    conn.close()
    if canvas is None or A4 is None or ImageReader is None:
        return jsonify({
            "warning": "reportlab not installed; install to generate PDF",
            "report": report,
            "transaction": dict(tx),
            "block": dict(blk) if blk else None
        }), 200
    buf = BytesIO()
    cpdf = canvas.Canvas(buf, pagesize=A4)
    width, height = A4
    cpdf.setFont("Helvetica-Bold", 18)
    cpdf.drawString(40, height - 60, "BlockWitness — Evidence Certificate")
    cpdf.setFont("Helvetica", 12)
    cpdf.drawString(40, height - 90, f"Report ID: {report_id}")
    cpdf.drawString(40, height - 110, f"Title: {report.get('title')}")
    cpdf.drawString(40, height - 130, f"Uploader: {report.get('uploader')}")
    cpdf.drawString(40, height - 150, f"Block Index: {block_idx}")
    if blk:
        cpdf.drawString(40, height - 170, f"Block Hash: {blk['block_hash']}")
        cpdf.drawString(40, height - 190, f"Timestamp: {blk['timestamp']}")
    thumb_y = height - 320
    try:
        thumb_path = None
        if report.get("evidence"):
            fn = report["evidence"][0].get("filename")
            p = UPLOAD_DIR / fn
            if p.exists():
                thumb_path = p
        if not thumb_path:
            thumb_path = Path("/mnt/data/8c099852-aacd-4177-bd7b-db36ae98c0d2.png")
        if thumb_path.exists():
            img_reader = ImageReader(str(thumb_path))
            cpdf.drawImage(img_reader, 40, thumb_y, width=200, height=120, preserveAspectRatio=True)
    except Exception:
        pass
    desc = report.get("metadata", {}).get("description", "")
    cpdf.setFont("Helvetica", 10)
    text = cpdf.beginText(260, int(thumb_y + 100))
    text.textLines(f"Description: {desc}\n\nThis certificate proves the report was recorded in the local BlockWitness ledger. Verify at the BlockWitness Explorer using the block hash or the report ID.")
    cpdf.drawText(text)
    cpdf.setFont("Helvetica-Oblique", 9)
    cpdf.drawString(40, 50, "Generated by BlockWitness (demo) — not a legal document.")
    cpdf.showPage()
    cpdf.save()
    buf.seek(0)
    return send_file(buf, mimetype="application/pdf", download_name=f"certificate_{report_id}.pdf", as_attachment=True)

# ----------------------
# Chain verify & timeline
# ----------------------
@app.route("/api/chain/verify", methods=["GET"])
def chain_verify():
    conn = get_conn()
    c = conn.cursor()
    c.execute("SELECT * FROM blocks ORDER BY idx ASC")
    blocks = [dict(r) for r in c.fetchall()]
    problems = []
    prev_hash = None
    for b in blocks:
        idx = b["idx"]
        c.execute("SELECT tx_id FROM transactions WHERE block_idx=?", (idx,))
        txs = [r["tx_id"] for r in c.fetchall()]
        payload = {"idx": idx, "timestamp": b["timestamp"], "previous_hash": b["previous_hash"], "merkle_root": b["merkle_root"], "transactions": txs}
        recomputed = sha256_bytes(json.dumps(payload, sort_keys=True).encode())
        if recomputed != b["block_hash"]:
            problems.append({"idx": idx, "issue": "block_hash_mismatch", "expected": b["block_hash"], "recomputed": recomputed})
        if prev_hash is not None and b["previous_hash"] != prev_hash:
            problems.append({"idx": idx, "issue": "previous_hash_mismatch", "expected_prev": prev_hash, "got": b["previous_hash"]})
        prev_hash = b["block_hash"]
    conn.close()
    return jsonify({"ok": len(problems) == 0, "problems": problems})

@app.route("/api/chain/timeline", methods=["GET"])
def chain_timeline():
    conn = get_conn()
    c = conn.cursor()
    c.execute("SELECT * FROM blocks ORDER BY idx DESC")
    blocks = []
    for b in c.fetchall():
        idx = b["idx"]
        c.execute("SELECT tx_id, title, uploader, report_id FROM transactions WHERE block_idx=? ORDER BY tx_id", (idx,))
        txs = [dict(r) for r in c.fetchall()]
        blocks.append({
            "idx": b["idx"],
            "timestamp": b["timestamp"],
            "block_hash": b["block_hash"],
            "merkle_root": b["merkle_root"],
            "transactions": txs
        })
    conn.close()
    return jsonify(blocks)

# ----------------------
# Helpers used in create_report (must be defined after DB init)
# ----------------------
def get_last_block_row(conn):
    c = conn.cursor()
    c.execute("SELECT * FROM blocks ORDER BY idx DESC LIMIT 1")
    return c.fetchone()

# ----------------------
# Run
# ----------------------
if __name__ == "__main__":
    # init_db()  # already called at import
    # For local testing only; in Render use gunicorn: `gunicorn app:app --bind 0.0.0.0:$PORT`
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", "8000")), debug=False)




# """import os
# import time
# import json
# import uuid
# import hashlib
# import sqlite3
# import base64
# from io import BytesIO
# from pathlib import Path
# from flask import Flask, request, jsonify, send_file, abort
# from flask_cors import CORS


# # ... etc ...
# # ✅ Home route (safe to add here)
# @app.get("/")
# def home():
#     return {"status": "BlockWitness backend running successfully!"}

# # ===================================
# # your other imports + routes below
# # ===================================


# if __name__ == "__main__":
#     app.run(host="0.0.0.0", port=8000, debug=True, use_reloader=False)


# # backend/app.py

# try:
#     import qrcode
# except Exception:
#     qrcode = None

# try:
#     from reportlab.lib.pagesizes import A4
#     from reportlab.pdfgen import canvas
#     from reportlab.lib.utils import ImageReader
# except Exception:
#     # reportlab may not be installed
#     canvas = None
#     A4 = None
#     ImageReader = None

# BASE_DIR = Path(__file__).parent
# UPLOAD_DIR = BASE_DIR / "uploads"
# DB_PATH = BASE_DIR / "chain.db"
# UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# app = Flask(__name__)
# CORS(app)

# # ----------------------
# # Utilities
# # ----------------------
# def sha256_bytes(b: bytes) -> str:
#     return hashlib.sha256(b).hexdigest()

# def sha256_file(path: Path) -> str:
#     h = hashlib.sha256()
#     with open(path, "rb") as f:
#         for chunk in iter(lambda: f.read(8192), b""):
#             h.update(chunk)
#     return h.hexdigest()

# def merkle_root(hash_list):
#     # simple merkle: if empty -> '', if single -> that hash, else pairwise combine
#     if not hash_list:
#         return ""
#     cur = [h for h in hash_list]
#     while len(cur) > 1:
#         nxt = []
#         for i in range(0, len(cur), 2):
#             a = cur[i]
#             b = cur[i+1] if i+1 < len(cur) else cur[i]
#             nxt.append(hashlib.sha256((a + b).encode()).hexdigest())
#         cur = nxt
#     return cur[0]

# def merkle_proof(hash_list, leaf):
#     """
#     # Returns proof list for leaf (hex strings).
#     # proof format: list of { 'sibling': <hex>, 'position': 'left'|'right' }
#     # where sibling is the hash paired with current node.
#     """
#     # if leaf is not present, return None
#     if leaf not in hash_list:
#         return None
#     # map to current layer
#     layer = [h for h in hash_list]
#     proof = []
#     idx = layer.index(leaf)
#     while len(layer) > 1:
#         nxt = []
#         for i in range(0, len(layer), 2):
#             a = layer[i]
#             b = layer[i+1] if i+1 < len(layer) else layer[i]
#             # if current pair contains leaf or its ancestor, record sibling
#             if i == idx or i+1 == idx:
#                 # sibling is the other one
#                 if i == idx:
#                     sibling = b
#                     position = "right"
#                 else:
#                     sibling = a
#                     position = "left"
#                 proof.append({"sibling": sibling, "position": position})
#                 # new idx is index in nxt
#                 new_hash = hashlib.sha256((a + b).encode()).hexdigest()
#                 nxt.append(new_hash)
#                 idx = len(nxt) - 1
#             else:
#                 new_hash = hashlib.sha256((a + b).encode()).hexdigest()
#                 nxt.append(new_hash)
#         layer = nxt
#     return proof

# # ----------------------
# # DB init
# # ----------------------
# def get_conn():
#     conn = sqlite3.connect(DB_PATH)
#     conn.row_factory = sqlite3.Row
#     return conn

# def init_db():
#     conn = get_conn()
#     c = conn.cursor()
#     # blocks: idx integer primary key, timestamp, previous_hash, merkle_root, block_hash
#     c.execute("""
#     # CREATE TABLE IF NOT EXISTS blocks (
#     #     idx INTEGER PRIMARY KEY,
#     #     timestamp TEXT,
#     #     previous_hash TEXT,
#     #     merkle_root TEXT,
#     #     block_hash TEXT
#     # )
#     # """)
#     # # transactions: tx_id, block_idx, report_id, title, uploader, metadata (json), report_hash
#     # c.execute("""
#     # CREATE TABLE IF NOT EXISTS transactions (
#     #     tx_id TEXT PRIMARY KEY,
#     #     block_idx INTEGER,
#     #     report_id TEXT,
#     #     title TEXT,
#     #     uploader TEXT,
#     #     metadata TEXT,
#     #     report_hash TEXT
#     # )
#     """)
#     conn.commit()
#     conn.close()

# init_db()

# def get_last_block_row(conn):
#     c = conn.cursor()
#     c.execute("SELECT * FROM blocks ORDER BY idx DESC LIMIT 1")
#     return c.fetchone()

# # ----------------------
# # Basic endpoints (existing)
# # ----------------------

# @app.route("/api/explorer", methods=["GET"])
# def explorer():
#     conn = get_conn()
#     c = conn.cursor()
#     c.execute("SELECT idx, timestamp, block_hash, merkle_root FROM blocks ORDER BY idx DESC LIMIT 100")
#     rows = [dict(r) for r in c.fetchall()]
#     conn.close()
#     return jsonify(rows)

# @app.route("/api/block/<int:idx>", methods=["GET"])
# def get_block(idx):
#     conn = get_conn()
#     c = conn.cursor()
#     c.execute("SELECT * FROM blocks WHERE idx=?", (idx,))
#     b = c.fetchone()
#     if not b:
#         conn.close()
#         return jsonify({"error": "block not found"}), 404
#     c.execute("SELECT * FROM transactions WHERE block_idx=?", (idx,))
#     txs = [dict(r) for r in c.fetchall()]
#     conn.close()
#     out = dict(b)
#     out["transactions"] = txs
#     return jsonify(out)

# @app.route("/api/report", methods=["POST"])
# def create_report():
#     title = request.form.get("title", "Untitled")
#     uploader = request.form.get("uploader", "anonymous")
#     description = request.form.get("description", "")
#     metadata = {
#         "description": description,
#         "location": request.form.get("location", ""),
#         "time": request.form.get("time", "")
#     }

#     files = request.files.getlist("files")
#     evidence = []
#     for f in files:
#         filename = f.filename or ("file_" + uuid.uuid4().hex)
#         unique = f"{uuid.uuid4().hex}_{filename}"
#         path = UPLOAD_DIR / unique
#         f.save(path)
#         file_hash = sha256_file(path)
#         evidence.append({
#             "filename": unique,
#             "sha256": file_hash,
#             "mimetype": f.mimetype,
#             "size": path.stat().st_size
#         })

#     report = {
#         "report_id": uuid.uuid4().hex,
#         "title": title,
#         "uploader": uploader,
#         "metadata": metadata,
#         "evidence": evidence
#     }
#     report_bytes = json.dumps(report, sort_keys=True).encode()
#     report_hash = sha256_bytes(report_bytes)

#     # transaction id
#     tx_id = "tx_" + uuid.uuid4().hex

#     # compute merkle root using evidence hashes + report_hash
#     ev_hashes = [e["sha256"] for e in evidence] + [report_hash]
#     root = merkle_root(ev_hashes)

#     # create block
#     conn = get_conn()
#     last = get_last_block_row(conn)
#     prev_hash = last["block_hash"] if last else "0" * 64
#     timestamp = time.strftime("%Y-%m-%dT%H:%M:%S%z")
#     c = conn.cursor()
#     # block index
#     idx = (last["idx"] + 1) if last else 0
#     # payload used to compute hash (same structure as earlier)
#     block_payload = {"idx": idx, "timestamp": timestamp, "previous_hash": prev_hash, "merkle_root": root, "transactions": [tx_id]}
#     block_hash = sha256_bytes(json.dumps(block_payload, sort_keys=True).encode())

#     c.execute("INSERT INTO blocks (idx, timestamp, previous_hash, merkle_root, block_hash) VALUES (?, ?, ?, ?, ?)",
#               (idx, timestamp, prev_hash, root, block_hash))
#     c.execute("INSERT INTO transactions (tx_id, block_idx, report_id, title, uploader, metadata, report_hash) VALUES (?, ?, ?, ?, ?, ?, ?)",
#               (tx_id, idx, report["report_id"], title, uploader, json.dumps(metadata), report_hash))
#     conn.commit()
#     conn.close()

#     # save report JSON alongside uploads for later reference
#     with open(UPLOAD_DIR / (report["report_id"] + ".json"), "wb") as fh:
#         fh.write(report_bytes)

#     return jsonify({
#         "report_id": report["report_id"],
#         "tx_id": tx_id,
#         "block_index": idx,
#         "block_hash": block_hash
#     }), 201

# @app.route("/api/verify", methods=["POST"])
# def verify_file():
#     f = request.files.get("file")
#     if not f:
#         return jsonify({"error": "no file provided"}), 400
#     tmp = UPLOAD_DIR / ("tmp_" + uuid.uuid4().hex)
#     f.save(tmp)
#     h = sha256_file(tmp)
#     matches = []
#     conn = get_conn()
#     c = conn.cursor()
#     c.execute("SELECT t.*, b.block_hash, b.merkle_root, b.idx FROM transactions t JOIN blocks b ON t.block_idx=b.idx")
#     for r in c.fetchall():
#         report_id = r["report_id"]
#         report_path = UPLOAD_DIR / (report_id + ".json")
#         if report_path.exists():
#             rep = json.loads(report_path.read_bytes())
#             for e in rep.get("evidence", []):
#                 if e.get("sha256") == h:
#                     matches.append({
#                         "tx_id": r["tx_id"],
#                         "report_id": report_id,
#                         "block_idx": r["block_idx"],
#                         "block_hash": r["block_hash"],
#                         "merkle_root": r["merkle_root"]
#                     })
#     conn.close()
#     tmp.unlink(missing_ok=True)
#     return jsonify({"matches": matches})

# @app.route("/api/block/<int:idx>/qr", methods=["GET"])
# def block_qr(idx):
#     frontend_origin = os.environ.get("FRONTEND_ORIGIN", "http://localhost:5173")
#     verification_url = f"{frontend_origin}/explorer?block={idx}"
#     if qrcode is None:
#         return jsonify({"error": "qrcode library not installed", "verification_url": verification_url})
#     img = qrcode.make(verification_url)
#     buf = BytesIO()
#     img.save(buf, format="PNG")
#     buf.seek(0)
#     b64 = base64.b64encode(buf.read()).decode()
#     return jsonify({"qr_base64": b64, "verification_url": verification_url})

# # ----------------------
# # NEW: Merkle proof endpoint
# # ----------------------
# @app.route("/api/block/<int:idx>/merkle", methods=["GET"])
# def block_merkle(idx):
#     # """
#     # Query params:
#     #   - leaf=<sha256 hex of evidence or report hash>
#     # Returns: {
#     #   "root": "<merkle_root>",
#     #   "proof": [ { "sibling": "<hex>", "position": "left"|"right" }, ... ],
#     #   "leaf": "<leaf>",
#     #   "valid": true/false
#     # }
#     """
#     leaf = request.args.get("leaf", "").strip()
#     conn = get_conn()
#     c = conn.cursor()
#     c.execute("SELECT * FROM blocks WHERE idx=?", (idx,))
#     b = c.fetchone()
#     if not b:
#         conn.close()
#         return jsonify({"error": "block not found"}), 404

#     # Collect evidence hashes and report_hash for this block (from transactions)
#     c.execute("SELECT report_id FROM transactions WHERE block_idx=?", (idx,))
#     rows = c.fetchall()
#     ev_hashes = []
#     for r in rows:
#         report_id = r["report_id"]
#         report_path = UPLOAD_DIR / (report_id + ".json")
#         if report_path.exists():
#             rep = json.loads(report_path.read_bytes())
#             # append evidence hashes
#             for e in rep.get("evidence", []):
#                 ev_hashes.append(e.get("sha256"))
#             # append report hash (recompute)
#             rep_bytes = json.dumps(rep, sort_keys=True).encode()
#             rep_hash = sha256_bytes(rep_bytes)
#             ev_hashes.append(rep_hash)
#     # dedupe (keep order) and ensure non-empty
#     ev_hashes = [h for i, h in enumerate(ev_hashes) if h and h not in ev_hashes[:i]]

#     root = b["merkle_root"]
#     if not ev_hashes:
#         conn.close()
#         return jsonify({"error": "no evidence hashes for block"}), 400

#     if not leaf:
#         # default leaf: use last element (report hash) for demonstration
#         leaf = ev_hashes[-1]

#     proof = merkle_proof(ev_hashes, leaf)
#     valid = False
#     if proof is not None:
#         # verify proof locally
#         cur = leaf
#         for p in proof:
#             sib = p["sibling"]
#             if p["position"] == "left":
#                 cur = hashlib.sha256((sib + cur).encode()).hexdigest()
#             else:
#                 cur = hashlib.sha256((cur + sib).encode()).hexdigest()
#         valid = (cur == root)
#     conn.close()
#     return jsonify({"root": root, "proof": proof, "leaf": leaf, "valid": valid, "all_leaves": ev_hashes})

# # ----------------------
# # NEW: Certificate PDF generation
# # ----------------------
# @app.route("/api/report/<report_id>/certificate", methods=["GET"])
# def report_certificate(report_id):
#     """
#     Returns a generated PDF certificate for the report_id.
#     """
#     # must have report JSON saved
#     report_path = UPLOAD_DIR / (f"{report_id}.json")
#     if not report_path.exists():
#         return jsonify({"error": "report JSON not found"}), 404

#     report = json.loads(report_path.read_bytes())
#     # find the transaction & block info
#     conn = get_conn()
#     c = conn.cursor()
#     c.execute("SELECT * FROM transactions WHERE report_id=?", (report_id,))
#     tx = c.fetchone()
#     if not tx:
#         conn.close()
#         return jsonify({"error": "transaction not found"}), 404
#     block_idx = tx["block_idx"]
#     c.execute("SELECT * FROM blocks WHERE idx=?", (block_idx,))
#     blk = c.fetchone()
#     conn.close()

#     # Prepare PDF in-memory
#     if canvas is None or A4 is None or ImageReader is None:
#         # reportlab not installed; return JSON describing certificate
#         return jsonify({
#             "warning": "reportlab not installed on server; install reportlab to enable PDF generation",
#             "report": report,
#             "transaction": dict(tx),
#             "block": dict(blk) if blk else None
#         }), 200

#     buf = BytesIO()
#     cpdf = canvas.Canvas(buf, pagesize=A4)
#     width, height = A4
#     # Title
#     cpdf.setFont("Helvetica-Bold", 18)
#     cpdf.drawString(40, height - 60, "BlockWitness — Evidence Certificate")
#     cpdf.setFont("Helvetica", 12)
#     cpdf.drawString(40, height - 90, f"Report ID: {report_id}")
#     cpdf.drawString(40, height - 110, f"Title: {report.get('title')}")
#     cpdf.drawString(40, height - 130, f"Uploader: {report.get('uploader')}")
#     cpdf.drawString(40, height - 150, f"Block Index: {block_idx}")
#     if blk:
#         cpdf.drawString(40, height - 170, f"Block Hash: {blk['block_hash']}")
#         cpdf.drawString(40, height - 190, f"Timestamp: {blk['timestamp']}")

#     # Draw a small thumbnail if evidence exists
#     thumb_y = height - 320
#     try:
#         thumb_path = None
#         if report.get("evidence"):
#             # try first evidence file
#             fn = report["evidence"][0].get("filename")
#             p = UPLOAD_DIR / fn
#             if p.exists():
#                 thumb_path = p
#         # fallback to demo file if not found
#         if not thumb_path:
#             thumb_path = Path("/mnt/data/8c099852-aacd-4177-bd7b-db36ae98c0d2.png")
#         if thumb_path.exists():
#             img_reader = ImageReader(str(thumb_path))
#             cpdf.drawImage(img_reader, 40, thumb_y, width=200, height=120, preserveAspectRatio=True)
#     except Exception as e:
#         # ignore thumbnail errors
#         pass

#     # Add a block of metadata text
#     desc = report.get("metadata", {}).get("description", "")
#     cpdf.setFont("Helvetica", 10)
#     text = cpdf.beginText(260, int(thumb_y + 100))
#     text.textLines(f"Description: {desc}\n\nThis certificate proves the report was recorded in the local BlockWitness ledger. Verify at the BlockWitness Explorer using the block hash or the report ID.")
#     cpdf.drawText(text)

#     # Footer
#     cpdf.setFont("Helvetica-Oblique", 9)
#     cpdf.drawString(40, 50, "Generated by BlockWitness (demo) — not a legal document.")
#     cpdf.showPage()
#     cpdf.save()
#     buf.seek(0)
#     return send_file(buf, mimetype="application/pdf", download_name=f"certificate_{report_id}.pdf", as_attachment=True)

# # ----------------------
# # NEW: Chain integrity & timeline endpoints
# # ----------------------
# @app.route("/api/chain/verify", methods=["GET"])
# def chain_verify():
#     """
#     Recompute block hashes from stored fields and transaction lists, and verify previous_hash chain.
#     Returns a list of problems (empty list means chain is OK).
#     """
#     conn = get_conn()
#     c = conn.cursor()
#     c.execute("SELECT * FROM blocks ORDER BY idx ASC")
#     blocks = [dict(r) for r in c.fetchall()]
#     problems = []
#     prev_hash = None
#     for b in blocks:
#         idx = b["idx"]
#         # gather tx ids for this block
#         c.execute("SELECT tx_id FROM transactions WHERE block_idx=?", (idx,))
#         txs = [r["tx_id"] for r in c.fetchall()]
#         payload = {"idx": idx, "timestamp": b["timestamp"], "previous_hash": b["previous_hash"], "merkle_root": b["merkle_root"], "transactions": txs}
#         recomputed = sha256_bytes(json.dumps(payload, sort_keys=True).encode())
#         if recomputed != b["block_hash"]:
#             problems.append({"idx": idx, "issue": "block_hash_mismatch", "expected": b["block_hash"], "recomputed": recomputed})
#         if prev_hash is not None and b["previous_hash"] != prev_hash:
#             problems.append({"idx": idx, "issue": "previous_hash_mismatch", "expected_prev": prev_hash, "got": b["previous_hash"]})
#         prev_hash = b["block_hash"]
#     conn.close()
#     return jsonify({"ok": len(problems) == 0, "problems": problems})

# @app.route("/api/chain/timeline", methods=["GET"])
# def chain_timeline():
#     """
#     Returns blocks ordered descending with basic tx info for frontend timeline UI.
#     """
#     conn = get_conn()
#     c = conn.cursor()
#     c.execute("SELECT * FROM blocks ORDER BY idx DESC")
#     blocks = []
#     for b in c.fetchall():
#         idx = b["idx"]
#         c.execute("SELECT tx_id, title, uploader, report_id FROM transactions WHERE block_idx=? ORDER BY tx_id", (idx,))
#         txs = [dict(r) for r in c.fetchall()]
#         blocks.append({
#             "idx": b["idx"],
#             "timestamp": b["timestamp"],
#             "block_hash": b["block_hash"],
#             "merkle_root": b["merkle_root"],
#             "transactions": txs
#         })
#     conn.close()
#     return jsonify(blocks)

# if __name__ == "__main__":
#     init_db()
#     app.run(host="0.0.0.0", port=8000, debug=True, use_reloader=False)
# """