export const ALL_SEMESTER_QUIZZES = {
  math101: {
    code: 'MATH 101',
    title: 'Linear Algebra and Calculus',
    questions: [
      {
        id: 'mq1',
        question: 'What are the eigenvalues of an upper triangular matrix?',
        options: [
          'The sum of all row elements',
          'The diagonal entries of the matrix',
          'Always zero for real matrices',
          'The determinant divided by the trace'
        ],
        correct: 1,
        explanation: 'For any triangular matrix (upper or lower), the eigenvalues are precisely the elements located along its main diagonal.'
      },
      {
        id: 'mq2',
        question: 'If a 4×4 matrix A has rank 3, what is the dimension of its null space (nullity)?',
        options: ['0', '1', '3', '4'],
        correct: 1,
        explanation: 'By the Rank-Nullity Theorem: Rank(A) + Nullity(A) = n. For n=4, 3 + Nullity = 4, so Nullity = 1.'
      },
      {
        id: 'mq3',
        question: 'Which condition guarantees that a real square matrix is orthogonally diagonalizable?',
        options: [
          'It is symmetric (A = A^T)',
          'Its determinant is non-zero',
          'All entries are positive integers',
          'Its trace equals zero'
        ],
        correct: 0,
        explanation: 'By the Spectral Theorem for real matrices, a matrix is orthogonally diagonalizable if and only if it is symmetric.'
      },
      {
        id: 'mq4',
        question: 'What does the Jacobian matrix represent in multivariable calculus?',
        options: [
          'The volume under a double integral',
          'The matrix of all first-order partial derivatives of a vector-valued function',
          'The eigenvalues of a second-order differential equation',
          'The inverse of the Laplacian operator'
        ],
        correct: 1,
        explanation: 'The Jacobian is the matrix of first-order partial derivatives, characterizing the best linear approximation of a multivariable transformation.'
      }
    ]
  },
  phy101: {
    code: 'PHY 101',
    title: 'Engineering Physics',
    questions: [
      {
        id: 'pq1',
        question: 'What is the condition for population inversion in a laser medium?',
        options: [
          'More atoms in ground state than excited state (N1 > N2)',
          'More atoms in higher energy state than lower state (N2 > N1)',
          'Equal distribution across all states',
          'Total ionization of the laser medium'
        ],
        correct: 1,
        explanation: 'Population inversion occurs when an upper metastable state has a higher population density than the lower energy state (N2 > N1).'
      },
      {
        id: 'pq2',
        question: 'The numerical aperture (NA) of an optical fiber depends on which properties?',
        options: [
          'Only the physical fiber length',
          'The refractive indices of the core and cladding',
          'The intensity of the input laser source',
          'The ambient atmospheric pressure'
        ],
        correct: 1,
        explanation: 'Numerical aperture is governed by NA = √(n_core² - n_cladding²), representing its light-gathering capability.'
      },
      {
        id: 'pq3',
        question: 'Why are Newton rings circular in thin film interference?',
        options: [
          'The lens surface is spherical, creating concentric loci of equal film thickness',
          'Light bends circularly in air',
          'Due to polarization of sodium light',
          'Because of gravitational lensing'
        ],
        correct: 0,
        explanation: 'The locus of points of constant air gap thickness between the spherical lens and the flat plate forms concentric circles.'
      }
    ]
  },
  cse101: {
    code: 'CSE 101',
    title: 'Problem Solving and Programming in Python',
    questions: [
      {
        id: 'cq1',
        question: 'What is the worst-case time complexity of Binary Search on a sorted array?',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        correct: 2,
        explanation: 'Binary search repeatedly divides the search space in half, resulting in logarithmic O(log n) time complexity.'
      },
      {
        id: 'cq2',
        question: 'Which of the following data types in Python is immutable?',
        options: ['List', 'Dictionary', 'Set', 'Tuple'],
        correct: 3,
        explanation: 'Tuples are immutable; their elements cannot be modified, added, or deleted once defined.'
      },
      {
        id: 'cq3',
        question: 'What is the output of print([x**2 for x in range(4) if x % 2 != 0])?',
        options: ['[0, 1, 4, 9]', '[1, 9]', '[1, 4]', '[0, 4]'],
        correct: 1,
        explanation: 'The odd numbers in range(4) are 1 and 3. Their squares are 1 and 9, giving [1, 9].'
      }
    ]
  },
  ece101: {
    code: 'ECE 101',
    title: 'Fundamentals of Digital Electronics',
    questions: [
      {
        id: 'eq1',
        question: 'How many cells are present in a 4-variable Karnaugh Map (K-Map)?',
        options: ['4', '8', '16', '32'],
        correct: 2,
        explanation: 'A K-map with n variables has 2^n cells. For 4 variables, 2^4 = 16 cells.'
      },
      {
        id: 'eq2',
        question: 'Which logic gate outputs HIGH (1) only when both inputs are unequal?',
        options: ['AND Gate', 'NOR Gate', 'XOR Gate', 'NAND Gate'],
        correct: 2,
        explanation: 'An XOR gate produces HIGH output when inputs differ (i.e. 0 and 1, or 1 and 0).'
      },
      {
        id: 'eq3',
        question: 'What is the principal difference between a latch and a flip-flop?',
        options: [
          'Latches are level-triggered, whereas flip-flops are edge-triggered clock devices',
          'Latches require three power supplies',
          'Flip-flops cannot store binary values',
          'Latches work only with analog voltage'
        ],
        correct: 0,
        explanation: 'Latches are sensitive to signal levels, while flip-flops transition state on clock edges.'
      }
    ]
  },
  eng103: {
    code: 'ENG 103',
    title: 'Digital Skill Workshop',
    questions: [
      {
        id: 'dq1',
        question: 'Which Git command is used to inspect the commit history of a repository?',
        options: ['git status', 'git commit', 'git log', 'git push'],
        correct: 2,
        explanation: 'git log displays the chronological sequence of commits made in the repository.'
      },
      {
        id: 'dq2',
        question: 'What does the command "chmod 755 script.sh" do in UNIX/Linux?',
        options: [
          'Deletes the file script.sh',
          'Gives read, write, and execute permissions to owner; read and execute to others',
          'Encrypts the file with a 755-bit key',
          'Compresses the script into a tar archive'
        ],
        correct: 1,
        explanation: 'In octal permissions, 7 = rwx (owner), 5 = r-x (group), and 5 = r-x (others).'
      }
    ]
  },
  eng104: {
    code: 'ENG 104',
    title: 'Quantitative Aptitude and Reasoning',
    questions: [
      {
        id: 'aq1',
        question: 'If A can finish a work in 10 days and B in 15 days, in how many days can they complete it together?',
        options: ['5 days', '6 days', '7.5 days', '8 days'],
        correct: 1,
        explanation: '1/Total = 1/10 + 1/15 = (3 + 2)/30 = 5/30 = 1/6. Total time required = 6 days.'
      },
      {
        id: 'aq2',
        question: 'A train 120m long passes a pole in 6 seconds. What is its speed in km/h?',
        options: ['20 km/h', '50 km/h', '72 km/h', '90 km/h'],
        correct: 2,
        explanation: 'Speed = 120 / 6 = 20 m/s. Converting to km/h: 20 * (18 / 5) = 72 km/h.'
      }
    ]
  },
  hum101: {
    code: 'HUM 101',
    title: 'English for Technical Communication',
    questions: [
      {
        id: 'hq1',
        question: 'Which voice is typically preferred in engineering research methodology sections?',
        options: [
          'Passive voice for objective, procedural detachment (e.g. "The sample was heated")',
          'Slang and colloquial phrasing',
          'First-person conversational dialogue',
          'Poetic meter'
        ],
        correct: 0,
        explanation: 'Passive or impersonal active constructions emphasize experimental procedures over the author.'
      },
      {
        id: 'hq2',
        question: 'What is the primary function of an Executive Summary in a technical proposal?',
        options: [
          'To list all dictionary definitions',
          'To provide a concise overview of problem, methodology, findings, and decision recommendations',
          'To acknowledge family members',
          'To replace the entire paper'
        ],
        correct: 1,
        explanation: 'An executive summary distills core objectives, findings, and actions for busy decision-makers.'
      }
    ]
  }
};

