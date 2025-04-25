import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/Button";
import { LogOut, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SettingsScreen from './SettingsScreen'; // Adjust path if it's in a different folder


const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [darkMode, setDarkMode] = useState(false);
  const [username, setUsername] = useState("");
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    address: "",
    licenseNumber: "N/A",
    licenseType: "N/A",
    licenseExpiry: "N/A",
    profilePicture: "https://via.placeholder.com/150",
    drivingHistory: [],
  });

  // State for License Tab functionality
  const [newLicenseType, setNewLicenseType] = useState("");
  const [renewalNewExpiry, setRenewalNewExpiry] = useState("");
  const [licenseRequests, setLicenseRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [refreshRequestsFlag, setRefreshRequestsFlag] = useState(false);


  // State for Vehicles Tab functionality
  const [vehicles, setVehicles] = useState([]);
  const [registration_number, setRegistrationNumber] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [color, setColor] = useState("");
  const [vehicleTab, setVehicleTab] = useState("Registered Vehicles");




  // Fetch vehicles for user or admin
  const fetchVehiclesWithUsername = async (uname) => {
    const endpoint =
      uname.toLowerCase() === "admin"
        ? "http://localhost:5000/api/vehicles"
        : `http://localhost:5000/api/vehicles/${encodeURIComponent(uname)}`;
    const res = await fetch(endpoint);
    const data = await res.json();
    if (Array.isArray(data)) setVehicles(data);
  };
  


  useEffect(() => {
    
    const storedUser = JSON.parse(localStorage.getItem("userPreference"));
    const storedProfile = JSON.parse(localStorage.getItem("userProfileData"));
    const storedImage = localStorage.getItem("userProfileImage");
    const dark = localStorage.getItem("darkMode") === "true";
    setDarkMode(dark);

    // 💥 SET username immediately
  if (storedUser?.username) {
    setUsername(storedUser.username);
    fetchVehiclesWithUsername(storedUser.username);
  } else {
    console.warn("No username found in localStorage!");
  }

    if (storedUser?.username) {
      setUsername(storedUser.username);
    }

    if (storedProfile) {
      setProfile({
        name: storedProfile.full_name || storedProfile.username,
        email: storedProfile.email || "",
        phone: storedProfile.phone || "",
        dob: storedProfile.dob || "",
        address: storedProfile.address || "",
        licenseNumber: storedProfile.license_number || "N/A",
        licenseType: storedProfile.license_type || "N/A",
        licenseExpiry: storedProfile.license_expiry || "N/A",
        profilePicture: storedImage || "https://via.placeholder.com/150",
        drivingHistory: [
          `Profile loaded for ${storedProfile.username}`,
          storedProfile.license_type
            ? `License: ${storedProfile.license_type} (Expires: ${storedProfile.license_expiry || "N/A"})`
            : "No license info available",
        ],
      });
    } else if (storedUser?.username) {
      // Fallback: fetch from backend if profile data is not in localStorage
      fetch(`http://localhost:5000/api/user/${encodeURIComponent(storedUser.username)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.username) {
            setProfile({
              name: data.full_name || data.username,
              email: data.email || "",
              phone: data.phone || "",
              dob: data.dob || "",
              address: data.address || "",
              licenseNumber: data.license_number || "N/A",
              licenseType: data.license_type || "N/A",
              licenseExpiry: data.license_expiry || "N/A",
              profilePicture: storedImage || "https://via.placeholder.com/150",
              drivingHistory: [
                `Profile loaded for ${data.username}`,
                data.license_type
                  ? `License: ${data.license_type} (Expires: ${data.license_expiry || "N/A"})`
                  : "No license info available",
              ],
            });
          }
        })
        .catch((err) => console.error("Failed to fetch profile:", err));
    }
    if (storedUser?.username?.toLowerCase() === "admin") {
      fetch("http://localhost:5000/api/license/requests")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setAllRequests(data);
          }
        })
        .catch((err) => console.error("Failed to fetch all requests:", err));
    }
  }, []);
  useEffect(() => {
    if (username?.toLowerCase() === "admin") {
      fetch("http://localhost:5000/api/license/requests")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setAllRequests(data);
        });
    }
  }, [refreshRequestsFlag]);

  // const handleLogout = () => {
  //   localStorage.removeItem("userPreference");
  //   navigate("/");
  // };


  const handleVehicleAction = async (id, action) => {
    const res = await fetch(`http://localhost:5000/api/vehicles/${id}/${action}`, {
      method: "PUT",
    });
    const data = await res.json();
    data.message ? toast.success(data.message) : toast.error(data.error);
    fetchVehiclesWithUsername(username);
  };
  
  const handleMOTChange = async (id, status) => {
    const res = await fetch(`http://localhost:5000/api/vehicles/${id}/mot`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mot_status: status }),
    });
    const data = await res.json();
    data.message ? toast.success(data.message) : toast.error(data.error);
    fetchVehiclesWithUsername(username);
  };
  


  const handleApproveRequest = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/license/request/${id}/approve`, {
        method: "PUT",
      });
      const data = await res.json();
      toast.error(data.error || "Approved successfully.");

      
      setRefreshRequestsFlag((prev) => !prev); // trigger refresh
    } catch (err) {
      console.error("Approval error:", err);
      toast.error("Failed to approve request.");
    }
  };
  
  const handleDenyRequest = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/license/request/${id}/deny`, {
        method: "PUT",
      });
      const data = await res.json();
      data.message ? toast.success(data.message) : toast.error("Failed to deny.");
      setRefreshRequestsFlag((prev) => !prev); // trigger refresh
    } catch (err) {
      console.error("Denial error:", err);
      toast.error("Failed to deny request.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfile((prev) => {
        const updated = { ...prev, profilePicture: imageUrl };
        localStorage.setItem("userProfileImage", imageUrl);
        return updated;
      });
    }
  };

  const handleSaveProfile = () => {
    localStorage.setItem("userProfileData", JSON.stringify(profile));
    toast.success("✅ Profile saved locally!");
  };

  // const toggleDarkMode = () => {
  //   const newMode = !darkMode;
  //   setDarkMode(newMode);
  //   localStorage.setItem("darkMode", newMode.toString());
  // };

  // ----------------- LICENSE TAB FUNCTIONS -----------------
  // Apply for New License
  const handleApplyLicense = async (e) => {
    e.preventDefault();
    if (profile.licenseNumber !== "N/A") {
      toast.error("You already have a license. You cannot apply for a new one.");
      return;
    }
    if (!newLicenseType) {
      toast.error("Please enter a license type.");
      return;
    }
    const storedUser = JSON.parse(localStorage.getItem("userPreference"));
    console.log("Sending license application with:", {
      username: storedUser?.username || username,
      license_type: newLicenseType,
    });
    const res = await fetch("http://localhost:5000/api/license/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: storedUser?.username || username,
        license_type: newLicenseType,
      }),
    });
    const data = await res.json();
    data.message ? toast.success(data.message) : toast.error(data.error);
  };

  // Renew Existing License
  const handleRenewLicense = async (e) => {
    e.preventDefault();
    const today = new Date();
    const expiryDate = new Date(profile.licenseExpiry);
    const diffTime = expiryDate - today;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    if (diffDays > 30) {
      toast.error("License expiry is not within one month; renewal is not allowed yet.");
      return;
    }
    if (!renewalNewExpiry) {
      toast.error("Please enter a new expiry date for renewal.");
      return;
    }
    const res = await fetch("http://localhost:5000/api/license/renew", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username,
        new_expiry_date: renewalNewExpiry,
      }),
    });
    const data = await res.json();
    data.message ? toast.success(data.message) : toast.error(data.error);
  };

  // Check License Status: fetch all requests for this user
  const handleCheckStatus = async () => {
    const res = await fetch(`http://localhost:5000/api/license/requests/${encodeURIComponent(username)}`);
    const data = await res.json();
    if (res.ok && Array.isArray(data)) {
      setLicenseRequests(data);
    } else {
      toast.error(data.error || "No license requests found.");
    }
  };

  // ----------------- END LICENSE FUNCTIONS -----------------

  // Read stored username directly from localStorage for admin check
  const storedUsername = JSON.parse(localStorage.getItem("userPreference"))?.username || "";

  const renderVehicleTabs = () => {
    const isAdmin = username.toLowerCase() === "admin";
    const tabs = ["Registered Vehicles"];
    if (!isAdmin) tabs.push("Register New");
    if (isAdmin) tabs.push("MOT Status");
  
    return (
      <div className="flex gap-4 mb-6">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setVehicleTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              vehicleTab === tab
                ? "bg-indigo-600 text-white"
                : darkMode
                ? "bg-gray-700 text-white"
                : "bg-indigo-100 text-indigo-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="p-8 space-y-8">
            <h2 className="text-4xl font-semibold mb-4">Profile Information</h2>
            <div className="flex items-center space-x-8">
              <img
                src={profile.profilePicture}
                alt="Profile"
                className="w-40 h-40 rounded-full shadow-lg"
              />
              <div>
                <label className="block text-lg font-semibold">Change Profile Picture:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className={`mt-2 ${darkMode ? "text-white" : "text-black"}`}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { label: "Name", name: "name", value: profile.name },
                { label: "Email", name: "email", value: profile.email },
                { label: "Phone Number", name: "phone", value: profile.phone },
                { label: "Date of Birth", name: "dob", value: profile.dob },
                { label: "Address", name: "address", value: profile.address },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-lg font-semibold">{field.label}:</label>
                  <input
                    type="text"
                    name={field.name}
                    value={field.value}
                    onChange={handleInputChange}
                    className={`w-full p-2 mt-2 border rounded-lg ${
                      darkMode
                        ? "bg-gray-800 text-white border-gray-600 placeholder-gray-400"
                        : "bg-white text-black border-gray-300"
                    }`}
                  />
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button
                onClick={handleSaveProfile}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Save Profile
              </Button>
            </div>
            <div className="mt-8">
              <h3 className="text-3xl font-semibold mb-4">License Summary</h3>
              <p><strong>License Number:</strong> {profile.licenseNumber}</p>
              <p><strong>License Type:</strong> {profile.licenseType}</p>
              <p><strong>Expiry Date:</strong> {profile.licenseExpiry}</p>
            </div>
            <div className="mt-8">
              <h3 className="text-3xl font-semibold mb-4">Driving History</h3>
              <ul className="list-disc pl-6">
                {profile.drivingHistory.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        );

      case "license":
        return (
          <div className="p-8 space-y-8">
            <h2 className="text-4xl font-semibold mb-4">License Management</h2>
            {/* Section 1: Apply for New License */}
            <div className="p-4 border rounded-lg">
              <h3 className="text-2xl font-semibold mb-2">Apply for New License</h3>
              {profile.licenseNumber !== "N/A" ? (
                <p className="text-red-500">
                  You already have a license. New license application is not allowed.
                </p>
              ) : (
                <form onSubmit={handleApplyLicense} className="space-y-3">
                  <div>
                    <label className="block font-medium mb-1">License Type</label>
                    <input
                      type="text"
                      value={newLicenseType}
                      onChange={(e) => setNewLicenseType(e.target.value)}
                      className={`w-full p-2 border rounded-lg ${
                        darkMode
                          ? "bg-gray-800 text-white border-gray-600 placeholder-gray-400"
                          : "bg-white text-black border-gray-300"
                      }`}
                      placeholder="Enter License Type"
                    />
                  </div>
                  <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                    Apply for License
                  </button>
                </form>
              )}
            </div>
            {/* Section 2: Renew Existing License */}
            <div className="p-4 border rounded-lg">
              <h3 className="text-2xl font-semibold mb-2">Renew License</h3>
              {profile.licenseNumber === "N/A" ? (
                <p className="text-red-500">
                  You do not have a license to renew.
                </p>
              ) : (() => {
                const today = new Date();
                const expiryDate = new Date(profile.licenseExpiry);
                const diffTime = expiryDate - today;
                const diffDays = diffTime / (1000 * 60 * 60 * 24);
                if (diffDays > 30) {
                  return (
                    <p className="text-red-500">
                      Your license expiry is not within one month.
                    </p>
                  );
                } else {
                  return (
                    <form onSubmit={handleRenewLicense} className="space-y-3">
                      <div>
                        <label className="block font-medium mb-1">
                          New Expiry Date
                        </label>
                        <input
                          type="date"
                          value={renewalNewExpiry}
                          onChange={(e) => setRenewalNewExpiry(e.target.value)}
                          className={`w-full p-2 border rounded-lg ${
                            darkMode
                              ? "bg-gray-800 text-white border-gray-600 placeholder-gray-400"
                              : "bg-white text-black border-gray-300"
                          }`}
                        />
                      </div>
                      <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                        Submit Renewal Request
                      </button>
                    </form>
                  );
                }
              })()}
            </div>
            {/* Section 3: Check License Status */}
            <div className="p-4 border rounded-lg">
              <h3 className="text-2xl font-semibold mb-2">Check License Status</h3>
              <button
                onClick={handleCheckStatus}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Refresh License Requests
              </button>
              {licenseRequests.length > 0 ? (
                <div className="mt-3">
                  <ul className="list-disc pl-4">
                    {licenseRequests.map((req) => (
                      <li key={req.id}>
                        <p>
                          <strong>Type:</strong> {req.license_type} |{" "}
                          <strong>Expiry:</strong> {req.expiry_date} |{" "}
                          <strong>Status:</strong> {req.status}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="mt-2 text-gray-500">No license requests found.</p>
              )}
            </div>
          </div>
        );

       
  case "vehicle":
  return (
    <div className="p-8 space-y-8 w-full">
      <h2 className="text-4xl font-semibold mb-6">Vehicle Management</h2>

      {/* Vehicle Section Tabs */}
      {renderVehicleTabs()}

      {/* Tab Content */}
      {vehicleTab === "Register New" && username.toLowerCase() !== "admin" && (
      <div className="border p-6 rounded-lg">
        <h3 className="text-2xl font-semibold mb-3">Register a Vehicle</h3>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const res = await fetch("http://localhost:5000/api/vehicles/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                username,
                registration_number,
                make,
                model,
                year,
                color,
              }),
            });
            const data = await res.json();
            data.message ? toast.success(data.message) : toast.error(data.error);

            setRefreshRequestsFlag((prev) => !prev);
          }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {[
            ["Registration Number", registration_number, setRegistrationNumber],
            ["Make", make, setMake],
            ["Model", model, setModel],
            ["Year", year, setYear],
            ["Color", color, setColor],
          ].map(([label, value, setter]) => (
            <div key={label}>
              <label className="block font-medium">{label}</label>
              <input
                value={value}
                onChange={(e) => setter(e.target.value)}
                className={`w-full p-2 rounded border ${
                  darkMode
                    ? "bg-gray-800 text-white border-gray-600"
                    : "bg-white border-gray-300"
                }`}
                required={label === "Registration Number"}
              />
            </div>
          ))}
          <button
            type="submit"
            className="col-span-2 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
          >
            Submit
          </button>
        </form>
      </div>
    )}


    {vehicleTab === "Registered Vehicles" && (
      <div className="overflow-x-auto border rounded-lg">
        <table className={`min-w-full text-left text-sm ${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
        }`}>
          <thead className={darkMode ? "bg-gray-700" : "bg-indigo-100"}>
            <tr>
              {["ID", "User", "Reg. No.", "Make", "Model", "Year", "Color", "Approval", "MOT", ...(username.toLowerCase() === "admin" ? ["Actions"] : [])].map((th) => (
                <th key={th} className="px-4 py-3 border-b font-medium">{th}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id} className="border-t">
                <td className="px-4 py-2">{v.id}</td>
                <td className="px-4 py-2">{v.username}</td>
                <td className="px-4 py-2">{v.registration_number}</td>
                <td className="px-4 py-2">{v.make}</td>
                <td className="px-4 py-2">{v.model}</td>
                <td className="px-4 py-2">{v.year}</td>
                <td className="px-4 py-2">{v.color}</td>
                <td className="px-4 py-2">{v.approval_status}</td>
                <td className="px-4 py-2">{v.mot_status}</td>
                {username.toLowerCase() === "admin" && (
                  <td className="px-4 py-2 space-x-1">
                    {v.approval_status === "Pending" && (
                      <>
                        <button
                          onClick={() => handleVehicleAction(v.id, "approve")}
                          className="px-2 py-1 bg-green-600 text-white rounded"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleVehicleAction(v.id, "deny")}
                          className="px-2 py-1 bg-red-600 text-white rounded"
                        >
                          Deny
                        </button>
                      </>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}


    {vehicleTab === "MOT Status" && username.toLowerCase() === "admin" && (
      <div className="overflow-x-auto border rounded-lg">
        <table className={`min-w-full text-left text-sm ${
          darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
        }`}>
          <thead className={darkMode ? "bg-gray-700" : "bg-indigo-100"}>
            <tr>
              {["ID", "Reg. No.", "Make", "Model", "MOT Status", "Change Status"].map((th) => (
                <th key={th} className="px-4 py-3 border-b font-medium">{th}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id} className="border-t">
                <td className="px-4 py-2">{v.id}</td>
                <td className="px-4 py-2">{v.registration_number}</td>
                <td className="px-4 py-2">{v.make}</td>
                <td className="px-4 py-2">{v.model}</td>
                <td className="px-4 py-2">{v.mot_status}</td>
                <td className="px-4 py-2">
                  <select
                    value={v.mot_status}
                    onChange={(e) => handleMOTChange(v.id, e.target.value)}
                    className={`mt-1 p-1 rounded text-sm ${
                      darkMode ? "bg-gray-700 text-white" : "bg-white"
                    }`}
                  >
                    {["Pending","Valid", "Invalid", "Expired"].map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}

    </div>
  );
        

      case "settings":
        return <SettingsScreen darkMode={darkMode} />;

        case "manageRequests":
          return (
            <div className="p-8">
              <h2 className="text-4xl font-semibold mb-6">Manage License Requests</h2>
              {username.toLowerCase() !== "admin" ? (
                <p className="text-red-500">Access Denied. You are not authorized to view this section.</p>
              ) : (
                <>
                  {allRequests.length === 0 ? (
                    <p className="text-gray-500">No license requests found.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className={`min-w-full border-collapse rounded-lg shadow-lg overflow-hidden ${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"}`}>
                        <thead className={darkMode ? "bg-gray-700 text-white" : "bg-indigo-100 text-gray-800"}>
                          <tr>
                            <th className="px-4 py-3 border-b">ID</th>
                            <th className="px-4 py-3 border-b">Username</th>
                            <th className="px-4 py-3 border-b">License Type</th>
                            <th className="px-4 py-3 border-b">Expiry Date</th>
                            <th className="px-4 py-3 border-b">Status</th>
                            <th className="px-4 py-3 border-b">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allRequests.map((req) => (
                            <tr key={req.id} className={darkMode ? "border-gray-700" : "border-gray-300"}>
                              <td className="px-4 py-3 border-b">{req.id}</td>
                              <td className="px-4 py-3 border-b">{req.username}</td>
                              <td className="px-4 py-3 border-b">{req.license_type || "N/A"}</td>
                              <td className="px-4 py-3 border-b">{req.expiry_date || "N/A"}</td>
                              <td className="px-4 py-3 border-b font-medium">{req.status}</td>
                              <td className="px-4 py-3 border-b space-x-2">
                                {req.status !== "Approved" && req.status !== "Denied" && (
                                  <>
                                    <button
                                      onClick={() => handleApproveRequest(req.id)}
                                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => handleDenyRequest(req.id)}
                                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                                    >
                                      Deny
                                    </button>
                                  </>
                                )}
                                {(req.status === "Approved" || req.status === "Denied") && (
                                  <span className="text-sm italic text-gray-500">No actions</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          );

      default:
        return null;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userPreference");
    navigate("/");
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode.toString());
  };

  return (
    <div
      className={`min-h-screen flex flex-col p-6 transition duration-300 ${
        darkMode
          ? "bg-gray-900 text-white"
          : "bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 text-blue-800"
      }`}
    >
      <nav className="w-full flex justify-between items-center mb-12">
        <h1 className={`text-4xl font-extrabold ${darkMode ? "text-indigo-300" : "text-indigo-600"}`}>
          Dashboard
        </h1>
        <div className="flex gap-4 items-center">
          {[
            "profile",
            "license",
            "vehicle",
            "settings",
            ...(JSON.parse(localStorage.getItem("userPreference"))?.username?.toLowerCase() === "admin"
              ? ["manageRequests"]
              : []),
          ].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`transition px-4 py-2 rounded-lg ${
                activeTab === tab ? "font-bold underline" : ""
              } ${darkMode ? "text-indigo-200 hover:text-white" : "text-blue-600 hover:text-indigo-800"}`}
            >
              {tab === "manageRequests" ? "Manage Requests" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
          {/* 🌙 Dark Mode Icon Toggle */}
          <button onClick={toggleDarkMode} className="p-2 hover:scale-110 transition">
            {darkMode ? <Sun className="text-yellow-400" size={24} /> : <Moon className="text-gray-600" size={24} />}
          </button>
          <Button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 text-white hover:bg-red-700"
          >
            <LogOut size={20} /> Logout
          </Button>
        </div>
      </nav>

      <div className="flex items-center justify-center w-full max-w-5xl mx-auto">
        {renderContent()}
      </div>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

export default Dashboard;
