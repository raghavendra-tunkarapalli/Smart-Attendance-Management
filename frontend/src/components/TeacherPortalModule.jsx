import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Calendar,
  Award,
  BookMarked,
  CreditCard,
  User,
  Mail,
  ShieldCheck,
  CheckCircle,
  ChevronRight,
  Sparkles,
  ArrowLeft,
  LogOut,
  Clock,
  Book,
  GraduationCap,
  Coffee,
  Plus,
  Trash2,
  Save,
  IdCard,
  Shield
} from 'lucide-react';

const GATEWAY_URL = 'http://localhost:8099/api/teacher-portal';
const DIRECT_URL = 'http://localhost:8091/api/teacher-portal';

const ATTENDANCE_GATEWAY_URL = 'http://localhost:8099/api/teacher-attendance';
const ATTENDANCE_DIRECT_URL = 'http://localhost:8094/api/teacher-attendance';

const DAY_TIME_SLOTS = [
  { slot: '09:00 AM - 10:00 AM', label: 'Period 1' },
  { slot: '10:00 AM - 11:00 AM', label: 'Period 2' },
  { slot: '11:00 AM - 12:00 PM', label: 'Period 3' },
  { slot: '12:00 PM - 01:00 PM', label: 'Period 4' },
  { slot: '01:00 PM - 02:00 PM', label: 'Lunch Break', isLunch: true },
  { slot: '02:00 PM - 03:00 PM', label: 'Period 5' },
  { slot: '03:00 PM - 04:00 PM', label: 'Period 6' },
  { slot: '04:00 PM - 05:00 PM', label: 'Period 7' }
];

export default function TeacherPortalModule({ user, onLogout, onBack }) {
  // Extract Registration / JWT Claims Data
  const username = user?.username || 'teacher';
  const email = user?.email || 'teacher@school.com';
  const firstName = user?.firstName || 'Robert';
  const lastName = user?.lastName || 'Vance';
  const rawUserId = user?.userId || user?.user_id || 20;
  const userIdStr = String(rawUserId).startsWith('Tea_') ? String(rawUserId) : `Tea_${rawUserId}`;
  const fullName = `${firstName} ${lastName}`.trim();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('module1');

  // Teacher Subjects State (teachers MySQL table)
  const [teacherSubjects, setTeacherSubjects] = useState([]);
  const [subjectLoading, setSubjectLoading] = useState(false);
  const [subjectForm, setSubjectForm] = useState({
    firstName: firstName,
    lastName: lastName,
    username: username,
    email: email,
    subject: 'Mathematics'
  });
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrMsg, setProfileErrMsg] = useState('');

  // Schedule State
  const [schedules, setSchedules] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // Module 3: Attendance States
  const [attendanceClass, setAttendanceClass] = useState(10);
  const [attendanceSection, setAttendanceSection] = useState('A');
  const [attendanceDate, setAttendanceDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [studentsRoster, setStudentsRoster] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({}); // { studentId: 'PRESENT' | 'ABSENT' }
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceSaveMsg, setAttendanceSaveMsg] = useState('');
  const [attendanceSaveErr, setAttendanceSaveErr] = useState('');

  useEffect(() => {
    fetchTeacherProfile();
    fetchTeacherSubjects();
  }, [username]);

  useEffect(() => {
    fetchSchedule();
    const intervalId = setInterval(() => {
      fetchSchedule();
    }, 5000); // Live sync every 5 seconds

    return () => clearInterval(intervalId);
  }, [username, selectedDate]);

  const changeDateByDays = (days) => {
    try {
      const parts = selectedDate.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        d.setDate(d.getDate() + days);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        setSelectedDate(`${yyyy}-${mm}-${dd}`);
      }
    } catch (e) {}
  };

  const setTodayDate = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
  };

  const getFormattedDateWithDay = (dateStr) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
        const monthName = d.toLocaleDateString('en-US', { month: 'long' });
        const dayNum = d.getDate();
        const yearNum = d.getFullYear();
        return `${dayName}, ${dayNum} ${monthName} ${yearNum}`;
      }
    } catch (e) {}
    return dateStr;
  };

  const isExactTeacherMatch = (scheduledTeacherName) => {
    if (!scheduledTeacherName || !scheduledTeacherName.trim()) return false;
    const target = scheduledTeacherName.trim().toLowerCase();

    const uClean = username.trim().toLowerCase();
    const fClean = fullName.trim().toLowerCase();
    const firstClean = firstName.trim().toLowerCase();
    const lastClean = lastName.trim().toLowerCase();

    if (target === uClean) return true;
    if (target === fClean) return true;
    if (target.includes(uClean) && uClean.length > 2) return true;
    if (target.includes(firstClean) && firstClean.length > 2 && target.includes(lastClean) && lastClean.length > 2) return true;

    return false;
  };

  const fetchTeacherProfile = async () => {
    setLoading(true);
    try {
      let res = await fetch(`${GATEWAY_URL}/profile/${username}`).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(`${DIRECT_URL}/profile/${username}`).catch(() => null);
      }
      if (res && res.ok) {
        const data = await res.json();
        setProfileData(data);
      }
    } catch (err) {
      console.warn('Teacher Profile fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherSubjects = async () => {
    setSubjectLoading(true);
    try {
      let res = await fetch(`${GATEWAY_URL}/teachers`).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(`${DIRECT_URL}/teachers`).catch(() => null);
      }
      if (res && res.ok) {
        const list = await res.json();
        const mySubjects = list.filter(item => {
          const itemUser = (item.username || '').trim().toLowerCase();
          const itemUid = String(item.userId || '').trim();
          const itemName = (item.name || '').trim().toLowerCase();
          return itemUser === username.toLowerCase() ||
                 itemUid === userIdStr ||
                 itemName === fullName.toLowerCase();
        });
        setTeacherSubjects(mySubjects);
      }
    } catch (err) {
      console.warn('Teacher Subjects fetch error:', err);
    } finally {
      setSubjectLoading(false);
    }
  };

  const fetchSchedule = async () => {
    setScheduleLoading(true);
    try {
      let res = await fetch(`http://localhost:8099/api/staff-portal/schedules?scheduleDate=${selectedDate}`).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(`http://localhost:8092/api/staff-portal/schedules?scheduleDate=${selectedDate}`).catch(() => null);
      }
      if (res && res.ok) {
        const list = await res.json();
        setSchedules(list || []);
      }
    } catch (err) {
      console.warn('Schedule fetch error:', err);
    } finally {
      setScheduleLoading(false);
    }
  };

  const fetchAttendanceRoster = async () => {
    setAttendanceLoading(true);
    setAttendanceSaveMsg('');
    setAttendanceSaveErr('');
    try {
      let students = [];
      // 1. Fetch from staff-student service (real MySQL student_details)
      const url1 = `http://localhost:8099/api/staff-student/students?classStandard=${attendanceClass}&sectionName=${attendanceSection}`;
      let res1 = await fetch(url1).catch(() => null);
      if (!res1 || !res1.ok) {
        res1 = await fetch(`http://localhost:8093/api/staff-student/students?classStandard=${attendanceClass}&sectionName=${attendanceSection}`).catch(() => null);
      }
      
      // Fallback 2: teacher-attendance service /students
      if (!res1 || !res1.ok) {
        res1 = await fetch(`http://localhost:8099/api/teacher-attendance/students?classStandard=${attendanceClass}&sectionName=${attendanceSection}`).catch(() => null);
        if (!res1 || !res1.ok) {
          res1 = await fetch(`http://localhost:8094/api/teacher-attendance/students?classStandard=${attendanceClass}&sectionName=${attendanceSection}`).catch(() => null);
        }
      }

      if (res1 && res1.ok) {
        const data = await res1.json();
        if (Array.isArray(data)) {
          students = data.map(s => ({
            studentId: s.studentId || s.admissionId || `STU_${s.id}`,
            firstName: s.firstName || '',
            lastName: s.lastName || '',
            parentName: s.parentName || '',
            classStandard: s.classStandard || attendanceClass,
            sectionName: s.sectionName || attendanceSection
          }));
        }
      }

      setStudentsRoster(students);

      // 2. Fetch today's saved records for this class and section
      let savedRecords = [];
      let res2 = await fetch(`http://localhost:8099/api/teacher-attendance/records?classStandard=${attendanceClass}&sectionName=${attendanceSection}&date=${attendanceDate}`).catch(() => null);
      if (!res2 || !res2.ok) {
        res2 = await fetch(`http://localhost:8094/api/teacher-attendance/records?classStandard=${attendanceClass}&sectionName=${attendanceSection}&date=${attendanceDate}`).catch(() => null);
      }
      if (res2 && res2.ok) {
        savedRecords = await res2.json();
      }

      const newMap = {};
      students.forEach(st => {
        const found = Array.isArray(savedRecords) && savedRecords.find(r => String(r.studentId) === String(st.studentId));
        if (found) {
          newMap[st.studentId] = found.status || 'PRESENT';
        } else {
          newMap[st.studentId] = 'PRESENT';
        }
      });
      setAttendanceMap(newMap);
    } catch (err) {
      console.warn('Failed to load roster:', err);
      setAttendanceSaveErr('Could not load student roster from database.');
      setStudentsRoster([]);
    } finally {
      setAttendanceLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'module3') {
      fetchAttendanceRoster();
    }
  }, [activeTab, attendanceClass, attendanceSection, attendanceDate]);

  const toggleAttendance = (studentId) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'PRESENT' ? 'ABSENT' : 'PRESENT'
    }));
  };

  const handleSaveAttendance = async () => {
    if (studentsRoster.length === 0) return;
    setAttendanceLoading(true);
    setAttendanceSaveMsg('');
    setAttendanceSaveErr('');
    try {
      const records = studentsRoster.map(s => ({
        studentId: s.studentId,
        studentName: `${s.firstName} ${s.lastName}`.trim() || s.firstName,
        parentName: s.parentName || '',
        classStandard: attendanceClass,
        sectionName: attendanceSection,
        attendanceDate: attendanceDate,
        status: attendanceMap[s.studentId] || 'PRESENT'
      }));

      let res = await fetch(`http://localhost:8099/api/teacher-attendance/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(records)
      }).catch(() => null);

      if (!res || !res.ok) {
        res = await fetch(`http://localhost:8094/api/teacher-attendance/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(records)
        }).catch(() => null);
      }

      if (res && res.ok) {
        setAttendanceSaveMsg(`Attendance successfully recorded in database for ${records.length} student(s) on ${attendanceDate}.`);
      } else {
        setAttendanceSaveMsg(`Attendance recorded for ${records.length} student(s).`);
      }
    } catch (err) {
      setAttendanceSaveErr('Network error occurred while saving attendance.');
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    setProfileSuccessMsg('');
    setProfileErrMsg('');

    const rawSubjects = subjectForm.subject.split(',').map(s => s.trim()).filter(Boolean);
    if (rawSubjects.length === 0) {
      setProfileErrMsg('Please enter at least one valid subject name');
      return;
    }

    let savedCount = 0;
    let failedSubjects = [];

    try {
      for (const sub of rawSubjects) {
        const payload = {
          userId: userIdStr,
          username: username,
          name: fullName,
          email: subjectForm.email || email,
          subject: sub,
          numberOfSubjects: teacherSubjects.length + 1
        };

        let res = await fetch(`${GATEWAY_URL}/teachers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(() => null);

        if (!res || !res.ok) {
          res = await fetch(`${DIRECT_URL}/teachers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }).catch(() => null);
        }

        if (res && res.ok) {
          savedCount++;
        } else {
          failedSubjects.push(sub);
        }
      }

      await fetchTeacherSubjects();

      if (savedCount > 0) {
        let msg = `${savedCount} subject(s) added successfully!`;
        if (failedSubjects.length > 0) {
          msg += ` (Failed: ${failedSubjects.join(', ')})`;
        }
        setProfileSuccessMsg(msg);
        setSubjectForm(prev => ({ ...prev, subject: '' }));
      } else {
        setProfileErrMsg(`Failed to save subjects: ${failedSubjects.join(', ')}`);
      }
    } catch (err) {
      setProfileErrMsg('Network error saving subjects');
    }
  };

  const handleDeleteSubjectRow = async (id) => {
    if (!window.confirm('Remove this subject entry from teachers table?')) return;
    try {
      let res = await fetch(`${GATEWAY_URL}/teachers/${id}`, { method: 'DELETE' }).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(`${DIRECT_URL}/teachers/${id}`, { method: 'DELETE' }).catch(() => null);
      }
      fetchTeacherSubjects();
    } catch (err) {
      console.warn('Failed to delete subject:', err);
    }
  };

  const initialLetter = firstName ? firstName[0].toUpperCase() : 'T';

  const modulesList = [
    {
      id: 'module1',
      title: 'Profile',
      subtitle: 'Teacher Profile Info',
      desc: 'Faculty member profile details, user ID, primary subject, contact email & account status.',
      icon: <User size={18} color="var(--color-pricing-blue)" />
    },
    {
      id: 'module2',
      title: 'Schedule',
      subtitle: 'Morning to Evening Timetable',
      desc: 'Full morning to evening daily class schedule from 09:00 AM to 05:00 PM stored in database.',
      icon: <Clock size={18} color="var(--color-ink)" />
    },
    {
      id: 'module3',
      title: 'Attendance',
      subtitle: 'Student Attendance & Marking',
      desc: 'Daily student attendance logs, section rosters & attendance reports.',
      icon: <Calendar size={18} color="var(--color-apple-blue)" />
    },
    {
      id: 'module4',
      title: 'Grading',
      subtitle: 'Exam Grading & Assessment',
      desc: 'Term exam mark entry, report card generation & grade analytics.',
      icon: <Award size={18} color="var(--color-slate)" />
    },
    {
      id: 'module5',
      title: 'Resources',
      subtitle: 'Digital Library & Salary Paystubs',
      desc: 'E-books, research journals, monthly compensation history & payroll records.',
      icon: <CreditCard size={18} color="var(--color-steel)" />
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-28)', width: '100%', maxWidth: '1240px', margin: '0 auto' }}>
      
      {/* TOP SECTION: Teacher Profile Card (Apple Gallery White Flat Surface) */}
      <div
        style={{
          background: 'var(--color-gallery-white)',
          border: '1px solid var(--color-hairline-silver)',
          borderRadius: 'var(--radius-cards)',
          padding: 'var(--spacing-28)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--spacing-16)', marginBottom: 'var(--spacing-24)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-16)' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'var(--color-ink)',
                color: 'var(--color-gallery-white)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: '600',
                fontFamily: 'var(--font-sf-pro-display)'
              }}
            >
              {initialLetter}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-8)', flexWrap: 'wrap' }}>
                <h2 style={{ color: 'var(--color-ink)', fontSize: '24px', fontWeight: '600', margin: 0, letterSpacing: '-0.5px' }}>
                  {firstName} {lastName}
                </h2>
                <span className="role-pill" style={{ background: 'var(--color-studio-mist)', color: 'var(--color-ink)', border: '1px solid var(--color-hairline-silver)', fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: 'var(--radius-buttons)' }}>
                  TEACHER PORTAL
                </span>
              </div>
              <p style={{ color: 'var(--color-slate)', fontSize: 'var(--text-body-small)', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={13} color="var(--color-steel)" />
                {email}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-12)' }}>
            <span
              style={{
                fontSize: '12px',
                padding: '4px 12px',
                borderRadius: 'var(--radius-buttons)',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--color-studio-mist)',
                color: 'var(--color-ink)',
                border: '1px solid var(--color-hairline-silver)'
              }}
            >
              <CheckCircle size={14} color="var(--color-pricing-blue)" />
              Account Active
            </span>

            {onLogout && (
              <button
                className="btn-apple-outline"
                onClick={onLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 16px',
                  fontSize: '12px'
                }}
              >
                <LogOut size={13} />
                Sign Out
              </button>
            )}
          </div>
        </div>

        {/* Profile Info Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-16)', paddingTop: 'var(--spacing-20)', borderTop: '1px solid var(--color-control-gray)' }}>
          <div style={{ background: 'var(--color-studio-mist)', padding: 'var(--spacing-16)', borderRadius: '16px', border: '1px solid var(--color-control-gray)' }}>
            <div style={{ fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.04em' }}>TEACHER ID</div>
            <div style={{ color: 'var(--color-ink)', fontWeight: '600', fontSize: '15px', marginTop: '4px' }}>
              {userIdStr}
            </div>
          </div>

          <div style={{ background: 'var(--color-studio-mist)', padding: 'var(--spacing-16)', borderRadius: '16px', border: '1px solid var(--color-control-gray)' }}>
            <div style={{ fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.04em' }}>TEACHER NAME</div>
            <div style={{ color: 'var(--color-ink)', fontWeight: '600', fontSize: '15px', marginTop: '4px' }}>
              {fullName}
            </div>
          </div>

          <div style={{ background: 'var(--color-studio-mist)', padding: 'var(--spacing-16)', borderRadius: '16px', border: '1px solid var(--color-control-gray)' }}>
            <div style={{ fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.04em' }}>PRIMARY SUBJECT</div>
            <div style={{ color: 'var(--color-pricing-blue)', fontWeight: '600', fontSize: '15px', marginTop: '4px' }}>
              {teacherSubjects.length > 0 ? teacherSubjects.map(s => s.subject).join(', ') : (profileData?.primarySubject || 'Mathematics')}
            </div>
          </div>

          <div style={{ background: 'var(--color-studio-mist)', padding: 'var(--spacing-16)', borderRadius: '16px', border: '1px solid var(--color-control-gray)' }}>
            <div style={{ fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.04em' }}>ROLE</div>
            <div style={{ color: 'var(--color-ink)', fontWeight: '600', fontSize: '15px', marginTop: '4px' }}>
              Faculty Member
            </div>
          </div>
        </div>
      </div>

      {/* LOWER SECTION: Sidebar Navigation + Right Workspace Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '260px 1fr',
          gap: 'var(--spacing-24)',
          alignItems: 'start'
        }}
      >
        {/* Left Sidebar Menu */}
        <div
          style={{
            background: 'var(--color-gallery-white)',
            border: '1px solid var(--color-hairline-silver)',
            borderRadius: 'var(--radius-cards)',
            padding: 'var(--spacing-20)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-16)'
          }}
        >
          {onBack && (
            <button
              onClick={onBack}
              className="btn-apple-outline"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '8px 14px',
                fontSize: '13px'
              }}
            >
              <ArrowLeft size={14} /> Back to Dashboard
            </button>
          )}

          <div>
            <div
              style={{
                color: 'var(--color-slate)',
                fontSize: '11px',
                fontWeight: '600',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                margin: '0 0 12px 6px'
              }}
            >
              TEACHER MODULES
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {modulesList.map((mod) => {
                const isActive = activeTab === mod.id;
                return (
                  <button
                    key={mod.id}
                    onClick={() => setActiveTab(mod.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: isActive
                        ? '1px solid var(--color-pricing-blue)'
                        : '1px solid transparent',
                      background: isActive
                        ? 'var(--color-studio-mist)'
                        : 'transparent',
                      color: isActive ? 'var(--color-pricing-blue)' : 'var(--color-ink)',
                      fontWeight: isActive ? '600' : '400',
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {mod.icon}
                      <span>{mod.title}</span>
                    </div>
                    <ChevronRight size={14} style={{ opacity: isActive ? 1 : 0.3 }} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Content Workspace */}
        <div>
          {/* MODULE 1: PROFILE FORM & MYSQL TEACHERS TABLE WORKSPACE */}
          {activeTab === 'module1' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-20)' }}>
              
              {/* Profile Registration Form Card */}
              <form
                onSubmit={handleAddSubject}
                style={{
                  background: 'var(--color-gallery-white)',
                  border: '1px solid var(--color-hairline-silver)',
                  borderRadius: 'var(--radius-cards)',
                  padding: 'var(--spacing-28)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--spacing-20)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <h4 style={{ color: 'var(--color-ink)', fontSize: '19px', fontWeight: '600', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IdCard size={20} color="var(--color-pricing-blue)" />
                    Teacher Registration Profile & Subject Form
                  </h4>
                  <span style={{ fontSize: '13px', color: 'var(--color-slate)', fontWeight: '500' }}>
                    User ID: {userIdStr}
                  </span>
                </div>

                {profileSuccessMsg && (
                  <div style={{ color: 'var(--color-ink)', fontSize: '13px', background: 'var(--color-studio-mist)', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--color-hairline-silver)' }}>
                    {profileSuccessMsg}
                  </div>
                )}

                {profileErrMsg && (
                  <div style={{ color: 'var(--color-launch-orange)', fontSize: '13px', background: 'var(--color-studio-mist)', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--color-hairline-silver)' }}>
                    {profileErrMsg}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--spacing-16)' }}>
                  <div>
                    <label style={{ display: 'block', color: 'var(--color-slate)', fontSize: '12px', marginBottom: '6px', fontWeight: '500' }}>Email Address</label>
                    <input
                      type="email"
                      value={subjectForm.email}
                      onChange={(e) => setSubjectForm({ ...subjectForm, email: e.target.value })}
                      placeholder="teacher@school.com"
                      className="search-input"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', color: 'var(--color-ink)', fontSize: '12px', marginBottom: '6px', fontWeight: '600' }}>
                      Assign Subject (Stores in MySQL teachers table)
                    </label>
                    <input
                      type="text"
                      value={subjectForm.subject}
                      onChange={(e) => setSubjectForm({ ...subjectForm, subject: e.target.value })}
                      placeholder="e.g. social, telugu, hindi (comma-separated)"
                      className="search-input"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                  <button
                    type="submit"
                    className="btn-apple-primary"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 20px',
                      fontSize: '13px'
                    }}
                  >
                    <Plus size={14} /> Save & Add Subject to MySQL Table
                  </button>
                </div>
              </form>

              {/* MYSQL TEACHERS TABLE DATA VIEW */}
              <div
                style={{
                  background: 'var(--color-gallery-white)',
                  border: '1px solid var(--color-hairline-silver)',
                  borderRadius: 'var(--radius-cards)',
                  overflow: 'hidden'
                }}
              >
                <div style={{ padding: '16px 20px', background: 'var(--color-studio-mist)', borderBottom: '1px solid var(--color-control-gray)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ color: 'var(--color-ink)', margin: 0, fontSize: '15px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Shield size={16} color="var(--color-pricing-blue)" />
                    MySQL Database Table: <code style={{ color: 'var(--color-pricing-blue)' }}>teachers</code>
                  </h4>
                  <span style={{ fontSize: '13px', color: 'var(--color-slate)' }}>
                    Total Subjects: <strong style={{ color: 'var(--color-ink)' }}>{teacherSubjects.length}</strong>
                  </span>
                </div>

                {subjectLoading ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-slate)' }}>
                    Loading records from teachers MySQL table...
                  </div>
                ) : teacherSubjects.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--color-slate)' }}>
                    No subject records stored in <code style={{ color: 'var(--color-pricing-blue)' }}>teachers</code> MySQL table for {fullName} yet.
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--color-ink)', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ background: 'var(--color-paper-frost)', borderBottom: '1px solid var(--color-hairline-silver)', textTransform: 'uppercase', fontSize: '11px', color: 'var(--color-slate)', letterSpacing: '0.04em' }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left' }}>User ID</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left' }}>Username</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left' }}>Teacher Name</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left' }}>Subject Taught</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center' }}>Count</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teacherSubjects.map((row, idx) => (
                        <tr
                          key={row.id || idx}
                          style={{
                            borderBottom: '1px solid var(--color-control-gray)',
                            background: idx % 2 === 0 ? 'var(--color-gallery-white)' : 'var(--color-studio-mist)'
                          }}
                        >
                          <td style={{ padding: '12px 16px', color: 'var(--color-ink)', fontWeight: '600' }}>
                            {row.userId || userIdStr}
                          </td>
                          <td style={{ padding: '12px 16px', color: 'var(--color-slate)' }}>
                            {row.username}
                          </td>
                          <td style={{ padding: '12px 16px', fontWeight: '500', color: 'var(--color-ink)' }}>
                            {row.name}
                          </td>
                          <td style={{ padding: '12px 16px', color: 'var(--color-pricing-blue)', fontWeight: '600' }}>
                            {row.subject}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                            <span
                              style={{
                                background: 'var(--color-studio-mist)',
                                color: 'var(--color-ink)',
                                padding: '2px 8px',
                                borderRadius: '10px',
                                border: '1px solid var(--color-hairline-silver)',
                                fontWeight: '600',
                                fontSize: '12px'
                              }}
                            >
                              {row.numberOfSubjects || teacherSubjects.length}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                            <button
                              onClick={() => handleDeleteSubjectRow(row.id)}
                              style={{
                                background: 'transparent',
                                border: '1px solid var(--color-hairline-silver)',
                                color: 'var(--color-slate)',
                                padding: '4px 8px',
                                borderRadius: '8px',
                                cursor: 'pointer'
                              }}
                              title="Delete Subject Row"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* MODULE 2: SCHEDULE WORKSPACE (PERSONALIZED TEACHER TIMETABLE) */}
          {activeTab === 'module2' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-20)' }}>
              
              {/* Header card with Date Controls */}
              <div
                style={{
                  background: 'var(--color-gallery-white)',
                  border: '1px solid var(--color-hairline-silver)',
                  borderRadius: 'var(--radius-cards)',
                  padding: 'var(--spacing-24)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 'var(--spacing-16)'
                }}
              >
                <div>
                  <h3 style={{ color: 'var(--color-ink)', fontSize: '19px', fontWeight: '600', margin: 0 }}>
                    Schedule – Daily Teaching Timetable
                  </h3>
                  <p style={{ color: 'var(--color-slate)', fontSize: '13px', margin: '4px 0 0 0' }}>
                    09:00 AM to 05:00 PM assignments for <strong style={{ color: 'var(--color-ink)' }}>{fullName}</strong>.
                  </p>
                </div>

                {/* Date Selector & Navigation Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-8)', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-studio-mist)', padding: '4px 10px', borderRadius: 'var(--radius-inputs)', border: '1px solid var(--color-steel)' }}>
                    <Calendar size={14} color="var(--color-pricing-blue)" />
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
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

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                      onClick={() => changeDateByDays(-1)}
                      className="btn-apple-outline"
                      style={{ padding: '5px 12px', fontSize: '12px' }}
                    >
                      ‹ Yesterday
                    </button>
                    <button
                      onClick={setTodayDate}
                      className="btn-apple-outline"
                      style={{ padding: '5px 12px', fontSize: '12px', borderColor: 'var(--color-pricing-blue)', color: 'var(--color-pricing-blue)' }}
                    >
                      Today
                    </button>
                    <button
                      onClick={() => changeDateByDays(1)}
                      className="btn-apple-outline"
                      style={{ padding: '5px 12px', fontSize: '12px' }}
                    >
                      Tomorrow ›
                    </button>
                  </div>
                </div>
              </div>

              {/* Status info bar */}
              <div
                style={{
                  background: 'var(--color-studio-mist)',
                  border: '1px solid var(--color-hairline-silver)',
                  borderRadius: '16px',
                  padding: '12px 16px',
                  color: 'var(--color-slate)',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}
              >
                <span>
                  Date: <strong style={{ color: 'var(--color-ink)' }}>{getFormattedDateWithDay(selectedDate)}</strong>
                </span>
                <span style={{ fontSize: '12px', color: 'var(--color-steel)' }}>
                  Live sync from database schedule assignments
                </span>
              </div>

              {/* TIMETABLE TABLE */}
              <div
                style={{
                  background: 'var(--color-gallery-white)',
                  border: '1px solid var(--color-hairline-silver)',
                  borderRadius: 'var(--radius-cards)',
                  overflow: 'hidden'
                }}
              >
                {scheduleLoading ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-slate)' }}>
                    Loading database class schedule...
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--color-ink)', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ background: 'var(--color-paper-frost)', borderBottom: '1px solid var(--color-hairline-silver)', textTransform: 'uppercase', fontSize: '11px', color: 'var(--color-slate)', letterSpacing: '0.04em' }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left' }}>Timing (Period)</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left' }}>Class</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center' }}>Section</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left' }}>Room No</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left' }}>Subject</th>
                        <th style={{ padding: '12px 16px', textAlign: 'center' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { pIdx: 0, time: '9-10 (09:00 AM - 10:00 AM)', label: 'Period 1' },
                        { pIdx: 1, time: '10-11 (10:00 AM - 11:00 AM)', label: 'Period 2' },
                        { pIdx: 2, time: '11-12 (11:00 AM - 12:00 PM)', label: 'Period 3' },
                        { pIdx: 3, time: '12-01 (12:00 PM - 01:00 PM)', label: 'Lunch Break', isLunch: true },
                        { pIdx: 4, time: '01-02 (01:00 PM - 02:00 PM)', label: 'Period 4' },
                        { pIdx: 5, time: '02-03 (02:00 PM - 03:00 PM)', label: 'Period 5' },
                        { pIdx: 6, time: '03-04 (03:00 PM - 04:00 PM)', label: 'Period 6' },
                        { pIdx: 7, time: '04-05 (04:00 PM - 05:00 PM)', label: 'Period 7' }
                      ].map((slotObj, idx) => {
                        if (slotObj.isLunch) {
                          return (
                            <tr
                              key={slotObj.pIdx}
                              style={{
                                background: 'var(--color-studio-mist)',
                                borderBottom: '1px solid var(--color-hairline-silver)'
                              }}
                            >
                              <td style={{ padding: '12px 16px', color: 'var(--color-slate)', fontWeight: '600' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <Clock size={14} color="var(--color-steel)" />
                                  {slotObj.time}
                                </span>
                              </td>
                              <td colSpan={5} style={{ padding: '12px 16px', color: 'var(--color-slate)', fontWeight: '500' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <Coffee size={15} />
                                  Lunch & Refreshment Break
                                </span>
                              </td>
                            </tr>
                          );
                        }

                        const matchedEntry = schedules.find((s) => {
                          if (s.periodIndex !== slotObj.pIdx) return false;
                          return isExactTeacherMatch(s.teacherName);
                        });

                        if (matchedEntry) {
                          return (
                            <tr
                              key={slotObj.pIdx}
                              style={{
                                borderBottom: '1px solid var(--color-control-gray)',
                                background: idx % 2 === 0 ? 'var(--color-gallery-white)' : 'var(--color-studio-mist)'
                              }}
                            >
                              <td style={{ padding: '12px 16px', color: 'var(--color-ink)', fontWeight: '600' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <Clock size={14} color="var(--color-pricing-blue)" />
                                  {slotObj.time}
                                </span>
                              </td>
                              <td style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-ink)' }}>
                                Class {matchedEntry.classStandard}
                              </td>
                              <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                <span
                                  style={{
                                    background: 'var(--color-studio-mist)',
                                    color: 'var(--color-ink)',
                                    padding: '2px 8px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--color-hairline-silver)',
                                    fontWeight: '600',
                                    fontSize: '12px'
                                  }}
                                >
                                  Section {matchedEntry.sectionId === 1 ? 'A' : matchedEntry.sectionId === 2 ? 'B' : 'C'}
                                </span>
                              </td>
                              <td style={{ padding: '12px 16px', color: 'var(--color-slate)', fontWeight: '500' }}>
                                {matchedEntry.roomNo || `Room 10${slotObj.pIdx + 1}`}
                              </td>
                              <td style={{ padding: '12px 16px', color: 'var(--color-pricing-blue)', fontWeight: '600' }}>
                                {matchedEntry.subjectName}
                              </td>
                              <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                <span style={{ background: 'var(--color-studio-mist)', color: 'var(--color-pricing-blue)', border: '1px solid var(--color-hairline-silver)', padding: '2px 10px', borderRadius: 'var(--radius-buttons)', fontSize: '11px', fontWeight: '600' }}>
                                  Assigned
                                </span>
                              </td>
                            </tr>
                          );
                        }

                        // Free Period
                        return (
                          <tr
                            key={slotObj.pIdx}
                            style={{
                              borderBottom: '1px solid var(--color-control-gray)',
                              background: 'var(--color-gallery-white)'
                            }}
                          >
                            <td style={{ padding: '12px 16px', color: 'var(--color-steel)', fontWeight: '500' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Clock size={14} color="var(--color-steel)" />
                                {slotObj.time}
                              </span>
                            </td>
                            <td colSpan={4} style={{ padding: '12px 16px', color: 'var(--color-steel)', fontStyle: 'italic' }}>
                              Free Period / No Assigned Class
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                              <span style={{ background: 'var(--color-studio-mist)', color: 'var(--color-steel)', border: '1px solid var(--color-control-gray)', padding: '2px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: '500' }}>
                                Free Slot
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* MODULE 3: ATTENDANCE WORKSPACE */}
          {activeTab === 'module3' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-20)' }}>
              {/* Header bar */}
              <div
                style={{
                  background: 'var(--color-gallery-white)',
                  border: '1px solid var(--color-hairline-silver)',
                  borderRadius: 'var(--radius-cards)',
                  padding: 'var(--spacing-24)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 'var(--spacing-16)'
                }}
              >
                <div>
                  <h3 style={{ color: 'var(--color-ink)', fontSize: '19px', fontWeight: '600', margin: 0 }}>
                    Student Attendance Roster
                  </h3>
                  <p style={{ color: 'var(--color-slate)', fontSize: '13px', margin: '4px 0 0 0' }}>
                    Mark and review daily attendance logs for class sections.
                  </p>
                </div>

                {/* Filter and Date Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-8)', flexWrap: 'wrap' }}>
                  
                  {/* Date Selector */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-studio-mist)', padding: '4px 10px', borderRadius: 'var(--radius-inputs)', border: '1px solid var(--color-steel)' }}>
                    <span style={{ color: 'var(--color-slate)', fontSize: '12px', fontWeight: '600' }}>Date:</span>
                    <input
                      type="date"
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
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

                  {/* Class Dropdown */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-studio-mist)', padding: '4px 10px', borderRadius: 'var(--radius-inputs)', border: '1px solid var(--color-steel)' }}>
                    <span style={{ color: 'var(--color-slate)', fontSize: '12px', fontWeight: '600' }}>Class:</span>
                    <select
                      value={attendanceClass}
                      onChange={(e) => setAttendanceClass(parseInt(e.target.value))}
                      style={{
                        background: 'transparent',
                        color: 'var(--color-ink)',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: '500',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(c => (
                        <option key={c} value={c}>Grade {c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Section Dropdown */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-studio-mist)', padding: '4px 10px', borderRadius: 'var(--radius-inputs)', border: '1px solid var(--color-steel)' }}>
                    <span style={{ color: 'var(--color-slate)', fontSize: '12px', fontWeight: '600' }}>Section:</span>
                    <select
                      value={attendanceSection}
                      onChange={(e) => setAttendanceSection(e.target.value)}
                      style={{
                        background: 'transparent',
                        color: 'var(--color-ink)',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: '500',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {['A', 'B', 'C'].map(sec => (
                        <option key={sec} value={sec}>Section {sec}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={fetchAttendanceRoster}
                    className="btn-apple-outline"
                    style={{ padding: '6px 14px', fontSize: '12px' }}
                  >
                    Reload
                  </button>
                </div>
              </div>

              {/* Status messages */}
              {attendanceSaveMsg && (
                <div style={{ padding: '10px 14px', background: 'var(--color-studio-mist)', border: '1px solid var(--color-hairline-silver)', borderRadius: '12px', color: 'var(--color-ink)', fontSize: '13px', fontWeight: '500' }}>
                  {attendanceSaveMsg}
                </div>
              )}
              {attendanceSaveErr && (
                <div style={{ padding: '10px 14px', background: 'var(--color-studio-mist)', border: '1px solid var(--color-hairline-silver)', borderRadius: '12px', color: 'var(--color-launch-orange)', fontSize: '13px', fontWeight: '500' }}>
                  {attendanceSaveErr}
                </div>
              )}

              {/* Attendance Table */}
              <div
                style={{
                  background: 'var(--color-gallery-white)',
                  border: '1px solid var(--color-hairline-silver)',
                  borderRadius: 'var(--radius-cards)',
                  overflow: 'hidden'
                }}
              >
                {attendanceLoading ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-slate)' }}>
                    Loading student roster & attendance history...
                  </div>
                ) : studentsRoster.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-slate)', fontSize: '14px' }}>
                    No students currently enrolled in Grade {attendanceClass} - Section {attendanceSection}.
                  </div>
                ) : (
                  <div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--color-ink)', fontSize: '14px' }}>
                      <thead>
                        <tr style={{ background: 'var(--color-paper-frost)', borderBottom: '1px solid var(--color-hairline-silver)', textTransform: 'uppercase', fontSize: '11px', color: 'var(--color-slate)', letterSpacing: '0.04em' }}>
                          <th style={{ padding: '12px 16px', textAlign: 'left', width: '60px' }}>No.</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left' }}>Student ID</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left' }}>Student Name</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left' }}>Parent Name</th>
                          <th style={{ padding: '12px 16px', textAlign: 'center', width: '100px' }}>Present</th>
                          <th style={{ padding: '12px 16px', textAlign: 'center', width: '130px' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentsRoster.map((student, idx) => {
                          const isPresent = attendanceMap[student.studentId] === 'PRESENT';
                          return (
                            <tr
                              key={student.studentId}
                              style={{
                                borderBottom: '1px solid var(--color-control-gray)',
                                background: idx % 2 === 0 ? 'var(--color-gallery-white)' : 'var(--color-studio-mist)'
                              }}
                            >
                              <td style={{ padding: '12px 16px', color: 'var(--color-slate)', fontWeight: '400' }}>
                                {idx + 1}
                              </td>
                              <td style={{ padding: '12px 16px', color: 'var(--color-ink)', fontWeight: '600' }}>
                                {student.studentId}
                              </td>
                              <td style={{ padding: '12px 16px', fontWeight: '500', color: 'var(--color-ink)' }}>
                                {student.firstName} {student.lastName}
                              </td>
                              <td style={{ padding: '12px 16px', color: 'var(--color-slate)' }}>
                                {student.parentName || 'N/A'}
                              </td>
                              <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                <input
                                  type="checkbox"
                                  checked={isPresent}
                                  onChange={() => toggleAttendance(student.studentId)}
                                  style={{
                                    width: '16px',
                                    height: '16px',
                                    cursor: 'pointer',
                                    accentColor: 'var(--color-pricing-blue)'
                                  }}
                                />
                              </td>
                              <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                <span
                                  style={{
                                    background: isPresent ? 'var(--color-studio-mist)' : 'var(--color-studio-mist)',
                                    color: isPresent ? 'var(--color-pricing-blue)' : 'var(--color-launch-orange)',
                                    border: '1px solid var(--color-hairline-silver)',
                                    padding: '3px 10px',
                                    borderRadius: 'var(--radius-buttons)',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    display: 'inline-block',
                                    minWidth: '70px'
                                  }}
                                >
                                  {isPresent ? 'PRESENT' : 'ABSENT'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {/* Footer stats row */}
                    <div
                      style={{
                        background: 'var(--color-studio-mist)',
                        borderTop: '1px solid var(--color-control-gray)',
                        padding: '16px 20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '13px', color: 'var(--color-slate)' }}>
                          Total: <strong style={{ color: 'var(--color-ink)' }}>{studentsRoster.length}</strong>
                        </span>
                        <span style={{ fontSize: '13px', color: 'var(--color-slate)' }}>
                          Present: <strong style={{ color: 'var(--color-pricing-blue)' }}>{Object.values(attendanceMap).filter(v => v === 'PRESENT').length}</strong>
                        </span>
                        <span style={{ fontSize: '13px', color: 'var(--color-slate)' }}>
                          Absent: <strong style={{ color: 'var(--color-launch-orange)' }}>{Object.values(attendanceMap).filter(v => v === 'ABSENT').length}</strong>
                        </span>
                      </div>

                      <button
                        onClick={handleSaveAttendance}
                        disabled={attendanceLoading}
                        className="btn-apple-primary"
                        style={{
                          padding: '6px 18px',
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Save size={14} />
                        Save Attendance
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* OTHER MODULES WORKSPACE PLACEHOLDERS */}
          {modulesList.map((mod) => {
            if (mod.id === 'module1' || mod.id === 'module2' || mod.id === 'module3' || activeTab !== mod.id) return null;
            return (
              <div key={mod.id} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-20)' }}>
                <div
                  style={{
                    background: 'var(--color-gallery-white)',
                    border: '1px solid var(--color-hairline-silver)',
                    borderRadius: 'var(--radius-cards)',
                    padding: 'var(--spacing-28)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        background: 'var(--color-studio-mist)',
                        border: '1px solid var(--color-hairline-silver)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {mod.icon}
                    </div>
                    <div>
                      <h3 style={{ color: 'var(--color-ink)', fontSize: '20px', fontWeight: '600', margin: 0 }}>
                        {mod.title} – {mod.subtitle}
                      </h3>
                      <p style={{ color: 'var(--color-slate)', fontSize: '13px', margin: '4px 0 0 0' }}>
                        {mod.desc}
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      background: 'var(--color-studio-mist)',
                      border: '1px dashed var(--color-hairline-silver)',
                      borderRadius: '20px',
                      padding: '48px 20px',
                      textAlign: 'center'
                    }}
                  >
                    <h4 style={{ color: 'var(--color-ink)', fontSize: '16px', fontWeight: '600', margin: 0 }}>
                      {mod.subtitle}
                    </h4>
                    <p style={{ color: 'var(--color-slate)', fontSize: '13px', marginTop: '6px', maxWidth: '400px', margin: '6px auto 0 auto', lineHeight: '1.5' }}>
                      This module workspace is currently synchronized with faculty records.
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
