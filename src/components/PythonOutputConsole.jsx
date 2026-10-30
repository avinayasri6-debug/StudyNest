import React, { useState } from 'react';
import {
  IconTerminal,
  IconTestTube,
  IconCheckCircle,
  IconX,
  IconTrash
} from './Icons';

export default function PythonOutputConsole({
  stdout = '',
  stderr = '',
  error = null,
  executionTimeMs = 0,
  testResults = null,
  onClearConsole,
  onMarkCompleted,
  isCompleted = false
}) {
  const [activeConsoleTab, setActiveConsoleTab] = useState('terminal'); // 'terminal' | 'tests'

  const hasOutput = stdout && stdout.length > 0;
  const hasError = !!error || (stderr && stderr.length > 0);
  const hasTests = !!testResults && testResults.totalTests > 0;

  return (
    <div className="python-console-container">
      {/* Console Tab Header */}
      <div className="python-console-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className={`console-tab-btn ${activeConsoleTab === 'terminal' ? 'active' : ''}`}
            onClick={() => setActiveConsoleTab('terminal')}
          >
            <IconTerminal size={14} />
            <span>Terminal Output</span>
            {hasError && <span className="console-error-dot" />}
          </button>

          {hasTests && (
            <button
              type="button"
              className={`console-tab-btn ${activeConsoleTab === 'tests' ? 'active' : ''}`}
              onClick={() => setActiveConsoleTab('tests')}
            >
              <IconTestTube size={14} />
              <span>
                Test Results ({testResults.passedTests}/{testResults.totalTests})
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: '10px',
                  backgroundColor: testResults.allPassed ? '#15803D' : '#DC2626',
                  color: '#FFFFFF'
                }}
              >
                {testResults.allPassed ? '✓ Passed' : 'Failed'}
              </span>
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {executionTimeMs > 0 && (
            <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
              ⏱️ {executionTimeMs} ms
            </span>
          )}

          <button
            type="button"
            className="editor-btn-secondary"
            onClick={onClearConsole}
            title="Clear console output"
            style={{ padding: '3px 8px', fontSize: '11.5px' }}
          >
            <IconTrash size={12} />
            <span>Clear Console</span>
          </button>
        </div>
      </div>

      {/* TAB 1: TERMINAL OUTPUT */}
      {activeConsoleTab === 'terminal' && (
        <div className="python-terminal-screen">
          {!hasOutput && !hasError ? (
            <div className="terminal-placeholder">
              <span>Ready. Click <strong>"Run Code"</strong> to execute in Pyodide WebAssembly.</span>
            </div>
          ) : (
            <div className="terminal-content">
              {hasOutput && (
                <pre className="terminal-stdout">{stdout}</pre>
              )}

              {hasError && (
                <div className="terminal-stderr-box">
                  <div className="terminal-error-heading">
                    <IconX size={14} />
                    <span>Python Runtime Traceback:</span>
                  </div>
                  <pre className="terminal-stderr">{stderr || error}</pre>
                </div>
              )}

              {!hasError && hasOutput && (
                <div className="terminal-success-pill">
                  ✓ Process finished with exit code 0
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TEST CASES & RESULTS */}
      {activeConsoleTab === 'tests' && hasTests && (
        <div className="python-tests-screen">
          {/* Summary Banner */}
          <div
            className={`tests-summary-banner ${testResults.allPassed ? 'all-passed' : 'has-failures'}`}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {testResults.allPassed ? (
                <IconCheckCircle size={22} style={{ color: '#15803D' }} />
              ) : (
                <IconX size={22} style={{ color: '#DC2626' }} />
              )}
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: testResults.allPassed ? '#14532D' : '#7F1D1D' }}>
                  {testResults.allPassed
                    ? 'All Test Cases Passed Successfully!'
                    : `${testResults.passedTests} of ${testResults.totalTests} Test Cases Passed`}
                </div>
                <div style={{ fontSize: '12px', color: testResults.allPassed ? '#166534' : '#991B1B' }}>
                  {testResults.allPassed
                    ? 'Excellent engineering work! Your algorithm meets all expected criteria.'
                    : 'Some assertions failed. Check the failed tests below to adjust your logic.'}
                </div>
              </div>
            </div>

            {testResults.allPassed && !isCompleted && onMarkCompleted && (
              <button
                type="button"
                className="add-task-btn"
                style={{ backgroundColor: '#15803D', color: '#FFFFFF', fontSize: '12.5px' }}
                onClick={onMarkCompleted}
              >
                <IconCheckCircle size={15} />
                <span>Mark Exercise as Solved</span>
              </button>
            )}
          </div>

          {/* Test Case Breakdown */}
          <div className="tests-case-list">
            {testResults.results.map((r, i) => (
              <div key={i} className={`test-case-item ${r.passed ? 'passed' : 'failed'}`}>
                <div className="test-case-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`test-status-pill ${r.passed ? 'passed' : 'failed'}`}>
                      {r.passed ? '✓ PASSED' : '✗ FAILED'}
                    </span>
                    <strong style={{ fontSize: '13px', color: 'var(--forest-950)' }}>
                      {r.name}
                    </strong>
                  </div>
                  {r.call && (
                    <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                      Expression: {r.call}
                    </span>
                  )}
                </div>

                <div className="test-comparison-grid">
                  <div>
                    <span className="comparison-label">Expected:</span>
                    <pre className="comparison-val">{r.expected}</pre>
                  </div>
                  <div>
                    <span className="comparison-label">Actual Result:</span>
                    <pre className={`comparison-val ${r.passed ? 'actual-good' : 'actual-bad'}`}>
                      {r.actual || '(none)'}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

