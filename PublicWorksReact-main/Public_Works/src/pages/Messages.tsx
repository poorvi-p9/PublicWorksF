import { useState } from 'react';

type MessageModalProps = {
  isOpen: boolean;
  onClose: () => void;
  issueId: number | string;
  userId: number | string;
  adminEmail: string;
};

const MessageModal = ({ isOpen, onClose, issueId, userId, adminEmail }: MessageModalProps) => {
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
      // First, fetch the user's email from the database
      const userResponse = await fetch(`http://localhost:5000/api/User/${userId}`);
      if (!userResponse.ok) {
        throw new Error('Failed to fetch user details');
      }
      const userData = await userResponse.json();
      const userEmail = userData.email;

      // Fetch admin details to get admin ID
      const adminResponse = await fetch(`http://localhost:5000/api/User/email/${adminEmail}`);
      if (!adminResponse.ok) {
        throw new Error('Failed to fetch admin details');
      }
      const adminData = await adminResponse.json();
      const adminId = adminData.id;

      const messageData = {
        id: 0,
        issueId: parseInt(issueId) || 0,
        sendBy: adminId,
        sendTo: parseInt(userId) || 0,
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
      
      // Reset form and close modal after 2 seconds
      setTimeout(() => {
        setFormData({ subject: '', body: '' });
        setSuccess(false);
        onClose();
      }, 2000);

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
                onChange={handleChange}
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
                onChange={handleChange}
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

// Remarks Modal Component
const RemarksModal = ({ isOpen, onClose, issueId, adminEmail }) => {
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [existingRemarks, setExistingRemarks] = useState('');
  const [loadingRemarks, setLoadingRemarks] = useState(false);

  // Load existing remarks when modal opens
  useState(() => {
    if (isOpen && issueId) {
      loadExistingRemarks();
    }
  }, [isOpen, issueId]);

  const loadExistingRemarks = async () => {
    setLoadingRemarks(true);
    try {
      const response = await fetch(`http://localhost:5000/api/Issue/${issueId}`);
      if (response.ok) {
        const issue = await response.json();
        if (issue.adminRemarks) {
          setExistingRemarks(issue.adminRemarks);
          setRemarks(issue.adminRemarks);
        }
      }
    } catch (err) {
      console.error('Failed to load existing remarks:', err);
    } finally {
      setLoadingRemarks(false);
    }
  };

  const handleSave = async () => {
    if (!remarks.trim()) {
      setError('Please enter your remarks');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Update the issue with admin remarks
      const response = await fetch(`http://localhost:5000/api/Issue/${issueId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminRemarks: remarks,
          remarksDate: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to save remarks: ${response.status}`);
      }

      setSuccess(true);
      
      // Close modal after 1.5 seconds
      setTimeout(() => {
        setRemarks('');
        setSuccess(false);
        onClose();
      }, 1500);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRemarks('');
    setError('');
    setSuccess(false);
    setExistingRemarks('');
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
              Admin Remarks
            </h2>
            <p style={{
              margin: '4px 0 0 0',
              color: '#6b7280',
              fontSize: '14px'
            }}>
              Add your thoughts for Issue #{issueId}
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
              <span>Remarks saved successfully!</span>
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

          {loadingRemarks ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              Loading existing remarks...
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Your Remarks <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={10}
                  placeholder="Enter your thoughts, observations, or notes about this issue..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    lineHeight: '1.6'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
                <p style={{
                  marginTop: '6px',
                  fontSize: '12px',
                  color: '#6b7280'
                }}>
                  These remarks are for internal use and can help track issue resolution progress.
                </p>
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
                  onClick={handleSave}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    background: loading ? '#9ca3af' : 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: loading ? 'none' : '0 2px 4px rgba(30, 58, 138, 0.2)'
                  }}
                  onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-1px)')}
                  onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  {loading ? 'Saving...' : 'Save Remarks'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Example usage in Admin Dashboard
const AdminDashboardExample = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRemarksModalOpen, setIsRemarksModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);

  // Mock data - replace with your actual data
  const adminEmail = 'admin@example.com'; // Get from your auth context
  const issue = {
    issueId: 123,
    userId: 456,
    title: 'Sample Issue'
  };

  const handleMessageClick = (issue) => {
    setSelectedIssue(issue);
    setIsModalOpen(true);
  };

  const handleRemarksClick = (issue) => {
    setSelectedIssue(issue);
    setIsRemarksModalOpen(true);
  };

  const btnStyle = {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    color: 'white',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontSize: '14px'
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <h1 style={{ marginBottom: '30px', color: '#111827' }}>Admin Dashboard Example</h1>
      
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <p style={{ marginBottom: '15px', color: '#374151' }}>
          <strong>Issue #{issue.issueId}</strong> - User ID: {issue.userId}
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            style={{
              ...btnStyle,
              background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            onClick={() => handleMessageClick(issue)}
          >
            Message
          </button>
          <button
            style={{
              ...btnStyle,
              background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            onClick={() => handleRemarksClick(issue)}
          >
            Remarks
          </button>
        </div>
      </div>

      <MessageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        issueId={selectedIssue?.issueId}
        userId={selectedIssue?.userId}
        adminEmail={adminEmail}
      />

      <RemarksModal
        isOpen={isRemarksModalOpen}
        onClose={() => setIsRemarksModalOpen(false)}
        issueId={selectedIssue?.issueId}
        adminEmail={adminEmail}
      />
    </div>
  );
};

export default AdminDashboardExample;