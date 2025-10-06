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
      const result = await createIssue(payload);
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

  // ✅ derive category name dynamically for preview
  const previewCategoryName = categories.find(
    (c) => c.categoryId === Number(formData.CategoryId)
  )?.name ?? "Unknown";

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
            pattern="[6-9][0-9]{9}"
            title="Enter valid Indian phone number (10 digits, starting with 6-9)"
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
