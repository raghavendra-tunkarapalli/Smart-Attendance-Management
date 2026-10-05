import React, { useState } from 'react';
import { User, LogOut, Shield, Mail, IdCard, Sparkles, FileText, HelpCircle, LayoutDashboard, ShieldCheck, BookOpen } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('admission');

  const isStudent = currentRole === 'STUDENT';
  const isParent = currentRole === 'PARENT';
  const isAdmin = currentRole === 'ADMIN';
  const isTeacher = currentRole === 'TEACHER';
  const isStaff = currentRole === 'STAFF';

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'ADMIN': return 'role-pill admin';
      case 'TEACHER': return 'role-pill teacher';
      case 'STAFF': return 'role-pill staff';
      case 'PARENT': return 'role-pill parent';
      case 'STUDENT': return 'role-pill student';
      default: return 'role-pill student';
    }
  };

  if (isStudent) {
    return <StudentPortalModule user={user} token={token} onLogout={onLogout} />;
  }

  if (isTeacher) {
    return <TeacherPortalModule user={user} token={token} onLogout={onLogout} />;
  }

  if (isStaff) {
    return <StaffPortalModule user={user} token={token} onLogout={onLogout} />;
  }

  return (
    <div className="dashboard-card" style={{ maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
      {/* Welcome & User Header */}
      <div className="dashboard-header">
        <div className="user-welcome-info">
          <div className="avatar-badge">
            {user?.firstName ? user.firstName[0].toUpperCase() : 'A'}
          </div>
          <div>
            <h2 className="welcome-title">
              {isAdmin ? 'Admin Portal' : isParent ? 'Parent Portal' : `${currentRole} Portal`}: {user?.firstName} {user?.lastName}
            </h2>
            <p className="user-email-text">{user?.email}</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span className={getRoleBadgeClass(currentRole)}>
            <Shield size={12} />
            {currentRole}
          </span>
          <button className="btn-outlined-explore" onClick={onLogout}>
            <LogOut size={13} />
            Sign Out
          </button>
        </div>
      </div>

      {/* ADMIN PORTAL */}
      {isAdmin && (
        <>
          <div className="portal-tabs-nav">
            <button
              className={`portal-tab-btn ${activeTab === 'admission' ? 'active-admission' : ''}`}
              onClick={() => setActiveTab('admission')}
            >
              <ShieldCheck size={16} />
              <span>Admin Admissions Module</span>
            </button>

            <button
              className={`portal-tab-btn ${activeTab === 'enquiry' ? 'active-enquiry' : ''}`}
              onClick={() => setActiveTab('enquiry')}
            >
              <HelpCircle size={16} />
              <span>Admin Enquiries Module</span>
            </button>

            <button
              className={`portal-tab-btn ${activeTab === 'session' || activeTab === 'profile' ? 'active-session' : ''}`}
              onClick={() => setActiveTab('session')}
            >
              <LayoutDashboard size={16} />
              <span>Admin Profile Info</span>
            </button>
          </div>

          {activeTab === 'admission' && <AdminAdmissionModule />}
          {activeTab === 'enquiry' && <AdminEnquiryModule />}
          {(activeTab === 'session' || activeTab === 'profile') && (
            <div style={{ marginTop: 'var(--spacing-24)' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 600, marginBottom: '16px', color: 'var(--color-ink)' }}>
                Administrator Profile Details
              </h3>

              <div className="claims-grid">
                <div className="claim-card">
                  <div className="claim-label"><IdCard size={12} /> User ID</div>
                  <div className="claim-value">{user?.userId || decodedClaims?.user_id || '1'}</div>
                </div>
                <div className="claim-card">
                  <div className="claim-label"><Shield size={12} /> Assigned Role</div>
                  <div className="claim-value" style={{ color: 'var(--color-apple-blue)' }}>{currentRole}</div>
                </div>
                <div className="claim-card">
                  <div className="claim-label"><User size={12} /> Username</div>
                  <div className="claim-value">{user?.username || decodedClaims?.username}</div>
                </div>
                <div className="claim-card">
                  <div className="claim-label"><Mail size={12} /> Registered Email</div>
                  <div className="claim-value" style={{ fontSize: '14px' }}>{user?.email || decodedClaims?.email}</div>
                </div>
                <div className="claim-card">
                  <div className="claim-label">First Name</div>
                  <div className="claim-value">{user?.firstName}</div>
                </div>
                <div className="claim-card">
                  <div className="claim-label">Last Name</div>
                  <div className="claim-value">{user?.lastName}</div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* PARENT PORTAL */}
      {isParent && (
        <>
          <div className="portal-tabs-nav">
            <button
              className={`portal-tab-btn ${activeTab === 'admission' ? 'active-admission' : ''}`}
              onClick={() => setActiveTab('admission')}
            >
              <FileText size={16} />
              <span>Parent Admission Module</span>
            </button>

            <button
              className={`portal-tab-btn ${activeTab === 'enquiry' ? 'active-enquiry' : ''}`}
              onClick={() => setActiveTab('enquiry')}
            >
              <HelpCircle size={16} />
              <span>Parent Enquiry Module</span>
            </button>

            <button
              className={`portal-tab-btn ${activeTab === 'session' || activeTab === 'profile' ? 'active-session' : ''}`}
              onClick={() => setActiveTab('session')}
            >
              <LayoutDashboard size={16} />
              <span>Parent Profile Info</span>
            </button>
          </div>

          {activeTab === 'admission' && <ParentAdmissionModule user={user} />}
          {activeTab === 'enquiry' && <ParentEnquiryModule user={user} />}
          {(activeTab === 'session' || activeTab === 'profile') && (
            <div style={{ marginTop: 'var(--spacing-24)' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 600, marginBottom: '16px', color: 'var(--color-ink)' }}>
                Parent Profile Details
              </h3>

              <div className="claims-grid">
                <div className="claim-card">
                  <div className="claim-label"><IdCard size={12} /> User ID</div>
                  <div className="claim-value">{user?.userId || decodedClaims?.user_id || '1'}</div>
                </div>
                <div className="claim-card">
                  <div className="claim-label"><Shield size={12} /> Assigned Role</div>
                  <div className="claim-value" style={{ color: 'var(--color-apple-blue)' }}>{currentRole}</div>
                </div>
                <div className="claim-card">
                  <div className="claim-label"><User size={12} /> Username</div>
                  <div className="claim-value">{user?.username || decodedClaims?.username}</div>
                </div>
                <div className="claim-card">
                  <div className="claim-label"><Mail size={12} /> Registered Email</div>
                  <div className="claim-value" style={{ fontSize: '14px' }}>{user?.email || decodedClaims?.email}</div>
                </div>
                <div className="claim-card">
                  <div className="claim-label">First Name</div>
                  <div className="claim-value">{user?.firstName}</div>
                </div>
                <div className="claim-card">
                  <div className="claim-label">Last Name</div>
                  <div className="claim-value">{user?.lastName}</div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
