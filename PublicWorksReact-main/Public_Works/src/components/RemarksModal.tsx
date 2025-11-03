import React, { useState, useEffect } from "react";
import { getAuthToken } from "../utils/auth";

interface Remark {
  remarkId: number;
  issueId: number;
  remarkText: string;
  remarkedAt: string;
  remarkedByUserId: number;
  isAdmin?: boolean; // optional flag for Admin remark
}

interface RemarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  issueId: number;
  userId: number; // ID of the user adding the remark
  adminEmail: string;
}

export const RemarksModal: React.FC<RemarksModalProps> = ({
  isOpen,
  onClose,
  issueId,
  userId,
  adminEmail
}) => {
  const [remarks, setRemarks] = useState<Remark[]>([]);
  const [newRemark, setNewRemark] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingRemarks, setLoadingRemarks] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && issueId) loadRemarks();
  }, [isOpen, issueId]);

  const loadRemarks = async () => {
    setLoadingRemarks(true);
    try {
      const token = getAuthToken() || '';
      const response = await fetch(`http://localhost:5142/api/Remark/issue/${issueId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to load remarks');
      const data = await response.json();
      setRemarks(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoadingRemarks(false);
    }
  };

  const handleSave = async () => {
    if (!newRemark.trim()) {
      setError('Please enter your remark');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const token = getAuthToken() || '';
      const payload = {
        issueId: issueId,
        remarkedByUserId: userId,
        remarkText: newRemark,
        remarkedAt: new Date().toISOString()
      };
      console.log('Saving remark with payload:', payload);

      const response = await fetch('http://localhost:5142/api/Remark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`Failed to save remark: ${response.status}`);
      setSuccess(true);
      setNewRemark('');
      await loadRemarks();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRemarks([]);
    setNewRemark('');
    setError('');
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
      backdropFilter: 'blur(5px)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '720px',
        maxHeight: '90vh',
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 35px 60px rgba(0,0,0,0.3)',
        fontFamily: 'Inter, sans-serif',
        border: '1px solid #e5e7eb'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '28px 32px',
          background: 'linear-gradient(135deg, #4f46e5, #3b82f6)',
          color: 'white'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '26px', fontWeight: 700, letterSpacing: '0.5px' }}>Admin Remarks</h2>
            <p style={{ margin: '6px 0 0 0', fontSize: '14px', color: '#c7d2fe' }}>Issue #{issueId}</p>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              fontSize: '24px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.35)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px 32px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Success/Error */}
          {success && <div style={{
            backgroundColor: '#d1fae5',
            color: '#065f46',
            borderRadius: '14px',
            padding: '14px 18px',
            marginBottom: '18px',
            textAlign: 'center',
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(6,95,70,0.2)'
          }}>✓ Remark saved successfully!</div>}
          {error && <div style={{
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            borderRadius: '14px',
            padding: '14px 18px',
            marginBottom: '18px',
            textAlign: 'center',
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(185,28,28,0.2)'
          }}>⚠ {error}</div>}

          {/* Remarks List */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            paddingRight: '6px'
          }}>
            {loadingRemarks ? (
              <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px', padding: '20px' }}>Loading remarks...</div>
            ) : (
              remarks.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>No remarks yet.</p>
              ) : (
                remarks.map(r => (
                  <div key={r.remarkId} style={{
                    maxWidth: '75%',
                    alignSelf: r.isAdmin ? 'flex-end' : 'flex-start',
                    backgroundColor: r.isAdmin ? '#4f46e5' : '#f3f4f6',
                    color: r.isAdmin ? 'white' : '#111827',
                    borderRadius: '20px',
                    padding: '16px 20px',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
                    fontSize: '14px',
                    wordBreak: 'break-word',
                    transition: 'transform 0.2s',
                    cursor: 'default'
                  }}>
                    <div>{r.remarkText}</div>
                    <div style={{ fontSize: '12px', marginTop: '6px', color: r.isAdmin ? '#c7d2fe' : '#6b7280' }}>
                      By User #{r.remarkedByUserId} at {new Date(r.remarkedAt).toLocaleString()}
                    </div>
                  </div>
                ))
              )
            )}
          </div>

          {/* Add Remark */}
          <div style={{ marginTop: '22px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>Add a Remark</label>
            <textarea
              value={newRemark}
              onChange={(e) => setNewRemark(e.target.value)}
              rows={4}
              placeholder="Write your remark here..."
              style={{
                width: '100%',
                padding: '14px 18px',
                fontSize: '14px',
                borderRadius: '16px',
                border: '1px solid #d1d5db',
                resize: 'vertical',
                outline: 'none',
                boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.05)',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#4f46e5'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '14px', marginTop: '24px' }}>
            <button
              onClick={handleClose}
              disabled={loading}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: '16px',
                border: '1px solid #d1d5db',
                backgroundColor: '#ffffff',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                color: '#374151'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: '16px',
                border: 'none',
                background: 'linear-gradient(135deg, #4f46e5, #3b82f6)',
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 6px 18px rgba(63,81,181,0.3)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
              onMouseLeave={(e) => e.currentTarget.style.filter = 'brightness(1)'}
            >
              {loading ? 'Saving...' : 'Save Remark'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemarksModal;
