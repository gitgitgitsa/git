import sqlite3

def get_db_connection():
    conn = sqlite3.connect('users.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Users table
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

    # Licenses table
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

    # Create vehicles table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS vehicles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            registration_number TEXT NOT NULL,
            make TEXT,
            model TEXT,
            year INTEGER,
            color TEXT,
            mot_status TEXT DEFAULT 'Pending',
            approval_status TEXT DEFAULT 'Pending',
            FOREIGN KEY (username) REFERENCES users(username)
        )
    ''')

    conn.commit()
    conn.close()
    print("Database initialized with users, licenses, and vehicles tables.")

if __name__ == "__main__":
    init_db()