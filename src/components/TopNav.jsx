import React, { useState, useRef, useEffect } from 'react';
import {
  IconMenu,
  IconSearch,
  IconX,
  IconBook,
  IconPython,
  IconVideo,
  IconCalendar,
  IconCheckCircle,
  IconAward,
  IconSparkles
} from './Icons';
import { SEMESTER_1_SUBJECTS, getAllSubjectTopics } from '../data/subjectsData';
import { PYTHON_MODULES } from '../data/pythonCurriculum';
import { PRACTICE_EXERCISES } from '../data/practiceExercises';
import { VIDEO_LESSONS } from '../data/videosData';

export default function TopNav({
  profile,
  onOpenProfile,
  onToggleSidebar,
  searchTerm,
  onSearchChange,
  assignments = [],
  onNavigateToResult
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchWrapRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchWrapRef.current && !searchWrapRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const query = searchTerm.trim().toLowerCase();

  // Search results compilation matching primary sections
  const searchResults = {
    subjects: [],
    topics: [],
    pythonLessons: [],
    videos: [],
    exams: [],
    assignments: []
  };

  if (query.length >= 2) {
    // 1. Courses (Subjects)
    SEMESTER_1_SUBJECTS.forEach((s) => {
      if (s.title.toLowerCase().includes(query) || s.code.toLowerCase().includes(query) || s.shortName.toLowerCase().includes(query)) {
        searchResults.subjects.push(s);
      }
      // 2. Syllabus Topics
      const subTopics = getAllSubjectTopics(s);
      subTopics.forEach((t) => {
        if (t.name.toLowerCase().includes(query)) {
          searchResults.topics.push({ ...t, subject: s });
        }
      });
      // 3. Exam Prep / Mock Papers
      if (
        s.title.toLowerCase().includes(query) ||
        s.code.toLowerCase().includes(query) ||
        'exam mock test question bank paper'.includes(query)
      ) {
        searchResults.exams.push({
          id: `exam-${s.id}`,
          title: `${s.shortName} Mock Exam & Practice Paper`,
          subject: s
        });
      }
    });

    // 4. Python Lessons & Practice Lab Exercises
    PYTHON_MODULES.forEach((m) => {
      if (
        m.title.toLowerCase().includes(query) ||
        m.explanation.toLowerCase().includes(query) ||
        `module ${m.number}`.includes(query)
      ) {
        searchResults.pythonLessons.push(m);
      }
    });

    PRACTICE_EXERCISES.forEach((ex) => {
      if (
        ex.title.toLowerCase().includes(query) ||
        ex.statement.toLowerCase().includes(query) ||
        ex.category.toLowerCase().includes(query)
      ) {
        searchResults.pythonLessons.push({
          id: ex.id,
          title: `Practice Lab: ${ex.title}`,
          isPractice: true,
          exercise: ex
        });
      }
    });

    // 5. Video Lectures
    VIDEO_LESSONS.forEach((v) => {
      if (
        v.title.toLowerCase().includes(query) ||
        v.channel.toLowerCase().includes(query) ||
        (v.instructor && v.instructor.toLowerCase().includes(query)) ||
        v.subjectTitle.toLowerCase().includes(query) ||
        (v.topicsCovered && v.topicsCovered.some((t) => t.toLowerCase().includes(query)))
      ) {
        searchResults.videos.push(v);
      }
    });

    // 6. Assignments & Tasks
    assignments.forEach((a) => {
      if (a.title.toLowerCase().includes(query) || (a.subjectTag && a.subjectTag.toLowerCase().includes(query))) {
        searchResults.assignments.push(a);
      }
    });
  }

  const totalResultsCount =
    searchResults.subjects.length +
    searchResults.topics.length +
    searchResults.pythonLessons.length +
    searchResults.videos.length +
    searchResults.exams.length +
    searchResults.assignments.length;

  const handleResultClick = (target) => {
    onNavigateToResult(target);
    setIsSearchOpen(false);
    onSearchChange('');
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
    <header className="top-navbar">
      <div className="nav-left-section">
        <button
          className="mobile-menu-trigger"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <IconMenu size={20} />
        </button>

        {/* Single Global Search Bar */}
        <div className="search-bar-wrap" ref={searchWrapRef}>
          <IconSearch size={16} className="search-icon-pos" />
          <input
            type="text"
            className="search-input"
            placeholder="Search courses, topics, exams, Python..."
            value={searchTerm}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => {
              if (query.length >= 2) setIsSearchOpen(true);
            }}
            aria-label="Search courses, topics, exams, and Python lessons"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                setIsSearchOpen(false);
              }}
              className="search-clear-btn"
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                padding: '4px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Clear search query"
            >
              <IconX size={14} />
            </button>
          )}

          {/* Search Dropdown Results */}
          {isSearchOpen && query.length >= 2 && (
            <div
              className="search-results-dropdown"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                width: '420px',
                maxWidth: 'calc(100vw - 32px)',
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-elevation)',
                border: '1px solid var(--border-card)',
                padding: '12px',
                maxHeight: '440px',
                overflowY: 'auto',
                zIndex: 120
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', paddingBottom: '6px', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Search Results ({totalResultsCount})
                </span>
                <span style={{ fontSize: '11px', color: 'var(--sage-600)' }}>Query: "{searchTerm}"</span>
              </div>

              {/* Quick AI Search Shortcut */}
              <div
                onClick={() => handleResultClick({ type: 'ai' })}
                style={{
                  padding: '9px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '9px',
                  backgroundColor: 'var(--sage-100)',
                  border: '1px solid var(--border-sage)',
                  marginBottom: '10px'
                }}
              >
                <IconSparkles size={16} style={{ color: 'var(--forest-900)' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: 'var(--forest-950)' }}>Ask AI Study Assistant: "{searchTerm}"</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Get step-by-step Socratic engineering explanation</div>
                </div>
              </div>

              {totalResultsCount === 0 && (
                <div style={{ padding: '16px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
                  No exact matching courses, topics, exams, or Python lessons found.
                </div>
              )}

              {/* Courses Group */}
              {searchResults.subjects.length > 0 && (
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--forest-700)', padding: '4px 6px' }}>
                    COURSES
                  </div>
                  {searchResults.subjects.map((sub) => (
                    <div
                      key={sub.id}
                      onClick={() => handleResultClick({ type: 'subject', data: sub })}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: 'var(--bg-card-warm)',
                        marginBottom: '4px'
                      }}
                    >
                      <IconBook size={14} style={{ color: 'var(--forest-700)' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: 'var(--forest-950)' }}>{sub.title}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{sub.code} · {sub.credits} Credits</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Topics Group */}
              {searchResults.topics.length > 0 && (
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--forest-700)', padding: '4px 6px' }}>
                    SYLLABUS TOPICS
                  </div>
                  {searchResults.topics.slice(0, 5).map((top) => (
                    <div
                      key={top.id}
                      onClick={() => handleResultClick({ type: 'topic', subject: top.subject, topicId: top.id })}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12.5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: 'var(--bg-card-warm)',
                        marginBottom: '4px'
                      }}
                    >
                      <IconCheckCircle size={14} style={{ color: 'var(--sage-500)' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: 'var(--forest-950)' }}>{top.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{top.subject.code} · Unit {top.unitNumber}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Python Modules Group */}
              {searchResults.pythonLessons.length > 0 && (
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--forest-700)', padding: '4px 6px' }}>
                    PYTHON ACADEMY
                  </div>
                  {searchResults.pythonLessons.map((pym) => (
                    <div
                      key={pym.id}
                      onClick={() => handleResultClick({ type: 'python', moduleId: pym.id })}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12.5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: 'var(--bg-card-warm)',
                        marginBottom: '4px'
                      }}
                    >
                      <IconPython size={14} style={{ color: 'var(--forest-700)' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: 'var(--forest-950)' }}>
                          {pym.isPractice ? pym.title : `Module ${pym.number}: ${pym.title}`}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {pym.isPractice ? pym.exercise.category : `Estimated: ${pym.duration}`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Video Lectures Group */}
              {searchResults.videos.length > 0 && (
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--forest-700)', padding: '4px 6px' }}>
                    VIDEO LECTURES
                  </div>
                  {searchResults.videos.slice(0, 4).map((vid) => (
                    <div
                      key={vid.id}
                      onClick={() => handleResultClick({ type: 'video', video: vid })}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12.5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: 'var(--bg-card-warm)',
                        marginBottom: '4px'
                      }}
                    >
                      <IconVideo size={14} style={{ color: 'var(--forest-700)' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: 'var(--forest-950)' }}>{vid.title}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{vid.channel} · {vid.duration}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Exam Centre Group */}
              {searchResults.exams.length > 0 && (
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--forest-700)', padding: '4px 6px' }}>
                    EXAM CENTRE
                  </div>
                  {searchResults.exams.slice(0, 4).map((ex) => (
                    <div
                      key={ex.id}
                      onClick={() => handleResultClick({ type: 'exam-prep', subject: ex.subject })}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12.5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: 'var(--bg-card-warm)',
                        marginBottom: '4px'
                      }}
                    >
                      <IconAward size={14} style={{ color: 'var(--forest-700)' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: 'var(--forest-950)' }}>{ex.title}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{ex.subject.code} · Model Papers & Solutions</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Assignments Group */}
              {searchResults.assignments.length > 0 && (
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--forest-700)', padding: '4px 6px' }}>
                    STUDY PLANNER & ASSIGNMENTS
                  </div>
                  {searchResults.assignments.map((asg) => (
                    <div
                      key={asg.id}
                      onClick={() => handleResultClick({ type: 'planner', assignmentId: asg.id })}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12.5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: 'var(--bg-card-warm)',
                        marginBottom: '4px'
                      }}
                    >
                      <IconCalendar size={14} style={{ color: 'var(--forest-700)' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: 'var(--forest-950)' }}>{asg.title}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Due: {asg.dueDate} · Status: {asg.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="nav-right-section">
        {/* Semester indicator */}
        <div className="term-pill-badge" title="Active Academic Session">
          <span className="term-pill-dot" />
          <span>{profile?.semester || 'Semester 1'}</span>
        </div>

        {/* Student Profile Quick Trigger */}
        <div
          onClick={onOpenProfile}
          style={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginLeft: '4px',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border-card)',
            boxShadow: 'var(--shadow-sm)'
          }}
          title="Edit Student Profile & Study Goals"
          role="button"
          tabIndex={0}
        >
          {profile?.profilePic ? (
            <img
              src={profile.profilePic}
              alt="Profile"
              style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: 'var(--forest-850)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 700
              }}
            >
              {initials}
            </div>
          )}
          <span className="top-profile-label" style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--forest-950)' }}>
            Profile
          </span>
        </div>
      </div>
    </header>
  );
}
