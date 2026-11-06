import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  MessageSquare,
  Send,
  User,
  BookOpen,
  Calendar,
  AlertCircle,
  HelpCircle,
  Search,
  Filter,
  Check,
  X,
  FileText,
  MessageSquareQuote,
  ShieldCheck
} from 'lucide-react';

const GATEWAY_URL = 'http://localhost:8099/api/teacher-remarks';
const DIRECT_URL = 'http://localhost:8106/api/teacher-remarks';

export default function ParentRemarksModule({ user, decodedClaims, currentRole = 'PARENT' }) {
  const [remarks, setRemarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, PENDING, ACKNOWLEDGED
  const [searchQuery, setSearchQuery] = useState('');

  // Acknowledgment modal
  const [acknowledgingRemark, setAcknowledgingRemark] = useState(null);
  const [parentNotes, setParentNotes] = useState('');
  const [submittingAck, setSubmittingAck] = useState(false);
  const [ackSuccessMessage, setAckSuccessMessage] = useState(null);

  const parentUsername = user?.username || decodedClaims?.username || 'parent';
  const parentFullName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : (decodedClaims?.firstName ? `${decodedClaims.firstName} ${decodedClaims.lastName || ''}`.trim() : 'Robert Patterson');

  const fetchRemarks = async () => {
    setLoading(true);
    try {
      let res;
      try {
        res = await fetch(`${GATEWAY_URL}/parent?username=${parentUsername}`);
      } catch (e) {
        res = await fetch(`${DIRECT_URL}/parent?username=${parentUsername}`);
      }
      if (res.ok) {
        const data = await res.json();
        setRemarks(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load child remarks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRemarks();
  }, [parentUsername]);

  const handleAcknowledgeSubmit = async (e) => {
    e.preventDefault();
    if (!acknowledgingRemark) return;

    setSubmittingAck(true);
    const payload = {
      parentUsername,
      parentName: parentFullName,
      parentNotes: parentNotes.trim() || 'Acknowledged by parent.'
    };

    try {
      let res;
      try {
        res = await fetch(`${GATEWAY_URL}/${acknowledgingRemark.id}/acknowledge`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        res = await fetch(`${DIRECT_URL}/${acknowledgingRemark.id}/acknowledge`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        const detail = await res.json();
        // Update local list
        setRemarks(prev => prev.map(r => (r.id === acknowledgingRemark.id ? detail.remark : r)));
        setAckSuccessMessage(`Thank you! Acknowledgment with timestamp recorded in official records.`);
        setTimeout(() => setAckSuccessMessage(null), 5000);
        setAcknowledgingRemark(null);
        setParentNotes('');
      } else {
        alert('Failed to submit acknowledgment.');
      }
    } catch (err) {
      alert('Error connecting to server.');
    } finally {
      setSubmittingAck(false);
    }
  };

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
        return { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', label: 'Urgent Action Required' };
      case 'ATTENTION_NEEDED':
        return { bg: '#fffbeb', color: '#d97706', border: '#fde68a', label: 'Attention Needed' };
      default:
        return { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe', label: 'Informational' };
    }
  };

  const filteredRemarks = remarks.filter(r => {
    if (filterStatus === 'PENDING' && r.acknowledged) return false;
    if (filterStatus === 'ACKNOWLEDGED' && !r.acknowledged) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = r.studentName?.toLowerCase().includes(q);
      const matchSub = r.subject?.toLowerCase().includes(q);
      const matchTitle = r.title?.toLowerCase().includes(q);
      const matchTeacher = r.teacherName?.toLowerCase().includes(q);
      return matchName || matchSub || matchTitle || matchTeacher;
    }
    return true;
  });

  const totalCount = remarks.length;
  const ackCount = remarks.filter(r => r.acknowledged).length;
  const pendingCount = totalCount - ackCount;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Success Notification */}
      {ackSuccessMessage && (
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
          <span>{ackSuccessMessage}</span>
        </div>
      )}

      {/* HEADER CARD */}
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
            background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 16px rgba(126, 34, 206, 0.25)'
          }}>
            <Sparkles size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-ink)', margin: 0 }}>
              Teacher Academic Remarks & Guidance
            </h3>
            <p style={{ color: 'var(--color-slate)', fontSize: '13px', margin: '4px 0 0 0' }}>
              Academic progress observations and actionable improvement recommendations sent specifically for your children.
            </p>
          </div>
        </div>

        {/* Quick summary badges */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{
            backgroundColor: '#eff6ff',
            color: '#1d4ed8',
            border: '1px solid #bfdbfe',
            padding: '6px 14px',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: 600
          }}>
            {pendingCount} Awaiting Acknowledgment
          </div>
          <div style={{
            backgroundColor: '#f0fdf4',
            color: '#16a34a',
            border: '1px solid #bbf7d0',
            padding: '6px 14px',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: 600
          }}>
            {ackCount} Acknowledged
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH */}
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
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: `All Remarks (${totalCount})` },
            { id: 'PENDING', label: `Needs Acknowledgment (${pendingCount})` },
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
                border: filterStatus === tab.id ? '1px solid #7c3aed' : '1px solid var(--color-hairline-silver)',
                backgroundColor: filterStatus === tab.id ? '#faf5ff' : 'var(--color-studio-mist)',
                color: filterStatus === tab.id ? '#7c3aed' : 'var(--color-ink)'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', minWidth: '240px', flex: '1', maxWidth: '360px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-slate)' }} />
          <input
            type="text"
            placeholder="Search by child, subject, or teacher..."
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

      {/* REMARKS CARDS */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-slate)' }}>
          <Clock size={28} style={{ animation: 'spin 1.5s linear infinite', margin: '0 auto 12px auto', display: 'block' }} />
          <span>Loading academic remarks from faculty...</span>
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
          <p style={{ color: 'var(--color-slate)', fontSize: '13px', marginTop: '6px' }}>
            {searchQuery ? 'No remarks match your search criteria.' : 'No improvement remarks have been dispatched for your children under this filter.'}
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
                  border: remark.acknowledged ? '1px solid var(--color-hairline-silver)' : '1.5px solid #fed7aa',
                  borderRadius: '18px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  boxShadow: remark.acknowledged ? '0 2px 8px rgba(0,0,0,0.02)' : '0 4px 16px rgba(251, 146, 60, 0.08)'
                }}
              >
                {/* Child & Teacher Meta Header */}
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
                      Child: {remark.studentName} ({remark.studentId})
                    </span>

                    <span style={{ fontSize: '13px', color: 'var(--color-slate)' }}>
                      {remark.classStandard} – Section {remark.section}
                    </span>

                    <span style={{
                      backgroundColor: sevBadge.bg,
                      color: sevBadge.color,
                      border: `1px solid ${sevBadge.border}`,
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      textTransform: 'uppercase'
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

                  <div style={{ fontSize: '12px', color: 'var(--color-slate)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={13} />
                    <span>Dispatched on {formatDate(remark.createdAt)}</span>
                  </div>
                </div>

                {/* Topic & Observation */}
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-ink)', margin: '0 0 6px 0' }}>
                    {remark.title}
                  </h4>
                  <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: '1.55', margin: 0, whiteSpace: 'pre-line' }}>
                    {remark.description}
                  </p>
                </div>

                {/* Actionable Improvement Suggestions Highlight Card */}
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
                      <span>Actionable Guidance for Home Support &amp; Practice</span>
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
                      Faculty Recommended Next Steps
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

                {/* Teacher evaluation attribution */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--color-slate)' }}>
                  <User size={13} style={{ color: 'var(--color-slate)' }} />
                  <span>Evaluated by: <strong style={{ color: 'var(--color-ink)' }}>{remark.teacherName}</strong> ({remark.teacherEmail || 'Faculty'})</span>
                </div>

                {/* Acknowledgment & Highlighted Textual Feedback */}
                <div style={{ paddingTop: '8px' }}>
                  {remark.acknowledged ? (
                    <div style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                      border: '1.5px solid #86efac',
                      borderRadius: '16px',
                      padding: '18px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                      boxShadow: '0 4px 16px rgba(16, 185, 129, 0.08)',
                      boxSizing: 'border-box'
                    }}>
                      {/* Status Header */}
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
                              Officially Acknowledged by Guardian
                            </div>
                            <div style={{ fontSize: '12px', color: '#047857', marginTop: '1px' }}>
                              Verified Guardian: <strong>{remark.acknowledgedBy || parentFullName}</strong>
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

                      {/* Highlighted Guardian Textual Feedback Box */}
                      {remark.parentFeedback && (
                        <div style={{
                          backgroundColor: '#ffffff',
                          border: '1.5px solid #a7f3d0',
                          borderLeft: '4.5px solid #059669',
                          borderRadius: '12px',
                          padding: '14px 18px',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
                          position: 'relative'
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
                              <span>Guardian's Direct Feedback &amp; Action Note</span>
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
                            fontStyle: 'normal',
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
                            <span>Logged in institutional audit records (`remark_acknowledgments`) and synchronized with faculty portal</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{
                      width: '100%',
                      backgroundColor: '#fffbeb',
                      border: '1.5px solid #fed7aa',
                      borderLeft: '4.5px solid #f59e0b',
                      borderRadius: '14px',
                      padding: '16px 20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '14px',
                      boxShadow: '0 2px 10px rgba(245, 158, 11, 0.05)',
                      boxSizing: 'border-box'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: '#fef3c7',
                          color: '#d97706',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <Clock size={18} />
                        </div>
                        <div>
                          <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#92400e' }}>
                            Pending Guardian Acknowledgment
                          </div>
                          <div style={{ fontSize: '12px', color: '#b45309', marginTop: '2px' }}>
                            Faculty has requested your acknowledgment for this academic improvement plan.
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setAcknowledgingRemark(remark);
                          setParentNotes('');
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          backgroundColor: '#059669',
                          color: '#ffffff',
                          border: 'none',
                          padding: '10px 22px',
                          borderRadius: '12px',
                          fontSize: '13.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: '0 4px 14px rgba(5, 150, 105, 0.28)',
                          transition: 'all 0.2s'
                        }}
                      >
                        <CheckCircle2 size={16} />
                        <span>Acknowledge to Staff</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ACKNOWLEDGE MODAL */}
      {acknowledgingRemark && (
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
            borderRadius: '24px',
            maxWidth: '520px',
            width: '100%',
            padding: '26px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={20} style={{ color: '#059669' }} />
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--color-ink)', margin: 0 }}>
                  Acknowledge Remark to Faculty
                </h3>
              </div>
              <button
                onClick={() => setAcknowledgingRemark(null)}
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

            <div style={{
              backgroundColor: 'var(--color-studio-mist)',
              border: '1px solid var(--color-hairline-silver)',
              borderRadius: '12px',
              padding: '12px 14px',
              marginBottom: '16px'
            }}>
              <div style={{ fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase', fontWeight: 600 }}>
                Regarding Student
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-ink)', marginTop: '2px' }}>
                {acknowledgingRemark.studentName} — {acknowledgingRemark.subject}
              </div>
              <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                "{acknowledgingRemark.title}"
              </div>
            </div>

            <form onSubmit={handleAcknowledgeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-ink)', display: 'block', marginBottom: '6px' }}>
                  Optional Parent Reply / Implementation Note
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g., Thank you teacher. We have reviewed the suggestions and will practice daily with Alex..."
                  value={parentNotes}
                  onChange={(e) => setParentNotes(e.target.value)}
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

              <div style={{ fontSize: '11px', color: 'var(--color-slate)' }}>
                * Your acknowledgment date and time will be recorded in the institutional audit log and visible to faculty.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setAcknowledgingRemark(null)}
                  style={{
                    padding: '9px 16px',
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
                  disabled={submittingAck}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    padding: '9px 20px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: submittingAck ? 'not-allowed' : 'pointer',
                    opacity: submittingAck ? 0.7 : 1
                  }}
                >
                  <CheckCircle2 size={15} />
                  <span>{submittingAck ? 'Submitting...' : 'Confirm Acknowledgment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

