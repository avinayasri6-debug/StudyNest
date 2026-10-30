import React, { useState } from 'react';
import { IconCopy, IconCheckCircle, IconPython, IconExternalLink } from './Icons';

/**
 * Lightweight, zero-dependency Markdown & Rich Text Renderer
 * Supports: Headings, Bold, Italic, Code Blocks, Inline Code,
 * Interactive Checklists, Tables, Lists, Links, Blockquotes, and HRs.
 */
export default function MarkdownRenderer({
  content = '',
  onSendToPython = null,
  onShowToast = null,
  onChecklistToggle = null
}) {
  const [copiedBlockIdx, setCopiedBlockIdx] = useState(null);

  if (!content || !content.trim()) {
    return (
      <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '12px 0' }}>
        No content written yet.
      </div>
    );
  }

  const handleCopyCode = (codeText, idx) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(codeText);
      setCopiedBlockIdx(idx);
      onShowToast?.('Code snippet copied to clipboard');
      setTimeout(() => setCopiedBlockIdx(null), 2500);
    }
  };

  // Helper to parse inline styles: bold, italic, inline code, links
  const renderInline = (text) => {
    if (!text) return null;

    // Tokenize text into segments
    // Matches: `code`, **bold**, *italic*, [link](url)
    const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
    const parts = text.split(regex);

    return parts.map((part, i) => {
      if (!part) return null;

      // Inline code
      if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
        return (
          <code
            key={i}
            style={{
              backgroundColor: 'var(--sage-100)',
              color: 'var(--forest-900)',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)'
            }}
          >
            {part.slice(1, -1)}
          </code>
        );
      }

      // Bold
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return (
          <strong key={i} style={{ color: 'var(--forest-950)', fontWeight: 700 }}>
            {part.slice(2, -2)}
          </strong>
        );
      }

      // Italic
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return (
          <em key={i} style={{ fontStyle: 'italic' }}>
            {part.slice(1, -1)}
          </em>
        );
      }

      // Link: [text](url)
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        return (
          <a
            key={i}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'var(--forest-800)',
              textDecoration: 'underline',
              fontWeight: 600
            }}
          >
            {linkMatch[1]}
          </a>
        );
      }

      return part;
    });
  };

  // Process blocks: Headings, Code Blocks, Tables, Checklists, Lists, Blockquotes, Paragraphs
  const lines = content.split('\n');
  const elements = [];
  let lineIdx = 0;

  while (lineIdx < lines.length) {
    const line = lines[lineIdx];

    // 1. Code Block: ```lang
    if (line.trim().startsWith('```')) {
      const lang = line.trim().slice(3).trim() || 'python';
      const codeLines = [];
      lineIdx++;
      while (lineIdx < lines.length && !lines[lineIdx].trim().startsWith('```')) {
        codeLines.push(lines[lineIdx]);
        lineIdx++;
      }
      lineIdx++; // consume closing ```

      const codeText = codeLines.join('\n');
      const blockKey = `code-${lineIdx}`;
      const isPython = lang.toLowerCase().includes('python') || lang.toLowerCase() === 'py';

      elements.push(
        <div
          key={blockKey}
          className="note-code-block"
          style={{
            margin: '14px 0',
            backgroundColor: '#16221c',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid #283e32',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '6px 12px',
              backgroundColor: '#0f1813',
              borderBottom: '1px solid #283e32',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--sage-300)'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {isPython && <IconPython size={14} />}
              <span>{lang || 'code'}</span>
            </span>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="code-action-btn"
                onClick={() => handleCopyCode(codeText, blockKey)}
                title="Copy code snippet"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'transparent',
                  border: '1px solid #2c4436',
                  color: 'var(--cream-100)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
              >
                {copiedBlockIdx === blockKey ? <IconCheckCircle size={12} style={{ color: '#6EE7B7' }} /> : <IconCopy size={12} />}
                <span>{copiedBlockIdx === blockKey ? 'Copied' : 'Copy'}</span>
              </button>

              {isPython && onSendToPython && (
                <button
                  type="button"
                  className="code-action-btn"
                  onClick={() => onSendToPython(codeText)}
                  title="Run in Python Practice Lab"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: 'var(--sage-600)',
                    border: 'none',
                    color: '#ffffff',
                    padding: '3px 9px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 600
                  }}
                >
                  <IconExternalLink size={12} />
                  <span>Send to Practice Lab</span>
                </button>
              )}
            </div>
          </div>

          <pre
            style={{
              margin: 0,
              padding: '12px 14px',
              color: '#dbe7df',
              fontFamily: 'var(--font-mono)',
              fontSize: '12.5px',
              lineHeight: 1.5,
              overflowX: 'auto',
              whiteSpace: 'pre'
            }}
          >
            <code>{codeText}</code>
          </pre>
        </div>
      );
      continue;
    }

    // 2. Markdown Table: starts with | and next line has |---|
    if (
      line.trim().startsWith('|') &&
      lineIdx + 1 < lines.length &&
      lines[lineIdx + 1].includes('|') &&
      lines[lineIdx + 1].includes('-')
    ) {
      const tableRows = [];
      while (lineIdx < lines.length && lines[lineIdx].trim().startsWith('|')) {
        tableRows.push(lines[lineIdx]);
        lineIdx++;
      }

      if (tableRows.length >= 2) {
        const parseRow = (rowStr) =>
          rowStr
            .split('|')
            .slice(1, -1)
            .map((cell) => cell.trim());

        const headers = parseRow(tableRows[0]);
        const bodyRows = tableRows.slice(2).map(parseRow);

        elements.push(
          <div key={`table-${lineIdx}`} style={{ overflowX: 'auto', margin: '14px 0' }}>
            <table className="note-rendered-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--cream-200)', borderBottom: '2px solid var(--border-color)' }}>
                  {headers.map((h, hIdx) => (
                    <th
                      key={hIdx}
                      style={{
                        padding: '8px 12px',
                        textAlign: 'left',
                        fontWeight: 700,
                        color: 'var(--forest-950)'
                      }}
                    >
                      {renderInline(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      backgroundColor: rIdx % 2 === 0 ? 'transparent' : 'rgba(165, 196, 175, 0.08)'
                    }}
                  >
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} style={{ padding: '8px 12px', color: 'var(--text-primary)' }}>
                        {renderInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    // 3. Headings
    if (line.startsWith('### ')) {
      elements.push(
        <h3
          key={`h3-${lineIdx}`}
          style={{
            fontSize: '16px',
            fontWeight: 700,
            color: 'var(--forest-950)',
            margin: '18px 0 8px 0'
          }}
        >
          {renderInline(line.slice(4))}
        </h3>
      );
      lineIdx++;
      continue;
    }

    if (line.startsWith('## ')) {
      elements.push(
        <h2
          key={`h2-${lineIdx}`}
          style={{
            fontSize: '18px',
            fontWeight: 800,
            color: 'var(--forest-950)',
            margin: '22px 0 10px 0',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '4px'
          }}
        >
          {renderInline(line.slice(3))}
        </h2>
      );
      lineIdx++;
      continue;
    }

    if (line.startsWith('# ')) {
      elements.push(
        <h1
          key={`h1-${lineIdx}`}
          style={{
            fontSize: '22px',
            fontWeight: 800,
            color: 'var(--forest-950)',
            margin: '24px 0 12px 0',
            borderBottom: '2px solid var(--sage-200)',
            paddingBottom: '6px'
          }}
        >
          {renderInline(line.slice(2))}
        </h1>
      );
      lineIdx++;
      continue;
    }

    // 4. Horizontal Rule: ---
    if (line.trim() === '---' || line.trim() === '***') {
      elements.push(
        <hr
          key={`hr-${lineIdx}`}
          style={{
            border: 'none',
            borderTop: '1px solid var(--border-subtle)',
            margin: '18px 0'
          }}
        />
      );
      lineIdx++;
      continue;
    }

    // 5. Checklist item: - [ ] or - [x]
    const checklistMatch = line.match(/^[-*]\s+\[([ xX])\]\s+(.+)$/);
    if (checklistMatch) {
      const isChecked = checklistMatch[1].toLowerCase() === 'x';
      const itemText = checklistMatch[2];
      const currentLineIdx = lineIdx;

      elements.push(
        <div
          key={`check-${lineIdx}`}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            margin: '6px 0',
            fontSize: '13.5px',
            lineHeight: 1.5
          }}
        >
          <input
            type="checkbox"
            checked={isChecked}
            onChange={() => onChecklistToggle && onChecklistToggle(currentLineIdx)}
            style={{
              marginTop: '4px',
              accentColor: 'var(--forest-800)',
              cursor: onChecklistToggle ? 'pointer' : 'default'
            }}
          />
          <span
            style={{
              color: isChecked ? 'var(--text-muted)' : 'var(--text-primary)',
              textDecoration: isChecked ? 'line-through' : 'none'
            }}
          >
            {renderInline(itemText)}
          </span>
        </div>
      );
      lineIdx++;
      continue;
    }

    // 6. Bullet List: - item or * item
    if (line.match(/^[-*]\s+(.+)$/)) {
      const listItems = [];
      while (lineIdx < lines.length && lines[lineIdx].match(/^[-*]\s+(.+)$/) && !lines[lineIdx].match(/^[-*]\s+\[[ xX]\]/)) {
        const itemContent = lines[lineIdx].replace(/^[-*]\s+/, '');
        listItems.push(itemContent);
        lineIdx++;
      }

      elements.push(
        <ul
          key={`ul-${lineIdx}`}
          style={{
            margin: '8px 0 12px 20px',
            paddingLeft: '6px',
            fontSize: '13.5px',
            lineHeight: 1.6,
            color: 'var(--text-primary)'
          }}
        >
          {listItems.map((li, liIdx) => (
            <li key={liIdx} style={{ marginBottom: '4px' }}>
              {renderInline(li)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // 7. Numbered List: 1. item
    if (line.match(/^\d+\.\s+(.+)$/)) {
      const listItems = [];
      while (lineIdx < lines.length && lines[lineIdx].match(/^\d+\.\s+(.+)$/)) {
        const itemContent = lines[lineIdx].replace(/^\d+\.\s+/, '');
        listItems.push(itemContent);
        lineIdx++;
      }

      elements.push(
        <ol
          key={`ol-${lineIdx}`}
          style={{
            margin: '8px 0 12px 20px',
            paddingLeft: '6px',
            fontSize: '13.5px',
            lineHeight: 1.6,
            color: 'var(--text-primary)'
          }}
        >
          {listItems.map((li, liIdx) => (
            <li key={liIdx} style={{ marginBottom: '4px' }}>
              {renderInline(li)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // 8. Blockquote: > text
    if (line.startsWith('>')) {
      const quoteText = line.replace(/^>\s*/, '');
      elements.push(
        <blockquote
          key={`quote-${lineIdx}`}
          style={{
            margin: '12px 0',
            padding: '8px 14px',
            borderLeft: '3px solid var(--sage-500)',
            backgroundColor: 'rgba(165, 196, 175, 0.1)',
            borderRadius: '0 6px 6px 0',
            color: 'var(--forest-950)',
            fontStyle: 'italic',
            fontSize: '13.5px'
          }}
        >
          {renderInline(quoteText)}
        </blockquote>
      );
      lineIdx++;
      continue;
    }

    // 9. Blank line or regular paragraph
    if (line.trim() === '') {
      lineIdx++;
      continue;
    }

    elements.push(
      <p
        key={`p-${lineIdx}`}
        style={{
          margin: '6px 0 10px 0',
          fontSize: '13.5px',
          lineHeight: 1.65,
          color: 'var(--text-primary)'
        }}
      >
        {renderInline(line)}
      </p>
    );
    lineIdx++;
  }

  return <div className="markdown-body">{elements}</div>;
}

