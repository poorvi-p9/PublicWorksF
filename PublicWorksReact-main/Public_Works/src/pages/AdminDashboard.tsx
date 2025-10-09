import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthRole, getAuthToken } from "../utils/auth";
import type { Priority } from "../types/issue";
import MessageModal from "../components/MessageModal";
import { RemarksModal } from "../components/RemarksModal";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});


interface Status {
  statusId: number;
  name: string;
  description: string;
}
interface Category {
  categoryId: number;
  name: string;
  description: string;
}

const AdminDashboard: React.FC = () => {
  // State for map popup
  const [mapOpen, setMapOpen] = useState(false);
  const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [viewAllMapOpen, setViewAllMapOpen] = useState(false);

  // State for image viewer
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loadingImages, setLoadingImages] = useState(false);

  // Open map popup for given lat/lng
  const handleShowMap = (lat: number, lng: number) => {
    setMapCoords({ lat, lng });
    setMapOpen(true);
  };

  // Close map popup
  const handleCloseMap = () => {
    setMapOpen(false);
    setMapCoords(null);
  };

  const handleShowAllOnMap = () => {
  setViewAllMapOpen(true);
  };

  const handleCloseAllMap = () => {
    setViewAllMapOpen(false);
  };

  // Fetch and display images for an issue
  const handleViewImages = async (issueId: number) => {
    setLoadingImages(true);
    try {
      const token = getAuthToken() || "";
      const response = await fetch(`${API_BASE_URL}/Issue/${issueId}/images`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Failed to fetch images");
      const data = await response.json();
      console.log("Raw API response:", data);
      
      if (data && data.length > 0) {
        const imagePaths = data.map((img: any) => `http://localhost:5142${img.imagePath}`);
        console.log("Constructed image URL:", imagePaths); 
        setCurrentImages(imagePaths);
        setCurrentImageIndex(0);
        setImageViewerOpen(true);
      } else {  
        alert("No images available for this issue");
      }
    } catch (err: any) {
      console.error("Failed to load images:", err);
      alert("Failed to load images");
    } finally {
      setLoadingImages(false);
    }
  };

  // Close image viewer
  const handleCloseImageViewer = () => {
    setImageViewerOpen(false);
    setCurrentImages([]);
    setCurrentImageIndex(0);
  };

  // Navigate to next image
  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % currentImages.length);
  };

  // Navigate to previous image
  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + currentImages.length) % currentImages.length);
  };
  const navigate = useNavigate();
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isRemarksModalOpen, setIsRemarksModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);

  

  // Get admin email from localStorage or auth context
  const adminEmail: string = localStorage.getItem('userEmail') || "";

  const handleMessageClick = (issue: any) => {
  setSelectedIssue(issue);
  setIsMessageModalOpen(true);
  };

  const handleRemarksClick = (issue: any) => {
    setSelectedIssue(issue);
    setIsRemarksModalOpen(true);
  };
  // Filter state
  const [filterStatus, setFilterStatus] = useState<number | "">("");
  const [filterPriority, setFilterPriority] = useState<number | "">("");
  const [filterLoading, setFilterLoading] = useState(false);
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

  const fetchStatuses = async () => {
    try {
      const token = getAuthToken() || "";
      const response = await fetch(`${API_BASE_URL}/Status/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Failed to fetch statuses");
      const data = await response.json();
      console.log("Fetched statuses:", data); // Debug log
      setStatuses(data);
    } catch (err: any) {
      console.error("Failed to load statuses:", err);
    }
  };

  const fetchPriorities = async () => {
    try {
      const token = getAuthToken() || "";
      const response = await fetch(`${API_BASE_URL}/Priority/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Failed to fetch statuses");
      const data = await response.json();
      console.log("Fetched Priorities:", data); // Debug log
      setPriorities(data);
    } catch (err: any) {
      console.error("Failed to load Priorities:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = getAuthToken() || "";
      const response = await fetch(`${API_BASE_URL}/Category/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      console.log("Fetched Categories:", data);
      setCategories(data);
    } catch (err: any) {
      console.error("Failed to load categories:", err);
    }
  };

  // Fetch issues, optionally with filters
  const fetchIssues = async (statusId?: number | "", priorityId?: number | "") => {
    try {
      setFilterLoading(true);
      let url = `${API_BASE_URL}/Issue`;
      const params: string[] = [];
      if (statusId) params.push(`statusId=${statusId}`);
      if (priorityId) params.push(`priorityId=${priorityId}`);
      if (params.length > 0) url += `?${params.join("&")}`;
      const token = getAuthToken() || "";
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Failed to fetch issues");
      const data = await response.json();
      // console.log("Raw API Issue Response:", data[0]);
      const issues = data.map((issue: any) => {
        const match = issue.location && issue.location.match(/POINT \(([-\d.]+) ([-\d.]+)\)/);
        return {
          ...issue,
          categoryId: issue.issueCategoryId,
          latitude: match ? parseFloat(match[2]) : null,
          longitude: match ? parseFloat(match[1]) : null,
        };
      });
      setIssues(issues.sort((a: any, b: any) => b.issueId - a.issueId));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setFilterLoading(false);
    }
  };

  // Handle filter apply
  const handleApplyFilter = () => {
    fetchIssues(filterStatus, filterPriority);
  };

  // Handle filter reset
  const handleResetFilter = () => {
    setFilterStatus("");
    setFilterPriority("");
    fetchIssues();
  };

  const fetchStats = async () => {
    try {
      const token = getAuthToken() || "";
      const response = await fetch(`${API_BASE_URL}/Issue/summary`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Failed to fetch summary");
      const data = await response.json();
      setStats({
        total: data.totalIssues,
        pending: data.pending,
        inProgress: data.inProgress,
        resolved: data.resolved,
        highPriority: data.highPriority || 0,
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getStatusClass = (statusId: number) => {
    if (statusId === 3) return { background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)", color: "#065f46" };
    if (statusId === 1) return { background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)", color: "#1e3a8a" };
    if (statusId === 2) return { background: "linear-gradient(135deg, #dabacfff 0%, #a53c93ff 100%)", color: "#5a033dff" };
    return { background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)", color: "#374151" };
  };

  const getPriorityClass = (priorityId: number) => {
    if (priorityId === 3) return { background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)", color: "#065f46" };
    if (priorityId === 2) return { background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)", color: "#1e3a8a" };
    return { background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)", color: "#374151" };
  };

  const getCategoryClass = (categoryId: number) => {
  if (categoryId === 1) return { background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", color: "#92400e" };
  if (categoryId === 2) return { background: "linear-gradient(135deg, #e9d5ff 0%, #d8b4fe 100%)", color: "#581c87" };
  if (categoryId === 3) return { background: "linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)", color: "#7c2d12" };
  return { background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)", color: "#374151" };
};

  const handleStatusChange = async (issueId: number, newStatusId: number) => {
    try {
      const token = getAuthToken() || "";
      const response = await fetch(`${API_BASE_URL}/Issue/update-issue/${issueId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ statusId: newStatusId }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      // Update local state
      setIssues(issues.map(issue => 
        issue.issueId === issueId 
          ? { ...issue, statusId: newStatusId } 
          : issue
      ));

      // Refresh stats
      fetchStats();
    } catch (err: any) {
      alert(`Error updating status: ${err.message}`);
      console.error("Failed to update status:", err);
    }
  };

  const handlePriorityChange = async (issueId: number, newPriorityId: number) => {
    try {
      const token = getAuthToken() || "";
      const response = await fetch(`${API_BASE_URL}/Issue/update-issue/${issueId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ priorityId: newPriorityId }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      // Update local state
      setIssues(issues.map(issue => 
        issue.issueId === issueId 
          ? { ...issue, priorityId: newPriorityId } 
          : issue
      ));

      // Refresh stats
      fetchStats();
    } catch (err: any) {
      alert(`Error updating status: ${err.message}`);
      console.error("Failed to update status:", err);
    }
  };

  

  useEffect(() => {
    const roleId = getAuthRole();
    if (roleId !== 1) {
      setError("NOT AUTHORIZED");
    }
    fetchStatuses();
    fetchPriorities();
    fetchCategories();
    fetchIssues();
    fetchStats();
  }, []);

  useEffect(() => {
    console.log("Current statuses state:", statuses);
    console.log("Current issues state:", issues);
  }, [statuses, issues]);


  if (error === "NOT AUTHORIZED") {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f8fafc 0%, #e5e9f0 100%)"
      }}>
        <div style={{
          background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
          border: "2px solid #ef4444",
          color: "#991b1b",
          padding: "32px 40px",
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(239, 68, 68, 0.12)",
          fontSize: "22px",
          fontWeight: 700
        }}>
          NOT AUTHORIZED
        </div>
      </div>
    );
  }

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
          <button
          onClick={handleShowAllOnMap}
          style={{
            background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 4px 6px rgba(5, 150, 105, 0.3)",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 12px rgba(5, 150, 105, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 6px rgba(5, 150, 105, 0.3)";
          }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          View All on Map
        </button>
          
          {/* <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "12px" }}>
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
          </div> */}
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

         {/* Filter Tab */}
        <div style={{
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
          padding: "18px 24px",
          marginBottom: "32px",
          display: "flex",
          alignItems: "center",
          gap: "18px",
          flexWrap: "wrap"
        }}>
          <span style={{ fontWeight: 600, color: "#1e3a8a", fontSize: "15px" }}>Filter Issues:</span>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value ? Number(e.target.value) : "")}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "1.5px solid #e2e8f0",
              fontSize: "14px",
              minWidth: "140px"
            }}
          >
            <option value="">All Statuses</option>
            {statuses.map(status => (
              <option key={status.statusId} value={status.statusId}>{status.name}</option>
            ))}
          </select>
          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value ? Number(e.target.value) : "")}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "1.5px solid #e2e8f0",
              fontSize: "14px",
              minWidth: "140px"
            }}
          >
            <option value="">All Priorities</option>
            {priorities.map(priority => (
              <option key={priority.id} value={priority.id}>{priority.name}</option>
            ))}
          </select>
          <button
            onClick={handleApplyFilter}
            style={{
              ...btnStyle,
              background: "linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%)",
              color: "white",
              fontWeight: 600,
              fontSize: "14px",
              padding: "8px 20px"
            }}
            disabled={filterLoading}
          >
            {filterLoading ? "Filtering..." : "Apply Filter"}
          </button>
          <button
            onClick={handleResetFilter}
            style={{
              ...btnStyle,
              background: "#e5e7eb",
              color: "#1e3a8a",
              fontWeight: 600,
              fontSize: "14px",
              padding: "8px 20px"
            }}
            disabled={filterLoading}
          >
            Reset
          </button>
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
                  <th style={{ ...thStyle, width: "140px" }}>Category</th> 
                  <th style={{ ...thStyle, width: "60px" }}>Date</th>
                  <th style={{ ...thStyle, textAlign: "left" }}>Description</th>
                  <th style={{ ...thStyle, width: "60px" }}>image</th>
                  
                  
                  <th style={{ ...thStyle, width: "120px" }}>Location</th> 
                  <th style={{ ...thStyle, width: "140px" }}>Priority</th>
                  <th style={{ ...thStyle, width: "160px" }}>Status</th>
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
                      
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        {categories.length > 0 ? (
                          <span style={{
                            padding: "6px 16px",
                            borderRadius: "20px",
                            fontSize: "13px",
                            fontWeight: "600",
                            display: "inline-block",
                            ...getCategoryClass(issue.categoryId)
                          }}>
                            {categories.find(cat => cat.categoryId === issue.categoryId)?.name || "Unknown"}
                          </span>
                        ) : (
                          <span style={{
                            padding: "6px 16px",
                            borderRadius: "20px",
                            fontSize: "13px",
                            fontWeight: "600",
                            display: "inline-block",
                            ...getCategoryClass(issue.categoryId)
                          }}>
                            Loading...
                          </span>
                        )}
                      </td>

                      {/* date */}
                       <td style={{ ...tdStyle, color: "#334155", textAlign: "center" }}>
                        {issue.createdAt 
                          ? new Date(issue.createdAt).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              // hour: "2-digit",
                              // minute: "2-digit"
                            })
                          : "-"}
                      </td>
                      {/* Description */}
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
                        <button
                          onClick={() => handleViewImages(issue.issueId)}
                          style={{
                            padding: "6px 12px",
                            background: "#3b82f6",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "13px",
                            fontWeight: "500",
                          }}
                          disabled={loadingImages}
                        >
                          {loadingImages ? "Loading..." : "View"}
                        </button>
                      </td>
                      {/* Image Viewer Modal */}
                      {imageViewerOpen && (
                        <div
                          style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            background: "rgba(0,0,0,0.7)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 1000
                          }}
                        >
                          <div
                            style={{
                              position: "relative",
                              background: "#fff",
                              padding: "20px",
                              borderRadius: "12px",
                              boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                              maxWidth: "90vw",
                              maxHeight: "90vh"
                            }}
                          >
                            <img
                              src={currentImages[currentImageIndex]}
                              alt="Issue"
                              onError={(e) => {
                                console.error("Image failed to load:", currentImages[currentImageIndex]);
                                console.error("Error event:", e);
                              }}
                              onLoad={() => console.log("Image loaded successfully:", currentImages[currentImageIndex])}
                              style={{
                                maxWidth: "80vw",
                                maxHeight: "80vh",
                                objectFit: "contain",
                                borderRadius: "8px"
                              }}
                            />

                            {/* Close Button */}
                            <button
                              onClick={handleCloseImageViewer}
                              style={{
                                position: "absolute",
                                top: "10px",
                                right: "10px",
                                background: "#ef4444",
                                color: "#fff",
                                border: "none",
                                padding: "8px 14px",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontWeight: "600"
                              }}
                            >
                              ✕ Close
                            </button>

                            {/* Prev / Next Buttons */}
                            {currentImages.length > 1 && (
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  marginTop: "12px"
                                }}
                              >
                                <button
                                  onClick={handlePrevImage}
                                  style={{
                                    padding: "6px 14px",
                                    border: "1px solid #64748b",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    background: "#f1f5f9"
                                  }}
                                >
                                  ← Prev
                                </button>

                                <button
                                  onClick={handleNextImage}
                                  style={{
                                    padding: "6px 14px",
                                    border: "1px solid #64748b",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    background: "#f1f5f9"
                                  }}
                                >
                                  Next →
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}


                     

                      
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        {(issue.latitude && issue.longitude) ? (
                          <button
                            style={{
                              ...btnStyle,
                              background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                              padding: "6px 16px",
                              fontSize: "13px"
                            }}
                            onClick={() => handleShowMap(issue.latitude, issue.longitude)}
                          >
                            View Map
                          </button>
                        ) : (
                          <span style={{ color: '#64748b', fontSize: '13px' }}>N/A</span>
                        )}
                      </td>
                      
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        {priorities.length > 0 ? (
                          <select
                            value={issue.priorityId}
                            onChange={(e) => handlePriorityChange(issue.issueId, parseInt(e.target.value))}
                            style={{
                              padding: "6px 16px",
                              borderRadius: "20px",
                              fontSize: "13px",
                              fontWeight: "600",
                              border: "none",
                              cursor: "pointer",
                              outline: "none",
                              appearance: "auto",
                              WebkitAppearance: "menulist",
                              ...getPriorityClass(issue.priorityId)
                            }}
                          >
                            {priorities.map((priority) => (
                              <option key={priority.id} value={priority.id}>
                                {priority.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span style={{
                            padding: "6px 16px",
                            borderRadius: "20px",
                            fontSize: "13px",
                            fontWeight: "600",
                            display: "inline-block",
                            ...getStatusClass(issue.statusId)
                          }}>
                            Loading...
                          </span>
                        )}
                      </td>
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        {statuses.length > 0 ? (
                          <select
                            value={issue.statusId}
                            onChange={(e) => handleStatusChange(issue.issueId, parseInt(e.target.value))}
                            style={{
                              padding: "6px 16px",
                              borderRadius: "20px",
                              fontSize: "13px",
                              fontWeight: "600",
                              border: "none",
                              cursor: "pointer",
                              outline: "none",
                              appearance: "auto",
                              WebkitAppearance: "menulist",
                              ...getStatusClass(issue.statusId)
                            }}
                          >
                            {statuses.map((status) => (
                              <option key={status.statusId} value={status.statusId}>
                                {status.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span style={{
                            padding: "6px 16px",
                            borderRadius: "20px",
                            fontSize: "13px",
                            fontWeight: "600",
                            display: "inline-block",
                            ...getStatusClass(issue.statusId)
                          }}>
                            Loading...
                          </span>
                        )}
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
                            onClick={() => handleRemarksClick(issue)}
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
                            onClick={() => handleMessageClick(issue)}
                            >
                            Message
                            </button>
                          {/* Message Modal */}
                          <MessageModal
                            isOpen={isMessageModalOpen}
                            onClose={() => setIsMessageModalOpen(false)}
                            issueId={selectedIssue?.issueId}
                            userId={selectedIssue?.userId}
                            adminEmail={adminEmail}
                          />

                          {/* Remarks Modal */}
                          <RemarksModal
                            isOpen={isRemarksModalOpen}
                            onClose={() => setIsRemarksModalOpen(false)}
                            issueId={selectedIssue?.issueId}
                            adminEmail={adminEmail}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
      {/* Map Popup */}
      {mapOpen && mapCoords && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.35)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            padding: '24px',
            minWidth: '350px',
            minHeight: '350px',
            position: 'relative',
            maxWidth: '90vw',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <button
              onClick={handleCloseMap}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                fontSize: '18px',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(239,68,68,0.18)'
              }}
              title="Close"
            >
              ×
            </button>
            <h3 style={{ margin: '0 0 12px 0', color: '#1e3a8a', fontWeight: 700 }}>Issue Location</h3>
            <div style={{ width: '320px', height: '320px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <iframe
                title="Map View"
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapCoords.lng-0.01}%2C${mapCoords.lat-0.01}%2C${mapCoords.lng+0.01}%2C${mapCoords.lat+0.01}&layer=mapnik&marker=${mapCoords.lat}%2C${mapCoords.lng}`}
                allowFullScreen
              ></iframe>
            </div>
            <div style={{ marginTop: '10px', color: '#64748b', fontSize: '13px' }}>
              Lat: {mapCoords.lat}, Lng: {mapCoords.lng}
            </div>
            <a
              href={`https://www.openstreetmap.org/?mlat=${mapCoords.lat}&mlon=${mapCoords.lng}#map=18/${mapCoords.lat}/${mapCoords.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ marginTop: '8px', color: '#2563eb', fontSize: '13px', textDecoration: 'underline' }}
            >
              View on OpenStreetMap
            </a>
          </div>
        </div>
      )}
              </tbody>
            </table>
          </div>
        </div>
        {/* View All Issues Map Modal */}
{/* View All Issues Map Modal */}
{viewAllMapOpen && (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    <div style={{
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
      padding: '24px',
      width: '85vw',
      height: '85vh',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <button
        onClick={handleCloseAllMap}
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          background: '#ef4444',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '8px 16px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          boxShadow: '0 2px 6px rgba(239,68,68,0.3)',
          zIndex: 1001
        }}
      >
        ✕ Close
      </button>
      <h3 style={{ margin: '0 0 16px 0', color: '#1e3a8a', fontWeight: 700, fontSize: '20px' }}>
        All Issues Map View ({issues.filter(i => i.latitude && i.longitude).length} locations)
      </h3>
      <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <MapContainer
          center={[28.5, 77.5]}
          zoom={10}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {issues
            .filter(issue => issue.latitude && issue.longitude)
            .map((issue) => (
              <Marker
                key={issue.issueId}
                position={[issue.latitude, issue.longitude]}
              >
                <Popup>
                  <div style={{ minWidth: '200px' }}>
                    <strong style={{ color: '#1e3a8a', fontSize: '14px' }}>
                      Issue #{issue.issueId}
                    </strong>
                    <div style={{ marginTop: '8px', fontSize: '13px' }}>
                      <strong>Category:</strong>{' '}
                      {categories.find(cat => cat.categoryId === issue.categoryId)?.name || 'Unknown'}
                    </div>
                    <div style={{ marginTop: '4px', fontSize: '13px' }}>
                      <strong>Status:</strong>{' '}
                      {statuses.find(s => s.statusId === issue.statusId)?.name || 'Unknown'}
                    </div>
                    <div style={{ marginTop: '4px', fontSize: '13px' }}>
                      <strong>Priority:</strong>{' '}
                      {priorities.find(p => p.id === issue.priorityId)?.name || 'Unknown'}
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#64748b' }}>
                      {issue.description?.substring(0, 100)}...
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
        </MapContainer>
      </div>
    </div>
  </div>
)}
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