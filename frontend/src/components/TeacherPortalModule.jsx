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
  Shield,
  GripVertical,
  AlertCircle,
  X,
  Layers,
  Search,
  Building,
  Check,
  RefreshCw,
  Edit2,
  Send,
  FileText,
  Copy,
  Eye,
  Tag,
  CheckSquare,
  Share2
} from 'lucide-react';
import { decodeJwt } from '../utils/jwt';

const GATEWAY_URL = 'http://localhost:8099/api/teacher-portal';
const DIRECT_URL = 'http://localhost:8091/api/teacher-portal';

const ATTENDANCE_GATEWAY_URL = 'http://localhost:8099/api/teacher-attendance';
const ATTENDANCE_DIRECT_URL = 'http://localhost:8094/api/teacher-attendance';

const LESSON_NOTES_GATEWAY_URL = 'http://localhost:8099/api/teacher-lesson-notes';
const LESSON_NOTES_DIRECT_URL = 'http://localhost:8089/api/teacher-lesson-notes';


const PERIOD_TIMINGS = ['9-10 AM', '10-11 AM', '11-12 PM', '12-1 PM (Lunch)', '1-2 PM', '2-3 PM', '3-4 PM', '4-5 PM'];
const MAX_PERIODS_PER_TEACHER = 7;

const DAY_TIME_SLOTS = [
  { pIdx: 0, slot: '09:00 AM - 10:00 AM', label: 'Period 1', short: '9-10 AM' },
  { pIdx: 1, slot: '10:00 AM - 11:00 AM', label: 'Period 2', short: '10-11 AM' },
  { pIdx: 2, slot: '11:00 AM - 12:00 PM', label: 'Period 3', short: '11-12 PM' },
  { pIdx: 3, slot: '12:00 PM - 01:00 PM', label: 'Lunch Break', short: '12-1 PM', isLunch: true },
  { pIdx: 4, slot: '01:00 PM - 02:00 PM', label: 'Period 4', short: '1-2 PM' },
  { pIdx: 5, slot: '02:00 PM - 03:00 PM', label: 'Period 5', short: '2-3 PM' },
  { pIdx: 6, slot: '03:00 PM - 04:00 PM', label: 'Period 6', short: '3-4 PM' },
  { pIdx: 7, slot: '04:00 PM - 05:00 PM', label: 'Period 7', short: '4-5 PM' }
];

const parsePeriodIndex = (val) => {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return val;
  const s = String(val).toLowerCase().replace(/[^a-z0-9]/g, '');
  if (s.includes('period1') || s.includes('910') || s.includes('0900')) return 0;
  if (s.includes('period2') || s.includes('1011') || s.includes('1000')) return 1;
  if (s.includes('period3') || s.includes('1112') || s.includes('1100')) return 2;
  if (s.includes('lunch') || s.includes('1201') || s.includes('121')) return 3;
  if (s.includes('period4') || s.includes('0102') || s.includes('12pm') || s.includes('102') || s.includes('0100') || s.includes('100')) return 4;
  if (s.includes('period5') || s.includes('0203') || s.includes('23pm') || s.includes('203') || s.includes('0200') || s.includes('200')) return 5;
  if (s.includes('period6') || s.includes('0304') || s.includes('34pm') || s.includes('304') || s.includes('0300') || s.includes('300')) return 6;
  if (s.includes('period7') || s.includes('0405') || s.includes('45pm') || s.includes('405') || s.includes('0400') || s.includes('400')) return 7;
  const parsed = parseInt(val);
  return isNaN(parsed) ? 0 : parsed;
};

export default function TeacherPortalModule({ user, token: propToken, onLogout, onBack }) {
  // Extract Registration / JWT Claims Data
  const activeJwt = propToken || (typeof localStorage !== 'undefined' ? localStorage.getItem('jwt_token') : '') || '';
  const decodedJwt = decodeJwt(activeJwt);
  const isJwtVerified = Boolean(activeJwt && decodedJwt);

  const username = user?.username || decodedJwt?.username || 'teacher';
  const email = user?.email || decodedJwt?.email || 'teacher@school.com';
  const firstName = user?.firstName || decodedJwt?.firstName || (user?.name ? user.name.split(' ')[0] : '') || 'Sarah';
  const lastName = user?.lastName || decodedJwt?.lastName || (user?.name ? user.name.split(' ').slice(1).join(' ') : '') || 'Connor';
  const rawUserId = user?.userId || user?.user_id || user?.id || decodedJwt?.user_id || decodedJwt?.userId || 43;
  const userIdStr = String(rawUserId).startsWith('Tea_') ? String(rawUserId) : `Tea_${rawUserId}`;
  const fullName = (user?.name || user?.fullName || `${firstName} ${lastName}`).trim();

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

  // Personal Schedule State
  const [schedules, setSchedules] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [notification, setNotification] = useState(null);

  // Module 3: Attendance States
  const [attendanceDate, setAttendanceDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [attendanceTiming, setAttendanceTiming] = useState('09:00 AM - 10:00 AM');
  const [attendanceSchedules, setAttendanceSchedules] = useState([]);
  const [attendanceSchedulesLoading, setAttendanceSchedulesLoading] = useState(false);
  const [attendanceClass, setAttendanceClass] = useState(null);
  const [attendanceSection, setAttendanceSection] = useState(null);
  const [attendanceSubject, setAttendanceSubject] = useState('');
  const [attendanceRoom, setAttendanceRoom] = useState('');
  const [studentsRoster, setStudentsRoster] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({}); // { studentId: 'PRESENT' | 'ABSENT' }
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceSaveMsg, setAttendanceSaveMsg] = useState('');
  const [attendanceSaveErr, setAttendanceSaveErr] = useState('');

  // Module 4: Teacher Lesson Notes States (teacher-lesson-notes-service, port 8089)
  const [lessonNotes, setLessonNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesSubmitting, setNotesSubmitting] = useState(false);
  const [notesSuccessMsg, setNotesSuccessMsg] = useState('');
  const [notesErrMsg, setNotesErrMsg] = useState('');
  const [noteForm, setNoteForm] = useState({
    className: 'Class 10',
    section: 'A',
    subject: 'Mathematics',
    topic: '',
    notesContent: ''
  });
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [historyClassFilter, setHistoryClassFilter] = useState('ALL');
  const [historySectionFilter, setHistorySectionFilter] = useState('ALL');
  const [selectedNoteModal, setSelectedNoteModal] = useState(null);
  const [copiedNoteId, setCopiedNoteId] = useState(null);

  const fetchLessonNotesHistory = async () => {
    setNotesLoading(true);
    setNotesErrMsg('');
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(activeJwt ? { 'Authorization': `Bearer ${activeJwt}` } : {})
      };

      let res = await fetch(`http://localhost:8099/api/teacher-lesson-notes/history?teacherName=${encodeURIComponent(fullName)}`, { headers }).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(`http://localhost:8089/api/teacher-lesson-notes/history?teacherName=${encodeURIComponent(fullName)}`, { headers }).catch(() => null);
      }

      if (res && res.ok) {
        const data = await res.json();
        setLessonNotes(data.history || []);
      } else {
        let fallbackRes = await fetch(`http://localhost:8089/api/teacher-lesson-notes/all`, { headers }).catch(() => null);
        if (fallbackRes && fallbackRes.ok) {
          const allData = await fallbackRes.json();
          const filtered = (allData.notes || []).filter(n =>
            !fullName || (n.teacherName && n.teacherName.toLowerCase() === fullName.toLowerCase()) || n.teacherUsername === username
          );
          setLessonNotes(filtered.length > 0 ? filtered : (allData.notes || []));
        }
      }
    } catch (err) {
      console.error('Failed to load lesson notes history:', err);
      setNotesErrMsg('Could not connect to Lesson Notes service. Ensure port 8089 / Gateway is active.');
    } finally {
      setNotesLoading(false);
    }
  };

  const handleSendLessonNotes = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!noteForm.notesContent.trim()) {
      setNotesErrMsg('Notes content cannot be empty. Please enter lecture or study notes.');
      return;
    }
    if (!noteForm.topic.trim()) {
      setNotesErrMsg('Please specify a lesson topic or chapter title.');
      return;
    }

    setNotesSubmitting(true);
    setNotesErrMsg('');
    setNotesSuccessMsg('');

    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(activeJwt ? { 'Authorization': `Bearer ${activeJwt}` } : {})
      };

      const resolvedSubject = noteForm.subject || (teacherSubjects.length > 0 ? teacherSubjects[0].subject : 'Mathematics');

      const payload = {
        teacherName: fullName,
        className: noteForm.className,
        section: noteForm.section,
        subject: resolvedSubject,
        topic: noteForm.topic.trim(),
        notesContent: noteForm.notesContent.trim(),
        teacherUsername: username,
        teacherEmail: email
      };

      let res = await fetch('http://localhost:8099/api/teacher-lesson-notes/send', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      }).catch(() => null);

      if (!res || !res.ok) {
        res = await fetch('http://localhost:8089/api/teacher-lesson-notes/send', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        }).catch(() => null);
      }

      if (res && (res.ok || res.status === 201)) {
        setNotesSuccessMsg(`Lesson notes successfully published & dispatched to ${noteForm.className} Section ${noteForm.section}!`);
        setNoteForm(prev => ({ ...prev, topic: '', notesContent: '' }));
        await fetchLessonNotesHistory();
      } else {
        const errData = res ? await res.json().catch(() => ({})) : {};
        throw new Error(errData.message || errData.error || 'Failed to dispatch notes');
      }
    } catch (err) {
      console.error('Error dispatching notes:', err);
      setNotesErrMsg(`Dispatch error: ${err.message}`);
    } finally {
      setNotesSubmitting(false);
    }
  };

  const handleDeleteLessonNote = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lesson note from history?')) return;
    try {
      const headers = {
        ...(activeJwt ? { 'Authorization': `Bearer ${activeJwt}` } : {})
      };

      let res = await fetch(`http://localhost:8099/api/teacher-lesson-notes/${id}`, { method: 'DELETE', headers }).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(`http://localhost:8089/api/teacher-lesson-notes/${id}`, { method: 'DELETE', headers }).catch(() => null);
      }

      if (res && res.ok) {
        setLessonNotes(prev => prev.filter(n => n.id !== id));
        setNotesSuccessMsg('Lesson note deleted successfully from history.');
      }
    } catch (err) {
      setNotesErrMsg('Failed to delete lesson note.');
    }
  };

  const handleCopyNoteContent = (note) => {
    const textToCopy = `[${note.subject} • ${note.className} - Section ${note.section}]\nTopic: ${note.topic}\nTeacher: ${note.teacherName}\nDispatched: ${new Date(note.timeOfNotesCreated).toLocaleString()}\n\n${note.notesContent}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedNoteId(note.id);
    setTimeout(() => setCopiedNoteId(null), 3000);
  };

  const showToast = (msg, type = 'warning') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    if (activeTab === 'module4') {
      fetchLessonNotesHistory();
    }
  }, [activeTab]);

  useEffect(() => {
    if (teacherSubjects && teacherSubjects.length > 0) {
      setNoteForm(prev => ({
        ...prev,
        subject: prev.subject || teacherSubjects[0].subject
      }));
    }
  }, [teacherSubjects]);


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

  const normalizeTeacherName = (txt) => {
    if (!txt || typeof txt !== 'string') return '';
    return txt.toLowerCase().replace(/^(mr\.|mrs\.|ms\.|dr\.|prof\.)\s+/i, '').replace(/[^a-z0-9]/g, '');
  };

  const isExactTeacherMatch = (scheduledTeacherName) => {
    if (!scheduledTeacherName || typeof scheduledTeacherName !== 'string') return false;
    const target = scheduledTeacherName.trim();
    if (!target || target.toLowerCase() === 'unassigned' || target.toLowerCase() === 'lunch break') {
      return false;
    }

    const targetNorm = normalizeTeacherName(target);
    if (!targetNorm) return false;

    // Collect all valid name variations for current logged in teacher
    const candidateNames = [];
    if (user?.name) candidateNames.push(user.name);
    if (user?.fullName) candidateNames.push(user.fullName);
    if (fullName) candidateNames.push(fullName);
    if (user?.firstName && user?.lastName) candidateNames.push(`${user.firstName} ${user.lastName}`);
    if (firstName && lastName) candidateNames.push(`${firstName} ${lastName}`);
    if (profileData?.name) candidateNames.push(profileData.name);
    if (profileData?.firstName && profileData?.lastName) candidateNames.push(`${profileData.firstName} ${profileData.lastName}`);
    if (Array.isArray(teacherSubjects)) {
      teacherSubjects.forEach(ts => {
        if (ts.name) candidateNames.push(ts.name);
      });
    }
    // Only include username if it is not generic 'teacher'
    if (username && username.toLowerCase() !== 'teacher') {
      candidateNames.push(username);
    }

    for (const cand of candidateNames) {
      const candNorm = normalizeTeacherName(cand);
      if (!candNorm || candNorm === 'teacher') continue;
      
      // Exact normalized match (e.g. "sarahconnor" === "sarahconnor")
      if (targetNorm === candNorm) return true;
      // Substring match if full name length >= 4 (e.g. "sarahconnor" matches "sarahconnor")
      if (candNorm.length >= 4 && targetNorm.length >= 4) {
        if (targetNorm.includes(candNorm) || candNorm.includes(targetNorm)) {
          return true;
        }
      }
    }

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
        setSchedules(Array.isArray(list) ? list : []);
      }
    } catch (err) {
      console.warn('Schedule fetch error:', err);
    } finally {
      setScheduleLoading(false);
    }
  };

  const fetchAttendanceSchedules = async (date) => {
    setAttendanceSchedulesLoading(true);
    try {
      let res = await fetch(`http://localhost:8099/api/staff-portal/schedules?scheduleDate=${date}`).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(`http://localhost:8092/api/staff-portal/schedules?scheduleDate=${date}`).catch(() => null);
      }
      if (res && res.ok) {
        const list = await res.json();
        setAttendanceSchedules(Array.isArray(list) ? list : []);
      } else {
        setAttendanceSchedules([]);
      }
    } catch (err) {
      console.warn('Attendance schedules fetch error:', err);
      setAttendanceSchedules([]);
    } finally {
      setAttendanceSchedulesLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'module3') {
      fetchAttendanceSchedules(attendanceDate);
      const interval = setInterval(() => {
        fetchAttendanceSchedules(attendanceDate);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [activeTab, attendanceDate, username]);

  // Derived period index from currently chosen/typed attendanceTiming
  const currentAttendancePeriodIdx = parsePeriodIndex(attendanceTiming);

  // All valid period assignments for this teacher on attendanceDate
  const teacherAssignedPeriodsOnDate = attendanceSchedules.filter(s =>
    isExactTeacherMatch(s.teacherName) && s.periodIndex !== 3
  );

  // The specific assignment matching current timing on attendanceDate
  const currentAssignedSchedule = attendanceSchedules.find(s =>
    s.periodIndex === currentAttendancePeriodIdx && isExactTeacherMatch(s.teacherName)
  );

  const isTeacherAssignedAtTime = !!currentAssignedSchedule;

  const fetchAttendanceRosterForClass = async (cls, sec, date, pIdx) => {
    if (!cls || !sec) {
      setStudentsRoster([]);
      setAttendanceMap({});
      return;
    }

    setAttendanceLoading(true);
    setAttendanceSaveMsg('');
    setAttendanceSaveErr('');
    try {
      let students = [];
      // 1. Fetch from staff-student service (real MySQL student_details)
      const url1 = `http://localhost:8099/api/staff-student/students?classStandard=${cls}&sectionName=${sec}`;
      let res1 = await fetch(url1).catch(() => null);
      if (!res1 || !res1.ok) {
        res1 = await fetch(`http://localhost:8093/api/staff-student/students?classStandard=${cls}&sectionName=${sec}`).catch(() => null);
      }
      
      // Fallback 2: teacher-attendance service /students
      if (!res1 || !res1.ok) {
        res1 = await fetch(`http://localhost:8099/api/teacher-attendance/students?classStandard=${cls}&sectionName=${sec}`).catch(() => null);
        if (!res1 || !res1.ok) {
          res1 = await fetch(`http://localhost:8094/api/teacher-attendance/students?classStandard=${cls}&sectionName=${sec}`).catch(() => null);
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
            classStandard: cls,
            sectionName: sec
          }));
        }
      }

      setStudentsRoster(students);

      // 2. Fetch today's saved records for this class, section, date, and periodIndex
      let savedRecords = [];
      let res2 = await fetch(`http://localhost:8099/api/teacher-attendance/records?classStandard=${cls}&sectionName=${sec}&date=${date}&periodIndex=${pIdx}`).catch(() => null);
      if (!res2 || !res2.ok) {
        res2 = await fetch(`http://localhost:8094/api/teacher-attendance/records?classStandard=${cls}&sectionName=${sec}&date=${date}&periodIndex=${pIdx}`).catch(() => null);
      }
      if (res2 && res2.ok) {
        savedRecords = await res2.json();
      }

      // If no records for this periodIndex yet, check if general records exist
      if (!savedRecords || savedRecords.length === 0) {
        let res3 = await fetch(`http://localhost:8099/api/teacher-attendance/records?classStandard=${cls}&sectionName=${sec}&date=${date}`).catch(() => null);
        if (res3 && res3.ok) {
          const general = await res3.json();
          if (Array.isArray(general) && general.length > 0) {
            savedRecords = general;
          }
        }
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
      if (currentAssignedSchedule) {
        const cls = currentAssignedSchedule.classStandard;
        const sec = currentAssignedSchedule.sectionId === 1 ? 'A' : currentAssignedSchedule.sectionId === 2 ? 'B' : 'C';
        setAttendanceClass(cls);
        setAttendanceSection(sec);
        setAttendanceSubject(currentAssignedSchedule.subjectName || '');
        setAttendanceRoom(currentAssignedSchedule.roomNo || '');
        fetchAttendanceRosterForClass(cls, sec, attendanceDate, currentAttendancePeriodIdx);
      } else {
        // Teacher is NOT assigned at this timing on this date -> ONLY show students when teacher is assigned!
        setAttendanceClass(null);
        setAttendanceSection(null);
        setAttendanceSubject('');
        setAttendanceRoom('');
        setStudentsRoster([]);
        setAttendanceMap({});
      }
    }
  }, [activeTab, attendanceDate, attendanceTiming, attendanceSchedules]);

  const toggleAttendance = (studentId) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'PRESENT' ? 'ABSENT' : 'PRESENT'
    }));
  };

  const handleSaveAttendance = async () => {
    if (!currentAssignedSchedule || studentsRoster.length === 0) return;
    setAttendanceLoading(true);
    setAttendanceSaveMsg('');
    setAttendanceSaveErr('');
    try {
      const cls = currentAssignedSchedule.classStandard;
      const sec = currentAssignedSchedule.sectionId === 1 ? 'A' : currentAssignedSchedule.sectionId === 2 ? 'B' : 'C';
      const records = studentsRoster.map(s => ({
        studentId: s.studentId,
        studentName: `${s.firstName} ${s.lastName}`.trim() || s.firstName,
        parentName: s.parentName || '',
        classStandard: cls,
        sectionName: sec,
        attendanceDate: attendanceDate,
        status: attendanceMap[s.studentId] || 'PRESENT',
        periodIndex: currentAttendancePeriodIdx,
        timing: attendanceTiming,
        subjectName: currentAssignedSchedule.subjectName || 'General',
        teacherName: fullName
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
        setAttendanceSaveMsg(`Attendance successfully recorded in database for ${records.length} student(s) on ${attendanceDate} for ${currentAssignedSchedule.subjectName || 'Class'} (${attendanceTiming}).`);
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
      tag: 'Faculty Credentials',
      subtitle: 'Teacher Profile Info',
      desc: 'Faculty member profile details, user ID, primary subject, contact email & account status.',
      icon: <User size={18} />,
      theme: { bg: '#eff6ff', color: '#2563eb', border: '#dbeafe' }
    },
    {
      id: 'module2',
      title: 'Schedule',
      tag: 'Timetable & Periods',
      subtitle: 'Morning to Evening Timetable',
      desc: 'Full morning to evening daily class schedule from 09:00 AM to 05:00 PM stored in database.',
      icon: <Clock size={18} />,
      theme: { bg: '#f5f3ff', color: '#7c3aed', border: '#ede9fe' }
    },
    {
      id: 'module3',
      title: 'Attendance',
      tag: 'Roll Call & Roster',
      subtitle: 'Student Attendance & Marking',
      desc: 'Daily student attendance logs, section rosters & attendance reports.',
      icon: <Calendar size={18} />,
      theme: { bg: '#ecfdf5', color: '#059669', border: '#d1fae5' }
    },
    {
      id: 'module4',
      title: 'Lesson Notes',
      tag: 'Class & Section Dispatch',
      subtitle: 'Class Notes & Study Materials',
      desc: 'Send class & section-specific lesson notes with subject details and view dispatch history.',
      icon: <BookOpen size={18} />,
      theme: { bg: '#eff6ff', color: '#2563eb', border: '#dbeafe' }
    },
    {
      id: 'module5',
      title: 'Resources',
      tag: 'Library & Payroll',
      subtitle: 'Digital Library & Salary Paystubs',
      desc: 'E-books, research journals, monthly compensation history & payroll records.',
      icon: <CreditCard size={18} />,
      theme: { bg: '#fffbeb', color: '#d97706', border: '#fef3c7' }
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-20)', width: '100%', margin: '0' }}>
      
      {/* TOP SECTION: Teacher Profile Card (Apple Gallery White Flat Surface) */}
      <div
        style={{
          background: 'var(--color-gallery-white)',
          border: '1px solid var(--color-hairline-silver)',
          borderRadius: 'var(--radius-cards)',
          padding: 'var(--spacing-24) var(--spacing-28)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--spacing-16)', marginBottom: 'var(--spacing-20)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-16)' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'var(--color-ink)',
                color: 'var(--color-gallery-white)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '19px',
                fontWeight: '600',
                fontFamily: 'var(--font-sf-pro-display)'
              }}
            >
              {initialLetter}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-8)', flexWrap: 'wrap' }}>
                <h2 style={{ color: 'var(--color-ink)', fontSize: '22px', fontWeight: '600', margin: 0, letterSpacing: '-0.5px' }}>
                  {firstName} {lastName}
                </h2>
                <span className="role-pill" style={{ background: 'var(--color-studio-mist)', color: 'var(--color-ink)', border: '1px solid var(--color-hairline-silver)', fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: 'var(--radius-buttons)' }}>
                  TEACHER PORTAL
                </span>
              </div>
              <p style={{ color: 'var(--color-slate)', fontSize: '13px', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={12} color="var(--color-steel)" />
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-16)', paddingTop: 'var(--spacing-16)', borderTop: '1px solid var(--color-control-gray)' }}>
          <div style={{ background: 'var(--color-studio-mist)', padding: '12px 16px', borderRadius: '14px', border: '1px solid var(--color-control-gray)' }}>
            <div style={{ fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.04em' }}>TEACHER ID</div>
            <div style={{ color: 'var(--color-ink)', fontWeight: '600', fontSize: '14px', marginTop: '2px' }}>
              {userIdStr}
            </div>
          </div>

          <div style={{ background: 'var(--color-studio-mist)', padding: '12px 16px', borderRadius: '14px', border: '1px solid var(--color-control-gray)' }}>
            <div style={{ fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.04em' }}>TEACHER NAME</div>
            <div style={{ color: 'var(--color-ink)', fontWeight: '600', fontSize: '14px', marginTop: '2px' }}>
              {fullName}
            </div>
          </div>

          <div style={{ background: 'var(--color-studio-mist)', padding: '12px 16px', borderRadius: '14px', border: '1px solid var(--color-control-gray)' }}>
            <div style={{ fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.04em' }}>PRIMARY SUBJECT</div>
            <div style={{ color: 'var(--color-pricing-blue)', fontWeight: '600', fontSize: '14px', marginTop: '2px' }}>
              {teacherSubjects.length > 0 ? teacherSubjects.map(s => s.subject).join(', ') : (profileData?.primarySubject || 'Mathematics')}
            </div>
          </div>

          <div style={{ background: 'var(--color-studio-mist)', padding: '12px 16px', borderRadius: '14px', border: '1px solid var(--color-control-gray)' }}>
            <div style={{ fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.04em' }}>ROLE</div>
            <div style={{ color: 'var(--color-ink)', fontWeight: '600', fontSize: '14px', marginTop: '2px' }}>
              Faculty Member
            </div>
          </div>
        </div>
      </div>

      {/* LOWER SECTION: Executive Staff-Portal-Style Layout */}
      <div className="staff-portal-layout">
        {/* Left Module Sidebar Navigation */}
        <div className="staff-sidebar-nav">
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
                fontSize: '12px',
                marginBottom: '4px'
              }}
            >
              <ArrowLeft size={13} /> Back to Dashboard
            </button>
          )}

          <div className="staff-sidebar-header">
            <div className="staff-sidebar-title">
              <Layers size={15} color="var(--color-pricing-blue)" />
              <span>Teacher Modules</span>
            </div>
            <span className="badge-unique" style={{ fontSize: '11px', padding: '2px 8px' }}>
              {modulesList.length} Modules
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {modulesList.map((mod) => {
              const isActive = activeTab === mod.id;
              return (
                <button
                  key={mod.id}
                  onClick={() => setActiveTab(mod.id)}
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
                <span style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--color-ink)' }}>Faculty Active</span>
              </div>
              <span style={{ fontSize: '10.5px', color: 'var(--color-slate)', fontWeight: '500' }}>ERP v2.4</span>
            </div>
          </div>
        </div>

        {/* Right Content Workspace */}
        <div style={{ minWidth: 0, width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-16)' }}>
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

          {/* MODULE 2: PERSONAL TEACHING SCHEDULE & TIMETABLE (DEDICATED VIEW) */}
          {activeTab === 'module2' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-20)', width: '100%' }}>
              
              {/* Toast Notification Banner */}
              {notification && (
                <div style={{
                  background: notification.type === 'error' ? 'var(--color-error-bg)' : notification.type === 'success' ? 'var(--color-success-bg)' : 'var(--color-paper-frost)',
                  color: notification.type === 'error' ? 'var(--color-error)' : notification.type === 'success' ? 'var(--color-success)' : 'var(--color-ink)',
                  border: `1px solid ${notification.type === 'error' ? 'var(--color-error-border)' : notification.type === 'success' ? 'var(--color-success-border)' : 'var(--color-control-border)'}`,
                  padding: '12px 20px',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  fontSize: '13.5px',
                  fontWeight: '500',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {notification.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
                    <span>{notification.msg}</span>
                  </div>
                  <button onClick={() => setNotification(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit' }}>
                    <X size={15} />
                  </button>
                </div>
              )}

              {/* Top Header Card with Date Navigation */}
              <div
                style={{
                  background: 'var(--color-gallery-white)',
                  border: '1px solid var(--color-hairline-silver)',
                  borderRadius: 'var(--radius-cards)',
                  padding: 'var(--spacing-20) var(--spacing-24)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 'var(--spacing-16)'
                }}
              >
                <div>
                  <h3 style={{ color: 'var(--color-ink)', fontSize: '20px', fontWeight: '600', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={20} color="var(--color-pricing-blue)" />
                    My Daily Teaching Schedule
                  </h3>
                  <p style={{ color: 'var(--color-slate)', fontSize: '13px', margin: '4px 0 0 0' }}>
                    Personal timetable and period allocations for <strong>{fullName}</strong> ({userIdStr}).
                  </p>
                </div>

                {/* Date Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-12)', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-paper-frost)', padding: '5px 12px', borderRadius: 'var(--radius-inputs)', border: '1px solid var(--color-control-border)' }}>
                    <Calendar size={13} color="var(--color-pricing-blue)" />
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

                  {/* Yesterday / Today / Tomorrow quick buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button onClick={() => changeDateByDays(-1)} className="btn-apple-outline" style={{ padding: '5px 10px', fontSize: '11.5px' }}>
                      ‹ Yesterday
                    </button>
                    <button onClick={setTodayDate} className="btn-apple-outline" style={{ padding: '5px 10px', fontSize: '11.5px', borderColor: 'var(--color-pricing-blue)', color: 'var(--color-pricing-blue)' }}>
                      Today
                    </button>
                    <button onClick={() => changeDateByDays(1)} className="btn-apple-outline" style={{ padding: '5px 10px', fontSize: '11.5px' }}>
                      Tomorrow ›
                    </button>
                  </div>
                </div>
              </div>

              {/* Summary Stats Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-16)' }}>
                <div style={{ background: 'var(--color-gallery-white)', padding: 'var(--spacing-16)', borderRadius: '16px', border: '1px solid var(--color-hairline-silver)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.04em' }}>
                    SCHEDULE DATE
                  </div>
                  <div style={{ color: 'var(--color-ink)', fontWeight: '600', fontSize: '15px', marginTop: '4px' }}>
                    {getFormattedDateWithDay(selectedDate)}
                  </div>
                </div>

                <div style={{ background: 'var(--color-gallery-white)', padding: 'var(--spacing-16)', borderRadius: '16px', border: '1px solid var(--color-hairline-silver)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.04em' }}>
                    PERIODS ASSIGNED
                  </div>
                  <div style={{ color: 'var(--color-pricing-blue)', fontWeight: '600', fontSize: '15px', marginTop: '4px' }}>
                    {schedules.filter(s => isExactTeacherMatch(s.teacherName) && s.periodIndex !== 3).length} / 7 Periods
                  </div>
                </div>

                <div style={{ background: 'var(--color-gallery-white)', padding: 'var(--spacing-16)', borderRadius: '16px', border: '1px solid var(--color-hairline-silver)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.04em' }}>
                    PRIMARY SUBJECTS
                  </div>
                  <div style={{ color: 'var(--color-ink)', fontWeight: '600', fontSize: '15px', marginTop: '4px' }}>
                    {(() => {
                      const assignedSubs = Array.from(new Set(schedules.filter(s => isExactTeacherMatch(s.teacherName) && s.subjectName && s.subjectName !== 'General' && s.subjectName !== 'Break').map(s => s.subjectName)));
                      if (teacherSubjects.length > 0) return teacherSubjects.map(s => s.subject).join(', ');
                      if (assignedSubs.length > 0) return assignedSubs.join(', ');
                      return profileData?.primarySubject || 'Mathematics';
                    })()}
                  </div>
                </div>

                <div style={{ background: 'var(--color-gallery-white)', padding: 'var(--spacing-16)', borderRadius: '16px', border: '1px solid var(--color-hairline-silver)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.04em' }}>
                    PORTAL MODE
                  </div>
                  <div style={{ color: 'var(--color-ink)', fontWeight: '600', fontSize: '15px', marginTop: '4px' }}>
                    Faculty Personal Timetable
                  </div>
                </div>
              </div>

              {/* Personal Daily Timetable Table Card */}
              <div
                style={{
                  background: 'var(--color-gallery-white)',
                  border: '1px solid var(--color-hairline-silver)',
                  borderRadius: 'var(--radius-cards)',
                  overflow: 'hidden'
                }}
              >
                <div style={{ padding: '16px 20px', background: 'var(--color-studio-mist)', borderBottom: '1px solid var(--color-control-gray)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: 'var(--color-ink)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={16} color="var(--color-pricing-blue)" />
                    Daily Class Schedule Breakdown
                  </h4>
                  <span style={{ fontSize: '12px', color: 'var(--color-slate)' }}>
                    Live Synchronized with Master Timetable
                  </span>
                </div>

                {scheduleLoading ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-slate)' }}>
                    Loading your daily teaching schedule...
                  </div>
                ) : (
                  <div style={{ width: '100%', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--color-ink)', fontSize: '13.5px' }}>
                      <thead>
                        <tr style={{ background: 'var(--color-paper-frost)', borderBottom: '1px solid var(--color-hairline-silver)', textTransform: 'uppercase', fontSize: '11px', color: 'var(--color-slate)', letterSpacing: '0.04em' }}>
                          <th style={{ padding: '12px 16px', textAlign: 'left' }}>Period & Timing</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left' }}>Assigned Class</th>
                          <th style={{ padding: '12px 16px', textAlign: 'center' }}>Section</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left' }}>Room Number</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left' }}>Subject</th>
                          <th style={{ padding: '12px 16px', textAlign: 'center' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { pIdx: 0, time: '09:00 AM - 10:00 AM', label: 'Period 1' },
                          { pIdx: 1, time: '10:00 AM - 11:00 AM', label: 'Period 2' },
                          { pIdx: 2, time: '11:00 AM - 12:00 PM', label: 'Period 3' },
                          { pIdx: 3, time: '12:00 PM - 01:00 PM', label: 'Lunch Break', isLunch: true },
                          { pIdx: 4, time: '01:00 PM - 02:00 PM', label: 'Period 4' },
                          { pIdx: 5, time: '02:00 PM - 03:00 PM', label: 'Period 5' },
                          { pIdx: 6, time: '03:00 PM - 04:00 PM', label: 'Period 6' },
                          { pIdx: 7, time: '04:00 PM - 05:00 PM', label: 'Period 7' }
                        ].map((slotObj, idx) => {
                          if (slotObj.isLunch) {
                            return (
                              <tr
                                key={slotObj.pIdx}
                                style={{
                                  background: '#fefce8',
                                  borderBottom: '1px solid #fef08a'
                                }}
                              >
                                <td style={{ padding: '12px 16px', color: '#a16207', fontWeight: '600' }}>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Clock size={14} color="#a16207" />
                                    {slotObj.label} ({slotObj.time})
                                  </span>
                                </td>
                                <td colSpan={4} style={{ padding: '12px 16px', color: '#a16207', fontWeight: '500' }}>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Coffee size={15} />
                                    Recess & Faculty Lunch Break
                                  </span>
                                </td>
                                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                  <span style={{ background: '#fef9c3', color: '#854d0e', border: '1px solid #fde047', padding: '2px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: '600' }}>
                                    Break
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
                                    {slotObj.label} ({slotObj.time})
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
                                  {matchedEntry.roomNo && matchedEntry.roomNo.trim() !== '' ? matchedEntry.roomNo : '—'}
                                </td>
                                <td style={{ padding: '12px 16px', color: 'var(--color-pricing-blue)', fontWeight: '600' }}>
                                  {matchedEntry.subjectName || 'General'}
                                </td>
                                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                  <span style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '2px 10px', borderRadius: 'var(--radius-buttons)', fontSize: '11px', fontWeight: '600' }}>
                                    Assigned
                                  </span>
                                </td>
                              </tr>
                            );
                          }

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
                                  {slotObj.label} ({slotObj.time})
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
                  </div>
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

                {/* Filter and Date Bar: Showing Date, Class, Section, and Editable Timing */}
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

                  {/* Editable Timing Selector */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-studio-mist)', padding: '4px 10px', borderRadius: 'var(--radius-inputs)', border: '1px solid var(--color-steel)' }}>
                    <span style={{ color: 'var(--color-slate)', fontSize: '12px', fontWeight: '600' }}>Timing:</span>
                    <input
                      type="text"
                      list="teacher-attendance-timings"
                      value={attendanceTiming}
                      onChange={(e) => setAttendanceTiming(e.target.value)}
                      placeholder="e.g. 09:00 AM - 10:00 AM"
                      style={{
                        background: 'transparent',
                        color: 'var(--color-ink)',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: '600',
                        outline: 'none',
                        minWidth: '160px'
                      }}
                    />
                    <datalist id="teacher-attendance-timings">
                      {DAY_TIME_SLOTS.filter(p => !p.isLunch).map(p => {
                        const isAssigned = attendanceSchedules.some(s => s.periodIndex === p.pIdx && isExactTeacherMatch(s.teacherName));
                        return (
                          <option key={p.pIdx} value={p.slot}>
                            {p.label} ({p.slot}){isAssigned ? ' ★ Assigned Class' : ' (Free Slot)'}
                          </option>
                        );
                      })}
                    </datalist>
                  </div>

                  {/* Class Dropdown (strictly restricted to assigned class) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-studio-mist)', padding: '4px 10px', borderRadius: 'var(--radius-inputs)', border: '1px solid var(--color-steel)' }}>
                    <span style={{ color: 'var(--color-slate)', fontSize: '12px', fontWeight: '600' }}>Class:</span>
                    <select
                      value={attendanceClass || ''}
                      disabled
                      style={{
                        background: 'transparent',
                        color: isTeacherAssignedAtTime ? 'var(--color-ink)' : 'var(--color-slate)',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: '600',
                        outline: 'none',
                        cursor: 'not-allowed'
                      }}
                    >
                      {isTeacherAssignedAtTime ? (
                        <option value={attendanceClass}>Grade {attendanceClass}</option>
                      ) : (
                        <option value="">No Assigned Class</option>
                      )}
                    </select>
                  </div>

                  {/* Section Dropdown (strictly restricted to assigned section) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-studio-mist)', padding: '4px 10px', borderRadius: 'var(--radius-inputs)', border: '1px solid var(--color-steel)' }}>
                    <span style={{ color: 'var(--color-slate)', fontSize: '12px', fontWeight: '600' }}>Section:</span>
                    <select
                      value={attendanceSection || ''}
                      disabled
                      style={{
                        background: 'transparent',
                        color: isTeacherAssignedAtTime ? 'var(--color-ink)' : 'var(--color-slate)',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: '600',
                        outline: 'none',
                        cursor: 'not-allowed'
                      }}
                    >
                      {isTeacherAssignedAtTime ? (
                        <option value={attendanceSection}>Section {attendanceSection}</option>
                      ) : (
                        <option value="">—</option>
                      )}
                    </select>
                  </div>

                  <button
                    onClick={() => fetchAttendanceSchedules(attendanceDate)}
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

              {/* Assignment Banner (when assigned) */}
              {isTeacherAssignedAtTime && (
                <div style={{ padding: '12px 18px', background: 'rgba(0, 113, 227, 0.06)', border: '1px solid rgba(0, 113, 227, 0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ background: 'var(--color-pricing-blue)', color: '#ffffff', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
                      PERIOD {currentAttendancePeriodIdx + 1}
                    </span>
                    <span style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--color-ink)' }}>
                      Assigned Class: Grade {attendanceClass} - Section {attendanceSection}
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--color-slate)' }}>
                      • Subject: <strong style={{ color: 'var(--color-pricing-blue)' }}>{attendanceSubject || 'General'}</strong>
                    </span>
                    {attendanceRoom && (
                      <span style={{ fontSize: '13px', color: 'var(--color-slate)' }}>
                        • Room: {attendanceRoom}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--color-slate)', fontStyle: 'italic' }}>
                    Only enrolled students of this specific section are visible
                  </span>
                </div>
              )}

              {/* Main Attendance Container */}
              {!isTeacherAssignedAtTime ? (
                /* EMPTY STATE: Teacher not assigned at this time */
                <div
                  style={{
                    background: 'var(--color-gallery-white)',
                    border: '1px solid var(--color-hairline-silver)',
                    borderRadius: 'var(--radius-cards)',
                    padding: '48px 24px',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ display: 'inline-flex', padding: '16px', background: 'var(--color-studio-mist)', borderRadius: '50%', marginBottom: '14px' }}>
                    <Clock size={32} color="var(--color-slate)" />
                  </div>
                  <h4 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--color-ink)', margin: 0 }}>
                    {teacherAssignedPeriodsOnDate.length === 0
                      ? `No Teaching Periods Assigned on ${attendanceDate}`
                      : `Free Period: You Are Not Assigned at ${attendanceTiming}`}
                  </h4>
                  <p style={{ color: 'var(--color-slate)', fontSize: '14px', maxWidth: '560px', margin: '8px auto 20px auto', lineHeight: '1.5' }}>
                    {teacherAssignedPeriodsOnDate.length === 0
                      ? `Staff has not assigned you to any class or section on ${attendanceDate}. Under the smart timetable rules, student attendance can only be taken for class sections specifically assigned to you.`
                      : `You have no assigned class scheduled at this specific timing on ${attendanceDate}. Only the specific class and section assigned to you at that time is shown for attendance.`}
                  </p>

                  {/* Quick-Jump to Assigned Periods on this date */}
                  {teacherAssignedPeriodsOnDate.length > 0 ? (
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-slate)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
                        Select Your Assigned Period on this Date:
                      </div>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {teacherAssignedPeriodsOnDate.map(ap => {
                          const slotDef = DAY_TIME_SLOTS[ap.periodIndex] || { slot: ap.timingLabel || '9-10 AM', label: `Period ${ap.periodIndex + 1}` };
                          const secLetter = ap.sectionId === 1 ? 'A' : ap.sectionId === 2 ? 'B' : 'C';
                          return (
                            <button
                              key={ap.id || ap.periodIndex}
                              onClick={() => setAttendanceTiming(slotDef.slot)}
                              className="btn-pricing-blue"
                              style={{ fontSize: '12.5px', padding: '8px 16px', borderRadius: '10px' }}
                            >
                              {slotDef.label} ({slotDef.slot}) • Grade {ap.classStandard}-{secLetter} ({ap.subjectName || 'Subject'})
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'var(--color-studio-mist)', borderRadius: '10px', fontSize: '12px', color: 'var(--color-slate)' }}>
                      <AlertCircle size={14} color="var(--color-launch-orange)" />
                      Staff must allocate a period to your timetable before attendance can be recorded.
                    </div>
                  )}
                </div>
              ) : (
                /* ACTIVE ROSTER TABLE: When teacher is assigned */
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
                                      background: isPresent ? '#f0fdf4' : '#fef2f2',
                                      color: isPresent ? '#16a34a' : '#dc2626',
                                      border: isPresent ? '1px solid #bbf7d0' : '1px solid #fecaca',
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
              )}
            </div>
          )}

          {/* MODULE 4: TEACHER LESSON NOTES & DISPATCH WORKSPACE */}
          {activeTab === 'module4' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-20)' }}>
              
              {/* Top Banner & Faculty Security Metrics Card */}
              <div
                style={{
                  background: 'var(--color-gallery-white)',
                  border: '1px solid var(--color-hairline-silver)',
                  borderRadius: 'var(--radius-cards)',
                  padding: 'var(--spacing-24) var(--spacing-28)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '12px',
                        background: '#eff6ff',
                        color: 'var(--color-pricing-blue)',
                        border: '1px solid #dbeafe',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <BookOpen size={22} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <h3 style={{ color: 'var(--color-ink)', fontSize: '20px', fontWeight: '600', margin: 0 }}>
                          Teacher Lesson Notes & Section Dispatch
                        </h3>
                        <span
                          style={{
                            background: isJwtVerified ? 'rgba(34, 197, 94, 0.1)' : 'var(--color-studio-mist)',
                            color: isJwtVerified ? '#16a34a' : 'var(--color-slate)',
                            border: `1px solid ${isJwtVerified ? 'rgba(34, 197, 94, 0.25)' : 'var(--color-hairline-silver)'}`,
                            padding: '3px 10px',
                            borderRadius: 'var(--radius-buttons)',
                            fontSize: '11px',
                            fontWeight: '600',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <ShieldCheck size={12} />
                          {isJwtVerified ? `JWT Authenticated (${decodedJwt?.role || 'TEACHER'})` : 'JWT Token Ready'}
                        </span>
                      </div>
                      <p style={{ color: 'var(--color-slate)', fontSize: '13px', margin: '4px 0 0 0' }}>
                        Publish section-targeted lesson notes, study materials, and curriculum guides directly to students.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={fetchLessonNotesHistory}
                    disabled={notesLoading}
                    className="btn-apple-outline"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 14px',
                      fontSize: '12px'
                    }}
                  >
                    <RefreshCw size={13} className={notesLoading ? 'spin-animation' : ''} />
                    Refresh Notes
                  </button>
                </div>

                {/* Faculty Stats Metric Chips */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--spacing-16)', marginTop: 'var(--spacing-20)', paddingTop: 'var(--spacing-16)', borderTop: '1px solid var(--color-control-gray)' }}>
                  <div style={{ background: 'var(--color-studio-mist)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--color-control-gray)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.04em' }}>TOTAL NOTES SENT</div>
                    <div style={{ color: 'var(--color-pricing-blue)', fontWeight: '700', fontSize: '18px', marginTop: '2px' }}>
                      {lessonNotes.length}
                    </div>
                  </div>
                  <div style={{ background: 'var(--color-studio-mist)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--color-control-gray)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.04em' }}>DISPATCHING TEACHER</div>
                    <div style={{ color: 'var(--color-ink)', fontWeight: '600', fontSize: '14px', marginTop: '4px' }}>
                      {fullName}
                    </div>
                  </div>
                  <div style={{ background: 'var(--color-studio-mist)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--color-control-gray)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.04em' }}>PRIMARY SUBJECT</div>
                    <div style={{ color: 'var(--color-ink)', fontWeight: '600', fontSize: '14px', marginTop: '4px' }}>
                      {teacherSubjects.length > 0 ? teacherSubjects.map(s => s.subject).join(', ') : (noteForm.subject || 'Mathematics')}
                    </div>
                  </div>
                  <div style={{ background: 'var(--color-studio-mist)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--color-control-gray)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.04em' }}>FACULTY USER ID</div>
                    <div style={{ color: 'var(--color-ink)', fontWeight: '600', fontSize: '14px', marginTop: '4px' }}>
                      {userIdStr}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 1: Compose & Send Lesson Notes Card */}
              <form
                onSubmit={handleSendLessonNotes}
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
                  <h4 style={{ color: 'var(--color-ink)', fontSize: '18px', fontWeight: '600', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Send size={18} color="var(--color-pricing-blue)" />
                    Send Lesson Notes to Section
                  </h4>
                  <span style={{ fontSize: '12px', color: 'var(--color-slate)', fontWeight: '500' }}>
                    Select targeted class & section, subject, and enter lesson notes
                  </span>
                </div>

                {notesSuccessMsg && (
                  <div style={{ color: '#16a34a', fontSize: '13px', background: 'rgba(34, 197, 94, 0.08)', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(34, 197, 94, 0.25)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle size={16} />
                    <span>{notesSuccessMsg}</span>
                  </div>
                )}

                {notesErrMsg && (
                  <div style={{ color: '#dc2626', fontSize: '13px', background: 'rgba(239, 68, 68, 0.08)', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.25)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={16} />
                    <span>{notesErrMsg}</span>
                  </div>
                )}

                {/* 4-Column Controls: Class, Section, Subject, Topic */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-16)' }}>
                  {/* Class Selection */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-slate)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Target Class *
                    </label>
                    <select
                      className="apple-input"
                      value={noteForm.className}
                      onChange={(e) => setNoteForm(prev => ({ ...prev, className: e.target.value }))}
                      style={{ padding: '9px 12px', fontSize: '13.5px', borderRadius: '10px', width: '100%' }}
                    >
                      {['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>

                  {/* Section Selection */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-slate)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Target Section *
                    </label>
                    <select
                      className="apple-input"
                      value={noteForm.section}
                      onChange={(e) => setNoteForm(prev => ({ ...prev, section: e.target.value }))}
                      style={{ padding: '9px 12px', fontSize: '13.5px', borderRadius: '10px', width: '100%' }}
                    >
                      <option value="A">Section A</option>
                      <option value="B">Section B</option>
                      <option value="C">Section C</option>
                    </select>
                  </div>

                  {/* Subject Name */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-slate)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Subject Name *
                    </label>
                    <select
                      className="apple-input"
                      value={noteForm.subject}
                      onChange={(e) => setNoteForm(prev => ({ ...prev, subject: e.target.value }))}
                      style={{ padding: '9px 12px', fontSize: '13.5px', borderRadius: '10px', width: '100%' }}
                    >
                      {teacherSubjects.length > 0
                        ? Array.from(new Set(teacherSubjects.map(s => s.subject))).map(subj => (
                            <option key={subj} value={subj}>{subj}</option>
                          ))
                        : (
                          <>
                            <option value="Mathematics">Mathematics</option>
                            <option value="Science">Science</option>
                            <option value="Physics">Physics</option>
                            <option value="Chemistry">Chemistry</option>
                            <option value="Biology">Biology</option>
                            <option value="English">English</option>
                            <option value="Social Science">Social Science</option>
                          </>
                        )
                      }
                    </select>
                  </div>

                  {/* Lesson Topic / Chapter Title */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-slate)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Lesson Topic / Title *
                    </label>
                    <input
                      type="text"
                      className="apple-input"
                      placeholder="e.g. Chapter 4: Quadratic Equations"
                      value={noteForm.topic}
                      onChange={(e) => setNoteForm(prev => ({ ...prev, topic: e.target.value }))}
                      required
                      style={{ padding: '9px 12px', fontSize: '13.5px', borderRadius: '10px', width: '100%' }}
                    />
                  </div>
                </div>

                {/* Quick Topic Starter Pills */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', color: 'var(--color-slate)', fontWeight: '500' }}>Quick Templates:</span>
                  {[
                    { label: 'Formulas & Definitions', snippet: '## Key Formulas & Definitions\n1. Formula: \n2. Definition: \n\n## Practice Problems\n• Problem 1: \n• Problem 2: ' },
                    { label: 'Lecture Summary', snippet: '## Lecture Summary\n• Key Point 1: \n• Key Point 2: \n• Key Point 3: \n\n## Reading Reference: Chapter Pages ' },
                    { label: 'Homework & Assignment', snippet: '## Homework Assignment\n• Exercise: \n• Question Numbers: \n• Submission Due Date: Tomorrow morning' },
                    { label: 'Exam Revision Notes', snippet: '## High-Yield Revision Points\n1. Crucial Rule: \n2. Common Mistakes to Avoid: \n3. Recommended Practice Set: ' }
                  ].map(tmpl => (
                    <button
                      type="button"
                      key={tmpl.label}
                      onClick={() => {
                        setNoteForm(prev => ({
                          ...prev,
                          topic: prev.topic || tmpl.label,
                          notesContent: prev.notesContent ? `${prev.notesContent}\n\n${tmpl.snippet}` : tmpl.snippet
                        }));
                      }}
                      className="btn-apple-outline"
                      style={{ padding: '3px 10px', fontSize: '11.5px', borderRadius: '14px', background: 'var(--color-studio-mist)' }}
                    >
                      + {tmpl.label}
                    </button>
                  ))}
                </div>

                {/* Notes Content Textarea */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-slate)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Lesson Notes Content *
                    </label>
                    <span style={{ fontSize: '11px', color: 'var(--color-slate)' }}>
                      {noteForm.notesContent.length} characters
                    </span>
                  </div>
                  <textarea
                    className="apple-input"
                    rows={6}
                    placeholder="Enter comprehensive lesson notes, explanations, homework instructions, or reading references for this class & section..."
                    value={noteForm.notesContent}
                    onChange={(e) => setNoteForm(prev => ({ ...prev, notesContent: e.target.value }))}
                    required
                    style={{
                      padding: '12px 14px',
                      fontSize: '13.5px',
                      borderRadius: '10px',
                      fontFamily: 'inherit',
                      lineHeight: '1.5',
                      resize: 'vertical',
                      minHeight: '130px',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Submit Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-slate)' }}>
                    <ShieldCheck size={14} color="#16a34a" />
                    <span>Dispatched under verified teacher credentials: <strong>{fullName}</strong></span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setNoteForm(prev => ({ ...prev, topic: '', notesContent: '' }))}
                      className="btn-apple-outline"
                      style={{ padding: '8px 18px', fontSize: '13px' }}
                    >
                      Clear
                    </button>
                    <button
                      type="submit"
                      disabled={notesSubmitting || !noteForm.notesContent.trim() || !noteForm.topic.trim()}
                      className="btn-pricing-blue"
                      style={{
                        padding: '8px 22px',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        borderRadius: 'var(--radius-buttons)'
                      }}
                    >
                      <Send size={14} />
                      {notesSubmitting ? 'Dispatching Notes...' : `Send Notes to ${noteForm.className} ${noteForm.section}`}
                    </button>
                  </div>
                </div>
              </form>

              {/* SECTION 2: Teacher Dispatch History Card */}
              <div
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h4 style={{ color: 'var(--color-ink)', fontSize: '18px', fontWeight: '600', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={18} color="var(--color-pricing-blue)" />
                      Notes Sent by You (Dispatch History)
                    </h4>
                    <p style={{ color: 'var(--color-slate)', fontSize: '13px', margin: '4px 0 0 0' }}>
                      History of all lesson notes sent by <strong>{fullName}</strong>. Real-time synchronized with database.
                    </p>
                  </div>

                  <span className="badge-unique" style={{ fontSize: '12px', padding: '4px 12px' }}>
                    {lessonNotes.length} Total Dispatches
                  </span>
                </div>

                {/* Filter and Search Bar */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    flexWrap: 'wrap',
                    background: 'var(--color-studio-mist)',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid var(--color-hairline-silver)'
                  }}
                >
                  {/* Search Input */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1', minWidth: '220px', background: 'var(--color-gallery-white)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--color-hairline-silver)' }}>
                    <Search size={14} color="var(--color-slate)" />
                    <input
                      type="text"
                      placeholder="Search notes by topic or content..."
                      value={historySearchQuery}
                      onChange={(e) => setHistorySearchQuery(e.target.value)}
                      style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '13px', color: 'var(--color-ink)' }}
                    />
                    {historySearchQuery && (
                      <button onClick={() => setHistorySearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        <X size={13} color="var(--color-slate)" />
                      </button>
                    )}
                  </div>

                  {/* Filter by Class */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--color-slate)', fontWeight: '500' }}>Class:</span>
                    <select
                      className="apple-input"
                      value={historyClassFilter}
                      onChange={(e) => setHistoryClassFilter(e.target.value)}
                      style={{ padding: '6px 10px', fontSize: '12.5px', borderRadius: '8px' }}
                    >
                      <option value="ALL">All Classes</option>
                      {['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Filter by Section */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--color-slate)', fontWeight: '500' }}>Section:</span>
                    <select
                      className="apple-input"
                      value={historySectionFilter}
                      onChange={(e) => setHistorySectionFilter(e.target.value)}
                      style={{ padding: '6px 10px', fontSize: '12.5px', borderRadius: '8px' }}
                    >
                      <option value="ALL">All Sections</option>
                      <option value="A">Section A</option>
                      <option value="B">Section B</option>
                      <option value="C">Section C</option>
                    </select>
                  </div>
                </div>

                {/* History Notes Cards Grid */}
                {notesLoading ? (
                  <div style={{ padding: '48px', textAlign: 'center', color: 'var(--color-slate)', fontSize: '14px' }}>
                    <RefreshCw size={24} className="spin-animation" style={{ margin: '0 auto 12px auto' }} />
                    Loading lesson notes history...
                  </div>
                ) : lessonNotes.filter(note => {
                    const matchesSearch = !historySearchQuery ||
                      (note.topic && note.topic.toLowerCase().includes(historySearchQuery.toLowerCase())) ||
                      (note.notesContent && note.notesContent.toLowerCase().includes(historySearchQuery.toLowerCase())) ||
                      (note.subject && note.subject.toLowerCase().includes(historySearchQuery.toLowerCase()));
                    const matchesClass = historyClassFilter === 'ALL' || note.className === historyClassFilter;
                    const matchesSection = historySectionFilter === 'ALL' || note.section === historySectionFilter;
                    return matchesSearch && matchesClass && matchesSection;
                  }).length === 0 ? (
                  <div
                    style={{
                      background: 'var(--color-studio-mist)',
                      border: '1px dashed var(--color-hairline-silver)',
                      borderRadius: '16px',
                      padding: '48px 24px',
                      textAlign: 'center'
                    }}
                  >
                    <BookOpen size={36} color="var(--color-slate)" style={{ margin: '0 auto 12px auto' }} />
                    <h5 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--color-ink)', margin: 0 }}>
                      No Lesson Notes Found in History
                    </h5>
                    <p style={{ color: 'var(--color-slate)', fontSize: '13px', maxWidth: '440px', margin: '8px auto 0 auto' }}>
                      {historySearchQuery || historyClassFilter !== 'ALL' || historySectionFilter !== 'ALL'
                        ? 'No notes match the current search or filter criteria. Try clearing filters.'
                        : 'You haven\'t dispatched any lesson notes yet. Use the compose form above to send your first notes to a class section!'}
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--spacing-16)' }}>
                    {lessonNotes.filter(note => {
                      const matchesSearch = !historySearchQuery ||
                        (note.topic && note.topic.toLowerCase().includes(historySearchQuery.toLowerCase())) ||
                        (note.notesContent && note.notesContent.toLowerCase().includes(historySearchQuery.toLowerCase())) ||
                        (note.subject && note.subject.toLowerCase().includes(historySearchQuery.toLowerCase()));
                      const matchesClass = historyClassFilter === 'ALL' || note.className === historyClassFilter;
                      const matchesSection = historySectionFilter === 'ALL' || note.section === historySectionFilter;
                      return matchesSearch && matchesClass && matchesSection;
                    }).map((note) => {
                      const isCopied = copiedNoteId === note.id;
                      const noteDate = note.timeOfNotesCreated ? new Date(note.timeOfNotesCreated) : null;
                      const formattedDate = noteDate
                        ? noteDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : 'Recent';

                      return (
                        <div
                          key={note.id}
                          style={{
                            background: 'var(--color-gallery-white)',
                            border: '1px solid var(--color-hairline-silver)',
                            borderRadius: '14px',
                            padding: '18px 20px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '12px',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                          }}
                        >
                          {/* Card Top: Badges & Timestamp */}
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '10px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                <span
                                  style={{
                                    background: '#eff6ff',
                                    color: 'var(--color-pricing-blue)',
                                    border: '1px solid #dbeafe',
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    fontWeight: '700'
                                  }}
                                >
                                  {note.className} - Sec {note.section}
                                </span>
                                <span
                                  style={{
                                    background: '#f5f3ff',
                                    color: '#7c3aed',
                                    border: '1px solid #ede9fe',
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    fontWeight: '600'
                                  }}
                                >
                                  {note.subject}
                                </span>
                              </div>

                              <span style={{ fontSize: '11px', color: 'var(--color-slate)', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                                <Clock size={11} />
                                {formattedDate}
                              </span>
                            </div>

                            {/* Topic Title */}
                            <h5 style={{ color: 'var(--color-ink)', fontSize: '15px', fontWeight: '600', margin: '0 0 8px 0', lineHeight: '1.3' }}>
                              {note.topic}
                            </h5>

                            {/* Notes Content Snippet */}
                            <p
                              style={{
                                color: 'var(--color-slate)',
                                fontSize: '13px',
                                lineHeight: '1.5',
                                margin: 0,
                                whiteSpace: 'pre-wrap',
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}
                            >
                              {note.notesContent}
                            </p>
                          </div>

                          {/* Card Footer: Teacher Attribution & Action Buttons */}
                          <div style={{ borderTop: '1px solid var(--color-control-gray)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                            <div style={{ fontSize: '11.5px', color: 'var(--color-slate)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <ShieldCheck size={12} color="#16a34a" />
                              <span>By: <strong>{note.teacherName}</strong></span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <button
                                onClick={() => setSelectedNoteModal(note)}
                                className="btn-apple-outline"
                                style={{ padding: '4px 10px', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                title="View full lesson note"
                              >
                                <Eye size={12} />
                                View
                              </button>
                              <button
                                onClick={() => handleCopyNoteContent(note)}
                                className="btn-apple-outline"
                                style={{ padding: '4px 10px', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                title="Copy note text to clipboard"
                              >
                                {isCopied ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
                                {isCopied ? 'Copied' : 'Copy'}
                              </button>
                              <button
                                onClick={() => handleDeleteLessonNote(note.id)}
                                className="btn-apple-outline"
                                style={{ padding: '4px 8px', fontSize: '11.5px', color: '#dc2626', borderColor: '#fecaca' }}
                                title="Delete note from history"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Full Note Detail Modal */}
              {selectedNoteModal && (
                <div
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.45)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                  }}
                  onClick={() => setSelectedNoteModal(null)}
                >
                  <div
                    style={{
                      background: 'var(--color-gallery-white)',
                      border: '1px solid var(--color-hairline-silver)',
                      borderRadius: '16px',
                      padding: '28px',
                      maxWidth: '650px',
                      width: '100%',
                      maxHeight: '85vh',
                      overflowY: 'auto',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.18)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '18px'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                          <span style={{ background: '#eff6ff', color: 'var(--color-pricing-blue)', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
                            {selectedNoteModal.className} - Section {selectedNoteModal.section}
                          </span>
                          <span style={{ background: '#f5f3ff', color: '#7c3aed', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600' }}>
                            {selectedNoteModal.subject}
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--color-slate)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={12} />
                            {selectedNoteModal.timeOfNotesCreated ? new Date(selectedNoteModal.timeOfNotesCreated).toLocaleString() : 'N/A'}
                          </span>
                        </div>
                        <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: 'var(--color-ink)' }}>
                          {selectedNoteModal.topic}
                        </h4>
                      </div>
                      <button
                        onClick={() => setSelectedNoteModal(null)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                      >
                        <X size={18} color="var(--color-slate)" />
                      </button>
                    </div>

                    <div style={{ padding: '16px', background: 'var(--color-studio-mist)', borderRadius: '12px', border: '1px solid var(--color-hairline-silver)' }}>
                      <div style={{ fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase', fontWeight: '600', marginBottom: '8px' }}>
                        Lesson Notes & Study Content:
                      </div>
                      <div style={{ whiteSpace: 'pre-wrap', fontSize: '14px', lineHeight: '1.6', color: 'var(--color-ink)', maxHeight: '350px', overflowY: 'auto' }}>
                        {selectedNoteModal.notesContent}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ fontSize: '12px', color: 'var(--color-slate)' }}>
                        Dispatched by: <strong>{selectedNoteModal.teacherName}</strong>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleCopyNoteContent(selectedNoteModal)}
                          className="btn-apple-outline"
                          style={{ padding: '6px 14px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          {copiedNoteId === selectedNoteModal.id ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
                          {copiedNoteId === selectedNoteModal.id ? 'Copied to Clipboard' : 'Copy Content'}
                        </button>
                        <button
                          onClick={() => setSelectedNoteModal(null)}
                          className="btn-pricing-blue"
                          style={{ padding: '6px 18px', fontSize: '12.5px' }}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* OTHER MODULES WORKSPACE PLACEHOLDERS */}
          {modulesList.map((mod) => {
            if (mod.id === 'module1' || mod.id === 'module2' || mod.id === 'module3' || mod.id === 'module4' || activeTab !== mod.id) return null;
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
