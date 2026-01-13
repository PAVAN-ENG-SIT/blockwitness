from app import SessionLocal, Transaction, Block

session = SessionLocal()

print("\n--- TRANSACTIONS TABLE ---")
transactions = session.query(Transaction).all()
for tx in transactions:
    print(f"TxID: {tx.tx_id} | ReportID: {tx.report_id} | Title: {tx.title}")

print("\n--- BLOCKS TABLE ---")
blocks = session.query(Block).all()
for block in blocks:
    print(f"Block #{block.idx} | Hash: {block.block_hash[:16]}... | Merkle: {block.merkle_root[:16]}...")

session.close()
