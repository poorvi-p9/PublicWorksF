// Footer.tsx
import React from "react";
import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";

const Footer: React.FC = () => {
  return (
    <footer style={footerContainer}>
      <div style={footerContent}>
        <div style={sectionLeft}>
          <h2 style={brandTitle}>AGREEYA</h2>
          <p style={tagline}>Empowering Public Works through Technology</p>
        </div>

        <div style={sectionLinks}>
          <h4 style={linkHeading}>Quick Links</h4>
          <a href="/" style={footerLink}>Dashboard</a>
          <a href="/issues" style={footerLink}>Issues</a>
          <a href="/reports" style={footerLink}>Reports</a>
        </div>

        <div style={sectionSocial}>
          <h4 style={linkHeading}>Connect With Us</h4>
          <div style={iconRow}>
            <a href="https://github.com" target="_blank" rel="noreferrer" style={iconStyle}>
              <FaGithub />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" style={iconStyle}>
              <FaLinkedin />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" style={iconStyle}>
              <FaTwitter />
            </a>
          </div>
        </div>
      </div>

      <div style={footerBottom}>
        &copy; {new Date().getFullYear()} AgreeYa Public Works Dashboard. All rights reserved.
      </div>
    </footer>
  );
};

const footerContainer: React.CSSProperties = {
  background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
  color: "white",
  padding: "40px 30px 20px",
  marginTop: "60px",
  fontFamily: "'Segoe UI', sans-serif",
};

const footerContent: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  flexWrap: "wrap",
  maxWidth: "1200px",
  margin: "0 auto",
  gap: "30px",
};

const sectionLeft: React.CSSProperties = {
  flex: "1 1 250px",
};

const brandTitle: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: "bold",
  marginBottom: "10px",
};

const tagline: React.CSSProperties = {
  fontSize: "14px",
  color: "#cbd5e1",
};

const sectionLinks: React.CSSProperties = {
  flex: "1 1 200px",
  display: "flex",
  flexDirection: "column",
};

const linkHeading: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: "600",
  marginBottom: "12px",
};

const footerLink: React.CSSProperties = {
  color: "#cbd5e1",
  textDecoration: "none",
  fontSize: "14px",
  marginBottom: "6px",
  transition: "color 0.2s ease",
};

const sectionSocial: React.CSSProperties = {
  flex: "1 1 200px",
};

const iconRow: React.CSSProperties = {
  display: "flex",
  gap: "16px",
};

const iconStyle: React.CSSProperties = {
  color: "white",
  fontSize: "20px",
  transition: "color 0.3s ease",
};

const footerBottom: React.CSSProperties = {
  borderTop: "1px solid rgba(255,255,255,0.2)",
  marginTop: "30px",
  paddingTop: "20px",
  textAlign: "center",
  fontSize: "13px",
  color: "#cbd5e1"
};

export default Footer;
