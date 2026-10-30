import React from 'react';
import { IconSparkles, IconChevronRight } from './Icons';

export default function WelcomeBanner({
  profile,
  completedTopicsCount = 0,
  totalTopicsCount = 0,
  completedPythonCount = 0,
  studyHoursLogged = '0.0',
  onQuickAction
}) {
  const studentName = profile?.name || 'Engineer';
  const branchName = profile?.branch || 'CSE – Artificial Intelligence and Machine Learning';

  return (
    <section className="welcome-section">
      <div className="welcome-decoration-circle" aria-hidden="true" />
      
      <div className="welcome-kicker">
        <IconSparkles size={13} />
        <span>{branchName} · {profile?.year || 'First Year'}</span>
      </div>

      <h1 className="welcome-heading">
        Your journey to academic excellence starts here.
      </h1>

      <p className="welcome-subtext">
        Welcome back, <strong>{studentName}</strong>. Your Semester 1 learning space is active. Track your 7 course modules,
        master computational Python programming, manage assignments, and record your study sessions with precision.
      </p>

      <div style={{ marginBottom: '22px' }}>
        <button
          type="button"
          className="add-task-btn"
          onClick={onQuickAction}
          style={{ backgroundColor: 'var(--forest-850)', display: 'inline-flex' }}
        >
          <span>Continue Python Academy (15 Modules)</span>
          <IconChevronRight size={15} />
        </button>
      </div>

      <div className="welcome-stats-row">
        <div className="welcome-stat-item">
          <span className="welcome-stat-value">7</span>
          <span className="welcome-stat-label">Enrolled Subjects</span>
        </div>
        <div className="welcome-stat-item">
          <span className="welcome-stat-value">22</span>
          <span className="welcome-stat-label">Total Credits</span>
        </div>
        <div className="welcome-stat-item">
          <span className="welcome-stat-value">{completedTopicsCount}/{totalTopicsCount}</span>
          <span className="welcome-stat-label">Topics Completed</span>
        </div>
        <div className="welcome-stat-item">
          <span className="welcome-stat-value">{completedPythonCount}/15</span>
          <span className="welcome-stat-label">Python Modules</span>
        </div>
        <div className="welcome-stat-item">
          <span className="welcome-stat-value">{studyHoursLogged} hrs</span>
          <span className="welcome-stat-label">Study Time Logged</span>
        </div>
      </div>
    </section>
  );
}
