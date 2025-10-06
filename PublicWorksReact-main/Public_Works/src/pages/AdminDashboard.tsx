import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [issues, setIssues] = useState<any[]>([]);   //array of all issues from the backend.
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    highPriority: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const API_BASE_URL = "http://localhost:5142/api";

  //   useEffect(() => {
  //     fetchIssues();
  //   }, []);

  //   const fetchIssues = async () => {
  //     try {
  //       const response = await fetch(`${API_BASE_URL}/Issue`);
  //       if (!response.ok) throw new Error("Failed to fetch issues");
  //       const data = await response.json();
  //       setIssues(data.sort((a: any, b: any) => b.issueId - a.issueId));
  //       calculateStats(data);
  //     } catch (err: any) {
  //       setError(err.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   const calculateStats = (data: any[]) => {
  //     setStats({
  //       total: data.length,
  //       pending: data.filter((i) => i.statusId === 1).length,
  //       inProgress: data.filter((i) => i.statusId === 2).length,
  //       resolved: data.filter((i) => i.statusId === 3).length,
  //       highPriority: data.filter((i) => i.priorityId === 3).length,
  //     });
  //   };
  // Remove the calculateStats function entirely

  const fetchIssues = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/Issue`);
      if (!response.ok) throw new Error("Failed to fetch issues");
      const data = await response.json();
      setIssues(data.sort((a: any, b: any) => b.issueId - a.issueId));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/Issue/summary`);
      if (!response.ok) throw new Error("Failed to fetch summary");
      const data = await response.json();
      setStats({
        total: data.totalIssues,
        pending: data.pending,
        inProgress: data.inProgress,
        resolved: data.resolved,
        highPriority: data.highPriority || 0, // If you want highPriority, add it to backend
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Call both functions on component mount
  useEffect(() => {
    fetchIssues();
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f8fafc 0%, #e5e9f0 100%)"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "50px",
            height: "50px",
            border: "4px solid #e5e9f0",
            borderTop: "4px solid #1e3a8a",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 20px"
          }}></div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <p style={{ color: "#64748b", fontSize: "16px" }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f8fafc 0%, #e5e9f0 100%)",
      padding: "40px 30px",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      {/* Header */}
      <div style={{
        maxWidth: "1400px",
        margin: "0 auto",
        marginBottom: "40px"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "10px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{
              background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
              padding: "12px",
              borderRadius: "12px",
              boxShadow: "0 4px 6px rgba(30, 58, 138, 0.2)"
            }}>
              <svg width="28" height="28" fill="white" viewBox="0 0 24 24">
                <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none" />
              </svg>
            </div>
            <div>
              <h1 style={{
                fontSize: "32px",
                fontWeight: "700",
                background: "linear-gradient(135deg, #1e3a8a 0%, #b91c1c 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                margin: 0
              }}>
                AGREEYA Dashboard
              </h1>
              <p style={{
                margin: "4px 0 0 0",
                color: "#64748b",
                fontSize: "14px"
              }}>
                Public Works Management System
              </p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "12px" }}>
            <button
              onClick={handleLogout}
              style={{
                background: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                boxShadow: "0 4px 6px rgba(220, 38, 38, 0.3)",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
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

            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Search issues..."
                style={{
                  padding: "10px 15px 10px 40px",
                  border: "2px solid #e2e8f0",
                  borderRadius: "10px",
                  fontSize: "14px",
                  width: "250px",
                  outline: "none",
                  transition: "all 0.3s ease"
                }}
                onFocus={(e) => e.target.style.borderColor = "#1e3a8a"}
                onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
              />
              <svg
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "18px",
                  height: "18px"
                }}
                fill="none"
                stroke="#94a3b8"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Error Message */}
        {error && (
          <div style={{
            background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
            border: "2px solid #ef4444",
            color: "#991b1b",
            padding: "16px 20px",
            borderRadius: "12px",
            marginBottom: "30px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            boxShadow: "0 4px 6px rgba(239, 68, 68, 0.1)"
          }}>
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <strong style={{ display: "block", marginBottom: "4px" }}>Error Loading Data</strong>
              {error}
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          marginBottom: "40px",
        }}>
          {[
            { label: "Total Issues", value: stats.total, gradient: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
            { label: "Pending", value: stats.pending, gradient: "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
            { label: "In Progress", value: stats.inProgress, gradient: "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
            { label: "Resolved", value: stats.resolved, gradient: "linear-gradient(135deg, #059669 0%, #10b981 100%)", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
            { label: "High Priority", value: stats.highPriority, gradient: "linear-gradient(135deg, #b91c1c 0%, #ef4444 100%)", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" },
          ].map((card, i) => (
            <div
              key={i}
              style={{
                background: "white",
                padding: "24px",
                borderRadius: "16px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07)",
                position: "relative",
                overflow: "hidden",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                cursor: "pointer"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 24px rgba(0, 0, 0, 0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.07)";
              }}
            >
              <div style={{
                position: "absolute",
                top: "-20px",
                right: "-20px",
                width: "100px",
                height: "100px",
                background: card.gradient,
                opacity: "0.1",
                borderRadius: "50%"
              }}></div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <h3 style={{
                  margin: 0,
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}>
                  {card.label}
                </h3>
                <div style={{
                  background: card.gradient,
                  padding: "8px",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
                }}>
                  <svg width="20" height="20" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d={card.icon} />
                  </svg>
                </div>
              </div>
              <p style={{
                fontSize: "36px",
                fontWeight: "700",
                background: card.gradient,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                margin: 0
              }}>
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* Issues Table */}
        <div style={{
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.07)",
          overflow: "hidden"
        }}>
          <div style={{
            background: "linear-gradient(135deg, #1e3a8a 0%, #b91c1c 100%)",
            padding: "20px 30px",
            color: "white"
          }}>
            <h2 style={{
              margin: 0,
              fontSize: "20px",
              fontWeight: "600",
              letterSpacing: "0.5px"
            }}>
              Recent Issues
            </h2>
            <p style={{
              margin: "4px 0 0 0",
              fontSize: "14px",
              opacity: "0.9"
            }}>
              Sorted from newest to oldest
            </p>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse",
            }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                  <th style={{ ...thStyle, width: "60px" }}>#</th>
                  <th style={{ ...thStyle, width: "60px "}}>Category</th>
                  <th style={{ ...thStyle, textAlign: "left" }}>Description</th>
                  <th style={{ ...thStyle, width: "140px" }}>Priority</th>
                  <th style={{ ...thStyle, width: "140px" }}>Status</th>
                  <th style={{ ...thStyle, width: "220px" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {issues.length === 0 ? (
                  <tr>
                    <td style={{ ...tdStyle, textAlign: "center", padding: "60px" }} colSpan={5}>
                      <svg width="64" height="64" fill="none" stroke="#cbd5e1" viewBox="0 0 24 24" style={{ margin: "0 auto 16px" }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <div style={{ color: "#94a3b8", fontSize: "16px" }}>No issues found</div>
                    </td>
                  </tr>
                ) : (
                  issues.map((issue, idx) => (
                    <tr
                      key={issue.issueId}
                      style={{
                        borderBottom: "1px solid #f1f5f9",
                        transition: "background-color 0.2s ease"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8fafc"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                      <td style={{ ...tdStyle, textAlign: "center", fontWeight: "600", color: "#64748b" }}>
                        {idx + 1}
                      </td>
                      <td style={{ ...tdStyle, color: "#334155", textAlign: "center" }}>
                        {issue.categoryId || "N/A"}
                      </td>
                      <td style={{ ...tdStyle, color: "#334155" }}>
                        <div style={{
                          maxWidth: "500px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}>
                          {issue.description}
                        </div>
                      </td>
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        <span style={{
                          padding: "6px 16px",
                          borderRadius: "20px",
                          fontSize: "13px",
                          fontWeight: "600",
                          display: "inline-block",
                          ...(issue.priorityId === 3
                            ? { background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)", color: "#991b1b" }
                            : issue.priorityId === 2
                              ? { background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", color: "#92400e" }
                              : { background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)", color: "#065f46" })
                        }}>
                          {issue.priorityId === 3 ? "High" : issue.priorityId === 2 ? "Medium" : "Low"}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        <span style={{
                          padding: "6px 16px",
                          borderRadius: "20px",
                          fontSize: "13px",
                          fontWeight: "600",
                          display: "inline-block",
                          ...(issue.statusId === 3
                            ? { background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)", color: "#065f46" }
                            : issue.statusId === 2
                              ? { background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)", color: "#1e3a8a" }
                              : { background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)", color: "#374151" })
                        }}>
                          {issue.statusId === 1 ? "Pending" : issue.statusId === 2 ? "In Progress" : "Resolved"}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                          <button
                            style={{
                              ...btnStyle,
                              background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                            onClick={() => alert(`Remarks for Issue #${issue.issueId}`)}
                          >
                            Remarks
                          </button>
                          <button
                            style={{
                              ...btnStyle,
                              background: "linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)",
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                            onClick={() => navigate(`/admin/messages?issueId=${issue.issueId}`)}
                          >
                            Message
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const thStyle: React.CSSProperties = {
  padding: "16px 24px",
  fontSize: "13px",
  fontWeight: "700",
  color: "#475569",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  textAlign: "center"
};

const tdStyle: React.CSSProperties = {
  padding: "16px 24px",
  fontSize: "14px"
};

const btnStyle: React.CSSProperties = {
  padding: "8px 20px",
  border: "none",
  borderRadius: "8px",
  fontSize: "13px",
  fontWeight: "600",
  color: "white",
  cursor: "pointer",
  transition: "all 0.3s ease",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
};

export default AdminDashboard;
