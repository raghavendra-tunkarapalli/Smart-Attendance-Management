import React, { useState, useEffect } from 'react';
import {
  User,
  LogOut,
  Shield,
  Mail,
  IdCard,
  FileText,
  HelpCircle,
  LayoutDashboard,
  CheckCircle,
  Clock,
  Lock,
  Calendar,
  Award,
  BookMarked,
  CreditCard,
  ChevronRight,
  ArrowLeft,
  Ban,
  XCircle,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Check,
  Search,
  Filter,
  BookOpen,
  Coffee,
  Layers
} from 'lucide-react';
import AdmissionModule from './AdmissionModule';
import EnquiryModule from './EnquiryModule';

const GATEWAY_URL = 'http://localhost:8099/api/student-portal';
const DIRECT_URL = 'http://localhost:8090/api/student-portal';

const DAY_TIME_SLOTS = [
  { pIdx: 0, slot: '09:00 AM - 10:00 AM', label: 'Period 1', short: '9-10 AM' },
  { pIdx: 1, slot: '10:00 AM - 11:00 AM', label: 'Period 2', short: '10-11 AM' },
  { pIdx: 2, slot: '11:00 AM - 12:00 PM', label: 'Period 3', short: '11-12 PM' },
  { pIdx: 3, slot: '12:00 PM - 01:00 PM', label: 'Lunch Break', short: '12-01 (Lunch)', isLunch: true },
  { pIdx: 4, slot: '01:00 PM - 02:00 PM', label: 'Period 4', short: '01-02 PM' },
  { pIdx: 5, slot: '02:00 PM - 03:00 PM', label: 'Period 5', short: '02-03 PM' },
  { pIdx: 6, slot: '03:00 PM - 04:00 PM', label: 'Period 6', short: '03-04 PM' },
  { pIdx: 7, slot: '04:00 PM - 05:00 PM', label: 'Period 7', short: '04-05 PM' }
];

const formatDisplayDate = (dateStr) => {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    }
  } catch (e) {}
  return dateStr;
};

export default function StudentPortalModule({ user, token, onLogout }) {
  const [activeTab, setActiveTab] = useState('session');
  const [selectedModule, setSelectedModule] = useState('module1');
  const [profileData, setProfileData] = useState(null);
  const [status, setStatus] = useState('PENDING');
  const [loading, setLoading] = useState(true);

  const username = user?.username || 'student';
  const email = user?.email || 'student@school.com';
  const firstName = profileData?.firstName || user?.firstName || 'Alex';
  const lastName = profileData?.lastName || user?.lastName || 'Morgan';
  const fullName = `${firstName} ${lastName}`.trim();
  const studentClass = profileData?.studentClass || profileData?.grade || user?.studentClass || '10th Standard';
  const [academicsSchedule, setAcademicsSchedule] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const userId = user?.userId || 10;

  // Module 2: Attendance History States
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceDateFilter, setAttendanceDateFilter] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [attendanceDailySchedule, setAttendanceDailySchedule] = useState([]);
  const [attendanceSubjectFilter, setAttendanceSubjectFilter] = useState('ALL');
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState('ALL');
  const [attendanceSearchQuery, setAttendanceSearchQuery] = useState('');

  useEffect(() => {
    fetchProfileStatus();
    fetchAcademicsSchedule(selectedDate);
    const interval = setInterval(() => {
      fetchProfileStatus();
    }, 3000);
    return () => clearInterval(interval);
  }, [username]);

  useEffect(() => {
    fetchAcademicsSchedule(selectedDate);
  }, [selectedDate, username]);

  const fetchAcademicsSchedule = async (dateVal) => {
    try {
      const url = `http://localhost:8099/api/student-schedule/timetable?username=${username}&date=${dateVal}`;
      let res = await fetch(url).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(`http://localhost:8095/api/student-schedule/timetable?username=${username}&date=${dateVal}`).catch(() => null);
      }
      if (res && res.ok) {
        const data = await res.json();
        setAcademicsSchedule(data.schedules || []);
      } else {
        setAcademicsSchedule([]);
      }
    } catch (err) {
      console.warn('Failed to fetch student academics schedule:', err);
      setAcademicsSchedule([]);
    }
  };

  const fetchProfileStatus = async () => {
    setLoading(true);
    try {
      let res = await fetch(`${GATEWAY_URL}/profile/${username}`).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(`${DIRECT_URL}/profile/${username}`).catch(() => null);
      }

      if (res && res.ok) {
        const data = await res.json();
        setProfileData(data);
        const currentStat = (data.status || (data.admissionConfirmed ? 'CONFIRMED' : 'PENDING')).toUpperCase();
        setStatus(currentStat);
      } else {
        setProfileData({
          userId: userId,
          username: username,
          email: email,
          firstName: firstName,
          lastName: lastName,
          role: 'STUDENT',
          admissionConfirmed: false,
          status: 'PENDING'
        });
        setStatus('PENDING');
      }
    } catch (err) {
      console.warn('Failed to fetch student portal status:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentAttendance = async () => {
    setAttendanceLoading(true);
    try {
      const sId = profileData?.studentId || user?.studentId || '';
      let url = `http://localhost:8099/api/teacher-attendance/student?username=${encodeURIComponent(username)}`;
      if (sId) url += `&studentId=${encodeURIComponent(sId)}`;
      let res = await fetch(url).catch(() => null);
      if (!res || !res.ok) {
        let directUrl = `http://localhost:8094/api/teacher-attendance/student?username=${encodeURIComponent(username)}`;
        if (sId) directUrl += `&studentId=${encodeURIComponent(sId)}`;
        res = await fetch(directUrl).catch(() => null);
      }
      if (res && res.ok) {
        const data = await res.json();
        setAttendanceRecords(Array.isArray(data) ? data : []);
      } else {
        setAttendanceRecords([]);
      }
    } catch (err) {
      console.warn('Failed to fetch student attendance:', err);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const fetchAttendanceDailySchedule = async (dateVal) => {
    try {
      const url = `http://localhost:8099/api/student-schedule/timetable?username=${encodeURIComponent(username)}&date=${dateVal}`;
      let res = await fetch(url).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(`http://localhost:8095/api/student-schedule/timetable?username=${encodeURIComponent(username)}&date=${dateVal}`).catch(() => null);
      }
      if (res && res.ok) {
        const data = await res.json();
        setAttendanceDailySchedule(data.schedules || []);
      } else {
        setAttendanceDailySchedule([]);
      }
    } catch (err) {
      console.warn('Failed to fetch daily schedule for attendance:', err);
      setAttendanceDailySchedule([]);
    }
  };

  useEffect(() => {
    if (activeTab === 'session' && selectedModule === 'module2') {
      fetchStudentAttendance();
      fetchAttendanceDailySchedule(attendanceDateFilter);
      const interval = setInterval(() => {
        fetchStudentAttendance();
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [activeTab, selectedModule, attendanceDateFilter, username]);

  const isConfirmed = status === 'CONFIRMED' || status === 'ACCEPTED';
  const isRejected = status === 'REJECTED';
  const isPending = !isConfirmed && !isRejected;

  const initialLetter = firstName ? firstName[0].toUpperCase() : 'A';

  const modulesList = [
    {
      id: 'module1',
      title: 'Schedule',
      tag: 'Daily Timetable',
      subtitle: 'Schedule & Timetable',
      desc: 'Real-time subject periods, designated instructors, and room allocations.',
      icon: <Calendar size={18} />,
      theme: { bg: '#eff6ff', color: '#2563eb', border: '#dbeafe' }
    },
    {
      id: 'module2',
      title: 'Attendance',
      tag: 'History & Breakdown',
      subtitle: 'Attendance History & Performance',
      desc: 'Daily attendance check-ins, monthly metrics, and semester percentage.',
      icon: <Clock size={18} />,
      theme: { bg: '#ecfdf5', color: '#059669', border: '#d1fae5' }
    },
    {
      id: 'module3',
      title: 'Examinations',
      tag: 'Grades & Question Bank',
      subtitle: 'Examinations & Grades',
      desc: 'Exam dates, term report cards, and performance grade sheets.',
      icon: <Award size={18} />,
      theme: { bg: '#fff1f2', color: '#e11d48', border: '#ffe4e6' }
    },
    {
      id: 'module4',
      title: 'Digital Library',
      tag: 'Textbooks & Guides',
      subtitle: 'Library & Learning Resources',
      desc: 'Online textbooks, curriculum guides, and assigned coursework materials.',
      icon: <BookMarked size={18} />,
      theme: { bg: '#f5f3ff', color: '#7c3aed', border: '#ede9fe' }
    },
    {
      id: 'module5',
      title: 'Financial & Fees',
      tag: 'Tuition & Billing',
      subtitle: 'Tuition & Fee Records',
      desc: 'Term fee receipts, payment status, and institutional billing history.',
      icon: <CreditCard size={18} />,
      theme: { bg: '#fffbeb', color: '#d97706', border: '#fef3c7' }
    }
  ];

  return (
    <div style={{ width: '100%', margin: '0', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-20)' }}>
      {/* Top Banner Header (Apple Gallery White Flat Surface) */}
      <div style={{
        background: 'var(--color-gallery-white)',
        padding: 'var(--spacing-24) var(--spacing-28)',
        borderRadius: 'var(--radius-cards)',
        border: '1px solid var(--color-hairline-silver)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 'var(--spacing-16)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-16)' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'var(--color-ink)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '19px',
              fontWeight: '600',
              color: 'var(--color-gallery-white)',
              fontFamily: 'var(--font-sf-pro-display)'
            }}
          >
            {initialLetter}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '600', color: 'var(--color-ink)', margin: 0, letterSpacing: '-0.5px' }}>
                {firstName} {lastName}
              </h2>
              <span className="role-pill" style={{ background: 'var(--color-studio-mist)', color: 'var(--color-ink)', border: '1px solid var(--color-hairline-silver)', fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: 'var(--radius-buttons)' }}>
                STUDENT PORTAL
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-slate)', marginTop: '4px', margin: 0 }}>
              <Mail size={12} style={{ display: 'inline', marginRight: '5px' }} color="var(--color-steel)" />
              {email}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ background: 'var(--color-studio-mist)', padding: '8px 16px', borderRadius: '12px', border: '1px solid var(--color-control-gray)' }}>
            <div style={{ fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.04em' }}>ENROLLED CLASS</div>
            <div style={{ color: 'var(--color-pricing-blue)', fontWeight: '600', fontSize: '14px', marginTop: '2px' }}>
              {studentClass}
            </div>
          </div>

          <div style={{ background: 'var(--color-studio-mist)', padding: '8px 16px', borderRadius: '12px', border: '1px solid var(--color-control-gray)' }}>
            <div style={{ fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.04em' }}>ADMISSION STATUS</div>
            <div style={{ color: isConfirmed ? '#16a34a' : isRejected ? '#ef4444' : 'var(--color-launch-orange)', fontWeight: '600', fontSize: '14px', marginTop: '2px' }}>
              {status}
            </div>
          </div>

          {onLogout && (
            <button className="btn-apple-outline" onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '12px' }}>
              <LogOut size={13} /> Sign Out
            </button>
          )}
        </div>
      </div>

      {/* Top Level Navigation Tabs: Separate Admission, Enquiry & Modules */}
      <div className="portal-tabs-nav">
        <button
          className={`portal-tab-btn ${activeTab === 'admission' ? 'active-admission active' : ''}`}
          onClick={() => setActiveTab('admission')}
        >
          <FileText size={15} />
          <span>Admission Form</span>
        </button>

        <button
          className={`portal-tab-btn ${activeTab === 'enquiry' ? 'active-enquiry active' : ''}`}
          onClick={() => setActiveTab('enquiry')}
        >
          <HelpCircle size={15} />
          <span>Student Enquiry</span>
        </button>

        <button
          className={`portal-tab-btn ${activeTab === 'session' ? 'active-session active' : ''}`}
          onClick={() => setActiveTab('session')}
        >
          <LayoutDashboard size={15} />
          <span>Student Modules</span>
        </button>
      </div>

      {/* ADMISSION FORM TAB */}
      {activeTab === 'admission' && (
        <div className="apple-card" style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--color-control-gray)', marginBottom: '20px' }}>
            <div className="card-header-icon" style={{ margin: 0, background: '#faf5ff', borderColor: '#f3e8ff', color: '#9333ea' }}>
              <FileText size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '19px', fontWeight: 600, color: 'var(--color-ink)' }}>
                Student Admission Form
              </h3>
              <p style={{ color: 'var(--color-slate)', fontSize: '14px', marginTop: '2px' }}>
                Online institutional enrollment application and admission verification.
              </p>
            </div>
          </div>
          <AdmissionModule user={user} />
        </div>
      )}

      {/* ENQUIRY TAB */}
      {activeTab === 'enquiry' && (
        <div className="apple-card" style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--color-control-gray)', marginBottom: '20px' }}>
            <div className="card-header-icon" style={{ margin: 0, background: '#f0fdf4', borderColor: '#bbf7d0', color: '#16a34a' }}>
              <HelpCircle size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '19px', fontWeight: 600, color: 'var(--color-ink)' }}>
                Student Helpdesk & Queries
              </h3>
              <p style={{ color: 'var(--color-slate)', fontSize: '14px', marginTop: '2px' }}>
                Campus queries, academic support, and administrative ticket tracking.
              </p>
            </div>
          </div>
          <EnquiryModule user={user} />
        </div>
      )}

      {/* STUDENT MODULES SECTION (Staff Portal Module Layout) */}
      {activeTab === 'session' && (
        <>
          {/* REJECTED STATE FOR ACADEMIC MODULES */}
          {isRejected && (
            <div className="apple-card" style={{ textAlign: 'center', padding: '48px 24px', backgroundColor: 'var(--color-error-bg)', borderColor: 'var(--color-error-border)' }}>
              <div className="card-header-icon" style={{ backgroundColor: '#ffffff', borderColor: 'var(--color-error-border)' }}>
                <Ban size={24} color="var(--color-error)" />
              </div>
              <h3 style={{ color: 'var(--color-ink)', fontSize: '20px', fontWeight: 600, margin: '12px 0 6px' }}>
                Admission Decision: Application Rejected
              </h3>
              <p style={{ color: 'var(--color-slate)', fontSize: '14px', maxWidth: '520px', margin: '0 auto' }}>
                Your admission application was rejected by the administration. Access to student schedule modules remains inactive.
              </p>
            </div>
          )}

          {/* PENDING STATE FOR ACADEMIC MODULES */}
          {isPending && (
            <div className="apple-card" style={{ textAlign: 'center', padding: '48px 24px', backgroundColor: 'var(--color-studio-mist)' }}>
              <div className="card-header-icon">
                <Clock size={24} color="var(--color-slate)" />
              </div>
              <h3 style={{ color: 'var(--color-ink)', fontSize: '20px', fontWeight: 600, margin: '12px 0 6px' }}>
                Admission Verification Pending
              </h3>
              <p style={{ color: 'var(--color-slate)', fontSize: '14px', maxWidth: '560px', margin: '0 auto' }}>
                Your admission application is currently under review by the admissions office. Full portal timetable tools will activate automatically once confirmed.
              </p>
            </div>
          )}

          {/* CONFIRMED ACADEMIC MODULES */}
          {isConfirmed && (
            <div className="staff-portal-layout">
              {/* Left Module Sidebar Navigation */}
              <div className="staff-sidebar-nav">
                <div className="staff-sidebar-header">
                  <div className="staff-sidebar-title">
                    <Layers size={15} color="var(--color-pricing-blue)" />
                    <span>Student Modules</span>
                  </div>
                  <span className="badge-unique" style={{ fontSize: '11px', padding: '2px 8px' }}>
                    {modulesList.length} Modules
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {modulesList.map((mod) => {
                    const isActive = selectedModule === mod.id;
                    return (
                      <button
                        key={mod.id}
                        onClick={() => setSelectedModule(mod.id)}
                        className={`staff-module-btn ${isActive ? 'active' : ''}`}
                      >
                        <div className="staff-module-left">
                          <div
                            className="staff-module-icon-box"
                            style={{
                              background: isActive ? mod.theme.bg : 'var(--color-studio-mist)',
                              color: isActive ? mod.theme.color : 'var(--color-slate)',
                              borderColor: isActive ? mod.theme.border : 'var(--color-control-gray)'
                            }}
                          >
                            {mod.icon}
                          </div>
                          <div className="staff-module-text">
                            <span className="staff-module-name">{mod.title}</span>
                            <span className="staff-module-tag">{mod.tag}</span>
                          </div>
                        </div>
                        <ChevronRight size={14} className="staff-module-arrow" />
                      </button>
                    );
                  })}
                </div>

                {/* Sidebar Status Footer Widget */}
                <div className="staff-sidebar-footer">
                  <div className="staff-sidebar-status-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-success)', display: 'inline-block', boxShadow: '0 0 0 2px rgba(22, 163, 74, 0.2)' }}></span>
                      <span style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--color-ink)' }}>Student Session</span>
                    </div>
                    <span style={{ fontSize: '10.5px', color: 'var(--color-slate)', fontWeight: '500' }}>ERP v2.4</span>
                  </div>
                </div>
              </div>

              {/* Right Content Workspace */}
              <div style={{ minWidth: 0, width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-16)' }}>
                {modulesList.map((mod) => {
                  if (selectedModule !== mod.id) return null;
                  return (
                    <div key={mod.id} className="apple-card">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--color-control-gray)', marginBottom: '20px' }}>
                        <div className="card-header-icon" style={{ margin: 0, background: mod.theme.bg, borderColor: mod.theme.border, color: mod.theme.color }}>
                          {mod.icon}
                        </div>
                        <div>
                          <h3 style={{ fontSize: '19px', fontWeight: 600, color: 'var(--color-ink)' }}>
                            {mod.title} – {mod.subtitle}
                          </h3>
                          <p style={{ color: 'var(--color-slate)', fontSize: '14px', marginTop: '2px' }}>
                            {mod.desc}
                          </p>
                        </div>
                      </div>

                      {mod.id === 'module1' ? (
                        <div>
                          {/* Date Bar */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => {
                                  const d = new Date(selectedDate + 'T00:00:00');
                                  d.setDate(d.getDate() - 1);
                                  setSelectedDate(d.toISOString().split('T')[0]);
                                }}
                                className="btn-outlined-explore"
                              >
                                &larr; Prev Day
                              </button>
                              <button
                                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                                className="btn-pricing-blue"
                              >
                                Today
                              </button>
                              <button
                                onClick={() => {
                                  const d = new Date(selectedDate + 'T00:00:00');
                                  d.setDate(d.getDate() + 1);
                                  setSelectedDate(d.toISOString().split('T')[0]);
                                }}
                                className="btn-outlined-explore"
                              >
                                Next Day &rarr;
                              </button>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ color: 'var(--color-slate)', fontSize: '13px' }}>Schedule Date:</span>
                              <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="form-input"
                                style={{ padding: '4px 12px', height: '32px', width: 'auto' }}
                              />
                            </div>
                          </div>

                          {/* Dynamic Schedule Table */}
                          <div className="table-wrapper">
                            <table className="portal-table">
                              <thead>
                                <tr>
                                  <th>Period Timing</th>
                                  <th>Subject</th>
                                  <th>Faculty</th>
                                  <th>Classroom / Venue</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(() => {
                                  const PERIOD_TIMINGS = ['9-10 AM', '10-11 AM', '11-12 PM', '12-01 PM (Lunch)', '01-02 PM', '02-03 PM', '03-04 PM', '04-05 PM'];
                                  return PERIOD_TIMINGS.map((timing, idx) => {
                                    if (idx === 3) {
                                      return (
                                        <tr key={idx} style={{ backgroundColor: 'var(--color-studio-mist)' }}>
                                          <td style={{ fontWeight: 600, color: 'var(--color-slate)' }}>{timing}</td>
                                          <td style={{ color: 'var(--color-launch-orange)', fontWeight: 600, fontStyle: 'italic' }}>Lunch Break & Recess</td>
                                          <td style={{ color: 'var(--color-steel)' }}>—</td>
                                          <td><span className="role-pill parent">Cafeteria</span></td>
                                        </tr>
                                      );
                                    }

                                    const cell = academicsSchedule.find(s => s.periodIndex === idx);
                                    const hasAssignment = cell && ((cell.teacherName && cell.teacherName.trim() !== '') || (cell.subjectName && cell.subjectName.trim() !== ''));
                                    const sub = hasAssignment ? cell.subjectName : 'Study Period';
                                    const teacher = hasAssignment ? cell.teacherName : 'Unassigned';
                                    const room = hasAssignment && cell.roomNo ? cell.roomNo : 'Library / Study Hall';

                                    return (
                                      <tr key={idx}>
                                        <td style={{ fontWeight: 600 }}>{timing}</td>
                                        <td>{sub}</td>
                                        <td style={{ color: hasAssignment ? 'var(--color-apple-blue)' : 'var(--color-slate)' }}>{teacher}</td>
                                        <td><span className="badge-unique">{room}</span></td>
                                      </tr>
                                    );
                                  });
                                })()}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : mod.id === 'module2' ? (
                        /* MODULE 2: ATTENDANCE HISTORY & SUBJECT BREAKDOWN */
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-24)' }}>
                          
                          {/* Top Controls Bar: Live Sync & Refresh */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', background: 'var(--color-studio-mist)', padding: '12px 18px', borderRadius: '16px', border: '1px solid var(--color-hairline-silver)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ display: 'inline-block', width: '9px', height: '9px', borderRadius: '50%', background: '#16a34a', boxShadow: '0 0 0 3px rgba(22, 163, 74, 0.2)' }} />
                              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-ink)' }}>
                                Live Synchronized with Institution Attendance Database
                              </span>
                              <span style={{ fontSize: '12px', color: 'var(--color-slate)' }}>
                                • Student ID: <strong>{profileData?.studentId || 'ADM-24992'}</strong>
                              </span>
                            </div>

                            <button
                              onClick={() => {
                                fetchStudentAttendance();
                                fetchAttendanceDailySchedule(attendanceDateFilter);
                              }}
                              className="btn-apple-outline"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', fontSize: '12px' }}
                              disabled={attendanceLoading}
                            >
                              <RefreshCw size={13} className={attendanceLoading ? 'spin' : ''} />
                              <span>{attendanceLoading ? 'Refreshing...' : 'Live Sync'}</span>
                            </button>
                          </div>

                          {/* Overall KPI Attendance Metrics */}
                          {(() => {
                            const total = attendanceRecords.length;
                            const presentCount = attendanceRecords.filter(r => r.status === 'PRESENT').length;
                            const absentCount = attendanceRecords.filter(r => r.status === 'ABSENT').length;
                            const pct = total > 0 ? ((presentCount / total) * 100).toFixed(1) : '100.0';
                            const isEligible = parseFloat(pct) >= 75.0;

                            return (
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                                {/* Metric 1: Overall Percentage */}
                                <div style={{ background: 'var(--color-gallery-white)', border: '1px solid var(--color-hairline-silver)', borderRadius: '16px', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-slate)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Attendance Rate</span>
                                    <TrendingUp size={16} color={isEligible ? '#16a34a' : '#ef4444'} />
                                  </div>
                                  <div style={{ fontSize: '28px', fontWeight: '700', color: isEligible ? '#16a34a' : '#ef4444', lineHeight: 1.1 }}>
                                    {pct}%
                                  </div>
                                  <div style={{ width: '100%', height: '6px', background: 'var(--color-studio-mist)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ width: `${Math.min(100, Math.max(0, parseFloat(pct)))}%`, height: '100%', background: isEligible ? '#16a34a' : '#ef4444', transition: 'width 0.4s ease' }} />
                                  </div>
                                  <span style={{ fontSize: '11.5px', color: isEligible ? '#16a34a' : '#ef4444', fontWeight: '600' }}>
                                    {isEligible ? '✓ Eligible for Examinations' : '⚠ Below 75% Criteria'}
                                  </span>
                                </div>

                                {/* Metric 2: Classes Present */}
                                <div style={{ background: 'var(--color-gallery-white)', border: '1px solid var(--color-hairline-silver)', borderRadius: '16px', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-slate)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Classes Present</span>
                                    <CheckCircle size={16} color="#16a34a" />
                                  </div>
                                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#16a34a', lineHeight: 1.1 }}>
                                    {presentCount}
                                  </div>
                                  <span style={{ fontSize: '12px', color: 'var(--color-slate)' }}>
                                    Verified attended periods
                                  </span>
                                  <span style={{ alignSelf: 'flex-start', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600' }}>
                                    Present
                                  </span>
                                </div>

                                {/* Metric 3: Classes Absent */}
                                <div style={{ background: 'var(--color-gallery-white)', border: '1px solid var(--color-hairline-silver)', borderRadius: '16px', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-slate)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Classes Absent</span>
                                    <XCircle size={16} color="#ef4444" />
                                  </div>
                                  <div style={{ fontSize: '28px', fontWeight: '700', color: absentCount > 0 ? '#ef4444' : 'var(--color-ink)', lineHeight: 1.1 }}>
                                    {absentCount}
                                  </div>
                                  <span style={{ fontSize: '12px', color: 'var(--color-slate)' }}>
                                    Missed or unexcused periods
                                  </span>
                                  <span style={{ alignSelf: 'flex-start', background: absentCount > 0 ? '#fef2f2' : 'var(--color-studio-mist)', color: absentCount > 0 ? '#ef4444' : 'var(--color-slate)', border: `1px solid ${absentCount > 0 ? '#fecaca' : 'var(--color-hairline-silver)'}`, padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600' }}>
                                    {absentCount > 0 ? 'Absent' : 'Clean Record'}
                                  </span>
                                </div>

                                {/* Metric 4: Total Logged Periods */}
                                <div style={{ background: 'var(--color-gallery-white)', border: '1px solid var(--color-hairline-silver)', borderRadius: '16px', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-slate)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Sessions</span>
                                    <Clock size={16} color="var(--color-pricing-blue)" />
                                  </div>
                                  <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--color-ink)', lineHeight: 1.1 }}>
                                    {total}
                                  </div>
                                  <span style={{ fontSize: '12px', color: 'var(--color-slate)' }}>
                                    Faculty verified entries
                                  </span>
                                  <span style={{ alignSelf: 'flex-start', background: 'rgba(0, 113, 227, 0.08)', color: 'var(--color-pricing-blue)', border: '1px solid rgba(0, 113, 227, 0.2)', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600' }}>
                                    Database Verified
                                  </span>
                                </div>
                              </div>
                            );
                          })()}

                          {/* SECTION 1: DAILY PERIOD-BY-PERIOD ATTENDANCE ROSTER */}
                          <div style={{ background: 'var(--color-gallery-white)', border: '1px solid var(--color-hairline-silver)', borderRadius: '18px', padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                              <div>
                                <h4 style={{ fontSize: '17px', fontWeight: '600', color: 'var(--color-ink)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <Calendar size={18} color="var(--color-pricing-blue)" />
                                  Daily Period Breakdown: {formatDisplayDate(attendanceDateFilter)}
                                </h4>
                                <p style={{ color: 'var(--color-slate)', fontSize: '13px', margin: '4px 0 0 0' }}>
                                  Shows real-time status when each period is completed and recorded by your teacher.
                                </p>
                              </div>

                              {/* Date Quick Controls */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <button
                                  onClick={() => {
                                    try {
                                      const parts = attendanceDateFilter.split('-');
                                      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                                      d.setDate(d.getDate() - 1);
                                      const yyyy = d.getFullYear();
                                      const mm = String(d.getMonth() + 1).padStart(2, '0');
                                      const dd = String(d.getDate()).padStart(2, '0');
                                      setAttendanceDateFilter(`${yyyy}-${mm}-${dd}`);
                                    } catch (e) {}
                                  }}
                                  className="btn-apple-outline"
                                  style={{ padding: '5px 10px', fontSize: '11.5px' }}
                                >
                                  ‹ Prev Day
                                </button>
                                <button
                                  onClick={() => {
                                    const d = new Date();
                                    const yyyy = d.getFullYear();
                                    const mm = String(d.getMonth() + 1).padStart(2, '0');
                                    const dd = String(d.getDate()).padStart(2, '0');
                                    setAttendanceDateFilter(`${yyyy}-${mm}-${dd}`);
                                  }}
                                  className="btn-apple-outline"
                                  style={{ padding: '5px 10px', fontSize: '11.5px', borderColor: 'var(--color-pricing-blue)', color: 'var(--color-pricing-blue)' }}
                                >
                                  Today
                                </button>
                                <button
                                  onClick={() => {
                                    try {
                                      const parts = attendanceDateFilter.split('-');
                                      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                                      d.setDate(d.getDate() + 1);
                                      const yyyy = d.getFullYear();
                                      const mm = String(d.getMonth() + 1).padStart(2, '0');
                                      const dd = String(d.getDate()).padStart(2, '0');
                                      setAttendanceDateFilter(`${yyyy}-${mm}-${dd}`);
                                    } catch (e) {}
                                  }}
                                  className="btn-apple-outline"
                                  style={{ padding: '5px 10px', fontSize: '11.5px' }}
                                >
                                  Next Day ›
                                </button>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-studio-mist)', padding: '4px 10px', borderRadius: 'var(--radius-inputs)', border: '1px solid var(--color-hairline-silver)' }}>
                                  <input
                                    type="date"
                                    value={attendanceDateFilter}
                                    onChange={(e) => setAttendanceDateFilter(e.target.value)}
                                    style={{
                                      background: 'transparent',
                                      color: 'var(--color-ink)',
                                      border: 'none',
                                      fontSize: '12px',
                                      fontWeight: '500',
                                      outline: 'none'
                                    }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Daily Period Roster Table */}
                            <div className="table-wrapper" style={{ border: '1px solid var(--color-hairline-silver)', borderRadius: '12px', overflow: 'hidden' }}>
                              <table className="portal-table" style={{ width: '100%' }}>
                                <thead>
                                  <tr>
                                    <th>Period & Timing</th>
                                    <th>Subject</th>
                                    <th>Assigned Faculty</th>
                                    <th>Classroom</th>
                                    <th style={{ textAlign: 'center' }}>Attendance Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {DAY_TIME_SLOTS.map((slot) => {
                                    if (slot.isLunch) {
                                      return (
                                        <tr key={slot.pIdx} style={{ backgroundColor: 'var(--color-studio-mist)' }}>
                                          <td style={{ fontWeight: 600, color: 'var(--color-slate)' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                              <Coffee size={14} color="var(--color-launch-orange)" />
                                              {slot.label} ({slot.slot})
                                            </span>
                                          </td>
                                          <td colSpan={3} style={{ color: 'var(--color-launch-orange)', fontWeight: 600, fontStyle: 'italic' }}>
                                            Recess & Student Lunch Break
                                          </td>
                                          <td style={{ textAlign: 'center' }}>
                                            <span style={{ background: 'var(--color-paper-frost)', color: 'var(--color-slate)', border: '1px solid var(--color-hairline-silver)', padding: '2px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: '500' }}>
                                              Break
                                            </span>
                                          </td>
                                        </tr>
                                      );
                                    }

                                    const matchRecord = attendanceRecords.find(r =>
                                      r.attendanceDate === attendanceDateFilter &&
                                      (r.periodIndex === slot.pIdx || (r.timing && r.timing.toLowerCase().includes(slot.short.toLowerCase().replace(/[^a-z0-9]/g, ''))))
                                    );

                                    const matchSched = attendanceDailySchedule.find(s => s.periodIndex === slot.pIdx);

                                    const subject = matchRecord?.subjectName || matchSched?.subjectName || 'Study Period';
                                    const teacher = matchRecord?.teacherName || matchSched?.teacherName || 'Unassigned';
                                    const room = matchSched?.roomNo || 'Main Classroom';
                                    const hasTeacher = teacher && teacher.trim() !== '' && teacher.toLowerCase() !== 'unassigned';

                                    return (
                                      <tr key={slot.pIdx} style={{ borderBottom: '1px solid var(--color-hairline-silver)' }}>
                                        <td style={{ fontWeight: 600, color: 'var(--color-ink)' }}>
                                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Clock size={14} color="var(--color-pricing-blue)" />
                                            {slot.label} ({slot.slot})
                                          </span>
                                        </td>
                                        <td style={{ fontWeight: '600', color: 'var(--color-ink)' }}>
                                          {subject}
                                        </td>
                                        <td style={{ color: hasTeacher ? 'var(--color-apple-blue)' : 'var(--color-slate)', fontWeight: hasTeacher ? '500' : '400' }}>
                                          {teacher}
                                        </td>
                                        <td>
                                          <span style={{ background: 'var(--color-studio-mist)', color: 'var(--color-slate)', border: '1px solid var(--color-hairline-silver)', padding: '2px 8px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '500' }}>
                                            {room}
                                          </span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                          {matchRecord ? (
                                            matchRecord.status === 'PRESENT' ? (
                                              <span style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                                <CheckCircle size={13} />
                                                PRESENT
                                              </span>
                                            ) : (
                                              <span style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                                <XCircle size={13} />
                                                ABSENT
                                              </span>
                                            )
                                          ) : (
                                            <span style={{ background: 'var(--color-studio-mist)', color: 'var(--color-slate)', border: '1px solid var(--color-hairline-silver)', padding: '4px 10px', borderRadius: '12px', fontSize: '11.5px', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                              <Clock size={12} />
                                              {hasTeacher ? 'Pending (Awaiting Log)' : 'No Faculty Assigned'}
                                            </span>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* SECTION 2: SUBJECT-WISE ATTENDANCE BREAKDOWN */}
                          <div style={{ background: 'var(--color-gallery-white)', border: '1px solid var(--color-hairline-silver)', borderRadius: '18px', padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                              <h4 style={{ fontSize: '17px', fontWeight: '600', color: 'var(--color-ink)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <BookOpen size={18} color="var(--color-pricing-blue)" />
                                Subject-Wise Attendance Breakdown
                              </h4>
                              <p style={{ color: 'var(--color-slate)', fontSize: '13px', margin: '4px 0 0 0' }}>
                                Verified attendance percentage by academic subject according to database logs.
                              </p>
                            </div>

                            {(() => {
                              // Group all records by subject name
                              const subjectMap = {};
                              attendanceRecords.forEach(r => {
                                const sub = (r.subjectName && r.subjectName.trim() !== '') ? r.subjectName.trim() : 'General Class';
                                if (!subjectMap[sub]) {
                                  subjectMap[sub] = {
                                    subject: sub,
                                    total: 0,
                                    present: 0,
                                    absent: 0,
                                    teacher: r.teacherName || ''
                                  };
                                }
                                subjectMap[sub].total += 1;
                                if (r.status === 'PRESENT') subjectMap[sub].present += 1;
                                if (r.status === 'ABSENT') subjectMap[sub].absent += 1;
                                if (!subjectMap[sub].teacher && r.teacherName) subjectMap[sub].teacher = r.teacherName;
                              });

                              const subjectList = Object.values(subjectMap);

                              if (subjectList.length === 0) {
                                return (
                                  <div style={{ textAlign: 'center', padding: '36px 20px', background: 'var(--color-studio-mist)', borderRadius: '14px', border: '1px solid var(--color-hairline-silver)' }}>
                                    <Clock size={28} color="var(--color-slate)" style={{ margin: '0 auto 8px auto' }} />
                                    <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--color-ink)' }}>
                                      No Subject Attendance Records Yet
                                    </div>
                                    <p style={{ fontSize: '13px', color: 'var(--color-slate)', maxWidth: '440px', margin: '6px auto 0 auto' }}>
                                      Once your teachers conduct classes and submit attendance rosters, your subject breakdown metrics will display here automatically.
                                    </p>
                                  </div>
                                );
                              }

                              return (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                                  {subjectList.map((item, idx) => {
                                    const subPct = item.total > 0 ? Math.round((item.present / item.total) * 100) : 100;
                                    const subEligible = subPct >= 75;

                                    return (
                                      <div
                                        key={idx}
                                        style={{
                                          background: 'var(--color-paper-frost)',
                                          border: '1px solid var(--color-hairline-silver)',
                                          borderRadius: '16px',
                                          padding: '16px 18px',
                                          display: 'flex',
                                          flexDirection: 'column',
                                          gap: '10px'
                                        }}
                                      >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                          <div>
                                            <div style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-ink)' }}>
                                              {item.subject}
                                            </div>
                                            {item.teacher && (
                                              <div style={{ fontSize: '12px', color: 'var(--color-slate)', marginTop: '2px' }}>
                                                Faculty: {item.teacher}
                                              </div>
                                            )}
                                          </div>
                                          <span
                                            style={{
                                              background: subEligible ? '#f0fdf4' : '#fef2f2',
                                              color: subEligible ? '#16a34a' : '#ef4444',
                                              border: `1px solid ${subEligible ? '#bbf7d0' : '#fecaca'}`,
                                              padding: '2px 8px',
                                              borderRadius: '8px',
                                              fontSize: '11px',
                                              fontWeight: '700'
                                            }}
                                          >
                                            {subEligible ? 'Eligible' : 'Warning'}
                                          </span>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                          <div style={{ fontSize: '22px', fontWeight: '700', color: subEligible ? '#16a34a' : '#ef4444' }}>
                                            {subPct}%
                                          </div>
                                          <div style={{ fontSize: '12px', color: 'var(--color-slate)' }}>
                                            <strong>{item.present}</strong> / {item.total} Attended
                                          </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div style={{ width: '100%', height: '6px', background: 'var(--color-control-gray)', borderRadius: '4px', overflow: 'hidden' }}>
                                          <div
                                            style={{
                                              width: `${Math.min(100, Math.max(0, subPct))}%`,
                                              height: '100%',
                                              background: subEligible ? '#16a34a' : '#ef4444',
                                              borderRadius: '4px',
                                              transition: 'width 0.4s ease'
                                            }}
                                          />
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--color-slate)' }}>
                                          <span>Present: <strong style={{ color: '#16a34a' }}>{item.present}</strong></span>
                                          <span>Absent: <strong style={{ color: '#ef4444' }}>{item.absent}</strong></span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })()}
                          </div>

                          {/* SECTION 3: COMPREHENSIVE HISTORICAL ATTENDANCE LOG */}
                          <div style={{ background: 'var(--color-gallery-white)', border: '1px solid var(--color-hairline-silver)', borderRadius: '18px', padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                              <div>
                                <h4 style={{ fontSize: '17px', fontWeight: '600', color: 'var(--color-ink)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <FileText size={18} color="var(--color-pricing-blue)" />
                                  Complete Attendance Log
                                </h4>
                                <p style={{ color: 'var(--color-slate)', fontSize: '13px', margin: '4px 0 0 0' }}>
                                  Full chronological historical logs stored in institution database.
                                </p>
                              </div>

                              {/* Search & Filter Bar */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                {/* Search input */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-studio-mist)', padding: '5px 10px', borderRadius: 'var(--radius-inputs)', border: '1px solid var(--color-hairline-silver)' }}>
                                  <Search size={13} color="var(--color-slate)" />
                                  <input
                                    type="text"
                                    placeholder="Search subject or teacher..."
                                    value={attendanceSearchQuery}
                                    onChange={(e) => setAttendanceSearchQuery(e.target.value)}
                                    style={{
                                      background: 'transparent',
                                      color: 'var(--color-ink)',
                                      border: 'none',
                                      fontSize: '12px',
                                      outline: 'none',
                                      width: '160px'
                                    }}
                                  />
                                </div>

                                {/* Subject dropdown filter */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-studio-mist)', padding: '5px 10px', borderRadius: 'var(--radius-inputs)', border: '1px solid var(--color-hairline-silver)' }}>
                                  <span style={{ fontSize: '12px', color: 'var(--color-slate)', fontWeight: '600' }}>Subject:</span>
                                  <select
                                    value={attendanceSubjectFilter}
                                    onChange={(e) => setAttendanceSubjectFilter(e.target.value)}
                                    style={{
                                      background: 'transparent',
                                      color: 'var(--color-ink)',
                                      border: 'none',
                                      fontSize: '12px',
                                      fontWeight: '600',
                                      outline: 'none',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <option value="ALL">All Subjects</option>
                                    {Array.from(new Set(attendanceRecords.map(r => r.subjectName).filter(Boolean))).map(s => (
                                      <option key={s} value={s}>{s}</option>
                                    ))}
                                  </select>
                                </div>

                                {/* Status dropdown filter */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-studio-mist)', padding: '5px 10px', borderRadius: 'var(--radius-inputs)', border: '1px solid var(--color-hairline-silver)' }}>
                                  <span style={{ fontSize: '12px', color: 'var(--color-slate)', fontWeight: '600' }}>Status:</span>
                                  <select
                                    value={attendanceStatusFilter}
                                    onChange={(e) => setAttendanceStatusFilter(e.target.value)}
                                    style={{
                                      background: 'transparent',
                                      color: 'var(--color-ink)',
                                      border: 'none',
                                      fontSize: '12px',
                                      fontWeight: '600',
                                      outline: 'none',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <option value="ALL">All Statuses</option>
                                    <option value="PRESENT">Present Only</option>
                                    <option value="ABSENT">Absent Only</option>
                                  </select>
                                </div>
                              </div>
                            </div>

                            {/* Filtered Records Table */}
                            {(() => {
                              const filtered = attendanceRecords.filter(r => {
                                if (attendanceSubjectFilter !== 'ALL' && r.subjectName !== attendanceSubjectFilter) {
                                  return false;
                                }
                                if (attendanceStatusFilter !== 'ALL' && r.status !== attendanceStatusFilter) {
                                  return false;
                                }
                                if (attendanceSearchQuery.trim() !== '') {
                                  const q = attendanceSearchQuery.toLowerCase();
                                  const sub = (r.subjectName || '').toLowerCase();
                                  const tea = (r.teacherName || '').toLowerCase();
                                  const dt = (r.attendanceDate || '').toLowerCase();
                                  if (!sub.includes(q) && !tea.includes(q) && !dt.includes(q)) {
                                    return false;
                                  }
                                }
                                return true;
                              });

                              if (filtered.length === 0) {
                                return (
                                  <div style={{ textAlign: 'center', padding: '36px 20px', background: 'var(--color-studio-mist)', borderRadius: '14px', border: '1px solid var(--color-hairline-silver)' }}>
                                    <div style={{ fontSize: '14.5px', fontWeight: '600', color: 'var(--color-ink)' }}>
                                      No Attendance Records Matching Current Filters
                                    </div>
                                    <p style={{ fontSize: '13px', color: 'var(--color-slate)', margin: '4px 0 0 0' }}>
                                      Try clearing the search query or changing the filter options above.
                                    </p>
                                  </div>
                                );
                              }

                              return (
                                <div className="table-wrapper" style={{ border: '1px solid var(--color-hairline-silver)', borderRadius: '12px', overflow: 'hidden' }}>
                                  <table className="portal-table" style={{ width: '100%' }}>
                                    <thead>
                                      <tr>
                                        <th>Date</th>
                                        <th>Period & Timing</th>
                                        <th>Subject</th>
                                        <th>Faculty / Teacher</th>
                                        <th>Class & Section</th>
                                        <th style={{ textAlign: 'center' }}>Status</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {filtered.map((rec) => {
                                        const pLabel = rec.periodIndex !== null && rec.periodIndex !== undefined
                                          ? `Period ${rec.periodIndex + 1}`
                                          : 'Period';
                                        const timing = rec.timing || '09:00 AM - 10:00 AM';

                                        return (
                                          <tr key={rec.id} style={{ borderBottom: '1px solid var(--color-hairline-silver)' }}>
                                            <td style={{ fontWeight: 600, color: 'var(--color-ink)' }}>
                                              {formatDisplayDate(rec.attendanceDate)}
                                            </td>
                                            <td style={{ color: 'var(--color-ink)' }}>
                                              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Clock size={13} color="var(--color-pricing-blue)" />
                                                <strong>{pLabel}</strong> ({timing})
                                              </span>
                                            </td>
                                            <td style={{ fontWeight: '600', color: 'var(--color-pricing-blue)' }}>
                                              {rec.subjectName || 'General Class'}
                                            </td>
                                            <td style={{ color: 'var(--color-slate)', fontWeight: '500' }}>
                                              {rec.teacherName || 'Faculty'}
                                            </td>
                                            <td>
                                              <span style={{ background: 'var(--color-studio-mist)', color: 'var(--color-ink)', border: '1px solid var(--color-hairline-silver)', padding: '2px 8px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '500' }}>
                                                Grade {rec.classStandard} - {rec.sectionName}
                                              </span>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                              {rec.status === 'PRESENT' ? (
                                                <span style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '3px 10px', borderRadius: '10px', fontSize: '11.5px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                                  <CheckCircle size={12} />
                                                  PRESENT
                                                </span>
                                              ) : (
                                                <span style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', padding: '3px 10px', borderRadius: '10px', fontSize: '11.5px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                                  <XCircle size={12} />
                                                  ABSENT
                                                </span>
                                              )}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '48px 24px', backgroundColor: 'var(--color-studio-mist)', borderRadius: '18px' }}>
                          <div className="card-header-icon">
                            {mod.icon}
                          </div>
                          <h4 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--color-ink)', marginTop: '8px' }}>
                            {mod.subtitle}
                          </h4>
                          <p style={{ color: 'var(--color-slate)', fontSize: '14px', maxWidth: '420px', margin: '4px auto 0' }}>
                            Academic module data is synchronized with the Spring Boot microservices backend.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
