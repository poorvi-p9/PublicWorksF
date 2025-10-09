import React, { useState } from "react";
import { getAuthToken } from "../utils/auth";

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  issueId: number;
  userId: number;
  adminEmail: string;
}

  // Message Modal Component
  const MessageModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    issueId: number;
    userId: number;
    adminEmail: string;
  }> = ({ isOpen, onClose, issueId, userId, adminEmail }) => {
    const [formData, setFormData] = useState({
      subject: '',
      body: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async () => {
      if (!formData.subject.trim() || !formData.body.trim()) {
        setError('Please fill in all required fields');
        return;
      }

      setLoading(true);
      setError('');
      setSuccess(false);

      try {
        const token = getAuthToken() || "";

     const messageData = {
        messageId: 0,                  // if your backend auto-generates, can be omitted
        issueId: parseInt(String(issueId)) || null,
        SentByUserId: 6,               // numeric admin UserId
        SentToUserId: parseInt(String(userId)) || null, // numeric recipient UserId
        Subject: formData.subject,
        Body: formData.body,
        SentAt: new Date().toISOString()
        };
        
        const response = await fetch('http://localhost:5142/api/Message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(messageData)
        });

        if (!response.ok) {
          throw new Error(`Failed: ${response.status}`);
        }

        setSuccess(true);
        
        setTimeout(() => {
          setFormData({ subject: '', body: '' });
          setSuccess(false);
          onClose();
        }, 2000);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const handleClose = () => {
      setFormData({ subject: '', body: '' });
      setError('');
      setSuccess(false);
      onClose();
    };

    if (!isOpen) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          <div style={{
            padding: '24px 32px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h2 style={{
                margin: 0,
                fontSize: '24px',
                fontWeight: '600',
                color: '#111827'
              }}>
                Send Message
              </h2>
              <p style={{
                margin: '4px 0 0 0',
                color: '#6b7280',
                fontSize: '14px'
              }}>
                Compose a message for Issue #{issueId}
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                color: '#6b7280',
                cursor: loading ? 'not-allowed' : 'pointer',
                padding: '0',
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#f3f4f6')}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              ×
            </button>
          </div>

          <div style={{ padding: '32px' }}>
            {success && (
              <div style={{
                padding: '12px 16px',
                backgroundColor: '#f0fdf4',
                color: '#166534',
                border: '1px solid #bbf7d0',
                borderRadius: '6px',
                marginBottom: '24px',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>✓</span>
                <span>Message sent successfully!</span>
              </div>
            )}

            {error && (
              <div style={{
                padding: '12px 16px',
                backgroundColor: '#fef2f2',
                color: '#991b1b',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                marginBottom: '24px',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>⚠</span>
                <span>Error: {error}</span>
              </div>
            )}

            <div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Subject <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Enter message subject"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Message <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <textarea
                  name="body"
                  value={formData.body}
                  onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                  rows={8}
                  placeholder="Enter your message here..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    lineHeight: '1.5'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                paddingTop: '8px'
              }}>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    backgroundColor: 'white',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    opacity: loading ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#f9fafb')}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    background: loading ? '#9ca3af' : 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: loading ? 'none' : '0 2px 4px rgba(185, 28, 28, 0.2)'
                  }}
                  onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-1px)')}
                  onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
export default MessageModal;