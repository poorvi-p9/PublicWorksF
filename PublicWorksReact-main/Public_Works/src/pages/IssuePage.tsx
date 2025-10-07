import React, { useState, useEffect } from "react";
import CameraCapture from "../components/CameraCapture";
import PreviewModal from "../components/PreviewModal";
import ConfirmationModal from "../components/ConfirmationModal";
import { getCategories, createIssue } from "../services/issueService";
import { getAuthToken } from "../utils/auth";
import type { Category } from "../types/issue";
import "./IssuePage.css";

const IssuePage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<any>({
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
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null); // Track camera stream

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed");
      return;
    }

    setError(null);
    setFormData((prev: any) => {
      const newImgs = [...prev.images];
      const emptyIndex = newImgs.findIndex((img) => img === null);
      if (emptyIndex === -1) {
        setError("Maximum 3 images allowed");
        return prev;
      }
      newImgs[emptyIndex] = file;
      return { ...prev, images: newImgs };
    });

    setImagePreviews((prev) => {
      const newPrev = [...prev];
      const emptyIndex = newPrev.findIndex((img) => img === null);
      if (emptyIndex !== -1) newPrev[emptyIndex] = URL.createObjectURL(file);
      return newPrev;
    });
  };

  const handleCameraCapture = (blob: Blob) => {
    const file = new File([blob], `capture_${Date.now()}.jpg`, { type: blob.type });
    setFormData((prev: any) => {
      const newImgs = [...prev.images];
      const emptyIndex = newImgs.findIndex((img) => img === null);
      if (emptyIndex === -1) {
        setError("Maximum 3 images allowed");
        return prev;
      }
      newImgs[emptyIndex] = file;
      return { ...prev, images: newImgs };
    });

    setImagePreviews((prev) => {
      const newPrev = [...prev];
      const emptyIndex = newPrev.findIndex((img) => img === null);
      if (emptyIndex !== -1) newPrev[emptyIndex] = URL.createObjectURL(file);
      return newPrev;
    });

    // Stop camera after capture
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  const handleCameraOpen = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      setShowCamera(true);
    } catch {
      setError("Unable to access camera");
    }
  };

  const handleCancelCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
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
      const result = await createIssue(payload);
      const newId = result?.id ?? result?.issueId ?? 0;

      const catIdFromResponse = result?.categoryId ?? formData.CategoryId;
      const catName =
        categories.find((c) => c.categoryId === Number(catIdFromResponse))?.name ?? "Unknown";

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

  const previewCategoryName =
    categories.find((c) => c.categoryId === Number(formData.CategoryId))?.name ?? "Unknown";

  return (
    <div className="issue-page-container">
      <h1>Create Issue</h1>
      <form onSubmit={handlePreview} className="issue-form">
        {/* Phone */}
        <label className="label">
          <span className="label-text">Phone Number:</span>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={(e) => {
              let val = e.target.value.replace(/\D/g, "");
              if (val.length > 10) val = val.slice(0, 10);
              if (val.length > 0 && !/^[6-9]/.test(val[0])) {
                setError("Indian phone number must start with 6, 7, 8, or 9");
                val = "";
              } else {
                setError(null);
              }
              setFormData((prev: any) => ({ ...prev, phoneNumber: val }));
            }}
            placeholder="Enter 10-digit Indian phone number"
            className="input"
          />
        </label>

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
            />
          </label>
        </div>

        {/* Images Section */}
        <div className="images-section">
          <h3>Attach Images (Max 3)</h3>
          <div className="button-group">
            <button type="button" style={{ marginRight: "400px",marginTop:"90px" }} className="camera-button" onClick={handleCameraOpen}>
              📷 Open Camera
            </button>
            <label className="file-button">
              📁 Select from File
              <input type="file" accept="image/*" onChange={handleFileUpload} hidden />
            </label>
          </div>

          {/* Preview Slots */}
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
              </div>
            ))}
          </div>
        </div>

        {/* Show Camera */}
        {showCamera && cameraStream && (
          <div className="camera-capture-container">
            <CameraCapture stream={cameraStream} onCapture={handleCameraCapture} />
            <button type="button" className="cancel-camera" onClick={handleCancelCamera}>
              Cancel Camera
            </button>
          </div>
        )}

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

      <PreviewModal
        isOpen={previewOpen}
        formData={formData}
        imagePreviews={imagePreviews}
        categoryName={previewCategoryName}
        onCancel={() => setPreviewOpen(false)}
        onConfirm={handleSubmit}
      />

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
