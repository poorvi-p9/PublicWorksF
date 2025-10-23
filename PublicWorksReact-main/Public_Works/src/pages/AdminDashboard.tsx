import React, { useEffect, useState } from "react";
// useNavigate not needed in this page (Header handles navigation)
import { getAuthRole, getAuthToken } from "../utils/auth";
import type { Priority } from "../types/issue";
import EmailModal from "../components/MessageModal";
import { RemarksModal } from "../components/RemarksModal";
import "./AdminDashboard.css";

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
  // navigate removed; use Header for logout/navigation
  const API_BASE_URL = "http://localhost:5142/api";

  // State for map popup
  const [mapOpen, setMapOpen] = useState(false);
  const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number } | null>(null);

  // State for image viewer
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loadingImages, setLoadingImages] = useState(false);

  // State for email modal
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedEmailRecipient, setSelectedEmailRecipient] = useState<{
    email: string;
    name?: string;
    issueId?: number;
  } | null>(null);
  const [fetchingUserEmail, setFetchingUserEmail] = useState(false);

  // Core data states
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [issues, setIssues] = useState<any[]>([]);

  const [isRemarksModalOpen, setIsRemarksModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);

  // User data
  const adminEmail: string = localStorage.getItem('userEmail') || "";
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = userData.userId;

  // Filter state
  const [filterStatus, setFilterStatus] = useState<number | "">("");
  const [filterPriority, setFilterPriority] = useState<number | "">("");
  const [filterLoading, setFilterLoading] = useState(false);

  // Stats and loading states
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    highPriority: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handler: Fetch user email from User API
  const handleEmailClick = async (issue: any) => {
    setFetchingUserEmail(true);
    try {
      const token = getAuthToken() || '';
      const response = await fetch(`http://localhost:5142/api/User/${issue.reporterUserId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch user details');

      const userData = await response.json();
      // console.log('User data fetched:', userData);

      setSelectedEmailRecipient({
        email: userData.email,
        name: userData.name || userData.username || userData.firstName,
        issueId: issue.issueId
      });

      setIsEmailModalOpen(true);
    } catch (err: any) {
      console.error('Failed to fetch user email:', err);
      alert('Could not retrieve user email address. Please try again.');
    } finally {
      setFetchingUserEmail(false);
    }
  };

  // Handler: Show map popup
  const handleShowMap = (lat: number, lng: number) => {
    setMapCoords({ lat, lng });
    setMapOpen(true);
  };

  // Handler: Close map popup
  const handleCloseMap = () => {
    setMapOpen(false);
    setMapCoords(null);
  };

  // Handler: Fetch and display images for an issue
  const handleViewImages = async (issueId: number) => {
    setLoadingImages(true);
    try {
      const token = getAuthToken() || "";
      const response = await fetch(`${API_BASE_URL}/Issue/${issueId}/images`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Failed to fetch images");
      const data = await response.json();
      // console.log("Raw API response:", data);

      if (data && data.length > 0) {
        const imagePaths = data.map((img: any) => `http://localhost:5142${img.imagePath}`);
        // console.log("Constructed image URL:", imagePaths);
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

  // Handler: Close image viewer
  const handleCloseImageViewer = () => {
    setImageViewerOpen(false);
    setCurrentImages([]);
    setCurrentImageIndex(0);
  };

  // Handler: Navigate to next image
  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % currentImages.length);
  };

  // Handler: Navigate to previous image
  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + currentImages.length) % currentImages.length);
  };

  // Message modal removed — use Email or Remarks instead

  // Handler: Open remarks modal
  const handleRemarksClick = (issue: any) => {
    setSelectedIssue(issue);
    setIsRemarksModalOpen(true);
  };

  // Logout handled by Header component

  // Fetch: Statuses
  const fetchStatuses = async () => {
    try {
      const token = getAuthToken() || "";
      const response = await fetch(`${API_BASE_URL}/Status/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Failed to fetch statuses");
      const data = await response.json();
      // console.log("Fetched statuses:", data);
      setStatuses(data);
    } catch (err: any) {
      // console.error("Failed to load statuses:", err);
    }
  };

  // Fetch: Priorities
  const fetchPriorities = async () => {
    try {
      const token = getAuthToken() || "";
      const response = await fetch(`${API_BASE_URL}/Priority/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Failed to fetch priorities");
      const data = await response.json();
      // console.log("Fetched Priorities:", data);
      setPriorities(data);
    } catch (err: any) {
      console.error("Failed to load Priorities:", err);
    }
  };

  // Fetch: Categories
  const fetchCategories = async () => {
    try {
      const token = getAuthToken() || "";
      const response = await fetch(`${API_BASE_URL}/Category/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      // console.log("Fetched Categories:", data);
      setCategories(data);
    } catch (err: any) {
      console.error("Failed to load categories:", err);
    }
  };

  // Fetch: Issues (with optional filters)
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
      // console.log("Fetched Issues:", data);

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

  // Fetch: Stats summary
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

  // Handler: Apply filter
  const handleApplyFilter = () => {
    fetchIssues(filterStatus, filterPriority);
  };

  // Handler: Reset filter
  const handleResetFilter = () => {
    setFilterStatus("");
    setFilterPriority("");
    fetchIssues();
  };

  // Handler: Update status
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

      setIssues(issues.map(issue =>
        issue.issueId === issueId
          ? { ...issue, statusId: newStatusId }
          : issue
      ));

      fetchStats();
    } catch (err: any) {
      alert(`Error updating status: ${err.message}`);
      console.error("Failed to update status:", err);
    }
  };

  // Handler: Update priority
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

      if (!response.ok) throw new Error("Failed to update priority");

      setIssues(issues.map(issue =>
        issue.issueId === issueId
          ? { ...issue, priorityId: newPriorityId }
          : issue
      ));

      fetchStats();
    } catch (err: any) {
      alert(`Error updating priority: ${err.message}`);
      console.error("Failed to update priority:", err);
    }
  };

  // Styling helpers
  const getStatusClass = (statusId: number) => {
    if (statusId === 3) return { background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)", color: "#065f46" };
    if (statusId === 2) return { background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)", color: "#1e3a8a" };
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

  // Effects
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
    // console.log("Current statuses state:", statuses);
    // console.log("Current issues state:", issues);
  }, [statuses, issues]);

  // Render: NOT AUTHORIZED error
  if (error === "NOT AUTHORIZED") {
    return (
      <div className="error-container">
        <div className="error-box">NOT AUTHORIZED</div>
      </div>
    );
  }

  // Render: Loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Stats card data
  const statsCards = [
    {
      label: "Total Issues",
      value: stats.total,
      gradient: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
    },
    {
      label: "Pending",
      value: stats.pending,
      gradient: "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      gradient: "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)",
      icon: "M13 10V3L4 14h7v7l9-11h-7z"
    },
    {
      label: "Resolved",
      value: stats.resolved,
      gradient: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
      icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    },
    {
      label: "High Priority",
      value: stats.highPriority,
      gradient: "linear-gradient(135deg, #b91c1c 0%, #ef4444 100%)",
      icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    }
  ];

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-top">
          <div className="header-left">
            <div className="header-icon">
              <svg width="28" height="28" fill="white" viewBox="0 0 24 24">
                <path
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>
            <div className="header-title">
              <h1>AgreeYa Dashboard</h1>
              <p>Public Works Management System</p>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Error Message */}
        {error && (
          <div className="error-message">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <strong>Error Loading Data</strong>
              {error}
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="stats-grid">
          {statsCards.map((card, i) => (
            <div key={i} className="stat-card">
              <div className="stat-card-bg" style={{ background: card.gradient }}></div>
              <div className="stat-card-header">
                <h3 className="stat-card-title">{card.label}</h3>
                <div className="stat-card-icon" style={{ background: card.gradient }}>
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <path d={card.icon} />
                  </svg>
                </div>
              </div>
              <p className="stat-card-value" style={{ background: card.gradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* Filter Section */}
        <div className="filter-section">
          <span className="filter-label">Filter Issues:</span>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value ? Number(e.target.value) : "")} className="filter-select">
            <option value="">All Statuses</option>
            {statuses.map((status) => (
              <option key={status.statusId} value={status.statusId}>
                {status.name}
              </option>
            ))}
          </select>
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value ? Number(e.target.value) : "")} className="filter-select">
            <option value="">All Priorities</option>
            {priorities.map((priority) => (
              <option key={priority.priorityId} value={priority.priorityId}>
                {priority.name}
              </option>
            ))}
          </select>
          <button onClick={handleApplyFilter} className="filter-btn filter-btn-apply" disabled={filterLoading}>
            {filterLoading ? "Filtering..." : "Apply Filter"}
          </button>
          <button onClick={handleResetFilter} className="filter-btn filter-btn-reset" disabled={filterLoading}>
            Reset
          </button>
        </div>

        {/* Issues Table */}
        <div className="issues-table-container">
          <div className="table-header">
            <h2>Recent Issues</h2>
            <p>Sorted from newest to oldest</p>
          </div>

          <div className="table-wrapper">
            <table className="issues-table">
              <thead>
                <tr>
                  <th style={{ width: "140px" }}>Category</th>
                  <th style={{ width: "60px" }}>Date</th>
                  <th style={{ textAlign: "left" }}>Description</th>
                  <th style={{ width: "60px" }}>Image</th>
                  <th style={{ width: "120px" }}>Location</th>
                  <th style={{ width: "140px" }}>Priority</th>
                  <th style={{ width: "160px" }}>Status</th>
                  <th style={{ width: "220px" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {issues.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="empty-state">
                      <svg width="64" height="64" fill="none" stroke="#cbd5e1" viewBox="0 0 24 24" className="empty-state-icon">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                      </svg>
                      <div className="empty-state-text">No issues found</div>
                    </td>
                  </tr>
                ) : (
                  issues.map((issue) => (
                    <tr key={issue.issueId}>
                      {/* Category */}
                      <td className="td-center">
                        {categories.length > 0 ? (
                          <span className="badge" style={getCategoryClass(issue.categoryId)}>
                            {categories.find((cat) => cat.categoryId === issue.categoryId)?.name || "Unknown"}
                          </span>
                        ) : (
                          <span className="badge" style={getCategoryClass(issue.categoryId)}>
                            Loading...
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="td-date">
                        <td>
                          {new Date(issue.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "2-digit",
                          })}
                        </td>

                      </td>

                      {/* Description */}
                      <td>
                        <div className="td-description">{issue.description}</div>
                      </td>

                      {/* Image */}
                      <td className="td-center">
                        <button onClick={() => handleViewImages(issue.issueId)} className="btn-view" disabled={loadingImages}>
                          {loadingImages ? "Loading..." : "View"}
                        </button>
                      </td>

                      {/* Location */}
                      <td className="td-center">
                        {issue.latitude && issue.longitude ? (
                          <button className="action-btn btn-map" onClick={() => handleShowMap(issue.latitude, issue.longitude)}>
                            View Map
                          </button>
                        ) : (
                          <span className="na-text">N/A</span>
                        )}
                      </td>

                      {/* Priority */}
                      <td className="td-center">
                        {priorities.length > 0 ? (
                          <select
                            value={issue.priorityId}
                            onChange={(e) => handlePriorityChange(issue.issueId, parseInt(e.target.value))}
                            className="badge-select"
                            style={getPriorityClass(issue.priorityId)}
                          >
                            {priorities.map((priority) => (
                              <option key={priority.priorityId} value={priority.priorityId}>
                                {priority.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="badge" style={getPriorityClass(issue.priorityId)}>
                            Loading...
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="td-center">
                        {statuses.length > 0 ? (
                          <select
                            value={issue.statusId}
                            onChange={(e) => handleStatusChange(issue.issueId, parseInt(e.target.value))}
                            className="badge-select"
                            style={getStatusClass(issue.statusId)}
                          >
                            {statuses.map((status) => (
                              <option key={status.statusId} value={status.statusId}>
                                {status.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="badge" style={getStatusClass(issue.statusId)}>
                            Loading...
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="td-center">
                        <div className="action-buttons">
                          <button className="action-btn btn-remarks" onClick={() => handleRemarksClick(issue)}>
                            Remarks
                          </button>
                          <button
                            className={`action-btn btn-email ${fetchingUserEmail ? 'loading' : ''}`}
                            onClick={() => !fetchingUserEmail && handleEmailClick(issue)}
                            disabled={fetchingUserEmail}
                          >
                            {fetchingUserEmail ? "Loading..." : "Email"}
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

      {/* Image Viewer Modal */}
      {imageViewerOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <img
              src={currentImages[currentImageIndex]}
              alt="Issue"
              onError={(e) => {
                console.error("Image failed to load:", currentImages[currentImageIndex]);
                console.error("Error event:", e);
              }}
              onLoad={() => console.log("Image loaded successfully:", currentImages[currentImageIndex])}
              className="modal-image"
            />

            <button onClick={handleCloseImageViewer} className="modal-close-btn">
              ✕ Close
            </button>

            {currentImages.length > 1 && (
              <div className="modal-navigation">
                <button onClick={handlePrevImage} className="modal-nav-btn">
                  ← Prev
                </button>
                <button onClick={handleNextImage} className="modal-nav-btn">
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Map Modal */}
      {mapOpen && mapCoords && (
        <div className="modal-overlay">
          <div className="map-modal-content">
            <button onClick={handleCloseMap} className="map-close-btn" title="Close">
              ×
            </button>
            <h3 className="map-title">Issue Location</h3>
            <div className="map-container">
              <iframe
                title="Map View"
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapCoords.lng - 0.01
                  }%2C${mapCoords.lat - 0.01}%2C${mapCoords.lng + 0.01
                  }%2C${mapCoords.lat + 0.01}&layer=mapnik&marker=${mapCoords.lat}%2C${mapCoords.lng}`}
                allowFullScreen
              ></iframe>
            </div>

            <div className="map-coords">
              Lat: {mapCoords.lat}, Lng: {mapCoords.lng}
            </div>

            {/* ✅ Corrected anchor tag */}
            <a
              href={`https://www.openstreetmap.org/?mlat=${mapCoords.lat}&mlon=${mapCoords.lng}#map=18/${mapCoords.lat}/${mapCoords.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="map-link"
            >
              View on OpenStreetMap
            </a>
          </div>
        </div>
      )}

      {/* Email Modal */}
      <EmailModal
        isOpen={isEmailModalOpen}
        onClose={() => {
          setIsEmailModalOpen(false);
          setSelectedEmailRecipient(null);
        }}
        recipientEmail={selectedEmailRecipient?.email || ""}
        recipientName={selectedEmailRecipient?.name}
        issueId={selectedEmailRecipient?.issueId}
      />

      {/* Remarks Modal */}
      <RemarksModal
        isOpen={isRemarksModalOpen}
        onClose={() => setIsRemarksModalOpen(false)}
        issueId={selectedIssue?.issueId}
        userId={userId}
        adminEmail={adminEmail}
      />

      {/* Message modal removed - use EmailModal or RemarksModal instead */}
    </div>
  );
}
export default AdminDashboard;