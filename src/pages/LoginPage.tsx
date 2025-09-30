import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import type { CredentialResponse } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { login, googleLogin } from "../services/authService"; // Adjust the path

const Login: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<"admin" | "user">("user");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFormLogin = async (e: React.FormEvent) => {
    debugger
    e.preventDefault();
    setLoading(true);

    try {
      const res = await login(username, password, selectedRole);

      if (res && res.token) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("role", selectedRole);
        localStorage.setItem("user", JSON.stringify(res.user));

        if (selectedRole === "admin") {
          navigate("/admin-dashboard");
        } else {
          navigate("/user-dashboard");
        }
      } else {
        alert("Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

const handleGoogleLoginRedirect = () => {
  // This URL should match your backend AuthController's /login endpoint
  window.location.href = "http://localhost:5000/auth/google";
};


  const handleGoogleLogin = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) return;

    setLoading(true);

    try {
      const res = await googleLogin(credentialResponse.credential);
//storing jwt token ,role and user
      if (res && res.token) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("role", selectedRole);
        localStorage.setItem("user", JSON.stringify(res.user));

        if (selectedRole === "admin") {
          navigate("/admin-dashboard");
        } else {
          navigate("/user-dashboard");
        }
      } else {
        alert("Google login failed");
      }
    } catch (error) {
      console.error("Google login error:", error);
      alert("Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Login</h1>

      {/* Role Toggle */}
      <div style={styles.roleToggle}>
        <button
          onClick={() => setSelectedRole("admin")}
          style={{
            ...styles.roleButton,
            ...(selectedRole === "admin" ? styles.roleButtonActive : {}),
          }}
        >
          Admin
        </button>
        <button
          onClick={() => setSelectedRole("user")}
          style={{
            ...styles.roleButton,
            ...(selectedRole === "user" ? styles.roleButtonActive : {}),
          }}
        >
          User
        </button>
      </div>
{selectedRole === "admin" && (
     
      <form onSubmit={handleFormLogin} style={styles.form}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />

        <button type="submit" style={styles.loginButton} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
  )}
      <hr style={styles.divider} />

      {/* Google Login Button */}
      <GoogleLogin
        onSuccess={handleGoogleLogin}
        onError={() => alert("Google Login Failed")}
         useOneTap
      />
      {/* <button
  style={styles.loginButton}
  onClick={handleGoogleLoginRedirect}
>
  Login with Google
</button> */}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: 400,
    margin: "100px auto",
    padding: 40,
    border: "1px solid #e0e0e0",
    borderRadius: 12,
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.08)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: "#ffffff",
    textAlign: "center",
  },
  title: {
    marginBottom: 25,
    fontSize: 32,
    fontWeight: 800,
    color: "#2c3e50",
  },
  roleToggle: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 25,
    gap: 12,
  },
  roleButton: {
    flex: 1,
    padding: "12px 0",
    cursor: "pointer",
    border: "1px solid #ccc",
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
    color: "#333",
    transition: "all 0.25s ease",
  },
  roleButtonActive: {
    backgroundColor: "#4e7bbeff",
    color: "#fff",
    borderColor: "#4e7bbeff",
    boxShadow: "0 0 0 2px rgba(78, 123, 190, 0.2)",
    fontWeight: "600",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    marginTop: 10,
  },
  input: {
    padding: 12,
    fontSize: 16,
    borderRadius: 8,
    border: "1px solid #ccc",
    outline: "none",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  loginButton: {
    padding: "12px 0",
    fontSize: 17,
    fontWeight: "600",
    color: "#fff",
    backgroundColor: "#4e7bbeff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  divider: {
    margin: "30px 0",
    border: "none",
    borderTop: "1px solid #ddd",
  },
};

export default Login;
