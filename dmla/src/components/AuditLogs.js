import React, { useEffect, useState } from "react";

const AuditLogs = () => {
  // Initialize the logs state and its setter function
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const res = await fetch("http://localhost:5000/api/audit_logs");
      const data = await res.json();
      setLogs(data);  // Use setLogs to update the state with fetched data
    };
    fetchLogs();
  }, []);

  return (
    <div>
      <h2>Audit Logs</h2>
      {logs.length === 0 ? (
        <p>No logs available</p>
      ) : (
        <ul>
          {logs.map(log => (
            <li key={log.id}>{log.timestamp}: {log.action} - {log.details}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AuditLogs;
