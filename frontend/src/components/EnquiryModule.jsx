import React, { useState, useEffect } from 'react';
import { HelpCircle, Send, CheckCircle2, AlertCircle, Clock, BookOpen, User, UserCheck, Mail, MessageSquare } from 'lucide-react';

const GATEWAY_URL = 'http://localhost:8099/api/enquiries';
const DIRECT_URL = 'http://localhost:8083/api/enquiries';

export default function EnquiryModule({ user }) {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    parentName: '',
    parentEmail: user?.email || '',
    className: 'Grade 10',
    enquire: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [enquiriesList, setEnquiriesList] = useState([]);

  useEffect(() => {
    fetchEnquiries();
  }, [user]);

  const fetchEnquiries = async () => {
    try {
      let res = await fetch(GATEWAY_URL).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(DIRECT_URL).catch(() => null);
      }
      if (res && res.ok) {
        const data = await res.json();
        const userEnquiries = data.filter(
          (e) =>
            (e.parentEmail && user?.email && e.parentEmail.toLowerCase() === user.email.toLowerCase()) ||
            (e.firstName && user?.firstName && e.firstName.toLowerCase() === user.firstName.toLowerCase())
        );
        setEnquiriesList(userEnquiries);
      }
    } catch (err) {
      console.warn('Failed to fetch enquiries:', err);
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
      firstName: formData.firstName || user?.firstName || 'Student',
      lastName: formData.lastName || user?.lastName || 'User',
      parentName: formData.parentName,
      parentEmail: formData.parentEmail,
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
        setMessage(data.message || `Enquiry submitted! Enquiry ID: ${data.enquireId}`);
        setFormData({
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          parentName: '',
          parentEmail: user?.email || '',
          className: 'Grade 10',
          enquire: '',
        });
        fetchEnquiries();
      } else {
        const errText = res ? await res.text() : 'Service unavailable';
        setError(errText || 'Failed to submit enquiry.');
      }
    } catch (err) {
      setError('Connection error. Please verify student-enquire-service is running.');
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
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-ink)' }}>Student Enquiry Module</h2>
          <p style={{ fontSize: '14px', color: 'var(--color-slate)' }}>
            Submit academic and institutional inquiries to school faculty and administration
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
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Student First Name</label>
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
            <label className="form-label">Student Last Name</label>
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
            <label className="form-label">Grade / Class</label>
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

          <div className="form-group">
            <label className="form-label">Parent / Guardian Name</label>
            <input
              type="text"
              name="parentName"
              placeholder="e.g. Robert Appleseed"
              value={formData.parentName}
              onChange={handleChange}
              required
              className="form-input no-icon"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Parent Email</label>
            <input
              type="email"
              name="parentEmail"
              placeholder="parent@apple.com"
              value={formData.parentEmail}
              onChange={handleChange}
              required
              className="form-input no-icon"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Enquiry Message</label>
          <textarea
            name="enquire"
            placeholder="Type your question regarding schedule, syllabus, attendance, or fees..."
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
                Submit Enquiry
              </>
            )}
          </button>
        </div>
      </form>

      {enquiriesList.length > 0 && (
        <div style={{ borderTop: '1px solid var(--color-control-gray)', paddingTop: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} /> Enquiry Log & Responses ({enquiriesList.length})
          </h3>
          <div className="table-wrapper">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Enquiry ID</th>
                  <th>Class</th>
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
                      <td>{enq.className}</td>
                      <td>
                        {isResponded ? (
                          <span className="role-pill student">
                            ✓ Responded
                          </span>
                        ) : (
                          <span className="role-pill parent">
                            • Awaiting Reply
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
                            • Pending review
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
