/**
 * Curated Engineering Prompts & Curriculum Starters for StudyNest AI Assistant
 * Covers all 7 Confirmed Semester 1 Subjects
 */

export const SUBJECT_STARTER_PROMPTS = {
  math101: [
    {
      title: 'Eigenvalues & Invariance',
      prompt: 'Explain eigenvalues and eigenvectors intuitively. What is the physical meaning of Av = λv and how do we calculate characteristic roots?',
      action: 'concept'
    },
    {
      title: 'Gauss-Jordan Elimination',
      prompt: 'Step-by-step procedure to invert a 3x3 matrix using Gauss-Jordan row reduction. Include consistency checks.',
      action: 'numerical'
    },
    {
      title: 'Double Integrals in Polar Form',
      prompt: 'When and why do we convert double integrals from Cartesian to polar coordinates? Explain the Jacobian r dr dθ factor.',
      action: 'concept'
    },
    {
      title: 'Lagrange Multipliers Practice',
      prompt: 'Generate 2 exam-style problems with step-by-step solutions for finding extrema of multivariable functions using Lagrange Multipliers.',
      action: 'questions'
    }
  ],
  phy102: [
    {
      title: 'Quantum Wave Function & Probability',
      prompt: 'Explain the physical significance of the wave function Ψ and Born’s probability density |Ψ|² in quantum mechanics.',
      action: 'concept'
    },
    {
      title: 'Hall Effect & Carrier Concentration',
      prompt: 'Derive the Hall Voltage formula and explain how the Hall Effect determines charge carrier concentration and type in semiconductors.',
      action: 'concept'
    },
    {
      title: 'Numerical Aperture in Optical Fibers',
      prompt: 'Solve a numerical problem: Calculate the Numerical Aperture and Acceptance Angle for a fiber with core index n1 = 1.55 and cladding index n2 = 1.48.',
      action: 'numerical'
    },
    {
      title: 'Stimulated Emission & Lasers',
      prompt: 'Summarize the three Einstein coefficients (absorption, spontaneous emission, stimulated emission) and population inversion in Ruby lasers.',
      action: 'summary'
    }
  ],
  cs103: [
    {
      title: 'Explain Python Code Line-by-Line',
      prompt: 'Explain how recursion works in Python with a clean Fibonacci or Binary Search example. Walk through the call stack line-by-line.',
      action: 'python'
    },
    {
      title: 'Debugging Common Python Traps',
      prompt: 'What are the top 5 common errors first-year engineering students make in Python (mutating lists during iteration, mutable default arguments, off-by-one errors)?',
      action: 'python'
    },
    {
      title: 'List vs Dict Performance',
      prompt: 'Explain the difference in time complexity between looking up an item in a Python List vs a Python Dictionary (Hash Table). Include Big-O.',
      action: 'concept'
    },
    {
      title: 'Practice Coding Challenge',
      prompt: 'Generate a beginner-friendly coding challenge involving Python string manipulation and dictionaries, complete with test cases and solution.',
      action: 'questions'
    }
  ],
  ee104: [
    {
      title: 'K-Map Simplification Method',
      prompt: 'Explain how to simplify a 4-variable Boolean function using a Karnaugh Map. How do grouping rules prevent redundant logic gates?',
      action: 'concept'
    },
    {
      title: 'Universal NAND Logic Gate',
      prompt: 'Show step-by-step how to construct AND, OR, and XOR gates using only 2-input NAND gates with truth tables.',
      action: 'numerical'
    },
    {
      title: 'Flip-Flops: SR to JK Transition',
      prompt: 'Explain the race-around condition in an SR Flip-Flop and how the Master-Slave JK Flip-Flop resolves it.',
      action: 'concept'
    },
    {
      title: 'Multiplexer 4-to-1 Design',
      prompt: 'Provide a complete design and truth table for a 4-to-1 Multiplexer using basic logic gates.',
      action: 'summary'
    }
  ],
  ds105: [
    {
      title: 'Git Branching & Merge Conflicts',
      prompt: 'Explain the Git workflow: branching, staging, committing, and how to resolve a merge conflict step-by-step.',
      action: 'concept'
    },
    {
      title: 'Essential Linux CLI Utilities',
      prompt: 'Summarize the top 10 Linux terminal commands every Computer Science engineer must master (grep, find, chmod, tar, ssh, pipes).',
      action: 'summary'
    },
    {
      title: 'Writing Bash Automation Scripts',
      prompt: 'Show how to write a simple Bash shell script that automates backing up files, checks disk usage, and logs timestamps.',
      action: 'python'
    },
    {
      title: 'Markdown & Technical Docs',
      prompt: 'How to write professional software README documentation using GitHub-flavored Markdown. Give a template.',
      action: 'concept'
    }
  ],
  qa106: [
    {
      title: 'Time & Work: LCM Shortcut Method',
      prompt: 'Explain the LCM method for solving Time and Work problems. Provide 2 placement exam problems with step-by-step solutions.',
      action: 'numerical'
    },
    {
      title: 'Relative Speed & Trains',
      prompt: 'Provide shortcut techniques for solving train crossing platform and relative speed problems in Quantitative Aptitude.',
      action: 'numerical'
    },
    {
      title: 'Permutations vs Combinations',
      prompt: 'How do you instantly determine whether an aptitude problem requires Permutations (Order matters) or Combinations (Selection only)?',
      action: 'concept'
    },
    {
      title: 'Syllogisms & Logical Deductions',
      prompt: 'Explain Venn diagram methods to solve 3-statement Syllogisms without falling into distribution traps.',
      action: 'questions'
    }
  ],
  eng107: [
    {
      title: 'Formal Engineering Email Etiquette',
      prompt: 'Write a model formal email to a university professor requesting a recommendation letter or project supervision. Breakdown the tone and structure.',
      action: 'concept'
    },
    {
      title: 'Technical Abstract Writing',
      prompt: 'What are the 4 essential components of an engineering research paper abstract? Provide an example.',
      action: 'summary'
    },
    {
      title: 'Active vs Passive Voice in Reports',
      prompt: 'When should an engineer use Active Voice vs Passive Voice in technical laboratory reports and research papers?',
      action: 'concept'
    },
    {
      title: 'Common Grammatical Traps',
      prompt: 'Summarize 5 common grammatical and vocabulary errors in technical communication (e.g. affect vs effect, complement vs compliment, misplaced modifiers).',
      action: 'summary'
    }
  ]
};

export const QUICK_ACTIONS = [
  {
    id: 'concept',
    label: 'Explain a Concept',
    icon: '💡',
    desc: 'Intuitive analogy, physical definition & core formula',
    promptPrefix: 'Explain the concept of'
  },
  {
    id: 'numerical',
    label: 'Solve a Numerical',
    icon: '🔢',
    desc: 'Given data, formula substitution & final units',
    promptPrefix: 'Guide me step-by-step through solving a numerical problem on'
  },
  {
    id: 'questions',
    label: 'Practice Questions',
    icon: '📝',
    desc: '3 progressive exam-style questions with full solutions',
    promptPrefix: 'Generate 3 progressive practice questions with full solutions on'
  },
  {
    id: 'summary',
    label: 'Summarize Topic',
    icon: '📋',
    desc: 'Revision cheat sheet, key formulas & pitfalls',
    promptPrefix: 'Provide a concise revision summary and key formulas for'
  },
  {
    id: 'realworld',
    label: 'Real-World Examples',
    icon: '🌍',
    desc: 'Modern industry applications in AI, aerospace & robotics',
    promptPrefix: 'Give 3 real-world engineering and industry applications of'
  },
  {
    id: 'python',
    label: 'Explain Python Code',
    icon: '🐍',
    desc: 'Line-by-line breakdown, debugging & practice lab link',
    promptPrefix: 'Explain the Python code and logic for'
  }
];

export const EXPLANATION_MODES = [
  {
    id: 'beginner',
    label: 'Beginner',
    icon: '🌱',
    tagline: 'Analogies & simple intuition',
    tooltip: 'Explains as if teaching someone encountering this topic for the first time.'
  },
  {
    id: 'intermediate',
    label: 'Intermediate',
    icon: '⚖️',
    tagline: 'Formulas & engineering rigor',
    tooltip: 'Standard undergraduate engineering depth with mathematical precision and examples.'
  },
  {
    id: 'advanced',
    label: 'Advanced',
    icon: '🚀',
    tagline: 'Deep theory & complexity',
    tooltip: 'Deeper technical analysis, mathematical proofs, Big-O complexity, and edge cases.'
  }
];

