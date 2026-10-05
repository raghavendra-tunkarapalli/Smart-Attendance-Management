import React from 'react';
import { Layers, UserPlus, LogOut } from 'lucide-react';

export default function Header({ currentTab, setCurrentTab, user, onLogout }) {
  return (
    <header className="product-local-nav">
      <div className="product-nav-title" onClick={() => setCurrentTab('signin')} style={{ cursor: 'pointer' }}>
        <Layers size={20} color="var(--color-ink)" />
        <span>Campus ERP — Enterprise Resource Planner</span>
      </div>

      <div className="product-nav-controls">
        <button 
          className="btn-outlined-explore" 
          onClick={() => alert('Admission & Enrollment portal is active for registered students and parents.')}
        >
          Admissions
        </button>

        {user ? (
          <button className="btn-pricing-blue" onClick={onLogout}>
            <LogOut size={13} />
            Sign Out
          </button>
        ) : (
          <>
            <button
              className={`btn-outlined-explore ${currentTab === 'signin' ? 'active' : ''}`}
              onClick={() => setCurrentTab('signin')}
            >
              Sign In
            </button>
            <button
              className="btn-pricing-blue"
              onClick={() => setCurrentTab('register')}
            >
              <UserPlus size={13} />
              Register
            </button>
          </>
        )}
      </div>
    </header>
  );
}
