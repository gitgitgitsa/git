import sqlite3

conn = sqlite3.connect("users.db")
cursor = conn.cursor()
cursor.execute("ALTER TABLE vehicles ADD COLUMN transfer_to TEXT")
cursor.execute("ALTER TABLE vehicles ADD COLUMN transfer_status TEXT")
conn.commit()
conn.close()
