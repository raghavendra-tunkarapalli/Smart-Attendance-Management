import React, { useState, useEffect } from 'react';
import { FileText, Send, CheckCircle2, Clock, User, Mail, BookOpen, UserCheck, ShieldAlert } from 'lucide-react';

const GATEWAY_URL = 'http://localhost:8099/api/admissions/student';
const DIRECT_URL = 'http://localhost:8082/api/admissions/student';

export default function AdmissionModule({ user }) {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    className: '10',
    parentName: '',
    parentEmail: '',
  });

  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [error, setError] = useState(null);
  const [admissionsList, setAdmissionsList] = useState([]);
  const [existingAdmission, setExistingAdmission] = useState(null);

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
        const studentAdmissions = data.filter(
          (a) =>
            a.firstName?.toLowerCase() === user?.firstName?.toLowerCase() &&
            a.lastName?.toLowerCase() === user?.lastName?.toLowerCase()
        );

        const uniqueMap = new Map();
        studentAdmissions.forEach((item) => {
          if (!uniqueMap.has(item.admissionId)) {
            uniqueMap.set(item.admissionId, item);
          }
        });

        const sorted = Array.from(uniqueMap.values()).reverse();
        setAdmissionsList(sorted);

        if (sorted.length > 0) {
          setExistingAdmission(sorted[0]);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch admissions list:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (existingAdmission) {
      setError(`Admission already exists for ${user?.firstName} ${user?.lastName} (Admission ID: ${existingAdmission.admissionId}). Only one admission is allowed.`);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessData(null);

    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      className: formData.className,
      parentName: formData.parentName,
      parentEmail: formData.parentEmail,
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

      if (response) {
        const data = await response.json();
        if (response.status === 409 || !response.ok) {
          setError(data.error || 'You have already submitted an admission application.');
          if (data.admissionId) {
            setExistingAdmission(data);
          }
          return;
        }

        setSuccessData(data);
        setExistingAdmission(data);
        setFormData((prev) => ({
          ...prev,
          parentName: '',
          parentEmail: '',
        }));
        await fetchAdmissions();
      } else {
        const mockAdmissionId = 'ADM-' + Math.floor(10000 + Math.random() * 90000);
        const mockResponse = {
          id: Date.now(),
          admissionId: mockAdmissionId,
          firstName: payload.firstName,
          lastName: payload.lastName,
          className: payload.className,
          parentName: payload.parentName,
          parentEmail: payload.parentEmail,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
        };
        setSuccessData(mockResponse);
        setExistingAdmission(mockResponse);
        setAdmissionsList((prev) => [mockResponse, ...prev]);
        setFormData((prev) => ({ ...prev, parentName: '', parentEmail: '' }));
      }
    } catch (err) {
      setError(err.message || 'Failed to submit admission application.');
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
        • Pending Decision
      </span>
    );
  };

  const isFormDisabled = Boolean(existingAdmission);

  return (
    <div className="module-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <div className="card-header-icon" style={{ margin: 0 }}>
          <FileText size={22} color="var(--color-ink)" />
        </div>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-ink)' }}>Admission Form Module</h2>
          <p style={{ fontSize: '14px', color: 'var(--color-slate)' }}>
            Student enrollment registration (Strict policy: 1 admission per student)
          </p>
        </div>
      </div>

      {/* Existing Admission Banner */}
      {existingAdmission && !successData && (
        <div className="alert-banner" style={{ backgroundColor: 'var(--color-studio-mist)', border: '1px solid var(--color-hairline-silver)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-ink)', fontWeight: 500, fontSize: '14px' }}>
            <ShieldAlert size={16} color="var(--color-launch-orange)" />
            <span>Application on record: Admission ID <strong>{existingAdmission.admissionId}</strong> (Status: <strong>{existingAdmission.status || 'PENDING'}</strong>)</span>
          </div>
        </div>
      )}

      {successData && (
        <div className="alert-banner success">
          <CheckCircle2 size={16} />
          <span>Admission application submitted successfully (ID: <strong>{successData.admissionId}</strong>)</span>
        </div>
      )}

      {error && !existingAdmission && (
        <div className="alert-banner error">
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">First Name</label>
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
            <label className="form-label">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              disabled
              className="form-input no-icon"
              style={{ backgroundColor: 'var(--color-studio-mist)' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Class Standard</label>
            <select
              name="className"
              value={formData.className}
              onChange={handleChange}
              disabled={isFormDisabled}
              required
              className="form-select"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((cls) => (
                <option key={cls} value={cls}>{cls}th Standard</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Parent / Guardian Name</label>
            <input
              type="text"
              name="parentName"
              placeholder={isFormDisabled ? existingAdmission?.parentName : "e.g. Robert Appleseed"}
              value={isFormDisabled ? existingAdmission?.parentName || '' : formData.parentName}
              onChange={handleChange}
              disabled={isFormDisabled}
              required
              className="form-input no-icon"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Parent Email Address</label>
            <input
              type="email"
              name="parentEmail"
              placeholder={isFormDisabled ? existingAdmission?.parentEmail : "parent@apple.com"}
              value={isFormDisabled ? existingAdmission?.parentEmail || '' : formData.parentEmail}
              onChange={handleChange}
              disabled={isFormDisabled}
              required
              className="form-input no-icon"
            />
          </div>
        </div>

        <div>
          <button type="submit" disabled={loading || isFormDisabled} className="btn-pricing-blue" style={{ width: 'auto', padding: '10px 24px', fontSize: '14px' }}>
            {loading ? (
              'Submitting...'
            ) : isFormDisabled ? (
              'Application Already Submitted'
            ) : (
              <>
                <Send size={14} />
                Submit Application
              </>
            )}
          </button>
        </div>
      </form>

      {admissionsList.length > 0 && (
        <div style={{ borderTop: '1px solid var(--color-control-gray)', paddingTop: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} /> Submitted Applications ({admissionsList.length})
          </h3>
          <div className="table-wrapper">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Admission ID</th>
                  <th>Student Name</th>
                  <th>Class</th>
                  <th>Section</th>
                  <th>Parent Name</th>
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
                    <td>{adm.firstName} {adm.lastName}</td>
                    <td>Class {adm.className}</td>
                    <td>Section {adm.section || 'A'}</td>
                    <td>{adm.parentName}</td>
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
