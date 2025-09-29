import React, { useEffect, useState } from "react";
// import { getProtectedData } from "../services/authService";

const DashboardPage = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Load user info from localStorage
    const storedUser = localStorage.getItem("user");
    console.log("helooo=", storedUser);
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Welcome, </h1>
      {/* <img src={user.profilePict} alt="Profile" width={100} style={{ borderRadius: "50%" }} /> */}
      {/* <p>Role: {user.roleId === 1 ? "Admin" : "User"}</p> */}

      <button onClick={handleLogout} style={{ marginTop: "20px", padding: "8px 16px" }}>
        Logout
      </button>

    </div>
  );
};

export default DashboardPage;
