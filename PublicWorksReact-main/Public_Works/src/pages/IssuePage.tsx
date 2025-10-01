import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createIssue, getCategories } from "../services/issueService";
import type { Category, IssueCreateRequest } from "../types/issue";
import { getAuthToken } from "../utils/auth";

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
  debugger
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

  const [imagePreviews, setImagePreviews] = useState<(string | null)[]>([
    null,
    null,
    null,
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [locationMode, setLocationMode] = useState<"manual" | "automatic">(
    "manual"
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [createdIssueId, setCreatedIssueId] = useState(0);
  const [createdCategoryName, setCreatedCategoryName] = useState("");
  const [createdDescription, setCreatedDescription] = useState("");

  const navigate = useNavigate();
  const token = getAuthToken();

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const cats = await getCategories(token);
        setCategories(cats);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    }
    fetchCategories();
  }, [token]);

  // Load user email from localStorage
  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        if (user.email) {
          setUserEmail(user.email);
        }
      } catch {}
    }
  }, []);

  // Handle automatic geolocation
  useEffect(() => {
    if (locationMode === "automatic") {
      if (!navigator.geolocation) {
        setError("Geolocation is not supported by your browser.");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setFormData((prev) => ({
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

  // Handle form field changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "CategoryId") {
      setFormData((prev) => ({ ...prev, CategoryId: Number(value) }));
      setError(null);
      return;
    }

    if (name === "phoneNumber") {
      // Only digits, max length 10, first digit 6-9
      const onlyNums = value.replace(/\D/g, "");
      if (onlyNums.length <= 10) {
        if (/^[6-9]/.test(onlyNums) || onlyNums.length === 0) {
          setFormData((prev) => ({ ...prev, phoneNumber: onlyNums }));
          setError(null);
        } else {
          setError("Indian phone numbers must start with 6, 7, 8, or 9");
        }
      }
      return;
    }

    if ((name === "latitude" || name === "longitude") && locationMode === "manual") {
      // Validate number input for manual lat/long
      if (/^-?\d*\.?\d*$/.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError(null);
      } else {
        setError(`${name} must be a valid number`);
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image file input change (fallback upload)
  const handleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file && !file.type.startsWith("image/")) {
      setError("Only image files are allowed");
      return;
    }
    setFormData((prev) => {
      const newImgs = [...prev.images];
      newImgs[index] = file;
      return { ...prev, images: newImgs };
    });
    setImagePreviews((prev) => {
      if (prev[index]) {
        URL.revokeObjectURL(prev[index]!);
      }
      const newPrev = [...prev];
      newPrev[index] = file ? URL.createObjectURL(file) : null;
      return newPrev;
    });
  };

  // Handle captured photo from camera
  const handleCameraCapture = (index: number, blob: Blob) => {
    const file = new File([blob], `capture_${Date.now()}.jpg`, { type: blob.type });
    setFormData((prev) => {
      const newImgs = [...prev.images];
      newImgs[index] = file;
      return { ...prev, images: newImgs };
    });
    setImagePreviews((prev) => {
      if (prev[index]) {
        URL.revokeObjectURL(prev[index]!);
      }
      const newPrev = [...prev];
      newPrev[index] = URL.createObjectURL(file);
      return newPrev;
    });
    setError(null);
  };

  // Validate form before submit
  const validate = (): boolean => {
    if (!formData.description.trim()) {
      setError("Description is required");
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
    if (!formData.phoneNumber || formData.phoneNumber.length !== 10) {
      setError("Phone number must be 10 digits");
      return false;
    }
    setError(null);
    return true;
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.latitude && formData.longitude) {
      formData.locationText = `POINT(${formData.longitude} ${formData.latitude})`;
    }

    if (!validate()) return;

    setLoading(true);
    try {
      const imagesToUpload = formData.images.filter((img): img is File => img !== null);
      const payload = { ...formData, images: imagesToUpload };

      const result = await createIssue(payload);
      const newId = result?.id ?? result?.issueId ?? 0;
      const catName = categories.find((c) => c.categoryId === formData.CategoryId)?.name ?? "Unknown";

      setCreatedIssueId(newId);
      setCreatedCategoryName(catName);
      setCreatedDescription(formData.description);

      setModalOpen(true);
    } catch (err) {
      console.error("Error when creating issue:", err);
      setError("Failed to create issue. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Close modal and reset form
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

      <form
        onSubmit={handleSubmit}
        noValidate
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        {/* Category */}
        <label style={labelStyle}>
          <span style={labelTextStyle}>Category:</span>
          <select
            name="CategoryId"
            value={formData.CategoryId}
            onChange={handleChange}
            required
            style={selectStyle}
          >
            <option value={0}>-- Select Category --</option>
            {categories.map((cat) => (
              <option key={cat.categoryId} value={cat.categoryId}>
                {cat.name}
              </option>
            ))}
          </select>
        </label>

        {/* Description */}
        <label style={labelStyle}>
          <span style={labelTextStyle}>Description:</span>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={5}
            placeholder="Describe the issue in detail..."
            style={textareaStyle}
          />
        </label>

        {/* Phone Number */}
        <label style={labelStyle}>
          <span style={labelTextStyle}>Phone Number:</span>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="Enter 10-digit phone number"
            required
            style={inputStyle}
          />
        </label>

        {/* Location Mode */}
        <label style={labelStyle}>
          <span style={labelTextStyle}>Location Input Mode:</span>
          <select
            value={locationMode}
            onChange={(e) => setLocationMode(e.target.value as "manual" | "automatic")}
            style={selectStyle}
          >
            <option value="manual">Manual</option>
            <option value="automatic">Automatic (Geolocation)</option>
          </select>
        </label>

        {/* Latitude & Longitude Inputs for Manual */}
        {locationMode === "manual" && (
          <div style={{ display: "flex", gap: 20 }}>
            <label style={{ flex: 1, ...labelStyle }}>
              <span style={labelTextStyle}>Latitude:</span>
              <input
                type="text"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                required
                placeholder="e.g., 28.6139"
                style={inputStyle}
              />
            </label>

            <label style={{ flex: 1, ...labelStyle }}>
              <span style={labelTextStyle}>Longitude:</span>
              <input
                type="text"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                required
                placeholder="e.g., 77.209"
                style={inputStyle}
              />
            </label>
          </div>
        )}

        {/* Images upload/camera */}
        <div
          style={{
            display: "flex",
            gap: 15,
            justifyContent: "center",
            marginTop: 10,
            marginBottom: 20,
          }}
        >
          {[0, 1, 2].map((idx) => (
            <div
              key={idx}
              style={{
                flex: 1,
                minWidth: 90,
                maxWidth: 110,
                textAlign: "center",
              }}
            >
              {imagePreviews[idx] ? (
                <img
                  src={imagePreviews[idx]!}
                  alt={`preview-${idx}`}
                  style={{
                    width: "100%",
                    height: 100,
                    objectFit: "cover",
                    borderRadius: 8,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    // clear the image on click
                    setFormData((prev) => {
                      const newImgs = [...prev.images];
                      newImgs[idx] = null;
                      return { ...prev, images: newImgs };
                    });
                    setImagePreviews((prev) => {
                      URL.revokeObjectURL(prev[idx]!);
                      const newPrev = [...prev];
                      newPrev[idx] = null;
                      return newPrev;
                    });
                  }}
                  title="Click to remove image"
                />
              ) : (
                <CameraCapture
                  onCapture={(blob) => handleCameraCapture(idx, blob)}
                />
              )}
              {/* Fallback file input */}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(idx, e)}
                style={{ marginTop: 5, width: "100%" }}
              />
            </div>
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div
            style={{
              color: "#ff4d4f",
              fontWeight: "600",
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "14px 28px",
            fontSize: 18,
            fontWeight: "700",
            backgroundColor: loading ? "#8ec1ff" : "#1890ff",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background-color 0.3s ease",
            boxShadow: loading
              ? "none"
              : "0 4px 14px rgba(24, 144, 255, 0.4)",
          }}
        >
          {loading ? "Submitting..." : "Submit Issue"}
        </button>
      </form>

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

const labelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  fontWeight: "600",
  color: "#333",
};

const labelTextStyle: React.CSSProperties = {
  marginBottom: 6,
  fontSize: 14,
};

const inputStyle: React.CSSProperties = {
  padding: "10px 14px",
  fontSize: 15,
  borderRadius: 8,
  border: "1.5px solid #ddd",
  outline: "none",
  transition: "border-color 0.3s ease",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: "pointer",
  appearance: "none",
  backgroundColor: "#fff",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: "vertical",
  minHeight: 90,
};

export default IssuePage;
