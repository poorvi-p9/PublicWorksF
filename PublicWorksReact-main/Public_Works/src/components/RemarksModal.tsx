import React, { useState, useEffect } from "react";
import { getAuthToken } from "../utils/auth";

interface RemarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  issueId: number;
  adminEmail: string;
}

  // Remarks Modal Component
    export const RemarksModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    issueId: number;
    adminEmail: string;
    }> = ({ isOpen, onClose, issueId, adminEmail }) => {
    const [remarks, setRemarks] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loadingRemarks, setLoadingRemarks] = useState(false);

    useEffect(() => {
        if (isOpen && issueId) {
        loadExistingRemarks();
        }
    }, [isOpen, issueId]);

    const loadExistingRemarks = async () => {
        setLoadingRemarks(true);
        try {
        const token = getAuthToken() || "";
        const response = await fetch(`http://localhost:5142/api/Issue/${issueId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
            const issue = await response.json();
            if (issue.adminRemarks) {
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
        const token = getAuthToken() || "";
    
        const newRemark = {
        issueId: issueId,
        remarkText: remarks,       // text from modal
        RemarkedByUserId: 6,   // admin's user id
        remarkAt: new Date().toISOString()
        };

        const response = await fetch('http://localhost:5142/api/Remark', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newRemark)
        });

        if (!response.ok) {
            throw new Error(`Failed to save remarks: ${response.status}`);
        }

        setSuccess(true);
        
        setTimeout(() => {
            setRemarks('');
            setSuccess(false);
            onClose();
        }, 1500);

        } catch (err: any) {
        setError(err.message);
        } finally {
        setLoading(false);
        }
    };

    const handleClose = () => {
        setRemarks('');
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

export default RemarksModal;