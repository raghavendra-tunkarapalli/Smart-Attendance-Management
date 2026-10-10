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
  AlertCircle,
  GripVertical,
  Coffee,
  User,
  Layers,
  Activity
} from 'lucide-react';
import StaffExaminationModule from './StaffExaminationModule';

export default function StaffPortalModule({ user }) {
  const [activeTab, setActiveTab] = useState('module1');
  const [selectedClass, setSelectedClass] = useState(1);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState(null);
  const [dragOverCell, setDragOverCell] = useState(null);
  const [trackerSelectedPeriod, setTrackerSelectedPeriod] = useState(0);

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
  const [boardActiveTab, setBoardActiveTab] = useState('teachers'); // 'teachers' | 'rooms'
  const [availableRoomsList, setAvailableRoomsList] = useState(() => {
    const list = [];
    for (let i = 101; i <= 136; i++) {
      list.push(`Room ${i}`);
    }
    list.push('Physics Lab', 'Chemistry Lab', 'Biology Lab', 'Computer Lab', 'Library', 'Seminar Hall');
    return list;
  });

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

  const getRoomOccupancyInfo = (roomNum, periodIdx) => {
    if (periodIdx === 3) {
      return { isOccupied: false, isLunch: true, label: 'Lunch', color: '#a16207', bg: '#fefce8', border: '#fef08a' };
    }
    const roomName = `Room ${roomNum}`;
    const roomNumStr = `${roomNum}`;

    for (let c = 1; c <= 12; c++) {
      for (let s = 1; s <= 3; s++) {
        const cell = scheduleGrid[`${c}_${s}_${periodIdx}`];
        if (cell && cell.room_no && cell.room_no.trim() !== '' && cell.room_no !== 'Recess') {
          const rNorm = cell.room_no.trim().toLowerCase();
          if (rNorm === roomName.toLowerCase() || rNorm === roomNumStr.toLowerCase()) {
            const secLetter = s === 1 ? 'A' : s === 2 ? 'B' : 'C';
            return {
              isOccupied: true,
              isLunch: false,
              label: 'Filled',
              detail: `C${c}-${secLetter}`,
              teacher: cell.teacher && cell.teacher !== 'Unassigned' ? cell.teacher : null,
              color: '#16a34a',
              bg: '#f0fdf4',
              border: '#bbf7d0',
              assignedClass: c,
              assignedSection: s
            };
          }
        }
      }
    }
    return {
      isOccupied: false,
      isLunch: false,
      label: 'Vacant',
      detail: null,
      color: 'var(--color-steel)',
      bg: 'var(--color-paper-frost)',
      border: 'var(--color-hairline-silver)'
    };
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
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'TEACHER', name: teacherObj.name, subject: teacherObj.subject }));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragStartRoom = (e, roomName) => {
    e.dataTransfer.setData('application/room-transfer', JSON.stringify({ roomNo: roomName }));
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'ROOM', roomNo: roomName }));
    e.dataTransfer.effectAllowed = 'copy';
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
    const targetRoom = currentAssignment?.room_no || '';

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
        
        if (targetRoom && targetRoom.trim() !== '' && otherAssignment && otherAssignment.room_no) {
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
    const targetRoom = typeof roomData === 'string' ? roomData : (roomData?.roomNo || roomData?.name || '');
    if (!targetRoom || targetRoom.trim() === '') return;

    const trimmedRoom = targetRoom.trim();

    for (let c = 1; c <= 12; c++) {
      for (let s = 1; s <= 3; s++) {
        if (c === selectedClass && s === sectionNum) continue;
        const otherCellKey = c + '_' + s + '_' + colIdx;
        const otherAssignment = scheduleGrid[otherCellKey];
        
        if (otherAssignment && otherAssignment.room_no) {
          if (otherAssignment.room_no.toLowerCase() === trimmedRoom.toLowerCase()) {
            showToast(`Room Conflict: ${trimmedRoom} is already allocated to Class ${c} Section ${s} during ${PERIOD_TIMINGS[colIdx]}!`, 'error');
            return;
          }
        }
      }
    }

    const existing = scheduleGrid[cellKey];
    setScheduleGrid(prev => ({
      ...prev,
      [cellKey]: {
        ...(existing || { teacher: 'Unassigned', sub: 'General' }),
        room_no: trimmedRoom
      }
    }));

    saveScheduleToDB(
      selectedClass, 
      sectionNum, 
      colIdx, 
      trimmedRoom, 
      existing?.teacher || 'Unassigned', 
      existing?.sub || 'General'
    );

    showToast(`Allocated ${trimmedRoom} to Class ${selectedClass} Section ${sectionNum} (Period ${PERIOD_TIMINGS[colIdx]})`, 'success');
  };

  const handleEditRoomNumber = (sectionNum, colIdx) => {
    if (!selectedClass) return;
    setActivePeriodTab(colIdx);
    const cellKey = selectedClass + '_' + sectionNum + '_' + colIdx;
    const currentRoom = scheduleGrid[cellKey]?.room_no || '';
    const newRoom = prompt('Enter Room Number (e.g. Room 101 or 101):', currentRoom || `Room ${100 + (selectedClass - 1) * 3 + sectionNum}`);
    if (newRoom === null) return; // Cancelled
    const trimmedRoom = newRoom.trim();

    if (trimmedRoom !== '') {
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
    }

    const existing = scheduleGrid[cellKey];
    setScheduleGrid(prev => ({
      ...prev,
      [cellKey]: {
        ...(existing || { teacher: 'Unassigned', sub: 'General' }),
        room_no: trimmedRoom
      }
    }));
    saveScheduleToDB(
      selectedClass, 
      sectionNum, 
      colIdx, 
      trimmedRoom, 
      existing?.teacher || 'Unassigned', 
      existing?.sub || 'General'
    );
    if (trimmedRoom) {
      showToast(`Room set to ${trimmedRoom}`, 'info');
    } else {
      showToast(`Room allocation cleared`, 'info');
    }
  };

  const clearPeriodRoom = (sectionNum, colIdx) => {
    if (!selectedClass) return;
    const cellKey = selectedClass + '_' + sectionNum + '_' + colIdx;
    const existing = scheduleGrid[cellKey];
    if (!existing) return;

    if (!existing.teacher || existing.teacher === 'Unassigned') {
      setScheduleGrid(prev => ({
        ...prev,
        [cellKey]: null
      }));
      deleteScheduleFromDB(selectedClass, sectionNum, colIdx);
    } else {
      setScheduleGrid(prev => ({
        ...prev,
        [cellKey]: {
          ...existing,
          room_no: ''
        }
      }));
      saveScheduleToDB(selectedClass, sectionNum, colIdx, '', existing.teacher, existing.sub);
    }
    showToast('Room allocation removed.', 'info');
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
    {
      id: 'module1',
      title: 'Schedule',
      tag: 'Timetable & Faculty',
      icon: <Calendar size={18} />,
      theme: { bg: '#eff6ff', color: '#2563eb', border: '#dbeafe' },
      desc: 'Overview of teacher directory, period allocation count & conflict-free schedule grid.'
    },
    {
      id: 'module2',
      title: 'Student Directory',
      tag: 'Roster & Admissions',
      icon: <Users size={18} />,
      theme: { bg: '#f5f3ff', color: '#7c3aed', border: '#ede9fe' },
      desc: 'Student records: ID, Name, Parent Details, and Admission Status.'
    },
    {
      id: 'module3',
      title: 'Student Details',
      tag: 'Monthly Attendance Logs',
      icon: <UserCheck size={18} />,
      theme: { bg: '#ecfdf5', color: '#059669', border: '#d1fae5' },
      desc: 'Browse student monthly attendance logs and calculate percentage.'
    },
    {
      id: 'module4',
      title: 'Examinations',
      tag: 'Exams & Question Bank',
      icon: <BookOpen size={18} />,
      theme: { bg: '#fff1f2', color: '#e11d48', border: '#ffe4e6' },
      desc: 'Create, schedule, and view MCQ assignments for all 12 classes.'
    },
    {
      id: 'module5',
      title: 'Administration',
      tag: 'Reports & Analytics',
      icon: <ShieldCheck size={18} />,
      theme: { bg: '#fffbeb', color: '#d97706', border: '#fef3c7' },
      desc: 'Administrative reporting and school analytics.'
    }
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
      <div className="staff-portal-layout">
        
        {/* Left Module Sidebar Navigation */}
        <div className="staff-sidebar-nav">
          <div className="staff-sidebar-header">
            <div className="staff-sidebar-title">
              <Layers size={15} color="var(--color-pricing-blue)" />
              <span>Staff Modules</span>
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
                <span style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--color-ink)' }}>Online Session</span>
              </div>
              <span style={{ fontSize: '10.5px', color: 'var(--color-slate)', fontWeight: '500' }}>ERP v2.4</span>
            </div>
          </div>
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

                {/* MODULE 1: CLASS SCHEDULER & PLANNING */}
                {mod.id === 'module1' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-16)', width: '100%' }}>
                    
                    {/* ========================================================================= */}
                    {/* TOP ROW: TEACHER DIRECTORY & WORKLOAD (LEFT) + CLASS STANDARDS (RIGHT)    */}
                    {/* ========================================================================= */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 290px', gap: 'var(--spacing-16)', width: '100%', alignItems: 'stretch' }}>
                      
                      {/* 1. TEACHER DIRECTORY & WORKLOAD CARD */}
                      <div style={{
                        background: 'var(--color-gallery-white)',
                        border: '1px solid var(--color-hairline-silver)',
                        borderRadius: 'var(--radius-cards)',
                        padding: 'var(--spacing-16) var(--spacing-20)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                      }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Users size={16} color="var(--color-pricing-blue)" />
                              <h4 style={{ color: 'var(--color-ink)', fontSize: '14px', fontWeight: '700', margin: 0 }}>
                                Teacher Directory & Workload
                              </h4>
                            </div>
                            <span style={{
                              fontSize: '11px',
                              background: 'var(--color-studio-mist)',
                              color: 'var(--color-slate)',
                              border: '1px solid var(--color-hairline-silver)',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-buttons)',
                              fontWeight: '600'
                            }}>
                              {filteredTeachers.length} Active Faculty
                            </span>
                          </div>

                          <div style={{ overflowX: 'auto', maxHeight: '190px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                              <thead>
                                <tr style={{ borderBottom: '1px solid var(--color-control-gray)', textTransform: 'uppercase', fontSize: '10px', color: 'var(--color-slate)', fontWeight: '700', letterSpacing: '0.04em' }}>
                                  <th style={{ padding: '6px 8px', textAlign: 'left' }}>TEACHER NAME</th>
                                  <th style={{ padding: '6px 8px', textAlign: 'left' }}>SUBJECT</th>
                                  <th style={{ padding: '6px 8px', textAlign: 'right' }}>PERIODS ASSIGNED</th>
                                </tr>
                              </thead>
                              <tbody>
                                {filteredTeachers.map((t, idx) => {
                                  const assignedCount = getTeacherAssignedCount(t.name);
                                  const isMax = assignedCount >= MAX_PERIODS_PER_TEACHER;
                                  const isSelected = activeTeacherClick?.id === t.id;

                                  return (
                                    <tr
                                      key={t.id || idx}
                                      draggable={!isMax}
                                      onDragStart={(e) => handleDragStart(e, t)}
                                      onClick={() => {
                                        setActiveRoomClick(null);
                                        setActiveTeacherClick(isSelected ? null : t);
                                      }}
                                      style={{
                                        borderBottom: '1px solid var(--color-control-gray)',
                                        background: isSelected ? '#eff6ff' : 'transparent',
                                        cursor: isMax ? 'not-allowed' : 'grab',
                                        transition: 'background 0.15s ease'
                                      }}
                                      title={isMax ? 'Maximum workload reached (7/7 periods)' : 'Drag teacher to timetable or click to assign'}
                                    >
                                      <td style={{ padding: '7px 8px', fontWeight: '600', color: 'var(--color-ink)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                          <GripVertical size={12} color={isMax ? 'var(--color-steel)' : 'var(--color-slate)'} />
                                          <span>{t.name}</span>
                                        </div>
                                      </td>
                                      <td style={{ padding: '7px 8px' }}>
                                        <span style={{
                                          background: '#eff6ff',
                                          color: 'var(--color-pricing-blue)',
                                          border: '1px solid #bfdbfe',
                                          padding: '2px 8px',
                                          borderRadius: '6px',
                                          fontSize: '11px',
                                          fontWeight: '500',
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '4px'
                                        }}>
                                          <BookOpen size={10} />
                                          <span style={{ textTransform: 'capitalize' }}>{t.subject}</span>
                                        </span>
                                      </td>
                                      <td style={{ padding: '7px 8px', textAlign: 'right' }}>
                                        <span style={{
                                          background: isMax ? 'var(--color-error-bg)' : 'var(--color-studio-mist)',
                                          color: isMax ? 'var(--color-error)' : 'var(--color-slate)',
                                          border: `1px solid ${isMax ? 'var(--color-error-border)' : 'var(--color-hairline-silver)'}`,
                                          padding: '2px 8px',
                                          borderRadius: '6px',
                                          fontSize: '11px',
                                          fontWeight: '600'
                                        }}>
                                          {assignedCount}/7 Periods
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>

                      {/* 2. CLASS STANDARDS (1 TO 12) CARD (Right Side) */}
                      <div style={{
                        background: 'var(--color-gallery-white)',
                        border: '1px solid var(--color-hairline-silver)',
                        borderRadius: 'var(--radius-cards)',
                        padding: 'var(--spacing-16) var(--spacing-14)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Building size={15} color="var(--color-pricing-blue)" />
                            <h4 style={{ color: 'var(--color-ink)', fontSize: '13px', fontWeight: '700', margin: 0 }}>
                              Class Standards (1 to 12)
                            </h4>
                          </div>
                          <span style={{ fontSize: '10.5px', color: 'var(--color-slate)', fontWeight: '500' }}>
                            12 Classes
                          </span>
                        </div>

                        {/* 3x4 Grid of Classes */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((clsNum) => {
                            const isSelected = selectedClass === clsNum;

                            return (
                              <div
                                key={clsNum}
                                onClick={() => setSelectedClass(clsNum)}
                                style={{
                                  borderRadius: '10px',
                                  padding: '7px 3px',
                                  textAlign: 'center',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '1px',
                                  background: isSelected ? 'var(--color-ink)' : 'var(--color-paper-frost)',
                                  border: isSelected ? '1.5px solid var(--color-ink)' : '1px solid var(--color-hairline-silver)',
                                  boxShadow: isSelected ? '0 3px 8px rgba(0,0,0,0.18)' : 'none'
                                }}
                                title={`Select Class ${clsNum}`}
                              >
                                <span style={{
                                  fontSize: '8.5px',
                                  fontWeight: '700',
                                  letterSpacing: '0.04em',
                                  textTransform: 'uppercase',
                                  color: isSelected ? '#94a3b8' : 'var(--color-slate)'
                                }}>
                                  CLASS
                                </span>
                                <strong style={{
                                  fontSize: '15px',
                                  fontWeight: '800',
                                  color: isSelected ? '#ffffff' : 'var(--color-ink)'
                                }}>
                                  {clsNum}
                                </strong>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* ========================================================================= */}
                    {/* BOTTOM SECTION: 36 CLASSES LIVE TRACKER (LEFT) + TIMETABLE (RIGHT)        */}
                    {/* ========================================================================= */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: showClassSidebar ? '300px minmax(0, 1fr)' : 'minmax(0, 1fr)',
                      gap: 'var(--spacing-16)',
                      width: '100%',
                      alignItems: 'start'
                    }}>
                      
                      {/* LEFT: 36 CLASSES LIVE TRACKER */}
                      {showClassSidebar && (
                        <div style={{
                          background: 'var(--color-gallery-white)',
                          border: '1px solid var(--color-hairline-silver)',
                          borderRadius: 'var(--radius-cards)',
                          padding: 'var(--spacing-16)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                        }}>
                          {/* Header */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Clock size={16} color="var(--color-pricing-blue)" />
                              <h4 style={{ color: 'var(--color-ink)', fontSize: '13.5px', fontWeight: '700', margin: 0 }}>
                                36 Rooms Live Tracker
                              </h4>
                            </div>
                            <span style={{ fontSize: '10.5px', color: 'var(--color-slate)', fontWeight: '600' }}>
                              101–136
                            </span>
                          </div>

                          {/* Selected Hour Dropdown */}
                          <div>
                            <label style={{ display: 'block', fontSize: '10px', color: 'var(--color-slate)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.04em', marginBottom: '5px' }}>
                              SELECTED HOUR:
                            </label>
                            <select
                              value={trackerSelectedPeriod}
                              onChange={(e) => setTrackerSelectedPeriod(parseInt(e.target.value))}
                              className="search-input"
                              style={{ width: '100%', padding: '6px 10px', fontSize: '11.5px', cursor: 'pointer', fontWeight: '500', background: 'var(--color-paper-frost)' }}
                            >
                              <option value={0}>Period 1 (9-10 AM)</option>
                              <option value={1}>Period 2 (10-11 AM)</option>
                              <option value={2}>Period 3 (11-12 PM)</option>
                              <option value={3}>Lunch Break (12-1 PM)</option>
                              <option value={4}>Period 4 (1-2 PM)</option>
                              <option value={5}>Period 5 (2-3 PM)</option>
                              <option value={6}>Period 6 (3-4 PM)</option>
                              <option value={7}>Period 7 (4-5 PM)</option>
                            </select>
                          </div>

                          {/* Drag Hint */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10.5px', color: 'var(--color-slate)', background: 'var(--color-studio-mist)', padding: '5px 8px', borderRadius: '6px' }}>
                            <GripVertical size={12} color="var(--color-pricing-blue)" />
                            <span>Drag room to timetable or click to select</span>
                          </div>

                          {/* 36 Rooms Vertical Scrollable Grid (101 to 136) */}
                          <div style={{ maxHeight: '640px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '7px', paddingRight: '2px' }}>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((classNum) => {
                              const isClassActive = selectedClass === classNum;
                              return (
                                <div key={classNum} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  {/* Class Standard Label (e.g. C1) */}
                                  <div
                                    onClick={() => setSelectedClass(classNum)}
                                    style={{
                                      width: '26px',
                                      fontSize: '11px',
                                      fontWeight: '700',
                                      color: isClassActive ? 'var(--color-pricing-blue)' : 'var(--color-slate)',
                                      cursor: 'pointer',
                                      textAlign: 'center',
                                      flexShrink: 0
                                    }}
                                    title={`Switch timetable view to Class ${classNum}`}
                                  >
                                    C{classNum}
                                  </div>

                                  {/* 3 Room Cards (101, 102, 103 for C1; 104, 105, 106 for C2, etc.) */}
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px', flex: 1 }}>
                                    {[1, 2, 3].map((colIdx) => {
                                      const roomNum = 100 + (classNum - 1) * 3 + colIdx;
                                      const roomName = `Room ${roomNum}`;
                                      const occ = getRoomOccupancyInfo(roomNum, trackerSelectedPeriod);
                                      const isSelected = activeRoomClick === roomName;

                                      return (
                                        <div
                                          key={colIdx}
                                          draggable={true}
                                          onDragStart={(e) => handleDragStartRoom(e, roomName)}
                                          onClick={() => {
                                            setActiveTeacherClick(null);
                                            setActiveRoomClick(isSelected ? null : roomName);
                                          }}
                                          style={{
                                            background: isSelected ? '#eff6ff' : occ.isOccupied ? '#f0fdf4' : occ.isLunch ? '#fefce8' : 'var(--color-paper-frost)',
                                            border: isSelected ? '1.5px solid var(--color-pricing-blue)' : occ.isOccupied ? '1px solid #86efac' : occ.isLunch ? '1px solid #fef08a' : '1px solid var(--color-hairline-silver)',
                                            borderRadius: '8px',
                                            padding: '6px 3px',
                                            textAlign: 'center',
                                            cursor: 'grab',
                                            transition: 'all 0.15s ease',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '2px',
                                            boxShadow: isSelected ? '0 2px 6px rgba(0,113,227,0.18)' : 'none',
                                            userSelect: 'none'
                                          }}
                                          title={`${roomName} • ${occ.label}${occ.detail ? ` (${occ.detail})` : ''} - Drag to timetable or click to select`}
                                        >
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                            <GripVertical size={10} color={isSelected ? 'var(--color-pricing-blue)' : 'var(--color-slate)'} />
                                            <strong style={{ fontSize: '10.5px', color: isSelected ? 'var(--color-pricing-blue)' : 'var(--color-ink)' }}>
                                              Room {roomNum}
                                            </strong>
                                          </div>
                                          <span style={{
                                            fontSize: '8.5px',
                                            fontWeight: '700',
                                            color: isSelected ? 'var(--color-pricing-blue)' : occ.color,
                                            maxWidth: '100%',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                          }}>
                                            {occ.isLunch ? 'Lunch' : occ.isOccupied ? (occ.detail ? `${occ.detail} • Filled` : 'Filled') : 'Vacant'}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                    {/* ========================================================================= */}
                    {/* RIGHT PANEL: HEADER + QUICK DRAG & DROP TEACHER BOARD + SECTION SCHEDULES  */}
                    {/* ========================================================================= */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-16)', minWidth: 0 }}>
                      
                      {/* Top Header Card with DB Sync status and Date Navigation */}
                      <div style={{
                        background: 'var(--color-gallery-white)',
                        border: '1px solid var(--color-hairline-silver)',
                        borderRadius: 'var(--radius-cards)',
                        padding: 'var(--spacing-14) var(--spacing-20)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <Calendar size={18} color="var(--color-pricing-blue)" />
                          <h3 style={{ fontSize: '16.5px', fontWeight: '600', color: 'var(--color-ink)', margin: 0 }}>
                            Class {selectedClass} Timetable Schedule
                          </h3>
                          <span style={{ fontSize: '11px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: 'var(--radius-buttons)', fontWeight: '600' }}>
                            ● Live DB Sync Active
                          </span>
                        </div>

                        {/* Date Picker + Day Badge + Nav */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-studio-mist)', padding: '4px 10px', borderRadius: 'var(--radius-inputs)', border: '1px solid var(--color-steel)' }}>
                            <input
                              type="date"
                              value={selectedDate}
                              onChange={(e) => setSelectedDate(e.target.value)}
                              style={{ background: 'transparent', color: 'var(--color-ink)', border: 'none', fontSize: '12px', fontWeight: '500', outline: 'none' }}
                            />
                          </div>

                          <span style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            background: 'var(--color-paper-frost)',
                            color: 'var(--color-ink)',
                            border: '1px solid var(--color-hairline-silver)',
                            padding: '4px 12px',
                            borderRadius: 'var(--radius-buttons)'
                          }}>
                            {getFormattedDateWithDay(selectedDate)}
                          </span>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <button onClick={handleNavigateYesterday} className="btn-apple-outline" style={{ padding: '4px 8px', fontSize: '11.5px' }}>
                              ‹
                            </button>
                            <button onClick={handleNavigateToday} className="btn-apple-outline" style={{ padding: '4px 8px', fontSize: '11.5px', color: 'var(--color-pricing-blue)', borderColor: 'var(--color-pricing-blue)' }}>
                              Today
                            </button>
                            <button onClick={handleNavigateTomorrow} className="btn-apple-outline" style={{ padding: '4px 8px', fontSize: '11.5px' }}>
                              ›
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Quick Drag-and-Drop Resource Board (Teachers & Rooms) */}
                      <div style={{
                        background: 'var(--color-gallery-white)',
                        border: '1px solid var(--color-hairline-silver)',
                        borderRadius: 'var(--radius-cards)',
                        padding: 'var(--spacing-16) var(--spacing-20)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Users size={16} color="var(--color-pricing-blue)" />
                            <strong style={{ fontSize: '14px', color: 'var(--color-ink)' }}>
                              Quick Drag-and-Drop Resource Board
                            </strong>
                          </div>

                          {/* Tab Switcher for Teachers vs Rooms */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--color-studio-mist)', padding: '3px', borderRadius: 'var(--radius-buttons)', border: '1px solid var(--color-hairline-silver)' }}>
                            <button
                              type="button"
                              onClick={() => setBoardActiveTab('teachers')}
                              style={{
                                border: 'none',
                                padding: '4px 12px',
                                borderRadius: '6px',
                                fontSize: '11.5px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                background: boardActiveTab === 'teachers' ? 'var(--color-gallery-white)' : 'transparent',
                                color: boardActiveTab === 'teachers' ? 'var(--color-pricing-blue)' : 'var(--color-slate)',
                                boxShadow: boardActiveTab === 'teachers' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              👨‍🏫 Faculty ({filteredTeachers.length})
                            </button>
                            <button
                              type="button"
                              onClick={() => setBoardActiveTab('rooms')}
                              style={{
                                border: 'none',
                                padding: '4px 12px',
                                borderRadius: '6px',
                                fontSize: '11.5px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                background: boardActiveTab === 'rooms' ? 'var(--color-gallery-white)' : 'transparent',
                                color: boardActiveTab === 'rooms' ? 'var(--color-pricing-blue)' : 'var(--color-slate)',
                                boxShadow: boardActiveTab === 'rooms' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              🚪 Rooms & Labs ({availableRoomsList.length})
                            </button>
                          </div>
                        </div>

                        {/* Teachers Strip */}
                        {boardActiveTab === 'teachers' ? (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            overflowX: 'auto',
                            paddingBottom: '6px',
                            WebkitOverflowScrolling: 'touch'
                          }}>
                            {filteredTeachers.map((t, idx) => {
                              const assignedCount = getTeacherAssignedCount(t.name);
                              const isMax = assignedCount >= MAX_PERIODS_PER_TEACHER;
                              const isSelected = activeTeacherClick?.id === t.id;

                              return (
                                <div
                                  key={t.id || idx}
                                  draggable={!isMax}
                                  onDragStart={(e) => handleDragStart(e, t)}
                                  onClick={() => {
                                    setActiveRoomClick(null);
                                    setActiveTeacherClick(isSelected ? null : t);
                                  }}
                                  style={{
                                    minWidth: '160px',
                                    background: isSelected ? '#eff6ff' : 'var(--color-paper-frost)',
                                    border: isSelected ? '1.5px solid var(--color-pricing-blue)' : '1px solid var(--color-hairline-silver)',
                                    borderRadius: '12px',
                                    padding: '8px 12px',
                                    cursor: isMax ? 'not-allowed' : 'grab',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '4px',
                                    flexShrink: 0,
                                    transition: 'all 0.15s ease',
                                    boxShadow: isSelected ? '0 2px 6px rgba(0,113,227,0.12)' : 'none'
                                  }}
                                  title={isMax ? 'Maximum workload reached (7/7 periods)' : 'Drag this teacher card or click to assign'}
                                >
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: 0 }}>
                                      <GripVertical size={13} color={isMax ? 'var(--color-steel)' : 'var(--color-slate)'} />
                                      <strong style={{ fontSize: '12.5px', color: 'var(--color-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {t.name}
                                      </strong>
                                    </div>
                                    <span style={{
                                      fontSize: '10px',
                                      fontWeight: '700',
                                      padding: '1px 6px',
                                      borderRadius: '6px',
                                      background: isMax ? 'var(--color-error-bg)' : '#f0fdf4',
                                      color: isMax ? 'var(--color-error)' : '#16a34a',
                                      border: `1px solid ${isMax ? 'var(--color-error-border)' : '#bbf7d0'}`
                                    }}>
                                      {assignedCount}/7
                                    </span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--color-slate)', paddingLeft: '17px' }}>
                                    <BookOpen size={11} color="var(--color-pricing-blue)" />
                                    <span style={{ textTransform: 'capitalize' }}>{t.subject}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          /* Rooms Strip */
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            overflowX: 'auto',
                            paddingBottom: '6px',
                            WebkitOverflowScrolling: 'touch'
                          }}>
                            {availableRoomsList.map((roomName, idx) => {
                              const isSelected = activeRoomClick === roomName;

                              return (
                                <div
                                  key={idx}
                                  draggable
                                  onDragStart={(e) => handleDragStartRoom(e, roomName)}
                                  onClick={() => {
                                    setActiveTeacherClick(null);
                                    setActiveRoomClick(isSelected ? null : roomName);
                                  }}
                                  style={{
                                    minWidth: '110px',
                                    background: isSelected ? '#eff6ff' : 'var(--color-paper-frost)',
                                    border: isSelected ? '1.5px solid var(--color-pricing-blue)' : '1px solid var(--color-hairline-silver)',
                                    borderRadius: '10px',
                                    padding: '8px 12px',
                                    cursor: 'grab',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    flexShrink: 0,
                                    transition: 'all 0.15s ease',
                                    boxShadow: isSelected ? '0 2px 6px rgba(0,113,227,0.12)' : 'none'
                                  }}
                                  title="Drag room chip or click to allocate"
                                >
                                  <GripVertical size={13} color="var(--color-slate)" />
                                  <Building size={13} color="var(--color-pricing-blue)" />
                                  <strong style={{ fontSize: '12px', color: 'var(--color-ink)', whiteSpace: 'nowrap' }}>
                                    {roomName}
                                  </strong>
                                </div>
                              );
                            })}

                            {/* Button to add custom room */}
                            <button
                              type="button"
                              onClick={() => {
                                const custom = prompt('Enter new Room Name / Lab:');
                                if (custom && custom.trim() !== '') {
                                  const trimmed = custom.trim();
                                  if (!availableRoomsList.includes(trimmed)) {
                                    setAvailableRoomsList(prev => [...prev, trimmed]);
                                    showToast(`Added ${trimmed} to room palette`, 'success');
                                  }
                                }
                              }}
                              className="btn-apple-outline"
                              style={{ padding: '6px 12px', fontSize: '11px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Plus size={12} />
                              <span>Add Room</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Active Selection Feedback Bar */}
                      {activeTeacherClick && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px',
                          background: '#eff6ff',
                          border: '1.5px solid var(--color-pricing-blue)',
                          padding: '8px 16px',
                          borderRadius: '10px',
                          fontSize: '12.5px',
                          color: '#1d4ed8'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <User size={15} />
                            <span>Selected Faculty: <strong>{activeTeacherClick.name}</strong> ({activeTeacherClick.subject})</span>
                            <span style={{ fontSize: '11.5px', color: 'var(--color-slate)' }}>• Click any timetable period cell below to assign</span>
                          </div>
                          <button
                            onClick={() => setActiveTeacherClick(null)}
                            style={{ background: 'transparent', border: 'none', color: '#1d4ed8', cursor: 'pointer', fontWeight: 'bold' }}
                          >
                            ✕
                          </button>
                        </div>
                      )}

                      {activeRoomClick && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px',
                          background: '#f0fdf4',
                          border: '1.5px solid #16a34a',
                          padding: '8px 16px',
                          borderRadius: '10px',
                          fontSize: '12.5px',
                          color: '#15803d'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Building size={15} />
                            <span>Selected Room: <strong>{activeRoomClick}</strong></span>
                            <span style={{ fontSize: '11.5px', color: 'var(--color-slate)' }}>• Click any room cell below to allocate</span>
                          </div>
                          <button
                            onClick={() => setActiveRoomClick(null)}
                            style={{ background: 'transparent', border: 'none', color: '#15803d', cursor: 'pointer', fontWeight: 'bold' }}
                          >
                            ✕
                          </button>
                        </div>
                      )}

                      {/* 3. Multi-Section Timetable Schedules (Section 1, 2, 3) */}
                      {[1, 2, 3].map((sectionNum) => {
                        const sectionCode = `CLS_${selectedClass}_SEC_${sectionNum}`;

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
                            {/* Section Header */}
                            <div style={{
                              padding: '12px 18px',
                              background: 'var(--color-studio-mist)',
                              borderBottom: '1px solid var(--color-control-gray)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: '8px'
                            }}>
                              <h5 style={{ color: 'var(--color-ink)', margin: 0, fontSize: '14px', fontWeight: '600' }}>
                                Class {selectedClass} — Section {sectionNum} Schedule ({getFormattedDateWithDay(selectedDate)})
                              </h5>
                              <span style={{ fontSize: '11px', background: 'var(--color-paper-frost)', color: 'var(--color-pricing-blue)', border: '1px solid var(--color-hairline-silver)', padding: '2px 8px', borderRadius: '6px', fontWeight: '600' }}>
                                {sectionCode} • Section {sectionNum}
                              </span>
                            </div>

                            {/* 4-Row Timetable Table */}
                            <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', tableLayout: 'fixed' }}>
                                <thead>
                                  {/* Row 1: TIMING */}
                                  <tr style={{ background: 'var(--color-paper-frost)', borderBottom: '1px solid var(--color-hairline-silver)' }}>
                                    <th style={{ padding: '8px 10px', textAlign: 'left', width: '90px', textTransform: 'uppercase', fontSize: '10px', color: 'var(--color-slate)', fontWeight: '700', letterSpacing: '0.04em' }}>
                                      TIMING
                                    </th>
                                    {['9–10', '10–11', '11–12', '12–01 (Lunch)', '01–02', '02–03', '03–04', '04–05'].map((timeLabel, pIdx) => (
                                      <th
                                        key={pIdx}
                                        style={{
                                          padding: '8px 4px',
                                          textAlign: 'center',
                                          fontSize: '11px',
                                          fontWeight: '600',
                                          color: pIdx === 3 ? '#a16207' : 'var(--color-slate)',
                                          background: pIdx === 3 ? '#fefce8' : 'transparent',
                                          borderRight: '1px solid var(--color-control-gray)'
                                        }}
                                      >
                                        {timeLabel}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {/* Row 2: room_no */}
                                  <tr style={{ borderBottom: '1px solid var(--color-control-gray)' }}>
                                    <td style={{ padding: '8px 10px', fontWeight: '600', color: 'var(--color-pricing-blue)', fontSize: '11px' }}>
                                      room_no
                                    </td>
                                    {[0, 1, 2, 3, 4, 5, 6, 7].map((pIdx) => {
                                      const cellKey = `${selectedClass}_${sectionNum}_${pIdx}`;
                                      const cellData = scheduleGrid[cellKey];
                                      const hasRoom = Boolean(cellData?.room_no && cellData.room_no.trim() !== '' && cellData.room_no !== 'Recess');
                                      const assignedRoom = hasRoom ? cellData.room_no.trim() : null;
                                      const isDragTarget = dragOverCell === `${cellKey}_room`;

                                      if (pIdx === 3) {
                                        return (
                                          <td key={pIdx} style={{ padding: '6px 4px', textAlign: 'center', background: '#fefce8', borderRight: '1px solid var(--color-control-gray)', color: '#a16207', fontWeight: '600', fontSize: '10.5px' }}>
                                            — Lunch —
                                          </td>
                                        );
                                      }

                                      return (
                                        <td
                                          key={pIdx}
                                          onDragOver={(e) => {
                                            e.preventDefault();
                                            e.dataTransfer.dropEffect = 'copy';
                                          }}
                                          onDragEnter={() => setDragOverCell(`${cellKey}_room`)}
                                          onDragLeave={() => setDragOverCell(null)}
                                          onDrop={(e) => {
                                            e.preventDefault();
                                            setDragOverCell(null);
                                            const roomTransfer = e.dataTransfer.getData('application/room-transfer');
                                            if (roomTransfer) {
                                              try {
                                                handleDropRoom(sectionNum, pIdx, JSON.parse(roomTransfer));
                                                return;
                                              } catch (err) {}
                                            }
                                            const rawData = e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain');
                                            if (rawData) {
                                              try {
                                                const parsed = JSON.parse(rawData);
                                                if (parsed.roomNo || parsed.type === 'ROOM') {
                                                  handleDropRoom(sectionNum, pIdx, parsed);
                                                } else if (parsed.name) {
                                                  handleDrop(sectionNum, pIdx, parsed);
                                                }
                                              } catch (err) {}
                                            }
                                          }}
                                          onClick={() => {
                                            if (activeRoomClick) {
                                              handleDropRoom(sectionNum, pIdx, activeRoomClick);
                                            } else {
                                              handleEditRoomNumber(sectionNum, pIdx);
                                            }
                                          }}
                                          style={{
                                            padding: '6px 4px',
                                            textAlign: 'center',
                                            borderRight: '1px solid var(--color-control-gray)',
                                            background: isDragTarget ? '#eff6ff' : assignedRoom ? 'var(--color-gallery-white)' : 'transparent',
                                            outline: isDragTarget ? '2px dashed var(--color-pricing-blue)' : 'none',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s ease'
                                          }}
                                        >
                                          {assignedRoom ? (
                                            <span style={{
                                              background: 'var(--color-paper-frost)',
                                              border: '1px solid var(--color-hairline-silver)',
                                              color: 'var(--color-ink)',
                                              padding: '2px 6px',
                                              borderRadius: '6px',
                                              fontSize: '10.5px',
                                              fontWeight: '600',
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              gap: '4px'
                                            }}>
                                              <span>{assignedRoom}</span>
                                              <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); handleEditRoomNumber(sectionNum, pIdx); }}
                                                style={{ background: 'transparent', border: 'none', color: 'var(--color-slate)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                                                title="Edit room"
                                              >
                                                <Edit2 size={9} />
                                              </button>
                                              <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); clearPeriodRoom(sectionNum, pIdx); }}
                                                style={{ background: 'transparent', border: 'none', color: 'var(--color-slate)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                                                title="Clear room"
                                              >
                                                <X size={9} />
                                              </button>
                                            </span>
                                          ) : (
                                            <span style={{
                                              color: isDragTarget ? 'var(--color-pricing-blue)' : 'var(--color-steel)',
                                              fontSize: '11px',
                                              fontWeight: isDragTarget ? '700' : '500'
                                            }}>
                                              {isDragTarget ? '⬇ Drop' : '+ Room'}
                                            </span>
                                          )}
                                        </td>
                                      );
                                    })}
                                  </tr>

                                  {/* Row 3: teacher */}
                                  <tr style={{ borderBottom: '1px solid var(--color-control-gray)' }}>
                                    <td style={{ padding: '8px 10px', fontWeight: '600', color: 'var(--color-ink)', fontSize: '11px' }}>
                                      teacher
                                    </td>
                                    {[0, 1, 2, 3, 4, 5, 6, 7].map((pIdx) => {
                                      const cellKey = `${selectedClass}_${sectionNum}_${pIdx}`;
                                      const cellData = scheduleGrid[cellKey];
                                      const isDragTarget = dragOverCell === cellKey;

                                      if (pIdx === 3) {
                                        return (
                                          <td key={pIdx} style={{ padding: '8px 4px', textAlign: 'center', background: '#fefce8', borderRight: '1px solid var(--color-control-gray)', color: '#a16207', fontWeight: '600', fontSize: '11px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                              <Coffee size={12} />
                                              <span>Lunch Break</span>
                                            </div>
                                          </td>
                                        );
                                      }

                                      return (
                                        <td
                                          key={pIdx}
                                          onDragOver={(e) => {
                                            e.preventDefault();
                                            e.dataTransfer.dropEffect = 'copy';
                                          }}
                                          onDragEnter={() => setDragOverCell(cellKey)}
                                          onDragLeave={() => setDragOverCell(null)}
                                          onDrop={(e) => {
                                            e.preventDefault();
                                            setDragOverCell(null);
                                            const roomTransfer = e.dataTransfer.getData('application/room-transfer');
                                            if (roomTransfer) {
                                              try {
                                                handleDropRoom(sectionNum, pIdx, JSON.parse(roomTransfer));
                                                return;
                                              } catch (err) {}
                                            }
                                            const teacherData = e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain');
                                            if (teacherData) {
                                              try {
                                                handleDrop(sectionNum, pIdx, JSON.parse(teacherData));
                                              } catch (err) {}
                                            }
                                          }}
                                          onClick={() => {
                                            if (activeTeacherClick) {
                                              assignTeacherToCell(sectionNum, pIdx, activeTeacherClick);
                                            }
                                          }}
                                          style={{
                                            padding: '8px 4px',
                                            textAlign: 'center',
                                            borderRight: '1px solid var(--color-control-gray)',
                                            background: isDragTarget ? '#eff6ff' : cellData?.teacher && cellData.teacher !== 'Unassigned' ? 'var(--color-gallery-white)' : 'var(--color-studio-mist)',
                                            outline: isDragTarget ? '2px dashed var(--color-pricing-blue)' : 'none',
                                            cursor: activeTeacherClick ? 'pointer' : 'default',
                                            transition: 'all 0.15s ease'
                                          }}
                                        >
                                          {cellData?.teacher && cellData.teacher !== 'Unassigned' ? (
                                            <strong style={{ color: 'var(--color-ink)', fontSize: '11.5px' }}>
                                              {cellData.teacher}
                                            </strong>
                                          ) : (
                                            <span style={{ color: isDragTarget ? 'var(--color-pricing-blue)' : 'var(--color-steel)', fontSize: '11px', fontWeight: isDragTarget ? '700' : 'normal' }}>
                                              {isDragTarget ? '⬇ Drop' : '+ Drop'}
                                            </span>
                                          )}
                                        </td>
                                      );
                                    })}
                                  </tr>

                                  {/* Row 4: sub */}
                                  <tr>
                                    <td style={{ padding: '8px 10px', fontWeight: '600', color: 'var(--color-launch-orange)', fontSize: '11px' }}>
                                      sub
                                    </td>
                                    {[0, 1, 2, 3, 4, 5, 6, 7].map((pIdx) => {
                                      const cellKey = `${selectedClass}_${sectionNum}_${pIdx}`;
                                      const cellData = scheduleGrid[cellKey];

                                      if (pIdx === 3) {
                                        return (
                                          <td key={pIdx} style={{ padding: '6px 4px', textAlign: 'center', background: '#fefce8', borderRight: '1px solid var(--color-control-gray)', color: '#a16207', fontSize: '10.5px', fontWeight: '600' }}>
                                            Recess
                                          </td>
                                        );
                                      }

                                      return (
                                        <td key={pIdx} style={{ padding: '6px 4px', textAlign: 'center', borderRight: '1px solid var(--color-control-gray)' }}>
                                          {cellData?.sub && cellData.sub !== 'General' && cellData.teacher !== 'Unassigned' ? (
                                            <span style={{
                                              background: '#f0fdf4',
                                              color: '#16a34a',
                                              border: '1px solid #bbf7d0',
                                              padding: '2px 6px',
                                              borderRadius: '6px',
                                              fontSize: '10.5px',
                                              fontWeight: '600',
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              gap: '4px'
                                            }}>
                                              <span>{cellData.sub}</span>
                                              <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); clearPeriodUnit(sectionNum, pIdx); }}
                                                style={{ background: 'transparent', border: 'none', color: '#16a34a', cursor: 'pointer', padding: 0, fontSize: '10px', fontWeight: 'bold' }}
                                                title="Clear assignment"
                                              >
                                                ✕
                                              </button>
                                            </span>
                                          ) : (
                                            <span style={{ color: 'var(--color-steel)', fontSize: '11px' }}>
                                              —
                                            </span>
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
                </div>
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
                  /* MODULE 4: EXAMINATIONS & RECORDINGS */
                  <StaffExaminationModule user={user} showToast={showToast} />
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
