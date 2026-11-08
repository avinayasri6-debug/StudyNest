import React, { useMemo } from 'react';
import {
  IconSparkles,
  IconBook,
  IconPython,
  IconCalendar,
  IconChevronRight,
  IconCheckCircle,
  IconClock
} from '../components/Icons';
import WelcomeBanner from '../components/WelcomeBanner';
import { getActiveCurriculumSubjects, getAllSubjectTopics, parseSemesterNumber } from '../data/curriculumData';
import { PYTHON_MODULES } from '../data/pythonCurriculum';
import { VIDEO_LESSONS } from '../data/videosData';
import './DashboardView.css';

function getMondayTimestamp() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  return monday.getTime();
}

function formatExamDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return dateStr;
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function computeWeeklyStudyMinutes(studySessions) {
  const mondayTime = getMondayTimestamp();
  return (studySessions || [])
    .filter((s) => {
      if (!s.date) return false;
      const [y, m, d] = s.date.split('-').map(Number);
      if (!y || !m || !d) return false;
      const sessionTime = new Date(y, m - 1, d).getTime();
      return sessionTime >= mondayTime;
    })
    .reduce((acc, s) => acc + (Number(s.minutes) || 0), 0);
}

function findNearestUpcomingExam(upcomingExams) {
  if (!upcomingExams || upcomingExams.length === 0) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();

  const validUpcoming = upcomingExams
    .map((exam) => {
      if (!exam.date) return null;
      const [y, m, d] = exam.date.split('-').map(Number);
      if (!y || !m || !d) return null;
      const examDate = new Date(y, m - 1, d);
      examDate.setHours(0, 0, 0, 0);
      const diffMs = examDate.getTime() - todayTime;
      const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      return {
        ...exam,
        examDate,
        daysRemaining
      };
    })
    .filter((exam) => exam !== null && exam.daysRemaining >= 0)
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  return validUpcoming.length > 0 ? validUpcoming[0] : null;
}

function resolveContinueItem({
  recentlyWatchedVideos,
  studySessions,
  completedModuleIds,
  completedTopics,
  onNavigate,
  onSelectSubject,
  profile,
  customSubjects = [],
  subjectOverrides = {}
}) {
  // 1. Check recently watched video lectures
  if (recentlyWatchedVideos && recentlyWatchedVideos.length > 0) {
    const validVideos = recentlyWatchedVideos
      .map((rw) => VIDEO_LESSONS.find((v) => v.id === rw.videoId))
      .filter((v) => Boolean(v) && v.title !== 'Universal Logic Gate Minimization' && v.topicName !== 'Universal Logic Gate Minimization');
    if (validVideos.length > 0) {
      const video = validVideos[0];
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
    const validSessions = studySessions.filter(
      (s) => s.topic !== 'Universal Logic Gate Minimization' && s.subject !== 'Universal Logic Gate Minimization'
    );
    if (validSessions.length > 0) {
      const lastSession = validSessions[validSessions.length - 1];
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

  // 4. Check active curriculum subjects
  const semNum = parseSemesterNumber(profile?.semester);
  const currentSubjects = getActiveCurriculumSubjects({
    profile,
    university: profile?.college || profile?.university,
    college: profile?.college,
    universityId: profile?.universityId,
    branchId: profile?.branchId,
    branch: profile?.branch,
    semester: semNum,
    customSubjects,
    subjectOverrides
  });

  if (completedTopics && Object.keys(completedTopics).length > 0 && currentSubjects.length > 0) {
    for (const sub of currentSubjects) {
      const completed = completedTopics[sub.id];
      if (completed && completed.length > 0) {
        const allTopics = getAllSubjectTopics(sub);
        const nextTopic = allTopics.find(
          (t) => !completed.includes(t.id) && t.name !== 'Universal Logic Gate Minimization'
        );
        return {
          tag: 'Active Course',
          title: nextTopic ? nextTopic.name : sub.title,
          subtitle: `${sub.code} · ${sub.shortName || sub.title}`,
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

  // 5. Default recommendation if subjects exist
  if (currentSubjects.length > 0) {
    const defaultSub = currentSubjects[0];
    return {
      tag: 'Recommended Course',
      title: defaultSub.title,
      subtitle: `${defaultSub.code} · ${defaultSub.shortName || defaultSub.title} (${defaultSub.credits || 4} Credits)`,
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

  // 6. Graceful empty state for branch/semester awaiting syllabus
  return {
    tag: 'Academic Setup',
    title: `Configure ${profile?.semester || 'Semester'} Courses`,
    subtitle: `Upload your ${profile?.branch || 'engineering'} syllabus PDF or add courses in My Courses.`,
    buttonText: 'Configure Courses',
    onClick: () => onNavigate('subjects')
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
  upcomingExams = [],
  recentlyWatchedVideos = [],
  _watchLaterVideoIds = [],
  _completedVideoIds = [],
  onSelectSubject,
  onNavigate,
  _searchTerm = '',
  onShowToast,
  onOpenPlayground,
  customSubjects = [],
  subjectOverrides = {}
}) {
  // 1. Resolve Active Subjects & Dynamic Metrics
  const semNum = parseSemesterNumber(profile?.semester);
  const activeSubjects = useMemo(() => {
    return getActiveCurriculumSubjects({
      profile,
      university: profile?.college || profile?.university,
      college: profile?.college,
      universityId: profile?.universityId,
      branchId: profile?.branchId,
      branch: profile?.branch,
      semester: semNum,
      customSubjects,
      subjectOverrides
    });
  }, [profile, semNum, customSubjects, subjectOverrides]);

  const totalCredits = useMemo(() => {
    return activeSubjects.reduce((acc, s) => acc + (Number(s.credits) || 0), 0);
  }, [activeSubjects]);

  const { completedTopicsCount, totalTopicsCount } = useMemo(() => {
    let completed = 0;
    let total = 0;
    activeSubjects.forEach((sub) => {
      const allTopics = getAllSubjectTopics(sub);
      total += allTopics.length;
      const doneList = completedTopics[sub.id] || [];
      completed += doneList.length;
    });
    return { completedTopicsCount: completed, totalTopicsCount: total };
  }, [activeSubjects, completedTopics]);

  const totalStudyMinutes = useMemo(() => {
    return (studySessions || []).reduce((acc, s) => acc + (Number(s.minutes) || 0), 0);
  }, [studySessions]);
  const studyHoursLogged = (totalStudyMinutes / 60).toFixed(1);

  // 2. Weekly Study Goal Metrics
  const weeklyTargetHours = useMemo(() => {
    const rawTarget = profile?.studyGoals?.weeklyHoursTarget;
    const num = Number(rawTarget);
    return num > 0 ? num : 20.0;
  }, [profile?.studyGoals?.weeklyHoursTarget]);

  const currentWeekMinutes = useMemo(() => {
    return computeWeeklyStudyMinutes(studySessions);
  }, [studySessions]);

  const currentWeekHours = Number((currentWeekMinutes / 60).toFixed(1));
  const weeklyGoalPercent = Math.min(100, Math.round((currentWeekHours / weeklyTargetHours) * 100));

  const weeklyGoalMessage = useMemo(() => {
    if (currentWeekHours === 0) {
      return 'No study sessions logged yet this week. Start a focus session in Study Planner to build momentum.';
    }
    if (currentWeekHours >= weeklyTargetHours) {
      return `Target achieved! You've completed ${currentWeekHours.toFixed(1)} of ${weeklyTargetHours} hrs (${weeklyGoalPercent}%) this week. Excellent dedication!`;
    }
    if (weeklyGoalPercent >= 50) {
      return `Great momentum! You're ${weeklyGoalPercent}% toward reaching your ${weeklyTargetHours} hrs weekly target.`;
    }
    return `Keep going! You've completed ${currentWeekHours.toFixed(1)} hrs of your ${weeklyTargetHours} hrs weekly goal.`;
  }, [currentWeekHours, weeklyTargetHours, weeklyGoalPercent]);

  // 3. Upcoming Examination Determination (excluding past dates)
  const nearestExam = useMemo(() => {
    return findNearestUpcomingExam(upcomingExams);
  }, [upcomingExams]);

  const nearestExamSubjectTitle = useMemo(() => {
    if (!nearestExam) return '';
    const matching = activeSubjects.find(
      (s) => s.id === nearestExam.subjectId || s.code === nearestExam.subjectCode
    );
    if (matching) {
      return `${matching.code} · ${matching.shortName || matching.title}`;
    }
    if (nearestExam.subjectName && nearestExam.subjectCode) {
      return `${nearestExam.subjectCode} · ${nearestExam.subjectName}`;
    }
    return nearestExam.subjectName || nearestExam.subjectCode || nearestExam.title || 'Engineering Course';
  }, [nearestExam, activeSubjects]);

  // 4. Derive Continue Learning item
  const continueItem = resolveContinueItem({
    recentlyWatchedVideos,
    studySessions,
    completedModuleIds,
    completedTopics,
    onNavigate,
    onSelectSubject,
    profile,
    customSubjects,
    subjectOverrides
  });

  // Defensive filter: Ensure Universal Logic Gate Minimization never displays in Continue Learning
  if (continueItem && (continueItem.title === 'Universal Logic Gate Minimization' || continueItem.subtitle?.includes('Universal Logic Gate Minimization'))) {
    continueItem.title = 'Digital Electronics Core Studies';
    continueItem.subtitle = 'Fundamentals of Digital Electronics · Core Studies';
  }

  // 5. The four primary feature cards
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
      description: `Explore ${profile?.semester || 'Semester 1'} course curricula with interactive syllabus checklists and verified unit topics.`,
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

  // 6. Small pending tasks
  const pendingTasks = (tasks || [])
    .filter((t) => !t.completed && t.title !== 'Universal Logic Gate Minimization')
    .slice(0, 3);

  const handleToggleTask = (taskId) => {
    if (!onSaveTasks) return;
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t));
    onSaveTasks(updated);
    onShowToast?.('Task marked as completed');
  };

  return (
    <div className="dashboard-container">
      {/* 1. Dynamic Personalized Welcome Banner */}
      <WelcomeBanner
        profile={profile}
        activeSubjects={activeSubjects}
        totalCredits={totalCredits}
        completedTopicsCount={completedTopicsCount}
        totalTopicsCount={totalTopicsCount}
        completedPythonCount={completedModuleIds.length}
        studyHoursLogged={studyHoursLogged}
        onQuickAction={() => onNavigate('python')}
        onOpenPlayground={onOpenPlayground}
      />

      {/* 2. Personalized Metrics & Imminent Milestones (Weekly Goal & Upcoming Exam) */}
      <section className="dashboard-milestones-section" aria-label="Goals and Milestones">
        <div className="dashboard-milestones-grid">
          {/* Card A: Weekly Study Goal Tracker */}
          <div className="dashboard-milestone-card">
            <div>
              <div className="milestone-card-header">
                <div className="milestone-header-icon-wrap">
                  <IconClock size={18} />
                </div>
                <div className="milestone-header-info">
                  <span className="milestone-card-kicker">Weekly Study Target</span>
                  <h3 className="milestone-card-title">Study Goal Progress</h3>
                </div>
                <span className="milestone-pct-badge">{weeklyGoalPercent}%</span>
              </div>

              <div className="milestone-stat-display">
                <span className="milestone-big-number">{currentWeekHours.toFixed(1)}</span>
                <span className="milestone-unit">/ {weeklyTargetHours} hrs</span>
              </div>

              {/* Visual Progress Bar */}
              <div
                className="milestone-progress-track"
                role="progressbar"
                aria-valuenow={weeklyGoalPercent}
                aria-valuemin="0"
                aria-valuemax="100"
                aria-label="Weekly study goal progress"
              >
                <div
                  className="milestone-progress-fill"
                  style={{ width: `${Math.min(100, weeklyGoalPercent)}%` }}
                />
              </div>

              <p className="milestone-status-text">
                {weeklyGoalMessage}
              </p>
            </div>

            <div className="milestone-card-footer">
              <button
                type="button"
                className="milestone-action-btn"
                onClick={() => onNavigate('planner')}
              >
                <span>Open Study Planner</span>
                <IconChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Card B: Upcoming Examination Widget */}
          <div className="dashboard-milestone-card">
            <div>
              <div className="milestone-card-header">
                <div className="milestone-header-icon-wrap exam-icon">
                  <IconCalendar size={18} />
                </div>
                <div className="milestone-header-info">
                  <span className="milestone-card-kicker">Upcoming Examination</span>
                  <h3 className="milestone-card-title">Next Scheduled Assessment</h3>
                </div>
                {nearestExam && (
                  <span className={`milestone-countdown-badge ${nearestExam.daysRemaining <= 3 ? 'urgent' : ''}`}>
                    {nearestExam.daysRemaining === 0
                      ? 'Today'
                      : nearestExam.daysRemaining === 1
                      ? 'Tomorrow'
                      : `In ${nearestExam.daysRemaining} days`}
                  </span>
                )}
              </div>

              {nearestExam ? (
                <div className="milestone-exam-details">
                  <div className="milestone-exam-subject">
                    {nearestExamSubjectTitle}
                  </div>
                  <div className="milestone-exam-name">
                    {nearestExam.examType || nearestExam.title || 'Semester Examination'}
                  </div>
                  <div className="milestone-exam-meta">
                    <span>{formatExamDate(nearestExam.date)}</span>
                    {nearestExam.time && <span> · {nearestExam.time}</span>}
                    {nearestExam.room && <span> · {nearestExam.room}</span>}
                  </div>
                </div>
              ) : (
                <div className="milestone-empty-state">
                  <p className="milestone-empty-text">
                    No upcoming examinations currently scheduled. Plan study reviews or practice mock tests to stay exam-ready.
                  </p>
                </div>
              )}
            </div>

            <div className="milestone-card-footer">
              <button
                type="button"
                className="milestone-action-btn"
                onClick={() => onNavigate('exam-prep')}
              >
                <span>{nearestExam ? 'Prepare in Exam Prep' : 'Practice Mock Tests'}</span>
                <IconChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. One Useful Continue Learning Section */}
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

      {/* 4. Four Primary Feature Cards */}
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

      {/* 5. Small Upcoming Tasks Section (Only rendered if real tasks exist) */}
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
