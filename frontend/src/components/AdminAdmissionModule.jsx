import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, RefreshCw, Users, UserCheck, CheckCircle2, XCircle, Clock } from 'lucide-react';

const GATEWAY_URL = 'http://localhost:8099/api/admin/admissions';
const DIRECT_URL = 'http://localhost:8086/api/admin/admissions';

export default function AdminAdmissionModule() {
  const [admissionsList, setAdmissionsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('STUDENT');

  useEffect(() => {
    fetchAdmissions();
  }, []);

  const fetchAdmissions = async () => {
    setLoading(true);
    try {
      let res = await fetch(GATEWAY_URL).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(DIRECT_URL).catch(() => null);
      }
      if (res && res.ok) {
        const data = await res.json();
        setAdmissionsList(data);
      }
    } catch (err) {
      console.warn('Failed to fetch admin admissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, type, newStatus, admissionId) => {
    setUpdatingId(`${type}-${id}`);
    const endpointType = type === 'PARENT' ? 'parent' : 'student';
    const admParam = admissionId ? `&admissionId=${encodeURIComponent(admissionId)}` : '';
    const gatewayEndpoint = `http://localhost:8099/api/admin/admissions/${endpointType}/${id}/status?status=${newStatus}${admParam}`;
    const directEndpoint = `http://localhost:8086/api/admin/admissions/${endpointType}/${id}/status?status=${newStatus}${admParam}`;

    try {
      let res = await fetch(gatewayEndpoint, { method: 'PUT' }).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(directEndpoint, { method: 'PUT' }).catch(() => null);
      }
      if (res && res.ok) {
        setAdmissionsList((prev) =>
          prev.map((item) =>
            (item.id === id && item.applicantType === type) || (admissionId && item.admissionId === admissionId)
              ? { ...item, status: newStatus }
              : item
          )
        );
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
      await fetchAdmissions();
    }
  };

  const studentAdmissions = admissionsList.filter((a) => a.applicantType === 'STUDENT');
  const parentAdmissions = admissionsList.filter((a) => a.applicantType === 'PARENT');

  const sortPendingFirst = (list) => {
    return [...list].sort((a, b) => {
      const statusA = (a.status || 'PENDING').toUpperCase();
      const statusB = (b.status || 'PENDING').toUpperCase();
      if (statusA === 'PENDING' && statusB !== 'PENDING') return -1;
      if (statusA !== 'PENDING' && statusB === 'PENDING') return 1;
      return 0;
    });
  };

  const filterBySearch = (list) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return sortPendingFirst(list);
    const filtered = list.filter(
      (adm) =>
        adm.admissionId?.toLowerCase().includes(query) ||
        adm.childName?.toLowerCase().includes(query) ||
        adm.firstName?.toLowerCase().includes(query) ||
        adm.lastName?.toLowerCase().includes(query) ||
        adm.parentName?.toLowerCase().includes(query) ||
        adm.parentEmail?.toLowerCase().includes(query) ||
        adm.className?.toLowerCase().includes(query) ||
        adm.status?.toLowerCase().includes(query)
    );
    return sortPendingFirst(filtered);
  };

  const filteredStudents = filterBySearch(studentAdmissions);
  const filteredParents = filterBySearch(parentAdmissions);

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
        • Pending
      </span>
    );
  };

  const studentPendingCount = studentAdmissions.filter((a) => (a.status || 'PENDING').toUpperCase() === 'PENDING').length;
  const parentPendingCount = parentAdmissions.filter((a) => (a.status || 'PENDING').toUpperCase() === 'PENDING').length;

  return (
    <div className="module-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="card-header-icon" style={{ margin: 0 }}>
            <ShieldCheck size={22} color="var(--color-ink)" />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-ink)' }}>Admin Admissions Management</h2>
            <p style={{ fontSize: '14px', color: 'var(--color-slate)' }}>
              Review, accept, or reject student and parent enrollment submissions
            </p>
          </div>
        </div>

        <button onClick={fetchAdmissions} disabled={loading} className="btn-outlined-explore">
          <RefreshCw size={13} className={loading ? 'spin' : ''} />
          Refresh Registry
        </button>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="claim-card">
          <div className="claim-label">Student Applications</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
            <span style={{ fontSize: '24px', fontWeight: 600, color: 'var(--color-ink)' }}>{studentAdmissions.length}</span>
            {studentPendingCount > 0 && (
              <span className="launch-status-label">{studentPendingCount} Pending Review</span>
            )}
          </div>
        </div>

        <div className="claim-card">
          <div className="claim-label">Parent Applications</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
            <span style={{ fontSize: '24px', fontWeight: 600, color: 'var(--color-ink)' }}>{parentAdmissions.length}</span>
            {parentPendingCount > 0 && (
              <span className="launch-status-label">{parentPendingCount} Pending Review</span>
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
            Student Admissions ({studentAdmissions.length})
          </button>

          <button
            className={`btn-outlined-explore ${activeSubTab === 'PARENT' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('PARENT')}
          >
            <UserCheck size={13} />
            Parent Admissions ({parentAdmissions.length})
          </button>
        </div>

        <div style={{ position: 'relative', minWidth: '240px' }}>
          <Search size={14} color="var(--color-steel)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search admissions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '38px', height: '36px' }}
          />
        </div>
      </div>

      {/* VIEW 1: STUDENT ADMISSIONS TABLE */}
      {activeSubTab === 'STUDENT' && (
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
                <th>Review Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((adm) => (
                  <tr key={adm.id || adm.admissionId}>
                    <td>
                      <span className="badge-unique">
                        {adm.admissionId}
                      </span>
                    </td>
                    <td><strong>{adm.firstName} {adm.lastName}</strong></td>
                    <td>Class {adm.className}</td>
                    <td>Section {adm.section || 'A'}</td>
                    <td>{adm.parentName}</td>
                    <td style={{ color: 'var(--color-slate)' }}>{adm.parentEmail}</td>
                    <td>{getStatusBadge(adm.status)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => handleStatusUpdate(adm.id, 'STUDENT', 'ACCEPTED', adm.admissionId)}
                          disabled={updatingId === `STUDENT-${adm.id}`}
                          className="btn-pricing-blue"
                          style={{ padding: '4px 10px', fontSize: '11px' }}
                        >
                          <CheckCircle2 size={11} /> Accept
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(adm.id, 'STUDENT', 'REJECTED', adm.admissionId)}
                          disabled={updatingId === `STUDENT-${adm.id}`}
                          className="btn-outlined-explore"
                          style={{ padding: '4px 10px', fontSize: '11px', color: 'var(--color-error)' }}
                        >
                          <XCircle size={11} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-slate)' }}>
                    {loading ? 'Loading admissions...' : 'No student records matching query.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW 2: PARENT ADMISSIONS TABLE */}
      {activeSubTab === 'PARENT' && (
        <div className="table-wrapper">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Admission ID</th>
                <th>Parent Name</th>
                <th>Child Name</th>
                <th>Class</th>
                <th>Section</th>
                <th>Parent Email</th>
                <th>Status</th>
                <th>Review Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredParents.length > 0 ? (
                filteredParents.map((adm) => (
                  <tr key={adm.id || adm.admissionId}>
                    <td>
                      <span className="badge-unique">
                        {adm.admissionId}
                      </span>
                    </td>
                    <td>{adm.parentName || `${adm.firstName} ${adm.lastName}`}</td>
                    <td><strong>{adm.childName}</strong></td>
                    <td>Class {adm.className}</td>
                    <td>Section {adm.section || 'A'}</td>
                    <td style={{ color: 'var(--color-slate)' }}>{adm.parentEmail}</td>
                    <td>{getStatusBadge(adm.status)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => handleStatusUpdate(adm.id, 'PARENT', 'ACCEPTED', adm.admissionId)}
                          disabled={updatingId === `PARENT-${adm.id}`}
                          className="btn-pricing-blue"
                          style={{ padding: '4px 10px', fontSize: '11px' }}
                        >
                          <CheckCircle2 size={11} /> Accept
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(adm.id, 'PARENT', 'REJECTED', adm.admissionId)}
                          disabled={updatingId === `PARENT-${adm.id}`}
                          className="btn-outlined-explore"
                          style={{ padding: '4px 10px', fontSize: '11px', color: 'var(--color-error)' }}
                        >
                          <XCircle size={11} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-slate)' }}>
                    {loading ? 'Loading admissions...' : 'No parent admission records matching query.'}
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
