import React from 'react';
import {
  StudyNestLogo,
  IconDashboard,
  IconBook,
  IconPython,
  IconVideo,
  IconCalendar,
  IconAward,
  IconSparkles,
  IconX
} from './Icons';

export default function Sidebar({
  activeView,
  onNavigate,
  isOpen,
  onClose,
  profile,
  onOpenProfile
}) {
  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: IconDashboard },
    { id: 'ai-assistant', label: 'AI Study Assistant', icon: IconSparkles },
    { id: 'subjects', label: 'My Courses', icon: IconBook },
    { id: 'python', label: 'Python Academy', icon: IconPython },
    { id: 'videos', label: 'Video Learning Hub', icon: IconVideo },
    { id: 'exam-prep', label: 'Exam Centre', icon: IconAward },
    { id: 'planner', label: 'Study Planner', icon: IconCalendar }
  ];

  const handleItemClick = (id) => {
    onNavigate(id);
    if (onClose) onClose();
  };

  const studentName = profile?.name || 'Student Profile';
  const initials = studentName
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'SN';

  return (
    <>
      {/* Mobile overlay backdrop */}
      <div
        className={`sidebar-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-header">
          <div className="brand-link" style={{ cursor: 'pointer' }} onClick={() => handleItemClick('dashboard')}>
            <StudyNestLogo size={32} />
            <div>
              <div className="brand-title">Sagevanta</div>
              <div className="brand-tagline">Engineering Workspace</div>
            </div>
          </div>
          <button
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <IconX size={20} />
          </button>
        </div>

        {/* Navigation List */}
        <div className="sidebar-nav-container">
          <span className="sidebar-nav-label">Academic Portal</span>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                type="button"
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleItemClick(item.id)}
              >
                <Icon size={19} className="nav-icon" />
                <span className="sidebar-nav-label-text">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Student Profile Footer (Clickable to edit profile) */}
        <div className="sidebar-footer">
          <div
            className="student-card"
            onClick={onOpenProfile}
            style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}
            title="Click to edit Student Profile & Study Goals"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpenProfile();
              }
            }}
          >
            {profile?.profilePic ? (
              <img
                src={profile.profilePic}
                alt="Student avatar"
                className="student-avatar"
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <div className="student-avatar">{initials}</div>
            )}
            <div className="student-info">
              <div className="student-name">{studentName}</div>
              <div className="student-sem">
                {profile?.semester || 'Semester 1'} · {profile?.year || 'First Year'}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
