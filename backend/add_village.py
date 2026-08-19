from sqlalchemy import text

from app.db.session import engine


with engine.begin() as connection:
    connection.execute(
        text(
            "ALTER TABLE users "
            "ADD COLUMN IF NOT EXISTS village VARCHAR(100) "
            "NOT NULL DEFAULT ''"
        )
    )

print("village column ready")