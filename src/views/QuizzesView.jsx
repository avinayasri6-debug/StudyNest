import React, { useState } from 'react';
import { IconQuiz, IconSparkles, IconReset, IconClock } from '../components/Icons';
import { SEMESTER_1_SUBJECTS } from '../data/subjectsData';
import { ALL_SEMESTER_QUIZZES } from '../data/quizzesData';

export default function QuizzesView({
  quizHistory = [],
  onSaveQuizAttempt,
  initialSubjectId = 'math101',
  onShowToast
}) {
  const [selectedSubjectId, setSelectedSubjectId] = useState(initialSubjectId);
  const [userAnswers, setUserAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [viewTab, setViewTab] = useState('quiz'); // 'quiz' | 'history'

  const currentQuiz = ALL_SEMESTER_QUIZZES[selectedSubjectId] || ALL_SEMESTER_QUIZZES.math101;

  const handleSelectOption = (qId, optionIdx) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const calculateScore = () => {
    let score = 0;
    currentQuiz.questions.forEach((q) => {
      if (userAnswers[q.id] === q.correct) {
        score += 1;
      }
    });
    return score;
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    const score = calculateScore();
    const total = currentQuiz.questions.length;
    const percentage = Math.round((score / total) * 100);

    // Save to real quiz history in localStorage
    const attempt = {
      id: `attempt-${Date.now()}`,
      subjectId: selectedSubjectId,
      subjectCode: currentQuiz.code,
      subjectTitle: currentQuiz.title,
      score,
      total,
      percentage,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now()
    };
    onSaveQuizAttempt(attempt);
    onShowToast?.(`Quiz submitted! You scored ${score} of ${total} (${percentage}%)`);
  };

  const handleResetQuiz = () => {
    setUserAnswers({});
    setIsSubmitted(false);
  };

  const handleSwitchSubject = (subId) => {
    setSelectedSubjectId(subId);
    setUserAnswers({});
    setIsSubmitted(false);
  };

  const score = isSubmitted ? calculateScore() : 0;
  const total = currentQuiz.questions.length;
  const percentage = Math.round((score / total) * 100);

  return (
    <div>
      {/* Title */}
      <div className="section-header-row" style={{ marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--sage-600)', fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>
            <IconQuiz size={16} />
            <span>Interactive Self-Evaluation · Semester 1</span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--forest-950)', margin: 0 }}>
            Engineering Practice Quizzes
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Practice questions for all 7 confirmed Semester 1 courses with instant explanations and real attempt history.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className={`modal-tab-btn ${viewTab === 'quiz' ? 'active' : ''}`}
            onClick={() => setViewTab('quiz')}
          >
            Practice Quiz
          </button>
          <button
            type="button"
            className={`modal-tab-btn ${viewTab === 'history' ? 'active' : ''}`}
            onClick={() => setViewTab('history')}
          >
            Attempt History ({quizHistory.length})
          </button>
        </div>
      </div>

      {/* Mandatory Disclaimer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 14px',
        backgroundColor: 'rgba(104, 143, 120, 0.12)',
        borderRadius: '8px',
        border: '1px solid var(--border-sage)',
        marginBottom: '20px',
        fontSize: '12.5px',
        color: 'var(--forest-900)'
      }}>
        <IconSparkles size={16} style={{ flexShrink: 0 }} />
        <span><strong>Diagnostic Practice Notice: </strong>Practice concept questions for self-assessment. Not official university examination questions.</span>
      </div>

      {viewTab === 'quiz' && (
        <>
          {/* Subject Pills (All 7 subjects) */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '22px', flexWrap: 'wrap' }}>
            {SEMESTER_1_SUBJECTS.map((sub) => (
              <button
                key={sub.id}
                type="button"
                className={`modal-tab-btn ${selectedSubjectId === sub.id ? 'active' : ''}`}
                onClick={() => handleSwitchSubject(sub.id)}
              >
                {sub.shortName}
              </button>
            ))}
          </div>

          {/* Quiz Container */}
          <div className="analytics-card" style={{ padding: '28px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '14px',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <div>
                <span className="subject-code-badge" style={{ marginBottom: '4px' }}>{currentQuiz.code}</span>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--forest-950)', margin: '4px 0 0' }}>
                  {currentQuiz.title} Practice Test
                </h2>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {total} Multiple-Choice Questions · 4 Answer Options
                </div>
              </div>

              {isSubmitted && (
                <div
                  className="term-pill-badge"
                  style={{
                    backgroundColor: percentage >= 75 ? '#DCFCE7' : percentage >= 50 ? '#FEF3C7' : '#FEE2E2',
                    color: percentage >= 75 ? '#166534' : percentage >= 50 ? '#92400E' : '#991B1B'
                  }}
                >
                  <IconSparkles size={14} />
                  <span>Final Score: {score} / {total} ({percentage}%)</span>
                </div>
              )}
            </div>

            {/* Questions list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              {currentQuiz.questions.map((q, idx) => {
                const chosen = userAnswers[q.id];
                const isCorrect = isSubmitted && chosen === q.correct;
                const isWrong = isSubmitted && chosen !== undefined && chosen !== q.correct;

                return (
                  <div
                    key={q.id}
                    style={{
                      padding: '18px',
                      borderRadius: '12px',
                      backgroundColor: 'var(--bg-card-warm)',
                      border: '1px solid',
                      borderColor: isCorrect ? '#86EFAC' : isWrong ? '#FCA5A5' : 'var(--border-subtle)'
                    }}
                  >
                    <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--forest-950)', marginBottom: '12px' }}>
                      {idx + 1}. {q.question}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {q.options.map((opt, optIdx) => {
                        const isSelected = chosen === optIdx;
                        let bg = '#FFFFFF';
                        let border = 'var(--border-card)';
                        let color = 'var(--text-main)';

                        if (isSubmitted) {
                          if (optIdx === q.correct) {
                            bg = '#ECFDF5';
                            border = '#34D399';
                            color = '#065F46';
                          } else if (isSelected && optIdx !== q.correct) {
                            bg = '#FEF2F2';
                            border = '#F87171';
                            color = '#991B1B';
                          }
                        } else if (isSelected) {
                          bg = 'var(--forest-850)';
                          border = 'var(--forest-850)';
                          color = '#FFFFFF';
                        }

                        return (
                          <div
                            key={optIdx}
                            onClick={() => handleSelectOption(q.id, optIdx)}
                            style={{
                              padding: '10px 14px',
                              borderRadius: '8px',
                              border: `1px solid ${border}`,
                              backgroundColor: bg,
                              color: color,
                              cursor: isSubmitted ? 'default' : 'pointer',
                              fontSize: '13px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <span style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              border: `1.5px solid ${isSelected ? (isSubmitted ? (optIdx === q.correct ? '#10B981' : '#EF4444') : '#FFFFFF') : 'var(--sage-400)'}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '11px',
                              fontWeight: 700
                            }}>
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{opt}</span>
                          </div>
                        );
                      })}
                    </div>

                    {isSubmitted && (
                      <div style={{
                        marginTop: '12px',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        backgroundColor: '#FFFFFF',
                        fontSize: '12.5px',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-subtle)',
                        lineHeight: 1.5
                      }}>
                        <strong>Explanation: </strong> {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
              {isSubmitted ? (
                <button
                  type="button"
                  className="add-task-btn"
                  onClick={handleResetQuiz}
                >
                  <IconReset size={15} />
                  <span>Retry Quiz</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="add-task-btn"
                  onClick={handleSubmit}
                  disabled={Object.keys(userAnswers).length === 0}
                >
                  <span>Submit Practice Answers</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* SUB-TAB 2: QUIZ HISTORY */}
      {viewTab === 'history' && (
        <div className="analytics-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--forest-950)', marginBottom: '4px' }}>
            Quiz Attempt History
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '18px' }}>
            Historical record of your self-evaluation submissions across Semester 1 subjects.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {quizHistory.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-card-warm)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <span className="subject-code-badge">{item.subjectCode}</span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--forest-950)' }}>
                      {item.subjectTitle}
                    </span>
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <IconClock size={12} />
                    <span>Completed on {item.date}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--forest-950)' }}>
                    {item.score} / {item.total}
                  </div>
                  <span
                    className="task-subject-tag"
                    style={{
                      backgroundColor: item.percentage >= 75 ? '#DCFCE7' : item.percentage >= 50 ? '#FEF3C7' : '#FEE2E2',
                      color: item.percentage >= 75 ? '#166534' : item.percentage >= 50 ? '#92400E' : '#991B1B'
                    }}
                  >
                    {item.percentage}% Score
                  </span>
                </div>
              </div>
            ))}

            {quizHistory.length === 0 && (
              <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No quiz attempts recorded yet. Take your first practice quiz to see your scores here!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
