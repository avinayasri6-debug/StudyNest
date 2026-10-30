import React from 'react';
import {
  IconDashboard,
  IconBook,
  IconSparkles,
  IconVideo,
  IconMenu
} from './Icons';

export default function BottomNav({
  activeView,
  onNavigate,
  onToggleSidebar
}) {
  const isMoreActive = !['dashboard', 'subjects', 'ai-assistant', 'videos'].includes(activeView);

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Bottom Navigation">
      <button
        type="button"
        className={`bottom-nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
        onClick={() => onNavigate('dashboard')}
        aria-label="Dashboard"
      >
        <IconDashboard size={19} className="bottom-nav-icon" />
        <span className="bottom-nav-label">Dashboard</span>
      </button>

      <button
        type="button"
        className={`bottom-nav-item ${activeView === 'subjects' ? 'active' : ''}`}
        onClick={() => onNavigate('subjects')}
        aria-label="Courses"
      >
        <IconBook size={19} className="bottom-nav-icon" />
        <span className="bottom-nav-label">Courses</span>
      </button>

      <button
        type="button"
        className={`bottom-nav-item ${activeView === 'ai-assistant' ? 'active' : ''}`}
        onClick={() => onNavigate('ai-assistant')}
        aria-label="AI Tutor"
      >
        <IconSparkles size={19} className="bottom-nav-icon" />
        <span className="bottom-nav-label">AI Tutor</span>
      </button>

      <button
        type="button"
        className={`bottom-nav-item ${activeView === 'videos' ? 'active' : ''}`}
        onClick={() => onNavigate('videos')}
        aria-label="Videos"
      >
        <IconVideo size={19} className="bottom-nav-icon" />
        <span className="bottom-nav-label">Videos</span>
      </button>

      <button
        type="button"
        className={`bottom-nav-item ${isMoreActive ? 'active' : ''}`}
        onClick={onToggleSidebar}
        aria-label="Open Full Navigation Menu"
      >
        <IconMenu size={19} className="bottom-nav-icon" />
        <span className="bottom-nav-label">More</span>
      </button>
    </nav>
  );
}

