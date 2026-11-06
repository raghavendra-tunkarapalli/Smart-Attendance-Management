import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Receipt,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Download,
  Printer,
  ShieldCheck,
  ChevronRight,
  X,
  Sparkles,
  Building,
  Calendar,
  DollarSign,
  User,
  Phone,
  RefreshCw,
  Info,
  Lock
} from 'lucide-react';

const GATEWAY_URL = 'http://localhost:8099/api/student-fee';
const DIRECT_URL = 'http://localhost:8105/api/student-fee';

export default function StudentFeeModule({ user, profileData }) {
  const [feeData, setFeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Student identifier resolution
  const resolvedStudentId = profileData?.studentId || user?.studentId || '';
  const resolvedUsername = profileData?.username || user?.username || '';
  const resolvedName = profileData?.firstName
    ? `${profileData.firstName} ${profileData.lastName || ''}`.trim()
    : user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : '';

  // Dual-routing fetch helper (tries Gateway, falls back to direct port 8105)
  const fetchStudentFeeApi = async (endpoint, options = {}) => {
    let res = null;
    try {
      res = await fetch(`${GATEWAY_URL}${endpoint}`, options);
      if (res && res.ok) return res;
    } catch {}

    try {
      res = await fetch(`${DIRECT_URL}${endpoint}`, options);
      if (res && res.ok) return res;
    } catch (e) {
      console.warn(`Direct fetch to ${DIRECT_URL}${endpoint} failed:`, e);
    }
    return res;
  };

  const fetchFeeDetails = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const queryParams = new URLSearchParams();
      if (resolvedStudentId) queryParams.append('studentId', resolvedStudentId);
      if (resolvedUsername) queryParams.append('username', resolvedUsername);
      if (resolvedName) queryParams.append('name', resolvedName);

      const res = await fetchStudentFeeApi(`/my-fee?${queryParams.toString()}`);
      if (res && res.ok) {
        const data = await res.json();
        setFeeData(data);
      } else {
        setErrorMessage('Unable to retrieve fee records. Please verify student enrollment with the institution.');
      }
    } catch (err) {
      console.error('Error fetching student fee data:', err);
      setErrorMessage('Network error while connecting to student-fee-payment-service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeDetails();
  }, [resolvedStudentId, resolvedUsername]);

  const handleOpenReceipt = async (installmentNum) => {
    if (!feeData) return;
    setReceiptLoading(true);
    try {
      const res = await fetchStudentFeeApi(`/receipt/${feeData.studentId}/${installmentNum}`);
      if (res && res.ok) {
        const receipt = await res.json();
        setSelectedReceipt(receipt);
      } else {
        const err = await res?.json().catch(() => null);
        alert(err?.error || 'Receipt is only available for fully paid installments.');
      }
    } catch (err) {
      console.error('Failed to load receipt:', err);
      alert('Unable to load receipt details. Please try again.');
    } finally {
      setReceiptLoading(false);
    }
  };

  const handleDownloadReceiptHtml = (installmentNum) => {
    if (!feeData) return;
    const downloadUrl = `${DIRECT_URL}/receipt/${feeData.studentId}/${installmentNum}/download`;
    window.open(downloadUrl, '_blank');
  };

  const formatCurrency = (val) => {
    if (val === null || val === undefined) return '₹0';
    return '₹' + Number(val).toLocaleString('en-IN');
  };

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

  const paidPercent = feeData?.totalAmount && feeData.totalAmount > 0
    ? Math.min(100, Math.round((Number(feeData.totalAmountPaid || 0) / Number(feeData.totalAmount)) * 100))
    : 0;

  const installments = feeData ? [
    {
      num: 1,
      title: '1st Installment (Quarter 1)',
      period: 'Apr – Jun Term',
      amount: feeData.firstInstallment,
      status: feeData.firstInstallmentStatus,
      paidAt: feeData.firstInstallmentPaidAt
    },
    {
      num: 2,
      title: '2nd Installment (Quarter 2)',
      period: 'Jul – Sep Term',
      amount: feeData.secondInstallment,
      status: feeData.secondInstallmentStatus,
      paidAt: feeData.secondInstallmentPaidAt
    },
    {
      num: 3,
      title: '3rd Installment (Quarter 3)',
      period: 'Oct – Dec Term',
      amount: feeData.thirdInstallment,
      status: feeData.thirdInstallmentStatus,
      paidAt: feeData.thirdInstallmentPaidAt
    },
    {
      num: 4,
      title: '4th Installment (Quarter 4)',
      period: 'Jan – Mar Term',
      amount: feeData.fourthInstallment,
      status: feeData.fourthInstallmentStatus,
      paidAt: feeData.fourthInstallmentPaidAt
    }
  ] : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-20)', width: '100%', minWidth: 0 }}>
      
      {/* COHORT & STUDENT IDENTIFIER BANNER */}
      <div style={{
        background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
        border: '1px solid #bbf7d0',
        borderRadius: '16px',
        padding: '20px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: '#16a34a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            fontSize: '18px',
            boxShadow: '0 4px 10px rgba(22, 163, 74, 0.25)'
          }}>
            <CreditCard size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                {feeData ? `${feeData.firstName} ${feeData.lastName || ''}` : resolvedName || 'Student Financial Portal'}
              </h3>
              <span style={{
                fontSize: '11px',
                fontWeight: '700',
                padding: '2px 8px',
                borderRadius: '6px',
                background: '#dcfce7',
                color: '#15803d',
                border: '1px solid #86efac'
              }}>
                STUDENT ROLE &bull; READ ONLY
              </span>
            </div>
            <p style={{ margin: '3px 0 0 0', fontSize: '12.5px', color: '#475569' }}>
              Student ID: <strong>{feeData?.studentId || resolvedStudentId || 'ADM-24992'}</strong> &bull; Class: <strong>{feeData?.classStandard || '10'}</strong> – Sec <strong>{feeData?.sectionName || 'A'}</strong> &bull; Academic Year: <strong>{feeData?.academicYear || '2025-2026'}</strong>
            </p>
          </div>
        </div>

        <button
          onClick={fetchFeeDetails}
          disabled={loading}
          className="btn-apple-outline"
          style={{ padding: '6px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={13} className={loading ? 'spin' : ''} />
          <span>Refresh Records</span>
        </button>
      </div>

      {loading ? (
        <div style={{
          background: 'var(--color-gallery-white)',
          border: '1px solid var(--color-hairline-silver)',
          borderRadius: 'var(--radius-cards)',
          padding: '60px 20px',
          textAlign: 'center'
        }}>
          <RefreshCw size={26} className="spin" style={{ color: 'var(--color-pricing-blue)', margin: '0 auto 12px auto' }} />
          <h4 style={{ fontSize: '15px', color: 'var(--color-ink)', margin: 0 }}>Loading Financial Statements...</h4>
          <p style={{ fontSize: '12.5px', color: 'var(--color-slate)', marginTop: '4px' }}>Querying student-fee-payment-service (:8105)</p>
        </div>
      ) : errorMessage ? (
        <div style={{
          background: '#fff1f2',
          border: '1px solid #fecdd3',
          borderRadius: '16px',
          padding: '40px 24px',
          textAlign: 'center'
        }}>
          <AlertCircle size={32} style={{ color: '#e11d48', margin: '0 auto 10px auto' }} />
          <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#9f1239', margin: 0 }}>Statement Unavailable</h4>
          <p style={{ fontSize: '13px', color: '#be123c', maxWidth: '460px', margin: '6px auto 0' }}>{errorMessage}</p>
          <button
            onClick={fetchFeeDetails}
            className="btn-pricing-blue"
            style={{ marginTop: '16px', padding: '8px 20px', fontSize: '12.5px' }}
          >
            Retry Connection
          </button>
        </div>
      ) : feeData ? (
        <>
          {/* FINANCIAL SUMMARY KPI CARDS */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--spacing-16)',
            width: '100%'
          }}>
            {/* Card 1: Total Tuition */}
            <div style={{
              background: 'var(--color-gallery-white)',
              border: '1px solid var(--color-hairline-silver)',
              borderRadius: 'var(--radius-cards)',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--color-slate)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Annual Tuition Fee
                </span>
                <Building size={16} style={{ color: '#2563eb' }} />
              </div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-ink)' }}>
                {formatCurrency(feeData.totalAmount)}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--color-slate)' }}>
                Academic Session {feeData.academicYear}
              </div>
            </div>

            {/* Card 2: Total Amount Paid */}
            <div style={{
              background: 'var(--color-gallery-white)',
              border: '1px solid #bbf7d0',
              borderRadius: 'var(--radius-cards)',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Total Realized
                </span>
                <CheckCircle2 size={16} style={{ color: '#16a34a' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#15803d' }}>
                  {formatCurrency(feeData.totalAmountPaid)}
                </div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: '#15803d',
                  background: '#dcfce7',
                  padding: '2px 8px',
                  borderRadius: '6px'
                }}>
                  {paidPercent}%
                </span>
              </div>
              <div style={{ width: '100%', height: '5px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden', marginTop: '4px' }}>
                <div style={{
                  width: `${paidPercent}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #16a34a, #22c55e)',
                  borderRadius: '999px'
                }} />
              </div>
            </div>

            {/* Card 3: Outstanding Academic Due */}
            <div style={{
              background: 'var(--color-gallery-white)',
              border: `1px solid ${Number(feeData.dueAmount) > 0 ? '#fecaca' : '#bbf7d0'}`,
              borderRadius: 'var(--radius-cards)',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontSize: '11.5px',
                  fontWeight: '700',
                  color: Number(feeData.dueAmount) > 0 ? '#dc2626' : '#16a34a',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>
                  Outstanding Dues
                </span>
                <Clock size={16} style={{ color: Number(feeData.dueAmount) > 0 ? '#dc2626' : '#16a34a' }} />
              </div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: Number(feeData.dueAmount) > 0 ? '#b91c1c' : '#15803d' }}>
                {formatCurrency(feeData.dueAmount)}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--color-slate)' }}>
                {Number(feeData.dueAmount) > 0 ? 'Pending term clearance' : 'All installments cleared!'}
              </div>
            </div>

            {/* Card 4: Institutional Clearance Status */}
            <div style={{
              background: 'var(--color-gallery-white)',
              border: '1px solid var(--color-hairline-silver)',
              borderRadius: 'var(--radius-cards)',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--color-slate)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Institutional Status
                </span>
                <ShieldCheck size={16} style={{ color: '#0284c7' }} />
              </div>
              <div style={{ marginTop: '2px' }}>
                {feeData.feeStatus === 'PAID' ? (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 12px',
                    borderRadius: '8px',
                    background: '#ecfdf5',
                    color: '#059669',
                    border: '1px solid #a7f3d0',
                    fontSize: '12.5px',
                    fontWeight: '700'
                  }}>
                    <CheckCircle2 size={14} /> FULLY CLEARED
                  </span>
                ) : feeData.feeStatus === 'PARTIAL' ? (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 12px',
                    borderRadius: '8px',
                    background: '#fffbeb',
                    color: '#d97706',
                    border: '1px solid #fde68a',
                    fontSize: '12.5px',
                    fontWeight: '700'
                  }}>
                    <Clock size={14} /> PARTIAL DUES PENDING
                  </span>
                ) : (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 12px',
                    borderRadius: '8px',
                    background: '#fef2f2',
                    color: '#dc2626',
                    border: '1px solid #fecaca',
                    fontSize: '12.5px',
                    fontWeight: '700'
                  }}>
                    <AlertCircle size={14} /> UNPAID TUITION
                  </span>
                )}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--color-slate)' }}>
                Official institution accounts ledger
              </div>
            </div>
          </div>

          {/* READ-ONLY PAYMENT POLICY NOTICE */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '12px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Lock size={18} style={{ color: '#64748b', flexShrink: 0 }} />
            <div style={{ fontSize: '12.5px', color: '#475569', lineHeight: '1.5' }}>
              <strong style={{ color: '#0f172a' }}>Read-Only Financial Statement:</strong> For security and institutional compliance, tuition payments cannot be executed from the student portal. All pending dues must be paid by parents/guardians through the Parent Portal or directly at the school accounts desk. Official payment receipts can be inspected and downloaded below for any cleared terms.
            </div>
          </div>

          {/* 4 QUARTERLY INSTALLMENTS SCHEDULE */}
          <div style={{
            background: 'var(--color-gallery-white)',
            border: '1px solid var(--color-hairline-silver)',
            borderRadius: 'var(--radius-cards)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', borderBottom: '1px solid var(--color-hairline-silver)', paddingBottom: '14px' }}>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-ink)', margin: 0 }}>
                  Tuition Fee Installment Schedule & Records
                </h4>
                <p style={{ margin: '3px 0 0 0', fontSize: '12.5px', color: 'var(--color-slate)' }}>
                  Divided into 4 equal quarterly terms (25% per term)
                </p>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--color-slate)' }}>
                Guardian: <strong style={{ color: 'var(--color-ink)' }}>{feeData.parentName || 'Not recorded'}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {installments.map((inst) => {
                const isPaid = inst.status === 'PAID';
                return (
                  <div
                    key={inst.num}
                    style={{
                      background: isPaid ? '#f0fdf4' : 'var(--color-gallery-white)',
                      border: `1px solid ${isPaid ? '#bbf7d0' : 'var(--color-hairline-silver)'}`,
                      borderRadius: '12px',
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '14px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: isPaid ? '#dcfce7' : '#f1f5f9',
                        color: isPaid ? '#16a34a' : '#64748b',
                        border: `1px solid ${isPaid ? '#86efac' : '#cbd5e1'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        fontSize: '14px'
                      }}>
                        {isPaid ? <CheckCircle2 size={20} /> : inst.num}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-ink)' }}>
                          {inst.title}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--color-slate)', marginTop: '2px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span>{inst.period}</span>
                          <span>&bull;</span>
                          {isPaid ? (
                            <span style={{ color: '#15803d', fontWeight: '600' }}>
                              Cleared on: {formatDateTime(inst.paidAt)}
                            </span>
                          ) : (
                            <span style={{ color: '#b45309', fontWeight: '600' }}>
                              Payment Pending via Parent Portal
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '16px', fontWeight: '800', color: isPaid ? '#15803d' : 'var(--color-ink)' }}>
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
                          {isPaid ? 'PAID & CLEARED' : 'PENDING'}
                        </span>
                      </div>

                      {/* Receipt Action Button: ONLY enabled if PAID */}
                      {isPaid ? (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => handleOpenReceipt(inst.num)}
                            disabled={receiptLoading}
                            className="btn-apple-outline"
                            style={{
                              padding: '7px 14px',
                              fontSize: '12px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: '#ffffff'
                            }}
                            title="View official fee payment receipt"
                          >
                            <Receipt size={14} style={{ color: '#2563eb' }} />
                            <span>View Receipt</span>
                          </button>

                          <button
                            onClick={() => handleDownloadReceiptHtml(inst.num)}
                            className="btn-apple"
                            style={{
                              padding: '7px 12px',
                              fontSize: '12px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: '#16a34a',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer'
                            }}
                            title="Download official receipt HTML"
                          >
                            <Download size={13} />
                            <span>Download</span>
                          </button>
                        </div>
                      ) : (
                        <div style={{
                          fontSize: '11.5px',
                          color: '#94a3b8',
                          background: '#f8fafc',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}>
                          <Lock size={12} />
                          <span>Receipt locked until paid</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : null}

      {/* OFFICIAL INSTITUTIONAL RECEIPT MODAL */}
      {selectedReceipt && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px'
          }}
          onClick={() => setSelectedReceipt(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px solid var(--color-hairline-silver)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
              width: '100%',
              maxWidth: '640px',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0071e3', paddingBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  {selectedReceipt.institutionName}
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                  {selectedReceipt.institutionAddress} &bull; {selectedReceipt.affiliationNo}
                </p>
              </div>

              <button
                onClick={() => setSelectedReceipt(null)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Official Badge */}
            <div style={{ textAlign: 'center' }}>
              <span style={{
                display: 'inline-block',
                background: '#ecfdf5',
                color: '#059669',
                border: '1px solid #a7f3d0',
                padding: '4px 14px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: '700',
                letterSpacing: '0.04em'
              }}>
                &check; OFFICIAL TUITION PAYMENT RECEIPT &bull; TERM #{selectedReceipt.installmentNumber}
              </span>
            </div>

            {/* Student & Receipt Meta Grid */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '16px 20px',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              fontSize: '13px'
            }}>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: '700', letterSpacing: '0.04em' }}>Receipt Number</span>
                <div style={{ fontWeight: '700', color: '#0f172a', marginTop: '2px' }}>{selectedReceipt.receiptNumber}</div>
              </div>

              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: '700', letterSpacing: '0.04em' }}>Transaction Ref</span>
                <div style={{ fontWeight: '600', color: '#0284c7', marginTop: '2px' }}>{selectedReceipt.transactionReference}</div>
              </div>

              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: '700', letterSpacing: '0.04em' }}>Student ID</span>
                <div style={{ fontWeight: '700', color: '#0f172a', marginTop: '2px' }}>{selectedReceipt.studentId}</div>
              </div>

              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: '700', letterSpacing: '0.04em' }}>Student Name</span>
                <div style={{ fontWeight: '700', color: '#0f172a', marginTop: '2px' }}>{selectedReceipt.studentName}</div>
              </div>

              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: '700', letterSpacing: '0.04em' }}>Class & Section</span>
                <div style={{ fontWeight: '600', color: '#0f172a', marginTop: '2px' }}>Class {selectedReceipt.classStandard} — Section {selectedReceipt.sectionName}</div>
              </div>

              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: '700', letterSpacing: '0.04em' }}>Academic Session</span>
                <div style={{ fontWeight: '600', color: '#0f172a', marginTop: '2px' }}>{selectedReceipt.academicYear}</div>
              </div>

              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: '700', letterSpacing: '0.04em' }}>Parent / Guardian</span>
                <div style={{ fontWeight: '600', color: '#0f172a', marginTop: '2px' }}>{selectedReceipt.parentName}</div>
              </div>

              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: '700', letterSpacing: '0.04em' }}>Clearance Date</span>
                <div style={{ fontWeight: '600', color: '#15803d', marginTop: '2px' }}>{formatDateTime(selectedReceipt.paymentDate)}</div>
              </div>
            </div>

            {/* Fee Breakdown Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: '700', color: '#334155' }}>Particulars</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: '700', color: '#334155' }}>Term</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: '700', color: '#334155' }}>Status</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '700', color: '#334155' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <strong style={{ color: '#0f172a' }}>{selectedReceipt.installmentTitle}</strong>
                    <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>{selectedReceipt.paymentMethod}</div>
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: '600' }}>
                    #{selectedReceipt.installmentNumber}
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                    <span style={{ color: '#059669', fontWeight: '700' }}>&bull; PAID</span>
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: '700', color: '#059669', fontSize: '14px' }}>
                    {formatCurrency(selectedReceipt.amount)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Total Box */}
            <div style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '12px',
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline'
            }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#1e40af' }}>TOTAL AMOUNT RECEIVED</span>
                <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>{selectedReceipt.amountInWords}</div>
              </div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#1e3a8a' }}>
                {formatCurrency(selectedReceipt.amount)}
              </div>
            </div>

            {/* Digital Stamp & Signatory */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px dashed #cbd5e1', paddingTop: '16px', fontSize: '11.5px', color: '#64748b' }}>
              <div>
                <div>Electronic Computer-Generated Voucher &bull; Valid Without Physical Seal</div>
                <div style={{ marginTop: '3px' }}>Issued: {formatDateTime(selectedReceipt.generatedAt)}</div>
              </div>
              <div style={{
                textAlign: 'center',
                border: '2px dashed #059669',
                borderRadius: '10px',
                padding: '6px 14px',
                color: '#059669',
                fontWeight: '700',
                fontSize: '11px'
              }}>
                &check; DIGITALLY CLEARED<br />
                <span style={{ fontSize: '9px', color: '#334155' }}>Accounts Department</span>
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
              <button
                onClick={() => handleDownloadReceiptHtml(selectedReceipt.installmentNumber)}
                className="btn-apple-outline"
                style={{ padding: '8px 16px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Download size={14} />
                <span>Save HTML Receipt</span>
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => window.print()}
                  className="btn-apple"
                  style={{
                    padding: '8px 20px',
                    fontSize: '12.5px',
                    background: '#0071e3',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <Printer size={14} />
                  <span>Print Receipt / PDF</span>
                </button>

                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="btn-apple-outline"
                  style={{ padding: '8px 18px', fontSize: '12.5px' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

