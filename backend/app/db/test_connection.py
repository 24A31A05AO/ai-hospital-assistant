from sqlalchemy import text
from app.db.session import engine

try:
    with engine.connect() as conn:
        result = conn.execute(text("SELECT version();"))
        print(result.fetchone())
        print("Database Connected Successfully!")

except Exception as e:
    print("Connection Error:", e)