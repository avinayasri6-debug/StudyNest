/**
 * Safe, ESM-compatible Prism Syntax Highlighting Helper
 * Avoids global ReferenceError during production module loading.
 */
import Prism from 'prismjs';

// Ensure Prism is attached to window in browser environments
if (typeof window !== 'undefined' && !window.Prism) {
  window.Prism = Prism;
}

// Guarantee Python language grammar is loaded on Prism without bare script imports
if (Prism && Prism.languages && !Prism.languages.python) {
  Prism.languages.python = {
    comment: {
      pattern: /(^|[^\\])#.*/,
      lookbehind: true,
      greedy: true
    },
    'string-interpolation': {
      pattern: /(?:f|fr|rf)(?:("""|''')[\s\S]*?\1|("|')(?:\\.|(?!\2)[^\\\r\n])*\2)/i,
      greedy: true,
      inside: {
        interpolation: {
          pattern: /((?:^|[^{])(?:\{\{)*)\{(?!\{)(?:[^{}]|\{(?!\{)(?:[^{}]|\{(?!\{)(?:[^{}])+\})+\})+\}/,
          lookbehind: true,
          inside: {
            'format-spec': {
              pattern: /(:)[^:(){}]+(?=\}$)/,
              lookbehind: true
            },
            'conversion-option': {
              pattern: /![sra](?=[:}]$)/,
              alias: 'punctuation'
            },
            rest: null
          }
        },
        string: /[\s\S]+/
      }
    },
    'triple-quoted-string': {
      pattern: /(?:[rub]|br|rb)?("""|''')[\s\S]*?\1/i,
      greedy: true,
      alias: 'string'
    },
    string: {
      pattern: /(?:[rub]|br|rb)?("|')(?:\\.|(?!\1)[^\\\r\n])*\1/i,
      greedy: true
    },
    function: {
      pattern: /((?:^|\s)def[ \t]+)[a-zA-Z_]\w*(?=\s*\()/g,
      lookbehind: true
    },
    'class-name': {
      pattern: /(\bclass\s+)\w+/i,
      lookbehind: true
    },
    decorator: {
      pattern: /(^[\t ]*)@\w+(?:\.\w+)*/m,
      lookbehind: true,
      alias: ['annotation', 'punctuation'],
      inside: {
        punctuation: /\./
      }
    },
    keyword: /\b(?:_(?=\s*:)|and|as|assert|async|await|break|case|class|continue|def|del|elif|else|except|exec|finally|for|from|global|if|import|in|is|lambda|match|nonlocal|not|or|pass|print|raise|return|try|while|with|yield)\b/,
    builtin: /\b(?:__import__|abs|all|any|apply|ascii|basestring|bin|bool|buffer|bytearray|bytes|callable|chr|classmethod|cmp|coerce|compile|complex|delattr|dict|dir|divmod|enumerate|eval|execfile|file|filter|float|format|frozenset|getattr|globals|hasattr|hash|help|hex|id|input|int|intern|isinstance|issubclass|iter|len|list|locals|long|map|max|memoryview|min|next|object|oct|open|ord|pow|property|range|raw_input|reduce|reload|repr|reversed|round|set|setattr|slice|sorted|staticmethod|str|sum|super|tuple|type|unichr|unicode|vars|xrange|zip)\b/,
    boolean: /\b(?:False|None|True)\b/,
    number: /\b0(?:b(?:_?[01])+|o(?:_?[0-7])+|x(?:_?[a-f0-9])+)\b|(?:\b\d+(?:_\d+)*(?:\.(?:\d+(?:_\d+)*)?)?|\B\.\d+(?:_\d+)*)(?:e[+-]?\d+(?:_\d+)*)?j?(?!\w)/i,
    operator: /[-+%=]=?|!=|:=|\*\*?=?|\/\/?=?|<[<=>]?|>[=>]?|[&|^~]/,
    punctuation: /[{}[\];(),.:]/
  };

  if (Prism.languages.python['string-interpolation']?.inside?.interpolation?.inside) {
    Prism.languages.python['string-interpolation'].inside.interpolation.inside.rest = Prism.languages.python;
  }
  Prism.languages.py = Prism.languages.python;
}

/**
 * Robust syntax highlighting helper for Python code
 * Falls back cleanly to HTML escaping if highlighting fails
 */
export function highlightPython(code) {
  const safeCode = code || '# Write Python code here';
  if (!Prism || !Prism.highlight || !Prism.languages?.python) {
    return safeCode
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  try {
    return Prism.highlight(safeCode, Prism.languages.python, 'python');
  } catch (err) {
    console.warn('[StudyNest] Syntax highlight fallback:', err);
    return safeCode
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}

export { Prism };
export default Prism;

