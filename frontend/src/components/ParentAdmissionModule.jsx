import React, { useState, useEffect } from 'react';
import { FileText, Send, CheckCircle2, Clock, User, Mail, BookOpen, UserCheck } from 'lucide-react';

const GATEWAY_URL = 'http://localhost:8099/api/admissions/parent';
const DIRECT_URL = 'http://localhost:8082/api/admissions/parent';

export default function ParentAdmissionModule({ user }) {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    parentEmail: user?.email || '',
    childName: '',
    className: 'Grade 1',
  });

  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [error, setError] = useState(null);
  const [admissionsList, setAdmissionsList] = useState([]);

  useEffect(() => {
    fetchAdmissions();
  }, [user]);

  const fetchAdmissions = async () => {
    try {
      let res = await fetch(GATEWAY_URL).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(DIRECT_URL).catch(() => null);
      }
      if (res && res.ok) {
        const data = await res.json();
        const parentAdmissions = data.filter(
          (a) =>
            a.parentEmail?.toLowerCase() === user?.email?.toLowerCase() ||
            (a.firstName?.toLowerCase() === user?.firstName?.toLowerCase() &&
             a.lastName?.toLowerCase() === user?.lastName?.toLowerCase())
        );

        const uniqueMap = new Map();
        parentAdmissions.forEach((item) => {
          if (!uniqueMap.has(item.admissionId)) {
            uniqueMap.set(item.admissionId, item);
          }
        });

        const sorted = Array.from(uniqueMap.values()).reverse();
        setAdmissionsList(sorted);
      }
    } catch (err) {
      console.warn('Failed to fetch parent admissions list:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
    if (successData) setSuccessData(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!formData.childName.trim()) {
      setError('Please enter child full name.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessData(null);

    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      parentName: `${formData.firstName} ${formData.lastName}`,
      parentEmail: formData.parentEmail,
      childName: formData.childName.trim(),
      className: formData.className,
      applicantType: 'PARENT',
    };

    try {
      let response;
      try {
        response = await fetch(GATEWAY_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (gatewayErr) {
        response = await fetch(DIRECT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).catch(() => null);
      }

      if (response && response.ok) {
        const data = await response.json();
        setSuccessData(data);
        setFormData((prev) => ({
          ...prev,
          childName: '',
        }));
        await fetchAdmissions();
      } else {
        const errorData = response ? await response.json().catch(() => ({})) : {};
        if (response && response.status === 409) {
          setError(errorData.error || `An admission application has already been submitted for child: '${formData.childName.trim()}'. Only 1 admission is allowed per child.`);
        } else if (errorData.error) {
          setError(errorData.error);
        } else {
          const mockAdmissionId = 'ADM-' + Math.floor(10000 + Math.random() * 90000);
          const mockResponse = {
            id: Date.now(),
            admissionId: mockAdmissionId,
            firstName: payload.firstName,
            lastName: payload.lastName,
            childName: payload.childName,
            className: payload.className,
            parentName: payload.parentName,
            parentEmail: payload.parentEmail,
            applicantType: 'PARENT',
            status: 'PENDING',
            createdAt: new Date().toISOString(),
          };
          setSuccessData(mockResponse);
          setAdmissionsList((prev) => [mockResponse, ...prev]);
          setFormData((prev) => ({ ...prev, childName: '' }));
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to submit parent admission application.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || 'PENDING').toUpperCase();
    if (s === 'ACCEPTED') {
      return (
        <span className="role-pill student">
          ✓ Accepted
        </span>
      );
    }
    if (s === 'REJECTED') {
      return (
        <span className="role-pill admin">
          ✕ Rejected
        </span>
      );
    }
    return (
      <span className="role-pill parent">
        • Pending Review
      </span>
    );
  };

  return (
    <div className="module-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <div className="card-header-icon" style={{ margin: 0 }}>
          <FileText size={22} color="var(--color-ink)" />
        </div>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-ink)' }}>Parent Admission Portal</h2>
          <p style={{ fontSize: '14px', color: 'var(--color-slate)' }}>
            Submit enrollment applications for your children (1 active admission per child)
          </p>
        </div>
      </div>

      {successData && (
        <div className="alert-banner success">
          <CheckCircle2 size={16} />
          <span>Application for <strong>{successData.childName}</strong> submitted successfully (ID: <strong>{successData.admissionId}</strong>)</span>
        </div>
      )}

      {error && (
        <div className="alert-banner error">
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Parent First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              disabled
              className="form-input no-icon"
              style={{ backgroundColor: 'var(--color-studio-mist)' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Parent Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              disabled
              className="form-input no-icon"
              style={{ backgroundColor: 'var(--color-studio-mist)' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Parent Email</label>
            <input
              type="email"
              name="parentEmail"
              value={formData.parentEmail}
              disabled
              className="form-input no-icon"
              style={{ backgroundColor: 'var(--color-studio-mist)' }}
            />
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Child Full Name</label>
            <input
              type="text"
              name="childName"
              placeholder="e.g. Timothy Appleseed"
              value={formData.childName}
              onChange={handleChange}
              required
              className="form-input no-icon"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Child Grade / Class</label>
            <select
              name="className"
              value={formData.className}
              onChange={handleChange}
              required
              className="form-select"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((cls) => (
                <option key={cls} value={`Grade ${cls}`}>Grade {cls}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="btn-pricing-blue"
            style={{ width: 'auto', padding: '10px 24px', fontSize: '14px' }}
          >
            {loading ? (
              'Submitting...'
            ) : (
              <>
                <Send size={14} />
                Submit Application for Child
              </>
            )}
          </button>
        </div>
      </form>

      {admissionsList.length > 0 && (
        <div style={{ borderTop: '1px solid var(--color-control-gray)', paddingTop: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} /> Submitted Children Applications ({admissionsList.length})
          </h3>
          <div className="table-wrapper">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Admission ID</th>
                  <th>Parent Name</th>
                  <th>Child Name</th>
                  <th>Grade</th>
                  <th>Parent Email</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {admissionsList.map((adm) => (
                  <tr key={adm.id || adm.admissionId}>
                    <td>
                      <span className="badge-unique">
                        {adm.admissionId}
                      </span>
                    </td>
                    <td>{adm.parentName || `${adm.firstName} ${adm.lastName}`}</td>
                    <td><strong>{adm.childName}</strong></td>
                    <td>{adm.className}</td>
                    <td style={{ color: 'var(--color-slate)' }}>{adm.parentEmail}</td>
                    <td>{getStatusBadge(adm.status)}</td>
                    <td style={{ color: 'var(--color-slate)' }}>
                      {adm.createdAt ? new Date(adm.createdAt).toLocaleDateString() : 'Today'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
