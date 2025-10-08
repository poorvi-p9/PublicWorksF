import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createIssue, getCategories } from "../services/issueService";
import type { Category, IssueCreateRequest } from "../types/issue";
import { getAuthRole, getAuthToken } from "../utils/auth";

// CameraCapture component: live camera + capture photo
const CameraCapture: React.FC<{
  onCapture: (blob: Blob) => void;
}> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setStream(mediaStream);
      } catch {
        setError("Camera access denied or not available.");
      }
    }
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        onCapture(blob);
      }
    }, "image/jpeg");
  };

  if (error)
    return (
      <div style={{ color: "#ff4d4f", fontWeight: "bold", marginBottom: 10 }}>
        {error}
      </div>
    );

  return (
    <div
      style={{
        marginBottom: 10,
        borderRadius: 8,
        overflow: "hidden",
        boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
        backgroundColor: "#000",
        position: "relative",
        height: 200,
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      <button
        type="button"
        onClick={handleCapture}
        style={{
          position: "absolute",
          bottom: 10,
          right: 10,
          padding: "8px 16px",
          backgroundColor: "#1890ff",
          color: "#fff",
          border: "none",
          borderRadius: 20,
          fontWeight: "600",
          cursor: "pointer",
          boxShadow: "0 2px 6px rgba(24, 144, 255, 0.6)",
          userSelect: "none",
          transition: "background-color 0.3s ease",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.backgroundColor = "#40a9ff")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "#1890ff")
        }
      >
        Capture
      </button>
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
};

// Confirmation modal to show after successful creation
const ConfirmationModal: React.FC<{
  isOpen: boolean;
  issueId: number;
  categoryName: string;
  description: string;
  onClose: () => void;
}> = ({ isOpen, issueId, categoryName, description, onClose }) => {
  if (!isOpen) return null;
  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <h2 style={{ color: "#52c41a", marginBottom: 15 }}>
          ✅ Issue Created Successfully!
        </h2>
        <p>
          <strong>Issue ID:</strong> {issueId}
        </p>
        <p>
          <strong>Category:</strong> {categoryName}
        </p>
        <p>
          <strong>Description:</strong> {description}
        </p>
        <button onClick={onClose} style={modalStyles.button}>
          Close
        </button>
      </div>
    </div>

  );
};

const modalStyles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10000,
  },
  modal: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 15,
    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
    width: "90%",
    maxWidth: 420,
    textAlign: "center",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  button: {
    marginTop: 25,
    padding: "12px 26px",
    fontSize: 17,
    backgroundColor: "#1890ff",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "600",
    transition: "background-color 0.3s ease",
  },
};

const IssuePage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<
    IssueCreateRequest & {
      phoneNumber?: string;
      latitude?: string;
      longitude?: string;
      images: (File | null)[];
    }
  >({
    CategoryId: 0,
    priorityId: 0,
    statusId: 0,
    description: "",
    locationText: "",
    phoneNumber: "",
    latitude: "",
    longitude: "",
    images: [null, null, null],
  });
  const [imagePreviews, setImagePreviews] = useState<(string | null)[]>([null, null, null]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [locationMode, setLocationMode] = useState<"manual" | "automatic">("manual");

  const [previewOpen, setPreviewOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [createdIssueId, setCreatedIssueId] = useState(0);
  const [createdCategoryName, setCreatedCategoryName] = useState("");
  const [createdDescription, setCreatedDescription] = useState("");

  const token = getAuthToken();

  useEffect(() => {
    const role = getAuthRole();
    console.log("roleeee:", role);
    if(token == "" || role != "2"){
      setError("NOT AUTHORIZED");
      return; 
    }
    async function fetchCategories() {
      try {
        const cats = await getCategories(token);
        setCategories(cats);
      } catch (err) {
        console.error(err);
      }
    }
    fetchCategories();
  }, [token]);

  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        if (user.email) setUserEmail(user.email);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (locationMode === "automatic") {
      if (!navigator.geolocation) {
        setError("Geolocation is not supported by your browser.");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setFormData((prev: any) => ({
            ...prev,
            latitude: latitude.toFixed(7),
            longitude: longitude.toFixed(7),
          }));
          setError(null);
        },
        () => {
          setError("Failed to get your location. Please allow location access.");
          setLocationMode("manual");
        }
      );
    }
  }, [locationMode]);

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file && !file.type.startsWith("image/")) {
      setError("Only image files are allowed");
      return;
    }
    setFormData((prev: any) => {
      const newImgs = [...prev.images];
      newImgs[index] = file;
      return { ...prev, images: newImgs };
    });
    setImagePreviews((prev) => {
      if (prev[index]) URL.revokeObjectURL(prev[index]!);
      const newPrev = [...prev];
      newPrev[index] = file ? URL.createObjectURL(file) : null;
      return newPrev;
    });
    setError(null);
  };

  const handleCameraCapture = (blob: Blob) => {
    const file = new File([blob], `capture_${Date.now()}.jpg`, { type: blob.type });
    setFormData((prev: any) => {
      const newImgs = [...prev.images];
      const firstEmptyIndex = newImgs.findIndex((img) => img === null);
      if (firstEmptyIndex !== -1) newImgs[firstEmptyIndex] = file;
      return { ...prev, images: newImgs };
    });
    setImagePreviews((prev) => {
      const newPrev = [...prev];
      const firstEmptyIndex = newPrev.findIndex((p) => p === null);
      if (firstEmptyIndex !== -1) newPrev[firstEmptyIndex] = URL.createObjectURL(file);
      return newPrev;
    });
  };

  const validate = (): boolean => {
    if (!formData.description.trim()) {
      setError("Description is required");
      return false;
    }

    const wordCount = formData.description.trim().split(/\s+/).length;
    if (wordCount > 250) {
      setError("Description must not exceed 250 words");
      return false;
    }
    if (formData.CategoryId <= 0) {
      setError("Please select a category");
      return false;
    }
    if (!formData.latitude || isNaN(Number(formData.latitude))) {
      setError("Invalid latitude");
      return false;
    }
    if (!formData.longitude || isNaN(Number(formData.longitude))) {
      setError("Invalid longitude");
      return false;
    }

    const indianPhoneRegex = /^[6-9]\d{9}$/;
    if (!indianPhoneRegex.test(formData.phoneNumber)) {
      setError("Phone number must be a valid 10-digit Indian number starting with 6-9");
      return false;
    }
    setError(null);
    return true;
  };

  const handlePreview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setPreviewOpen(true);
  };

  const handleSubmit = async () => {
    setPreviewOpen(false);
    setLoading(true);
    try {
      const imagesToUpload = formData.images.filter((img: any) => img !== null);
      const payload = { ...formData, images: imagesToUpload };

      const result = await createIssue(payload, token || "");
      const newId = result?.id ?? result?.issueId ?? 0;

       const catIdFromResponse = result?.categoryId ?? formData.CategoryId;

    // Map categoryId to name from categories list
    const catName = categories.find((c) => c.categoryId === Number(catIdFromResponse))?.name ?? "Unknown";
      

      setCreatedIssueId(newId);
      setCreatedCategoryName(catName);
      setCreatedDescription(formData.description);
      setModalOpen(true);
    } catch {
      setError("Failed to create issue. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setFormData({
      CategoryId: 0,
      priorityId: 0,
      statusId: 0,
      description: "",
      locationText: "",
      phoneNumber: "",
      latitude: "",
      longitude: "",
      images: [null, null, null],
    });
    setImagePreviews([null, null, null]);
    setError(null);
  };

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

  return (
    <div
      style={{
        maxWidth: 700,
        margin: "40px auto",
        padding: 30,
        backgroundColor: "#f9faff",
        borderRadius: 15,
        boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h1
        style={{
          marginBottom: 20,
          color: "#222",
          textAlign: "center",
          fontWeight: "700",
          letterSpacing: "1.5px",
        }}
      >
        Create Issue
      </h1>
      {/* <p
        style={{
          fontSize: 14,
          fontWeight: "500",
          marginBottom: 30,
          color: "#555",
          textAlign: "center",
        }}
      >
        Logged in as:{" "}
        <span style={{ fontWeight: "700", color: "#1890ff" }}>
          {userEmail || "Unknown"}
        </span>
      </p> */}

        {/* Category */}
        <label className="label">
          <span className="label-text">Category:</span>
          <select
            name="CategoryId"
            value={formData.CategoryId}
            onChange={handleChange}
            className="select"
          >
            <option value={0}>-- Select Category --</option>
            {categories.map((cat) => (
              <option key={cat.categoryId} value={cat.categoryId}>
                {cat.name}
              </option>
            ))}
          </select>
        </label>
       

        {/* Location Mode */}
        <label className="label">
          <span className="label-text">Location Input Mode:</span>
          <select
            value={locationMode}
            onChange={(e) => setLocationMode(e.target.value as "manual" | "automatic")}
            className="select"
          >
            <option value="manual">Manual</option>
            <option value="automatic">Automatic (Geolocation)</option>
          </select>
        </label>

        {/* Lat/Lng */}
        <div className="lat-lng-container">
          <label className="label">
            <span className="label-text">Latitude:</span>
            <input
              type="text"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              className="input"
              readOnly={locationMode === "automatic"}
              style={{
                backgroundColor: locationMode === "automatic" ? "#f5f5f5" : "#fff",
              }}
            />
          </label>
          <label className="label">
            <span className="label-text">Longitude:</span>
            <input
              type="text"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              className="input"
              readOnly={locationMode === "automatic"}
              style={{
                backgroundColor: locationMode === "automatic" ? "#f5f5f5" : "#fff",
              }}
            />
          </label>
        </div>

        {/* Camera */}
        <CameraCapture onCapture={handleCameraCapture} />

        {/* Images */}
        <div className="images-container">
          {imagePreviews.map((preview, idx) => (
            <div key={idx} className="image-slot">
              {preview ? (
                <img
                  src={preview}
                  alt={`preview-${idx}`}
                  className="image-preview"
                  onClick={() => {
                    setFormData((prev: any) => {
                      const newImgs = [...prev.images];
                      newImgs[idx] = null;
                      return { ...prev, images: newImgs };
                    });
                    setImagePreviews((prev) => {
                      const newPrev = [...prev];
                      newPrev[idx] = null;
                      return newPrev;
                    });
                  }}
                  title="Click to remove image"
                />
              ) : (
                <div className="image-empty">Empty Slot</div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(idx, e)}
                className="file-input"
              />
            </div>
          ))}
        </div>

        {/* Description */}
        <label className="label">
          <span className="label-text">Description:</span>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the issue"
            className="textarea"
          />
        </label>

        {error && <div className="error-text">{error}</div>}

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? "Processing..." : "Preview Issue"}
        </button>
      </form>

      {/* Preview Modal */}
      <PreviewModal
        isOpen={previewOpen}
        formData={formData}
        imagePreviews={imagePreviews}
        categoryName={previewCategoryName}
        onCancel={() => setPreviewOpen(false)}
        onConfirm={handleSubmit}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalOpen}
        issueId={createdIssueId}
        categoryName={createdCategoryName}
        description={createdDescription}
        onClose={handleModalClose}
      />
    </div>
  );
};

export default IssuePage;
