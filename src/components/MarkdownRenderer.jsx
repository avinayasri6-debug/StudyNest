import React, { useState } from 'react';
import {
  IconCopy,
  IconCheckCircle,
  IconPython,
  IconExternalLink,
  IconCode,
  IconEye
} from './Icons';

/**
 * Greek letters map for LaTeX conversion
 */
const GREEK_MAP = {
  alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε',
  zeta: 'ζ', eta: 'η', theta: 'θ', iota: 'ι', kappa: 'κ',
  lambda: 'λ', mu: 'μ', nu: 'ν', xi: 'ξ', pi: 'π',
  rho: 'ρ', sigma: 'σ', tau: 'τ', upsilon: 'υ', phi: 'φ',
  chi: 'χ', psi: 'ψ', omega: 'ω',
  Gamma: 'Γ', Delta: 'Δ', Theta: 'Θ', Lambda: 'Λ', Xi: 'Ξ',
  Pi: 'Π', Sigma: 'Σ', Phi: 'Φ', Psi: 'Ψ', Omega: 'Ω',
  hbar: 'ℏ'
};

/**
 * Mathematical symbols map for LaTeX conversion
 */
const SYMBOL_MAP = {
  times: '×', cdot: '·', pm: '±', mp: '∓', approx: '≈',
  neq: '≠', ne: '≠', leq: '≤', le: '≤', geq: '≥', ge: '≥',
  ll: '≪', gg: '≫', propto: '∝', to: '→', rightarrow: '→',
  leftarrow: '←', implies: '⟹', Longrightarrow: '⟹',
  iff: '⟺', infty: '∞', partial: '∂', nabla: '∇',
  sum: '∑', prod: '∏', int: '∫', oint: '∮',
  forall: '∀', exists: '∃', in: '∈', notin: '∉',
  subset: '⊂', cup: '∪', cap: '∩', circ: '°', degree: '°'
};

/**
 * Extract balanced { ... } starting at startIdx
 */
function extractBraceGroup(str, startIdx) {
  if (str[startIdx] !== '{') return null;
  let depth = 0;
  for (let i = startIdx; i < str.length; i++) {
    if (str[i] === '{') depth++;
    else if (str[i] === '}') {
      depth--;
      if (depth === 0) {
        return {
          content: str.slice(startIdx + 1, i),
          endIdx: i + 1
        };
      }
    }
  }
  return null;
}

/**
 * Parse raw math string into a semantic AST
 */
function parseMathNodes(raw) {
  let s = (raw || '').trim();
  if (s.startsWith('$$') && s.endsWith('$$')) s = s.slice(2, -2).trim();
  else if (s.startsWith('$') && s.endsWith('$')) s = s.slice(1, -1).trim();

  // Strip common LaTeX grouping / spacing
  s = s.replace(/\\left([([{|])/g, '$1')
       .replace(/\\right([)\]}|])/g, '$1')
       .replace(/\\[,;!]/g, ' ')
       .replace(/\\quad/g, '  ')
       .replace(/\\qquad/g, '    ')
       .replace(/\\(?:text|mathrm|mathbf)\{([^}]+)\}/g, '$1')
       .replace(/\\cos/g, 'cos')
       .replace(/\\sin/g, 'sin')
       .replace(/\\tan/g, 'tan')
       .replace(/\\det/g, 'det')
       .replace(/\\log/g, 'log')
       .replace(/\\ln/g, 'ln')
       .replace(/\\lim/g, 'lim');

  // Replace Greek & math symbol commands
  s = s.replace(/\\([a-zA-Z]+)/g, (match, word) => {
    if (GREEK_MAP[word]) return GREEK_MAP[word];
    if (SYMBOL_MAP[word]) return SYMBOL_MAP[word];
    return match;
  });

  const nodes = [];
  let i = 0;

  while (i < s.length) {
    // 1. Fractions: \frac{num}{den}
    if (s.startsWith('\\frac', i)) {
      let cursor = i + 5;
      while (cursor < s.length && /\s/.test(s[cursor])) cursor++;
      let numGroup = extractBraceGroup(s, cursor);
      let numContent = '';
      if (numGroup) {
        numContent = numGroup.content;
        cursor = numGroup.endIdx;
      } else if (cursor < s.length) {
        numContent = s[cursor];
        cursor++;
      }

      while (cursor < s.length && /\s/.test(s[cursor])) cursor++;
      let denGroup = extractBraceGroup(s, cursor);
      let denContent = '';
      if (denGroup) {
        denContent = denGroup.content;
        cursor = denGroup.endIdx;
      } else if (cursor < s.length) {
        denContent = s[cursor];
        cursor++;
      }

      nodes.push({
        type: 'frac',
        numerator: parseMathNodes(numContent),
        denominator: parseMathNodes(denContent)
      });
      i = cursor;
      continue;
    }

    // 2. Square root: \sqrt{radicand}
    if (s.startsWith('\\sqrt', i)) {
      let cursor = i + 5;
      while (cursor < s.length && /\s/.test(s[cursor])) cursor++;
      let radGroup = extractBraceGroup(s, cursor);
      let radContent = '';
      if (radGroup) {
        radContent = radGroup.content;
        cursor = radGroup.endIdx;
      } else if (cursor < s.length) {
        radContent = s[cursor];
        cursor++;
      }

      nodes.push({
        type: 'sqrt',
        radicand: parseMathNodes(radContent)
      });
      i = cursor;
      continue;
    }

    // 3. Subscripts and superscripts: D_n^2, \lambda_1, x_i, etc.
    const subSupMatch = s.slice(i).match(/^([a-zA-Z0-9α-ωΑ-Ωℏ]+)(?:_(\{([^}]+)\}|[a-zA-Z0-9α-ωΑ-Ω+-]))?(?:\^(\{([^}]+)\}|[a-zA-Z0-9α-ωΑ-Ω+-]))?/);
    if (subSupMatch && (subSupMatch[2] || subSupMatch[4])) {
      const base = subSupMatch[1];
      const sub = subSupMatch[3] || (subSupMatch[2] ? subSupMatch[2].replace(/^_/, '') : null);
      const sup = subSupMatch[5] || (subSupMatch[4] ? subSupMatch[4].replace(/^\^/, '') : null);
      nodes.push({
        type: 'script',
        base,
        sub: sub ? parseMathNodes(sub) : null,
        sup: sup ? parseMathNodes(sup) : null
      });
      i += subSupMatch[0].length;
      continue;
    }

    nodes.push({ type: 'text', value: s[i] });
    i++;
  }

  // Merge adjacent text nodes
  const merged = [];
  for (const node of nodes) {
    if (node.type === 'text') {
      if (merged.length > 0 && merged[merged.length - 1].type === 'text') {
        merged[merged.length - 1].value += node.value;
      } else {
        merged.push({ ...node });
      }
    } else {
      merged.push(node);
    }
  }

  return merged;
}

/**
 * Render AST nodes into React elements
 */
function renderMathNodes(nodes, keyPrefix = 'm') {
  return nodes.map((node, idx) => {
    const k = `${keyPrefix}-${idx}`;
    if (node.type === 'text') {
      return <span key={k}>{node.value}</span>;
    }
    if (node.type === 'frac') {
      return (
        <span key={k} className="math-fraction">
          <span className="math-numerator">{renderMathNodes(node.numerator, `${k}-num`)}</span>
          <span className="math-denominator">{renderMathNodes(node.denominator, `${k}-den`)}</span>
        </span>
      );
    }
    if (node.type === 'sqrt') {
      return (
        <span key={k} className="math-sqrt">
          <span className="math-radical">&radic;</span>
          <span className="math-radicand">{renderMathNodes(node.radicand, `${k}-rad`)}</span>
        </span>
      );
    }
    if (node.type === 'script') {
      return (
        <span key={k} className="math-script-wrap">
          {node.base}
          {node.sub && <sub>{renderMathNodes(node.sub, `${k}-sub`)}</sub>}
          {node.sup && <sup>{renderMathNodes(node.sup, `${k}-sup`)}</sup>}
        </span>
      );
    }
    return null;
  });
}

/**
 * Render formatted math
 */
function renderMath(latexString, isBlock = false, key = 'math') {
  const nodes = parseMathNodes(latexString);
  const elements = renderMathNodes(nodes, key);

  if (isBlock) {
    return (
      <div key={key} className="math-display-block">
        {elements}
      </div>
    );
  }

  return (
    <span key={key} className="math-inline">
      {elements}
    </span>
  );
}

/**
 * Strict SVG Sanitizer & Validator
 * - Strips scripts, foreignObject, event attributes, javascript/data protocols, external URLs
 * - Preserves dimensions, viewBox, paths, circles, labels, gradients, markers, filters, text
 * - Validates XML structure with DOMParser (in browser)
 * - Returns { valid: boolean, sanitizedSvg: string, error?: string, rawCode: string }
 */
function sanitizeAndValidateSvg(rawInput) {
  if (!rawInput || typeof rawInput !== 'string') {
    return { valid: false, error: 'Empty diagram content', rawCode: '', sanitizedSvg: '' };
  }

  // 1. Unwrap from code blocks or markdown wrappers if needed
  let cleaned = rawInput.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-zA-Z0-9_:-]*\r?\n/, '').replace(/\r?\n```$/, '').trim();
  }

  // 2. Locate SVG opening and closing tags
  const svgStartIdx = cleaned.search(/<svg[\s>]/i);
  const svgEndIdx = cleaned.search(/<\/svg>/i);

  if (svgStartIdx === -1) {
    return {
      valid: false,
      error: 'Missing opening <svg> tag.',
      rawCode: cleaned,
      sanitizedSvg: ''
    };
  }

  if (svgEndIdx === -1) {
    return {
      valid: false,
      error: 'Incomplete SVG diagram (missing closing </svg> tag). The diagram was likely cut off during generation.',
      rawCode: cleaned,
      sanitizedSvg: ''
    };
  }

  // Slice exactly the SVG portion from <svg to </svg>
  const endOffset = cleaned.slice(svgEndIdx).indexOf('>') + 1;
  let svgContent = cleaned.slice(svgStartIdx, svgEndIdx + (endOffset || 6)).trim();

  // 3. Pre-sanitize strings: strip dangerous tags and script protocols
  svgContent = svgContent
    .replace(/<\?xml[\s\S]*?\?>/gi, '')
    .replace(/<!DOCTYPE[\s\S]*?>/gi, '')
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<script\b[^>]*\/>/gi, '')
    .replace(/<foreignObject\b[\s\S]*?<\/foreignObject>/gi, '')
    .replace(/<foreignObject\b[^>]*\/>/gi, '')
    .replace(/<(object|embed|iframe|meta|link|applet|form|input|button|audio|video)\b[\s\S]*?<\/\1>/gi, '')
    .replace(/<(object|embed|iframe|meta|link|applet|form|input|button|audio|video)\b[^>]*\/>/gi, '')
    // Remove all inline event handlers: onclick, onload, onerror, onmouseover, etc.
    .replace(/\s+on[a-zA-Z]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '')
    // Remove javascript:, vbscript:, and data:text/html URIs
    .replace(/(?:href|xlink:href)\s*=\s*(['"])\s*(?:javascript|vbscript|data:text\/html):.*?\1/gi, '')
    // Disallow external resource loading (http:// or https:// or //)
    .replace(/(?:href|xlink:href)\s*=\s*(['"])\s*(?:https?:)?\/\/.*?\1/gi, '$1#$1');

  // 4. Browser DOM-level validation and element whitelisting (when window.DOMParser exists)
  if (typeof window !== 'undefined' && typeof window.DOMParser !== 'undefined') {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgContent, 'image/svg+xml');

      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        return {
          valid: false,
          error: `Malformed XML syntax in diagram: ${parserError.textContent.slice(0, 120)}`,
          rawCode: svgContent,
          sanitizedSvg: ''
        };
      }

      const svgEl = doc.documentElement;
      if (!svgEl || svgEl.nodeName.toLowerCase() !== 'svg') {
        return {
          valid: false,
          error: 'Root element is not a valid <svg> element.',
          rawCode: svgContent,
          sanitizedSvg: ''
        };
      }

      // Safe SVG Elements Whitelist
      const ALLOWED_ELEMENTS = new Set([
        'svg', 'g', 'defs', 'lineargradient', 'radialgradient', 'stop',
        'marker', 'pattern', 'clippath', 'mask', 'filter', 'fedropshadow',
        'fegaussianblur', 'feoffset', 'femerge', 'femergenode', 'fecolormatrix',
        'fecomponenttransfer', 'fefunca', 'feblend',
        'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse',
        'text', 'tspan', 'textpath', 'use', 'title', 'desc', 'style'
      ]);

      const allElements = svgEl.querySelectorAll('*');
      for (let i = 0; i < allElements.length; i++) {
        const el = allElements[i];
        const tagName = el.nodeName.toLowerCase();
        if (!ALLOWED_ELEMENTS.has(tagName)) {
          el.remove();
          continue;
        }

        // Clean element attributes
        const attrs = Array.from(el.attributes);
        for (const attr of attrs) {
          const aName = attr.name.toLowerCase();
          const aVal = attr.value;

          // Strip any event handler
          if (aName.startsWith('on')) {
            el.removeAttribute(attr.name);
            continue;
          }

          // Strip unsafe or external hrefs
          if (aName === 'href' || aName === 'xlink:href' || aName === 'src') {
            const lowVal = aVal.trim().toLowerCase();
            if (
              lowVal.startsWith('javascript:') ||
              lowVal.startsWith('vbscript:') ||
              lowVal.startsWith('data:text/html') ||
              lowVal.startsWith('http://') ||
              lowVal.startsWith('https://') ||
              lowVal.startsWith('//')
            ) {
              el.removeAttribute(attr.name);
              continue;
            }
          }

          // Clean style attribute
          if (aName === 'style') {
            const lowStyle = aVal.toLowerCase();
            if (
              lowStyle.includes('javascript:') ||
              lowStyle.includes('expression(') ||
              lowStyle.includes('@import') ||
              lowStyle.includes('url(http')
            ) {
              el.removeAttribute('style');
            }
          }
        }

        // Sanitize <style> tag content
        if (tagName === 'style' && el.textContent) {
          let css = el.textContent;
          css = css.replace(/@import[\s\S]*?;/gi, '')
                   .replace(/expression\s*\([^)]*\)/gi, '')
                   .replace(/url\s*\(\s*(['"]?)\s*https?:\/\/[^)]*\1\s*\)/gi, 'none')
                   .replace(/javascript:/gi, '');
          el.textContent = css;
        }
      }

      // Ensure proper viewBox for responsive scaling
      if (!svgEl.hasAttribute('viewBox')) {
        const w = svgEl.getAttribute('width');
        const h = svgEl.getAttribute('height');
        const numW = parseFloat(w);
        const numH = parseFloat(h);
        if (!isNaN(numW) && !isNaN(numH) && numW > 0 && numH > 0) {
          svgEl.setAttribute('viewBox', `0 0 ${numW} ${numH}`);
        } else {
          svgEl.setAttribute('viewBox', '0 0 650 360');
        }
      }

      // Ensure standard xmlns namespace
      if (!svgEl.hasAttribute('xmlns')) {
        svgEl.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      }

      // Responsive sizing: full width within container while preserving viewBox aspect ratio
      svgEl.setAttribute('width', '100%');
      svgEl.setAttribute('height', 'auto');

      const serializer = new XMLSerializer();
      const finalSvg = serializer.serializeToString(svgEl);

      return {
        valid: true,
        sanitizedSvg: finalSvg,
        rawCode: svgContent
      };
    } catch (domErr) {
      return {
        valid: false,
        error: `Could not parse diagram XML: ${domErr.message}`,
        rawCode: svgContent,
        sanitizedSvg: ''
      };
    }
  }

  // Fallback for SSR / Node environment
  return {
    valid: true,
    sanitizedSvg: svgContent,
    rawCode: svgContent
  };
}

/**
 * Interactive SVG Diagram Card with Preview & Raw Code Tabs
 * Handles valid diagrams and incomplete/invalid diagram notices gracefully
 */
function SvgDiagramBlock({ svgContent, blockKey, onShowToast }) {
  const [viewMode, setViewMode] = useState('preview'); // 'preview' | 'code'
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const result = sanitizeAndValidateSvg(svgContent);

  const handleCopy = () => {
    if (navigator.clipboard) {
      const textToCopy = result.valid ? result.sanitizedSvg : (result.rawCode || svgContent);
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      onShowToast?.('SVG diagram markup copied to clipboard');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // If SVG is invalid or incomplete (Requirement 6)
  if (!result.valid) {
    return (
      <div key={blockKey} className="svg-diagram-card svg-diagram-notice-card">
        <div className="svg-diagram-header">
          <div className="svg-diagram-title" style={{ color: '#b45309' }}>
            <span style={{ fontSize: '15px' }}>⚠️</span>
            <span>Diagram Notice</span>
          </div>

          <div className="svg-diagram-actions">
            <button
              type="button"
              className="svg-tab-btn"
              onClick={() => setShowErrorDetails(!showErrorDetails)}
              title="Inspect received SVG code"
            >
              <IconCode size={12} />
              <span>{showErrorDetails ? 'Hide Code' : 'View Code'}</span>
            </button>

            <button
              type="button"
              className="svg-action-btn"
              onClick={handleCopy}
              title="Copy received SVG markup"
            >
              {copied ? (
                <>
                  <IconCheckCircle size={12} style={{ color: '#10B981' }} />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <IconCopy size={12} />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div style={{ padding: '14px 16px', backgroundColor: '#fffbeb', borderBottom: showErrorDetails ? '1px solid #fef3c7' : 'none' }}>
          <p style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: 600, color: '#92400e' }}>
            The diagram markup is incomplete or could not be rendered visually.
          </p>
          <p style={{ margin: 0, fontSize: '12px', color: '#b45309', lineHeight: 1.5 }}>
            {result.error || 'Missing closing tags or syntax issue.'} You can inspect the code below or ask the AI tutor to redraw the diagram.
          </p>
        </div>

        {showErrorDetails && (
          <pre
            style={{
              margin: 0,
              padding: '12px 14px',
              backgroundColor: '#16221c',
              color: '#dbe7df',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '12px',
              lineHeight: 1.5,
              overflowX: 'auto',
              whiteSpace: 'pre'
            }}
          >
            <code>{result.rawCode || svgContent}</code>
          </pre>
        )}
      </div>
    );
  }

  // Valid SVG Diagram (Requirements 1, 2, 3, 4, 5, 8)
  return (
    <div key={blockKey} className="svg-diagram-card">
      <div className="svg-diagram-header">
        <div className="svg-diagram-title">
          <span style={{ fontSize: '15px' }}>📐</span>
          <span>Engineering Diagram (SVG)</span>
        </div>

        <div className="svg-diagram-actions">
          <button
            type="button"
            className={`svg-tab-btn ${viewMode === 'preview' ? 'active' : ''}`}
            onClick={() => setViewMode('preview')}
            title="View graphical diagram"
          >
            <IconEye size={12} />
            <span>Diagram</span>
          </button>

          <button
            type="button"
            className={`svg-tab-btn ${viewMode === 'code' ? 'active' : ''}`}
            onClick={() => setViewMode('code')}
            title="View SVG source code"
          >
            <IconCode size={12} />
            <span>SVG Code</span>
          </button>

          <button
            type="button"
            className="svg-action-btn"
            onClick={handleCopy}
            title="Copy SVG markup to clipboard"
          >
            {copied ? (
              <>
                <IconCheckCircle size={12} style={{ color: '#10B981' }} />
                <span>Copied</span>
              </>
            ) : (
              <>
                <IconCopy size={12} />
                <span>Copy SVG</span>
              </>
            )}
          </button>
        </div>
      </div>

      {viewMode === 'preview' ? (
        <div
          className="svg-diagram-preview"
          // Safe: Strict sanitization via sanitizeAndValidateSvg ensures only whitelisted,
          // script-free, event-free, internal-only SVG nodes are rendered.
          dangerouslySetInnerHTML={{ __html: result.sanitizedSvg }}
        />
      ) : (
        <pre
          style={{
            margin: 0,
            padding: '12px 14px',
            backgroundColor: '#16221c',
            color: '#dbe7df',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '12px',
            lineHeight: 1.5,
            overflowX: 'auto',
            whiteSpace: 'pre'
          }}
        >
          <code>{result.sanitizedSvg}</code>
        </pre>
      )}
    </div>
  );
}

/**
 * Lightweight, zero-dependency Markdown & Rich Text Renderer
 * Supports: Headings, Bold, Italic, Code Blocks, Inline Code,
 * Interactive Checklists, Tables, Lists, Links, Blockquotes, HRs,
 * LaTeX Math ($...$ and $$...$$), and Sanitized SVG Diagrams.
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

  // 0. Quick check: Is the entire response a complete standalone SVG?
  const trimmedContent = content.trim();
  const unwrappedContent = trimmedContent.replace(/^```[a-zA-Z0-9_:-]*\r?\n/, '').replace(/\r?\n```$/, '').trim();
  if (
    /^(?:<\?xml[^>]*\?>\s*)?(?:<!--[\s\S]*?-->\s*)?<svg[\s>]/i.test(unwrappedContent) &&
    /<\/svg>\s*$/i.test(unwrappedContent)
  ) {
    return (
      <SvgDiagramBlock
        svgContent={unwrappedContent}
        blockKey="full-svg-response"
        onShowToast={onShowToast}
      />
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

  // Helper to parse inline styles: inline math, inline code, bold, italic, links
  const renderInline = (text) => {
    if (!text) return null;

    // Tokenize text into segments
    // Matches: `code`, $math$, **bold**, *italic*, [link](url)
    const regex = /(`[^`]+`|\$[^$\n]+\$|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
    const parts = text.split(regex);

    return parts.map((part, i) => {
      if (!part) return null;

      // Inline Math: $...$
      if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
        return renderMath(part.slice(1, -1), false, `im-${i}`);
      }

      // Inline code: `...`
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

      // Bold: **...**
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return (
          <strong key={i} style={{ color: 'var(--forest-950)', fontWeight: 700 }}>
            {part.slice(2, -2)}
          </strong>
        );
      }

      // Italic: *...*
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

  // Process blocks: Headings, Code Blocks, SVG Blocks, Math Blocks, Tables, Checklists, Lists, Blockquotes, Paragraphs
  const lines = content.split('\n');
  const elements = [];
  let lineIdx = 0;

  while (lineIdx < lines.length) {
    const line = lines[lineIdx];

    // 1. Code Block: ```lang
    if (line.trim().startsWith('```')) {
      const rawLang = line.trim().slice(3).trim();
      const lang = rawLang.toLowerCase();
      const codeLines = [];
      lineIdx++;
      while (lineIdx < lines.length && !lines[lineIdx].trim().startsWith('```')) {
        codeLines.push(lines[lineIdx]);
        lineIdx++;
      }
      lineIdx++; // consume closing ```

      const codeText = codeLines.join('\n');
      const blockKey = `code-${lineIdx}`;

      // Check if this is an SVG diagram (e.g. ```svg, ```xml, ```html, or code containing <svg>)
      const hasSvgOpen = /<svg[\s>]/i.test(codeText);
      const isSvgBlock = lang.includes('svg') || (hasSvgOpen && (codeText.includes('</svg>') || lang === 'xml' || lang === 'html' || lang === 'markup' || !lang));
      if (isSvgBlock) {
        elements.push(
          <SvgDiagramBlock
            key={blockKey}
            svgContent={codeText}
            blockKey={blockKey}
            onShowToast={onShowToast}
          />
        );
        continue;
      }

      const isPython = lang.includes('python') || lang === 'py';

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
              <span>{rawLang || 'code'}</span>
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

    // 2. Standalone Raw SVG block: starts with <svg or <?xml ... <svg
    const trimmedLine = line.trim();
    if (
      /<svg[\s>]/i.test(trimmedLine) ||
      (trimmedLine.startsWith('<?xml') && lineIdx + 1 < lines.length && /<svg[\s>]/i.test(lines[lineIdx + 1]))
    ) {
      // Check if there is text before <svg on this line
      const preSvgMatch = line.match(/^([\s\S]*?)(<svg[\s>][\s\S]*)$/i);
      if (preSvgMatch && preSvgMatch[1].trim()) {
        elements.push(
          <p key={`pre-svg-${lineIdx}`} style={{ margin: '8px 0', lineHeight: 1.6 }}>
            {renderInline(preSvgMatch[1].trim())}
          </p>
        );
      }

      const svgLines = [preSvgMatch ? preSvgMatch[2] : line];
      let foundEnd = /<\/svg>/i.test(line);
      lineIdx++;

      while (lineIdx < lines.length && !foundEnd) {
        const curLine = lines[lineIdx];
        svgLines.push(curLine);
        if (/<\/svg>/i.test(curLine)) {
          foundEnd = true;
        }
        lineIdx++;
      }

      const rawSvgText = svgLines.join('\n');
      const blockKey = `raw-svg-${lineIdx}`;
      elements.push(
        <SvgDiagramBlock
          key={blockKey}
          svgContent={rawSvgText}
          blockKey={blockKey}
          onShowToast={onShowToast}
        />
      );
      continue;
    }

    // 3. Display Math Block: $$ ... $$
    if (line.trim().startsWith('$$')) {
      if (line.trim().endsWith('$$') && line.trim().length > 4) {
        // Single-line $$math$$
        const mathContent = line.trim().slice(2, -2);
        elements.push(renderMath(mathContent, true, `dm-${lineIdx}`));
        lineIdx++;
        continue;
      } else {
        // Multiline $$
        const mathLines = [];
        const firstLine = line.trim().slice(2);
        if (firstLine.trim()) mathLines.push(firstLine);
        lineIdx++;
        while (lineIdx < lines.length && !lines[lineIdx].trim().endsWith('$$')) {
          mathLines.push(lines[lineIdx]);
          lineIdx++;
        }
        if (lineIdx < lines.length) {
          const lastLine = lines[lineIdx].trim().replace(/\$\$$/, '');
          if (lastLine.trim()) mathLines.push(lastLine);
          lineIdx++;
        }
        elements.push(renderMath(mathLines.join('\n'), true, `dm-${lineIdx}`));
        continue;
      }
    }

    // 4. Markdown Table: starts with | and next line has |---|
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

    // 5. Headings
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

    // 6. Horizontal Rule: ---
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

    // 7. Checklist item: - [ ] or - [x]
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

    // 8. Bullet List: - item or * item
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

    // 9. Numbered List: 1. item
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

    // 10. Blockquote: > text
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

    // 11. Blank line
    if (line.trim() === '') {
      lineIdx++;
      continue;
    }

    // 12. Regular paragraph
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
