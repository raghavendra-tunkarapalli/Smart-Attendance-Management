import React, { useState } from 'react';
import {
  User,
  LogOut,
  Shield,
  Mail,
  IdCard,
  FileText,
  HelpCircle,
  ShieldCheck,
  Layers,
  ChevronRight,
  CheckCircle,
  KeyRound,
  BookOpen,
  CreditCard,
  LayoutDashboard,
  Server,
  Activity
} from 'lucide-react';
import { decodeJwt } from '../utils/jwt';
import AdmissionModule from './AdmissionModule';
import EnquiryModule from './EnquiryModule';
import ParentAdmissionModule from './ParentAdmissionModule';
import ParentEnquiryModule from './ParentEnquiryModule';
import AdminAdmissionModule from './AdminAdmissionModule';
import AdminEnquiryModule from './AdminEnquiryModule';
import StudentPortalModule from './StudentPortalModule';
import TeacherPortalModule from './TeacherPortalModule';
import StaffPortalModule from './StaffPortalModule';

export default function Dashboard({ user, token, onLogout }) {
  const decodedClaims = decodeJwt(token);
  const currentRole = (user?.role || decodedClaims?.role || 'STUDENT').toUpperCase();
  const [activeTab, setActiveTab] = useState('session'); // 'admission' | 'enquiry' | 'session'
  const [selectedModule, setSelectedModule] = useState('profile');

  const isStudent = currentRole === 'STUDENT';
  const isParent = currentRole === 'PARENT';
  const isAdmin = currentRole === 'ADMIN';
  const isTeacher = currentRole === 'TEACHER';
  const isStaff = currentRole === 'STAFF';

  if (isStudent) {
    return <StudentPortalModule user={user} token={token} onLogout={onLogout} />;
  }

  if (isTeacher) {
    return <TeacherPortalModule user={user} token={token} onLogout={onLogout} />;
  }

  if (isStaff) {
    return <StaffPortalModule user={user} token={token} onLogout={onLogout} />;
  }

  // Admin Modules (when inside Admin Modules tab)
  const adminModules = [
    {
      id: 'profile',
      title: 'Admin Profile',
      tag: 'Security & Access',
      subtitle: 'Administrator Credentials & Privileges',
      desc: 'Super-user role permissions, authentication tokens, system credentials, and audit details.',
      icon: <User size={18} />,
      theme: { bg: '#faf5ff', color: '#9333ea', border: '#f3e8ff' }
    },
    {
      id: 'audit',
      title: 'System Services',
      tag: 'Microservices & Health',
      subtitle: 'Campus Microservices Status',
      desc: 'Eureka Service Discovery, Gateway routing, and microservice cluster health.',
      icon: <Server size={18} />,
      theme: { bg: '#eff6ff', color: '#2563eb', border: '#dbeafe' }
    },
    {
      id: 'settings',
      title: 'ERP Policies',
      tag: 'Governance & Rules',
      subtitle: 'Institutional Policies & Rules',
      desc: 'Campus timetable policies, 7-period schedule limits, and attendance rules.',
      icon: <Shield size={18} />,
      theme: { bg: '#ecfdf5', color: '#059669', border: '#d1fae5' }
    }
  ];

  // Parent Modules (when inside Parent Modules tab)
  const parentModules = [
    {
      id: 'profile',
      title: 'Parent Profile',
      tag: 'Guardian Info',
      subtitle: 'Parent & Guardian Account Details',
      desc: 'Verified guardian contact numbers, emergency communications, and family credentials.',
      icon: <User size={18} />,
      theme: { bg: '#fffbeb', color: '#d97706', border: '#fef3c7' }
    },
    {
      id: 'academics',
      title: 'Child Academics',
      tag: 'Schedule & Progress',
      subtitle: 'Enrolled Student Academic Overview',
      desc: 'Daily timetable, instructor schedule, and institutional learning curriculum.',
      icon: <BookOpen size={18} />,
      theme: { bg: '#eff6ff', color: '#2563eb', border: '#dbeafe' }
    },
    {
      id: 'fees',
      title: 'Tuition & Fees',
      tag: 'Payment Records',
      subtitle: 'Institutional Fee Statements',
      desc: 'Term payment confirmations, tuition statements, and financial receipts.',
      icon: <CreditCard size={18} />,
      theme: { bg: '#ecfdf5', color: '#059669', border: '#d1fae5' }
    }
  ];

  // Generic fallback modules
  const genericModules = [
    {
      id: 'profile',
      title: 'Profile',
      tag: 'Account Overview',
      subtitle: 'User Account Details',
      desc: 'User identity, role attributes, registered email, and session authentication claims.',
      icon: <User size={18} />,
      theme: { bg: '#eff6ff', color: '#2563eb', border: '#dbeafe' }
    }
  ];

  const modulesList = isAdmin ? adminModules : isParent ? parentModules : genericModules;
  const portalRoleTitle = isAdmin ? 'Admin' : isParent ? 'Parent' : currentRole;

  const firstName = user?.firstName || (isAdmin ? 'Admin' : isParent ? 'Parent' : 'User');
  const lastName = user?.lastName || 'User';
  const email = user?.email || decodedClaims?.email || 'user@school.com';
  const initialLetter = firstName ? firstName[0].toUpperCase() : 'U';

  const currentModule = modulesList.find(m => m.id === selectedModule) || modulesList[0];

  return (
    <div style={{ width: '100%', margin: '0', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-20)' }}>
      {/* Top Banner Header (Apple Gallery White Flat Surface) */}
      <div
        style={{
          background: 'var(--color-gallery-white)',
          padding: 'var(--spacing-24) var(--spacing-28)',
          borderRadius: 'var(--radius-cards)',
          border: '1px solid var(--color-hairline-silver)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--spacing-16)'
        }}
      >
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
              <span
                className="role-pill"
                style={{
                  background: 'var(--color-studio-mist)',
                  color: 'var(--color-ink)',
                  border: '1px solid var(--color-hairline-silver)',
                  fontSize: '11px',
                  fontWeight: '600',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-buttons)'
                }}
              >
                {portalRoleTitle.toUpperCase()} PORTAL
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-slate)', marginTop: '4px', margin: 0, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Mail size={12} color="var(--color-steel)" />
              {email}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ background: 'var(--color-studio-mist)', padding: '8px 16px', borderRadius: '12px', border: '1px solid var(--color-control-gray)' }}>
            <div style={{ fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.04em' }}>
              {isAdmin ? 'ADMIN ID' : isParent ? 'PARENT ID' : 'USER ID'}
            </div>
            <div style={{ color: 'var(--color-ink)', fontWeight: '600', fontSize: '14px', marginTop: '2px' }}>
              {user?.userId || decodedClaims?.user_id || '1'}
            </div>
          </div>

          <div style={{ background: 'var(--color-studio-mist)', padding: '8px 16px', borderRadius: '12px', border: '1px solid var(--color-control-gray)' }}>
            <div style={{ fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.04em' }}>CLEARANCE</div>
            <div style={{ color: isAdmin ? '#9333ea' : '#16a34a', fontWeight: '600', fontSize: '14px', marginTop: '2px' }}>
              {isAdmin ? 'Super Admin' : isParent ? 'Verified Guardian' : currentRole}
            </div>
          </div>

          {onLogout && (
            <button
              className="btn-apple-outline"
              onClick={onLogout}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '12px' }}
            >
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
          {isAdmin ? <ShieldCheck size={15} /> : <FileText size={15} />}
          <span>{isAdmin ? 'Admin Admissions' : 'Parent Admission'}</span>
        </button>

        <button
          className={`portal-tab-btn ${activeTab === 'enquiry' ? 'active-enquiry active' : ''}`}
          onClick={() => setActiveTab('enquiry')}
        >
          <HelpCircle size={15} />
          <span>{isAdmin ? 'Admin Enquiries' : 'Parent Enquiry'}</span>
        </button>

        <button
          className={`portal-tab-btn ${activeTab === 'session' ? 'active-session active' : ''}`}
          onClick={() => setActiveTab('session')}
        >
          <LayoutDashboard size={15} />
          <span>{portalRoleTitle} Modules</span>
        </button>
      </div>

      {/* SEPARATE ADMISSION TAB */}
      {activeTab === 'admission' && (
        <div className="apple-card" style={{ width: '100%' }}>
          {isAdmin ? <AdminAdmissionModule /> : <ParentAdmissionModule user={user} />}
        </div>
      )}

      {/* SEPARATE ENQUIRY TAB */}
      {activeTab === 'enquiry' && (
        <div className="apple-card" style={{ width: '100%' }}>
          {isAdmin ? <AdminEnquiryModule /> : <ParentEnquiryModule user={user} />}
        </div>
      )}

      {/* PORTAL MODULES SECTION (Staff Portal Module Layout) */}
      {activeTab === 'session' && (
        <div className="staff-portal-layout">
          {/* Left Module Sidebar Navigation */}
          <div className="staff-sidebar-nav">
            <div className="staff-sidebar-header">
              <div className="staff-sidebar-title">
                <Layers size={15} color="var(--color-pricing-blue)" />
                <span>{portalRoleTitle} Modules</span>
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
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: 'var(--color-success)',
                      display: 'inline-block',
                      boxShadow: '0 0 0 2px rgba(22, 163, 74, 0.2)'
                    }}
                  />
                  <span style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--color-ink)' }}>
                    {portalRoleTitle} Session
                  </span>
                </div>
                <span style={{ fontSize: '10.5px', color: 'var(--color-slate)', fontWeight: '500' }}>ERP v2.4</span>
              </div>
            </div>
          </div>

          {/* Right Content Workspace */}
          <div style={{ minWidth: 0, width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-16)' }}>
            <div className="apple-card" style={{ width: '100%' }}>
              {/* Module Card Top Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  paddingBottom: '16px',
                  borderBottom: '1px solid var(--color-control-gray)',
                  marginBottom: '20px'
                }}
              >
                <div
                  className="card-header-icon"
                  style={{
                    margin: 0,
                    background: currentModule.theme.bg,
                    borderColor: currentModule.theme.border,
                    color: currentModule.theme.color
                  }}
                >
                  {currentModule.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '19px', fontWeight: 600, color: 'var(--color-ink)' }}>
                    {currentModule.title} – {currentModule.subtitle}
                  </h3>
                  <p style={{ color: 'var(--color-slate)', fontSize: '14px', marginTop: '2px' }}>
                    {currentModule.desc}
                  </p>
                </div>
              </div>

              {/* Module Content */}
              {selectedModule === 'profile' && (
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--color-ink)' }}>
                    {portalRoleTitle} Authentication & Account Records
                  </h4>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                      gap: 'var(--spacing-16)'
                    }}
                  >
                    <div style={{ background: 'var(--color-studio-mist)', padding: '16px 20px', borderRadius: '14px', border: '1px solid var(--color-hairline-silver)' }}>
                      <div style={{ fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <IdCard size={12} /> User Identifier
                      </div>
                      <div style={{ color: 'var(--color-ink)', fontWeight: '600', fontSize: '15px', marginTop: '6px' }}>
                        {user?.userId || decodedClaims?.user_id || '1'}
                      </div>
                    </div>

                    <div style={{ background: 'var(--color-studio-mist)', padding: '16px 20px', borderRadius: '14px', border: '1px solid var(--color-hairline-silver)' }}>
                      <div style={{ fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Shield size={12} /> Assigned Security Role
                      </div>
                      <div style={{ color: 'var(--color-pricing-blue)', fontWeight: '600', fontSize: '15px', marginTop: '6px' }}>
                        {currentRole}
                      </div>
                    </div>

                    <div style={{ background: 'var(--color-studio-mist)', padding: '16px 20px', borderRadius: '14px', border: '1px solid var(--color-hairline-silver)' }}>
                      <div style={{ fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={12} /> Username
                      </div>
                      <div style={{ color: 'var(--color-ink)', fontWeight: '600', fontSize: '15px', marginTop: '6px' }}>
                        {user?.username || decodedClaims?.username || '—'}
                      </div>
                    </div>

                    <div style={{ background: 'var(--color-studio-mist)', padding: '16px 20px', borderRadius: '14px', border: '1px solid var(--color-hairline-silver)' }}>
                      <div style={{ fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={12} /> Registered Email
                      </div>
                      <div style={{ color: 'var(--color-ink)', fontWeight: '600', fontSize: '15px', marginTop: '6px' }}>
                        {email}
                      </div>
                    </div>

                    <div style={{ background: 'var(--color-studio-mist)', padding: '16px 20px', borderRadius: '14px', border: '1px solid var(--color-hairline-silver)' }}>
                      <div style={{ fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.04em' }}>
                        First Name
                      </div>
                      <div style={{ color: 'var(--color-ink)', fontWeight: '600', fontSize: '15px', marginTop: '6px' }}>
                        {firstName}
                      </div>
                    </div>

                    <div style={{ background: 'var(--color-studio-mist)', padding: '16px 20px', borderRadius: '14px', border: '1px solid var(--color-hairline-silver)' }}>
                      <div style={{ fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.04em' }}>
                        Last Name
                      </div>
                      <div style={{ color: 'var(--color-ink)', fontWeight: '600', fontSize: '15px', marginTop: '6px' }}>
                        {lastName}
                      </div>
                    </div>

                    <div style={{ background: 'var(--color-studio-mist)', padding: '16px 20px', borderRadius: '14px', border: '1px solid var(--color-hairline-silver)' }}>
                      <div style={{ fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <KeyRound size={12} /> Session Clearance
                      </div>
                      <div style={{ color: '#16a34a', fontWeight: '600', fontSize: '15px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle size={14} /> Active & Verified
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ADMIN: System Services Module */}
              {isAdmin && selectedModule === 'audit' && (
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--color-ink)' }}>
                    Active Campus Microservices
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                    {[
                      { name: 'API Gateway', port: '8099', status: 'ONLINE', desc: 'Reverse Proxy & Security Filter' },
                      { name: 'Service Registry (Eureka)', port: '8761', status: 'ONLINE', desc: 'Central Service Discovery' },
                      { name: 'Auth Service', port: '8081', status: 'ONLINE', desc: 'JWT Authentication & Role Claims' },
                      { name: 'Staff Portal Service', port: '8092', status: 'ONLINE', desc: 'Master Scheduling & Workload' },
                      { name: 'Teacher Portal Service', port: '8091', status: 'ONLINE', desc: 'Faculty Directory & Subjects' },
                      { name: 'Teacher Attendance Service', port: '8094', status: 'ONLINE', desc: 'Period Roll Call & Roster' },
                      { name: 'Student Schedule Service', port: '8095', status: 'ONLINE', desc: 'Student Timetables & Classes' }
                    ].map((svc) => (
                      <div key={svc.name} style={{ background: 'var(--color-studio-mist)', border: '1px solid var(--color-hairline-silver)', borderRadius: '14px', padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontWeight: '600', fontSize: '14px', color: 'var(--color-ink)' }}>{svc.name}</span>
                          <span style={{ fontSize: '11px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '10px', fontWeight: '700' }}>
                            {svc.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--color-slate)', marginBottom: '4px' }}>{svc.desc}</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-pricing-blue)', fontWeight: '600' }}>Port: :{svc.port}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ADMIN: Settings Module */}
              {isAdmin && selectedModule === 'settings' && (
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--color-ink)' }}>
                    Campus Academic & Attendance Governance
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ background: 'var(--color-studio-mist)', padding: '16px 20px', borderRadius: '14px', border: '1px solid var(--color-hairline-silver)' }}>
                      <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--color-ink)' }}>Period Limits Policy</div>
                      <p style={{ fontSize: '13px', color: 'var(--color-slate)', margin: '4px 0 0 0' }}>
                        Each faculty member is strictly capped at a maximum of 7 teaching periods per school day. Periods 1-7 run from 09:00 AM to 05:00 PM with 12:00-01:00 PM reserved for cafeteria recess.
                      </p>
                    </div>
                    <div style={{ background: 'var(--color-studio-mist)', padding: '16px 20px', borderRadius: '14px', border: '1px solid var(--color-hairline-silver)' }}>
                      <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--color-ink)' }}>Attendance Assignment Lock</div>
                      <p style={{ fontSize: '13px', color: 'var(--color-slate)', margin: '4px 0 0 0' }}>
                        Roll call rosters only display students for the specific class, section, date, and time slot where a teacher has been formally scheduled by administrative staff.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* PARENT: Child Academics Module */}
              {isParent && selectedModule === 'academics' && (
                <div style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--color-studio-mist)', borderRadius: '16px' }}>
                  <BookOpen size={36} color="var(--color-pricing-blue)" style={{ margin: '0 auto 12px' }} />
                  <h4 style={{ fontSize: '17px', fontWeight: '600', color: 'var(--color-ink)' }}>
                    Enrolled Student Academic Timetable
                  </h4>
                  <p style={{ color: 'var(--color-slate)', fontSize: '14px', maxWidth: '480px', margin: '6px auto 0' }}>
                    Timetable synchronized with staff scheduling system. View subject faculty allocations and room assignments.
                  </p>
                </div>
              )}

              {/* PARENT: Tuition & Fees Module */}
              {isParent && selectedModule === 'fees' && (
                <div style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--color-studio-mist)', borderRadius: '16px' }}>
                  <CreditCard size={36} color="#d97706" style={{ margin: '0 auto 12px' }} />
                  <h4 style={{ fontSize: '17px', fontWeight: '600', color: 'var(--color-ink)' }}>
                    Institutional Fee Statements & Invoices
                  </h4>
                  <p style={{ color: 'var(--color-slate)', fontSize: '14px', maxWidth: '480px', margin: '6px auto 0' }}>
                    All term tuition fees and laboratory dues are synchronized with institutional accounting records.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
