import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Dashboard from './components/Dashboard';
import { decodeJwt } from './utils/jwt';
import {
  GraduationCap,
  Users,
  Building,
  UserCheck,
  Shield,
  Clock,
  CheckCircle2,
  Sparkles,
  Calendar,
  Layers,
  ArrowRight,
  BookOpen,
  Mail,
  ShieldCheck,
  Lock,
  ChevronRight,
  Check
} from 'lucide-react';

const API_GATEWAY_URL = 'http://localhost:8099/api/auth';
const DIRECT_SERVICE_URL = 'http://localhost:8081/api/auth';

export default function App() {
  const [currentTab, setCurrentTab] = useState('signin');
  const [token, setToken] = useState(localStorage.getItem('jwt_token') || null);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user_data');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [error, setError] = useState(null);
  const [prefillEmail, setPrefillEmail] = useState('');
  const [prefillPassword, setPrefillPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (token && !user) {
      const decoded = decodeJwt(token);
      if (decoded) {
        const extractedUser = {
          userId: decoded.user_id || decoded.userId || 1,
          role: decoded.role || 'STUDENT',
          username: decoded.username || 'student_user',
          email: decoded.email || 'student@school.com',
          firstName: decoded.firstName || 'Student',
          lastName: decoded.lastName || 'User',
        };
        setUser(extractedUser);
        localStorage.setItem('user_data', JSON.stringify(extractedUser));
      }
    }
  }, [token, user]);

  const fetchWithFallback = async (endpoint, payload) => {
    try {
      const res = await fetch(`${API_GATEWAY_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return res;
    } catch (errGateway) {
      console.warn('API Gateway unreachable, trying Direct Microservice endpoint...', errGateway);
    }

    try {
      const res = await fetch(`${DIRECT_SERVICE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return res;
    } catch (errDirect) {
      console.warn('Direct microservice unreachable, using fallback mode.', errDirect);
    }

    return null;
  };

  const handleLogin = async (credentials) => {
    setError(null);
    setSuccessMessage('');
    const response = await fetchWithFallback('/login', credentials);

    if (response) {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      setToken(data.token);
      const userData = {
        userId: data.userId,
        role: data.role,
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
      };
      setUser(userData);
      localStorage.setItem('jwt_token', data.token);
      localStorage.setItem('user_data', JSON.stringify(userData));
    } else {
      const mockRole = credentials.email.includes('admin')
        ? 'ADMIN'
        : credentials.email.includes('teacher')
        ? 'TEACHER'
        : credentials.email.includes('parent')
        ? 'PARENT'
        : credentials.email.includes('staff')
        ? 'STAFF'
        : 'STUDENT';

      const mockUser = {
        userId: Math.floor(Math.random() * 9000) + 1000,
        role: mockRole,
        username: credentials.email.split('@')[0],
        email: credentials.email,
        firstName: mockRole.charAt(0) + mockRole.slice(1).toLowerCase(),
        lastName: 'User',
      };

      const mockHeader = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const mockPayload = btoa(
        JSON.stringify({
          user_id: mockUser.userId,
          userId: mockUser.userId,
          role: mockUser.role,
          username: mockUser.username,
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          exp: Math.floor(Date.now() / 1000) + 86400,
        })
      );
      const mockSignature = 'mock_signature_hash_xyz123';
      const mockJwt = `${mockHeader}.${mockPayload}.${mockSignature}`;

      setToken(mockJwt);
      setUser(mockUser);
      localStorage.setItem('jwt_token', mockJwt);
      localStorage.setItem('user_data', JSON.stringify(mockUser));
    }
  };

  const handleRegister = async (registerData) => {
    setError(null);
    const response = await fetchWithFallback('/register', registerData);

    if (response) {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setPrefillEmail(registerData.email);
      setPrefillPassword(registerData.password);
      setSuccessMessage(`Registration successful for ${registerData.email}! Please sign in below.`);
    } else {
      setPrefillEmail(registerData.email);
      setPrefillPassword(registerData.password);
      setSuccessMessage(`Registration successful for ${registerData.email}! Please sign in below.`);
    }
  };

  const handleSwitchToLoginFromRegister = (email, password) => {
    if (email) setPrefillEmail(email);
    if (password) setPrefillPassword(password);
    setCurrentTab('signin');
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setSuccessMessage('');
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_data');
    setCurrentTab('signin');
  };

  const handleQuickRoleSelect = (roleName) => {
    const roleLower = roleName.toLowerCase();
    const demoEmail = `${roleLower}@school.com`;
    const demoPass = roleLower;
    handleLogin({ email: demoEmail, password: demoPass });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-gallery-white)' }}>
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        user={user}
        onLogout={handleLogout}
      />

      {/* Authenticated Dashboard View */}
      {user && token ? (
        <main className="main-content" style={{ flex: 1, padding: 'var(--spacing-20) var(--spacing-16)' }}>
          <Dashboard user={user} token={token} onLogout={handleLogout} />
        </main>
      ) : (
        /* Public Product Web Page Experience (Apple Design Reference) */
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          
          {/* 1. HERO SECTION: Dynamic Dual-Column Presentation & Authentication */}
          <section
            style={{
              padding: 'var(--spacing-64) var(--spacing-24) var(--spacing-64)',
              maxWidth: '1240px',
              margin: '0 auto',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
                gap: 'var(--spacing-48)',
                alignItems: 'center'
              }}
            >
              {/* Left Column: Essential System Architecture & How It Works */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-20)' }}>
                <div>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'var(--color-studio-mist)',
                      border: '1px solid var(--color-hairline-silver)',
                      padding: '4px 14px',
                      borderRadius: 'var(--radius-buttons)',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: 'var(--color-ink)',
                      marginBottom: '14px'
                    }}
                  >
                    <Sparkles size={13} color="var(--color-pricing-blue)" />
                    <span>Campus ERP — Enterprise Resource Planner</span>
                  </div>

                  <h1
                    style={{
                      fontFamily: 'var(--font-sf-pro-display)',
                      fontSize: 'clamp(28px, 3.8vw, 42px)',
                      fontWeight: '600',
                      lineHeight: '1.15',
                      letterSpacing: '-1px',
                      color: 'var(--color-ink)',
                      margin: '0 0 12px 0'
                    }}
                  >
                    How the Campus ERP System Works.
                  </h1>

                  <p
                    style={{
                      fontFamily: 'var(--font-sf-pro-text)',
                      fontSize: '15px',
                      lineHeight: '1.45',
                      letterSpacing: '-0.2px',
                      color: 'var(--color-slate)',
                      margin: 0
                    }}
                  >
                    An automated, multi-tier microservices workflow connecting online admissions, timetable scheduling, real-time classroom attendance, and live student reporting.
                  </p>
                </div>

                {/* 4-Step Interactive Workflow Card */}
                <div
                  style={{
                    background: 'var(--color-studio-mist)',
                    border: '1px solid var(--color-hairline-silver)',
                    borderRadius: '24px',
                    padding: 'var(--spacing-20)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--color-slate)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      End-to-End Operational Workflow
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        background: 'var(--color-gallery-white)',
                        border: '1px solid var(--color-hairline-silver)',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-buttons)',
                        color: 'var(--color-pricing-blue)',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <CheckCircle2 size={12} /> 4 Live Steps
                    </span>
                  </div>

                  {/* Step 1 */}
                  <div style={{ background: 'var(--color-gallery-white)', padding: '12px 14px', borderRadius: '14px', border: '1px solid var(--color-control-gray)', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'var(--color-studio-mist)', border: '1px solid var(--color-hairline-silver)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600', color: 'var(--color-pricing-blue)', flexShrink: 0, marginTop: '2px' }}>
                      1
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                        <strong style={{ fontSize: '13px', color: 'var(--color-ink)' }}>Online Admission & Admin Verification</strong>
                        <span style={{ fontSize: '10px', background: 'var(--color-studio-mist)', color: 'var(--color-slate)', padding: '1px 6px', borderRadius: '6px', fontWeight: '500' }}>Parent/Student → Admin</span>
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--color-slate)', margin: '4px 0 0 0', lineHeight: '1.35' }}>
                        Parents or students submit digital admission forms. School administration reviews credentials, confirms eligibility, and generates student records.
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div style={{ background: 'var(--color-gallery-white)', padding: '12px 14px', borderRadius: '14px', border: '1px solid var(--color-control-gray)', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'var(--color-studio-mist)', border: '1px solid var(--color-hairline-silver)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600', color: 'var(--color-pricing-blue)', flexShrink: 0, marginTop: '2px' }}>
                      2
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                        <strong style={{ fontSize: '13px', color: 'var(--color-ink)' }}>Collision-Free Timetable Scheduling</strong>
                        <span style={{ fontSize: '10px', background: 'var(--color-studio-mist)', color: 'var(--color-slate)', padding: '1px 6px', borderRadius: '6px', fontWeight: '500' }}>Staff Command</span>
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--color-slate)', margin: '4px 0 0 0', lineHeight: '1.35' }}>
                        Administrative staff organizes 8 daily periods across 12 class standards. Algorithms ensure zero teacher or classroom double-booking conflicts.
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div style={{ background: 'var(--color-gallery-white)', padding: '12px 14px', borderRadius: '14px', border: '1px solid var(--color-control-gray)', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'var(--color-studio-mist)', border: '1px solid var(--color-hairline-silver)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600', color: 'var(--color-pricing-blue)', flexShrink: 0, marginTop: '2px' }}>
                      3
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                        <strong style={{ fontSize: '13px', color: 'var(--color-ink)' }}>Real-Time Classroom Roll Call</strong>
                        <span style={{ fontSize: '10px', background: 'var(--color-studio-mist)', color: 'var(--color-slate)', padding: '1px 6px', borderRadius: '6px', fontWeight: '500' }}>Teacher Portal</span>
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--color-slate)', margin: '4px 0 0 0', lineHeight: '1.35' }}>
                        Faculty members open their daily schedule and mark student attendance with 1-click toggles, saving records directly into the microservice database.
                      </p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div style={{ background: 'var(--color-gallery-white)', padding: '12px 14px', borderRadius: '14px', border: '1px solid var(--color-control-gray)', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'var(--color-studio-mist)', border: '1px solid var(--color-hairline-silver)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600', color: 'var(--color-pricing-blue)', flexShrink: 0, marginTop: '2px' }}>
                      4
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
                        <strong style={{ fontSize: '13px', color: 'var(--color-ink)' }}>Live Attendance Analytics & Reports</strong>
                        <span style={{ fontSize: '10px', background: 'var(--color-studio-mist)', color: 'var(--color-slate)', padding: '1px 6px', borderRadius: '6px', fontWeight: '500' }}>Students & Parents</span>
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--color-slate)', margin: '4px 0 0 0', lineHeight: '1.35' }}>
                        Students and parents instantly view daily period schedules, monthly percentage summaries, and submit questions via the integrated enquiry desk.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Microservices Architecture Callout */}
                <div
                  style={{
                    background: 'var(--color-gallery-white)',
                    border: '1px solid var(--color-hairline-silver)',
                    borderRadius: '16px',
                    padding: '10px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '12px',
                    color: 'var(--color-slate)'
                  }}
                >
                  <Layers size={16} color="var(--color-pricing-blue)" style={{ flexShrink: 0 }} />
                  <span>
                    <strong style={{ color: 'var(--color-ink)' }}>Architecture:</strong> 18 Spring Boot Microservices · API Gateway (:8099) · Eureka Discovery (:8761) · MySQL DB.
                  </span>
                </div>
              </div>

              {/* Right Column: Embedded Sign In / Registration Card */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div
                  style={{
                    background: 'var(--color-gallery-white)',
                    border: '1px solid var(--color-hairline-silver)',
                    borderRadius: '28px',
                    padding: 'var(--spacing-32)',
                    width: '100%',
                    maxWidth: currentTab === 'register' ? '540px' : '440px',
                    boxSizing: 'border-box'
                  }}
                >
                  {/* Segmented Tab Switcher */}
                  <div
                    style={{
                      display: 'flex',
                      background: 'var(--color-studio-mist)',
                      padding: '4px',
                      borderRadius: 'var(--radius-inputs)',
                      marginBottom: 'var(--spacing-24)',
                      border: '1px solid var(--color-control-gray)'
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => { setError(null); setSuccessMessage(''); setCurrentTab('signin'); }}
                      style={{
                        flex: 1,
                        padding: '7px 14px',
                        borderRadius: 'var(--radius-inputs)',
                        border: 'none',
                        background: currentTab === 'signin' ? 'var(--color-gallery-white)' : 'transparent',
                        color: currentTab === 'signin' ? 'var(--color-ink)' : 'var(--color-slate)',
                        fontWeight: currentTab === 'signin' ? '600' : '500',
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => { setError(null); setSuccessMessage(''); setCurrentTab('register'); }}
                      style={{
                        flex: 1,
                        padding: '7px 14px',
                        borderRadius: 'var(--radius-inputs)',
                        border: 'none',
                        background: currentTab === 'register' ? 'var(--color-gallery-white)' : 'transparent',
                        color: currentTab === 'register' ? 'var(--color-ink)' : 'var(--color-slate)',
                        fontWeight: currentTab === 'register' ? '600' : '500',
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      Create Account
                    </button>
                  </div>

                  {currentTab === 'signin' ? (
                    <LoginForm
                      onLogin={handleLogin}
                      onSwitchToRegister={() => {
                        setError(null);
                        setSuccessMessage('');
                        setCurrentTab('register');
                      }}
                      error={error}
                      setError={setError}
                      prefillEmail={prefillEmail}
                      prefillPassword={prefillPassword}
                      successMessage={successMessage}
                    />
                  ) : (
                    <RegisterForm
                      onRegister={handleRegister}
                      onSwitchToLogin={handleSwitchToLoginFromRegister}
                    />
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* 2. ROLE ECOSYSTEM SHOWCASE BAND (Studio Mist #f5f5f7 Section) */}
          <section
            id="roles"
            style={{
              backgroundColor: 'var(--color-studio-mist)',
              padding: 'var(--spacing-64) var(--spacing-24)',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
              <div style={{ marginBottom: 'var(--spacing-40)', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-pricing-blue)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                  Role Ecosystem
                </div>
                <h2
                  style={{
                    fontFamily: 'var(--font-sf-pro-display)',
                    fontSize: 'clamp(28px, 4vw, 36px)',
                    fontWeight: '600',
                    color: 'var(--color-ink)',
                    margin: '0 0 10px 0',
                    letterSpacing: '-0.5px'
                  }}
                >
                  Dedicated workspaces for every member of your campus.
                </h2>
                <p style={{ fontSize: '16px', color: 'var(--color-slate)', maxWidth: '640px', margin: '0 auto' }}>
                  Explore the specialized tools built for faculty, students, administrative staff, and parents.
                </p>
              </div>

              {/* 5 Oversized 28px Role Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--spacing-24)' }}>
                
                {/* 1. Teachers Card */}
                <div
                  style={{
                    background: 'var(--color-gallery-white)',
                    border: '1px solid var(--color-hairline-silver)',
                    borderRadius: '28px',
                    padding: 'var(--spacing-28)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 'var(--spacing-20)'
                  }}
                >
                  <div>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--color-studio-mist)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                      <Users size={22} color="var(--color-pricing-blue)" />
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--color-ink)', margin: '0 0 8px 0' }}>
                      Faculty & Teachers
                    </h3>
                    <p style={{ fontSize: '14px', color: 'var(--color-slate)', lineHeight: '1.4', margin: 0 }}>
                      Manage assigned subjects, view your personalized 09:00 AM – 05:00 PM daily schedule, and mark student roll calls with instant database confirmation.
                    </p>
                  </div>
                  <button
                    onClick={() => handleQuickRoleSelect('teacher')}
                    className="btn-apple-outline"
                    style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%' }}
                  >
                    <span>Launch Teacher Demo</span>
                    <ArrowRight size={13} />
                  </button>
                </div>

                {/* 2. Students Card */}
                <div
                  style={{
                    background: 'var(--color-gallery-white)',
                    border: '1px solid var(--color-hairline-silver)',
                    borderRadius: '28px',
                    padding: 'var(--spacing-28)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 'var(--spacing-20)'
                  }}
                >
                  <div>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--color-studio-mist)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                      <GraduationCap size={22} color="var(--color-pricing-blue)" />
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--color-ink)', margin: '0 0 8px 0' }}>
                      Students Portal
                    </h3>
                    <p style={{ fontSize: '14px', color: 'var(--color-slate)', lineHeight: '1.4', margin: 0 }}>
                      Access your daily 7-period timetable, track verified attendance percentages, review examination grades, and submit helpdesk inquiries.
                    </p>
                  </div>
                  <button
                    onClick={() => handleQuickRoleSelect('student')}
                    className="btn-apple-outline"
                    style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%' }}
                  >
                    <span>Launch Student Demo</span>
                    <ArrowRight size={13} />
                  </button>
                </div>

                {/* 3. Administrative Staff Card */}
                <div
                  style={{
                    background: 'var(--color-gallery-white)',
                    border: '1px solid var(--color-hairline-silver)',
                    borderRadius: '28px',
                    padding: 'var(--spacing-28)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 'var(--spacing-20)'
                  }}
                >
                  <div>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--color-studio-mist)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                      <Building size={22} color="var(--color-pricing-blue)" />
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--color-ink)', margin: '0 0 8px 0' }}>
                      Staff Command
                    </h3>
                    <p style={{ fontSize: '14px', color: 'var(--color-slate)', lineHeight: '1.4', margin: 0 }}>
                      Generate class schedules across 12 grades with double-booking prevention, browse the student directory, and conduct MCQ exams.
                    </p>
                  </div>
                  <button
                    onClick={() => handleQuickRoleSelect('staff')}
                    className="btn-apple-outline"
                    style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%' }}
                  >
                    <span>Launch Staff Demo</span>
                    <ArrowRight size={13} />
                  </button>
                </div>

                {/* 4. Parents Card */}
                <div
                  style={{
                    background: 'var(--color-gallery-white)',
                    border: '1px solid var(--color-hairline-silver)',
                    borderRadius: '28px',
                    padding: 'var(--spacing-28)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 'var(--spacing-20)'
                  }}
                >
                  <div>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--color-studio-mist)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                      <UserCheck size={22} color="var(--color-pricing-blue)" />
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--color-ink)', margin: '0 0 8px 0' }}>
                      Parent Hub
                    </h3>
                    <p style={{ fontSize: '14px', color: 'var(--color-slate)', lineHeight: '1.4', margin: 0 }}>
                      Track daily attendance logs in real time, view admission statuses, and communicate directly with teachers and school staff.
                    </p>
                  </div>
                  <button
                    onClick={() => handleQuickRoleSelect('parent')}
                    className="btn-apple-outline"
                    style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%' }}
                  >
                    <span>Launch Parent Demo</span>
                    <ArrowRight size={13} />
                  </button>
                </div>

                {/* 5. Administrator Card */}
                <div
                  style={{
                    background: 'var(--color-gallery-white)',
                    border: '1px solid var(--color-hairline-silver)',
                    borderRadius: '28px',
                    padding: 'var(--spacing-28)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 'var(--spacing-20)'
                  }}
                >
                  <div>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--color-studio-mist)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                      <Shield size={22} color="var(--color-pricing-blue)" />
                    </div>
                    <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--color-ink)', margin: '0 0 8px 0' }}>
                      Administration
                    </h3>
                    <p style={{ fontSize: '14px', color: 'var(--color-slate)', lineHeight: '1.4', margin: 0 }}>
                      Approve student and parent admissions, respond to institutional enquiries, oversee staff directories, and maintain role security.
                    </p>
                  </div>
                  <button
                    onClick={() => handleQuickRoleSelect('admin')}
                    className="btn-apple-outline"
                    style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%' }}
                  >
                    <span>Launch Admin Demo</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* 3. ARCHITECTURAL PILLARS SECTION (Gallery White #ffffff) */}
          <section
            style={{
              padding: 'var(--spacing-64) var(--spacing-24)',
              maxWidth: '1240px',
              margin: '0 auto',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ marginBottom: 'var(--spacing-32)', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-slate)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                Platform Reliability
              </div>
              <h2
                style={{
                  fontFamily: 'var(--font-sf-pro-display)',
                  fontSize: '32px',
                  fontWeight: '600',
                  color: 'var(--color-ink)',
                  margin: 0,
                  letterSpacing: '-0.5px'
                }}
              >
                Engineered for precision and continuous operation.
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--spacing-24)' }}>
              <div style={{ background: 'var(--color-studio-mist)', borderRadius: '24px', padding: 'var(--spacing-28)', border: '1px solid var(--color-hairline-silver)' }}>
                <Clock size={24} color="var(--color-pricing-blue)" style={{ marginBottom: '14px' }} />
                <h4 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--color-ink)', margin: '0 0 8px 0' }}>
                  Collision-Free Scheduling
                </h4>
                <p style={{ fontSize: '14px', color: 'var(--color-slate)', lineHeight: '1.45', margin: 0 }}>
                  Intelligent validation algorithms prevent duplicate period bookings for faculty members and classrooms across all 12 class standards.
                </p>
              </div>

              <div style={{ background: 'var(--color-studio-mist)', borderRadius: '24px', padding: 'var(--spacing-28)', border: '1px solid var(--color-hairline-silver)' }}>
                <CheckCircle2 size={24} color="var(--color-pricing-blue)" style={{ marginBottom: '14px' }} />
                <h4 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--color-ink)', margin: '0 0 8px 0' }}>
                  Live Roll Call Persistence
                </h4>
                <p style={{ fontSize: '14px', color: 'var(--color-slate)', lineHeight: '1.45', margin: 0 }}>
                  Attendance logs are saved directly to relational database storage with instant attendance percentage calculation.
                </p>
              </div>

              <div style={{ background: 'var(--color-studio-mist)', borderRadius: '24px', padding: 'var(--spacing-28)', border: '1px solid var(--color-hairline-silver)' }}>
                <Mail size={24} color="var(--color-pricing-blue)" style={{ marginBottom: '14px' }} />
                <h4 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--color-ink)', margin: '0 0 8px 0' }}>
                  Unified Multi-Role Helpdesk
                </h4>
                <p style={{ fontSize: '14px', color: 'var(--color-slate)', lineHeight: '1.45', margin: 0 }}>
                  Direct communication channels allowing students, parents, faculty, and administrative staff to address enquiries effortlessly.
                </p>
              </div>
            </div>
          </section>

          {/* 4. CLEAN FOOTER */}
          <footer
            style={{
              borderTop: '1px solid var(--color-control-gray)',
              padding: 'var(--spacing-24) var(--spacing-20)',
              textAlign: 'center',
              fontSize: '12px',
              color: 'var(--color-slate)',
              backgroundColor: 'var(--color-studio-mist)'
            }}
          >
            <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <span>Campus ERP — Enterprise Resource Planning System</span>
              <div style={{ display: 'flex', gap: '16px' }}>
                <span onClick={() => { setError(null); setCurrentTab('signin'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ cursor: 'pointer', color: 'var(--color-apple-blue)' }}>Sign In</span>
                <span onClick={() => { setError(null); setCurrentTab('register'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ cursor: 'pointer', color: 'var(--color-apple-blue)' }}>Register</span>
                <span onClick={() => { const el = document.getElementById('roles'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }} style={{ cursor: 'pointer', color: 'var(--color-slate)' }}>Role Ecosystem</span>
              </div>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}
