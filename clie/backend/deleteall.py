import sqlite3

def get_db_connection():
    conn = sqlite3.connect('users.db')  # Replace with your database file
    conn.row_factory = sqlite3.Row
    return conn

def delete_all_data():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Deleting data from tables
    cursor.execute("DELETE FROM users")
    cursor.execute("DELETE FROM licenses")
    cursor.execute("DELETE FROM vehicles")
    cursor.execute("DELETE FROM audit_logs")

    conn.commit()
    conn.close()

    print("All data has been deleted from the database.")

if __name__ == "__main__":
    delete_all_data()
