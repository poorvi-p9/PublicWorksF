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
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [locationMode, setLocationMode] = useState<"manual" | "automatic">("manual");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [createdIssueId, setCreatedIssueId] = useState(0);
  const [createdCategoryName, setCreatedCategoryName] = useState("");
  const [createdDescription, setCreatedDescription] = useState("");
  const [automaticCoords, setAutomaticCoords] = useState({ latitude: "", longitude: "" });

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
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const lat = latitude.toFixed(7);
          const lng = longitude.toFixed(7);
          setAutomaticCoords({ latitude: lat, longitude: lng });
        },
        () => {
          console.warn("Failed to get automatic location");
        }
      );
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;

    if (name === "phoneNumber") {
      // Remove non-digit characters
      let numeric = value.replace(/\D/g, "");

      // Limit to 10 digits
      if (numeric.length > 10) numeric = numeric.slice(0, 10);

      // If first digit exists, enforce 6-9
      if (numeric.length > 0 && !/^[6-9]/.test(numeric[0])) {
        numeric = ""; // reset if first digit is invalid
      }

      setFormData((prev: any) => ({ ...prev, [name]: numeric }));
      return;
    }

    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const drawLatLongOnImage = async (file: File, lat: string, lng: string): Promise<File> => {
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        ctx.font = `${Math.floor(canvas.width * 0.03)}px Arial`;
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
        const text = `Lat: ${lat}, Lng: ${lng}`;
        const x = 20;
        const y = canvas.height - 30;
        ctx.strokeText(text, x, y);
        ctx.fillText(text, x, y);

        canvas.toBlob((blob) => {
          if (!blob) return;
          const newFile = new File([blob], file.name, { type: "image/jpeg" });
          resolve(newFile);
        }, "image/jpeg");
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed");
      return;
    }
    setError(null);

    // ✅ Use correct coordinates based on mode
    const lat =
      locationMode === "manual" && formData.latitude
        ? formData.latitude
        : automaticCoords.latitude;
    const lng =
      locationMode === "manual" && formData.longitude
        ? formData.longitude
        : automaticCoords.longitude;

    const stampedFile = await drawLatLongOnImage(file, lat, lng);

    setFormData((prev: any) => {
      const newImgs = [...prev.images];
      const emptyIndex = newImgs.findIndex((img) => img === null);
      if (emptyIndex === -1) {
        setError("Maximum 3 images allowed");
        return prev;
      }
      newImgs[emptyIndex] = stampedFile;
      return { ...prev, images: newImgs };
    });

    setImagePreviews((prev) => {
      const newPrev = [...prev];
      const emptyIndex = newPrev.findIndex((img) => img === null);
      if (emptyIndex !== -1) newPrev[emptyIndex] = URL.createObjectURL(stampedFile);
      return newPrev;
    });
  };

  const handleCameraCapture = async (blob: Blob) => {
    const file = new File([blob], `capture_${Date.now()}.jpg`, { type: blob.type });

    // ✅ Use correct coordinates based on mode
    const lat =
      locationMode === "manual" && formData.latitude
        ? formData.latitude
        : automaticCoords.latitude;
    const lng =
      locationMode === "manual" && formData.longitude
        ? formData.longitude
        : automaticCoords.longitude;

    const stampedFile = await drawLatLongOnImage(file, lat, lng);

    setFormData((prev: any) => {
      const newImgs = [...prev.images];
      const emptyIndex = newImgs.findIndex((img) => img === null);
      if (emptyIndex === -1) {
        setError("Maximum 3 images allowed");
        return prev;
      }
      newImgs[emptyIndex] = stampedFile;
      return { ...prev, images: newImgs };
    });

    setImagePreviews((prev) => {
      const newPrev = [...prev];
      const emptyIndex = newPrev.findIndex((img) => img === null);
      if (emptyIndex !== -1) newPrev[emptyIndex] = URL.createObjectURL(stampedFile);
      return newPrev;
    });

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
    if (formData.CategoryId <= 0) {
      setError("Please select a category");
      return false;
    }

    // ✅ Validate based on selected mode
    if (locationMode === "automatic") {
      if (!automaticCoords.latitude || !automaticCoords.longitude) {
        setError("Unable to fetch automatic location. Please allow location access.");
        return false;
      }
    } else {
      if (!formData.latitude || !formData.longitude) {
        setError("Please enter manual latitude and longitude.");
        return false;
      }
    }

    const indianPhoneRegex = /^[6-9]\d{9}$/;
    if (!indianPhoneRegex.test(formData.phoneNumber)) {
      setError("Phone number must be a valid 10-digit Indian number");
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

      // ✅ Correctly send coordinates based on mode
      const lat =
        locationMode === "manual" && formData.latitude
          ? formData.latitude
          : automaticCoords.latitude;
      const lng =
        locationMode === "manual" && formData.longitude
          ? formData.longitude
          : automaticCoords.longitude;

      const payload = {
        ...formData,
        latitude: lat,
        longitude: lng,
        images: imagesToUpload,
      };

      const result = await createIssue(payload, token);
      const newId = result?.id ?? result?.issueId ?? 0;
      const catIdFromResponse = result?.categoryId ?? formData.CategoryId;
      const catName =
        categories.find((c) => c.categoryId === Number(catIdFromResponse))?.name ?? "Unknown";

      setCreatedIssueId(newId);
      setCreatedCategoryName(catName);
      setCreatedDescription(formData.description);
      setModalOpen(true);
    } catch (err) {
      console.error(err);
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
        {/* ✅ Phone Number */}
        <label className="label">
          <span className="label-text">Phone Number:</span>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="Enter 10-digit Indian phone number"
            className="input"
            pattern="^[6-9]\d{9}$"
            maxLength={10}
            required
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

        {/* Location Input Mode */}
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

        {/* Latitude & Longitude */}
        <div className="lat-lng-container">
          <label className="label">
            <span className="label-text">Latitude:</span>
            <input
              type="text"
              name="latitude"
              value={locationMode === "manual" ? formData.latitude : automaticCoords.latitude}
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
              value={locationMode === "manual" ? formData.longitude : automaticCoords.longitude}
              onChange={handleChange}
              className="input"
              readOnly={locationMode === "automatic"}
            />
          </label>
        </div>

        {/* Images */}
        <div className="images-section">
          <h3>Attach Images (Max 3)</h3>
          <div className="button-group">
            <button
              type="button"
              style={{ marginRight: "400px", marginTop: "90px" }}
              className="camera-button"
              onClick={handleCameraOpen}
            >
              📷 Open Camera
            </button>
            <label className="file-button">
              📁 Select from File
              <input type="file" accept="image/*" onChange={handleFileUpload} hidden />
            </label>
          </div>

          <div className="images-container">
            {imagePreviews.map((preview, idx) => (
              <div key={idx} className="image-slot">
                {preview ? (
                  <img src={preview} alt={`preview-${idx}`} className="image-preview" />
                ) : (
                  <div className="image-empty">Empty Slot</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Camera Capture */}
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

      {/* Preview Modal */}
      <PreviewModal
        isOpen={previewOpen}
        formData={formData}
        imagePreviews={imagePreviews}
        categoryName={previewCategoryName}
        imageCoords={
          locationMode === "manual"
            ? { latitude: formData.latitude, longitude: formData.longitude }
            : automaticCoords
        }
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