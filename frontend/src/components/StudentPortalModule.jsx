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
  Layers,
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
  Eye,
  X,
  ChevronLeft
} from 'lucide-react';
import AdmissionModule from './AdmissionModule';
import EnquiryModule from './EnquiryModule';

const GATEWAY_URL = 'http://localhost:8099/api/student-portal';
const DIRECT_URL = 'http://localhost:8090/api/student-portal';
const EXAM_GATEWAY_URL = 'http://localhost:8099/api/student-examination';
const EXAM_DIRECT_URL = 'http://localhost:8098/api/student-examination';
const STUDY_RESOURCE_GATEWAY_URL = 'http://localhost:8099/api/student-study-resource';
const STUDY_RESOURCE_DIRECT_URL = 'http://localhost:8100/api/student-study-resource';

const formatStudyNoteTimestamp = (ts) => {
  if (!ts) return 'Recent';
  try {
    const d = new Date(ts);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }) + ' • ' + d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  } catch (e) {}
  return String(ts).replace('T', ' ');
};

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

  // Module 3: Examination Module States
  const [examActiveSubTab, setExamActiveSubTab] = useState('available'); // 'available' | 'results'
  const [availableExams, setAvailableExams] = useState([]);
  const [examResults, setExamResults] = useState([]);
  const [examCohort, setExamCohort] = useState(null);
  const [examLoading, setExamLoading] = useState(false);
  const [examSearchQuery, setExamSearchQuery] = useState('');
  const [examSubjectFilter, setExamSubjectFilter] = useState('ALL');

  // Attempting Exam Modal State
  const [activeExamPaper, setActiveExamPaper] = useState(null);
  const [activeExamQIndex, setActiveExamQIndex] = useState(0);
  const [studentAnswers, setStudentAnswers] = useState({});
  const [isSubmittingExam, setIsSubmittingExam] = useState(false);
  const [examSubmitSummary, setExamSubmitSummary] = useState(null);

  // Reviewing Exam Modal State
  const [examReviewData, setExamReviewData] = useState(null);
  const [isReviewLoading, setIsReviewLoading] = useState(false);

  // Module 4: Study Resources (Teacher Lesson Notes)
  const [studyNotes, setStudyNotes] = useState([]);
  const [studyLoading, setStudyLoading] = useState(false);
  const [studyCohort, setStudyCohort] = useState(null);
  const [studySearchQuery, setStudySearchQuery] = useState('');
  const [studySubjectFilter, setStudySubjectFilter] = useState('ALL');
  const [studyTeacherFilter, setStudyTeacherFilter] = useState('ALL');
  const [availableStudySubjects, setAvailableStudySubjects] = useState([]);
  const [availableStudyTeachers, setAvailableStudyTeachers] = useState([]);
  const [selectedStudyNoteDetail, setSelectedStudyNoteDetail] = useState(null);
  const [copiedNoteId, setCopiedNoteId] = useState(null);

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

  // Examination Module Fetch Functions
  const fetchStudentExamCohort = async () => {
    try {
      let res = await fetch(`${EXAM_GATEWAY_URL}/student-cohort?username=${encodeURIComponent(username)}`).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(`${EXAM_DIRECT_URL}/student-cohort?username=${encodeURIComponent(username)}`).catch(() => null);
      }
      if (res && res.ok) {
        const data = await res.json();
        setExamCohort(data);
        return data;
      }
    } catch (e) {
      console.warn('Failed to fetch student cohort:', e);
    }
    return null;
  };

  const fetchAvailableExams = async () => {
    try {
      let res = await fetch(`${EXAM_GATEWAY_URL}/available-exams?username=${encodeURIComponent(username)}`).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(`${EXAM_DIRECT_URL}/available-exams?username=${encodeURIComponent(username)}`).catch(() => null);
      }
      if (res && res.ok) {
        const data = await res.json();
        setAvailableExams(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.warn('Failed to fetch available exams:', e);
    }
  };

  const fetchStudentResults = async () => {
    try {
      let res = await fetch(`${EXAM_GATEWAY_URL}/results?username=${encodeURIComponent(username)}`).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(`${EXAM_DIRECT_URL}/results?username=${encodeURIComponent(username)}`).catch(() => null);
      }
      if (res && res.ok) {
        const data = await res.json();
        setExamResults(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.warn('Failed to fetch exam results:', e);
    }
  };

  const loadExamModuleData = async () => {
    setExamLoading(true);
    await fetchStudentExamCohort();
    await Promise.all([fetchAvailableExams(), fetchStudentResults()]);
    setExamLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'session' && selectedModule === 'module3') {
      loadExamModuleData();
      const interval = setInterval(() => {
        fetchAvailableExams();
        fetchStudentResults();
      }, 3500);
      return () => clearInterval(interval);
    }
  }, [activeTab, selectedModule, username]);

  const handleStartExam = async (assignmentId) => {
    try {
      setExamLoading(true);
      let res = await fetch(`${EXAM_GATEWAY_URL}/exam-paper/${assignmentId}?username=${encodeURIComponent(username)}`).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(`${EXAM_DIRECT_URL}/exam-paper/${assignmentId}?username=${encodeURIComponent(username)}`).catch(() => null);
      }
      if (res && res.ok) {
        const data = await res.json();
        if (data.alreadyAttempted) {
          alert('You have already attempted and submitted this exam.');
          fetchAvailableExams();
          fetchStudentResults();
        } else {
          setActiveExamPaper(data);
          setActiveExamQIndex(0);
          setStudentAnswers({});
          setExamSubmitSummary(null);
        }
      } else {
        alert('Could not load examination paper. Please try again.');
      }
    } catch (e) {
      console.error(e);
      alert('Error fetching exam paper.');
    } finally {
      setExamLoading(false);
    }
  };

  const handleSubmitExam = async () => {
    if (!activeExamPaper) return;
    const answeredCount = Object.keys(studentAnswers).length;
    const totalQ = activeExamPaper.questions ? activeExamPaper.questions.length : 0;
    if (answeredCount < totalQ) {
      const confirmed = window.confirm(`You have answered ${answeredCount} of ${totalQ} questions. Are you sure you want to submit now?`);
      if (!confirmed) return;
    }

    setIsSubmittingExam(true);
    try {
      const payload = {
        studentUsername: username,
        studentName: fullName,
        assignmentId: activeExamPaper.assignmentId,
        answers: studentAnswers
      };

      let res = await fetch(`${EXAM_GATEWAY_URL}/submit-exam`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => null);

      if (!res || !res.ok) {
        res = await fetch(`${EXAM_DIRECT_URL}/submit-exam`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(() => null);
      }

      if (res && res.ok) {
        const summary = await res.json();
        setExamSubmitSummary(summary);
        fetchAvailableExams();
        fetchStudentResults();
      } else {
        const err = await res?.json().catch(() => ({}));
        alert(err.error || 'Failed to submit exam.');
      }
    } catch (e) {
      console.error('Submit exam error:', e);
      alert('Error submitting examination.');
    } finally {
      setIsSubmittingExam(false);
    }
  };

  const handleReviewExam = async (assignmentId) => {
    setIsReviewLoading(true);
    try {
      let res = await fetch(`${EXAM_GATEWAY_URL}/review/${assignmentId}?username=${encodeURIComponent(username)}`).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(`${EXAM_DIRECT_URL}/review/${assignmentId}?username=${encodeURIComponent(username)}`).catch(() => null);
      }
      if (res && res.ok) {
        const data = await res.json();
        setExamReviewData(data);
      } else {
        const err = await res?.json().catch(() => ({}));
        alert(err.error || 'Could not load exam review.');
      }
    } catch (e) {
      console.error('Review error:', e);
      alert('Error fetching exam review.');
    } finally {
      setIsReviewLoading(false);
    }
  };

  const fetchStudyResources = async () => {
    try {
      setStudyLoading(true);
      const params = new URLSearchParams();
      if (username) params.append('username', username);
      if (studySubjectFilter && studySubjectFilter !== 'ALL') params.append('subject', studySubjectFilter);
      if (studyTeacherFilter && studyTeacherFilter !== 'ALL') params.append('teacherName', studyTeacherFilter);
      if (studySearchQuery && studySearchQuery.trim()) params.append('search', studySearchQuery.trim());

      let url = `${STUDY_RESOURCE_GATEWAY_URL}/notes?${params.toString()}`;
      let res = await fetch(url).catch(() => null);
      if (!res || !res.ok) {
        url = `${STUDY_RESOURCE_DIRECT_URL}/notes?${params.toString()}`;
        res = await fetch(url).catch(() => null);
      }

      if (res && res.ok) {
        const data = await res.json();
        setStudyNotes(data.notes || []);
        if (data.studentCohort) {
          setStudyCohort(data.studentCohort);
        }
      } else {
        setStudyNotes([]);
      }
    } catch (err) {
      console.warn('Failed to fetch study resources:', err);
      setStudyNotes([]);
    } finally {
      setStudyLoading(false);
    }
  };

  const fetchStudyFilters = async () => {
    try {
      let subjRes = await fetch(`${STUDY_RESOURCE_GATEWAY_URL}/subjects`).catch(() => null);
      if (!subjRes || !subjRes.ok) {
        subjRes = await fetch(`${STUDY_RESOURCE_DIRECT_URL}/subjects`).catch(() => null);
      }
      if (subjRes && subjRes.ok) {
        const subjects = await subjRes.json();
        setAvailableStudySubjects(Array.isArray(subjects) ? subjects : []);
      }

      let teachRes = await fetch(`${STUDY_RESOURCE_GATEWAY_URL}/teachers`).catch(() => null);
      if (!teachRes || !teachRes.ok) {
        teachRes = await fetch(`${STUDY_RESOURCE_DIRECT_URL}/teachers`).catch(() => null);
      }
      if (teachRes && teachRes.ok) {
        const teachers = await teachRes.json();
        setAvailableStudyTeachers(Array.isArray(teachers) ? teachers : []);
      }
    } catch (e) {
      console.warn('Failed to load study resource filters', e);
    }
  };

  useEffect(() => {
    if (activeTab === 'session' && selectedModule === 'module4') {
      fetchStudyResources();
      fetchStudyFilters();
      const interval = setInterval(() => {
        fetchStudyResources();
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [activeTab, selectedModule, username, studySubjectFilter, studyTeacherFilter, studySearchQuery]);

  const handleCopyNoteContent = (note) => {
    if (!note) return;
    const fullText = `Subject: ${note.subject}\nTopic: ${note.topic}\nTeacher: ${note.teacherName}\nDate: ${formatStudyNoteTimestamp(note.timeOfNotesCreated)}\nClass & Section: ${note.className} - ${note.section}\n\nNotes:\n${note.notesContent}`;
    navigator.clipboard.writeText(fullText).then(() => {
      setCopiedNoteId(note.id);
      setTimeout(() => setCopiedNoteId(null), 2500);
    });
  };

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
      title: 'Study Resources',
      tag: 'Teacher Notes & Materials',
      subtitle: 'Study Resources & Lesson Notes',
      desc: 'Subject study materials and lesson notes dispatched by your teachers with lecture summaries.',
      icon: <BookOpen size={18} />,
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
                      ) : mod.id === 'module3' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                          {/* SECTION 1: CANDIDATE & COHORT BANNER */}
                          <div style={{
                            background: 'linear-gradient(135deg, rgba(239, 246, 255, 0.8) 0%, rgba(243, 232, 255, 0.5) 100%)',
                            border: '1px solid #bfdbfe',
                            borderRadius: '18px',
                            padding: '20px 24px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '16px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              <div style={{
                                width: '52px',
                                height: '52px',
                                borderRadius: '14px',
                                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                                color: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: '700',
                                fontSize: '20px',
                                boxShadow: '0 4px 12px rgba(37,99,235,0.25)'
                              }}>
                                {initialLetter}
                              </div>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                  <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--color-ink)' }}>
                                    {fullName}
                                  </h4>
                                  <span style={{
                                    background: '#dbeafe',
                                    color: '#1d4ed8',
                                    border: '1px solid #bfdbfe',
                                    padding: '2px 10px',
                                    borderRadius: '12px',
                                    fontSize: '12px',
                                    fontWeight: '700'
                                  }}>
                                    Grade {examCohort?.classStandard || '10'} - Section {examCohort?.sectionName || 'A'}
                                  </span>
                                  <span style={{
                                    background: '#f0fdf4',
                                    color: '#15803d',
                                    border: '1px solid #bbf7d0',
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    fontSize: '11px',
                                    fontWeight: '600'
                                  }}>
                                    Self-Scoped Only
                                  </span>
                                </div>
                                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--color-slate)' }}>
                                  Student ID: <strong>{examCohort?.studentId || profileData?.studentId || 'ADM-24992'}</strong> • Service: <code style={{ fontSize: '11.5px', background: 'rgba(0,0,0,0.05)', padding: '2px 6px', borderRadius: '4px' }}>student-examination-service (:8098)</code>
                                </p>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <button
                                onClick={loadExamModuleData}
                                disabled={examLoading}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  background: 'var(--color-gallery-white)',
                                  border: '1px solid var(--color-hairline-silver)',
                                  padding: '8px 14px',
                                  borderRadius: '10px',
                                  fontSize: '13px',
                                  fontWeight: '600',
                                  color: 'var(--color-ink)',
                                  cursor: examLoading ? 'not-allowed' : 'pointer'
                                }}
                              >
                                <RefreshCw size={14} className={examLoading ? 'spin' : ''} />
                                {examLoading ? 'Refreshing...' : 'Refresh Exams'}
                              </button>
                            </div>
                          </div>

                          {/* SUB-TABS NAVIGATION */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            borderBottom: '1px solid var(--color-hairline-silver)',
                            paddingBottom: '12px'
                          }}>
                            <button
                              onClick={() => setExamActiveSubTab('available')}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 18px',
                                borderRadius: '12px',
                                fontSize: '13.5px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                border: examActiveSubTab === 'available' ? '1px solid #2563eb' : '1px solid var(--color-hairline-silver)',
                                background: examActiveSubTab === 'available' ? '#2563eb' : 'var(--color-paper-frost)',
                                color: examActiveSubTab === 'available' ? '#ffffff' : 'var(--color-slate)'
                              }}
                            >
                              <BookOpen size={15} />
                              Assigned Examinations
                              <span style={{
                                background: examActiveSubTab === 'available' ? 'rgba(255,255,255,0.25)' : 'var(--color-studio-mist)',
                                color: examActiveSubTab === 'available' ? '#fff' : 'var(--color-ink)',
                                padding: '1px 7px',
                                borderRadius: '10px',
                                fontSize: '11px',
                                fontWeight: '700'
                              }}>
                                {availableExams.length}
                              </span>
                            </button>

                            <button
                              onClick={() => setExamActiveSubTab('results')}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 18px',
                                borderRadius: '12px',
                                fontSize: '13.5px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                border: examActiveSubTab === 'results' ? '1px solid #16a34a' : '1px solid var(--color-hairline-silver)',
                                background: examActiveSubTab === 'results' ? '#16a34a' : 'var(--color-paper-frost)',
                                color: examActiveSubTab === 'results' ? '#ffffff' : 'var(--color-slate)'
                              }}
                            >
                              <Award size={15} />
                              Published Results & History
                              <span style={{
                                background: examActiveSubTab === 'results' ? 'rgba(255,255,255,0.25)' : 'var(--color-studio-mist)',
                                color: examActiveSubTab === 'results' ? '#fff' : 'var(--color-ink)',
                                padding: '1px 7px',
                                borderRadius: '10px',
                                fontSize: '11px',
                                fontWeight: '700'
                              }}>
                                {examResults.length}
                              </span>
                            </button>
                          </div>

                          {/* SUB-TAB 1: ASSIGNED EXAMINATIONS */}
                          {examActiveSubTab === 'available' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                                <div>
                                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: 'var(--color-ink)' }}>
                                    Targeted Assessments for Grade {examCohort?.classStandard || '10'} - Section {examCohort?.sectionName || 'A'}
                                  </h4>
                                  <p style={{ margin: '3px 0 0 0', fontSize: '13px', color: 'var(--color-slate)' }}>
                                    Staff-assigned examinations specifically designated for your class and section cohort.
                                  </p>
                                </div>
                              </div>

                              {availableExams.length === 0 ? (
                                <div style={{
                                  textAlign: 'center',
                                  padding: '48px 24px',
                                  background: 'var(--color-studio-mist)',
                                  borderRadius: '16px',
                                  border: '1px solid var(--color-hairline-silver)'
                                }}>
                                  <Award size={36} color="var(--color-slate)" style={{ margin: '0 auto 10px auto' }} />
                                  <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-ink)' }}>
                                    No Examinations Assigned Yet
                                  </div>
                                  <p style={{ fontSize: '13.5px', color: 'var(--color-slate)', maxWidth: '440px', margin: '6px auto 0 auto' }}>
                                    Whenever faculty schedules and assigns an exam for Grade {examCohort?.classStandard || '10'} {examCohort?.sectionName || 'A'}, it will appear here for you to attempt.
                                  </p>
                                </div>
                              ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
                                  {availableExams.map((exam) => (
                                    <div
                                      key={exam.id}
                                      style={{
                                        background: 'var(--color-gallery-white)',
                                        border: exam.hasAttempted ? '1px solid #bbf7d0' : '1px solid var(--color-hairline-silver)',
                                        borderRadius: '16px',
                                        padding: '20px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '14px',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                        position: 'relative'
                                      }}
                                    >
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                                        <span style={{
                                          background: '#f0f9ff',
                                          color: '#0284c7',
                                          border: '1px solid #bae6fd',
                                          padding: '3px 10px',
                                          borderRadius: '8px',
                                          fontSize: '11.5px',
                                          fontWeight: '700'
                                        }}>
                                          {exam.subject || 'General'}
                                        </span>
                                        {exam.hasAttempted ? (
                                          <span style={{
                                            background: '#f0fdf4',
                                            color: '#16a34a',
                                            border: '1px solid #bbf7d0',
                                            padding: '3px 10px',
                                            borderRadius: '12px',
                                            fontSize: '11.5px',
                                            fontWeight: '700',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                          }}>
                                            <CheckCircle2 size={13} />
                                            Attempted
                                          </span>
                                        ) : (
                                          <span style={{
                                            background: '#eff6ff',
                                            color: '#2563eb',
                                            border: '1px solid #bfdbfe',
                                            padding: '3px 10px',
                                            borderRadius: '12px',
                                            fontSize: '11.5px',
                                            fontWeight: '700',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                          }}>
                                            <Clock size={13} />
                                            Ready to Attempt
                                          </span>
                                        )}
                                      </div>

                                      <div>
                                        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: 'var(--color-ink)' }}>
                                          {exam.assignmentTitle}
                                        </h4>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px', fontSize: '12.5px', color: 'var(--color-slate)' }}>
                                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Calendar size={13} />
                                            {exam.conductDate || 'Scheduled'}
                                          </span>
                                          <span>•</span>
                                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <FileText size={13} />
                                            {exam.totalQuestions} Questions
                                          </span>
                                        </div>
                                      </div>

                                      <div style={{
                                        paddingTop: '12px',
                                        borderTop: '1px solid var(--color-hairline-silver)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                      }}>
                                        <span style={{ fontSize: '12px', color: 'var(--color-slate)', fontWeight: '500' }}>
                                          Target: Grade {exam.classStandard} - {exam.sectionName}
                                        </span>

                                        {exam.hasAttempted ? (
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            {exam.resultsReleased ? (
                                              <button
                                                onClick={() => handleReviewExam(exam.id)}
                                                style={{
                                                  background: '#16a34a',
                                                  color: '#fff',
                                                  border: 'none',
                                                  padding: '6px 12px',
                                                  borderRadius: '8px',
                                                  fontSize: '12px',
                                                  fontWeight: '600',
                                                  cursor: 'pointer',
                                                  display: 'inline-flex',
                                                  alignItems: 'center',
                                                  gap: '4px'
                                                }}
                                              >
                                                <Eye size={13} />
                                                Review ({exam.score}/{exam.totalMarks})
                                              </button>
                                            ) : (
                                              <span style={{ fontSize: '11.5px', color: '#b45309', fontWeight: '600', background: '#fef3c7', padding: '3px 8px', borderRadius: '6px' }}>
                                                Awaiting Publication
                                              </span>
                                            )}
                                          </div>
                                        ) : (
                                          <button
                                            onClick={() => handleStartExam(exam.id)}
                                            style={{
                                              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                                              color: '#fff',
                                              border: 'none',
                                              padding: '7px 16px',
                                              borderRadius: '10px',
                                              fontSize: '12.5px',
                                              fontWeight: '700',
                                              cursor: 'pointer',
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              gap: '6px',
                                              boxShadow: '0 2px 6px rgba(37,99,235,0.25)'
                                            }}
                                          >
                                            <PlayCircle size={14} />
                                            Attempt Exam
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* SUB-TAB 2: PUBLISHED RESULTS & HISTORY */}
                          {examActiveSubTab === 'results' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                              {/* STATS OVERVIEW CARDS */}
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                                <div style={{ background: 'var(--color-gallery-white)', border: '1px solid var(--color-hairline-silver)', borderRadius: '14px', padding: '16px' }}>
                                  <span style={{ fontSize: '12px', color: 'var(--color-slate)', fontWeight: '600' }}>Published Exams</span>
                                  <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--color-ink)', marginTop: '4px' }}>
                                    {examResults.length}
                                  </div>
                                </div>
                                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '14px', padding: '16px' }}>
                                  <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600' }}>Attended & Graded</span>
                                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#15803d', marginTop: '4px' }}>
                                    {examResults.filter(r => r.status === 'ATTEMPTED').length}
                                  </div>
                                </div>
                                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '14px', padding: '16px' }}>
                                  <span style={{ fontSize: '12px', color: '#dc2626', fontWeight: '600' }}>Unattended (0 Marks)</span>
                                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#b91c1c', marginTop: '4px' }}>
                                    {examResults.filter(r => r.status === 'UNATTEMPTED').length}
                                  </div>
                                </div>
                                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '14px', padding: '16px' }}>
                                  <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: '600' }}>Average Score</span>
                                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#1d4ed8', marginTop: '4px' }}>
                                    {(() => {
                                      if (examResults.length === 0) return '0%';
                                      const totalPct = examResults.reduce((acc, curr) => acc + (curr.percentage || 0), 0);
                                      return `${Math.round(totalPct / examResults.length)}%`;
                                    })()}
                                  </div>
                                </div>
                              </div>

                              {/* RESULTS TABLE */}
                              <div style={{ background: 'var(--color-gallery-white)', border: '1px solid var(--color-hairline-silver)', borderRadius: '18px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                                  <div>
                                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: 'var(--color-ink)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <Award size={18} color="var(--color-pricing-blue)" />
                                      Permanent Examination History & Report Card
                                    </h4>
                                    <p style={{ margin: '3px 0 0 0', fontSize: '13px', color: 'var(--color-slate)' }}>
                                      Official evaluations released by staff. Unattended exams reflect 0 marks in your permanent record.
                                    </p>
                                  </div>

                                  {/* Filter Bar */}
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-studio-mist)', padding: '5px 10px', borderRadius: '8px', border: '1px solid var(--color-hairline-silver)' }}>
                                      <Search size={13} color="var(--color-slate)" />
                                      <input
                                        type="text"
                                        placeholder="Search exam or subject..."
                                        value={examSearchQuery}
                                        onChange={(e) => setExamSearchQuery(e.target.value)}
                                        style={{
                                          background: 'transparent',
                                          border: 'none',
                                          fontSize: '12px',
                                          color: 'var(--color-ink)',
                                          outline: 'none',
                                          width: '150px'
                                        }}
                                      />
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-studio-mist)', padding: '5px 10px', borderRadius: '8px', border: '1px solid var(--color-hairline-silver)' }}>
                                      <span style={{ fontSize: '12px', color: 'var(--color-slate)', fontWeight: '600' }}>Subject:</span>
                                      <select
                                        value={examSubjectFilter}
                                        onChange={(e) => setExamSubjectFilter(e.target.value)}
                                        style={{
                                          background: 'transparent',
                                          border: 'none',
                                          fontSize: '12px',
                                          color: 'var(--color-ink)',
                                          fontWeight: '600',
                                          outline: 'none',
                                          cursor: 'pointer'
                                        }}
                                      >
                                        <option value="ALL">All Subjects</option>
                                        {Array.from(new Set(examResults.map(r => r.subject).filter(Boolean))).map(s => (
                                          <option key={s} value={s}>{s}</option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                </div>

                                {(() => {
                                  const filteredResults = examResults.filter(r => {
                                    if (examSubjectFilter !== 'ALL' && r.subject !== examSubjectFilter) return false;
                                    if (examSearchQuery.trim() !== '') {
                                      const q = examSearchQuery.toLowerCase();
                                      const title = (r.assignmentTitle || '').toLowerCase();
                                      const subj = (r.subject || '').toLowerCase();
                                      if (!title.includes(q) && !subj.includes(q)) return false;
                                    }
                                    return true;
                                  });

                                  if (filteredResults.length === 0) {
                                    return (
                                      <div style={{ textAlign: 'center', padding: '36px 20px', background: 'var(--color-studio-mist)', borderRadius: '14px', border: '1px solid var(--color-hairline-silver)' }}>
                                        <Award size={28} color="var(--color-slate)" style={{ margin: '0 auto 8px auto' }} />
                                        <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--color-ink)' }}>
                                          No Published Results Found
                                        </div>
                                        <p style={{ fontSize: '13px', color: 'var(--color-slate)', maxWidth: '440px', margin: '4px auto 0 auto' }}>
                                          Results appear here once staff publishes the exam results. Check back shortly.
                                        </p>
                                      </div>
                                    );
                                  }

                                  return (
                                    <div className="table-wrapper" style={{ border: '1px solid var(--color-hairline-silver)', borderRadius: '12px', overflow: 'hidden' }}>
                                      <table className="portal-table" style={{ width: '100%' }}>
                                        <thead>
                                          <tr>
                                            <th>Exam Title & Subject</th>
                                            <th>Conducted Date</th>
                                            <th style={{ textAlign: 'center' }}>Score</th>
                                            <th style={{ textAlign: 'center' }}>Percentage</th>
                                            <th style={{ textAlign: 'center' }}>Status</th>
                                            <th style={{ textAlign: 'center' }}>Actions</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {filteredResults.map((res) => {
                                            const isAttended = res.status === 'ATTEMPTED';
                                            const pct = res.percentage || 0;
                                            const pctColor = pct >= 75 ? '#16a34a' : pct >= 50 ? '#2563eb' : pct > 0 ? '#d97706' : '#ef4444';

                                            return (
                                              <tr key={res.submissionId || res.assignmentId} style={{ borderBottom: '1px solid var(--color-hairline-silver)' }}>
                                                <td>
                                                  <div style={{ fontWeight: 600, color: 'var(--color-ink)' }}>
                                                    {res.assignmentTitle}
                                                  </div>
                                                  <span style={{ fontSize: '11.5px', color: 'var(--color-slate)' }}>
                                                    Subject: <strong>{res.subject || 'General'}</strong> • Grade {res.classStandard} {res.sectionName}
                                                  </span>
                                                </td>
                                                <td style={{ color: 'var(--color-ink)' }}>
                                                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <Calendar size={13} color="var(--color-slate)" />
                                                    {res.conductDate || 'Published'}
                                                  </span>
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                  <span style={{ fontWeight: '700', fontSize: '14px', color: isAttended ? 'var(--color-ink)' : '#ef4444' }}>
                                                    {res.score} / {res.totalMarks}
                                                  </span>
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                  <span style={{
                                                    background: pct >= 50 ? '#f0fdf4' : pct > 0 ? '#fffbeb' : '#fef2f2',
                                                    color: pctColor,
                                                    border: `1px solid ${pct >= 50 ? '#bbf7d0' : pct > 0 ? '#fde68a' : '#fecaca'}`,
                                                    padding: '3px 10px',
                                                    borderRadius: '12px',
                                                    fontSize: '12px',
                                                    fontWeight: '700'
                                                  }}>
                                                    {pct}%
                                                  </span>
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                  {isAttended ? (
                                                    <span style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '3px 10px', borderRadius: '10px', fontSize: '11.5px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                      <CheckCircle size={12} />
                                                      Attended
                                                    </span>
                                                  ) : (
                                                    <span style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', padding: '3px 10px', borderRadius: '10px', fontSize: '11.5px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                      <XCircle size={12} />
                                                      Did Not Attend (0 Marks)
                                                    </span>
                                                  )}
                                                </td>
                                                <td style={{ textAlign: 'center' }}>
                                                  {isAttended ? (
                                                    <button
                                                      onClick={() => handleReviewExam(res.assignmentId)}
                                                      style={{
                                                        background: 'var(--color-studio-mist)',
                                                        border: '1px solid var(--color-hairline-silver)',
                                                        padding: '5px 12px',
                                                        borderRadius: '8px',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        color: 'var(--color-apple-blue)',
                                                        cursor: 'pointer',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '4px'
                                                      }}
                                                    >
                                                      <Eye size={13} />
                                                      Review Answers
                                                    </button>
                                                  ) : (
                                                    <span style={{ fontSize: '11.5px', color: 'var(--color-slate)', fontStyle: 'italic' }}>
                                                      No Attempt Recorded
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
                          )}
                        </div>
                      ) : mod.id === 'module4' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                          {/* Banner Info & Cohort Identification */}
                          <div
                            style={{
                              background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
                              border: '1px solid #ddd6fe',
                              borderRadius: '16px',
                              padding: '20px 24px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              flexWrap: 'wrap',
                              gap: '16px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                              <div
                                style={{
                                  width: '44px',
                                  height: '44px',
                                  borderRadius: '12px',
                                  background: '#7c3aed',
                                  color: '#ffffff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)'
                                }}
                              >
                                <BookOpen size={22} />
                              </div>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                  <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#4c1d95', margin: 0 }}>
                                    Teacher Study Resources & Lesson Notes
                                  </h4>
                                  <span
                                    style={{
                                      fontSize: '11px',
                                      fontWeight: '700',
                                      padding: '2px 9px',
                                      borderRadius: '12px',
                                      background: '#8b5cf6',
                                      color: '#ffffff',
                                      letterSpacing: '0.3px'
                                    }}
                                  >
                                    Live Sync
                                  </span>
                                </div>
                                <p style={{ fontSize: '13px', color: '#6d28d9', margin: '4px 0 0 0' }}>
                                  Target Class: <strong>{studyCohort?.resolvedClass ? `Class ${studyCohort.resolvedClass}` : (studentClass || 'Class 10')}</strong> &bull; Section: <strong>{studyCohort?.resolvedSection || 'Section A'}</strong>
                                </p>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div
                                style={{
                                  background: 'rgba(255, 255, 255, 0.85)',
                                  border: '1px solid #ddd6fe',
                                  borderRadius: '12px',
                                  padding: '8px 16px',
                                  textAlign: 'center'
                                }}
                              >
                                <div style={{ fontSize: '18px', fontWeight: '700', color: '#6d28d9', lineHeight: 1.1 }}>
                                  {studyNotes.length}
                                </div>
                                <div style={{ fontSize: '11px', color: '#7c3aed', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                                  Notes Shared
                                </div>
                              </div>
                              <button
                                onClick={fetchStudyResources}
                                title="Refresh study notes"
                                className="btn-outlined-explore"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  background: '#ffffff',
                                  borderColor: '#c4b5fd',
                                  color: '#6d28d9',
                                  padding: '9px 14px',
                                  borderRadius: '10px',
                                  cursor: 'pointer'
                                }}
                              >
                                <RefreshCw size={14} className={studyLoading ? 'spin-anim' : ''} />
                                <span style={{ fontSize: '12.5px', fontWeight: '600' }}>Refresh</span>
                              </button>
                            </div>
                          </div>

                          {/* Filter & Search Bar */}
                          <div
                            style={{
                              background: 'var(--color-gallery-white)',
                              border: '1px solid var(--color-hairline-silver)',
                              borderRadius: '14px',
                              padding: '14px 18px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              flexWrap: 'wrap',
                              gap: '12px'
                            }}
                          >
                            {/* Search box */}
                            <div style={{ position: 'relative', flex: '1 1 260px', minWidth: '220px' }}>
                              <Search
                                size={15}
                                style={{
                                  position: 'absolute',
                                  left: '12px',
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  color: 'var(--color-slate)',
                                  pointerEvents: 'none'
                                }}
                              />
                              <input
                                type="text"
                                placeholder="Search by topic title or notes content..."
                                value={studySearchQuery}
                                onChange={(e) => setStudySearchQuery(e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '9px 12px 9px 36px',
                                  borderRadius: '10px',
                                  border: '1px solid var(--color-hairline-silver)',
                                  background: 'var(--color-snow-soft)',
                                  fontSize: '13px',
                                  outline: 'none',
                                  color: 'var(--color-ink)'
                                }}
                              />
                            </div>

                            {/* Dropdowns */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                              {/* Subject Filter (Which subject specified by teacher) */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-slate)' }}>
                                  Subject:
                                </label>
                                <select
                                  value={studySubjectFilter}
                                  onChange={(e) => setStudySubjectFilter(e.target.value)}
                                  style={{
                                    padding: '8px 12px',
                                    borderRadius: '10px',
                                    border: '1px solid var(--color-hairline-silver)',
                                    background: 'var(--color-gallery-white)',
                                    fontSize: '12.5px',
                                    color: 'var(--color-ink)',
                                    fontWeight: '500',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <option value="ALL">All Subjects ({availableStudySubjects.length || 'All'})</option>
                                  {availableStudySubjects.map((subj) => (
                                    <option key={subj} value={subj}>
                                      {subj}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Teacher Filter (Who sent notes) */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-slate)' }}>
                                  Teacher:
                                </label>
                                <select
                                  value={studyTeacherFilter}
                                  onChange={(e) => setStudyTeacherFilter(e.target.value)}
                                  style={{
                                    padding: '8px 12px',
                                    borderRadius: '10px',
                                    border: '1px solid var(--color-hairline-silver)',
                                    background: 'var(--color-gallery-white)',
                                    fontSize: '12.5px',
                                    color: 'var(--color-ink)',
                                    fontWeight: '500',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <option value="ALL">All Teachers ({availableStudyTeachers.length || 'All'})</option>
                                  {availableStudyTeachers.map((teach) => (
                                    <option key={teach} value={teach}>
                                      {teach}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {(studySubjectFilter !== 'ALL' || studyTeacherFilter !== 'ALL' || studySearchQuery) && (
                                <button
                                  onClick={() => {
                                    setStudySubjectFilter('ALL');
                                    setStudyTeacherFilter('ALL');
                                    setStudySearchQuery('');
                                  }}
                                  className="btn-outlined-explore"
                                  style={{
                                    padding: '7px 12px',
                                    fontSize: '12px',
                                    borderRadius: '8px',
                                    color: '#ef4444',
                                    borderColor: '#fca5a5'
                                  }}
                                >
                                  Reset
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Notes Cards Grid */}
                          {studyLoading && studyNotes.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--color-slate)' }}>
                              <RefreshCw size={24} className="spin-anim" style={{ margin: '0 auto 12px auto' }} />
                              <p style={{ fontSize: '14px', fontWeight: '500' }}>Loading teacher study notes...</p>
                            </div>
                          ) : studyNotes.length === 0 ? (
                            <div
                              style={{
                                textAlign: 'center',
                                padding: '52px 24px',
                                backgroundColor: 'var(--color-studio-mist)',
                                borderRadius: '18px',
                                border: '1px dashed var(--color-hairline-silver)'
                              }}
                            >
                              <div
                                style={{
                                  width: '56px',
                                  height: '56px',
                                  borderRadius: '50%',
                                  background: '#f5f3ff',
                                  color: '#7c3aed',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  margin: '0 auto 14px auto'
                                }}
                              >
                                <BookOpen size={26} />
                              </div>
                              <h4 style={{ fontSize: '17px', fontWeight: '600', color: 'var(--color-ink)' }}>
                                No Study Notes Found
                              </h4>
                              <p style={{ color: 'var(--color-slate)', fontSize: '13.5px', maxWidth: '440px', margin: '6px auto 0' }}>
                                No lesson notes matched your current filter criteria. When your teachers dispatch lesson notes for your class, they will appear here instantly.
                              </p>
                              {(studySubjectFilter !== 'ALL' || studyTeacherFilter !== 'ALL' || studySearchQuery) && (
                                <button
                                  onClick={() => {
                                    setStudySubjectFilter('ALL');
                                    setStudyTeacherFilter('ALL');
                                    setStudySearchQuery('');
                                  }}
                                  className="btn-pricing-blue"
                                  style={{ marginTop: '16px', padding: '8px 18px', fontSize: '13px' }}
                                >
                                  Clear Filters
                                </button>
                              )}
                            </div>
                          ) : (
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                                gap: '18px'
                              }}
                            >
                              {studyNotes.map((note) => {
                                const teacherInitial = note.teacherName ? note.teacherName.charAt(0).toUpperCase() : 'T';
                                return (
                                  <div
                                    key={note.id}
                                    style={{
                                      background: 'var(--color-gallery-white)',
                                      border: '1px solid var(--color-hairline-silver)',
                                      borderRadius: '16px',
                                      padding: '20px',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      justifyContent: 'space-between',
                                      gap: '16px',
                                      boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                                      transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                                    }}
                                  >
                                    <div>
                                      {/* Header: Subject Badge + Class/Section + Date & Time */}
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                          {/* Teacher-specified subject */}
                                          <span
                                            style={{
                                              fontSize: '12px',
                                              fontWeight: '700',
                                              padding: '4px 10px',
                                              borderRadius: '8px',
                                              background: '#eff6ff',
                                              color: '#1d4ed8',
                                              border: '1px solid #bfdbfe',
                                              letterSpacing: '0.2px'
                                            }}
                                          >
                                            {note.subject || 'General'}
                                          </span>
                                          <span
                                            style={{
                                              fontSize: '11px',
                                              fontWeight: '600',
                                              padding: '3px 8px',
                                              borderRadius: '6px',
                                              background: '#f1f5f9',
                                              color: '#475569',
                                              border: '1px solid #e2e8f0'
                                            }}
                                          >
                                            {note.className} &bull; Sec {note.section}
                                          </span>
                                        </div>

                                        {/* Date and Time Created */}
                                        <div
                                          style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            fontSize: '11.5px',
                                            color: 'var(--color-slate)',
                                            fontWeight: '500'
                                          }}
                                          title={`Notes Created: ${note.timeOfNotesCreated}`}
                                        >
                                          <Clock size={12} style={{ color: '#94a3b8' }} />
                                          <span>{formatStudyNoteTimestamp(note.timeOfNotesCreated)}</span>
                                        </div>
                                      </div>

                                      {/* Topic Title */}
                                      <h4
                                        style={{
                                          fontSize: '16.5px',
                                          fontWeight: '700',
                                          color: 'var(--color-ink)',
                                          margin: '0 0 10px 0',
                                          lineHeight: '1.3'
                                        }}
                                      >
                                        {note.topic || 'Untitled Lesson Notes'}
                                      </h4>

                                      {/* Teacher Attribution Box (Who sent notes) */}
                                      <div
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '10px',
                                          padding: '8px 12px',
                                          background: 'var(--color-snow-soft)',
                                          borderRadius: '10px',
                                          border: '1px solid var(--color-hairline-silver)',
                                          marginBottom: '14px'
                                        }}
                                      >
                                        <div
                                          style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            background: '#7c3aed',
                                            color: '#ffffff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '13px',
                                            fontWeight: '700',
                                            flexShrink: 0
                                          }}
                                        >
                                          {teacherInitial}
                                        </div>
                                        <div style={{ minWidth: 0, flex: 1 }}>
                                          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px', color: 'var(--color-slate)', fontWeight: '600' }}>
                                            Sent By Teacher
                                          </div>
                                          <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {note.teacherName || 'Faculty Instructor'}
                                          </div>
                                        </div>
                                        {note.teacherEmail && (
                                          <span
                                            style={{
                                              fontSize: '11px',
                                              color: 'var(--color-slate)',
                                              whiteSpace: 'nowrap',
                                              overflow: 'hidden',
                                              textOverflow: 'ellipsis',
                                              maxWidth: '140px'
                                            }}
                                            title={note.teacherEmail}
                                          >
                                            {note.teacherEmail}
                                          </span>
                                        )}
                                      </div>

                                      {/* Notes Content Preview Box */}
                                      <div
                                        style={{
                                          background: '#f8fafc',
                                          border: '1px solid #e2e8f0',
                                          borderRadius: '10px',
                                          padding: '12px 14px',
                                          fontSize: '13px',
                                          lineHeight: '1.55',
                                          color: '#334155',
                                          maxHeight: '110px',
                                          overflow: 'hidden',
                                          position: 'relative',
                                          whiteSpace: 'pre-wrap',
                                          fontFamily: 'inherit'
                                        }}
                                      >
                                        {note.notesContent || 'No written content in this note.'}
                                        {note.notesContent && note.notesContent.length > 140 && (
                                          <div
                                            style={{
                                              position: 'absolute',
                                              bottom: 0,
                                              left: 0,
                                              right: 0,
                                              height: '32px',
                                              background: 'linear-gradient(to bottom, rgba(248, 250, 252, 0), rgba(248, 250, 252, 1))'
                                            }}
                                          />
                                        )}
                                      </div>
                                    </div>

                                    {/* Actions: Read Full Notes + Copy Button */}
                                    <div
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: '10px',
                                        paddingTop: '12px',
                                        borderTop: '1px solid var(--color-hairline-silver)'
                                      }}
                                    >
                                      <button
                                        onClick={() => setSelectedStudyNoteDetail(note)}
                                        className="btn-pricing-blue"
                                        style={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '6px',
                                          fontSize: '12.5px',
                                          padding: '7px 14px',
                                          borderRadius: '8px'
                                        }}
                                      >
                                        <Eye size={14} />
                                        <span>Read Full Notes</span>
                                      </button>

                                      <button
                                        onClick={() => handleCopyNoteContent(note)}
                                        className="btn-outlined-explore"
                                        style={{
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '6px',
                                          fontSize: '12px',
                                          padding: '7px 12px',
                                          borderRadius: '8px'
                                        }}
                                      >
                                        {copiedNoteId === note.id ? (
                                          <>
                                            <Check size={13} style={{ color: '#16a34a' }} />
                                            <span style={{ color: '#16a34a', fontWeight: '600' }}>Copied!</span>
                                          </>
                                        ) : (
                                          <>
                                            <FileText size={13} />
                                            <span>Copy Text</span>
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
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

      {/* MODAL 1: ATTEMPT EXAM MODAL */}
      {activeExamPaper && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--color-gallery-white)',
            border: '1px solid var(--color-hairline-silver)',
            borderRadius: '24px',
            maxWidth: '780px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--color-hairline-silver)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, rgba(239, 246, 255, 0.9) 0%, rgba(243, 232, 255, 0.5) 100%)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ background: '#2563eb', color: '#fff', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px' }}>
                    {activeExamPaper.subject || 'Exam'}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--color-slate)', fontWeight: '600' }}>
                    Grade {activeExamPaper.classStandard} - {activeExamPaper.sectionName}
                  </span>
                </div>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: '700', color: 'var(--color-ink)' }}>
                  {activeExamPaper.assignmentTitle}
                </h3>
              </div>
              {!examSubmitSummary && (
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to exit the exam? Your progress will be lost.')) {
                      setActiveExamPaper(null);
                    }
                  }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-slate)', padding: '6px' }}
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              {examSubmitSummary ? (
                /* Submission Confirmation View */
                <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: '#f0fdf4',
                    color: '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px auto',
                    border: '2px solid #bbf7d0'
                  }}>
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: 'var(--color-ink)' }}>
                    Examination Submitted Successfully!
                  </h3>
                  <p style={{ color: 'var(--color-slate)', fontSize: '14px', maxWidth: '480px', margin: '8px auto 20px auto' }}>
                    Your answers have been graded and recorded in your database records. Official scores will display in your Examination History once staff releases results.
                  </p>

                  <div style={{
                    background: 'var(--color-studio-mist)',
                    border: '1px solid var(--color-hairline-silver)',
                    borderRadius: '16px',
                    padding: '20px',
                    maxWidth: '420px',
                    margin: '0 auto 24px auto',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '12px'
                  }}>
                    <div>
                      <span style={{ fontSize: '11.5px', color: 'var(--color-slate)' }}>Total Questions</span>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-ink)', marginTop: '2px' }}>
                        {examSubmitSummary.totalQuestions}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '11.5px', color: 'var(--color-slate)' }}>Your Score</span>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: '#16a34a', marginTop: '2px' }}>
                        {examSubmitSummary.score} / {examSubmitSummary.totalMarks}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '11.5px', color: 'var(--color-slate)' }}>Percentage</span>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: '#2563eb', marginTop: '2px' }}>
                        {examSubmitSummary.percentage}%
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setActiveExamPaper(null);
                      setExamSubmitSummary(null);
                      setExamActiveSubTab('results');
                    }}
                    className="btn-pricing-blue"
                    style={{ padding: '10px 28px', fontSize: '14px' }}
                  >
                    Done & View History
                  </button>
                </div>
              ) : (
                /* Question Paper Stepper View */
                <div>
                  {(() => {
                    const questions = activeExamPaper.questions || [];
                    const currQ = questions[activeExamQIndex] || {};
                    const qNumKey = String(currQ.questionNumber || (activeExamQIndex + 1));
                    const currentAnswer = studentAnswers[qNumKey] || '';
                    const answeredTotal = Object.keys(studentAnswers).length;
                    const progressPct = questions.length > 0 ? Math.round(((activeExamQIndex + 1) / questions.length) * 100) : 0;

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Progress Header */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-ink)' }}>
                              Question {activeExamQIndex + 1} of {questions.length}
                            </span>
                            <span style={{ fontSize: '12px', color: 'var(--color-slate)', fontWeight: '600' }}>
                              {answeredTotal} of {questions.length} Answered
                            </span>
                          </div>
                          <div style={{ width: '100%', height: '6px', background: 'var(--color-control-gray)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${progressPct}%`, height: '100%', background: '#2563eb', transition: 'width 0.3s ease' }} />
                          </div>
                        </div>

                        {/* Question Prompt */}
                        <div style={{ background: 'var(--color-paper-frost)', border: '1px solid var(--color-hairline-silver)', borderRadius: '16px', padding: '20px' }}>
                          <div style={{ fontSize: '12px', fontWeight: '700', color: '#2563eb', marginBottom: '6px' }}>
                            QUESTION {currQ.questionNumber || (activeExamQIndex + 1)}
                          </div>
                          <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--color-ink)', lineHeight: '1.5' }}>
                            {currQ.questionText}
                          </div>
                        </div>

                        {/* MCQ Options A, B, C, D */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {[
                            { key: 'A', text: currQ.optionA },
                            { key: 'B', text: currQ.optionB },
                            { key: 'C', text: currQ.optionC },
                            { key: 'D', text: currQ.optionD }
                          ].map((opt) => {
                            if (!opt.text) return null;
                            const isSelected = currentAnswer === opt.key;

                            return (
                              <div
                                key={opt.key}
                                onClick={() => {
                                  setStudentAnswers(prev => ({
                                    ...prev,
                                    [qNumKey]: opt.key
                                  }));
                                }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '14px',
                                  padding: '14px 18px',
                                  borderRadius: '14px',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                  border: isSelected ? '2px solid #2563eb' : '1px solid var(--color-hairline-silver)',
                                  background: isSelected ? 'rgba(37,99,235,0.06)' : 'var(--color-gallery-white)'
                                }}
                              >
                                <div style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '13px',
                                  fontWeight: '700',
                                  border: isSelected ? '2px solid #2563eb' : '2px solid var(--color-hairline-silver)',
                                  background: isSelected ? '#2563eb' : 'transparent',
                                  color: isSelected ? '#fff' : 'var(--color-slate)'
                                }}>
                                  {opt.key}
                                </div>
                                <div style={{ fontSize: '14.5px', color: 'var(--color-ink)', fontWeight: isSelected ? '600' : '400', flex: 1 }}>
                                  {opt.text}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Question Navigator Pills */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '10px', borderTop: '1px solid var(--color-hairline-silver)' }}>
                          <span style={{ fontSize: '12px', color: 'var(--color-slate)', fontWeight: '600' }}>Jump to:</span>
                          {questions.map((q, idx) => {
                            const qKey = String(q.questionNumber || (idx + 1));
                            const isAns = !!studentAnswers[qKey];
                            const isCurr = idx === activeExamQIndex;

                            return (
                              <button
                                key={idx}
                                onClick={() => setActiveExamQIndex(idx)}
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '8px',
                                  border: isCurr ? '2px solid #2563eb' : '1px solid var(--color-hairline-silver)',
                                  background: isCurr ? '#2563eb' : isAns ? '#dbeafe' : 'var(--color-studio-mist)',
                                  color: isCurr ? '#fff' : isAns ? '#1d4ed8' : 'var(--color-slate)',
                                  fontWeight: '700',
                                  fontSize: '12px',
                                  cursor: 'pointer'
                                }}
                              >
                                {idx + 1}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            {!examSubmitSummary && (
              <div style={{
                padding: '16px 24px',
                borderTop: '1px solid var(--color-hairline-silver)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--color-paper-frost)'
              }}>
                <button
                  onClick={() => setActiveExamQIndex(prev => Math.max(0, prev - 1))}
                  disabled={activeExamQIndex === 0}
                  className="btn-outlined-explore"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', opacity: activeExamQIndex === 0 ? 0.5 : 1 }}
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                <div style={{ display: 'flex', gap: '10px' }}>
                  {activeExamQIndex < (activeExamPaper.questions ? activeExamPaper.questions.length - 1 : 0) ? (
                    <button
                      onClick={() => setActiveExamQIndex(prev => prev + 1)}
                      className="btn-pricing-blue"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      Next Question
                      <ChevronRight size={16} />
                    </button>
                  ) : null}

                  <button
                    onClick={handleSubmitExam}
                    disabled={isSubmittingExam}
                    style={{
                      background: 'linear-gradient(135deg, #16a34a, #15803d)',
                      color: '#fff',
                      border: 'none',
                      padding: '9px 20px',
                      borderRadius: '12px',
                      fontSize: '13.5px',
                      fontWeight: '700',
                      cursor: isSubmittingExam ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 8px rgba(22,163,74,0.3)'
                    }}
                  >
                    <CheckCircle size={15} />
                    {isSubmittingExam ? 'Submitting...' : `Submit Exam (${Object.keys(studentAnswers).length}/${activeExamPaper.questions ? activeExamPaper.questions.length : 0})`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: EXAM REVIEW MODAL */}
      {examReviewData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--color-gallery-white)',
            border: '1px solid var(--color-hairline-silver)',
            borderRadius: '24px',
            maxWidth: '820px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--color-hairline-silver)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ background: '#16a34a', color: '#fff', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px' }}>
                    {examReviewData.subject || 'Review'}
                  </span>
                  <span style={{ fontSize: '12.5px', color: '#15803d', fontWeight: '700' }}>
                    Final Score: {examReviewData.score} / {examReviewData.totalMarks} ({examReviewData.percentage}%)
                  </span>
                </div>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: '700', color: 'var(--color-ink)' }}>
                  {examReviewData.assignmentTitle} – Answer Breakdown
                </h3>
              </div>
              <button
                onClick={() => setExamReviewData(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-slate)', padding: '6px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Review Body */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {(examReviewData.questions || []).map((q, idx) => {
                const isCorrect = q.correctOption && q.studentAnswer && q.correctOption.trim().toUpperCase() === q.studentAnswer.trim().toUpperCase();

                return (
                  <div
                    key={idx}
                    style={{
                      background: isCorrect ? 'rgba(240,253,244,0.5)' : 'rgba(254,242,242,0.5)',
                      border: isCorrect ? '1px solid #bbf7d0' : '1px solid #fecaca',
                      borderRadius: '16px',
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--color-ink)' }}>
                        Question {q.questionNumber || (idx + 1)}: {q.questionText}
                      </div>
                      <span style={{
                        background: isCorrect ? '#f0fdf4' : '#fef2f2',
                        color: isCorrect ? '#16a34a' : '#ef4444',
                        border: `1px solid ${isCorrect ? '#bbf7d0' : '#fecaca'}`,
                        padding: '2px 8px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: '700'
                      }}>
                        {isCorrect ? '+1.0 Mark' : '0.0 Mark'}
                      </span>
                    </div>

                    {/* Options Breakdown */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {[
                        { key: 'A', text: q.optionA },
                        { key: 'B', text: q.optionB },
                        { key: 'C', text: q.optionC },
                        { key: 'D', text: q.optionD }
                      ].map((opt) => {
                        if (!opt.text) return null;
                        const isUserPick = q.studentAnswer === opt.key;
                        const isCorrectKey = q.correctOption === opt.key;

                        let optBg = 'var(--color-gallery-white)';
                        let optBorder = 'var(--color-hairline-silver)';
                        let optColor = 'var(--color-ink)';

                        if (isCorrectKey) {
                          optBg = '#f0fdf4';
                          optBorder = '#86efac';
                          optColor = '#15803d';
                        } else if (isUserPick && !isCorrectKey) {
                          optBg = '#fef2f2';
                          optBorder = '#fca5a5';
                          optColor = '#b91c1c';
                        }

                        return (
                          <div
                            key={opt.key}
                            style={{
                              padding: '10px 14px',
                              borderRadius: '10px',
                              border: `1px solid ${optBorder}`,
                              background: optBg,
                              color: optColor,
                              fontSize: '13px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '8px'
                            }}
                          >
                            <span>
                              <strong>({opt.key})</strong> {opt.text}
                            </span>
                            {isCorrectKey && (
                              <span style={{ fontSize: '11px', fontWeight: '700', color: '#16a34a' }}>✓ Correct</span>
                            )}
                            {isUserPick && !isCorrectKey && (
                              <span style={{ fontSize: '11px', fontWeight: '700', color: '#ef4444' }}>✗ Your Choice</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-hairline-silver)', textAlign: 'right', background: 'var(--color-paper-frost)' }}>
              <button
                onClick={() => setExamReviewData(null)}
                className="btn-pricing-blue"
                style={{ padding: '8px 24px', fontSize: '13px' }}
              >
                Close Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: READ FULL STUDY NOTE MODAL */}
      {selectedStudyNoteDetail && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div
            style={{
              background: 'var(--color-gallery-white)',
              border: '1px solid var(--color-hairline-silver)',
              borderRadius: '24px',
              maxWidth: '720px',
              width: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--color-hairline-silver)',
                background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '16px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: '700',
                      padding: '3px 10px',
                      borderRadius: '8px',
                      background: '#7c3aed',
                      color: '#ffffff'
                    }}
                  >
                    {selectedStudyNoteDetail.subject}
                  </span>
                  <span
                    style={{
                      fontSize: '11.5px',
                      fontWeight: '600',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: '#ffffff',
                      color: '#6d28d9',
                      border: '1px solid #ddd6fe'
                    }}
                  >
                    {selectedStudyNoteDetail.className} &bull; Section {selectedStudyNoteDetail.section}
                  </span>
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-ink)', margin: '0 0 6px 0', lineHeight: 1.3 }}>
                  {selectedStudyNoteDetail.topic || 'Lesson Notes'}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px', color: '#6d28d9', flexWrap: 'wrap' }}>
                  <span>
                    Sent by: <strong>{selectedStudyNoteDetail.teacherName}</strong>
                    {selectedStudyNoteDetail.teacherEmail ? ` (${selectedStudyNoteDetail.teacherEmail})` : ''}
                  </span>
                  <span>&bull;</span>
                  <span>
                    Created: <strong>{formatStudyNoteTimestamp(selectedStudyNoteDetail.timeOfNotesCreated)}</strong>
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudyNoteDetail(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '34px',
                  height: '34px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--color-slate)',
                  flexShrink: 0
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body: Complete Notes Content */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '20px',
                  fontSize: '14px',
                  lineHeight: '1.7',
                  color: 'var(--color-ink)',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'inherit',
                  minHeight: '180px'
                }}
              >
                {selectedStudyNoteDetail.notesContent}
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid var(--color-hairline-silver)',
                background: 'var(--color-paper-frost)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <button
                onClick={() => handleCopyNoteContent(selectedStudyNoteDetail)}
                className="btn-outlined-explore"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  padding: '8px 16px',
                  borderRadius: '10px'
                }}
              >
                {copiedNoteId === selectedStudyNoteDetail.id ? (
                  <>
                    <Check size={14} style={{ color: '#16a34a' }} />
                    <span style={{ color: '#16a34a', fontWeight: '600' }}>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <FileText size={14} />
                    <span>Copy Full Notes</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setSelectedStudyNoteDetail(null)}
                className="btn-pricing-blue"
                style={{ padding: '8px 24px', fontSize: '13px' }}
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
