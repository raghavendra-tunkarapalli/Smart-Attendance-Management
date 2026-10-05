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
  XCircle
} from 'lucide-react';
import AdmissionModule from './AdmissionModule';
import EnquiryModule from './EnquiryModule';

const GATEWAY_URL = 'http://localhost:8099/api/student-portal';
const DIRECT_URL = 'http://localhost:8090/api/student-portal';

export default function StudentPortalModule({ user, token, onLogout }) {
  const [activeTab, setActiveTab] = useState('session');
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

  const isConfirmed = status === 'CONFIRMED' || status === 'ACCEPTED';
  const isRejected = status === 'REJECTED';
  const isPending = !isConfirmed && !isRejected;

  const initialLetter = firstName ? firstName[0].toUpperCase() : 'A';

  const modulesList = [
    {
      id: 'module1',
      title: 'Schedule & Timetable',
      subtitle: 'Daily Class Schedule',
      desc: 'Real-time subject periods, designated instructors, and room allocations.',
      icon: <Calendar size={18} color="var(--color-pricing-blue)" />
    },
    {
      id: 'module2',
      title: 'Attendance History',
      subtitle: 'Attendance & Timetable',
      desc: 'Daily attendance check-ins, monthly metrics, and semester percentage.',
      icon: <Clock size={18} color="var(--color-apple-blue)" />
    },
    {
      id: 'module3',
      title: 'Examinations',
      subtitle: 'Examinations & Grades',
      desc: 'Exam dates, term report cards, and performance grade sheets.',
      icon: <Award size={18} color="var(--color-pricing-blue)" />
    },
    {
      id: 'module4',
      title: 'Digital Library',
      subtitle: 'Library & Learning Resources',
      desc: 'Online textbooks, curriculum guides, and assigned coursework materials.',
      icon: <BookMarked size={18} color="var(--color-slate)" />
    },
    {
      id: 'module5',
      title: 'Financial & Fees',
      subtitle: 'Tuition & Fee Records',
      desc: 'Term fee receipts, payment status, and institutional billing history.',
      icon: <CreditCard size={18} color="var(--color-slate)" />
    }
  ];

  return (
    <div className="dashboard-card">
      {/* Header */}
      <div className="dashboard-header">
        <div className="user-welcome-info">
          <div className="avatar-badge">
            {initialLetter}
          </div>
          <div>
            <h2 className="welcome-title">
              Student Portal: {firstName} {lastName}
            </h2>
            <p className="user-email-text">
              {email} • {studentClass}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span className="role-pill student">
            <Shield size={12} />
            STUDENT
          </span>
          {onLogout && (
            <button className="btn-outlined-explore" onClick={onLogout}>
              <LogOut size={13} />
              Sign Out
            </button>
          )}
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="portal-tabs-nav">
        <button
          className={`portal-tab-btn ${activeTab === 'admission' ? 'active-admission' : ''}`}
          onClick={() => setActiveTab('admission')}
        >
          <FileText size={15} />
          <span>Admission Form</span>
        </button>

        <button
          className={`portal-tab-btn ${activeTab === 'enquiry' ? 'active-enquiry' : ''}`}
          onClick={() => setActiveTab('enquiry')}
        >
          <HelpCircle size={15} />
          <span>Student Enquiry</span>
        </button>

        <button
          className={`portal-tab-btn ${!['admission', 'enquiry'].includes(activeTab) ? 'active' : ''}`}
          onClick={() => setActiveTab('session')}
        >
          <LayoutDashboard size={15} />
          <span>Student Dashboard</span>
        </button>
      </div>

      {activeTab === 'admission' && <AdmissionModule user={user} />}
      {activeTab === 'enquiry' && <EnquiryModule user={user} />}

      {/* STUDENT PORTAL MAIN SECTION */}
      {!['admission', 'enquiry'].includes(activeTab) && (
        <>
          {/* PROFILE SUMMARY */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--color-ink)' }}>
                Academic Profile & Credentials
              </h3>

              <span className={isConfirmed ? 'role-pill student' : isRejected ? 'role-pill admin' : 'role-pill parent'}>
                {isConfirmed && <CheckCircle size={12} />}
                {isPending && <Clock size={12} />}
                {isRejected && <XCircle size={12} />}
                STATUS: {status}
              </span>
            </div>

            <div className="claims-grid">
              <div className="claim-card">
                <div className="claim-label"><IdCard size={12} /> User ID</div>
                <div className="claim-value">Stu_{userId}</div>
              </div>

              <div className="claim-card">
                <div className="claim-label"><Shield size={12} /> Role</div>
                <div className="claim-value" style={{ color: 'var(--color-apple-blue)' }}>STUDENT</div>
              </div>

              <div className="claim-card">
                <div className="claim-label"><User size={12} /> Username</div>
                <div className="claim-value">{username}</div>
              </div>

              <div className="claim-card">
                <div className="claim-label"><Mail size={12} /> Email Address</div>
                <div className="claim-value" style={{ fontSize: '14px' }}>{email}</div>
              </div>

              <div className="claim-card">
                <div className="claim-label">Full Name</div>
                <div className="claim-value">{fullName}</div>
              </div>

              <div className="claim-card">
                <div className="claim-label">Enrolled Class</div>
                <div className="claim-value" style={{ color: 'var(--color-pricing-blue)' }}>{studentClass}</div>
              </div>
            </div>
          </div>

          {/* REJECTED STATE */}
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

          {/* PENDING STATE */}
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

          {/* CONFIRMED STATE */}
          {isConfirmed && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
              {/* Left Sidebar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-slate)', textTransform: 'uppercase', letterSpacing: '-0.12px', marginBottom: '4px' }}>
                  Student Modules
                </div>

                {modulesList.map((mod) => {
                  const isActive = (activeTab === 'session' ? 'module1' : activeTab) === mod.id;
                  return (
                    <button
                      key={mod.id}
                      onClick={() => setActiveTab(mod.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        borderRadius: '16px',
                        backgroundColor: isActive ? 'var(--color-gallery-white)' : 'transparent',
                        border: isActive ? '1px solid var(--color-hairline-silver)' : '1px solid transparent',
                        color: 'var(--color-ink)',
                        fontWeight: isActive ? 600 : 400,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {mod.icon}
                        <span style={{ fontSize: '14px' }}>{mod.title}</span>
                      </div>
                      <ChevronRight size={14} color={isActive ? 'var(--color-ink)' : 'var(--color-steel)'} />
                    </button>
                  );
                })}
              </div>

              {/* Right Content */}
              <div style={{ gridColumn: 'span 2' }}>
                {modulesList.map((mod) => {
                  const effectiveTab = activeTab === 'session' ? 'module1' : activeTab;
                  if (effectiveTab !== mod.id) return null;
                  return (
                    <div key={mod.id} className="apple-card">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--color-control-gray)', marginBottom: '20px' }}>
                        <div className="card-header-icon" style={{ margin: 0 }}>
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
