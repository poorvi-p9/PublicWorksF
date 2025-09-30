import React, { useEffect,type CSSProperties } from "react";
import axios from "axios";

const CLIENT_ID = "785596307174-r3f9ad4ftba0fdb9n0asfnq3p9ae5048.apps.googleusercontent.com";
const FRONTEND_REDIRECT = "http://localhost:5173/login"; // Your React login route

const LoginPage = () => {
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
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(CLIENT_ID)}&redirect_uri=${encodeURIComponent(FRONTEND_REDIRECT)}&response_type=code&scope=${encodeURIComponent("openid email profile")}&access_type=offline&prompt=consent`;
    window.location.href = authUrl;
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Login</h1>

        <div style={styles.roleToggle}>
          <button style={styles.disabledButton}>Admin</button>
          <button style={styles.disabledButton}>User</button>
        </div>

        <button onClick={handleLogin} style={styles.googleButton}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" 
               alt="Google" style={styles.googleIcon} />
          Sign in with Google
        </button>
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
    background: "#f7f7f7",
  },
  card: {
    width: "300px",
    padding: "10px",
    borderRadius: "5px",
    boxShadow: "0 0 5px rgba(0,0,0,0.2)",
    backgroundColor: "#fff",
    textAlign: "center", // <-- this is causing the error
  }as React.CSSProperties,
  title: {
    marginBottom: "20px",
    fontSize: "24px",
    fontWeight: "700",
    color: "#2c3e50",
  },
  roleToggle: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
  },
  disabledButton: {
    flex: 1,
    padding: "10px 0",
    borderRadius: "8px",
    border: "1px solid #ccc",
    backgroundColor: "#f5f5f5",
    color: "#888",
    cursor: "not-allowed",
  },
  googleButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    padding: "10px 20px",
    width: "100%",
    borderRadius: "8px",
    border: "1px solid #ddd",
    backgroundColor: "#fff",
    fontSize: "16px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  googleIcon: {
    width: "20px",
    height: "20px",
  },
};

export default LoginPage;
