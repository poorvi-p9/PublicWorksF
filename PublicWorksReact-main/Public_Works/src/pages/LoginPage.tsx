import React, { useEffect, type CSSProperties, useState } from "react";
import axios from "axios";
import googleLogo from "../assets/google_logo.png";
import agreeyaLogo from "../assets/agreeya_logo.png";

const CLIENT_ID = "785596307174-r3f9ad4ftba0fdb9n0asfnq3p9ae5048.apps.googleusercontent.com";
const FRONTEND_REDIRECT = "http://localhost:5173/login";

const LoginPage = () => {
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [showUser, setShowUser] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (!code) return;
    // window.history.replaceState({}, document.title, window.location.pathname);

    // Send code to backend
    axios
      .get("http://localhost:5142/auth/callback", { params: { code } })
      .then((res) => {
        debugger;
        const { token, user } = res.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        console.log("Backend response:", res.data);

        // Redirect to dashboard after storing token
        window.location.href = "/dashboard";
      })
      .catch((err) => console.error("Login failed:", err));
  }, []);

  const handleLogin = () => {
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      CLIENT_ID
    )}&redirect_uri=${encodeURIComponent(
      FRONTEND_REDIRECT
    )}&response_type=code&scope=${encodeURIComponent(
      "openid email profile"
    )}&access_type=offline&prompt=consent`;
    window.location.href = authUrl;
  };

  const handleAdminLogin = async () => {
    setError("");
    console.log("Submitting admin login", username, password);
    try {
      const res = await axios.post("http://localhost:5142/auth/adminauth", {
        username,
        password,
      });

      if (res.status === 200) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        window.location.href = "/admin";
      }
    } catch (err: any) {
      console.error(err);
      setError("Invalid username or password");
    }
  };

  const handleAdminClick = () => {
    setShowAdminForm(true);
    setShowUser(false);
  };

  const handleUserClick = () => {
    setShowAdminForm(false);
    setShowUser(true);
  };

  return (
    <div style={styles.container}>
      <div style={styles.cardStyle}>
        <img src={agreeyaLogo} alt="Agreeya Logo" style={styles.logo} />
        <h1 style={styles.title}>Login</h1>

        <div style={styles.roleToggle}>
          <button
            style={{
              ...styles.roleButton,
              backgroundColor: showAdminForm ? "#C41E3A" : "#f0f0f0",
              color: showAdminForm ? "#fff" : "#666",
            }}
            onClick={handleAdminClick}
          >
            Admin
          </button>
          <button
            style={{
              ...styles.roleButton,
              backgroundColor: showUser ? "#003366" : "#f0f0f0",
              color: showUser ? "#fff" : "#666",
            }}
            onClick={handleUserClick}
          >
            User
          </button>
        </div>

        {showAdminForm && (
          <div style={styles.adminForm}>
            <input
              type="text"
              placeholder="Username"
              style={styles.inputField}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              style={styles.inputField}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p style={styles.errorText}>{error}</p>}
            <button style={styles.loginButton} onClick={handleAdminLogin}>
              Login
            </button>
          </div>
        )}

        {showUser && (
          <button onClick={handleLogin} style={styles.googleButton}>
            <img src={googleLogo} alt="Google" style={styles.googleIcon} />
            Sign in with Google
          </button>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "linear-gradient(135deg, #003366 0%, #C41E3A 100%)",
  } as React.CSSProperties,
  cardStyle: {
    width: "350px",
    padding: "30px",
    borderRadius: "15px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
    backgroundColor: "#fff",
    textAlign: "center",
  } as React.CSSProperties,
  title: {
    marginBottom: "25px",
    fontSize: "32px",
    fontWeight: "700",
    color: "#003366",
  } as React.CSSProperties,
  logo: {
    width: "180px",
    height: "auto",
    marginBottom: "20px",
  } as React.CSSProperties,
  roleToggle: {
    display: "flex",
    gap: "10px",
    marginBottom: "25px",
  } as React.CSSProperties,
  roleButton: {
    flex: 1,
    padding: "12px 0",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
    transition: "all 0.3s ease",
  } as React.CSSProperties,
  adminForm: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    marginBottom: "20px",
  } as React.CSSProperties,
  inputField: {
    padding: "12px 15px",
    borderRadius: "8px",
    border: "2px solid #e0e0e0",
    fontSize: "14px",
    transition: "border-color 0.3s ease",
  } as React.CSSProperties,
  loginButton: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#C41E3A",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  } as React.CSSProperties,
  googleButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    padding: "12px 20px",
    width: "100%",
    borderRadius: "8px",
    border: "2px solid #003366",
    backgroundColor: "#fff",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.3s ease",
  } as React.CSSProperties,
  googleIcon: {
    width: "20px",
    height: "20px",
  } as React.CSSProperties,
  errorText: {
    color: "#C41E3A",
    fontSize: "14px",
    margin: "0",
    textAlign: "left",
  } as React.CSSProperties,
};

export default LoginPage;