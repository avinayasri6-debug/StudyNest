import React from 'react';
import { IconGraduation } from './Icons';

export default function SemesterHeader({ profile }) {
  const branch = profile?.branch || 'CSE – Artificial Intelligence and Machine Learning';
  const college = profile?.college;

  return (
    <div className="semester-banner">
      <div className="semester-title-group">
        <div className="semester-tag-large">
          <IconGraduation size={18} />
          <span>Semester 1</span>
        </div>
        <div className="semester-meta-info">
          <span className="semester-meta-title">{branch}</span>
          <span className="semester-meta-sub">
            {college ? `${college} · ` : ''}Active Undergraduate Session · First Year
          </span>
        </div>
      </div>

      <div className="semester-badges-group">
        <span className="info-pill">
          <strong>22</strong> Credits Enrolled
        </span>
        <span className="info-pill">
          <strong>7</strong> Confirmed Courses
        </span>
        <span className="info-pill" style={{ backgroundColor: 'var(--sage-100)', color: 'var(--forest-900)' }}>
          Semester 2: <strong>Coming Soon</strong>
        </span>
      </div>
    </div>
  );
}
