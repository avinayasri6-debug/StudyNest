import React from 'react';
import {
  IconSparkles,
  IconBook,
  IconPython,
  IconCalendar,
  IconChevronRight,
  IconCheckCircle
} from '../components/Icons';
import DailyChallengeCard from '../components/DailyChallengeCard';
import { SEMESTER_1_SUBJECTS, getAllSubjectTopics } from '../data/subjectsData';
import { PYTHON_MODULES } from '../data/pythonCurriculum';
import { VIDEO_LESSONS } from '../data/videosData';
import './DashboardView.css';

function resolveContinueItem({
  recentlyWatchedVideos,
  studySessions,
  completedModuleIds,
  completedTopics,
  onNavigate,
  onSelectSubject
}) {
  // 1. Check recently watched video lectures
  if (recentlyWatchedVideos && recentlyWatchedVideos.length > 0) {
    const last = recentlyWatchedVideos[0];
    const video = VIDEO_LESSONS.find((v) => v.id === last.videoId);
    if (video) {
      return {
        tag: 'Recent Lecture',
        title: video.title,
        subtitle: `${video.subjectTitle || video.subjectCode || 'Engineering Lecture'} · ${video.channel}`,
        buttonText: 'Resume Lecture',
        onClick: () => onNavigate('videos')
      };
    }
  }

  // 2. Check recent study sessions
  if (studySessions && studySessions.length > 0) {
    const lastSession = studySessions[studySessions.length - 1];
    if (lastSession && (lastSession.topic || lastSession.subject)) {
      return {
        tag: 'Recent Study Session',
        title: lastSession.topic || lastSession.subject,
        subtitle: `${lastSession.subject ? `${lastSession.subject} · ` : ''}${lastSession.minutes || 25} mins logged`,
        buttonText: 'Continue Studying',
        onClick: () => onNavigate('planner')
      };
    }
  }

  // 3. Check Python progress
  if (completedModuleIds && completedModuleIds.length > 0) {
    const nextMod = PYTHON_MODULES.find((m) => !completedModuleIds.includes(m.id)) || PYTHON_MODULES[0];
    if (nextMod) {
      return {
        tag: 'Next Python Lesson',
        title: `Module ${nextMod.number}: ${nextMod.title}`,
        subtitle: `Python Academy · Estimated ${nextMod.duration}`,
        buttonText: 'Resume Coding',
        onClick: () => onNavigate('python')
      };
    }
  }

  // 4. Check subjects with completed topics
  if (completedTopics && Object.keys(completedTopics).length > 0) {
    for (const sub of SEMESTER_1_SUBJECTS) {
      const completed = completedTopics[sub.id];
      if (completed && completed.length > 0) {
        const allTopics = getAllSubjectTopics(sub);
        const nextTopic = allTopics.find((t) => !completed.includes(t.id));
        return {
          tag: 'Active Course',
          title: nextTopic ? nextTopic.name : sub.title,
          subtitle: `${sub.code} · ${sub.shortName}`,
          buttonText: 'Resume Course',
          onClick: () => {
            if (onSelectSubject) {
              onSelectSubject(sub);
            } else {
              onNavigate('subjects');
            }
          }
        };
      }
    }
  }

  // 5. Default recommendation for new student / clean slate
  const defaultSub = SEMESTER_1_SUBJECTS[0];
  return {
    tag: 'Recommended Course',
    title: defaultSub.title,
    subtitle: `${defaultSub.code} · Core Engineering Foundation (${defaultSub.credits} Credits)`,
    buttonText: 'Start Learning',
    onClick: () => {
      if (onSelectSubject) {
        onSelectSubject(defaultSub);
      } else {
        onNavigate('subjects');
      }
    }
  };
}

export default function DashboardView({
  profile,
  completedTopics = {},
  completedModuleIds = [],
  tasks = [],
  onSaveTasks,
  _quizHistory = [],
  _assignments = [],
  studySessions = [],
  _plannedSessions = [],
  _upcomingExams = [],
  recentlyWatchedVideos = [],
  _watchLaterVideoIds = [],
  _completedVideoIds = [],
  onSelectSubject,
  onNavigate,
  _searchTerm = '',
  onShowToast,
  onOpenPlayground
}) {
  const studentFirstName = profile?.name ? profile.name.trim().split(' ')[0] : 'Student';
  const branchSubtitle = profile?.branch
    ? `${profile.branch} · ${profile.semester || 'Semester 1'}`
    : 'Semester 1 Engineering';

  // 1. Derive the single most useful Continue Learning item from real activity
  const continueItem = resolveContinueItem({
    recentlyWatchedVideos,
    studySessions,
    completedModuleIds,
    completedTopics,
    onNavigate,
    onSelectSubject
  });

  // 2. The four primary feature cards
  const FEATURE_CARDS = [
    {
      id: 'ai-assistant',
      title: 'AI Study Assistant',
      description: 'Socratic step-by-step problem solver, mathematical formula explanations, and code debugging.',
      icon: IconSparkles,
      actionText: 'Ask AI Assistant',
      onClick: () => onNavigate('ai-assistant')
    },
    {
      id: 'subjects',
      title: 'My Courses',
      description: 'Explore all 7 Semester 1 curricula with interactive syllabus checklists and verified unit topics.',
      icon: IconBook,
      actionText: 'View All Courses',
      onClick: () => onNavigate('subjects')
    },
    {
      id: 'python',
      title: 'Python Academy',
      description: 'In-browser interactive coding workspace powered by Pyodide with 20 hands-on practice lab exercises.',
      icon: IconPython,
      actionText: 'Launch Code Lab',
      onClick: () => onNavigate('python')
    },
    {
      id: 'planner',
      title: 'Study Planner',
      description: 'Pomodoro focus timer, weekly study tracking, assignment deadlines, and exam countdowns.',
      icon: IconCalendar,
      actionText: 'Manage Schedule',
      onClick: () => onNavigate('planner')
    }
  ];

  // 3. Small pending tasks (up to 3 real tasks if present)
  const pendingTasks = (tasks || []).filter((t) => !t.completed).slice(0, 3);

  const handleToggleTask = (taskId) => {
    if (!onSaveTasks) return;
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t));
    onSaveTasks(updated);
    onShowToast?.('Task marked as completed');
  };

  return (
    <div className="dashboard-container">
      {/* 1. Simple Welcome Heading & Short Subtitle */}
      <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="dashboard-greeting">Good day, {studentFirstName}.</h1>
          <p className="dashboard-subtitle">Here is your academic workspace for {branchSubtitle}.</p>
        </div>

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
      </header>

      {/* 2. One Useful Continue Learning Section */}
      <section className="continue-learning-section" aria-labelledby="continue-learning-title">
        <div className="continue-learning-card">
          <div className="continue-learning-content">
            <div className="continue-learning-tag">
              <span className="continue-learning-tag-dot" />
              <span>{continueItem.tag}</span>
            </div>
            <h2 id="continue-learning-title" className="continue-learning-title" title={continueItem.title}>
              {continueItem.title}
            </h2>
            <p className="continue-learning-subtitle">{continueItem.subtitle}</p>
          </div>
          <button
            type="button"
            className="continue-learning-btn"
            onClick={continueItem.onClick}
          >
            <span>{continueItem.buttonText}</span>
            <IconChevronRight size={15} />
          </button>
        </div>
      </section>

      {/* 3. Optional Daily Engineering Micro-Challenge */}
      <DailyChallengeCard onShowToast={onShowToast} />

      {/* 3. Four Primary Feature Cards */}
      <section className="dashboard-features-section" aria-label="Core Academic Features">
        <div className="dashboard-features-grid">
          {FEATURE_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className="feature-card"
                onClick={card.onClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    card.onClick();
                  }
                }}
              >
                <div>
                  <div className="feature-card-top">
                    <div className="feature-card-icon-wrap">
                      <Icon size={22} />
                    </div>
                    <IconChevronRight size={18} className="feature-card-arrow" />
                  </div>
                  <h3 className="feature-card-title">{card.title}</h3>
                  <p className="feature-card-desc">{card.description}</p>
                </div>
                <div className="feature-card-action">
                  <span>{card.actionText}</span>
                  <IconChevronRight size={14} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Small Upcoming Tasks Section (Only rendered if real tasks exist) */}
      {pendingTasks.length > 0 && (
        <section className="dashboard-tasks-section" aria-labelledby="upcoming-tasks-title">
          <div className="dashboard-tasks-header">
            <h2 id="upcoming-tasks-title" className="dashboard-tasks-title">Upcoming Tasks</h2>
            <button
              type="button"
              className="dashboard-tasks-link"
              onClick={() => onNavigate('planner')}
            >
              <span>View all in Planner</span>
              <IconChevronRight size={14} />
            </button>
          </div>
          <div className="dashboard-task-list">
            {pendingTasks.map((task) => (
              <div key={task.id} className="dashboard-task-item">
                <div className="dashboard-task-left">
                  <button
                    type="button"
                    className="dashboard-task-check-btn"
                    onClick={() => handleToggleTask(task.id)}
                    aria-label={`Mark "${task.title}" as complete`}
                  >
                    <IconCheckCircle size={15} />
                  </button>
                  <span className="dashboard-task-name" title={task.title}>
                    {task.title}
                  </span>
                </div>
                {task.subjectTag && (
                  <span className="dashboard-task-tag">{task.subjectTag}</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
