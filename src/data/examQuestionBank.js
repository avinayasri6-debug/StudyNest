// Subject-wise Exam Question Bank, Python Assessment Suite, and Formula Reference Cards
// NOTE: All sample practice questions are explicitly provided as educational practice items,
// not official university examination papers.

export const SAMPLE_PRACTICE_QUESTIONS = [
  // ============================================================
  // MATH 101: Linear Algebra and Calculus
  // ============================================================
  {
    id: 'q-math-1',
    subjectCode: 'MATH 101',
    subjectTitle: 'Linear Algebra and Calculus',
    unit: 'Unit 1: Matrix Theory & Linear Systems',
    topic: 'Eigenvalues & Diagonalization',
    difficulty: 'Medium',
    question: 'What are the eigenvalues of an upper triangular matrix?',
    options: [
      'The sum of all row elements',
      'The main diagonal entries themselves',
      'Always zero for real matrices',
      'The determinant divided by the trace'
    ],
    correct: 1,
    explanation: 'For any triangular matrix (upper or lower), the characteristic polynomial det(A - λI) simplifies directly to (a11 - λ)(a22 - λ)...(ann - λ) = 0. Therefore, the eigenvalues are strictly the entries on the main diagonal.',
    isSample: true
  },
  {
    id: 'q-math-2',
    subjectCode: 'MATH 101',
    subjectTitle: 'Linear Algebra and Calculus',
    unit: 'Unit 1: Matrix Theory & Linear Systems',
    topic: 'Rank-Nullity Theorem',
    difficulty: 'Easy',
    question: 'If a 4×4 linear transformation matrix A has rank 3, what is the dimension of its null space (nullity)?',
    options: ['0', '1', '3', '4'],
    correct: 1,
    explanation: 'According to the fundamental Rank-Nullity Theorem: Rank(A) + Nullity(A) = n (number of columns). Here, 3 + Nullity(A) = 4, which yields Nullity(A) = 1.',
    isSample: true
  },
  {
    id: 'q-math-3',
    subjectCode: 'MATH 101',
    subjectTitle: 'Linear Algebra and Calculus',
    unit: 'Unit 2: Cayley-Hamilton & Orthogonal Matrices',
    topic: 'Cayley-Hamilton Theorem',
    difficulty: 'Hard',
    question: 'According to the Cayley-Hamilton Theorem, what property does every square matrix satisfy?',
    options: [
      'Every square matrix is symmetric and orthogonal',
      'Every square matrix satisfies its own characteristic polynomial equation',
      'Every square matrix has non-zero determinant',
      'The inverse of any matrix is equal to its transpose'
    ],
    correct: 1,
    explanation: 'The Cayley-Hamilton Theorem states that if p(λ) = det(A - λI) is the characteristic polynomial of square matrix A, then p(A) = O (the zero matrix). This is used to compute matrix powers and inverses efficiently.',
    isSample: true
  },
  {
    id: 'q-math-4',
    subjectCode: 'MATH 101',
    subjectTitle: 'Linear Algebra and Calculus',
    unit: 'Unit 3: Multivariable Calculus',
    topic: 'Partial Derivatives & Jacobians',
    difficulty: 'Medium',
    question: 'What does the Jacobian matrix represent in vector calculus?',
    options: [
      'The area under a one-dimensional curve',
      'The matrix of all first-order partial derivatives of a vector-valued function',
      'The eigenvalues of a system of differential equations',
      'The curl of a conservative vector field'
    ],
    correct: 1,
    explanation: 'The Jacobian matrix contains all first-order partial derivatives of a multivariable vector-valued function. Its determinant (the Jacobian determinant) represents the local volume expansion factor under coordinate transformations.',
    isSample: true
  },

  // ============================================================
  // PHYS 101: Engineering Physics
  // ============================================================
  {
    id: 'q-phys-1',
    subjectCode: 'PHYS 101',
    subjectTitle: 'Engineering Physics',
    unit: 'Unit 1: Wave Optics',
    topic: 'Thin Film Interference',
    difficulty: 'Medium',
    question: 'What is the condition for constructive interference (bright fringe) in reflected light for a thin film of thickness t and refractive index μ (normal incidence)?',
    options: [
      '2μt = nλ',
      '2μt = (2n - 1)λ / 2',
      '2μt = (n + 1)λ^2',
      'μt = nλ / 4'
    ],
    correct: 1,
    explanation: 'Due to reflection at the boundary of a denser medium, an additional phase change of π (or path difference of λ/2) occurs. Hence, constructive interference condition becomes 2μt = (2n - 1)λ/2.',
    isSample: true
  },
  {
    id: 'q-phys-2',
    subjectCode: 'PHYS 101',
    subjectTitle: 'Engineering Physics',
    unit: 'Unit 2: Lasers & Fiber Optics',
    topic: 'Population Inversion',
    difficulty: 'Easy',
    question: 'What fundamental condition must be satisfied to achieve stimulated laser emission over spontaneous absorption?',
    options: [
      'N1 > N2 (ground state holds more atoms)',
      'N2 > N1 (higher metastable state holds more atoms than ground state)',
      'Total temperature must reach absolute zero',
      'The laser cavity must be open to atmosphere'
    ],
    correct: 1,
    explanation: 'Population inversion occurs when the population density of an upper metastable energy level N2 exceeds that of the lower level N1 (N2 > N1), enabling stimulated photon amplification.',
    isSample: true
  },
  {
    id: 'q-phys-3',
    subjectCode: 'PHYS 101',
    subjectTitle: 'Engineering Physics',
    unit: 'Unit 2: Lasers & Fiber Optics',
    topic: 'Optical Fiber Numerical Aperture',
    difficulty: 'Medium',
    question: 'If an optical fiber has core refractive index n1 = 1.50 and cladding refractive index n2 = 1.45, what is its Numerical Aperture (NA)?',
    options: [
      'NA = sqrt(1.50^2 - 1.45^2) ≈ 0.384',
      'NA = 1.50 - 1.45 = 0.050',
      'NA = 1.50 / 1.45 ≈ 1.034',
      'NA = sqrt(1.50 * 1.45) ≈ 1.474'
    ],
    correct: 0,
    explanation: 'The Numerical Aperture of a step-index optical fiber is given by NA = sqrt(n1^2 - n2^2). Calculating sqrt(2.25 - 2.1025) = sqrt(0.1475) ≈ 0.384.',
    isSample: true
  },

  // ============================================================
  // CSE 101: Problem Solving and Programming in Python
  // ============================================================
  {
    id: 'q-py-1',
    subjectCode: 'CSE 101',
    subjectTitle: 'Problem Solving and Programming in Python',
    unit: 'Unit 1: Python Semantics & Mutability',
    topic: 'Data Types & Mutability',
    difficulty: 'Easy',
    question: 'Which of the following built-in Python collections is immutable?',
    options: [
      'List [1, 2, 3]',
      'Dictionary {"a": 1}',
      'Tuple (1, 2, 3)',
      'Set {1, 2, 3}'
    ],
    correct: 2,
    explanation: 'Tuples, strings, integers, floats, and frozensets are immutable in Python. Once instantiated, their elements cannot be modified, added, or removed in-place.',
    isSample: true
  },
  {
    id: 'q-py-2',
    subjectCode: 'CSE 101',
    subjectTitle: 'Problem Solving and Programming in Python',
    unit: 'Unit 3: Functions & Comprehensions',
    topic: 'List Comprehensions',
    difficulty: 'Medium',
    question: 'What is the evaluated output of the list comprehension: [x**2 for x in range(6) if x % 2 == 1]?',
    options: [
      '[0, 4, 16]',
      '[1, 9, 25]',
      '[1, 4, 9, 16, 25]',
      '[0, 1, 4, 9, 16, 25]'
    ],
    correct: 1,
    explanation: 'range(6) produces [0, 1, 2, 3, 4, 5]. The condition x % 2 == 1 filters odd numbers: 1, 3, and 5. Squaring them yields 1^2 = 1, 3^2 = 9, and 5^2 = 25 -> [1, 9, 25].',
    isSample: true
  },
  {
    id: 'q-py-3',
    subjectCode: 'CSE 101',
    subjectTitle: 'Problem Solving and Programming in Python',
    unit: 'Unit 4: Object-Oriented Programming',
    topic: 'Inheritance & super()',
    difficulty: 'Hard',
    question: 'What is the purpose of the super().__init__() call in a Python derived class constructor?',
    options: [
      'To delete the parent class instance',
      'To invoke the initializer of the parent (super) class and bind its attributes',
      'To convert all attributes into static global variables',
      'To bypass private variable access restrictions'
    ],
    correct: 1,
    explanation: 'super().__init__() dynamically delegates constructor execution to the next class in the Method Resolution Order (MRO), ensuring parent class attributes are correctly initialized.',
    isSample: true
  },

  // ============================================================
  // ECE 101: Fundamentals of Digital Electronics
  // ============================================================
  {
    id: 'q-ece-1',
    subjectCode: 'ECE 101',
    subjectTitle: 'Fundamentals of Digital Electronics',
    unit: 'Unit 1: Boolean Algebra & Logic Gates',
    topic: 'Universal Gates',
    difficulty: 'Easy',
    question: 'Which pair of logic gates are known as Universal Gates because any logic circuit can be built exclusively with them?',
    options: [
      'AND and OR',
      'NAND and NOR',
      'XOR and XNOR',
      'NOT and BUFFER'
    ],
    correct: 1,
    explanation: 'NAND and NOR gates are universal gates because functional completeness holds: NOT, AND, and OR can all be formed using combinations of solely NAND or solely NOR gates.',
    isSample: true
  },
  {
    id: 'q-ece-2',
    subjectCode: 'ECE 101',
    subjectTitle: 'Fundamentals of Digital Electronics',
    unit: 'Unit 2: Karnaugh Maps & Minimization',
    topic: 'K-Map Grouping Rules',
    difficulty: 'Medium',
    question: 'In a 4-variable Karnaugh Map (K-Map), what is the valid cell group size for prime implicant grouping?',
    options: [
      'Any number of adjacent cells (e.g. 3, 5, 6, 7)',
      'Strictly powers of two: 1, 2, 4, 8, or 16 cells',
      'Only square shapes with 4 or 9 cells',
      'Only prime numbers of cells: 2, 3, 5, 7'
    ],
    correct: 1,
    explanation: 'Boolean simplification relies on the identity A + A\' = 1. Eliminating k variables requires grouping 2^k adjacent cells. Hence groups must strictly contain 1, 2, 4, 8, or 16 cells.',
    isSample: true
  },
  {
    id: 'q-ece-3',
    subjectCode: 'ECE 101',
    subjectTitle: 'Fundamentals of Digital Electronics',
    unit: 'Unit 3: Combinational Logic Circuits',
    topic: 'Multiplexers (MUX)',
    difficulty: 'Medium',
    question: 'How many select lines are required for an 8-to-1 Multiplexer (8:1 MUX)?',
    options: ['2', '3', '4', '8'],
    correct: 1,
    explanation: 'For a 2^n to 1 multiplexer, n select lines are required. Since 8 = 2^3, an 8:1 MUX requires exactly 3 select lines (s0, s1, s2).',
    isSample: true
  },

  // ============================================================
  // CSE 102: Digital Skill Workshop
  // ============================================================
  {
    id: 'q-dsw-1',
    subjectCode: 'CSE 102',
    subjectTitle: 'Digital Skill Workshop',
    unit: 'Unit 1: Git Version Control',
    topic: 'Branching & Workflows',
    difficulty: 'Easy',
    question: 'Which Git command creates a new branch named "feature-login" and immediately switches your workspace to it?',
    options: [
      'git branch feature-login',
      'git checkout -b feature-login',
      'git merge feature-login',
      'git push origin feature-login'
    ],
    correct: 1,
    explanation: 'git checkout -b <branch-name> (or git switch -c <branch-name>) atomically creates the branch and checks it out into your working directory.',
    isSample: true
  },
  {
    id: 'q-dsw-2',
    subjectCode: 'CSE 102',
    subjectTitle: 'Digital Skill Workshop',
    unit: 'Unit 2: Linux CLI & Environment',
    topic: 'File Permissions & Shell',
    difficulty: 'Medium',
    question: 'What numerical octal permission represents read, write, and execute for owner, and read-only for group and others (rwxr--r--)?',
    options: ['644', '755', '744', '777'],
    correct: 2,
    explanation: 'Owner: rwx = 4+2+1 = 7. Group: r-- = 4+0+0 = 4. Others: r-- = 4+0+0 = 4. Therefore the octal notation is 744.',
    isSample: true
  },

  // ============================================================
  // MATH 102: Quantitative Aptitude and Reasoning
  // ============================================================
  {
    id: 'q-qa-1',
    subjectCode: 'MATH 102',
    subjectTitle: 'Quantitative Aptitude and Reasoning',
    unit: 'Unit 1: Arithmetic & Time-Work',
    topic: 'Time and Work',
    difficulty: 'Medium',
    question: 'Person A can complete an engineering project in 12 days, and Person B in 24 days. Working together, in how many days can they complete the project?',
    options: ['6 days', '8 days', '10 days', '18 days'],
    correct: 1,
    explanation: 'Combined 1-day work = 1/12 + 1/24 = (2 + 1) / 24 = 3/24 = 1/8. Hence, working together they finish in 8 days.',
    isSample: true
  },
  {
    id: 'q-qa-2',
    subjectCode: 'MATH 102',
    subjectTitle: 'Quantitative Aptitude and Reasoning',
    unit: 'Unit 2: Speed, Time and Distance',
    topic: 'Relative Speed',
    difficulty: 'Medium',
    question: 'Two trains 150m and 250m long are running towards each other on parallel tracks at 45 km/h and 63 km/h. How many seconds will they take to cross each other?',
    options: ['10 seconds', '13.33 seconds', '15 seconds', '20 seconds'],
    correct: 1,
    explanation: 'Total distance = 150 + 250 = 400m. Relative speed = 45 + 63 = 108 km/h. Convert to m/s: 108 * (5/18) = 30 m/s. Time = Distance / Speed = 400 / 30 = 13.33 seconds.',
    isSample: true
  },

  // ============================================================
  // ENG 101: English for Technical Communication
  // ============================================================
  {
    id: 'q-eng-1',
    subjectCode: 'ENG 101',
    subjectTitle: 'English for Technical Communication',
    unit: 'Unit 1: Scientific Style & Voice',
    topic: 'Active vs. Passive Voice in Lab Reports',
    difficulty: 'Easy',
    question: 'Why is the passive voice traditionally preferred in formal engineering methodology descriptions (e.g. "The voltage was measured at 5V intervals")?',
    options: [
      'Because active voice is grammatically incorrect in English',
      'To emphasize the empirical procedure and data rather than the personal researcher',
      'Because passive voice sentences are always shorter',
      'To hide who conducted the experiment'
    ],
    correct: 1,
    explanation: 'In scientific and engineering writing, passive voice places grammatical focus on the apparatus, methodology, and empirical observations rather than the subjective individual actor.',
    isSample: true
  },
  {
    id: 'q-eng-2',
    subjectCode: 'ENG 101',
    subjectTitle: 'English for Technical Communication',
    unit: 'Unit 2: Technical Vocabulary',
    topic: 'Conciseness & Precision',
    difficulty: 'Medium',
    question: 'Which of the following revisions best improves the technical conciseness of: "At this exact point in current time, the motor has ceased operating"?',
    options: [
      'Right now currently the motor is dead.',
      'Currently, the motor has stopped.',
      'At this juncture of moment the motor gave up.',
      'The motor stopped working right now this time.'
    ],
    correct: 1,
    explanation: '"Currently, the motor has stopped" replaces redundant wordy phrases ("At this exact point in current time", "ceased operating") with clear, precise technical vocabulary.',
    isSample: true
  }
];

// ============================================================
// DEDICATED PYTHON ASSESSMENT TRACKS
// (Predict Output, Find Error, Complete Code, Conceptual)
// ============================================================
export const PYTHON_ASSESSMENT_QUESTIONS = [
  {
    id: 'py-pred-1',
    track: 'predict_output',
    title: 'List References & Shallow Copying',
    difficulty: 'Medium',
    question: 'Predict the console output of the following Python program:',
    codeSnippet: `a = [1, 2, [3, 4]]
b = list(a)
b[2].append(5)
b[0] = 99
print(a)`,
    options: [
      '[1, 2, [3, 4]]',
      '[1, 2, [3, 4, 5]]',
      '[99, 2, [3, 4, 5]]',
      '[99, 2, [3, 4]]'
    ],
    correct: 1,
    explanation: 'list(a) produces a shallow copy. The outer list elements are distinct (so changing b[0] does not affect a[0]), but the inner list [3, 4] is referenced by both a and b. Mutating b[2] alters the shared nested list, yielding [1, 2, [3, 4, 5]].',
    isPythonQuestion: true,
    isSample: true
  },
  {
    id: 'py-pred-2',
    track: 'predict_output',
    title: 'Default Mutable Arguments in Functions',
    difficulty: 'Hard',
    question: 'Predict what the following code prints when executed twice:',
    codeSnippet: `def append_item(val, target=[]):
    target.append(val)
    return target

print(append_item(10))
print(append_item(20))`,
    options: [
      '[10]\n[20]',
      '[10]\n[10, 20]',
      '[10]\n[]',
      'TypeError: default arguments cannot be lists'
    ],
    correct: 1,
    explanation: 'In Python, default parameter expressions are evaluated once when the function is defined, not upon each call. The same list target is reused across calls, resulting in [10] then [10, 20].',
    isPythonQuestion: true,
    isSample: true
  },
  {
    id: 'py-err-1',
    track: 'find_error',
    title: 'Tuple Assignment Mutation Error',
    difficulty: 'Easy',
    question: 'Which line in the following Python script will raise an error and what is the exception type?',
    codeSnippet: `point = (10, 20, 30)
x = point[0]
point[1] = 45
print(point)`,
    options: [
      'Line 1: SyntaxError',
      'Line 2: IndexError',
      'Line 3: TypeError (\'tuple\' object does not support item assignment)',
      'Line 4: ValueError'
    ],
    correct: 2,
    explanation: 'Tuples are strictly immutable sequences. Attempting to assign or modify an index (point[1] = 45) immediately raises a TypeError: \'tuple\' object does not support item assignment.',
    isPythonQuestion: true,
    isSample: true
  },
  {
    id: 'py-err-2',
    track: 'find_error',
    title: 'Variable Scope & UnboundLocalError',
    difficulty: 'Hard',
    question: 'What happens when calling calculate_total() in the snippet below?',
    codeSnippet: `count = 50

def calculate_total():
    count += 10
    return count

calculate_total()`,
    options: [
      'Returns 60 successfully',
      'Raises UnboundLocalError: local variable \'count\' referenced before assignment',
      'Creates a new global variable named total',
      'Returns None'
    ],
    correct: 1,
    explanation: 'Because count is assigned on the left side of += inside the function, Python marks count as a local variable for that scope. Trying to read its prior value before assignment triggers UnboundLocalError unless declared with "global count".',
    isPythonQuestion: true,
    isSample: true
  },
  {
    id: 'py-comp-1',
    track: 'complete_code',
    title: 'Dictionary Frequency Counter',
    difficulty: 'Medium',
    question: 'Select the missing expression to correctly count word frequencies in the list:',
    codeSnippet: `words = ["matrix", "tensor", "vector", "matrix"]
freq = {}
for w in words:
    freq[w] = _____ + 1
print(freq["matrix"]) # should print 2`,
    options: [
      'freq.get(w, 0)',
      'freq[w] if w in freq else None',
      'freq.pop(w, 0)',
      'len(freq)'
    ],
    correct: 0,
    explanation: 'freq.get(w, 0) safely returns the current count for key w, or returns 0 if the word has not been added yet, allowing clean incrementation without a KeyError.',
    isPythonQuestion: true,
    isSample: true
  },
  {
    id: 'py-comp-2',
    track: 'complete_code',
    title: 'Custom String Representation in OOP',
    difficulty: 'Medium',
    question: 'Which dunder method must be implemented to customize the output of print(obj) for an engineering class?',
    codeSnippet: `class Resistor:
    def __init__(self, ohms):
        self.ohms = ohms

    def _____(self):
        return f"Resistor({self.ohms}Ω)"

r = Resistor(220)
print(r) # Outputs: Resistor(220Ω)`,
    options: [
      '__str__',
      '__format__',
      '__to_string__',
      '__display__'
    ],
    correct: 0,
    explanation: 'The __str__(self) method is invoked by str(object) and print(object) to provide an informal, human-readable string representation of the object.',
    isPythonQuestion: true,
    isSample: true
  }
];

// ============================================================
// IMPORTANT FORMULAS REVISION REPOSITORY
// ============================================================
export const SUBJECT_FORMULA_SHEETS = [
  {
    subjectCode: 'MATH 101',
    subjectTitle: 'Linear Algebra and Calculus',
    category: 'Matrices & Eigenvalues',
    formulas: [
      { name: 'Characteristic Equation', formula: 'det(A - λI) = 0', note: 'Roots give eigenvalues λ' },
      { name: 'Trace Theorem', formula: 'Sum(λ_i) = Trace(A) = a11 + a22 + ... + ann', note: 'Sum of eigenvalues equals diagonal sum' },
      { name: 'Determinant Theorem', formula: 'Product(λ_i) = det(A)', note: 'Product of eigenvalues equals determinant' },
      { name: 'Rank-Nullity Theorem', formula: 'Rank(A) + Nullity(A) = n', note: 'n = total number of columns' },
      { name: 'Cayley-Hamilton', formula: 'p(A) = A^n + c_{n-1}A^{n-1} + ... + c_0I = O', note: 'Matrix satisfies its own char polynomial' }
    ]
  },
  {
    subjectCode: 'PHYS 101',
    subjectTitle: 'Engineering Physics',
    category: 'Optics & Quantum',
    formulas: [
      { name: 'Thin Film Interference (Reflected Bright)', formula: '2μt cos(r) = (2n - 1)λ / 2', note: 'Constructive with phase reversal' },
      { name: 'Thin Film Interference (Reflected Dark)', formula: '2μt cos(r) = nλ', note: 'Destructive interference condition' },
      { name: 'Diffraction Grating', formula: '(a + b) sin(θ) = nλ', note: '(a+b) is the grating element' },
      { name: 'Fiber Numerical Aperture', formula: 'NA = sqrt(n1^2 - n2^2)', note: 'Light gathering power of optical fiber' },
      { name: 'De Broglie Wavelength', formula: 'λ = h / p = h / (m*v)', note: 'Matter wave relationship' }
    ]
  },
  {
    subjectCode: 'ECE 101',
    subjectTitle: 'Fundamentals of Digital Electronics',
    category: 'Boolean Laws & De Morgan',
    formulas: [
      { name: 'De Morgan Law 1', formula: 'NOT(A + B) = NOT(A) * NOT(B)', note: 'NOR equivalent to Bubbled AND' },
      { name: 'De Morgan Law 2', formula: 'NOT(A * B) = NOT(A) + NOT(B)', note: 'NAND equivalent to Bubbled OR' },
      { name: 'Absorption Theorem', formula: 'A + A*B = A and A*(A + B) = A', note: 'Simplifies redundant product terms' },
      { name: 'Multiplexer Select Lines', formula: 'Number of Inputs = 2^n, where n = select lines', note: '4:1 MUX needs 2 lines, 8:1 needs 3' },
      { name: 'K-Map Grouping', formula: 'Group Size = 2^k (1, 2, 4, 8, 16 cells)', note: 'Eliminates k variables from SOP form' }
    ]
  },
  {
    subjectCode: 'MATH 102',
    subjectTitle: 'Quantitative Aptitude and Reasoning',
    category: 'Aptitude & Speed Formulas',
    formulas: [
      { name: 'Combined Work (2 Workers)', formula: 'Time = (x * y) / (x + y) days', note: 'When A takes x days and B takes y days' },
      { name: 'Speed Unit Conversion', formula: 'km/h -> m/s: Multiply by 5/18', note: 'm/s -> km/h: Multiply by 18/5' },
      { name: 'Average Speed (Equal Distances)', formula: 'Avg Speed = (2 * S1 * S2) / (S1 + S2)', note: 'Harmonic mean of speeds' },
      { name: 'Relative Speed (Opposite Direction)', formula: 'S_rel = S1 + S2', note: 'Moving towards each other' },
      { name: 'Relative Speed (Same Direction)', formula: 'S_rel = S1 - S2', note: 'Moving in identical direction' }
    ]
  }
];

// Default initial revision checklist items for the student
export const DEFAULT_EXAM_CHECKLIST = [
  { id: 'chk-1', text: 'Practice 5 Eigenvalues & Diagonalization problems (MATH 101)', completed: false, subjectCode: 'MATH 101' },
  { id: 'chk-2', text: 'Derive thin film interference equations for normal incidence (PHYS 101)', completed: false, subjectCode: 'PHYS 101' },
  { id: 'chk-3', text: 'Complete Python OOP inheritance & dunder methods mock test (CSE 101)', completed: false, subjectCode: 'CSE 101' },
  { id: 'chk-4', text: 'Minimize 4-variable K-Maps with don\'t-care conditions (ECE 101)', completed: false, subjectCode: 'ECE 101' },
  { id: 'chk-5', text: 'Review Git merge conflict resolution protocol (CSE 102)', completed: false, subjectCode: 'CSE 102' },
  { id: 'chk-6', text: 'Solve 10 Time, Work & Relative Speed aptitude questions (MATH 102)', completed: false, subjectCode: 'MATH 102' }
];

