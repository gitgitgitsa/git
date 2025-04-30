from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from database import get_db_connection, init_db
import hashlib
from datetime import datetime, timedelta


# Initialise DB
init_db()

app = Flask(__name__)
CORS(app)

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

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

    hashed_password = hash_password(password)
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE username = ? AND password = ?", (username, hashed_password))
    user = cursor.fetchone()
    conn.close()

    if user:
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
        return jsonify({"message": "Login successful", "user": user_data}), 200
    else:
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
    print("[DEBUG] Received /api/license/apply payload:", data)
    username = data.get('username')
    license_type = data.get('license_type')

    # Strip extra spaces and check for truly missing license type
    if not username or not license_type or license_type.strip() == "":
        return jsonify({"error": "Missing required fields for license application"}), 400

    # Check if user already has a license
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT license_number FROM users WHERE username = ?", (username,))
    result = cursor.fetchone()
    if result and result["license_number"] and result["license_number"].strip() != "" and result["license_number"] != "N/A":
        conn.close()
        return jsonify({"error": "You already have a license. Cannot apply for a new one."}), 400

    # Insert license application request
    cursor.execute("""
        INSERT INTO licenses (username, license_type, expiry_date, status)
        VALUES (?, ?, ?, ?)
    """, (username, license_type.strip(), "", "Pending"))
    conn.commit()
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
    # Ensure user has a license
    cursor.execute("SELECT license_number, license_expiry, license_type FROM users WHERE username = ?", (username,))
    user = cursor.fetchone()
    if not user or user["license_number"] == "N/A":
        conn.close()
        return jsonify({"error": "You do not have a license to renew."}), 400

    # Check if current expiry is within one month
    try:
        current_expiry = datetime.strptime(user["license_expiry"], "%Y-%m-%d")
    except Exception:
        conn.close()
        return jsonify({"error": "Invalid current expiry date format."}), 400

    today = datetime.today()
    if (current_expiry - today).days > 30:
        conn.close()
        return jsonify({"error": "Your license expiry is not within one month. Renewal not allowed yet."}), 400

    # Insert renewal request
    cursor.execute("""
        INSERT INTO licenses (username, license_type, expiry_date, status)
        VALUES (?, ?, ?, ?)
    """, (username, user["license_type"], new_expiry_date, "Renewal Requested"))
    conn.commit()
    conn.close()

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
    # This endpoint should be protected in production
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
    # Update the license request status to Approved
    cursor.execute("UPDATE licenses SET status = ? WHERE id = ?", ("Approved", request_id))
    conn.commit()

    # Fetch the updated request to get username and license details
    cursor.execute("SELECT * FROM licenses WHERE id = ?", (request_id,))
    req = cursor.fetchone()
    if req:
        expiry_date = req['expiry_date']
        if not expiry_date:
            expiry_date = (datetime.today() + timedelta(days=5*365)).strftime("%Y-%m-%d")

        cursor.execute("""
            UPDATE users
            SET license_number = ?, license_type = ?, license_expiry = ?
            WHERE username = ?
        """, (f"LIC-{req['id']}", req['license_type'], expiry_date, req['username']))
        conn.commit()
    conn.close()

    return jsonify({"message": "License request approved successfully"}), 200

@app.route('/api/license/request/<int:request_id>/deny', methods=['PUT'])
def deny_license_request(request_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE licenses SET status = ? WHERE id = ?", ("Denied", request_id))
    conn.commit()
    conn.close()

    return jsonify({"message": "License request denied"}), 200

@app.route('/api/vehicles/register', methods=['POST'])
def register_vehicle():
    data = request.json
    username = data.get("username")
    registration_number = data.get("registration_number")
    make = data.get("make")
    model = data.get("model")
    year = data.get("year")
    color = data.get("color")

    if not username or not registration_number:
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO vehicles (username, registration_number, make, model, year, color)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (username, registration_number, make, model, year, color))
    conn.commit()
    conn.close()

    return jsonify({"message": "Vehicle registered and pending approval"}), 201

@app.route('/api/vehicles/<username>', methods=['GET'])
def get_user_vehicles(username):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM vehicles WHERE username = ?", (username,))
    vehicles = cursor.fetchall()
    conn.close()
    return jsonify([dict(row) for row in vehicles]), 200

@app.route('/api/vehicles', methods=['GET'])
def get_all_vehicles():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM vehicles")
    vehicles = cursor.fetchall()
    conn.close()
    return jsonify([dict(row) for row in vehicles]), 200


@app.route('/api/vehicles/<int:vehicle_id>/approve', methods=['PUT'])
def approve_vehicle(vehicle_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE vehicles SET approval_status = 'Approved' WHERE id = ?", (vehicle_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Vehicle approved"}), 200

@app.route('/api/vehicles/<int:vehicle_id>/deny', methods=['PUT'])
def deny_vehicle(vehicle_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE vehicles SET approval_status = 'Denied' WHERE id = ?", (vehicle_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Vehicle denied"}), 200

@app.route('/api/vehicles/<int:vehicle_id>/mot', methods=['PUT'])
def update_mot_status(vehicle_id):
    data = request.json
    new_status = data.get("mot_status")

    if new_status not in ["Valid", "Invalid", "Expired"]:
        return jsonify({"error": "Invalid MOT status"}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE vehicles SET mot_status = ? WHERE id = ?", (new_status, vehicle_id))
    conn.commit()
    conn.close()
    return jsonify({"message": "MOT status updated"}), 200


# ------------------- END LICENSE ENDPOINTS -------------------

if __name__ == '__main__':
    app.run(debug=True, port=5000)
