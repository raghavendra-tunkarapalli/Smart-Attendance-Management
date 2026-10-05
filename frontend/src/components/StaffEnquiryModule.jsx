import React, { useState, useEffect } from 'react';
import { Shield, Search, RefreshCw, Users, UserCheck, MessageSquare, Send, CheckCircle2, Edit2, Clock } from 'lucide-react';

const GATEWAY_URL = 'http://localhost:8099/api/staff/enquiries';
const DIRECT_URL = 'http://localhost:8088/api/staff/enquiries';

export default function StaffEnquiryModule() {
  const [enquiriesList, setEnquiriesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('STUDENT');
  const [responseInputs, setResponseInputs] = useState({});
  const [editingIds, setEditingIds] = useState({});
  const [submittingId, setSubmittingId] = useState(null);

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      let res = await fetch(GATEWAY_URL).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(DIRECT_URL).catch(() => null);
      }
      if (res && res.ok) {
        const data = await res.json();
        setEnquiriesList(data);
      }
    } catch (err) {
      console.warn('Failed to fetch staff enquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (key, text) => {
    setResponseInputs((prev) => ({ ...prev, [key]: text }));
  };

  const toggleEditing = (key, initialText = '') => {
    setEditingIds((prev) => ({ ...prev, [key]: !prev[key] }));
    setResponseInputs((prev) => ({ ...prev, [key]: initialText }));
  };

  const handleSendResponse = async (id, type) => {
    const key = `${type}-${id}`;
    const text = responseInputs[key]?.trim();
    if (!text) return;

    setSubmittingId(key);

    const primaryEndpoint = type === 'PARENT'
      ? `http://localhost:8099/api/staff/enquiries/parent/${id}/response`
      : `http://localhost:8099/api/staff/enquiries/student/${id}/response`;

    const gatewayServiceEndpoint = type === 'PARENT'
      ? `http://localhost:8099/api/parent-enquiries/${id}/response`
      : `http://localhost:8099/api/enquiries/${id}/response`;

    const fallbackEndpoint = type === 'PARENT'
      ? `http://localhost:8084/api/parent-enquiries/${id}/response`
      : `http://localhost:8083/api/enquiries/${id}/response`;

    try {
      let res = await fetch(primaryEndpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: text }),
      }).catch(() => null);

      if (!res || !res.ok) {
        res = await fetch(gatewayServiceEndpoint, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ response: text }),
        }).catch(() => null);
      }

      if (!res || !res.ok) {
        res = await fetch(fallbackEndpoint, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ response: text }),
        }).catch(() => null);
      }

      if (res && res.ok) {
        setEnquiriesList((prev) =>
          prev.map((item) =>
            String(item.id) === String(id) && item.applicantType === type
              ? { ...item, response: text, adminResponse: text, status: 'RESPONDED' }
              : item
          )
        );
        setResponseInputs((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
        setEditingIds((prev) => ({ ...prev, [key]: false }));
      }
    } catch (err) {
      console.error('Failed to send staff response:', err);
    } finally {
      setSubmittingId(null);
      await fetchEnquiries();
    }
  };

  const studentEnquiries = enquiriesList.filter((e) => e.applicantType === 'STUDENT');
  const parentEnquiries = enquiriesList.filter((e) => e.applicantType === 'PARENT');

  const sortUnrespondedFirst = (list) => {
    return [...list].sort((a, b) => {
      const isPendingA = a.status === 'PENDING' || (!a.response && !a.adminResponse);
      const isPendingB = b.status === 'PENDING' || (!b.response && !b.adminResponse);
      if (isPendingA && !isPendingB) return -1;
      if (!isPendingA && isPendingB) return 1;
      return 0;
    });
  };

  const filterBySearch = (list) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return sortUnrespondedFirst(list);
    const filtered = list.filter(
      (enq) =>
        enq.enquireId?.toLowerCase().includes(query) ||
        enq.childName?.toLowerCase().includes(query) ||
        enq.firstName?.toLowerCase().includes(query) ||
        enq.lastName?.toLowerCase().includes(query) ||
        enq.parentName?.toLowerCase().includes(query) ||
        enq.parentEmail?.toLowerCase().includes(query) ||
        enq.email?.toLowerCase().includes(query) ||
        enq.className?.toLowerCase().includes(query) ||
        enq.enquire?.toLowerCase().includes(query) ||
        (enq.response || enq.adminResponse)?.toLowerCase().includes(query)
    );
    return sortUnrespondedFirst(filtered);
  };

  const filteredStudents = filterBySearch(studentEnquiries);
  const filteredParents = filterBySearch(parentEnquiries);

  const studentPendingResponseCount = studentEnquiries.filter((e) => e.status === 'PENDING' || (!e.response && !e.adminResponse)).length;
  const parentPendingResponseCount = parentEnquiries.filter((e) => e.status === 'PENDING' || (!e.response && !e.adminResponse)).length;

  return (
    <div className="module-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="card-header-icon" style={{ margin: 0 }}>
            <Shield size={22} color="var(--color-ink)" />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-ink)' }}>Staff Helpdesk & Inquiry Portal</h2>
            <p style={{ fontSize: '14px', color: 'var(--color-slate)' }}>
              Respond to operational, transportation, and facilities queries from students & parents
            </p>
          </div>
        </div>

        <button onClick={fetchEnquiries} disabled={loading} className="btn-outlined-explore">
          <RefreshCw size={13} className={loading ? 'spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="claim-card">
          <div className="claim-label">Student Inquiries</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
            <span style={{ fontSize: '24px', fontWeight: 600, color: 'var(--color-ink)' }}>{studentEnquiries.length}</span>
            {studentPendingResponseCount > 0 ? (
              <span className="launch-status-label">{studentPendingResponseCount} Needs Response</span>
            ) : (
              <span className="role-pill student">✓ Complete</span>
            )}
          </div>
        </div>

        <div className="claim-card">
          <div className="claim-label">Parent Inquiries</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
            <span style={{ fontSize: '24px', fontWeight: 600, color: 'var(--color-ink)' }}>{parentEnquiries.length}</span>
            {parentPendingResponseCount > 0 ? (
              <span className="launch-status-label">{parentPendingResponseCount} Needs Response</span>
            ) : (
              <span className="role-pill student">✓ Complete</span>
            )}
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation Bar & Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`btn-outlined-explore ${activeSubTab === 'STUDENT' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('STUDENT')}
          >
            <Users size={13} />
            Student Inquiries ({studentEnquiries.length})
          </button>

          <button
            className={`btn-outlined-explore ${activeSubTab === 'PARENT' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('PARENT')}
          >
            <UserCheck size={13} />
            Parent Inquiries ({parentEnquiries.length})
          </button>
        </div>

        <div style={{ position: 'relative', minWidth: '240px' }}>
          <Search size={14} color="var(--color-steel)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search queries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '38px', height: '36px' }}
          />
        </div>
      </div>

      {/* VIEW 1: STUDENT ENQUIRIES TABLE */}
      {activeSubTab === 'STUDENT' && (
        <div className="table-wrapper">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Enquiry ID</th>
                <th>Student</th>
                <th>Class</th>
                <th>Status</th>
                <th>Question</th>
                <th>Staff Response</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((enq) => {
                  const key = `STUDENT-${enq.id}`;
                  const currentResponse = enq.response || enq.adminResponse;
                  const hasResponse = enq.status === 'RESPONDED' || Boolean(currentResponse && currentResponse.trim());
                  const isEditing = editingIds[key];

                  return (
                    <tr key={enq.id || enq.enquireId}>
                      <td>
                        <span className="badge-unique">
                          {enq.enquireId}
                        </span>
                      </td>
                      <td><strong>{enq.firstName} {enq.lastName}</strong></td>
                      <td>{enq.className}</td>
                      <td>
                        {hasResponse ? (
                          <span className="role-pill student">
                            ✓ Responded
                          </span>
                        ) : (
                          <span className="role-pill parent">
                            • Awaiting Reply
                          </span>
                        )}
                      </td>
                      <td style={{ maxWidth: '240px', whiteSpace: 'normal' }}>
                        {enq.enquire}
                      </td>
                      <td style={{ minWidth: '340px', maxWidth: '440px', whiteSpace: 'normal' }}>
                        {hasResponse && !isEditing ? (
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', backgroundColor: 'var(--color-studio-mist)', border: '1px solid var(--color-control-gray)', borderRadius: '10px', padding: '8px 12px' }}>
                            <div style={{ fontSize: '13px', color: 'var(--color-ink)', lineHeight: 1.4 }}>
                              <strong style={{ color: 'var(--color-apple-blue)', display: 'block', fontSize: '11px', textTransform: 'uppercase', marginBottom: '2px' }}>
                                Staff Response
                              </strong>
                              {currentResponse}
                            </div>
                            <button onClick={() => toggleEditing(key, currentResponse)} className="btn-outlined-explore" style={{ padding: '2px 8px', fontSize: '11px', flexShrink: 0 }}>
                              <Edit2 size={10} /> Edit
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '6px', width: '100%', alignItems: 'center' }}>
                            <input
                              type="text"
                              placeholder="Type staff response..."
                              value={responseInputs[key] !== undefined ? responseInputs[key] : (currentResponse || '')}
                              onChange={(e) => handleResponseChange(key, e.target.value)}
                              className="form-input no-icon"
                              style={{ height: '34px', fontSize: '13px', flex: 1 }}
                            />
                            <button
                              onClick={() => handleSendResponse(enq.id, 'STUDENT')}
                              disabled={submittingId === key}
                              className="btn-pricing-blue"
                              style={{ padding: '6px 12px', fontSize: '12px', flexShrink: 0 }}
                            >
                              <Send size={11} /> Send
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-slate)' }}>
                    {loading ? 'Loading queries...' : 'No student enquiries found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW 2: PARENT ENQUIRIES TABLE */}
      {activeSubTab === 'PARENT' && (
        <div className="table-wrapper">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Enquiry ID</th>
                <th>Parent</th>
                <th>Child & Class</th>
                <th>Status</th>
                <th>Question</th>
                <th>Staff Response</th>
              </tr>
            </thead>
            <tbody>
              {filteredParents.length > 0 ? (
                filteredParents.map((enq) => {
                  const key = `PARENT-${enq.id}`;
                  const currentResponse = enq.response || enq.adminResponse;
                  const hasResponse = enq.status === 'RESPONDED' || Boolean(currentResponse && currentResponse.trim());
                  const isEditing = editingIds[key];

                  return (
                    <tr key={enq.id || enq.enquireId}>
                      <td>
                        <span className="badge-unique">
                          {enq.enquireId}
                        </span>
                      </td>
                      <td>{enq.parentName || `${enq.firstName} ${enq.lastName}`}</td>
                      <td>
                        <strong>{enq.childName}</strong> • {enq.className}
                      </td>
                      <td>
                        {hasResponse ? (
                          <span className="role-pill student">
                            ✓ Responded
                          </span>
                        ) : (
                          <span className="role-pill parent">
                            • Awaiting Reply
                          </span>
                        )}
                      </td>
                      <td style={{ maxWidth: '240px', whiteSpace: 'normal' }}>
                        {enq.enquire}
                      </td>
                      <td style={{ minWidth: '340px', maxWidth: '440px', whiteSpace: 'normal' }}>
                        {hasResponse && !isEditing ? (
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', backgroundColor: 'var(--color-studio-mist)', border: '1px solid var(--color-control-gray)', borderRadius: '10px', padding: '8px 12px' }}>
                            <div style={{ fontSize: '13px', color: 'var(--color-ink)', lineHeight: 1.4 }}>
                              <strong style={{ color: 'var(--color-apple-blue)', display: 'block', fontSize: '11px', textTransform: 'uppercase', marginBottom: '2px' }}>
                                Staff Response
                              </strong>
                              {currentResponse}
                            </div>
                            <button onClick={() => toggleEditing(key, currentResponse)} className="btn-outlined-explore" style={{ padding: '2px 8px', fontSize: '11px', flexShrink: 0 }}>
                              <Edit2 size={10} /> Edit
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '6px', width: '100%', alignItems: 'center' }}>
                            <input
                              type="text"
                              placeholder="Type staff response..."
                              value={responseInputs[key] !== undefined ? responseInputs[key] : (currentResponse || '')}
                              onChange={(e) => handleResponseChange(key, e.target.value)}
                              className="form-input no-icon"
                              style={{ height: '34px', fontSize: '13px', flex: 1 }}
                            />
                            <button
                              onClick={() => handleSendResponse(enq.id, 'PARENT')}
                              disabled={submittingId === key}
                              className="btn-pricing-blue"
                              style={{ padding: '6px 12px', fontSize: '12px', flexShrink: 0 }}
                            >
                              <Send size={11} /> Send
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-slate)' }}>
                    {loading ? 'Loading queries...' : 'No parent enquiries found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
