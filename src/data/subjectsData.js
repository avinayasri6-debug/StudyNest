// Seven Confirmed Semester 1 Engineering Subjects
// IMPORTANT: Topics are provided as clearly labelled sample learning topics until the student configures their official university syllabus.

export const SAMPLE_SYLLABUS_DISCLAIMER =
  "Editable Sample Learning Topics · Organize and track your study progress until you upload your official university syllabus.";

export const SEMESTER_1_SUBJECTS = [
  {
    id: 'math101',
    code: 'MATH 101',
    title: 'Linear Algebra and Calculus',
    shortName: 'Linear Algebra',
    department: 'Mathematics & Computing',
    credits: 4,
    category: 'Core Engineering Mathematics',
    color: '#3B6E52',
    badgeText: 'Core Foundation',
    weeklyHours: '4 hrs/week',
    description:
      'Vector spaces, matrix decompositions, eigenvalues, multivariable calculus, and ordinary differential equations applied to physical engineering systems.',
    units: [
      {
        unitNumber: 1,
        unitTitle: 'Matrices and Linear Systems (Sample Unit)',
        topics: [
          { id: 'math-u1-t1', name: 'Rank of a Matrix and Echelon Forms' },
          { id: 'math-u1-t2', name: 'System of Linear Equations: Gauss Elimination' },
          { id: 'math-u1-t3', name: 'Gauss-Jordan Elimination & Matrix Inversion' },
          { id: 'math-u1-t4', name: 'Consistency and Solution Spaces' }
        ]
      },
      {
        unitNumber: 2,
        unitTitle: 'Eigenvalues and Diagonalization (Sample Unit)',
        topics: [
          { id: 'math-u2-t1', name: 'Characteristic Equations and Eigenvalues' },
          { id: 'math-u2-t2', name: 'Eigenvectors and Algebraic/Geometric Multiplicity' },
          { id: 'math-u2-t3', name: 'Cayley-Hamilton Theorem & Matrix Powers' },
          { id: 'math-u2-t4', name: 'Diagonalization of Symmetric Matrices' }
        ]
      },
      {
        unitNumber: 3,
        unitTitle: 'Differential Calculus of Several Variables (Sample Unit)',
        topics: [
          { id: 'math-u3-t1', name: 'Partial Derivatives and Total Differentials' },
          { id: 'math-u3-t2', name: 'Jacobians and Functional Dependence' },
          { id: 'math-u3-t3', name: 'Taylor Series for Functions of Two Variables' },
          { id: 'math-u3-t4', name: 'Maxima and Minima: Lagrange Multipliers' }
        ]
      },
      {
        unitNumber: 4,
        unitTitle: 'Integral Calculus and Applications (Sample Unit)',
        topics: [
          { id: 'math-u4-t1', name: 'Double Integrals in Cartesian and Polar Coordinates' },
          { id: 'math-u4-t2', name: 'Change of Order of Integration' },
          { id: 'math-u4-t3', name: 'Triple Integrals and Volume Calculations' },
          { id: 'math-u4-t4', name: 'Beta and Gamma Functions and Properties' }
        ]
      }
    ],
    importantQuestions: [
      {
        id: 'iq-math-1',
        question: 'State and prove the Cayley-Hamilton Theorem for a 2x2 matrix.',
        answer: 'Every square matrix satisfies its own characteristic equation: det(A - λI) = 0. Substituting A in place of λ yields the zero matrix: A² - tr(A)A + det(A)I = O.'
      },
      {
        id: 'iq-math-2',
        question: 'What are the conditions for a square matrix A to be diagonalizable?',
        answer: 'Matrix A of size n×n is diagonalizable if and only if it possesses n linearly independent eigenvectors. A symmetric real matrix is always orthogonally diagonalizable.'
      },
      {
        id: 'iq-math-3',
        question: 'Explain how Lagrange Multipliers are used to find constrained extrema.',
        answer: 'To find extrema of f(x, y) subject to g(x, y) = 0, form the auxiliary function L(x, y, λ) = f(x, y) - λg(x, y), and set partial derivatives ∇f = λ∇g and g(x, y) = 0.'
      }
    ],
    initialAssignments: [
      { id: 'asg-math-1', title: 'Problem Set 1: Gauss Elimination & Rank Calculations', dueDate: '2026-11-06', status: 'Pending' },
      { id: 'asg-math-2', title: 'Assignment 2: Diagonalization and Quadratic Forms', dueDate: '2026-11-18', status: 'Pending' }
    ]
  },
  {
    id: 'phy101',
    code: 'PHY 101',
    title: 'Engineering Physics',
    shortName: 'Physics',
    department: 'Applied Sciences',
    credits: 4,
    category: 'Basic Sciences',
    color: '#4B6B58',
    badgeText: 'Theory & Lab',
    weeklyHours: '4 hrs/week',
    description:
      'Principles of wave optics, quantum mechanics, laser resonators, optical fibers, and semiconductor devices for modern electronic and optical systems.',
    units: [
      {
        unitNumber: 1,
        unitTitle: 'Wave Optics & Interference (Sample Unit)',
        topics: [
          { id: 'phy-u1-t1', name: 'Coherence and Conditions for Sustainable Interference' },
          { id: 'phy-u1-t2', name: 'Interference in Thin Films (Reflected & Transmitted)' },
          { id: 'phy-u1-t3', name: 'Newton Rings: Experimental Setup and Wavelength Determination' },
          { id: 'phy-u1-t4', name: 'Diffraction: Fraunhofer Single Slit and Circular Aperture' }
        ]
      },
      {
        unitNumber: 2,
        unitTitle: 'Lasers and Optical Resonators (Sample Unit)',
        topics: [
          { id: 'phy-u2-t1', name: 'Spontaneous and Stimulated Emission: Einstein Coefficients' },
          { id: 'phy-u2-t2', name: 'Population Inversion and Pumping Mechanisms' },
          { id: 'phy-u2-t3', name: 'Ruby Laser Construction and Working Cycle' },
          { id: 'phy-u2-t4', name: 'Helium-Neon (He-Ne) Gas Laser and Engineering Applications' }
        ]
      },
      {
        unitNumber: 3,
        unitTitle: 'Fiber Optics & Telecommunication (Sample Unit)',
        topics: [
          { id: 'phy-u3-t1', name: 'Total Internal Reflection and Optical Waveguides' },
          { id: 'phy-u3-t2', name: 'Acceptance Angle and Numerical Aperture (NA) Derivation' },
          { id: 'phy-u3-t3', name: 'Step-Index vs Graded-Index Optical Fibers' },
          { id: 'phy-u3-t4', name: 'Attenuation and Dispersion Mechanisms in Fibers' }
        ]
      },
      {
        unitNumber: 4,
        unitTitle: 'Introductory Quantum Mechanics (Sample Unit)',
        topics: [
          { id: 'phy-u4-t1', name: 'De Broglie Hypothesis and Matter Waves' },
          { id: 'phy-u4-t2', name: 'Heisenberg Uncertainty Principle and Significance' },
          { id: 'phy-u4-t3', name: 'Time-Independent Schrödinger Wave Equation' },
          { id: 'phy-u4-t4', name: 'Particle Trapped in a 1D Infinite Potential Well' }
        ]
      }
    ],
    importantQuestions: [
      {
        id: 'iq-phy-1',
        question: 'Derive the expression for Numerical Aperture of a step-index optical fiber.',
        answer: 'NA = sin(θ_a) = √(n₁² - n₂²), where n₁ is core refractive index, n₂ is cladding refractive index, and θ_a is the acceptance angle in air.'
      },
      {
        id: 'iq-phy-2',
        question: 'Differentiate between Spontaneous and Stimulated Emission.',
        answer: 'Spontaneous emission occurs randomly without external photons, producing incoherent light. Stimulated emission is triggered by an incident photon of matching energy, producing coherent, monochromatic, and in-phase light.'
      },
      {
        id: 'iq-phy-3',
        question: 'Derive the energy eigenvalues for a particle in a 1D infinite potential well.',
        answer: 'E_n = (n² h²) / (8 m L²) where n = 1, 2, 3... demonstrating that energy inside a quantum confinement is quantized.'
      }
    ],
    initialAssignments: [
      { id: 'asg-phy-1', title: 'Lab Record: Newton Rings & Laser Diffraction Experiments', dueDate: '2026-11-09', status: 'Pending' },
      { id: 'asg-phy-2', title: 'Assignment 2: Fiber Optics Attenuation Calculations', dueDate: '2026-11-20', status: 'Pending' }
    ]
  },
  {
    id: 'cse101',
    code: 'CSE 101',
    title: 'Problem Solving and Programming in Python',
    shortName: 'Python Programming',
    department: 'Computer Science & Engineering',
    credits: 4,
    category: 'Computing Foundation',
    color: '#284E3A',
    badgeText: 'Python Academy Track',
    weeklyHours: '4 hrs/week + Lab',
    description:
      'Algorithmic thinking, control structures, functions, procedural modularity, data structures (lists, tuples, dicts, sets), file I/O, and introductory object-oriented design.',
    units: [
      {
        unitNumber: 1,
        unitTitle: 'Algorithmic Basics & Core Syntax (Sample Unit)',
        topics: [
          { id: 'cse-u1-t1', name: 'Algorithms, Pseudocode, and Flowchart Representations' },
          { id: 'cse-u1-t2', name: 'Python Interactive Shell and Script Execution' },
          { id: 'cse-u1-t3', name: 'Variables, Dynamic Typing, and Reserved Keywords' },
          { id: 'cse-u1-t4', name: 'Arithmetic, Relational, and Logical Operators' }
        ]
      },
      {
        unitNumber: 2,
        unitTitle: 'Control Flow and Functions (Sample Unit)',
        topics: [
          { id: 'cse-u2-t1', name: 'Conditional Decision Branches (if, elif, else)' },
          { id: 'cse-u2-t2', name: 'Iteration with while and for Loops' },
          { id: 'cse-u2-t3', name: 'Function Definitions, Scope, and Parameter Passing' },
          { id: 'cse-u2-t4', name: 'Recursive Functions and Stack Frame Trace' }
        ]
      },
      {
        unitNumber: 3,
        unitTitle: 'Compound Data Structures (Sample Unit)',
        topics: [
          { id: 'cse-u3-t1', name: 'Lists: Indexing, Slicing, and Built-in Methods' },
          { id: 'cse-u3-t2', name: 'Tuples and Immutability Semantics' },
          { id: 'cse-u3-t3', name: 'Dictionaries: Key-Value Pairs and Hash Maps' },
          { id: 'cse-u3-t4', name: 'Sets: Mathematical Set Operations & Uniqueness' }
        ]
      },
      {
        unitNumber: 4,
        unitTitle: 'Strings, File I/O & OOP (Sample Unit)',
        topics: [
          { id: 'cse-u4-t1', name: 'String Formatting, Methods, and Text Parsing' },
          { id: 'cse-u4-t2', name: 'Reading and Writing Text Files using Context Managers' },
          { id: 'cse-u4-t3', name: 'Exception Handling with try, except, finally' },
          { id: 'cse-u4-t4', name: 'Classes, Objects, Constructors (__init__), and Methods' }
        ]
      }
    ],
    importantQuestions: [
      {
        id: 'iq-cse-1',
        question: 'Explain the difference between mutable and immutable data types in Python.',
        answer: 'Mutable objects (lists, dictionaries, sets) can be modified in-place after creation without changing their memory ID. Immutable objects (integers, floats, strings, tuples) cannot be altered once instantiated; operations return a new object.'
      },
      {
        id: 'iq-cse-2',
        question: 'Write a recursive Python function to compute the factorial of a positive integer.',
        answer: 'def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)'
      },
      {
        id: 'iq-cse-3',
        question: 'Why is the "with open(...) as file:" construct preferred for file operations?',
        answer: 'The context manager ensures that the file descriptor is cleanly closed automatically upon exiting the block, even if an unexpected exception occurs.'
      }
    ],
    initialAssignments: [
      { id: 'asg-cse-1', title: 'Python Lab Assignment 1: Matrix Multiplication & Text Search', dueDate: '2026-11-05', status: 'Pending' },
      { id: 'asg-cse-2', title: 'Mini-Project: Student Grade Analyzer with File I/O', dueDate: '2026-11-22', status: 'Pending' }
    ]
  },
  {
    id: 'ece101',
    code: 'ECE 101',
    title: 'Fundamentals of Digital Electronics',
    shortName: 'Digital Electronics',
    department: 'Electronics & Communication',
    credits: 3,
    category: 'Core Engineering',
    color: '#52796F',
    badgeText: 'Hardware Foundation',
    weeklyHours: '3 hrs/week',
    description:
      'Binary number systems, Boolean algebra, logic minimization (K-maps), combinational logic (adders, multiplexers, decoders), and sequential circuits (latches, flip-flops).',
    units: [
      {
        unitNumber: 1,
        unitTitle: 'Number Systems & Boolean Algebra (Sample Unit)',
        topics: [
          { id: 'ece-u1-t1', name: 'Binary, Octal, Decimal, and Hexadecimal Conversions' },
          { id: 'ece-u1-t2', name: 'Signed Binary Representations: 1s and 2s Complement' },
          { id: 'ece-u1-t3', name: 'Fundamental Logic Gates and Universal Gates (NAND/NOR)' },
          { id: 'ece-u1-t4', name: 'Boolean Theorems and De Morgan Laws' }
        ]
      },
      {
        unitNumber: 2,
        unitTitle: 'Gate-Level Minimization (Sample Unit)',
        topics: [
          { id: 'ece-u2-t1', name: 'Standard Forms: Sum of Products (SOP) and POS' },
          { id: 'ece-u2-t2', name: 'Karnaugh Maps: 2, 3, and 4 Variables' },
          { id: 'ece-u2-t3', name: 'Don’t Care Conditions in K-Map Simplification' },
          { id: 'ece-u2-t4', name: 'Two-Level NAND and NOR Implementations' }
        ]
      },
      {
        unitNumber: 3,
        unitTitle: 'Combinational Logic Circuits (Sample Unit)',
        topics: [
          { id: 'ece-u3-t1', name: 'Half Adder, Full Adder, and Half/Full Subtractor' },
          { id: 'ece-u3-t2', name: '4-bit Binary Parallel Ripple Carry Adder' },
          { id: 'ece-u3-t3', name: 'Multiplexers (4:1, 8:1) and Demultiplexers' },
          { id: 'ece-u3-t4', name: 'Decoders (3:8), Encoders, and Priority Encoders' }
        ]
      },
      {
        unitNumber: 4,
        unitTitle: 'Sequential Logic & Flip-Flops (Sample Unit)',
        topics: [
          { id: 'ece-u4-t1', name: 'Latches vs Flip-Flops: Level vs Edge Triggering' },
          { id: 'ece-u4-t2', name: 'SR, D, JK, and T Flip-Flops and Truth Tables' },
          { id: 'ece-u4-t3', name: 'Race-Around Condition and Master-Slave JK Flip-Flop' },
          { id: 'ece-u4-t4', name: 'Introductory 3-bit Synchronous & Asynchronous Counters' }
        ]
      }
    ],
    importantQuestions: [
      {
        id: 'iq-ece-1',
        question: 'Why are NAND and NOR gates termed Universal Gates?',
        answer: 'Any arbitrary Boolean function or fundamental gate (AND, OR, NOT) can be synthesized exclusively using either only NAND gates or only NOR gates.'
      },
      {
        id: 'iq-ece-2',
        question: 'Explain the Race-Around condition in JK flip-flops and how Master-Slave resolves it.',
        answer: 'When J=1, K=1 and clock pulse width tp > propagation delay tg, the output toggles multiple times uncontrollably within a single clock pulse. The Master-Slave arrangement splits triggering between clock high and clock low edges, preventing multiple toggling.'
      },
      {
        id: 'iq-ece-3',
        question: 'Design a Full Adder using two Half Adders and an OR gate.',
        answer: 'Sum = A ⊕ B ⊕ Cin (from two XOR stages). Carry = (A · B) + ((A ⊕ B) · Cin) using two AND gates fed into an OR gate.'
      }
    ],
    initialAssignments: [
      { id: 'asg-ece-1', title: 'Problem Sheet 1: 4-Variable K-Map Minimization', dueDate: '2026-11-08', status: 'Pending' },
      { id: 'asg-ece-2', title: 'Lab Simulation: Full Adder & Multiplexer Design', dueDate: '2026-11-25', status: 'Pending' }
    ]
  },
  {
    id: 'eng103',
    code: 'ENG 103',
    title: 'Digital Skill Workshop',
    shortName: 'Digital Skills',
    department: 'Interdisciplinary Engineering',
    credits: 2,
    category: 'Practical Laboratory',
    color: '#658B6F',
    badgeText: 'Practical Lab',
    weeklyHours: '3 hrs/week Lab',
    description:
      'Essential developer toolchain: Git version control, command-line UNIX tools, Markdown documentation, cloud IDE workflows, collaborative software repositories.',
    units: [
      {
        unitNumber: 1,
        unitTitle: 'Command-Line Tools & Shell Environments (Sample Unit)',
        topics: [
          { id: 'eng103-u1-t1', name: 'UNIX/Linux Directory Hierarchy and Navigation' },
          { id: 'eng103-u1-t2', name: 'File Operations (cp, mv, rm, touch, mkdir)' },
          { id: 'eng103-u1-t3', name: 'Input/Output Redirection and Shell Pipelines' },
          { id: 'eng103-u1-t4', name: 'Permissions (chmod, chown) and Process Viewing' }
        ]
      },
      {
        unitNumber: 2,
        unitTitle: 'Version Control with Git (Sample Unit)',
        topics: [
          { id: 'eng103-u2-t1', name: 'Repository Initialization, Staging, and Commits' },
          { id: 'eng103-u2-t2', name: 'Branching, Switching, and Merge Workflows' },
          { id: 'eng103-u2-t3', name: 'Remote Repositories: Push, Pull, and Fetch' },
          { id: 'eng103-u2-t4', name: 'Merge Conflicts Resolution and Git Log History' }
        ]
      },
      {
        unitNumber: 3,
        unitTitle: 'Technical Documentation & Markdown (Sample Unit)',
        topics: [
          { id: 'eng103-u3-t1', name: 'Markdown Syntax: Headings, Code Blocks, and Tables' },
          { id: 'eng103-u3-t2', name: 'Structuring Open-Source README and Documentation' },
          { id: 'eng103-u3-t3', name: 'Static Documentation Tools and Diagram Embedding' },
          { id: 'eng103-u3-t4', name: 'Open Source Licensing & Code Collaboration Etiquette' }
        ]
      }
    ],
    importantQuestions: [
      {
        id: 'iq-ds-1',
        question: 'Explain the difference between "git merge" and "git rebase".',
        answer: 'Merge creates a new commit joining two histories together preserving original commit history. Rebase rewrites commit history by moving base branch commits onto the tip of another branch for a linear project timeline.'
      },
      {
        id: 'iq-ds-2',
        question: 'What is the purpose of the git staging area (index)?',
        answer: 'The staging area allows developers to selectively review, organize, and craft modular, atomic commits before permanently recording them into the repository history.'
      }
    ],
    initialAssignments: [
      { id: 'asg-ds-1', title: 'Workshop Task 1: Create a Clean Git Repository with Multi-Branch Workflow', dueDate: '2026-11-10', status: 'Pending' }
    ]
  },
  {
    id: 'eng104',
    code: 'ENG 104',
    title: 'Quantitative Aptitude and Reasoning',
    shortName: 'Aptitude & Reasoning',
    department: 'Analytical & Cognitive Skills',
    credits: 3,
    category: 'Analytical Foundation',
    color: '#416D54',
    badgeText: 'Competitive & Analytical',
    weeklyHours: '3 hrs/week',
    description:
      'Mental arithmetic, percentages, profit & loss, ratio & proportion, permutations & combinations, probability, data interpretation, and logical syllogisms.',
    units: [
      {
        unitNumber: 1,
        unitTitle: 'Arithmetic Foundations (Sample Unit)',
        topics: [
          { id: 'eng104-u1-t1', name: 'Number Systems, Divisibility Rules, and LCM/HCF' },
          { id: 'eng104-u1-t2', name: 'Percentages, Base Shifts, and Successive Percentage Changes' },
          { id: 'eng104-u1-t3', name: 'Profit, Loss, Discount, and Marked Price Equations' },
          { id: 'eng104-u1-t4', name: 'Ratios, Proportions, Mixtures, and Alligations' }
        ]
      },
      {
        unitNumber: 2,
        unitTitle: 'Time, Distance & Work Equations (Sample Unit)',
        topics: [
          { id: 'eng104-u2-t1', name: 'Time and Work: Unitary Work Efficiency Method' },
          { id: 'eng104-u2-t2', name: 'Pipes and Cisterns (Inlet & Outlet Rates)' },
          { id: 'eng104-u2-t3', name: 'Time, Speed, Distance, and Relative Speed in Trains' },
          { id: 'eng104-u2-t4', name: 'Boats, Streams, and Circular Track Races' }
        ]
      },
      {
        unitNumber: 3,
        unitTitle: 'Combinatorics & Logical Deduction (Sample Unit)',
        topics: [
          { id: 'eng104-u3-t1', name: 'Fundamental Counting Principle and Permutations' },
          { id: 'eng104-u3-t2', name: 'Combinations and Committee Selection Problems' },
          { id: 'eng104-u3-t3', name: 'Classical and Conditional Probability Models' },
          { id: 'eng104-u3-t4', name: 'Syllogisms, Venn Diagrams, and Data Interpretation' }
        ]
      }
    ],
    importantQuestions: [
      {
        id: 'iq-qa-1',
        question: 'If A can complete a work in 12 days and B in 16 days, how many days do they take working together?',
        answer: '1/Total = 1/12 + 1/16 = (4 + 3)/48 = 7/48. Total time = 48/7 = 6.86 days (6 days 20.5 hours).'
      },
      {
        id: 'iq-qa-2',
        question: 'Two trains running in opposite directions at 45 km/h and 54 km/h cross each other in 12 seconds. If length of first train is 150m, find length of second train.',
        answer: 'Relative speed = 45 + 54 = 99 km/h = 99 * (5/18) = 27.5 m/s. Total distance = 27.5 * 12 = 330 m. Length of second train = 330 - 150 = 180 meters.'
      }
    ],
    initialAssignments: [
      { id: 'asg-qa-1', title: 'Speed Drill Exercise: 25 Timed Work & Percentage Problems', dueDate: '2026-11-12', status: 'Pending' }
    ]
  },
  {
    id: 'hum101',
    code: 'HUM 101',
    title: 'English for Technical Communication',
    shortName: 'Technical English',
    department: 'Humanities & Social Sciences',
    credits: 2,
    category: 'Professional Communication',
    color: '#5C7F67',
    badgeText: 'Professional Skills',
    weeklyHours: '2 hrs/week',
    description:
      'Engineering report writing, formal technical presentations, executive summarization, research paper structure, professional correspondence, and group discussion etiquette.',
    units: [
      {
        unitNumber: 1,
        unitTitle: 'Technical Writing Architecture (Sample Unit)',
        topics: [
          { id: 'hum-u1-t1', name: 'Structure of Technical Documents: Abstract, Intro, Results' },
          { id: 'hum-u1-t2', name: 'Clarity, Conciseness, and Eliminating Engineering Jargon' },
          { id: 'hum-u1-t3', name: 'Passive vs Active Voice in Experimental Manuscripts' },
          { id: 'hum-u1-t4', name: 'Executive Summaries and Technical Proposal Design' }
        ]
      },
      {
        unitNumber: 2,
        unitTitle: 'Professional Presentation & Workplace Skills (Sample Unit)',
        topics: [
          { id: 'hum-u2-t1', name: 'Engineering Project Pitching & Slide Architecture' },
          { id: 'hum-u2-t2', name: 'Formal Email Correspondence and Workplace Etiquette' },
          { id: 'hum-u2-t3', name: 'Academic Integrity, Citation Ethics, and Plagiarism Avoidance' },
          { id: 'hum-u2-t4', name: 'Group Discussion Strategies and Active Listening Dynamics' }
        ]
      }
    ],
    importantQuestions: [
      {
        id: 'iq-hum-1',
        question: 'What are the essential components of an effective Executive Summary in an engineering report?',
        answer: '1. Problem statement & objectives. 2. Methodology & engineering approach. 3. Key findings & measured results. 4. Concrete recommendations and conclusions.'
      },
      {
        id: 'iq-hum-2',
        question: 'Why is precise citation critical in engineering and academic technical papers?',
        answer: 'It attributes intellectual property, allows peers to replicate and verify claims, upholds engineering ethics, and shields projects from copyright and plagiarism disputes.'
      }
    ],
    initialAssignments: [
      { id: 'asg-hum-1', title: 'Writing Task 1: Draft Executive Summary for a Machine Learning Project', dueDate: '2026-11-15', status: 'Pending' }
    ]
  }
];

export const TOTAL_SEMESTER_CREDITS = 22;

export function getAllSubjectTopics(subject) {
  if (!subject || !subject.units) return [];
  const topics = [];
  subject.units.forEach((u) => {
    if (u.topics) {
      u.topics.forEach((t) => {
        topics.push({ ...t, unitNumber: u.unitNumber, unitTitle: u.unitTitle });
      });
    }
  });
  return topics;
}
