import sqlite3

def delete_user_by_username(username):
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()

    # Delete from users table
    cursor.execute("DELETE FROM users WHERE username = ?", (username,))
    deleted_users = cursor.rowcount

    # Optionally delete related license requests
    cursor.execute("DELETE FROM licenses WHERE username = ?", (username,))
    deleted_licenses = cursor.rowcount

    conn.commit()
    conn.close()

    print(f"✅ User '{username}' deleted from users table ({deleted_users} row(s)).")
    print(f"✅ {deleted_licenses} related license request(s) also deleted from licenses table.")

# --------- Run Example ----------
if __name__ == "__main__":
    username_to_delete = input("Enter username to delete: ").strip()
    if username_to_delete:
        delete_user_by_username(username_to_delete)
    else:
        print("❌ Username is required.")
