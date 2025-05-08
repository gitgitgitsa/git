import React, { useState, useEffect } from "react";

const UserSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);

  const searchUsers = async () => {
    const res = await fetch(`http://localhost:5000/api/admin/users?username=${searchTerm}`);
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    if (searchTerm) {
      searchUsers();
    }
  }, [searchTerm]);

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search users"
      />
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.username} - {user.email}</li>
        ))}
      </ul>
    </div>
  );
};

export default UserSearch;
