import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  IconAward,
  IconClock,
  IconCheckCircle,
  IconCheckSquare,
  IconPlus,
  IconTrash,
  IconSearch,
  IconStar,
  IconBookmark,
  IconPython,
  IconExternalLink,
  IconReset,
  IconArrowLeft,
  IconArrowRight,
  IconX,
  IconBook
} from '../components/Icons';
import { getActiveCurriculumSubjects, getAllSubjectTopics, parseSemesterNumber } from '../data/curriculumData';
import {
  SAMPLE_PRACTICE_QUESTIONS,
  PYTHON_ASSESSMENT_QUESTIONS,
  SUBJECT_FORMULA_SHEETS,
  DEFAULT_EXAM_CHECKLIST
} from '../data/examQuestionBank';
import {
  getUpcomingExams,
  saveUpcomingExams,
  getCustomQuestions,
  saveCustomQuestions,
  getMockTestResults,
  saveMockTestResult,
  getBookmarkedQuestions,
  toggleBookmarkedQuestion,
  getExamRevisionChecklist,
  saveExamRevisionChecklist
} from '../services/storage';

// Module-level helper for days remaining countdown
function getDaysRemaining(targetDateStr) {
  if (!targetDateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(targetDateStr);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export default function ExamPrepView({
  profile,
  completedTopics = {},
  quizHistory = [],
  onShowToast,
  onNavigateToPython,
  onNavigate,
  customSubjects = [],
  subjectOverrides = {}
}) {
  const semNum = parseSemesterNumber(profile?.semester);
  const activeBranchId = profile?.branchId || 'cse';
  const branchName = profile?.branch || 'Computer Science and Engineering';
  const universityName = profile?.college || profile?.university || '';
  const universityId = profile?.universityId || '';

  const activeSubjects = useMemo(() => {
    return getActiveCurriculumSubjects({
      profile,
      university: universityName,
      college: universityName,
      universityId,
      branchId: activeBranchId,
      branch: branchName,
      semester: semNum,
      customSubjects,
      subjectOverrides
    });
  }, [profile, universityName, universityId, activeBranchId, branchName, semNum, customSubjects, subjectOverrides]);
  // Navigation tabs:
  // 'dashboard' | 'bank' | 'creator' | 'active-test' | 'results' | 'revision' | 'python-tests'
  const [activeTab, setActiveTab] = useState('dashboard');

  // ==========================================
  // PERSISTENT DATA STATES
  // ==========================================
  const [upcomingExams, setUpcomingExams] = useState(() => getUpcomingExams());
  const [customQuestions, setCustomQuestions] = useState(() => getCustomQuestions());
  const [mockTestResults, setMockTestResults] = useState(() => getMockTestResults());
  const [bookmarkedIds, setBookmarkedIds] = useState(() => getBookmarkedQuestions());
  const [revisionChecklist, setRevisionChecklist] = useState(() => {
    const stored = getExamRevisionChecklist();
    return stored && stored.length > 0 ? stored : DEFAULT_EXAM_CHECKLIST;
  });

  // Combine sample questions with user custom questions
  const allQuestions = useMemo(() => {
    return [...SAMPLE_PRACTICE_QUESTIONS, ...customQuestions];
  }, [customQuestions]);

  // Sync external events
  useEffect(() => {
    const handleExamsUpdate = () => setUpcomingExams(getUpcomingExams());
    const handleQuestionsUpdate = () => setCustomQuestions(getCustomQuestions());
    const handleResultsUpdate = () => setMockTestResults(getMockTestResults());
    const handleBookmarksUpdate = () => setBookmarkedIds(getBookmarkedQuestions());
    const handleChecklistUpdate = () => setRevisionChecklist(getExamRevisionChecklist());

    window.addEventListener('studynest-exams-updated', handleExamsUpdate);
    window.addEventListener('studynest-questions-updated', handleQuestionsUpdate);
    window.addEventListener('studynest-mock-results-updated', handleResultsUpdate);
    window.addEventListener('studynest-bookmarks-updated', handleBookmarksUpdate);
    window.addEventListener('studynest-exam-checklist-updated', handleChecklistUpdate);

    return () => {
      window.removeEventListener('studynest-exams-updated', handleExamsUpdate);
      window.removeEventListener('studynest-questions-updated', handleQuestionsUpdate);
      window.removeEventListener('studynest-mock-results-updated', handleResultsUpdate);
      window.removeEventListener('studynest-bookmarks-updated', handleBookmarksUpdate);
      window.removeEventListener('studynest-exam-checklist-updated', handleChecklistUpdate);
    };
  }, []);

  // ==========================================
  // UPCOMING EXAMS MODAL STATE
  // ==========================================
  const defaultSubjectCode = activeSubjects[0]?.code || 'MATH 101';
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [examForm, setExamForm] = useState(() => ({
    subjectCode: defaultSubjectCode,
    title: 'Midterm Examination',
    date: '',
    targetScore: 90,
    notes: 'Focus on core units and key formulas.'
  }));

  const handleSaveExam = (e) => {
    e.preventDefault();
    if (!examForm.title.trim() || !examForm.date) {
      onShowToast?.('Please specify exam title and date');
      return;
    }

    const matchedSubject = activeSubjects.find((s) => s.code === examForm.subjectCode);
    const newExam = {
      id: `exam-${Date.now()}`,
      title: examForm.title.trim(),
      subjectCode: examForm.subjectCode,
      subjectTitle: matchedSubject ? matchedSubject.title : 'Engineering Subject',
      date: examForm.date,
      targetScore: Number(examForm.targetScore) || 85,
      notes: examForm.notes.trim()
    };

    const updated = [...upcomingExams, newExam].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    setUpcomingExams(updated);
    saveUpcomingExams(updated);
    setIsExamModalOpen(false);
    onShowToast?.(`Exam scheduled: ${newExam.title}`);
  };

  const handleDeleteExam = (examId) => {
    const updated = upcomingExams.filter((e) => e.id !== examId);
    setUpcomingExams(updated);
    saveUpcomingExams(updated);
    onShowToast?.('Exam schedule removed');
  };

  // ==========================================
  // QUESTION BANK STATE & FILTERS
  // ==========================================
  const [bankSubjectFilter, setBankSubjectFilter] = useState('ALL');
  const [bankDifficultyFilter, setBankDifficultyFilter] = useState('ALL');
  const [bankSearchTerm, setBankSearchTerm] = useState('');
  const [expandedExplanationId, setExpandedExplanationId] = useState(null);

  // Custom question add/edit modal
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [questionForm, setQuestionForm] = useState(() => ({
    subjectCode: defaultSubjectCode,
    unit: 'Unit 1: Core Concepts',
    topic: 'Key Formulas',
    difficulty: 'Medium',
    question: '',
    option0: '',
    option1: '',
    option2: '',
    option3: '',
    correct: 0,
    explanation: ''
  }));

  const handleOpenAddQuestion = () => {
    setEditingQuestionId(null);
    setQuestionForm({
      subjectCode: bankSubjectFilter !== 'ALL' ? bankSubjectFilter : defaultSubjectCode,
      unit: 'Unit 1: Core Concepts',
      topic: 'Practice Problem',
      difficulty: 'Medium',
      question: '',
      option0: '',
      option1: '',
      option2: '',
      option3: '',
      correct: 0,
      explanation: ''
    });
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = (e) => {
    e.preventDefault();
    if (!questionForm.question.trim() || !questionForm.option0.trim() || !questionForm.option1.trim()) {
      onShowToast?.('Please fill in the question and options');
      return;
    }

    const matchedSubject = activeSubjects.find((s) => s.code === questionForm.subjectCode);
    const options = [
      questionForm.option0.trim(),
      questionForm.option1.trim(),
      questionForm.option2.trim() || 'None of the above',
      questionForm.option3.trim() || 'All of the above'
    ];

    if (editingQuestionId) {
      const updated = customQuestions.map((q) => {
        if (q.id === editingQuestionId) {
          return {
            ...q,
            subjectCode: questionForm.subjectCode,
            subjectTitle: matchedSubject ? matchedSubject.title : 'Engineering Subject',
            unit: questionForm.unit.trim(),
            topic: questionForm.topic.trim(),
            difficulty: questionForm.difficulty,
            question: questionForm.question.trim(),
            options,
            correct: Number(questionForm.correct),
            explanation: questionForm.explanation.trim()
          };
        }
        return q;
      });
      setCustomQuestions(updated);
      saveCustomQuestions(updated);
      onShowToast?.('Question updated');
    } else {
      const newQuestion = {
        id: `custom-q-${Date.now()}`,
        subjectCode: questionForm.subjectCode,
        subjectTitle: matchedSubject ? matchedSubject.title : 'Engineering Subject',
        unit: questionForm.unit.trim(),
        topic: questionForm.topic.trim(),
        difficulty: questionForm.difficulty,
        question: questionForm.question.trim(),
        options,
        correct: Number(questionForm.correct),
        explanation: questionForm.explanation.trim(),
        isSample: false
      };
      const updated = [newQuestion, ...customQuestions];
      setCustomQuestions(updated);
      saveCustomQuestions(updated);
      onShowToast?.('New custom question added to bank');
    }

    setIsQuestionModalOpen(false);
    setEditingQuestionId(null);
  };

  const handleDeleteQuestion = (qId) => {
    const updated = customQuestions.filter((q) => q.id !== qId);
    setCustomQuestions(updated);
    saveCustomQuestions(updated);
    onShowToast?.('Question removed');
  };

  const handleToggleBookmark = (qId, e) => {
    if (e) e.stopPropagation();
    const updated = toggleBookmarkedQuestion(qId);
    setBookmarkedIds(updated);
    onShowToast?.(updated.includes(qId) ? 'Question bookmarked for revision' : 'Bookmark removed');
  };

  const filteredBankQuestions = useMemo(() => {
    return allQuestions.filter((q) => {
      if (bankSubjectFilter !== 'ALL' && q.subjectCode !== bankSubjectFilter) return false;
      if (bankDifficultyFilter !== 'ALL' && q.difficulty !== bankDifficultyFilter) return false;
      if (bankSearchTerm.trim()) {
        const query = bankSearchTerm.toLowerCase();
        const matchesQ = q.question && q.question.toLowerCase().includes(query);
        const matchesTopic = (q.topic && q.topic.toLowerCase().includes(query)) || (q.unit && q.unit.toLowerCase().includes(query));
        const matchesOptions = q.options && q.options.some((opt) => opt.toLowerCase().includes(query));
        if (!matchesQ && !matchesTopic && !matchesOptions) return false;
      }
      return true;
    });
  }, [allQuestions, bankSubjectFilter, bankDifficultyFilter, bankSearchTerm]);

  // ==========================================
  // MOCK TEST CREATOR & LIVE ENGINE STATE
  // ==========================================
  const [testConfig, setTestConfig] = useState({
    subjectCode: 'ALL',
    difficulty: 'ALL',
    questionCount: 10,
    durationMinutes: 15
  });

  // Active Test Execution State
  const [activeTest, setActiveTest] = useState(null); // { id, title, questions: [], durationSeconds, timeStarted }
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { [qId]: selectedOptionIndex }
  const [markedForReview, setMarkedForReview] = useState({}); // { [qId]: boolean }
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [lastResult, setLastResult] = useState(() => {
    const list = getMockTestResults();
    return list.length > 0 ? list[0] : null;
  });
  const timerRef = useRef(null);

  const finalizeTestSubmission = useCallback(() => {
    if (!activeTest) return;

    if (timerRef.current) clearInterval(timerRef.current);

    const timeSpentSeconds = activeTest.durationSeconds - secondsRemaining;
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    const questionResults = activeTest.questions.map((q) => {
      const selected = userAnswers[q.id];
      const isAnswered = selected !== undefined;
      const isCorrect = isAnswered && selected === q.correct;

      if (!isAnswered) unansweredCount += 1;
      else if (isCorrect) correctCount += 1;
      else incorrectCount += 1;

      return {
        questionId: q.id,
        question: q.question,
        codeSnippet: q.codeSnippet || null,
        subjectCode: q.subjectCode || 'CSE 101',
        topic: q.topic || 'General',
        unit: q.unit || 'Unit 1',
        options: q.options,
        correctOption: q.correct,
        selectedOption: selected !== undefined ? selected : null,
        isCorrect,
        isAnswered,
        explanation: q.explanation
      };
    });

    const total = activeTest.questions.length;
    const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const now = new Date();

    const testResult = {
      id: `result-${now.getTime()}`,
      testTitle: activeTest.title,
      subjectCode: activeTest.subjectCode,
      subjectTitle: activeTest.subjectTitle,
      date: now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      timestamp: now.getTime(),
      totalQuestions: total,
      score: correctCount,
      incorrectCount,
      unansweredCount,
      percentage,
      timeSpentSeconds,
      questionResults
    };

    const updatedResults = saveMockTestResult(testResult);
    setMockTestResults(updatedResults);
    setLastResult(testResult);
    setIsSubmitModalOpen(false);
    setActiveTab('results');
  }, [activeTest, secondsRemaining, userAnswers]);

  const handleAutoSubmit = useCallback(() => {
    onShowToast?.('Time expired! Submitting your mock test...');
    finalizeTestSubmission();
  }, [finalizeTestSubmission, onShowToast]);

  // Active test timer effect
  useEffect(() => {
    if (activeTab !== 'active-test' || !activeTest) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setTimeout(() => {
            handleAutoSubmit();
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeTab, activeTest, handleAutoSubmit]);

  const handleStartTest = (customQuestionList = null, testTitle = null) => {
    let pool = customQuestionList || allQuestions;

    // Filter by subject
    if (!customQuestionList && testConfig.subjectCode !== 'ALL') {
      pool = pool.filter((q) => q.subjectCode === testConfig.subjectCode);
    }
    // Filter by difficulty
    if (!customQuestionList && testConfig.difficulty !== 'ALL') {
      pool = pool.filter((q) => q.difficulty === testConfig.difficulty);
    }

    if (pool.length === 0) {
      onShowToast?.('No questions available matching this criteria. Try selecting "All Subjects".');
      return;
    }

    // Shuffle and pick N
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const count = customQuestionList ? customQuestionList.length : Math.min(testConfig.questionCount, shuffled.length);
    const selected = shuffled.slice(0, count);

    const durationMins = customQuestionList ? Math.ceil(selected.length * 1.5) : testConfig.durationMinutes;

    const matchedSub = activeSubjects.find((s) => s.code === testConfig.subjectCode);
    const subjectName = matchedSub ? matchedSub.title : 'Mixed Engineering Exam';

    const newTest = {
      id: `test-${Date.now()}`,
      title: testTitle || `${testConfig.subjectCode === 'ALL' ? 'Comprehensive Mixed' : testConfig.subjectCode} Mock Test`,
      subjectCode: testConfig.subjectCode,
      subjectTitle: subjectName,
      questions: selected,
      durationSeconds: durationMins * 60,
      totalQuestions: selected.length,
      timeStarted: Date.now()
    };

    setActiveTest(newTest);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setMarkedForReview({});
    setSecondsRemaining(newTest.durationSeconds);
    setActiveTab('active-test');
    onShowToast?.(`Test started: ${newTest.title} (${selected.length} questions, ${durationMins} mins)`);
  };

  const handleSelectOption = (qId, optionIdx) => {
    setUserAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const handleToggleMarkReview = (qId) => {
    setMarkedForReview((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  // ==========================================
  // REVISION & CHECKLIST STATE
  // ==========================================
  const [revisionTab, setRevisionTab] = useState('bookmarks'); // 'bookmarks' | 'mistakes' | 'formulas' | 'flashcards' | 'checklist'
  const [newChecklistText, setNewChecklistText] = useState('');
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlashcardFlipped, setIsFlashcardFlipped] = useState(false);

  // Collect all incorrect questions across mock test results
  const incorrectQuestionsList = useMemo(() => {
    const map = new Map();
    mockTestResults.forEach((res) => {
      if (Array.isArray(res.questionResults)) {
        res.questionResults.forEach((qr) => {
          if (!qr.isCorrect && !map.has(qr.questionId)) {
            map.set(qr.questionId, qr);
          }
        });
      }
    });
    return Array.from(map.values());
  }, [mockTestResults]);

  // Bookmarked questions
  const bookmarkedQuestionsList = useMemo(() => {
    return allQuestions.filter((q) => bookmarkedIds.includes(q.id));
  }, [allQuestions, bookmarkedIds]);

  // Flashcards derived from sample questions & formulas
  const allFlashcards = useMemo(() => {
    return allQuestions.map((q) => ({
      id: q.id,
      subject: q.subjectCode,
      topic: q.topic || q.unit,
      front: q.question,
      code: q.codeSnippet || null,
      back: `Correct Answer: ${q.options[q.correct]}\n\nExplanation: ${q.explanation}`
    }));
  }, [allQuestions]);

  const handleToggleChecklist = (id) => {
    const updated = revisionChecklist.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setRevisionChecklist(updated);
    saveExamRevisionChecklist(updated);
  };

  const handleAddChecklistItem = (e) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;

    const newItem = {
      id: `chk-${Date.now()}`,
      text: newChecklistText.trim(),
      completed: false,
      subjectCode: 'GENERAL'
    };

    const updated = [...revisionChecklist, newItem];
    setRevisionChecklist(updated);
    saveExamRevisionChecklist(updated);
    setNewChecklistText('');
    onShowToast?.('Revision goal added to checklist');
  };

  const handleDeleteChecklistItem = (id) => {
    const updated = revisionChecklist.filter((item) => item.id !== id);
    setRevisionChecklist(updated);
    saveExamRevisionChecklist(updated);
  };

  // Helper for sending code snippet to Python Practice Lab
  const handleSendSnippetToLab = (codeSnippet) => {
    try {
      sessionStorage.setItem('studynest_python_incoming_snippet', codeSnippet);
      window.dispatchEvent(new CustomEvent('studynest-incoming-python', { detail: { code: codeSnippet } }));
      if (navigator.clipboard) {
        navigator.clipboard.writeText(codeSnippet);
      }
    } catch {
      // ignore
    }
    onShowToast?.('Python code copied! Opening Practice Lab...');
    if (onNavigateToPython) onNavigateToPython();
  };

  // ============================================================
  // FORMAT TIME HELPER
  // ============================================================
  const formatTimer = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Quick stats calculations
  const totalTestsCompleted = mockTestResults.length;
  const averagePercentage =
    totalTestsCompleted > 0
      ? Math.round(
          mockTestResults.reduce((acc, r) => acc + (r.percentage || 0), 0) /
            totalTestsCompleted
        )
      : null;

  return (
    <div className="exam-prep-page">
      {/* ============================================================
          TOP HEADER & MAIN NAVIGATION TABS
          ============================================================ */}
      <div className="section-header-row" style={{ marginBottom: '18px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--sage-600)', fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>
            <IconAward size={16} />
            <span>Academic Performance · Semester 1</span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--forest-950)', margin: 0, letterSpacing: '-0.02em' }}>
            Exam Preparation & Mock Test Centre
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px', maxWidth: '780px' }}>
            Practice real timed mock exams, master topic-wise question banks across all 7 subjects, isolate mistakes, and test Python code predictions.
          </p>
        </div>

        {/* Global Action Button */}
        {activeTab !== 'active-test' && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="sem2-action-btn"
              onClick={() => setIsExamModalOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <IconClock size={15} />
              <span>+ Add Exam Date</span>
            </button>
            <button
              type="button"
              className="add-task-btn"
              onClick={() => setActiveTab('creator')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <IconAward size={16} />
              <span>Create Mock Test</span>
            </button>
          </div>
        )}
      </div>

      {/* Primary Section Tabs */}
      {activeTab !== 'active-test' && (
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '6px', marginBottom: '22px' }}>
          <button
            type="button"
            className={`folder-pill ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button
            type="button"
            className={`folder-pill ${activeTab === 'bank' ? 'active' : ''}`}
            onClick={() => setActiveTab('bank')}
          >
            Question Bank ({allQuestions.length})
          </button>
          <button
            type="button"
            className={`folder-pill ${activeTab === 'creator' ? 'active' : ''}`}
            onClick={() => setActiveTab('creator')}
          >
            Mock Test Creator
          </button>
          <button
            type="button"
            className={`folder-pill ${activeTab === 'python-tests' ? 'active' : ''}`}
            onClick={() => setActiveTab('python-tests')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
          >
            <IconPython size={14} />
            <span>Python Test Arena</span>
          </button>
          <button
            type="button"
            className={`folder-pill ${activeTab === 'revision' ? 'active' : ''}`}
            onClick={() => setActiveTab('revision')}
          >
            Revision Centre ({bookmarkedIds.length} Bookmarks)
          </button>
          {lastResult && (
            <button
              type="button"
              className={`folder-pill ${activeTab === 'results' ? 'active' : ''}`}
              onClick={() => setActiveTab('results')}
            >
              Latest Results ({lastResult.score}/{lastResult.totalQuestions})
            </button>
          )}
        </div>
      )}

      {/* ============================================================
          SECTION 1: EXAM PREPARATION DASHBOARD
          ============================================================ */}
      {activeTab === 'dashboard' && (
        <div>
          {/* Top Performance Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '22px' }}>
            <div className="study-progress-card" style={{ padding: '16px 20px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Upcoming Exams</span>
                <IconClock size={16} style={{ color: 'var(--forest-800)' }} />
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--forest-950)' }}>
                {upcomingExams.length}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {upcomingExams.length > 0 ? `Next: in ${getDaysRemaining(upcomingExams[0]?.date) ?? '–'} days` : 'No dates scheduled yet'}
              </div>
            </div>

            <div className="study-progress-card" style={{ padding: '16px 20px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Practice Tests Taken</span>
                <IconAward size={16} style={{ color: 'var(--forest-800)' }} />
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--forest-950)' }}>
                {totalTestsCompleted}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {averagePercentage !== null ? `Average Score: ${averagePercentage}%` : 'Start with your first test'}
              </div>
            </div>

            <div className="study-progress-card" style={{ padding: '16px 20px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Revision Goals</span>
                <IconCheckSquare size={16} style={{ color: 'var(--forest-800)' }} />
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--forest-950)' }}>
                {revisionChecklist.filter((c) => c.completed).length} / {revisionChecklist.length}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {revisionChecklist.length > 0
                  ? `${Math.round((revisionChecklist.filter((c) => c.completed).length / revisionChecklist.length) * 100)}% checklist completed`
                  : 'All caught up'}
              </div>
            </div>

            <div className="study-progress-card" style={{ padding: '16px 20px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Target Grade</span>
                <IconStar size={16} style={{ color: '#D97706' }} filled />
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--forest-950)' }}>
                {profile?.studyGoals?.targetGrade?.split(' ')[0] || 'Grade A'}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Goal: {profile?.studyGoals?.weeklyHoursTarget || 20} hrs/week
              </div>
            </div>
          </div>

          {/* Upcoming Examinations Schedule */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--forest-950)', margin: 0 }}>
                Scheduled Examination Dates
              </h2>
              <button
                type="button"
                className="section-action-btn"
                onClick={() => setIsExamModalOpen(true)}
                style={{ fontSize: '12px' }}
              >
                + Schedule Exam
              </button>
            </div>

            {upcomingExams.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '14px' }}>
                {upcomingExams.map((exam) => {
                  const days = getDaysRemaining(exam.date);
                  const isUrgent = days !== null && days <= 7;
                  const matchedSubject = activeSubjects.find(
                    (s) => s.code === exam.subjectCode || s.id === exam.subjectId
                  );
                  const displayTitle = exam.title || exam.examType || 'Examination';
                  const displaySubjectTitle =
                    exam.subjectTitle || exam.subjectName || matchedSubject?.title || 'Engineering Subject';
                  return (
                    <div
                      key={exam.id}
                      className="subject-card"
                      style={{
                        padding: '16px 20px',
                        borderLeft: isUrgent ? '4px solid #DC2626' : '4px solid var(--forest-800)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <span className="subject-code-badge">{exam.subjectCode}</span>
                          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--forest-950)', margin: '6px 0 2px 0' }}>
                            {displayTitle}
                          </h3>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            {displaySubjectTitle}
                          </div>
                        </div>

                        <button
                          type="button"
                          className="task-delete-btn"
                          onClick={() => handleDeleteExam(exam.id)}
                          title="Remove scheduled exam"
                          style={{ opacity: 0.8 }}
                        >
                          <IconTrash size={14} />
                        </button>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', fontSize: '12.5px' }}>
                        <div>
                          <span style={{ color: 'var(--text-muted)' }}>Date: </span>
                          <strong style={{ color: 'var(--forest-950)' }}>
                            {new Date(exam.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </strong>
                        </div>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontWeight: 700,
                            fontSize: '11px',
                            backgroundColor: isUrgent ? '#FEE2E2' : '#EAF2EB',
                            color: isUrgent ? '#DC2626' : 'var(--forest-800)'
                          }}
                        >
                          {days === 0 ? 'Today!' : days !== null && days < 0 ? 'Concluded' : `${days} Days Left`}
                        </span>
                      </div>

                      {exam.notes && (
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '6px' }}>
                          "{exam.notes}"
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                style={{
                  padding: '28px',
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px dashed var(--border-sage)',
                  textAlign: 'center'
                }}
              >
                <IconClock size={28} style={{ color: 'var(--sage-400)', marginBottom: '8px' }} />
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--forest-950)', marginBottom: '4px' }}>
                  No Upcoming Exams Scheduled
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 auto 14px', maxWidth: '420px' }}>
                  Add your upcoming university midterms, end-semester papers, or laboratory vivas to see live countdown timers and tailored revision milestones.
                </p>
                <button
                  type="button"
                  className="add-task-btn"
                  onClick={() => setIsExamModalOpen(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <IconPlus size={15} />
                  <span>Add First Exam Date</span>
                </button>
              </div>
            )}
          </div>

          {/* Subject-wise Preparation Progress Matrix */}
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--forest-950)', marginBottom: '12px' }}>
              Subject-wise Preparation Progress
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '14px' }}>
              {activeSubjects.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid var(--border-card)', gridColumn: '1 / -1' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
                    No subjects configured for {profile?.semester || 'this semester'} yet.
                  </p>
                  <button
                    type="button"
                    className="sem2-action-btn"
                    onClick={() => onNavigate?.('subjects')}
                    style={{ marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <IconBook size={14} />
                    <span>Upload Syllabus or Add Courses</span>
                  </button>
                </div>
              ) : (
                activeSubjects.map((subj) => {
                const allSubTopics = getAllSubjectTopics(subj);
                const completedList = completedTopics[subj.id] || [];
                const completedCount = allSubTopics.filter((t) => completedList.includes(t.id)).length;
                const totalTopics = allSubTopics.length;
                const syllabusPct = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

                // Practice test accuracy for this subject
                const subjectTests = mockTestResults.filter((r) => r.subjectCode === subj.code);
                const avgSubScore =
                  subjectTests.length > 0
                    ? Math.round(subjectTests.reduce((a, b) => a + b.percentage, 0) / subjectTests.length)
                    : null;

                const qBankCount = allQuestions.filter((q) => q.subjectCode === subj.code).length;

                return (
                  <div key={subj.id} className="subject-card" style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <span className="subject-code-badge">{subj.code}</span>
                        <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--forest-950)', margin: '4px 0 0 0' }}>
                          {subj.title}
                        </h4>
                      </div>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: '4px',
                          backgroundColor: syllabusPct >= 75 ? '#DCFCE7' : syllabusPct >= 30 ? '#FEF3C7' : '#F3F4F6',
                          color: syllabusPct >= 75 ? '#166534' : syllabusPct >= 30 ? '#B45309' : '#4B5563'
                        }}
                      >
                        {syllabusPct >= 75 ? 'Exam Ready' : syllabusPct >= 30 ? 'In Progress' : 'Needs Work'}
                      </span>
                    </div>

                    <div style={{ marginTop: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        <span>Syllabus Covered</span>
                        <span>{syllabusPct}% ({completedCount}/{totalTopics} topics)</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--cream-200)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${syllabusPct}%`, height: '100%', backgroundColor: 'var(--forest-800)' }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', fontSize: '12px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>
                        {avgSubScore !== null ? `Mock Accuracy: ${avgSubScore}%` : `${qBankCount} questions available`}
                      </span>
                      <button
                        type="button"
                        className="section-action-btn"
                        onClick={() => {
                          setTestConfig({ ...testConfig, subjectCode: subj.code });
                          setActiveTab('creator');
                        }}
                        style={{ padding: 0 }}
                      >
                        Test Subject →
                      </button>
                    </div>
                  </div>
                );
              }))}
            </div>
          </div>

          {/* Recent Mock Test History */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--forest-950)', margin: 0 }}>
                Completed Practice Tests & Scores
              </h2>
              {mockTestResults.length > 0 && (
                <button
                  type="button"
                  className="section-action-btn"
                  onClick={() => setActiveTab('creator')}
                  style={{ fontSize: '12px' }}
                >
                  + New Test
                </button>
              )}
            </div>

            {mockTestResults.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {mockTestResults.slice(0, 5).map((res) => (
                  <div
                    key={res.id}
                    className="subject-card"
                    style={{
                      padding: '14px 20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <span className="subject-code-badge">{res.subjectCode}</span>
                        <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--forest-950)', margin: 0 }}>
                          {res.testTitle}
                        </h4>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {res.date} &bull; Time Spent: {formatTimer(res.timeSpentSeconds || 0)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: res.percentage >= 70 ? 'var(--forest-900)' : '#D97706' }}>
                          {res.score} / {res.totalQuestions} ({res.percentage}%)
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {res.incorrectCount} wrong &bull; {res.unansweredCount} skipped
                        </div>
                      </div>

                      <button
                        type="button"
                        className="sem2-action-btn"
                        onClick={() => {
                          setLastResult(res);
                          setActiveTab('results');
                        }}
                        style={{ fontSize: '12px' }}
                      >
                        Review Test
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  padding: '24px',
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  textAlign: 'center'
                }}
              >
                <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: '0 auto 12px' }}>
                  No mock test attempts recorded yet. Take your first timed mock exam to see real score analytics and mistake tracking.
                </p>
                <button
                  type="button"
                  className="add-task-btn"
                  onClick={() => setActiveTab('creator')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <IconAward size={15} />
                  <span>Start First Mock Test</span>
                </button>
              </div>
            )}
          </div>

          {/* Recent Course Quiz Attempts */}
          {quizHistory && quizHistory.length > 0 && (
            <div style={{ marginTop: '28px' }}>
              <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--forest-950)', marginBottom: '12px' }}>
                Recent Course Quiz Attempts
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                {quizHistory.slice(0, 4).map((qh) => (
                  <div key={qh.id} className="subject-card" style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span className="subject-code-badge">{qh.subjectCode}</span>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: qh.percentage >= 70 ? 'var(--forest-900)' : '#D97706' }}>
                        {qh.percentage}%
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--forest-950)' }}>
                      {qh.subjectTitle}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {qh.date} &bull; {qh.score}/{qh.total} correct
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================
          SECTION 2: SUBJECT-WISE QUESTION BANK
          ============================================================ */}
      {activeTab === 'bank' && (
        <div>
          {/* Disclaimer Banner */}
          <div
            style={{
              padding: '10px 16px',
              backgroundColor: 'rgba(165, 196, 175, 0.15)',
              borderLeft: '4px solid var(--forest-800)',
              borderRadius: '4px',
              fontSize: '12.5px',
              color: 'var(--forest-950)',
              marginBottom: '18px'
            }}
          >
            <strong>Educational Practice Notice:</strong> All questions in this bank are curated sample practice items and learning exercises. They are not official university examination papers.
          </div>

          {/* Filters & Actions Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={`folder-pill ${bankSubjectFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setBankSubjectFilter('ALL')}
              >
                All Subjects ({allQuestions.length})
              </button>
              {activeSubjects.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`folder-pill ${bankSubjectFilter === s.code ? 'active' : ''}`}
                  onClick={() => setBankSubjectFilter(s.code)}
                >
                  {s.code}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="add-task-btn"
              onClick={handleOpenAddQuestion}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <IconPlus size={15} />
              <span>+ Add Question</span>
            </button>
          </div>

          {/* Difficulty & Search Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '420px' }}>
              <IconSearch size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Filter questions, topics, units..."
                value={bankSearchTerm}
                onChange={(e) => setBankSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 14px 8px 36px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-card)',
                  backgroundColor: '#FFFFFF',
                  fontSize: '13px',
                  color: 'var(--text-main)'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Difficulty:</span>
              {['ALL', 'Easy', 'Medium', 'Hard'].map((diff) => (
                <button
                  key={diff}
                  type="button"
                  className={`folder-pill ${bankDifficultyFilter === diff ? 'active' : ''}`}
                  onClick={() => setBankDifficultyFilter(diff)}
                  style={{ fontSize: '11px', padding: '3px 9px' }}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Questions List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredBankQuestions.map((q, idx) => {
              const isBookmarked = bookmarkedIds.includes(q.id);
              const isExpanded = expandedExplanationId === q.id;

              return (
                <div key={q.id} className="subject-card" style={{ padding: '18px 22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span className="subject-code-badge">{q.subjectCode}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {q.unit} &bull; {q.topic}
                      </span>
                      <span
                        style={{
                          fontSize: '10.5px',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: '4px',
                          backgroundColor:
                            q.difficulty === 'Easy'
                              ? '#DCFCE7'
                              : q.difficulty === 'Hard'
                              ? '#FEE2E2'
                              : '#FEF3C7',
                          color:
                            q.difficulty === 'Easy'
                              ? '#166534'
                              : q.difficulty === 'Hard'
                              ? '#DC2626'
                              : '#B45309'
                        }}
                      >
                        {q.difficulty}
                      </span>
                      {q.isSample ? (
                        <span style={{ fontSize: '10px', color: 'var(--sage-700)', backgroundColor: 'var(--cream-100)', padding: '1px 5px', borderRadius: '3px' }}>
                          Sample Practice
                        </span>
                      ) : (
                        <span style={{ fontSize: '10px', color: 'var(--forest-800)', backgroundColor: '#EAF2EB', padding: '1px 5px', borderRadius: '3px', fontWeight: 600 }}>
                          Custom Student Question
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={(e) => handleToggleBookmark(q.id, e)}
                        className="note-icon-action"
                        title={isBookmarked ? 'Remove bookmark' : 'Bookmark for revision'}
                        style={{ color: isBookmarked ? '#D97706' : 'var(--text-muted)' }}
                      >
                        <IconBookmark size={15} filled={isBookmarked} />
                      </button>

                      {!q.isSample && (
                        <button
                          type="button"
                          className="task-delete-btn"
                          onClick={() => handleDeleteQuestion(q.id)}
                          title="Delete custom question"
                        >
                          <IconTrash size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 style={{ fontSize: '15.5px', fontWeight: 700, color: 'var(--forest-950)', marginBottom: '12px', lineHeight: 1.4 }}>
                    {idx + 1}. {q.question}
                  </h3>

                  {q.codeSnippet && (
                    <div style={{ backgroundColor: '#16221c', padding: '10px 14px', borderRadius: '6px', marginBottom: '12px', overflowX: 'auto' }}>
                      <pre style={{ margin: 0, color: '#dbe7df', fontFamily: 'var(--font-mono)', fontSize: '12.5px' }}>
                        <code>{q.codeSnippet}</code>
                      </pre>
                    </div>
                  )}

                  {/* 4 Options */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '8px', marginBottom: '12px' }}>
                    {q.options.map((opt, optIdx) => (
                      <div
                        key={optIdx}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: isExpanded && optIdx === q.correct ? '1px solid #166534' : '1px solid var(--border-subtle)',
                          backgroundColor: isExpanded && optIdx === q.correct ? '#DCFCE7' : 'var(--cream-100)',
                          color: isExpanded && optIdx === q.correct ? '#166534' : 'var(--text-primary)',
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <strong style={{ opacity: 0.7 }}>{String.fromCharCode(65 + optIdx)}.</strong>
                        <span>{opt}</span>
                        {isExpanded && optIdx === q.correct && (
                          <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: 700 }}>✓ Correct</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Explanation Toggle */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      type="button"
                      className="section-action-btn"
                      onClick={() => setExpandedExplanationId(isExpanded ? null : q.id)}
                      style={{ padding: 0, fontSize: '12px' }}
                    >
                      {isExpanded ? 'Hide Explanation ▲' : 'Show Answer & Explanation ▼'}
                    </button>

                    {q.codeSnippet && (
                      <button
                        type="button"
                        className="sem2-action-btn"
                        onClick={() => handleSendSnippetToLab(q.codeSnippet)}
                        style={{ padding: '3px 8px', fontSize: '11px' }}
                      >
                        <IconExternalLink size={12} style={{ marginRight: '4px' }} />
                        Test in Practice Lab
                      </button>
                    )}
                  </div>

                  {isExpanded && (
                    <div
                      style={{
                        marginTop: '12px',
                        padding: '12px 14px',
                        backgroundColor: '#EAF2EB',
                        borderRadius: '6px',
                        borderLeft: '3px solid var(--forest-800)',
                        fontSize: '13px',
                        lineHeight: 1.5,
                        color: 'var(--forest-950)'
                      }}
                    >
                      <strong>Correct Answer: {String.fromCharCode(65 + q.correct)}. {q.options[q.correct]}</strong>
                      <p style={{ margin: '6px 0 0 0', color: 'var(--text-secondary)' }}>
                        {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredBankQuestions.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)' }}>
                <IconSearch size={28} style={{ color: 'var(--sage-400)', marginBottom: '8px' }} />
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--forest-950)' }}>
                  No matching questions found
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Try adjusting your search query or subject filters.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================
          SECTION 3: MOCK TEST CREATOR
          ============================================================ */}
      {activeTab === 'creator' && (
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div className="subject-card" style={{ padding: '28px 32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <IconAward size={22} style={{ color: 'var(--forest-800)' }} />
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--forest-950)', margin: 0 }}>
                Configure Custom Mock Test
              </h2>
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Simulate actual examination pressure with a live countdown timer, question palette navigation, and instant post-test analytics.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Subject Selection */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Select Course Subject
                </label>
                <select
                  className="add-task-input"
                  value={testConfig.subjectCode}
                  onChange={(e) => setTestConfig({ ...testConfig, subjectCode: e.target.value })}
                >
                  <option value="ALL">All Subjects (Comprehensive Mixed Exam)</option>
                  {activeSubjects.map((s) => (
                    <option key={s.id} value={s.code}>
                      {s.code} - {s.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty */}
              <div>
                <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Target Difficulty
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {[
                    { id: 'ALL', label: 'Mixed / Any' },
                    { id: 'Easy', label: 'Easy' },
                    { id: 'Medium', label: 'Medium' },
                    { id: 'Hard', label: 'Hard' }
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      className={`folder-pill ${testConfig.difficulty === d.id ? 'active' : ''}`}
                      onClick={() => setTestConfig({ ...testConfig, difficulty: d.id })}
                      style={{ justifyContent: 'center', padding: '8px' }}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Number of Questions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Number of Questions
                  </label>
                  <select
                    className="add-task-input"
                    value={testConfig.questionCount}
                    onChange={(e) => setTestConfig({ ...testConfig, questionCount: Number(e.target.value) })}
                  >
                    <option value={5}>5 Questions (Quick Check)</option>
                    <option value={10}>10 Questions (Standard Drill)</option>
                    <option value={15}>15 Questions (Thorough Test)</option>
                    <option value={20}>20 Questions (Full Mock)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Duration Timer
                  </label>
                  <select
                    className="add-task-input"
                    value={testConfig.durationMinutes}
                    onChange={(e) => setTestConfig({ ...testConfig, durationMinutes: Number(e.target.value) })}
                  >
                    <option value={5}>5 Minutes (Sprint)</option>
                    <option value={10}>10 Minutes</option>
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes (Full Exam)</option>
                  </select>
                </div>
              </div>

              {/* Start Test CTA */}
              <div style={{ marginTop: '12px', paddingTop: '18px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Questions will be randomly drawn from the verified question bank.
                </span>
                <button
                  type="button"
                  className="add-task-btn"
                  onClick={() => handleStartTest()}
                  style={{ padding: '10px 24px', fontSize: '14px', fontWeight: 700 }}
                >
                  🚀 Launch Mock Test
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          SECTION 4: ACTIVE TEST TAKING ENGINE (LIVE TIMED TEST)
          ============================================================ */}
      {activeTab === 'active-test' && activeTest && (
        <div className="exam-active-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 280px', gap: '20px' }}>
          {/* Main Question Interface */}
          <div className="subject-card exam-active-question-card" style={{ padding: '24px 28px' }}>
            {/* Top Bar: Subject, Progress & Mark For Review */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <span className="subject-code-badge">{activeTest.subjectCode}</span>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginLeft: '8px', fontWeight: 600 }}>
                  Question {currentQuestionIndex + 1} of {activeTest.questions.length}
                </span>
              </div>

              {/* Mark for review toggle */}
              {activeTest.questions[currentQuestionIndex] && (
                <button
                  type="button"
                  className={`folder-pill ${markedForReview[activeTest.questions[currentQuestionIndex].id] ? 'active' : ''}`}
                  onClick={() => handleToggleMarkReview(activeTest.questions[currentQuestionIndex].id)}
                  style={{
                    backgroundColor: markedForReview[activeTest.questions[currentQuestionIndex].id] ? '#D97706' : 'transparent',
                    borderColor: '#D97706',
                    color: markedForReview[activeTest.questions[currentQuestionIndex].id] ? '#ffffff' : '#D97706'
                  }}
                >
                  <IconBookmark size={13} filled={markedForReview[activeTest.questions[currentQuestionIndex].id]} />
                  <span>{markedForReview[activeTest.questions[currentQuestionIndex].id] ? 'Marked for Review' : 'Mark for Review'}</span>
                </button>
              )}
            </div>

            {/* Current Question */}
            {activeTest.questions[currentQuestionIndex] && (
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--forest-950)', marginBottom: '16px', lineHeight: 1.45 }}>
                  {currentQuestionIndex + 1}. {activeTest.questions[currentQuestionIndex].question}
                </h2>

                {activeTest.questions[currentQuestionIndex].codeSnippet && (
                  <div style={{ backgroundColor: '#16221c', padding: '12px 16px', borderRadius: '6px', marginBottom: '18px', overflowX: 'auto' }}>
                    <pre style={{ margin: 0, color: '#dbe7df', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                      <code>{activeTest.questions[currentQuestionIndex].codeSnippet}</code>
                    </pre>
                  </div>
                )}

                {/* 4 Radio Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                  {activeTest.questions[currentQuestionIndex].options.map((opt, optIdx) => {
                    const qId = activeTest.questions[currentQuestionIndex].id;
                    const isSelected = userAnswers[qId] === optIdx;

                    return (
                      <div
                        key={optIdx}
                        onClick={() => handleSelectOption(qId, optIdx)}
                        style={{
                          padding: '12px 16px',
                          borderRadius: '8px',
                          border: isSelected ? '2px solid var(--forest-800)' : '1px solid var(--border-subtle)',
                          backgroundColor: isSelected ? 'rgba(165, 196, 175, 0.15)' : 'var(--cream-100)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          transition: 'all 0.12s ease'
                        }}
                      >
                        <div
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            border: isSelected ? '2px solid var(--forest-800)' : '2px solid var(--border-sage)',
                            backgroundColor: isSelected ? 'var(--forest-800)' : 'transparent',
                            color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: 700
                          }}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </div>
                        <span style={{ fontSize: '14px', color: 'var(--forest-950)', fontWeight: isSelected ? 600 : 400 }}>
                          {opt}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Question Navigation Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                  <button
                    type="button"
                    className="sem2-action-btn"
                    onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <IconArrowLeft size={15} />
                    <span>Previous</span>
                  </button>

                  <button
                    type="button"
                    className="add-task-btn"
                    onClick={() => {
                      if (currentQuestionIndex < activeTest.questions.length - 1) {
                        setCurrentQuestionIndex((prev) => prev + 1);
                      } else {
                        setIsSubmitModalOpen(true);
                      }
                    }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <span>{currentQuestionIndex === activeTest.questions.length - 1 ? 'Review & Submit' : 'Next Question'}</span>
                    <IconArrowRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar: Countdown Timer & Question Number Palette */}
          <div className="exam-active-timer-sidebar">
            {/* Live Timer Widget */}
            <div
              className="subject-card"
              style={{
                padding: '16px 20px',
                marginBottom: '16px',
                textAlign: 'center',
                backgroundColor: secondsRemaining <= 120 ? '#FEE2E2' : 'var(--bg-card)',
                borderColor: secondsRemaining <= 120 ? '#EF4444' : 'var(--border-subtle)'
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: secondsRemaining <= 120 ? '#DC2626' : 'var(--text-muted)' }}>
                Time Remaining
              </div>
              <div
                style={{
                  fontSize: '28px',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  color: secondsRemaining <= 120 ? '#DC2626' : 'var(--forest-950)',
                  margin: '4px 0'
                }}
              >
                {formatTimer(secondsRemaining)}
              </div>
              {secondsRemaining <= 120 && (
                <div style={{ fontSize: '11px', color: '#DC2626', fontWeight: 600 }}>
                  ⚠️ Less than 2 minutes left!
                </div>
              )}
            </div>

            {/* Question Palette Navigation Grid */}
            <div className="subject-card" style={{ padding: '16px 18px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--forest-950)', marginBottom: '10px' }}>
                Question Palette ({Object.keys(userAnswers).length}/{activeTest.questions.length} answered)
              </div>

              {/* Legend */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--forest-800)' }} />
                  <span>Answered</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#D97706' }} />
                  <span>Review</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--cream-200)', border: '1px solid var(--border-subtle)' }} />
                  <span>Unanswered</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', border: '2px solid var(--forest-950)' }} />
                  <span>Current</span>
                </div>
              </div>

              {/* Number Buttons Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', marginBottom: '18px' }}>
                {activeTest.questions.map((q, idx) => {
                  const isAnswered = userAnswers[q.id] !== undefined;
                  const isMarked = markedForReview[q.id];
                  const isCurrent = currentQuestionIndex === idx;

                  let bgColor = 'var(--cream-100)';
                  let textColor = 'var(--text-secondary)';
                  if (isMarked) {
                    bgColor = '#FEF3C7';
                    textColor = '#B45309';
                  } else if (isAnswered) {
                    bgColor = 'var(--forest-800)';
                    textColor = '#ffffff';
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentQuestionIndex(idx)}
                      style={{
                        height: '34px',
                        borderRadius: '6px',
                        border: isCurrent ? '2px solid var(--forest-950)' : '1px solid var(--border-subtle)',
                        backgroundColor: bgColor,
                        color: textColor,
                        fontWeight: 700,
                        fontSize: '12px',
                        cursor: 'pointer',
                        transition: 'transform 0.1s ease'
                      }}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                className="add-task-btn"
                onClick={() => setIsSubmitModalOpen(true)}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Submit Test
              </button>
            </div>
          </div>

          {/* Submit Confirmation Modal */}
          {isSubmitModalOpen && (
            <div className="modal-overlay" onClick={() => setIsSubmitModalOpen(false)} role="dialog" aria-modal="true">
              <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', width: '92%' }}>
                <div className="modal-header">
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-950)', margin: 0 }}>
                    Confirm Test Submission
                  </h3>
                  <button type="button" className="modal-close-btn" onClick={() => setIsSubmitModalOpen(false)}>
                    <IconX size={16} />
                  </button>
                </div>

                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: 0 }}>
                    Are you ready to submit your mock test? Check your progress below:
                  </p>

                  <div style={{ padding: '12px 16px', backgroundColor: 'var(--cream-100)', borderRadius: '6px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span>Answered Questions:</span>
                      <strong>{Object.keys(userAnswers).length}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#DC2626' }}>
                      <span>Unanswered Questions:</span>
                      <strong>{activeTest.questions.length - Object.keys(userAnswers).length}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#D97706' }}>
                      <span>Marked for Review:</span>
                      <strong>{Object.values(markedForReview).filter(Boolean).length}</strong>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="sem2-action-btn" onClick={() => setIsSubmitModalOpen(false)}>
                    Return to Test
                  </button>
                  <button type="button" className="add-task-btn" onClick={finalizeTestSubmission}>
                    Yes, Submit Test
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================
          SECTION 5: RESULTS AND ANALYSIS VIEW
          ============================================================ */}
      {activeTab === 'results' && lastResult && (
        <div>
          {/* Header Score Card */}
          <div
            className="subject-card"
            style={{
              padding: '28px',
              marginBottom: '22px',
              backgroundColor: 'var(--bg-card)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '20px'
            }}
          >
            <div>
              <span className="subject-code-badge">{lastResult.subjectCode}</span>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--forest-950)', margin: '6px 0 4px 0' }}>
                Test Evaluation: {lastResult.testTitle}
              </h2>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Completed on {lastResult.date} &bull; Time Taken: {formatTimer(lastResult.timeSpentSeconds || 0)}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '36px', fontWeight: 900, color: lastResult.percentage >= 70 ? 'var(--forest-900)' : '#D97706', lineHeight: 1 }}>
                  {lastResult.percentage}%
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '4px' }}>
                  {lastResult.score} of {lastResult.totalQuestions} Correct
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  type="button"
                  className="add-task-btn"
                  onClick={() => {
                    // Retry with same questions
                    const questions = lastResult.questionResults.map((qr) => ({
                      id: qr.questionId,
                      question: qr.question,
                      codeSnippet: qr.codeSnippet,
                      subjectCode: qr.subjectCode,
                      unit: qr.unit,
                      topic: qr.topic,
                      options: qr.options,
                      correct: qr.correctOption,
                      explanation: qr.explanation
                    }));
                    handleStartTest(questions, `Retry: ${lastResult.testTitle}`);
                  }}
                >
                  <IconReset size={14} style={{ marginRight: '4px' }} />
                  Retry This Test
                </button>
                <button
                  type="button"
                  className="sem2-action-btn"
                  onClick={() => setActiveTab('revision')}
                >
                  Review in Revision Centre
                </button>
              </div>
            </div>
          </div>

          {/* Breakdown Statistics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            <div className="study-progress-card" style={{ padding: '14px 18px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Questions</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--forest-950)', marginTop: '2px' }}>{lastResult.totalQuestions}</div>
            </div>

            <div className="study-progress-card" style={{ padding: '14px 18px', textAlign: 'center', borderColor: '#86EFAC' }}>
              <div style={{ fontSize: '11px', color: '#166534', textTransform: 'uppercase', fontWeight: 700 }}>Correct Answers</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#166534', marginTop: '2px' }}>{lastResult.score}</div>
            </div>

            <div className="study-progress-card" style={{ padding: '14px 18px', textAlign: 'center', borderColor: '#FCA5A5' }}>
              <div style={{ fontSize: '11px', color: '#DC2626', textTransform: 'uppercase', fontWeight: 700 }}>Incorrect Answers</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#DC2626', marginTop: '2px' }}>{lastResult.incorrectCount}</div>
            </div>

            <div className="study-progress-card" style={{ padding: '14px 18px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Unanswered</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-muted)', marginTop: '2px' }}>{lastResult.unansweredCount}</div>
            </div>
          </div>

          {/* Comprehensive Question by Question Review */}
          <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--forest-950)', marginBottom: '14px' }}>
            Detailed Question Analysis & Explanations
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {lastResult.questionResults.map((qr, qIdx) => (
              <div
                key={qr.questionId || qIdx}
                className="subject-card"
                style={{
                  padding: '18px 22px',
                  borderLeft: qr.isCorrect ? '4px solid #166534' : !qr.isAnswered ? '4px solid #9CA3AF' : '4px solid #DC2626'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="subject-code-badge">{qr.subjectCode}</span>
                    <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{qr.topic}</span>
                  </div>

                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: qr.isCorrect ? '#DCFCE7' : !qr.isAnswered ? '#F3F4F6' : '#FEE2E2',
                      color: qr.isCorrect ? '#166534' : !qr.isAnswered ? '#6B7280' : '#DC2626'
                    }}
                  >
                    {qr.isCorrect ? '✓ Correct' : !qr.isAnswered ? '○ Unanswered' : '✗ Incorrect'}
                  </span>
                </div>

                <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--forest-950)', margin: '6px 0 12px 0' }}>
                  {qIdx + 1}. {qr.question}
                </h4>

                {qr.codeSnippet && (
                  <div style={{ backgroundColor: '#16221c', padding: '10px 14px', borderRadius: '6px', marginBottom: '12px', overflowX: 'auto' }}>
                    <pre style={{ margin: 0, color: '#dbe7df', fontFamily: 'var(--font-mono)', fontSize: '12.5px' }}>
                      <code>{qr.codeSnippet}</code>
                    </pre>
                  </div>
                )}

                {/* Options Review */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '8px', marginBottom: '12px' }}>
                  {qr.options.map((opt, optIdx) => {
                    const isUserChoice = qr.selectedOption === optIdx;
                    const isRightChoice = qr.correctOption === optIdx;

                    let bg = 'var(--cream-100)';
                    let border = '1px solid var(--border-subtle)';
                    let badge = null;

                    if (isRightChoice) {
                      bg = '#DCFCE7';
                      border = '1px solid #166534';
                      badge = <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#166534', fontWeight: 700 }}>✓ Correct Option</span>;
                    } else if (isUserChoice && !qr.isCorrect) {
                      bg = '#FEE2E2';
                      border = '1px solid #DC2626';
                      badge = <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#DC2626', fontWeight: 700 }}>✗ Your Answer</span>;
                    }

                    return (
                      <div
                        key={optIdx}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '6px',
                          backgroundColor: bg,
                          border,
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <strong>{String.fromCharCode(65 + optIdx)}.</strong>
                        <span>{opt}</span>
                        {badge}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                <div
                  style={{
                    padding: '10px 14px',
                    backgroundColor: '#EAF2EB',
                    borderRadius: '6px',
                    fontSize: '12.5px',
                    lineHeight: 1.5,
                    color: 'var(--forest-950)'
                  }}
                >
                  <strong>Explanation: </strong> {qr.explanation}
                </div>

                {/* Python Run Button if applicable */}
                {qr.codeSnippet && (
                  <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="sem2-action-btn"
                      onClick={() => handleSendSnippetToLab(qr.codeSnippet)}
                      style={{ fontSize: '11px', padding: '3px 8px' }}
                    >
                      <IconExternalLink size={12} style={{ marginRight: '4px' }} />
                      Run in Python Practice Lab
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================
          SECTION 6: REVISION CENTRE
          ============================================================ */}
      {activeTab === 'revision' && (
        <div>
          {/* Revision Sub-Tabs */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '20px' }}>
            <button
              type="button"
              className={`folder-pill ${revisionTab === 'bookmarks' ? 'active' : ''}`}
              onClick={() => setRevisionTab('bookmarks')}
            >
              Bookmarked Questions ({bookmarkedQuestionsList.length})
            </button>
            <button
              type="button"
              className={`folder-pill ${revisionTab === 'mistakes' ? 'active' : ''}`}
              onClick={() => setRevisionTab('mistakes')}
            >
              Mistakes Notebook ({incorrectQuestionsList.length})
            </button>
            <button
              type="button"
              className={`folder-pill ${revisionTab === 'formulas' ? 'active' : ''}`}
              onClick={() => setRevisionTab('formulas')}
            >
              Important Formula Sheets
            </button>
            <button
              type="button"
              className={`folder-pill ${revisionTab === 'flashcards' ? 'active' : ''}`}
              onClick={() => setRevisionTab('flashcards')}
            >
              Quick Revision Cards
            </button>
            <button
              type="button"
              className={`folder-pill ${revisionTab === 'checklist' ? 'active' : ''}`}
              onClick={() => setRevisionTab('checklist')}
            >
              Revision Checklist ({revisionChecklist.filter((c) => c.completed).length}/{revisionChecklist.length})
            </button>
          </div>

          {/* Sub-tab 1: Bookmarked Questions */}
          {revisionTab === 'bookmarks' && (
            <div>
              {bookmarkedQuestionsList.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {bookmarkedQuestionsList.map((q, idx) => (
                    <div key={q.id} className="subject-card" style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span className="subject-code-badge">{q.subjectCode}</span>
                        <button
                          type="button"
                          className="note-icon-action"
                          onClick={(e) => handleToggleBookmark(q.id, e)}
                          title="Remove bookmark"
                          style={{ color: '#D97706' }}
                        >
                          <IconBookmark size={15} filled />
                        </button>
                      </div>
                      <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--forest-950)', margin: '4px 0 8px 0' }}>
                        {idx + 1}. {q.question}
                      </h4>
                      <p style={{ fontSize: '13px', color: 'var(--forest-800)', margin: '0 0 6px 0', fontWeight: 600 }}>
                        Correct: {q.options[q.correct]}
                      </p>
                      <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0 }}>
                        {q.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '36px', textAlign: 'center', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)' }}>
                  <IconBookmark size={28} style={{ color: 'var(--sage-400)', marginBottom: '8px' }} />
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--forest-950)' }}>
                    No Bookmarked Questions Yet
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    Click the bookmark star on any question in the Question Bank or during Mock Tests to save it here for quick pre-exam review.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Sub-tab 2: Mistakes Notebook */}
          {revisionTab === 'mistakes' && (
            <div>
              {incorrectQuestionsList.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                      Questions you answered incorrectly during your recent mock test sessions.
                    </p>
                    <button
                      type="button"
                      className="add-task-btn"
                      onClick={() => {
                        const questionsToPractice = incorrectQuestionsList.map((qr) => ({
                          id: qr.questionId,
                          question: qr.question,
                          codeSnippet: qr.codeSnippet,
                          subjectCode: qr.subjectCode,
                          topic: qr.topic,
                          unit: qr.unit,
                          options: qr.options,
                          correct: qr.correctOption,
                          explanation: qr.explanation
                        }));
                        handleStartTest(questionsToPractice, 'Mistakes Retest Challenge');
                      }}
                    >
                      Practice All Mistakes ({incorrectQuestionsList.length})
                    </button>
                  </div>

                  {incorrectQuestionsList.map((qr, idx) => (
                    <div key={qr.questionId || idx} className="subject-card" style={{ padding: '16px 20px', borderLeft: '4px solid #DC2626' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span className="subject-code-badge">{qr.subjectCode}</span>
                        <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: 700 }}>Review Required</span>
                      </div>
                      <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--forest-950)', margin: '4px 0 8px 0' }}>
                        {idx + 1}. {qr.question}
                      </h4>
                      <div style={{ padding: '8px 12px', backgroundColor: '#FEE2E2', borderRadius: '4px', fontSize: '12.5px', marginBottom: '8px' }}>
                        <span style={{ color: '#DC2626', fontWeight: 600 }}>Your Answer: </span>
                        {qr.selectedOption !== null ? qr.options[qr.selectedOption] : 'Skipped'}
                      </div>
                      <div style={{ padding: '8px 12px', backgroundColor: '#DCFCE7', borderRadius: '4px', fontSize: '12.5px' }}>
                        <span style={{ color: '#166534', fontWeight: 600 }}>Correct Answer: </span>
                        {qr.options[qr.correctOption]}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                        {qr.explanation}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '36px', textAlign: 'center', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)' }}>
                  <IconCheckCircle size={28} style={{ color: 'var(--forest-800)', marginBottom: '8px' }} />
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--forest-950)' }}>
                    No Mistakes Recorded!
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    Take a mock test to track any questions you miss here for focused target revision.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Sub-tab 3: Important Formulas Sheets */}
          {revisionTab === 'formulas' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px' }}>
              {SUBJECT_FORMULA_SHEETS.map((sheet, sIdx) => (
                <div key={sIdx} className="subject-card" style={{ padding: '20px 22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span className="subject-code-badge">{sheet.subjectCode}</span>
                    <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--sage-700)' }}>{sheet.category}</span>
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--forest-950)', marginBottom: '14px' }}>
                    {sheet.subjectTitle}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {sheet.formulas.map((f, fIdx) => (
                      <div key={fIdx} style={{ padding: '10px 12px', backgroundColor: 'var(--cream-100)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--forest-900)', marginBottom: '2px' }}>
                          {f.name}
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--forest-950)', fontWeight: 600, margin: '2px 0' }}>
                          {f.formula}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          {f.note}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sub-tab 4: Quick Revision Flashcards */}
          {revisionTab === 'flashcards' && allFlashcards.length > 0 && (
            <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Card {flashcardIndex + 1} of {allFlashcards.length} &bull; Click card to flip and reveal answer
              </div>

              <div
                onClick={() => setIsFlashcardFlipped(!isFlashcardFlipped)}
                className="subject-card"
                style={{
                  minHeight: '260px',
                  padding: '32px 28px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: isFlashcardFlipped ? '#EAF2EB' : 'var(--bg-card)',
                  borderColor: isFlashcardFlipped ? 'var(--forest-800)' : 'var(--border-subtle)',
                  transition: 'all 0.2s ease',
                  userSelect: 'none'
                }}
              >
                <span className="subject-code-badge" style={{ marginBottom: '12px' }}>
                  {allFlashcards[flashcardIndex].subject}
                </span>

                {!isFlashcardFlipped ? (
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--forest-950)', lineHeight: 1.4, margin: '0 0 12px 0' }}>
                      {allFlashcards[flashcardIndex].front}
                    </h3>
                    {allFlashcards[flashcardIndex].code && (
                      <div style={{ backgroundColor: '#16221c', padding: '10px 14px', borderRadius: '6px', textAlign: 'left', marginBottom: '8px' }}>
                        <pre style={{ margin: 0, color: '#dbe7df', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                          <code>{allFlashcards[flashcardIndex].code}</code>
                        </pre>
                      </div>
                    )}
                    <span style={{ fontSize: '12px', color: 'var(--sage-700)', fontWeight: 600 }}>
                      (Click to flip and inspect answer)
                    </span>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '14px', color: 'var(--forest-950)', lineHeight: 1.6, whiteSpace: 'pre-wrap', textAlign: 'left' }}>
                      {allFlashcards[flashcardIndex].back}
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Controls */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginTop: '16px' }}>
                <button
                  type="button"
                  className="sem2-action-btn"
                  onClick={() => {
                    setIsFlashcardFlipped(false);
                    setFlashcardIndex((prev) => (prev - 1 + allFlashcards.length) % allFlashcards.length);
                  }}
                >
                  ← Previous Card
                </button>
                <button
                  type="button"
                  className="add-task-btn"
                  onClick={() => {
                    setIsFlashcardFlipped(false);
                    setFlashcardIndex((prev) => (prev + 1) % allFlashcards.length);
                  }}
                >
                  Next Card →
                </button>
              </div>
            </div>
          )}

          {/* Sub-tab 5: Personal Revision Checklist */}
          {revisionTab === 'checklist' && (
            <div style={{ maxWidth: '680px', margin: '0 auto' }}>
              <div className="subject-card" style={{ padding: '24px 28px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--forest-950)', margin: '0 0 16px 0' }}>
                  Exam Preparation Checklist
                </h3>

                {/* Add new task input */}
                <form onSubmit={handleAddChecklistItem} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                  <input
                    type="text"
                    required
                    className="add-task-input"
                    placeholder="Add a revision task (e.g. Derive wave optics formula)..."
                    value={newChecklistText}
                    onChange={(e) => setNewChecklistText(e.target.value)}
                  />
                  <button type="submit" className="add-task-btn" style={{ whiteSpace: 'nowrap' }}>
                    + Add Task
                  </button>
                </form>

                {/* Checklist items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {revisionChecklist.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: '6px',
                        backgroundColor: item.completed ? 'rgba(165, 196, 175, 0.1)' : 'var(--cream-100)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: 1 }}>
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => handleToggleChecklist(item.id)}
                          style={{ accentColor: 'var(--forest-800)', width: '16px', height: '16px' }}
                        />
                        <span
                          style={{
                            fontSize: '13.5px',
                            color: item.completed ? 'var(--text-muted)' : 'var(--forest-950)',
                            textDecoration: item.completed ? 'line-through' : 'none'
                          }}
                        >
                          {item.text}
                        </span>
                      </label>

                      <button
                        type="button"
                        className="task-delete-btn"
                        onClick={() => handleDeleteChecklistItem(item.id)}
                        title="Delete checklist item"
                      >
                        <IconTrash size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================
          SECTION 7: PYTHON PROGRAMMING TEST ARENA
          ============================================================ */}
      {activeTab === 'python-tests' && (
        <div>
          <div
            className="subject-card"
            style={{
              padding: '20px 24px',
              marginBottom: '20px',
              backgroundColor: 'var(--bg-card)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '14px'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--forest-900)', fontWeight: 700, fontSize: '13px' }}>
                <IconPython size={16} />
                <span>Special Assessment Suite</span>
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--forest-950)', margin: '4px 0 2px 0' }}>
                Python Programming Assessment Arena
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                High-yield technical interview & lab evaluation questions: predict console output, spot tricky exceptions, and fill missing logic.
              </p>
            </div>

            <button
              type="button"
              className="add-task-btn"
              onClick={() => handleStartTest(PYTHON_ASSESSMENT_QUESTIONS, 'Python Masterclass Challenge')}
            >
              Start Python Mock Test ({PYTHON_ASSESSMENT_QUESTIONS.length} Questions)
            </button>
          </div>

          {/* Python Assessment Question Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px' }}>
            {PYTHON_ASSESSMENT_QUESTIONS.map((pq, idx) => (
              <div key={pq.id} className="subject-card" style={{ padding: '20px 22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="subject-code-badge" style={{ backgroundColor: 'rgba(45, 90, 63, 0.1)', color: 'var(--forest-800)' }}>
                    {pq.track === 'predict_output'
                      ? 'Predict Output'
                      : pq.track === 'find_error'
                      ? 'Find Error'
                      : 'Complete Code'}
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: pq.difficulty === 'Hard' ? '#FEE2E2' : '#FEF3C7',
                      color: pq.difficulty === 'Hard' ? '#DC2626' : '#B45309'
                    }}
                  >
                    {pq.difficulty}
                  </span>
                </div>

                <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--forest-950)', margin: '4px 0 10px 0' }}>
                  {idx + 1}. {pq.title}
                </h4>

                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                  {pq.question}
                </p>

                {/* Formatted Code Box */}
                <div style={{ backgroundColor: '#16221c', padding: '12px 14px', borderRadius: '6px', marginBottom: '12px', overflowX: 'auto' }}>
                  <pre style={{ margin: 0, color: '#dbe7df', fontFamily: 'var(--font-mono)', fontSize: '12.5px', lineHeight: 1.5 }}>
                    <code>{pq.codeSnippet}</code>
                  </pre>
                </div>

                {/* Options Preview */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                  {pq.options.map((opt, oIdx) => (
                    <div
                      key={oIdx}
                      style={{
                        padding: '6px 10px',
                        backgroundColor: 'var(--cream-100)',
                        borderRadius: '4px',
                        fontSize: '12px',
                        color: 'var(--text-primary)',
                        display: 'flex',
                        gap: '6px'
                      }}
                    >
                      <strong style={{ opacity: 0.6 }}>{String.fromCharCode(65 + oIdx)}.</strong>
                      <span style={{ fontFamily: pq.track === 'predict_output' ? 'var(--font-mono)' : 'inherit' }}>{opt}</span>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                  <button
                    type="button"
                    className="sem2-action-btn"
                    onClick={() => handleSendSnippetToLab(pq.codeSnippet)}
                    style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <IconPython size={13} />
                    <span>Run in Practice Lab</span>
                  </button>

                  <button
                    type="button"
                    className="section-action-btn"
                    onClick={() => {
                      setExpandedExplanationId(expandedExplanationId === pq.id ? null : pq.id);
                    }}
                    style={{ fontSize: '11.5px', padding: 0 }}
                  >
                    {expandedExplanationId === pq.id ? 'Hide Answer ▲' : 'Reveal Answer ▼'}
                  </button>
                </div>

                {expandedExplanationId === pq.id && (
                  <div
                    style={{
                      marginTop: '10px',
                      padding: '10px 12px',
                      backgroundColor: '#EAF2EB',
                      borderRadius: '6px',
                      fontSize: '12px',
                      color: 'var(--forest-950)'
                    }}
                  >
                    <strong>Answer: {String.fromCharCode(65 + pq.correct)}. {pq.options[pq.correct]}</strong>
                    <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>
                      {pq.explanation}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================
          ADD UPCOMING EXAM MODAL
          ============================================================ */}
      {isExamModalOpen && (
        <div className="modal-overlay" onClick={() => setIsExamModalOpen(false)} role="dialog" aria-modal="true">
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', width: '92%' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-950)', margin: 0 }}>
                Schedule Upcoming Exam
              </h3>
              <button type="button" className="modal-close-btn" onClick={() => setIsExamModalOpen(false)}>
                <IconX size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveExam}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Exam Title *
                  </label>
                  <input
                    type="text"
                    required
                    className="add-task-input"
                    placeholder="e.g. Midterm 1, Semester Theory Paper"
                    value={examForm.title}
                    onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Subject *
                  </label>
                  <select
                    className="add-task-input"
                    value={examForm.subjectCode}
                    onChange={(e) => setExamForm({ ...examForm, subjectCode: e.target.value })}
                  >
                    {activeSubjects.map((s) => (
                      <option key={s.id} value={s.code}>
                        {s.code} - {s.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      Date *
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
                    <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      Target Score (%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      className="add-task-input"
                      value={examForm.targetScore}
                      onChange={(e) => setExamForm({ ...examForm, targetScore: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Syllabus Notes / Important Topics
                  </label>
                  <input
                    type="text"
                    className="add-task-input"
                    placeholder="e.g. Units 1, 2 and 3 focus"
                    value={examForm.notes}
                    onChange={(e) => setExamForm({ ...examForm, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="sem2-action-btn" onClick={() => setIsExamModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="add-task-btn">
                  Save Exam Date
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          ADD CUSTOM QUESTION MODAL
          ============================================================ */}
      {isQuestionModalOpen && (
        <div className="modal-overlay" onClick={() => setIsQuestionModalOpen(false)} role="dialog" aria-modal="true">
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px', width: '92%' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-950)', margin: 0 }}>
                {editingQuestionId ? 'Edit Practice Question' : 'Add Custom Question to Bank'}
              </h3>
              <button type="button" className="modal-close-btn" onClick={() => setIsQuestionModalOpen(false)}>
                <IconX size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '68vh', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      Subject *
                    </label>
                    <select
                      className="add-task-input"
                      value={questionForm.subjectCode}
                      onChange={(e) => setQuestionForm({ ...questionForm, subjectCode: e.target.value })}
                    >
                      {activeSubjects.map((s) => (
                        <option key={s.id} value={s.code}>
                          {s.code} - {s.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      Difficulty
                    </label>
                    <select
                      className="add-task-input"
                      value={questionForm.difficulty}
                      onChange={(e) => setQuestionForm({ ...questionForm, difficulty: e.target.value })}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      Unit / Module
                    </label>
                    <input
                      type="text"
                      className="add-task-input"
                      placeholder="e.g. Unit 2: Matrices"
                      value={questionForm.unit}
                      onChange={(e) => setQuestionForm({ ...questionForm, unit: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      Topic
                    </label>
                    <input
                      type="text"
                      className="add-task-input"
                      placeholder="e.g. Eigenvalues"
                      value={questionForm.topic}
                      onChange={(e) => setQuestionForm({ ...questionForm, topic: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Question Statement *
                  </label>
                  <textarea
                    required
                    rows={3}
                    className="add-task-input"
                    placeholder="Enter question statement clearly..."
                    value={questionForm.question}
                    onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                  />
                </div>

                {/* 4 Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    Answer Options *
                  </label>
                  <input
                    type="text"
                    required
                    className="add-task-input"
                    placeholder="Option A *"
                    value={questionForm.option0}
                    onChange={(e) => setQuestionForm({ ...questionForm, option0: e.target.value })}
                  />
                  <input
                    type="text"
                    required
                    className="add-task-input"
                    placeholder="Option B *"
                    value={questionForm.option1}
                    onChange={(e) => setQuestionForm({ ...questionForm, option1: e.target.value })}
                  />
                  <input
                    type="text"
                    className="add-task-input"
                    placeholder="Option C"
                    value={questionForm.option2}
                    onChange={(e) => setQuestionForm({ ...questionForm, option2: e.target.value })}
                  />
                  <input
                    type="text"
                    className="add-task-input"
                    placeholder="Option D"
                    value={questionForm.option3}
                    onChange={(e) => setQuestionForm({ ...questionForm, option3: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      Correct Answer *
                    </label>
                    <select
                      className="add-task-input"
                      value={questionForm.correct}
                      onChange={(e) => setQuestionForm({ ...questionForm, correct: Number(e.target.value) })}
                    >
                      <option value={0}>Option A</option>
                      <option value={1}>Option B</option>
                      <option value={2}>Option C</option>
                      <option value={3}>Option D</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      Explanation / Derivation
                    </label>
                    <input
                      type="text"
                      className="add-task-input"
                      placeholder="Why is this answer correct?"
                      value={questionForm.explanation}
                      onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="sem2-action-btn" onClick={() => setIsQuestionModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="add-task-btn">
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
