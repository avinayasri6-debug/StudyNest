import React, { useState } from 'react';
import { IconLock, IconBell, IconCheckCircle } from './Icons';

export default function SemesterTwoPreview({ onShowToast }) {
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleNotifyMe = () => {
    setIsSubscribed(true);
    onShowToast?.('Notification enabled! You will be alerted when the official Semester 2 syllabus and registrations are published.');
  };

  return (
    <section className="semester-two-preview-card" aria-labelledby="sem2-heading">
      <div className="sem2-icon-badge" aria-hidden="true">
        <IconLock size={22} />
      </div>

      <div className="sem2-content">
        <span className="sem2-status-pill">
          Upcoming Academic Term · Spring Session
        </span>

        <h2 id="sem2-heading" className="sem2-heading">
          Semester 2 Curriculum & Course Registrations
        </h2>

        <p className="sem2-text">
          Course enrollments, syllabi, and laboratory schedules for Semester 2 will be 
          unlocked automatically upon conclusion of Semester 1 final assessments. Official 
          curriculum details will be synchronized once registrations are published.
        </p>

        <div className="sem2-features-list">
          <span className="sem2-feature-item">🔒 Official Course Allocations</span>
          <span className="sem2-feature-item">🔒 Engineering Laboratory Schedules</span>
          <span className="sem2-feature-item">🔒 Interactive Timetable Planner</span>
          <span className="sem2-feature-item">🔒 Textbook & Resource Bank</span>
        </div>

        <button
          type="button"
          className="sem2-action-btn"
          onClick={handleNotifyMe}
        >
          {isSubscribed ? (
            <>
              <IconCheckCircle size={16} style={{ color: 'var(--forest-700)' }} />
              <span>Notification Alert Active</span>
            </>
          ) : (
            <>
              <IconBell size={16} />
              <span>Notify me when Semester 2 is published</span>
            </>
          )}
        </button>
      </div>
    </section>
  );
}

