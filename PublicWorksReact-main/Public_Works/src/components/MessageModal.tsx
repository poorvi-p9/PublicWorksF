import React, { useState } from "react";
import { getAuthToken } from "../utils/auth";

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientEmail: string;
  recipientName?: string;
  issueId?: number;
}

export const EmailModal: React.FC<EmailModalProps> = ({
  isOpen,
  onClose,
  recipientEmail,
  recipientName,
  issueId
}) => {
  const [formData, setFormData] = useState({
    subject: issueId ? `Regarding Issue #${issueId}` : '',
    body: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    // Validate recipient email
    if (!recipientEmail || !recipientEmail.trim()) {
      setError('Recipient email is missing. Please close and try again.');
      return;
    }

    if (!formData.subject.trim() || !formData.body.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const token = getAuthToken() || "";

      const emailData = {
        toEmail: recipientEmail.trim(),
        subject: formData.subject.trim(),
        body: formData.body.trim()
      };

      console.log('Sending email with data:', emailData);

      const response = await fetch('http://localhost:5142/api/Email/SendToUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(emailData)
      });

      const responseText = await response.text();
      console.log('Response:', responseText);

      if (!response.ok) {
        throw new Error(responseText || `Failed: ${response.status}`);
      }

      setSuccess(true);
      setFormData({ subject: issueId ? `Regarding Issue #${issueId}` : '', body: '' });
      
      setTimeout(() => {
        setSuccess(false);
        handleClose();
      }, 2000);

    } catch (err: any) {
      console.error('Email send error:', err);
      setError(err.message || 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ subject: issueId ? `Regarding Issue #${issueId}` : '', body: '' });
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
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '2px solid #e5e7eb'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
              Send Email
            </h2>
            <p style={{ 
              margin: '4px 0 0 0', 
              fontSize: '14px', 
              color: !recipientEmail || recipientEmail?.trim() === '' ? '#dc2626' : '#6b7280',
              fontWeight: !recipientEmail || !recipientEmail.trim() ? '600' : 'normal'
            }}>
              To: {!recipientEmail || !recipientEmail.trim() 
                ? '⚠️ No email address provided' 
                : (recipientName ? `${recipientName} (${recipientEmail})` : recipientEmail)}
            </p>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '0',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        {/* Form */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {error && (
            <div style={{
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '16px',
              fontSize: '14px',
              border: '1px solid #fecaca'
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              backgroundColor: '#d1fae5',
              color: '#065f46',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '16px',
              fontSize: '14px',
              border: '1px solid #a7f3d0'
            }}>
              ✓ Email sent successfully!
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontWeight: '500',
              color: '#374151',
              fontSize: '14px'
            }}>
              Subject *
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Enter email subject"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#dc2626'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontWeight: '500',
              color: '#374151',
              fontSize: '14px'
            }}>
              Message *
            </label>
            <textarea
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              placeholder="Enter your email message"
              rows={8}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                resize: 'vertical',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#dc2626'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
            />
          </div>
        </div>

        {/* Footer Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
          borderTop: '1px solid #e5e7eb',
          paddingTop: '16px'
        }}>
          <button
            onClick={handleClose}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f3f4f6',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '500',
              color: '#374151',
              fontSize: '14px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#e5e7eb')}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#f3f4f6')}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: '10px 20px',
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '500',
              fontSize: '14px',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: loading ? 'none' : '0 2px 4px rgba(185, 28, 28, 0.2)'
            }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
          >
            {loading ? 'Sending...' : 'Send Email'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailModal;