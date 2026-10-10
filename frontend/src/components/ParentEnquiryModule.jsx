import React, { useState, useEffect } from 'react';
import { HelpCircle, Send, CheckCircle2, AlertCircle, Clock, BookOpen, User, UserCheck, Mail, MessageSquare } from 'lucide-react';

const GATEWAY_URL = 'http://localhost:8099/api/parent-enquiries';
const DIRECT_URL = 'http://localhost:8084/api/parent-enquiries';

export default function ParentEnquiryModule({ user }) {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    childName: '',
    className: 'Grade 10',
    enquire: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [enquiriesList, setEnquiriesList] = useState([]);

  useEffect(() => {
    fetchParentEnquiries();
  }, [user]);

  const fetchParentEnquiries = async () => {
    try {
      let res = await fetch(GATEWAY_URL).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(DIRECT_URL).catch(() => null);
      }
      if (res && res.ok) {
        const data = await res.json();
        const userEnquiries = data.filter(
          (e) =>
            (e.email && user?.email && e.email.toLowerCase() === user.email.toLowerCase()) ||
            (e.parentEmail && user?.email && e.parentEmail.toLowerCase() === user.email.toLowerCase()) ||
            (e.firstName && user?.firstName && e.firstName.toLowerCase() === user.firstName.toLowerCase())
        );
        setEnquiriesList(userEnquiries);
      }
    } catch (err) {
      console.warn('Failed to fetch parent enquiries:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const payload = {
      firstName: formData.firstName || user?.firstName || 'Parent',
      lastName: formData.lastName || user?.lastName || 'User',
      email: formData.email || user?.email || 'parent@apple.com',
      childName: formData.childName,
      className: formData.className,
      enquire: formData.enquire,
    };

    try {
      let res = await fetch(GATEWAY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => null);

      if (!res || !res.ok) {
        res = await fetch(DIRECT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).catch(() => null);
      }

      if (res && (res.ok || res.status === 201)) {
        const data = await res.json();
        setMessage(data.message || `Parent Enquiry submitted! ID: ${data.enquireId}`);
        setFormData({
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          email: user?.email || '',
          childName: '',
          className: 'Grade 10',
          enquire: '',
        });
        fetchParentEnquiries();
      } else {
        const errData = res ? await res.json().catch(() => ({})) : {};
        setError(errData.error || 'Failed to submit parent enquiry.');
      }
    } catch (err) {
      setError('Connection error. Please verify parent-enquiry-service is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="module-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <div className="card-header-icon" style={{ margin: 0 }}>
          <HelpCircle size={22} color="var(--color-ink)" />
        </div>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-ink)' }}>Parent Enquiry Desk</h2>
          <p style={{ fontSize: '14px', color: 'var(--color-slate)' }}>
            Parent inquiries regarding child progress, curriculum, bus routes, or fee schedules
          </p>
        </div>
      </div>

      {message && (
        <div className="alert-banner success">
          <CheckCircle2 size={16} />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="alert-banner error">
          <AlertCircle size={16} />
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
            <label className="form-label">Parent Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
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

        <div className="form-group">
          <label className="form-label">Enquiry Message</label>
          <textarea
            name="enquire"
            placeholder="Type your questions or concerns regarding admissions, fees, transport, or facilities..."
            value={formData.enquire}
            onChange={handleChange}
            required
            className="form-textarea"
            rows="3"
          ></textarea>
        </div>

        <div>
          <button type="submit" disabled={loading} className="btn-pricing-blue" style={{ width: 'auto', padding: '10px 24px', fontSize: '14px' }}>
            {loading ? (
              'Submitting...'
            ) : (
              <>
                <Send size={14} />
                Submit Parent Enquiry
              </>
            )}
          </button>
        </div>
      </form>

      {enquiriesList.length > 0 && (
        <div style={{ borderTop: '1px solid var(--color-control-gray)', paddingTop: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} /> Parent Enquiries History ({enquiriesList.length})
          </h3>
          <div className="table-wrapper">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Enquiry ID</th>
                  <th>Child & Grade</th>
                  <th>Status</th>
                  <th>Query</th>
                  <th>Official Response</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {enquiriesList.map((enq) => {
                  const officialResp = enq.response || enq.adminResponse;
                  const isResponded = enq.status === 'RESPONDED' || Boolean(officialResp && officialResp.trim());
                  return (
                    <tr key={enq.id || enq.enquireId}>
                      <td>
                        <span className="badge-unique">
                          {enq.enquireId}
                        </span>
                      </td>
                      <td><strong>{enq.childName}</strong> • {enq.className}</td>
                      <td>
                        {isResponded ? (
                          <span className="role-pill student">
                            ✓ Responded
                          </span>
                        ) : (
                          <span className="role-pill parent">
                            • In Review
                          </span>
                        )}
                      </td>
                      <td style={{ minWidth: '220px', whiteSpace: 'normal', lineHeight: 1.45 }}>{enq.enquire}</td>
                      <td style={{ minWidth: '280px', whiteSpace: 'normal' }}>
                        {officialResp ? (
                          <div style={{ backgroundColor: 'var(--color-studio-mist)', border: '1px solid var(--color-control-gray)', borderRadius: '10px', padding: '8px 12px', fontSize: '13px', color: 'var(--color-ink)' }}>
                            <strong style={{ color: 'var(--color-apple-blue)', display: 'block', fontSize: '11px', textTransform: 'uppercase', marginBottom: '2px' }}>Response</strong>
                            {officialResp}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--color-slate)', fontStyle: 'italic', fontSize: '13px' }}>
                            • Pending reply
                          </span>
                        )}
                      </td>
                      <td style={{ color: 'var(--color-slate)' }}>
                        {enq.createdAt ? new Date(enq.createdAt).toLocaleDateString() : 'Today'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
