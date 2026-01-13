from app import engine, Base, init_db

print("🗑️ Dropping all tables...")
Base.metadata.drop_all(engine)
print("✅ Tables dropped.")

print("🔧 Re-initializing database...")
init_db()
print("✅ Database reset complete with new schema.")
