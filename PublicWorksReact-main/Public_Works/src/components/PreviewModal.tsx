import React from "react";
import "./PreviewModal.css";

interface PreviewModalProps {
  isOpen: boolean;
  formData: any;
  imagePreviews: (string | null)[];
  categoryName: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  formData,
  imagePreviews,
  categoryName,
  onCancel,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>Preview Issue Details</h2>
        <p><strong>Phone Number:</strong> {formData.phoneNumber}</p>
        <p><strong>Category:</strong> {categoryName}</p>
        <p><strong>Latitude:</strong> {formData.latitude}</p>
        <p><strong>Longitude:</strong> {formData.longitude}</p>
        <p><strong>Description:</strong> {formData.description}</p>

        <div className="modal-images">
          {imagePreviews.map((img, idx) =>
            img ? <img key={idx} src={img} alt={`preview-${idx}`} /> : null
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
