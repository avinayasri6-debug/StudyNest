import React, { useState } from 'react';
import {
  IconX,
  IconCheckCircle,
  IconCircle,
  IconClock,
  IconNotes,
  IconPython,
  IconAward,
  IconVideo,
  IconPlus,
  IconSparkles,
  IconTrash
} from './Icons';
import { getAllSubjectTopics, SAMPLE_SYLLABUS_DISCLAIMER } from '../data/subjectsData';

export default function SubjectModal({
  subject,
  completedTopicIds = [],
  onToggleTopic,
  assignments = [],
  onSaveAssignments,
  subjectNotes = [],
  onAddNote,
  onOpenExam,
  onOpenVideos,
  onOpenPythonAcademy,
  onOpenAIAssistant,
  onClose,
  onShowToast
}) {
  const [activeTab, setActiveTab] = useState('topics'); // 'topics' | 'assignments' | 'questions' | 'notes' | 'overview'
  const [revealedQuestions, setRevealedQuestions] = useState({});
  const [newTopicName, setNewTopicName] = useState('');
  const [customTopics, setCustomTopics] = useState([]);
  
  // New assignment form state
  const [newAsgTitle, setNewAsgTitle] = useState('');
  const [newAsgDate, setNewAsgDate] = useState('');

  // Quick note form state
  const [quickNoteTitle, setQuickNoteTitle] = useState('');
  const [quickNoteBody, setQuickNoteBody] = useState('');

  if (!subject) return null;

  const baseTopics = getAllSubjectTopics(subject);
  const allTopics = [...baseTopics, ...customTopics];
  const totalTopics = allTopics.length;
  const completedCount = allTopics.filter((t) => completedTopicIds.includes(t.id)).length;
  const progressPercent = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

  const isPython = subject.id === 'cse101';

  // Important questions reveal toggle
  const toggleQuestionReveal = (qId) => {
    setRevealedQuestions((prev) => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  // Add custom topic
  const handleAddTopic = (e) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;
    const newTopic = {
      id: `custom-topic-${Date.now()}`,
      name: newTopicName.trim(),
      unitNumber: (subject.units?.length || 1),
      unitTitle: 'Custom Student Topics'
    };
    setCustomTopics((prev) => [...prev, newTopic]);
    setNewTopicName('');
    onShowToast?.(`Added topic: "${newTopic.name}"`);
  };

  // Add assignment
  const handleAddAssignment = (e) => {
    e.preventDefault();
    if (!newAsgTitle.trim()) return;
    const newAsg = {
      id: `asg-${Date.now()}`,
      subjectId: subject.id,
      title: newAsgTitle.trim(),
      dueDate: newAsgDate || new Date().toISOString().split('T')[0],
      status: 'Pending'
    };
    const updated = [newAsg, ...assignments];
    onSaveAssignments(updated);
    setNewAsgTitle('');
    setNewAsgDate('');
    onShowToast?.(`Assignment added for ${subject.shortName}`);
  };

  // Toggle assignment status
  const handleToggleAssignment = (asgId) => {
    const updated = assignments.map((a) => {
      if (a.id === asgId) {
        const nextStatus = a.status === 'Submitted' ? 'Pending' : 'Submitted';
        onShowToast?.(`Assignment marked as ${nextStatus}`);
        return { ...a, status: nextStatus };
      }
      return a;
    });
    onSaveAssignments(updated);
  };

  // Delete assignment
  const handleDeleteAssignment = (asgId) => {
    const updated = assignments.filter((a) => a.id !== asgId);
    onSaveAssignments(updated);
    onShowToast?.('Assignment removed');
  };

  // Quick note submit
  const handleAddQuickNote = (e) => {
    e.preventDefault();
    if (!quickNoteTitle.trim()) return;
    onAddNote({
      id: `note-${Date.now()}`,
      title: quickNoteTitle.trim(),
      subject: subject.title,
      subjectCode: subject.code,
      content: quickNoteBody.trim(),
      updatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    });
    setQuickNoteTitle('');
    setQuickNoteBody('');
    onShowToast?.(`Note added to ${subject.shortName}`);
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '780px' }}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
              <span className="subject-code-badge">{subject.code}</span>
              <span className="info-pill">{subject.credits} Credits</span>
              <span className="info-pill">{subject.category}</span>
              <span className="term-pill-badge" style={{ backgroundColor: 'var(--sage-100)', color: 'var(--forest-900)' }}>
                {progressPercent}% Complete
              </span>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--forest-950)', margin: 0 }}>
              {subject.title}
            </h2>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close subject modal"
          >
            <IconX size={18} />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div style={{ padding: '0 28px', backgroundColor: 'var(--bg-card-warm)', borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="modal-tabs" style={{ margin: 0, padding: '12px 0 8px', overflowX: 'auto' }}>
            <button
              type="button"
              className={`modal-tab-btn ${activeTab === 'topics' ? 'active' : ''}`}
              onClick={() => setActiveTab('topics')}
            >
              Units & Topics ({completedCount}/{totalTopics})
            </button>
            <button
              type="button"
              className={`modal-tab-btn ${activeTab === 'assignments' ? 'active' : ''}`}
              onClick={() => setActiveTab('assignments')}
            >
              Assignments ({assignments.length})
            </button>
            <button
              type="button"
              className={`modal-tab-btn ${activeTab === 'questions' ? 'active' : ''}`}
              onClick={() => setActiveTab('questions')}
            >
              Important Questions ({subject.importantQuestions?.length || 0})
            </button>
            <button
              type="button"
              className={`modal-tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
              onClick={() => setActiveTab('notes')}
            >
              Personal Notes ({subjectNotes.length})
            </button>
            <button
              type="button"
              className={`modal-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview & Details
            </button>
            {isPython && (
              <button
                type="button"
                className={`modal-tab-btn ${activeTab === 'practice' ? 'active' : ''}`}
                onClick={() => setActiveTab('practice')}
              >
                Practice Lab & Code
              </button>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* TAB 1: UNITS & TOPICS (With Completion Checkboxes) */}
          {activeTab === 'topics' && (
            <div>
              {/* Mandatory Disclaimer */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                backgroundColor: 'rgba(104, 143, 120, 0.12)',
                borderRadius: '8px',
                border: '1px solid var(--border-sage)',
                marginBottom: '18px',
                fontSize: '12.5px',
                color: 'var(--forest-900)'
              }}>
                <IconSparkles size={16} style={{ flexShrink: 0 }} />
                <span>{SAMPLE_SYLLABUS_DISCLAIMER}</span>
              </div>

              {/* Progress Bar Header */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  <span style={{ color: 'var(--forest-950)' }}>Subject Mastery Progress</span>
                  <span style={{ color: 'var(--forest-900)' }}>{completedCount} of {totalTopics} topics ({progressPercent}%)</span>
                </div>
                <div className="progress-track" style={{ height: '8px' }}>
                  <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>

              {/* Units List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {subject.units?.map((unit) => (
                  <div
                    key={unit.unitNumber}
                    style={{
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-card-warm)',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{
                      padding: '10px 14px',
                      backgroundColor: 'rgba(23, 40, 30, 0.04)',
                      fontWeight: 700,
                      fontSize: '13px',
                      color: 'var(--forest-950)',
                      borderBottom: '1px solid var(--border-subtle)'
                    }}>
                      Unit {unit.unitNumber}: {unit.unitTitle}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {unit.topics.map((t) => {
                        const isDone = completedTopicIds.includes(t.id);
                        return (
                          <div
                            key={t.id}
                            onClick={() => onToggleTopic(t.id, t.name)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '10px 14px',
                              borderBottom: '1px solid rgba(23, 40, 30, 0.04)',
                              cursor: 'pointer',
                              backgroundColor: isDone ? 'rgba(235, 245, 238, 0.5)' : '#FFFFFF',
                              transition: 'background-color 0.15s ease'
                            }}
                          >
                            <button
                              type="button"
                              className={`task-checkbox-btn ${isDone ? 'checked' : ''}`}
                              aria-label={isDone ? 'Mark topic incomplete' : 'Mark topic complete'}
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleTopic(t.id, t.name);
                              }}
                            >
                              {isDone ? <IconCheckCircle size={18} /> : <IconCircle size={18} />}
                            </button>
                            <span style={{
                              fontSize: '13px',
                              fontWeight: 500,
                              color: isDone ? 'var(--text-muted)' : 'var(--forest-950)',
                              textDecoration: isDone ? 'line-through' : 'none'
                            }}>
                              {t.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Custom topics added by student */}
                {customTopics.length > 0 && (
                  <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-card-warm)', overflow: 'hidden' }}>
                    <div style={{ padding: '10px 14px', fontWeight: 700, fontSize: '13px', color: 'var(--forest-950)', borderBottom: '1px solid var(--border-subtle)' }}>
                      Student Custom Topics
                    </div>
                    {customTopics.map((ct) => {
                      const isDone = completedTopicIds.includes(ct.id);
                      return (
                        <div
                          key={ct.id}
                          onClick={() => onToggleTopic(ct.id, ct.name)}
                          style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderBottom: '1px solid rgba(23, 40, 30, 0.04)', cursor: 'pointer' }}
                        >
                          <button
                            type="button"
                            className={`task-checkbox-btn ${isDone ? 'checked' : ''}`}
                            aria-label="Toggle custom topic"
                          >
                            {isDone ? <IconCheckCircle size={18} /> : <IconCircle size={18} />}
                          </button>
                          <span style={{ fontSize: '13px', color: isDone ? 'var(--text-muted)' : 'var(--forest-950)', textDecoration: isDone ? 'line-through' : 'none' }}>
                            {ct.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Add custom topic form */}
              <form onSubmit={handleAddTopic} style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <input
                  type="text"
                  className="add-task-input"
                  placeholder="Add specific syllabus topic or sub-unit..."
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                />
                <button type="submit" className="add-task-btn">
                  <IconPlus size={15} />
                  <span>Add Topic</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: ASSIGNMENT TRACKER */}
          {activeTab === 'assignments' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--forest-950)' }}>
                  Semester 1 Assignment Tracker
                </span>
                <span className="info-pill">
                  {assignments.filter((a) => a.status === 'Submitted').length} of {assignments.length} Submitted
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
                {assignments.map((asg) => {
                  const isSubmitted = asg.status === 'Submitted';
                  return (
                    <div
                      key={asg.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-card-warm)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button
                          type="button"
                          className={`task-checkbox-btn ${isSubmitted ? 'checked' : ''}`}
                          onClick={() => handleToggleAssignment(asg.id)}
                          aria-label={isSubmitted ? 'Mark assignment pending' : 'Mark assignment submitted'}
                        >
                          {isSubmitted ? <IconCheckCircle size={18} /> : <IconCircle size={18} />}
                        </button>
                        <div>
                          <div style={{
                            fontSize: '13.5px',
                            fontWeight: 600,
                            color: isSubmitted ? 'var(--text-muted)' : 'var(--forest-950)',
                            textDecoration: isSubmitted ? 'line-through' : 'none'
                          }}>
                            {asg.title}
                          </div>
                          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <IconClock size={12} />
                            <span>Due Date: {asg.dueDate}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          className="task-subject-tag"
                          style={{
                            backgroundColor: isSubmitted ? '#DCFCE7' : '#FEF3C7',
                            color: isSubmitted ? '#166534' : '#92400E'
                          }}
                        >
                          {isSubmitted ? 'Submitted' : 'Pending'}
                        </span>
                        <button
                          type="button"
                          className="task-delete-btn"
                          onClick={() => handleDeleteAssignment(asg.id)}
                          title="Delete assignment"
                          style={{ opacity: 1 }}
                        >
                          <IconTrash size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {assignments.length === 0 && (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                    No assignments recorded for this subject yet. Add one below!
                  </div>
                )}
              </div>

              {/* Add assignment form */}
              <form onSubmit={handleAddAssignment} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', padding: '14px', backgroundColor: 'var(--bg-card-warm)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <input
                  type="text"
                  className="add-task-input"
                  style={{ flex: 2, minWidth: '180px' }}
                  placeholder="Assignment title (e.g. Lab experiment 2 writeup)..."
                  value={newAsgTitle}
                  onChange={(e) => setNewAsgTitle(e.target.value)}
                />
                <input
                  type="date"
                  className="add-task-input"
                  style={{ flex: 1, minWidth: '130px' }}
                  value={newAsgDate}
                  onChange={(e) => setNewAsgDate(e.target.value)}
                />
                <button type="submit" className="add-task-btn">
                  <IconPlus size={15} />
                  <span>Add Assignment</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: IMPORTANT QUESTIONS */}
          {activeTab === 'questions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Sample core concept practice questions. Click "Reveal Model Answer" to inspect key principles.
              </p>
              {subject.importantQuestions?.map((iq, idx) => {
                const isRevealed = !!revealedQuestions[iq.id];
                return (
                  <div
                    key={iq.id}
                    style={{
                      padding: '16px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-card-warm)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--forest-950)', marginBottom: '8px' }}>
                      Q{idx + 1}: {iq.question}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="section-action-btn"
                        onClick={() => toggleQuestionReveal(iq.id)}
                      >
                        <span>{isRevealed ? 'Hide Answer' : 'Reveal Model Answer'}</span>
                      </button>
                    </div>

                    {isRevealed && (
                      <div
                        style={{
                          marginTop: '10px',
                          padding: '12px 14px',
                          backgroundColor: '#FFFFFF',
                          borderRadius: '8px',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '13px',
                          color: 'var(--text-body)',
                          lineHeight: 1.5,
                          whiteSpace: 'pre-wrap'
                        }}
                      >
                        <strong>Model Answer: </strong>
                        {iq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 4: PERSONAL NOTES */}
          {activeTab === 'notes' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--forest-950)' }}>
                  Notes linked to {subject.code}
                </span>
                <span className="info-pill">{subjectNotes.length} Saved</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
                {subjectNotes.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-card-warm)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--forest-950)', marginBottom: '4px' }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-body)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                      {n.content}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
                      Last updated: {n.updatedAt}
                    </div>
                  </div>
                ))}

                {subjectNotes.length === 0 && (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                    No personal notes saved for this subject yet. Create one below!
                  </div>
                )}
              </div>

              {/* Quick Note Form */}
              <form onSubmit={handleAddQuickNote} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '14px', backgroundColor: 'var(--bg-card-warm)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <input
                  type="text"
                  className="add-task-input"
                  placeholder="Note title (e.g. Eigenvalues Theorem Recap)..."
                  value={quickNoteTitle}
                  onChange={(e) => setQuickNoteTitle(e.target.value)}
                />
                <textarea
                  className="add-task-input"
                  rows={3}
                  placeholder="Write your study notes, formulas, or key reminders here..."
                  value={quickNoteBody}
                  onChange={(e) => setQuickNoteBody(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="add-task-btn">
                    <IconNotes size={15} />
                    <span>Save Note</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 5: OVERVIEW & DETAILS */}
          {activeTab === 'overview' && (
            <div style={{ fontSize: '14px', color: 'var(--text-body)', lineHeight: 1.6 }}>
              <p style={{ marginBottom: '16px' }}>{subject.description}</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                <div style={{ padding: '12px', backgroundColor: 'var(--bg-card-warm)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Department</div>
                  <div style={{ fontWeight: 600, color: 'var(--forest-950)' }}>{subject.department}</div>
                </div>
                <div style={{ padding: '12px', backgroundColor: 'var(--bg-card-warm)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Credits</div>
                  <div style={{ fontWeight: 600, color: 'var(--forest-950)' }}>{subject.credits} Credits</div>
                </div>
                <div style={{ padding: '12px', backgroundColor: 'var(--bg-card-warm)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Class Hours</div>
                  <div style={{ fontWeight: 600, color: 'var(--forest-950)' }}>{subject.weeklyHours}</div>
                </div>
              </div>

              <div style={{ padding: '14px', backgroundColor: 'rgba(104, 143, 120, 0.12)', borderRadius: '8px', border: '1px solid var(--border-sage)', fontSize: '12.5px' }}>
                <strong>Academic Notice: </strong>
                {SAMPLE_SYLLABUS_DISCLAIMER}
              </div>
            </div>
          )}

          {/* TAB 6: PYTHON PRACTICE LAB LINK */}
          {isPython && activeTab === 'practice' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '16px', backgroundColor: 'var(--bg-card-warm)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <IconPython size={20} style={{ color: 'var(--forest-800)' }} />
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--forest-950)', margin: 0 }}>
                    Hands-on Python Practice Lab
                  </h3>
                </div>
                <p style={{ fontSize: '13.5px', color: 'var(--text-body)', lineHeight: 1.6, margin: '0 0 14px' }}>
                  Master Problem Solving and Programming in Python (CSE 101) with our browser-powered Pyodide WebAssembly workspace. Solve 20 progressive exercises with line numbers, syntax highlighting, and automated test cases.
                </p>
                <button
                  type="button"
                  className="add-task-btn"
                  style={{ backgroundColor: 'var(--forest-900)', color: '#FFFFFF' }}
                  onClick={() => {
                    onClose();
                    onOpenPythonAcademy?.();
                  }}
                >
                  <IconPython size={16} />
                  <span>Launch Python Practice Lab (20 Exercises) ➔</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
            Course Code: <strong>{subject.code}</strong>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {onOpenVideos && (
              <button
                type="button"
                className="sem2-action-btn"
                onClick={() => {
                  onClose();
                  onOpenVideos(subject.id);
                }}
              >
                <IconVideo size={16} />
                <span>Video Lectures</span>
              </button>
            )}

            {onOpenExam && (
              <button
                type="button"
                className="sem2-action-btn"
                onClick={() => {
                  onClose();
                  onOpenExam(subject.id);
                }}
              >
                <IconAward size={16} />
                <span>Exam Prep</span>
              </button>
            )}

            {onOpenAIAssistant && (
              <button
                type="button"
                className="sem2-action-btn"
                style={{ backgroundColor: 'var(--sage-100)', color: 'var(--forest-900)', borderColor: 'var(--border-sage)' }}
                onClick={() => {
                  onClose();
                  onOpenAIAssistant(subject.id);
                }}
              >
                <IconSparkles size={16} />
                <span>Ask AI Tutor</span>
              </button>
            )}

            {isPython && onOpenPythonAcademy && (
              <button
                type="button"
                className="add-task-btn"
                style={{ backgroundColor: 'var(--forest-900)' }}
                onClick={() => {
                  onClose();
                  onOpenPythonAcademy();
                }}
              >
                <IconPython size={16} />
                <span>Open in Python Academy</span>
              </button>
            )}

            <button
              type="button"
              className="sem2-action-btn"
              onClick={onClose}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
