import { useState, useEffect } from 'react';

const SendMessage = () => {
  // Get issueId from URL parameters if passed
  const urlParams = new URLSearchParams(window.location.search);
  const issueIdFromUrl = urlParams.get('issueId');

  const [formData, setFormData] = useState({
    issueId: issueIdFromUrl || '',
    sendBy: '',
    sendTo: '',
    subject: '',
    body: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const messageData = {
        id: 0,
        issueId: parseInt(formData.issueId) || 0,
        sendBy: parseInt(formData.sendBy) || 0,
        sendTo: parseInt(formData.sendTo) || 0,
        subject: formData.subject,
        body: formData.body,
        sendDate: new Date().toISOString()
      };

      console.log('Sending message:', messageData);

      const response = await fetch('http://localhost:5000/api/Message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData)
      });

      if (!response.ok) {
        throw new Error(`Failed: ${response.status}`);
      }

      await response.json();
      setSuccess(true);
      
      setFormData({
        issueId: '',
        sendBy: '',
        sendTo: '',
        subject: '',
        body: ''
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '40px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '24px 32px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h1 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: '600',
            color: '#111827'
          }}>
            Send Message
          </h1>
          <p style={{
            margin: '4px 0 0 0',
            color: '#6b7280',
            fontSize: '14px'
          }}>
            Compose and send a new message
          </p>
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
              fontSize: '14px'
            }}>
              Message sent successfully!
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
              fontSize: '14px'
            }}>
              Error: {error}
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
                Issue ID <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="number"
                name="issueId"
                value={formData.issueId}
                onChange={handleChange}
                required
                placeholder="Enter issue ID"
                disabled={!!issueIdFromUrl}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                  backgroundColor: issueIdFromUrl ? '#f9fafb' : 'white',
                  cursor: issueIdFromUrl ? 'not-allowed' : 'text'
                }}
                onFocus={(e) => !issueIdFromUrl && (e.target.style.borderColor = '#3b82f6')}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
              {issueIdFromUrl && (
                <p style={{
                  marginTop: '4px',
                  fontSize: '12px',
                  color: '#6b7280'
                }}>
                  Issue ID is set from the selected issue
                </p>
              )}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Send By (User ID) <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="number"
                name="sendBy"
                value={formData.sendBy}
                onChange={handleChange}
                required
                placeholder="Enter sender user ID"
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

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151'
              }}>
                Send To (User ID) <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="number"
                name="sendTo"
                value={formData.sendTo}
                onChange={handleChange}
                required
                placeholder="Enter recipient user ID"
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
                onChange={handleChange}
                required
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
                Message Body <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <textarea
                name="body"
                value={formData.body}
                onChange={handleChange}
                required
                rows={6}
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
                onClick={() => {
                  setFormData({ issueId: '', sendBy: '', sendTo: '', subject: '', body: '' });
                  setError('');
                  setSuccess(false);
                }}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  backgroundColor: 'white',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s',
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
                  padding: '10px 16px',
                  backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#2563eb')}
                onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#3b82f6')}
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

export default SendMessage;