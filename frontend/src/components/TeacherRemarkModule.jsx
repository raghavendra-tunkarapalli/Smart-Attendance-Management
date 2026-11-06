import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Plus,
  User,
  BookOpen,
  Calendar,
  MessageSquare,
  Check,
  X,
  AlertTriangle,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
  HelpCircle,
  FileText,
  MessageSquareQuote,
  ShieldCheck
} from 'lucide-react';

const GATEWAY_URL = 'http://localhost:8099/api/teacher-remarks';
const DIRECT_URL = 'http://localhost:8106/api/teacher-remarks';

export default function TeacherRemarkModule({ user, profileData }) {
  const [remarks, setRemarks] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, PENDING, ACKNOWLEDGED
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRemarkDetail, setSelectedRemarkDetail] = useState(null);

  // New Remark Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);

  // Delete Confirmation state
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const teacherUsername = profileData?.username || user?.username || 'teacher';
  const teacherFullName = profileData?.firstName 
    ? `${profileData.firstName} ${profileData.lastName || ''}`.trim()
    : (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Robert Vance');
  const teacherEmail = profileData?.email || user?.email || 'teacher@school.com';

  const [formData, setFormData] = useState({
    studentId: '',
    studentName: '',
    classStandard: '',
    section: '',
    parentName: '',
    parentUsername: '',
    subject: 'Mathematics',
    category: 'ACADEMIC_PROGRESS',
    severity: 'ATTENTION_NEEDED',
    title: '',
    description: '',
    improvementSuggestions: ''
  });

  const fetchRemarks = async () => {
    setLoading(true);
    try {
      let res;
      try {
        res = await fetch(`${GATEWAY_URL}/teacher?username=${teacherUsername}`);
      } catch (e) {
        res = await fetch(`${DIRECT_URL}/teacher?username=${teacherUsername}`);
      }
      if (res.ok) {
        const data = await res.json();
        setRemarks(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load remarks:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      let res;
      try {
        res = await fetch(`${GATEWAY_URL}/students`);
      } catch (e) {
        res = await fetch(`${DIRECT_URL}/students`);
      }
      if (res.ok) {
        const data = await res.json();
        setStudents(Array.isArray(data) ? data : []);
        if (data.length > 0 && !formData.studentId) {
          const first = data[0];
          setFormData(prev => ({
            ...prev,
            studentId: first.studentId,
            studentName: first.studentName,
            classStandard: first.classStandard,
            section: first.section,
            parentName: first.parentName,
            parentUsername: first.parentUsername
          }));
        }
      }
    } catch (err) {
      console.error('Failed to load students roster:', err);
    }
  };

  useEffect(() => {
    fetchRemarks();
    fetchStudents();
  }, [teacherUsername]);

  const handleStudentSelect = (e) => {
    const sId = e.target.value;
    const found = students.find(s => s.studentId === sId);
    if (found) {
      setFormData(prev => ({
        ...prev,
        studentId: found.studentId,
        studentName: found.studentName,
        classStandard: found.classStandard,
        section: found.section,
        parentName: found.parentName,
        parentUsername: found.parentUsername
      }));
    } else {
      setFormData(prev => ({ ...prev, studentId: sId }));
    }
  };

  const handleCreateRemark = async (e) => {
    e.preventDefault();
    if (!formData.studentId || !formData.title.trim() || !formData.description.trim() || !formData.improvementSuggestions.trim()) {
      setActionError('Please complete all required fields.');
      return;
    }

    setSubmitting(true);
    setActionError(null);

    const payload = {
      teacherUsername,
      teacherName: teacherFullName,
      teacherEmail,
      studentId: formData.studentId,
      studentName: formData.studentName,
      classStandard: formData.classStandard,
      section: formData.section,
      parentName: formData.parentName,
      parentUsername: formData.parentUsername,
      subject: formData.subject,
      category: formData.category,
      severity: formData.severity,
      title: formData.title.trim(),
      description: formData.description.trim(),
      improvementSuggestions: formData.improvementSuggestions.trim()
    };

    try {
      let res;
      try {
        res = await fetch(`${GATEWAY_URL}/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        res = await fetch(`${DIRECT_URL}/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        const saved = await res.json();
        setRemarks(prev => [saved, ...prev]);
        setShowCreateModal(false);
        setActionSuccess(`Academic improvement remark dispatched to ${formData.parentName || 'Parent'} for student ${formData.studentName}!`);
        setTimeout(() => setActionSuccess(null), 5000);
        // Reset form
        setFormData(prev => ({
          ...prev,
          title: '',
          description: '',
          improvementSuggestions: '',
          severity: 'ATTENTION_NEEDED'
        }));
      } else {
        const errData = await res.json().catch(() => ({}));
        setActionError(errData.message || 'Failed to dispatch remark.');
      }
    } catch (err) {
      setActionError('Network connection failed while dispatching remark.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRemark = async (id) => {
    setIsDeleting(true);
    try {
      let res;
      try {
        res = await fetch(`${GATEWAY_URL}/${id}?username=${teacherUsername}`, {
          method: 'DELETE'
        });
      } catch (e) {
        res = await fetch(`${DIRECT_URL}/${id}?username=${teacherUsername}`, {
          method: 'DELETE'
        });
      }

      if (res.ok) {
        setRemarks(prev => prev.filter(r => r.id !== id));
        setDeletingId(null);
        setActionSuccess('Feedback remark has been successfully removed.');
        setTimeout(() => setActionSuccess(null), 4000);
        if (selectedRemarkDetail?.remark?.id === id) {
          setSelectedRemarkDetail(null);
        }
      } else {
        alert('Failed to remove feedback remark.');
      }
    } catch (e) {
      alert('Error communicating with server.');
    } finally {
      setIsDeleting(false);
    }
  };

  const viewRemarkDetails = async (remark) => {
    try {
      let res;
      try {
        res = await fetch(`${GATEWAY_URL}/${remark.id}`);
      } catch (e) {
        res = await fetch(`${DIRECT_URL}/${remark.id}`);
      }
      if (res.ok) {
        const data = await res.json();
        setSelectedRemarkDetail(data);
      } else {
        setSelectedRemarkDetail({ remark, acknowledgments: [] });
      }
    } catch (e) {
      setSelectedRemarkDetail({ remark, acknowledgments: [] });
    }
  };

  // Filtered remarks
  const filteredRemarks = remarks.filter(r => {
    if (filterStatus === 'PENDING' && r.acknowledged) return false;
    if (filterStatus === 'ACKNOWLEDGED' && !r.acknowledged) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = r.studentName?.toLowerCase().includes(q);
      const matchId = r.studentId?.toLowerCase().includes(q);
      const matchSub = r.subject?.toLowerCase().includes(q);
      const matchTitle = r.title?.toLowerCase().includes(q);
      const matchParent = r.parentName?.toLowerCase().includes(q);
      return matchName || matchId || matchSub || matchTitle || matchParent;
    }
    return true;
  });

  const totalCount = remarks.length;
  const ackCount = remarks.filter(r => r.acknowledged).length;
  const pendingCount = totalCount - ackCount;

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return isoString;
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'PRAISE':
        return { bg: '#ecfdf5', color: '#059669', border: '#a7f3d0', label: 'Commendation & Praise' };
      case 'URGENT':
        return { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', label: 'Action Required / Urgent' };
      case 'ATTENTION_NEEDED':
        return { bg: '#fffbeb', color: '#d97706', border: '#fde68a', label: 'Attention Needed' };
      default:
        return { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe', label: 'Informational' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Toast notifications */}
      {actionSuccess && (
        <div style={{
          backgroundColor: '#ecfdf5',
          border: '1px solid #10b981',
          color: '#065f46',
          padding: '12px 18px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '14px',
          fontWeight: 500,
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)'
        }}>
          <CheckCircle2 size={18} style={{ color: '#10b981', flexShrink: 0 }} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--color-hairline-silver)',
        borderRadius: '20px',
        padding: '24px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 16px rgba(109, 40, 217, 0.25)'
          }}>
            <Sparkles size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-ink)', margin: 0 }}>
              Remarks & Academic Improvements
            </h3>
            <p style={{ color: 'var(--color-slate)', fontSize: '13px', margin: '4px 0 0 0' }}>
              Direct faculty-to-parent academic observations, actionable improvement guidance, and acknowledgment verification.
            </p>
          </div>
        </div>

        <button
          onClick={() => { setShowCreateModal(true); setActionError(null); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#0071e3',
            color: '#ffffff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 113, 227, 0.25)',
            transition: 'all 0.2s'
          }}
        >
          <Plus size={16} />
          <span>Send Student Remark</span>
        </button>
      </div>

      {/* KPI METRICS CARDS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '16px'
      }}>
        <div style={{
          background: '#ffffff',
          border: '1px solid var(--color-hairline-silver)',
          borderRadius: '16px',
          padding: '18px 20px'
        }}>
          <div style={{ fontSize: '12px', color: 'var(--color-slate)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>
            Total Remarks Sent
          </div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: 'var(--color-ink)', marginTop: '6px' }}>
            {totalCount}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-slate)', marginTop: '4px' }}>
            Across all enrolled classes
          </div>
        </div>

        <div style={{
          background: '#ffffff',
          border: '1px solid var(--color-hairline-silver)',
          borderRadius: '16px',
          padding: '18px 20px'
        }}>
          <div style={{ fontSize: '12px', color: '#16a34a', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>
            Parent Acknowledged
          </div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#16a34a', marginTop: '6px' }}>
            {ackCount}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-slate)', marginTop: '4px' }}>
            Confirmed by guardian
          </div>
        </div>

        <div style={{
          background: '#ffffff',
          border: '1px solid var(--color-hairline-silver)',
          borderRadius: '16px',
          padding: '18px 20px'
        }}>
          <div style={{ fontSize: '12px', color: '#d97706', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>
            Pending Acknowledgment
          </div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#d97706', marginTop: '6px' }}>
            {pendingCount}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-slate)', marginTop: '4px' }}>
            Awaiting guardian review
          </div>
        </div>

        <div style={{
          background: '#ffffff',
          border: '1px solid var(--color-hairline-silver)',
          borderRadius: '16px',
          padding: '18px 20px'
        }}>
          <div style={{ fontSize: '12px', color: '#2563eb', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>
            Engagement Rate
          </div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#2563eb', marginTop: '6px' }}>
            {totalCount > 0 ? `${Math.round((ackCount / totalCount) * 100)}%` : '100%'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-slate)', marginTop: '4px' }}>
            Parent feedback ratio
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--color-hairline-silver)',
        borderRadius: '16px',
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        {/* Status Filters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: `All Remarks (${totalCount})` },
            { id: 'PENDING', label: `Awaiting Parent (${pendingCount})` },
            { id: 'ACKNOWLEDGED', label: `Acknowledged (${ackCount})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                border: filterStatus === tab.id ? '1px solid #0071e3' : '1px solid var(--color-hairline-silver)',
                backgroundColor: filterStatus === tab.id ? '#eff6ff' : 'var(--color-studio-mist)',
                color: filterStatus === tab.id ? '#0071e3' : 'var(--color-ink)',
                transition: 'all 0.15s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div style={{ position: 'relative', minWidth: '260px', flex: '1', maxWidth: '380px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-slate)' }} />
          <input
            type="text"
            placeholder="Search by student, subject, topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: '10px',
              border: '1px solid var(--color-hairline-silver)',
              backgroundColor: 'var(--color-studio-mist)',
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>

      {/* REMARKS LIST */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-slate)' }}>
          <Clock size={28} style={{ animation: 'spin 1.5s linear infinite', margin: '0 auto 12px auto', display: 'block' }} />
          <span>Synchronizing student improvement remarks...</span>
        </div>
      ) : filteredRemarks.length === 0 ? (
        <div style={{
          background: '#ffffff',
          border: '1px solid var(--color-hairline-silver)',
          borderRadius: '20px',
          padding: '48px 24px',
          textAlign: 'center'
        }}>
          <Sparkles size={36} style={{ color: '#94a3b8', margin: '0 auto 12px auto' }} />
          <h4 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>
            No Academic Remarks Found
          </h4>
          <p style={{ color: 'var(--color-slate)', fontSize: '13px', marginTop: '6px', maxWidth: '420px', margin: '6px auto 0 auto' }}>
            {searchQuery ? 'No remarks match your search criteria.' : 'You have not dispatched any improvement remarks under this filter.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredRemarks.map((remark) => {
            const sevBadge = getSeverityBadge(remark.severity);
            return (
              <div
                key={remark.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--color-hairline-silver)',
                  borderRadius: '18px',
                  padding: '22px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  transition: 'box-shadow 0.2s',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                }}
              >
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{
                      backgroundColor: '#eff6ff',
                      color: '#1d4ed8',
                      fontSize: '12px',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '8px',
                      border: '1px solid #bfdbfe'
                    }}>
                      {remark.studentId}
                    </span>

                    <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-ink)' }}>
                      {remark.studentName}
                    </span>

                    <span style={{ fontSize: '13px', color: 'var(--color-slate)' }}>
                      ({remark.classStandard} – Sec {remark.section})
                    </span>

                    <span style={{
                      backgroundColor: sevBadge.bg,
                      color: sevBadge.color,
                      border: `1px solid ${sevBadge.border}`,
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}>
                      {sevBadge.label}
                    </span>

                    <span style={{
                      backgroundColor: 'var(--color-studio-mist)',
                      color: 'var(--color-ink)',
                      border: '1px solid var(--color-hairline-silver)',
                      fontSize: '12px',
                      fontWeight: 600,
                      padding: '3px 10px',
                      borderRadius: '6px'
                    }}>
                      {remark.subject}
                    </span>
                  </div>

                  {/* Actions / Remove Feedback */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => viewRemarkDetails(remark)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'transparent',
                        border: '1px solid var(--color-hairline-silver)',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'var(--color-ink)',
                        cursor: 'pointer'
                      }}
                    >
                      <FileText size={14} />
                      <span>Details</span>
                    </button>

                    <button
                      onClick={() => setDeletingId(remark.id)}
                      title="Remove feedback"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#dc2626',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={14} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>

                {/* Topic & Description */}
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-ink)', margin: '0 0 6px 0' }}>
                    {remark.title}
                  </h4>
                  <p style={{ fontSize: '13px', color: '#334155', lineHeight: '1.55', margin: 0, whiteSpace: 'pre-line' }}>
                    {remark.description}
                  </p>
                </div>

                {/* Actionable Guidance Highlight Card */}
                <div style={{
                  background: 'linear-gradient(135deg, #faf5ff 0%, #f5f3ff 100%)',
                  border: '1.5px solid #ddd6fe',
                  borderLeft: '4.5px solid #7c3aed',
                  borderRadius: '14px',
                  padding: '16px 20px',
                  boxShadow: '0 2px 10px rgba(124, 58, 237, 0.04)'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    <div style={{
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      fontWeight: 800,
                      color: '#6d28d9',
                      letterSpacing: '0.05em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '7px'
                    }}>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '6px',
                        backgroundColor: '#ede9fe',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#7c3aed'
                      }}>
                        <Sparkles size={12} />
                      </div>
                      <span>Actionable Guidance for Parent &amp; Student Home Practice</span>
                    </div>

                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#7c3aed',
                      backgroundColor: '#ede9fe',
                      border: '1px solid #ddd6fe',
                      padding: '3px 10px',
                      borderRadius: '20px'
                    }}>
                      Dispatched Recommendations
                    </span>
                  </div>

                  <div style={{
                    fontSize: '14px',
                    color: '#3b0764',
                    lineHeight: '1.65',
                    fontWeight: 500
                  }}>
                    {remark.improvementSuggestions}
                  </div>
                </div>

                {/* Parent Acknowledgment & Highlighted Feedback Section */}
                <div style={{
                  paddingTop: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', fontSize: '12px', color: 'var(--color-slate)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={13} />
                      <span>Dispatched on {formatDate(remark.createdAt)}</span>
                      <span>•</span>
                      <User size={13} />
                      <span>Parent: <strong style={{ color: 'var(--color-ink)' }}>{remark.parentName}</strong> ({remark.parentPhone || '+1 (555) 234-5678'})</span>
                    </div>

                    {!remark.acknowledged && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#fffbeb',
                        color: '#d97706',
                        border: '1px solid #fde68a',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 700
                      }}>
                        <Clock size={13} />
                        <span>Awaiting Parent Acknowledgment</span>
                      </div>
                    )}
                  </div>

                  {/* If acknowledged, show the highlighted guardian feedback card */}
                  {remark.acknowledged && (
                    <div style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                      border: '1.5px solid #86efac',
                      borderRadius: '16px',
                      padding: '18px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      boxShadow: '0 4px 16px rgba(16, 185, 129, 0.08)',
                      boxSizing: 'border-box'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            backgroundColor: '#10b981',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.35)'
                          }}>
                            <CheckCircle2 size={16} />
                          </div>
                          <div>
                            <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#065f46' }}>
                              Officially Acknowledged by Parent
                            </div>
                            <div style={{ fontSize: '12px', color: '#047857', marginTop: '1px' }}>
                              Verified Guardian: <strong>{remark.acknowledgedBy || remark.parentName}</strong>
                            </div>
                          </div>
                        </div>

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '11.5px',
                          color: '#065f46',
                          backgroundColor: '#ffffff',
                          border: '1px solid #a7f3d0',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontWeight: 600,
                          boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
                        }}>
                          <Clock size={12} style={{ color: '#10b981' }} />
                          <span>{formatDate(remark.acknowledgedAt)}</span>
                        </div>
                      </div>

                      {/* Highlighted Guardian Feedback Note */}
                      {remark.parentFeedback && (
                        <div style={{
                          backgroundColor: '#ffffff',
                          border: '1.5px solid #a7f3d0',
                          borderLeft: '4.5px solid #059669',
                          borderRadius: '12px',
                          padding: '14px 18px',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: '6px',
                            marginBottom: '8px'
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '11px',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              color: '#047857'
                            }}>
                              <MessageSquareQuote size={14} style={{ color: '#059669' }} />
                              <span>Parent's Direct Feedback &amp; Action Note</span>
                            </div>

                            <span style={{
                              fontSize: '10.5px',
                              fontWeight: 700,
                              color: '#047857',
                              backgroundColor: '#dcfce7',
                              padding: '2px 8px',
                              borderRadius: '10px'
                            }}>
                              Home Implementation Plan
                            </span>
                          </div>

                          <div style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#064e3b',
                            lineHeight: '1.6',
                            whiteSpace: 'pre-line'
                          }}>
                            "{remark.parentFeedback}"
                          </div>

                          <div style={{
                            marginTop: '10px',
                            paddingTop: '8px',
                            borderTop: '1px dashed #e2e8f0',
                            fontSize: '11px',
                            color: '#059669',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontWeight: 600
                          }}>
                            <ShieldCheck size={13} style={{ color: '#059669' }} />
                            <span>Logged in institutional audit records (`remark_acknowledgments`)</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: CREATE REMARK */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
          boxSizing: 'border-box'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            maxWidth: '640px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-ink)', margin: 0 }}>
                  Send Student Academic Improvement Remark
                </h3>
                <p style={{ color: 'var(--color-slate)', fontSize: '13px', margin: '4px 0 0 0' }}>
                  Dispatches observation directly to the respective parent for their child.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  background: 'var(--color-studio-mist)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {actionError && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '13px',
                marginBottom: '16px'
              }}>
                {actionError}
              </div>
            )}

            <form onSubmit={handleCreateRemark} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Student Dropdown Selector */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-ink)', display: 'block', marginBottom: '6px' }}>
                  Target Student & Enrolled Child *
                </label>
                <select
                  value={formData.studentId}
                  onChange={handleStudentSelect}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid var(--color-hairline-silver)',
                    backgroundColor: 'var(--color-studio-mist)',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                >
                  {students.map(s => (
                    <option key={s.studentId} value={s.studentId}>
                      {s.studentName} ({s.studentId}) — {s.classStandard} Sec {s.section} | Parent: {s.parentName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject & Category Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-ink)', display: 'block', marginBottom: '6px' }}>
                    Academic Subject *
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData(p => ({ ...p, subject: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid var(--color-hairline-silver)',
                      backgroundColor: 'var(--color-studio-mist)',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="English Literature">English Literature</option>
                    <option value="Social Studies">Social Studies</option>
                    <option value="Computer Science">Computer Science</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-ink)', display: 'block', marginBottom: '6px' }}>
                    Observation Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid var(--color-hairline-silver)',
                      backgroundColor: 'var(--color-studio-mist)',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  >
                    <option value="ACADEMIC_PROGRESS">Academic Progress & Mastery</option>
                    <option value="CONCEPTUAL_UNDERSTANDING">Conceptual Clarity & Practical</option>
                    <option value="HOMEWORK_ASSIGNMENTS">Homework & Assignments</option>
                    <option value="CLASS_ATTENTIVENESS">Class Participation & Focus</option>
                    <option value="EXAM_PREPARATION">Exam & Assessment Preparation</option>
                  </select>
                </div>
              </div>

              {/* Severity / Tone */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-ink)', display: 'block', marginBottom: '6px' }}>
                  Remark Priority / Tone
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {[
                    { id: 'PRAISE', label: 'Commendation', bg: '#ecfdf5', color: '#059669' },
                    { id: 'INFO', label: 'Informational', bg: '#eff6ff', color: '#2563eb' },
                    { id: 'ATTENTION_NEEDED', label: 'Attention Needed', bg: '#fffbeb', color: '#d97706' },
                    { id: 'URGENT', label: 'Urgent Action', bg: '#fef2f2', color: '#dc2626' }
                  ].map(t => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setFormData(p => ({ ...p, severity: t.id }))}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        border: formData.severity === t.id ? `2px solid ${t.color}` : '1px solid var(--color-hairline-silver)',
                        backgroundColor: formData.severity === t.id ? t.bg : 'var(--color-studio-mist)',
                        color: formData.severity === t.id ? t.color : 'var(--color-ink)',
                        textAlign: 'center'
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title / Topic */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-ink)', display: 'block', marginBottom: '6px' }}>
                  Remark Topic / Focus Area *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Factorization and Quadratic Formula Proficiency"
                  value={formData.title}
                  onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid var(--color-hairline-silver)',
                    backgroundColor: 'var(--color-studio-mist)',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Detailed Observation */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-ink)', display: 'block', marginBottom: '6px' }}>
                  Teacher Observation & Academic Diagnosis *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe the student's current performance, comprehension gaps, or notable achievements..."
                  value={formData.description}
                  onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid var(--color-hairline-silver)',
                    backgroundColor: 'var(--color-studio-mist)',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Improvement Suggestions */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#6d28d9', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <Sparkles size={14} /> Actionable Suggestions for Parent & Home Practice *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Provide specific, achievable steps for the guardian to review or support at home..."
                  value={formData.improvementSuggestions}
                  onChange={(e) => setFormData(p => ({ ...p, improvementSuggestions: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid #ddd6fe',
                    backgroundColor: '#faf5ff',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    border: '1px solid var(--color-hairline-silver)',
                    backgroundColor: 'transparent',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#0071e3',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px 22px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.7 : 1
                  }}
                >
                  <Send size={15} />
                  <span>{submitting ? 'Dispatching...' : 'Dispatch to Parent'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DELETE CONFIRMATION */}
      {deletingId && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            maxWidth: '440px',
            width: '100%',
            padding: '24px',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <Trash2 size={24} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-ink)', margin: 0 }}>
              Remove Feedback Remark?
            </h3>
            <p style={{ color: 'var(--color-slate)', fontSize: '13px', margin: '8px 0 20px 0', lineHeight: '1.5' }}>
              Are you sure you want to remove this academic improvement feedback? It will be permanently removed from both staff records and parent notifications.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => setDeletingId(null)}
                disabled={isDeleting}
                style={{
                  padding: '9px 18px',
                  borderRadius: '10px',
                  border: '1px solid var(--color-hairline-silver)',
                  backgroundColor: 'transparent',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteRemark(deletingId)}
                disabled={isDeleting}
                style={{
                  padding: '9px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  opacity: isDeleting ? 0.7 : 1
                }}
              >
                {isDeleting ? 'Removing...' : 'Confirm Remove'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW REMARK DETAILS & ACKNOWLEDGMENT AUDIT */}
      {selectedRemarkDetail && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
          boxSizing: 'border-box'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} style={{ color: '#8b5cf6' }} />
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--color-ink)', margin: 0 }}>
                  Academic Remark Audit & Acknowledgment
                </h3>
              </div>
              <button
                onClick={() => setSelectedRemarkDetail(null)}
                style={{
                  background: 'var(--color-studio-mist)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ padding: '14px', background: 'var(--color-studio-mist)', borderRadius: '14px' }}>
                <div style={{ fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Student & Guardian Info
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-ink)', marginTop: '4px' }}>
                  {selectedRemarkDetail.remark?.studentName} ({selectedRemarkDetail.remark?.studentId})
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-slate)', marginTop: '2px' }}>
                  {selectedRemarkDetail.remark?.classStandard} – Section {selectedRemarkDetail.remark?.section} | Parent: {selectedRemarkDetail.remark?.parentName}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-ink)' }}>
                  {selectedRemarkDetail.remark?.title}
                </div>
                <p style={{ fontSize: '13px', color: '#475569', marginTop: '4px', lineHeight: '1.5' }}>
                  {selectedRemarkDetail.remark?.description}
                </p>
              </div>

              <div style={{ padding: '12px', background: '#faf5ff', borderRadius: '12px', border: '1px solid #ede9fe' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase' }}>
                  Improvement Plan
                </div>
                <div style={{ fontSize: '13px', color: '#5b21b6', marginTop: '4px' }}>
                  {selectedRemarkDetail.remark?.improvementSuggestions}
                </div>
              </div>

              {/* Dedicated Acknowledgment Table Audit */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={14} style={{ color: '#16a34a' }} />
                  <span>Separate Table Acknowledgment Records (`remark_acknowledgments`)</span>
                </div>

                {selectedRemarkDetail.acknowledgments && selectedRemarkDetail.acknowledgments.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedRemarkDetail.acknowledgments.map(ack => (
                      <div
                        key={ack.id}
                        style={{
                          border: '1.5px solid #86efac',
                          backgroundColor: '#f0fdf4',
                          borderRadius: '14px',
                          padding: '14px 16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px', fontWeight: 700, color: '#15803d' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <CheckCircle2 size={15} style={{ color: '#10b981' }} />
                            <span>Acknowledged by {ack.parentName}</span>
                          </span>
                          <span style={{ fontSize: '11px', color: '#047857', backgroundColor: '#ffffff', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                            {formatDate(ack.acknowledgedAt)}
                          </span>
                        </div>
                        {ack.parentNotes && (
                          <div style={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #bbf7d0',
                            borderLeft: '4px solid #10b981',
                            borderRadius: '10px',
                            padding: '10px 14px',
                            fontSize: '13px',
                            color: '#064e3b',
                            fontWeight: 600,
                            lineHeight: '1.55'
                          }}>
                            "{ack.parentNotes}"
                          </div>
                        )}
                        <div style={{ fontSize: '11px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                          <ShieldCheck size={12} />
                          <span>Status: {ack.actionStatus} • Verified Record #{ack.id}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: '#fffbeb',
                    border: '1px solid #fde68a',
                    fontSize: '12px',
                    color: '#b45309',
                    textAlign: 'center'
                  }}>
                    Awaiting parent acknowledgment. No acknowledgment records stored yet in `remark_acknowledgments`.
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                onClick={() => setSelectedRemarkDetail(null)}
                style={{
                  padding: '9px 18px',
                  borderRadius: '10px',
                  border: '1px solid var(--color-hairline-silver)',
                  backgroundColor: 'var(--color-studio-mist)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

