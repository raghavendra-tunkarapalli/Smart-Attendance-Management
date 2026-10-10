import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Calendar,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Eye,
  RefreshCw,
  FileText,
  Printer,
  Sparkles,
  Check,
  Grid,
  List as ListIcon,
  GraduationCap,
  School,
  X,
  AlertCircle,
  HelpCircle,
  Tag,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

const GATEWAY_URL = 'http://localhost:8099/api/staff-examination';
const DIRECT_URL = 'http://localhost:8096/api/staff-examination';

const SUBJECT_THEMES = {
  Mathematics: { pillClass: 'teacher', icon: '📐' },
  Physics: { pillClass: 'staff', icon: '⚛️' },
  Chemistry: { pillClass: 'parent', icon: '🧪' },
  Biology: { pillClass: 'student', icon: '🧬' },
  'Computer Science': { pillClass: 'admin', icon: '💻' },
  English: { pillClass: 'parent', icon: '📚' },
  'Social Studies': { pillClass: 'teacher', icon: '🌍' }
};

export default function StaffExaminationModule({ user, showToast }) {
  // Navigation & View Mode
  const [viewMode, setViewMode] = useState('history'); // 'history' | 'create'
  const [layoutMode, setLayoutMode] = useState('cards'); // 'cards' | 'table'

  // Examination List state
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('ALL');
  const [filterSection, setFilterSection] = useState('ALL');
  const [filterSubject, setFilterSubject] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'RELEASED' | 'PENDING'

  // Selected Exam for Detailed Dossier / Question Paper Modal
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedExamQuestions, setSelectedExamQuestions] = useState([]);
  const [examDetailLoading, setExamDetailLoading] = useState(false);
  const [modalTab, setModalTab] = useState('questions'); // 'questions' | 'overview' | 'student-paper'

  // Create Exam Form state
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Mathematics');
  const [newClass, setNewClass] = useState(10);
  const [newSection, setNewSection] = useState('A');
  const [newConductDate, setNewConductDate] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [newInstructions, setNewInstructions] = useState('All questions carry equal marks. Multiple choice with single correct answer.');
  const [saving, setSaving] = useState(false);

  // Dynamic Questions for New Exam
  const [newQuestions, setNewQuestions] = useState([
    {
      questionNumber: 1,
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctOption: 'A'
    },
    {
      questionNumber: 2,
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctOption: 'B'
    }
  ]);

  // Fetch all examination history on load
  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      let res = await fetch(`${GATEWAY_URL}/assignments`).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(`${DIRECT_URL}/assignments`).catch(() => null);
      }
      if (res && res.ok) {
        const data = await res.json();
        setAssignments(Array.isArray(data) ? data : []);
      } else {
        setAssignments([]);
      }
    } catch (err) {
      console.error('[StaffExam] Error fetching assignments:', err);
      if (showToast) showToast('Failed to load examination records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchExamDetails = async (exam) => {
    setSelectedExam(exam);
    setExamDetailLoading(true);
    setModalTab('questions');

    try {
      let res = await fetch(`${GATEWAY_URL}/assignments/${exam.id}/questions`).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(`${DIRECT_URL}/assignments/${exam.id}/questions`).catch(() => null);
      }
      if (res && res.ok) {
        const qData = await res.json();
        setSelectedExamQuestions(Array.isArray(qData) ? qData : []);
      } else if (exam.questions && Array.isArray(exam.questions)) {
        setSelectedExamQuestions(exam.questions);
      } else {
        setSelectedExamQuestions([]);
      }
    } catch (err) {
      console.error('[StaffExam] Failed to fetch questions for exam:', err);
      if (exam.questions && Array.isArray(exam.questions)) {
        setSelectedExamQuestions(exam.questions);
      }
    } finally {
      setExamDetailLoading(false);
    }
  };

  const handleToggleResults = async (examId, currentStatus, e) => {
    if (e) e.stopPropagation();
    const newStatus = !currentStatus;

    try {
      let res = await fetch(`${GATEWAY_URL}/assignments/${examId}/release-results?released=${newStatus}`, {
        method: 'PUT'
      }).catch(() => null);

      if (!res || !res.ok) {
        res = await fetch(`${GATEWAY_URL}/assignments/${examId}/release-results?released=${newStatus}`, {
          method: 'POST'
        }).catch(() => null);
      }

      if (!res || !res.ok) {
        res = await fetch(`${DIRECT_URL}/assignments/${examId}/release-results?released=${newStatus}`, {
          method: 'PUT'
        }).catch(() => null);
      }

      if (!res || !res.ok) {
        res = await fetch(`${DIRECT_URL}/assignments/${examId}/release-results?released=${newStatus}`, {
          method: 'POST'
        }).catch(() => null);
      }

      if (res && res.ok) {
        if (showToast) {
          showToast(newStatus ? 'Exam results published to student portal!' : 'Exam results hidden (Draft mode).', 'success');
        }
        setAssignments(prev => prev.map(a => a.id === examId ? { ...a, resultsReleased: newStatus } : a));
        if (selectedExam && selectedExam.id === examId) {
          setSelectedExam(prev => ({ ...prev, resultsReleased: newStatus }));
        }
      } else {
        if (showToast) showToast('Failed to update result release status.', 'error');
      }
    } catch (err) {
      console.error('Error toggling release status:', err);
      if (showToast) showToast('Network error updating results.', 'error');
    }
  };

  const handleDeleteExam = async (examId, title, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Are you sure you want to permanently delete examination "${title}" and all its question recordings?`)) {
      return;
    }

    try {
      let res = await fetch(`${GATEWAY_URL}/assignments/${examId}`, { method: 'DELETE' }).catch(() => null);
      
      if (!res || !res.ok) {
        res = await fetch(`${GATEWAY_URL}/assignments/${examId}/delete`, { method: 'POST' }).catch(() => null);
      }

      if (!res || !res.ok) {
        res = await fetch(`${DIRECT_URL}/assignments/${examId}`, { method: 'DELETE' }).catch(() => null);
      }

      if (!res || !res.ok) {
        res = await fetch(`${DIRECT_URL}/assignments/${examId}/delete`, { method: 'POST' }).catch(() => null);
      }

      if (res && res.ok) {
        if (showToast) showToast(`Examination "${title}" deleted successfully.`, 'info');
        setAssignments(prev => prev.filter(a => a.id !== examId));
        if (selectedExam && selectedExam.id === examId) {
          setSelectedExam(null);
        }
      } else {
        if (showToast) showToast('Failed to delete examination.', 'error');
      }
    } catch (err) {
      console.error('Error deleting exam:', err);
      if (showToast) showToast('Network error deleting examination.', 'error');
    }
  };

  // Question manipulation in Create mode
  const handleAddQuestion = () => {
    setNewQuestions(prev => [
      ...prev,
      {
        questionNumber: prev.length + 1,
        questionText: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctOption: 'A'
      }
    ]);
  };

  const handleRemoveQuestion = (idx) => {
    if (newQuestions.length <= 1) {
      if (showToast) showToast('An exam must contain at least 1 question.', 'error');
      return;
    }
    setNewQuestions(prev => {
      const updated = prev.filter((_, i) => i !== idx);
      return updated.map((q, i) => ({ ...q, questionNumber: i + 1 }));
    });
  };

  const handleUpdateQuestion = (idx, field, value) => {
    setNewQuestions(prev => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q));
  };

  const handleLoadSampleQuestions = () => {
    const samples = [
      {
        questionNumber: 1,
        questionText: 'What is the standard unit of measurement for electrical resistance in SI units?',
        optionA: 'Ohm (Ω)',
        optionB: 'Volt (V)',
        optionC: 'Ampere (A)',
        optionD: 'Watt (W)',
        correctOption: 'A'
      },
      {
        questionNumber: 2,
        questionText: 'Which organelle is universally known as the powerhouse of eukaryotic cells?',
        optionA: 'Ribosome',
        optionB: 'Mitochondria',
        optionC: 'Golgi Apparatus',
        optionD: 'Endoplasmic Reticulum',
        correctOption: 'B'
      },
      {
        questionNumber: 3,
        questionText: 'Solve for x: 3x - 7 = 20 + 2x',
        optionA: 'x = 13',
        optionB: 'x = 20',
        optionC: 'x = 27',
        optionD: 'x = 34',
        correctOption: 'C'
      },
      {
        questionNumber: 4,
        questionText: 'Which protocol is responsible for encrypted secure hypertext transfer over the Internet?',
        optionA: 'HTTP',
        optionB: 'FTP',
        optionC: 'SSH',
        optionD: 'HTTPS',
        correctOption: 'D'
      },
      {
        questionNumber: 5,
        questionText: 'Which literary device is exemplified in: "The stars danced playfully in the moonlit sky"?',
        optionA: 'Simile',
        optionB: 'Personification',
        optionC: 'Hyperbole',
        optionD: 'Oxymoron',
        correctOption: 'B'
      }
    ];

    setNewTitle('Comprehensive Term Assessment 2026');
    setNewSubject('Physics');
    setNewClass(10);
    setNewSection('A');
    setNewQuestions(samples);
    if (showToast) showToast('Loaded sample examination questions template!', 'success');
  };

  const handleSaveExam = async () => {
    if (!newTitle.trim()) {
      if (showToast) showToast('Please enter an Examination Title.', 'error');
      return;
    }
    if (!newSubject.trim()) {
      if (showToast) showToast('Please select or specify a Subject.', 'error');
      return;
    }
    if (!newConductDate) {
      if (showToast) showToast('Please specify the Conduct Date & Time.', 'error');
      return;
    }

    const filledQuestions = newQuestions.filter(q => q.questionText.trim() !== '');
    if (filledQuestions.length === 0) {
      if (showToast) showToast('Please add at least one complete question.', 'error');
      return;
    }

    for (let i = 0; i < filledQuestions.length; i++) {
      const q = filledQuestions[i];
      if (!q.optionA.trim() || !q.optionB.trim()) {
        if (showToast) showToast(`Question ${q.questionNumber} requires at least Option A and Option B.`, 'error');
        return;
      }
    }

    const payload = {
      assignmentTitle: newTitle.trim(),
      classStandard: parseInt(newClass),
      sectionName: newSection.toUpperCase(),
      subject: newSubject.trim(),
      conductDate: newConductDate,
      resultsReleased: false,
      questions: filledQuestions
    };

    setSaving(true);
    try {
      let res = await fetch(`${GATEWAY_URL}/assignment/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => null);

      if (!res || !res.ok) {
        res = await fetch(`${DIRECT_URL}/assignment/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(() => null);
      }

      if (res && res.ok) {
        if (showToast) showToast('Examination and all question recordings saved successfully!', 'success');
        setNewTitle('');
        setNewQuestions([
          { questionNumber: 1, questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A' },
          { questionNumber: 2, questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'B' }
        ]);
        setViewMode('history');
        fetchAssignments();
      } else {
        if (showToast) showToast('Failed to save examination. Check server status.', 'error');
      }
    } catch (err) {
      console.error('Save exam error:', err);
      if (showToast) showToast('Network error saving examination.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Filtered Examination List
  const filteredAssignments = useMemo(() => {
    return assignments.filter(asm => {
      const matchesSearch =
        !searchQuery.trim() ||
        asm.assignmentTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asm.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `class ${asm.classStandard}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `section ${asm.sectionName}`.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesClass = filterClass === 'ALL' || asm.classStandard === parseInt(filterClass);
      const matchesSection = filterSection === 'ALL' || asm.sectionName?.toUpperCase() === filterSection.toUpperCase();
      const matchesSubject = filterSubject === 'ALL' || asm.subject?.toLowerCase() === filterSubject.toLowerCase();
      const matchesStatus =
        filterStatus === 'ALL' ||
        (filterStatus === 'RELEASED' && asm.resultsReleased) ||
        (filterStatus === 'PENDING' && !asm.resultsReleased);

      return matchesSearch && matchesClass && matchesSection && matchesSubject && matchesStatus;
    });
  }, [assignments, searchQuery, filterClass, filterSection, filterSubject, filterStatus]);

  // Stats calculation
  const stats = useMemo(() => {
    const totalExams = assignments.length;
    const totalQuestions = assignments.reduce((acc, a) => acc + (a.questions?.length || 0), 0);
    const classesCovered = new Set(assignments.map(a => a.classStandard)).size;
    const releasedCount = assignments.filter(a => a.resultsReleased).length;
    const pendingCount = totalExams - releasedCount;
    return { totalExams, totalQuestions, classesCovered, releasedCount, pendingCount };
  }, [assignments]);

  const getSubjectTheme = (subjectName) => {
    return SUBJECT_THEMES[subjectName] || { pillClass: 'teacher', icon: '📝' };
  };

  const handlePrintPaper = () => {
    window.print();
  };

  return (
    <div className="exam-module-container">
      
      {/* 1. TOP STATS OVERVIEW CARDS (Using Design System claim-card & stats tokens) */}
      <div className="exam-stats-grid">
        {/* Stat 1: Total Examinations */}
        <div className="claim-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="card-header-icon" style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe', color: '#1d4ed8' }}>
            <BookOpen size={22} />
          </div>
          <div>
            <div className="claim-label">Total Examinations</div>
            <div className="claim-value">{stats.totalExams}</div>
          </div>
        </div>

        {/* Stat 2: Total Questions */}
        <div className="claim-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="card-header-icon" style={{ backgroundColor: '#faf5ff', borderColor: '#e9d5ff', color: '#7e22ce' }}>
            <FileText size={22} />
          </div>
          <div>
            <div className="claim-label">Questions Banked</div>
            <div className="claim-value">{stats.totalQuestions} <span style={{ fontSize: '13px', color: 'var(--color-slate)', fontWeight: 'normal' }}>MCQs</span></div>
          </div>
        </div>

        {/* Stat 3: Classes Covered */}
        <div className="claim-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="card-header-icon" style={{ backgroundColor: '#fff1f2', borderColor: '#fecdd3', color: '#be123c' }}>
            <GraduationCap size={22} />
          </div>
          <div>
            <div className="claim-label">Classes Covered</div>
            <div className="claim-value">{stats.classesCovered} <span style={{ fontSize: '13px', color: 'var(--color-slate)', fontWeight: 'normal' }}>of 12</span></div>
          </div>
        </div>

        {/* Stat 4: Results Status */}
        <div className="claim-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="card-header-icon" style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', color: '#15803d' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="claim-label">Results Published</div>
            <div className="claim-value" style={{ color: 'var(--color-success)' }}>
              {stats.releasedCount} <span style={{ fontSize: '12px', color: 'var(--color-slate)', fontWeight: 'normal' }}>({stats.pendingCount} Draft)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE CARD (Using module-card) */}
      <div className="module-card">

        {/* Header Bar with View Switcher & Action Tools */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '16px',
          borderBottom: '1px solid var(--color-control-gray)',
          paddingBottom: '16px'
        }}>
          {/* Main Sub Tabs (Using portal-tabs-nav style) */}
          <div className="portal-tabs-nav" style={{ marginBottom: 0, width: 'auto' }}>
            <button
              onClick={() => setViewMode('history')}
              className={`portal-tab-btn ${viewMode === 'history' ? 'active' : ''}`}
            >
              <BookOpen size={16} color={viewMode === 'history' ? 'var(--color-pricing-blue)' : 'currentColor'} />
              <span>Examination Records & History</span>
              <span className="badge-unique" style={{ padding: '2px 8px', fontSize: '11px' }}>
                {assignments.length}
              </span>
            </button>

            <button
              onClick={() => setViewMode('create')}
              className={`portal-tab-btn ${viewMode === 'create' ? 'active' : ''}`}
            >
              <Plus size={16} color={viewMode === 'create' ? 'var(--color-pricing-blue)' : 'currentColor'} />
              <span>Create New Examination</span>
            </button>
          </div>

          {/* Right Action Tools */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {viewMode === 'history' && (
              <>
                {/* Layout toggle (Cards / Table) */}
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--color-paper-frost)', borderRadius: '10px', border: '1px solid var(--color-control-gray)', padding: '2px' }}>
                  <button
                    onClick={() => setLayoutMode('cards')}
                    title="Grid Card View"
                    className={`btn-apple-outline ${layoutMode === 'cards' ? 'active' : ''}`}
                    style={{
                      border: 'none',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      background: layoutMode === 'cards' ? 'var(--color-gallery-white)' : 'transparent',
                      color: layoutMode === 'cards' ? 'var(--color-ink)' : 'var(--color-slate)',
                      boxShadow: layoutMode === 'cards' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none'
                    }}
                  >
                    <Grid size={15} />
                  </button>
                  <button
                    onClick={() => setLayoutMode('table')}
                    title="List Table View"
                    className={`btn-apple-outline ${layoutMode === 'table' ? 'active' : ''}`}
                    style={{
                      border: 'none',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      background: layoutMode === 'table' ? 'var(--color-gallery-white)' : 'transparent',
                      color: layoutMode === 'table' ? 'var(--color-ink)' : 'var(--color-slate)',
                      boxShadow: layoutMode === 'table' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none'
                    }}
                  >
                    <ListIcon size={15} />
                  </button>
                </div>

                <button
                  onClick={fetchAssignments}
                  disabled={loading}
                  className="btn-outlined-explore"
                  title="Refresh Examination Records"
                >
                  <RefreshCw size={13} className={loading ? 'spin' : ''} />
                  Refresh
                </button>
              </>
            )}

            {viewMode === 'create' && (
              <button
                onClick={() => setViewMode('history')}
                className="btn-outlined-explore"
              >
                Back to History Records
              </button>
            )}
          </div>
        </div>

        {/* 3. VIEW MODE: EXAMINATION HISTORY & RECORDS */}
        {viewMode === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-16)' }}>
            
            {/* Search & Filter Bar */}
            <div className="exam-controls-bar">
              {/* Search Bar */}
              <div className="input-wrapper" style={{ minWidth: '260px', flex: '1 1 300px' }}>
                <Search size={16} className="input-icon" />
                <input
                  type="text"
                  placeholder="Search exam title, subject, class, section..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{ position: 'absolute', right: '12px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-slate)' }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Filter Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {/* Filter: Class */}
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="form-select"
                  style={{ width: 'auto', minWidth: '150px' }}
                >
                  <option value="ALL">All Classes (1-12)</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(c => (
                    <option key={c} value={c}>{c} Standard</option>
                  ))}
                </select>

                {/* Filter: Section */}
                <select
                  value={filterSection}
                  onChange={(e) => setFilterSection(e.target.value)}
                  className="form-select"
                  style={{ width: 'auto', minWidth: '130px' }}
                >
                  <option value="ALL">All Sections</option>
                  {['A', 'B', 'C'].map(s => (
                    <option key={s} value={s}>Section {s}</option>
                  ))}
                </select>

                {/* Filter: Status */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="form-select"
                  style={{ width: 'auto', minWidth: '150px' }}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="RELEASED">Results Published</option>
                  <option value="PENDING">Draft / In Review</option>
                </select>

                {(filterClass !== 'ALL' || filterSection !== 'ALL' || filterStatus !== 'ALL' || searchQuery) && (
                  <button
                    onClick={() => {
                      setFilterClass('ALL');
                      setFilterSection('ALL');
                      setFilterStatus('ALL');
                      setSearchQuery('');
                    }}
                    className="apple-link"
                    style={{ marginLeft: '4px', fontSize: '12px', fontWeight: 600 }}
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Content: Loading / Empty / Cards / Table */}
            {loading ? (
              <div className="claim-card" style={{ padding: '48px', textAlign: 'center' }}>
                <RefreshCw size={24} className="spin" style={{ margin: '0 auto 12px', color: 'var(--color-pricing-blue)' }} />
                <p style={{ fontSize: '14px', color: 'var(--color-slate)' }}>Loading examination records & history...</p>
              </div>
            ) : filteredAssignments.length === 0 ? (
              <div className="claim-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
                <div className="card-header-icon" style={{ margin: '0 auto 16px' }}>
                  <BookOpen size={24} color="var(--color-slate)" />
                </div>
                <h4 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-ink)', margin: '0 0 6px 0' }}>
                  No Examination Records Found
                </h4>
                <p style={{ fontSize: '14px', color: 'var(--color-slate)', maxWidth: '440px', margin: '0 auto 20px', lineHeight: '1.5' }}>
                  {searchQuery || filterClass !== 'ALL' || filterSection !== 'ALL'
                    ? 'No examination matches your active search and filter criteria.'
                    : 'No examinations are recorded in the system yet. Click below to create your first examination.'}
                </p>
                <button
                  onClick={() => setViewMode('create')}
                  className="btn-pricing-blue"
                >
                  <Plus size={16} /> Create Examination
                </button>
              </div>
            ) : layoutMode === 'cards' ? (
              /* CARDS GRID VIEW */
              <div className="exam-grid-cards">
                {filteredAssignments.map((exam) => {
                  const theme = getSubjectTheme(exam.subject);
                  const qCount = exam.questions?.length || 0;
                  return (
                    <div key={exam.id} className="exam-card-item">
                      {/* Card Top */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                          <span className={`role-pill ${theme.pillClass}`}>
                            {theme.icon} {exam.subject || 'General'}
                          </span>

                          <span className={`role-pill ${exam.resultsReleased ? 'student' : 'parent'}`}>
                            {exam.resultsReleased ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                            {exam.resultsReleased ? 'Published' : 'Draft'}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="exam-card-title">
                          {exam.assignmentTitle}
                        </h4>

                        {/* Metadata Pills */}
                        <div className="exam-card-meta">
                          <span className="badge-unique">
                            Class {exam.classStandard} • Sec {exam.sectionName}
                          </span>

                          <span style={{ fontSize: '12px', color: 'var(--color-slate)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={13} color="var(--color-steel)" />
                            {exam.conductDate || 'Date TBA'}
                          </span>

                          <span className="role-pill staff" style={{ padding: '2px 8px', fontSize: '11.5px' }}>
                            <FileText size={11} /> {qCount} MCQs
                          </span>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '14px',
                        borderTop: '1px solid var(--color-control-gray)',
                        gap: '8px'
                      }}>
                        <button
                          onClick={() => fetchExamDetails(exam)}
                          className="btn-pricing-blue"
                          style={{ flex: 1, padding: '6px 12px', fontSize: '12.5px' }}
                        >
                          <Eye size={14} />
                          <span>View Full Exam & Key</span>
                        </button>

                        <button
                          onClick={(e) => handleToggleResults(exam.id, exam.resultsReleased, e)}
                          className="btn-outlined-explore"
                          style={{
                            padding: '6px 12px',
                            fontSize: '12px',
                            color: exam.resultsReleased ? 'var(--color-success)' : 'var(--color-slate)'
                          }}
                          title={exam.resultsReleased ? 'Hide from students' : 'Publish to student portal'}
                        >
                          {exam.resultsReleased ? 'Unpublish' : 'Publish'}
                        </button>

                        <button
                          onClick={(e) => handleDeleteExam(exam.id, exam.assignmentTitle, e)}
                          className="btn-outlined-explore"
                          style={{ padding: '6px 8px', color: 'var(--color-error)' }}
                          title="Delete Examination"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* TABLE VIEW (Using table-wrapper & portal-table) */
              <div className="table-wrapper">
                <table className="portal-table">
                  <thead>
                    <tr>
                      <th>Exam Title</th>
                      <th>Subject</th>
                      <th style={{ textAlign: 'center' }}>Class & Sec</th>
                      <th>Conduct Date</th>
                      <th style={{ textAlign: 'center' }}>Questions</th>
                      <th style={{ textAlign: 'center' }}>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssignments.map((exam) => {
                      const theme = getSubjectTheme(exam.subject);
                      const qCount = exam.questions?.length || 0;
                      return (
                        <tr key={exam.id}>
                          <td style={{ fontWeight: 600 }}>{exam.assignmentTitle}</td>
                          <td>
                            <span className={`role-pill ${theme.pillClass}`}>
                              {theme.icon} {exam.subject}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span className="badge-unique">
                              C{exam.classStandard} - {exam.sectionName}
                            </span>
                          </td>
                          <td style={{ color: 'var(--color-slate)', fontSize: '13px' }}>
                            {exam.conductDate || '—'}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span className="role-pill staff" style={{ padding: '2px 8px' }}>
                              {qCount} MCQs
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span className={`role-pill ${exam.resultsReleased ? 'student' : 'parent'}`}>
                              {exam.resultsReleased ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <button
                                onClick={() => fetchExamDetails(exam)}
                                className="btn-apple-outline"
                                style={{ padding: '5px 10px', fontSize: '12px' }}
                              >
                                <Eye size={13} /> View
                              </button>
                              <button
                                onClick={(e) => handleToggleResults(exam.id, exam.resultsReleased, e)}
                                className="btn-outlined-explore"
                                style={{ padding: '5px 8px', fontSize: '12px' }}
                              >
                                {exam.resultsReleased ? 'Unpublish' : 'Publish'}
                              </button>
                              <button
                                onClick={(e) => handleDeleteExam(exam.id, exam.assignmentTitle, e)}
                                className="btn-outlined-explore"
                                style={{ padding: '5px 6px', color: 'var(--color-error)' }}
                                title="Delete Examination"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 4. VIEW MODE: CREATE NEW EXAMINATION (Using form-grid, form-group, form-input, form-select) */}
        {viewMode === 'create' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-24)' }}>
            
            {/* Top Info Banner */}
            <div className="claim-card" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              backgroundColor: '#f0fdf4',
              borderColor: '#bbf7d0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div className="card-header-icon" style={{ backgroundColor: '#ffffff', borderColor: '#bbf7d0', color: '#16a34a' }}>
                  <Sparkles size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)', margin: '0 0 2px 0' }}>
                    Create Examination & MCQ Question Paper
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--color-slate)', margin: 0 }}>
                    Configure exam metadata, select the target class cohort, and record MCQ questions with answer keys.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLoadSampleQuestions}
                className="btn-outlined-explore"
              >
                <Sparkles size={14} color="var(--color-pricing-blue)" />
                Load Sample Template
              </button>
            </div>

            {/* Step 1: Exam Metadata Section */}
            <div className="apple-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <div className="card-header-icon" style={{ width: '32px', height: '32px' }}>
                  <Tag size={16} color="var(--color-pricing-blue)" />
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>
                  Step 1: Examination Configuration & Target Cohort
                </h4>
              </div>

              <div className="form-grid">
                {/* Exam Title */}
                <div className="form-group full-width">
                  <label className="form-label">
                    Examination Title <span style={{ color: 'var(--color-error)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Term 1 Mathematics Assessment 2026 / Physics Unit Test 2"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="form-input no-icon"
                  />
                </div>

                {/* Target Class */}
                <div className="form-group">
                  <label className="form-label">
                    Target Class Standard <span style={{ color: 'var(--color-error)' }}>*</span>
                  </label>
                  <select
                    value={newClass}
                    onChange={(e) => setNewClass(parseInt(e.target.value))}
                    className="form-select"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(c => (
                      <option key={c} value={c}>{c} Standard</option>
                    ))}
                  </select>
                </div>

                {/* Target Section */}
                <div className="form-group">
                  <label className="form-label">
                    Target Section <span style={{ color: 'var(--color-error)' }}>*</span>
                  </label>
                  <select
                    value={newSection}
                    onChange={(e) => setNewSection(e.target.value)}
                    className="form-select"
                  >
                    {['A', 'B', 'C'].map(sec => (
                      <option key={sec} value={sec}>Section {sec}</option>
                    ))}
                  </select>
                </div>

                {/* Subject Name & Quick Preset Chips */}
                <div className="form-group">
                  <label className="form-label">
                    Subject Name <span style={{ color: 'var(--color-error)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mathematics"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="form-input no-icon"
                    style={{ marginBottom: '8px' }}
                  />
                  {/* Preset Pills */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {Object.keys(SUBJECT_THEMES).map(subj => {
                      const isSelected = newSubject.toLowerCase() === subj.toLowerCase();
                      return (
                        <button
                          key={subj}
                          type="button"
                          onClick={() => setNewSubject(subj)}
                          className={`role-pill ${SUBJECT_THEMES[subj].pillClass}`}
                          style={{
                            cursor: 'pointer',
                            border: isSelected ? '2px solid var(--color-pricing-blue)' : '1px solid var(--color-control-border)',
                            fontWeight: isSelected ? 700 : 500,
                            padding: '3px 10px'
                          }}
                        >
                          {SUBJECT_THEMES[subj].icon} {subj}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Conduct Date & Time */}
                <div className="form-group">
                  <label className="form-label">
                    Conduct Date & Time <span style={{ color: 'var(--color-error)' }}>*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={newConductDate}
                    onChange={(e) => setNewConductDate(e.target.value)}
                    className="form-input no-icon"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Dynamic Question Builder */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="card-header-icon" style={{ width: '32px', height: '32px' }}>
                    <HelpCircle size={16} color="var(--color-pricing-blue)" />
                  </div>
                  <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>
                    Step 2: Multiple Choice Questions ({newQuestions.length} Questions)
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="btn-pricing-blue"
                  style={{ padding: '7px 16px' }}
                >
                  <Plus size={15} /> Add Another Question
                </button>
              </div>

              {/* Questions Cards List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {newQuestions.map((q, qIdx) => (
                  <div key={qIdx} className="exam-question-box">
                    {/* Question Card Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="badge-unique" style={{ background: 'var(--color-ink)', color: '#ffffff', border: 'none', padding: '4px 10px', fontSize: '13px' }}>
                          Q{q.questionNumber}
                        </span>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-ink)' }}>
                          Question #{q.questionNumber}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {/* Correct Key Selector */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-paper-frost)', padding: '4px 10px', borderRadius: '12px', border: '1px solid var(--color-control-gray)' }}>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-slate)' }}>Correct Answer Key:</span>
                          {['A', 'B', 'C', 'D'].map(opt => {
                            const isKey = q.correctOption === opt;
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => handleUpdateQuestion(qIdx, 'correctOption', opt)}
                                style={{
                                  width: '26px',
                                  height: '26px',
                                  borderRadius: '6px',
                                  border: 'none',
                                  background: isKey ? '#16a34a' : 'transparent',
                                  color: isKey ? '#ffffff' : 'var(--color-ink)',
                                  fontWeight: 700,
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>

                        {newQuestions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(qIdx)}
                            className="btn-outlined-explore"
                            style={{ padding: '6px 8px', color: 'var(--color-error)' }}
                            title="Delete this question"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Question Prompt */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <textarea
                        rows={2}
                        placeholder={`Enter question #${q.questionNumber} prompt text...`}
                        value={q.questionText}
                        onChange={(e) => handleUpdateQuestion(qIdx, 'questionText', e.target.value)}
                        className="form-textarea"
                      />
                    </div>

                    {/* 4 Choices Grid (2x2 grid) */}
                    <div className="form-grid" style={{ gap: '12px' }}>
                      {/* Option A */}
                      <div className={`exam-option-card ${q.correctOption === 'A' ? 'correct' : ''}`}>
                        <span className="exam-option-letter">A)</span>
                        <input
                          type="text"
                          placeholder="Option A choice text"
                          value={q.optionA}
                          onChange={(e) => handleUpdateQuestion(qIdx, 'optionA', e.target.value)}
                          className="form-input no-icon"
                          style={{ border: 'none', background: 'transparent', padding: 0 }}
                        />
                      </div>

                      {/* Option B */}
                      <div className={`exam-option-card ${q.correctOption === 'B' ? 'correct' : ''}`}>
                        <span className="exam-option-letter">B)</span>
                        <input
                          type="text"
                          placeholder="Option B choice text"
                          value={q.optionB}
                          onChange={(e) => handleUpdateQuestion(qIdx, 'optionB', e.target.value)}
                          className="form-input no-icon"
                          style={{ border: 'none', background: 'transparent', padding: 0 }}
                        />
                      </div>

                      {/* Option C */}
                      <div className={`exam-option-card ${q.correctOption === 'C' ? 'correct' : ''}`}>
                        <span className="exam-option-letter">C)</span>
                        <input
                          type="text"
                          placeholder="Option C choice text"
                          value={q.optionC}
                          onChange={(e) => handleUpdateQuestion(qIdx, 'optionC', e.target.value)}
                          className="form-input no-icon"
                          style={{ border: 'none', background: 'transparent', padding: 0 }}
                        />
                      </div>

                      {/* Option D */}
                      <div className={`exam-option-card ${q.correctOption === 'D' ? 'correct' : ''}`}>
                        <span className="exam-option-letter">D)</span>
                        <input
                          type="text"
                          placeholder="Option D choice text"
                          value={q.optionD}
                          onChange={(e) => handleUpdateQuestion(qIdx, 'optionD', e.target.value)}
                          className="form-input no-icon"
                          style={{ border: 'none', background: 'transparent', padding: 0 }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Action Bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                paddingTop: '16px',
                borderTop: '1px solid var(--color-control-gray)'
              }}>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="btn-apple-outline"
                  style={{ padding: '8px 18px' }}
                >
                  <Plus size={15} /> Add Another Question
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setViewMode('history')}
                    className="btn-outlined-explore"
                    style={{ padding: '8px 20px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveExam}
                    disabled={saving}
                    className="btn-pricing-blue"
                    style={{ padding: '9px 24px' }}
                  >
                    {saving ? <RefreshCw size={15} className="spin" /> : <Check size={15} />}
                    <span>Save & Record Examination</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. DETAILED EXAMINATION DOSSIER & QUESTION PAPER MODAL */}
      {selectedExam && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px',
            boxSizing: 'border-box'
          }}
          onClick={() => setSelectedExam(null)}
        >
          <div
            className="apple-card"
            style={{
              width: '100%',
              maxWidth: '860px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              padding: 0,
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--color-control-gray)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--color-studio-mist)',
              gap: '16px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span className={`role-pill ${getSubjectTheme(selectedExam.subject).pillClass}`}>
                    {getSubjectTheme(selectedExam.subject).icon} {selectedExam.subject}
                  </span>
                  <span className="badge-unique">
                    Class {selectedExam.classStandard} - Sec {selectedExam.sectionName}
                  </span>
                  <span className={`role-pill ${selectedExam.resultsReleased ? 'student' : 'parent'}`}>
                    {selectedExam.resultsReleased ? 'Published' : 'Draft'}
                  </span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-ink)', margin: 0 }}>
                  {selectedExam.assignmentTitle}
                </h3>
              </div>

              {/* Action Buttons in Modal Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={handlePrintPaper}
                  className="btn-outlined-explore"
                  title="Print Question Paper"
                >
                  <Printer size={14} /> Print Paper
                </button>

                <button
                  onClick={(e) => handleToggleResults(selectedExam.id, selectedExam.resultsReleased, e)}
                  className="btn-outlined-explore"
                  style={{ color: selectedExam.resultsReleased ? 'var(--color-success)' : 'var(--color-slate)' }}
                >
                  {selectedExam.resultsReleased ? 'Unpublish' : 'Publish'}
                </button>

                <button
                  onClick={(e) => handleDeleteExam(selectedExam.id, selectedExam.assignmentTitle, e)}
                  className="btn-outlined-explore"
                  style={{ color: 'var(--color-error)', borderColor: '#fecdd3', background: '#fff1f2' }}
                  title="Permanently Delete This Examination"
                >
                  <Trash2 size={14} /> Delete Exam
                </button>

                <button
                  onClick={() => setSelectedExam(null)}
                  className="card-header-icon"
                  style={{ width: '32px', height: '32px', cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Modal Sub Tabs */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 24px',
              borderBottom: '1px solid var(--color-control-gray)',
              background: 'var(--color-gallery-white)'
            }}>
              <button
                onClick={() => setModalTab('questions')}
                className={`portal-tab-btn ${modalTab === 'questions' ? 'active' : ''}`}
                style={{ flex: 'none', padding: '6px 16px', minWidth: 'auto' }}
              >
                Question Bank & Key ({selectedExamQuestions.length} MCQs)
              </button>
              <button
                onClick={() => setModalTab('student-paper')}
                className={`portal-tab-btn ${modalTab === 'student-paper' ? 'active' : ''}`}
                style={{ flex: 'none', padding: '6px 16px', minWidth: 'auto' }}
              >
                Student Paper (Print Preview)
              </button>
              <button
                onClick={() => setModalTab('overview')}
                className={`portal-tab-btn ${modalTab === 'overview' ? 'active' : ''}`}
                style={{ flex: 'none', padding: '6px 16px', minWidth: 'auto' }}
              >
                Examination Dossier
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', overflowY: 'auto', maxHeight: 'calc(90vh - 160px)' }}>
              
              {/* TAB 1: QUESTIONS & ANSWER KEY */}
              {modalTab === 'questions' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {examDetailLoading ? (
                    <div className="claim-card" style={{ padding: '40px', textAlign: 'center' }}>
                      <RefreshCw size={20} className="spin" style={{ margin: '0 auto 8px', color: 'var(--color-pricing-blue)' }} />
                      <p style={{ fontSize: '13px', color: 'var(--color-slate)' }}>Loading examination questions...</p>
                    </div>
                  ) : selectedExamQuestions.length === 0 ? (
                    <div className="claim-card" style={{ padding: '32px', textAlign: 'center', color: 'var(--color-slate)' }}>
                      No questions recorded for this examination.
                    </div>
                  ) : (
                    selectedExamQuestions.map((q, idx) => {
                      const isCorrectA = q.correctOption === 'A';
                      const isCorrectB = q.correctOption === 'B';
                      const isCorrectC = q.correctOption === 'C';
                      const isCorrectD = q.correctOption === 'D';

                      return (
                        <div key={q.id || idx} className="exam-question-box">
                          {/* Question Text */}
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                              <span className="badge-unique" style={{ background: 'var(--color-ink)', color: '#ffffff', border: 'none', padding: '3px 8px' }}>
                                Q{q.questionNumber || idx + 1}
                              </span>
                              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-ink)', lineHeight: '1.4' }}>
                                {q.questionText}
                              </div>
                            </div>

                            <span className="role-pill student" style={{ padding: '2px 8px', fontSize: '12px' }}>
                              ✓ Key: Option {q.correctOption}
                            </span>
                          </div>

                          {/* 4 Choices */}
                          <div className="form-grid" style={{ gap: '10px' }}>
                            {/* Option A */}
                            <div className={`exam-option-card ${isCorrectA ? 'correct' : ''}`}>
                              <span className="exam-option-letter">A)</span>
                              <span style={{ fontSize: '13px', color: isCorrectA ? 'var(--color-success)' : 'var(--color-ink)', fontWeight: isCorrectA ? 600 : 400 }}>
                                {q.optionA || '—'}
                              </span>
                            </div>

                            {/* Option B */}
                            <div className={`exam-option-card ${isCorrectB ? 'correct' : ''}`}>
                              <span className="exam-option-letter">B)</span>
                              <span style={{ fontSize: '13px', color: isCorrectB ? 'var(--color-success)' : 'var(--color-ink)', fontWeight: isCorrectB ? 600 : 400 }}>
                                {q.optionB || '—'}
                              </span>
                            </div>

                            {/* Option C */}
                            {q.optionC && (
                              <div className={`exam-option-card ${isCorrectC ? 'correct' : ''}`}>
                                <span className="exam-option-letter">C)</span>
                                <span style={{ fontSize: '13px', color: isCorrectC ? 'var(--color-success)' : 'var(--color-ink)', fontWeight: isCorrectC ? 600 : 400 }}>
                                  {q.optionC}
                                </span>
                              </div>
                            )}

                            {/* Option D */}
                            {q.optionD && (
                              <div className={`exam-option-card ${isCorrectD ? 'correct' : ''}`}>
                                <span className="exam-option-letter">D)</span>
                                <span style={{ fontSize: '13px', color: isCorrectD ? 'var(--color-success)' : 'var(--color-ink)', fontWeight: isCorrectD ? 600 : 400 }}>
                                  {q.optionD}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* TAB 2: STUDENT PAPER PREVIEW (PRINT VIEW) */}
              {modalTab === 'student-paper' && (
                <div style={{
                  background: '#ffffff',
                  padding: '32px',
                  borderRadius: '16px',
                  border: '1px solid var(--color-control-gray)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px'
                }}>
                  {/* Paper Header */}
                  <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '16px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0', textTransform: 'uppercase' }}>
                      Smart Campus Academy — Examination Paper
                    </h2>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-pricing-blue)', margin: '0 0 8px 0' }}>
                      {selectedExam.assignmentTitle}
                    </h3>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '13px', color: 'var(--color-slate)', fontWeight: 600 }}>
                      <span>Subject: {selectedExam.subject}</span>
                      <span>•</span>
                      <span>Class: {selectedExam.classStandard} Standard</span>
                      <span>•</span>
                      <span>Section: {selectedExam.sectionName}</span>
                      <span>•</span>
                      <span>Total Questions: {selectedExamQuestions.length}</span>
                    </div>
                  </div>

                  {/* Questions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    {selectedExamQuestions.map((q, idx) => (
                      <div key={q.id || idx} style={{ borderBottom: '1px dashed var(--color-control-gray)', paddingBottom: '14px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
                          Q{q.questionNumber || idx + 1}. {q.questionText}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '13px', color: '#334155' }}>
                          <div>(A) {q.optionA}</div>
                          <div>(B) {q.optionB}</div>
                          {q.optionC && <div>(C) {q.optionC}</div>}
                          {q.optionD && <div>(D) {q.optionD}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: OVERVIEW & META INFO */}
              {modalTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="claims-grid">
                    <div className="claim-card">
                      <div className="claim-label">Examination ID</div>
                      <div className="claim-value">#{selectedExam.id}</div>
                    </div>
                    <div className="claim-card">
                      <div className="claim-label">Target Cohort</div>
                      <div className="claim-value" style={{ color: 'var(--color-pricing-blue)' }}>
                        Class {selectedExam.classStandard} - {selectedExam.sectionName}
                      </div>
                    </div>
                    <div className="claim-card">
                      <div className="claim-label">Subject</div>
                      <div className="claim-value">{selectedExam.subject}</div>
                    </div>
                    <div className="claim-card">
                      <div className="claim-label">Conduct Schedule</div>
                      <div className="claim-value" style={{ fontSize: '15px' }}>{selectedExam.conductDate || 'Not Scheduled'}</div>
                    </div>
                  </div>

                  <div className="claim-card">
                    <div className="claim-label">Database Sync & Records Status</div>
                    <p style={{ fontSize: '13px', color: 'var(--color-slate)', lineHeight: '1.5', margin: '6px 0 0 0' }}>
                      This examination is registered in the JPA microservice repository. Student MCQ responses in the student portal are automatically graded against the answer key recorded in this module.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
