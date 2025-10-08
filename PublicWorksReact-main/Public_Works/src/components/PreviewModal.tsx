import React from "react";
import "./PreviewModal.css";

interface PreviewModalProps {
  isOpen: boolean;
  formData: any;
  imagePreviews: (string | null)[];
  categoryName: string;
  imageCoords: { latitude: string; longitude: string }; // new prop
  onCancel: () => void;
  onConfirm: () => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  formData,
  imagePreviews,
  categoryName,
  imageCoords,
  onCancel,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>Preview Issue Details</h2>
        <p>
          <strong>Phone Number:</strong> {formData.phoneNumber}
        </p>
        <p>
          <strong>Category:</strong> {categoryName}
        </p>
        <p>
          <strong>Latitude (Image):</strong> {imageCoords.latitude}
        </p>
        <p>
          <strong>Longitude (Image):</strong> {imageCoords.longitude}
        </p>
        <p>
          <strong>Description:</strong> {formData.description}
        </p>

        <div className="modal-images">
          {imagePreviews.map((img, idx) =>
            img ? (
              <div key={idx} className="image-with-geo">
                <img src={img} alt={`preview-${idx}`} className="preview-image" />
                <div className="geo-overlay">
                  Lat: {imageCoords.latitude}, Lng: {imageCoords.longitude}
                </div>
              </div>
            ) : null
          )}
        </div>

        <div className="modal-buttons">
          <button onClick={onCancel} className="modal-button cancel">
            Cancel
          </button>
          <button onClick={onConfirm} className="modal-button confirm">
            Create Issue
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
