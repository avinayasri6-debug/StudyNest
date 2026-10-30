import React from 'react';
import { IconChevronRight, IconCheckCircle } from './Icons';
import { getAllSubjectTopics } from '../data/subjectsData';

export default function SubjectCard({ subject, completedTopicIds = [], onClick }) {
  const allTopics = getAllSubjectTopics(subject);
  const totalTopics = allTopics.length;
  const completedCount = allTopics.filter((t) => completedTopicIds.includes(t.id)).length;
  const progressPercent = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

  return (
    <article
      className="subject-card"
      onClick={() => onClick(subject)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(subject);
        }
      }}
      aria-label={`View details for ${subject.title}`}
    >
      <div>
        <div className="subject-card-top">
          <span className="subject-code-badge">{subject.code}</span>
          <span className="subject-credit-pill">{subject.credits} Credits</span>
        </div>

        <h3 className="subject-title">{subject.title}</h3>
        <p className="subject-dept">{subject.category}</p>

        <div className="subject-progress-section">
          <div className="progress-label-row">
            <span className="progress-text-left">
              {completedCount} of {totalTopics} topics completed
            </span>
            <span className="progress-text-right">{progressPercent}%</span>
          </div>
          <div className="progress-track" aria-hidden="true">
            <div
              className="progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="subject-milestone-footer">
        <div className="milestone-desc">
          {progressPercent === 100 ? (
            <span style={{ color: 'var(--forest-800)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <IconCheckCircle size={14} /> All topics completed
            </span>
          ) : (
            <span>{subject.units?.length || 0} Units · Sample Learning Plan</span>
          )}
        </div>
        <div className="view-course-hint">
          <span>Manage</span>
          <IconChevronRight size={14} />
        </div>
      </div>
    </article>
  );
}
