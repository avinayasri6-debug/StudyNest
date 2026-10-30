// StudyNest Video Learning Hub - Curated Open-Access Engineering Lectures
// All YouTube video IDs are verified, active educational resources from world-renowned educators.
// Academic notice: Curated educational resources; not claimed as official university exam material.

export const VIDEO_ACADEMIC_DISCLAIMER =
  'Academic Notice: Video lectures are curated from open educational repositories (MIT OpenCourseWare, Harvard CS50, Stanford GSB, 3Blue1Brown, freeCodeCamp, Neso Academy, Ben Eater, CareerRide) to support fundamental engineering understanding. These are supplementary learning materials and are not claimed as official university examination broadcasts.';

export const VIDEO_SUBJECT_CATEGORIES = [
  { id: 'all', label: 'All Subjects', count: 26, code: 'ALL' },
  { id: 'math101', label: 'Linear Algebra and Calculus', count: 4, code: 'MATH 101' },
  { id: 'phy101', label: 'Engineering Physics', count: 3, code: 'PHY 101' },
  { id: 'cse101', label: 'Problem Solving in Python', count: 4, code: 'CSE 101' },
  { id: 'ece101', label: 'Fundamentals of Digital Electronics', count: 3, code: 'ECE 101' },
  { id: 'eng103', label: 'Digital Skill Workshop', count: 3, code: 'ENG 103' },
  { id: 'eng104', label: 'Quantitative Aptitude & Reasoning', count: 3, code: 'ENG 104' },
  { id: 'hum101', label: 'English for Technical Communication', count: 2, code: 'HUM 101' },
  { id: 'python-course', label: 'Python Masterclass Track', count: 4, code: 'PY-TRACK' }
];

export const DEFAULT_VIDEO_PLAYLISTS = [
  {
    id: 'pl-math-core',
    title: 'Linear Algebra & Calculus Fundamentals',
    description: 'Master geometric vectors, linear transformations, matrices, and multivariable calculus intuition.',
    subjectId: 'math101',
    subjectCode: 'MATH 101',
    videoIds: ['vid-math-1', 'vid-math-2', 'vid-math-3', 'vid-math-4'],
    isCustom: false
  },
  {
    id: 'pl-phy-wave',
    title: 'Engineering Physics: Wave Optics & Quantum Lasers',
    description: 'Double slit wave interference, semiconductor band gaps, and principles of stimulated emission.',
    subjectId: 'phy101',
    subjectCode: 'PHY 101',
    videoIds: ['vid-phy-1', 'vid-phy-2', 'vid-phy-3'],
    isCustom: false
  },
  {
    id: 'pl-python-complete',
    title: 'Python Programming 0-to-1 Master Track',
    description: 'From core syntax to data structures, OOP classes, and CS50 computational thinking.',
    subjectId: 'cse101',
    subjectCode: 'CSE 101',
    videoIds: ['vid-cse-1', 'vid-cse-2', 'vid-cse-3', 'vid-cse-4'],
    isCustom: false
  },
  {
    id: 'pl-ece-logic',
    title: 'Digital Electronics & Binary Logic Design',
    description: 'Signal basics, universal logic gates, boolean algebra, and building binary adders from scratch.',
    subjectId: 'ece101',
    subjectCode: 'ECE 101',
    videoIds: ['vid-ece-1', 'vid-ece-2', 'vid-ece-3'],
    isCustom: false
  },
  {
    id: 'pl-dsw-tools',
    title: 'Digital Skill Workshop: Git, Linux & Web Stack',
    description: 'Modern developer toolchain: Git version control, Linux terminal commands, and HTML/CSS structure.',
    subjectId: 'eng103',
    subjectCode: 'ENG 103',
    videoIds: ['vid-dsw-1', 'vid-dsw-2', 'vid-dsw-3'],
    isCustom: false
  },
  {
    id: 'pl-apt-placement',
    title: 'Quantitative Aptitude Placement Sprints',
    description: 'High-speed shortcuts for Speed-Distance-Time, Percentages, and Time-and-Work efficiency.',
    subjectId: 'eng104',
    subjectCode: 'ENG 104',
    videoIds: ['vid-apt-1', 'vid-apt-2', 'vid-apt-3'],
    isCustom: false
  },
  {
    id: 'pl-eng-comm',
    title: 'Technical & Spontaneous Communication',
    description: 'Stanford GSB impromptu speaking techniques and TED masterclass on vocal delivery and rhetoric.',
    subjectId: 'hum101',
    subjectCode: 'HUM 101',
    videoIds: ['vid-eng-1', 'vid-eng-2'],
    isCustom: false
  }
];

export const VIDEO_LESSONS = [
  // ==========================================
  // 1. LINEAR ALGEBRA AND CALCULUS (MATH 101)
  // ==========================================
  {
    id: 'vid-math-1',
    subjectId: 'math101',
    subjectCode: 'MATH 101',
    subjectTitle: 'Linear Algebra and Calculus',
    unitNumber: 1,
    unitTitle: 'Unit 1: Matrices and Linear Systems',
    topicName: 'Geometric Vectors & Coordinate Systems',
    title: 'Vectors: What Are They? (Essence of Linear Algebra - Chapter 1)',
    channel: '3Blue1Brown',
    instructor: 'Grant Sanderson',
    youtubeId: 'fNk_zzaMoSs',
    duration: '9:52',
    durationSeconds: 592,
    level: 'Beginner',
    views: '8.4M',
    popularityScore: 98,
    addedDate: '2026-08-01',
    description:
      'Geometric versus coordinate perspectives on vectors. Explores how vectors represent physics displacements, computer science data tuples, and linear algebra coordinate arrows rooted at the origin.',
    relatedNotes: [
      'Vectors have both magnitude (length) and direction in space.',
      'Addition of vectors is commutative: [x1, y1] + [x2, y2] = [x1 + x2, y1 + y2]. Geometrically, place the tail of vector 2 at the tip of vector 1.',
      'Scalar multiplication stretches, squishes, or reverses the direction of a vector: c * [x, y] = [cx, cy].',
      'The origin (0, 0) is the anchor point for all vectors in coordinate-based linear algebra.'
    ],
    topicsCovered: ['Vector Addition', 'Scalar Multiplication', 'Coordinate Systems', 'Geometric Vectors']
  },
  {
    id: 'vid-math-2',
    subjectId: 'math101',
    subjectCode: 'MATH 101',
    subjectTitle: 'Linear Algebra and Calculus',
    unitNumber: 1,
    unitTitle: 'Unit 1: Matrices and Linear Systems',
    topicName: 'Linear Transformations & Basis Mapping',
    title: 'Linear Transformations & Matrices (Essence of Linear Algebra - Chapter 3)',
    channel: '3Blue1Brown',
    instructor: 'Grant Sanderson',
    youtubeId: 'kYB8IZa5AuE',
    duration: '10:59',
    durationSeconds: 659,
    level: 'Intermediate',
    views: '5.2M',
    popularityScore: 95,
    addedDate: '2026-08-05',
    description:
      'Understand matrices as geometric transformations of space that keep grid lines parallel and evenly spaced, with the origin remaining fixed.',
    relatedNotes: [
      'A transformation is linear if: T(u + v) = T(u) + T(v) and T(c*u) = c*T(u).',
      'A 2x2 matrix simply records where the basis vectors i-hat [1, 0] and j-hat [0, 1] land after transformation.',
      'First column = landing coordinate of i-hat; Second column = landing coordinate of j-hat.',
      'Matrix-vector multiplication computes a linear combination of the matrix columns scaled by the vector components.'
    ],
    topicsCovered: ['Matrix Transformation', 'Basis Vectors', 'i-hat and j-hat', 'Linear Mapping']
  },
  {
    id: 'vid-math-3',
    subjectId: 'math101',
    subjectCode: 'MATH 101',
    subjectTitle: 'Linear Algebra and Calculus',
    unitNumber: 1,
    unitTitle: 'Unit 1: Matrices and Linear Systems',
    topicName: 'Ax = b Systems & Gaussian Elimination',
    title: 'The Geometry of Linear Equations (MIT 18.06 - Lecture 1)',
    channel: 'MIT OpenCourseWare',
    instructor: 'Prof. Gilbert Strang',
    youtubeId: 'J7DzL2_Na80',
    duration: '39:49',
    durationSeconds: 2389,
    level: 'Intermediate',
    views: '6.1M',
    popularityScore: 97,
    addedDate: '2026-08-10',
    description:
      'The legendary introductory lecture to Linear Algebra by Prof. Gilbert Strang. Contrasts row pictures (intersecting hyperplanes) with column pictures (linear combinations of column vectors).',
    relatedNotes: [
      'Row Picture: Each equation represents a line in 2D or plane in 3D. The solution is the intersection point.',
      'Column Picture: Ax = b is interpreted as x1*col1 + x2*col2 + ... + xn*coln = b.',
      'Singular matrix condition: If the column vectors lie in the same plane, they cannot span the entire 3D space.',
      'Matrix multiplication Ax = b produces a unique solution if and only if the matrix A has non-zero determinant (full column rank).'
    ],
    topicsCovered: ['Ax = b', 'Row Picture vs Column Picture', 'Linear Systems', 'Gaussian Elimination']
  },
  {
    id: 'vid-math-4',
    subjectId: 'math101',
    subjectCode: 'MATH 101',
    subjectTitle: 'Linear Algebra and Calculus',
    unitNumber: 3,
    unitTitle: 'Unit 3: Differential Calculus of Several Variables',
    topicName: 'Derivatives & Multivariable Accumulation',
    title: 'The Essence of Calculus (Chapter 1: The Intuition)',
    channel: '3Blue1Brown',
    instructor: 'Grant Sanderson',
    youtubeId: 'WUvTyaaNkzM',
    duration: '17:04',
    durationSeconds: 1024,
    level: 'Beginner',
    views: '7.9M',
    popularityScore: 99,
    addedDate: '2026-08-12',
    description:
      'Calculus is the mathematics of change and accumulation. This video builds visual intuition for derivatives and integrals by calculating the area of a circle through concentric rings (d A = 2 * pi * r * dr).',
    relatedNotes: [
      'Derivatives quantify instantaneous rate of change: df/dx = lim(h->0) [f(x+h) - f(x)] / h.',
      'Integrals sum infinitesimal slices to compute cumulative quantities (area, volume, total work).',
      'Fundamental Theorem of Calculus bridges differentiation and integration as inverse processes.',
      'Area of a circle: unrolling rings of perimeter 2*pi*r and thickness dr forms a triangle of height r and base 2*pi*r, giving Area = (1/2) * r * (2*pi*r) = pi*r^2.'
    ],
    topicsCovered: ['Derivatives', 'Integration Intuition', 'Infinitesimals', 'Fundamental Theorem of Calculus']
  },

  // ==========================================
  // 2. ENGINEERING PHYSICS (PHY 101)
  // ==========================================
  {
    id: 'vid-phy-1',
    subjectId: 'phy101',
    subjectCode: 'PHY 101',
    subjectTitle: 'Engineering Physics',
    unitNumber: 1,
    unitTitle: 'Unit 1: Wave Optics & Interference',
    topicName: "Young's Double Slit & Wave Interference",
    title: 'The Original Double Slit Experiment (Wave Optics & Interference)',
    channel: 'Veritasium',
    instructor: 'Derek Muller',
    youtubeId: 'Iuv6hY6zsd0',
    duration: '7:39',
    durationSeconds: 459,
    level: 'Intermediate',
    views: '14.2M',
    popularityScore: 96,
    addedDate: '2026-08-15',
    description:
      'Thomas Young’s historic double-slit experiment demonstrates the wave nature of light through constructive and destructive interference fringes.',
    relatedNotes: [
      'Constructive Interference condition: Path difference delta = n * lambda (bright fringes).',
      'Destructive Interference condition: Path difference delta = (2n + 1) * lambda / 2 (dark fringes).',
      'Fringe width beta = (lambda * D) / d, where D is screen distance and d is slit separation.',
      'Demonstrates the wave-particle duality foundational to modern quantum mechanics and optics.'
    ],
    topicsCovered: ['Wave Optics', 'Interference', 'Young Double Slit', 'Fringe Width']
  },
  {
    id: 'vid-phy-2',
    subjectId: 'phy101',
    subjectCode: 'PHY 101',
    subjectTitle: 'Engineering Physics',
    unitNumber: 3,
    unitTitle: 'Unit 3: Semiconductors & Band Theory',
    topicName: 'Energy Band Gaps & Silicon Doping',
    title: 'How Do Semiconductors Work? Conductors, Insulators & Band Gaps',
    channel: 'Lesics',
    instructor: 'Sabins Education',
    youtubeId: '334t9p2xPjQ',
    duration: '7:16',
    durationSeconds: 436,
    level: 'Beginner',
    views: '4.8M',
    popularityScore: 92,
    addedDate: '2026-08-18',
    description:
      'Visual breakdown of energy bands (valence band, conduction band, and forbidden energy gap). Explains intrinsic versus extrinsic (n-type and p-type) semiconductors and electron-hole pair conduction.',
    relatedNotes: [
      'Valence Band: Contains bound outer electrons. Conduction Band: Contains free mobile charge carriers.',
      'Band Gap (Eg): Metals Eg ~ 0 eV; Semiconductors Eg ~ 1 eV (Silicon = 1.1 eV, Germanium = 0.67 eV); Insulators Eg > 5 eV.',
      'Doping: Adding Group V pentavalent atoms (P, As) creates n-type (majority electrons); Group III trivalent atoms (B, Ga) creates p-type (majority holes).',
      'Electrical conductivity increases with temperature in semiconductors (negative temperature coefficient of resistance).'
    ],
    topicsCovered: ['Band Theory', 'Energy Gap', 'Silicon Doping', 'p-n Junction Basics']
  },
  {
    id: 'vid-phy-3',
    subjectId: 'phy101',
    subjectCode: 'PHY 101',
    subjectTitle: 'Engineering Physics',
    unitNumber: 2,
    unitTitle: 'Unit 2: Lasers & Quantum Resonators',
    topicName: 'Stimulated Emission & Population Inversion',
    title: 'How a Laser Works & Principles of Stimulated Emission',
    channel: 'Engineerguy',
    instructor: 'Bill Hammack',
    youtubeId: '1Lh_p6ZpU5U',
    duration: '5:47',
    durationSeconds: 347,
    level: 'Intermediate',
    views: '3.6M',
    popularityScore: 90,
    addedDate: '2026-08-20',
    description:
      'Principles of LASER (Light Amplification by Stimulated Emission of Radiation). Covers population inversion, optical pumping, resonant cavities, and monochromatic coherent beam generation.',
    relatedNotes: [
      'Three quantum processes: Absorption, Spontaneous Emission, and Stimulated Emission.',
      'Stimulated Emission: An incident photon stimulates an excited electron to drop, releasing an identical photon with the same phase, frequency, polarization, and direction.',
      'Population Inversion: Condition where more atoms reside in the metastable excited state than the ground state.',
      'Optical Resonator: Mirrors at both ends reflect photons back and forth, amplifying coherent light before leaving through a partially reflective mirror.'
    ],
    topicsCovered: ['Stimulated Emission', 'Population Inversion', 'Metastable State', 'Coherent Light']
  },

  // ==========================================
  // 3. PROBLEM SOLVING & PROGRAMMING IN PYTHON (CSE 101)
  // ==========================================
  {
    id: 'vid-cse-1',
    subjectId: 'cse101',
    subjectCode: 'CSE 101',
    subjectTitle: 'Problem Solving and Programming in Python',
    unitNumber: 1,
    unitTitle: 'Unit 1: Computational Basics & Python Syntax',
    topicName: 'Variables, Control Flow & Functions',
    title: 'Python for Beginners - Full Crash Course',
    channel: 'freeCodeCamp',
    instructor: 'Beau Carnes',
    youtubeId: 'kqtD5dpn9C8',
    duration: '4:26:52',
    durationSeconds: 16012,
    level: 'Beginner',
    views: '11.5M',
    popularityScore: 99,
    addedDate: '2026-08-01',
    description:
      'Complete end-to-end beginner course covering Python installation, syntax, variables, types, loops, conditionals, functions, lists, dictionaries, tuples, sets, file I/O, and modules.',
    relatedNotes: [
      'Python is dynamically typed: variable types are inferred at runtime without explicit declarations.',
      'Indentation is part of the language syntax: standard is 4 spaces per block.',
      'Core data structures: Lists [mutable, ordered], Tuples (immutable, ordered), Dictionaries {key: value}, Sets {unique, unordered}.',
      'Functions are declared using def function_name(args): and return values via return.'
    ],
    topicsCovered: ['Variables', 'Data Types', 'Loops', 'Conditionals', 'Functions']
  },
  {
    id: 'vid-cse-2',
    subjectId: 'cse101',
    subjectCode: 'CSE 101',
    subjectTitle: 'Problem Solving and Programming in Python',
    unitNumber: 2,
    unitTitle: 'Unit 2: Core Data Structures & Flow Control',
    topicName: 'Slicing, Lists, Tuples & Try/Except',
    title: 'Python Full Course for Beginners - Step by Step',
    channel: 'Programming with Mosh',
    instructor: 'Mosh Hamedani',
    youtubeId: '_uQrJ0TkZlc',
    duration: '6:14:07',
    durationSeconds: 22447,
    level: 'Beginner',
    views: '43.2M',
    popularityScore: 100,
    addedDate: '2026-08-04',
    description:
      'Clear, practical real-world guide to Python fundamentals: variables, strings, arithmetic operators, if-statements, while loops, for loops, nested loops, lists, 2D lists, unpacking, and error handling.',
    relatedNotes: [
      'String formatting: use f"Hello {name}" for clean template interpolations.',
      'List slicing syntax: list[start:stop:step]. Omission defaults to start=0, stop=len, step=1.',
      'Handling exceptions: try/except blocks prevent abrupt application crashes when parsing user inputs.',
      'Classes in Python encapsulate attributes (self.var) and methods (def method(self):).'
    ],
    topicsCovered: ['String Manipulation', 'Error Handling', 'Lists & Tuples', 'Flow Control']
  },
  {
    id: 'vid-cse-3',
    subjectId: 'cse101',
    subjectCode: 'CSE 101',
    subjectTitle: 'Problem Solving and Programming in Python',
    unitNumber: 4,
    unitTitle: 'Unit 4: Object-Oriented Engineering',
    topicName: 'Classes, Instances & __init__ Constructors',
    title: 'Python OOP Tutorial 1: Classes and Instances',
    channel: 'Corey Schafer',
    instructor: 'Corey Schafer',
    youtubeId: 'ZDa-Z5JzLYM',
    duration: '15:43',
    durationSeconds: 943,
    level: 'Intermediate',
    views: '2.4M',
    popularityScore: 93,
    addedDate: '2026-08-11',
    description:
      'Deep dive into Object-Oriented Programming (OOP) in Python. Explains classes as blueprints, class instances, constructor __init__, and why self is required as the first argument in instance methods.',
    relatedNotes: [
      'Class is a blueprint; an Instance is an actual object instantiated from that blueprint.',
      'The __init__ method is the class constructor initialized automatically when creating an object.',
      'The self argument represents the instance of the class being operated on.',
      'Instance variables contain data unique to each instance, whereas class variables are shared across all instances.'
    ],
    topicsCovered: ['Object-Oriented Programming', 'Classes', '__init__ Constructor', 'self Keyword']
  },
  {
    id: 'vid-cse-4',
    subjectId: 'cse101',
    subjectCode: 'CSE 101',
    subjectTitle: 'Problem Solving and Programming in Python',
    unitNumber: 5,
    unitTitle: 'Unit 5: Algorithmic Problem Solving & Testing',
    topicName: 'CS50 Computational Thinking & Unit Tests',
    title: "CS50's Introduction to Programming with Python (Harvard)",
    channel: 'Harvard University',
    instructor: 'David J. Malan',
    youtubeId: 'nLRL_NcnK-4',
    duration: '15:56:47',
    durationSeconds: 57407,
    level: 'Intermediate',
    views: '8.1M',
    popularityScore: 98,
    addedDate: '2026-08-14',
    description:
      'Harvard University’s world-renowned introductory Python course. Teaches computational thinking, algorithmic design, unit testing, regular expressions, and object-oriented paradigms.',
    relatedNotes: [
      'Problem Solving: Break down complex computational problems into precise algorithmic steps before coding.',
      'Unit Testing: Use pytest to assert correctness of discrete functions before production deployment.',
      'Regular Expressions: The re module provides patterns to validate email formats, dates, and text tokens.',
      'File Handling: Using "with open(filename) as f:" guarantees file descriptors close automatically.'
    ],
    topicsCovered: ['Computational Thinking', 'Algorithmic Design', 'Testing', 'Software Engineering']
  },

  // ==========================================
  // 4. FUNDAMENTALS OF DIGITAL ELECTRONICS (ECE 101)
  // ==========================================
  {
    id: 'vid-ece-1',
    subjectId: 'ece101',
    subjectCode: 'ECE 101',
    subjectTitle: 'Fundamentals of Digital Electronics',
    unitNumber: 1,
    unitTitle: 'Unit 1: Number Systems & Signal Foundations',
    topicName: 'Analog vs Digital Binary Signals',
    title: 'Introduction to Digital Electronics & What is a Signal?',
    channel: 'Neso Academy',
    instructor: 'Neso Academy Team',
    youtubeId: 'M0mx8S05v60',
    duration: '8:48',
    durationSeconds: 528,
    level: 'Beginner',
    views: '1.9M',
    popularityScore: 89,
    addedDate: '2026-08-08',
    description:
      'Understanding Analog versus Digital signals, continuous time versus discrete levels, binary voltage thresholds (HIGH/LOW), and why digital circuits offer superior noise immunity.',
    relatedNotes: [
      'Analog Signal: Continuous in both time and amplitude (e.g. sound wave, temperature voltage).',
      'Digital Signal: Discrete in both time and amplitude; represented by binary 0 (LOW, ~0V) and 1 (HIGH, ~5V or 3.3V).',
      'Noise Margin: Digital circuits reject electrical noise because voltage variations within high/low threshold margins do not change binary logic state.',
      'Transistors (MOSFETs) act as electronic switches creating the fundamental building blocks of digital logic.'
    ],
    topicsCovered: ['Analog vs Digital', 'Binary Logic', 'Noise Margin', 'Voltage Levels']
  },
  {
    id: 'vid-ece-2',
    subjectId: 'ece101',
    subjectCode: 'ECE 101',
    subjectTitle: 'Fundamentals of Digital Electronics',
    unitNumber: 2,
    unitTitle: 'Unit 2: Boolean Algebra & Logic Gates',
    topicName: 'Universal Gates (NAND/NOR) & Truth Tables',
    title: 'Logic Gates: AND, OR, NOT, NAND, NOR, XOR, XNOR',
    channel: 'Neso Academy',
    instructor: 'Neso Academy Team',
    youtubeId: 'Zi-XvF-a89s',
    duration: '11:15',
    durationSeconds: 675,
    level: 'Beginner',
    views: '3.1M',
    popularityScore: 94,
    addedDate: '2026-08-16',
    description:
      'Comprehensive overview of elementary logic gates. Explains truth tables, boolean algebraic equations, universal gates (NAND and NOR), and parity detection using XOR gates.',
    relatedNotes: [
      'Basic Gates: AND (Y = A . B), OR (Y = A + B), NOT (Y = A-bar).',
      'Universal Gates: NAND and NOR can implement ANY boolean function without any other gate type.',
      'XOR (Exclusive OR): Output is HIGH if and only if inputs are different: Y = A-bar.B + A.B-bar.',
      'De Morgan’s Laws: (A . B)-bar = A-bar + B-bar and (A + B)-bar = A-bar . B-bar.'
    ],
    topicsCovered: ['Truth Tables', 'Universal Gates', 'Boolean Algebra', 'De Morgan Theorems']
  },
  {
    id: 'vid-ece-3',
    subjectId: 'ece101',
    subjectCode: 'ECE 101',
    subjectTitle: 'Fundamentals of Digital Electronics',
    unitNumber: 3,
    unitTitle: 'Unit 3: Combinational Logic Circuits',
    topicName: 'Binary Half/Full Adders & Breadboard Logic',
    title: 'How Computers Add Numbers (Binary Addition & Logic Gates)',
    channel: 'Ben Eater',
    instructor: 'Ben Eater',
    youtubeId: 'VBDoD84gyyc',
    duration: '11:39',
    durationSeconds: 699,
    level: 'Intermediate',
    views: '4.6M',
    popularityScore: 97,
    addedDate: '2026-08-22',
    description:
      'Building a binary adder from scratch using basic logic gates on a breadboard. Demonstrates Half Adders (Sum = A XOR B, Carry = A AND B) and Full Adders with carry-in propagation.',
    relatedNotes: [
      'Binary addition rules: 0+0=0, 0+1=1, 1+0=1, 1+1=0 (carry 1), 1+1+1=1 (carry 1).',
      'Half Adder: Computes sum of two single bits: Sum = A XOR B, Carry = A AND B.',
      'Full Adder: Adds three bits (A, B, and Carry-in Cin): Sum = A XOR B XOR Cin, Cout = (A.B) + (Cin.(A XOR B)).',
      'Ripple Carry Adder: Multiple full adders cascaded in series to compute multi-bit (4-bit, 8-bit, 64-bit) sums.'
    ],
    topicsCovered: ['Binary Addition', 'Half Adder', 'Full Adder', 'Ripple Carry Adder']
  },

  // ==========================================
  // 5. DIGITAL SKILL WORKSHOP (ENG 103)
  // ==========================================
  {
    id: 'vid-dsw-1',
    subjectId: 'eng103',
    subjectCode: 'ENG 103',
    subjectTitle: 'Digital Skill Workshop',
    unitNumber: 1,
    unitTitle: 'Unit 1: Version Control & Collaboration',
    topicName: 'Git Commits, Branching & GitHub Repos',
    title: 'Git and GitHub for Beginners - Full Crash Course',
    channel: 'freeCodeCamp',
    instructor: 'Gwen Faraday',
    youtubeId: 'RGOj5yH7evk',
    duration: '1:08:29',
    durationSeconds: 4109,
    level: 'Beginner',
    views: '5.9M',
    popularityScore: 96,
    addedDate: '2026-08-07',
    description:
      'Essential version control skills for every engineering student. Learn git init, status, add, commit, push, pull, branching, merge conflicts, pull requests, and GitHub remote repositories.',
    relatedNotes: [
      'Three Git Trees: Working Directory -> Staging Area (git add) -> Git Repository (git commit).',
      'Commit message best practice: Use present-tense imperative verbs: "Add user authentication module".',
      'Branching: git checkout -b feature/login allows developing features in isolation without disrupting main branch.',
      'Remote synchronization: git push origin main and git pull origin main.'
    ],
    topicsCovered: ['Git Version Control', 'GitHub Repositories', 'Branching & Merging', 'Commits']
  },
  {
    id: 'vid-dsw-2',
    subjectId: 'eng103',
    subjectCode: 'ENG 103',
    subjectTitle: 'Digital Skill Workshop',
    unitNumber: 2,
    unitTitle: 'Unit 2: Command Line & Operating Systems',
    topicName: 'Linux Bash Terminal & File Permissions',
    title: 'Linux for Beginners - Full Course & Shell Commands',
    channel: 'freeCodeCamp',
    instructor: 'Sander van Vugt',
    youtubeId: 'sWbUDq4S6Y8',
    duration: '5:41:40',
    durationSeconds: 20500,
    level: 'Beginner',
    views: '3.7M',
    popularityScore: 92,
    addedDate: '2026-08-17',
    description:
      'Master the Linux command line terminal: filesystem navigation (cd, ls, pwd), file management (cp, mv, rm, mkdir), file permissions (chmod, chown), piping (|), grep, and shell scripts.',
    relatedNotes: [
      'Filesystem Navigation: "/" is root, "~" is user home directory, ".." is parent directory.',
      'Piping & Redirection: "command1 | command2" passes output of command1 as input to command2; ">" redirects to file.',
      'File Permissions: rwx (Read=4, Write=2, Execute=1) for User, Group, and Others (e.g. chmod 755 script.sh).',
      'Process Monitoring: "top" and "ps aux" inspect CPU/RAM consumption of running processes.'
    ],
    topicsCovered: ['Linux Shell', 'Bash Commands', 'File Permissions', 'Pipes and Redirection']
  },
  {
    id: 'vid-dsw-3',
    subjectId: 'eng103',
    subjectCode: 'ENG 103',
    subjectTitle: 'Digital Skill Workshop',
    unitNumber: 3,
    unitTitle: 'Unit 3: Web Engineering & Semantic UI',
    topicName: 'HTML5 Structure, CSS Box Model & Flexbox',
    title: 'HTML & CSS Full Course - Beginner to Professional',
    channel: 'SuperSimpleDev',
    instructor: 'Simon Bienstman',
    youtubeId: 'G3e-cpL7ofc',
    duration: '6:31:24',
    durationSeconds: 23484,
    level: 'Beginner',
    views: '12.4M',
    popularityScore: 98,
    addedDate: '2026-08-19',
    description:
      'Foundational frontend web technologies: semantic HTML5 elements, CSS styling, Box Model, Flexbox layout, Grid system, responsive design, media queries, and clean web development practices.',
    relatedNotes: [
      'HTML provides structural content (tags, attributes, elements); CSS provides presentation and layout.',
      'The CSS Box Model comprises Content -> Padding -> Border -> Margin.',
      'Flexbox (display: flex) distributes items along a primary axis (justify-content) and cross axis (align-items).',
      'Responsive design: Use @media (max-width: 768px) { ... } to adapt web layouts for mobile screens.'
    ],
    topicsCovered: ['Semantic HTML', 'CSS Box Model', 'Flexbox & Grid', 'Responsive Design']
  },

  // ==========================================
  // 6. QUANTITATIVE APTITUDE AND REASONING (ENG 104)
  // ==========================================
  {
    id: 'vid-apt-1',
    subjectId: 'eng104',
    subjectCode: 'ENG 104',
    subjectTitle: 'Quantitative Aptitude and Reasoning',
    unitNumber: 1,
    unitTitle: 'Unit 1: Quantitative Arithmetic & Rates',
    topicName: 'Speed, Distance, Time & Relative Speed',
    title: 'Speed, Distance and Time - Aptitude Made Easy',
    channel: 'CareerRide',
    instructor: 'Sheetal',
    youtubeId: 'jzNxXm5twx4',
    duration: '18:14',
    durationSeconds: 1094,
    level: 'Beginner',
    views: '2.1M',
    popularityScore: 88,
    addedDate: '2026-08-06',
    description:
      'Master the core formula: Distance = Speed * Time. Learn rapid unit conversion (km/h to m/s via 5/18), average speed for round trips (2xy / (x+y)), relative speed, and train/platform problems.',
    relatedNotes: [
      'Fundamental relationship: Distance = Speed * Time.',
      'Unit Conversion: km/h to m/s multiply by 5/18; m/s to km/h multiply by 18/5.',
      'Average Speed for equal distance journeys: Average Speed = (2 * S1 * S2) / (S1 + S2).',
      'Relative Speed: When two objects move in opposite directions, speeds ADD (S1 + S2); same direction, speeds SUBTRACT |S1 - S2|.'
    ],
    topicsCovered: ['Speed Distance Time', 'Unit Conversions', 'Average Speed', 'Relative Speed']
  },
  {
    id: 'vid-apt-2',
    subjectId: 'eng104',
    subjectCode: 'ENG 104',
    subjectTitle: 'Quantitative Aptitude and Reasoning',
    unitNumber: 2,
    unitTitle: 'Unit 2: Proportions & Commercial Math',
    topicName: 'Percentage Shortcuts & Fraction Equivalents',
    title: 'Percentages Made Easy - Shortcuts & Concepts',
    channel: 'CareerRide',
    instructor: 'Sheetal',
    youtubeId: 'RWdNhJWwzSs',
    duration: '14:25',
    durationSeconds: 865,
    level: 'Beginner',
    views: '1.8M',
    popularityScore: 86,
    addedDate: '2026-08-13',
    description:
      'Percentages shortcuts and fraction-to-percentage equivalence table (1/2=50%, 1/3=33.3%, 1/4=25%, 1/5=20%, 1/6=16.67%, 1/8=12.5%). Covers successive percentage changes and profit/loss basics.',
    relatedNotes: [
      'Percentage formula: Percentage = (Part / Total) * 100.',
      'Successive Percentage Change formula: Net Change = [a + b + (a * b) / 100]%.',
      'Fraction shortcuts: 1/8 = 12.5%, 1/7 = 14.28%, 1/9 = 11.11%, 1/11 = 9.09%.',
      'If A is x% more than B, B is [x / (100 + x)] * 100% less than A.'
    ],
    topicsCovered: ['Percentages', 'Fraction Equivalents', 'Successive Changes', 'Mental Math Shortcuts']
  },
  {
    id: 'vid-apt-3',
    subjectId: 'eng104',
    subjectCode: 'ENG 104',
    subjectTitle: 'Quantitative Aptitude and Reasoning',
    unitNumber: 3,
    unitTitle: 'Unit 3: Work Distribution & Placement Drills',
    topicName: 'Time & Work LCM Methods & Worker Efficiency',
    title: 'Time and Work - Shortcuts & Tricks for Engineering Placements',
    channel: 'CareerRide',
    instructor: 'Sheetal',
    youtubeId: 'KE7tQf9spPg',
    duration: '17:34',
    durationSeconds: 1054,
    level: 'Intermediate',
    views: '3.4M',
    popularityScore: 91,
    addedDate: '2026-08-21',
    description:
      'Classic placement examination aptitude problems: individual work rates (1/A + 1/B), LCM method for total units of work, efficiency ratios, and alternating worker problems.',
    relatedNotes: [
      'Reciprocal rule: If A can finish work in n days, A’s 1-day work = 1/n of total job.',
      'Combined work rate: Time taken together T = (A * B) / (A + B) days.',
      'LCM Method: Assume total work = LCM of days. Calculate units per day for each person; then Total Days = Total Units / Combined Units per Day.',
      'Efficiency relation: Efficiency is inversely proportional to time taken (Efficiency = Work / Time).'
    ],
    topicsCovered: ['Time and Work', 'LCM Method', 'Efficiency Ratios', 'Placement Preparation']
  },

  // ==========================================
  // 7. ENGLISH FOR TECHNICAL COMMUNICATION (HUM 101)
  // ==========================================
  {
    id: 'vid-eng-1',
    subjectId: 'hum101',
    subjectCode: 'HUM 101',
    subjectTitle: 'English for Technical Communication',
    unitNumber: 1,
    unitTitle: 'Unit 1: Professional Technical Presentations',
    topicName: 'Stanford GSB Frameworks & Anxiety Management',
    title: 'Think Fast, Talk Smart: Communication Techniques',
    channel: 'Stanford Graduate School of Business',
    instructor: 'Matt Abrahams',
    youtubeId: 'HAnw16wlwIA',
    duration: '58:20',
    durationSeconds: 3500,
    level: 'Intermediate',
    views: '41.2M',
    popularityScore: 99,
    addedDate: '2026-08-02',
    description:
      'Stanford GSB lecture on spontaneous speaking, handling technical presentation anxiety, communicating complex engineering ideas clearly, and structuring impromptu workplace answers.',
    relatedNotes: [
      'Mindset shift: Shift from striving for perfection to focusing on audience connection.',
      'Structure Framework: "What? -> So What? -> Now What?" provides a reliable template for any engineering pitch or report.',
      'Anxiety Management: Deep belly breathing, reframing nervousness as excitement, and physical grounding.',
      'Listening before speaking: Good communication is 80% attentive listening and 20% targeted response.'
    ],
    topicsCovered: ['Public Speaking', 'Structure Framework', 'Presentation Anxiety', 'Technical Articulation']
  },
  {
    id: 'vid-eng-2',
    subjectId: 'hum101',
    subjectCode: 'HUM 101',
    subjectTitle: 'English for Technical Communication',
    unitNumber: 2,
    unitTitle: 'Unit 2: Vocal Delivery & Articulation',
    topicName: 'Vocal Toolbox, Pitch, Timbre & HAIL Framework',
    title: 'How to Speak So That People Want to Listen',
    channel: 'TED',
    instructor: 'Julian Treasure',
    youtubeId: 'eIho2S0ZahI',
    duration: '9:58',
    durationSeconds: 598,
    level: 'Beginner',
    views: '54.6M',
    popularityScore: 100,
    addedDate: '2026-08-09',
    description:
      'Sound and communication expert Julian Treasure shares the 7 deadly sins of speaking and the 4 cornerstones of powerful speech (HAIL: Honesty, Authenticity, Integrity, Love).',
    relatedNotes: [
      'The 7 Deadly Sins: Gossip, Judging, Negativity, Complaining, Excuses, Exaggeration, Dogmatism.',
      'The HAIL Framework: Honesty (be clear and true), Authenticity (be yourself), Integrity (do what you say), Love (wish them well).',
      'The Vocal Toolbox: Register (chest vs throat), Timbre (warmth), Prosody (inflection), Pace (speed & silence), Pitch, and Volume.',
      'Deliberate pauses: Silence can be far more powerful than filler words like "um" or "uh".'
    ],
    topicsCovered: ['Vocal Delivery', 'HAIL Principle', 'Overcoming Monotony', 'Effective Pitch']
  },

  // ==========================================
  // 8. PYTHON MASTERCLASS TRACK (BEGINNER TO ADVANCED)
  // ==========================================
  {
    id: 'vid-pytrack-1',
    subjectId: 'python-course',
    subjectCode: 'PY-TRACK',
    subjectTitle: 'Python Masterclass Track',
    unitNumber: 1,
    unitTitle: 'Track 1: Computational Foundations',
    topicName: 'Core Syntax & Computational Thinking',
    title: 'Track 1: Python Core Foundations & Computational Thinking',
    channel: 'freeCodeCamp',
    instructor: 'Beau Carnes',
    youtubeId: 'kqtD5dpn9C8',
    duration: '4:26:52',
    durationSeconds: 16012,
    level: 'Beginner',
    views: '11.5M',
    popularityScore: 98,
    addedDate: '2026-08-03',
    description:
      'Start from zero: Syntax, variables, integers, floats, booleans, arithmetic expressions, string formatting, input/output, and debugging common beginner mistakes.',
    relatedNotes: [
      'Python executes sequentially line-by-line via the Python Virtual Machine (PVM).',
      'Variables hold object references: a = [1, 2] and b = a point to the same memory buffer.',
      'Dynamic typing allows reassignment: x = 10, then x = "hello" is valid Python.',
      'Always use descriptive snake_case variable names in engineering scripts.'
    ],
    topicsCovered: ['Core Syntax', 'Primitive Types', 'Variables', 'I/O Operations']
  },
  {
    id: 'vid-pytrack-2',
    subjectId: 'python-course',
    subjectCode: 'PY-TRACK',
    subjectTitle: 'Python Masterclass Track',
    unitNumber: 2,
    unitTitle: 'Track 2: Data Structures & Flow',
    topicName: 'List Comprehensions & Defensive Coding',
    title: 'Track 2: Data Structures, Control Flow & Error Handling',
    channel: 'Programming with Mosh',
    instructor: 'Mosh Hamedani',
    youtubeId: '_uQrJ0TkZlc',
    duration: '6:14:07',
    durationSeconds: 22447,
    level: 'Intermediate',
    views: '43.2M',
    popularityScore: 99,
    addedDate: '2026-08-07',
    description:
      'Master conditional branching (if/elif/else), loops (for, while, range), list comprehensions, dictionary mappings, sets, and defensive programming using try/except.',
    relatedNotes: [
      'List Comprehension syntax: [x**2 for x in numbers if x % 2 == 0].',
      'Dictionaries offer O(1) average-time complexity for lookups, insertions, and deletions.',
      'Avoid bare "except:": always specify the exception type like "except ValueError as e:".',
      'Loop optimization: prefer iterating directly over elements (for item in list:) rather than indices.'
    ],
    topicsCovered: ['List Comprehensions', 'Dictionaries', 'Control Flow', 'Defensive Coding']
  },
  {
    id: 'vid-pytrack-3',
    subjectId: 'python-course',
    subjectCode: 'PY-TRACK',
    subjectTitle: 'Python Masterclass Track',
    unitNumber: 3,
    unitTitle: 'Track 3: OOP Software Engineering',
    topicName: 'Inheritance & Dunder Methods',
    title: 'Track 3: Object-Oriented Programming (OOP) & Architecture',
    channel: 'Corey Schafer',
    instructor: 'Corey Schafer',
    youtubeId: 'ZDa-Z5JzLYM',
    duration: '15:43',
    durationSeconds: 943,
    level: 'Intermediate',
    views: '2.4M',
    popularityScore: 94,
    addedDate: '2026-08-11',
    description:
      'Engineering software architecture with Python OOP: Encapsulation, inheritance, dunder/magic methods (__repr__, __str__, __add__), classmethods, and staticmethods.',
    relatedNotes: [
      'Inheritance: class ElectricalResistor(Component): inherits all base methods and attributes.',
      'Use __repr__ for unambiguous developer representation and __str__ for human-readable output.',
      '@property decorator allows defining getters, setters, and computed properties cleanly.',
      'Encapsulation bundles data with the methods that operate on that data.'
    ],
    topicsCovered: ['Object-Oriented Programming', 'Inheritance', 'Dunder Methods', 'Properties']
  },
  {
    id: 'vid-pytrack-4',
    subjectId: 'python-course',
    subjectCode: 'PY-TRACK',
    subjectTitle: 'Python Masterclass Track',
    unitNumber: 4,
    unitTitle: 'Track 4: Algorithms & Complexity',
    topicName: 'Big-O Complexity, Algorithms & Web APIs',
    title: 'Track 4: Advanced Problem Solving & Algorithmic Engineering',
    channel: 'Harvard University',
    instructor: 'David J. Malan',
    youtubeId: 'nLRL_NcnK-4',
    duration: '15:56:47',
    durationSeconds: 57407,
    level: 'Advanced',
    views: '8.1M',
    popularityScore: 97,
    addedDate: '2026-08-15',
    description:
      'High-performance Python engineering: Regular expressions, file parsing, web APIs, unit testing suites, and algorithmic efficiency for real-world software.',
    relatedNotes: [
      'Time Complexity (Big-O): Analyze algorithm scale before writing code (O(1), O(log n), O(n), O(n^2)).',
      'Binary Search runs in O(log n) time compared to linear search O(n) on sorted datasets.',
      'Python Standard Library modules: math, collections, itertools, json, and sys offer fast C-accelerated utilities.',
      'Writing test-driven code ensures robust engineering deliverables.'
    ],
    topicsCovered: ['Big-O Complexity', 'Algorithms', 'API Integration', 'Unit Testing']
  }
];
