import sqlite3

conn = sqlite3.connect("users.db")
cursor = conn.cursor()

# ⚠️ This deletes ALL users from the table
cursor.execute("DELETE FROM users")
conn.commit()
conn.close()

print("All users deleted successfully.")