import sqlite3

# Function to get the database connection
def get_db_connection():
    conn = sqlite3.connect('users.db')  # Replace with your actual database path if needed
    conn.row_factory = sqlite3.Row  # This ensures that the rows are returned as dictionaries
    return conn

# Function to fetch and display all audit logs
def fetch_audit_logs():
    conn = get_db_connection()
    cursor = conn.cursor()

    # SQL query to select all data from the audit_logs table
    cursor.execute("SELECT * FROM audit_logs")
    audit_logs = cursor.fetchall()  # Fetch all rows

    conn.close()

    if audit_logs:
        # Print the audit logs
        for log in audit_logs:
            print(f"Action: {log['action']}")
            print(f"Details: {log['details']}")
            print(f"Timestamp: {log['timestamp']}")
            print('-' * 40)  # Separator line
    else:
        print("No audit logs available.")

# Call the function to fetch and display the logs
if __name__ == "__main__":
    fetch_audit_logs()
