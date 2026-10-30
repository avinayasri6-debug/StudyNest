import React, { useState, useMemo } from 'react';
import { SEMESTER_1_SUBJECTS, getAllSubjectTopics } from '../data/subjectsData';
import { PYTHON_MODULES } from '../data/pythonCurriculum';
import { PRACTICE_EXERCISES } from '../data/practiceExercises';
import { VIDEO_LESSONS } from '../data/videosData';
import { getPythonPracticeProgress } from '../services/storage';
import {
  IconProgress,
  IconClock,
  IconQuiz,
  IconCheckCircle,
  IconReset,
  IconPython,
  IconVideo,
  IconAward,
  IconStar,
  IconCheckSquare,
  IconSparkles,
  IconBook,
  IconCalendar,
  IconFlame,
  IconFileText,
  IconCopy,
  IconTrendingUp,
  IconAlertTriangle,
  IconChevronRight,
  IconPlay,
  IconLock
} from '../components/Icons';
import './ProgressView.css';

// Pure module-level helpers for dates and times
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

function getPast30DaysTimestamp() {
  const now = new Date();
  return now.getTime() - 30 * 24 * 60 * 60 * 1000;
}

function getWeekDateList() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const dates = [];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  for (let i = 0; i < 7; i++) {
    const cur = new Date(monday);
    cur.setDate(monday.getDate() + i);
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, '0');
    const d = String(cur.getDate()).padStart(2, '0');
    const iso = `${y}-${m}-${d}`;
    const displayDate = cur.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    dates.push({
      iso,
      dayName: dayNames[i],
      displayDate,
      timestamp: cur.getTime()
    });
  }
  return dates;
}

export default function ProgressView({
  profile = {},
  completedTopics = {},
  completedModuleIds = [],
  quizHistory = [],
  mockTestResults = [],
  assignments = [],
  tasks = [],
  notes = [],
  studySessions = [],
  completedVideoIds = [],
  upcomingExams = [],
  studyStreakDays = 0,
  onNavigate,
  onSelectSubject,
  onResetAllData,
  onShowToast
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Cached dates for pure rendering
  const todayIso = useMemo(() => getTodayIso(), []);
  const mondayTime = useMemo(() => getMondayTimestamp(), []);
  const thirtyDaysAgoTime = useMemo(() => getPast30DaysTimestamp(), []);
  const weekDates = useMemo(() => getWeekDateList(), []);

  // 1. Subject Topics Calculation
  const subjectRows = useMemo(() => {
    return SEMESTER_1_SUBJECTS.map((sub) => {
      const topics = getAllSubjectTopics(sub);
      const total = topics.length;
      const completedList = completedTopics[sub.id] || [];
      const completed = completedList.length;
      const remaining = Math.max(0, total - completed);
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

      // Subject study minutes
      const subStudyMinutes = studySessions
        .filter((s) => {
          if (!s.subject) return false;
          const subLower = s.subject.toLowerCase();
          return (
            subLower.includes(sub.code.toLowerCase()) ||
            subLower.includes(sub.id.toLowerCase()) ||
            subLower.includes(sub.title.toLowerCase())
          );
        })
        .reduce((acc, s) => acc + (s.minutes || 0), 0);

      const subStudyHours = (subStudyMinutes / 60).toFixed(1);

      // Subject test attempts (quizzes + mock tests)
      const subQuizzes = quizHistory.filter(
        (q) => q.subjectId === sub.id || q.subjectCode === sub.code
      );
      const subMockTests = mockTestResults.filter(
        (m) =>
          m.subjectCode === sub.code ||
          (m.subjectTitle && m.subjectTitle.toLowerCase().includes(sub.title.toLowerCase()))
      );

      const totalAttempts = subQuizzes.length + subMockTests.length;
      const allSubScores = [
        ...subQuizzes.map((q) => q.percentage),
        ...subMockTests.map((m) => m.percentage)
      ];

      const avgScore =
        totalAttempts > 0
          ? Math.round(allSubScores.reduce((a, b) => a + b, 0) / totalAttempts)
          : null;
      const highestScore = totalAttempts > 0 ? Math.max(...allSubScores) : null;

      // Assignments for subject
      const subAssignments = assignments.filter(
        (a) => a.subjectId === sub.id || a.subjectCode === sub.code
      );
      const subAssignmentsSubmitted = subAssignments.filter((a) => a.status === 'Submitted').length;

      return {
        ...sub,
        totalTopics: total,
        completedTopics: completed,
        remainingTopics: remaining,
        pct,
        studyMinutes: subStudyMinutes,
        studyHours: subStudyHours,
        totalAttempts,
        avgScore,
        highestScore,
        subAssignmentsTotal: subAssignments.length,
        subAssignmentsSubmitted
      };
    });
  }, [completedTopics, studySessions, quizHistory, mockTestResults, assignments]);

  // Overall Topic Numbers
  const totalAllTopics = useMemo(() => subjectRows.reduce((acc, s) => acc + s.totalTopics, 0), [subjectRows]);
  const totalCompletedTopics = useMemo(() => subjectRows.reduce((acc, s) => acc + s.completedTopics, 0), [subjectRows]);
  const totalRemainingTopics = useMemo(() => Math.max(0, totalAllTopics - totalCompletedTopics), [totalAllTopics, totalCompletedTopics]);
  const overallTopicPct = useMemo(() => (totalAllTopics > 0 ? Math.round((totalCompletedTopics / totalAllTopics) * 100) : 0), [totalAllTopics, totalCompletedTopics]);

  // 2. Python Lessons & Practice Lab
  const totalPython = PYTHON_MODULES.length; // 15
  const completedPython = completedModuleIds.length;
  const pythonLessonPct = Math.round((completedPython / totalPython) * 100);

  const practiceMap = useMemo(() => getPythonPracticeProgress(), []);
  const totalExercises = PRACTICE_EXERCISES.length; // 20
  const solvedExercises = useMemo(() => Object.values(practiceMap).filter((p) => p?.solved).length, [practiceMap]);
  const practicePct = Math.round((solvedExercises / totalExercises) * 100);

  // 3. Overall Learning Progress Composite
  const totalCurriculumUnits = totalAllTopics + totalPython;
  const totalCompletedUnits = totalCompletedTopics + completedPython;
  const totalCompositeProgress = totalCurriculumUnits > 0 ? Math.round((totalCompletedUnits / totalCurriculumUnits) * 100) : 0;

  // 4. Video Learning Hub
  const totalVideos = VIDEO_LESSONS.length; // 26
  const completedVideosCount = completedVideoIds.length;
  const videoPct = totalVideos > 0 ? Math.round((completedVideosCount / totalVideos) * 100) : 0;

  // 5. Tasks and Assignments Metrics
  const totalTasks = tasks.length;
  const completedTasks = useMemo(() => tasks.filter((t) => t.completed).length, [tasks]);
  const taskPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const totalAssignments = assignments.length;
  const submittedAssignments = useMemo(() => assignments.filter((a) => a.status === 'Submitted').length, [assignments]);
  const assignmentPct = totalAssignments > 0 ? Math.round((submittedAssignments / totalAssignments) * 100) : 0;

  // 6. Study Time Metrics
  const totalStudyMinutes = useMemo(() => studySessions.reduce((acc, s) => acc + (s.minutes || 0), 0), [studySessions]);
  const totalStudyHours = (totalStudyMinutes / 60).toFixed(1);

  // Daily study hours
  const todayMinutes = useMemo(() => {
    return studySessions
      .filter((s) => s.date === todayIso)
      .reduce((acc, s) => acc + (s.minutes || 0), 0);
  }, [studySessions, todayIso]);
  const todayStudyHours = (todayMinutes / 60).toFixed(1);
  const dailyTargetHours = profile?.studyGoals?.dailyTargetHours || 3.5;
  const dailyGoalPct = Math.min(100, Math.round((parseFloat(todayStudyHours) / dailyTargetHours) * 100));

  // Weekly study hours
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
  const weeklyTargetHours = profile?.studyGoals?.weeklyHoursTarget || 20.0;
  const weeklyGoalPct = Math.min(100, Math.round((parseFloat(weekStudyHours) / weeklyTargetHours) * 100));

  // Monthly study hours (past 30 days)
  const monthMinutes = useMemo(() => {
    return studySessions
      .filter((s) => {
        if (!s.date) return false;
        const [y, m, d] = s.date.split('-').map(Number);
        const sessionTime = new Date(y, m - 1, d).getTime();
        return sessionTime >= thirtyDaysAgoTime;
      })
      .reduce((acc, s) => acc + (s.minutes || 0), 0);
  }, [studySessions, thirtyDaysAgoTime]);
  const monthStudyHours = (monthMinutes / 60).toFixed(1);

  // 7. Mock Test & Quiz Unified Analytics
  const allTestAttempts = useMemo(() => {
    const list = [];
    quizHistory.forEach((q) => {
      list.push({
        id: q.id,
        title: q.subjectTitle || q.subjectCode,
        subjectCode: q.subjectCode || 'QUIZ',
        score: q.score,
        total: q.total,
        percentage: q.percentage,
        date: q.date,
        timestamp: q.timestamp || 0,
        type: 'Practice Quiz'
      });
    });
    mockTestResults.forEach((m) => {
      list.push({
        id: m.id,
        title: m.testTitle || m.subjectTitle,
        subjectCode: m.subjectCode || 'MOCK',
        score: m.score,
        total: m.totalQuestions,
        percentage: m.percentage,
        date: m.date,
        timestamp: m.timestamp || 0,
        timeSpentSeconds: m.timeSpentSeconds,
        type: 'Mock Test'
      });
    });
    return list.sort((a, b) => b.timestamp - a.timestamp);
  }, [quizHistory, mockTestResults]);

  const totalTestsAttempted = allTestAttempts.length;
  const averageTestScore = useMemo(() => {
    if (totalTestsAttempted === 0) return 0;
    const sum = allTestAttempts.reduce((acc, t) => acc + t.percentage, 0);
    return Math.round(sum / totalTestsAttempted);
  }, [allTestAttempts, totalTestsAttempted]);

  const highestTestScore = useMemo(() => {
    if (totalTestsAttempted === 0) return 0;
    return Math.max(...allTestAttempts.map((t) => t.percentage));
  }, [allTestAttempts, totalTestsAttempted]);

  // Chronological score trend (oldest to newest)
  const chronologicalAttempts = useMemo(() => {
    return [...allTestAttempts].sort((a, b) => a.timestamp - b.timestamp);
  }, [allTestAttempts]);

  // 8. Weak Topic Identification
  const weakTopics = useMemo(() => {
    const topicStats = {};

    // Analyze questionResults from mock tests
    mockTestResults.forEach((test) => {
      if (Array.isArray(test.questionResults)) {
        test.questionResults.forEach((q) => {
          const topicName = q.topic || 'General Concepts';
          const subCode = q.subjectCode || test.subjectCode || 'Engineering';
          const key = `${subCode}::${topicName}`;

          if (!topicStats[key]) {
            topicStats[key] = {
              subjectCode: subCode,
              topic: topicName,
              unit: q.unit || 'Unit 1',
              totalAsked: 0,
              correctCount: 0,
              incorrectCount: 0
            };
          }

          topicStats[key].totalAsked += 1;
          if (q.isCorrect) {
            topicStats[key].correctCount += 1;
          } else {
            topicStats[key].incorrectCount += 1;
          }
        });
      }
    });

    const identified = [];
    Object.values(topicStats).forEach((item) => {
      const accuracy = Math.round((item.correctCount / item.totalAsked) * 100);
      if (accuracy < 65 || item.incorrectCount >= 2) {
        // Find matching subject
        const matchingSub = SEMESTER_1_SUBJECTS.find(
          (s) => s.code === item.subjectCode || item.subjectCode.includes(s.code)
        );

        identified.push({
          ...item,
          accuracy,
          subjectTitle: matchingSub ? matchingSub.title : item.subjectCode,
          subjectId: matchingSub ? matchingSub.id : 'math101'
        });
      }
    });

    // If no topic-level mock questions yet, check quizzes with low score (<65%)
    if (identified.length === 0) {
      quizHistory.forEach((q) => {
        if (q.percentage < 65) {
          const matchingSub = SEMESTER_1_SUBJECTS.find((s) => s.id === q.subjectId || s.code === q.subjectCode);
          identified.push({
            subjectCode: q.subjectCode,
            topic: `Unit Foundations (${q.subjectTitle || q.subjectCode})`,
            unit: 'Quiz Review',
            totalAsked: q.total,
            correctCount: q.score,
            incorrectCount: q.total - q.score,
            accuracy: q.percentage,
            subjectTitle: matchingSub ? matchingSub.title : q.subjectCode,
            subjectId: matchingSub ? matchingSub.id : 'math101'
          });
        }
      });
    }

    return identified.sort((a, b) => a.accuracy - b.accuracy);
  }, [mockTestResults, quizHistory]);

  // 9. Achievements & Milestones (Strictly Actual Data)
  const achievements = useMemo(() => {
    const list = [
      {
        id: 'first_test',
        title: 'First Test Conquered',
        desc: 'Complete your first mock test or practice quiz.',
        icon: IconAward,
        current: totalTestsAttempted,
        target: 1,
        unit: 'test',
        unlocked: totalTestsAttempted >= 1
      },
      {
        id: 'topics_10',
        title: 'Foundation Builder',
        desc: 'Master and check off 10 syllabus topics.',
        icon: IconCheckCircle,
        current: totalCompletedTopics,
        target: 10,
        unit: 'topics',
        unlocked: totalCompletedTopics >= 10
      },
      {
        id: 'streak_7',
        title: 'Seven-Day Discipline',
        desc: 'Maintain a 7-day active study streak.',
        icon: IconFlame,
        current: studyStreakDays,
        target: 7,
        unit: 'days',
        unlocked: studyStreakDays >= 7
      },
      {
        id: 'study_10h',
        title: 'Deep Focus Centurion',
        desc: 'Log 10 hours of focused study through the timer.',
        icon: IconClock,
        current: parseFloat(totalStudyHours),
        target: 10.0,
        unit: 'hrs',
        unlocked: parseFloat(totalStudyHours) >= 10.0
      },
      {
        id: 'subject_mastery',
        title: 'Subject Mastery',
        desc: 'Complete 100% of all topics in any Semester 1 course.',
        icon: IconStar,
        current: subjectRows.filter((s) => s.pct === 100).length,
        target: 1,
        unit: 'course',
        unlocked: subjectRows.some((s) => s.pct === 100)
      },
      {
        id: 'python_pioneer',
        title: 'Python Lab Pioneer',
        desc: 'Successfully solve 5 coding exercises in the Python Practice Lab.',
        icon: IconPython,
        current: solvedExercises,
        target: 5,
        unit: 'problems',
        unlocked: solvedExercises >= 5
      },
      {
        id: 'digital_scholar',
        title: 'Smart Notebook Author',
        desc: 'Create at least 3 smart revision notes.',
        icon: IconFileText,
        current: notes.length,
        target: 3,
        unit: 'notes',
        unlocked: notes.length >= 3
      },
      {
        id: 'video_scholar',
        title: 'Video Learning Connoisseur',
        desc: 'Watch and complete 5 curated engineering video lectures.',
        icon: IconVideo,
        current: completedVideosCount,
        target: 5,
        unit: 'lectures',
        unlocked: completedVideosCount >= 5
      }
    ];
    return list;
  }, [
    totalTestsAttempted,
    totalCompletedTopics,
    studyStreakDays,
    totalStudyHours,
    subjectRows,
    solvedExercises,
    notes.length,
    completedVideosCount
  ]);

  const unlockedMilestonesCount = achievements.filter((a) => a.unlocked).length;

  // 10. Weekly Report Calculations & Suggested Priorities
  const weeklyReport = useMemo(() => {
    // Current week tests
    const thisWeekTests = allTestAttempts.filter((t) => t.timestamp >= mondayTime);
    const weeklyTestAvg =
      thisWeekTests.length > 0
        ? Math.round(thisWeekTests.reduce((acc, t) => acc + t.percentage, 0) / thisWeekTests.length)
        : null;

    // Priorities Heuristic:
    const priorities = [];

    // Priority 1: Lowest completion subject
    const sortedSubjects = [...subjectRows].sort((a, b) => a.pct - b.pct);
    if (sortedSubjects.length > 0 && sortedSubjects[0].pct < 100) {
      priorities.push({
        id: 'p-sub',
        level: 'high',
        title: `Catch up on ${sortedSubjects[0].title}`,
        desc: `Lowest curriculum progress at ${sortedSubjects[0].pct}% (${sortedSubjects[0].completedTopics}/${sortedSubjects[0].totalTopics} topics completed).`,
        actionLabel: 'Open Syllabus',
        actionView: 'subjects'
      });
    }

    // Priority 2: Imminent Exam
    const nextExam = upcomingExams && upcomingExams.length > 0 ? upcomingExams[0] : null;
    if (nextExam) {
      priorities.push({
        id: 'p-exam',
        level: 'high',
        title: `Revise for ${nextExam.subjectCode} (${nextExam.examType})`,
        desc: `Scheduled on ${nextExam.date} at ${nextExam.time || 'TBD'}. Target: ${nextExam.targetScore || '90%'}.`,
        actionLabel: 'Exam Centre',
        actionView: 'exam-prep'
      });
    }

    // Priority 3: Pending assignment
    const pendingAssignment = assignments.find((a) => a.status !== 'Submitted');
    if (pendingAssignment) {
      priorities.push({
        id: 'p-assign',
        level: 'medium',
        title: `Submit: ${pendingAssignment.title}`,
        desc: `${pendingAssignment.subjectCode} · Due ${pendingAssignment.dueDate || 'Soon'}.`,
        actionLabel: 'Study Planner',
        actionView: 'planner'
      });
    }

    // Priority 4: Weak topic or Python lab
    if (weakTopics.length > 0) {
      priorities.push({
        id: 'p-weak',
        level: 'medium',
        title: `Diagnostic Revision: ${weakTopics[0].topic}`,
        desc: `${weakTopics[0].subjectCode} accuracy was ${weakTopics[0].accuracy}%. Review core formulas before next mock.`,
        actionLabel: 'Review Topic',
        actionView: 'exam-prep'
      });
    } else {
      priorities.push({
        id: 'p-python',
        level: 'low',
        title: 'Solve Next Python Practice Challenge',
        desc: `${solvedExercises} of ${totalExercises} solved in Practice Lab. Keep coding daily to maintain programming fluency.`,
        actionLabel: 'Python Lab',
        actionView: 'python'
      });
    }

    return {
      weekDateSpan: `${weekDates[0]?.displayDate} – ${weekDates[6]?.displayDate}`,
      studyHours: weekStudyHours,
      testsAttempted: thisWeekTests.length,
      testAvg: weeklyTestAvg,
      completedTasksCount: completedTasks,
      submittedAssignmentsCount: submittedAssignments,
      priorities
    };
  }, [
    allTestAttempts,
    mondayTime,
    subjectRows,
    upcomingExams,
    assignments,
    weakTopics,
    solvedExercises,
    totalExercises,
    weekDates,
    weekStudyHours,
    completedTasks,
    submittedAssignments
  ]);

  const handleCopyWeeklyReport = () => {
    const reportText = `STUDYNEST WEEKLY ACADEMIC REPORT (${weeklyReport.weekDateSpan})
--------------------------------------------------
* Study Time Logged: ${weeklyReport.studyHours} hrs (Weekly Target: ${weeklyTargetHours} hrs)
* Overall Syllabus Progress: ${overallTopicPct}% (${totalCompletedTopics}/${totalAllTopics} topics)
* Practice Tests Taken This Week: ${weeklyReport.testsAttempted} (Avg Score: ${weeklyReport.testAvg !== null ? `${weeklyReport.testAvg}%` : 'N/A'})
* Tasks & Assignments Completed: ${weeklyReport.completedTasksCount} tasks, ${weeklyReport.submittedAssignmentsCount} assignments
* Unlocked Milestones: ${unlockedMilestonesCount} of ${achievements.length}

SUGGESTED PRIORITIES FOR NEXT WEEK:
${weeklyReport.priorities.map((p, i) => `${i + 1}. [${p.level.toUpperCase()}] ${p.title} - ${p.desc}`).join('\n')}
--------------------------------------------------
Generated from verified student records in StudyNest.`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(reportText);
      onShowToast?.('📋 Weekly academic report copied to clipboard!');
    } else {
      onShowToast?.('Clipboard access unavailable.');
    }
  };

  const handleConfirmReset = () => {
    onResetAllData?.();
    setShowResetConfirm(false);
    onShowToast?.('All student data reset to initial zero-progress state.');
  };

  // Helper for 7-day bar chart calculation
  const dailyBarData = useMemo(() => {
    return weekDates.map((day) => {
      const dayMins = studySessions
        .filter((s) => s.date === day.iso)
        .reduce((acc, s) => acc + (s.minutes || 0), 0);
      const hours = (dayMins / 60).toFixed(1);
      return {
        ...day,
        minutes: dayMins,
        hours: parseFloat(hours),
        isToday: day.iso === todayIso
      };
    });
  }, [weekDates, studySessions, todayIso]);

  const maxChartHours = useMemo(() => {
    const maxVal = Math.max(...dailyBarData.map((d) => d.hours), dailyTargetHours);
    return Math.max(4.0, Math.ceil(maxVal));
  }, [dailyBarData, dailyTargetHours]);

  return (
    <div className="progress-analytics-view">
      {/* Header Banner */}
      <div className="progress-header-row">
        <div>
          <div className="progress-header-badge">
            <IconProgress size={14} />
            <span>Verified Student Analytics · Semester 1</span>
          </div>
          <h1 className="progress-header-title">Progress Analytics & Mastery</h1>
          <p className="progress-header-sub">
            Comprehensive diagnostic performance analytics calculated strictly from verified course topics,
            timer sessions, mock tests, and digital notes.
          </p>
        </div>

        <div className="progress-header-actions">
          <button
            type="button"
            className="sem2-action-btn"
            style={{ borderColor: '#FCA5A5', color: '#991B1B', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            onClick={() => setShowResetConfirm(true)}
          >
            <IconReset size={14} />
            <span>Reset Academic Data</span>
          </button>
        </div>
      </div>

      {/* Confirmation Reset Modal */}
      {showResetConfirm && (
        <div className="modal-overlay" onClick={() => setShowResetConfirm(false)} role="dialog">
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#991B1B', marginBottom: '8px' }}>
              Confirm Academic Data Reset
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-body)', lineHeight: 1.5, marginBottom: '20px' }}>
              Are you sure you want to reset all academic progress? This will reset all topic checkboxes,
              study timer logs, mock test scores, notes, and quiz records to zero.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="sem2-action-btn"
                onClick={() => setShowResetConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="add-task-btn"
                style={{ backgroundColor: '#DC2626' }}
                onClick={handleConfirmReset}
              >
                Yes, Reset All Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="progress-tab-nav">
        <button
          type="button"
          className={`progress-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <IconProgress size={15} />
          <span>Overall Performance</span>
          <span className="progress-tab-badge">{totalCompositeProgress}%</span>
        </button>

        <button
          type="button"
          className={`progress-tab-btn ${activeTab === 'subjects' ? 'active' : ''}`}
          onClick={() => setActiveTab('subjects')}
        >
          <IconBook size={15} />
          <span>Subject Analytics</span>
          <span className="progress-tab-badge">7 Courses</span>
        </button>

        <button
          type="button"
          className={`progress-tab-btn ${activeTab === 'tests' ? 'active' : ''}`}
          onClick={() => setActiveTab('tests')}
        >
          <IconQuiz size={15} />
          <span>Mock Tests & Quizzes</span>
          <span className="progress-tab-badge">{totalTestsAttempted}</span>
        </button>

        <button
          type="button"
          className={`progress-tab-btn ${activeTab === 'time' ? 'active' : ''}`}
          onClick={() => setActiveTab('time')}
        >
          <IconClock size={15} />
          <span>Study Time & Goals</span>
          <span className="progress-tab-badge">{totalStudyHours}h</span>
        </button>

        <button
          type="button"
          className={`progress-tab-btn ${activeTab === 'weak-topics' ? 'active' : ''}`}
          onClick={() => setActiveTab('weak-topics')}
        >
          <IconAlertTriangle size={15} />
          <span>Weak Topics Diagnostic</span>
          {weakTopics.length > 0 && <span className="progress-tab-badge" style={{ backgroundColor: '#EF4444' }}>{weakTopics.length}</span>}
        </button>

        <button
          type="button"
          className={`progress-tab-btn ${activeTab === 'achievements' ? 'active' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          <IconAward size={15} />
          <span>Milestones</span>
          <span className="progress-tab-badge">{unlockedMilestonesCount}/{achievements.length}</span>
        </button>

        <button
          type="button"
          className={`progress-tab-btn ${activeTab === 'weekly-report' ? 'active' : ''}`}
          onClick={() => setActiveTab('weekly-report')}
        >
          <IconCalendar size={15} />
          <span>Weekly Report</span>
        </button>
      </div>

      {/* ============================================================
          TAB 1: OVERALL PERFORMANCE & KPI SUMMARY
          ============================================================ */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Primary 6 KPI Cards */}
          <div className="progress-kpi-grid">
            {/* Total Learning Progress */}
            <div className="progress-kpi-card">
              <div className="progress-kpi-top">
                <span className="progress-kpi-label">Overall Progress</span>
                <div className="progress-kpi-icon">
                  <IconProgress size={18} />
                </div>
              </div>
              <div className="progress-kpi-val">{totalCompositeProgress}%</div>
              <div className="progress-kpi-sub">
                {totalCompletedUnits} of {totalCurriculumUnits} syllabus topics & Python lessons completed
              </div>
              <div className="progress-kpi-bar">
                <div className="progress-kpi-fill" style={{ width: `${totalCompositeProgress}%` }} />
              </div>
            </div>

            {/* Syllabus Topics */}
            <div className="progress-kpi-card">
              <div className="progress-kpi-top">
                <span className="progress-kpi-label">Syllabus Topics</span>
                <div className="progress-kpi-icon">
                  <IconBook size={18} />
                </div>
              </div>
              <div className="progress-kpi-val">
                {totalCompletedTopics} <span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>/ {totalAllTopics}</span>
              </div>
              <div className="progress-kpi-sub">
                {totalRemainingTopics} topics remaining across 7 engineering subjects
              </div>
              <div className="progress-kpi-bar">
                <div className="progress-kpi-fill" style={{ width: `${overallTopicPct}%`, backgroundColor: 'var(--forest-800)' }} />
              </div>
            </div>

            {/* Total Study Hours */}
            <div className="progress-kpi-card">
              <div className="progress-kpi-top">
                <span className="progress-kpi-label">Logged Study Time</span>
                <div className="progress-kpi-icon">
                  <IconClock size={18} />
                </div>
              </div>
              <div className="progress-kpi-val">
                {totalStudyHours} <span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>hrs</span>
              </div>
              <div className="progress-kpi-sub">
                {studySessions.length} focus sessions logged ({totalStudyMinutes} total minutes)
              </div>
              <div className="progress-kpi-bar">
                <div className="progress-kpi-fill" style={{ width: `${Math.min(100, (parseFloat(totalStudyHours) / 20) * 100)}%`, backgroundColor: '#0D9488' }} />
              </div>
            </div>

            {/* Mock Tests & Quizzes */}
            <div className="progress-kpi-card">
              <div className="progress-kpi-top">
                <span className="progress-kpi-label">Tests Attempted</span>
                <div className="progress-kpi-icon">
                  <IconQuiz size={18} />
                </div>
              </div>
              <div className="progress-kpi-val">
                {totalTestsAttempted} <span style={{ fontSize: '15px', color: 'var(--text-muted)' }}>({averageTestScore}% avg)</span>
              </div>
              <div className="progress-kpi-sub">
                {mockTestResults.length} full mock tests & {quizHistory.length} unit quizzes taken
              </div>
              <div className="progress-kpi-bar">
                <div className="progress-kpi-fill" style={{ width: `${averageTestScore}%`, backgroundColor: '#D97706' }} />
              </div>
            </div>

            {/* Assignments & Tasks */}
            <div className="progress-kpi-card">
              <div className="progress-kpi-top">
                <span className="progress-kpi-label">Tasks & Submissions</span>
                <div className="progress-kpi-icon">
                  <IconCheckSquare size={18} />
                </div>
              </div>
              <div className="progress-kpi-val">
                {submittedAssignments}/{totalAssignments} <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Assignments</span>
              </div>
              <div className="progress-kpi-sub">
                {completedTasks}/{totalTasks} personal tasks completed ({taskPct}%)
              </div>
              <div className="progress-kpi-bar">
                <div className="progress-kpi-fill" style={{ width: `${assignmentPct}%`, backgroundColor: 'var(--forest-900)' }} />
              </div>
            </div>

            {/* Python Practice Lab */}
            <div className="progress-kpi-card">
              <div className="progress-kpi-top">
                <span className="progress-kpi-label">Python Academy & Lab</span>
                <div className="progress-kpi-icon">
                  <IconPython size={18} />
                </div>
              </div>
              <div className="progress-kpi-val">
                {solvedExercises} <span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>/ {totalExercises} Solved</span>
              </div>
              <div className="progress-kpi-sub">
                {completedPython}/{totalPython} interactive theory lessons completed ({pythonLessonPct}%)
              </div>
              <div className="progress-kpi-bar">
                <div className="progress-kpi-fill" style={{ width: `${practicePct}%`, backgroundColor: 'var(--sage-600)' }} />
              </div>
            </div>

            {/* Video Learning Hub */}
            <div className="progress-kpi-card">
              <div className="progress-kpi-top">
                <span className="progress-kpi-label">Video Learning Hub</span>
                <div className="progress-kpi-icon">
                  <IconVideo size={18} />
                </div>
              </div>
              <div className="progress-kpi-val">
                {completedVideosCount} <span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>/ {totalVideos} Watched</span>
              </div>
              <div className="progress-kpi-sub">
                {videoPct}% of 26 curated syllabus lectures completed
              </div>
              <div className="progress-kpi-bar">
                <div className="progress-kpi-fill" style={{ width: `${videoPct}%`, backgroundColor: '#0D9488' }} />
              </div>
            </div>
          </div>

          {/* Quick Dual Charts Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
            {/* Chart 1: Weekly Study Hours Bar Chart */}
            <div className="analytics-chart-box">
              <div className="analytics-chart-header">
                <div>
                  <h3 className="analytics-chart-title">Weekly Study Hours (Monday – Sunday)</h3>
                  <div className="analytics-chart-sub">Daily logged focus minutes compared against your {dailyTargetHours}h target guideline</div>
                </div>
                <button
                  type="button"
                  className="weak-action-btn"
                  onClick={() => setActiveTab('time')}
                >
                  <span>Details</span>
                  <IconChevronRight size={13} />
                </button>
              </div>

              {/* Responsive SVG Bar Chart */}
              <div className="svg-chart-container">
                <svg viewBox="0 0 540 180" style={{ width: '100%', height: '180px' }}>
                  {/* Grid Lines */}
                  <line x1="40" y1="20" x2="520" y2="20" stroke="#E2E8F0" strokeDasharray="3 3" />
                  <line x1="40" y1="70" x2="520" y2="70" stroke="#E2E8F0" strokeDasharray="3 3" />
                  <line x1="40" y1="120" x2="520" y2="120" stroke="#E2E8F0" strokeDasharray="3 3" />
                  <line x1="40" y1="150" x2="520" y2="150" stroke="#94A3B8" strokeWidth="1.5" />

                  {/* Y-axis Labels */}
                  <text x="32" y="24" fontSize="10" textAnchor="end" fill="#64748B">{maxChartHours}h</text>
                  <text x="32" y="74" fontSize="10" textAnchor="end" fill="#64748B">{(maxChartHours / 2).toFixed(1)}h</text>
                  <text x="32" y="124" fontSize="10" textAnchor="end" fill="#64748B">{(maxChartHours / 4).toFixed(1)}h</text>
                  <text x="32" y="154" fontSize="10" textAnchor="end" fill="#64748B">0h</text>

                  {/* Daily Target Line */}
                  {(() => {
                    const targetY = 150 - (dailyTargetHours / maxChartHours) * 130;
                    return (
                      <>
                        <line x1="40" y1={targetY} x2="520" y2={targetY} stroke="#10B981" strokeWidth="1.5" strokeDasharray="4 4" />
                        <text x="515" y={targetY - 4} fontSize="9.5" textAnchor="end" fill="#047857" fontWeight="700">
                          Target: {dailyTargetHours}h
                        </text>
                      </>
                    );
                  })()}

                  {/* 7 Bars */}
                  {dailyBarData.map((d, idx) => {
                    const colWidth = 48;
                    const colX = 55 + idx * 65;
                    const barHeight = Math.min(130, Math.round((d.hours / maxChartHours) * 130));
                    const barY = 150 - barHeight;

                    return (
                      <g key={d.iso}>
                        {/* Bar */}
                        <rect
                          x={colX}
                          y={barY}
                          width={colWidth}
                          height={Math.max(2, barHeight)}
                          rx="4"
                          fill={d.isToday ? '#1C3829' : d.hours > 0 ? '#4D7C5D' : '#E2E8F0'}
                        />
                        {/* Value Text */}
                        {d.hours > 0 && (
                          <text
                            x={colX + colWidth / 2}
                            y={barY - 4}
                            fontSize="10"
                            fontWeight="700"
                            textAnchor="middle"
                            fill="#1C3829"
                          >
                            {d.hours}h
                          </text>
                        )}
                        {/* Day Label */}
                        <text
                          x={colX + colWidth / 2}
                          y="166"
                          fontSize="11"
                          fontWeight={d.isToday ? '800' : '600'}
                          textAnchor="middle"
                          fill={d.isToday ? '#1C3829' : '#64748B'}
                        >
                          {d.dayName}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Chart 2: Subject-Wise Progress Comparison Chart */}
            <div className="analytics-chart-box">
              <div className="analytics-chart-header">
                <div>
                  <h3 className="analytics-chart-title">Subject-Wise Syllabus Completion</h3>
                  <div className="analytics-chart-sub">Curriculum coverage ranking across all 7 Semester 1 courses</div>
                </div>
                <button
                  type="button"
                  className="weak-action-btn"
                  onClick={() => setActiveTab('subjects')}
                >
                  <span>All Curricula</span>
                  <IconChevronRight size={13} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '11px', marginTop: '6px' }}>
                {subjectRows.map((sub) => (
                  <div key={sub.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                      <span style={{ fontWeight: 700, color: 'var(--forest-950)' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--forest-800)', marginRight: '6px' }}>{sub.code}</span>
                        {sub.title}
                      </span>
                      <span style={{ fontWeight: 700, color: 'var(--forest-900)' }}>
                        {sub.completedTopics}/{sub.totalTopics} ({sub.pct}%)
                      </span>
                    </div>
                    <div style={{ height: '6px', backgroundColor: 'var(--cream-200)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${sub.pct}%`,
                          backgroundColor: sub.pct === 100 ? '#16A34A' : sub.pct > 0 ? 'var(--forest-900)' : 'transparent',
                          borderRadius: '3px',
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Teaser Strip: Next Priority & Milestone Preview */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {/* Priority Snippet */}
            <div className="analytics-card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Top Priority For This Week
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--forest-950)', marginTop: '2px' }}>
                  {weeklyReport.priorities[0]?.title || 'Continue Regular Syllabus Study'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {weeklyReport.priorities[0]?.desc}
                </div>
              </div>
              <button
                type="button"
                className="add-task-btn"
                style={{ padding: '8px 14px', fontSize: '12px', flexShrink: 0 }}
                onClick={() => onNavigate?.(weeklyReport.priorities[0]?.actionView || 'planner')}
              >
                <span>{weeklyReport.priorities[0]?.actionLabel || 'Action'}</span>
                <IconChevronRight size={13} />
              </button>
            </div>

            {/* Next Milestone Preview */}
            <div className="analytics-card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Next Milestone In Reach
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--forest-950)', marginTop: '2px' }}>
                  {achievements.find((a) => !a.unlocked)?.title || 'All Milestones Achieved! 🎉'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {achievements.find((a) => !a.unlocked)
                    ? `${achievements.find((a) => !a.unlocked).current} / ${achievements.find((a) => !a.unlocked).target} ${achievements.find((a) => !a.unlocked).unit}`
                    : 'Congratulations! You have unlocked all verified engineering milestones.'}
                </div>
              </div>
              <button
                type="button"
                className="weak-action-btn"
                onClick={() => setActiveTab('achievements')}
              >
                <span>Milestones ({unlockedMilestonesCount}/{achievements.length})</span>
                <IconChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 2: SUBJECT-WISE ANALYTICS MATRIX
          ============================================================ */}
      {activeTab === 'subjects' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="analytics-card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--forest-950)', margin: 0 }}>
                Subject Performance Matrix (7 Confirmed Courses)
              </h2>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Accurate breakdown of topics completed, remaining backlog, study hours logged, and test performance.
              </div>
            </div>
            <button
              type="button"
              className="add-task-btn"
              onClick={() => onNavigate?.('subjects')}
              style={{ fontSize: '12.5px', padding: '8px 14px' }}
            >
              <IconBook size={14} />
              <span>Explore Curricula</span>
            </button>
          </div>

          <div className="subject-matrix-grid">
            {subjectRows.map((sub) => (
              <div key={sub.id} className="subject-analytic-card">
                <div>
                  <div className="subject-analytic-top">
                    <span className="subject-code-tag">{sub.code}</span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '12px',
                        backgroundColor: sub.pct === 100 ? '#DCFCE7' : sub.pct > 0 ? 'var(--sage-100)' : 'var(--cream-200)',
                        color: sub.pct === 100 ? '#166534' : sub.pct > 0 ? 'var(--forest-900)' : 'var(--text-muted)'
                      }}
                    >
                      {sub.pct === 100 ? 'Completed' : sub.pct > 0 ? 'In Progress' : 'Not Started'}
                    </span>
                  </div>

                  <h3 className="subject-analytic-title">{sub.title}</h3>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    {sub.category} · {sub.credits} Credits
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Syllabus Completion</span>
                      <span style={{ fontWeight: 700, color: 'var(--forest-950)' }}>{sub.pct}%</span>
                    </div>
                    <div style={{ height: '6px', backgroundColor: 'var(--cream-200)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${sub.pct}%`,
                          backgroundColor: sub.pct === 100 ? '#16A34A' : 'var(--forest-900)',
                          borderRadius: '3px'
                        }}
                      />
                    </div>
                  </div>

                  {/* 4 Quantitative Metrics */}
                  <div className="subject-analytic-metrics">
                    <div className="subject-metric-item">
                      <span className="subject-metric-lbl">Topics Done / Left</span>
                      <span className="subject-metric-val">{sub.completedTopics} done · {sub.remainingTopics} left</span>
                    </div>
                    <div className="subject-metric-item">
                      <span className="subject-metric-lbl">Logged Study Time</span>
                      <span className="subject-metric-val">{sub.studyHours} hrs</span>
                    </div>
                    <div className="subject-metric-item">
                      <span className="subject-metric-lbl">Test Performance</span>
                      <span className="subject-metric-val">
                        {sub.totalAttempts > 0 ? `${sub.avgScore}% avg (${sub.totalAttempts} tests)` : 'No tests yet'}
                      </span>
                    </div>
                    <div className="subject-metric-item">
                      <span className="subject-metric-lbl">Assignments</span>
                      <span className="subject-metric-val">
                        {sub.subAssignmentsSubmitted} / {sub.subAssignmentsTotal} submitted
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                  <button
                    type="button"
                    className="weak-action-btn"
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => {
                      if (onSelectSubject) {
                        const original = SEMESTER_1_SUBJECTS.find((s) => s.id === sub.id);
                        onSelectSubject(original || sub);
                      } else {
                        onNavigate?.('subjects');
                      }
                    }}
                  >
                    <span>View Syllabus</span>
                    <IconChevronRight size={13} />
                  </button>
                  <button
                    type="button"
                    className="weak-action-btn"
                    onClick={() => onNavigate?.('exam-prep')}
                    title="Practice questions in Exam Centre"
                  >
                    <IconAward size={13} />
                    <span>Mock Test</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 3: MOCK TEST & QUIZ ANALYTICS
          ============================================================ */}
      {activeTab === 'tests' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Top Test Metric Cards */}
          <div className="progress-kpi-grid">
            <div className="progress-kpi-card">
              <div className="progress-kpi-top">
                <span className="progress-kpi-label">Total Tests Attempted</span>
                <div className="progress-kpi-icon">
                  <IconQuiz size={18} />
                </div>
              </div>
              <div className="progress-kpi-val">{totalTestsAttempted}</div>
              <div className="progress-kpi-sub">
                {mockTestResults.length} full mock tests & {quizHistory.length} unit quizzes
              </div>
            </div>

            <div className="progress-kpi-card">
              <div className="progress-kpi-top">
                <span className="progress-kpi-label">Average Test Score</span>
                <div className="progress-kpi-icon">
                  <IconTrendingUp size={18} />
                </div>
              </div>
              <div className="progress-kpi-val">
                {totalTestsAttempted > 0 ? `${averageTestScore}%` : '0%'}
              </div>
              <div className="progress-kpi-sub">
                {totalTestsAttempted > 0 ? 'Mean percentage across all submissions' : 'No tests recorded yet'}
              </div>
            </div>

            <div className="progress-kpi-card">
              <div className="progress-kpi-top">
                <span className="progress-kpi-label">Top Highest Score</span>
                <div className="progress-kpi-icon">
                  <IconStar size={18} />
                </div>
              </div>
              <div className="progress-kpi-val">
                {totalTestsAttempted > 0 ? `${highestTestScore}%` : '0%'}
              </div>
              <div className="progress-kpi-sub">
                Personal best score achieved in assessment
              </div>
            </div>
          </div>

          {/* Chronological Score Trend Chart */}
          <div className="analytics-chart-box">
            <div className="analytics-chart-header">
              <div>
                <h3 className="analytics-chart-title">Assessment Score Trajectory Over Time</h3>
                <div className="analytics-chart-sub">
                  Chronological score progression across your mock tests and quizzes
                </div>
              </div>
              {chronologicalAttempts.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--forest-900)', fontWeight: 700 }}>
                  <IconTrendingUp size={15} />
                  <span>Latest: {chronologicalAttempts[chronologicalAttempts.length - 1].percentage}%</span>
                </div>
              )}
            </div>

            {chronologicalAttempts.length >= 1 ? (
              <div className="svg-chart-container">
                <svg viewBox="0 0 540 180" style={{ width: '100%', height: '180px' }}>
                  {/* Grid Lines */}
                  <line x1="40" y1="20" x2="520" y2="20" stroke="#E2E8F0" strokeDasharray="3 3" />
                  <line x1="40" y1="55" x2="520" y2="55" stroke="#E2E8F0" strokeDasharray="3 3" />
                  <line x1="40" y1="90" x2="520" y2="90" stroke="#E2E8F0" strokeDasharray="3 3" />
                  <line x1="40" y1="125" x2="520" y2="125" stroke="#E2E8F0" strokeDasharray="3 3" />
                  <line x1="40" y1="150" x2="520" y2="150" stroke="#94A3B8" strokeWidth="1.5" />

                  {/* Y-axis Labels */}
                  <text x="32" y="24" fontSize="10" textAnchor="end" fill="#64748B">100%</text>
                  <text x="32" y="59" fontSize="10" textAnchor="end" fill="#64748B">75%</text>
                  <text x="32" y="94" fontSize="10" textAnchor="end" fill="#64748B">50%</text>
                  <text x="32" y="129" fontSize="10" textAnchor="end" fill="#64748B">25%</text>
                  <text x="32" y="154" fontSize="10" textAnchor="end" fill="#64748B">0%</text>

                  {/* 75% Benchmark Guideline */}
                  <line x1="40" y1="55" x2="520" y2="55" stroke="#10B981" strokeWidth="1" strokeDasharray="4 4" />
                  <text x="515" y="51" fontSize="9.5" textAnchor="end" fill="#047857" fontWeight="700">Benchmark: 75%</text>

                  {/* Polyline */}
                  {(() => {
                    const step = Math.max(40, (520 - 60) / Math.max(1, chronologicalAttempts.length - 1));
                    const points = chronologicalAttempts.map((item, idx) => {
                      const x = chronologicalAttempts.length === 1 ? 280 : 60 + idx * step;
                      const y = 150 - (item.percentage / 100) * 130;
                      return { x, y, item };
                    });

                    const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');

                    return (
                      <>
                        {points.length > 1 && (
                          <polyline
                            fill="none"
                            stroke="#1C3829"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={polylinePoints}
                          />
                        )}

                        {/* Point Circles */}
                        {points.map((p, pIdx) => (
                          <g key={p.item.id || pIdx}>
                            <circle cx={p.x} cy={p.y} r="5" fill="#FFFFFF" stroke="#1C3829" strokeWidth="2.5" />
                            <text
                              x={p.x}
                              y={p.y - 8}
                              fontSize="10"
                              fontWeight="700"
                              textAnchor="middle"
                              fill="#1C3829"
                            >
                              {p.item.percentage}%
                            </text>
                            <text
                              x={p.x}
                              y="166"
                              fontSize="9.5"
                              fill="#64748B"
                              textAnchor="middle"
                            >
                              {p.item.date ? p.item.date.split(',')[0] : `T${pIdx + 1}`}
                            </text>
                          </g>
                        ))}
                      </>
                    );
                  })()}
                </svg>
              </div>
            ) : (
              <div className="analytics-empty-card">
                <div className="analytics-empty-icon">
                  <IconQuiz size={22} />
                </div>
                <div className="analytics-empty-title">No Test Scores Logged Yet</div>
                <div className="analytics-empty-desc">
                  Take a mock test from the Exam Centre or a quick quiz to generate your diagnostic score trajectory chart.
                </div>
                <button
                  type="button"
                  className="add-task-btn"
                  onClick={() => onNavigate?.('exam-prep')}
                  style={{ marginTop: '8px' }}
                >
                  <IconAward size={14} />
                  <span>Launch Exam Centre Mock Test</span>
                </button>
              </div>
            )}
          </div>

          {/* Recent Submissions Table */}
          <div className="analytics-card" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--forest-950)', margin: 0 }}>
                  Recent Assessment Results ({allTestAttempts.length})
                </h3>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Chronological records of all submitted mock examinations and chapter quizzes
                </div>
              </div>

              <button
                type="button"
                className="weak-action-btn"
                onClick={() => onNavigate?.('exam-prep')}
              >
                <IconAward size={13} />
                <span>Open Mock Test Centre</span>
              </button>
            </div>

            {allTestAttempts.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1.5px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '10px 12px', fontWeight: 600 }}>Date</th>
                      <th style={{ padding: '10px 12px', fontWeight: 600 }}>Test Title / Course</th>
                      <th style={{ padding: '10px 12px', fontWeight: 600 }}>Type</th>
                      <th style={{ padding: '10px 12px', fontWeight: 600 }}>Score / Total</th>
                      <th style={{ padding: '10px 12px', fontWeight: 600 }}>Percentage</th>
                      <th style={{ padding: '10px 12px', fontWeight: 600 }}>Time Spent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allTestAttempts.map((test) => (
                      <tr key={test.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '12px' }}>
                          {test.date}
                        </td>
                        <td style={{ padding: '12px', fontWeight: 600, color: 'var(--forest-950)' }}>
                          <span className="subject-code-tag" style={{ marginRight: '6px' }}>{test.subjectCode}</span>
                          {test.title}
                        </td>
                        <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>
                          {test.type}
                        </td>
                        <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                          {test.score} / {test.total}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontWeight: 700,
                              fontSize: '11.5px',
                              backgroundColor: test.percentage >= 75 ? '#DCFCE7' : test.percentage >= 50 ? '#FEF3C7' : '#FEE2E2',
                              color: test.percentage >= 75 ? '#166534' : test.percentage >= 50 ? '#92400E' : '#B91C1C'
                            }}
                          >
                            {test.percentage}%
                          </span>
                        </td>
                        <td style={{ padding: '12px', color: 'var(--text-muted)', fontSize: '12px' }}>
                          {test.timeSpentSeconds ? `${Math.round(test.timeSpentSeconds / 60)} mins` : 'Untimed'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-muted)', fontSize: '13px' }}>
                No assessment attempts recorded yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 4: STUDY TIME ANALYTICS & GOALS
          ============================================================ */}
      {activeTab === 'time' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Time Metric Cards */}
          <div className="progress-kpi-grid">
            <div className="progress-kpi-card">
              <div className="progress-kpi-top">
                <span className="progress-kpi-label">Today's Focus Time</span>
                <div className="progress-kpi-icon">
                  <IconClock size={18} />
                </div>
              </div>
              <div className="progress-kpi-val">
                {todayStudyHours}h <span style={{ fontSize: '15px', color: 'var(--text-muted)' }}>/ {dailyTargetHours}h target</span>
              </div>
              <div className="progress-kpi-sub">
                {dailyGoalPct}% of daily study target achieved
              </div>
              <div className="progress-kpi-bar">
                <div className="progress-kpi-fill" style={{ width: `${dailyGoalPct}%`, backgroundColor: dailyGoalPct >= 100 ? '#16A34A' : 'var(--forest-900)' }} />
              </div>
            </div>

            <div className="progress-kpi-card">
              <div className="progress-kpi-top">
                <span className="progress-kpi-label">Weekly Study Time</span>
                <div className="progress-kpi-icon">
                  <IconCalendar size={18} />
                </div>
              </div>
              <div className="progress-kpi-val">
                {weekStudyHours}h <span style={{ fontSize: '15px', color: 'var(--text-muted)' }}>/ {weeklyTargetHours}h target</span>
              </div>
              <div className="progress-kpi-sub">
                {weeklyGoalPct}% of weekly quota fulfilled
              </div>
              <div className="progress-kpi-bar">
                <div className="progress-kpi-fill" style={{ width: `${weeklyGoalPct}%`, backgroundColor: weeklyGoalPct >= 100 ? '#16A34A' : '#0D9488' }} />
              </div>
            </div>

            <div className="progress-kpi-card">
              <div className="progress-kpi-top">
                <span className="progress-kpi-label">Past 30 Days</span>
                <div className="progress-kpi-icon">
                  <IconFlame size={18} />
                </div>
              </div>
              <div className="progress-kpi-val">
                {monthStudyHours}h
              </div>
              <div className="progress-kpi-sub">
                {studyStreakDays} active day streak across recent sessions
              </div>
              <div className="progress-kpi-bar">
                <div className="progress-kpi-fill" style={{ width: `${Math.min(100, (parseFloat(monthStudyHours) / 60) * 100)}%`, backgroundColor: '#D97706' }} />
              </div>
            </div>
          </div>

          {/* 7-Day Bar Chart */}
          <div className="analytics-chart-box">
            <div className="analytics-chart-header">
              <div>
                <h3 className="analytics-chart-title">7-Day Study Distribution</h3>
                <div className="analytics-chart-sub">
                  Focus hours logged via the Pomodoro and study timer for each day this week
                </div>
              </div>
              <button
                type="button"
                className="add-task-btn"
                onClick={() => onNavigate?.('planner')}
                style={{ fontSize: '12px', padding: '8px 14px' }}
              >
                <IconPlay size={13} />
                <span>Launch Focus Timer</span>
              </button>
            </div>

            <div className="svg-chart-container">
              <svg viewBox="0 0 540 180" style={{ width: '100%', height: '180px' }}>
                <line x1="40" y1="20" x2="520" y2="20" stroke="#E2E8F0" strokeDasharray="3 3" />
                <line x1="40" y1="70" x2="520" y2="70" stroke="#E2E8F0" strokeDasharray="3 3" />
                <line x1="40" y1="120" x2="520" y2="120" stroke="#E2E8F0" strokeDasharray="3 3" />
                <line x1="40" y1="150" x2="520" y2="150" stroke="#94A3B8" strokeWidth="1.5" />

                <text x="32" y="24" fontSize="10" textAnchor="end" fill="#64748B">{maxChartHours}h</text>
                <text x="32" y="74" fontSize="10" textAnchor="end" fill="#64748B">{(maxChartHours / 2).toFixed(1)}h</text>
                <text x="32" y="124" fontSize="10" textAnchor="end" fill="#64748B">{(maxChartHours / 4).toFixed(1)}h</text>
                <text x="32" y="154" fontSize="10" textAnchor="end" fill="#64748B">0h</text>

                {(() => {
                  const targetY = 150 - (dailyTargetHours / maxChartHours) * 130;
                  return (
                    <>
                      <line x1="40" y1={targetY} x2="520" y2={targetY} stroke="#10B981" strokeWidth="1.5" strokeDasharray="4 4" />
                      <text x="515" y={targetY - 4} fontSize="9.5" textAnchor="end" fill="#047857" fontWeight="700">
                        Target: {dailyTargetHours}h
                      </text>
                    </>
                  );
                })()}

                {dailyBarData.map((d, idx) => {
                  const colWidth = 48;
                  const colX = 55 + idx * 65;
                  const barHeight = Math.min(130, Math.round((d.hours / maxChartHours) * 130));
                  const barY = 150 - barHeight;

                  return (
                    <g key={d.iso}>
                      <rect
                        x={colX}
                        y={barY}
                        width={colWidth}
                        height={Math.max(2, barHeight)}
                        rx="4"
                        fill={d.isToday ? '#1C3829' : d.hours > 0 ? '#4D7C5D' : '#E2E8F0'}
                      />
                      {d.hours > 0 && (
                        <text
                          x={colX + colWidth / 2}
                          y={barY - 4}
                          fontSize="10"
                          fontWeight="700"
                          textAnchor="middle"
                          fill="#1C3829"
                        >
                          {d.hours}h
                        </text>
                      )}
                      <text
                        x={colX + colWidth / 2}
                        y="166"
                        fontSize="11"
                        fontWeight={d.isToday ? '800' : '600'}
                        textAnchor="middle"
                        fill={d.isToday ? '#1C3829' : '#64748B'}
                      >
                        {d.dayName}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Subject-Wise Time Allocation Matrix */}
          <div className="analytics-card" style={{ padding: '20px 24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--forest-950)', margin: '0 0 14px 0' }}>
              Subject Study Time Allocation
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              {subjectRows.map((sub) => {
                const subHoursFloat = parseFloat(sub.studyHours);
                const sharePct =
                  parseFloat(totalStudyHours) > 0
                    ? Math.round((subHoursFloat / parseFloat(totalStudyHours)) * 100)
                    : 0;

                return (
                  <div key={sub.id} style={{ padding: '12px 14px', backgroundColor: 'var(--cream-100)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span className="subject-code-tag">{sub.code}</span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--forest-900)' }}>{sharePct}% share</span>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--forest-950)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {sub.title}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {sub.studyHours} hours logged ({sub.studyMinutes} mins)
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 5: DIAGNOSTIC WEAK TOPICS & ACTIONABLE REVISION
          ============================================================ */}
      {activeTab === 'weak-topics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="analytics-card" style={{ padding: '18px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ color: '#EF4444' }}>
                <IconAlertTriangle size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--forest-950)', margin: 0 }}>
                  Diagnostic Weak Topic Identification
                </h2>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Identifies syllabus topics where test evaluation accuracy fell below 65% across recent mock tests and quizzes.
                </div>
              </div>
            </div>
          </div>

          {weakTopics.length > 0 ? (
            <div className="weak-topics-grid">
              {weakTopics.map((topic, idx) => (
                <div key={idx} className="weak-topic-card">
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span className="subject-code-tag">{topic.subjectCode}</span>
                      <span className="weak-topic-badge">
                        <IconAlertTriangle size={12} />
                        <span>{topic.accuracy}% Accuracy</span>
                      </span>
                    </div>

                    <h4 className="weak-topic-name">{topic.topic}</h4>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', marginBottom: '8px' }}>
                      {topic.subjectTitle} · {topic.unit}
                    </div>

                    <p className="weak-topic-sub">
                      Missed {topic.incorrectCount} of {topic.totalAsked} practice questions on this topic.
                      Recommended for targeted syllabus revision and re-testing.
                    </p>
                  </div>

                  <div className="weak-topic-actions">
                    <button
                      type="button"
                      className="weak-action-btn"
                      onClick={() => {
                        const matchingSub = SEMESTER_1_SUBJECTS.find((s) => s.id === topic.subjectId || s.code === topic.subjectCode);
                        if (matchingSub && onSelectSubject) {
                          onSelectSubject(matchingSub);
                        } else {
                          onNavigate?.('subjects');
                        }
                      }}
                    >
                      <IconBook size={12} />
                      <span>Review Syllabus</span>
                    </button>

                    <button
                      type="button"
                      className="weak-action-btn"
                      onClick={() => onNavigate?.('exam-prep')}
                    >
                      <IconAward size={12} />
                      <span>Retake Mock Test</span>
                    </button>

                    <button
                      type="button"
                      className="weak-action-btn"
                      onClick={() => onNavigate?.('videos')}
                    >
                      <IconVideo size={12} />
                      <span>Watch Lecture</span>
                    </button>

                    <button
                      type="button"
                      className="weak-action-btn"
                      onClick={() => onNavigate?.('ai-assistant')}
                    >
                      <IconSparkles size={12} />
                      <span>Ask AI Tutor</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="analytics-empty-card">
              <div className="analytics-empty-icon" style={{ backgroundColor: '#DCFCE7', color: '#166534' }}>
                <IconCheckCircle size={24} />
              </div>
              <div className="analytics-empty-title">
                {totalTestsAttempted === 0 ? 'Diagnostic Calibration Pending' : 'No Critical Weak Topics Found'}
              </div>
              <div className="analytics-empty-desc">
                {totalTestsAttempted === 0
                  ? 'Complete at least one mock test or quiz with question evaluation to generate targeted topic-level diagnostics.'
                  : 'Great job! You achieved 65% or higher accuracy across all evaluated topics in recent tests.'}
              </div>
              {totalTestsAttempted === 0 && (
                <button
                  type="button"
                  className="add-task-btn"
                  onClick={() => onNavigate?.('exam-prep')}
                  style={{ marginTop: '8px' }}
                >
                  <IconAward size={14} />
                  <span>Launch Diagnostic Mock Test</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================
          TAB 6: ACHIEVEMENTS & MILESTONES (STRICT DATA ONLY)
          ============================================================ */}
      {activeTab === 'achievements' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="analytics-card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--forest-950)', margin: 0 }}>
                Academic Milestones & Badges
              </h2>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Awarded strictly when actual student records satisfy each achievement requirement.
              </div>
            </div>
            <div className="term-pill-badge" style={{ backgroundColor: '#DCFCE7', color: '#166534', fontWeight: 700 }}>
              <IconAward size={15} />
              <span>{unlockedMilestonesCount} of {achievements.length} Unlocked</span>
            </div>
          </div>

          <div className="achievement-grid">
            {achievements.map((item) => {
              const Icon = item.icon;
              const pct = Math.min(100, Math.round((item.current / item.target) * 100));

              return (
                <div key={item.id} className={`achievement-card ${item.unlocked ? 'unlocked' : 'locked'}`}>
                  <div className="achievement-icon-wrap">
                    {item.unlocked ? <Icon size={22} /> : <IconLock size={20} />}
                  </div>

                  <div className="achievement-body">
                    <div className="achievement-title">
                      <span>{item.title}</span>
                      <span className="achievement-pill">
                        {item.unlocked ? 'Unlocked' : 'In Progress'}
                      </span>
                    </div>

                    <p className="achievement-desc">{item.desc}</p>

                    <div className="achievement-progress-row">
                      <span>Progress</span>
                      <span>
                        {item.current} / {item.target} {item.unit} ({pct}%)
                      </span>
                    </div>

                    <div className="progress-kpi-bar" style={{ height: '5px' }}>
                      <div
                        className="progress-kpi-fill"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: item.unlocked ? '#16A34A' : 'var(--text-muted)'
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 7: WEEKLY REPORT DIGEST
          ============================================================ */}
      {activeTab === 'weekly-report' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="weekly-report-box">
            <div className="weekly-report-header">
              <div>
                <span className="progress-header-badge">
                  <IconCalendar size={13} />
                  <span>Academic Weekly Digest</span>
                </span>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--forest-950)', margin: '4px 0 2px 0' }}>
                  Week of {weeklyReport.weekDateSpan}
                </h2>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Synthesized study productivity, assessment outcomes, and high-impact priorities.
                </div>
              </div>

              <button
                type="button"
                className="add-task-btn"
                onClick={handleCopyWeeklyReport}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
              >
                <IconCopy size={14} />
                <span>Copy Weekly Report</span>
              </button>
            </div>

            {/* 4 Summary KPIs for This Week */}
            <div className="progress-kpi-grid">
              <div className="progress-kpi-card">
                <div className="progress-kpi-top">
                  <span className="progress-kpi-label">This Week's Study Time</span>
                  <div className="progress-kpi-icon">
                    <IconClock size={16} />
                  </div>
                </div>
                <div className="progress-kpi-val">{weeklyReport.studyHours}h</div>
                <div className="progress-kpi-sub">Target: {weeklyTargetHours}h quota</div>
              </div>

              <div className="progress-kpi-card">
                <div className="progress-kpi-top">
                  <span className="progress-kpi-label">Tests Evaluated</span>
                  <div className="progress-kpi-icon">
                    <IconQuiz size={16} />
                  </div>
                </div>
                <div className="progress-kpi-val">{weeklyReport.testsAttempted}</div>
                <div className="progress-kpi-sub">
                  {weeklyReport.testAvg !== null ? `${weeklyReport.testAvg}% average score` : 'No tests taken this week'}
                </div>
              </div>

              <div className="progress-kpi-card">
                <div className="progress-kpi-top">
                  <span className="progress-kpi-label">Tasks Finished</span>
                  <div className="progress-kpi-icon">
                    <IconCheckSquare size={16} />
                  </div>
                </div>
                <div className="progress-kpi-val">{weeklyReport.completedTasksCount}</div>
                <div className="progress-kpi-sub">Personal study action items checked</div>
              </div>

              <div className="progress-kpi-card">
                <div className="progress-kpi-top">
                  <span className="progress-kpi-label">Assignments Submitted</span>
                  <div className="progress-kpi-icon">
                    <IconCheckCircle size={16} />
                  </div>
                </div>
                <div className="progress-kpi-val">{weeklyReport.submittedAssignmentsCount}</div>
                <div className="progress-kpi-sub">Course coursework assignments submitted</div>
              </div>
            </div>

            {/* Suggested Strategic Priorities for Next Week */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--forest-950)', margin: '0 0 12px 0' }}>
                Suggested Priorities for Next Week
              </h3>

              <div className="weekly-priorities-list">
                {weeklyReport.priorities.map((item, idx) => (
                  <div key={item.id} className={`priority-item-card ${item.level}`}>
                    <div className="priority-number">{idx + 1}</div>
                    <div className="priority-content">
                      <div className="priority-title">{item.title}</div>
                      <div className="priority-desc">{item.desc}</div>
                    </div>
                    <button
                      type="button"
                      className="weak-action-btn"
                      onClick={() => onNavigate?.(item.actionView)}
                    >
                      <span>{item.actionLabel}</span>
                      <IconChevronRight size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
