import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  IconSparkles,
  IconChevronDown
} from './Icons';
import { getActiveCurriculumSubjects, getAllSubjectTopics, parseSemesterNumber } from '../data/curriculumData';
import { ACADEMIC_YEARS } from '../data/branchesData';
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
  onNavigateToResult,
  onUpdateSemester,
  customSubjects = [],
  subjectOverrides = {}
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSemesterMenuOpen, setIsSemesterMenuOpen] = useState(false);
  const searchWrapRef = useRef(null);
  const semesterMenuRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchWrapRef.current && !searchWrapRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
      if (semesterMenuRef.current && !semesterMenuRef.current.contains(event.target)) {
        setIsSemesterMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const query = searchTerm.trim().toLowerCase();

  // Dynamically resolve active subjects matching student's branch & semester
  const semNum = parseSemesterNumber(profile?.semester);
  const activeSubjects = useMemo(() => {
    return getActiveCurriculumSubjects({
      profile,
      branchId: profile?.branchId || 'cse',
      semester: semNum,
      customSubjects,
      subjectOverrides
    });
  }, [profile, semNum, customSubjects, subjectOverrides]);

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
    // 1. Courses (Subjects) from active curriculum
    activeSubjects.forEach((s) => {
      if (s.title.toLowerCase().includes(query) || s.code.toLowerCase().includes(query) || (s.shortName && s.shortName.toLowerCase().includes(query))) {
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
          title: `${s.shortName || s.title} Mock Exam & Practice Paper`,
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
        {/* Interactive Semester Quick Switcher */}
        <div style={{ position: 'relative' }} ref={semesterMenuRef}>
          <button
            type="button"
            className="term-pill-badge"
            style={{
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              border: isSemesterMenuOpen ? '1px solid var(--forest-800)' : '1px solid var(--border-sage)',
              backgroundColor: isSemesterMenuOpen ? 'rgba(104, 143, 120, 0.2)' : 'rgba(104, 143, 120, 0.12)',
              outline: 'none',
              padding: '5px 12px',
              borderRadius: 'var(--radius-full)'
            }}
            onClick={() => setIsSemesterMenuOpen((prev) => !prev)}
            title="Switch Academic Semester"
            aria-expanded={isSemesterMenuOpen}
            aria-haspopup="true"
          >
            <span className="term-pill-dot" />
            <span style={{ fontWeight: 700, fontSize: '12px', color: 'var(--forest-950)' }}>
              {profile?.semester || 'Semester 1'}
            </span>
            <IconChevronDown
              size={13}
              style={{
                color: 'var(--forest-850)',
                transform: isSemesterMenuOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s ease'
              }}
            />
          </button>

          {/* Semester Selector Dropdown */}
          {isSemesterMenuOpen && (
            <div
              className="semester-switcher-dropdown"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '300px',
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-md, 12px)',
                boxShadow: 'var(--shadow-elevation, 0 16px 36px rgba(28, 56, 41, 0.16))',
                border: '1px solid var(--border-card, #E3DDCF)',
                padding: '12px',
                zIndex: 130,
                animation: 'fadeInUp 0.18s ease-out'
              }}
            >
              <div style={{ paddingBottom: '8px', marginBottom: '8px', borderBottom: '1px solid var(--border-subtle, #EFECE4)' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--forest-800)', letterSpacing: '0.05em' }}>
                  Academic Term Switcher
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {profile?.branch || 'Engineering'} · {profile?.year || 'First Year'}
                </div>
              </div>

              {/* Grouped by Academic Year */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {ACADEMIC_YEARS.map((yearGroup) => (
                  <div key={yearGroup.id}>
                    <div style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>
                      {yearGroup.label}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      {yearGroup.semesters.map((sNum) => {
                        const sLabel = `Semester ${sNum}`;
                        const isCurrent = (profile?.semester || 'Semester 1') === sLabel;
                        return (
                          <button
                            key={sNum}
                            type="button"
                            onClick={() => {
                              onUpdateSemester?.(sLabel);
                              setIsSemesterMenuOpen(false);
                            }}
                            style={{
                              padding: '8px 10px',
                              borderRadius: '8px',
                              border: isCurrent ? '1.5px solid var(--forest-800)' : '1px solid var(--border-card, #E3DDCF)',
                              backgroundColor: isCurrent ? 'rgba(104, 143, 120, 0.16)' : 'var(--bg-card-warm, #FAF8F3)',
                              color: isCurrent ? 'var(--forest-950)' : 'var(--forest-900)',
                              fontWeight: isCurrent ? 700 : 600,
                              fontSize: '12px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}
                          >
                            <span>Sem {sNum}</span>
                            {isCurrent && <IconCheckCircle size={13} style={{ color: 'var(--forest-800)' }} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
