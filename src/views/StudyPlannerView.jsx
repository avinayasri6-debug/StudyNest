import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  IconCalendar,
  IconClock,
  IconPlus,
  IconTrash,
  IconCheckCircle,
  IconCircle,
  IconReset,
  IconPlay,
  IconSparkles,
  IconAward,
  IconCheckSquare,
  IconSearch,
  IconArrowLeft,
  IconArrowRight,
  IconBot,
  IconZap,
  IconSliders,
  IconRefreshCw
} from '../components/Icons';
import { SEMESTER_1_SUBJECTS } from '../data/subjectsData';
import MarkdownRenderer from '../components/MarkdownRenderer';
import './StudyPlannerView.css';

// ==========================================
// DATE & TIME HELPERS
// ==========================================
function getTodayDateStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDateDisplay(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function getDaysRemaining(targetDateStr) {
  if (!targetDateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [y, m, d] = targetDateStr.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getWeekDays(weekOffset = 0) {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 is Sun, 1 is Mon...
  const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday + weekOffset * 7);

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayStr = getTodayDateStr();

  return dayNames.map((name, idx) => {
    const cur = new Date(monday);
    cur.setDate(monday.getDate() + idx);
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, '0');
    const d = String(cur.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;

    return {
      name,
      fullName: cur.toLocaleDateString('en-US', { weekday: 'long' }),
      dateStr,
      dayNum: cur.getDate(),
      monthName: cur.toLocaleDateString('en-US', { month: 'short' }),
      year: y,
      isToday: dateStr === todayStr
    };
  });
}

// Gentle audio notification tone using Web Audio API
function playCompletionTone() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch {
    // Audio context may be restricted by autoplay policy
  }
}

export default function StudyPlannerView({
  tasks = [],
  onSaveTasks,
  assignments = [],
  profile,
  onUpdateProfile,
  studySessions = [],
  onLogStudySession,
  plannedSessions = [],
  onSavePlannedSessions,
  upcomingExams = [],
  onSaveUpcomingExams,
  completedTopics = {},
  onNavigate,
  onShowToast
}) {
  // Navigation tabs:
  // 'daily' | 'weekly' | 'tasks' | 'exams' | 'goals' | 'pomodoro' | 'suggestions'
  const [activeTab, setActiveTab] = useState('daily');

  // ==========================================
  // FEATURE 1: DAILY PLANNER STATE
  // ==========================================
  const [dailySelectedDate, setDailySelectedDate] = useState(() => getTodayDateStr());
  const [isAddingSession, setIsAddingSession] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [sessionForm, setSessionForm] = useState(() => ({
    subjectId: 'math101',
    topic: '',
    startTime: '09:30',
    endTime: '11:00',
    priority: 'high',
    type: 'study'
  }));

  // ==========================================
  // FEATURE 2: WEEKLY CALENDAR STATE
  // ==========================================
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, -1 = last week, +1 = next week
  const weekDays = useMemo(() => getWeekDays(weekOffset), [weekOffset]);

  // ==========================================
  // FEATURE 3: TASK MANAGER STATE
  // ==========================================
  const [taskSearch, setTaskSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [taskForm, setTaskForm] = useState(() => ({
    title: '',
    description: '',
    subjectCode: 'MATH 101',
    type: 'study',
    dueDate: getTodayDateStr(),
    dueTime: '18:00',
    priority: 'medium',
    status: 'pending'
  }));

  // ==========================================
  // FEATURE 4: EXAM COUNTDOWN STATE
  // ==========================================
  const [isAddingExam, setIsAddingExam] = useState(false);
  const [editingExamId, setEditingExamId] = useState(null);
  const [examForm, setExamForm] = useState(() => ({
    subjectId: 'math101',
    examType: 'Mid-Semester Theory Examination',
    date: getTodayDateStr(),
    time: '09:30 AM',
    room: 'Lecture Hall 204',
    syllabusUnits: 'Units 1 and 2',
    targetScore: '90%'
  }));

  // ==========================================
  // FEATURE 5: STUDY GOALS STATE
  // ==========================================
  const [goalsForm, setGoalsForm] = useState(() => ({
    dailyTargetHours: profile?.studyGoals?.dailyTargetHours || 3.5,
    weeklyHoursTarget: profile?.studyGoals?.weeklyHoursTarget || 20.0,
    primaryFocus: profile?.studyGoals?.primaryFocus || 'Python Academy & Linear Algebra',
    targetGrade: profile?.studyGoals?.targetGrade || 'Excellence (Grade A / 9.0+ GPA)',
    personalMotto: profile?.studyGoals?.personalMotto || 'Consistent daily problem solving builds mastery.'
  }));

  // ==========================================
  // FEATURE 6: POMODORO FOCUS TIMER STATE
  // ==========================================
  const [timerMode, setTimerMode] = useState('focus'); // 'focus' | 'shortBreak' | 'longBreak' | 'custom'
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const [timerStatus, setTimerStatus] = useState('idle'); // 'idle' | 'running' | 'paused'
  const [timerSubjectCode, setTimerSubjectCode] = useState('CSE 101');
  const [timerTopic, setTimerTopic] = useState('Python Academy Focus Sprint');
  const [customMinutesInput, setCustomMinutesInput] = useState(30);
  const timerIntervalRef = useRef(null);

  // Focus timer countdown effect
  useEffect(() => {
    if (timerStatus === 'running') {
      timerIntervalRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            setTimerStatus('idle');
            playCompletionTone();

            // Log session if focus or custom mode
            if (timerMode === 'focus' || timerMode === 'custom') {
              const minutesLogged = timerMinutes;
              onLogStudySession?.({
                id: `session-${Date.now()}`,
                date: getTodayDateStr(),
                minutes: minutesLogged,
                subject: timerSubjectCode,
                topic: timerTopic,
                type: 'pomodoro',
                timestamp: Date.now()
              });
              onShowToast?.(`🎉 Great focus! Completed ${minutesLogged} mins of study for ${timerSubjectCode}. Logged to your progress.`);
            } else {
              onShowToast?.('🔔 Break finished! Ready to refocus on your engineering studies.');
            }
            return timerMinutes * 60;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timerStatus, timerMinutes, timerMode, timerSubjectCode, timerTopic, onLogStudySession, onShowToast]);

  const handleSelectTimerMode = (mode, defaultMins) => {
    setTimerStatus('idle');
    setTimerMode(mode);
    setTimerMinutes(defaultMins);
    setSecondsRemaining(defaultMins * 60);
  };

  const handleStartTimer = () => setTimerStatus('running');
  const handlePauseTimer = () => setTimerStatus('paused');
  const handleResumeTimer = () => setTimerStatus('running');
  const handleResetTimer = () => {
    setTimerStatus('idle');
    setSecondsRemaining(timerMinutes * 60);
  };

  const handleApplyCustomMinutes = (e) => {
    e.preventDefault();
    const parsed = parseInt(customMinutesInput, 10);
    if (!parsed || parsed <= 0 || parsed > 180) {
      onShowToast?.('Please enter a duration between 1 and 180 minutes.');
      return;
    }
    handleSelectTimerMode('custom', parsed);
  };

  const handleManualLogElapsed = () => {
    const elapsedSecs = timerMinutes * 60 - secondsRemaining;
    const elapsedMins = Math.round(elapsedSecs / 60);
    if (elapsedMins < 1) {
      onShowToast?.('Focus for at least 1 minute before logging.');
      return;
    }
    onLogStudySession?.({
      id: `session-${Date.now()}`,
      date: getTodayDateStr(),
      minutes: elapsedMins,
      subject: timerSubjectCode,
      topic: timerTopic,
      type: 'pomodoro',
      timestamp: Date.now()
    });
    onShowToast?.(`Logged ${elapsedMins} mins of study for ${timerSubjectCode}!`);
    handleResetTimer();
  };

  // Launch Pomodoro directly with session/task details
  const launchPomodoroFor = (subjectCode, topicTitle) => {
    setTimerSubjectCode(subjectCode);
    setTimerTopic(topicTitle || 'Deep Study Session');
    handleSelectTimerMode('focus', 25);
    setActiveTab('pomodoro');
    onShowToast?.(`Loaded "${topicTitle}" into Pomodoro Focus Timer.`);
  };

  // ==========================================
  // FEATURE 7: SMART PRIORITIZATION & AI ADVISOR
  // ==========================================
  const [aiAdvisorLoading, setAiAdvisorLoading] = useState(false);
  const [aiAdvisorAdvice, setAiAdvisorAdvice] = useState(null);

  // Algorithmic deterministic prioritization queue
  const algorithmicRecommendations = useMemo(() => {
    const recs = [];

    // 1. Check upcoming exams within 14 days
    upcomingExams.forEach((exam) => {
      const days = getDaysRemaining(exam.date);
      if (days !== null && days >= 0 && days <= 14) {
        recs.push({
          id: `rec-exam-${exam.id}`,
          type: 'exam',
          priorityScore: 100 - days * 5,
          badge: days <= 3 ? 'CRITICAL EXAM' : days <= 7 ? 'UPCOMING EXAM' : 'EXAM REVISION',
          reasonClass: 'reason-exam',
          subjectCode: exam.subjectCode,
          subjectName: exam.subjectName,
          title: `Prepare for ${exam.examType}`,
          description: `Scheduled in ${days} days (${exam.date}). Syllabus: ${exam.syllabusUnits}. Target Score: ${exam.targetScore || '85+'}.`,
          recommendedDuration: 90
        });
      }
    });

    // 2. Check pending high/medium priority tasks
    tasks
      .filter((t) => !t.completed)
      .forEach((t) => {
        let score = t.priority === 'high' ? 75 : t.priority === 'medium' ? 50 : 25;
        const days = t.dueDate ? getDaysRemaining(t.dueDate) : 10;
        if (days !== null && days <= 2) score += 30;

        recs.push({
          id: `rec-task-${t.id}`,
          type: 'task',
          priorityScore: score,
          badge: days !== null && days <= 1 ? 'URGENT DEADLINE' : t.priority === 'high' ? 'HIGH PRIORITY' : 'PENDING TASK',
          reasonClass: 'reason-urgent',
          subjectCode: t.subjectTag || 'GEN',
          subjectName: t.subject || 'Engineering Task',
          title: t.title,
          description: t.description || `Due: ${t.dueDate || 'Today'} (${t.dueTime || '18:00'}). Status: ${t.status || 'Pending'}.`,
          recommendedDuration: 45
        });
      });

    // 3. Check pending assignments
    assignments
      .filter((a) => a.status !== 'Submitted')
      .slice(0, 3)
      .forEach((a) => {
        recs.push({
          id: `rec-asg-${a.id}`,
          type: 'assignment',
          priorityScore: 60,
          badge: 'ASSIGNMENT DUE',
          reasonClass: 'reason-urgent',
          subjectCode: a.subjectCode || a.subjectId,
          subjectName: a.subjectId,
          title: a.title,
          description: `Due date: ${a.dueDate}. Submit your report and verify solution steps.`,
          recommendedDuration: 60
        });
      });

    // 4. Check lowest progress subject
    SEMESTER_1_SUBJECTS.forEach((sub) => {
      const completedCount = (completedTopics[sub.id] || []).length;
      if (completedCount === 0) {
        recs.push({
          id: `rec-sub-${sub.id}`,
          type: 'syllabus',
          priorityScore: 40,
          badge: 'SYLLABUS DEFICIT',
          reasonClass: 'reason-syllabus',
          subjectCode: sub.code,
          subjectName: sub.title,
          title: `Start Unit 1 for ${sub.shortName}`,
          description: `0 topics marked completed so far. Begin with fundamental definitions and lecture note review.`,
          recommendedDuration: 45
        });
      }
    });

    // Sort by priorityScore descending
    return recs.sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 6);
  }, [upcomingExams, tasks, assignments, completedTopics]);

  // AI Plan Advisor request
  const handleAskAIAdvisor = async () => {
    setAiAdvisorLoading(true);
    setAiAdvisorAdvice(null);

    const pendingSummary = tasks
      .filter((t) => !t.completed)
      .slice(0, 6)
      .map((t) => `- [${t.priority.toUpperCase()}] ${t.title} (${t.subjectTag || t.subject}) due ${t.dueDate || 'soon'}`)
      .join('\n');

    const examSummary = upcomingExams
      .map((e) => `- ${e.subjectCode}: ${e.examType} on ${e.date} (${getDaysRemaining(e.date)} days remaining, syllabus: ${e.syllabusUnits})`)
      .join('\n');

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `You are an elite academic study planner and cognitive science advisor for an engineering student in First Year CSE (AI & ML).
The student is enrolled in 7 Semester 1 courses:
1. Linear Algebra and Calculus (MATH 101)
2. Engineering Physics (PHY 101)
3. Problem Solving and Programming in Python (CSE 101)
4. Fundamentals of Digital Electronics (ECE 101)
5. Digital Skill Workshop (ENG 103)
6. Quantitative Aptitude and Reasoning (ENG 104)
7. English for Technical Communication (HUM 101)

Student Goals: Daily ${goalsForm.dailyTargetHours}h, Weekly ${goalsForm.weeklyHoursTarget}h. Primary focus: ${goalsForm.primaryFocus}.

Upcoming Examinations:
${examSummary || 'None registered yet.'}

Active Tasks & Homework:
${pendingSummary || 'All pending tasks currently cleared.'}

Please generate an optimized, personalized Strategic Engineering Study Plan for the student. Structure it clearly:
1. **Immediate Focus for Today**: Specify exact time blocks (interleaving heavy theory like Calculus/Physics with high-focus coding like Python).
2. **Weekly Exam Preparation Strategy**: Clear countdown milestones based on their actual examination dates.
3. **Cognitive Fatigue & Spaced Repetition Advice**: Pacing tips for 1st-year engineering stamina.
Keep it encouraging, structured with bullet points and bold headers.`
            }
          ],
          subject: {
            id: 'planner',
            title: 'Engineering Academic Planning & Cognitive Optimization',
            code: 'PLANNER',
            shortName: 'Study Planner'
          },
          mode: 'intermediate'
        })
      });

      const data = await response.json();
      setAiAdvisorAdvice(data.content || data.error || 'No recommendation received.');
      onShowToast?.('✨ AI Strategic Study Advice generated!');
    } catch {
      // Fallback rule-based structured analysis if server is unreachable
      setAiAdvisorAdvice(`### 🧠 Strategic Engineering Study Plan (Heuristic Model)

#### 1. Immediate Focus Recommendations for Today:
* **Block 1 (Morning / High Alertness)**: Deep Analytical Work – **Linear Algebra and Calculus (MATH 101)**. Focus 60 minutes on Eigenvalues, matrix diagonalization, and Cayley-Hamilton theorem verifications.
* **Block 2 (Afternoon / Practical Focus)**: Active Coding – **Python Academy (CSE 101)**. Complete 45 minutes solving dictionary comprehension challenges and testing edge cases in the Practice Lab.
* **Block 3 (Evening / Review)**: Formula Consolidation – **Engineering Physics (PHY 101)**. Review population inversion in lasers and numerical aperture derivations for 30 minutes.

#### 2. Weekly Exam Countdown Milestone:
* With examinations on the horizon, adopt the **3:1 Rule**: 3 parts active problem-solving / past paper questions to 1 part passive reading.
* For **Digital Electronics (ECE 101)**, practice 4-variable K-Map groupings and don't-care conditions on paper without checking solutions prematurely.

#### 3. Cognitive Stamina & Pacing:
* Utilize the **25-minute Pomodoro intervals** with strict 5-minute screen-free breaks.
* Never study two abstract mathematical subjects consecutively; interleave **Quantitative Aptitude drills** or **Python coding** between heavy theoretical derivations.`);
    } finally {
      setAiAdvisorLoading(false);
    }
  };

  // ==========================================
  // QUICK STATS CALCULATIONS
  // ==========================================
  const todayStr = getTodayDateStr();

  // Completed study minutes today
  const todayCompletedMinutes = useMemo(() => {
    return studySessions
      .filter((s) => s.date === todayStr)
      .reduce((acc, s) => acc + (s.minutes || 0), 0);
  }, [studySessions, todayStr]);

  // Completed study minutes this week
  const weekCompletedMinutes = useMemo(() => {
    const currentWeekDates = new Set(getWeekDays(0).map((d) => d.dateStr));
    return studySessions
      .filter((s) => currentWeekDates.has(s.date))
      .reduce((acc, s) => acc + (s.minutes || 0), 0);
  }, [studySessions]);

  // Planned study sessions today
  const todayPlannedSessions = useMemo(() => {
    return plannedSessions.filter((s) => s.date === todayStr);
  }, [plannedSessions, todayStr]);

  const todayCompletedSessionsCount = todayPlannedSessions.filter((s) => s.completed).length;

  // Nearest upcoming exam
  const nearestExam = useMemo(() => {
    const valid = upcomingExams
      .map((e) => ({ ...e, days: getDaysRemaining(e.date) }))
      .filter((e) => e.days !== null && e.days >= 0)
      .sort((a, b) => a.days - b.days);
    return valid[0] || null;
  }, [upcomingExams]);

  // ==========================================
  // FEATURE 1 HANDLERS: DAILY PLANNER
  // ==========================================
  const activeDateSessions = useMemo(() => {
    return plannedSessions
      .filter((s) => s.date === dailySelectedDate)
      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
  }, [plannedSessions, dailySelectedDate]);

  const handleToggleSessionComplete = (sessionId) => {
    const updated = plannedSessions.map((s) => {
      if (s.id === sessionId) {
        const nextState = !s.completed;
        // If marking complete, also log session minutes to studySessions
        if (nextState) {
          const matchedSub = SEMESTER_1_SUBJECTS.find((sub) => sub.id === s.subjectId);
          onLogStudySession?.({
            id: `session-planned-${Date.now()}`,
            date: s.date,
            minutes: 60, // Default 60 min session
            subject: s.subjectCode || matchedSub?.code || 'GEN',
            topic: s.topic,
            type: 'planned-session',
            timestamp: Date.now()
          });
          onShowToast?.(`Marked session "${s.topic}" completed! 60 mins added to your study progress.`);
        } else {
          onShowToast?.(`Session marked pending.`);
        }
        return { ...s, completed: nextState };
      }
      return s;
    });
    onSavePlannedSessions(updated);
  };

  const handleDeleteSession = (sessionId) => {
    const updated = plannedSessions.filter((s) => s.id !== sessionId);
    onSavePlannedSessions(updated);
    onShowToast?.('Study session removed.');
  };

  const handleSaveSessionForm = (e) => {
    e.preventDefault();
    if (!sessionForm.topic.trim()) return;

    const matchedSub = SEMESTER_1_SUBJECTS.find((s) => s.id === sessionForm.subjectId);

    if (editingSessionId) {
      const updated = plannedSessions.map((s) => {
        if (s.id === editingSessionId) {
          return {
            ...s,
            subjectId: sessionForm.subjectId,
            subjectCode: matchedSub?.code || 'GEN',
            subjectName: matchedSub?.title || 'General Engineering',
            topic: sessionForm.topic.trim(),
            startTime: sessionForm.startTime,
            endTime: sessionForm.endTime,
            priority: sessionForm.priority,
            type: sessionForm.type
          };
        }
        return s;
      });
      onSavePlannedSessions(updated);
      onShowToast?.('Study session updated.');
      setEditingSessionId(null);
    } else {
      const newSession = {
        id: `plan-${Date.now()}`,
        date: dailySelectedDate,
        subjectId: sessionForm.subjectId,
        subjectCode: matchedSub?.code || 'GEN',
        subjectName: matchedSub?.title || 'General Engineering',
        topic: sessionForm.topic.trim(),
        startTime: sessionForm.startTime,
        endTime: sessionForm.endTime,
        priority: sessionForm.priority,
        type: sessionForm.type,
        completed: false
      };
      onSavePlannedSessions([newSession, ...plannedSessions]);
      onShowToast?.(`Scheduled session for ${formatDateDisplay(dailySelectedDate)}`);
    }

    setSessionForm({
      subjectId: 'math101',
      topic: '',
      startTime: '09:30',
      endTime: '11:00',
      priority: 'high',
      type: 'study'
    });
    setIsAddingSession(false);
  };

  const handleStartEditSession = (session) => {
    setEditingSessionId(session.id);
    setSessionForm({
      subjectId: session.subjectId || 'math101',
      topic: session.topic || '',
      startTime: session.startTime || '09:30',
      endTime: session.endTime || '11:00',
      priority: session.priority || 'high',
      type: session.type || 'study'
    });
    setIsAddingSession(true);
  };

  // Add session quickly for any date (e.g. from weekly calendar)
  const openAddSessionForDate = (dateStr) => {
    setDailySelectedDate(dateStr);
    setEditingSessionId(null);
    setIsAddingSession(true);
    setActiveTab('daily');
  };

  // ==========================================
  // FEATURE 3 HANDLERS: TASK MANAGER
  // ==========================================
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Search
      if (taskSearch.trim()) {
        const q = taskSearch.toLowerCase();
        const matchesTitle = (t.title || '').toLowerCase().includes(q);
        const matchesDesc = (t.description || '').toLowerCase().includes(q);
        const matchesSub = (t.subject || '').toLowerCase().includes(q) || (t.subjectTag || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesSub) return false;
      }
      // Subject
      if (filterSubject !== 'ALL') {
        const tag = t.subjectTag || '';
        const name = t.subject || '';
        if (tag !== filterSubject && !name.toLowerCase().includes(filterSubject.toLowerCase())) {
          return false;
        }
      }
      // Priority
      if (filterPriority !== 'ALL' && t.priority !== filterPriority) {
        return false;
      }
      // Status
      if (filterStatus !== 'ALL') {
        const curStatus = t.status || (t.completed ? 'completed' : 'pending');
        if (curStatus !== filterStatus) return false;
      }
      // Type
      if (filterType !== 'ALL' && (t.type || 'study') !== filterType) {
        return false;
      }
      return true;
    });
  }, [tasks, taskSearch, filterSubject, filterPriority, filterStatus, filterType]);

  const handleToggleTaskStatus = (taskId, newStatus) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const status = newStatus || (t.completed ? 'pending' : 'completed');
        const isDone = status === 'completed';
        onShowToast?.(isDone ? `Task marked completed: "${t.title}"` : `Task set to ${status}`);
        return {
          ...t,
          status,
          completed: isDone
        };
      }
      return t;
    });
    onSaveTasks(updated);
  };

  const handleDeleteTask = (taskId) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    onSaveTasks(updated);
    onShowToast?.('Task deleted.');
  };

  const handleSaveTaskForm = (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;

    const matchedSub = SEMESTER_1_SUBJECTS.find((s) => s.code === taskForm.subjectCode);
    const subjectName = matchedSub ? matchedSub.title : 'General Study';

    if (editingTaskId) {
      const updated = tasks.map((t) => {
        if (t.id === editingTaskId) {
          return {
            ...t,
            title: taskForm.title.trim(),
            description: taskForm.description.trim(),
            subject: subjectName,
            subjectTag: taskForm.subjectCode,
            type: taskForm.type,
            dueDate: taskForm.dueDate,
            dueTime: taskForm.dueTime,
            priority: taskForm.priority,
            status: taskForm.status,
            completed: taskForm.status === 'completed'
          };
        }
        return t;
      });
      onSaveTasks(updated);
      onShowToast?.('Task updated.');
      setEditingTaskId(null);
    } else {
      const newTask = {
        id: `task-${Date.now()}`,
        title: taskForm.title.trim(),
        description: taskForm.description.trim(),
        subject: subjectName,
        subjectTag: taskForm.subjectCode,
        type: taskForm.type,
        dueDate: taskForm.dueDate,
        dueTime: taskForm.dueTime,
        priority: taskForm.priority,
        status: taskForm.status,
        completed: taskForm.status === 'completed'
      };
      onSaveTasks([newTask, ...tasks]);
      onShowToast?.('Task created successfully.');
    }

    setTaskForm({
      title: '',
      description: '',
      subjectCode: 'MATH 101',
      type: 'study',
      dueDate: getTodayDateStr(),
      dueTime: '18:00',
      priority: 'medium',
      status: 'pending'
    });
    setIsAddingTask(false);
  };

  const handleStartEditTask = (t) => {
    setEditingTaskId(t.id);
    setTaskForm({
      title: t.title || '',
      description: t.description || '',
      subjectCode: t.subjectTag || 'MATH 101',
      type: t.type || 'study',
      dueDate: t.dueDate || getTodayDateStr(),
      dueTime: t.dueTime || '18:00',
      priority: t.priority || 'medium',
      status: t.status || (t.completed ? 'completed' : 'pending')
    });
    setIsAddingTask(true);
  };

  // ==========================================
  // FEATURE 4 HANDLERS: EXAM COUNTDOWN
  // ==========================================
  const sortedExams = useMemo(() => {
    return [...upcomingExams].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  }, [upcomingExams]);

  const handleSaveExamForm = (e) => {
    e.preventDefault();
    const matchedSub = SEMESTER_1_SUBJECTS.find((s) => s.id === examForm.subjectId);

    if (editingExamId) {
      const updated = upcomingExams.map((ex) => {
        if (ex.id === editingExamId) {
          return {
            ...ex,
            subjectId: examForm.subjectId,
            subjectCode: matchedSub?.code || 'GEN',
            subjectName: matchedSub?.title || 'Course Exam',
            examType: examForm.examType.trim(),
            date: examForm.date,
            time: examForm.time,
            room: examForm.room,
            syllabusUnits: examForm.syllabusUnits,
            targetScore: examForm.targetScore
          };
        }
        return ex;
      });
      onSaveUpcomingExams(updated);
      onShowToast?.('Exam details updated.');
      setEditingExamId(null);
    } else {
      const newExam = {
        id: `exam-${Date.now()}`,
        subjectId: examForm.subjectId,
        subjectCode: matchedSub?.code || 'GEN',
        subjectName: matchedSub?.title || 'Course Exam',
        examType: examForm.examType.trim(),
        date: examForm.date,
        time: examForm.time,
        room: examForm.room,
        syllabusUnits: examForm.syllabusUnits,
        targetScore: examForm.targetScore
      };
      onSaveUpcomingExams([newExam, ...upcomingExams]);
      onShowToast?.(`Added exam countdown for ${matchedSub?.code || 'Course'} on ${examForm.date}`);
    }

    setExamForm({
      subjectId: 'math101',
      examType: 'Mid-Semester Theory Examination',
      date: getTodayDateStr(),
      time: '09:30 AM',
      room: 'Lecture Hall 204',
      syllabusUnits: 'Units 1 and 2',
      targetScore: '90%'
    });
    setIsAddingExam(false);
  };

  const handleDeleteExam = (examId) => {
    const updated = upcomingExams.filter((e) => e.id !== examId);
    onSaveUpcomingExams(updated);
    onShowToast?.('Exam removed from schedule.');
  };

  const handleStartEditExam = (exam) => {
    setEditingExamId(exam.id);
    setExamForm({
      subjectId: exam.subjectId || 'math101',
      examType: exam.examType || 'Mid-Semester Theory Examination',
      date: exam.date || getTodayDateStr(),
      time: exam.time || '09:30 AM',
      room: exam.room || 'LH 204',
      syllabusUnits: exam.syllabusUnits || 'Units 1 and 2',
      targetScore: exam.targetScore || '90%'
    });
    setIsAddingExam(true);
  };

  // ==========================================
  // FEATURE 5 HANDLERS: STUDY GOALS
  // ==========================================
  const handleSaveGoalsForm = (e) => {
    e.preventDefault();
    const updatedProfile = {
      ...profile,
      studyGoals: {
        ...profile?.studyGoals,
        dailyTargetHours: parseFloat(goalsForm.dailyTargetHours) || 3.5,
        weeklyHoursTarget: parseFloat(goalsForm.weeklyHoursTarget) || 20.0,
        primaryFocus: goalsForm.primaryFocus,
        targetGrade: goalsForm.targetGrade,
        personalMotto: goalsForm.personalMotto
      }
    };
    onUpdateProfile?.(updatedProfile);
    onShowToast?.('Study targets and personal academic goals saved successfully!');
  };

  // Calculate planned vs completed hours
  const todayPlannedHours = useMemo(() => {
    return parseFloat((todayPlannedSessions.length * 1.5).toFixed(1)); // ~1.5h average per scheduled block
  }, [todayPlannedSessions]);

  const todayCompletedHours = parseFloat((todayCompletedMinutes / 60).toFixed(1));
  const weekCompletedHours = parseFloat((weekCompletedMinutes / 60).toFixed(1));
  const weekPlannedHours = useMemo(() => {
    const currentWeekDates = new Set(getWeekDays(0).map((d) => d.dateStr));
    const weekPlans = plannedSessions.filter((s) => currentWeekDates.has(s.date));
    return parseFloat((weekPlans.length * 1.5).toFixed(1));
  }, [plannedSessions]);

  const dailyGoalTarget = goalsForm.dailyTargetHours || 3.5;
  const weeklyGoalTarget = goalsForm.weeklyHoursTarget || 20.0;

  const dailyPercent = Math.min(100, Math.round((todayCompletedHours / dailyGoalTarget) * 100));
  const weeklyPercent = Math.min(100, Math.round((weekCompletedHours / weeklyGoalTarget) * 100));

  // Subject distribution of completed study sessions
  const subjectHoursDistribution = useMemo(() => {
    const map = {};
    studySessions.forEach((s) => {
      const sub = s.subject || 'Other';
      map[sub] = (map[sub] || 0) + (s.minutes || 0);
    });
    return Object.entries(map).map(([code, mins]) => ({
      code,
      hours: parseFloat((mins / 60).toFixed(1))
    })).sort((a, b) => b.hours - a.hours);
  }, [studySessions]);

  return (
    <div className="smart-planner-container">
      {/* 1. Header Strip with Quick Stats */}
      <div className="planner-header-strip">
        <div className="planner-header-top">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--sage-600)', fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>
              <IconCalendar size={16} />
              <span>Academic Engineering Workspace · Semester 1</span>
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--forest-950)', margin: 0 }}>
              Smart Study Planner
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', marginTop: '4px', maxWidth: '720px' }}>
              Daily schedules, weekly calendar, verified Pomodoro focus timer, assignment manager, exam countdown, and AI study plan optimization.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
            <div className="planner-date-badge">
              <IconClock size={14} />
              <span>Today: {formatDateDisplay(todayStr)}</span>
            </div>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
              Primary Focus: <strong>{goalsForm.primaryFocus}</strong>
            </span>
          </div>
        </div>

        {/* Quick Stat Highlights */}
        <div className="planner-stats-row">
          <div className="planner-stat-card">
            <div className="planner-stat-icon">
              <IconClock size={20} />
            </div>
            <div>
              <div className="planner-stat-label">Today's Focus</div>
              <div className="planner-stat-val">{todayCompletedHours}h <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>/ {dailyGoalTarget}h</span></div>
              <div className="planner-stat-sub">{dailyPercent}% of daily goal</div>
            </div>
          </div>

          <div className="planner-stat-card">
            <div className="planner-stat-icon">
              <IconAward size={20} />
            </div>
            <div>
              <div className="planner-stat-label">This Week's Focus</div>
              <div className="planner-stat-val">{weekCompletedHours}h <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>/ {weeklyGoalTarget}h</span></div>
              <div className="planner-stat-sub">{weeklyPercent}% completed</div>
            </div>
          </div>

          <div className="planner-stat-card">
            <div className="planner-stat-icon">
              <IconCheckSquare size={20} />
            </div>
            <div>
              <div className="planner-stat-label">Today's Sessions</div>
              <div className="planner-stat-val">{todayCompletedSessionsCount} of {todayPlannedSessions.length} done</div>
              <div className="planner-stat-sub">{todayPlannedSessions.length - todayCompletedSessionsCount} pending</div>
            </div>
          </div>

          <div className="planner-stat-card">
            <div className="planner-stat-icon" style={{ color: nearestExam && nearestExam.days <= 7 ? '#DC2626' : 'var(--forest-900)' }}>
              <IconCalendar size={20} />
            </div>
            <div>
              <div className="planner-stat-label">Next Exam Countdown</div>
              <div className="planner-stat-val" style={{ color: nearestExam && nearestExam.days <= 7 ? '#DC2626' : 'inherit' }}>
                {nearestExam ? `${nearestExam.days} days left` : 'None Scheduled'}
              </div>
              <div className="planner-stat-sub" title={nearestExam?.subjectName || ''}>
                {nearestExam ? `${nearestExam.subjectCode} (${nearestExam.examType.slice(0, 16)}...)` : 'Add an exam below'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Navigation Sub-Tabs */}
      <nav className="planner-nav-bar" aria-label="Study Planner Navigation">
        <button
          type="button"
          className={`planner-tab-btn ${activeTab === 'daily' ? 'active' : ''}`}
          onClick={() => setActiveTab('daily')}
        >
          <IconClock size={16} />
          <span>Daily Planner</span>
          <span className="planner-tab-badge">{activeDateSessions.length}</span>
        </button>

        <button
          type="button"
          className={`planner-tab-btn ${activeTab === 'weekly' ? 'active' : ''}`}
          onClick={() => setActiveTab('weekly')}
        >
          <IconCalendar size={16} />
          <span>Weekly Calendar</span>
        </button>

        <button
          type="button"
          className={`planner-tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          <IconCheckSquare size={16} />
          <span>Task Manager</span>
          <span className="planner-tab-badge">{tasks.filter((t) => !t.completed).length} pending</span>
        </button>

        <button
          type="button"
          className={`planner-tab-btn ${activeTab === 'exams' ? 'active' : ''}`}
          onClick={() => setActiveTab('exams')}
        >
          <IconAward size={16} />
          <span>Exam Countdown</span>
          <span className="planner-tab-badge">{upcomingExams.length}</span>
        </button>

        <button
          type="button"
          className={`planner-tab-btn ${activeTab === 'goals' ? 'active' : ''}`}
          onClick={() => setActiveTab('goals')}
        >
          <IconSliders size={16} />
          <span>Study Goals</span>
        </button>

        <button
          type="button"
          className={`planner-tab-btn ${activeTab === 'pomodoro' ? 'active' : ''}`}
          onClick={() => setActiveTab('pomodoro')}
        >
          <IconPlay size={16} />
          <span>Pomodoro Timer</span>
          {timerStatus === 'running' && <span className="planner-tab-badge" style={{ background: '#DC2626', color: '#FFF' }}>ACTIVE</span>}
        </button>

        <button
          type="button"
          className={`planner-tab-btn ${activeTab === 'suggestions' ? 'active' : ''}`}
          onClick={() => setActiveTab('suggestions')}
        >
          <IconSparkles size={16} />
          <span>Smart Prioritization</span>
          <span className="planner-tab-badge">AI Advisor</span>
        </button>
      </nav>

      {/* ========================================================= */}
      {/* FEATURE 1: DAILY PLANNER                                  */}
      {/* ========================================================= */}
      {activeTab === 'daily' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Controls Bar with Date Switcher */}
          <div className="daily-planner-controls">
            <div className="daily-date-picker-wrap">
              <button
                type="button"
                className="daily-date-nav-btn"
                onClick={() => {
                  const [y, m, d] = dailySelectedDate.split('-').map(Number);
                  const cur = new Date(y, m - 1, d);
                  cur.setDate(cur.getDate() - 1);
                  setDailySelectedDate(cur.toISOString().split('T')[0]);
                }}
                title="Previous Day"
              >
                <IconArrowLeft size={14} />
                <span>Prev Day</span>
              </button>

              <input
                type="date"
                value={dailySelectedDate}
                onChange={(e) => setDailySelectedDate(e.target.value)}
                className="task-filter-select"
                style={{ fontWeight: 700 }}
              />

              <button
                type="button"
                className="daily-date-nav-btn"
                onClick={() => {
                  const [y, m, d] = dailySelectedDate.split('-').map(Number);
                  const cur = new Date(y, m - 1, d);
                  cur.setDate(cur.getDate() + 1);
                  setDailySelectedDate(cur.toISOString().split('T')[0]);
                }}
                title="Next Day"
              >
                <span>Next Day</span>
                <IconArrowRight size={14} />
              </button>

              {dailySelectedDate !== todayStr && (
                <button
                  type="button"
                  className="daily-date-nav-btn"
                  onClick={() => setDailySelectedDate(todayStr)}
                  style={{ backgroundColor: 'var(--sage-100)', color: 'var(--forest-900)' }}
                >
                  Jump to Today
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {activeDateSessions.length} session{activeDateSessions.length === 1 ? '' : 's'} scheduled
              </span>
              <button
                type="button"
                className="add-task-btn"
                onClick={() => {
                  setEditingSessionId(null);
                  setIsAddingSession((prev) => !prev);
                }}
              >
                <IconPlus size={15} />
                <span>{isAddingSession ? 'Close Form' : 'Schedule Session'}</span>
              </button>
            </div>
          </div>

          {/* Add / Edit Daily Session Form */}
          {isAddingSession && (
            <form onSubmit={handleSaveSessionForm} className="planner-form-card">
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--forest-950)' }}>
                {editingSessionId ? 'Edit Study Session' : `Schedule Session for ${formatDateDisplay(dailySelectedDate)}`}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Course Subject *
                  </label>
                  <select
                    className="add-task-input"
                    value={sessionForm.subjectId}
                    onChange={(e) => setSessionForm({ ...sessionForm, subjectId: e.target.value })}
                  >
                    {SEMESTER_1_SUBJECTS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.shortName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Session Type
                  </label>
                  <select
                    className="add-task-input"
                    value={sessionForm.type}
                    onChange={(e) => setSessionForm({ ...sessionForm, type: e.target.value })}
                  >
                    <option value="study">Deep Study & Theory</option>
                    <option value="practice">Problem Solving & Practice</option>
                    <option value="revision">Formula & Notes Revision</option>
                    <option value="lab">Lab Assessment & Coding</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    className="add-task-input"
                    value={sessionForm.startTime}
                    onChange={(e) => setSessionForm({ ...sessionForm, startTime: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    className="add-task-input"
                    value={sessionForm.endTime}
                    onChange={(e) => setSessionForm({ ...sessionForm, endTime: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Priority
                  </label>
                  <select
                    className="add-task-input"
                    value={sessionForm.priority}
                    onChange={(e) => setSessionForm({ ...sessionForm, priority: e.target.value })}
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Study Topic & Objectives *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Practice Eigenvalues and Cayley-Hamilton problems..."
                  className="add-task-input"
                  value={sessionForm.topic}
                  onChange={(e) => setSessionForm({ ...sessionForm, topic: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="sem2-action-btn"
                  onClick={() => setIsAddingSession(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="add-task-btn">
                  <span>{editingSessionId ? 'Save Changes' : 'Schedule Session'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Chronological Sessions Timeline */}
          <div className="daily-sessions-timeline">
            {activeDateSessions.map((session) => (
              <div
                key={session.id}
                className={`daily-session-card priority-${session.priority || 'medium'} ${session.completed ? 'completed' : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
                  <button
                    type="button"
                    className={`task-checkbox-btn ${session.completed ? 'checked' : ''}`}
                    onClick={() => handleToggleSessionComplete(session.id)}
                    aria-label={session.completed ? 'Mark incomplete' : 'Mark completed'}
                  >
                    {session.completed ? <IconCheckCircle size={22} /> : <IconCircle size={22} />}
                  </button>

                  <div className="session-time-block">
                    <span className="session-time-span">
                      <IconClock size={14} />
                      <span>{session.startTime} - {session.endTime}</span>
                    </span>
                    <span className="session-duration-tag">
                      Scheduled Window
                    </span>
                  </div>

                  <div className="session-details-block">
                    <div className="session-topic-title" style={{ textDecoration: session.completed ? 'line-through' : 'none' }}>
                      {session.topic}
                    </div>

                    <div className="session-meta-row">
                      <span className="task-subject-tag">{session.subjectCode || 'GEN'}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {session.subjectName}
                      </span>
                      <span
                        style={{
                          fontSize: '10.5px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          padding: '1px 7px',
                          borderRadius: '4px',
                          backgroundColor: session.priority === 'high' ? '#FEE2E2' : session.priority === 'medium' ? '#FEF3C7' : '#E0E7FF',
                          color: session.priority === 'high' ? '#991B1B' : session.priority === 'medium' ? '#92400E' : '#3730A3'
                        }}
                      >
                        {session.priority}
                      </span>
                      <span className="task-subject-tag" style={{ textTransform: 'capitalize' }}>
                        {session.type || 'Study'}
                      </span>
                      {session.completed && (
                        <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: 700 }}>
                          ✓ Completed & Logged
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Session Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {!session.completed && (
                    <button
                      type="button"
                      className="section-action-btn"
                      style={{ backgroundColor: 'var(--sage-100)', color: 'var(--forest-900)', border: 'none' }}
                      onClick={() => launchPomodoroFor(session.subjectCode, session.topic)}
                      title="Launch in Focus Timer"
                    >
                      <IconPlay size={13} />
                      <span>Focus Now</span>
                    </button>
                  )}
                  <button
                    type="button"
                    className="section-action-btn"
                    onClick={() => handleStartEditSession(session)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="task-delete-btn"
                    style={{ opacity: 1 }}
                    onClick={() => handleDeleteSession(session.id)}
                    title="Delete session"
                  >
                    <IconTrash size={15} />
                  </button>
                </div>
              </div>
            ))}

            {activeDateSessions.length === 0 && (
              <div className="analytics-card" style={{ padding: '48px 24px', textAlign: 'center' }}>
                <IconCalendar size={36} style={{ color: 'var(--sage-400)', margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--forest-950)', margin: '0 0 6px' }}>
                  No Study Sessions Scheduled for {formatDateDisplay(dailySelectedDate)}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '0 0 16px' }}>
                  Organize your engineering day by scheduling specific topic blocks, labs, and formula revision.
                </p>
                <button
                  type="button"
                  className="add-task-btn"
                  onClick={() => {
                    setEditingSessionId(null);
                    setIsAddingSession(true);
                  }}
                >
                  <IconPlus size={15} />
                  <span>Schedule First Session</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* FEATURE 2: WEEKLY CALENDAR                                */}
      {/* ========================================================= */}
      {activeTab === 'weekly' && (
        <div className="weekly-calendar-wrap">
          {/* Week Navigation Header */}
          <div className="weekly-nav-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                className="daily-date-nav-btn"
                onClick={() => setWeekOffset((prev) => prev - 1)}
              >
                <IconArrowLeft size={14} />
                <span>Previous Week</span>
              </button>

              <button
                type="button"
                className="daily-date-nav-btn"
                onClick={() => setWeekOffset(0)}
                style={{ backgroundColor: weekOffset === 0 ? 'var(--forest-850)' : 'var(--bg-card-warm)', color: weekOffset === 0 ? '#FFFFFF' : 'var(--forest-900)' }}
              >
                This Week (Current)
              </button>

              <button
                type="button"
                className="daily-date-nav-btn"
                onClick={() => setWeekOffset((prev) => prev + 1)}
              >
                <span>Next Week</span>
                <IconArrowRight size={14} />
              </button>
            </div>

            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--forest-950)' }}>
              Week: {weekDays[0].monthName} {weekDays[0].dayNum} – {weekDays[6].monthName} {weekDays[6].dayNum}, {weekDays[0]?.year}
            </div>

            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', fontSize: '11.5px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#2F6B48', display: 'inline-block' }} />
                <span>Study Sessions</span>
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#EA580C', display: 'inline-block' }} />
                <span>Assignments</span>
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#DC2626', display: 'inline-block' }} />
                <span>Exams</span>
              </span>
            </div>
          </div>

          {/* 7-Day Interactive Columns Grid */}
          <div className="weekly-grid-container">
            {weekDays.map((day) => {
              // Sessions for this day
              const daySessions = plannedSessions.filter((s) => s.date === day.dateStr);
              // Assignments due on this day
              const dayAssignments = assignments.filter((a) => a.dueDate === day.dateStr);
              // Exams scheduled on this day
              const dayExams = upcomingExams.filter((e) => e.date === day.dateStr);

              return (
                <div key={day.dateStr} className={`weekly-day-col ${day.isToday ? 'is-today' : ''}`}>
                  <div className="weekly-day-header">
                    <div>
                      <div className="weekly-day-name">{day.name}</div>
                      <div className="weekly-day-date">{day.dayNum}</div>
                    </div>
                    {day.isToday && <span className="weekly-today-tag">Today</span>}
                  </div>

                  {/* Day Activities List */}
                  <div className="weekly-day-events">
                    {/* 1. Exams */}
                    {dayExams.map((exam) => (
                      <div
                        key={exam.id}
                        className="weekly-event-pill weekly-event-exam"
                        onClick={() => setActiveTab('exams')}
                        title={`Exam: ${exam.examType} (${exam.subjectCode}) at ${exam.time}`}
                      >
                        <div style={{ fontWeight: 800, fontSize: '11px', textTransform: 'uppercase' }}>
                          🚨 EXAM: {exam.subjectCode}
                        </div>
                        <div style={{ fontSize: '11.5px', marginTop: '2px', fontWeight: 600 }}>
                          {exam.examType}
                        </div>
                        <div style={{ fontSize: '10.5px', opacity: 0.85, marginTop: '2px' }}>
                          {exam.time} · {exam.room}
                        </div>
                      </div>
                    ))}

                    {/* 2. Assignments */}
                    {dayAssignments.map((asg) => (
                      <div
                        key={asg.id}
                        className="weekly-event-pill weekly-event-assignment"
                        onClick={() => setActiveTab('tasks')}
                        title={`Assignment Due: ${asg.title}`}
                      >
                        <div style={{ fontWeight: 700, fontSize: '10.5px', textTransform: 'uppercase' }}>
                          📋 DUE: {asg.subjectCode || asg.subjectId}
                        </div>
                        <div style={{ fontSize: '11.5px', marginTop: '2px' }}>
                          {asg.title}
                        </div>
                      </div>
                    ))}

                    {/* 3. Planned Study Sessions */}
                    {daySessions.map((session) => (
                      <div
                        key={session.id}
                        className="weekly-event-pill weekly-event-session"
                        onClick={() => openAddSessionForDate(day.dateStr)}
                        title={`Study: ${session.topic} (${session.startTime} - ${session.endTime})`}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: '11px' }}>
                            {session.subjectCode}
                          </span>
                          <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                            {session.startTime}
                          </span>
                        </div>
                        <div style={{ fontSize: '11.5px', marginTop: '2px', textDecoration: session.completed ? 'line-through' : 'none' }}>
                          {session.topic}
                        </div>
                        {session.completed && (
                          <div style={{ fontSize: '10px', color: '#16A34A', fontWeight: 700, marginTop: '2px' }}>
                            ✓ Done
                          </div>
                        )}
                      </div>
                    ))}

                    {daySessions.length === 0 && dayAssignments.length === 0 && dayExams.length === 0 && (
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0', fontStyle: 'italic' }}>
                        No events
                      </div>
                    )}
                  </div>

                  {/* Add button on day footer */}
                  <button
                    type="button"
                    className="weekly-add-btn"
                    onClick={() => openAddSessionForDate(day.dateStr)}
                  >
                    <IconPlus size={12} />
                    <span>Add</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* FEATURE 3: TASK MANAGER                                   */}
      {/* ========================================================= */}
      {activeTab === 'tasks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Filter Bar */}
          <div className="task-manager-filters">
            {/* Search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-card-warm)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '6px 10px', flex: '1 1 200px' }}>
              <IconSearch size={14} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search tasks, assignments, projects..."
                value={taskSearch}
                onChange={(e) => setTaskSearch(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '13px' }}
              />
            </div>

            {/* Subject Filter */}
            <select
              className="task-filter-select"
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
            >
              <option value="ALL">All Subjects</option>
              {SEMESTER_1_SUBJECTS.map((s) => (
                <option key={s.id} value={s.code}>
                  {s.code} - {s.shortName}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              className="task-filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            {/* Priority Filter */}
            <select
              className="task-filter-select"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="ALL">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>

            {/* Type Filter */}
            <select
              className="task-filter-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="ALL">All Task Types</option>
              <option value="assignment">Assignments</option>
              <option value="homework">Homework</option>
              <option value="project">Projects</option>
              <option value="study">Personal Study</option>
            </select>

            <button
              type="button"
              className="add-task-btn"
              onClick={() => {
                setEditingTaskId(null);
                setIsAddingTask((prev) => !prev);
              }}
              style={{ marginLeft: 'auto' }}
            >
              <IconPlus size={15} />
              <span>{isAddingTask ? 'Close Form' : 'New Task'}</span>
            </button>
          </div>

          {/* Add / Edit Task Form */}
          {isAddingTask && (
            <form onSubmit={handleSaveTaskForm} className="planner-form-card">
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--forest-950)' }}>
                {editingTaskId ? 'Edit Academic Task' : 'Create New Academic Task'}
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Complete Engineering Physics Lab Report on Lasers..."
                  className="add-task-input"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Description / Specific Requirements
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Include calculations for acceptance angle and numerical aperture..."
                  className="add-task-input"
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Course Subject
                  </label>
                  <select
                    className="add-task-input"
                    value={taskForm.subjectCode}
                    onChange={(e) => setTaskForm({ ...taskForm, subjectCode: e.target.value })}
                  >
                    {SEMESTER_1_SUBJECTS.map((s) => (
                      <option key={s.id} value={s.code}>
                        {s.code} - {s.shortName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Task Type
                  </label>
                  <select
                    className="add-task-input"
                    value={taskForm.type}
                    onChange={(e) => setTaskForm({ ...taskForm, type: e.target.value })}
                  >
                    <option value="assignment">Assignment</option>
                    <option value="homework">Homework</option>
                    <option value="project">Project Work</option>
                    <option value="study">Personal Study</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Deadline Date
                  </label>
                  <input
                    type="date"
                    className="add-task-input"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Deadline Time
                  </label>
                  <input
                    type="time"
                    className="add-task-input"
                    value={taskForm.dueTime}
                    onChange={(e) => setTaskForm({ ...taskForm, dueTime: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Priority
                  </label>
                  <select
                    className="add-task-input"
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Status
                  </label>
                  <select
                    className="add-task-input"
                    value={taskForm.status}
                    onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="sem2-action-btn"
                  onClick={() => setIsAddingTask(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="add-task-btn">
                  <span>{editingTaskId ? 'Save Changes' : 'Create Task'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Tasks List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredTasks.map((task) => {
              const currentStatus = task.status || (task.completed ? 'completed' : 'pending');
              const isDone = currentStatus === 'completed';
              const daysLeft = task.dueDate ? getDaysRemaining(task.dueDate) : null;
              const isOverdue = daysLeft !== null && daysLeft < 0 && !isDone;

              return (
                <div
                  key={task.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isDone ? 'rgba(245, 243, 238, 0.7)' : '#FFFFFF',
                    border: `1px solid ${isOverdue ? '#FCA5A5' : 'var(--border-card)'}`,
                    boxShadow: 'var(--shadow-sm)',
                    gap: '14px',
                    flexWrap: 'wrap'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1, minWidth: '260px' }}>
                    <button
                      type="button"
                      className={`task-checkbox-btn ${isDone ? 'checked' : ''}`}
                      onClick={() => handleToggleTaskStatus(task.id, isDone ? 'pending' : 'completed')}
                      aria-label={isDone ? 'Mark incomplete' : 'Mark completed'}
                    >
                      {isDone ? <IconCheckCircle size={20} /> : <IconCircle size={20} />}
                    </button>

                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '14.5px',
                        fontWeight: 700,
                        color: isDone ? 'var(--text-muted)' : 'var(--forest-950)',
                        textDecoration: isDone ? 'line-through' : 'none'
                      }}>
                        {task.title}
                      </div>

                      {task.description && (
                        <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>
                          {task.description}
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                        <span className="task-subject-tag">{task.subjectTag || 'General'}</span>

                        <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)' }}>
                          {task.type || 'study'}
                        </span>

                        <span style={{ fontSize: '12px', color: isOverdue ? '#DC2626' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: isOverdue ? 700 : 500 }}>
                          <IconClock size={12} />
                          <span>
                            {task.dueDate} · {task.dueTime}
                            {isOverdue && ' (OVERDUE)'}
                            {daysLeft === 0 && ' (DUE TODAY)'}
                            {daysLeft === 1 && ' (DUE TOMORROW)'}
                          </span>
                        </span>

                        <span
                          style={{
                            fontSize: '10.5px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            backgroundColor: task.priority === 'high' ? '#FEE2E2' : task.priority === 'medium' ? '#FEF3C7' : '#E0E7FF',
                            color: task.priority === 'high' ? '#991B1B' : task.priority === 'medium' ? '#92400E' : '#3730A3'
                          }}
                        >
                          {task.priority}
                        </span>

                        {/* Status Dropdown */}
                        <select
                          value={currentStatus}
                          onChange={(e) => handleToggleTaskStatus(task.id, e.target.value)}
                          style={{
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 700,
                            border: '1px solid var(--border-card)',
                            backgroundColor: currentStatus === 'completed' ? '#DCFCE7' : currentStatus === 'in-progress' ? '#E0E7FF' : '#FEF3C7',
                            color: currentStatus === 'completed' ? '#166534' : currentStatus === 'in-progress' ? '#3730A3' : '#92400E'
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {!isDone && (
                      <button
                        type="button"
                        className="section-action-btn"
                        style={{ backgroundColor: 'var(--sage-100)', color: 'var(--forest-900)', border: 'none' }}
                        onClick={() => launchPomodoroFor(task.subjectTag || 'GEN', task.title)}
                        title="Work on this task in Focus Timer"
                      >
                        <IconPlay size={12} />
                        <span>Focus</span>
                      </button>
                    )}
                    <button
                      type="button"
                      className="section-action-btn"
                      onClick={() => handleStartEditTask(task)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="task-delete-btn"
                      style={{ opacity: 1 }}
                      onClick={() => handleDeleteTask(task.id)}
                      title="Delete task"
                    >
                      <IconTrash size={15} />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredTasks.length === 0 && (
              <div className="analytics-card" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No tasks match your active filter criteria. Click "New Task" to add your next academic task!
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* FEATURE 4: EXAM COUNTDOWN                                 */}
      {/* ========================================================= */}
      {activeTab === 'exams' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-950)', margin: '0 0 4px' }}>
                Semester 1 Examination Countdown
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
                Track exam dates, venue halls, and syllabus unit coverage. Urgent examinations within 7 days are highlighted.
              </p>
            </div>

            <button
              type="button"
              className="add-task-btn"
              onClick={() => {
                setEditingExamId(null);
                setIsAddingExam((prev) => !prev);
              }}
            >
              <IconPlus size={15} />
              <span>{isAddingExam ? 'Close Form' : 'Add Examination Date'}</span>
            </button>
          </div>

          {/* Add / Edit Exam Form */}
          {isAddingExam && (
            <form onSubmit={handleSaveExamForm} className="planner-form-card">
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--forest-950)' }}>
                {editingExamId ? 'Edit Examination Entry' : 'Add Upcoming Examination'}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Course Subject *
                  </label>
                  <select
                    className="add-task-input"
                    value={examForm.subjectId}
                    onChange={(e) => setExamForm({ ...examForm, subjectId: e.target.value })}
                  >
                    {SEMESTER_1_SUBJECTS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.code} - {s.shortName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Examination Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mid-Semester Theory Exam"
                    className="add-task-input"
                    value={examForm.examType}
                    onChange={(e) => setExamForm({ ...examForm, examType: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Exam Date *
                  </label>
                  <input
                    type="date"
                    required
                    className="add-task-input"
                    value={examForm.date}
                    onChange={(e) => setExamForm({ ...examForm, date: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Exam Time
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 09:30 AM"
                    className="add-task-input"
                    value={examForm.time}
                    onChange={(e) => setExamForm({ ...examForm, time: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Examination Room / Venue
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lecture Hall 204 / Turing Lab"
                    className="add-task-input"
                    value={examForm.room}
                    onChange={(e) => setExamForm({ ...examForm, room: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Target Score / GPA Goal
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 92% / Grade A+"
                    className="add-task-input"
                    value={examForm.targetScore}
                    onChange={(e) => setExamForm({ ...examForm, targetScore: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Syllabus Units / Key Topics Covered
                </label>
                <input
                  type="text"
                  placeholder="e.g. Unit 1 (Matrices & Eigenvalues) and Unit 2 (Calculus of Several Variables)"
                  className="add-task-input"
                  value={examForm.syllabusUnits}
                  onChange={(e) => setExamForm({ ...examForm, syllabusUnits: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="sem2-action-btn"
                  onClick={() => setIsAddingExam(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="add-task-btn">
                  <span>{editingExamId ? 'Save Changes' : 'Add Examination'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Exam Cards Grid */}
          <div className="exam-countdown-grid">
            {sortedExams.map((exam) => {
              const daysLeft = getDaysRemaining(exam.date);
              const isUrgent = daysLeft !== null && daysLeft <= 7 && daysLeft >= 0;
              const isPassed = daysLeft !== null && daysLeft < 0;

              return (
                <div key={exam.id} className={`exam-card ${isUrgent ? 'urgent' : ''}`}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                      <span className="task-subject-tag">{exam.subjectCode || 'Course'}</span>
                      <span className={`exam-countdown-badge ${isUrgent ? 'urgent' : 'normal'}`}>
                        {isPassed
                          ? 'Exam Passed'
                          : daysLeft === 0
                          ? '🚨 TODAY'
                          : daysLeft === 1
                          ? '🚨 TOMORROW'
                          : `${daysLeft} Days Remaining`}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--forest-950)', margin: '0 0 4px' }}>
                      {exam.examType}
                    </h3>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                      {exam.subjectName}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <div>📅 <strong>Date:</strong> {formatDateDisplay(exam.date)} at {exam.time}</div>
                      <div>📍 <strong>Venue:</strong> {exam.room || 'To be announced'}</div>
                      <div>🎯 <strong>Target Score:</strong> {exam.targetScore || '85%+'}</div>
                      {exam.syllabusUnits && (
                        <div style={{ marginTop: '4px', padding: '6px 8px', background: 'var(--bg-card-warm)', borderRadius: '4px' }}>
                          <strong>Syllabus:</strong> {exam.syllabusUnits}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                    <button
                      type="button"
                      className="section-action-btn"
                      onClick={() => onNavigate?.('exam-prep')}
                    >
                      <IconAward size={13} />
                      <span>Revision & Mocks</span>
                    </button>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        className="section-action-btn"
                        onClick={() => handleStartEditExam(exam)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="task-delete-btn"
                        style={{ opacity: 1 }}
                        onClick={() => handleDeleteExam(exam.id)}
                        title="Delete exam"
                      >
                        <IconTrash size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {sortedExams.length === 0 && (
              <div className="analytics-card" style={{ gridColumn: '1 / -1', padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No exams currently scheduled. Click "Add Examination Date" to track your mid-term and final tests.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* FEATURE 5: STUDY GOALS                                    */}
      {/* ========================================================= */}
      {activeTab === 'goals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Goal vs Completed Comparison Cards */}
          <div className="goals-comparison-grid">
            {/* Daily Goal Card */}
            <div className="goal-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="task-subject-tag">Daily Study Tracker</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--forest-900)' }}>
                  Target: {dailyGoalTarget} hrs
                </span>
              </div>

              <div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--forest-950)' }}>
                  {todayCompletedHours} <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-muted)' }}>/ {dailyGoalTarget} hrs</span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {dailyPercent >= 100
                    ? '🎉 Goal achieved for today! Great dedication.'
                    : `${(dailyGoalTarget - todayCompletedHours).toFixed(1)} hrs remaining today`}
                </div>
              </div>

              <div className="goal-progress-bar-bg">
                <div
                  className="goal-progress-bar-fill"
                  style={{
                    width: `${dailyPercent}%`,
                    backgroundColor: dailyPercent >= 100 ? '#16A34A' : 'var(--forest-850)'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
                <span>Planned: {todayPlannedHours} hrs</span>
                <span>Completed: {todayCompletedHours} hrs ({dailyPercent}%)</span>
              </div>
            </div>

            {/* Weekly Goal Card */}
            <div className="goal-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="task-subject-tag">Weekly Focus Tracker</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--forest-900)' }}>
                  Target: {weeklyGoalTarget} hrs
                </span>
              </div>

              <div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--forest-950)' }}>
                  {weekCompletedHours} <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-muted)' }}>/ {weeklyGoalTarget} hrs</span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {weeklyPercent >= 100
                    ? '🎉 Weekly target achieved!'
                    : `${(weeklyGoalTarget - weekCompletedHours).toFixed(1)} hrs remaining this week`}
                </div>
              </div>

              <div className="goal-progress-bar-bg">
                <div
                  className="goal-progress-bar-fill"
                  style={{
                    width: `${weeklyPercent}%`,
                    backgroundColor: weeklyPercent >= 100 ? '#16A34A' : 'var(--sage-600)'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
                <span>Planned This Week: {weekPlannedHours} hrs</span>
                <span>Completed: {weekCompletedHours} hrs ({weeklyPercent}%)</span>
              </div>
            </div>
          </div>

          {/* Editable Study Targets Form */}
          <form onSubmit={handleSaveGoalsForm} className="planner-form-card">
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--forest-950)' }}>
              Configure Personal Academic Goals & Target Study Hours
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
              These goals calibrate your daily recommendations, focus timer quotas, and dashboard progress bars.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Daily Study Hours Target
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="16"
                  required
                  className="add-task-input"
                  value={goalsForm.dailyTargetHours}
                  onChange={(e) => setGoalsForm({ ...goalsForm, dailyTargetHours: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Weekly Study Hours Target
                </label>
                <input
                  type="number"
                  step="1"
                  min="5"
                  max="80"
                  required
                  className="add-task-input"
                  value={goalsForm.weeklyHoursTarget}
                  onChange={(e) => setGoalsForm({ ...goalsForm, weeklyHoursTarget: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Primary Academic Focus
                </label>
                <input
                  type="text"
                  required
                  className="add-task-input"
                  value={goalsForm.primaryFocus}
                  onChange={(e) => setGoalsForm({ ...goalsForm, primaryFocus: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Target Semester Grade / GPA
                </label>
                <input
                  type="text"
                  className="add-task-input"
                  value={goalsForm.targetGrade}
                  onChange={(e) => setGoalsForm({ ...goalsForm, targetGrade: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Personal Study Motto
              </label>
              <input
                type="text"
                className="add-task-input"
                value={goalsForm.personalMotto}
                onChange={(e) => setGoalsForm({ ...goalsForm, personalMotto: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="add-task-btn">
                <span>Save Study Targets</span>
              </button>
            </div>
          </form>

          {/* Subject-Wise Study Distribution */}
          <div className="analytics-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--forest-950)', margin: '0 0 6px' }}>
              Subject Study Hours Distribution
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 16px' }}>
              Logged from your verified Pomodoro and planned focus sessions.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {subjectHoursDistribution.map((item) => (
                <div key={item.code} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ width: '80px', fontSize: '12.5px', fontWeight: 700, color: 'var(--forest-900)' }}>
                    {item.code}
                  </span>
                  <div style={{ flex: 1, height: '10px', background: 'var(--bg-card-alt)', borderRadius: '5px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(100, (item.hours / 10) * 100)}%`,
                        backgroundColor: 'var(--forest-850)',
                        borderRadius: '5px'
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', minWidth: '55px', textAlign: 'right' }}>
                    {item.hours} hrs
                  </span>
                </div>
              ))}

              {subjectHoursDistribution.length === 0 && (
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '16px' }}>
                  No sessions logged yet. Start a focus session in the Pomodoro tab to build your record!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* FEATURE 6: POMODORO FOCUS TIMER                           */}
      {/* ========================================================= */}
      {activeTab === 'pomodoro' && (
        <div className="pomodoro-box">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--forest-700)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
            <IconSparkles size={14} />
            <span>Engineering Deep Work Engine</span>
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--forest-950)', margin: '0 0 6px' }}>
            {timerMode === 'focus' ? 'Focus Session' : timerMode === 'shortBreak' ? 'Short Break' : timerMode === 'longBreak' ? 'Long Break' : 'Custom Work Session'}
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: '0 0 24px' }}>
            Completed sessions automatically record verified study hours into your academic profile.
          </p>

          {/* Mode Selector Buttons */}
          <div className="pomodoro-mode-pills">
            <button
              type="button"
              className={`pomodoro-mode-btn ${timerMode === 'focus' ? 'active' : ''}`}
              onClick={() => handleSelectTimerMode('focus', 25)}
            >
              25m Focus
            </button>
            <button
              type="button"
              className={`pomodoro-mode-btn ${timerMode === 'shortBreak' ? 'active' : ''}`}
              onClick={() => handleSelectTimerMode('shortBreak', 5)}
            >
              5m Short Break
            </button>
            <button
              type="button"
              className={`pomodoro-mode-btn ${timerMode === 'longBreak' ? 'active' : ''}`}
              onClick={() => handleSelectTimerMode('longBreak', 15)}
            >
              15m Long Break
            </button>
            <button
              type="button"
              className={`pomodoro-mode-btn ${timerMode === 'custom' ? 'active' : ''}`}
              onClick={() => handleSelectTimerMode('custom', customMinutesInput)}
            >
              Custom ({customMinutesInput}m)
            </button>
          </div>

          {/* Custom Duration Form if custom mode */}
          {timerMode === 'custom' && timerStatus === 'idle' && (
            <form onSubmit={handleApplyCustomMinutes} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', margin: '16px auto 0', maxWidth: '280px' }}>
              <input
                type="number"
                min="1"
                max="180"
                value={customMinutesInput}
                onChange={(e) => setCustomMinutesInput(e.target.value)}
                className="add-task-input"
                style={{ width: '90px', textAlign: 'center' }}
              />
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>minutes</span>
              <button type="submit" className="section-action-btn" style={{ padding: '6px 12px' }}>
                Set
              </button>
            </form>
          )}

          {/* Big Circular Display */}
          <div className="pomodoro-ring-wrap">
            {/* SVG Ring Progress */}
            <svg width="240" height="240" viewBox="0 0 240 240" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
              <circle
                cx="120"
                cy="120"
                r="105"
                stroke="var(--bg-card-alt)"
                strokeWidth="10"
                fill="none"
              />
              <circle
                cx="120"
                cy="120"
                r="105"
                stroke={timerMode.includes('Break') ? 'var(--sage-500)' : 'var(--forest-850)'}
                strokeWidth="10"
                strokeDasharray={2 * Math.PI * 105}
                strokeDashoffset={(2 * Math.PI * 105) * (1 - secondsRemaining / (timerMinutes * 60))}
                strokeLinecap="round"
                fill="none"
                style={{ transition: 'stroke-dashoffset 0.8s linear' }}
              />
            </svg>

            {/* Time Countdown */}
            <div style={{ textAlign: 'center', zIndex: 1 }}>
              <div className="pomodoro-time-display">
                {Math.floor(secondsRemaining / 60).toString().padStart(2, '0')}:
                {(secondsRemaining % 60).toString().padStart(2, '0')}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
                {timerStatus === 'running' ? 'Focusing...' : timerStatus === 'paused' ? 'Paused' : 'Ready'}
              </div>
            </div>
          </div>

          {/* Focus Subject & Topic Selectors */}
          <div style={{ maxWidth: '340px', margin: '0 auto 24px', display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                Study Course:
              </label>
              <select
                className="add-task-input"
                value={timerSubjectCode}
                onChange={(e) => setTimerSubjectCode(e.target.value)}
                disabled={timerStatus === 'running'}
              >
                {SEMESTER_1_SUBJECTS.map((s) => (
                  <option key={s.id} value={s.code}>
                    {s.code} - {s.shortName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                Focus Topic:
              </label>
              <input
                type="text"
                placeholder="e.g. Eigenvalues & Vector Spaces..."
                className="add-task-input"
                value={timerTopic}
                onChange={(e) => setTimerTopic(e.target.value)}
                disabled={timerStatus === 'running'}
              />
            </div>
          </div>

          {/* Timer Controls */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {timerStatus === 'idle' && (
              <button
                type="button"
                className="add-task-btn"
                style={{ padding: '12px 32px', fontSize: '15px' }}
                onClick={handleStartTimer}
              >
                <IconPlay size={16} />
                <span>Start Session</span>
              </button>
            )}

            {timerStatus === 'running' && (
              <>
                <button
                  type="button"
                  className="sem2-action-btn"
                  style={{ padding: '12px 28px', fontSize: '15px', borderColor: '#F59E0B' }}
                  onClick={handlePauseTimer}
                >
                  <span>Pause Timer</span>
                </button>
                <button
                  type="button"
                  className="section-action-btn"
                  style={{ padding: '12px 20px', fontSize: '13px' }}
                  onClick={handleManualLogElapsed}
                  title="Log actual minutes focused so far"
                >
                  <span>Log & Finish Now</span>
                </button>
              </>
            )}

            {timerStatus === 'paused' && (
              <>
                <button
                  type="button"
                  className="add-task-btn"
                  style={{ padding: '12px 28px', fontSize: '15px' }}
                  onClick={handleResumeTimer}
                >
                  <IconPlay size={16} />
                  <span>Resume</span>
                </button>
                <button
                  type="button"
                  className="section-action-btn"
                  style={{ padding: '12px 20px', fontSize: '13px' }}
                  onClick={handleManualLogElapsed}
                >
                  <span>Log Elapsed & Finish</span>
                </button>
                <button
                  type="button"
                  className="sem2-action-btn"
                  style={{ padding: '12px 18px', fontSize: '13px' }}
                  onClick={handleResetTimer}
                >
                  <IconReset size={16} />
                  <span>Reset</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* FEATURE 7: SMART PRIORITIZATION & AI ADVISOR              */}
      {/* ========================================================= */}
      {activeTab === 'suggestions' && (
        <div className="suggestions-split-grid">
          {/* Section A: Deterministic Rule-Based Prioritization */}
          <div className="suggestion-section-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--sage-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--forest-900)' }}>
                <IconZap size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--forest-950)', margin: 0 }}>
                  Algorithmic Priority Queue
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Deterministic heuristic: Deadline proximity + Exam weight + Priority level
                </span>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
              Calculated automatically from your deadlines, exam calendar, and syllabus completion.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {algorithmicRecommendations.map((rec) => (
                <div key={rec.id} className="suggestion-item-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className={`suggestion-reason-badge ${rec.reasonClass}`}>
                      {rec.badge}
                    </span>
                    <span className="task-subject-tag">{rec.subjectCode}</span>
                  </div>

                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--forest-950)' }}>
                    {rec.title}
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {rec.description}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                    <button
                      type="button"
                      className="section-action-btn"
                      style={{ fontSize: '11.5px', padding: '4px 10px' }}
                      onClick={() => {
                        setDailySelectedDate(todayStr);
                        setSessionForm({
                          subjectId: SEMESTER_1_SUBJECTS.find((s) => s.code === rec.subjectCode)?.id || 'math101',
                          topic: rec.title,
                          startTime: '10:00',
                          endTime: '11:30',
                          priority: 'high',
                          type: 'study'
                        });
                        setIsAddingSession(true);
                        setActiveTab('daily');
                      }}
                    >
                      <IconPlus size={12} />
                      <span>Add to Today</span>
                    </button>

                    <button
                      type="button"
                      className="section-action-btn"
                      style={{ fontSize: '11.5px', padding: '4px 10px', backgroundColor: 'var(--sage-100)', color: 'var(--forest-900)', border: 'none' }}
                      onClick={() => launchPomodoroFor(rec.subjectCode, rec.title)}
                    >
                      <IconPlay size={12} />
                      <span>Focus Now</span>
                    </button>
                  </div>
                </div>
              ))}

              {algorithmicRecommendations.length === 0 && (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  🎉 No urgent deadlines or deficit areas detected. You are well ahead on your schedule!
                </div>
              )}
            </div>
          </div>

          {/* Section B: Generative AI Study Advisor */}
          <div className="suggestion-section-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--forest-900)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF' }}>
                  <IconBot size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--forest-950)', margin: 0 }}>
                    AI Study Plan Advisor
                  </h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Generative strategy tailored to your cognitive workload
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="add-task-btn"
                style={{ padding: '7px 14px', fontSize: '12.5px' }}
                onClick={handleAskAIAdvisor}
                disabled={aiAdvisorLoading}
              >
                {aiAdvisorLoading ? (
                  <>
                    <IconRefreshCw size={14} className="spinning" />
                    <span>Analyzing Workload...</span>
                  </>
                ) : (
                  <>
                    <IconSparkles size={14} />
                    <span>{aiAdvisorAdvice ? 'Regenerate Strategy' : 'Ask AI Plan Advisor'}</span>
                  </>
                )}
              </button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
              The AI Advisor reviews your 7 course syllabi, pending tasks, and upcoming exams to design an optimal, fatigue-resilient schedule.
            </p>

            {aiAdvisorAdvice ? (
              <div
                style={{
                  background: 'var(--bg-card-warm)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '18px',
                  maxHeight: '520px',
                  overflowY: 'auto',
                  fontSize: '13.5px',
                  lineHeight: 1.6
                }}
              >
                <MarkdownRenderer content={aiAdvisorAdvice} />
              </div>
            ) : (
              <div
                className="analytics-card"
                style={{
                  padding: '36px 20px',
                  textAlign: 'center',
                  background: 'var(--bg-card-warm)',
                  border: '1px dashed var(--border-card)'
                }}
              >
                <IconBot size={36} style={{ color: 'var(--sage-400)', margin: '0 auto 10px' }} />
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--forest-950)', margin: '0 0 6px' }}>
                  Ready to optimize your semester routine?
                </h4>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '0 0 16px', maxWidth: '360px', marginLeft: 'auto', marginRight: 'auto' }}>
                  Click "Ask AI Plan Advisor" above to receive personalized study block advice, subject interleaving recommendations, and pacing strategies.
                </p>
                <button
                  type="button"
                  className="add-task-btn"
                  onClick={handleAskAIAdvisor}
                  disabled={aiAdvisorLoading}
                >
                  <IconSparkles size={14} />
                  <span>Generate AI Strategy</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
