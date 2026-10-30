import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  IconNotes,
  IconSearch,
  IconPlus,
  IconTrash,
  IconCheckCircle,
  IconPin,
  IconStar,
  IconDownload,
  IconPrinter,
  IconCopy,
  IconTag,
  IconFolder,
  IconFolderPlus,
  IconBold,
  IconItalic,
  IconHeading,
  IconList,
  IconListOrdered,
  IconCheckSquare,
  IconCode,
  IconLink,
  IconTable,
  IconEye,
  IconEdit3,
  IconBookOpen,
  IconArrowLeft,
  IconArrowRight,
  IconSliders,
  IconX,
  IconPython,
  IconSparkles
} from '../components/Icons';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { SEMESTER_1_SUBJECTS } from '../data/subjectsData';
import { NOTE_TEMPLATES, PYTHON_NOTE_CATEGORIES } from '../data/notesTemplates';
import {
  getCustomFolders,
  saveCustomFolders,
  getRecentNoteIds,
  logRecentNoteId,
  getRevisedNoteIds,
  toggleRevisedNoteId
} from '../services/storage';

export default function NotesView({
  notes = [],
  onSaveNotes,
  onShowToast,
  onNavigateToPython,
  onNavigateToAINotes
}) {
  // Navigation & Filter States
  // folderFilter: 'ALL' | 'PINNED' | 'FAVORITES' | 'PYTHON' | 'REVISED' | subjectCode | customFolderId
  const [folderFilter, setFolderFilter] = useState('ALL');
  const [pythonCategoryFilter, setPythonCategoryFilter] = useState('ALL');
  const [selectedTagFilter, setSelectedTagFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('updated-desc'); // 'updated-desc' | 'alphabetical-asc' | 'alphabetical-desc' | 'oldest'

  // Persistent Custom Folders, Recent Notes, and Revised Notes
  const [customFolders, setCustomFolders] = useState(() => getCustomFolders());
  const [recentNoteIds, setRecentNoteIds] = useState(() => getRecentNoteIds());
  const [revisedNoteIds, setRevisedNoteIds] = useState(() => getRevisedNoteIds());

  // Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState('edit'); // 'edit' | 'preview' | 'split'
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const textareaRef = useRef(null);

  const [noteForm, setNoteForm] = useState({
    title: '',
    description: '',
    subjectCode: 'MATH 101',
    folderId: 'default',
    content: '',
    tags: [],
    isPinned: false,
    isFavorite: false,
    isPythonNote: false,
    pythonCategory: 'Python Basics'
  });

  // Reader / Quick Revision Modal State
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [revisionIndex, setRevisionIndex] = useState(0);

  // Template Picker Modal State
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  // Custom Folder Creation Modal State
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#2d5a3f');

  // Delete Confirmation Modal State
  const [deleteTargetNote, setDeleteTargetNote] = useState(null);

  // Sync recent notes and revised notes when updated externally
  useEffect(() => {
    const handleRecentUpdate = () => setRecentNoteIds(getRecentNoteIds());
    const handleRevisedUpdate = () => setRevisedNoteIds(getRevisedNoteIds());
    const handleFoldersUpdate = () => setCustomFolders(getCustomFolders());

    window.addEventListener('studynest-recent-notes-updated', handleRecentUpdate);
    window.addEventListener('studynest-revised-notes-updated', handleRevisedUpdate);
    window.addEventListener('studynest-folders-updated', handleFoldersUpdate);

    return () => {
      window.removeEventListener('studynest-recent-notes-updated', handleRecentUpdate);
      window.removeEventListener('studynest-revised-notes-updated', handleRevisedUpdate);
      window.removeEventListener('studynest-folders-updated', handleFoldersUpdate);
    };
  }, []);

  // Collect all unique tags across notes
  const allUniqueTags = useMemo(() => {
    const tagSet = new Set();
    notes.forEach((n) => {
      if (Array.isArray(n.tags)) {
        n.tags.forEach((t) => tagSet.add(t));
      }
    });
    return Array.from(tagSet);
  }, [notes]);

  // Filter notes based on folder, python category, tag, and search query
  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      // 1. Folder / Special filter
      if (folderFilter === 'PINNED') {
        if (!n.isPinned) return false;
      } else if (folderFilter === 'FAVORITES') {
        if (!n.isFavorite) return false;
      } else if (folderFilter === 'REVISED') {
        if (!revisedNoteIds.includes(n.id)) return false;
      } else if (folderFilter === 'PYTHON') {
        if (!n.isPythonNote && n.subjectCode !== 'CSE 101') return false;
        if (pythonCategoryFilter !== 'ALL' && n.pythonCategory !== pythonCategoryFilter) {
          return false;
        }
      } else if (folderFilter.startsWith('custom-')) {
        if (n.folderId !== folderFilter) return false;
      } else if (folderFilter !== 'ALL') {
        if (n.subjectCode !== folderFilter) return false;
      }

      // 2. Tag filter
      if (selectedTagFilter !== 'ALL') {
        if (!n.tags || !n.tags.includes(selectedTagFilter)) return false;
      }

      // 3. Search query (matches title, description, content, tags, subject)
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesTitle = n.title && n.title.toLowerCase().includes(q);
        const matchesDesc = n.description && n.description.toLowerCase().includes(q);
        const matchesContent = n.content && n.content.toLowerCase().includes(q);
        const matchesSubject = (n.subjectTitle && n.subjectTitle.toLowerCase().includes(q)) || (n.subjectCode && n.subjectCode.toLowerCase().includes(q));
        const matchesTags = n.tags && n.tags.some((t) => t.toLowerCase().includes(q));

        if (!matchesTitle && !matchesDesc && !matchesContent && !matchesSubject && !matchesTags) {
          return false;
        }
      }

      return true;
    });
  }, [notes, folderFilter, pythonCategoryFilter, selectedTagFilter, searchTerm, revisedNoteIds]);

  // Sort notes: pinned always first, then by chosen criteria
  const sortedNotes = useMemo(() => {
    return [...filteredNotes].sort((a, b) => {
      // Pinned notes always surface first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      if (sortBy === 'alphabetical-asc') {
        return (a.title || '').localeCompare(b.title || '');
      }
      if (sortBy === 'alphabetical-desc') {
        return (b.title || '').localeCompare(a.title || '');
      }
      if (sortBy === 'oldest') {
        return (a.createdAt || a.id).localeCompare(b.createdAt || b.id);
      }
      // Default: recently updated
      return (b.updatedAt || b.id).localeCompare(a.updatedAt || a.id);
    });
  }, [filteredNotes, sortBy]);

  // Recent notes objects for the quick shelf
  const recentNotesList = useMemo(() => {
    return recentNoteIds
      .map((id) => notes.find((n) => n.id === id))
      .filter(Boolean)
      .slice(0, 4);
  }, [recentNoteIds, notes]);

  // ==========================================
  // NOTE CRUD HANDLERS
  // ==========================================

  const handleOpenNewNote = (templateData = null) => {
    setEditingNoteId(null);
    setEditorMode('edit');
    setTagInput('');

    if (templateData) {
      setNoteForm({
        title: templateData.title || '',
        description: templateData.description || '',
        subjectCode: templateData.subjectCode || 'MATH 101',
        folderId: 'default',
        content: templateData.content || '',
        tags: templateData.tags ? [...templateData.tags] : [],
        isPinned: false,
        isFavorite: false,
        isPythonNote: !!templateData.isPythonNote,
        pythonCategory: templateData.pythonCategory || 'Python Basics'
      });
    } else {
      let defaultSubject = 'MATH 101';
      let defaultIsPython = false;

      if (folderFilter === 'PYTHON') {
        defaultSubject = 'CSE 101';
        defaultIsPython = true;
      } else if (folderFilter !== 'ALL' && !folderFilter.startsWith('custom-') && folderFilter !== 'PINNED' && folderFilter !== 'FAVORITES' && folderFilter !== 'REVISED') {
        defaultSubject = folderFilter;
      }

      setNoteForm({
        title: '',
        description: '',
        subjectCode: defaultSubject,
        folderId: folderFilter.startsWith('custom-') ? folderFilter : 'default',
        content: '',
        tags: [],
        isPinned: folderFilter === 'PINNED',
        isFavorite: folderFilter === 'FAVORITES',
        isPythonNote: defaultIsPython,
        pythonCategory: pythonCategoryFilter !== 'ALL' ? pythonCategoryFilter : 'Python Basics'
      });
    }

    setIsEditorOpen(true);
  };

  const handleOpenEditNote = (note) => {
    logRecentNoteId(note.id);
    setEditingNoteId(note.id);
    setEditorMode('edit');
    setTagInput('');

    setNoteForm({
      title: note.title || '',
      description: note.description || '',
      subjectCode: note.subjectCode || 'MATH 101',
      folderId: note.folderId || 'default',
      content: note.content || '',
      tags: Array.isArray(note.tags) ? [...note.tags] : [],
      isPinned: !!note.isPinned,
      isFavorite: !!note.isFavorite,
      isPythonNote: !!note.isPythonNote,
      pythonCategory: note.pythonCategory || 'Python Basics'
    });

    setIsEditorOpen(true);
  };

  const handleSaveNote = (e) => {
    e.preventDefault();
    if (!noteForm.title.trim()) {
      onShowToast?.('Please enter a note title');
      return;
    }

    const matchedSub = SEMESTER_1_SUBJECTS.find((s) => s.code === noteForm.subjectCode);
    const subjectTitle = matchedSub ? matchedSub.title : 'General Engineering';
    const nowStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    if (editingNoteId) {
      const updated = notes.map((n) => {
        if (n.id === editingNoteId) {
          return {
            ...n,
            title: noteForm.title.trim(),
            description: noteForm.description.trim(),
            subjectTitle,
            subjectCode: noteForm.subjectCode,
            folderId: noteForm.folderId,
            content: noteForm.content.trim(),
            tags: noteForm.tags,
            isPinned: noteForm.isPinned,
            isFavorite: noteForm.isFavorite,
            isPythonNote: noteForm.isPythonNote || noteForm.subjectCode === 'CSE 101',
            pythonCategory: noteForm.pythonCategory,
            updatedAt: nowStr
          };
        }
        return n;
      });
      onSaveNotes(updated);
      logRecentNoteId(editingNoteId);
      onShowToast?.('Note saved and updated successfully');
    } else {
      const newId = `note-${Date.now()}`;
      const newNote = {
        id: newId,
        title: noteForm.title.trim(),
        description: noteForm.description.trim(),
        subjectTitle,
        subjectCode: noteForm.subjectCode,
        folderId: noteForm.folderId,
        content: noteForm.content.trim(),
        tags: noteForm.tags,
        isPinned: noteForm.isPinned,
        isFavorite: noteForm.isFavorite,
        isPythonNote: noteForm.isPythonNote || noteForm.subjectCode === 'CSE 101',
        pythonCategory: noteForm.pythonCategory,
        createdAt: nowStr,
        updatedAt: nowStr
      };
      onSaveNotes([newNote, ...notes]);
      logRecentNoteId(newId);
      onShowToast?.('New study note created');
    }

    setIsEditorOpen(false);
    setEditingNoteId(null);
  };

  const handleConfirmDelete = () => {
    if (!deleteTargetNote) return;
    const noteId = deleteTargetNote.id;
    const updated = notes.filter((n) => n.id !== noteId);
    onSaveNotes(updated);
    setDeleteTargetNote(null);
    onShowToast?.('Note deleted');
  };

  const handleTogglePin = (note, e) => {
    if (e) e.stopPropagation();
    const updated = notes.map((n) => (n.id === note.id ? { ...n, isPinned: !n.isPinned } : n));
    onSaveNotes(updated);
    onShowToast?.(note.isPinned ? 'Note unpinned' : 'Note pinned to top');
  };

  const handleToggleFavorite = (note, e) => {
    if (e) e.stopPropagation();
    const updated = notes.map((n) => (n.id === note.id ? { ...n, isFavorite: !n.isFavorite } : n));
    onSaveNotes(updated);
    onShowToast?.(note.isFavorite ? 'Removed from favorites' : 'Added to favorite notes');
  };

  const handleToggleRevised = (noteId, e) => {
    if (e) e.stopPropagation();
    const updated = toggleRevisedNoteId(noteId);
    setRevisedNoteIds(updated);
    onShowToast?.(updated.includes(noteId) ? 'Marked as revised for exams' : 'Revision pending');
  };

  // ==========================================
  // TAG MANAGEMENT
  // ==========================================

  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (!trimmed) return;
    if (!noteForm.tags.includes(trimmed)) {
      setNoteForm({ ...noteForm, tags: [...noteForm.tags, trimmed] });
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove) => {
    setNoteForm({
      ...noteForm,
      tags: noteForm.tags.filter((t) => t !== tagToRemove)
    });
  };

  // ==========================================
  // RICH TEXT / MARKDOWN TOOLBAR INSERTIONS
  // ==========================================

  const insertFormatting = (prefix, suffix = '', placeholder = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = noteForm.content.substring(start, end);
    const textToInsert = selected ? `${prefix}${selected}${suffix}` : `${prefix}${placeholder}${suffix}`;

    const newContent =
      noteForm.content.substring(0, start) +
      textToInsert +
      noteForm.content.substring(end);

    setNoteForm((prev) => ({ ...prev, content: newContent }));

    setTimeout(() => {
      textarea.focus();
      const newCursor = start + prefix.length + (selected ? selected.length : placeholder.length);
      textarea.setSelectionRange(newCursor, newCursor);
    }, 50);
  };

  // ==========================================
  // EXPORT & EXTERNAL ACTIONS
  // ==========================================

  const handleDownloadTxt = (note, e) => {
    if (e) e.stopPropagation();
    const textContent = `================================================
${(note.title || 'STUDY NOTE').toUpperCase()}
Subject: ${note.subjectTitle || note.subjectCode} (${note.subjectCode})
${note.tags && note.tags.length > 0 ? `Tags: ${note.tags.join(', ')}\n` : ''}Updated: ${note.updatedAt || 'Recent'}
================================================

${note.description ? `SUMMARY:\n${note.description}\n\n` : ''}CONTENT:
${note.content}
`;
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(note.title || 'study_note').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 35)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast?.(`Downloaded "${note.title}" as TXT`);
  };

  const handlePrintNote = (note, e) => {
    if (e) e.stopPropagation();
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${note.title} - StudyNest</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #16221c; padding: 40px; }
              h1 { color: #163624; border-bottom: 2px solid #8ba895; padding-bottom: 8px; margin-bottom: 4px; font-size: 24px; }
              .meta { font-size: 13px; color: #4a5d52; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 1px solid #e0e7e2; }
              .tag { display: inline-block; background: #e8efe9; padding: 2px 8px; border-radius: 4px; font-size: 12px; margin-right: 6px; }
              pre { background: #f0f4f1; padding: 14px; border-radius: 6px; overflow-x: auto; font-family: monospace; font-size: 12.5px; border: 1px solid #c9d8ce; }
              table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
              th, td { border: 1px solid #c9d8ce; padding: 8px 12px; text-align: left; }
              th { background: #e8efe9; font-weight: bold; }
              blockquote { border-left: 3px solid #8ba895; margin: 12px 0; padding-left: 12px; color: #354a3e; font-style: italic; }
            </style>
          </head>
          <body>
            <h1>${note.title}</h1>
            <div class="meta">
              <strong>${note.subjectTitle || note.subjectCode}</strong> (${note.subjectCode}) &bull; Last Updated: ${note.updatedAt || 'Recent'}
              ${note.tags && note.tags.length > 0 ? `<br/><div style="margin-top:6px;">${note.tags.map((t) => `<span class="tag">#${t}</span>`).join(' ')}</div>` : ''}
            </div>
            ${note.description ? `<p style="font-style: italic; color: #354a3e;">${note.description}</p><hr/>` : ''}
            <div class="content">
              <pre style="white-space: pre-wrap; font-family: inherit;">${note.content}</pre>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 350);
    } else {
      window.print();
    }
  };

  const handleCopyNoteContent = (note, e) => {
    if (e) e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(note.content);
      onShowToast?.('Note content copied to clipboard');
    }
  };

  const handleSendToPythonLab = (codeSnippet) => {
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
    if (onNavigateToPython) {
      onNavigateToPython();
    }
  };

  // ==========================================
  // QUICK REVISION READER NAVIGATION
  // ==========================================

  const handleOpenRevisionMode = (startNoteId = null) => {
    if (sortedNotes.length === 0) {
      onShowToast?.('No notes available in current filter to revise');
      return;
    }
    let targetIdx = 0;
    if (startNoteId) {
      const found = sortedNotes.findIndex((n) => n.id === startNoteId);
      if (found !== -1) targetIdx = found;
    }
    setRevisionIndex(targetIdx);
    logRecentNoteId(sortedNotes[targetIdx].id);
    setIsRevisionModalOpen(true);
  };

  const handleNextRevision = () => {
    if (sortedNotes.length === 0) return;
    const nextIdx = (revisionIndex + 1) % sortedNotes.length;
    setRevisionIndex(nextIdx);
    logRecentNoteId(sortedNotes[nextIdx].id);
  };

  const handlePrevRevision = () => {
    if (sortedNotes.length === 0) return;
    const prevIdx = (revisionIndex - 1 + sortedNotes.length) % sortedNotes.length;
    setRevisionIndex(prevIdx);
    logRecentNoteId(sortedNotes[prevIdx].id);
  };

  // Keyboard navigation for Quick Revision Reader
  useEffect(() => {
    if (!isRevisionModalOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        handleNextRevision();
      } else if (e.key === 'ArrowLeft') {
        handlePrevRevision();
      } else if (e.key === 'Escape') {
        setIsRevisionModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // ==========================================
  // CUSTOM FOLDER CREATION
  // ==========================================

  const handleCreateCustomFolder = (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    const newFolder = {
      id: `custom-${Date.now()}`,
      name: newFolderName.trim(),
      color: newFolderColor
    };

    const updated = [...customFolders, newFolder];
    setCustomFolders(updated);
    saveCustomFolders(updated);
    setNewFolderName('');
    setIsFolderModalOpen(false);
    onShowToast?.(`Folder "${newFolder.name}" created`);
  };

  const handleDeleteCustomFolder = (folderId, e) => {
    if (e) e.stopPropagation();
    const updated = customFolders.filter((f) => f.id !== folderId);
    setCustomFolders(updated);
    saveCustomFolders(updated);
    if (folderFilter === folderId) setFolderFilter('ALL');
    onShowToast?.('Custom folder removed');
  };

  const currentRevisionNote = sortedNotes[revisionIndex] || null;
  const isCurrentNoteRevised = currentRevisionNote ? revisedNoteIds.includes(currentRevisionNote.id) : false;

  // Revision progress stats
  const totalNotesCount = notes.length;
  const revisedCount = notes.filter((n) => revisedNoteIds.includes(n.id)).length;
  const revisedPercent = totalNotesCount > 0 ? Math.round((revisedCount / totalNotesCount) * 100) : 0;

  return (
    <div className="smart-notes-page">
      {/* ============================================================
          HEADER & ACTIONS BAR
          ============================================================ */}
      <div className="section-header-row" style={{ marginBottom: '18px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--sage-600)', fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>
            <IconNotes size={16} />
            <span>Smart Notes & Digital Notebook · Semester 1</span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--forest-950)', margin: 0, letterSpacing: '-0.02em' }}>
            Smart Notes & Digital Notebook
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px', maxWidth: '720px' }}>
            Create structured engineering lecture notes, formula sheets, interactive checklists, and executable Python blueprints with instant Practice Lab sync.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {onNavigateToAINotes && (
            <button
              type="button"
              className="sem2-action-btn"
              onClick={onNavigateToAINotes}
              title="Generate comprehensive engineering notes with AI"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--sage-100)', color: 'var(--forest-900)' }}
            >
              <IconSparkles size={15} />
              <span>AI Notes Generator</span>
            </button>
          )}

          <button
            type="button"
            className="sem2-action-btn"
            onClick={() => setIsTemplateModalOpen(true)}
            title="Browse starter templates for engineering formulas and Python patterns"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <IconSliders size={15} />
            <span>Templates</span>
          </button>

          {notes.length > 0 && (
            <button
              type="button"
              className="sem2-action-btn"
              onClick={() => handleOpenRevisionMode()}
              title="Distraction-free revision mode with flip controls"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <IconBookOpen size={15} />
              <span>Revision Mode ({notes.length})</span>
            </button>
          )}

          <button
            type="button"
            className="add-task-btn"
            onClick={() => handleOpenNewNote()}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <IconPlus size={16} />
            <span>New Note</span>
          </button>
        </div>
      </div>

      {/* ============================================================
          EXAM REVISION PROGRESS BANNER
          ============================================================ */}
      {totalNotesCount > 0 && (
        <div
          className="study-progress-card"
          style={{
            marginBottom: '20px',
            padding: '14px 20px',
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: 'rgba(110, 148, 125, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--forest-800)'
              }}
            >
              <IconCheckSquare size={20} />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--forest-950)' }}>
                Exam Revision Checklist Progress
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {revisedCount} of {totalNotesCount} notes revised for exams ({revisedPercent}%)
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 240px', maxWidth: '380px' }}>
            <div style={{ flex: 1, height: '8px', backgroundColor: 'var(--cream-200)', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${revisedPercent}%`,
                  height: '100%',
                  backgroundColor: 'var(--forest-700)',
                  transition: 'width 0.4s ease'
                }}
              />
            </div>
            <button
              type="button"
              className={`folder-pill ${folderFilter === 'REVISED' ? 'active' : ''}`}
              onClick={() => setFolderFilter(folderFilter === 'REVISED' ? 'ALL' : 'REVISED')}
              style={{ padding: '4px 10px', fontSize: '11.5px', whiteSpace: 'nowrap' }}
            >
              {folderFilter === 'REVISED' ? 'Show All' : 'Show Revised Only'}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================
          RECENTLY VIEWED NOTES SHELF
          ============================================================ */}
      {recentNotesList.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <IconNotes size={13} />
            <span>Recently Viewed & Edited</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
            {recentNotesList.map((rn) => (
              <div
                key={`recent-${rn.id}`}
                className="recent-note-chip"
                onClick={() => handleOpenEditNote(rn)}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  transition: 'transform 0.15s ease, border-color 0.15s ease'
                }}
                title={`Open "${rn.title}"`}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '11px', color: 'var(--sage-700)', fontWeight: 600 }}>
                    {rn.subjectCode}
                  </div>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--forest-950)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {rn.title}
                  </div>
                </div>
                {rn.isPinned && <IconPin size={13} style={{ color: '#D97706', flexShrink: 0 }} filled />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================
          ORGANIZATION SIDEBAR / FOLDERS BAR
          ============================================================ */}
      <div style={{ marginBottom: '18px' }}>
        {/* Core & Special Folders */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '8px' }}>
          <button
            type="button"
            className={`folder-pill ${folderFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setFolderFilter('ALL')}
          >
            All Notes ({notes.length})
          </button>

          <button
            type="button"
            className={`folder-pill ${folderFilter === 'PINNED' ? 'active' : ''}`}
            onClick={() => setFolderFilter('PINNED')}
          >
            <IconPin size={13} filled={folderFilter === 'PINNED'} style={{ color: '#D97706' }} />
            <span>Important / Pinned ({notes.filter((n) => n.isPinned).length})</span>
          </button>

          <button
            type="button"
            className={`folder-pill ${folderFilter === 'FAVORITES' ? 'active' : ''}`}
            onClick={() => setFolderFilter('FAVORITES')}
          >
            <IconStar size={13} filled={folderFilter === 'FAVORITES'} style={{ color: '#D97706' }} />
            <span>Favorites ({notes.filter((n) => n.isFavorite).length})</span>
          </button>

          <button
            type="button"
            className={`folder-pill ${folderFilter === 'PYTHON' ? 'active' : ''}`}
            onClick={() => setFolderFilter('PYTHON')}
            style={{ backgroundColor: folderFilter === 'PYTHON' ? 'var(--forest-900)' : 'rgba(45, 90, 63, 0.08)', color: folderFilter === 'PYTHON' ? '#ffffff' : 'var(--forest-950)' }}
          >
            <IconPython size={14} />
            <span>Python Academy Notebook ({notes.filter((n) => n.isPythonNote || n.subjectCode === 'CSE 101').length})</span>
          </button>

          <button
            type="button"
            className={`folder-pill ${folderFilter === 'REVISED' ? 'active' : ''}`}
            onClick={() => setFolderFilter('REVISED')}
          >
            <IconCheckSquare size={13} />
            <span>Revised ({revisedCount})</span>
          </button>
        </div>

        {/* 7 Semester 1 Subject Folders */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: '4px' }}>
            Subjects:
          </span>
          {SEMESTER_1_SUBJECTS.map((s) => {
            const count = notes.filter((n) => n.subjectCode === s.code).length;
            const isActive = folderFilter === s.code;
            return (
              <button
                key={s.id}
                type="button"
                className={`folder-pill ${isActive ? 'active' : ''}`}
                onClick={() => setFolderFilter(s.code)}
                title={s.title}
              >
                <IconFolder size={12} />
                <span>{s.code}</span>
                <span style={{ opacity: 0.7, fontSize: '10.5px' }}>({count})</span>
              </button>
            );
          })}
        </div>

        {/* Custom User Folders + Add Folder */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: '4px' }}>
            Custom:
          </span>
          {customFolders.map((cf) => {
            const count = notes.filter((n) => n.folderId === cf.id).length;
            const isActive = folderFilter === cf.id;
            return (
              <div
                key={cf.id}
                className={`folder-pill custom-folder-pill ${isActive ? 'active' : ''}`}
                onClick={() => setFolderFilter(cf.id)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: cf.color || 'var(--forest-700)' }} />
                <span>{cf.name}</span>
                <span style={{ opacity: 0.7, fontSize: '10.5px' }}>({count})</span>
                <button
                  type="button"
                  onClick={(e) => handleDeleteCustomFolder(cf.id, e)}
                  style={{ background: 'none', border: 'none', padding: '0 2px', cursor: 'pointer', color: 'inherit', opacity: 0.6 }}
                  title="Delete folder"
                >
                  <IconX size={11} />
                </button>
              </div>
            );
          })}

          <button
            type="button"
            className="folder-pill add-custom-folder-btn"
            onClick={() => setIsFolderModalOpen(true)}
            style={{ borderStyle: 'dashed', opacity: 0.85 }}
          >
            <IconFolderPlus size={13} />
            <span>+ Create Folder</span>
          </button>
        </div>

        {/* Python Category Sub-filter (Shown when Python Notebook is active) */}
        {folderFilter === 'PYTHON' && (
          <div
            style={{
              marginTop: '12px',
              padding: '10px 14px',
              backgroundColor: 'rgba(45, 90, 63, 0.05)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(45, 90, 63, 0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap'
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--forest-900)' }}>
              Python Topic:
            </span>
            <button
              type="button"
              className={`folder-pill ${pythonCategoryFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setPythonCategoryFilter('ALL')}
              style={{ fontSize: '11px', padding: '3px 8px' }}
            >
              All Topics
            </button>
            {PYTHON_NOTE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`folder-pill ${pythonCategoryFilter === cat ? 'active' : ''}`}
                onClick={() => setPythonCategoryFilter(cat)}
                style={{ fontSize: '11px', padding: '3px 8px' }}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ============================================================
          SEARCH, SORT, AND TAG FILTERS
          ============================================================ */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}
      >
        {/* Search Bar */}
        <div className="search-bar-wrap" style={{ flex: '1 1 280px', maxWidth: '420px' }}>
          <IconSearch size={16} className="search-icon-pos" />
          <input
            type="text"
            className="search-input"
            placeholder="Search title, content, formulas, tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-muted)' }}
            >
              <IconX size={14} />
            </button>
          )}
        </div>

        {/* Sort & Tag Filter Controls */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {allUniqueTags.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <IconTag size={14} style={{ color: 'var(--text-muted)' }} />
              <select
                className="add-task-input"
                value={selectedTagFilter}
                onChange={(e) => setSelectedTagFilter(e.target.value)}
                style={{ padding: '6px 10px', fontSize: '12px', minWidth: '120px' }}
              >
                <option value="ALL">All Tags ({allUniqueTags.length})</option>
                {allUniqueTags.map((tag) => (
                  <option key={tag} value={tag}>
                    #{tag}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Sort:</span>
            <select
              className="add-task-input"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ padding: '6px 10px', fontSize: '12px', minWidth: '160px' }}
            >
              <option value="updated-desc">Recently Updated</option>
              <option value="oldest">Oldest First</option>
              <option value="alphabetical-asc">Title: A to Z</option>
              <option value="alphabetical-desc">Title: Z to A</option>
            </select>
          </div>
        </div>
      </div>

      {/* ============================================================
          NOTES GRID
          ============================================================ */}
      <div className="smart-notes-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: '18px' }}>
        {sortedNotes.map((note) => {
          const isRevised = revisedNoteIds.includes(note.id);
          const customFolderObj = customFolders.find((f) => f.id === note.folderId);

          return (
            <div
              key={note.id}
              className={`subject-card smart-note-card ${note.isPinned ? 'is-pinned' : ''}`}
              onClick={() => handleOpenEditNote(note)}
              style={{
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                borderLeft: note.isPinned ? '4px solid #D97706' : undefined
              }}
            >
              {/* Card Top: Badges & Pin/Favorite Buttons */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className="subject-code-badge">{note.subjectCode}</span>
                    {note.isPythonNote && (
                      <span
                        className="subject-code-badge"
                        style={{ backgroundColor: 'rgba(45, 90, 63, 0.1)', color: 'var(--forest-800)', border: '1px solid rgba(45, 90, 63, 0.2)' }}
                      >
                        <IconPython size={11} style={{ marginRight: '3px' }} />
                        {note.pythonCategory || 'Python'}
                      </span>
                    )}
                    {customFolderObj && (
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '2px 7px',
                          borderRadius: '4px',
                          backgroundColor: `${customFolderObj.color}15`,
                          color: customFolderObj.color,
                          fontWeight: 600
                        }}
                      >
                        {customFolderObj.name}
                      </span>
                    )}
                    {note.isPinned && (
                      <span
                        style={{
                          fontSize: '10.5px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: '#FEF3C7',
                          color: '#B45309',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        <IconPin size={11} filled />
                        Pinned
                      </span>
                    )}
                  </div>

                  {/* Pin & Favorite Quick Toggles */}
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <button
                      type="button"
                      className="note-icon-action"
                      onClick={(e) => handleTogglePin(note, e)}
                      title={note.isPinned ? 'Unpin note' : 'Pin note to top'}
                      style={{ color: note.isPinned ? '#D97706' : 'var(--text-muted)' }}
                    >
                      <IconPin size={15} filled={note.isPinned} />
                    </button>
                    <button
                      type="button"
                      className="note-icon-action"
                      onClick={(e) => handleToggleFavorite(note, e)}
                      title={note.isFavorite ? 'Remove favorite' : 'Mark as favorite'}
                      style={{ color: note.isFavorite ? '#D97706' : 'var(--text-muted)' }}
                    >
                      <IconStar size={15} filled={note.isFavorite} />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h3
                  style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: 'var(--forest-950)',
                    marginBottom: '6px',
                    lineHeight: 1.35
                  }}
                >
                  {note.title}
                </h3>

                {/* Description summary (if present) */}
                {note.description && (
                  <p
                    style={{
                      fontSize: '12.5px',
                      color: 'var(--text-muted)',
                      fontStyle: 'italic',
                      lineHeight: 1.45,
                      marginBottom: '8px'
                    }}
                  >
                    {note.description}
                  </p>
                )}

                {/* Content snippet preview */}
                <p
                  style={{
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                    marginBottom: '12px',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {note.content.replace(/[#*`_[\]()]/g, '')}
                </p>

                {/* Tags */}
                {Array.isArray(note.tags) && note.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '14px' }}>
                    {note.tags.map((tag) => (
                      <span
                        key={tag}
                        className="note-tag-chip"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTagFilter(tag);
                        }}
                        title={`Filter by tag #${tag}`}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer: Metadata & Action Icons */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '10px',
                  borderTop: '1px solid var(--border-subtle)',
                  fontSize: '11.5px',
                  color: 'var(--text-muted)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={(e) => handleToggleRevised(note.id, e)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: isRevised ? 'var(--forest-800)' : 'var(--text-muted)',
                      fontWeight: isRevised ? 700 : 500,
                      padding: 0
                    }}
                    title="Toggle exam revision checklist status"
                  >
                    <IconCheckSquare size={14} style={{ color: isRevised ? 'var(--forest-800)' : 'var(--text-muted)' }} />
                    <span>{isRevised ? 'Revised' : 'Unrevised'}</span>
                  </button>
                  <span>&bull;</span>
                  <span>{note.updatedAt || 'Recent'}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                  {/* Quick Reader Button */}
                  <button
                    type="button"
                    className="note-mini-btn"
                    onClick={() => handleOpenRevisionMode(note.id)}
                    title="Read in distraction-free revision mode"
                  >
                    <IconBookOpen size={14} />
                  </button>

                  {/* Copy Content Button */}
                  <button
                    type="button"
                    className="note-mini-btn"
                    onClick={(e) => handleCopyNoteContent(note, e)}
                    title="Copy note content"
                  >
                    <IconCopy size={14} />
                  </button>

                  {/* Download TXT Button */}
                  <button
                    type="button"
                    className="note-mini-btn"
                    onClick={(e) => handleDownloadTxt(note, e)}
                    title="Download as TXT file"
                  >
                    <IconDownload size={14} />
                  </button>

                  {/* Print Note Button */}
                  <button
                    type="button"
                    className="note-mini-btn"
                    onClick={(e) => handlePrintNote(note, e)}
                    title="Print note"
                  >
                    <IconPrinter size={14} />
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    className="note-mini-btn delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTargetNote(note);
                    }}
                    title="Delete study note"
                  >
                    <IconTrash size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Empty State */}
        {sortedNotes.length === 0 && (
          <div
            style={{
              gridColumn: '1 / -1',
              padding: '52px 24px',
              textAlign: 'center',
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <IconNotes size={36} style={{ color: 'var(--sage-400)', marginBottom: '14px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-950)', marginBottom: '6px' }}>
              {notes.length === 0 ? 'Your Digital Notebook is Ready' : 'No matching study notes found'}
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '20px', maxWidth: '480px', margin: '0 auto 20px' }}>
              {notes.length === 0
                ? 'Capture lecture derivations, formula sheets, programming patterns, or choose from our starter engineering blueprints.'
                : searchTerm
                ? `No notes matched the query "${searchTerm}". Try resetting search or folder filters.`
                : 'No notes in this folder or tag category.'}
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {notes.length === 0 ? (
                <>
                  <button
                    type="button"
                    className="add-task-btn"
                    onClick={() => handleOpenNewNote()}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <IconPlus size={16} />
                    <span>Create First Study Note</span>
                  </button>
                  <button
                    type="button"
                    className="sem2-action-btn"
                    onClick={() => setIsTemplateModalOpen(true)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <IconSliders size={16} />
                    <span>Browse Engineering Templates</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="add-task-btn"
                  onClick={() => {
                    setFolderFilter('ALL');
                    setSelectedTagFilter('ALL');
                    setSearchTerm('');
                  }}
                >
                  Reset All Filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ============================================================
          RICH TEXT EDITOR MODAL
          ============================================================ */}
      {isEditorOpen && (
        <div className="modal-overlay" onClick={() => setIsEditorOpen(false)} role="dialog" aria-modal="true">
          <div
            className="modal-card note-editor-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '820px', width: '92%' }}
          >
            {/* Modal Header */}
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <IconNotes size={18} style={{ color: 'var(--sage-700)' }} />
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-950)', margin: 0 }}>
                  {editingNoteId ? 'Edit Study Note' : 'Create New Study Note'}
                </h2>
              </div>

              {/* Edit / Preview Tabs */}
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <div style={{ display: 'flex', backgroundColor: 'var(--cream-200)', borderRadius: '6px', padding: '2px' }}>
                  <button
                    type="button"
                    className={`editor-mode-tab ${editorMode === 'edit' ? 'active' : ''}`}
                    onClick={() => setEditorMode('edit')}
                    style={{
                      padding: '4px 10px',
                      fontSize: '12px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      background: editorMode === 'edit' ? '#ffffff' : 'transparent',
                      color: editorMode === 'edit' ? 'var(--forest-950)' : 'var(--text-muted)',
                      fontWeight: editorMode === 'edit' ? 700 : 500
                    }}
                  >
                    <IconEdit3 size={13} style={{ marginRight: '4px' }} />
                    Edit
                  </button>
                  <button
                    type="button"
                    className={`editor-mode-tab ${editorMode === 'preview' ? 'active' : ''}`}
                    onClick={() => setEditorMode('preview')}
                    style={{
                      padding: '4px 10px',
                      fontSize: '12px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      background: editorMode === 'preview' ? '#ffffff' : 'transparent',
                      color: editorMode === 'preview' ? 'var(--forest-950)' : 'var(--text-muted)',
                      fontWeight: editorMode === 'preview' ? 700 : 500
                    }}
                  >
                    <IconEye size={13} style={{ marginRight: '4px' }} />
                    Preview
                  </button>
                </div>

                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setIsEditorOpen(false)}
                  aria-label="Close note editor"
                >
                  <IconX size={16} />
                </button>
              </div>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveNote} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>
                {/* Title & Subject */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      Note Title *
                    </label>
                    <input
                      type="text"
                      required
                      className="add-task-input"
                      placeholder="e.g. Characteristic Equation & Cayley-Hamilton Proof"
                      value={noteForm.title}
                      onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      Course Subject
                    </label>
                    <select
                      className="add-task-input"
                      value={noteForm.subjectCode}
                      onChange={(e) => {
                        const newCode = e.target.value;
                        const isPython = newCode === 'CSE 101';
                        setNoteForm({
                          ...noteForm,
                          subjectCode: newCode,
                          isPythonNote: isPython ? true : noteForm.isPythonNote
                        });
                      }}
                    >
                      {SEMESTER_1_SUBJECTS.map((s) => (
                        <option key={s.id} value={s.code}>
                          {s.code} - {s.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Optional Description / Summary */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Summary / Key Takeaway (Optional)
                  </label>
                  <input
                    type="text"
                    className="add-task-input"
                    placeholder="Brief 1-line recap for exam quick revision"
                    value={noteForm.description}
                    onChange={(e) => setNoteForm({ ...noteForm, description: e.target.value })}
                  />
                </div>

                {/* Organization Folder & Python Category Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      Custom Folder / Binder
                    </label>
                    <select
                      className="add-task-input"
                      value={noteForm.folderId}
                      onChange={(e) => setNoteForm({ ...noteForm, folderId: e.target.value })}
                    >
                      <option value="default">Default Subject Folder</option>
                      {customFolders.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <input
                        type="checkbox"
                        checked={noteForm.isPythonNote}
                        onChange={(e) => setNoteForm({ ...noteForm, isPythonNote: e.target.checked })}
                        style={{ accentColor: 'var(--forest-800)' }}
                      />
                      <span>Python Lab Blueprint?</span>
                    </label>
                    <select
                      className="add-task-input"
                      disabled={!noteForm.isPythonNote}
                      value={noteForm.pythonCategory}
                      onChange={(e) => setNoteForm({ ...noteForm, pythonCategory: e.target.value })}
                      style={{ opacity: noteForm.isPythonNote ? 1 : 0.5 }}
                    >
                      {PYTHON_NOTE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tags & Flags Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  {/* Tag Input */}
                  <div style={{ flex: '1 1 300px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                      Custom Tags
                    </label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input
                        type="text"
                        className="add-task-input"
                        placeholder="Add tag (e.g. Unit-2, Formulas, Lab) & press Enter"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="sem2-action-btn"
                        onClick={handleAddTag}
                        style={{ padding: '0 12px', whiteSpace: 'nowrap' }}
                      >
                        + Add
                      </button>
                    </div>

                    {/* Tag Chips */}
                    {noteForm.tags.length > 0 && (
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px' }}>
                        {noteForm.tags.map((t) => (
                          <span key={t} className="note-tag-chip" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <span>#{t}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(t)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit' }}
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Pin and Favorite Toggles */}
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center', paddingTop: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 600, color: 'var(--forest-950)', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={noteForm.isPinned}
                        onChange={(e) => setNoteForm({ ...noteForm, isPinned: e.target.checked })}
                        style={{ accentColor: '#D97706' }}
                      />
                      <IconPin size={14} filled={noteForm.isPinned} style={{ color: '#D97706' }} />
                      <span>Pin Note</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 600, color: 'var(--forest-950)', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={noteForm.isFavorite}
                        onChange={(e) => setNoteForm({ ...noteForm, isFavorite: e.target.checked })}
                        style={{ accentColor: '#D97706' }}
                      />
                      <IconStar size={14} filled={noteForm.isFavorite} style={{ color: '#D97706' }} />
                      <span>Favorite</span>
                    </label>
                  </div>
                </div>

                {/* RICH TEXT FORMATTING TOOLBAR */}
                {editorMode === 'edit' && (
                  <div
                    className="note-formatting-toolbar"
                    style={{
                      display: 'flex',
                      gap: '4px',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      padding: '8px 10px',
                      backgroundColor: 'var(--cream-100)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <button
                      type="button"
                      className="format-tool-btn"
                      onClick={() => insertFormatting('# ', '', 'Heading 1')}
                      title="Heading 1 (#)"
                    >
                      <IconHeading size={14} /> 1
                    </button>
                    <button
                      type="button"
                      className="format-tool-btn"
                      onClick={() => insertFormatting('## ', '', 'Heading 2')}
                      title="Heading 2 (##)"
                    >
                      <IconHeading size={14} /> 2
                    </button>
                    <button
                      type="button"
                      className="format-tool-btn"
                      onClick={() => insertFormatting('### ', '', 'Heading 3')}
                      title="Heading 3 (###)"
                    >
                      <IconHeading size={14} /> 3
                    </button>

                    <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--border-subtle)', margin: '0 4px' }} />

                    <button
                      type="button"
                      className="format-tool-btn"
                      onClick={() => insertFormatting('**', '**', 'bold text')}
                      title="Bold (**text**)"
                    >
                      <IconBold size={13} />
                    </button>
                    <button
                      type="button"
                      className="format-tool-btn"
                      onClick={() => insertFormatting('*', '*', 'italic text')}
                      title="Italic (*text*)"
                    >
                      <IconItalic size={13} />
                    </button>

                    <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--border-subtle)', margin: '0 4px' }} />

                    <button
                      type="button"
                      className="format-tool-btn"
                      onClick={() => insertFormatting('- ', '', 'Bullet item')}
                      title="Bullet list (-)"
                    >
                      <IconList size={14} />
                    </button>
                    <button
                      type="button"
                      className="format-tool-btn"
                      onClick={() => insertFormatting('1. ', '', 'Numbered item')}
                      title="Numbered list (1.)"
                    >
                      <IconListOrdered size={14} />
                    </button>
                    <button
                      type="button"
                      className="format-tool-btn"
                      onClick={() => insertFormatting('- [ ] ', '', 'Checklist task item')}
                      title="Checklist item (- [ ])"
                    >
                      <IconCheckSquare size={13} />
                    </button>

                    <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--border-subtle)', margin: '0 4px' }} />

                    <button
                      type="button"
                      className="format-tool-btn"
                      onClick={() => insertFormatting('```python\n', '\n```', '# Python code here\nprint("Hello StudyNest")')}
                      title="Python Code Block (```python)"
                    >
                      <IconCode size={13} />
                    </button>
                    <button
                      type="button"
                      className="format-tool-btn"
                      onClick={() => insertFormatting('[', '](https://example.com)', 'Resource Link')}
                      title="Markdown Link ([title](url))"
                    >
                      <IconLink size={13} />
                    </button>
                    <button
                      type="button"
                      className="format-tool-btn"
                      onClick={() =>
                        insertFormatting(
                          '\n| Concept | Formula / Rule | Key Application |\n|---|---|---|\n| Item 1 | Value 1 | Details |\n| Item 2 | Value 2 | Details |\n',
                          '',
                          ''
                        )
                      }
                      title="Insert Table"
                    >
                      <IconTable size={13} />
                    </button>

                    <div style={{ marginLeft: 'auto' }}>
                      <button
                        type="button"
                        className="format-tool-btn"
                        onClick={() => setIsTemplateModalOpen(true)}
                        style={{ fontSize: '11px', color: 'var(--forest-800)', fontWeight: 600 }}
                        title="Load an Engineering Starter Template"
                      >
                        + Insert Template
                      </button>
                    </div>
                  </div>
                )}

                {/* Content Editor Area or Live Formatted Preview */}
                <div style={{ minHeight: '260px', display: 'flex', flexDirection: 'column' }}>
                  {editorMode === 'edit' ? (
                    <textarea
                      ref={textareaRef}
                      required
                      rows={14}
                      className="add-task-input"
                      placeholder="Write your personal lecture takeaways, math derivations, formulas, or Python snippets. Supports full Markdown formatting, tables, checklists, and code blocks."
                      value={noteForm.content}
                      onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                      style={{
                        resize: 'vertical',
                        lineHeight: 1.6,
                        fontFamily: 'var(--font-mono)',
                        fontSize: '13px',
                        minHeight: '260px'
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        padding: '16px 20px',
                        backgroundColor: 'var(--bg-card)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        minHeight: '260px',
                        maxHeight: '440px',
                        overflowY: 'auto'
                      }}
                    >
                      <MarkdownRenderer
                        content={noteForm.content}
                        onSendToPython={handleSendToPythonLab}
                        onShowToast={onShowToast}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {noteForm.content.length} characters &bull; {noteForm.content.split(/\s+/).filter(Boolean).length} words
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="sem2-action-btn"
                    onClick={() => setIsEditorOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="add-task-btn">
                    <IconCheckCircle size={15} />
                    <span>Save Note</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          QUICK REVISION MODE (FULLSCREEN DISTRACTION-FREE READER)
          ============================================================ */}
      {isRevisionModalOpen && currentRevisionNote && (
        <div
          className="modal-overlay"
          onClick={() => setIsRevisionModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="modal-card note-revision-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '860px', width: '94%', height: '88vh', display: 'flex', flexDirection: 'column' }}
          >
            {/* Revision Header */}
            <div
              className="modal-header"
              style={{
                borderBottom: '1px solid var(--border-subtle)',
                padding: '16px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'var(--cream-100)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <IconBookOpen size={18} style={{ color: 'var(--forest-800)' }} />
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--sage-700)' }}>
                    Quick Revision Mode &bull; Note {revisionIndex + 1} of {sortedNotes.length}
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--forest-950)' }}>
                    {currentRevisionNote.subjectCode} · {currentRevisionNote.subjectTitle || 'Engineering Study'}
                  </div>
                </div>
              </div>

              {/* Revision Mode Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  className={`folder-pill ${isCurrentNoteRevised ? 'active' : ''}`}
                  onClick={() => handleToggleRevised(currentRevisionNote.id)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <IconCheckSquare size={14} />
                  <span>{isCurrentNoteRevised ? 'Revised for Exams' : 'Mark as Revised'}</span>
                </button>

                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setIsRevisionModalOpen(false)}
                  title="Close Revision Mode (Esc)"
                >
                  <IconX size={16} />
                </button>
              </div>
            </div>

            {/* Revision Reader Body */}
            <div
              className="modal-body"
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '24px 32px',
                backgroundColor: 'var(--bg-card)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--forest-950)', margin: 0, lineHeight: 1.3 }}>
                  {currentRevisionNote.title}
                </h1>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    className="note-mini-btn"
                    onClick={(e) => handleCopyNoteContent(currentRevisionNote, e)}
                    title="Copy content"
                  >
                    <IconCopy size={15} />
                  </button>
                  <button
                    type="button"
                    className="note-mini-btn"
                    onClick={(e) => handleDownloadTxt(currentRevisionNote, e)}
                    title="Download TXT"
                  >
                    <IconDownload size={15} />
                  </button>
                  <button
                    type="button"
                    className="note-mini-btn"
                    onClick={(e) => handlePrintNote(currentRevisionNote, e)}
                    title="Print"
                  >
                    <IconPrinter size={15} />
                  </button>
                </div>
              </div>

              {currentRevisionNote.description && (
                <div
                  style={{
                    padding: '10px 14px',
                    backgroundColor: 'rgba(110, 148, 125, 0.1)',
                    borderRadius: '6px',
                    color: 'var(--forest-900)',
                    fontSize: '13.5px',
                    fontStyle: 'italic',
                    marginBottom: '18px'
                  }}
                >
                  <strong>Summary:</strong> {currentRevisionNote.description}
                </div>
              )}

              {/* Rendered Markdown Content */}
              <MarkdownRenderer
                content={currentRevisionNote.content}
                onSendToPython={handleSendToPythonLab}
                onShowToast={onShowToast}
              />
            </div>

            {/* Revision Reader Footer with Next / Prev */}
            <div
              className="modal-footer"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 24px',
                borderTop: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--cream-100)'
              }}
            >
              <button
                type="button"
                className="sem2-action-btn"
                onClick={handlePrevRevision}
                disabled={sortedNotes.length <= 1}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <IconArrowLeft size={15} />
                <span>Previous Note (←)</span>
              </button>

              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
                {revisionIndex + 1} / {sortedNotes.length}
              </div>

              <button
                type="button"
                className="add-task-btn"
                onClick={handleNextRevision}
                disabled={sortedNotes.length <= 1}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <span>Next Note (→)</span>
                <IconArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          STARTER TEMPLATES BROWSER MODAL
          ============================================================ */}
      {isTemplateModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsTemplateModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '780px', width: '92%' }}
          >
            <div className="modal-header">
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--forest-950)', margin: 0 }}>
                  Engineering Starter Templates
                </h2>
                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                  Curated study blueprints for Semester 1 subjects and Python programming patterns.
                </p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsTemplateModalOpen(false)}
              >
                <IconX size={16} />
              </button>
            </div>

            <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {NOTE_TEMPLATES.map((tpl) => (
                <div
                  key={tpl.id}
                  style={{
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-card)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '14px',
                    flexWrap: 'wrap'
                  }}
                >
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <span className="subject-code-badge">{tpl.subjectCode}</span>
                      {tpl.isPythonNote && (
                        <span className="subject-code-badge" style={{ backgroundColor: 'rgba(45, 90, 63, 0.1)', color: 'var(--forest-800)' }}>
                          {tpl.pythonCategory}
                        </span>
                      )}
                    </div>
                    <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--forest-950)', margin: '0 0 4px 0' }}>
                      {tpl.title}
                    </h4>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0 }}>
                      {tpl.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="add-task-btn"
                    onClick={() => {
                      setIsTemplateModalOpen(false);
                      handleOpenNewNote(tpl);
                      onShowToast?.(`Loaded template: ${tpl.title}`);
                    }}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    Use Template
                  </button>
                </div>
              ))}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="sem2-action-btn"
                onClick={() => setIsTemplateModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          CUSTOM FOLDER CREATION MODAL
          ============================================================ */}
      {isFolderModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsFolderModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '440px', width: '92%' }}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <IconFolderPlus size={18} style={{ color: 'var(--forest-800)' }} />
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--forest-950)', margin: 0 }}>
                  Create Custom Folder
                </h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsFolderModalOpen(false)}
              >
                <IconX size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateCustomFolder}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Folder Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="add-task-input"
                    placeholder="e.g. Midterm Prep, Lab Manuals, Viva Questions"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    autoFocus
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Color Accent
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {['#1C3829', '#2D5A3F', '#D97706', '#2563EB', '#7C3AED', '#DC2626'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewFolderColor(c)}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: c,
                          border: newFolderColor === c ? '3px solid #ffffff' : 'none',
                          boxShadow: newFolderColor === c ? '0 0 0 2px var(--forest-900)' : 'none',
                          cursor: 'pointer'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="sem2-action-btn"
                  onClick={() => setIsFolderModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="add-task-btn">
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          DELETE CONFIRMATION DIALOG MODAL
          ============================================================ */}
      {deleteTargetNote && (
        <div
          className="modal-overlay"
          onClick={() => setDeleteTargetNote(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '440px', width: '92%' }}
          >
            <div className="modal-header">
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#DC2626', margin: 0 }}>
                Delete Study Note?
              </h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setDeleteTargetNote(null)}
              >
                <IconX size={16} />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                Are you sure you want to delete <strong>"{deleteTargetNote.title}"</strong>? This action cannot be undone.
              </p>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="sem2-action-btn"
                onClick={() => setDeleteTargetNote(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="add-task-btn"
                onClick={handleConfirmDelete}
                style={{ backgroundColor: '#DC2626', borderColor: '#DC2626', color: '#ffffff' }}
              >
                <IconTrash size={15} />
                <span>Delete Note</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
