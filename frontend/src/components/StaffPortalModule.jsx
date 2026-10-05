import React, { useState, useEffect } from 'react';
import {
  Users,
  BookOpen,
  Calendar,
  Clock,
  Building,
  CheckCircle2,
  XCircle,
  Plus,
  RefreshCw,
  Search,
  Filter,
  UserCheck,
  Edit2,
  Save,
  X,
  Mail,
  Phone,
  Grid,
  List,
  Check,
  ChevronRight,
  Sparkles,
  Award,
  BookMarked,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export default function StaffPortalModule({ user }) {
  const [activeTab, setActiveTab] = useState('module1');
  const [selectedClass, setSelectedClass] = useState(1);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState(null);

  // Module 2 State
  const [studentsList, setStudentsList] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [studentStatusFilter, setStudentStatusFilter] = useState('ALL');
  const [updatingStudentId, setUpdatingStudentId] = useState(null);
  const [classRooms, setClassRooms] = useState([]);
  const [activePeriodTab, setActivePeriodTab] = useState(0);

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const handleNavigateYesterday = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
  };

  const handleNavigateToday = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
  };

  const handleNavigateTomorrow = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
  };

  const [showClassSidebar, setShowClassSidebar] = useState(true);

  const MAX_PERIODS_PER_TEACHER = 7;
  const PERIOD_TIMINGS = ['9-10 AM', '10-11 AM', '11-12 PM', '12-1 PM (Lunch)', '1-2 PM', '2-3 PM', '3-4 PM', '4-5 PM'];

  const [scheduleGrid, setScheduleGrid] = useState(() => {
    const initialGrid = {};
    for (let c = 1; c <= 12; c++) {
      for (let s = 1; s <= 3; s++) {
        for (let p = 0; p < 8; p++) {
          const cellKey = c + '_' + s + '_' + p;
          if (p === 3) {
            initialGrid[cellKey] = { room_no: 'Recess', teacher: 'Lunch Break', sub: 'Break' };
          } else {
            initialGrid[cellKey] = null;
          }
        }
      }
    }
    return initialGrid;
  });

  const [activeTeacherClick, setActiveTeacherClick] = useState(null);
  const [activeRoomClick, setActiveRoomClick] = useState(null);

  // Module 3: Students Directory states
  const [mod3Students, setMod3Students] = useState([]);
  const [mod3Loading, setMod3Loading] = useState(false);
  const [mod3SelectedClass, setMod3SelectedClass] = useState(1);
  const [mod3SelectedSection, setMod3SelectedSection] = useState('A');
  const [mod3SearchQuery, setMod3SearchQuery] = useState('');
  
  // Module 3 Attendance states
  const [mod3SelectedMonth, setMod3SelectedMonth] = useState(() => new Date().getMonth() + 1);
  const [mod3SelectedYear, setMod3SelectedYear] = useState(() => new Date().getFullYear());
  const [mod3AttendanceRecords, setMod3AttendanceRecords] = useState([]);
  const [mod3AttendanceLoading, setMod3AttendanceLoading] = useState(false);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);
  const [selectedStudentAttendance, setSelectedStudentAttendance] = useState([]);
  const [studentDetailLoading, setStudentDetailLoading] = useState(false);
  const [detailModalMonth, setDetailModalMonth] = useState(() => new Date().getMonth() + 1);
  const [detailModalYear, setDetailModalYear] = useState(() => new Date().getFullYear());

  // Module 4: Examinations states
  const [mod4SelectedClass, setMod4SelectedClass] = useState(1);
  const [mod4SelectedSection, setMod4SelectedSection] = useState('A');
  const [mod4Assignments, setMod4Assignments] = useState([]);
  const [mod4Loading, setMod4Loading] = useState(false);
  const [mod4ViewMode, setMod4ViewMode] = useState('list'); // 'list' | 'create' | 'view'
  const [mod4NewAssignmentTitle, setMod4NewAssignmentTitle] = useState('');
  const [mod4NewAssignmentSubject, setMod4NewAssignmentSubject] = useState('');
  const [mod4NewAssignmentConductDate, setMod4NewAssignmentConductDate] = useState('');
  const [mod4SelectedAssignment, setMod4SelectedAssignment] = useState(null);
  const [mod4SelectedAssignmentQuestions, setMod4SelectedAssignmentQuestions] = useState([]);
  const [mod4NewQuestions, setMod4NewQuestions] = useState(() => {
    const arr = [];
    for (let i = 1; i <= 50; i++) {
      arr.push({ questionNumber: i, questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A' });
    }
    return arr;
  });

  useEffect(() => {
    fetchTeachers();
    fetchStudents();
    fetchClassRooms();

    const intervalId = setInterval(() => {
      fetchTeachers();
    }, 5000);

    const onFocus = () => {
      fetchTeachers();
      fetchStudents();
    };
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const [schedulesLoading, setSchedulesLoading] = useState(false);

  const fetchSchedules = async (date) => {
    setSchedulesLoading(true);
    try {
      let res = await fetch(`http://localhost:8099/api/staff-portal/schedules?scheduleDate=${date}`).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(`http://localhost:8092/api/staff-portal/schedules?scheduleDate=${date}`).catch(() => null);
      }

      if (res && res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const newGrid = {};
          for (let c = 1; c <= 12; c++) {
            for (let s = 1; s <= 3; s++) {
              for (let p = 0; p < 8; p++) {
                const cellKey = c + '_' + s + '_' + p;
                if (p === 3) {
                  newGrid[cellKey] = { room_no: 'Recess', teacher: 'Lunch Break', sub: 'Break' };
                } else {
                  newGrid[cellKey] = null;
                }
              }
            }
          }

          data.forEach(item => {
            const cellKey = `${item.classStandard}_${item.sectionId}_${item.periodIndex}`;
            if (item.periodIndex === 3) return;
            
            if ((item.teacherName && item.teacherName.trim() !== '') || (item.roomNo && item.roomNo.trim() !== '')) {
              newGrid[cellKey] = {
                room_no: item.roomNo || '',
                teacher: item.teacherName || 'Unassigned',
                sub: item.subjectName || 'General'
              };
            }
          });
          setScheduleGrid(newGrid);
        }
      }
    } catch (e) {
      console.error("Failed to fetch schedules:", e);
    } finally {
      setSchedulesLoading(false);
    }
  };

  const saveScheduleToDB = async (classStandard, sectionId, periodIndex, roomNo, teacherName, subjectName) => {
    const payload = {
      classStandard: parseInt(classStandard),
      sectionId: parseInt(sectionId),
      periodIndex: parseInt(periodIndex),
      timingLabel: PERIOD_TIMINGS[periodIndex],
      teacherName: teacherName === 'Unassigned' ? '' : teacherName,
      subjectName: subjectName === 'General' ? '' : subjectName,
      roomNo: roomNo,
      scheduleDate: selectedDate
    };

    try {
      let res = await fetch('http://localhost:8099/api/staff-portal/schedules/cell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => null);

      if (!res || !res.ok) {
        res = await fetch('http://localhost:8092/api/staff-portal/schedules/cell', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(() => null);
      }
    } catch (e) {
      console.error("Failed to save schedule cell to DB:", e);
    }
  };

  const deleteScheduleFromDB = async (classStandard, sectionId, periodIndex) => {
    try {
      const urlParams = `classStandard=${classStandard}&sectionId=${sectionId}&periodIndex=${periodIndex}&scheduleDate=${selectedDate}`;
      let res = await fetch(`http://localhost:8099/api/staff-portal/schedules/cell?${urlParams}`, {
        method: 'DELETE'
      }).catch(() => null);

      if (!res || !res.ok) {
        res = await fetch(`http://localhost:8092/api/staff-portal/schedules/cell?${urlParams}`, {
          method: 'DELETE'
        }).catch(() => null);
      }
    } catch (e) {
      console.error("Failed to delete schedule cell from DB:", e);
    }
  };

  useEffect(() => {
    fetchSchedules(selectedDate);
  }, [selectedDate]);

  const showToast = (msg, type = 'warning') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4500);
  };

  const fetchTeachers = async () => {
    try {
      let combinedTeachers = [];

      try {
        const response = await fetch('http://localhost:8099/api/staff-portal/teachers');
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            combinedTeachers = data;
          }
        }
      } catch (e) {}

      try {
        const tpRes = await fetch('http://localhost:8099/api/teacher-portal/teachers');
        if (tpRes.ok) {
          const tpData = await tpRes.json();
          if (Array.isArray(tpData) && tpData.length > 0) {
            const tpMapped = tpData.map(t => ({
              id: t.id,
              name: t.name || t.username,
              subject: t.subject || 'General'
            }));

            if (combinedTeachers.length === 0) {
              combinedTeachers = tpMapped;
            } else {
              tpMapped.forEach(tpItem => {
                const idx = combinedTeachers.findIndex(c => c.name?.toLowerCase() === tpItem.name?.toLowerCase() || c.username?.toLowerCase() === tpItem.name?.toLowerCase());
                if (idx !== -1) {
                  combinedTeachers[idx] = { ...combinedTeachers[idx], subject: tpItem.subject };
                } else {
                  combinedTeachers.push(tpItem);
                }
              });
            }
          }
        }
      } catch (e) {}

      if (combinedTeachers.length > 0) {
        setTeachers(combinedTeachers);
      } else {
        setTeachers([
          { id: 1, name: 'Sarah Connor', subject: 'Mathematics' },
          { id: 2, name: 'Robert Vance', subject: 'Social' },
          { id: 3, name: 'Elena Rostova', subject: 'Physics' }
        ]);
      }
    } catch (error) {
      setTeachers([
        { id: 1, name: 'Sarah Connor', subject: 'Mathematics' },
        { id: 2, name: 'Robert Vance', subject: 'Social' },
        { id: 3, name: 'Elena Rostova', subject: 'Physics' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    setStudentsLoading(true);
    try {
      const response = await fetch('http://localhost:8099/api/admin/admissions');
      if (response.ok) {
        const data = await response.json();
        setStudentsList(Array.isArray(data) ? data : []);
      } else {
        setStudentsList(getMockStudents());
      }
    } catch (error) {
      setStudentsList(getMockStudents());
    } finally {
      setStudentsLoading(false);
    }
  };

  const getMockStudents = () => [
    { id: 101, admissionId: 'ADM-2026-001', firstName: 'Alex', lastName: 'Morgan', username: 'alex_m', parentName: 'Robert Morgan', parentEmail: 'robert.m@school.com', status: 'ACCEPTED', applicantType: 'STUDENT' },
    { id: 102, admissionId: 'ADM-2026-002', firstName: 'Daniel', lastName: 'Craig', username: 'daniel_c', parentName: 'James Craig', parentEmail: 'james.c@school.com', status: 'ACCEPTED', applicantType: 'STUDENT' },
    { id: 103, admissionId: 'ADM-2026-003', firstName: 'Emily', lastName: 'Watson', username: 'emily_w', parentName: 'Arthur Watson', parentEmail: 'arthur.w@school.com', status: 'PENDING', applicantType: 'STUDENT' },
    { id: 104, admissionId: 'ADM-2026-004', firstName: 'Michael', lastName: 'Brown', username: 'michael_b', parentName: 'David Brown', parentEmail: 'david.b@school.com', status: 'REJECTED', applicantType: 'STUDENT' },
    { id: 105, admissionId: 'ADM-2026-005', firstName: 'Sophia', lastName: 'Taylor', username: 'sophia_t', parentName: 'Richard Taylor', parentEmail: 'richard.t@school.com', status: 'ACCEPTED', applicantType: 'STUDENT' }
  ];

  const fetchMod3Students = async (clsStandard, secName) => {
    setMod3Loading(true);
    try {
      const url = `http://localhost:8099/api/staff-student/students?classStandard=${clsStandard}&sectionName=${secName}`;
      let res = await fetch(url).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(`http://localhost:8093/api/staff-student/students?classStandard=${clsStandard}&sectionName=${secName}`).catch(() => null);
      }
      if (res && res.ok) {
        const data = await res.json();
        setMod3Students(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("Failed to fetch students for module 3:", e);
    } finally {
      setMod3Loading(false);
    }
  };

  const fetchMod3MonthlyAttendance = async (clsStandard, secName, month, year) => {
    setMod3AttendanceLoading(true);
    try {
      const url = `http://localhost:8099/api/teacher-attendance/monthly?classStandard=${clsStandard}&sectionName=${secName}&month=${month}&year=${year}`;
      let res = await fetch(url).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(`http://localhost:8094/api/teacher-attendance/monthly?classStandard=${clsStandard}&sectionName=${secName}&month=${month}&year=${year}`).catch(() => null);
      }
      if (res && res.ok) {
        const data = await res.json();
        setMod3AttendanceRecords(Array.isArray(data) ? data : []);
      } else {
        setMod3AttendanceRecords([]);
      }
    } catch (e) {
      console.error("Failed to fetch monthly attendance records:", e);
      setMod3AttendanceRecords([]);
    } finally {
      setMod3AttendanceLoading(false);
    }
  };

  const fetchStudentMonthlyAttendanceDetails = async (studentId, month, year) => {
    setStudentDetailLoading(true);
    try {
      const url = `http://localhost:8099/api/teacher-attendance/student-monthly?studentId=${studentId}&month=${month}&year=${year}`;
      let res = await fetch(url).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(`http://localhost:8094/api/teacher-attendance/student-monthly?studentId=${studentId}&month=${month}&year=${year}`).catch(() => null);
      }
      if (res && res.ok) {
        const data = await res.json();
        setSelectedStudentAttendance(Array.isArray(data) ? data : []);
      } else {
        setSelectedStudentAttendance([]);
      }
    } catch (e) {
      console.error("Failed to fetch student details monthly attendance:", e);
      setSelectedStudentAttendance([]);
    } finally {
      setStudentDetailLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'module3') {
      fetchMod3Students(mod3SelectedClass, mod3SelectedSection);
      fetchMod3MonthlyAttendance(mod3SelectedClass, mod3SelectedSection, mod3SelectedMonth, mod3SelectedYear);
    }
  }, [activeTab, mod3SelectedClass, mod3SelectedSection, mod3SelectedMonth, mod3SelectedYear]);

  useEffect(() => {
    if (selectedStudentDetail) {
      fetchStudentMonthlyAttendanceDetails(selectedStudentDetail.studentId, detailModalMonth, detailModalYear);
    }
  }, [selectedStudentDetail, detailModalMonth, detailModalYear]);

  const fetchMod4Assignments = async (cls, sec) => {
    setMod4Loading(true);
    try {
      const url = `http://localhost:8099/api/staff-examination/assignments?classStandard=${cls}&sectionName=${sec}`;
      let res = await fetch(url).catch(() => null);
      if (!res || !res.ok) {
        const fallbackUrl = `http://localhost:8096/api/staff-examination/assignments?classStandard=${cls}&sectionName=${sec}`;
        res = await fetch(fallbackUrl).catch(() => null);
      }
      if (res && res.ok) {
        const data = await res.json();
        setMod4Assignments(data || []);
      } else {
        setMod4Assignments([]);
      }
    } catch (err) {
      console.error('[Examinations] Failed to fetch assignments:', err);
      setMod4Assignments([]);
    } finally {
      setMod4Loading(false);
    }
  };

  const fetchMod4AssignmentQuestions = async (assignmentId) => {
    try {
      const url = `http://localhost:8099/api/staff-examination/assignments/${assignmentId}/questions`;
      let res = await fetch(url).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(`http://localhost:8096/api/staff-examination/assignments/${assignmentId}/questions`).catch(() => null);
      }
      if (res && res.ok) {
        const data = await res.json();
        setMod4SelectedAssignmentQuestions(data || []);
      }
    } catch (err) {
      console.error('Failed to fetch assignment questions:', err);
    }
  };

  const saveMod4Assignment = async () => {
    if (!mod4NewAssignmentTitle.trim()) {
      showToast('Please enter an assignment title', 'error');
      return;
    }
    if (!mod4NewAssignmentSubject.trim()) {
      showToast('Please enter a subject name', 'error');
      return;
    }
    if (!mod4NewAssignmentConductDate) {
      showToast('Please select a conduct date and time', 'error');
      return;
    }

    const filledQuestions = mod4NewQuestions.filter(q => q.questionText.trim() !== '');
    if (filledQuestions.length === 0) {
      showToast('Please fill in at least one MCQ question', 'error');
      return;
    }

    const payload = {
      assignmentTitle: mod4NewAssignmentTitle.trim(),
      classStandard: mod4SelectedClass,
      sectionName: mod4SelectedSection.toUpperCase(),
      subject: mod4NewAssignmentSubject.trim(),
      conductDate: mod4NewAssignmentConductDate,
      questions: filledQuestions
    };

    try {
      const url = `http://localhost:8099/api/staff-examination/assignment/save`;
      let res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => null);

      if (!res || !res.ok) {
        res = await fetch(`http://localhost:8096/api/staff-examination/assignment/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(() => null);
      }

      if (res && res.ok) {
        showToast('Assignment saved successfully in database!', 'success');
        setMod4NewAssignmentTitle('');
        setMod4NewAssignmentSubject('');
        setMod4NewAssignmentConductDate('');
        setMod4NewQuestions(() => {
          const arr = [];
          for (let i = 1; i <= 50; i++) {
            arr.push({ questionNumber: i, questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A' });
          }
          return arr;
        });
        setMod4ViewMode('list');
        fetchMod4Assignments(mod4SelectedClass, mod4SelectedSection);
      } else {
        showToast('Failed to save assignment.', 'error');
      }
    } catch (err) {
      console.error('Error saving assignment:', err);
      showToast('Connection error saving assignment.', 'error');
    }
  };

  useEffect(() => {
    if (activeTab === 'module4') {
      fetchMod4Assignments(mod4SelectedClass, mod4SelectedSection);
    }
  }, [activeTab, mod4SelectedClass, mod4SelectedSection]);

  const getTeacherAssignedCount = (teacherName) => {
    if (!selectedClass) return 0;
    let count = 0;
    for (let s = 1; s <= 3; s++) {
      for (let p = 0; p < 8; p++) {
        if (p === 3) continue;
        const cellKey = selectedClass + '_' + s + '_' + p;
        if (scheduleGrid[cellKey]?.teacher === teacherName) {
          count++;
        }
      }
    }
    return count;
  };

  const getClassFaculty = () => {
    const secId = mod3SelectedSection === 'A' ? 1 : mod3SelectedSection === 'B' ? 2 : 3;
    const list = [];
    const seen = new Set();
    
    for (let p = 0; p < 8; p++) {
      if (p === 3) continue;
      const cellKey = `${mod3SelectedClass}_${secId}_${p}`;
      const cell = scheduleGrid[cellKey];
      if (cell && cell.teacher && cell.teacher !== 'Unassigned' && cell.teacher !== 'Lunch Break' && cell.sub && cell.sub !== 'General' && cell.sub !== 'Break') {
        const teacher = cell.teacher.trim();
        const subject = cell.sub.trim();
        const pairKey = `${teacher}-${subject}`;
        if (!seen.has(pairKey)) {
          seen.add(pairKey);
          list.push({ teacher, subject });
        }
      }
    }
    return list;
  };

  const handleStudentStatusUpdate = async (id, applicantType, newStatus, admissionId) => {
    const key = applicantType + '-' + id;
    setUpdatingStudentId(key);
    try {
      await fetch('http://localhost:8099/api/admin/admissions/' + id + '/status?applicantType=' + applicantType + '&status=' + newStatus, {
        method: 'PUT'
      });
      setStudentsList(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
    } catch (error) {
      setStudentsList(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
    } finally {
      setUpdatingStudentId(null);
    }
  };

  const handleDragStart = (e, teacherObj) => {
    e.dataTransfer.setData('application/json', JSON.stringify(teacherObj));
  };

  const fetchClassRooms = async () => {
    try {
      const response = await fetch('http://localhost:8099/api/staff-portal/classrooms');
      if (response.ok) {
        const data = await response.json();
        setClassRooms(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("Failed to fetch classrooms:", e);
    }
  };

  const handleDrop = (sectionNum, colIdx, teacherObj) => {
    if (!selectedClass) return;
    if (colIdx === 3) {
      showToast('Lunch period (12:00-1:00 PM) is reserved for recess.', 'warning');
      return;
    }
    setActivePeriodTab(colIdx);

    const currentCellKey = selectedClass + '_' + sectionNum + '_' + colIdx;
    const currentAssignment = scheduleGrid[currentCellKey];

    const classroomInfo = classRooms.find(r => r.classCode === `CLS_${selectedClass}_SEC_${sectionNum}`);
    const targetRoom = currentAssignment?.room_no || classroomInfo?.roomNo || ('Room ' + (100 + (selectedClass - 1) * 3 + sectionNum));

    for (let c = 1; c <= 12; c++) {
      for (let s = 1; s <= 3; s++) {
        if (c === selectedClass && s === sectionNum) continue;
        const otherCellKey = c + '_' + s + '_' + colIdx;
        const otherAssignment = scheduleGrid[otherCellKey];
        
        if (otherAssignment && otherAssignment.teacher && otherAssignment.teacher !== 'Unassigned') {
          if (otherAssignment.teacher === teacherObj.name) {
            showToast(`Conflict: ${teacherObj.name} is already assigned to Class ${c} Section ${s} during ${PERIOD_TIMINGS[colIdx]}!`, 'error');
            return;
          }
        }
        
        if (otherAssignment && otherAssignment.room_no) {
          if (otherAssignment.room_no.toLowerCase() === targetRoom.toLowerCase()) {
            showToast(`Room Conflict: ${targetRoom} is already allocated to Class ${c} Section ${s} during ${PERIOD_TIMINGS[colIdx]}!`, 'error');
            return;
          }
        }
      }
    }

    const currentCount = getTeacherAssignedCount(teacherObj.name);
    const isReplacingSelf = currentAssignment?.teacher === teacherObj.name;
    if (!isReplacingSelf && currentCount >= MAX_PERIODS_PER_TEACHER) {
      showToast('Workload Limit Exceeded: ' + teacherObj.name + ' has reached maximum ' + MAX_PERIODS_PER_TEACHER + ' periods for Class ' + selectedClass + '!', 'error');
      return;
    }

    setScheduleGrid(prev => ({
      ...prev,
      [currentCellKey]: {
        room_no: targetRoom,
        teacher: teacherObj.name,
        sub: teacherObj.subject
      }
    }));

    saveScheduleToDB(selectedClass, sectionNum, colIdx, targetRoom, teacherObj.name, teacherObj.subject);

    showToast('Assigned ' + teacherObj.name + ' (' + teacherObj.subject + ') to Section ' + sectionNum + ' Period ' + PERIOD_TIMINGS[colIdx], 'success');
  };

  const handleDropRoom = (sectionNum, colIdx, roomData) => {
    if (!selectedClass) return;
    if (colIdx === 3) {
      showToast('Lunch period (12:00-1:00 PM) is reserved for recess.', 'warning');
      return;
    }
    setActivePeriodTab(colIdx);

    const cellKey = selectedClass + '_' + sectionNum + '_' + colIdx;
    const targetRoom = roomData.roomNo;

    for (let c = 1; c <= 12; c++) {
      for (let s = 1; s <= 3; s++) {
        if (c === selectedClass && s === sectionNum) continue;
        const otherCellKey = c + '_' + s + '_' + colIdx;
        const otherAssignment = scheduleGrid[otherCellKey];
        
        if (otherAssignment && otherAssignment.room_no) {
          if (otherAssignment.room_no.toLowerCase() === targetRoom.toLowerCase()) {
            showToast(`Room Conflict: ${targetRoom} is already allocated to Class ${c} Section ${s} during ${PERIOD_TIMINGS[colIdx]}!`, 'error');
            return;
          }
        }
      }
    }

    setScheduleGrid(prev => ({
      ...prev,
      [cellKey]: {
        ...(prev[cellKey] || { teacher: 'Unassigned', sub: 'General' }),
        room_no: targetRoom
      }
    }));

    const existing = scheduleGrid[cellKey];
    saveScheduleToDB(
      selectedClass, 
      sectionNum, 
      colIdx, 
      targetRoom, 
      existing?.teacher || 'Unassigned', 
      existing?.sub || 'General'
    );

    showToast(`Allocated ${targetRoom} to Section ${sectionNum} Period ${PERIOD_TIMINGS[colIdx]}`, 'success');
  };

  const handleEditRoomNumber = (sectionNum, colIdx) => {
    if (!selectedClass) return;
    setActivePeriodTab(colIdx);
    const cellKey = selectedClass + '_' + sectionNum + '_' + colIdx;
    const classroomInfo = classRooms.find(r => r.classCode === `CLS_${selectedClass}_SEC_${sectionNum}`);
    const currentRoom = scheduleGrid[cellKey]?.room_no || classroomInfo?.roomNo || ('Room ' + (100 + (selectedClass - 1) * 3 + sectionNum));
    const newRoom = prompt('Enter Room Number for Period:', currentRoom);
    if (newRoom && newRoom.trim() !== '') {
      const trimmedRoom = newRoom.trim();
      
      for (let c = 1; c <= 12; c++) {
        for (let s = 1; s <= 3; s++) {
          if (c === selectedClass && s === sectionNum) continue;
          const otherCellKey = c + '_' + s + '_' + colIdx;
          const otherAssignment = scheduleGrid[otherCellKey];
          
          if (otherAssignment && otherAssignment.room_no) {
            if (otherAssignment.room_no.toLowerCase() === trimmedRoom.toLowerCase()) {
              showToast('Room Conflict: ' + trimmedRoom + ' is already allocated to Class ' + c + ' Section ' + s + ' during ' + PERIOD_TIMINGS[colIdx] + '!', 'error');
              return;
            }
          }
        }
      }

      setScheduleGrid(prev => ({
        ...prev,
        [cellKey]: {
          ...(prev[cellKey] || { teacher: 'Unassigned', sub: 'General' }),
          room_no: trimmedRoom
        }
      }));

      const existing = scheduleGrid[cellKey];
      saveScheduleToDB(
        selectedClass, 
        sectionNum, 
        colIdx, 
        trimmedRoom, 
        existing?.teacher || 'Unassigned', 
        existing?.sub || 'General'
      );
    }
  };

  const clearPeriodUnit = (sectionNum, colIdx) => {
    if (!selectedClass) return;
    setActivePeriodTab(colIdx);
    const cellKey = selectedClass + '_' + sectionNum + '_' + colIdx;
    setScheduleGrid(prev => ({
      ...prev,
      [cellKey]: null
    }));
    
    deleteScheduleFromDB(selectedClass, sectionNum, colIdx);
    showToast('Period assignment cleared.', 'info');
  };

  const assignTeacherToCell = (sectionNum, colIdx, teacherObj) => {
    handleDrop(sectionNum, colIdx, teacherObj);
  };

  const assignRoomToCell = (sectionNum, colIdx, roomObj) => {
    handleDropRoom(sectionNum, colIdx, roomObj);
  };

  const getFormattedDateWithDay = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
  };

  const modulesList = [
    { id: 'module1', title: 'Schedule', subtitle: 'Class Timetable & Faculty Schedule', icon: <Calendar size={18} color="var(--color-pricing-blue)" />, desc: 'Overview of teacher directory, period allocation count & conflict-free schedule grid.' },
    { id: 'module2', title: 'Student Directory', subtitle: 'All Students Data & Admissions', icon: <Users size={18} color="var(--color-ink)" />, desc: 'Student records: ID, Name, Parent Details, and Admission Status.' },
    { id: 'module3', title: 'Student Details', subtitle: 'Monthly Attendance Logs', icon: <UserCheck size={18} color="var(--color-apple-blue)" />, desc: 'Browse student monthly attendance logs and calculate percentage.' },
    { id: 'module4', title: 'Examinations', subtitle: 'Exams & MCQ Assignment Management', icon: <BookOpen size={18} color="var(--color-slate)" />, desc: 'Create, schedule, and view MCQ assignments for all 12 classes.' },
    { id: 'module5', title: 'Administration', subtitle: 'Reports & Analytics', icon: <Clock size={18} color="var(--color-steel)" />, desc: 'Administrative reporting and school analytics.' }
  ];

  const filteredTeachers = teachers.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const firstName = user?.firstName || 'Administrative';
  const lastName = user?.lastName || 'Staff';
  const email = user?.email || 'staff@school.com';
  const initialLetter = firstName.charAt(0).toUpperCase();

  return (
    <div style={{ width: '100%', margin: '0', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-20)' }}>
      
      {/* Toast Notification Banner */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          background: 'var(--color-ink)',
          color: 'var(--color-gallery-white)',
          padding: '12px 20px',
          borderRadius: 'var(--radius-pills)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: '500',
          fontSize: '13px',
          border: '1px solid var(--color-hairline-silver)'
        }}>
          <AlertCircle size={16} color="var(--color-pricing-blue)" />
          <span>{notification.msg}</span>
          <button onClick={() => setNotification(null)} style={{ background: 'transparent', border: 'none', color: 'var(--color-steel)', cursor: 'pointer', marginLeft: '6px' }}>
            <X size={14} />
          </button>
        </div>
      )}

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
                STAFF PORTAL
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-slate)', marginTop: '4px', margin: 0 }}>
              <Mail size={12} style={{ display: 'inline', marginRight: '5px' }} color="var(--color-steel)" />
              {email}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ background: 'var(--color-studio-mist)', padding: '8px 16px', borderRadius: '12px', border: '1px solid var(--color-control-gray)' }}>
            <div style={{ fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.04em' }}>ROLE</div>
            <div style={{ color: 'var(--color-ink)', fontWeight: '600', fontSize: '14px', marginTop: '2px' }}>
              Administrative Staff
            </div>
          </div>
        </div>
      </div>

      {/* Main Staff Portal Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '175px minmax(0, 1fr)', gap: 'var(--spacing-14)', alignItems: 'start', width: '100%' }}>
        
        {/* Left Module Sidebar Navigation */}
        <div
          style={{
            background: 'var(--color-gallery-white)',
            border: '1px solid var(--color-hairline-silver)',
            borderRadius: 'var(--radius-cards)',
            padding: 'var(--spacing-16)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--color-slate)', textTransform: 'uppercase', letterSpacing: '0.06em', paddingLeft: '6px', marginBottom: '8px' }}>
            STAFF MODULES
          </div>

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
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '12px',
                  background: isActive ? 'var(--color-studio-mist)' : 'transparent',
                  border: isActive ? '1px solid var(--color-pricing-blue)' : '1px solid transparent',
                  color: isActive ? 'var(--color-pricing-blue)' : 'var(--color-ink)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {mod.icon}
                  <span style={{ fontSize: '13px', fontWeight: isActive ? '600' : '400' }}>
                    {mod.title}
                  </span>
                </div>
                <ChevronRight size={13} style={{ opacity: isActive ? 1 : 0.3 }} />
              </button>
            );
          })}
        </div>

        {/* Right Content Workspace */}
        <div style={{ minWidth: 0, width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-16)' }}>
          {modulesList.map((mod) => {
            if (activeTab !== mod.id) return null;
            return (
              <div key={mod.id} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-16)', width: '100%', minWidth: 0 }}>
                
                {/* Module Header Card */}
                <div style={{
                  background: 'var(--color-gallery-white)',
                  border: '1px solid var(--color-hairline-silver)',
                  borderRadius: 'var(--radius-cards)',
                  padding: 'var(--spacing-20) var(--spacing-24)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 'var(--spacing-16)',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'var(--color-studio-mist)',
                        border: '1px solid var(--color-hairline-silver)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {mod.icon}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <h3 style={{ color: 'var(--color-ink)', fontSize: '18px', fontWeight: '600', margin: 0 }}>
                        {mod.title} – {mod.subtitle}
                      </h3>
                      <p style={{ color: 'var(--color-slate)', fontSize: '13px', margin: 0, marginTop: '2px' }}>
                        {mod.desc}
                      </p>
                    </div>
                  </div>

                  {/* Schedule Header Action Controls */}
                  {mod.id === 'module1' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        onClick={fetchTeachers}
                        className="btn-apple-outline"
                        style={{ padding: '5px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <RefreshCw size={13} className={loading ? 'spin' : ''} />
                        <span>Sync Teachers</span>
                      </button>

                      <button
                        onClick={() => setShowClassSidebar(!showClassSidebar)}
                        className="btn-apple-outline"
                        style={{ padding: '5px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Grid size={13} />
                        <span>{showClassSidebar ? 'Hide Classes' : 'Show Classes'}</span>
                      </button>

                      <div style={{ position: 'relative', minWidth: '180px' }}>
                        <input
                          type="text"
                          placeholder="Search teacher or subject..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="search-input"
                          style={{ padding: '5px 12px', fontSize: '12px', width: '100%', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* MODULE 1: TEACHER ALLOCATION TABLE + CLASS BOXES */}
                {mod.id === 'module1' ? (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: showClassSidebar ? '1fr 280px' : '1fr', gap: 'var(--spacing-14)', minWidth: 0 }}>
                      
                      {/* Left: Teacher Directory Table */}
                      <div style={{ background: 'var(--color-gallery-white)', borderRadius: 'var(--radius-cards)', border: '1px solid var(--color-hairline-silver)', padding: 'var(--spacing-20)', minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                          <h4 style={{ color: 'var(--color-ink)', fontSize: '14px', fontWeight: '600', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Users size={15} color="var(--color-pricing-blue)" />
                            <span>Teacher Directory & Workload</span>
                          </h4>
                          <span style={{ fontSize: '11px', background: 'var(--color-studio-mist)', color: 'var(--color-ink)', border: '1px solid var(--color-hairline-silver)', padding: '2px 8px', borderRadius: 'var(--radius-buttons)', fontWeight: '500' }}>
                            {filteredTeachers.length} Active Faculty
                          </span>
                        </div>

                        <div style={{ width: '100%', overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--color-ink)', fontSize: '13px' }}>
                            <thead>
                              <tr style={{ background: 'var(--color-paper-frost)', borderBottom: '1px solid var(--color-hairline-silver)', textTransform: 'uppercase', fontSize: '11px', color: 'var(--color-slate)', letterSpacing: '0.04em' }}>
                                <th style={{ padding: '9px 12px', textAlign: 'left' }}>Teacher Name</th>
                                <th style={{ padding: '9px 12px', textAlign: 'left' }}>Subject</th>
                                <th style={{ padding: '9px 12px', textAlign: 'center' }}>Periods Assigned</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredTeachers.length > 0 ? (
                                filteredTeachers.map((t, idx) => {
                                  const assignedCount = getTeacherAssignedCount(t.name);
                                  const isMax = assignedCount >= MAX_PERIODS_PER_TEACHER;
                                  const isSelected = activeTeacherClick?.id === t.id;

                                  return (
                                    <tr
                                      key={t.id || t.userId || t.name}
                                      draggable={!isMax}
                                      onDragStart={(e) => handleDragStart(e, t)}
                                      onClick={() => setActiveTeacherClick(isSelected ? null : t)}
                                      style={{
                                        cursor: isMax ? 'not-allowed' : 'grab',
                                        background: isSelected ? 'var(--color-studio-mist)' : idx % 2 === 0 ? 'var(--color-gallery-white)' : 'var(--color-studio-mist)',
                                        borderBottom: '1px solid var(--color-control-gray)'
                                      }}
                                    >
                                      <td style={{ padding: '9px 12px' }}>
                                        <strong style={{ color: 'var(--color-ink)', fontSize: '13px' }}>{t.name}</strong>
                                      </td>
                                      <td style={{ padding: '9px 12px' }}>
                                        <span style={{ background: 'var(--color-studio-mist)', color: 'var(--color-pricing-blue)', border: '1px solid var(--color-hairline-silver)', padding: '2px 8px', borderRadius: '8px', fontSize: '12px', fontWeight: '500' }}>
                                          {t.subject}
                                        </span>
                                      </td>
                                      <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                                        <span style={{
                                          fontSize: '11px',
                                          fontWeight: '600',
                                          padding: '2px 8px',
                                          borderRadius: '8px',
                                          background: isMax ? 'var(--color-studio-mist)' : 'var(--color-studio-mist)',
                                          color: isMax ? 'var(--color-launch-orange)' : 'var(--color-ink)',
                                          border: '1px solid var(--color-hairline-silver)'
                                        }}>
                                          {assignedCount} / {MAX_PERIODS_PER_TEACHER} {isMax ? '(FULL)' : 'Periods'}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })
                              ) : (
                                <tr>
                                  <td colSpan="3" style={{ textAlign: 'center', padding: '20px', color: 'var(--color-slate)' }}>
                                    No teacher records found in MySQL database table.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Right: 12 Class Boxes */}
                      {showClassSidebar && (
                        <div style={{ background: 'var(--color-gallery-white)', borderRadius: 'var(--radius-cards)', border: '1px solid var(--color-hairline-silver)', padding: 'var(--spacing-20)', minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                            <h4 style={{ color: 'var(--color-ink)', fontSize: '14px', fontWeight: '600', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Building size={15} color="var(--color-pricing-blue)" />
                              <span>Class Standards (1 to 12)</span>
                            </h4>
                            <span style={{ fontSize: '11px', color: 'var(--color-slate)' }}>12 Classes</span>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => {
                              const isSelected = selectedClass === num;
                              return (
                                <button
                                  key={num}
                                  onClick={() => setSelectedClass(num)}
                                  style={{
                                    background: isSelected ? 'var(--color-ink)' : 'var(--color-studio-mist)',
                                    border: isSelected ? '1px solid var(--color-ink)' : '1px solid var(--color-control-gray)',
                                    borderRadius: '12px',
                                    padding: '9px 4px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                  }}
                                >
                                  <div style={{ fontSize: '10px', color: isSelected ? 'var(--color-steel)' : 'var(--color-slate)', fontWeight: '600', textTransform: 'uppercase' }}>Class</div>
                                  <div style={{ fontSize: '15px', fontWeight: '600', color: isSelected ? 'var(--color-gallery-white)' : 'var(--color-ink)', marginTop: '2px' }}>{num}</div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Class Timetable Grid & Date Navigation */}
                    {selectedClass && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-16)', marginTop: '4px', width: '100%' }}>
                        
                        {/* Timetable Header Card */}
                        <div
                          style={{
                            background: 'var(--color-gallery-white)',
                            border: '1px solid var(--color-hairline-silver)',
                            borderRadius: 'var(--radius-cards)',
                            padding: 'var(--spacing-16) var(--spacing-20)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 'var(--spacing-12)'
                          }}
                        >
                          <div>
                            <h4 style={{ color: 'var(--color-ink)', fontSize: '17px', fontWeight: '600', margin: 0 }}>
                              Class {selectedClass} Timetable Schedule
                            </h4>
                            <p style={{ color: 'var(--color-slate)', fontSize: '12px', margin: '3px 0 0 0' }}>
                              Date: <strong style={{ color: 'var(--color-ink)' }}>{getFormattedDateWithDay(selectedDate)}</strong>
                            </p>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-studio-mist)', padding: '4px 10px', borderRadius: 'var(--radius-inputs)', border: '1px solid var(--color-steel)' }}>
                              <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                style={{ background: 'transparent', color: 'var(--color-ink)', border: 'none', fontSize: '12px', fontWeight: '500', outline: 'none' }}
                              />
                            </div>
                            
                            <button onClick={handleNavigateYesterday} className="btn-apple-outline" style={{ padding: '5px 12px', fontSize: '12px' }}>
                              ‹ Yesterday
                            </button>
                            <button onClick={handleNavigateToday} className="btn-apple-outline" style={{ padding: '5px 12px', fontSize: '12px', borderColor: 'var(--color-pricing-blue)', color: 'var(--color-pricing-blue)' }}>
                              Today
                            </button>
                            <button onClick={handleNavigateTomorrow} className="btn-apple-outline" style={{ padding: '5px 12px', fontSize: '12px' }}>
                              Tomorrow ›
                            </button>
                          </div>
                        </div>

                        {/* 3 Sections Timetable Cards (A, B, C) */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-16)', width: '100%' }}>
                          {[1, 2, 3].map((sectionNum) => {
                            const secLetter = sectionNum === 1 ? 'A' : sectionNum === 2 ? 'B' : 'C';
                            return (
                              <div
                                key={sectionNum}
                                style={{
                                  background: 'var(--color-gallery-white)',
                                  border: '1px solid var(--color-hairline-silver)',
                                  borderRadius: 'var(--radius-cards)',
                                  overflow: 'hidden',
                                  width: '100%'
                                }}
                              >
                                <div style={{ padding: '12px 18px', background: 'var(--color-studio-mist)', borderBottom: '1px solid var(--color-control-gray)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <h5 style={{ color: 'var(--color-ink)', margin: 0, fontSize: '14px', fontWeight: '600' }}>
                                    Class {selectedClass} — Section {secLetter}
                                  </h5>
                                  <span style={{ fontSize: '11px', color: 'var(--color-slate)' }}>8 Daily Slots</span>
                                </div>

                                <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                                  <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', color: 'var(--color-ink)', fontSize: '11px' }}>
                                    <thead>
                                      <tr style={{ background: 'var(--color-paper-frost)', borderBottom: '1px solid var(--color-hairline-silver)', textTransform: 'uppercase', fontSize: '9.5px', color: 'var(--color-slate)', letterSpacing: '0.02em' }}>
                                        {PERIOD_TIMINGS.map((timing, pIdx) => (
                                          <th key={pIdx} style={{ padding: '7px 2px', textAlign: 'center', width: '12.5%', whiteSpace: 'nowrap' }}>
                                            {timing}
                                          </th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      <tr>
                                        {PERIOD_TIMINGS.map((timing, pIdx) => {
                                          const cellKey = selectedClass + '_' + sectionNum + '_' + pIdx;
                                          const cellData = scheduleGrid[cellKey];

                                          if (pIdx === 3) {
                                            return (
                                              <td key={pIdx} style={{ padding: '8px 2px', textAlign: 'center', background: 'var(--color-studio-mist)', borderRight: '1px solid var(--color-control-gray)', color: 'var(--color-slate)', fontWeight: '500', fontSize: '11px', whiteSpace: 'nowrap' }}>
                                                Lunch Break
                                              </td>
                                            );
                                          }

                                          return (
                                            <td
                                              key={pIdx}
                                              onDragOver={(e) => e.preventDefault()}
                                              onDrop={(e) => {
                                                const roomTransfer = e.dataTransfer.getData('application/room-transfer');
                                                if (roomTransfer) {
                                                  handleDropRoom(sectionNum, pIdx, JSON.parse(roomTransfer));
                                                  return;
                                                }
                                                const teacherData = e.dataTransfer.getData('application/json');
                                                if (teacherData) {
                                                  handleDrop(sectionNum, pIdx, JSON.parse(teacherData));
                                                }
                                              }}
                                              onClick={() => {
                                                if (activeTeacherClick) {
                                                  assignTeacherToCell(sectionNum, pIdx, activeTeacherClick);
                                                } else if (activeRoomClick) {
                                                  assignRoomToCell(sectionNum, pIdx, activeRoomClick);
                                                }
                                              }}
                                              style={{
                                                padding: '8px 2px',
                                                textAlign: 'center',
                                                borderRight: '1px solid var(--color-control-gray)',
                                                background: cellData ? 'var(--color-gallery-white)' : 'var(--color-studio-mist)',
                                                cursor: (activeTeacherClick || activeRoomClick) ? 'pointer' : 'default',
                                                verticalAlign: 'middle',
                                                overflow: 'hidden'
                                              }}
                                            >
                                              {cellData ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }}>
                                                  <div style={{ fontWeight: '600', color: 'var(--color-ink)', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                                                    {cellData.teacher}
                                                  </div>
                                                  <div style={{ color: 'var(--color-pricing-blue)', fontSize: '10.5px', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                                                    {cellData.sub}
                                                  </div>
                                                  <div
                                                    onClick={(e) => { e.stopPropagation(); handleEditRoomNumber(sectionNum, pIdx); }}
                                                    style={{ fontSize: '9.5px', color: 'var(--color-slate)', border: '1px solid var(--color-hairline-silver)', padding: '1px 4px', borderRadius: '4px', cursor: 'pointer' }}
                                                    title="Click to edit room"
                                                  >
                                                    {cellData.room_no || 'Room'}
                                                  </div>
                                                  <button
                                                    onClick={(e) => { e.stopPropagation(); clearPeriodUnit(sectionNum, pIdx); }}
                                                    style={{ background: 'transparent', border: 'none', color: 'var(--color-steel)', cursor: 'pointer', fontSize: '9.5px', marginTop: '1px' }}
                                                    title="Clear Slot"
                                                  >
                                                    Clear
                                                  </button>
                                                </div>
                                              ) : (
                                                <div style={{ color: 'var(--color-steel)', fontSize: '11px', padding: '6px 0', fontStyle: 'italic', letterSpacing: '-0.2px' }}>
                                                  Available
                                                </div>
                                              )}
                                            </td>
                                          );
                                        })}
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                ) : mod.id === 'module2' ? (
                  /* MODULE 2: STUDENT DIRECTORY */
                  <div style={{ background: 'var(--color-gallery-white)', borderRadius: 'var(--radius-cards)', border: '1px solid var(--color-hairline-silver)', padding: 'var(--spacing-20)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <input
                          type="text"
                          placeholder="Search students by name, ID or parent..."
                          value={studentSearchQuery}
                          onChange={(e) => setStudentSearchQuery(e.target.value)}
                          className="search-input"
                          style={{ width: '280px', boxSizing: 'border-box' }}
                        />

                        <select
                          value={studentStatusFilter}
                          onChange={(e) => setStudentStatusFilter(e.target.value)}
                          className="search-input"
                          style={{ width: 'auto', cursor: 'pointer' }}
                        >
                          <option value="ALL">All Statuses</option>
                          <option value="ACCEPTED">Accepted</option>
                          <option value="REJECTED">Rejected</option>
                          <option value="PENDING">Pending</option>
                        </select>
                      </div>

                      <span style={{ fontSize: '13px', color: 'var(--color-slate)' }}>
                        Total: <strong style={{ color: 'var(--color-ink)' }}>{studentsList.length}</strong>
                      </span>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--color-ink)', fontSize: '13px' }}>
                        <thead>
                          <tr style={{ background: 'var(--color-paper-frost)', borderBottom: '1px solid var(--color-hairline-silver)', textTransform: 'uppercase', fontSize: '11px', color: 'var(--color-slate)', letterSpacing: '0.04em' }}>
                            <th style={{ padding: '12px 14px', textAlign: 'left' }}>Student ID</th>
                            <th style={{ padding: '12px 14px', textAlign: 'left' }}>First Name</th>
                            <th style={{ padding: '12px 14px', textAlign: 'left' }}>Last Name</th>
                            <th style={{ padding: '12px 14px', textAlign: 'left' }}>Username</th>
                            <th style={{ padding: '12px 14px', textAlign: 'left' }}>Parent Name</th>
                            <th style={{ padding: '12px 14px', textAlign: 'left' }}>Email</th>
                            <th style={{ padding: '12px 14px', textAlign: 'center' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentsLoading ? (
                            <tr>
                              <td colSpan="7" style={{ textAlign: 'center', padding: '32px', color: 'var(--color-slate)' }}>
                                Loading students data...
                              </td>
                            </tr>
                          ) : (
                            studentsList
                              .filter(item => {
                                const q = studentSearchQuery.toLowerCase();
                                const stuId = (item.admissionId || ('ADM-' + item.id)).toLowerCase();
                                const fName = (item.firstName || '').toLowerCase();
                                const lName = (item.lastName || '').toLowerCase();
                                const matchesQuery = stuId.includes(q) || fName.includes(q) || lName.includes(q);
                                const matchesStatus = studentStatusFilter === 'ALL' || item.status === studentStatusFilter;
                                return matchesQuery && matchesStatus;
                              })
                              .map((stu, idx) => (
                                <tr key={stu.id} style={{ borderBottom: '1px solid var(--color-control-gray)', background: idx % 2 === 0 ? 'var(--color-gallery-white)' : 'var(--color-studio-mist)' }}>
                                  <td style={{ padding: '12px 14px', fontWeight: '600', color: 'var(--color-pricing-blue)' }}>
                                    {stu.admissionId || ('ADM-' + stu.id)}
                                  </td>
                                  <td style={{ padding: '12px 14px', fontWeight: '500', color: 'var(--color-ink)' }}>
                                    {stu.firstName || '—'}
                                  </td>
                                  <td style={{ padding: '12px 14px', fontWeight: '500', color: 'var(--color-ink)' }}>
                                    {stu.lastName || '—'}
                                  </td>
                                  <td style={{ padding: '12px 14px', color: 'var(--color-slate)' }}>
                                    @{stu.username || stu.firstName?.toLowerCase() || 'student'}
                                  </td>
                                  <td style={{ padding: '12px 14px', color: 'var(--color-ink)' }}>
                                    {stu.parentName || '—'}
                                  </td>
                                  <td style={{ padding: '12px 14px', color: 'var(--color-slate)' }}>
                                    {stu.parentEmail || stu.email || '—'}
                                  </td>
                                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                    <span style={{
                                      fontSize: '11px',
                                      fontWeight: '600',
                                      padding: '3px 10px',
                                      borderRadius: 'var(--radius-buttons)',
                                      background: 'var(--color-studio-mist)',
                                      color: stu.status === 'ACCEPTED' ? 'var(--color-pricing-blue)' : stu.status === 'REJECTED' ? 'var(--color-launch-orange)' : 'var(--color-slate)',
                                      border: '1px solid var(--color-hairline-silver)'
                                    }}>
                                      {stu.status || 'PENDING'}
                                    </span>
                                  </td>
                                </tr>
                              ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : mod.id === 'module3' ? (
                  /* MODULE 3: STUDENT DETAILS & ATTENDANCE */
                  <div style={{ background: 'var(--color-gallery-white)', borderRadius: 'var(--radius-cards)', border: '1px solid var(--color-hairline-silver)', padding: 'var(--spacing-24)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-20)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-studio-mist)', padding: '4px 10px', borderRadius: 'var(--radius-inputs)', border: '1px solid var(--color-steel)' }}>
                          <span style={{ fontSize: '12px', color: 'var(--color-slate)', fontWeight: '600' }}>Class:</span>
                          <select
                            value={mod3SelectedClass}
                            onChange={(e) => setMod3SelectedClass(parseInt(e.target.value))}
                            style={{ background: 'transparent', color: 'var(--color-ink)', border: 'none', fontSize: '12px', fontWeight: '500', outline: 'none', cursor: 'pointer' }}
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                              <option key={num} value={num}>Class {num}</option>
                            ))}
                          </select>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-studio-mist)', padding: '4px 10px', borderRadius: 'var(--radius-inputs)', border: '1px solid var(--color-steel)' }}>
                          <span style={{ fontSize: '12px', color: 'var(--color-slate)', fontWeight: '600' }}>Section:</span>
                          <select
                            value={mod3SelectedSection}
                            onChange={(e) => setMod3SelectedSection(e.target.value)}
                            style={{ background: 'transparent', color: 'var(--color-ink)', border: 'none', fontSize: '12px', fontWeight: '500', outline: 'none', cursor: 'pointer' }}
                          >
                            {['A', 'B', 'C'].map(sec => (
                              <option key={sec} value={sec}>Section {sec}</option>
                            ))}
                          </select>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-studio-mist)', padding: '4px 10px', borderRadius: 'var(--radius-inputs)', border: '1px solid var(--color-steel)' }}>
                          <span style={{ fontSize: '12px', color: 'var(--color-slate)', fontWeight: '600' }}>Month:</span>
                          <select
                            value={mod3SelectedMonth}
                            onChange={(e) => setMod3SelectedMonth(parseInt(e.target.value))}
                            style={{ background: 'transparent', color: 'var(--color-ink)', border: 'none', fontSize: '12px', fontWeight: '500', outline: 'none', cursor: 'pointer' }}
                          >
                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, idx) => (
                              <option key={idx + 1} value={idx + 1}>{m}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <input
                        type="text"
                        placeholder="Search student..."
                        value={mod3SearchQuery}
                        onChange={(e) => setMod3SearchQuery(e.target.value)}
                        className="search-input"
                        style={{ width: '220px', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--color-ink)', fontSize: '13px' }}>
                        <thead>
                          <tr style={{ background: 'var(--color-paper-frost)', borderBottom: '1px solid var(--color-hairline-silver)', textTransform: 'uppercase', fontSize: '11px', color: 'var(--color-slate)', letterSpacing: '0.04em' }}>
                            <th style={{ padding: '12px 14px', textAlign: 'left' }}>Student ID</th>
                            <th style={{ padding: '12px 14px', textAlign: 'left' }}>Student Name</th>
                            <th style={{ padding: '12px 14px', textAlign: 'left' }}>Parent Name</th>
                            <th style={{ padding: '12px 14px', textAlign: 'center' }}>Present Days</th>
                            <th style={{ padding: '12px 14px', textAlign: 'center' }}>Absent Days</th>
                            <th style={{ padding: '12px 14px', textAlign: 'center' }}>Attendance %</th>
                            <th style={{ padding: '12px 14px', textAlign: 'center' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mod3Loading ? (
                            <tr>
                              <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: 'var(--color-slate)' }}>
                                Loading student records...
                              </td>
                            </tr>
                          ) : (
                            mod3Students
                              .filter(s =>
                                (s.firstName || '').toLowerCase().includes(mod3SearchQuery.toLowerCase()) ||
                                (s.lastName || '').toLowerCase().includes(mod3SearchQuery.toLowerCase()) ||
                                (s.studentId || '').toLowerCase().includes(mod3SearchQuery.toLowerCase())
                              )
                              .map((stu, idx) => {
                                const studentRecs = mod3AttendanceRecords.filter(r => r.studentId === stu.studentId);
                                const presentCount = studentRecs.filter(r => r.status === 'PRESENT').length;
                                const absentCount = studentRecs.filter(r => r.status === 'ABSENT').length;
                                const totalDays = studentRecs.length;
                                const percentage = totalDays > 0 ? Math.round((presentCount / totalDays) * 100) + '%' : '0%';

                                return (
                                  <tr key={stu.id || idx} style={{ borderBottom: '1px solid var(--color-control-gray)', background: idx % 2 === 0 ? 'var(--color-gallery-white)' : 'var(--color-studio-mist)' }}>
                                    <td style={{ padding: '12px 14px', fontWeight: '600', color: 'var(--color-pricing-blue)' }}>
                                      {stu.studentId}
                                    </td>
                                    <td style={{ padding: '12px 14px', fontWeight: '500', color: 'var(--color-ink)' }}>
                                      {stu.firstName} {stu.lastName}
                                    </td>
                                    <td style={{ padding: '12px 14px', color: 'var(--color-slate)' }}>
                                      {stu.parentName}
                                    </td>
                                    <td style={{ padding: '12px 14px', textAlign: 'center', color: 'var(--color-pricing-blue)', fontWeight: '600' }}>
                                      {presentCount}
                                    </td>
                                    <td style={{ padding: '12px 14px', textAlign: 'center', color: 'var(--color-launch-orange)', fontWeight: '600' }}>
                                      {absentCount}
                                    </td>
                                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                      <span style={{ background: 'var(--color-studio-mist)', color: 'var(--color-ink)', border: '1px solid var(--color-hairline-silver)', padding: '2px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: '600' }}>
                                        {percentage}
                                      </span>
                                    </td>
                                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                      <button
                                        onClick={() => {
                                          setSelectedStudentDetail(stu);
                                          setDetailModalMonth(mod3SelectedMonth);
                                          setDetailModalYear(mod3SelectedYear);
                                        }}
                                        className="btn-apple-outline"
                                        style={{ padding: '4px 12px', fontSize: '12px' }}
                                      >
                                        View Log
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : mod.id === 'module4' ? (
                  /* MODULE 4: EXAMINATIONS */
                  <div style={{ background: 'var(--color-gallery-white)', borderRadius: 'var(--radius-cards)', border: '1px solid var(--color-hairline-silver)', padding: 'var(--spacing-24)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-20)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-studio-mist)', padding: '4px 10px', borderRadius: 'var(--radius-inputs)', border: '1px solid var(--color-steel)' }}>
                          <span style={{ fontSize: '12px', color: 'var(--color-slate)', fontWeight: '600' }}>Class:</span>
                          <select
                            value={mod4SelectedClass}
                            onChange={(e) => setMod4SelectedClass(parseInt(e.target.value))}
                            style={{ background: 'transparent', color: 'var(--color-ink)', border: 'none', fontSize: '12px', fontWeight: '500', outline: 'none', cursor: 'pointer' }}
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(c => (
                              <option key={c} value={c}>{c} Standard</option>
                            ))}
                          </select>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-studio-mist)', padding: '4px 10px', borderRadius: 'var(--radius-inputs)', border: '1px solid var(--color-steel)' }}>
                          <span style={{ fontSize: '12px', color: 'var(--color-slate)', fontWeight: '600' }}>Section:</span>
                          <select
                            value={mod4SelectedSection}
                            onChange={(e) => setMod4SelectedSection(e.target.value.toUpperCase())}
                            style={{ background: 'transparent', color: 'var(--color-ink)', border: 'none', fontSize: '12px', fontWeight: '500', outline: 'none', cursor: 'pointer' }}
                          >
                            {['A', 'B', 'C'].map(sec => (
                              <option key={sec} value={sec}>Section {sec}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        {mod4ViewMode === 'list' ? (
                          <button
                            onClick={() => setMod4ViewMode('create')}
                            className="btn-apple-primary"
                            style={{ padding: '6px 16px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                          >
                            <Plus size={14} /> Create Assignment
                          </button>
                        ) : (
                          <button
                            onClick={() => setMod4ViewMode('list')}
                            className="btn-apple-outline"
                            style={{ padding: '6px 16px', fontSize: '12px' }}
                          >
                            Back to List
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Mod 4 List View */}
                    {mod4ViewMode === 'list' && (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--color-ink)', fontSize: '13px' }}>
                          <thead>
                            <tr style={{ background: 'var(--color-paper-frost)', borderBottom: '1px solid var(--color-hairline-silver)', textTransform: 'uppercase', fontSize: '11px', color: 'var(--color-slate)', letterSpacing: '0.04em' }}>
                              <th style={{ padding: '12px 14px', textAlign: 'left' }}>Title</th>
                              <th style={{ padding: '12px 14px', textAlign: 'left' }}>Subject</th>
                              <th style={{ padding: '12px 14px', textAlign: 'center' }}>Class & Sec</th>
                              <th style={{ padding: '12px 14px', textAlign: 'center' }}>Questions</th>
                              <th style={{ padding: '12px 14px', textAlign: 'center' }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {mod4Loading ? (
                              <tr>
                                <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: 'var(--color-slate)' }}>Loading assignments...</td>
                              </tr>
                            ) : mod4Assignments.length === 0 ? (
                              <tr>
                                <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: 'var(--color-slate)' }}>No assignments recorded for this class.</td>
                              </tr>
                            ) : (
                              mod4Assignments.map((asm, idx) => (
                                <tr key={asm.id || idx} style={{ borderBottom: '1px solid var(--color-control-gray)', background: idx % 2 === 0 ? 'var(--color-gallery-white)' : 'var(--color-studio-mist)' }}>
                                  <td style={{ padding: '12px 14px', fontWeight: '600', color: 'var(--color-ink)' }}>{asm.assignmentTitle}</td>
                                  <td style={{ padding: '12px 14px', color: 'var(--color-pricing-blue)', fontWeight: '500' }}>{asm.subject}</td>
                                  <td style={{ padding: '12px 14px', textAlign: 'center', color: 'var(--color-slate)' }}>C{asm.classStandard} - {asm.sectionName}</td>
                                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>{asm.questions?.length || 0} MCQs</td>
                                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                                    <button
                                      onClick={() => {
                                        setMod4SelectedAssignment(asm);
                                        setMod4ViewMode('view');
                                        fetchMod4AssignmentQuestions(asm.id);
                                      }}
                                      className="btn-apple-outline"
                                      style={{ padding: '4px 12px', fontSize: '12px' }}
                                    >
                                      View Details
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Mod 4 Create Mode */}
                    {mod4ViewMode === 'create' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-16)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                          <div>
                            <label style={{ display: 'block', color: 'var(--color-slate)', fontSize: '12px', marginBottom: '4px' }}>Assignment Title</label>
                            <input
                              type="text"
                              placeholder="e.g. Unit Test 1"
                              value={mod4NewAssignmentTitle}
                              onChange={(e) => setMod4NewAssignmentTitle(e.target.value)}
                              className="search-input"
                              style={{ width: '100%', boxSizing: 'border-box' }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', color: 'var(--color-slate)', fontSize: '12px', marginBottom: '4px' }}>Subject Name</label>
                            <input
                              type="text"
                              placeholder="e.g. Mathematics"
                              value={mod4NewAssignmentSubject}
                              onChange={(e) => setMod4NewAssignmentSubject(e.target.value)}
                              className="search-input"
                              style={{ width: '100%', boxSizing: 'border-box' }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', color: 'var(--color-slate)', fontSize: '12px', marginBottom: '4px' }}>Conduct Date & Time</label>
                            <input
                              type="datetime-local"
                              value={mod4NewAssignmentConductDate}
                              onChange={(e) => setMod4NewAssignmentConductDate(e.target.value)}
                              className="search-input"
                              style={{ width: '100%', boxSizing: 'border-box' }}
                            />
                          </div>
                        </div>

                        {/* Questions list */}
                        <div style={{ maxHeight: '420px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '6px' }}>
                          {mod4NewQuestions.slice(0, 10).map((q, idx) => (
                            <div key={idx} style={{ background: 'var(--color-studio-mist)', padding: '14px', borderRadius: '12px', border: '1px solid var(--color-hairline-silver)' }}>
                              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-ink)', marginBottom: '8px' }}>
                                Question {q.questionNumber}
                              </div>
                              <input
                                type="text"
                                placeholder={`Enter question text #${q.questionNumber}`}
                                value={q.questionText}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setMod4NewQuestions(prev => prev.map(item => item.questionNumber === q.questionNumber ? { ...item, questionText: val } : item));
                                }}
                                className="search-input"
                                style={{ width: '100%', marginBottom: '8px', boxSizing: 'border-box' }}
                              />
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                                <input
                                  type="text"
                                  placeholder="Option A"
                                  value={q.optionA}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setMod4NewQuestions(prev => prev.map(item => item.questionNumber === q.questionNumber ? { ...item, optionA: val } : item));
                                  }}
                                  className="search-input"
                                  style={{ width: '100%', boxSizing: 'border-box' }}
                                />
                                <input
                                  type="text"
                                  placeholder="Option B"
                                  value={q.optionB}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setMod4NewQuestions(prev => prev.map(item => item.questionNumber === q.questionNumber ? { ...item, optionB: val } : item));
                                  }}
                                  className="search-input"
                                  style={{ width: '100%', boxSizing: 'border-box' }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                          <button onClick={() => setMod4ViewMode('list')} className="btn-apple-outline" style={{ padding: '8px 18px', fontSize: '13px' }}>
                            Cancel
                          </button>
                          <button onClick={saveMod4Assignment} className="btn-apple-primary" style={{ padding: '8px 18px', fontSize: '13px' }}>
                            Save Assignment
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* MODULE 5 WORKSPACE PLACEHOLDER */
                  <div style={{ background: 'var(--color-gallery-white)', borderRadius: 'var(--radius-cards)', border: '1px solid var(--color-hairline-silver)', padding: 'var(--spacing-28)', textAlign: 'center' }}>
                    <div style={{ background: 'var(--color-studio-mist)', border: '1px dashed var(--color-hairline-silver)', borderRadius: '20px', padding: '48px 20px' }}>
                      <h4 style={{ color: 'var(--color-ink)', fontSize: '16px', fontWeight: '600', margin: 0 }}>
                        {mod.subtitle}
                      </h4>
                      <p style={{ color: 'var(--color-slate)', fontSize: '13px', marginTop: '6px', maxWidth: '400px', margin: '6px auto 0 auto', lineHeight: '1.5' }}>
                        This module workspace is currently synchronized with staff administrative systems.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ATTENDANCE DETAIL MODAL (Apple Flat Gallery White Dialog) */}
      {selectedStudentDetail && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            boxSizing: 'border-box',
            padding: '20px'
          }}
        >
          <div
            style={{
              background: 'var(--color-gallery-white)',
              border: '1px solid var(--color-hairline-silver)',
              borderRadius: 'var(--radius-cards)',
              width: '100%',
              maxWidth: '520px',
              padding: 'var(--spacing-28)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h4 style={{ color: 'var(--color-ink)', fontSize: '18px', fontWeight: '600', margin: 0 }}>
                  Attendance Log Details
                </h4>
                <p style={{ color: 'var(--color-slate)', fontSize: '13px', margin: '4px 0 0 0' }}>
                  Student: <strong style={{ color: 'var(--color-ink)' }}>{selectedStudentDetail.firstName} {selectedStudentDetail.lastName}</strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedStudentDetail(null)}
                className="btn-apple-outline"
                style={{ padding: '4px 8px', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={14} />
              </button>
            </div>

            <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
              {studentDetailLoading ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-slate)' }}>Fetching daily logs...</div>
              ) : selectedStudentAttendance.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-slate)', fontSize: '13px' }}>
                  No attendance records found for this student in the selected month.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', color: 'var(--color-ink)' }}>
                  <thead>
                    <tr style={{ background: 'var(--color-studio-mist)', borderBottom: '1px solid var(--color-hairline-silver)', color: 'var(--color-slate)', fontSize: '11px', textTransform: 'uppercase' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Date</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedStudentAttendance.map((record, rIdx) => (
                      <tr key={record.id || rIdx} style={{ borderBottom: '1px solid var(--color-control-gray)', background: rIdx % 2 === 0 ? 'var(--color-gallery-white)' : 'var(--color-studio-mist)' }}>
                        <td style={{ padding: '8px 12px', color: 'var(--color-ink)' }}>{record.attendanceDate}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                          <span style={{ fontSize: '11px', fontWeight: '600', color: record.status === 'PRESENT' ? 'var(--color-pricing-blue)' : 'var(--color-launch-orange)' }}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--color-control-gray)', paddingTop: '12px' }}>
              <button
                onClick={() => setSelectedStudentDetail(null)}
                className="btn-apple-outline"
                style={{ padding: '6px 16px', fontSize: '13px' }}
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
