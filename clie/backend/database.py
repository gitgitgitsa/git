import sqlite3

def get_db_connection():
    conn = sqlite3.connect('users.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Create users table if not exists
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            full_name TEXT,
            phone TEXT,
            dob TEXT,
            address TEXT,
            license_number TEXT,
            license_type TEXT,
            license_expiry TEXT
        )
    ''')

    # Create licenses table if not exists
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS licenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            license_type TEXT,
            expiry_date TEXT,
            status TEXT DEFAULT 'Pending',
            FOREIGN KEY (username) REFERENCES users(username)
        )
    ''')

    conn.commit()
    conn.close()
    print("Database initialized successfully with users and licenses tables.")

if __name__ == "__main__":
    init_db()
