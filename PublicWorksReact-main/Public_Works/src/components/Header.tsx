// Header.tsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header style={styles.header}>
      <div style={styles.logoContainer}>
        <FaUserCircle size={28} />
        <h1 style={styles.title}>Admin Panel</h1>
      </div>

      <nav style={styles.nav}>
        <div ref={dropdownRef} style={{ position: "relative" }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={styles.avatarButton}
          >
            <img
              src="https://api.dicebear.com/7.x/initials/svg?seed=Admin"
              alt="Admin Avatar"
              style={styles.avatarImage}
            />
          </button>

          {dropdownOpen && (
            <div style={styles.dropdown}>
              <p style={styles.dropdownItem}>👤 Admin</p>
              <hr style={{ margin: "8px 0", borderColor: "#eee" }} />
              <button onClick={handleLogout} style={styles.dropdownItem}>
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  header: {
    background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
    padding: "16px 30px",
    color: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  title: {
    fontSize: "20px",
    fontWeight: 700,
    margin: 0
  },
  nav: {
    display: "flex",
    alignItems: "center",
    gap: "16px"
  },
  avatarButton: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 0
  },
  avatarImage: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    border: "2px solid white"
  },
  dropdown: {
    position: "absolute",
    right: 0,
    top: "calc(100% + 10px)",
    background: "white",
    color: "#333",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    padding: "10px",
    zIndex: 999,
    minWidth: "140px"
  },
  dropdownItem: {
    padding: "8px 12px",
    fontSize: "14px",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "background 0.2s",
    textAlign: "left",
    background: "transparent",
    border: "none",
    width: "100%"
  }
};

export default Header;
