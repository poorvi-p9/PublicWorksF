import React, { useEffect,type CSSProperties } from "react";
import axios from "axios";
import googleLogo from "../assets/google_logo.png";



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
      <div style={styles.cardStyle}>
        <h1 style={styles.title}>Login</h1>

        <div style={styles.roleToggle}>
          <button style={styles.disabledButton}>Admin</button>
          <button style={styles.disabledButton}>User</button>
        </div>

          <button onClick={handleLogin} style={styles.googleButton}>
          <img src={googleLogo} alt="Google" style={styles.googleIcon} />
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
    background: "#f0f2f5",
  },
  cardStyle: {
    width: "380px",          // Increased width
    padding: "30px",         // Increased padding
    borderRadius: "12px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.1)", // Slightly deeper shadow
    backgroundColor: "#fff",
    textAlign: "center" as const,
  },
  title: {
    marginBottom: "20px",
    fontSize: "26px",        // Bigger title
    fontWeight: "600",
    color: "#333",
  },
  roleToggle: {
    display: "flex",
    gap: "12px",
    marginBottom: "20px",
    justifyContent: "center",
  },
  disabledButton: {
    flex: 1,
    padding: "12px 0",       // Bigger button
    borderRadius: "10px",
    border: "1px solid #ccc",
    backgroundColor: "#4169E1",
    color: "#e9e5e5ff",
    cursor: "not-allowed",
    fontSize: "16px",        // Bigger text
  },
  googleButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    padding: "12px 20px",    // Bigger button
    width: "100%",
    borderRadius: "10px",
    border: "1px solid #ddd",
    backgroundColor: "#fff",
    fontSize: "16px",        // Slightly bigger text
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
  },
  googleIcon: {
    width: "22px",            // Bigger icon
    height: "22px",
  },
};



export default LoginPage;


