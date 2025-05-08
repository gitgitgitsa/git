import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Bar, Pie, Line } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";

const DashboardAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/analytics");
        const data = await res.json();
        setAnalytics(data);
      } catch (error) {
        toast.error("Failed to fetch analytics.");
      }
    };

    fetchAnalytics();
  }, []);

  if (!analytics) {
    return <div>Loading...</div>;
  }

  const licenseTypes = {
    labels: analytics.license_types.map(item => item[0]),
    datasets: [{
      label: "License Types",
      data: analytics.license_types.map(item => item[1]),
      backgroundColor: "rgba(75,192,192,0.2)",
      borderColor: "rgba(75,192,192,1)",
      borderWidth: 1
    }]
  };

  const motStatuses = {
    labels: analytics.mot_statuses.map(item => item[0]),
    datasets: [{
      label: "MOT Status",
      data: analytics.mot_statuses.map(item => item[1]),
      backgroundColor: "rgba(153,102,255,0.2)",
      borderColor: "rgba(153,102,255,1)",
      borderWidth: 1
    }]
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Dashboard Analytics</h2>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <h3>Total Users</h3>
          <p className="text-xl">{analytics.total_users}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-lg">
          <h3>Pending Licenses</h3>
          <p className="text-xl">{analytics.pending_licenses}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-lg">
          <h3>Pending Vehicles</h3>
          <p className="text-xl">{analytics.pending_vehicles}</p>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-xl mb-2">License Types Distribution</h3>
        <Bar data={licenseTypes} />

        <h3 className="text-xl mt-6 mb-2">MOT Status Distribution</h3>
        <Pie data={motStatuses} />
      </div>
    </div>
  );
};

export default DashboardAnalytics;
