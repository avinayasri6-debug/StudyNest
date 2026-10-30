import React, { useState, useEffect } from 'react';
import { PRACTICE_EXERCISES, PRACTICE_LEVELS } from '../data/practiceExercises';
import { PYTHON_MODULES } from '../data/pythonCurriculum';
import PythonCodeEditor from '../components/PythonCodeEditor';
import PythonOutputConsole from '../components/PythonOutputConsole';
import {
  IconPython,
  IconCheckCircle,
  IconCircle,
  IconQuiz,
  IconBook,
  IconAward,
  IconReset
} from '../components/Icons';
import {
  getPythonPracticeProgress,
  savePythonPracticeProgress,
  getPythonPracticeHistory,
  logPythonPracticeHistory,
  getPythonSavedCode,
  savePythonSavedCode
} from '../services/storage';
import {
  initPyodideRuntime,
  executePythonCode,
  executePythonTests,
  stopPythonExecution,
  subscribePyodideStatus
} from '../services/pyodideService';

export default function PythonAcademyView({
  completedModuleIds = [],
  onToggleModuleCompletion,
  onShowToast
}) {
  // Main view tabs: 'practice' (Practice Lab) | 'curriculum' (Curriculum Lessons) | 'mistakes' | 'quiz'
  const [activeTab, setActiveTab] = useState('practice');

  // ============================================================
  // PRACTICE LAB STATE
  // ============================================================
  const [selectedExerciseId, setSelectedExerciseId] = useState('ex-1');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState('all'); // 'all' | 1 | 2 | 3 | 4 | 5
  const [practiceProgress, setPracticeProgress] = useState(() => getPythonPracticeProgress());
  const [practiceHistory, setPracticeHistory] = useState(() => getPythonPracticeHistory());

  const currentExercise =
    PRACTICE_EXERCISES.find((e) => e.id === selectedExerciseId) || PRACTICE_EXERCISES[0];

  // Editor code & stdin
  const [code, setCode] = useState(() => {
    try {
      const incoming = sessionStorage.getItem('studynest_python_incoming_snippet');
      if (incoming) {
        sessionStorage.removeItem('studynest_python_incoming_snippet');
        return incoming;
      }
    } catch {
      // ignore
    }
    const saved = getPythonSavedCode(currentExercise.id);
    return saved !== null ? saved : currentExercise.starterCode;
  });
  const [inputValues, setInputValues] = useState(currentExercise.defaultInput || '');

  // Pyodide Execution & Output States
  const [runtimeStatus, setRuntimeStatus] = useState({ status: 'loading', message: 'Initializing Python...' });
  const [isRunning, setIsRunning] = useState(false);
  const [stdout, setStdout] = useState('');
  const [stderr, setStderr] = useState('');
  const [execError, setExecError] = useState(null);
  const [executionTimeMs, setExecutionTimeMs] = useState(0);
  const [testResults, setTestResults] = useState(null);

  // Accordions for hint and solution
  const [revealedHints, setRevealedHints] = useState({});
  const [revealedSolutions, setRevealedSolutions] = useState({});

  // ============================================================
  // CURRICULUM LESSONS STATE (15 Modules)
  // ============================================================
  const [selectedModuleId, setSelectedModuleId] = useState('py-mod-1');
  const [selectedQuizOption, setSelectedQuizOption] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const selectedModule =
    PYTHON_MODULES.find((m) => m.id === selectedModuleId) || PYTHON_MODULES[0];

  // Initialize Pyodide Runtime on Mount
  useEffect(() => {
    const unsubscribe = subscribePyodideStatus((status) => {
      setRuntimeStatus(status);
    });

    initPyodideRuntime().catch((err) => {
      console.error('Pyodide init failed:', err);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Listen for snippets forwarded from Smart Notes
  useEffect(() => {
    const handleSnippetEvent = (e) => {
      if (e.detail?.code) {
        setCode(e.detail.code);
        setActiveTab('practice');
        onShowToast?.('Loaded Python snippet from Smart Notes into Practice Lab editor');
      }
    };
    window.addEventListener('studynest-incoming-python', handleSnippetEvent);
    return () => window.removeEventListener('studynest-incoming-python', handleSnippetEvent);
  }, [onShowToast]);

  // Handle switching selected exercise cleanly
  const handleSelectExercise = (newExId) => {
    if (newExId === selectedExerciseId) return;
    savePythonSavedCode(selectedExerciseId, code);
    setSelectedExerciseId(newExId);

    const saved = getPythonSavedCode(newExId);
    const ex = PRACTICE_EXERCISES.find((e) => e.id === newExId);
    if (ex) {
      setCode(saved !== null ? saved : ex.starterCode);
      setInputValues(ex.defaultInput || '');
      setStdout('');
      setStderr('');
      setExecError(null);
      setExecutionTimeMs(0);
      setTestResults(null);
    }
  };

  // Save current code draft on change
  const handleCodeChange = (newCode) => {
    setCode(newCode);
    savePythonSavedCode(selectedExerciseId, newCode);
  };

  // Run Code via Pyodide WebAssembly
  const handleRunCode = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setStdout('');
    setStderr('');
    setExecError(null);

    try {
      const result = await executePythonCode(code, inputValues);
      setStdout(result.stdout || '');
      setStderr(result.stderr || '');
      setExecError(result.error);
      setExecutionTimeMs(result.executionTimeMs || 0);

      // Log practice history entry
      const historyEntry = {
        id: `run-${Date.now()}`,
        exerciseId: currentExercise.id,
        exerciseTitle: currentExercise.title,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'run',
        success: !result.error,
        durationMs: result.executionTimeMs
      };
      const updatedHistory = logPythonPracticeHistory(historyEntry);
      setPracticeHistory(updatedHistory);

      if (result.error) {
        onShowToast?.('Execution produced a Python exception. See traceback.');
      } else {
        onShowToast?.(`Executed successfully in ${result.executionTimeMs}ms`);
      }
    } catch (err) {
      setStderr(err.message || String(err));
      setExecError(err.message || String(err));
      onShowToast?.('Failed to execute Python code.');
    } finally {
      setIsRunning(false);
    }
  };

  // Run Test Cases via Pyodide WebAssembly
  const handleRunTests = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setStdout('');
    setStderr('');
    setExecError(null);
    setTestResults(null);

    try {
      const result = await executePythonTests(
        code,
        currentExercise.testCases || [],
        currentExercise.functionName,
        inputValues
      );

      setStdout(result.stdout || '');
      setStderr(result.stderr || '');
      setExecError(result.error);
      setExecutionTimeMs(result.executionTimeMs || 0);
      setTestResults(result);

      // Log practice test history
      const historyEntry = {
        id: `test-${Date.now()}`,
        exerciseId: currentExercise.id,
        exerciseTitle: currentExercise.title,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'test',
        success: result.allPassed,
        passedTests: result.passedTests,
        totalTests: result.totalTests,
        durationMs: result.executionTimeMs
      };
      const updatedHistory = logPythonPracticeHistory(historyEntry);
      setPracticeHistory(updatedHistory);

      if (result.allPassed) {
        // Automatically mark as solved in progress
        const updatedProgress = {
          ...practiceProgress,
          [currentExercise.id]: {
            solved: true,
            solvedAt: new Date().toISOString(),
            testsPassed: result.passedTests,
            totalTests: result.totalTests
          }
        };
        setPracticeProgress(updatedProgress);
        savePythonPracticeProgress(updatedProgress);
        onShowToast?.(`🎉 All ${result.totalTests} test cases passed! Exercise marked solved.`);
      } else {
        onShowToast?.(`Completed tests: ${result.passedTests} of ${result.totalTests} passed.`);
      }
    } catch (err) {
      setStderr(err.message || String(err));
      setExecError(err.message || String(err));
      onShowToast?.('Test evaluation failed.');
    } finally {
      setIsRunning(false);
    }
  };

  // Stop Running Execution
  const handleStopExecution = () => {
    const stopped = stopPythonExecution();
    setIsRunning(false);
    setStderr('Execution was stopped by user.');
    setExecError('Execution stopped');
    if (stopped) {
      onShowToast?.('Execution terminated.');
    }
  };

  // Reset Code
  const handleResetCode = () => {
    setCode(currentExercise.starterCode);
    savePythonSavedCode(currentExercise.id, currentExercise.starterCode);
    setStdout('');
    setStderr('');
    setExecError(null);
    setTestResults(null);
    onShowToast?.('Reset editor to exercise starter code.');
  };

  // Clear Code
  const handleClearCode = () => {
    setCode('');
    savePythonSavedCode(currentExercise.id, '');
    onShowToast?.('Cleared code editor.');
  };

  // Manual Toggle Exercise Completed
  const handleToggleSolved = (exId) => {
    const isSolved = practiceProgress[exId]?.solved;
    const updated = {
      ...practiceProgress,
      [exId]: {
        solved: !isSolved,
        solvedAt: !isSolved ? new Date().toISOString() : null,
        testsPassed: currentExercise.testCases?.length || 1,
        totalTests: currentExercise.testCases?.length || 1
      }
    };
    setPracticeProgress(updated);
    savePythonPracticeProgress(updated);
    onShowToast?.(!isSolved ? `Marked "${currentExercise.title}" as completed!` : `Marked pending.`);
  };

  // Switch Module in Curriculum Tab
  const handleSelectCurriculumModule = (modId) => {
    setSelectedModuleId(modId);
    setSelectedQuizOption(null);
    setQuizSubmitted(false);
  };

  const handleCurriculumQuizSubmit = () => {
    if (selectedQuizOption === null) return;
    setQuizSubmitted(true);
    const isCorrect = selectedQuizOption === selectedModule.quiz.correctIndex;
    if (isCorrect) {
      onShowToast?.(`Correct! Excellent job on Module ${selectedModule.number} quiz.`);
    } else {
      onShowToast?.('Incorrect answer. Check the explanation below.');
    }
  };

  // Progress Calculations
  const totalExercises = PRACTICE_EXERCISES.length; // 20
  const solvedCount = Object.values(practiceProgress).filter((p) => p?.solved).length;
  const progressPercent = Math.round((solvedCount / totalExercises) * 100);

  // Level breakdowns
  const beginnerCount = PRACTICE_EXERCISES.filter((e) => e.level <= 2).length; // 9
  const beginnerSolved = PRACTICE_EXERCISES.filter((e) => e.level <= 2 && practiceProgress[e.id]?.solved).length;
  const intermediateCount = PRACTICE_EXERCISES.filter((e) => e.level === 3 || e.level === 4).length; // 8
  const intermediateSolved = PRACTICE_EXERCISES.filter((e) => (e.level === 3 || e.level === 4) && practiceProgress[e.id]?.solved).length;
  const advancedCount = PRACTICE_EXERCISES.filter((e) => e.level === 5).length; // 3
  const advancedSolved = PRACTICE_EXERCISES.filter((e) => e.level === 5 && practiceProgress[e.id]?.solved).length;

  const isCurrentSolved = !!practiceProgress[currentExercise.id]?.solved;

  // Filtered Exercises for the directory
  const filteredExercises = PRACTICE_EXERCISES.filter((ex) => {
    if (selectedLevelFilter === 'all') return true;
    return ex.level === selectedLevelFilter;
  });

  return (
    <div>
      {/* Header Banner */}
      <div className="section-header-row" style={{ marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--forest-700)', fontWeight: 700, fontSize: '13px', marginBottom: '6px' }}>
            <IconPython size={18} />
            <span>Python Academy · Browser-Powered WebAssembly Coding Studio</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--forest-950)', margin: 0 }}>
            Python Academy & Practice Lab
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Execute real Python code directly in your browser with Pyodide WebAssembly. Solve 20 progressive engineering problems with automated test case validation.
          </p>
        </div>

        {/* Global Progress Pill */}
        <div className="term-pill-badge" style={{ backgroundColor: 'var(--forest-850)', color: '#FFFFFF' }}>
          <IconAward size={16} />
          <span>{solvedCount} of {totalExercises} Practice Exercises Solved ({progressPercent}%)</span>
        </div>
      </div>

      {/* Main Top-Level Navigation Tabs */}
      <div className="modal-tabs" style={{ marginBottom: '20px' }}>
        <button
          type="button"
          className={`modal-tab-btn ${activeTab === 'practice' ? 'active' : ''}`}
          onClick={() => setActiveTab('practice')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <IconPython size={16} />
          <span>Practice Lab (Pyodide Execution & Tests)</span>
          <span style={{ fontSize: '11px', padding: '1px 7px', borderRadius: '10px', backgroundColor: activeTab === 'practice' ? 'rgba(255,255,255,0.2)' : 'var(--sage-100)', color: activeTab === 'practice' ? '#FFFFFF' : 'var(--forest-800)' }}>
            {solvedCount}/{totalExercises} Solved
          </span>
        </button>

        <button
          type="button"
          className={`modal-tab-btn ${activeTab === 'curriculum' ? 'active' : ''}`}
          onClick={() => setActiveTab('curriculum')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <IconBook size={16} />
          <span>15 Curriculum Modules & Theory</span>
          <span style={{ fontSize: '11px', padding: '1px 7px', borderRadius: '10px', backgroundColor: activeTab === 'curriculum' ? 'rgba(255,255,255,0.2)' : 'var(--sage-100)', color: activeTab === 'curriculum' ? '#FFFFFF' : 'var(--forest-800)' }}>
            {completedModuleIds.length}/15 Mastered
          </span>
        </button>

        <button
          type="button"
          className={`modal-tab-btn ${activeTab === 'mistakes' ? 'active' : ''}`}
          onClick={() => setActiveTab('mistakes')}
        >
          Common Engineering Pitfalls
        </button>

        <button
          type="button"
          className={`modal-tab-btn ${activeTab === 'quiz' ? 'active' : ''}`}
          onClick={() => setActiveTab('quiz')}
        >
          Module Concept Check Quiz
        </button>
      </div>

      {/* ============================================================
          TAB 1: PRACTICE LAB (ACTUAL PYTHON EXECUTION VIA PYODIDE)
          ============================================================ */}
      {activeTab === 'practice' && (
        <div>
          {/* Progress Summary Strip */}
          <div className="analytics-card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontWeight: 700, color: 'var(--forest-950)' }}>
                  Practice Problems Solved: {solvedCount} / {totalExercises}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Beginner: <strong>{beginnerSolved}/{beginnerCount}</strong> · Intermediate: <strong>{intermediateSolved}/{intermediateCount}</strong> · Advanced: <strong>{advancedSolved}/{advancedCount}</strong>
                </span>
              </div>
              <span style={{ fontWeight: 700, color: 'var(--forest-900)' }}>{progressPercent}% Complete</span>
            </div>

            <div className="progress-track" style={{ height: '8px' }}>
              <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          {/* Level Filter Buttons */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--forest-950)', marginRight: '4px' }}>
              Filter by Level:
            </span>
            <button
              type="button"
              className={`editor-btn-secondary ${selectedLevelFilter === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedLevelFilter('all')}
            >
              All Levels (20)
            </button>
            {PRACTICE_LEVELS.map((lvl) => (
              <button
                key={lvl.id}
                type="button"
                className={`editor-btn-secondary ${selectedLevelFilter === lvl.id ? 'active' : ''}`}
                onClick={() => setSelectedLevelFilter(lvl.id)}
              >
                <span>{lvl.name}</span>
                <span style={{ opacity: 0.75, fontSize: '11px' }}>({lvl.count})</span>
              </button>
            ))}
          </div>

          {/* Two-Column Practice Lab Layout */}
          <div className="python-lab-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 340px) 1fr', gap: '22px' }}>
            {/* Left Column: 20 Practice Exercises Directory */}
            <div className="analytics-card" style={{ padding: '16px', maxHeight: '820px', overflowY: 'auto' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--forest-950)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Practice Exercises ({filteredExercises.length})
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {filteredExercises.map((ex) => {
                  const isSelected = ex.id === selectedExerciseId;
                  const isSolved = !!practiceProgress[ex.id]?.solved;

                  return (
                    <div
                      key={ex.id}
                      onClick={() => handleSelectExercise(ex.id)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid',
                        borderColor: isSelected ? 'var(--forest-700)' : 'var(--border-subtle)',
                        backgroundColor: isSelected ? 'var(--forest-850)' : isSolved ? 'rgba(235, 245, 238, 0.6)' : 'var(--bg-card-warm)',
                        color: isSelected ? '#FFFFFF' : 'var(--text-main)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <span style={{ fontSize: '10.5px', fontWeight: 700, opacity: isSelected ? 0.9 : 0.6, textTransform: 'uppercase' }}>
                          {ex.levelName}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                          {isSolved ? (
                            <span style={{ color: isSelected ? '#A7F3D0' : '#15803D', fontWeight: 700 }}>
                              ✓ Solved
                            </span>
                          ) : (
                            <span style={{ opacity: 0.6, fontSize: '10.5px' }}>
                              {ex.difficulty}
                            </span>
                          )}
                        </span>
                      </div>

                      <div style={{ fontSize: '13px', fontWeight: 600, lineHeight: 1.3 }}>
                        {ex.title}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Practice History Quick Peek */}
              {practiceHistory.length > 0 && (
                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--forest-950)', marginBottom: '8px', textTransform: 'uppercase' }}>
                    Recent Practice Runs
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {practiceHistory.slice(0, 5).map((h) => (
                      <div
                        key={h.id}
                        style={{
                          fontSize: '11px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          color: 'var(--text-secondary)',
                          padding: '4px 6px',
                          backgroundColor: 'var(--bg-card-warm)',
                          borderRadius: '4px'
                        }}
                      >
                        <span style={{ fontWeight: 600, color: h.success ? '#15803D' : '#DC2626' }}>
                          {h.success ? '✓' : '✗'} {h.exerciseTitle.slice(0, 18)}...
                        </span>
                        <span>{h.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Active Exercise Workspace, Code Editor & Pyodide Console */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Exercise Description & Instructions Card */}
              <div className="analytics-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span className="subject-code-badge">
                        {currentExercise.levelName}
                      </span>
                      <span
                        style={{
                          fontSize: '11.5px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '10px',
                          backgroundColor:
                            currentExercise.difficulty === 'Beginner'
                              ? '#DCFCE7'
                              : currentExercise.difficulty === 'Easy'
                              ? '#CCFBF1'
                              : currentExercise.difficulty === 'Medium'
                              ? '#FEF3C7'
                              : '#EDE9FE',
                          color:
                            currentExercise.difficulty === 'Beginner'
                              ? '#166534'
                              : currentExercise.difficulty === 'Easy'
                              ? '#0F766E'
                              : currentExercise.difficulty === 'Medium'
                              ? '#B45309'
                              : '#6D28D9'
                        }}
                      >
                        {currentExercise.difficulty}
                      </span>
                    </div>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--forest-950)', margin: 0 }}>
                      {currentExercise.title}
                    </h2>
                  </div>

                  {/* Mark as Completed Button */}
                  <button
                    type="button"
                    className={`add-task-btn ${isCurrentSolved ? 'active' : ''}`}
                    style={{
                      backgroundColor: isCurrentSolved ? '#DCFCE7' : 'var(--forest-850)',
                      color: isCurrentSolved ? '#166534' : '#FFFFFF',
                      border: isCurrentSolved ? '1px solid #86EFAC' : 'none'
                    }}
                    onClick={() => handleToggleSolved(currentExercise.id)}
                  >
                    {isCurrentSolved ? <IconCheckCircle size={16} /> : <IconCircle size={16} />}
                    <span>{isCurrentSolved ? 'Solved ✓' : 'Mark as Solved'}</span>
                  </button>
                </div>

                <p style={{ fontSize: '13.5px', color: 'var(--text-body)', lineHeight: 1.6, margin: '0 0 14px' }}>
                  {currentExercise.statement}
                </p>

                {/* Example Input / Output Preview Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '14px' }}>
                  <div style={{ padding: '10px 12px', backgroundColor: 'var(--bg-card-warm)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      Example Input:
                    </div>
                    <div style={{ fontSize: '12.5px', fontFamily: 'var(--font-mono)', color: 'var(--forest-950)', marginTop: '2px' }}>
                      {currentExercise.exampleInput}
                    </div>
                  </div>

                  <div style={{ padding: '10px 12px', backgroundColor: 'var(--bg-card-warm)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      Expected Output:
                    </div>
                    <div style={{ fontSize: '12.5px', fontFamily: 'var(--font-mono)', color: 'var(--forest-900)', marginTop: '2px', whiteSpace: 'pre-line' }}>
                      {currentExercise.expectedOutput}
                    </div>
                  </div>
                </div>

                {/* Helper Action Buttons: Starter Code / Hint / Reveal Solution */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="editor-btn-secondary"
                    onClick={handleResetCode}
                    style={{ color: 'var(--forest-900)', backgroundColor: 'var(--bg-card-warm)', borderColor: 'var(--border-subtle)' }}
                  >
                    <IconReset size={13} />
                    <span>Load Starter Code</span>
                  </button>

                  <button
                    type="button"
                    className="editor-btn-secondary"
                    onClick={() =>
                      setRevealedHints((prev) => ({
                        ...prev,
                        [currentExercise.id]: !prev[currentExercise.id]
                      }))
                    }
                    style={{ color: 'var(--forest-900)', backgroundColor: 'var(--bg-card-warm)', borderColor: 'var(--border-subtle)' }}
                  >
                    <span>💡 {revealedHints[currentExercise.id] ? 'Hide Hint' : 'Show Hint'}</span>
                  </button>

                  <button
                    type="button"
                    className="editor-btn-secondary"
                    onClick={() =>
                      setRevealedSolutions((prev) => ({
                        ...prev,
                        [currentExercise.id]: !prev[currentExercise.id]
                      }))
                    }
                    style={{ color: 'var(--forest-900)', backgroundColor: 'var(--bg-card-warm)', borderColor: 'var(--border-subtle)' }}
                  >
                    <span>👁️ {revealedSolutions[currentExercise.id] ? 'Hide Solution' : 'Reveal Solution'}</span>
                  </button>
                </div>

                {/* Collapsible Hint Block */}
                {revealedHints[currentExercise.id] && (
                  <div
                    style={{
                      marginTop: '12px',
                      padding: '10px 14px',
                      backgroundColor: '#FEF3C7',
                      borderRadius: '8px',
                      border: '1px solid #FCD34D',
                      fontSize: '12.5px',
                      color: '#92400E'
                    }}
                  >
                    <strong>💡 Concept Hint: </strong>
                    {currentExercise.hint}
                  </div>
                )}

                {/* Collapsible Model Solution Block */}
                {revealedSolutions[currentExercise.id] && (
                  <div
                    style={{
                      marginTop: '12px',
                      padding: '12px 14px',
                      backgroundColor: '#111A15',
                      borderRadius: '8px',
                      border: '1px solid #233C2E'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#34D399', textTransform: 'uppercase' }}>
                        Reference Model Solution
                      </span>
                      <button
                        type="button"
                        className="editor-btn-secondary"
                        onClick={() => {
                          handleCodeChange(currentExercise.solutionCode);
                          onShowToast?.('Loaded model solution into code editor!');
                        }}
                        style={{ padding: '3px 8px', fontSize: '11px' }}
                      >
                        Load into Editor ➔
                      </button>
                    </div>
                    <pre
                      style={{
                        margin: 0,
                        fontFamily: 'var(--font-mono)',
                        fontSize: '12.5px',
                        color: '#E8F3EB',
                        lineHeight: 1.5,
                        overflowX: 'auto'
                      }}
                    >
                      {currentExercise.solutionCode}
                    </pre>
                  </div>
                )}
              </div>

              {/* 1. Large Editable Python Code Editor with Line Numbers & Syntax Highlighting */}
              <PythonCodeEditor
                code={code}
                onChange={handleCodeChange}
                onRun={handleRunCode}
                onRunTests={handleRunTests}
                onStop={handleStopExecution}
                onReset={handleResetCode}
                onClear={handleClearCode}
                isRunning={isRunning}
                hasTests={!!currentExercise.testCases && currentExercise.testCases.length > 0}
                inputValues={inputValues}
                onInputValuesChange={setInputValues}
                onShowToast={onShowToast}
                runtimeStatus={runtimeStatus}
              />

              {/* 2. Actual Python Output Console & Test Results */}
              <PythonOutputConsole
                stdout={stdout}
                stderr={stderr}
                error={execError}
                executionTimeMs={executionTimeMs}
                testResults={testResults}
                onClearConsole={() => {
                  setStdout('');
                  setStderr('');
                  setExecError(null);
                  setTestResults(null);
                }}
                onMarkCompleted={() => handleToggleSolved(currentExercise.id)}
                isCompleted={isCurrentSolved}
              />
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 2: 15 CURRICULUM LESSONS (THEORY, SYNTAX, EXAMPLES)
          ============================================================ */}
      {activeTab === 'curriculum' && (
        <div className="python-curriculum-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 2.2fr', gap: '24px' }}>
          {/* Left Column: 15 Modules Directory */}
          <div className="analytics-card" style={{ padding: '18px', maxHeight: '780px', overflowY: 'auto' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--forest-950)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              15 Modules Directory
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {PYTHON_MODULES.map((mod) => {
                const isSelected = mod.id === selectedModuleId;
                const modCompleted = completedModuleIds.includes(mod.id);

                return (
                  <div
                    key={mod.id}
                    onClick={() => handleSelectCurriculumModule(mod.id)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid',
                      borderColor: isSelected ? 'var(--forest-700)' : 'var(--border-subtle)',
                      backgroundColor: isSelected ? 'var(--forest-850)' : modCompleted ? 'rgba(235, 245, 238, 0.6)' : 'var(--bg-card-warm)',
                      color: isSelected ? '#FFFFFF' : 'var(--text-main)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span style={{ fontSize: '10.5px', fontWeight: 700, opacity: isSelected ? 0.9 : 0.6, textTransform: 'uppercase' }}>
                        Module {mod.number}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                        {modCompleted && (
                          <span style={{ color: isSelected ? '#A7F3D0' : '#15803D', fontWeight: 600 }}>
                            ✓ Done
                          </span>
                        )}
                      </span>
                    </div>

                    <div style={{ fontSize: '13px', fontWeight: 600, lineHeight: 1.3 }}>
                      {mod.title}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Module Details */}
          <div className="analytics-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--forest-700)', textTransform: 'uppercase' }}>
                  Module {selectedModule.number} · Est. {selectedModule.duration}
                </div>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--forest-950)', margin: '2px 0 0' }}>
                  {selectedModule.title}
                </h2>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="add-task-btn"
                  style={{ backgroundColor: 'var(--forest-900)', color: '#FFFFFF' }}
                  onClick={() => setActiveTab('practice')}
                >
                  <IconPython size={16} />
                  <span>Open in Practice Lab</span>
                </button>

                <button
                  type="button"
                  className={`add-task-btn ${completedModuleIds.includes(selectedModule.id) ? 'active' : ''}`}
                  style={{
                    backgroundColor: completedModuleIds.includes(selectedModule.id) ? '#DCFCE7' : 'var(--bg-card-warm)',
                    color: completedModuleIds.includes(selectedModule.id) ? '#166534' : 'var(--forest-950)',
                    border: '1px solid var(--border-subtle)'
                  }}
                  onClick={() => onToggleModuleCompletion(selectedModule.id, selectedModule.title)}
                >
                  {completedModuleIds.includes(selectedModule.id) ? <IconCheckCircle size={16} /> : <IconCircle size={16} />}
                  <span>{completedModuleIds.includes(selectedModule.id) ? 'Completed' : 'Mark Lesson as Completed'}</span>
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--forest-950)', marginBottom: '6px' }}>
                  Concept Explanation
                </h3>
                <p style={{ fontSize: '13.5px', color: 'var(--text-body)', lineHeight: 1.6 }}>
                  {selectedModule.explanation}
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--forest-950)', marginBottom: '6px' }}>
                  Language Syntax
                </h3>
                <pre style={{
                  padding: '12px 14px',
                  backgroundColor: 'var(--bg-card-warm)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12.5px',
                  color: 'var(--forest-950)',
                  overflowX: 'auto'
                }}>
                  <code>{selectedModule.syntax}</code>
                </pre>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--forest-950)', margin: 0 }}>
                    Worked Example Code
                  </h3>
                  <button
                    type="button"
                    className="editor-btn-secondary"
                    onClick={() => {
                      setCode(selectedModule.exampleCode);
                      setActiveTab('practice');
                      onShowToast?.(`Loaded Module ${selectedModule.number} example into Practice Lab!`);
                    }}
                    style={{ color: 'var(--forest-900)', backgroundColor: 'var(--bg-card-warm)', borderColor: 'var(--border-subtle)', padding: '3px 8px', fontSize: '11.5px' }}
                  >
                    <span>Run in Practice Lab ➔</span>
                  </button>
                </div>
                <pre style={{
                  padding: '14px',
                  backgroundColor: '#122018',
                  color: '#E8F3EB',
                  borderRadius: '10px',
                  border: '1px solid #233A2D',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  lineHeight: 1.5,
                  overflowX: 'auto'
                }}>
                  <code>{selectedModule.exampleCode}</code>
                </pre>
              </div>

              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--forest-950)', marginBottom: '6px' }}>
                  Expected Standard Output
                </h3>
                <pre style={{
                  padding: '12px 14px',
                  backgroundColor: '#FAF8F5',
                  borderRadius: '8px',
                  border: '1px solid var(--border-card)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12.5px',
                  color: 'var(--forest-900)',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap'
                }}>
                  {selectedModule.expectedOutput}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 3: COMMON MISTAKES & EXERCISES
          ============================================================ */}
      {activeTab === 'mistakes' && (
        <div className="analytics-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--forest-700)', textTransform: 'uppercase' }}>
              Module {selectedModule.number}: {selectedModule.title}
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#B91C1C', margin: '4px 0 10px' }}>
              Common Engineering Pitfalls & Mistakes:
            </h3>
            <ul style={{ paddingLeft: '20px', fontSize: '13.5px', color: 'var(--text-body)', lineHeight: 1.6 }}>
              {selectedModule.commonMistakes.map((m, i) => (
                <li key={i} style={{ marginBottom: '8px' }}>{m}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--forest-950)', marginBottom: '10px' }}>
              Independent Practice Exercises:
            </h3>
            <ol style={{ paddingLeft: '20px', fontSize: '13.5px', color: 'var(--text-body)', lineHeight: 1.6 }}>
              {selectedModule.practiceQuestions.map((q, i) => (
                <li key={i} style={{ marginBottom: '8px' }}>{q}</li>
              ))}
            </ol>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button
              type="button"
              className="add-task-btn"
              style={{ backgroundColor: 'var(--forest-900)', color: '#FFFFFF' }}
              onClick={() => setActiveTab('practice')}
            >
              <IconPython size={16} />
              <span>Go to Practice Lab</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================
          TAB 4: MODULE QUIZ
          ============================================================ */}
      {activeTab === 'quiz' && (
        <div className="analytics-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--forest-700)', textTransform: 'uppercase' }}>
              Module {selectedModule.number} Concept Check
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--forest-950)', margin: '4px 0 14px' }}>
              {selectedModule.quiz.question}
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {selectedModule.quiz.options.map((opt, idx) => {
              const isSelected = selectedQuizOption === idx;
              const isCorrect = idx === selectedModule.quiz.correctIndex;
              let bg = 'var(--bg-card-warm)';
              let border = 'var(--border-subtle)';

              if (quizSubmitted) {
                if (isCorrect) {
                  bg = '#ECFDF5';
                  border = '#34D399';
                } else if (isSelected && !isCorrect) {
                  bg = '#FEF2F2';
                  border = '#F87171';
                }
              } else if (isSelected) {
                bg = 'rgba(23, 40, 30, 0.08)';
                border = 'var(--forest-800)';
              }

              return (
                <div
                  key={idx}
                  onClick={() => !quizSubmitted && setSelectedQuizOption(idx)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: `1px solid ${border}`,
                    backgroundColor: bg,
                    cursor: quizSubmitted ? 'default' : 'pointer',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <span style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: `1.5px solid ${isSelected ? 'var(--forest-800)' : 'var(--sage-400)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700
                  }}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{opt}</span>
                </div>
              );
            })}
          </div>

          {quizSubmitted && (
            <div style={{
              padding: '12px 14px',
              borderRadius: '8px',
              backgroundColor: selectedQuizOption === selectedModule.quiz.correctIndex ? '#F0FDF4' : '#FEF2F2',
              border: '1px solid var(--border-subtle)',
              fontSize: '12.5px',
              lineHeight: 1.5,
              color: 'var(--text-body)'
            }}>
              <strong>Explanation: </strong> {selectedModule.quiz.explanation}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
            {quizSubmitted ? (
              <button
                type="button"
                className="sem2-action-btn"
                onClick={() => {
                  setSelectedQuizOption(null);
                  setQuizSubmitted(false);
                }}
              >
                Try Again
              </button>
            ) : (
              <button
                type="button"
                className="add-task-btn"
                onClick={handleCurriculumQuizSubmit}
                disabled={selectedQuizOption === null}
              >
                <IconQuiz size={15} />
                <span>Check Answer</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
