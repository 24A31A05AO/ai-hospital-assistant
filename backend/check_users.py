from sqlalchemy import text

from app.db.session import engine


with engine.connect() as connection:
    result = connection.execute(
        text(
            """
            SELECT id, full_name, email, village, role
            FROM users
            ORDER BY id
            """
        )
    )

    for row in result:
        print(row)