import React, { useState, useRef } from 'react';
import { highlightPython } from '../services/prismHelper';
import {
  IconPlay,
  IconStop,
  IconReset,
  IconTrash,
  IconCopy,
  IconKeyboard,
  IconTestTube
} from './Icons';

export default function PythonCodeEditor({
  code = '',
  onChange,
  onRun,
  onRunTests,
  onStop,
  onReset,
  onClear,
  isRunning = false,
  hasTests = true,
  inputValues = '',
  onInputValuesChange,
  onShowToast,
  runtimeStatus = { status: 'ready', message: '' }
}) {
  const [showInputPanel, setShowInputPanel] = useState(false);
  const [editorMode, setEditorMode] = useState('editor'); // 'editor' | 'highlight'
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);

  const lines = code.split('\n');
  const lineCount = Math.max(lines.length, 1);

  // Sync scrolling between textarea and line numbers gutter
  const handleScroll = (e) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.target.scrollTop;
    }
  };

  // Keyboard navigation & smart Python indentation
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const indent = '    '; // 4 spaces for Python PEP 8 standard

      const updated = code.substring(0, start) + indent + code.substring(end);
      onChange(updated);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + indent.length;
      }, 0);
    } else if (e.key === 'Enter') {
      // Auto-indentation after colons (e.g. def, if, for, while)
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const currentLine = code.substring(0, start).split('\n').pop() || '';
      const match = currentLine.match(/^(\s*)/);
      let indent = match ? match[1] : '';

      if (currentLine.trim().endsWith(':')) {
        indent += '    ';
      }

      if (indent.length > 0) {
        e.preventDefault();
        const updated = code.substring(0, start) + '\n' + indent + code.substring(start);
        onChange(updated);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1 + indent.length;
        }, 0);
      }
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      onShowToast?.('Code copied to clipboard!');
    } catch {
      onShowToast?.('Failed to copy to clipboard.');
    }
  };

  const highlightedHtml = highlightPython(code);

  const isReady = runtimeStatus.status === 'ready';
  const isInitializing = runtimeStatus.status === 'loading';

  return (
    <div className="python-editor-container">
      {/* Editor Top Control Bar */}
      <div className="python-editor-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="editor-file-tab">
            <span className="file-dot" />
            main.py
          </span>

          <span
            className="runtime-status-pill"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '12px',
              backgroundColor: isInitializing ? 'rgba(234, 179, 8, 0.15)' : isReady ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: isInitializing ? '#FBBF24' : isReady ? '#86EFAC' : '#FCA5A5'
            }}
            title={runtimeStatus.message}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: isInitializing ? '#F59E0B' : isReady ? '#22C55E' : '#EF4444'
              }}
            />
            <span>{isInitializing ? 'Loading Pyodide...' : isReady ? 'Pyodide Ready' : 'Runtime Offline'}</span>
          </span>

          <span style={{ fontSize: '11.5px', color: '#9CA3AF', marginLeft: '6px' }}>
            {lineCount} {lineCount === 1 ? 'line' : 'lines'} · {code.length} chars
          </span>
        </div>

        {/* Action Buttons Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {/* Mode Switcher: Code vs Highlighted View */}
          <button
            type="button"
            className="editor-btn-secondary"
            onClick={() => setEditorMode(editorMode === 'editor' ? 'highlight' : 'editor')}
            title="Toggle between raw editor and highlighted view"
          >
            <span>{editorMode === 'editor' ? '🎨 Syntax View' : '✏️ Edit Mode'}</span>
          </button>

          {/* Stdin Input Toggle */}
          <button
            type="button"
            className={`editor-btn-secondary ${showInputPanel ? 'active' : ''}`}
            onClick={() => setShowInputPanel(!showInputPanel)}
            title="Toggle Program Input Values (sys.stdin for input())"
            style={{
              backgroundColor: showInputPanel ? 'rgba(104, 143, 120, 0.25)' : undefined,
              borderColor: showInputPanel ? 'var(--forest-600)' : undefined
            }}
          >
            <IconKeyboard size={14} />
            <span>Inputs (stdin)</span>
            {inputValues.trim() && <span className="input-dot-badge" />}
          </button>

          {/* Copy Button */}
          <button
            type="button"
            className="editor-btn-secondary"
            onClick={handleCopyCode}
            title="Copy Python code"
          >
            <IconCopy size={14} />
            <span>Copy</span>
          </button>

          {/* Reset Code */}
          <button
            type="button"
            className="editor-btn-secondary"
            onClick={onReset}
            title="Reset code to starter template"
          >
            <IconReset size={14} />
            <span>Reset</span>
          </button>

          {/* Clear Code */}
          <button
            type="button"
            className="editor-btn-secondary"
            onClick={onClear}
            title="Clear all code in editor"
          >
            <IconTrash size={14} />
            <span>Clear</span>
          </button>

          {/* Stop Button (Active only when running) */}
          {isRunning ? (
            <button
              type="button"
              className="editor-btn-stop"
              onClick={onStop}
              title="Stop runaway or long-running execution"
            >
              <IconStop size={15} />
              <span>Stop Execution</span>
            </button>
          ) : null}

          {/* Run Tests Button */}
          {hasTests && (
            <button
              type="button"
              className="editor-btn-tests"
              onClick={onRunTests}
              disabled={isRunning || isInitializing}
              title="Run test cases against this code"
            >
              <IconTestTube size={15} />
              <span>Run Tests</span>
            </button>
          )}

          {/* Primary Run Code Button */}
          <button
            type="button"
            className="editor-btn-run"
            onClick={onRun}
            disabled={isRunning || isInitializing}
            title="Execute Python code in browser via Pyodide WebAssembly"
          >
            {isRunning ? (
              <span className="spinner-icon" />
            ) : (
              <IconPlay size={14} />
            )}
            <span>{isRunning ? 'Running...' : 'Run Code'}</span>
          </button>
        </div>
      </div>

      {/* Program Input (stdin) Panel */}
      {showInputPanel && (
        <div className="python-stdin-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <IconKeyboard size={14} style={{ color: 'var(--forest-400)' }} />
              <strong style={{ fontSize: '12px', color: '#E8F3EB' }}>
                Program Inputs (sys.stdin queue)
              </strong>
            </div>
            <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
              Enter each input value on a new line
            </span>
          </div>
          <textarea
            className="python-stdin-textarea"
            rows={3}
            value={inputValues}
            onChange={(e) => onInputValuesChange?.(e.target.value)}
            placeholder="Example input lines for input() calls (one per line):&#10;Alice&#10;19"
          />
          <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>
            💡 Values will be fed sequentially each time your Python program calls <code>input()</code>.
          </div>
        </div>
      )}

      {/* Code Editor Main Body (Line numbers + Textarea / Highlighted) */}
      <div className="python-editor-body">
        {/* Line Numbers Gutter */}
        <div ref={lineNumbersRef} className="python-line-gutter" aria-hidden="true">
          {lines.map((_, idx) => (
            <div key={idx} className="gutter-line-number">
              {idx + 1}
            </div>
          ))}
        </div>

        {/* Code Input or Syntax View */}
        <div className="python-code-content-wrap">
          {editorMode === 'editor' ? (
            <textarea
              ref={textareaRef}
              className="python-textarea"
              value={code}
              onChange={(e) => onChange(e.target.value)}
              onScroll={handleScroll}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              placeholder="# Write your Python code here..."
            />
          ) : (
            <pre className="python-highlighted-pre" onScroll={handleScroll}>
              <code
                className="language-python"
                dangerouslySetInnerHTML={{ __html: highlightedHtml }}
              />
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
