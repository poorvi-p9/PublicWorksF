import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

interface User {
  userId?: number;
  name: string;
  email: string;
  roleid: string;
  avatar: string;
}

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const handleLogout = async () => {
    const token = localStorage.getItem("token");//Retrieves the user’s JWT token from browser localStorage.

    try {
      debugger
      const response = await fetch("http://localhost:5142/Auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("user");

      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(storedUser);

    const avatarUrl = parsedUser.avatar
      ? parsedUser.avatar
      : `https://api.dicebear.com/7.x/initials/svg?seed=${parsedUser.username || parsedUser.name}`;

    const userData: User = {
      name: parsedUser.name || parsedUser.username || "Admin",
      email: parsedUser.email || parsedUser.username || "-",
      roleid: parsedUser.role || parsedUser.roleid || "Admin",
      avatar: avatarUrl,
    };

    setUser(userData);

    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    if (userId && !isNaN(Number(userId)) && token) {
      fetch(`http://localhost:5142/api/User/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch user details");
          return res.json();
        })
        .then((data) => {
          setUser({
            name: data.name || userData.name,
            email: data.email || userData.email,
            roleid: data.roleid || userData.roleid,
            avatar: data.avatar || userData.avatar,
          });
        })
        .catch((err) => console.error(err));
    }
  }, [navigate]);

  return (
    <header style={styles.header}>
      <div style={styles.logoContainer}>
        <FaUserCircle size={28} />
        <h1 style={styles.title}>Public Works Portal</h1>
      </div>

      <nav style={styles.nav}>
        <div ref={dropdownRef} style={{ position: "relative" }}>
          <button onClick={() => setDropdownOpen(!dropdownOpen)} style={styles.avatarButton}>
            <img src={user?.avatar} alt={`${user?.name} Avatar`} style={styles.avatarImage} />
          </button>

          {dropdownOpen && (
            <div style={styles.dropdown}>
              <div style={styles.dropdownHeader}>
                <strong style={styles.name}>{user?.name}</strong>
                <span style={styles.email}>{user?.email}</span>
              </div>
              <hr style={styles.hr} />
              <button
                onClick={handleLogout}
                style={styles.logoutButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 12px rgba(220, 38, 38, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 6px rgba(220, 38, 38, 0.3)";
                }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

// 💅 Improved Styles
const styles: { [key: string]: React.CSSProperties } = {
  header: {
    background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
    padding: "16px 30px",
    color: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    zIndex: 1000,
    position: "relative",
  },
  logoContainer: { display: "flex", alignItems: "center", gap: "12px" },
  title: { fontSize: "20px", fontWeight: 700, margin: 0 },
  nav: { display: "flex", alignItems: "center", gap: "16px" },
  avatarButton: { background: "transparent", border: "none", cursor: "pointer", padding: 0 },
  avatarImage: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    border: "2px solid white",
    objectFit: "cover",
    transition: "transform 0.3s ease",
  },
  dropdown: {
    position: "absolute",
    right: 0,
    top: "calc(100% + 12px)",
    background: "white",
    color: "#333",
    borderRadius: "10px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
    padding: "14px 16px",
    zIndex: 999,
    minWidth: "200px",
    transition: "all 0.3s ease",
  },
  dropdownHeader: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  name: {
    fontSize: "16px",
    fontWeight: "600",
  },
  email: {
    fontSize: "13px",
    color: "#555",
    overflowWrap: "anywhere",
  },
  hr: {
    margin: "12px 0",
    border: 0,
    borderTop: "1px solid #eee",
  },
  logoutButton: {
    background: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 4px 6px rgba(220, 38, 38, 0.3)",
    transition: "all 0.3s ease",
    width: "100%",
    justifyContent: "center",
  },
};

export default Header;
