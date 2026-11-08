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
  IconTrash,
  IconUpload,
  IconUser
} from './Icons';
import { getAllSubjectTopics, getCurriculumSourceInfo, SAMPLE_SYLLABUS_DISCLAIMER } from '../data/curriculumData';

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
  onShowToast,
  onUpdateSubject
}) {
  const [activeTab, setActiveTab] = useState('topics'); // 'topics' | 'assignments' | 'questions' | 'notes' | 'overview'
  const [revealedQuestions, setRevealedQuestions] = useState({});
  const [newTopicName, setNewTopicName] = useState('');
  const [selectedUnitNum, setSelectedUnitNum] = useState(1);
  const [newUnitTitle, setNewUnitTitle] = useState('');
  const [showAddUnitForm, setShowAddUnitForm] = useState(false);

  // Edit Course Info state
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editTitle, setEditTitle] = useState(subject?.title || '');
  const [editCode, setEditCode] = useState(subject?.code || '');
  const [editCredits, setEditCredits] = useState(subject?.credits || 4);
  const [editCategory, setEditCategory] = useState(subject?.category || 'Core Engineering');

  // New assignment form state
  const [newAsgTitle, setNewAsgTitle] = useState('');
  const [newAsgDate, setNewAsgDate] = useState('');

  // Quick note form state
  const [quickNoteTitle, setQuickNoteTitle] = useState('');
  const [quickNoteBody, setQuickNoteBody] = useState('');

  if (!subject) return null;

  const allTopics = getAllSubjectTopics(subject);
  const totalTopics = allTopics.length;
  const completedCount = allTopics.filter((t) => completedTopicIds.includes(t.id)).length;
  const progressPercent = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;
  const isPython = subject.id === 'cse101';
  const sourceInfo = getCurriculumSourceInfo(subject);

  // Toggle question answers
  const toggleQuestionReveal = (qId) => {
    setRevealedQuestions((prev) => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  // Add custom topic into chosen unit
  const handleAddTopic = (e) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;

    const unitNum = Number.parseInt(selectedUnitNum, 10) || 1;
    const currentUnits = [...(subject.units || [])];
    const targetUnitIndex = currentUnits.findIndex((u) => u.unitNumber === unitNum);

    const newTopic = {
      id: `topic-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: newTopicName.trim(),
      isCustom: true
    };

    if (targetUnitIndex >= 0) {
      currentUnits[targetUnitIndex] = {
        ...currentUnits[targetUnitIndex],
        topics: [...(currentUnits[targetUnitIndex].topics || []), newTopic]
      };
    } else {
      currentUnits.push({
        unitNumber: unitNum,
        unitTitle: `Unit ${unitNum}: Custom Syllabus Topics`,
        topics: [newTopic]
      });
    }

    onUpdateSubject?.(subject.id, { units: currentUnits });
    setNewTopicName('');
    onShowToast?.(`Added "${newTopic.name}" to Unit ${unitNum}`);
  };

  // Delete a topic
  const handleDeleteTopic = (e, topicId) => {
    e.stopPropagation();
    const currentUnits = (subject.units || []).map((u) => ({
      ...u,
      topics: u.topics.filter((t) => t.id !== topicId)
    }));
    onUpdateSubject?.(subject.id, { units: currentUnits });
    onShowToast?.('Topic removed from course curriculum');
  };

  // Add a new unit to the course
  const handleAddNewUnit = (e) => {
    e.preventDefault();
    if (!newUnitTitle.trim()) return;

    const currentUnits = [...(subject.units || [])];
    const nextNum = currentUnits.length > 0 ? Math.max(...currentUnits.map((u) => u.unitNumber)) + 1 : 1;

    const newUnit = {
      unitNumber: nextNum,
      unitTitle: newUnitTitle.trim(),
      topics: [
        {
          id: `topic-${Date.now()}-init`,
          name: `${newUnitTitle.trim()} Overview & Core Axioms`,
          isCustom: true
        }
      ]
    };

    const updated = [...currentUnits, newUnit];
    onUpdateSubject?.(subject.id, { units: updated });
    setNewUnitTitle('');
    setShowAddUnitForm(false);
    onShowToast?.(`Added Unit ${nextNum}: "${newUnit.unitTitle}"`);
  };

  // Save updated course metadata
  const handleSaveCourseInfo = (e) => {
    e.preventDefault();
    onUpdateSubject?.(subject.id, {
      title: editTitle.trim() || subject.title,
      code: editCode.trim().toUpperCase() || subject.code,
      credits: Number.parseInt(editCredits, 10) || subject.credits,
      category: editCategory
    });
    setIsEditingInfo(false);
    onShowToast?.('Course details updated successfully!');
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
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '820px' }}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
              <span className="subject-code-badge">{subject.code}</span>
              <span className="info-pill">{subject.credits} Credits</span>
              <span className="info-pill">{subject.category}</span>
              <span
                className="term-pill-badge"
                style={{
                  backgroundColor: sourceInfo.bg,
                  color: sourceInfo.color,
                  border: `1px solid ${sourceInfo.border}`
                }}
                title={sourceInfo.description}
              >
                {sourceInfo.type === 'verified' && <IconCheckCircle size={12} />}
                {sourceInfo.type === 'sample_template' && <IconSparkles size={12} />}
                {sourceInfo.type === 'imported' && <IconUpload size={12} />}
                {sourceInfo.type === 'custom' && <IconUser size={12} />}
                {sourceInfo.label}
              </span>
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
              Overview & Settings
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
          {/* TAB 1: UNITS & TOPICS */}
          {activeTab === 'topics' && (
            <div>
              {/* Contextual Source & Guidance Notice */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                backgroundColor: sourceInfo.bg,
                borderRadius: '8px',
                border: `1px solid ${sourceInfo.border}`,
                marginBottom: '18px',
                fontSize: '12.5px',
                color: sourceInfo.color
              }}>
                {sourceInfo.type === 'verified' && <IconCheckCircle size={16} style={{ flexShrink: 0 }} />}
                {sourceInfo.type === 'sample_template' && <IconSparkles size={16} style={{ flexShrink: 0 }} />}
                {sourceInfo.type === 'imported' && <IconUpload size={16} style={{ flexShrink: 0 }} />}
                {sourceInfo.type === 'custom' && <IconUser size={16} style={{ flexShrink: 0 }} />}
                <span>
                  {sourceInfo.type === 'verified' && (
                    <><strong>Officially Verified Curriculum: </strong>Checked against authoritative university syllabus ({sourceInfo.evidence}).</>
                  )}
                  {sourceInfo.type === 'sample_template' && (
                    <>{SAMPLE_SYLLABUS_DISCLAIMER}</>
                  )}
                  {sourceInfo.type === 'imported' && (
                    <><strong>Imported Syllabus Content: </strong>Extracted from syllabus document{sourceInfo.importedFrom ? ` (${sourceInfo.importedFrom})` : ''}. Review and edit units to match your curriculum.</>
                  )}
                  {sourceInfo.type === 'custom' && (
                    <><strong>Student Custom Course: </strong>Configured directly by you. Track topics and progress according to your syllabus.</>
                  )}
                </span>
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
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      backgroundColor: 'rgba(23, 40, 30, 0.04)',
                      fontWeight: 700,
                      fontSize: '13px',
                      color: 'var(--forest-950)',
                      borderBottom: '1px solid var(--border-subtle)'
                    }}>
                      <span>Unit {unit.unitNumber}: {unit.unitTitle}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {unit.topics?.length || 0} topics
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {unit.topics?.map((t) => {
                        const isDone = completedTopicIds.includes(t.id);
                        return (
                          <div
                            key={t.id}
                            onClick={() => onToggleTopic(t.id, t.name)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '12px',
                              padding: '10px 14px',
                              borderBottom: '1px solid rgba(23, 40, 30, 0.04)',
                              cursor: 'pointer',
                              backgroundColor: isDone ? 'rgba(235, 245, 238, 0.5)' : '#FFFFFF',
                              transition: 'background-color 0.15s ease'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
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

                            {/* Optional delete button for student custom topics */}
                            {t.isCustom && (
                              <button
                                type="button"
                                onClick={(e) => handleDeleteTopic(e, t.id)}
                                title="Delete custom topic"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--text-muted)',
                                  cursor: 'pointer',
                                  padding: '4px'
                                }}
                              >
                                <IconTrash size={14} />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Topic into Unit Form */}
              <div style={{ marginTop: '20px', padding: '16px', backgroundColor: 'var(--bg-card-warm)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--forest-950)', display: 'block', marginBottom: '8px' }}>
                  Add Topic to Unit
                </span>
                <form onSubmit={handleAddTopic} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <select
                    className="add-task-input"
                    style={{ width: 'auto', minWidth: '130px' }}
                    value={selectedUnitNum}
                    onChange={(e) => setSelectedUnitNum(Number.parseInt(e.target.value, 10))}
                  >
                    {(subject.units || []).map((u) => (
                      <option key={u.unitNumber} value={u.unitNumber}>
                        Unit {u.unitNumber}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    style={{ flex: 1, minWidth: '200px' }}
                    className="add-task-input"
                    placeholder="Enter topic name (e.g. Asymptotic Complexity & Master Theorem)..."
                    value={newTopicName}
                    onChange={(e) => setNewTopicName(e.target.value)}
                  />

                  <button type="submit" className="add-task-btn">
                    <IconPlus size={15} />
                    <span>Add Topic</span>
                  </button>
                </form>

                {/* Add New Unit Toggle */}
                <div style={{ marginTop: '12px' }}>
                  {!showAddUnitForm ? (
                    <button
                      type="button"
                      onClick={() => setShowAddUnitForm(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--forest-800)',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      + Add a New Unit to this Course
                    </button>
                  ) : (
                    <form onSubmit={handleAddNewUnit} style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <input
                        type="text"
                        className="add-task-input"
                        placeholder="Enter new Unit Title (e.g. Distributed Consensus & Raft)..."
                        value={newUnitTitle}
                        onChange={(e) => setNewUnitTitle(e.target.value)}
                      />
                      <button type="submit" className="add-task-btn">
                        <span>Save Unit</span>
                      </button>
                      <button
                        type="button"
                        className="sem2-action-btn"
                        onClick={() => setShowAddUnitForm(false)}
                      >
                        Cancel
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ASSIGNMENT TRACKER */}
          {activeTab === 'assignments' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--forest-950)' }}>
                  Course Assignment Tracker
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
                          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                            <IconClock size={12} />
                            <span>Due: {asg.dueDate}</span>
                            <span>•</span>
                            <span style={{ color: isSubmitted ? 'var(--forest-800)' : '#B45309', fontWeight: 600 }}>
                              {asg.status}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteAssignment(asg.id)}
                        className="modal-close-btn"
                        style={{ width: '28px', height: '28px', padding: 0 }}
                        aria-label="Delete assignment"
                      >
                        <IconTrash size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Add Assignment Form */}
              <form onSubmit={handleAddAssignment} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  required
                  className="add-task-input"
                  style={{ flex: 2, minWidth: '200px' }}
                  placeholder="New assignment or problem set title..."
                  value={newAsgTitle}
                  onChange={(e) => setNewAsgTitle(e.target.value)}
                />
                <input
                  type="date"
                  className="add-task-input"
                  style={{ flex: 1, minWidth: '140px' }}
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
            <div>
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--forest-950)', margin: '0 0 4px' }}>
                  High-Yield Examination Questions
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0 }}>
                  Curated representative questions frequently tested in university semester examinations.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(subject.importantQuestions || []).map((q, idx) => {
                  const isRevealed = revealedQuestions[q.id];
                  return (
                    <div
                      key={q.id}
                      style={{
                        padding: '14px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-card-warm)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                        <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--forest-950)' }}>
                          Q{idx + 1}. {q.question}
                        </div>
                        <button
                          type="button"
                          className="modal-tab-btn"
                          style={{ fontSize: '11.5px', padding: '4px 10px', height: 'auto', flexShrink: 0 }}
                          onClick={() => toggleQuestionReveal(q.id)}
                        >
                          {isRevealed ? 'Hide Solution' : 'Show Solution'}
                        </button>
                      </div>

                      {isRevealed && (
                        <div style={{
                          marginTop: '10px',
                          padding: '12px',
                          borderRadius: '6px',
                          backgroundColor: '#FFFFFF',
                          border: '1px solid var(--border-sage)',
                          fontSize: '13px',
                          color: 'var(--forest-950)',
                          lineHeight: 1.6
                        }}>
                          <strong>Solution / Framework: </strong>
                          {q.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: PERSONAL NOTES */}
          {activeTab === 'notes' && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--forest-950)', margin: '0 0 4px' }}>
                  Course Study Notes ({subjectNotes.length})
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0 }}>
                  Quick study notes, formulas, and revision thoughts saved for this course.
                </p>
              </div>

              {subjectNotes.length > 0 ? (
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
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--forest-950)' }}>{n.title}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{n.updatedAt}</span>
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--forest-900)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                        {n.content}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  No personal notes added yet for {subject.shortName}.
                </div>
              )}

              {/* Add Note Form */}
              <form onSubmit={handleAddQuickNote} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input
                  type="text"
                  required
                  className="add-task-input"
                  placeholder="Note Title (e.g. Eigenvalue shortcuts)..."
                  value={quickNoteTitle}
                  onChange={(e) => setQuickNoteTitle(e.target.value)}
                />
                <textarea
                  rows={3}
                  className="add-task-input"
                  style={{ resize: 'vertical' }}
                  placeholder="Write your study notes, derivations, or important formulas here..."
                  value={quickNoteBody}
                  onChange={(e) => setQuickNoteBody(e.target.value)}
                />
                <button type="submit" className="add-task-btn" style={{ alignSelf: 'flex-start' }}>
                  <IconNotes size={15} />
                  <span>Save Note to Subject</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: OVERVIEW & SETTINGS */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {!isEditingInfo ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--forest-950)', margin: 0 }}>
                      Course Metadata & Scope
                    </h3>
                    <button
                      type="button"
                      className="sem2-action-btn"
                      onClick={() => {
                        setEditTitle(subject.title);
                        setEditCode(subject.code);
                        setEditCredits(subject.credits);
                        setEditCategory(subject.category);
                        setIsEditingInfo(true);
                      }}
                    >
                      Edit Course Details
                    </button>
                  </div>

                  <p style={{ fontSize: '13.5px', color: 'var(--forest-900)', lineHeight: 1.6, margin: 0 }}>
                    {subject.description || 'Comprehensive university engineering curriculum course.'}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                    <div style={{ padding: '12px', backgroundColor: 'var(--bg-card-warm)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Department</div>
                      <div style={{ fontWeight: 600, color: 'var(--forest-950)' }}>{subject.department || 'Engineering Faculty'}</div>
                    </div>
                    <div style={{ padding: '12px', backgroundColor: 'var(--bg-card-warm)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Credits</div>
                      <div style={{ fontWeight: 600, color: 'var(--forest-950)' }}>{subject.credits} Credits</div>
                    </div>
                    <div style={{ padding: '12px', backgroundColor: 'var(--bg-card-warm)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Category</div>
                      <div style={{ fontWeight: 600, color: 'var(--forest-950)' }}>{subject.category}</div>
                    </div>
                  </div>

                  {/* Verification & Trust Status */}
                  <div style={{
                    padding: '14px 16px',
                    backgroundColor: 'var(--bg-card-warm)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Curriculum Verification & Trust Status
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          color: sourceInfo.color,
                          backgroundColor: sourceInfo.bg,
                          border: `1px solid ${sourceInfo.border}`,
                          padding: '3px 10px',
                          borderRadius: 'var(--radius-full)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        {sourceInfo.type === 'verified' && <IconCheckCircle size={13} />}
                        {sourceInfo.type === 'sample_template' && <IconSparkles size={13} />}
                        {sourceInfo.type === 'imported' && <IconUpload size={13} />}
                        {sourceInfo.type === 'custom' && <IconUser size={13} />}
                        {sourceInfo.label}
                      </span>
                      <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                        {sourceInfo.type === 'verified'
                          ? `Officially verified against ${sourceInfo.evidence}`
                          : sourceInfo.type === 'sample_template'
                          ? `${subject.templateName || 'Sample Curriculum Template'} · Not an official verification guarantee`
                          : sourceInfo.type === 'imported'
                          ? `Extracted from uploaded syllabus document${sourceInfo.importedFrom ? ` (${sourceInfo.importedFrom})` : ''} · Unverified by institution`
                          : `Student Workspace Custom Subject`}
                      </span>
                    </div>
                  </div>

                  {/* Course Learning Objectives */}
                  <div style={{ padding: '14px 16px', backgroundColor: 'var(--bg-card-warm)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--forest-950)', marginBottom: '8px' }}>
                      🎯 Course Learning Objectives:
                    </div>
                    {subject.learningObjectives && subject.learningObjectives.length > 0 ? (
                      <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: 'var(--text-body)', lineHeight: 1.6 }}>
                        {subject.learningObjectives.map((obj, i) => (
                          <li key={i}>{obj}</li>
                        ))}
                      </ul>
                    ) : (
                      <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        1. Formulate mathematical, computational, and physical governing models for {subject.title}.<br />
                        2. Apply core analytical techniques and solve practical engineering problems.<br />
                        3. Demonstrate comprehensive theoretical and laboratory competence meeting academic regulation standards.
                      </div>
                    )}
                  </div>

                  {/* Recommended Resources & Textbooks */}
                  <div style={{ padding: '14px 16px', backgroundColor: 'var(--bg-card-warm)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--forest-950)', marginBottom: '8px' }}>
                      📚 Recommended Textbooks & Reference Resources:
                    </div>
                    {subject.recommendedResources && subject.recommendedResources.length > 0 ? (
                      <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: 'var(--text-body)', lineHeight: 1.6 }}>
                        {subject.recommendedResources.map((res, i) => (
                          <li key={i}>{res}</li>
                        ))}
                      </ul>
                    ) : (
                      <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        • University Prescribed Core Textbooks & Syllabi Reference Manuals<br />
                        • NPTEL & Open Courseware supplementary materials<br />
                        • Sagevanta Curated Video Hub & Interactive Lab simulations
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <form onSubmit={handleSaveCourseInfo} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--forest-950)', margin: 0 }}>
                    Edit Course Details
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                        Course Code
                      </label>
                      <input
                        type="text"
                        required
                        className="add-task-input"
                        value={editCode}
                        onChange={(e) => setEditCode(e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                        Course Title
                      </label>
                      <input
                        type="text"
                        required
                        className="add-task-input"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                        Credits
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="8"
                        className="add-task-input"
                        value={editCredits}
                        onChange={(e) => setEditCredits(e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                        Category
                      </label>
                      <input
                        type="text"
                        className="add-task-input"
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="submit" className="add-task-btn">
                      <IconCheckCircle size={15} />
                      <span>Save Changes</span>
                    </button>
                    <button
                      type="button"
                      className="sem2-action-btn"
                      onClick={() => setIsEditingInfo(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

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
