// Sagevanta Daily Engineering Challenges
// High-yield, cross-branch daily conceptual micro-exercises with step-by-step solutions

export const DAILY_CHALLENGES = [
  {
    id: 'dc-2026-11-01',
    dayNumber: 1,
    title: "Newton's Rings Center Fringe Inversion",
    category: 'Engineering Physics & Optics',
    domain: 'Wave Optics',
    branchAffinity: ['all', 'ece', 'me', 'civil'],
    difficulty: 'Medium',
    question: "In Newton's Rings experiment viewed by reflected monochromatic light, why is the central spot always dark rather than bright?",
    options: [
      'The thickness of the air film at the central contact point is exactly equal to one full wavelength (t = λ)',
      'A phase shift of π radians (path difference of λ/2) occurs upon reflection at the lower optically denser glass plate boundary',
      'The plano-convex lens completely absorbs all reflected light at the vertex',
      'Destructive interference occurs because the upper lens surface has a higher refractive index than the glass plate'
    ],
    correctIndex: 1,
    formula: '2\\mu t \\cos(r) + \\frac{\\lambda}{2} = (2n + 1)\\frac{\\lambda}{2}',
    explanation:
      'At the center of contact, the air film thickness t = 0. However, light reflected from the lower denser glass plate boundary undergoes Stokes phase reversal corresponding to a path difference of λ/2 (π phase change). Thus, the effective path difference at t = 0 is exactly λ/2, satisfying the condition for destructive interference and producing a permanent central dark fringe.',
    keyTakeaway: 'Stokes phase shift of λ/2 always occurs when light reflects from a medium of higher optical density.'
  },
  {
    id: 'dc-2026-11-02',
    dayNumber: 2,
    title: 'Eigenvalues of a Triangular Matrix',
    category: 'Core Engineering Mathematics',
    domain: 'Linear Algebra',
    branchAffinity: ['all', 'cse', 'aiml', 'ds', 'ece', 'eee'],
    difficulty: 'Fundamental',
    question: 'Given an n × n upper triangular matrix U, what are its eigenvalues?',
    options: [
      'The sum of elements in each corresponding column',
      'The reciprocal of the determinant divided by trace(U)',
      'The main diagonal entries u₁₁, u₂₂, ..., uₙₙ themselves',
      'Always 0 or 1 for any real-valued upper triangular matrix'
    ],
    correctIndex: 2,
    formula: '\\det(U - \\lambda I) = (u_{11} - \\lambda)(u_{22} - \\lambda)\\dots(u_{nn} - \\lambda) = 0',
    explanation:
      'For any triangular matrix (upper or lower), the characteristic matrix (U - λI) remains triangular. Its determinant is strictly the product of its diagonal elements: (u₁₁ - λ)(u₂₂ - λ)...(uₙₙ - λ) = 0. The roots of this characteristic equation are precisely the diagonal entries.',
    keyTakeaway: 'The determinant and eigenvalues of any triangular matrix are immediately determined by its main diagonal.'
  },
  {
    id: 'dc-2026-11-03',
    dayNumber: 3,
    title: 'Universal Logic Gate Minimization',
    category: 'Digital Electronics & Computing',
    domain: 'Boolean Systems',
    branchAffinity: ['all', 'cse', 'it', 'ece', 'eee'],
    difficulty: 'Medium',
    question: 'What is the minimum number of 2-input NAND gates required to implement a 2-input XOR gate?',
    options: [
      '3 NAND gates',
      '4 NAND gates',
      '5 NAND gates',
      '6 NAND gates'
    ],
    correctIndex: 1,
    formula: 'A \\oplus B = (A \\cdot \\overline{A \\cdot B}) \\cdot (B \\cdot \\overline{A \\cdot B})',
    explanation:
      'A 2-input XOR function A ⊕ B = A\'B + AB\' can be efficiently implemented with exactly 4 two-input NAND gates by feeding the output of the first shared NAND gate G1 = (AB)\' into two intermediate NAND gates G2 = (A · G1)\' and G3 = (B · G1)\', and then combining their outputs with a final NAND gate G4 = (G2 · G3)\'.',
    keyTakeaway: 'Sharing intermediate terms (AB)\' reduces the gate count from 5 to 4.'
  },
  {
    id: 'dc-2026-11-04',
    dayNumber: 4,
    title: 'Time Complexity of Binary Heap Insertion',
    category: 'Algorithms & Data Structures',
    domain: 'Computer Science',
    branchAffinity: ['cse', 'it', 'aiml', 'ds'],
    difficulty: 'Fundamental',
    question: 'In a binary min-heap with N elements, what is the worst-case time complexity of inserting a single new element?',
    options: [
      'O(1)',
      'O(log N)',
      'O(N)',
      'O(N log N)'
    ],
    correctIndex: 1,
    formula: 'T_{insert}(N) = O(h) = O(\\lfloor \\log_2 N \\rfloor)',
    explanation:
      'Inserting an element involves placing it at the next available leaf position at the bottom of the complete binary tree and "bubbling up" (percolate up) along the path to the root. Because a complete binary tree with N nodes has a height of ⌊log₂ N⌋, at most log₂ N swaps are executed in the worst case.',
    keyTakeaway: 'Heap operations are bounded by tree height: O(log N).'
  },
  {
    id: 'dc-2026-11-05',
    dayNumber: 5,
    title: 'Thermal Efficiency of Carnot Cycle',
    category: 'Applied Thermodynamics',
    domain: 'Thermal Engineering',
    branchAffinity: ['me', 'che', 'civil'],
    difficulty: 'Fundamental',
    question: 'A reversible Carnot engine operates between heat reservoirs at T_H = 600 K and T_C = 300 K. What is its maximum theoretical thermal efficiency?',
    options: [
      '25%',
      '50%',
      '75%',
      '100%'
    ],
    correctIndex: 1,
    formula: '\\eta_{Carnot} = 1 - \\frac{T_C}{T_H} = 1 - \\frac{300}{600} = 0.50',
    explanation:
      'The theoretical upper bound on thermal efficiency for any heat engine operating between two thermal reservoirs is given by the Carnot theorem: η = 1 - (T_C / T_H), where temperatures MUST be in Kelvin. Here, η = 1 - (300 / 600) = 0.50 (50%).',
    keyTakeaway: 'No real heat engine can achieve higher efficiency than a reversible Carnot engine operating between the same temperature bounds.'
  }
];

export function getTodayChallenge() {
  const now = new Date();
  const dayOfYear = Math.floor(
    (now - new Date(now.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
  );
  const index = Math.abs(dayOfYear) % DAILY_CHALLENGES.length;
  return DAILY_CHALLENGES[index];
}

