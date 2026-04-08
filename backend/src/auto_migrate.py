from sqlalchemy import text
from .database import engine

def migrate():
    print(" [DB] Migrating schema...")
    with engine.connect() as conn:
        # Tables and columns to add
        tables = {
            "dishes": [
                ("category", "VARCHAR(100) DEFAULT 'Milliy taomlar'"),
                ("original_price", "DECIMAL(10, 2)"),
                ("discount_price", "DECIMAL(10, 2)"),
                ("pickup_start", "TIME"),
                ("pickup_end", "TIME"),
                ("status", "VARCHAR(50) DEFAULT 'active'")
            ],
            "restaurants": [
                ("thumbnail_url", "TEXT")
            ],
            "orders": [
                ("total_price", "DECIMAL(10, 2)")
            ]
        }
        
        for table, cols in tables.items():
            for col_name, col_type in cols:
                try:
                    # Generic way to add column if not exists for PostgreSQL (production)
                    # For SQLite (local testing), this might fail differently
                    conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {col_name} {col_type}"))
                    conn.commit()
                    print(f" [DB] Successfully added column {col_name} to table {table}")
                except Exception as e:
                    # Usually means column already exists
                    conn.rollback()
                    # print(f" [DB] Skipping column {col_name} in {table} (might already exist)")

if __name__ == "__main__":
    migrate()
