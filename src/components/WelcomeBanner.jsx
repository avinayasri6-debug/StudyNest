import React from 'react';
import { IconSparkles, IconChevronRight } from './Icons';

export default function WelcomeBanner({
  profile,
  activeSubjects = [],
  completedTopicsCount = 0,
  totalTopicsCount = 0,
  completedPythonCount = 0,
  studyHoursLogged = '0.0',
  onQuickAction,
  onOpenPlayground
}) {
  const studentName = profile?.name ? profile.name.trim() : 'Engineer';
  const universityName = profile?.college || profile?.university || 'Engineering University';
  const branchName = profile?.branch || 'Engineering';
  const semesterName = profile?.semester || 'Semester 1';

  const enrolledCount = Array.isArray(activeSubjects) ? activeSubjects.length : 0;
  const totalCredits = Array.isArray(activeSubjects)
    ? activeSubjects.reduce((acc, s) => acc + (Number(s.credits) || 0), 0)
    : 0;

  return (
    <section className="welcome-section" aria-label="Welcome and Academic Status">
      <div className="welcome-decoration-circle" aria-hidden="true" />

      <div className="welcome-kicker">
        <IconSparkles size={13} />
        <span>{universityName} · {branchName} · {semesterName}</span>
      </div>

      <h1 className="welcome-heading">
        Your journey to academic excellence starts here.
      </h1>

      <p className="welcome-subtext">
        {enrolledCount > 0 ? (
          <>
            Welcome back, <strong>{studentName}</strong>. Your {semesterName} learning space is active at {universityName}. Track your {enrolledCount} enrolled course{enrolledCount === 1 ? '' : 's'} ({totalCredits} total credits),
            master computational Python programming, manage assignments, and record your study sessions with precision.
          </>
        ) : (
          <>
            Welcome back, <strong>{studentName}</strong>. Your {semesterName} learning space is active at {universityName}. Add or import your course syllabus in My Courses to track your topics,
            master computational Python programming, manage assignments, and record your study sessions with precision.
          </>
        )}
      </p>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '22px' }}>
        <button
          type="button"
          className="add-task-btn"
          onClick={onQuickAction}
          style={{ backgroundColor: 'var(--forest-850)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <span>Continue Python Academy (15 Modules)</span>
          <IconChevronRight size={15} />
        </button>

        {onOpenPlayground && (
          <button
            type="button"
            className="sem2-action-btn"
            onClick={onOpenPlayground}
            style={{
              backgroundColor: 'rgba(104, 143, 120, 0.15)',
              color: 'var(--forest-900)',
              borderColor: 'var(--border-sage)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <IconSparkles size={15} />
            <span>Interactive Engineering Lab</span>
          </button>
        )}
      </div>

      <div className="welcome-stats-row">
        <div className="welcome-stat-item">
          <span className="welcome-stat-value">{enrolledCount}</span>
          <span className="welcome-stat-label">Enrolled Subjects</span>
        </div>
        <div className="welcome-stat-item">
          <span className="welcome-stat-value">{totalCredits}</span>
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
