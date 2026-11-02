import React from 'react';
import { IconChevronRight, IconCheckCircle, IconSparkles } from './Icons';
import { getAllSubjectTopics } from '../data/curriculumData';

export default function SubjectCard({ subject, completedTopicIds = [], onClick }) {
  const allTopics = getAllSubjectTopics(subject);
  const totalTopics = allTopics.length;
  const completedCount = allTopics.filter((t) => completedTopicIds.includes(t.id)).length;
  const progressPercent = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;
  const isVerified = subject.verified !== false && subject.source !== 'custom';

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
        <div className="subject-card-top" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="subject-code-badge">{subject.code}</span>
            <span className="subject-credit-pill">{subject.credits} Credits</span>
          </div>

          {isVerified ? (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--forest-800)',
                backgroundColor: 'rgba(104, 143, 120, 0.15)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Verified Standard Academic Syllabus"
            >
              <IconCheckCircle size={11} /> Verified
            </span>
          ) : (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#8A6D3B',
                backgroundColor: 'rgba(230, 215, 175, 0.25)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Student-Created Custom Curriculum"
            >
              <IconSparkles size={11} /> Custom
            </span>
          )}
        </div>

        <h3 className="subject-title">{subject.title}</h3>
        <p className="subject-dept">{subject.category || subject.department}</p>

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
            <span>{subject.units?.length || 0} Units · {isVerified ? 'Curated Plan' : 'Student Custom Plan'}</span>
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
