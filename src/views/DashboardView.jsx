import React, { useMemo } from 'react';
import WelcomeBanner from '../components/WelcomeBanner';
import SemesterHeader from '../components/SemesterHeader';
import SubjectCard from '../components/SubjectCard';
import WeeklyStudyOverview from '../components/WeeklyStudyOverview';
import TodayTasks from '../components/TodayTasks';
import StudyProgress from '../components/StudyProgress';
import PythonAcademyCard from '../components/PythonAcademyCard';
import SemesterTwoPreview from '../components/SemesterTwoPreview';
import { SEMESTER_1_SUBJECTS, getAllSubjectTopics } from '../data/subjectsData';
import { VIDEO_LESSONS } from '../data/videosData';
import {
  IconChevronRight,
  IconSparkles,
  IconClock,
  IconAward,
  IconCheckSquare,
  IconPlay,
  IconVideo,
  IconBookmark
} from '../components/Icons';

function getTodayIso() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getMondayTimestamp() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  return monday.getTime();
}

function getExamDaysRemaining(dateStr) {
  if (!dateStr) return -1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [y, m, d] = dateStr.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatVideoTime(seconds) {
  if (!seconds || seconds <= 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function DashboardView({
  profile,
  completedTopics = {},
  completedModuleIds = [],
  tasks = [],
  onSaveTasks,
  quizHistory = [],
  assignments = [],
  studySessions = [],
  plannedSessions = [],
  upcomingExams = [],
  recentlyWatchedVideos = [],
  watchLaterVideoIds = [],
  completedVideoIds = [],
  onSelectSubject,
  onNavigate,
  searchTerm = '',
  onShowToast
}) {
  // Compute overall topic numbers
  let totalTopicsCount = 0;
  let completedTopicsCount = 0;
  SEMESTER_1_SUBJECTS.forEach((sub) => {
    const topics = getAllSubjectTopics(sub);
    totalTopicsCount += topics.length;
    completedTopicsCount += (completedTopics[sub.id] || []).length;
  });

  const totalStudyMinutes = studySessions.reduce((acc, s) => acc + (s.minutes || 0), 0);
  const studyHoursLogged = (totalStudyMinutes / 60).toFixed(1);

  // ==========================================
  // FEATURE 8: SMART PLANNER INTEGRATION METRICS
  // ==========================================
  const todayStr = useMemo(() => getTodayIso(), []);
  const mondayTime = useMemo(() => getMondayTimestamp(), []);

  // 1. Today's study hours
  const todayMinutes = useMemo(() => {
    return studySessions
      .filter((s) => s.date === todayStr)
      .reduce((acc, s) => acc + (s.minutes || 0), 0);
  }, [studySessions, todayStr]);
  const todayStudyHours = (todayMinutes / 60).toFixed(1);
  const dailyTargetHours = profile?.studyGoals?.dailyTargetHours || 3.5;
  const dailyGoalPercent = Math.min(100, Math.round((parseFloat(todayStudyHours) / dailyTargetHours) * 100));

  // 2. Pending assignments
  const pendingAssignments = useMemo(() => {
    return assignments.filter((a) => a.status !== 'Submitted');
  }, [assignments]);
  const pendingAssignmentsCount = pendingAssignments.length;

  // 3. Upcoming exams
  const nearestUpcomingExam = useMemo(() => {
    return upcomingExams
      .map((e) => ({ ...e, days: getExamDaysRemaining(e.date) }))
      .filter((e) => e.days >= 0)
      .sort((a, b) => a.days - b.days)[0] || null;
  }, [upcomingExams]);

  // 4. Completed tasks
  const totalTasksCount = tasks.length;
  const completedTasksCount = useMemo(() => tasks.filter((t) => t.completed).length, [tasks]);

  // 5. Weekly study progress
  const weeklyTargetHours = profile?.studyGoals?.weeklyHoursTarget || 20.0;
  const weekMinutes = useMemo(() => {
    return studySessions
      .filter((s) => {
        if (!s.date) return false;
        const [y, m, d] = s.date.split('-').map(Number);
        const sessionTime = new Date(y, m - 1, d).getTime();
        return sessionTime >= mondayTime;
      })
      .reduce((acc, s) => acc + (s.minutes || 0), 0);
  }, [studySessions, mondayTime]);
  const weekStudyHours = (weekMinutes / 60).toFixed(1);
  const weeklyProgressPercent = Math.min(100, Math.round((parseFloat(weekStudyHours) / weeklyTargetHours) * 100));

  // 6. Next scheduled activity
  const nextScheduledSession = useMemo(() => {
    return plannedSessions
      .filter((s) => s.date === todayStr && !s.completed)
      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))[0] || null;
  }, [plannedSessions, todayStr]);

  const nextPendingTask = useMemo(() => {
    return !nextScheduledSession ? tasks.filter((t) => !t.completed)[0] || null : null;
  }, [nextScheduledSession, tasks]);

  // 7. Video Learning Hub integration metrics
  const totalVideosCount = VIDEO_LESSONS.length;
  const completedVideosCount = completedVideoIds.length;
  const videoProgressPercent = totalVideosCount > 0 ? Math.min(100, Math.round((completedVideosCount / totalVideosCount) * 100)) : 0;
  const watchLaterCount = watchLaterVideoIds.length;
  const lastWatchedItem = recentlyWatchedVideos[0] || null;
  const lastWatchedVideo = useMemo(() => {
    if (!lastWatchedItem) return null;
    return VIDEO_LESSONS.find((v) => v.id === lastWatchedItem.videoId) || null;
  }, [lastWatchedItem]);
  const recommendedVideo = useMemo(() => {
    return VIDEO_LESSONS.find((v) => !completedVideoIds.includes(v.id)) || VIDEO_LESSONS[0];
  }, [completedVideoIds]);

  // Filter subjects if user typed something in search bar
  const filteredSubjects = SEMESTER_1_SUBJECTS.filter((sub) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      sub.title.toLowerCase().includes(term) ||
      sub.code.toLowerCase().includes(term) ||
      sub.category.toLowerCase().includes(term)
    );
  });

  return (
    <div className="dashboard-view-content">
      {/* 2. Welcome section with the heading "Your journey to academic excellence starts here." */}
      <WelcomeBanner
        profile={profile}
        completedTopicsCount={completedTopicsCount}
        totalTopicsCount={totalTopicsCount}
        completedPythonCount={completedModuleIds.length}
        studyHoursLogged={studyHoursLogged}
        onQuickAction={() => onNavigate('python')}
      />

      {/* 3. Display Semester 1 */}
      <SemesterHeader profile={profile} />

      {/* 8. Quick-access Python Academy card */}
      <PythonAcademyCard
        completedModuleIds={completedModuleIds}
        onOpenAcademy={() => onNavigate('python')}
      />

      {/* Quick-access AI Study Assistant card */}
      <div
        className="ai-dashboard-hero-card"
        style={{
          margin: '0 0 28px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-card)',
          padding: '20px 24px',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ flex: 1, minWidth: 'min(100%, 280px)' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--sage-100)',
              color: 'var(--forest-900)',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '8px'
            }}
          >
            <IconSparkles size={13} />
            <span>24/7 AI Engineering Tutor</span>
          </div>
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--forest-900)', margin: '0 0 4px' }}>
            Have questions on your Semester 1 courses?
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            Ask the AI Study Assistant to break down complex theorems, solve numerical steps, debug Python code line-by-line, or generate exam practice questions.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('ai-assistant')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            backgroundColor: 'var(--forest-900)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <span>Open AI Assistant</span>
          <IconChevronRight size={15} />
        </button>
      </div>

      {/* 4. Show seven subject cards */}
      <section className="dashboard-section" aria-labelledby="subjects-heading">
        <div className="section-header-row">
          <div>
            <h2 id="subjects-heading" className="section-title">
              Semester 1 Confirmed Subjects ({filteredSubjects.length} of 7)
            </h2>
            <div className="section-subtitle">
              Click any subject to check off syllabus topics, manage assignments, and review key questions
            </div>
          </div>
          <button
            type="button"
            className="section-action-btn"
            onClick={() => onNavigate('subjects')}
          >
            <span>View All Curricula</span>
            <IconChevronRight size={14} />
          </button>
        </div>

        <div className="subjects-grid">
          {filteredSubjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              completedTopicIds={completedTopics[subject.id] || []}
              onClick={onSelectSubject}
            />
          ))}
          {filteredSubjects.length === 0 && (
            <div style={{
              gridColumn: '1 / -1',
              padding: '36px',
              textAlign: 'center',
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)'
            }}>
              No subjects matched "{searchTerm}".
            </div>
          )}
        </div>
      </section>

      {/* Feature 8: Smart Planner Academic Integration Hub */}
      <section className="dashboard-section" aria-labelledby="planner-hub-heading">
        <div className="section-header-row" style={{ marginBottom: '14px' }}>
          <div>
            <h2 id="planner-hub-heading" className="section-title">
              Academic Schedule & Planner Hub
            </h2>
            <div className="section-subtitle">
              Synchronized study quotas, pending assignment deadlines, and exam countdowns
            </div>
          </div>
          <button
            type="button"
            className="section-action-btn"
            onClick={() => onNavigate('planner')}
          >
            <span>Open Smart Study Planner</span>
            <IconChevronRight size={14} />
          </button>
        </div>

        {/* 6 Integrated Information Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 210px), 1fr))', gap: '14px', marginBottom: '16px' }}>
          {/* 1. Today's Study Hours */}
          <div className="planner-stat-card">
            <div className="planner-stat-icon">
              <IconClock size={20} />
            </div>
            <div>
              <div className="planner-stat-label">Today's Study Hours</div>
              <div className="planner-stat-val">{todayStudyHours}h <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>/ {dailyTargetHours}h</span></div>
              <div className="planner-stat-sub">{dailyGoalPercent}% of daily target</div>
            </div>
          </div>

          {/* 2. Pending Assignments */}
          <div className="planner-stat-card">
            <div className="planner-stat-icon">
              <IconCheckSquare size={20} />
            </div>
            <div>
              <div className="planner-stat-label">Pending Assignments</div>
              <div className="planner-stat-val">{pendingAssignmentsCount} Pending</div>
              <div className="planner-stat-sub">{assignments.length - pendingAssignmentsCount} submitted</div>
            </div>
          </div>

          {/* 3. Upcoming Exams */}
          <div className="planner-stat-card">
            <div className="planner-stat-icon" style={{ color: nearestUpcomingExam && nearestUpcomingExam.days <= 7 ? '#DC2626' : 'var(--forest-900)' }}>
              <IconAward size={20} />
            </div>
            <div>
              <div className="planner-stat-label">Upcoming Exam</div>
              <div className="planner-stat-val" style={{ color: nearestUpcomingExam && nearestUpcomingExam.days <= 7 ? '#DC2626' : 'inherit' }}>
                {nearestUpcomingExam ? `${nearestUpcomingExam.days} days left` : 'None Scheduled'}
              </div>
              <div className="planner-stat-sub">
                {nearestUpcomingExam ? `${nearestUpcomingExam.subjectCode} (${nearestUpcomingExam.examType.slice(0, 15)}...)` : 'All clear'}
              </div>
            </div>
          </div>

          {/* 4. Completed Tasks */}
          <div className="planner-stat-card">
            <div className="planner-stat-icon">
              <IconCheckSquare size={20} />
            </div>
            <div>
              <div className="planner-stat-label">Completed Tasks</div>
              <div className="planner-stat-val">{completedTasksCount} of {totalTasksCount}</div>
              <div className="planner-stat-sub">{totalTasksCount - completedTasksCount} tasks remaining</div>
            </div>
          </div>
        </div>

        {/* 5. Weekly Study Progress Bar & 6. Next Scheduled Activity */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '14px' }}>
          {/* Weekly Progress Card */}
          <div className="analytics-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--forest-950)' }}>
                Weekly Study Progress
              </span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--forest-900)' }}>
                {weekStudyHours}h / {weeklyTargetHours}h target ({weeklyProgressPercent}%)
              </span>
            </div>
            <div className="goal-progress-bar-bg" style={{ height: '8px' }}>
              <div
                className="goal-progress-bar-fill"
                style={{ width: `${weeklyProgressPercent}%`, backgroundColor: weeklyProgressPercent >= 100 ? '#16A34A' : 'var(--forest-850)' }}
              />
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              {weeklyProgressPercent >= 100
                ? '🎉 Excellent pace! Weekly quota achieved.'
                : `${(weeklyTargetHours - parseFloat(weekStudyHours)).toFixed(1)} hrs needed to achieve weekly milestone.`}
            </div>
          </div>

          {/* Next Scheduled Activity Card */}
          <div className="analytics-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '2px' }}>
                Next Scheduled Activity
              </div>
              {nextScheduledSession ? (
                <>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--forest-950)' }}>
                    {nextScheduledSession.topic}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {nextScheduledSession.subjectCode} · {nextScheduledSession.startTime} - {nextScheduledSession.endTime}
                  </div>
                </>
              ) : nextPendingTask ? (
                <>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--forest-950)' }}>
                    {nextPendingTask.title}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {nextPendingTask.subjectTag || 'General'} · Due {nextPendingTask.dueDate}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                  No pending sessions for today. You are all caught up!
                </div>
              )}
            </div>

            <button
              type="button"
              className="add-task-btn"
              style={{ padding: '8px 14px', fontSize: '12px' }}
              onClick={() => onNavigate('planner')}
            >
              <IconPlay size={13} />
              <span>Launch Focus</span>
            </button>
          </div>
        </div>
      </section>

      {/* Video Learning Hub Integration */}
      <section className="dashboard-section" aria-labelledby="video-hub-heading">
        <div className="section-header-row" style={{ marginBottom: '14px' }}>
          <div>
            <h2 id="video-hub-heading" className="section-title">
              Video Learning Hub
            </h2>
            <div className="section-subtitle">
              Verified syllabus lectures, chapter playlists, and timestamped study notes
            </div>
          </div>
          <button
            type="button"
            className="section-action-btn"
            onClick={() => onNavigate('videos')}
          >
            <span>Open Video Hub</span>
            <IconChevronRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '14px' }}>
          {/* Lecture Progress & Watch Later Card */}
          <div className="analytics-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ color: 'var(--forest-900)', display: 'flex', alignItems: 'center' }}>
                  <IconVideo size={18} />
                </div>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--forest-950)' }}>
                  Video Lectures Completed
                </span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--forest-900)' }}>
                {completedVideosCount} / {totalVideosCount} ({videoProgressPercent}%)
              </span>
            </div>
            <div className="goal-progress-bar-bg" style={{ height: '8px' }}>
              <div
                className="goal-progress-bar-fill"
                style={{ width: `${videoProgressPercent}%`, backgroundColor: videoProgressPercent >= 100 ? '#16A34A' : 'var(--forest-850)' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              <span>{totalVideosCount - completedVideosCount} lectures remaining</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--forest-900)', fontWeight: 600 }}>
                <IconBookmark size={13} filled={watchLaterCount > 0} /> {watchLaterCount} in Watch Later
              </span>
            </div>
          </div>

          {/* Last Watched or Next Recommended Lecture */}
          <div className="analytics-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '180px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '2px' }}>
                {lastWatchedVideo ? 'Resume Last Watched Lecture' : 'Recommended Next Lecture'}
              </div>
              <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--forest-950)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }} title={lastWatchedVideo ? lastWatchedVideo.title : recommendedVideo?.title}>
                {lastWatchedVideo ? lastWatchedVideo.title : (recommendedVideo?.title || 'Explore Library')}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {lastWatchedVideo
                  ? `${lastWatchedVideo.teacher} · Resumes at ${formatVideoTime(lastWatchedItem.timestampSeconds)}`
                  : (recommendedVideo ? `${recommendedVideo.subjectTitle} · ${recommendedVideo.teacher}` : '7 Engineering Subjects Available')}
              </div>
            </div>

            <button
              type="button"
              className="add-task-btn"
              style={{ padding: '8px 14px', fontSize: '12px' }}
              onClick={() => onNavigate('videos')}
            >
              <IconPlay size={13} />
              <span>{lastWatchedVideo ? 'Resume' : 'Watch Now'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 5. Weekly study overview & 6. Today's tasks with checkboxes */}
      <div className="dashboard-columns-grid">
        <WeeklyStudyOverview studySessions={studySessions} />
        <TodayTasks tasks={tasks} onSaveTasks={onSaveTasks} onShowToast={onShowToast} />
      </div>

      {/* 7. Study progress section */}
      <StudyProgress
        completedTopics={completedTopics}
        completedModuleIds={completedModuleIds}
        quizHistory={quizHistory}
        assignments={assignments}
        studySessions={studySessions}
      />

      {/* 9. Coming-soon Semester 2 section (no invented subjects) */}
      <SemesterTwoPreview onShowToast={onShowToast} />
    </div>
  );
}
