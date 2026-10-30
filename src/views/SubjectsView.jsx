import React, { useState } from 'react';
import { SEMESTER_1_SUBJECTS, SAMPLE_SYLLABUS_DISCLAIMER } from '../data/subjectsData';
import SubjectCard from '../components/SubjectCard';
import SemesterTwoPreview from '../components/SemesterTwoPreview';
import { IconBook, IconSparkles } from '../components/Icons';

export default function SubjectsView({
  onSelectSubject,
  completedTopics = {},
  searchTerm = '',
  onShowToast
}) {
  const [activeCategory, setActiveCategory] = useState('ALL');

  const categories = [
    { id: 'ALL', label: 'All Subjects (7)' },
    { id: 'CORE', label: 'Core Engineering' },
    { id: 'COMPUTING', label: 'Computing' },
    { id: 'SCIENCES', label: 'Basic Sciences' },
    { id: 'PRACTICAL', label: 'Workshops & Soft Skills' }
  ];

  const filtered = SEMESTER_1_SUBJECTS.filter((s) => {
    // category filter
    if (activeCategory === 'CORE' && !s.category.includes('Core') && !s.category.includes('Mathematics')) return false;
    if (activeCategory === 'COMPUTING' && !s.category.includes('Computing')) return false;
    if (activeCategory === 'SCIENCES' && !s.category.includes('Sciences')) return false;
    if (activeCategory === 'PRACTICAL' && !s.category.includes('Practical') && !s.category.includes('Communication') && !s.category.includes('Analytical')) return false;

    // search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        s.title.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div>
      <div className="section-header-row" style={{ marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--sage-600)', fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>
            <IconBook size={16} />
            <span>Curriculum Directory · Semester 1</span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--forest-950)', margin: 0 }}>
            My Enrolled Subjects
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            All 7 confirmed courses for First Year Engineering. Click any course to check off completed topics, 
            track assignments, and practice important questions.
          </p>
        </div>
      </div>

      {/* Syllabus Disclaimer Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 16px',
        backgroundColor: 'rgba(104, 143, 120, 0.12)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-sage)',
        marginBottom: '20px',
        fontSize: '13px',
        color: 'var(--forest-900)'
      }}>
        <IconSparkles size={16} style={{ flexShrink: 0 }} />
        <span><strong>Academic Syllabus Note: </strong>{SAMPLE_SYLLABUS_DISCLAIMER}</span>
      </div>

      {/* Category Filter Pills */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`modal-tab-btn ${activeCategory === c.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="subjects-grid">
        {filtered.map((subject) => (
          <SubjectCard
            key={subject.id}
            subject={subject}
            completedTopicIds={completedTopics[subject.id] || []}
            onClick={onSelectSubject}
          />
        ))}
      </div>

      {/* Semester 2 marked as Coming Soon */}
      <div style={{ marginTop: '36px' }}>
        <SemesterTwoPreview onShowToast={onShowToast} />
      </div>
    </div>
  );
}
