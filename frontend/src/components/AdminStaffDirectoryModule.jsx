import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Send,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Trash2,
  Check,
  RefreshCw,
  Building,
  GraduationCap,
  Calendar,
  X,
  User,
  CheckCircle,
  FileText,
  Sparkles,
  ArrowRight,
  Filter
} from 'lucide-react';

const GATEWAY_BASE = 'http://localhost:8099/api/admin-staff-directory';
const DIRECT_BASE = 'http://localhost:8108/api/admin-staff-directory';

export default function AdminStaffDirectoryModule({ user }) {
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'directions'
  const [staffList, setStaffList] = useState([]);
  const [directions, setDirections] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL'); // 'ALL' | 'FACULTY' | 'ADMINISTRATIVE'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'COMPLETED'

  // Modal / Form state for sending direction
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [targetType, setTargetType] = useState('ALL_STAFF'); // 'ALL_STAFF' | 'INDIVIDUAL'
  const [selectedStaffCode, setSelectedStaffCode] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formInstruction, setFormInstruction] = useState('');
  const [formPriority, setFormPriority] = useState('NORMAL'); // 'NORMAL' | 'HIGH' | 'URGENT'
  const [formDueDate, setFormDueDate] = useState('');

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch Staff
      const staffRes = await fetch(`${GATEWAY_BASE}/staff`).catch(() => fetch(`${DIRECT_BASE}/staff`));
      if (!staffRes.ok) throw new Error(`Failed to load staff directory (${staffRes.status})`);
      const staffData = await staffRes.json();
      setStaffList(staffData);

      // Fetch Directions
      const dirRes = await fetch(`${GATEWAY_BASE}/directions`).catch(() => fetch(`${DIRECT_BASE}/directions`));
      if (dirRes.ok) {
        const dirData = await dirRes.json();
        setDirections(dirData);
      }

      // Fetch Stats
      const statsRes = await fetch(`${GATEWAY_BASE}/stats`).catch(() => fetch(`${DIRECT_BASE}/stats`));
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (err) {
      console.error('Error fetching admin staff directory data:', err);
      setError(err.message || 'Unable to load staff directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Quick message auto-dismiss
  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => setSuccessMessage(null), 4000);
      return () => clearTimeout(t);
    }
  }, [successMessage]);

  // Open modal pre-selected for specific staff member
  const handleOpenSendModalForStaff = (staff) => {
    if (staff) {
      setTargetType('INDIVIDUAL');
      setSelectedStaffCode(staff.staffCode);
    } else {
      setTargetType('ALL_STAFF');
      setSelectedStaffCode('');
    }
    setFormTitle('');
    setFormInstruction('');
    setFormPriority('NORMAL');
    setFormDueDate('');
    setIsModalOpen(true);
  };

  // Submit new direction
  const handleCreateDirection = async (e) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('Please enter a title for the direction.');
      return;
    }
    if (!formInstruction.trim()) {
      alert('Please provide instructions for the staff.');
      return;
    }
    if (targetType === 'INDIVIDUAL' && !selectedStaffCode) {
      alert('Please select a specific staff member.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: formTitle.trim(),
        instruction: formInstruction.trim(),
        targetType: targetType,
        targetStaffCode: targetType === 'ALL_STAFF' ? 'ALL' : selectedStaffCode,
        priority: formPriority,
        dueDate: formDueDate || null,
        issuedBy: user?.username ? `Admin (${user.username})` : 'Super Administrator'
      };

      const res = await fetch(`${GATEWAY_BASE}/directions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() =>
        fetch(`${DIRECT_BASE}/directions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      );

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP error ${res.status}`);
      }

      setIsModalOpen(false);
      setSuccessMessage('Administrative direction dispatched successfully!');
      fetchData();
    } catch (err) {
      console.error('Error creating direction:', err);
      alert('Failed to send direction: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle status
  const handleToggleStatus = async (direction) => {
    const newStatus = direction.status === 'ACTIVE' ? 'COMPLETED' : 'ACTIVE';
    try {
      const res = await fetch(`${GATEWAY_BASE}/directions/${direction.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      }).catch(() =>
        fetch(`${DIRECT_BASE}/directions/${direction.id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        })
      );

      if (res.ok) {
        setDirections((prev) =>
          prev.map((d) => (d.id === direction.id ? { ...d, status: newStatus } : d))
        );
        setSuccessMessage(`Direction status updated to ${newStatus}.`);
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  // Delete direction
  const handleDeleteDirection = async (id) => {
    if (!window.confirm('Are you sure you want to remove this direction?')) return;
    try {
      const res = await fetch(`${GATEWAY_BASE}/directions/${id}`, {
        method: 'DELETE'
      }).catch(() => fetch(`${DIRECT_BASE}/directions/${id}`, { method: 'DELETE' }));

      if (res.ok) {
        setDirections((prev) => prev.filter((d) => d.id !== id));
        setSuccessMessage('Direction deleted successfully.');
      }
    } catch (err) {
      console.error('Error deleting direction:', err);
    }
  };

  // Filtered staff list
  const filteredStaff = useMemo(() => {
    return staffList.filter((s) => {
      if (roleFilter !== 'ALL' && s.role !== roleFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        s.fullName?.toLowerCase().includes(q) ||
        s.staffCode?.toLowerCase().includes(q) ||
        s.department?.toLowerCase().includes(q) ||
        s.designation?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.phone?.toLowerCase().includes(q)
      );
    });
  }, [staffList, roleFilter, searchQuery]);

  // Filtered directions list
  const filteredDirections = useMemo(() => {
    return directions.filter((d) => {
      if (statusFilter !== 'ALL' && d.status !== statusFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        d.title?.toLowerCase().includes(q) ||
        d.instruction?.toLowerCase().includes(q) ||
        d.targetStaffName?.toLowerCase().includes(q) ||
        d.targetStaffCode?.toLowerCase().includes(q) ||
        d.directionCode?.toLowerCase().includes(q) ||
        d.targetDepartment?.toLowerCase().includes(q)
      );
    });
  }, [directions, statusFilter, searchQuery]);

  const activeDirectionsCount = directions.filter((d) => d.status === 'ACTIVE').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* SUCCESS NOTIFICATION */}
      {successMessage && (
        <div
          style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            borderRadius: '12px',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '13px',
            fontWeight: 600,
            boxShadow: '0 2px 6px rgba(16, 185, 129, 0.1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#047857' }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* TOP HEADER & ACTION BAR */}
      <div
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '20px 24px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Users size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Staff Directory & Directives
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                Campus faculty directory and administrative instruction dispatch
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={fetchData}
            title="Refresh Directory"
            style={{
              padding: '8px 12px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#475569',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 600,
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => handleOpenSendModalForStaff(null)}
            style={{
              padding: '9px 18px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              fontWeight: 700,
              boxShadow: '0 2px 6px rgba(5, 150, 105, 0.3)',
              transition: 'transform 0.15s ease'
            }}
          >
            <Plus size={16} />
            <span>Send Direction</span>
          </button>
        </div>
      </div>

      {/* METRIC SUMMARY CARDS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px'
        }}
      >
        {/* Total Staff */}
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
              Total Campus Staff
            </span>
            <Users size={16} style={{ color: '#059669' }} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
            {stats?.totalStaff ?? staffList.length}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
            Across all campus faculties & admin
          </div>
        </div>

        {/* Teaching Faculty */}
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
              Teaching Faculty
            </span>
            <GraduationCap size={16} style={{ color: '#2563eb' }} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#1e40af', marginTop: '6px' }}>
            {stats?.facultyCount ?? staffList.filter((s) => s.role === 'FACULTY').length}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
            Subject instructors & teachers
          </div>
        </div>

        {/* Administrative Staff */}
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
              Administrative Staff
            </span>
            <Building size={16} style={{ color: '#7c3aed' }} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#6d28d9', marginTop: '6px' }}>
            {stats?.administrativeCount ?? staffList.filter((s) => s.role === 'ADMINISTRATIVE').length}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
            Operations, Finance & Records
          </div>
        </div>

        {/* Active Directives */}
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
              Active Directives
            </span>
            <Send size={16} style={{ color: '#059669' }} />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#065f46', marginTop: '6px' }}>
            {activeDirectionsCount}
          </div>
          <div style={{ fontSize: '11px', color: '#047857', marginTop: '2px' }}>
            Dispatched to staff members
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS & SEARCH CONTROLS */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '16px 20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '14px',
            marginBottom: '16px'
          }}
        >
          {/* TAB BUTTONS */}
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '10px', padding: '3px' }}>
            <button
              onClick={() => setActiveTab('directory')}
              style={{
                padding: '7px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: activeTab === 'directory' ? 700 : 500,
                border: 'none',
                background: activeTab === 'directory' ? '#ffffff' : 'transparent',
                color: activeTab === 'directory' ? '#059669' : '#64748b',
                boxShadow: activeTab === 'directory' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Users size={15} />
              <span>Staff Directory ({staffList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('directions')}
              style={{
                padding: '7px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: activeTab === 'directions' ? 700 : 500,
                border: 'none',
                background: activeTab === 'directions' ? '#ffffff' : 'transparent',
                color: activeTab === 'directions' ? '#2563eb' : '#64748b',
                boxShadow: activeTab === 'directions' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FileText size={15} />
              <span>Directives Log ({directions.length})</span>
            </button>
          </div>

          {/* SEARCH BAR */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
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
                placeholder={
                  activeTab === 'directory'
                    ? 'Search name, department, role...'
                    : 'Search directives, recipient, code...'
                }
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

            {/* Quick Filters */}
            {activeTab === 'directory' ? (
              <div style={{ display: 'flex', gap: '6px' }}>
                {['ALL', 'FACULTY', 'ADMINISTRATIVE'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRoleFilter(r)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: roleFilter === r ? 700 : 500,
                      border: '1px solid',
                      borderColor: roleFilter === r ? '#059669' : '#e2e8f0',
                      background: roleFilter === r ? '#ecfdf5' : '#ffffff',
                      color: roleFilter === r ? '#047857' : '#64748b',
                      cursor: 'pointer'
                    }}
                  >
                    {r === 'ALL' ? 'All Roles' : r === 'FACULTY' ? 'Faculty' : 'Admin'}
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '6px' }}>
                {['ALL', 'ACTIVE', 'COMPLETED'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: statusFilter === s ? 700 : 500,
                      border: '1px solid',
                      borderColor: statusFilter === s ? '#2563eb' : '#e2e8f0',
                      background: statusFilter === s ? '#eff6ff' : '#ffffff',
                      color: statusFilter === s ? '#1d4ed8' : '#64748b',
                      cursor: 'pointer'
                    }}
                  >
                    {s === 'ALL' ? 'All Directives' : s === 'ACTIVE' ? 'Active' : 'Completed'}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: STAFF DIRECTORY LIST */}
        {/* ============================================================== */}
        {activeTab === 'directory' && (
          <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                  <th style={{ padding: '12px 16px' }}>Staff Member</th>
                  <th style={{ padding: '12px 16px' }}>Staff ID</th>
                  <th style={{ padding: '12px 16px' }}>Role & Designation</th>
                  <th style={{ padding: '12px 16px' }}>Department</th>
                  <th style={{ padding: '12px 16px' }}>Contact Information</th>
                  <th style={{ padding: '12px 16px' }}>Active Directives</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                      <Users size={28} style={{ margin: '0 auto 8px auto', display: 'block', color: '#cbd5e1' }} />
                      No staff members found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((staff) => {
                    const isFaculty = staff.role === 'FACULTY';
                    return (
                      <tr
                        key={staff.staffCode}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        {/* Name with Avatar */}
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div
                              style={{
                                width: '34px',
                                height: '34px',
                                borderRadius: '50%',
                                background: isFaculty ? '#eff6ff' : '#faf5ff',
                                color: isFaculty ? '#2563eb' : '#7c3aed',
                                border: `1px solid ${isFaculty ? '#bfdbfe' : '#e9d5ff'}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: '13px'
                              }}
                            >
                              {staff.fullName ? staff.fullName.charAt(0) : 'S'}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: '#0f172a' }}>{staff.fullName}</div>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>@{staff.username || 'staff'}</div>
                            </div>
                          </div>
                        </td>

                        {/* Staff Code */}
                        <td style={{ padding: '12px 16px' }}>
                          <span
                            style={{
                              background: '#f1f5f9',
                              color: '#334155',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontFamily: 'monospace',
                              fontSize: '11px',
                              fontWeight: 600,
                              border: '1px solid #e2e8f0'
                            }}
                          >
                            {staff.staffCode}
                          </span>
                        </td>

                        {/* Role & Designation */}
                        <td style={{ padding: '12px 16px' }}>
                          <div>
                            <span
                              style={{
                                display: 'inline-block',
                                fontSize: '10px',
                                fontWeight: 700,
                                padding: '2px 6px',
                                borderRadius: '4px',
                                background: isFaculty ? '#ecfdf5' : '#fef3c7',
                                color: isFaculty ? '#047857' : '#b45309',
                                border: `1px solid ${isFaculty ? '#a7f3d0' : '#fde68a'}`,
                                marginBottom: '2px'
                              }}
                            >
                              {staff.role}
                            </span>
                            <div style={{ fontSize: '12px', color: '#334155', fontWeight: 500 }}>
                              {staff.designation || 'Staff Member'}
                            </div>
                          </div>
                        </td>

                        {/* Department */}
                        <td style={{ padding: '12px 16px', color: '#475569' }}>
                          {staff.department || 'General'}
                        </td>

                        {/* Contact info */}
                        <td style={{ padding: '12px 16px', fontSize: '12px' }}>
                          <div style={{ color: '#0f172a' }}>{staff.email}</div>
                          <div style={{ color: '#64748b', fontSize: '11px' }}>{staff.phone || '—'}</div>
                        </td>

                        {/* Active Directives */}
                        <td style={{ padding: '12px 16px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '11px',
                              fontWeight: 600,
                              background: staff.activeDirectivesCount > 0 ? '#eff6ff' : '#f8fafc',
                              color: staff.activeDirectivesCount > 0 ? '#1d4ed8' : '#94a3b8',
                              padding: '3px 8px',
                              borderRadius: '12px',
                              border: `1px solid ${staff.activeDirectivesCount > 0 ? '#bfdbfe' : '#e2e8f0'}`
                            }}
                          >
                            <Send size={11} />
                            {staff.activeDirectivesCount} active
                          </span>
                        </td>

                        {/* Send Direction Action */}
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <button
                            onClick={() => handleOpenSendModalForStaff(staff)}
                            style={{
                              background: '#ecfdf5',
                              border: '1px solid #a7f3d0',
                              color: '#047857',
                              padding: '5px 12px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <Send size={12} />
                            <span>Send Direction</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: DIRECTIVES LOG (DIRECTIONS SENT) */}
        {/* ============================================================== */}
        {activeTab === 'directions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredDirections.length === 0 ? (
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
                  No directions match the current filters. Click "Send Direction" above to dispatch one.
                </p>
              </div>
            ) : (
              filteredDirections.map((dir) => {
                const isAll = dir.targetType === 'ALL_STAFF';
                const isCompleted = dir.status === 'COMPLETED';
                const isUrgent = dir.priority === 'URGENT';
                const isHigh = dir.priority === 'HIGH';

                return (
                  <div
                    key={dir.id || dir.directionCode}
                    style={{
                      border: '1px solid',
                      borderColor: isUrgent ? '#fecaca' : isCompleted ? '#e2e8f0' : '#bfdbfe',
                      borderRadius: '14px',
                      background: isCompleted ? '#fbfcfe' : '#ffffff',
                      padding: '18px 20px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                      position: 'relative'
                    }}
                  >
                    {/* Header line */}
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '10px',
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

                          {/* Recipient Badge */}
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '2px 10px',
                              borderRadius: '12px',
                              background: isAll ? '#faf5ff' : '#eff6ff',
                              color: isAll ? '#7c3aed' : '#1d4ed8',
                              border: `1px solid ${isAll ? '#e9d5ff' : '#bfdbfe'}`
                            }}
                          >
                            <Users size={12} />
                            {isAll ? 'BROADCAST: ALL STAFF MEMBERS' : `TARGET: ${dir.targetStaffName} (${dir.targetStaffCode})`}
                          </span>

                          {/* Priority Badge */}
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '6px',
                              textTransform: 'uppercase',
                              background: isUrgent ? '#fef2f2' : isHigh ? '#fffbeb' : '#f0fdf4',
                              color: isUrgent ? '#dc2626' : isHigh ? '#d97706' : '#059669',
                              border: `1px solid ${isUrgent ? '#fecaca' : isHigh ? '#fde68a' : '#bbf7d0'}`
                            }}
                          >
                            {dir.priority} PRIORITY
                          </span>

                          {/* Status Badge */}
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '2px 8px',
                              borderRadius: '10px',
                              background: isCompleted ? '#f1f5f9' : '#ecfdf5',
                              color: isCompleted ? '#64748b' : '#047857'
                            }}
                          >
                            {isCompleted ? <CheckCircle size={12} /> : <Clock size={12} />}
                            {dir.status}
                          </span>
                        </div>

                        <h4
                          style={{
                            fontSize: '15px',
                            fontWeight: 700,
                            color: '#0f172a',
                            margin: '8px 0 0 0'
                          }}
                        >
                          {dir.title}
                        </h4>
                      </div>

                      {/* Top right actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => handleToggleStatus(dir)}
                          title={isCompleted ? 'Mark Active' : 'Mark as Completed'}
                          style={{
                            padding: '5px 10px',
                            borderRadius: '8px',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: isCompleted ? '#eff6ff' : '#f0fdf4',
                            color: isCompleted ? '#1d4ed8' : '#047857',
                            border: `1px solid ${isCompleted ? '#bfdbfe' : '#a7f3d0'}`
                          }}
                        >
                          {isCompleted ? <Clock size={12} /> : <Check size={12} />}
                          {isCompleted ? 'Reopen' : 'Mark Completed'}
                        </button>

                        <button
                          onClick={() => handleDeleteDirection(dir.id)}
                          title="Delete Direction"
                          style={{
                            padding: '5px 8px',
                            borderRadius: '8px',
                            fontSize: '11px',
                            cursor: 'pointer',
                            background: '#fef2f2',
                            color: '#dc2626',
                            border: '1px solid #fecaca'
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Instruction Box */}
                    <div
                      style={{
                        background: '#f8fafc',
                        borderLeft: `3px solid ${isUrgent ? '#ef4444' : '#059669'}`,
                        padding: '12px 16px',
                        borderRadius: '0 8px 8px 0',
                        fontSize: '13px',
                        color: '#1e293b',
                        lineHeight: '1.5',
                        margin: '10px 0'
                      }}
                    >
                      {dir.instruction}
                    </div>

                    {/* Metadata footer */}
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '11px',
                        color: '#64748b',
                        marginTop: '10px',
                        borderTop: '1px solid #f1f5f9',
                        paddingTop: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <span>
                          Issued by: <strong>{dir.issuedBy || 'Super Administrator'}</strong>
                        </span>
                        {dir.targetDepartment && (
                          <span>
                            Department: <strong>{dir.targetDepartment}</strong>
                          </span>
                        )}
                        {dir.dueDate && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#b45309' }}>
                            <Calendar size={11} /> Due: <strong>{dir.dueDate}</strong>
                          </span>
                        )}
                      </div>
                      <div>Dispatched on: {dir.createdAt ? new Date(dir.createdAt).toLocaleDateString() : 'Active'}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* SIMPLE SEND DIRECTION MODAL */}
      {/* ============================================================== */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(3px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '560px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
              border: '1px solid #cbd5e1',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '18px 24px',
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Send size={18} />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>
                  Dispatch Direction to Staff
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateDirection} style={{ padding: '24px' }}>
              {/* TARGET TYPE SELECTION */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                  Target Recipient
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setTargetType('ALL_STAFF')}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '2px solid',
                      borderColor: targetType === 'ALL_STAFF' ? '#059669' : '#e2e8f0',
                      background: targetType === 'ALL_STAFF' ? '#ecfdf5' : '#f8fafc',
                      color: targetType === 'ALL_STAFF' ? '#047857' : '#64748b',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <Users size={16} />
                    <span>All Staff (Broadcast)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetType('INDIVIDUAL')}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '2px solid',
                      borderColor: targetType === 'INDIVIDUAL' ? '#059669' : '#e2e8f0',
                      background: targetType === 'INDIVIDUAL' ? '#ecfdf5' : '#f8fafc',
                      color: targetType === 'INDIVIDUAL' ? '#047857' : '#64748b',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <User size={16} />
                    <span>Specific Staff Member</span>
                  </button>
                </div>
              </div>

              {/* IF INDIVIDUAL: STAFF DROPDOWN */}
              {targetType === 'INDIVIDUAL' && (
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Select Staff Member <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={selectedStaffCode}
                    onChange={(e) => setSelectedStaffCode(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      color: '#0f172a',
                      background: '#ffffff',
                      outline: 'none'
                    }}
                  >
                    <option value="">-- Choose Staff / Faculty Member --</option>
                    {staffList.map((s) => (
                      <option key={s.staffCode} value={s.staffCode}>
                        {s.fullName} ({s.staffCode}) — {s.department || s.role}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* TITLE / SUBJECT */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Subject / Direction Title <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mid-term Syllabus Completion Review"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    color: '#0f172a',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />

                {/* Quick suggestions */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {[
                    'Timetable & Workload Audit',
                    'Attendance Roster Lock',
                    'Examination Submissions',
                    'Tuition Fee Reconciliation'
                  ].map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setFormTitle(sug)}
                      style={{
                        background: '#f1f5f9',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '3px 8px',
                        fontSize: '11px',
                        color: '#475569',
                        cursor: 'pointer'
                      }}
                    >
                      + {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* PRIORITY SELECTION & DUE DATE */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Priority Level
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '12px',
                      color: '#0f172a',
                      background: '#ffffff'
                    }}
                  >
                    <option value="NORMAL">Normal Priority</option>
                    <option value="HIGH">High Priority</option>
                    <option value="URGENT">Urgent (Immediate Attention)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Action Due Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '12px',
                      color: '#0f172a',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* DETAILED INSTRUCTIONS */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  Instructions / Direction Details <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide clear guidance, action points, and requirements for the staff member(s)..."
                  value={formInstruction}
                  onChange={(e) => setFormInstruction(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    color: '#0f172a',
                    boxSizing: 'border-box',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* ACTION BUTTONS */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
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
                    padding: '10px 22px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 2px 6px rgba(5, 150, 105, 0.3)'
                  }}
                >
                  <Send size={15} />
                  <span>{submitting ? 'Dispatching...' : 'Dispatch Direction'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

