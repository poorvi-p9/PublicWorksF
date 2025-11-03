import React, { useEffect, useState } from "react";
import axios from "axios";
import googleLogo from "../assets/google_logo.png";
import agreeyaLogo from "../assets/agreeya_logo.png";
import styles from "./LoginPage.module.css";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const FRONTEND_REDIRECT = import.meta.env.VITE_FRONTEND_REDIRECT;

const LoginPage = () => {
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [showUser, setShowUser] = useState(true);
  const [username, setUsername] = useState(""); 
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // If already logged in, redirect
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user?.roleId === 1) {
        window.location.href = "/admin";
      }
      else window.location.href = "/create-issue";
    }
  }, []);

  //  Handle Google redirect back
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (!code) return;

    // Send code to backend
    axios
      .get("http://localhost:5142/auth/callback", { params: { code } })
      .then((res) => {
        const { token, user } = res.data;
        localStorage.setItem("token", token);
        localStorage.setItem("userId", user.userId); 
        localStorage.setItem("user", JSON.stringify(user));

        window.history.replaceState({}, "", "/create-issue");
        // Redirect to dashboard after storing token
        window.location.href = "/create-issue";
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
    <div className={styles.container}>
      <div className={styles.cardStyle}>
        <img src={agreeyaLogo} alt="Agreeya Logo" className={styles.logo} />
        <h1 className={styles.title}>Login</h1>

        <div className={styles.roleToggle}>
          <button
            className={`${styles.roleButton} ${showAdminForm ? styles.adminActive : ''}`}
            onClick={handleAdminClick}
          >
            Admin
          </button>
          <button
            className={`${styles.roleButton} ${showUser ? styles.userActive : ''}`}
            onClick={handleUserClick}
          >
            User
          </button>
        </div>

        {showAdminForm && (
          <div className={styles.adminForm}>
            <input
              type="text"
              placeholder="Username"
              className={styles.inputField}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className={styles.inputField}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className={styles.errorText}>{error}</p>}
            <button className={styles.loginButton} onClick={handleAdminLogin}>
              Login
            </button>
          </div>
        )}

        {showUser && (
          <button onClick={handleLogin} className={styles.googleButton}>
            <img src={googleLogo} alt="Google" className={styles.googleIcon} />
            Sign in with Google
          </button>
        )}
      </div>
    </div>
  );
};

export default LoginPage;