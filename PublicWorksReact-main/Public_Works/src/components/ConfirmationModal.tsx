import React from "react";
import "./ConfirmationModal.css";

interface ConfirmationModalProps {
  isOpen: boolean;
  issueId: number;
  categoryName: string;
  description: string;
  onClose: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, issueId, categoryName, description, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2 className="modal-success">✅ Issue Created Successfully!</h2>
        <p><strong>Issue ID:</strong> {issueId}</p>
        <p><strong>Category:</strong> {categoryName}</p>
        <p><strong>Description:</strong> {description}</p>
        <button onClick={onClose} className="modal-button confirm">Close</button>
      </div>
    </div>
  );
};

export default ConfirmationModal;
