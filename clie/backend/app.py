from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from database import get_db_connection, init_db
import bcrypt
from datetime import datetime, timedelta
import string
import random


def log_action(action, details):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO audit_logs (action, details, timestamp)
        VALUES (?, ?, ?)
    """, (action, details, datetime.now().isoformat()))
    conn.commit()
    conn.close()


# Initialize DB
init_db()

app = Flask(__name__)
CORS(app)


def hash_password(password):
    # Using bcrypt for better password security
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def generate_random_password(length=12):
    """Generates a random password of specified length"""
    # Combine lowercase, uppercase, digits, and special characters for the password
    characters = string.ascii_letters + string.digits + string.punctuation
    # Randomly choose characters for the password
    password = ''.join(random.choice(characters) for _ in range(length))
    return password


def check_password(stored_hash, password):
    return bcrypt.checkpw(password.encode('utf-8'), stored_hash.encode('utf-8'))


@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')
    full_name = data.get('full_name', '')
    phone = data.get('phone', '')
    dob = data.get('dob', '')
    address = data.get('address', '')
    license_number = data.get('license_number', '')
    license_type = data.get('license_type', '')
    license_expiry = data.get('license_expiry', '')

    if not username or not password or not email:
        return jsonify({"error": "Missing required fields"}), 400

    # ➕ AGE RESTRICTION VALIDATION
    try:
        birth_date = datetime.strptime(dob, "%Y-%m-%d")
        today = datetime.today()
        age = (today - birth_date).days // 365
        if age < 16:
            return jsonify({"error": "Users must be at least 16 years old to sign up."}), 400
    except Exception:
        return jsonify({"error": "Invalid date of birth format."}), 400

    hashed_password = hash_password(password)

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT INTO users (username, password, email, full_name, phone, dob, address,
                               license_number, license_type, license_expiry)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (username, hashed_password, email, full_name, phone, dob, address,
              license_number, license_type, license_expiry))
        conn.commit()

        log_action("User Signup", f"User {username} registered successfully.")
        return jsonify({"message": "User registered successfully"}), 201
    except sqlite3.IntegrityError:
        return jsonify({"error": "Username or email already exists"}), 409
    finally:
        conn.close()


@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Missing username or password"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
    user = cursor.fetchone()
    conn.close()

    if user and check_password(user["password"], password):
        user_data = {
            "username": user["username"],
            "email": user["email"],
            "full_name": user["full_name"],
            "phone": user["phone"],
            "dob": user["dob"],
            "address": user["address"],
            "license_number": user["license_number"],
            "license_type": user["license_type"],
            "license_expiry": user["license_expiry"]
        }

        log_action("User Login", f"User {username} logged in successfully.")
        return jsonify({"message": "Login successful", "user": user_data}), 200
    else:
        log_action("Failed Login Attempt", f"Failed login attempt for username {username}.")
        return jsonify({"error": "Invalid username or password"}), 401


@app.route('/api/user/<username>', methods=['GET'])
def get_user_profile(username):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
    user = cursor.fetchone()
    conn.close()

    if user:
        return jsonify({
            "username": user["username"],
            "email": user["email"],
            "full_name": user["full_name"],
            "phone": user["phone"],
            "dob": user["dob"],
            "address": user["address"],
            "license_number": user["license_number"],
            "license_type": user["license_type"],
            "license_expiry": user["license_expiry"]
        }), 200
    else:
        return jsonify({"error": "User not found"}), 404


# ------------------- LICENSE ENDPOINTS -------------------

@app.route('/api/license/apply', methods=['POST'])
def apply_license():
    data = request.json
    username = data.get('username')
    license_type = data.get('license_type')

    if not username or not license_type:
        return jsonify({"error": "Missing required fields for license application"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT license_number FROM users WHERE username = ?", (username,))
    result = cursor.fetchone()
    if result and result["license_number"] and result["license_number"] != "N/A":
        conn.close()
        return jsonify({"error": "You already have a license. Cannot apply for a new one."}), 400

    cursor.execute("""
        INSERT INTO licenses (username, license_type, expiry_date, status)
        VALUES (?, ?, ?, ?)
    """, (username, license_type.strip(), "", "Pending"))
    conn.commit()

    log_action("License Application", f"License application for {username} submitted successfully.")
    conn.close()

    return jsonify({"message": "License application submitted successfully"}), 201


@app.route('/api/license/renew', methods=['POST'])
def renew_license():
    data = request.json
    username = data.get('username')
    new_expiry_date = data.get('new_expiry_date')

    if not username or not new_expiry_date:
        return jsonify({"error": "Missing required fields for license renewal"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT license_number, license_expiry, license_type FROM users WHERE username = ?", (username,))
    user = cursor.fetchone()
    if not user or user["license_number"] == "N/A":
        conn.close()
        return jsonify({"error": "You do not have a license to renew."}), 400

    try:
        current_expiry = datetime.strptime(user["license_expiry"], "%Y-%m-%d")
    except Exception:
        conn.close()
        return jsonify({"error": "Invalid current expiry date format."}), 400

    today = datetime.today()
    if (current_expiry - today).days > 30:
        conn.close()
        return jsonify({"error": "Your license expiry is not within one month. Renewal not allowed yet."}), 400

    cursor.execute("""
        INSERT INTO licenses (username, license_type, expiry_date, status)
        VALUES (?, ?, ?, ?)
    """, (username, user["license_type"], new_expiry_date, "Renewal Requested"))
    conn.commit()
    conn.close()

    log_action("License Renewal", f"License renewal for {username} submitted successfully.")
    return jsonify({"message": "License renewal request submitted successfully"}), 200


@app.route('/api/license/requests/<username>', methods=['GET'])
def get_license_requests(username):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM licenses WHERE username = ?", (username,))
    requests = cursor.fetchall()
    conn.close()

    if requests:
        req_list = [dict(req) for req in requests]
        return jsonify(req_list), 200
    else:
        return jsonify({"error": "No license requests found for this user"}), 404

# Admin endpoints for license requests
@app.route('/api/license/requests', methods=['GET'])
def get_all_license_requests():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM licenses")
    requests = cursor.fetchall()
    conn.close()

    req_list = [dict(req) for req in requests]
    return jsonify(req_list), 200

@app.route('/api/license/request/<int:request_id>/approve', methods=['PUT'])
def approve_license_request(request_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE licenses SET status = ? WHERE id = ?", ("Approved", request_id))
    conn.commit()

    cursor.execute("SELECT * FROM licenses WHERE id = ?", (request_id,))
    req = cursor.fetchone()
    if req:
        expiry_date = req['expiry_date'] or (datetime.today() + timedelta(days=5 * 365)).strftime("%Y-%m-%d")

        cursor.execute("""
            UPDATE users
            SET license_number = ?, license_type = ?, license_expiry = ?
            WHERE username = ?
        """, (f"LIC-{req['id']}", req['license_type'], expiry_date, req['username']))
        conn.commit()

    log_action("License Approved", f"License request for {req['username']} approved.")
    conn.close()

    return jsonify({"message": "License request approved successfully"}), 200

@app.route('/api/license/request/<int:request_id>/deny', methods=['PUT'])
def deny_license_request(request_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE licenses SET status = ? WHERE id = ?", ("Denied", request_id))
    conn.commit()
    conn.close()

    log_action("License Denied", f"License request with ID {request_id} denied.")
    return jsonify({"message": "License request denied"}), 200

# ------------------- VEHICLE ENDPOINTS -------------------

# @app.route('/api/vehicles/register', methods=['POST'])
# def register_vehicle():
#     data = request.json
#     username = data.get("username")
#     registration_number = data.get("registration_number")
#     make = data.get("make")
#     model = data.get("model")
#     year = data.get("year")
#     color = data.get("color")

#     if not username or not registration_number:
#         return jsonify({"error": "Missing required fields"}), 400

#     conn = get_db_connection()
#     cursor = conn.cursor()
#     cursor.execute("""
#         INSERT INTO vehicles (username, registration_number, make, model, year, color)
#         VALUES (?, ?, ?, ?, ?, ?)
#     """, (username, registration_number, make, model, year, color))
#     conn.commit()
#     conn.close()

#     log_action("Vehicle Registration", f"Vehicle with registration number {registration_number} registered.")
#     return jsonify({"message": "Vehicle registered and pending approval"}), 201



@app.route('/api/audit_logs', methods=['GET'])
def get_audit_logs():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM audit_logs")
    audit_logs = cursor.fetchall()
    conn.close()

    return jsonify([dict(log) for log in audit_logs])  # Return the logs as JSON


@app.route('/api/admin/analytics', methods=['GET'])
def get_analytics():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM users")
    total_users = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM licenses WHERE status = 'Pending'")
    pending_licenses = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM vehicles WHERE approval_status = 'Pending'")
    pending_vehicles = cursor.fetchone()[0]

    cursor.execute("SELECT license_type, COUNT(*) FROM licenses GROUP BY license_type")
    license_types = cursor.fetchall()
    license_types = [tuple(row) for row in license_types]  # Serialize Row object to tuple

    cursor.execute("SELECT mot_status, COUNT(*) FROM vehicles GROUP BY mot_status")
    mot_statuses = cursor.fetchall()
    mot_statuses = [tuple(row) for row in mot_statuses]  # Serialize Row object to tuple

    conn.close()

    return jsonify({
        "total_users": total_users,
        "pending_licenses": pending_licenses,
        "pending_vehicles": pending_vehicles,
        "license_types": license_types,
        "mot_statuses": mot_statuses,
    }), 200

@app.route('/api/admin/delete_user/<username>', methods=['DELETE'])
def delete_user(username):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM users WHERE username = ?", (username,))
    conn.commit()
    conn.close()
    log_action("User Deleted", f"User {username} was deleted.")
    return jsonify({"message": "User deleted successfully"}), 200

@app.route('/api/admin/suspend_user/<username>', methods=['PUT'])
def suspend_user(username):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET status = ? WHERE username = ?", ("suspended", username))
    conn.commit()
    conn.close()
    log_action("User Suspended", f"User {username} was suspended.")
    return jsonify({"message": "User suspended successfully"}), 200

@app.route('/api/admin/reset_password/<username>', methods=['PUT'])
def reset_password(username):
    new_password = generate_random_password()  # Function to generate a new random password
    hashed_password = hash_password(new_password)

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET password = ? WHERE username = ?", (hashed_password, username))
    conn.commit()
    conn.close()

    log_action("Password Reset", f"Password for user {username} has been reset.")
    return jsonify({"message": f"Password reset successfully. New password: {new_password}"}), 200

@app.route('/api/admin/search_users', methods=['GET'])
def search_users():
    query = request.args.get('query', '')
    if not query:
        return jsonify({"error": "Search query is required"}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()

    # Search for users by username or email
    cursor.execute("SELECT * FROM users WHERE username LIKE ? OR email LIKE ?", (f'%{query}%', f'%{query}%'))
    users = cursor.fetchall()
    conn.close()

    if users:
        return jsonify([dict(user) for user in users]), 200
    else:
        return jsonify({"error": "No users found"}), 404
    

# Get all vehicles (admin)
@app.route('/api/vehicles', methods=['GET'])
def get_all_vehicles():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM vehicles")
    vehicles = cursor.fetchall()
    conn.close()
    return jsonify([dict(v) for v in vehicles]), 200

# Get vehicles for a specific user
@app.route('/api/vehicles/<username>', methods=['GET'])
def get_user_vehicles(username):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM vehicles WHERE username = ?", (username,))
    vehicles = cursor.fetchall()
    conn.close()
    return jsonify([dict(v) for v in vehicles]), 200

# Approve a vehicle (Admin)
@app.route('/api/vehicles/<int:vehicle_id>/approve', methods=['PUT'])
def approve_vehicle(vehicle_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE vehicles SET approval_status = ? WHERE id = ?", ("Approved", vehicle_id))
    conn.commit()
    conn.close()
    log_action("Vehicle Approved", f"Vehicle ID {vehicle_id} was approved.")
    return jsonify({"message": "Vehicle approved successfully"}), 200

# Deny a vehicle (Admin)
@app.route('/api/vehicles/<int:vehicle_id>/deny', methods=['PUT'])
def deny_vehicle(vehicle_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE vehicles SET approval_status = ? WHERE id = ?", ("Denied", vehicle_id))
    conn.commit()
    conn.close()
    log_action("Vehicle Denied", f"Vehicle ID {vehicle_id} was denied.")
    return jsonify({"message": "Vehicle denied successfully"}), 200

@app.route('/api/vehicles/<int:vehicle_id>/mot', methods=['PUT'])
def update_mot_status(vehicle_id):
    data = request.json
    mot_status = data.get('mot_status')

    if mot_status not in ['Pending', 'Valid', 'Invalid', 'Expired']:
        return jsonify({"error": "Invalid MOT status"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE vehicles SET mot_status = ? WHERE id = ?", (mot_status, vehicle_id))
    conn.commit()
    conn.close()

    log_action("MOT Status Updated", f"Vehicle ID {vehicle_id} MOT status set to {mot_status}.")
    return jsonify({"message": f"MOT status updated to {mot_status}"}), 200

# Transfer request by owner
@app.route('/api/vehicles/transfer_request', methods=['POST'])
def transfer_vehicle_request():
    data = request.json
    from_user = data.get("from_user")
    to_user = data.get("to_user")
    vehicle_id = data.get("vehicle_id")

    if not from_user or not to_user or not vehicle_id:
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if recipient exists
    cursor.execute("SELECT * FROM users WHERE username = ?", (to_user,))
    if not cursor.fetchone():
        conn.close()
        return jsonify({"error": "Recipient user does not exist."}), 404

    # Mark the vehicle transfer request
    cursor.execute("""
        UPDATE vehicles
        SET transfer_to = ?, transfer_status = ?
        WHERE id = ? AND username = ?
    """, (to_user, 'Pending', vehicle_id, from_user))
    conn.commit()
    conn.close()

    log_action("Vehicle Transfer Requested", f"{from_user} requested to transfer vehicle {vehicle_id} to {to_user}.")
    return jsonify({"message": "Transfer request submitted."}), 200


# Admin approval
@app.route('/api/vehicles/<int:vehicle_id>/approve_transfer', methods=['PUT'])
def approve_transfer(vehicle_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM vehicles WHERE id = ? AND transfer_status = 'Pending'", (vehicle_id,))
    vehicle = cursor.fetchone()

    if not vehicle:
        conn.close()
        return jsonify({"error": "No such pending transfer."}), 404

    cursor.execute("""
        UPDATE vehicles
        SET username = ?, transfer_status = NULL, transfer_to = NULL
        WHERE id = ?
    """, (vehicle["transfer_to"], vehicle_id))
    conn.commit()
    conn.close()

    log_action("Vehicle Transfer Approved", f"Vehicle {vehicle_id} transferred to {vehicle['transfer_to']}.")
    return jsonify({"message": "Transfer approved."}), 200


@app.route('/api/vehicles/<int:vehicle_id>/delete', methods=['DELETE'])
def delete_vehicle(vehicle_id):
    username = request.args.get("username")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM vehicles WHERE id = ? AND username = ?", (vehicle_id, username))
    conn.commit()
    conn.close()

    log_action("Vehicle Deleted", f"Vehicle {vehicle_id} deleted by {username}.")
    return jsonify({"message": "Vehicle deleted successfully"}), 200

@app.route('/api/vehicles/transfer_requests', methods=['GET'])
def get_pending_transfer_requests():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM vehicles WHERE transfer_status = 'Pending'")
    vehicles = cursor.fetchall()
    conn.close()
    return jsonify([dict(v) for v in vehicles]), 200

@app.route('/api/vehicles/<int:vehicle_id>/deny_transfer', methods=['PUT'])
def deny_transfer(vehicle_id):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM vehicles WHERE id = ? AND transfer_status = 'Pending'", (vehicle_id,))
    vehicle = cursor.fetchone()

    if not vehicle:
        conn.close()
        return jsonify({"error": "No such pending transfer."}), 404

    cursor.execute("""
        UPDATE vehicles
        SET transfer_status = NULL, transfer_to = NULL
        WHERE id = ?
    """, (vehicle_id,))
    conn.commit()
    conn.close()

    log_action("Vehicle Transfer Denied", f"Vehicle {vehicle_id} transfer request was denied.")
    return jsonify({"message": "Transfer request denied."}), 200


@app.route('/api/vehicles/register', methods=['POST'])
def register_vehicle():
    data = request.json
    username = data.get("username")
    registration_number = data.get("registration_number")
    make = data.get("make")
    model = data.get("model")
    year = data.get("year")
    color = data.get("color")
    transaction_id = data.get("transaction_id")

    if not username or not registration_number or not transaction_id:
        return jsonify({"error": "Missing required fields"}), 400

    # Generate a random tax amount (e.g. between 5000 and 15000)
    tax_amount = random.randint(5000, 15000)

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO vehicles (
            username, registration_number, make, model, year, color,
            tax_amount, transaction_id, tax_status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        username, registration_number, make, model, year, color,
        tax_amount, transaction_id, 'Paid'
    ))
    conn.commit()
    conn.close()

    log_action("Vehicle Registration", f"{username} registered {registration_number} with tax ID {transaction_id}.")

    return jsonify({
        "message": "Vehicle registered and pending approval",
        "tax_amount": tax_amount
    }), 201



if __name__ == '__main__':
    app.run(debug=True, port=5000)
