import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  CreditCard,
  GraduationCap,
  Calendar,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Filter,
  Users,
  Award,
  Wallet,
  Building2,
  FileText,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  X,
  ChevronDown,
  ChevronUp,
  Check
} from 'lucide-react';

const GATEWAY_BASE = 'http://localhost:8099/api/admin-profile';
const DIRECT_BASE = 'http://localhost:8107/api/admin-profile';

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export default function AdminProfileAnalyticsModule() {
  const [years, setYears] = useState([2026, 2025]);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(0); // 0 = All Months
  const [activeTab, setActiveTab] = useState('admissions'); // 'admissions' | 'transactions' | 'studentFees'
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllAdmissions, setShowAllAdmissions] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [showAllStudentFees, setShowAllStudentFees] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drilldownData, setDrilldownData] = useState(null);
  const [hoveredBar, setHoveredBar] = useState(null); // { type: 'admission'|'payment', index, data }

  // Load available years
  useEffect(() => {
    async function fetchYears() {
      try {
        let res = await fetch(`${GATEWAY_BASE}/years`).catch(() => fetch(`${DIRECT_BASE}/years`));
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setYears(data);
            if (!data.includes(selectedYear)) {
              setSelectedYear(data[0]);
            }
          }
        }
      } catch (e) {
        console.warn('Could not load years:', e);
      }
    }
    fetchYears();
  }, []);

  // Fetch drilldown & trends
  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const monthParam = selectedMonth > 0 ? `&month=${selectedMonth}` : '';
      const url = `${GATEWAY_BASE}/drilldown?year=${selectedYear}${monthParam}`;
      const fallbackUrl = `${DIRECT_BASE}/drilldown?year=${selectedYear}${monthParam}`;

      let res = await fetch(url).catch(() => fetch(fallbackUrl));
      if (!res.ok) {
        throw new Error(`Failed to load analytics: HTTP ${res.status}`);
      }
      const data = await res.json();
      setDrilldownData(data);
    } catch (err) {
      console.error('Error fetching admin profile analytics:', err);
      setError(err.message || 'Unable to fetch monthly analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setShowAllAdmissions(false);
    setShowAllTransactions(false);
    setShowAllStudentFees(false);
    loadAnalytics();
  }, [selectedYear, selectedMonth]);

  const trends = drilldownData?.monthlyTrends || [];
  const summary = drilldownData?.summary || {};
  const admissionsList = drilldownData?.admissions || [];
  const transactionsList = drilldownData?.transactions || [];
  const studentFeesList = drilldownData?.studentFeeSummaries || [];

  const isSearching = searchQuery.trim().length > 0;

  // Filtered drilldown lists (searching across ALL records)
  const filteredAdmissions = useMemo(() => {
    if (!isSearching) return admissionsList;
    const q = searchQuery.toLowerCase().trim();
    return admissionsList.filter(
      (a) =>
        a.studentName?.toLowerCase().includes(q) ||
        a.admissionId?.toLowerCase().includes(q) ||
        a.className?.toLowerCase().includes(q) ||
        (a.section && a.section.toLowerCase().includes(q)) ||
        a.parentName?.toLowerCase().includes(q) ||
        (a.parentEmail && a.parentEmail.toLowerCase().includes(q)) ||
        (a.status && a.status.toLowerCase().includes(q))
    );
  }, [admissionsList, searchQuery, isSearching]);

  const filteredTransactions = useMemo(() => {
    if (!isSearching) return transactionsList;
    const q = searchQuery.toLowerCase().trim();
    return transactionsList.filter(
      (t) =>
        t.studentName?.toLowerCase().includes(q) ||
        t.studentId?.toLowerCase().includes(q) ||
        t.parentName?.toLowerCase().includes(q) ||
        (t.parentPhone && t.parentPhone.toLowerCase().includes(q)) ||
        t.classStandard?.toLowerCase().includes(q) ||
        t.transactionId?.toLowerCase().includes(q) ||
        t.installmentName?.toLowerCase().includes(q) ||
        (t.feeStatus && t.feeStatus.toLowerCase().includes(q))
    );
  }, [transactionsList, searchQuery, isSearching]);

  const filteredStudentFees = useMemo(() => {
    if (!isSearching) return studentFeesList;
    const q = searchQuery.toLowerCase().trim();
    return studentFeesList.filter(
      (s) =>
        s.studentName?.toLowerCase().includes(q) ||
        s.studentId?.toLowerCase().includes(q) ||
        s.classStandard?.toLowerCase().includes(q) ||
        (s.sectionName && s.sectionName.toLowerCase().includes(q)) ||
        s.parentName?.toLowerCase().includes(q) ||
        (s.parentPhone && s.parentPhone.toLowerCase().includes(q)) ||
        (s.feeStatus && s.feeStatus.toLowerCase().includes(q))
    );
  }, [studentFeesList, searchQuery, isSearching]);

  // Displayed records: default to top 10 most recent records unless searching or expanded
  const displayedAdmissions = useMemo(() => {
    if (isSearching || showAllAdmissions) {
      return filteredAdmissions;
    }
    return filteredAdmissions.slice(0, 10);
  }, [filteredAdmissions, isSearching, showAllAdmissions]);

  const displayedTransactions = useMemo(() => {
    if (isSearching || showAllTransactions) {
      return filteredTransactions;
    }
    return filteredTransactions.slice(0, 10);
  }, [filteredTransactions, isSearching, showAllTransactions]);

  const displayedStudentFees = useMemo(() => {
    if (isSearching || showAllStudentFees) {
      return filteredStudentFees;
    }
    return filteredStudentFees.slice(0, 10);
  }, [filteredStudentFees, isSearching, showAllStudentFees]);

  // Max values for chart scaling
  const maxAdmissionCount = useMemo(() => {
    const maxVal = Math.max(...trends.map((t) => t.admissionsCount || 0), 0);
    return maxVal === 0 ? 10 : Math.ceil(maxVal * 1.25);
  }, [trends]);

  const maxPaymentAmount = useMemo(() => {
    const maxVal = Math.max(...trends.map((t) => Number(t.parentPaymentsAmount) || 0), 0);
    return maxVal === 0 ? 100000 : Math.ceil(maxVal * 1.25);
  }, [trends]);

  const formatCurrency = (amt) => {
    const num = Number(amt) || 0;
    return '₹' + num.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  };

  const formatShortCurrency = (amt) => {
    const num = Number(amt) || 0;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(0)}k`;
    return `₹${num}`;
  };

  return (
    <div
      style={{
        marginTop: '28px',
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid var(--color-hairline-silver)',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden'
      }}
    >
      {/* SECTION TOP HEADER */}
      <div
        style={{
          padding: '24px 28px',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          borderBottom: '1px solid var(--color-hairline-silver)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
            }}
          >
            <BarChart3 size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Institutional Admissions & Parent Inflow Analytics
              </h3>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: '#e0e7ff',
                  color: '#4338ca',
                  border: '1px solid #c7d2fe'
                }}
              >
                ADMIN PROFILE SERVICE :8107
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
              Real-time student admission metrics and monthly tuition fee collections realized across all terms
            </p>
          </div>
        </div>

        {/* YEAR & REFRESH CONTROLS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#ffffff',
              padding: '6px 12px',
              borderRadius: '10px',
              border: '1px solid #cbd5e1',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            <Calendar size={15} style={{ color: '#64748b' }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              style={{
                border: 'none',
                background: 'transparent',
                fontSize: '13px',
                fontWeight: 700,
                color: '#0f172a',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y} Academic Year
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={loadAnalytics}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#334155',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* INTERACTIVE MONTH FILTER BAR */}
      <div
        style={{
          padding: '12px 28px',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto'
        }}
      >
        <span
          style={{
            fontSize: '12px',
            fontWeight: 700,
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginRight: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Filter size={13} /> Month:
        </span>

        <button
          onClick={() => setSelectedMonth(0)}
          style={{
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: selectedMonth === 0 ? 700 : 500,
            border: selectedMonth === 0 ? '1px solid #4f46e5' : '1px solid #cbd5e1',
            background: selectedMonth === 0 ? '#4f46e5' : '#ffffff',
            color: selectedMonth === 0 ? '#ffffff' : '#475569',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap'
          }}
        >
          All Months
        </button>

        {MONTH_LABELS.map((label, idx) => {
          const mNum = idx + 1;
          const isSelected = selectedMonth === mNum;
          const monthTrend = trends[idx];
          const hasData =
            monthTrend &&
            (monthTrend.admissionsCount > 0 || Number(monthTrend.parentPaymentsAmount) > 0);

          return (
            <button
              key={label}
              onClick={() => setSelectedMonth(mNum)}
              style={{
                padding: '6px 13px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: isSelected ? 700 : 500,
                border: isSelected ? '1px solid #4f46e5' : '1px solid #e2e8f0',
                background: isSelected ? '#e0e7ff' : hasData ? '#ffffff' : '#f1f5f9',
                color: isSelected ? '#4338ca' : hasData ? '#1e293b' : '#94a3b8',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                whiteSpace: 'nowrap'
              }}
            >
              <span>{label}</span>
              {hasData && (
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: isSelected ? '#4f46e5' : '#10b981'
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* KPI STATS ROW */}
      <div
        style={{
          padding: '24px 28px 16px 28px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '16px'
        }}
      >
        {/* Total Admissions Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #f5f3ff 0%, #ffffff 100%)',
            border: '1px solid #ddd6fe',
            borderRadius: '14px',
            padding: '16px 20px',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#6d28d9', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Student Admissions
            </span>
            <GraduationCap size={18} style={{ color: '#7c3aed' }} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#1e1b4b', marginTop: '8px' }}>
            {summary.totalAdmissions || 0}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ color: '#059669', fontWeight: 600 }}>{summary.confirmedAdmissions || 0} Confirmed</span>
            <span>•</span>
            <span style={{ color: '#d97706', fontWeight: 600 }}>{summary.pendingAdmissions || 0} Pending</span>
          </div>
        </div>

        {/* Parent Tuition Paid Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)',
            border: '1px solid #a7f3d0',
            borderRadius: '14px',
            padding: '16px 20px',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Parent Fee Collections
            </span>
            <Wallet size={18} style={{ color: '#059669' }} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#064e3b', marginTop: '8px' }}>
            {formatCurrency(summary.totalParentPayments)}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
            Across {summary.totalTransactions || 0} realized transactions
          </div>
        </div>

        {/* Monthly Average Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)',
            border: '1px solid #bfdbfe',
            borderRadius: '14px',
            padding: '16px 20px',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Average Inflow / Month
            </span>
            <TrendingUp size={18} style={{ color: '#2563eb' }} />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#172554', marginTop: '8px' }}>
            {formatCurrency(summary.avgMonthlyPayments)}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
            {selectedMonth > 0 ? `Rate for ${summary.selectedMonthName}` : '12-Month Annual Average'}
          </div>
        </div>

        {/* Peak Admissions / Collections */}
        <div
          style={{
            background: 'linear-gradient(135deg, #fffbeb 0%, #ffffff 100%)',
            border: '1px solid #fde68a',
            borderRadius: '14px',
            padding: '16px 20px',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Peak Intake & Inflow
            </span>
            <Award size={18} style={{ color: '#d97706' }} />
          </div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#78350f', marginTop: '8px' }}>
            Admissions: <span style={{ color: '#4338ca' }}>{summary.peakAdmissionMonth || '—'}</span>
          </div>
          <div style={{ fontSize: '12px', color: '#78350f', marginTop: '4px' }}>
            Collections: <span style={{ color: '#047857', fontWeight: 600 }}>{summary.peakPaymentMonth || '—'}</span>
          </div>
        </div>
      </div>

      {/* DUAL BAR GRAPHS SECTION */}
      <div
        style={{
          padding: '12px 28px 24px 28px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
          gap: '24px'
        }}
      >
        {/* ================= BAR GRAPH 1: STUDENT ADMISSIONS ================= */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: '#6366f1'
                  }}
                />
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Student Admissions by Month ({selectedYear})
                </h4>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '3px 0 0 18px' }}>
                Monthly enrolled applicants vs approved placements
              </p>
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#6366f1',
                background: '#e0e7ff',
                padding: '3px 8px',
                borderRadius: '8px'
              }}
            >
              Peak: {maxAdmissionCount} max
            </span>
          </div>

          {/* SVG CHART CONTAINER */}
          <div style={{ position: 'relative', height: '220px', width: '100%' }}>
            <svg
              viewBox="0 0 600 200"
              style={{ width: '100%', height: '100%', overflow: 'visible' }}
            >
              <defs>
                <linearGradient id="admissionBarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#4f46e5" />
                </linearGradient>
                <linearGradient id="admissionBarSelected" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#c084fc" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>

              {/* Gridlines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                const y = 170 - pct * 140;
                return (
                  <g key={i}>
                    <line
                      x1="40"
                      y1={y}
                      x2="590"
                      y2={y}
                      stroke="#f1f5f9"
                      strokeDasharray={pct === 0 ? 'none' : '3 3'}
                      strokeWidth="1"
                    />
                    <text
                      x="32"
                      y={y + 4}
                      fill="#94a3b8"
                      fontSize="10"
                      textAnchor="end"
                      fontWeight="500"
                    >
                      {Math.round(pct * maxAdmissionCount)}
                    </text>
                  </g>
                );
              })}

              {/* Bars */}
              {trends.map((item, idx) => {
                const barWidth = 32;
                const slotWidth = (590 - 45) / 12;
                const x = 45 + idx * slotWidth + (slotWidth - barWidth) / 2;
                const height = maxAdmissionCount > 0 ? (item.admissionsCount / maxAdmissionCount) * 140 : 0;
                const y = 170 - height;
                const isSelected = selectedMonth === item.month;
                const isHovered =
                  hoveredBar?.type === 'admission' && hoveredBar?.index === idx;

                return (
                  <g
                    key={item.month}
                    onMouseEnter={() =>
                      setHoveredBar({ type: 'admission', index: idx, data: item })
                    }
                    onMouseLeave={() => setHoveredBar(null)}
                    onClick={() => setSelectedMonth(isSelected ? 0 : item.month)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Background hover pillar */}
                    <rect
                      x={x - 2}
                      y="20"
                      width={barWidth + 4}
                      height="150"
                      fill={isSelected ? '#e0e7ff33' : isHovered ? '#f8fafc' : 'transparent'}
                      rx="6"
                    />

                    {/* Bar */}
                    <rect
                      x={x}
                      y={item.admissionsCount > 0 ? y : 168}
                      width={barWidth}
                      height={item.admissionsCount > 0 ? Math.max(height, 4) : 2}
                      rx="5"
                      fill={
                        isSelected
                          ? 'url(#admissionBarSelected)'
                          : item.admissionsCount > 0
                          ? 'url(#admissionBarGrad)'
                          : '#cbd5e1'
                      }
                      style={{
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        filter: isSelected
                          ? 'drop-shadow(0 4px 8px rgba(124, 58, 237, 0.4))'
                          : isHovered
                          ? 'drop-shadow(0 4px 6px rgba(79, 70, 229, 0.3))'
                          : 'none'
                      }}
                    />

                    {/* Value Badge above bar */}
                    {item.admissionsCount > 0 && (
                      <text
                        x={x + barWidth / 2}
                        y={y - 6}
                        fill={isSelected ? '#7c3aed' : '#4f46e5'}
                        fontSize="11"
                        fontWeight="700"
                        textAnchor="middle"
                      >
                        {item.admissionsCount}
                      </text>
                    )}

                    {/* Month Label */}
                    <text
                      x={x + barWidth / 2}
                      y="188"
                      fill={isSelected ? '#4338ca' : '#64748b'}
                      fontSize="11"
                      fontWeight={isSelected ? '700' : '500'}
                      textAnchor="middle"
                    >
                      {item.monthName}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div
            style={{
              marginTop: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '11px',
              color: '#64748b',
              borderTop: '1px solid #f1f5f9',
              paddingTop: '8px'
            }}
          >
            <span>* Click any month bar to filter drilldown table below</span>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', background: '#4f46e5', borderRadius: '2px' }} />
                Admissions Recorded
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', background: '#7c3aed', borderRadius: '2px' }} />
                Selected Month
              </span>
            </div>
          </div>
        </div>

        {/* ================= BAR GRAPH 2: PARENT TRANSACTIONS ================= */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: '#10b981'
                  }}
                />
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Parent Fee Transactions by Month ({selectedYear})
                </h4>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '3px 0 0 18px' }}>
                Total tuition installment inflows received from guardians
              </p>
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#059669',
                background: '#d1fae5',
                padding: '3px 8px',
                borderRadius: '8px'
              }}
            >
              Peak: {formatShortCurrency(maxPaymentAmount)}
            </span>
          </div>

          {/* SVG CHART CONTAINER */}
          <div style={{ position: 'relative', height: '220px', width: '100%' }}>
            <svg
              viewBox="0 0 600 200"
              style={{ width: '100%', height: '100%', overflow: 'visible' }}
            >
              <defs>
                <linearGradient id="paymentBarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="paymentBarSelected" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#2dd4bf" />
                  <stop offset="100%" stopColor="#0d9488" />
                </linearGradient>
              </defs>

              {/* Gridlines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                const y = 170 - pct * 140;
                return (
                  <g key={i}>
                    <line
                      x1="45"
                      y1={y}
                      x2="590"
                      y2={y}
                      stroke="#f1f5f9"
                      strokeDasharray={pct === 0 ? 'none' : '3 3'}
                      strokeWidth="1"
                    />
                    <text
                      x="38"
                      y={y + 4}
                      fill="#94a3b8"
                      fontSize="10"
                      textAnchor="end"
                      fontWeight="500"
                    >
                      {formatShortCurrency(pct * maxPaymentAmount)}
                    </text>
                  </g>
                );
              })}

              {/* Bars */}
              {trends.map((item, idx) => {
                const barWidth = 32;
                const slotWidth = (590 - 45) / 12;
                const x = 45 + idx * slotWidth + (slotWidth - barWidth) / 2;
                const amt = Number(item.parentPaymentsAmount) || 0;
                const height = maxPaymentAmount > 0 ? (amt / maxPaymentAmount) * 140 : 0;
                const y = 170 - height;
                const isSelected = selectedMonth === item.month;
                const isHovered =
                  hoveredBar?.type === 'payment' && hoveredBar?.index === idx;

                return (
                  <g
                    key={item.month}
                    onMouseEnter={() =>
                      setHoveredBar({ type: 'payment', index: idx, data: item })
                    }
                    onMouseLeave={() => setHoveredBar(null)}
                    onClick={() => setSelectedMonth(isSelected ? 0 : item.month)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Background hover pillar */}
                    <rect
                      x={x - 2}
                      y="20"
                      width={barWidth + 4}
                      height="150"
                      fill={isSelected ? '#d1fae533' : isHovered ? '#f8fafc' : 'transparent'}
                      rx="6"
                    />

                    {/* Bar */}
                    <rect
                      x={x}
                      y={amt > 0 ? y : 168}
                      width={barWidth}
                      height={amt > 0 ? Math.max(height, 4) : 2}
                      rx="5"
                      fill={
                        isSelected
                          ? 'url(#paymentBarSelected)'
                          : amt > 0
                          ? 'url(#paymentBarGrad)'
                          : '#cbd5e1'
                      }
                      style={{
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        filter: isSelected
                          ? 'drop-shadow(0 4px 8px rgba(13, 148, 136, 0.4))'
                          : isHovered
                          ? 'drop-shadow(0 4px 6px rgba(5, 150, 105, 0.3))'
                          : 'none'
                      }}
                    />

                    {/* Value Badge above bar */}
                    {amt > 0 && (
                      <text
                        x={x + barWidth / 2}
                        y={y - 6}
                        fill={isSelected ? '#0f766e' : '#047857'}
                        fontSize="10"
                        fontWeight="700"
                        textAnchor="middle"
                      >
                        {formatShortCurrency(amt)}
                      </text>
                    )}

                    {/* Month Label */}
                    <text
                      x={x + barWidth / 2}
                      y="188"
                      fill={isSelected ? '#065f46' : '#64748b'}
                      fontSize="11"
                      fontWeight={isSelected ? '700' : '500'}
                      textAnchor="middle"
                    >
                      {item.monthName}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div
            style={{
              marginTop: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '11px',
              color: '#64748b',
              borderTop: '1px solid #f1f5f9',
              paddingTop: '8px'
            }}
          >
            <span>* Click any month bar to view parent payment receipts</span>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', background: '#059669', borderRadius: '2px' }} />
                Collections Realized
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', background: '#0d9488', borderRadius: '2px' }} />
                Selected Month
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MONTH DRILLDOWN SECTION */}
      <div
        style={{
          borderTop: '1px solid #e2e8f0',
          background: '#ffffff',
          padding: '24px 28px'
        }}
      >
        {/* DRILLDOWN CONTROLS & TABS */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '18px',
            gap: '14px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                fontSize: '15px',
                fontWeight: 700,
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FileText size={18} style={{ color: '#4f46e5' }} />
              Detailed Records for:
              <span
                style={{
                  background: '#f1f5f9',
                  color: '#1e293b',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1'
                }}
              >
                {selectedMonth > 0 ? `${MONTH_LABELS[selectedMonth - 1]} ${selectedYear}` : `All Months of ${selectedYear}`}
              </span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* SEARCH INPUT */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#f8fafc',
                border: isSearching ? '1px solid #6366f1' : '1px solid #cbd5e1',
                borderRadius: '10px',
                padding: '6px 12px',
                width: '280px',
                transition: 'all 0.2s ease',
                boxShadow: isSearching ? '0 0 0 2px rgba(99, 102, 241, 0.15)' : 'none'
              }}
            >
              <Search size={14} style={{ color: isSearching ? '#4f46e5' : '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search student, parent, ID, class..."
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
              {isSearching && (
                <button
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    color: '#94a3b8'
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* TAB BUTTONS */}
            <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '10px', padding: '3px' }}>
              <button
                onClick={() => setActiveTab('admissions')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: activeTab === 'admissions' ? 700 : 500,
                  border: 'none',
                  background: activeTab === 'admissions' ? '#ffffff' : 'transparent',
                  color: activeTab === 'admissions' ? '#4f46e5' : '#64748b',
                  boxShadow: activeTab === 'admissions' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <GraduationCap size={14} />
                <span>
                  Student Admissions ({displayedAdmissions.length}
                  {!isSearching && filteredAdmissions.length > 10 ? ` of ${filteredAdmissions.length}` : ''})
                </span>
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: activeTab === 'transactions' ? 700 : 500,
                  border: 'none',
                  background: activeTab === 'transactions' ? '#ffffff' : 'transparent',
                  color: activeTab === 'transactions' ? '#059669' : '#64748b',
                  boxShadow: activeTab === 'transactions' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <CreditCard size={14} />
                <span>
                  Parent Fee Transactions ({displayedTransactions.length}
                  {!isSearching && filteredTransactions.length > 10 ? ` of ${filteredTransactions.length}` : ''})
                </span>
              </button>
              <button
                onClick={() => setActiveTab('studentFees')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: activeTab === 'studentFees' ? 700 : 500,
                  border: 'none',
                  background: activeTab === 'studentFees' ? '#ffffff' : 'transparent',
                  color: activeTab === 'studentFees' ? '#2563eb' : '#64748b',
                  boxShadow: activeTab === 'studentFees' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Users size={14} />
                <span>
                  Student Fee Accounts ({displayedStudentFees.length}
                  {!isSearching && filteredStudentFees.length > 10 ? ` of ${filteredStudentFees.length}` : ''})
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* RECORD CONTEXT / RECENT 10 INDICATOR BANNER */}
        <div
          style={{
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            padding: '8px 14px',
            borderRadius: '10px',
            background: isSearching ? '#eff6ff' : '#f8fafc',
            border: isSearching ? '1px solid #bfdbfe' : '1px solid #e2e8f0'
          }}
        >
          {isSearching ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e40af' }}>
              <Search size={14} />
              <span>
                Found <strong>
                  {activeTab === 'admissions'
                    ? filteredAdmissions.length
                    : activeTab === 'transactions'
                    ? filteredTransactions.length
                    : filteredStudentFees.length}
                </strong> matching record(s) across all records for "<strong>{searchQuery}</strong>"
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569' }}>
              <Clock size={14} style={{ color: '#6366f1' }} />
              <span>
                {activeTab === 'admissions' ? (
                  filteredAdmissions.length > 10 && !showAllAdmissions ? (
                    <>Displaying the <strong>10 most recent</strong> admissions (out of {filteredAdmissions.length} total). Search above to find any specific student record.</>
                  ) : (
                    <>Displaying all <strong>{filteredAdmissions.length}</strong> recent admissions.</>
                  )
                ) : activeTab === 'transactions' ? (
                  filteredTransactions.length > 10 && !showAllTransactions ? (
                    <>Displaying the <strong>10 most recent</strong> parent transactions (out of {filteredTransactions.length} total). Search above to find any specific transaction.</>
                  ) : (
                    <>Displaying all <strong>{filteredTransactions.length}</strong> parent fee payment transactions.</>
                  )
                ) : (
                  filteredStudentFees.length > 10 && !showAllStudentFees ? (
                    <>Displaying the <strong>10 most recent</strong> student fee accounts (out of {filteredStudentFees.length} total). Search above to find any specific student account.</>
                  ) : (
                    <>Displaying all <strong>{filteredStudentFees.length}</strong> student fee accounts with total paid amounts.</>
                  )
                )}
              </span>
            </div>
          )}

          {/* Toggle or Clear Search Button */}
          {isSearching ? (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                background: '#ffffff',
                border: '1px solid #93c5fd',
                borderRadius: '6px',
                padding: '3px 10px',
                fontSize: '11px',
                fontWeight: 600,
                color: '#1d4ed8',
                cursor: 'pointer'
              }}
            >
              Clear Filter
            </button>
          ) : (
            activeTab === 'admissions' ? (
              filteredAdmissions.length > 10 && (
                <button
                  onClick={() => setShowAllAdmissions(!showAllAdmissions)}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '3px 10px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {showAllAdmissions ? (
                    <>Show 10 Recent <ChevronUp size={12} /></>
                  ) : (
                    <>View All ({filteredAdmissions.length}) <ChevronDown size={12} /></>
                  )}
                </button>
              )
            ) : activeTab === 'transactions' ? (
              filteredTransactions.length > 10 && (
                <button
                  onClick={() => setShowAllTransactions(!showAllTransactions)}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '3px 10px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {showAllTransactions ? (
                    <>Show 10 Recent <ChevronUp size={12} /></>
                  ) : (
                    <>View All ({filteredTransactions.length}) <ChevronDown size={12} /></>
                  )}
                </button>
              )
            ) : (
              filteredStudentFees.length > 10 && (
                <button
                  onClick={() => setShowAllStudentFees(!showAllStudentFees)}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '3px 10px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {showAllStudentFees ? (
                    <>Show 10 Recent <ChevronUp size={12} /></>
                  ) : (
                    <>View All ({filteredStudentFees.length}) <ChevronDown size={12} /></>
                  )}
                </button>
              )
            )
          )}
        </div>

        {/* TAB 1: ADMISSIONS TABLE */}
        {activeTab === 'admissions' && (
          <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                  <th style={{ padding: '12px 16px' }}>Admission ID</th>
                  <th style={{ padding: '12px 16px' }}>Student Applicant</th>
                  <th style={{ padding: '12px 16px' }}>Target Grade</th>
                  <th style={{ padding: '12px 16px' }}>Parent / Guardian</th>
                  <th style={{ padding: '12px 16px' }}>Parent Email</th>
                  <th style={{ padding: '12px 16px' }}>Application Status</th>
                  <th style={{ padding: '12px 16px' }}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {displayedAdmissions.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                      <AlertCircle size={28} style={{ margin: '0 auto 8px auto', display: 'block', color: '#cbd5e1' }} />
                      {isSearching
                        ? `No student admissions found matching "${searchQuery}".`
                        : 'No student admissions recorded for this selection.'}
                    </td>
                  </tr>
                ) : (
                  displayedAdmissions.map((adm) => {
                    const isAccepted = adm.status === 'ACCEPTED' || adm.status === 'CONFIRMED';
                    const isRejected = adm.status === 'REJECTED';

                    return (
                      <tr
                        key={adm.id || adm.admissionId}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: '#334155' }}>
                          <span
                            style={{
                              background: '#f1f5f9',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontFamily: 'monospace'
                            }}
                          >
                            {adm.admissionId}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>
                          {adm.studentName}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#475569' }}>
                          Class {adm.className} (Sec {adm.section || 'A'})
                        </td>
                        <td style={{ padding: '12px 16px', color: '#334155' }}>
                          {adm.parentName}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '12px' }}>
                          {adm.parentEmail || '—'}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '3px 10px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: 700,
                              background: isAccepted ? '#ecfdf5' : isRejected ? '#fef2f2' : '#fffbeb',
                              color: isAccepted ? '#059669' : isRejected ? '#dc2626' : '#d97706',
                              border: `1px solid ${
                                isAccepted ? '#a7f3d0' : isRejected ? '#fecaca' : '#fde68a'
                              }`
                            }}
                          >
                            {isAccepted ? (
                              <CheckCircle2 size={12} />
                            ) : isRejected ? (
                              <AlertCircle size={12} />
                            ) : (
                              <Clock size={12} />
                            )}
                            {adm.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '12px' }}>
                          {adm.createdAt}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            {!isSearching && filteredAdmissions.length > 10 && (
              <div
                style={{
                  padding: '12px 18px',
                  background: '#f8fafc',
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '12px',
                  color: '#64748b'
                }}
              >
                <span>
                  Showing <strong>{displayedAdmissions.length}</strong> of <strong>{filteredAdmissions.length}</strong> admissions ({showAllAdmissions ? 'All Records' : '10 Most Recent'})
                </span>
                <button
                  onClick={() => setShowAllAdmissions(!showAllAdmissions)}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '5px 12px',
                    color: '#4f46e5',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                >
                  {showAllAdmissions ? (
                    <>Show 10 Recent Only <ChevronUp size={13} /></>
                  ) : (
                    <>Show All ({filteredAdmissions.length}) Records <ChevronDown size={13} /></>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TRANSACTIONS TABLE */}
        {activeTab === 'transactions' && (
          <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                  <th style={{ padding: '12px 16px' }}>Receipt / TXN Ref</th>
                  <th style={{ padding: '12px 16px' }}>Student</th>
                  <th style={{ padding: '12px 16px' }}>Standard</th>
                  <th style={{ padding: '12px 16px' }}>Parent / Guardian</th>
                  <th style={{ padding: '12px 16px' }}>Installment Tier</th>
                  <th style={{ padding: '12px 16px' }}>Amount Realized</th>
                  <th style={{ padding: '12px 16px' }}>Student Total Paid / Due</th>
                  <th style={{ padding: '12px 16px' }}>Paid Date</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {displayedTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                      <AlertCircle size={28} style={{ margin: '0 auto 8px auto', display: 'block', color: '#cbd5e1' }} />
                      {isSearching
                        ? `No parent fee payments found matching "${searchQuery}".`
                        : 'No parent fee payments recorded for this selection.'}
                    </td>
                  </tr>
                ) : (
                  displayedTransactions.map((tx) => (
                    <tr
                      key={tx.transactionId}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#334155' }}>
                        <span
                          style={{
                            background: '#ecfdf5',
                            color: '#065f46',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontFamily: 'monospace',
                            fontSize: '11px',
                            border: '1px solid #a7f3d0'
                          }}
                        >
                          {tx.transactionId}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>
                        <div>{tx.studentName}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{tx.studentId}</div>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#475569' }}>
                        Class {tx.classStandard}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#334155' }}>
                        <div>{tx.parentName || '—'}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{tx.parentPhone || ''}</div>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#4338ca', fontWeight: 600 }}>
                        {tx.installmentName}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#059669', fontSize: '14px' }}>
                        {formatCurrency(tx.amount)}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>
                            {formatCurrency(tx.studentTotalPaid || tx.amount)}
                          </span>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>
                            / {formatCurrency(tx.studentTotalFee || 60000)}
                          </span>
                        </div>
                        <div style={{ fontSize: '11px', color: Number(tx.studentDueAmount) > 0 ? '#dc2626' : '#059669', marginTop: '2px', fontWeight: 500 }}>
                          {Number(tx.studentDueAmount) > 0 ? `Due: ${formatCurrency(tx.studentDueAmount)}` : '✓ Cleared in Full'}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '12px' }}>
                        {tx.paidAt}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 10px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: '#ecfdf5',
                            color: '#059669',
                            border: '1px solid #a7f3d0'
                          }}
                        >
                          <CheckCircle2 size={12} />
                          PAID
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {!isSearching && filteredTransactions.length > 10 && (
              <div
                style={{
                  padding: '12px 18px',
                  background: '#f8fafc',
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '12px',
                  color: '#64748b'
                }}
              >
                <span>
                  Showing <strong>{displayedTransactions.length}</strong> of <strong>{filteredTransactions.length}</strong> transactions ({showAllTransactions ? 'All Records' : '10 Most Recent'})
                </span>
                <button
                  onClick={() => setShowAllTransactions(!showAllTransactions)}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '5px 12px',
                    color: '#059669',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                >
                  {showAllTransactions ? (
                    <>Show 10 Recent Only <ChevronUp size={13} /></>
                  ) : (
                    <>Show All ({filteredTransactions.length}) Records <ChevronDown size={13} /></>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: STUDENT FEE ACCOUNTS TABLE */}
        {activeTab === 'studentFees' && (
          <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                  <th style={{ padding: '12px 16px' }}>Student Profile</th>
                  <th style={{ padding: '12px 16px' }}>Grade & Sec</th>
                  <th style={{ padding: '12px 16px' }}>Parent / Guardian</th>
                  <th style={{ padding: '12px 16px' }}>Annual Fee</th>
                  <th style={{ padding: '12px 16px' }}>Total Paid Amount</th>
                  <th style={{ padding: '12px 16px' }}>Remaining Due</th>
                  <th style={{ padding: '12px 16px' }}>Installments (T1–T4)</th>
                  <th style={{ padding: '12px 16px' }}>Payment Progress</th>
                  <th style={{ padding: '12px 16px' }}>Fee Status</th>
                </tr>
              </thead>
              <tbody>
                {displayedStudentFees.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                      <AlertCircle size={28} style={{ margin: '0 auto 8px auto', display: 'block', color: '#cbd5e1' }} />
                      {isSearching
                        ? `No student fee accounts found matching "${searchQuery}".`
                        : 'No student fee accounts recorded.'}
                    </td>
                  </tr>
                ) : (
                  displayedStudentFees.map((fee) => {
                    const isFullyPaid = fee.feeStatus === 'PAID';
                    const isPartial = fee.feeStatus === 'PARTIAL';
                    const terms = [
                      { label: 'T1', status: fee.firstInstallmentStatus, date: fee.firstInstallmentPaidAt },
                      { label: 'T2', status: fee.secondInstallmentStatus, date: fee.secondInstallmentPaidAt },
                      { label: 'T3', status: fee.thirdInstallmentStatus, date: fee.thirdInstallmentPaidAt },
                      { label: 'T4', status: fee.fourthInstallmentStatus, date: fee.fourthInstallmentPaidAt },
                    ];

                    return (
                      <tr
                        key={fee.studentId}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>
                          <div>{fee.studentName}</div>
                          <span
                            style={{
                              background: '#f1f5f9',
                              color: '#475569',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontFamily: 'monospace',
                              fontSize: '11px'
                            }}
                          >
                            {fee.studentId}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#475569' }}>
                          Class {fee.classStandard || '—'} {fee.sectionName ? `(${fee.sectionName})` : ''}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#334155' }}>
                          <div>{fee.parentName || '—'}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{fee.parentPhone || ''}</div>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#334155', fontWeight: 600 }}>
                          {formatCurrency(fee.totalAmount)}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span
                            style={{
                              fontSize: '14px',
                              fontWeight: 800,
                              color: isFullyPaid ? '#047857' : isPartial ? '#059669' : '#64748b',
                              background: isFullyPaid ? '#ecfdf5' : '#f8fafc',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              border: isFullyPaid ? '1px solid #a7f3d0' : '1px solid #e2e8f0'
                            }}
                          >
                            {formatCurrency(fee.totalAmountPaid)}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {Number(fee.dueAmount) > 0 ? (
                            <span style={{ color: '#dc2626', fontWeight: 700, fontSize: '13px' }}>
                              {formatCurrency(fee.dueAmount)}
                            </span>
                          ) : (
                            <span style={{ color: '#059669', fontWeight: 600, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle2 size={13} /> Cleared
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {terms.map((t, idx) => {
                              const isPaid = t.status === 'PAID';
                              return (
                                <span
                                  key={idx}
                                  title={`${t.label}: ${isPaid ? `Paid (${t.date || 'Yes'})` : 'Pending'}`}
                                  style={{
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    padding: '2px 5px',
                                    borderRadius: '4px',
                                    background: isPaid ? '#ecfdf5' : '#f1f5f9',
                                    color: isPaid ? '#047857' : '#94a3b8',
                                    border: isPaid ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '2px'
                                  }}
                                >
                                  {t.label}
                                  {isPaid && <Check size={10} />}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', minWidth: '130px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
                            <span style={{ fontWeight: 700, color: '#334155' }}>{fee.paidPercentage}%</span>
                            <span style={{ color: '#64748b' }}>{fee.termsPaidCount}/4 Terms</span>
                          </div>
                          <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${Math.min(fee.paidPercentage || 0, 100)}%`,
                                height: '100%',
                                background: isFullyPaid ? '#10b981' : isPartial ? '#3b82f6' : '#cbd5e1',
                                borderRadius: '3px',
                                transition: 'width 0.3s ease'
                              }}
                            />
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '3px 10px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: 700,
                              background: isFullyPaid ? '#ecfdf5' : isPartial ? '#eff6ff' : '#fef2f2',
                              color: isFullyPaid ? '#059669' : isPartial ? '#1d4ed8' : '#dc2626',
                              border: `1px solid ${isFullyPaid ? '#a7f3d0' : isPartial ? '#bfdbfe' : '#fecaca'}`
                            }}
                          >
                            {isFullyPaid ? (
                              <CheckCircle2 size={12} />
                            ) : isPartial ? (
                              <Clock size={12} />
                            ) : (
                              <AlertCircle size={12} />
                            )}
                            {fee.feeStatus || 'UNPAID'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            {!isSearching && filteredStudentFees.length > 10 && (
              <div
                style={{
                  padding: '12px 18px',
                  background: '#f8fafc',
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '12px',
                  color: '#64748b'
                }}
              >
                <span>
                  Showing <strong>{displayedStudentFees.length}</strong> of <strong>{filteredStudentFees.length}</strong> student accounts ({showAllStudentFees ? 'All Records' : '10 Most Recent'})
                </span>
                <button
                  onClick={() => setShowAllStudentFees(!showAllStudentFees)}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '5px 12px',
                    color: '#2563eb',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                >
                  {showAllStudentFees ? (
                    <>Show 10 Recent Only <ChevronUp size={13} /></>
                  ) : (
                    <>Show All ({filteredStudentFees.length}) Records <ChevronDown size={13} /></>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

