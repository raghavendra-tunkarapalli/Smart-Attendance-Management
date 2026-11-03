import React, { useState, useEffect, useMemo } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Users,
  ChevronRight,
  X,
  Printer,
  DollarSign,
  ArrowUpRight,
  TrendingUp,
  Building,
  User,
  ShieldCheck,
  Calendar,
  Layers,
  Sparkles,
  Check,
  Award,
  Phone
} from 'lucide-react';

const API_BASE = 'http://localhost:8099/api/staff-fee';
const API_FALLBACK = 'http://localhost:8103/api/staff-fee';

export default function StaffFeeManagementModule({ user, showToast }) {
  const [students, setStudents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [payingInstallment, setPayingInstallment] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedSection, setSelectedSection] = useState('ALL');
  const [selectedFeeStatus, setSelectedFeeStatus] = useState('ALL');
  const [viewMode, setViewMode] = useState('grouped'); // 'grouped' | 'cards'

  // Selected student for fee details modal
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [activeInstallmentToPay, setActiveInstallmentToPay] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [paymentRemarks, setPaymentRemarks] = useState('');

  // Resilient Dual-Endpoint Fetch Helper (tries API Gateway, then falls back to direct service port)
  const apiFetch = async (endpoint, options = {}) => {
    let res = null;
    try {
      res = await fetch(`${API_BASE}${endpoint}`, options);
      if (res && res.ok) return res;
    } catch {}

    try {
      res = await fetch(`${API_FALLBACK}${endpoint}`, options);
      if (res && res.ok) return res;
    } catch (e) {
      console.warn(`Direct fetch to ${API_FALLBACK}${endpoint} failed:`, e);
    }
    return res;
  };

  const fetchFeeData = async () => {
    setLoading(true);
    try {
      const studentsRes = await apiFetch('/students');
      if (studentsRes && studentsRes.ok) {
        const studentData = await studentsRes.json();
        setStudents(studentData);
      } else {
        console.warn('Could not load student fee records from API');
      }

      const summaryRes = await apiFetch('/summary');
      if (summaryRes && summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setSummary(summaryData);
      }
    } catch (error) {
      console.error('Error fetching fee data:', error);
      if (showToast) showToast('Failed to load fee records. Ensure backend services are running.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeData();
  }, []);

  const handleSyncStudents = async () => {
    setSyncing(true);
    try {
      const res = await apiFetch('/sync', { method: 'POST' });
      if (res && res.ok) {
        const data = await res.json();
        if (showToast) showToast(`Synced student fee records successfully (${data.syncedCount || 0} updated)`, 'success');
        fetchFeeData();
      } else {
        if (showToast) showToast('Sync failed. Please ensure the fee management service is running.', 'error');
      }
    } catch (e) {
      console.error('Sync error:', e);
      if (showToast) showToast('Error during sync: ' + e.message, 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleRecordPayment = async (installmentNum) => {
    if (!selectedStudent) return;
    setPayingInstallment(true);
    try {
      const payload = {
        installmentNumber: installmentNum,
        paymentMethod: paymentMethod,
        remarks: paymentRemarks || `Installment ${installmentNum} paid by parent/guardian`
      };

      const res = await apiFetch(`/students/${selectedStudent.studentId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res && res.ok) {
        const updated = await res.json();
        setSelectedStudent(updated);
        // update local state
        setStudents(prev => prev.map(s => s.studentId === updated.studentId ? updated : s));
        if (showToast) showToast(`Installment ${installmentNum} paid successfully for ${updated.firstName}!`, 'success');
        // Refresh summary
        try {
          const sumRes = await apiFetch('/summary');
          if (sumRes && sumRes.ok) setSummary(await sumRes.json());
        } catch {}
        setPaymentModalOpen(false);
      } else {
        let errMessage = 'Server error';
        if (res) {
          try {
            const err = await res.json();
            if (err?.error) errMessage = err.error;
          } catch {}
        }
        if (showToast) showToast(`Payment failed: ${errMessage}`, 'error');
      }
    } catch (e) {
      console.error('Payment error:', e);
      if (showToast) showToast('Error processing payment: ' + e.message, 'error');
    } finally {
      setPayingInstallment(false);
    }
  };

  // Helper formatting currency
  const formatCurrency = (val) => {
    if (val === null || val === undefined) return '₹0';
    return '₹' + Number(val).toLocaleString('en-IN');
  };

  // Helper formatting datetime
  const formatDateTime = (dtStr) => {
    if (!dtStr) return '—';
    try {
      const d = new Date(dtStr);
      if (isNaN(d.getTime())) return dtStr;
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }) + ', ' + d.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return dtStr;
    }
  };

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      // Class filter
      if (selectedClass !== 'ALL' && String(s.classStandard).trim() !== String(selectedClass).trim()) {
        return false;
      }
      // Section filter
      if (selectedSection !== 'ALL' && String(s.sectionName).trim() !== String(selectedSection).trim()) {
        return false;
      }
      // Status filter
      if (selectedFeeStatus !== 'ALL' && s.feeStatus !== selectedFeeStatus) {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const sid = (s.studentId || '').toLowerCase();
        const fn = (s.firstName || '').toLowerCase();
        const ln = (s.lastName || '').toLowerCase();
        const pn = (s.parentName || '').toLowerCase();
        if (!sid.includes(q) && !fn.includes(q) && !ln.includes(q) && !pn.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [students, selectedClass, selectedSection, selectedFeeStatus, searchQuery]);

  // Grouped by Class and Section
  const groupedStudents = useMemo(() => {
    const map = {};
    filteredStudents.forEach(st => {
      const key = `Class ${st.classStandard} — Section ${st.sectionName}`;
      if (!map[key]) {
        map[key] = {
          classStandard: st.classStandard,
          sectionName: st.sectionName,
          students: []
        };
      }
      map[key].students.push(st);
    });

    // Sort keys by numeric class
    return Object.entries(map).sort((a, b) => {
      const numA = parseInt(String(a[1].classStandard).replace(/\D/g, '')) || 0;
      const numB = parseInt(String(b[1].classStandard).replace(/\D/g, '')) || 0;
      if (numA !== numB) return numA - numB;
      return String(a[1].sectionName).localeCompare(String(b[1].sectionName));
    });
  }, [filteredStudents]);

  // Available classes & sections
  const availableClasses = useMemo(() => {
    const set = new Set();
    students.forEach(s => {
      if (s.classStandard) set.add(String(s.classStandard).trim());
    });
    return Array.from(set).sort((a, b) => (parseInt(a) || 0) - (parseInt(b) || 0));
  }, [students]);

  const availableSections = useMemo(() => {
    const set = new Set();
    students.forEach(s => {
      if (s.sectionName) set.add(String(s.sectionName).trim());
    });
    return Array.from(set).sort();
  }, [students]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            fontWeight: '700',
            padding: '3px 9px',
            borderRadius: '999px',
            background: '#ecfdf5',
            color: '#059669',
            border: '1px solid #a7f3d0'
          }}>
            <CheckCircle2 size={12} />
            FULLY PAID
          </span>
        );
      case 'PARTIAL':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            fontWeight: '700',
            padding: '3px 9px',
            borderRadius: '999px',
            background: '#fffbeb',
            color: '#d97706',
            border: '1px solid #fde68a'
          }}>
            <Clock size={12} />
            PARTIAL DUE
          </span>
        );
      case 'UNPAID':
      default:
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            fontWeight: '700',
            padding: '3px 9px',
            borderRadius: '999px',
            background: '#fef2f2',
            color: '#dc2626',
            border: '1px solid #fecaca'
          }}>
            <AlertCircle size={12} />
            UNPAID
          </span>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-20)', width: '100%', minWidth: 0 }}>

      {/* INSTITUTIONAL FEE SUMMARY KPI CARDS */}
      {summary && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--spacing-16)',
          width: '100%'
        }}>
          {/* Card 1: Total Projected Fee */}
          <div style={{
            background: 'var(--color-gallery-white)',
            border: '1px solid var(--color-hairline-silver)',
            borderRadius: 'var(--radius-cards)',
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-slate)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Total Projected Fee
              </span>
              <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building size={16} />
              </div>
            </div>
            <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--color-ink)' }}>
              {formatCurrency(summary.totalExpectedAmount)}
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--color-slate)' }}>
              Across {summary.totalStudents || students.length} registered students
            </div>
          </div>

          {/* Card 2: Total Realized Collections */}
          <div style={{
            background: 'var(--color-gallery-white)',
            border: '1px solid #bbf7d0',
            borderRadius: 'var(--radius-cards)',
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Total Collected
              </span>
              <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DollarSign size={16} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <div style={{ fontSize: '22px', fontWeight: '700', color: '#15803d' }}>
                {formatCurrency(summary.totalCollectedAmount)}
              </div>
              <span style={{
                fontSize: '11.5px',
                fontWeight: '700',
                color: '#15803d',
                background: '#dcfce7',
                padding: '2px 8px',
                borderRadius: '6px',
                border: '1px solid #86efac'
              }}>
                {summary.collectionPercentage}%
              </span>
            </div>
            {/* Progress Bar */}
            <div style={{ width: '100%', height: '5px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden', marginTop: '4px' }}>
              <div style={{
                width: `${Math.min(100, Math.max(0, summary.collectionPercentage || 0))}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #16a34a, #22c55e)',
                borderRadius: '999px'
              }} />
            </div>
          </div>

          {/* Card 3: Total Outstanding Dues */}
          <div style={{
            background: 'var(--color-gallery-white)',
            border: '1px solid #fecaca',
            borderRadius: 'var(--radius-cards)',
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Outstanding Dues
              </span>
              <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertCircle size={16} />
              </div>
            </div>
            <div style={{ fontSize: '22px', fontWeight: '700', color: '#b91c1c' }}>
              {formatCurrency(summary.totalDueAmount)}
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--color-slate)' }}>
              Pending institutional collection
            </div>
          </div>

          {/* Card 4: Student Settlement Breakdown */}
          <div style={{
            background: 'var(--color-gallery-white)',
            border: '1px solid var(--color-hairline-silver)',
            borderRadius: 'var(--radius-cards)',
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-slate)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Settlement Status
              </span>
              <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#f8fafc', color: 'var(--color-slate)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={16} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '2px' }}>
              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '3px 8px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '600', color: '#059669' }}>
                {summary.fullyPaidStudents} Paid
              </div>
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '3px 8px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '600', color: '#d97706' }}>
                {summary.partiallyPaidStudents} Partial
              </div>
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '3px 8px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '600', color: '#dc2626' }}>
                {summary.unpaidStudents} Unpaid
              </div>
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--color-slate)', marginTop: '2px' }}>
              {summary.totalStudents} total student accounts
            </div>
          </div>
        </div>
      )}

      {/* FILTER & CONTROL BAR */}
      <div style={{
        background: 'var(--color-gallery-white)',
        border: '1px solid var(--color-hairline-silver)',
        borderRadius: 'var(--radius-cards)',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          
          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '260px', flex: '1 1 260px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-steel)' }} />
            <input
              type="text"
              placeholder="Search by student name, ID, or parent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              style={{
                width: '100%',
                paddingLeft: '36px',
                paddingRight: '12px',
                paddingTop: '8px',
                paddingBottom: '8px',
                borderRadius: '10px',
                fontSize: '13px',
                background: 'var(--color-studio-mist)',
                border: '1px solid var(--color-hairline-silver)'
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={handleSyncStudents}
              disabled={syncing}
              className="btn-apple-outline"
              style={{ padding: '8px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Synchronize from student details database"
            >
              <RefreshCw size={13} className={syncing ? 'spin' : ''} />
              <span>{syncing ? 'Syncing...' : 'Sync Students'}</span>
            </button>

            <button
              onClick={fetchFeeData}
              disabled={loading}
              className="btn-apple-outline"
              style={{ padding: '8px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={13} className={loading ? 'spin' : ''} />
              <span>Refresh</span>
            </button>

            {/* View Mode Switcher */}
            <div style={{
              display: 'flex',
              background: 'var(--color-studio-mist)',
              border: '1px solid var(--color-hairline-silver)',
              borderRadius: '8px',
              padding: '2px'
            }}>
              <button
                onClick={() => setViewMode('grouped')}
                style={{
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  background: viewMode === 'grouped' ? 'var(--color-gallery-white)' : 'transparent',
                  color: viewMode === 'grouped' ? 'var(--color-pricing-blue)' : 'var(--color-slate)',
                  boxShadow: viewMode === 'grouped' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                Class-Wise
              </button>
              <button
                onClick={() => setViewMode('cards')}
                style={{
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  background: viewMode === 'cards' ? 'var(--color-gallery-white)' : 'transparent',
                  color: viewMode === 'cards' ? 'var(--color-pricing-blue)' : 'var(--color-slate)',
                  boxShadow: viewMode === 'cards' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                All Cards ({filteredStudents.length})
              </button>
            </div>
          </div>
        </div>

        {/* Class, Section, and Status Selectors */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', borderTop: '1px solid var(--color-hairline-silver)', paddingTop: '12px' }}>
          
          {/* Class Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-slate)' }}>Class:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid var(--color-control-gray)',
                background: 'var(--color-gallery-white)',
                fontSize: '12.5px',
                color: 'var(--color-ink)',
                cursor: 'pointer'
              }}
            >
              <option value="ALL">All Classes</option>
              {availableClasses.map(c => (
                <option key={c} value={c}>Class {c}</option>
              ))}
            </select>
          </div>

          {/* Section Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-slate)' }}>Section:</span>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid var(--color-control-gray)',
                background: 'var(--color-gallery-white)',
                fontSize: '12.5px',
                color: 'var(--color-ink)',
                cursor: 'pointer'
              }}
            >
              <option value="ALL">All Sections</option>
              {availableSections.map(s => (
                <option key={s} value={s}>Section {s}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-slate)' }}>Status:</span>
            <select
              value={selectedFeeStatus}
              onChange={(e) => setSelectedFeeStatus(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid var(--color-control-gray)',
                background: 'var(--color-gallery-white)',
                fontSize: '12.5px',
                color: 'var(--color-ink)',
                cursor: 'pointer'
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="PAID">Fully Paid</option>
              <option value="PARTIAL">Partially Paid</option>
              <option value="UNPAID">Unpaid</option>
            </select>
          </div>

          <div style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--color-slate)' }}>
            Showing <strong>{filteredStudents.length}</strong> of <strong>{students.length}</strong> students
          </div>
        </div>
      </div>

      {/* STUDENT CARDS AREA */}
      {loading ? (
        <div style={{
          background: 'var(--color-gallery-white)',
          border: '1px solid var(--color-hairline-silver)',
          borderRadius: 'var(--radius-cards)',
          padding: '60px 20px',
          textAlign: 'center'
        }}>
          <RefreshCw size={24} className="spin" style={{ color: 'var(--color-pricing-blue)', margin: '0 auto 12px auto' }} />
          <h4 style={{ fontSize: '15px', color: 'var(--color-ink)', margin: 0 }}>Loading Student Fee Directory...</h4>
          <p style={{ fontSize: '12.5px', color: 'var(--color-slate)', marginTop: '4px' }}>Connecting to staff-fee-management-service</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div style={{
          background: 'var(--color-gallery-white)',
          border: '1px solid var(--color-hairline-silver)',
          borderRadius: 'var(--radius-cards)',
          padding: '50px 20px',
          textAlign: 'center'
        }}>
          <Users size={32} style={{ color: 'var(--color-slate)', margin: '0 auto 12px auto' }} />
          <h4 style={{ fontSize: '15px', color: 'var(--color-ink)', margin: 0 }}>No Student Fee Records Found</h4>
          <p style={{ fontSize: '12.5px', color: 'var(--color-slate)', marginTop: '4px' }}>
            Try adjusting your class/section filters or click "Sync Students" to pull from admissions.
          </p>
        </div>
      ) : viewMode === 'grouped' ? (
        /* CLASS & SECTION GROUPED VIEW */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-20)' }}>
          {groupedStudents.map(([groupKey, groupData]) => (
            <div
              key={groupKey}
              style={{
                background: 'var(--color-gallery-white)',
                border: '1px solid var(--color-hairline-silver)',
                borderRadius: 'var(--radius-cards)',
                padding: 'var(--spacing-20)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
              }}
            >
              {/* Group Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--color-hairline-silver)',
                paddingBottom: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: '#eff6ff',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: '13px'
                  }}>
                    {groupData.classStandard}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-ink)', margin: 0 }}>
                      Class {groupData.classStandard} — Section {groupData.sectionName}
                    </h4>
                    <span style={{ fontSize: '11.5px', color: 'var(--color-slate)' }}>
                      {groupData.students.length} students enrolled
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--color-slate)' }}>Class Total Rate:</span>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#15803d',
                    background: '#ecfdf5',
                    padding: '3px 10px',
                    borderRadius: '999px',
                    border: '1px solid #a7f3d0'
                  }}>
                    {formatCurrency(groupData.students[0]?.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Student Cards in this Group */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
                gap: '14px'
              }}>
                {groupData.students.map(student => (
                  <StudentBriefCard
                    key={student.studentId}
                    student={student}
                    onClick={() => setSelectedStudent(student)}
                    formatCurrency={formatCurrency}
                    getStatusBadge={getStatusBadge}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* FLAT CARD GRID VIEW */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
          gap: '14px'
        }}>
          {filteredStudents.map(student => (
            <StudentBriefCard
              key={student.studentId}
              student={student}
              onClick={() => setSelectedStudent(student)}
              formatCurrency={formatCurrency}
              getStatusBadge={getStatusBadge}
            />
          ))}
        </div>
      )}

      {/* DETAILED STUDENT FEE MODAL (When clicking a card) */}
      {selectedStudent && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px'
          }}
          onClick={() => setSelectedStudent(null)}
        >
          <div
            style={{
              background: 'var(--color-gallery-white)',
              borderRadius: '20px',
              border: '1px solid var(--color-hairline-silver)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  fontWeight: '700'
                }}>
                  {selectedStudent.firstName ? selectedStudent.firstName[0].toUpperCase() : 'S'}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-ink)', margin: 0 }}>
                      {selectedStudent.firstName} {selectedStudent.lastName || ''}
                    </h3>
                    {getStatusBadge(selectedStudent.feeStatus)}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--color-slate)', marginTop: '3px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span>ID: <strong style={{ color: 'var(--color-ink)' }}>{selectedStudent.studentId}</strong></span>
                    <span>•</span>
                    <span>Class <strong>{selectedStudent.classStandard}</strong> – Sec <strong>{selectedStudent.sectionName}</strong></span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudent(null)}
                style={{
                  background: 'var(--color-studio-mist)',
                  border: '1px solid var(--color-hairline-silver)',
                  borderRadius: '10px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--color-slate)'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Parent & Academic Details Bar (4 Columns) */}
            <div style={{
              background: 'var(--color-studio-mist)',
              border: '1px solid var(--color-control-gray)',
              borderRadius: '12px',
              padding: '14px 18px',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              gap: '12px',
              fontSize: '12.5px'
            }}>
              <div>
                <span style={{ color: 'var(--color-slate)', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.02em', display: 'block' }}>
                  PARENT / GUARDIAN
                </span>
                <div style={{ fontWeight: '600', color: 'var(--color-ink)', marginTop: '3px', fontSize: '13.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {selectedStudent.parentName || 'Parent / Guardian'}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--color-slate)', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.02em', display: 'block' }}>
                  PARENT NUMBER
                </span>
                <div style={{ fontWeight: '600', color: 'var(--color-ink)', marginTop: '3px', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Phone size={13} style={{ color: 'var(--color-pricing-blue)', flexShrink: 0 }} />
                  <a
                    href={`tel:${selectedStudent.parentPhone || '+1 (555) 234-5678'}`}
                    style={{ color: 'var(--color-pricing-blue)', textDecoration: 'none', fontWeight: '600', whiteSpace: 'nowrap' }}
                    onClick={(e) => e.stopPropagation()}
                    title="Call parent"
                  >
                    {selectedStudent.parentPhone || '+1 (555) 234-5678'}
                  </a>
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--color-slate)', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.02em', display: 'block' }}>
                  ACADEMIC YEAR
                </span>
                <div style={{ fontWeight: '600', color: 'var(--color-ink)', marginTop: '3px', fontSize: '13.5px' }}>
                  {selectedStudent.academicYear || '2025-2026'}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--color-slate)', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.02em', display: 'block' }}>
                  TOTAL TUITION FEE
                </span>
                <div style={{ fontWeight: '700', color: '#15803d', marginTop: '3px', fontSize: '15px' }}>
                  {formatCurrency(selectedStudent.totalAmount)}
                </div>
              </div>
            </div>

            {/* Financial Totals Card */}
            <div style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              border: '1px solid var(--color-hairline-silver)',
              borderRadius: '14px',
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--color-slate)' }}>Total Amount Paid</span>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#15803d' }}>
                  {formatCurrency(selectedStudent.totalAmountPaid)}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '12px', color: 'var(--color-slate)' }}>Remaining Due Amount</span>
                <div style={{ fontSize: '20px', fontWeight: '700', color: selectedStudent.dueAmount > 0 ? '#dc2626' : '#059669' }}>
                  {formatCurrency(selectedStudent.dueAmount)}
                </div>
              </div>
            </div>

            {/* 4 INSTALLMENTS BREAKDOWN LIST */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--color-ink)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Tuition Fee Installment Schedule & Records
                </h4>
                <span style={{ fontSize: '11.5px', color: 'var(--color-slate)' }}>
                  4 Equal Installments (25% each)
                </span>
              </div>

              {[
                {
                  num: 1,
                  title: '1st Installment (Quarter 1)',
                  amount: selectedStudent.firstInstallment,
                  status: selectedStudent.firstInstallmentStatus,
                  paidAt: selectedStudent.firstInstallmentPaidAt
                },
                {
                  num: 2,
                  title: '2nd Installment (Quarter 2)',
                  amount: selectedStudent.secondInstallment,
                  status: selectedStudent.secondInstallmentStatus,
                  paidAt: selectedStudent.secondInstallmentPaidAt
                },
                {
                  num: 3,
                  title: '3rd Installment (Quarter 3)',
                  amount: selectedStudent.thirdInstallment,
                  status: selectedStudent.thirdInstallmentStatus,
                  paidAt: selectedStudent.thirdInstallmentPaidAt
                },
                {
                  num: 4,
                  title: '4th Installment (Quarter 4)',
                  amount: selectedStudent.fourthInstallment,
                  status: selectedStudent.fourthInstallmentStatus,
                  paidAt: selectedStudent.fourthInstallmentPaidAt
                }
              ].map((inst) => {
                const isPaid = inst.status === 'PAID';
                return (
                  <div
                    key={inst.num}
                    style={{
                      background: isPaid ? '#f0fdf4' : 'var(--color-gallery-white)',
                      border: `1px solid ${isPaid ? '#bbf7d0' : 'var(--color-hairline-silver)'}`,
                      borderRadius: '12px',
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: isPaid ? '#dcfce7' : 'var(--color-studio-mist)',
                        color: isPaid ? '#16a34a' : 'var(--color-slate)',
                        border: `1px solid ${isPaid ? '#86efac' : 'var(--color-control-gray)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        fontSize: '13px'
                      }}>
                        {isPaid ? <Check size={18} /> : inst.num}
                      </div>
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--color-ink)' }}>
                          {inst.title}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--color-slate)', marginTop: '2px' }}>
                          {isPaid ? (
                            <span style={{ color: '#15803d' }}>
                              Paid On: <strong>{formatDateTime(inst.paidAt)}</strong>
                            </span>
                          ) : (
                            <span style={{ color: '#d97706' }}>
                              Payment Status: <strong>Pending Collection</strong>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '15px', fontWeight: '700', color: isPaid ? '#15803d' : 'var(--color-ink)' }}>
                          {formatCurrency(inst.amount)}
                        </div>
                        <span style={{
                          fontSize: '10.5px',
                          fontWeight: '700',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: isPaid ? '#dcfce7' : '#fef3c7',
                          color: isPaid ? '#15803d' : '#b45309'
                        }}>
                          {inst.status || 'PENDING'}
                        </span>
                      </div>

                      {!isPaid && (
                        <button
                          onClick={() => {
                            setActiveInstallmentToPay(inst.num);
                            setPaymentModalOpen(true);
                          }}
                          className="btn-apple"
                          style={{
                            padding: '6px 14px',
                            fontSize: '12px',
                            borderRadius: '8px',
                            background: '#0071e3',
                            color: '#ffffff',
                            fontWeight: '600',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          Collect Fee
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Actions Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-hairline-silver)', paddingTop: '16px' }}>
              <button
                onClick={() => window.print()}
                className="btn-apple-outline"
                style={{ padding: '8px 16px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Printer size={14} />
                <span>Print Fee Statement</span>
              </button>

              <button
                onClick={() => setSelectedStudent(null)}
                className="btn-apple-outline"
                style={{ padding: '8px 24px', fontSize: '13px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT CONFIRMATION SUB-MODAL */}
      {paymentModalOpen && selectedStudent && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10001,
            padding: '20px'
          }}
          onClick={() => setPaymentModalOpen(false)}
        >
          <div
            style={{
              background: 'var(--color-gallery-white)',
              borderRadius: '16px',
              border: '1px solid var(--color-hairline-silver)',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              width: '100%',
              maxWidth: '460px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CreditCard size={18} />
                </div>
                <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-ink)', margin: 0 }}>
                  Record Installment #{activeInstallmentToPay} Payment
                </h4>
              </div>
              <button
                onClick={() => setPaymentModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-slate)' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ fontSize: '13px', color: 'var(--color-slate)' }}>
              Recording fee payment for <strong>{selectedStudent.firstName} {selectedStudent.lastName}</strong> ({selectedStudent.studentId}), Class {selectedStudent.classStandard}-{selectedStudent.sectionName}.
            </div>

            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid var(--color-control-gray)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: 'var(--color-slate)' }}>Installment #{activeInstallmentToPay} Amount:</span>
                <strong style={{ color: '#15803d', fontSize: '15px' }}>
                  {formatCurrency(
                    activeInstallmentToPay === 1 ? selectedStudent.firstInstallment :
                    activeInstallmentToPay === 2 ? selectedStudent.secondInstallment :
                    activeInstallmentToPay === 3 ? selectedStudent.thirdInstallment :
                    selectedStudent.fourthInstallment
                  )}
                </strong>
              </div>
            </div>

            {/* Payment Method */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-ink)' }}>Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-control-gray)',
                  fontSize: '13px',
                  background: 'var(--color-gallery-white)'
                }}
              >
                <option value="CASH">Cash Deposit</option>
                <option value="UPI">UPI / QR Code</option>
                <option value="NET_BANKING">Net Banking / NEFT</option>
                <option value="CREDIT_CARD">Credit / Debit Card</option>
                <option value="CHEQUE">Demand Draft / Cheque</option>
              </select>
            </div>

            {/* Remarks */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-ink)' }}>Receipt / Transaction Remarks</label>
              <input
                type="text"
                placeholder="e.g. Paid at school reception counter, ref #TXN-9021"
                value={paymentRemarks}
                onChange={(e) => setPaymentRemarks(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-control-gray)',
                  fontSize: '13px'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="btn-apple-outline"
                style={{ padding: '8px 16px', fontSize: '13px' }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleRecordPayment(activeInstallmentToPay)}
                disabled={payingInstallment}
                className="btn-apple"
                style={{
                  padding: '8px 20px',
                  fontSize: '13px',
                  background: '#16a34a',
                  color: '#ffffff',
                  fontWeight: '600',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                {payingInstallment ? 'Recording...' : 'Confirm & Mark Paid'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * REUSABLE BRIEF STUDENT CARD
 * Shows: Name, ID, Parent Name, Class, Section, Total Amount, Paid Amount, Due, 4 Installment Indicators
 */
function StudentBriefCard({ student, onClick, formatCurrency, getStatusBadge }) {
  const paidPercent = student.totalAmount && student.totalAmount > 0
    ? Math.min(100, Math.round((Number(student.totalAmountPaid || 0) / Number(student.totalAmount)) * 100))
    : 0;

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--color-gallery-white)',
        border: '1px solid var(--color-hairline-silver)',
        borderRadius: '14px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-pricing-blue)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 113, 227, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-hairline-silver)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)';
      }}
    >
      {/* Top Row: Avatar, Name, Class Badge, Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
            color: 'var(--color-ink)',
            fontWeight: '700',
            fontSize: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--color-hairline-silver)'
          }}>
            {student.firstName ? student.firstName[0].toUpperCase() : 'S'}
          </div>
          <div>
            <h5 style={{ fontSize: '14.5px', fontWeight: '700', color: 'var(--color-ink)', margin: 0, letterSpacing: '-0.2px' }}>
              {student.firstName} {student.lastName || ''}
            </h5>
            <div style={{ fontSize: '11.5px', color: 'var(--color-slate)', marginTop: '2px' }}>
              ID: <strong style={{ color: 'var(--color-ink)' }}>{student.studentId}</strong>
            </div>
          </div>
        </div>

        <span style={{
          fontSize: '11px',
          fontWeight: '700',
          padding: '2px 8px',
          borderRadius: '6px',
          background: '#eff6ff',
          color: '#2563eb',
          border: '1px solid #dbeafe'
        }}>
          {student.classStandard}-{student.sectionName}
        </span>
      </div>

      {/* Parent Name & Phone */}
      <div style={{
        fontSize: '12px',
        color: 'var(--color-slate)',
        background: 'var(--color-studio-mist)',
        padding: '6px 10px',
        borderRadius: '8px',
        border: '1px solid var(--color-control-gray)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '6px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, overflow: 'hidden' }}>
          <User size={13} style={{ color: 'var(--color-steel)', flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <strong style={{ color: 'var(--color-ink)' }}>{student.parentName || 'Not recorded'}</strong>
          </span>
        </div>
        {student.parentPhone && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#0369a1', background: '#f0f9ff', padding: '1px 6px', borderRadius: '4px', flexShrink: 0, border: '1px solid #e0f2fe' }}>
            <Phone size={10} />
            <span>{student.parentPhone}</span>
          </div>
        )}
      </div>

      {/* Tuition & Payment Overview */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '2px' }}>
        <div>
          <span style={{ fontSize: '11px', color: 'var(--color-slate)' }}>Total Fee</span>
          <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-ink)' }}>
            {formatCurrency(student.totalAmount)}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '11px', color: 'var(--color-slate)' }}>Paid: </span>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#15803d' }}>
            {formatCurrency(student.totalAmountPaid)}
          </span>
          {Number(student.dueAmount) > 0 ? (
            <div style={{ fontSize: '11px', color: '#dc2626', fontWeight: '600' }}>
              Due: {formatCurrency(student.dueAmount)}
            </div>
          ) : (
            <div style={{ fontSize: '11px', color: '#059669', fontWeight: '600' }}>
              All Cleared
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: '5px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
        <div style={{
          width: `${paidPercent}%`,
          height: '100%',
          background: paidPercent === 100
            ? 'linear-gradient(90deg, #16a34a, #22c55e)'
            : 'linear-gradient(90deg, #0071e3, #38bdf8)',
          borderRadius: '999px',
          transition: 'width 0.3s ease'
        }} />
      </div>

      {/* Bottom Row: 4 Installment Indicators & Status Pill */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px', borderTop: '1px solid var(--color-hairline-silver)' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          {[
            { num: 1, status: student.firstInstallmentStatus },
            { num: 2, status: student.secondInstallmentStatus },
            { num: 3, status: student.thirdInstallmentStatus },
            { num: 4, status: student.fourthInstallmentStatus }
          ].map(inst => {
            const isPaid = inst.status === 'PAID';
            return (
              <span
                key={inst.num}
                title={`Inst #${inst.num}: ${isPaid ? 'PAID' : 'PENDING'}`}
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  fontSize: '10px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isPaid ? '#dcfce7' : '#f1f5f9',
                  color: isPaid ? '#15803d' : '#94a3b8',
                  border: `1px solid ${isPaid ? '#86efac' : '#cbd5e1'}`
                }}
              >
                {isPaid ? '✓' : inst.num}
              </span>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {getStatusBadge(student.feeStatus)}
          <ChevronRight size={14} color="var(--color-steel)" />
        </div>
      </div>
    </div>
  );
}
