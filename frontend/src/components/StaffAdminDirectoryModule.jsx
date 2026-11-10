import React, { useState, useEffect, useMemo } from 'react';
import {
  Send,
  Users,
  User,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  Search,
  Filter,
  Check,
  RefreshCw,
  Building,
  ShieldCheck,
  FileText,
  X,
  Sparkles,
  ArrowRight,
  Eye,
  CheckCheck
} from 'lucide-react';

const GATEWAY_BASE = 'http://localhost:8099/api/staff-admin-directory';
const DIRECT_BASE = 'http://localhost:8109/api/staff-admin-directory';

export default function StaffAdminDirectoryModule({ user, showToast }) {
  const staffUsername = user?.username || 'staff';
  const staffDisplayName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Michael Scott';

  const [directions, setDirections] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  // Filters & Search
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'PERSONAL' | 'BROADCAST' | 'UNSEEN' | 'SEEN' | 'URGENT'
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch summary and directions
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Summary
      const sumUrl = `${GATEWAY_BASE}/summary?username=${encodeURIComponent(staffUsername)}`;
      const sumFallback = `${DIRECT_BASE}/summary?username=${encodeURIComponent(staffUsername)}`;
      let sumRes = await fetch(sumUrl).catch(() => fetch(sumFallback));
      if (sumRes && sumRes.ok) {
        const sumData = await sumRes.json();
        setSummary(sumData);
      }

      // 2. Fetch Directions
      const dirUrl = `${GATEWAY_BASE}/directions?username=${encodeURIComponent(staffUsername)}`;
      const dirFallback = `${DIRECT_BASE}/directions?username=${encodeURIComponent(staffUsername)}`;
      let dirRes = await fetch(dirUrl).catch(() => fetch(dirFallback));
      if (!dirRes || !dirRes.ok) {
        throw new Error(`Failed to load admin directions (${dirRes ? dirRes.status : 'Network error'})`);
      }
      const dirData = await dirRes.json();
      setDirections(Array.isArray(dirData) ? dirData : []);
    } catch (err) {
      console.error('Error fetching staff admin directory:', err);
      setError(err.message || 'Unable to load administrative directives.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [staffUsername]);

  // Format date and time helper
  const formatDateTime = (dateVal) => {
    if (!dateVal) return 'N/A';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return String(dateVal);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }) + ', ' + d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return String(dateVal);
    }
  };

  // 1-Click Toggle Seen / Acknowledged
  const handleToggleSeen = async (dir) => {
    // Broadcast directives sent to ALL_STAFF do not track individual acknowledgment
    if (dir.targetType === 'ALL_STAFF') {
      return;
    }

    const isCurrentlySeen = dir.acknowledged || dir.status === 'ACKNOWLEDGED' || dir.status === 'COMPLETED';
    const nextState = !isCurrentlySeen;
    const nowFormatted = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) + ', ' + new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    // Optimistic update
    setTogglingId(dir.id);
    setDirections((prev) =>
      prev.map((d) => {
        if (d.id === dir.id) {
          return {
            ...d,
            acknowledged: nextState,
            status: nextState ? 'ACKNOWLEDGED' : 'ACTIVE',
            acknowledgedBy: nextState ? (summary?.staffName || staffDisplayName) : null,
            acknowledgedAt: nextState ? nowFormatted : null,
            formattedAcknowledgedAt: nextState ? nowFormatted : null
          };
        }
        return d;
      })
    );

    try {
      const payload = {
        staffUsername: staffUsername,
        staffName: summary?.staffName || staffDisplayName
      };

      const url = `${GATEWAY_BASE}/directions/${dir.id}/toggle-seen`;
      const fallbackUrl = `${DIRECT_BASE}/directions/${dir.id}/toggle-seen`;

      let res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() =>
        fetch(fallbackUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      );

      if (res && res.ok) {
        const updated = await res.json();
        setDirections((prev) =>
          prev.map((d) => (d.id === updated.id ? updated : d))
        );
        if (showToast) {
          showToast(nextState ? '✓ Directive marked as Seen & Acknowledged' : 'Directive marked as Unseen');
        }
      } else {
        // Fallback to acknowledge endpoint if needed
        const ackPayload = {
          staffUsername: staffUsername,
          staffName: summary?.staffName || staffDisplayName,
          status: nextState ? 'ACKNOWLEDGED' : 'ACTIVE',
          responseNote: nextState ? 'Viewed and acknowledged by staff.' : ''
        };
        const ackUrl = `${GATEWAY_BASE}/directions/${dir.id}/acknowledge`;
        const ackFallback = `${DIRECT_BASE}/directions/${dir.id}/acknowledge`;
        let ackRes = await fetch(ackUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ackPayload)
        }).catch(() =>
          fetch(ackFallback, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ackPayload)
          })
        );
        if (ackRes && ackRes.ok) {
          const updated = await ackRes.json();
          setDirections((prev) =>
            prev.map((d) => (d.id === updated.id ? updated : d))
          );
        }
      }
    } catch (err) {
      console.error('Error toggling seen status:', err);
      // Revert optimistic update on failure
      fetchData();
    } finally {
      setTogglingId(null);
    }
  };

  // Filtered list
  const filteredDirections = useMemo(() => {
    return directions.filter((d) => {
      const isTargeted = d.directTarget || d.targetType === 'INDIVIDUAL';
      const isSeen = isTargeted && (d.acknowledged || d.status === 'ACKNOWLEDGED' || d.status === 'COMPLETED');

      // Filter tabs
      if (activeFilter === 'PERSONAL' && !d.directTarget) return false;
      if (activeFilter === 'BROADCAST' && d.targetType !== 'ALL_STAFF') return false;
      if (activeFilter === 'UNSEEN' && (!isTargeted || isSeen)) return false;
      if (activeFilter === 'SEEN' && (!isTargeted || !isSeen)) return false;
      if (activeFilter === 'URGENT' && d.priority !== 'URGENT') return false;

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        d.title?.toLowerCase().includes(q) ||
        d.instruction?.toLowerCase().includes(q) ||
        d.directionCode?.toLowerCase().includes(q) ||
        d.targetDepartment?.toLowerCase().includes(q) ||
        d.issuedBy?.toLowerCase().includes(q)
      );
    });
  }, [directions, activeFilter, searchQuery]);

  // Counts for tabs & summary
  const totalCount = directions.length;
  const personalCount = directions.filter((d) => d.directTarget || d.targetType === 'INDIVIDUAL').length;
  const broadcastCount = directions.filter((d) => d.targetType === 'ALL_STAFF').length;
  const seenCount = directions.filter((d) => (d.directTarget || d.targetType === 'INDIVIDUAL') && (d.acknowledged || d.status === 'ACKNOWLEDGED' || d.status === 'COMPLETED')).length;
  const unseenCount = directions.filter((d) => (d.directTarget || d.targetType === 'INDIVIDUAL') && !(d.acknowledged || d.status === 'ACKNOWLEDGED' || d.status === 'COMPLETED')).length;
  const urgentCount = directions.filter((d) => d.priority === 'URGENT').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* METRIC SUMMARY STAT CARDS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: '14px'
        }}
      >
        {/* Total Directives */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '16px 18px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Total Directives
            </span>
            <FileText size={16} style={{ color: '#2563eb' }} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
            {totalCount}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
            Dispatched by Admin
          </div>
        </div>

        {/* Assigned Specifically to You */}
        <div
          style={{
            background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
            border: '1px solid #bfdbfe',
            borderRadius: '14px',
            padding: '16px 18px',
            boxShadow: '0 2px 6px rgba(37, 99, 235, 0.04)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase' }}>
              Assigned to You
            </span>
            <User size={16} style={{ color: '#2563eb' }} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#172554', marginTop: '6px' }}>
            {personalCount}
          </div>
          <div style={{ fontSize: '11px', color: '#2563eb', marginTop: '2px', fontWeight: 600 }}>
            Individual Directives
          </div>
        </div>

        {/* Campus Broadcasts */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '16px 18px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Broadcasts
            </span>
            <Users size={16} style={{ color: '#7c3aed' }} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#5b21b6', marginTop: '6px' }}>
            {broadcastCount}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
            All-staff directives
          </div>
        </div>

        {/* Awaiting Review (Unseen) */}
        <div
          style={{
            background: 'linear-gradient(135deg, #fffbeb 0%, #ffffff 100%)',
            border: '1px solid #fde68a',
            borderRadius: '14px',
            padding: '16px 18px',
            boxShadow: '0 2px 6px rgba(217, 119, 6, 0.05)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#b45309', textTransform: 'uppercase' }}>
              Awaiting Review
            </span>
            <Clock size={16} style={{ color: '#d97706' }} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#78350f', marginTop: '6px' }}>
            {unseenCount}
          </div>
          <div style={{ fontSize: '11px', color: '#b45309', marginTop: '2px' }}>
            Needs your 1-click toggle
          </div>
        </div>

        {/* Seen & Acknowledged */}
        <div
          style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
            border: '1px solid #bbf7d0',
            borderRadius: '14px',
            padding: '16px 18px',
            boxShadow: '0 2px 6px rgba(16, 185, 129, 0.05)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#047857', textTransform: 'uppercase' }}>
              Seen & Verified
            </span>
            <CheckCircle2 size={16} style={{ color: '#059669' }} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#065f46', marginTop: '6px' }}>
            {seenCount}
          </div>
          <div style={{ fontSize: '11px', color: '#047857', marginTop: '2px', fontWeight: 600 }}>
            Receipt acknowledged
          </div>
        </div>
      </div>

      {/* FILTER BUTTONS & SEARCH BAR */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '16px 20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          {/* Quick Filters */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: 'All Directives', count: totalCount },
              { id: 'PERSONAL', label: 'Assigned to Me', count: personalCount },
              { id: 'BROADCAST', label: 'All Staff Broadcast', count: broadcastCount },
              { id: 'UNSEEN', label: 'Awaiting Review', count: unseenCount },
              { id: 'SEEN', label: 'Seen & Acknowledged', count: seenCount },
              { id: 'URGENT', label: 'Urgent', count: urgentCount }
            ].map((f) => {
              const isSelected = activeFilter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: isSelected ? 700 : 500,
                    border: '1px solid',
                    borderColor: isSelected ? '#2563eb' : '#e2e8f0',
                    background: isSelected ? '#eff6ff' : '#ffffff',
                    color: isSelected ? '#1d4ed8' : '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: isSelected ? '0 1px 3px rgba(37, 99, 235, 0.15)' : 'none'
                  }}
                >
                  <span>{f.label}</span>
                  <span
                    style={{
                      background: isSelected ? '#dbeafe' : '#f1f5f9',
                      color: isSelected ? '#1e40af' : '#64748b',
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: '10px'
                    }}
                  >
                    {f.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input & Refresh */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                padding: '6px 12px',
                width: '260px'
              }}
            >
              <Search size={14} style={{ color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search directives, codes, keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '12px',
                  width: '100%',
                  color: '#0f172a'
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#94a3b8' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <button
              onClick={fetchData}
              title="Refresh directives"
              style={{
                padding: '7px 10px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* DIRECTIVES LIST */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '6px' }}>
          {loading && directions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px auto', display: 'block', color: '#2563eb' }} />
              Loading administrative directives...
            </div>
          ) : filteredDirections.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                background: '#f8fafc',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                color: '#94a3b8'
              }}
            >
              <FileText size={32} style={{ margin: '0 auto 10px auto', display: 'block', color: '#cbd5e1' }} />
              <h4 style={{ fontSize: '15px', color: '#334155', margin: '0 0 4px 0' }}>No directives found</h4>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                {searchQuery
                  ? `No directives match the search query "${searchQuery}".`
                  : 'You have no administrative directives under the selected filter.'}
              </p>
            </div>
          ) : (
            filteredDirections.map((dir) => {
              const isDirect = dir.directTarget || dir.targetType === 'INDIVIDUAL';
              const isUrgent = dir.priority === 'URGENT';
              const isHigh = dir.priority === 'HIGH';
              const isSeen = isDirect && (dir.acknowledged || dir.status === 'ACKNOWLEDGED' || dir.status === 'COMPLETED');
              const isToggling = togglingId === dir.id;

              // Friendly formatted date and time
              const dispatchedDateTime = dir.formattedCreatedAt || formatDateTime(dir.createdAt);
              const acknowledgedDateTime = dir.formattedAcknowledgedAt || dir.acknowledgedAt || formatDateTime(dir.acknowledgedAt);

              return (
                <div
                  key={dir.id || dir.directionCode}
                  style={{
                    border: '1px solid',
                    borderColor: isSeen ? '#bbf7d0' : isDirect ? '#93c5fd' : isUrgent ? '#fecaca' : '#cbd5e1',
                    borderRadius: '14px',
                    background: isSeen
                      ? 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)'
                      : isDirect
                      ? 'linear-gradient(180deg, #eff6ff 0%, #ffffff 100%)'
                      : '#ffffff',
                    padding: '20px 22px',
                    boxShadow: isSeen ? '0 2px 8px rgba(16, 185, 129, 0.05)' : isDirect ? '0 4px 12px rgba(37, 99, 235, 0.06)' : '0 2px 6px rgba(0,0,0,0.02)',
                    position: 'relative',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Top Header Row */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '12px',
                      marginBottom: '10px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            background: '#f1f5f9',
                            color: '#334155',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontFamily: 'monospace',
                            fontSize: '11px',
                            fontWeight: 700,
                            border: '1px solid #e2e8f0'
                          }}
                        >
                          {dir.directionCode}
                        </span>

                        {/* Direct Target vs Broadcast Badge */}
                        {isDirect ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '11px',
                              fontWeight: 800,
                              padding: '3px 10px',
                              borderRadius: '12px',
                              background: '#eff6ff',
                              color: '#1d4ed8',
                              border: '1px solid #93c5fd'
                            }}
                          >
                            <User size={12} />
                            ASSIGNED DIRECTLY TO YOU
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '3px 10px',
                              borderRadius: '12px',
                              background: '#faf5ff',
                              color: '#7c3aed',
                              border: '1px solid #e9d5ff'
                            }}
                          >
                            <Users size={12} />
                            CAMPUS BROADCAST (ALL STAFF)
                          </span>
                        )}

                        {/* Priority Badge */}
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            textTransform: 'uppercase',
                            background: isUrgent ? '#fef2f2' : isHigh ? '#fffbeb' : '#f8fafc',
                            color: isUrgent ? '#dc2626' : isHigh ? '#d97706' : '#475569',
                            border: `1px solid ${isUrgent ? '#fecaca' : isHigh ? '#fde68a' : '#e2e8f0'}`
                          }}
                        >
                          {dir.priority} PRIORITY
                        </span>

                        {/* Stored Dispatch Date & Time Badge */}
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 10px',
                            borderRadius: '10px',
                            background: '#f8fafc',
                            color: '#475569',
                            border: '1px solid #cbd5e1'
                          }}
                          title="Exact administrative dispatch date and time"
                        >
                          <Calendar size={12} style={{ color: '#2563eb' }} />
                          <span>Dispatched: <strong>{dispatchedDateTime}</strong></span>
                        </span>
                      </div>

                      <h3
                        style={{
                          fontSize: '16px',
                          fontWeight: 800,
                          color: '#0f172a',
                          margin: '8px 0 0 0'
                        }}
                      >
                        {dir.title}
                      </h3>
                    </div>

                    {/* ============================================================== */}
                    {/* BROADCAST NOTICE (NO ACK) vs 1-CLICK TOGGLE (FOR TARGETED STAFF) */}
                    {/* ============================================================== */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: '4px'
                      }}
                    >
                      {dir.targetType === 'ALL_STAFF' ? (
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '7px',
                            padding: '6px 14px',
                            borderRadius: '20px',
                            background: '#eff6ff',
                            color: '#1d4ed8',
                            border: '1px solid #bfdbfe',
                            fontSize: '12px',
                            fontWeight: 700
                          }}
                          title="Campus-wide broadcast notice to all staff (No individual acknowledgment required)"
                        >
                          <Users size={14} style={{ color: '#2563eb' }} />
                          <span>Broadcast Notice (No Acknowledgment Required)</span>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleToggleSeen(dir)}
                            disabled={isToggling}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '10px',
                              padding: '6px 14px',
                              borderRadius: '24px',
                              border: `1.5px solid ${isSeen ? '#059669' : '#cbd5e1'}`,
                              background: isSeen ? '#ecfdf5' : '#ffffff',
                              cursor: isToggling ? 'wait' : 'pointer',
                              boxShadow: isSeen ? '0 2px 8px rgba(16, 185, 129, 0.15)' : '0 1px 3px rgba(0,0,0,0.05)',
                              transition: 'all 0.2s ease',
                              outline: 'none'
                            }}
                            title={isSeen ? 'Click to toggle back to unread' : 'Click 1-click toggle to mark seen & acknowledged'}
                          >
                            {/* Apple-style Toggle Switch track & knob */}
                            <div
                              style={{
                                width: '38px',
                                height: '22px',
                                borderRadius: '12px',
                                background: isSeen ? '#10b981' : '#cbd5e1',
                                position: 'relative',
                                transition: 'background 0.25s ease',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '2px',
                                boxSizing: 'border-box'
                              }}
                            >
                              <div
                                style={{
                                  width: '18px',
                                  height: '18px',
                                  borderRadius: '50%',
                                  background: '#ffffff',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
                                  transform: isSeen ? 'translateX(16px)' : 'translateX(0px)',
                                  transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                {isSeen ? (
                                  <Check size={11} style={{ color: '#059669', strokeWidth: 3 }} />
                                ) : (
                                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#94a3b8' }} />
                                )}
                              </div>
                            </div>

                            {/* Status Label */}
                            <div style={{ textAlign: 'left' }}>
                              <div
                                style={{
                                  fontSize: '12px',
                                  fontWeight: 800,
                                  color: isSeen ? '#065f46' : '#475569',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                {isSeen ? 'Seen & Acknowledged' : 'Mark as Seen'}
                              </div>
                            </div>
                          </button>

                          {/* Acknowledged Timestamp detail */}
                          {isSeen && acknowledgedDateTime && (
                            <div
                              style={{
                                fontSize: '11px',
                                color: '#059669',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                marginTop: '2px'
                              }}
                            >
                              <CheckCheck size={12} />
                              <span>Acknowledged: {acknowledgedDateTime}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Instruction Callout Box */}
                  <div
                    style={{
                      background: isSeen ? '#ffffff' : '#f8fafc',
                      borderLeft: `4px solid ${isSeen ? '#10b981' : isDirect ? '#2563eb' : isUrgent ? '#ef4444' : '#059669'}`,
                      padding: '14px 18px',
                      borderRadius: '0 10px 10px 0',
                      fontSize: '13px',
                      color: '#1e293b',
                      lineHeight: '1.6',
                      margin: '12px 0',
                      whiteSpace: 'pre-line',
                      borderTop: '1px solid #f1f5f9',
                      borderRight: '1px solid #f1f5f9',
                      borderBottom: '1px solid #f1f5f9'
                    }}
                  >
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Admin Guidance & Direction:
                    </div>
                    {dir.instruction}
                  </div>

                  {/* Directive Metadata Footer */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '11px',
                      color: '#64748b',
                      marginTop: '12px',
                      borderTop: '1px solid #f1f5f9',
                      paddingTop: '10px',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span>
                        Issued by: <strong>{dir.issuedBy || 'Super Administrator'}</strong>
                      </span>
                      {dir.targetDepartment && (
                        <span>
                          Department: <strong>{dir.targetDepartment}</strong>
                        </span>
                      )}
                      {dir.dueDate && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#b45309', fontWeight: 600 }}>
                          <Calendar size={12} /> Due: {dir.dueDate}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>Stored Dispatch Time:</span>
                      <strong style={{ color: '#1e293b' }}>{dispatchedDateTime}</strong>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
