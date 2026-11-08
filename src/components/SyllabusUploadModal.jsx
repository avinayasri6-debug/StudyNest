import React, { useState } from 'react';
import {
  IconX,
  IconUpload,
  IconFileText,
  IconCheckCircle,
  IconPlus,
  IconTrash,
  IconSparkles,
  IconAlertTriangle
} from './Icons';
import { extractTextFromPdf, parseSyllabusText } from '../services/syllabusParser';
import { ACADEMIC_SEMESTERS } from '../data/branchesData';

export default function SyllabusUploadModal({
  isOpen,
  onClose,
  activeSemester = 1,
  activeBranch = 'Computer Science and Engineering',
  onSaveCurriculum,
  onShowToast
}) {
  const [inputMode, setInputMode] = useState('file'); // 'file' | 'paste'
  const [selectedFile, setSelectedFile] = useState(null);
  const [pastedText, setPastedText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState('');
  const [step, setStep] = useState('upload'); // 'upload' | 'preview'

  // Extracted and editable syllabus state
  const [extractedMetadata, setExtractedMetadata] = useState({});
  const [extractedSubjects, setExtractedSubjects] = useState([]);
  const [expandedSubjectIndex, setExpandedSubjectIndex] = useState(0);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setExtractError('');
    if (!file) return;

    if (!file.name.endsWith('.pdf') && !file.name.endsWith('.txt') && !file.name.endsWith('.md')) {
      setExtractError('Please upload a PDF (.pdf) or text (.txt, .md) syllabus document.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setExtractError('File size exceeds 15MB limit. Please upload a smaller document.');
      return;
    }

    setSelectedFile(file);
  };

  const handleExtract = async () => {
    setExtractError('');
    setIsExtracting(true);

    try {
      let rawText = '';

      if (inputMode === 'file') {
        if (!selectedFile) {
          setExtractError('Please select a syllabus file to upload.');
          setIsExtracting(false);
          return;
        }

        if (selectedFile.name.endsWith('.pdf')) {
          const res = await extractTextFromPdf(selectedFile);
          if (!res.success) {
            setExtractError(res.error || 'Failed to extract text from PDF. You can switch to "Paste Text" to paste syllabus contents directly.');
            setIsExtracting(false);
            return;
          }
          rawText = res.text;
        } else {
          rawText = await selectedFile.text();
        }
      } else {
        rawText = pastedText.trim();
        if (!rawText) {
          setExtractError('Please paste your syllabus text into the box.');
          setIsExtracting(false);
          return;
        }
      }

      const sourceName = inputMode === 'file' ? selectedFile?.name : 'Pasted Syllabus Text';
      const parsed = parseSyllabusText(rawText, activeSemester, sourceName);

      if (!parsed.subjects || parsed.subjects.length === 0) {
        setExtractError('No subjects or course modules could be recognized in the document. Please check the format or paste course text directly.');
        setIsExtracting(false);
        return;
      }

      setExtractedMetadata(parsed.metadata);
      setExtractedSubjects(parsed.subjects);
      setStep('preview');
      onShowToast?.(`Extracted ${parsed.subjects.length} courses! Review and correct below.`);
    } catch (err) {
      setExtractError(`Extraction error: ${err.message || 'Unable to process syllabus'}`);
    } finally {
      setIsExtracting(false);
    }
  };

  // Editing handlers for extracted subjects
  const handleUpdateSubjectField = (index, field, value) => {
    setExtractedSubjects((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleDeleteSubject = (index) => {
    setExtractedSubjects((prev) => prev.filter((_, idx) => idx !== index));
    if (expandedSubjectIndex >= index) {
      setExpandedSubjectIndex(Math.max(0, expandedSubjectIndex - 1));
    }
  };

  const handleAddBlankSubject = () => {
    const newSub = {
      id: `imported-sub-${Date.now()}-${extractedSubjects.length + 1}`,
      code: `COURSE ${100 + extractedSubjects.length + 1}`,
      title: 'New Course Title',
      shortName: 'New Course',
      credits: 4,
      semester: activeSemester,
      category: 'Core Engineering',
      verified: false,
      source: 'imported',
      description: 'Manually added course to syllabus.',
      units: [
        {
          unitNumber: 1,
          unitTitle: 'Unit 1: Fundamentals',
          topics: [{ id: `top-${Date.now()}-1`, name: 'Core Principles & Theory' }]
        }
      ],
      learningObjectives: [],
      recommendedResources: []
    };
    setExtractedSubjects((prev) => [...prev, newSub]);
    setExpandedSubjectIndex(extractedSubjects.length);
  };

  // Unit and topic edit handlers
  const handleUpdateUnitTitle = (subIdx, unitIdx, newTitle) => {
    setExtractedSubjects((prev) => {
      const copy = [...prev];
      const units = [...copy[subIdx].units];
      units[unitIdx] = { ...units[unitIdx], unitTitle: newTitle };
      copy[subIdx] = { ...copy[subIdx], units };
      return copy;
    });
  };

  const handleAddUnit = (subIdx) => {
    setExtractedSubjects((prev) => {
      const copy = [...prev];
      const units = [...copy[subIdx].units];
      const nextNum = units.length + 1;
      units.push({
        unitNumber: nextNum,
        unitTitle: `Unit ${nextNum}: Core Concepts`,
        topics: [{ id: `top-${Date.now()}-${nextNum}-1`, name: 'Module Introduction' }]
      });
      copy[subIdx] = { ...copy[subIdx], units };
      return copy;
    });
  };

  const handleDeleteUnit = (subIdx, unitIdx) => {
    setExtractedSubjects((prev) => {
      const copy = [...prev];
      const units = copy[subIdx].units.filter((_, uIdx) => uIdx !== unitIdx);
      copy[subIdx] = { ...copy[subIdx], units };
      return copy;
    });
  };

  const handleUpdateTopic = (subIdx, unitIdx, topicIdx, newName) => {
    setExtractedSubjects((prev) => {
      const copy = [...prev];
      const units = [...copy[subIdx].units];
      const topics = [...units[unitIdx].topics];
      topics[topicIdx] = { ...topics[topicIdx], name: newName };
      units[unitIdx] = { ...units[unitIdx], topics };
      copy[subIdx] = { ...copy[subIdx], units };
      return copy;
    });
  };

  const handleAddTopic = (subIdx, unitIdx) => {
    setExtractedSubjects((prev) => {
      const copy = [...prev];
      const units = [...copy[subIdx].units];
      const topics = [...units[unitIdx].topics];
      topics.push({
        id: `top-${Date.now()}-${topics.length + 1}`,
        name: 'New Syllabus Topic'
      });
      units[unitIdx] = { ...units[unitIdx], topics };
      copy[subIdx] = { ...copy[subIdx], units };
      return copy;
    });
  };

  const handleDeleteTopic = (subIdx, unitIdx, topicIdx) => {
    setExtractedSubjects((prev) => {
      const copy = [...prev];
      const units = [...copy[subIdx].units];
      const topics = units[unitIdx].topics.filter((_, tIdx) => tIdx !== topicIdx);
      units[unitIdx] = { ...units[unitIdx], topics };
      copy[subIdx] = { ...copy[subIdx], units };
      return copy;
    });
  };

  const handleConfirmAndSave = () => {
    if (extractedSubjects.length === 0) {
      alert('No subjects to save. Please add at least one course.');
      return;
    }

    onSaveCurriculum?.({
      metadata: extractedMetadata,
      subjects: extractedSubjects
    });

    onShowToast?.(`Saved ${extractedSubjects.length} courses to your curriculum!`);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: step === 'preview' ? '820px' : '580px', maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--forest-700)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
              <IconUpload size={14} />
              <span>University Syllabus Ingestion · {activeBranch}</span>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--forest-950)', margin: '2px 0 0' }}>
              {step === 'upload' ? 'Upload University Syllabus (PDF)' : 'Preview & Verify Extracted Curriculum'}
            </h2>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <IconX size={18} />
          </button>
        </div>

        {/* STEP 1: UPLOAD / INPUT SCREEN */}
        {step === 'upload' && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Notice */}
              <div style={{
                padding: '12px 16px',
                backgroundColor: 'rgba(104, 143, 120, 0.12)',
                borderRadius: '8px',
                border: '1px solid var(--border-sage)',
                fontSize: '12.5px',
                color: 'var(--forest-900)',
                lineHeight: 1.5
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginBottom: '2px' }}>
                  <IconSparkles size={15} />
                  <span>Syllabus Ingestion Engine</span>
                </div>
                <span>
                  Upload your university or autonomous college syllabus document in PDF or text format. Sagevanta will extract course names, course codes, credits, units, and topics. You can review, correct, and edit every detail before saving.
                </span>
              </div>

              {/* Input Mode Tabs */}
              <div className="modal-tabs" style={{ margin: 0 }}>
                <button
                  type="button"
                  className={`modal-tab-btn ${inputMode === 'file' ? 'active' : ''}`}
                  onClick={() => setInputMode('file')}
                >
                  <IconUpload size={14} />
                  <span>Upload PDF File</span>
                </button>
                <button
                  type="button"
                  className={`modal-tab-btn ${inputMode === 'paste' ? 'active' : ''}`}
                  onClick={() => setInputMode('paste')}
                >
                  <IconFileText size={14} />
                  <span>Paste Syllabus Text</span>
                </button>
              </div>

              {/* File Upload Mode */}
              {inputMode === 'file' && (
                <div
                  style={{
                    border: '2px dashed var(--border-card)',
                    borderRadius: '8px',
                    padding: '32px 20px',
                    textAlign: 'center',
                    backgroundColor: 'var(--bg-card-warm)',
                    cursor: 'pointer'
                  }}
                  onClick={() => document.getElementById('syllabus-file-input')?.click()}
                >
                  <input
                    id="syllabus-file-input"
                    type="file"
                    accept=".pdf,.txt,.md"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <IconUpload size={32} style={{ color: 'var(--forest-700)', margin: '0 auto 8px' }} />
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--forest-950)' }}>
                    {selectedFile ? selectedFile.name : 'Click to select or drag your university syllabus PDF'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB · Ready to extract` : 'Supports standard Indian university PDFs (Anna Univ, VTU, JNTU, AKTU, Autonomous colleges)'}
                  </div>
                </div>
              )}

              {/* Paste Text Mode */}
              {inputMode === 'paste' && (
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Paste Syllabus Content or Course Table
                  </label>
                  <textarea
                    rows={8}
                    className="add-task-input"
                    style={{ fontFamily: 'monospace', fontSize: '12.5px', resize: 'vertical' }}
                    placeholder="Paste course descriptions, units, and topics here... e.g.&#10;Course Code: 23CS101&#10;Subject: Data Structures and Algorithms&#10;Credits: 4&#10;Unit 1: Stacks and Queues&#10;- Stack ADT, Array implementation&#10;- Infix to postfix conversion"
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                  />
                </div>
              )}

              {/* Error Alert */}
              {extractError && (
                <div style={{
                  padding: '10px 14px',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  borderRadius: '6px',
                  color: '#991B1B',
                  fontSize: '12.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <IconAlertTriangle size={16} />
                  <span>{extractError}</span>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="sem2-action-btn" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="add-task-btn"
                disabled={isExtracting}
                onClick={handleExtract}
              >
                <IconSparkles size={15} />
                <span>{isExtracting ? 'Extracting Syllabus...' : 'Extract & Preview'}</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PREVIEW & CORRECTION SCREEN */}
        {step === 'preview' && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Review Alert Notice */}
              <div style={{
                padding: '12px 16px',
                backgroundColor: 'rgba(230, 215, 175, 0.25)',
                borderRadius: '8px',
                border: '1px solid rgba(200, 175, 120, 0.4)',
                fontSize: '12.5px',
                color: '#715526',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}>
                <IconAlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Review & Verification Required: </strong>
                  Extracted {extractedSubjects.length} courses from your document. Never silently invent missing courses. You can freely edit course codes, titles, semesters, units, and topics below before committing them to your curriculum.
                </div>
              </div>

              {/* Detected Metadata Summary */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '8px',
                backgroundColor: 'var(--bg-card-warm)',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                fontSize: '12px'
              }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>University / Board:</span>
                  <strong>{extractedMetadata.university || 'University Curriculum'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Degree & Branch:</span>
                  <strong>{extractedMetadata.degree || 'B.Tech'} · {extractedMetadata.branch || activeBranch}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Regulation Scheme:</span>
                  <strong>{extractedMetadata.regulation || 'CBCS Regulation'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Total Courses Extracted:</span>
                  <strong>{extractedSubjects.length} Courses</strong>
                </div>
              </div>

              {/* Extracted Subjects Accordion */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {extractedSubjects.map((subject, subIdx) => {
                  const isExpanded = expandedSubjectIndex === subIdx;
                  return (
                    <div
                      key={subject.id || subIdx}
                      style={{
                        border: '1px solid var(--border-card)',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        backgroundColor: '#FFFFFF'
                      }}
                    >
                      {/* Course Header Row */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          backgroundColor: isExpanded ? 'rgba(104, 143, 120, 0.08)' : 'var(--bg-card-warm)',
                          cursor: 'pointer'
                        }}
                        onClick={() => setExpandedSubjectIndex(isExpanded ? -1 : subIdx)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 800,
                              backgroundColor: 'var(--forest-850)',
                              color: '#FFFFFF',
                              padding: '2px 8px',
                              borderRadius: '4px'
                            }}
                          >
                            {subject.code || `COURSE ${subIdx + 1}`}
                          </span>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--forest-950)' }}>
                            {subject.title}
                          </span>
                          <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                            • Sem {subject.semester} • {subject.credits} Credits • {subject.units?.length || 0} Units
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className="task-delete-btn"
                            style={{ opacity: 1, padding: '4px 8px' }}
                            onClick={() => handleDeleteSubject(subIdx)}
                            title="Exclude this course"
                          >
                            <IconTrash size={14} />
                            <span style={{ fontSize: '11.5px', marginLeft: '4px' }}>Exclude</span>
                          </button>
                        </div>
                      </div>

                      {/* Course Expanded Details Editor */}
                      {isExpanded && (
                        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr', gap: '10px' }}>
                            <div>
                              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>
                                Course Code
                              </label>
                              <input
                                type="text"
                                className="add-task-input"
                                value={subject.code}
                                onChange={(e) => handleUpdateSubjectField(subIdx, 'code', e.target.value.toUpperCase())}
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>
                                Course Title
                              </label>
                              <input
                                type="text"
                                className="add-task-input"
                                value={subject.title}
                                onChange={(e) => handleUpdateSubjectField(subIdx, 'title', e.target.value)}
                              />
                            </div>
                            <div>
                              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>
                                Semester
                              </label>
                              <select
                                className="add-task-input"
                                value={subject.semester}
                                onChange={(e) => handleUpdateSubjectField(subIdx, 'semester', Number(e.target.value))}
                              >
                                {ACADEMIC_SEMESTERS.map((s) => (
                                  <option key={s.id} value={s.id}>
                                    Semester {s.id}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>
                                Credits
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="10"
                                className="add-task-input"
                                value={subject.credits}
                                onChange={(e) => handleUpdateSubjectField(subIdx, 'credits', Number(e.target.value))}
                              />
                            </div>
                          </div>

                          {/* Units & Topics List */}
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <h4 style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--forest-950)', margin: 0 }}>
                                Extracted Syllabus Units & Topics:
                              </h4>
                              <button
                                type="button"
                                className="sem2-action-btn"
                                style={{ padding: '3px 8px', fontSize: '11px' }}
                                onClick={() => handleAddUnit(subIdx)}
                              >
                                <IconPlus size={12} />
                                <span>Add Unit</span>
                              </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {subject.units?.map((unit, unitIdx) => (
                                <div
                                  key={unitIdx}
                                  style={{
                                    padding: '10px 12px',
                                    backgroundColor: 'var(--bg-card-warm)',
                                    borderRadius: '6px',
                                    border: '1px solid var(--border-subtle)'
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--forest-900)' }}>
                                      Unit {unit.unitNumber}:
                                    </span>
                                    <input
                                      type="text"
                                      className="add-task-input"
                                      style={{ padding: '4px 8px', fontSize: '12.5px' }}
                                      value={unit.unitTitle}
                                      onChange={(e) => handleUpdateUnitTitle(subIdx, unitIdx, e.target.value)}
                                    />
                                    <button
                                      type="button"
                                      className="task-delete-btn"
                                      style={{ opacity: 1, padding: '4px' }}
                                      onClick={() => handleDeleteUnit(subIdx, unitIdx)}
                                      title="Delete unit"
                                    >
                                      <IconTrash size={13} />
                                    </button>
                                  </div>

                                  {/* Topics list */}
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '16px' }}>
                                    {unit.topics?.map((topic, tIdx) => (
                                      <div key={tIdx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>•</span>
                                        <input
                                          type="text"
                                          className="add-task-input"
                                          style={{ padding: '3px 8px', fontSize: '12px' }}
                                          value={topic.name}
                                          onChange={(e) => handleUpdateTopic(subIdx, unitIdx, tIdx, e.target.value)}
                                        />
                                        <button
                                          type="button"
                                          className="task-delete-btn"
                                          style={{ opacity: 0.8, padding: '2px 4px' }}
                                          onClick={() => handleDeleteTopic(subIdx, unitIdx, tIdx)}
                                          title="Delete topic"
                                        >
                                          <IconX size={12} />
                                        </button>
                                      </div>
                                    ))}

                                    <button
                                      type="button"
                                      onClick={() => handleAddTopic(subIdx, unitIdx)}
                                      style={{
                                        alignSelf: 'flex-start',
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--forest-800)',
                                        fontSize: '11.5px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        marginTop: '4px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                      }}
                                    >
                                      <IconPlus size={12} />
                                      <span>Add Topic</span>
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                <button
                  type="button"
                  className="sem2-action-btn"
                  style={{ alignSelf: 'center', padding: '8px 16px', marginTop: '6px' }}
                  onClick={handleAddBlankSubject}
                >
                  <IconPlus size={14} />
                  <span>Add Another Course Manually</span>
                </button>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="sem2-action-btn" onClick={() => setStep('upload')}>
                Back to Upload
              </button>
              <button
                type="button"
                className="add-task-btn"
                onClick={handleConfirmAndSave}
              >
                <IconCheckCircle size={15} />
                <span>Confirm & Save All Courses to Curriculum</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
