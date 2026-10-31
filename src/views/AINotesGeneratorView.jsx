import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { SEMESTER_1_SUBJECTS, getAllSubjectTopics } from '../data/subjectsData';
import {
  IconFileText,
  IconSparkles,
  IconPrinter,
  IconCopy,
  IconCheckCircle,
  IconEye,
  IconEdit3,
  IconTrash,
  IconStar,
  IconZap,
  IconArrowLeft,
  IconArrowRight,
  IconX,
  IconLayers,
  IconHelpCircle,
  IconRefreshCw
} from '../components/Icons';
import MarkdownRenderer from '../components/MarkdownRenderer';
import './AINotesGeneratorView.css';

export default function AINotesGeneratorView({
  notes = [],
  onSaveNotes,
  profile,
  onNavigate,
  onShowToast
}) {
  // ==========================================
  // GENERATOR INPUT STATES
  // ==========================================
  const [selectedSubjectId, setSelectedSubjectId] = useState('math101');
  const [selectedTopicOption, setSelectedTopicOption] = useState(() => {
    const topics = getAllSubjectTopics(SEMESTER_1_SUBJECTS[0]);
    return topics.length > 0 ? topics[0].name : 'custom';
  });
  const [customTopicInput, setCustomTopicInput] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('intermediate'); // 'beginner' | 'intermediate' | 'advanced'
  const [selectedLength, setSelectedLength] = useState('standard'); // 'summary' | 'standard' | 'comprehensive'
  const [selectedFocus, setSelectedFocus] = useState('all'); // 'all' | 'theory' | 'numerical' | 'code'

  // Generation progress state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');

  // Active Generated Note State
  const [activeNote, setActiveNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [copiedNote, setCopiedNote] = useState(false);
  const [isSavedInCollection, setIsSavedInCollection] = useState(false);

  // Smart Revision Tools State
  // tool: null | 'summarize' | 'questions' | 'flashcards' | 'mcqs' | 'formulas' | 'last_minute'
  const [activeRevisionTool, setActiveRevisionTool] = useState(null);
  const [revisionData, setRevisionData] = useState(null);
  const [isRevisionLoading, setIsRevisionLoading] = useState(false);

  // Flashcards Interactive State
  const [flashcardIdx, setFlashcardIdx] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // MCQs Interactive State
  const [userMcqAnswers, setUserMcqAnswers] = useState({});

  // Saved Notes Library Drawer/Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [librarySubjectFilter, setLibrarySubjectFilter] = useState('ALL');

  // Backend AI connection status
  const [aiStatus, setAiStatus] = useState({ configured: false, provider: 'none', model: '' });
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);

  const noteContentRef = useRef(null);

  // Check backend AI status
  const checkAiStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/ai/status');
      if (res.ok) {
        const data = await res.json();
        setAiStatus(data);
      }
    } catch {
      setAiStatus({ configured: false, provider: 'offline', model: 'pedagogy-v1' });
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    fetch('/api/ai/status')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!ignore && data) setAiStatus(data);
      })
      .catch(() => {
        if (!ignore) setAiStatus({ configured: false, provider: 'offline', model: 'pedagogy-v1' });
      });
    return () => {
      ignore = true;
    };
  }, []);

  // Currently selected subject object
  const currentSubject = useMemo(() => {
    return SEMESTER_1_SUBJECTS.find((s) => s.id === selectedSubjectId) || SEMESTER_1_SUBJECTS[0];
  }, [selectedSubjectId]);

  // Syllabus topics for current subject
  const currentSubjectTopics = useMemo(() => {
    return getAllSubjectTopics(currentSubject);
  }, [currentSubject]);

  const handleSubjectChange = (newSubId) => {
    setSelectedSubjectId(newSubId);
    const sub = SEMESTER_1_SUBJECTS.find((s) => s.id === newSubId) || SEMESTER_1_SUBJECTS[0];
    const topics = getAllSubjectTopics(sub);
    if (topics.length > 0) {
      setSelectedTopicOption(topics[0].name);
    } else {
      setSelectedTopicOption('custom');
    }
  };

  // Effective topic name for generation
  const effectiveTopic = selectedTopicOption === 'custom' ? customTopicInput.trim() : selectedTopicOption;

  // Filter notes that were saved with AI tag or from this subject
  const savedAINotes = useMemo(() => {
    return notes.filter((n) => {
      const matchesSearch =
        !searchQuery.trim() ||
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.subjectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.tags && n.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesSubject =
        librarySubjectFilter === 'ALL' || n.subjectCode === librarySubjectFilter;

      return matchesSearch && matchesSubject;
    });
  }, [notes, searchQuery, librarySubjectFilter]);

  // ==========================================
  // NOTE GENERATION HANDLER
  // ==========================================
  const handleGenerateNotes = async () => {
    if (!effectiveTopic) {
      onShowToast?.('Please specify a topic name to generate notes.');
      return;
    }

    setIsGenerating(true);
    setGenerationStep('Analyzing curriculum syllabus...');
    setActiveRevisionTool(null);
    setRevisionData(null);

    const stepTimer1 = setTimeout(() => setGenerationStep('Formulating theoretical framework...'), 700);
    const stepTimer2 = setTimeout(() => setGenerationStep('Deriving mathematical equations and worked examples...'), 1400);

    try {
      const response = await fetch('/api/ai/generate-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: {
            id: currentSubject.id,
            title: currentSubject.title,
            code: currentSubject.code,
            shortName: currentSubject.shortName
          },
          topic: effectiveTopic,
          level: selectedLevel,
          length: selectedLength,
          focus: selectedFocus
        })
      });

      const data = await response.json();

      const newGeneratedNote = {
        id: `ai_note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: data.title || `${effectiveTopic} — Notes`,
        description: data.description || `Structured notes on ${effectiveTopic}`,
        subjectCode: currentSubject.code,
        subjectTitle: currentSubject.title,
        content: data.content,
        level: selectedLevel,
        length: selectedLength,
        focus: selectedFocus,
        isDemo: Boolean(data.isDemo),
        tags: ['AI Generated', currentSubject.shortName, selectedLevel.toUpperCase()],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setActiveNote(newGeneratedNote);
      setEditedContent(data.content);
      setIsEditing(false);
      setIsSavedInCollection(false);
      onShowToast?.(`Generated academic notes for "${effectiveTopic}"!`);
    } catch (err) {
      console.error('Note Generation Error:', err);
      onShowToast?.('Error communicating with AI server. Please check dev server.');
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsGenerating(false);
    }
  };

  // ==========================================
  // SMART REVISION TOOLS DISPATCHER
  // ==========================================
  const handleRunRevisionTool = async (toolId) => {
    if (!activeNote && !effectiveTopic) {
      onShowToast?.('Generate or select a note first to use revision tools.');
      return;
    }

    setActiveRevisionTool(toolId);
    setIsRevisionLoading(true);
    setRevisionData(null);
    setFlashcardIdx(0);
    setIsCardFlipped(false);
    setUserMcqAnswers({});

    try {
      const response = await fetch('/api/ai/revision-tool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: toolId,
          subject: {
            id: currentSubject.id,
            title: currentSubject.title,
            code: currentSubject.code
          },
          topic: activeNote ? activeNote.title : effectiveTopic,
          noteContent: isEditing ? editedContent : activeNote ? activeNote.content : ''
        })
      });

      const result = await response.json();
      setRevisionData(result);
    } catch (err) {
      console.error('Revision tool error:', err);
      onShowToast?.('Failed to process revision tool.');
    } finally {
      setIsRevisionLoading(false);
    }
  };

  // ==========================================
  // SAVE TO SMART NOTES (STORAGE SYNC)
  // ==========================================
  const handleSaveToCollection = () => {
    if (!activeNote) return;

    const noteToSave = {
      ...activeNote,
      content: isEditing ? editedContent : activeNote.content,
      updatedAt: new Date().toISOString()
    };

    // Check if already in notes collection
    const existingIdx = notes.findIndex((n) => n.id === noteToSave.id);
    let updated;
    if (existingIdx >= 0) {
      updated = [...notes];
      updated[existingIdx] = noteToSave;
    } else {
      updated = [noteToSave, ...notes];
    }

    onSaveNotes?.(updated);
    setIsSavedInCollection(true);
    onShowToast?.('Note successfully saved to Smart Notes!');
  };

  // Toggle favorite on note
  const handleToggleFavorite = (noteId, e) => {
    if (e) e.stopPropagation();
    const updated = notes.map((n) => (n.id === noteId ? { ...n, isFavorite: !n.isFavorite } : n));
    onSaveNotes?.(updated);
    onShowToast?.('Updated favorites.');
  };

  // Delete note from collection
  const handleDeleteNote = (noteId, e) => {
    if (e) e.stopPropagation();
    const updated = notes.filter((n) => n.id !== noteId);
    onSaveNotes?.(updated);
    if (activeNote?.id === noteId) {
      setActiveNote(null);
      setIsSavedInCollection(false);
    }
    onShowToast?.('Note removed from library.');
  };

  // Load a saved note into the viewer
  const handleSelectSavedNote = (note) => {
    setActiveNote(note);
    setEditedContent(note.content);
    setIsEditing(false);
    setIsSavedInCollection(true);
    setActiveRevisionTool(null);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // Copy full markdown
  const handleCopyNote = () => {
    const text = isEditing ? editedContent : activeNote?.content;
    if (text && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedNote(true);
      onShowToast?.('Note content copied to clipboard');
      setTimeout(() => setCopiedNote(false), 2500);
    }
  };

  // Bridge to Python Practice Lab
  const handleSendToPythonLab = (code) => {
    try {
      sessionStorage.setItem('studynest_python_incoming_snippet', code);
      onShowToast?.('Snippet loaded into Python Practice Lab!');
      onNavigate?.('python');
    } catch (e) {
      console.error(e);
    }
  };

  // ==========================================
  // DEDICATED PDF EXPORT (PRINT-TO-PDF)
  // ==========================================
  const handleExportPDF = () => {
    if (!activeNote) return;

    const printWin = window.open('', '_blank', 'width=900,height=1000');
    if (!printWin) {
      window.print();
      return;
    }

    const noteBody = isEditing ? editedContent : activeNote.content;
    const studentName = profile?.name || 'Engineering Student';
    const dateFormatted = new Date().toLocaleDateString([], {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    printWin.document.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title>${activeNote.title} - StudyNest Academic Note</title>
          <style>
            @page {
              size: A4;
              margin: 20mm 16mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              color: #14281E;
              line-height: 1.6;
              padding: 0;
              margin: 0;
              background-color: #ffffff;
            }
            .header-banner {
              border-bottom: 2px solid #14281E;
              padding-bottom: 14px;
              margin-bottom: 22px;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }
            .brand-name {
              font-size: 20px;
              font-weight: 800;
              color: #14281E;
              letter-spacing: -0.02em;
            }
            .brand-sub {
              font-size: 11px;
              color: #507761;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              font-weight: 600;
            }
            .meta-right {
              text-align: right;
              font-size: 11px;
              color: #586B60;
            }
            h1 {
              font-size: 22px;
              color: #0E1B13;
              margin: 0 0 8px;
              font-weight: 800;
            }
            .sub-info-pill {
              display: inline-block;
              background: #E4ECE6;
              color: #1F3F2F;
              padding: 3px 8px;
              border-radius: 4px;
              font-size: 11px;
              font-weight: 700;
              margin-bottom: 16px;
            }
            h2, h3 {
              color: #1F3F2F;
              margin-top: 20px;
              margin-bottom: 8px;
              page-break-after: avoid;
            }
            p, li {
              font-size: 13.5px;
              color: #3E4E44;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 16px 0;
              font-size: 12px;
              page-break-inside: avoid;
            }
            th, td {
              border: 1px solid #CFE0D5;
              padding: 8px 10px;
              text-align: left;
            }
            th {
              background-color: #F1F6F2;
              color: #14281E;
              font-weight: 700;
            }
            pre {
              background: #14281E;
              color: #F7FAF8;
              padding: 12px 14px;
              border-radius: 6px;
              font-family: monospace;
              font-size: 12px;
              overflow-x: auto;
              page-break-inside: avoid;
              white-space: pre-wrap;
            }
            blockquote {
              border-left: 3px solid #688F78;
              margin: 12px 0;
              padding: 6px 14px;
              background: #F1F6F2;
              font-style: italic;
              color: #29533F;
            }
            .footer-note {
              margin-top: 32px;
              padding-top: 12px;
              border-top: 1px solid #ECE6DB;
              font-size: 10px;
              color: #829489;
              display: flex;
              justify-content: space-between;
            }
          </style>
        </head>
        <body>
          <div class="header-banner">
            <div>
              <div class="brand-name">StudyNest</div>
              <div class="brand-sub">Engineering Workspace · Academic Notes</div>
            </div>
            <div class="meta-right">
              <div><strong>Student:</strong> ${studentName}</div>
              <div><strong>Session:</strong> First Year · Semester 1</div>
              <div>${dateFormatted}</div>
            </div>
          </div>

          <h1>${activeNote.title}</h1>
          <div class="sub-info-pill">
            ${activeNote.subjectTitle || activeNote.subjectCode} (${activeNote.subjectCode}) &bull; ${activeNote.level ? activeNote.level.toUpperCase() : 'INTERMEDIATE'} &bull; ${activeNote.length ? activeNote.length.toUpperCase() : 'STANDARD'}
          </div>

          <div style="font-family: inherit;">
            <pre style="white-space: pre-wrap; font-family: inherit; background: transparent; color: inherit; padding: 0; border: none;">${noteBody}</pre>
          </div>

          <div class="footer-note">
            <span>StudyNest AI Notes Generator &bull; Empowering Engineering Academic Excellence</span>
            <span>Verified University Study Material</span>
          </div>
        </body>
      </html>
    `);

    printWin.document.close();
    printWin.focus();
    setTimeout(() => {
      printWin.print();
    }, 400);
  };

  return (
    <div className="ai-notes-view">
      {/* 1. Header Banner */}
      <header className="ai-notes-header">
        <div className="ai-notes-title-wrap">
          <div className="ai-notes-badge">
            <IconSparkles size={13} />
            <span>AI Curriculum Engine</span>
          </div>
          <h1 className="ai-notes-title">AI Notes & Revision Generator</h1>
          <div className="ai-notes-subtitle">
            Generate publication-quality, syllabus-aligned engineering notes, formula cheat sheets, and active-recall flashcards
          </div>
        </div>

        <div className="ai-notes-header-actions">
          {aiStatus.configured ? (
            <div className="ai-status-pill live" title={`Connected to ${aiStatus.provider} (${aiStatus.model})`}>
              <span className="ai-status-dot" />
              <span>Live AI ({aiStatus.provider === 'gemini' ? (aiStatus.model ? `Gemini (${aiStatus.model.replace('gemini-', '')})` : 'Gemini') : 'OpenAI'})</span>
            </div>
          ) : (
            <div className="ai-status-pill demo" title="Running with offline engineering curriculum synthesis">
              <span className="ai-status-dot" />
              <span>Demo Mode</span>
              <button
                type="button"
                className="ai-setup-api-btn"
                onClick={() => setIsSetupModalOpen(true)}
              >
                <IconZap size={11} />
                <span>Setup API</span>
              </button>
            </div>
          )}

          <button
            type="button"
            className="ai-tool-btn"
            onClick={() => onNavigate?.('notes')}
            title="Switch to your personal notebook"
          >
            <IconFileText size={14} />
            <span>Open Smart Notes</span>
          </button>
        </div>
      </header>

      {/* 2. Main Grid: Left Generation Form + Right Note Workspace */}
      <div className="ai-notes-grid">
        {/* LEFT COLUMN: Generation Parameter Form */}
        <div className="ai-generator-panel">
          <div className="ai-panel-title">
            <IconSparkles size={16} />
            <span>Note Generation Blueprint</span>
          </div>

          {/* 1. Subject Selection */}
          <div className="ai-form-group">
            <label className="ai-form-label">
              <span>1. Semester 1 Subject:</span>
              <span style={{ fontSize: '11px', color: 'var(--sage-600)' }}>{currentSubject.code}</span>
            </label>
            <select
              className="ai-form-select"
              value={selectedSubjectId}
              onChange={(e) => handleSubjectChange(e.target.value)}
            >
              {SEMESTER_1_SUBJECTS.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.code} — {sub.title}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Topic Selection */}
          <div className="ai-form-group">
            <label className="ai-form-label">
              <span>2. Curriculum Topic:</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {currentSubjectTopics.length} syllabus topics
              </span>
            </label>
            <select
              className="ai-form-select"
              value={selectedTopicOption}
              onChange={(e) => setSelectedTopicOption(e.target.value)}
            >
              {currentSubjectTopics.map((top) => (
                <option key={top.id} value={top.name}>
                  {top.name}
                </option>
              ))}
              <option value="custom">✏️ Enter Custom Topic...</option>
            </select>

            {selectedTopicOption === 'custom' && (
              <input
                type="text"
                className="ai-form-input"
                style={{ marginTop: '6px' }}
                placeholder="Type any engineering topic or theorem..."
                value={customTopicInput}
                onChange={(e) => setCustomTopicInput(e.target.value)}
              />
            )}
          </div>

          {/* 3. Explanation Level */}
          <div className="ai-form-group">
            <label className="ai-form-label">3. Explanation Level:</label>
            <div className="ai-pill-grid">
              <button
                type="button"
                className={`ai-pill-btn ${selectedLevel === 'beginner' ? 'active' : ''}`}
                onClick={() => setSelectedLevel('beginner')}
              >
                <span className="ai-pill-icon">🌱</span>
                <span>Beginner</span>
              </button>
              <button
                type="button"
                className={`ai-pill-btn ${selectedLevel === 'intermediate' ? 'active' : ''}`}
                onClick={() => setSelectedLevel('intermediate')}
              >
                <span className="ai-pill-icon">⚖️</span>
                <span>Intermediate</span>
              </button>
              <button
                type="button"
                className={`ai-pill-btn ${selectedLevel === 'advanced' ? 'active' : ''}`}
                onClick={() => setSelectedLevel('advanced')}
              >
                <span className="ai-pill-icon">🚀</span>
                <span>Advanced</span>
              </button>
            </div>
          </div>

          {/* 4. Desired Note Length */}
          <div className="ai-form-group">
            <label className="ai-form-label">4. Note Depth & Length:</label>
            <div className="ai-pill-grid">
              <button
                type="button"
                className={`ai-pill-btn ${selectedLength === 'summary' ? 'active' : ''}`}
                onClick={() => setSelectedLength('summary')}
              >
                <span className="ai-pill-icon">📄</span>
                <span>Summary</span>
              </button>
              <button
                type="button"
                className={`ai-pill-btn ${selectedLength === 'standard' ? 'active' : ''}`}
                onClick={() => setSelectedLength('standard')}
              >
                <span className="ai-pill-icon">📑</span>
                <span>Standard</span>
              </button>
              <button
                type="button"
                className={`ai-pill-btn ${selectedLength === 'comprehensive' ? 'active' : ''}`}
                onClick={() => setSelectedLength('comprehensive')}
              >
                <span className="ai-pill-icon">📚</span>
                <span>In-Depth</span>
              </button>
            </div>
          </div>

          {/* 5. Focus Area */}
          <div className="ai-form-group">
            <label className="ai-form-label">5. Optional Focus Area:</label>
            <div className="ai-pill-grid grid-2">
              <button
                type="button"
                className={`ai-pill-btn ${selectedFocus === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedFocus('all')}
              >
                <span>🌟 All-Round</span>
              </button>
              <button
                type="button"
                className={`ai-pill-btn ${selectedFocus === 'theory' ? 'active' : ''}`}
                onClick={() => setSelectedFocus('theory')}
              >
                <span>📐 Derivations</span>
              </button>
              <button
                type="button"
                className={`ai-pill-btn ${selectedFocus === 'numerical' ? 'active' : ''}`}
                onClick={() => setSelectedFocus('numerical')}
              >
                <span>🔢 Numerical</span>
              </button>
              <button
                type="button"
                className={`ai-pill-btn ${selectedFocus === 'code' ? 'active' : ''}`}
                onClick={() => setSelectedFocus('code')}
              >
                <span>💻 Code/Lab</span>
              </button>
            </div>
          </div>

          {/* Submit Action */}
          {isGenerating ? (
            <div className="ai-generation-progress">
              <div className="ai-progress-text">
                <IconSparkles size={14} className="spin" />
                <span>{generationStep || 'Synthesizing lecture notes...'}</span>
              </div>
              <div className="ai-progress-bar-bg">
                <div className="ai-progress-bar-fill" />
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="ai-generate-submit-btn"
              onClick={handleGenerateNotes}
              disabled={isGenerating}
            >
              <IconSparkles size={16} />
              <span>Generate AI Notes</span>
            </button>
          )}
        </div>

        {/* RIGHT COLUMN: Active Note Workspace & Tools */}
        <div className="ai-workspace-card">
          {/* Workspace Toolbar */}
          <div className="ai-workspace-header">
            <div className="ai-workspace-note-info">
              {activeNote ? (
                <>
                  <span className="ai-workspace-subject-pill">
                    {activeNote.subjectCode}
                  </span>
                  <span className="ai-workspace-title">
                    {activeNote.title}
                  </span>
                  {activeNote.isDemo && (
                    <span className="ai-bubble-badge demo" title="Synthesized by StudyNest offline curriculum engine">
                      Demo Note
                    </span>
                  )}
                </>
              ) : (
                <span className="ai-workspace-title" style={{ color: 'var(--text-muted)' }}>
                  Select parameters and click "Generate AI Notes"
                </span>
              )}
            </div>

            {activeNote && (
              <div className="ai-workspace-toolbar">
                {/* View / Edit toggle */}
                <button
                  type="button"
                  className="ai-tool-btn"
                  onClick={() => setIsEditing((prev) => !prev)}
                  title={isEditing ? 'Preview formatted note' : 'Edit markdown source'}
                >
                  {isEditing ? <IconEye size={14} /> : <IconEdit3 size={14} />}
                  <span>{isEditing ? 'Preview' : 'Edit'}</span>
                </button>

                {/* Save to Smart Notes */}
                <button
                  type="button"
                  className={`ai-tool-btn ${isSavedInCollection ? 'saved' : 'primary'}`}
                  onClick={handleSaveToCollection}
                  title="Save directly into your Smart Notes notebook"
                >
                  <IconCheckCircle size={14} />
                  <span>{isSavedInCollection ? 'Saved in Notes' : 'Save Note'}</span>
                </button>

                {/* PDF Export */}
                <button
                  type="button"
                  className="ai-tool-btn"
                  onClick={handleExportPDF}
                  title="Export cleanly formatted PDF file with StudyNest branding"
                >
                  <IconPrinter size={14} />
                  <span>Export PDF</span>
                </button>

                {/* Copy Markdown */}
                <button
                  type="button"
                  className="ai-tool-btn"
                  onClick={handleCopyNote}
                  title="Copy full markdown text"
                >
                  <IconCopy size={14} />
                  <span>{copiedNote ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Smart Revision Tools Strip */}
          {activeNote && (
            <div className="ai-smart-revision-strip">
              <span className="ai-revision-label">
                <IconZap size={14} />
                <span>Smart Revision:</span>
              </span>

              <button
                type="button"
                className="ai-revision-chip-btn"
                onClick={() => handleRunRevisionTool('summarize')}
                title="Generate rapid 1-page summary"
              >
                <span>📋 Summarize</span>
              </button>

              <button
                type="button"
                className="ai-revision-chip-btn"
                onClick={() => handleRunRevisionTool('questions')}
                title="Generate high-yield university examination questions"
              >
                <span>❓ Important Questions</span>
              </button>

              <button
                type="button"
                className="ai-revision-chip-btn"
                onClick={() => handleRunRevisionTool('flashcards')}
                title="Interactive active recall flashcards"
              >
                <span>🗂️ Flashcards</span>
              </button>

              <button
                type="button"
                className="ai-revision-chip-btn"
                onClick={() => handleRunRevisionTool('mcqs')}
                title="Practice multiple choice questions with answers"
              >
                <span>🎯 Practice MCQs</span>
              </button>

              <button
                type="button"
                className="ai-revision-chip-btn"
                onClick={() => handleRunRevisionTool('formulas')}
                title="Extract formulas and parameters table"
              >
                <span>📐 Formula Sheet</span>
              </button>

              <button
                type="button"
                className="ai-revision-chip-btn"
                onClick={() => handleRunRevisionTool('last_minute')}
                title="Quick exam cheat sheet and scoring traps"
              >
                <span>⚡ Last-Minute Revision</span>
              </button>
            </div>
          )}

          {/* Note Content Area */}
          <div className="ai-note-content-area" ref={noteContentRef}>
            {!activeNote ? (
              <div className="ai-note-empty-state">
                <div className="ai-note-empty-icon">
                  <IconFileText size={28} />
                </div>
                <h3 className="ai-note-empty-title">Ready to Generate Engineering Notes</h3>
                <p className="ai-note-empty-desc">
                  Choose a subject and topic from the panel on the left, then click <strong>"Generate AI Notes"</strong>.
                  StudyNest will create a publication-quality 7-section academic study guide tailored to your syllabus.
                </p>
              </div>
            ) : isEditing ? (
              <div>
                <div style={{ marginBottom: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  Editing Markdown Source &bull; Supports GitHub Flavored Markdown and LaTeX equations
                </div>
                <textarea
                  className="ai-note-editor-textarea"
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                />
              </div>
            ) : (
              <MarkdownRenderer
                content={activeNote.content}
                onSendToPython={handleSendToPythonLab}
                onShowToast={onShowToast}
              />
            )}
          </div>
        </div>
      </div>

      {/* ==========================================
          SMART REVISION ARTIFACT MODAL / PANEL
          ========================================== */}
      {activeRevisionTool && (
        <div className="ai-modal-backdrop" onClick={() => setActiveRevisionTool(null)}>
          <div
            className="ai-modal-card"
            style={{ maxWidth: '780px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ai-modal-header">
              <div className="ai-modal-title">
                {activeRevisionTool === 'flashcards' && <IconLayers size={18} />}
                {activeRevisionTool === 'mcqs' && <IconHelpCircle size={18} />}
                {activeRevisionTool === 'formulas' && <IconZap size={18} />}
                {activeRevisionTool === 'questions' && <IconFileText size={18} />}
                {activeRevisionTool === 'summarize' && <IconSparkles size={18} />}
                {activeRevisionTool === 'last_minute' && <IconZap size={18} />}
                <span>
                  {activeRevisionTool === 'flashcards' && 'Active Recall Flashcards'}
                  {activeRevisionTool === 'mcqs' && 'Practice Examination MCQs'}
                  {activeRevisionTool === 'formulas' && 'Extracted Formula Reference Sheet'}
                  {activeRevisionTool === 'questions' && 'University Examination Questions & Solutions'}
                  {activeRevisionTool === 'summarize' && '1-Page Executive Summary'}
                  {activeRevisionTool === 'last_minute' && 'Last-Minute Exam Cheat Sheet'}
                </span>
              </div>
              <button
                type="button"
                className="ai-modal-close-btn"
                onClick={() => setActiveRevisionTool(null)}
              >
                <IconX size={18} />
              </button>
            </div>

            <div className="ai-modal-body" style={{ maxHeight: '72vh' }}>
              {isRevisionLoading ? (
                <div style={{ padding: '40px 0', textAlign: 'center' }}>
                  <IconSparkles size={24} className="spin" style={{ color: 'var(--forest-800)' }} />
                  <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--forest-900)', fontWeight: 600 }}>
                    Generating smart revision kit...
                  </p>
                </div>
              ) : revisionData ? (
                <>
                  {/* 1. Flashcards Tool */}
                  {activeRevisionTool === 'flashcards' && revisionData.data && (
                    <div className="ai-flashcard-stage">
                      {revisionData.data.length > 0 && (
                        <>
                          <div
                            className={`ai-flashcard-card ${isCardFlipped ? 'flipped' : ''}`}
                            onClick={() => setIsCardFlipped((prev) => !prev)}
                          >
                            <div className="ai-flashcard-inner">
                              {/* Front */}
                              <div className="ai-flashcard-face ai-flashcard-front">
                                <div className="ai-card-category">
                                  {revisionData.data[flashcardIdx]?.category || 'Concept'} · Card {flashcardIdx + 1} of {revisionData.data.length}
                                </div>
                                <div className="ai-card-content-text">
                                  {revisionData.data[flashcardIdx]?.front}
                                </div>
                                <div className="ai-card-hint">
                                  Click to flip card ↷
                                </div>
                              </div>

                              {/* Back */}
                              <div className="ai-flashcard-face ai-flashcard-back">
                                <div className="ai-card-category">
                                  Explanation & Solution
                                </div>
                                <div className="ai-card-content-text" style={{ fontSize: '14.5px', whiteSpace: 'pre-line' }}>
                                  {revisionData.data[flashcardIdx]?.back}
                                </div>
                                <div className="ai-card-hint">
                                  Click to flip back ↶
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Navigation row */}
                          <div className="ai-card-nav-row">
                            <button
                              type="button"
                              className="ai-tool-btn"
                              disabled={flashcardIdx === 0}
                              onClick={() => {
                                setIsCardFlipped(false);
                                setFlashcardIdx((prev) => Math.max(0, prev - 1));
                              }}
                            >
                              <IconArrowLeft size={14} />
                              <span>Previous</span>
                            </button>

                            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--forest-900)' }}>
                              {flashcardIdx + 1} / {revisionData.data.length}
                            </span>

                            <button
                              type="button"
                              className="ai-tool-btn"
                              disabled={flashcardIdx >= revisionData.data.length - 1}
                              onClick={() => {
                                setIsCardFlipped(false);
                                setFlashcardIdx((prev) => Math.min(revisionData.data.length - 1, prev + 1));
                              }}
                            >
                              <span>Next</span>
                              <IconArrowRight size={14} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* 2. MCQs Tool */}
                  {activeRevisionTool === 'mcqs' && revisionData.data && (
                    <div className="ai-mcq-list">
                      {revisionData.data.map((mcq, mIdx) => {
                        const selectedOption = userMcqAnswers[mcq.id];
                        const isAnswered = selectedOption !== undefined;
                        const isCorrect = selectedOption === mcq.correctIndex;

                        return (
                          <div key={mcq.id || mIdx} className="ai-mcq-card">
                            <div className="ai-mcq-question">
                              Question {mIdx + 1}: {mcq.question}
                            </div>

                            <div className="ai-mcq-options">
                              {mcq.options.map((opt, oIdx) => {
                                let optClass = 'ai-mcq-option-btn';
                                if (isAnswered) {
                                  if (oIdx === mcq.correctIndex) {
                                    optClass += ' selected-correct';
                                  } else if (selectedOption === oIdx) {
                                    optClass += ' selected-wrong';
                                  }
                                }

                                return (
                                  <button
                                    key={oIdx}
                                    type="button"
                                    className={optClass}
                                    onClick={() => {
                                      if (!isAnswered) {
                                        setUserMcqAnswers((prev) => ({ ...prev, [mcq.id]: oIdx }));
                                      }
                                    }}
                                  >
                                    <span style={{ fontWeight: 700 }}>{String.fromCharCode(65 + oIdx)}.</span>
                                    <span>{opt}</span>
                                  </button>
                                );
                              })}
                            </div>

                            {isAnswered && (
                              <div className="ai-mcq-explanation">
                                <strong>{isCorrect ? '✓ Correct Answer!' : '✗ Incorrect.'}</strong>{' '}
                                {mcq.explanation}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* 3. Markdown Output for Summarize, Formulas, Questions, Last Minute */}
                  {(activeRevisionTool === 'summarize' ||
                    activeRevisionTool === 'formulas' ||
                    activeRevisionTool === 'questions' ||
                    activeRevisionTool === 'last_minute') && (
                    <MarkdownRenderer
                      content={revisionData.content || ''}
                      onSendToPython={handleSendToPythonLab}
                      onShowToast={onShowToast}
                    />
                  )}
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  No revision data generated.
                </div>
              )}
            </div>

            <div className="ai-modal-footer">
              <button
                type="button"
                className="ai-tool-btn"
                onClick={() => {
                  if (revisionData?.content && navigator.clipboard) {
                    navigator.clipboard.writeText(revisionData.content)
                      .then(() => onShowToast?.('Revision content copied!'))
                      .catch(() => onShowToast?.('Unable to copy to clipboard'));
                  } else {
                    onShowToast?.('Clipboard access unavailable');
                  }
                }}
              >
                <IconCopy size={13} />
                <span>Copy Content</span>
              </button>

              <button
                type="button"
                className="ai-new-chat-btn"
                onClick={() => setActiveRevisionTool(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          SAVED AI NOTES LIBRARY SECTION
          ========================================== */}
      <section className="ai-saved-library-section">
        <div className="ai-library-header">
          <div className="ai-library-title">
            <IconFileText size={18} />
            <span>Saved Academic Notes Library ({savedAINotes.length})</span>
          </div>

          <div className="ai-library-controls">
            {/* Search */}
            <input
              type="text"
              className="ai-library-search"
              placeholder="Search notes by keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* Subject filter */}
            <select
              className="ai-form-select"
              style={{ width: 'auto' }}
              value={librarySubjectFilter}
              onChange={(e) => setLibrarySubjectFilter(e.target.value)}
            >
              <option value="ALL">All Subjects</option>
              {SEMESTER_1_SUBJECTS.map((s) => (
                <option key={s.id} value={s.code}>
                  {s.code}
                </option>
              ))}
            </select>
          </div>
        </div>

        {savedAINotes.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            {notes.length === 0
              ? 'No saved notes yet. Generate your first note above and click "Save Note".'
              : 'No notes match your search filters.'}
          </div>
        ) : (
          <div className="ai-library-grid">
            {savedAINotes.map((n) => {
              const isCurrent = activeNote?.id === n.id;
              const dateStr = new Date(n.updatedAt || n.createdAt).toLocaleDateString([], {
                month: 'short',
                day: 'numeric'
              });

              return (
                <div
                  key={n.id}
                  className="ai-library-card"
                  style={{ borderColor: isCurrent ? 'var(--forest-800)' : 'var(--border-card)' }}
                  onClick={() => handleSelectSavedNote(n)}
                >
                  <div className="ai-card-meta-top">
                    <span className="ai-workspace-subject-pill">
                      {n.subjectCode}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleToggleFavorite(n.id, e)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: n.isFavorite ? '#D97706' : 'var(--text-muted)' }}
                      title={n.isFavorite ? 'Starred Favorite' : 'Add to Favorites'}
                    >
                      <IconStar size={15} filled={n.isFavorite} />
                    </button>
                  </div>

                  <div className="ai-card-title">{n.title}</div>

                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Updated {dateStr}</span>
                    <div className="ai-card-actions">
                      <button
                        type="button"
                        onClick={(e) => handleDeleteNote(n.id, e)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        title="Delete note"
                      >
                        <IconTrash size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ==========================================
          API SETUP MODAL
          ========================================== */}
      {isSetupModalOpen && (
        <div className="ai-modal-backdrop" onClick={() => setIsSetupModalOpen(false)}>
          <div className="ai-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ai-modal-header">
              <div className="ai-modal-title">
                <IconZap size={18} style={{ color: 'var(--forest-800)' }} />
                <span>Configure Real AI Connection</span>
              </div>
              <button
                type="button"
                className="ai-modal-close-btn"
                onClick={() => setIsSetupModalOpen(false)}
              >
                <IconX size={18} />
              </button>
            </div>

            <div className="ai-modal-body">
              <p>
                StudyNest is currently running in <strong>Curriculum Demo Mode</strong>.
                To connect real live AI models (like Google Gemini 3.8 Flash or OpenAI), follow these simple steps:
              </p>

              <div className="ai-modal-step">
                <span className="ai-step-num">1</span>
                <div>
                  <strong>Get a Free Google Gemini API Key</strong>
                  <p style={{ margin: '4px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Visit Google AI Studio (<a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--forest-800)', fontWeight: 600 }}>aistudio.google.com</a>) and generate a free API key.
                  </p>
                </div>
              </div>

              <div className="ai-modal-step">
                <span className="ai-step-num">2</span>
                <div>
                  <strong>Create a <code>.env</code> file in your project root</strong>
                  <div className="ai-code-snippet-box">
                    GEMINI_API_KEY=your_actual_gemini_api_key_here<br />
                    GEMINI_MODEL=gemini-3.8-flash
                  </div>
                </div>
              </div>

              <div className="ai-modal-step">
                <span className="ai-step-num">3</span>
                <div>
                  <strong>Restart the Dev Server</strong>
                  <p style={{ margin: '4px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Restart Vite with <code>npm.cmd run dev</code>. Your keys are processed strictly on the server side and never exposed in client code.
                  </p>
                </div>
              </div>
            </div>

            <div className="ai-modal-footer">
              <button
                type="button"
                className="ai-setup-api-btn"
                onClick={async () => {
                  await checkAiStatus();
                  onShowToast?.('Checked AI backend connection.');
                }}
              >
                <IconRefreshCw size={13} />
                <span>Test Connection</span>
              </button>
              <button
                type="button"
                className="ai-new-chat-btn"
                onClick={() => setIsSetupModalOpen(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
