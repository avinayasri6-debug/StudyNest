import React from 'react';
import { SEMESTER_1_SUBJECTS, getAllSubjectTopics } from '../data/subjectsData';
import { PYTHON_MODULES } from '../data/pythonCurriculum';
import {
  IconProgress,
  IconQuiz,
  IconAward,
  IconClock,
  IconCheckCircle
} from './Icons';

export default function StudyProgress({
  completedTopics = {},
  completedModuleIds = [],
  quizHistory = [],
  assignments = [],
  studySessions = []
}) {
  // 1. Python Lessons Progress
  const totalPythonModules = PYTHON_MODULES.length; // 15
  const completedPythonCount = completedModuleIds.length;
  const pythonPct = Math.round((completedPythonCount / totalPythonModules) * 100);

  // 2. Subject Topics Progress across all 7 courses
  const subjectProgressList = SEMESTER_1_SUBJECTS.map((sub) => {
    const topics = getAllSubjectTopics(sub);
    const subTotal = topics.length;
    const subDone = (completedTopics[sub.id] || []).length;
    const pct = subTotal > 0 ? Math.round((subDone / subTotal) * 100) : 0;

    return {
      id: sub.id,
      code: sub.code,
      name: sub.shortName,
      completed: subDone,
      total: subTotal,
      percentage: pct
    };
  });

  const totalTopicsCount = subjectProgressList.reduce((acc, s) => acc + s.total, 0);
  const completedTopicsCount = subjectProgressList.reduce((acc, s) => acc + s.completed, 0);
  const overallTopicsPct = totalTopicsCount > 0 ? Math.round((completedTopicsCount / totalTopicsCount) * 100) : 0;

  // 3. Quiz Average
  const quizzesTakenCount = quizHistory.length;
  const quizAvgPct =
    quizzesTakenCount > 0
      ? Math.round(quizHistory.reduce((acc, q) => acc + q.percentage, 0) / quizzesTakenCount)
      : 0;

  // 4. Assignments
  const totalAssignmentsCount = assignments.length;
  const submittedAssignmentsCount = assignments.filter((a) => a.status === 'Submitted').length;
  const assignmentPct =
    totalAssignmentsCount > 0 ? Math.round((submittedAssignmentsCount / totalAssignmentsCount) * 100) : 0;

  // 5. Total Study Hours Logged
  const totalStudyMinutes = studySessions.reduce((acc, s) => acc + (s.minutes || 0), 0);
  const totalStudyHours = (totalStudyMinutes / 60).toFixed(1);

  return (
    <div className="progress-section-container">
      <div className="section-header-row">
        <div>
          <h2 className="section-title">Actual Academic Progress</h2>
          <div className="section-subtitle">
            Calculated dynamically from your completed topics, Python modules, quizzes, and focus sessions
          </div>
        </div>

        <div className="term-pill-badge" style={{ backgroundColor: 'var(--sage-100)', color: 'var(--forest-900)' }}>
          <IconCheckCircle size={14} />
          <span>Real-Time Academic Tracker</span>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="progress-cards-grid">
        {/* Card 1: Syllabus Topics Completed */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-title">Course Topics Completed</span>
            <div className="metric-icon-wrap">
              <IconProgress size={18} />
            </div>
          </div>
          <div className="metric-big-number">{overallTopicsPct}%</div>
          <div className="metric-subtext">
            {completedTopicsCount} of {totalTopicsCount} syllabus topics marked complete
          </div>
          <div className="metric-bar-wrap">
            <div className="metric-bar-fill" style={{ width: `${overallTopicsPct}%` }} />
          </div>
        </div>

        {/* Card 2: Python Academy Modules */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-title">Python Academy Modules</span>
            <div className="metric-icon-wrap">
              <IconAward size={18} />
            </div>
          </div>
          <div className="metric-big-number">
            {completedPythonCount} <span style={{ fontSize: '18px', color: 'var(--text-muted)' }}>/ {totalPythonModules}</span>
          </div>
          <div className="metric-subtext">
            {pythonPct}% of 15 computational modules completed
          </div>
          <div className="metric-bar-wrap">
            <div className="metric-bar-fill" style={{ width: `${pythonPct}%`, backgroundColor: 'var(--sage-600)' }} />
          </div>
        </div>

        {/* Card 3: Quiz Score Average */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-title">Average Quiz Score</span>
            <div className="metric-icon-wrap">
              <IconQuiz size={18} />
            </div>
          </div>
          <div className="metric-big-number">
            {quizzesTakenCount > 0 ? `${quizAvgPct}%` : '0%'}
          </div>
          <div className="metric-subtext">
            {quizzesTakenCount > 0
              ? `Based on ${quizzesTakenCount} practice quiz attempt(s)`
              : 'No quizzes taken yet'}
          </div>
          <div className="metric-bar-wrap">
            <div className="metric-bar-fill" style={{ width: `${quizAvgPct}%`, backgroundColor: '#D97706' }} />
          </div>
        </div>

        {/* Card 4: Study Time Logged */}
        <div className="metric-card">
          <div className="metric-card-top">
            <span className="metric-title">Focus Study Time Logged</span>
            <div className="metric-icon-wrap">
              <IconClock size={18} />
            </div>
          </div>
          <div className="metric-big-number">
            {totalStudyHours} <span style={{ fontSize: '18px', color: 'var(--text-muted)' }}>hrs</span>
          </div>
          <div className="metric-subtext">
            {studySessions.length} focus sessions logged via study timer
          </div>
          <div className="metric-bar-wrap">
            <div className="metric-bar-fill" style={{ width: `${Math.min(100, (parseFloat(totalStudyHours) / 20) * 100)}%`, backgroundColor: 'var(--forest-800)' }} />
          </div>
        </div>
      </div>

      {/* Mini Subject-by-Subject Progress Strip */}
      <div className="analytics-card" style={{ padding: '18px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--forest-950)' }}>
            Subject-Wise Progress (Semester 1):
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Assignments: {submittedAssignmentsCount}/{totalAssignmentsCount} submitted ({assignmentPct}%)
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          {subjectProgressList.map((sub) => (
            <div key={sub.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ fontWeight: 600, color: 'var(--forest-900)' }}>{sub.name}</span>
                <span style={{ color: 'var(--text-muted)' }}>{sub.completed}/{sub.total} ({sub.percentage}%)</span>
              </div>
              <div className="progress-track" style={{ height: '5px' }}>
                <div className="progress-fill" style={{ width: `${sub.percentage}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
