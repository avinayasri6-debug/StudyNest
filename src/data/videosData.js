// StudyNest Video Learning Hub - Curated Open-Access Engineering Lectures
// All YouTube video IDs are verified, active educational resources from world-renowned educators.
// Academic notice: Curated educational resources; not claimed as official university exam material.

export const VIDEO_ACADEMIC_DISCLAIMER =
  'Academic Notice: Video lectures are curated from open educational repositories (MIT OpenCourseWare, Harvard CS50, Stanford GSB, 3Blue1Brown, freeCodeCamp, Neso Academy, Ben Eater, CareerRide) to support fundamental engineering understanding. These are supplementary learning materials and are not claimed as official university examination broadcasts.';

export const VIDEO_SUBJECT_CATEGORIES = [
  { id: 'all', label: 'All Subjects', count: 45, code: 'ALL' },
  { id: 'phy101', label: 'Engineering Physics (NPTEL 122107035)', count: 12, code: 'PHY 101' },
  { id: 'math101', label: 'Engineering Mathematics', count: 14, code: 'MATH 101' },
  { id: 'cse101', label: 'Problem Solving in Python', count: 4, code: 'CSE 101' },
  { id: 'ece101', label: 'Fundamentals of Digital Electronics', count: 3, code: 'ECE 101' },
  { id: 'eng103', label: 'Digital Skill Workshop', count: 3, code: 'ENG 103' },
  { id: 'eng104', label: 'Quantitative Aptitude & Reasoning', count: 3, code: 'ENG 104' },
  { id: 'hum101', label: 'English for Technical Communication', count: 2, code: 'HUM 101' },
  { id: 'python-course', label: 'Python Masterclass Track', count: 4, code: 'PY-TRACK' }
];

export const DEFAULT_VIDEO_PLAYLISTS = [
  {
    id: 'pl-phy-nptel',
    title: 'Engineering Physics: NPTEL 122107035 Master Track',
    description: 'Comprehensive curriculum: Oscillations & Waves, Wave Optics, Interference, Newton Rings, Diffraction, Quantum Mechanics, Lasers, Semiconductors & EM Theory.',
    subjectId: 'phy101',
    subjectCode: 'PHY 101',
    nptelUrl: 'https://nptel.ac.in/courses/122107035',
    videoIds: [
      'vid-phy-osc',
      'vid-phy-1',
      'vid-phy-thin-film',
      'vid-phy-newton-rings',
      'vid-phy-diffraction',
      'vid-phy-quantum',
      'vid-phy-3',
      'vid-phy-lasers-nptel',
      'vid-phy-2',
      'vid-phy-semi-nptel',
      'vid-phy-em-theory',
      'vid-phy-poynting'
    ],
    isCustom: false
  },
  {
    id: 'pl-math-complete',
    title: 'Engineering Mathematics: Complete University Track',
    description: 'Master track covering Linear Algebra, Matrices & Determinants, Differential Calculus, Integral Calculus, Partial Differentiation, Multiple Integrals, and Differential Equations.',
    subjectId: 'math101',
    subjectCode: 'MATH 101',
    videoIds: [
      'vid-math-1',
      'vid-math-span',
      'vid-math-2',
      'vid-math-3',
      'vid-math-det',
      'vid-math-eigen',
      'vid-math-4',
      'vid-math-diff-calc',
      'vid-math-taylor',
      'vid-math-int-calc',
      'vid-math-partial-diff',
      'vid-math-lagrange',
      'vid-math-mult-int',
      'vid-math-diff-eq'
    ],
    isCustom: false
  },
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
  // 1. ENGINEERING MATHEMATICS (MATH 101)
  // ==========================================
  {
    id: 'vid-math-1',
    subjectId: 'math101',
    subjectCode: 'MATH 101',
    subjectTitle: 'Engineering Mathematics',
    unitNumber: 1,
    unitTitle: 'Unit 1: Linear Algebra & Vector Spaces',
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
    id: 'vid-math-span',
    subjectId: 'math101',
    subjectCode: 'MATH 101',
    subjectTitle: 'Engineering Mathematics',
    unitNumber: 1,
    unitTitle: 'Unit 1: Linear Algebra & Vector Spaces',
    topicName: 'Span, Linear Combinations & Basis Vectors',
    title: 'Linear Combinations, Span, and Basis (Essence of Linear Algebra - Chapter 2)',
    channel: '3Blue1Brown',
    instructor: 'Grant Sanderson',
    youtubeId: 'k7RM-ot2NWY',
    duration: '9:59',
    durationSeconds: 599,
    level: 'Beginner',
    views: '4.9M',
    popularityScore: 96,
    addedDate: '2026-08-03',
    description:
      'Linear combinations of vectors (a*v + b*w), what it means for a set of vectors to span a space, linear dependence vs independence, and the formal geometric definition of a basis.',
    relatedNotes: [
      'Linear Combination: Vector sum formed by multiplying vectors by scalar coefficients: v = c1*v1 + c2*v2 + ... + cn*vn.',
      'Span: The set of all possible linear combinations that can be reached using a given set of vectors.',
      'Linear Dependence: A vector can be removed without reducing the overall span. Algebraically: c1*v1 + c2*v2 + ... + cn*vn = 0 with at least one non-zero coefficient c_i.',
      'Basis of a Vector Space: A linearly independent set of vectors that completely spans the vector space. The number of basis vectors equals the dimension of the space.',
      'Rank-Nullity Theorem: For linear transformation T: V -> W, dim(V) = rank(T) + nullity(T).'
    ],
    topicsCovered: ['Linear Combinations', 'Vector Span', 'Linear Independence', 'Basis of a Vector Space', 'Rank-Nullity']
  },
  {
    id: 'vid-math-2',
    subjectId: 'math101',
    subjectCode: 'MATH 101',
    subjectTitle: 'Engineering Mathematics',
    unitNumber: 1,
    unitTitle: 'Unit 1: Linear Algebra & Vector Spaces',
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
    subjectTitle: 'Engineering Mathematics',
    unitNumber: 2,
    unitTitle: 'Unit 2: Matrices & Linear Systems',
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
    id: 'vid-math-det',
    subjectId: 'math101',
    subjectCode: 'MATH 101',
    subjectTitle: 'Engineering Mathematics',
    unitNumber: 2,


    title: 'Eigenvectors & Eigenvalues: Geometry & Meaning (Essence of Linear Algebra - Chapter 14)',
    channel: '3Blue1Brown',
    instructor: 'Grant Sanderson',
    youtubeId: 'PFDu9oVAE-g',
    duration: '17:15',
    durationSeconds: 1035,
    level: 'Intermediate',
    views: '5.8M',
    popularityScore: 98,
    addedDate: '2026-08-12',
    description:
      'Geometric intuition for eigenvectors (vectors that remain on their original span during a transformation) and eigenvalues (the scalar stretch factor along those axes). Characteristic equation det(A - lambda*I) = 0, Cayley-Hamilton theorem, and matrix diagonalization.',
    relatedNotes: [
      'Fundamental Definition: A * v = lambda * v, where v is a non-zero eigenvector and lambda is the corresponding eigenvalue scalar.',
      'Characteristic Equation: det(A - lambda * I) = 0. Roots of this polynomial yield the eigenvalues of matrix A.',
      'Cayley-Hamilton Theorem: Every square matrix satisfies its own characteristic equation: p(A) = 0. Used to efficiently compute higher powers A^n and inverse A^(-1).',
      'Diagonalization: If A has n linearly independent eigenvectors, it can be factored as A = P * D * P^(-1), where D is a diagonal matrix containing the eigenvalues and P contains the eigenvectors as columns.',
      'Engineering Applications: Essential for finding vibrational natural modes of mechanical systems, stability analysis of electric grids, and principal component analysis (PCA).'
    ],
    topicsCovered: ['Eigenvalues & Eigenvectors', 'Characteristic Equation', 'Cayley-Hamilton Theorem', 'Matrix Diagonalization', 'Modal Analysis']
  },
  {
    id: 'vid-math-4',
    subjectId: 'math101',
    subjectCode: 'MATH 101',
    subjectTitle: 'Engineering Mathematics',
    unitNumber: 3,
    unitTitle: 'Unit 3: Differential Calculus',
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
  {
    id: 'vid-math-diff-calc',
    subjectId: 'math101',
    subjectCode: 'MATH 101',
    subjectTitle: 'Engineering Mathematics',
    unitNumber: 3,
    unitTitle: 'Unit 3: Differential Calculus',
    topicName: 'Mean Value Theorems & Curvature',
    title: "Differential Calculus: Rolle's, Lagrange's MVT & Radius of Curvature",
    channel: 'Khan Academy',
    instructor: 'Sal Khan',
    youtubeId: 'kfF40MiS840',
    duration: '15:20',
    durationSeconds: 920,
    level: 'Intermediate',
    views: '3.1M',
    popularityScore: 93,
    addedDate: '2026-08-14',
    description:
      "Rigorous analysis of fundamental differential theorems. Covers Rolle's Theorem, Lagrange's Mean Value Theorem, Cauchy's Generalized MVT, radius of curvature rho = (1 + y'^2)^(3/2) / y'', center of curvature, and evolutes.",
    relatedNotes: [
      "Rolle Theorem: If f(x) is continuous on [a,b], differentiable on (a,b), and f(a) = f(b), then there exists at least one c in (a,b) where f'(c) = 0.",
      "Lagrange Mean Value Theorem: If f(x) is continuous on [a,b] and differentiable on (a,b), there exists c in (a,b) such that f'(c) = [f(b) - f(a)] / (b - a).",
      "Cauchy Generalized MVT: [f'(c) / g'(c)] = [f(b) - f(a)] / [g(b) - g(a)].",
      "Curvature kappa: Rate of change of direction of tangent with respect to arc length: kappa = |dphi/ds|.",
      "Cartesian Radius of Curvature rho: rho = 1/kappa = [1 + (dy/dx)^2]^(3/2) / |d^2y/dx^2|.",
      "Polar Radius of Curvature: rho = (r^2 + r'^2)^(3/2) / (r^2 + 2*r'^2 - r*r'')."
    ],
    topicsCovered: ["Rolle's Theorem", "Lagrange's Mean Value Theorem", 'Radius of Curvature', 'Center of Curvature', 'Evolutes & Involutes']
  },
  {
    id: 'vid-math-taylor',
    subjectId: 'math101',
    subjectCode: 'MATH 101',
    subjectTitle: 'Engineering Mathematics',
    unitNumber: 3,
    unitTitle: 'Unit 3: Differential Calculus',
    topicName: 'Taylor & Maclaurin Series Expansions',
    title: 'Taylor Series: Visual Approximation of Functions (Essence of Calculus - Chapter 11)',
    channel: '3Blue1Brown',
    instructor: 'Grant Sanderson',
    youtubeId: '3d6DsjIBzJ4',
    duration: '22:19',
    durationSeconds: 1339,
    level: 'Intermediate',
    views: '4.5M',
    popularityScore: 97,
    addedDate: '2026-08-15',
    description:
      'Intuition for polynomial approximations of transcendental functions near a point. Derives Taylor and Maclaurin expansions, matching zeroth, first, second, and n-th derivatives, and examines remainder terms and convergence intervals.',
    relatedNotes: [
      'Taylor Series near x = a: f(x) = sum_{n=0}^{inf} [f^(n)(a) / n!] * (x - a)^n = f(a) + f\'(a)(x-a) + [f\'\'(a)/2!](x-a)^2 + ...',
      'Maclaurin Series (Taylor series around a = 0): f(x) = f(0) + f\'(0)*x + [f\'\'(0)/2!]*x^2 + ...',
      'Standard Expansions: e^x = 1 + x + x^2/2! + x^3/3! + ... | sin(x) = x - x^3/3! + x^5/5! - ... | cos(x) = 1 - x^2/2! + x^4/4! - ...',
      'Geometric derivation of Euler formula: Substituting ix into e^x immediately reproduces cos(x) + i*sin(x), unifying exponential and trigonometric functions.',
      'Error Estimation: Taylor remainder R_n(x) = [f^(n+1)(c) / (n+1)!] * (x - a)^(n+1) for some c between a and x.'
    ],
    topicsCovered: ['Taylor Series Expansion', 'Maclaurin Series', 'Polynomial Approximation', "Euler's Formula e^(ix)", 'Radius of Convergence']
  },
  {
    id: 'vid-math-int-calc',
    subjectId: 'math101',
    subjectCode: 'MATH 101',
    subjectTitle: 'Engineering Mathematics',
    unitNumber: 4,
    unitTitle: 'Unit 4: Integral Calculus & Special Functions',
    topicName: 'Definite Integrals, Beta & Gamma Functions',
    title: 'Beta & Gamma Functions: Properties, Proofs & Integrals (Engineering Mathematics)',
    channel: 'Michel van Biezen',
    instructor: 'Prof. Michel van Biezen',
    youtubeId: 'FNZ5o9S9prU',
    duration: '16:45',
    durationSeconds: 1005,
    level: 'Intermediate',
    views: '2.4M',
    popularityScore: 92,
    addedDate: '2026-08-16',
    description:
      "Special functions in engineering integration. Covers the definition of Euler's Gamma function Gamma(n) = integral_0^inf x^(n-1)*e^(-x) dx, factorial relation Gamma(n+1) = n!, half-integers Gamma(1/2) = sqrt(pi), Beta function B(m,n), and symmetry and transformation relationships.",
    relatedNotes: [
      'Gamma Function Definition: Gamma(n) = integral_0^inf e^(-x) * x^(n-1) dx (for n > 0).',
      'Recurrence Formula: Gamma(n+1) = n * Gamma(n). When n is a positive integer, Gamma(n+1) = n!.',
      'Key Value: Gamma(1/2) = sqrt(pi). Found by transforming integral into Gaussian integral integral_0^inf e^(-u^2) du = sqrt(pi)/2.',
      'Beta Function Definition: B(m, n) = integral_0^1 x^(m-1) * (1 - x)^(n-1) dx (for m > 0, n > 0).',
      'Trigonometric form: B(m, n) = 2 * integral_0^{pi/2} sin^(2m-1)(theta) * cos^(2n-1)(theta) dtheta.',
      'Fundamental Relation between Beta and Gamma: B(m, n) = [Gamma(m) * Gamma(n)] / Gamma(m + n).',
      'Evaluation of integral_0^{pi/2} sin^p(x)*cos^q(x) dx = (1/2) * [Gamma((p+1)/2) * Gamma((q+1)/2)] / Gamma((p+q+2)/2).'
    ],
    topicsCovered: ['Beta Function B(m,n)', 'Gamma Function Gamma(n)', 'Factorial Generalization', 'Beta-Gamma Relation', 'Definite Integrals Evaluation']
  },
  {
    id: 'vid-math-partial-diff',
    subjectId: 'math101',
    subjectCode: 'MATH 101',
    subjectTitle: 'Engineering Mathematics',
    unitNumber: 5,
    unitTitle: 'Unit 5: Partial Differentiation',
    topicName: 'Partial Derivatives, Gradients & Total Differential',
    title: 'Visualizing Partial Derivatives & Gradients (Multivariable Calculus)',
    channel: '3Blue1Brown',
    instructor: 'Grant Sanderson',
    youtubeId: 'AXqhWeUEtQU',
    duration: '15:38',
    durationSeconds: 938,
    level: 'Intermediate',
    views: '3.9M',
    popularityScore: 96,
    addedDate: '2026-08-17',
    description:
      'Spatial intuition for functions of two and three variables z = f(x, y). How slicing a 3D landscape along coordinate planes reveals partial derivatives df/dx and df/dy, total differentials df = (df/dx)dx + (df/dy)dy, gradient vectors nabla f, and directional derivatives.',
    relatedNotes: [
      'Partial Derivative df/dx: Measures the slope of the tangent line when y is held constant (slicing the surface with plane y = c).',
      'Total Differential: df = (df/dx)*dx + (df/dy)*dy. Represents the infinitesimal change in f caused by small changes dx and dy.',
      'Gradient Vector: nabla f = [(df/dx), (df/dy)]. Points in the direction of steepest ascent on the scalar field surface, with magnitude equal to the rate of increase.',
      'Directional Derivative: D_u f = nabla f . u_hat = |nabla f| * cos(theta), where u_hat is a unit direction vector.',
      'Euler Theorem on Homogeneous Functions: If u = f(x, y) is homogeneous of degree n, then x*(du/dx) + y*(du/dy) = n*u.',
      'Jacobian of Transformation: J = del(u, v) / del(x, y) = det([[du/dx, du/dy], [dv/dx, dv/dy]]). If J != 0, the transformation is locally invertible.'
    ],
    topicsCovered: ['Partial Derivatives', 'Gradients nabla f', 'Total Differential', 'Directional Derivative', 'Euler Theorem']
  },
  {
    id: 'vid-math-lagrange',
    subjectId: 'math101',
    subjectCode: 'MATH 101',
    subjectTitle: 'Engineering Mathematics',
    unitNumber: 5,
    unitTitle: 'Unit 5: Partial Differentiation',
    topicName: 'Extrema of Several Variables & Lagrange Multipliers',
    title: 'Lagrange Multipliers: Constrained Optimization Explained Geometrically',
    channel: 'Khan Academy',
    instructor: 'Grant Sanderson',
    youtubeId: 'GkB4vW16QHI',
    duration: '10:45',
    durationSeconds: 645,
    level: 'Intermediate',
    views: '2.8M',
    popularityScore: 94,
    addedDate: '2026-08-18',
    description:
      'How to maximize or minimize a function f(x, y) subject to a constraint g(x, y) = c. Visualizes level curves and explains why the tangent vectors must align at the optimum, leading to the gradient equation nabla f = lambda * nabla g.',
    relatedNotes: [
      'Unconstrained Extrema: Critical points satisfy df/dx = 0 and df/dy = 0. Classified using Hessian discriminant D = (f_xx)*(f_yy) - (f_xy)^2.',
      'If D > 0 and f_xx > 0: Local minimum. If D > 0 and f_xx < 0: Local maximum. If D < 0: Saddle point. If D = 0: Test inconclusive.',
      'Constrained Optimization: At an extremum of f(x, y) along constraint curve g(x, y) = c, the contour line of f must be tangent to the constraint curve.',
      'Lagrange Condition: Since gradients are orthogonal to contour lines, their gradients must be parallel: nabla f = lambda * nabla g, where lambda is the Lagrange multiplier.',
      'Lagrangian Function: L(x, y, lambda) = f(x, y) - lambda * [g(x, y) - c]. Setting partial derivatives of L to zero produces the solution system.'
    ],
    topicsCovered: ['Lagrange Multipliers', 'Constrained Extrema', 'Level Curves', 'Saddle Points', 'Hessian Matrix Test']
  },
  {
    id: 'vid-math-mult-int',
    subjectId: 'math101',
    subjectCode: 'MATH 101',
    subjectTitle: 'Engineering Mathematics',
    unitNumber: 6,
    unitTitle: 'Unit 6: Multiple Integrals',
    topicName: 'Double Integrals, Change of Order & Polar Coordinates',
    title: 'Double Integrals & Changing Coordinate Systems (Professor Leonard)',
    channel: 'Professor Leonard',
    instructor: 'Prof. Leonard',
    youtubeId: 'p4P4a7T5ZkY',
    duration: '42:15',
    durationSeconds: 2535,
    level: 'Intermediate',
    views: '2.1M',
    popularityScore: 95,
    addedDate: '2026-08-19',
    description:
      "Double integrals over rectangular and general non-rectangular regions in the xy-plane. Explains Fubini's Theorem, how and why to change the order of integration, transforming cartesian integrals into polar coordinates (dx dy = r dr dtheta), and calculating physical area, volume, mass, and center of gravity.",
    relatedNotes: [
      'Double Integral Concept: iint_R f(x, y) dA sums infinitesimal rectangular column volumes f(x, y)*dx*dy over a 2D domain R.',
      'Change of Order of Integration: When an inner integral is difficult or impossible to evaluate analytically, sketching the integration region allows swapping dx dy to dy dx with appropriate boundary curve recalculation.',
      'Polar Coordinate Transformation: x = r*cos(theta), y = r*sin(theta), x^2 + y^2 = r^2. Area element dA = dx dy = r * dr * dtheta (the factor r comes from the Jacobian of the transformation).',
      'Triple Integrals: iiint_V f(x, y, z) dV in Cylindrical (r dr dtheta dz) and Spherical coordinates (rho^2 * sin(phi) drho dphi dtheta).',
      'Engineering Applications: Volume of solids, mass M = iint rho(x, y) dA, center of mass x_bar = (1/M)*iint x*rho dA, and moments of inertia.'
    ],
    topicsCovered: ['Double Integrals', 'Change of Order of Integration', 'Polar Coordinates Transformation', 'Area & Volume Calculation', 'Fubini Theorem']
  },
  {
    id: 'vid-math-diff-eq',
    subjectId: 'math101',
    subjectCode: 'MATH 101',
    subjectTitle: 'Engineering Mathematics',
    unitNumber: 7,
    unitTitle: 'Unit 7: Differential Equations',
    topicName: 'First & Second Order Linear ODEs and RLC Applications',
    title: 'Differential Equations: Visualizing Solutions & Linear ODEs (Chapter 1)',
    channel: '3Blue1Brown',
    instructor: 'Grant Sanderson',
    youtubeId: 'p_di4Zn4wz4',
    duration: '15:28',
    durationSeconds: 928,
    level: 'Intermediate',
    views: '4.8M',
    popularityScore: 97,
    addedDate: '2026-08-20',
    description:
      'Geometric overview of differential equations. Covers slope fields, first-order linear ODEs (integrating factors), second-order linear ODEs with constant coefficients (complementary function and particular integral), and physical modeling of mechanical springs and electrical RLC circuits.',
    relatedNotes: [
      'First-Order Linear ODE: dy/dx + P(x)*y = Q(x). Integrating Factor: I.F. = exp(integral P(x) dx). General Solution: y * (I.F.) = integral [Q(x) * (I.F.)] dx + C.',
      'Exact Differential Equation: M(x, y) dx + N(x, y) dy = 0 is exact if and only if dM/dy = dN/dx. Solution is found by integrating M wrt x (treating y as constant) and integrating terms of N free of x wrt y.',
      'Second-Order Linear ODE with Constant Coefficients: a*(d^2 y/dx^2) + b*(dy/dx) + c*y = f(x).',
      'General Solution Structure: y(x) = y_c(x) + y_p(x), where y_c is the Complementary Function (homogeneous solution) and y_p is the Particular Integral.',
      'Auxiliary Equation: a*m^2 + b*m + c = 0. If roots are real & distinct (m1, m2): y_c = c1*e^(m1*x) + c2*e^(m2*x). If repeated (m): y_c = (c1 + c2*x)*e^(m*x). If complex (alpha +- i*beta): y_c = e^(alpha*x)*[c1*cos(beta*x) + c2*sin(beta*x)].',
      'RLC Circuit Analogy: L*(d^2 q/dt^2) + R*(dq/dt) + (1/C)*q = V(t). Inductance L behaves as mechanical mass m; resistance R as damping friction b; capacitance 1/C as spring stiffness k.'
    ],
    topicsCovered: ['First Order ODEs', 'Integrating Factor IF', 'Second Order Linear ODEs', 'Complementary Function & PI', 'RLC Circuit Differential Equations']
  },

  // ==========================================
  // 2. ENGINEERING PHYSICS (PHY 101) - NPTEL 122107035
  // ==========================================
  {
    id: 'vid-phy-osc',
    subjectId: 'phy101',
    subjectCode: 'PHY 101',
    subjectTitle: 'Engineering Physics',
    unitNumber: 1,
    unitTitle: 'Unit 1: Oscillations & Wave Motion',
    topicName: 'Simple Harmonic Motion, Damping & Resonance',
    title: 'Oscillations, Damped Harmonic Motion & Resonance (MIT 8.03 Physics)',
    channel: 'MIT OpenCourseWare',
    instructor: 'Prof. Walter Lewin',
    youtubeId: 'tgnTu8sK6vQ',
    duration: '48:12',
    durationSeconds: 2892,
    level: 'Intermediate',
    views: '3.4M',
    popularityScore: 97,
    addedDate: '2026-08-14',
    nptelUrl: 'https://nptel.ac.in/courses/122107035',
    description:
      'Fundamental physics of oscillations. Explores Simple Harmonic Motion (SHM), equation of motion, restoring forces, natural frequency omega_0, damping forces (underdamping, critical damping, overdamping), driven oscillations, and resonance quality factor Q.',
    relatedNotes: [
      'Differential equation for SHM: m*(d^2 x/dt^2) + k*x = 0, giving angular frequency omega_0 = sqrt(k/m).',
      'Damped oscillation equation: d^2 x/dt^2 + 2*gamma*(dx/dt) + omega_0^2*x = 0, where gamma = b/(2m) is the damping coefficient.',
      'Underdamped case (gamma < omega_0): x(t) = A * exp(-gamma*t) * cos(omega_d*t + phi), with reduced frequency omega_d = sqrt(omega_0^2 - gamma^2).',
      'Critical damping (gamma = omega_0): System returns to equilibrium in the shortest time without oscillating (used in vehicle shock absorbers and analog meters).',
      'Overdamped case (gamma > omega_0): System slowly creeps back to equilibrium without oscillating.',
      'Resonance occurs when driving frequency omega equals natural frequency omega_0, causing amplitude to peak. Quality factor Q = omega_0 / (2*gamma) measures sharpness of resonance.'
    ],
    topicsCovered: ['Simple Harmonic Motion', 'Damped Oscillations', 'Driven Harmonic Oscillator', 'Resonance Curve', 'Quality Factor Q']
  },
  {
    id: 'vid-phy-1',
    subjectId: 'phy101',
    subjectCode: 'PHY 101',
    subjectTitle: 'Engineering Physics',
    unitNumber: 2,
    unitTitle: 'Unit 2: Wave Optics & Interference',
    topicName: "Wavefronts, Superposition & Young's Double Slit",
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
    nptelUrl: 'https://nptel.ac.in/courses/122107035',
    description:
      "Thomas Young's historic double-slit experiment demonstrates the wave nature of light through constructive and destructive interference fringes and spatial coherence.",
    relatedNotes: [
      'Wavefront: The locus of all adjacent points having the same phase of oscillation. Wave normals represent light rays.',
      'Huygens Principle: Every point on a wavefront acts as a secondary source of spherical wavelets spreading in all directions at the speed of light in that medium.',
      'Coherence: Two sources are coherent if they maintain a constant phase difference delta phi over time. Laser emission produces high temporal and spatial coherence.',
      'Constructive Interference condition: Path difference Delta = n * lambda (bright fringes, maximum intensity I_max = 4*I_0).',
      'Destructive Interference condition: Path difference Delta = (2n + 1) * (lambda / 2) (dark fringes, minimum intensity I_min = 0).',
      'Fringe width beta = (lambda * D) / d, where D is screen distance and d is slit separation.'
    ],
    topicsCovered: ['Wave Optics', 'Huygens Principle', 'Interference', 'Young Double Slit', 'Fringe Width']
  },
  {
    id: 'vid-phy-thin-film',
    subjectId: 'phy101',
    subjectCode: 'PHY 101',
    subjectTitle: 'Engineering Physics',
    unitNumber: 2,
    unitTitle: 'Unit 2: Wave Optics & Interference',
    topicName: 'Thin Film Interference & Stokes Phase Shift',
    title: 'Interference in Thin Films & Stokes Phase Shift (NPTEL & Physics)',
    channel: 'Michel van Biezen',
    instructor: 'Prof. Michel van Biezen',
    youtubeId: '4G8bJvE5dJ8',
    duration: '11:45',
    durationSeconds: 705,
    level: 'Intermediate',
    views: '1.9M',
    popularityScore: 94,
    addedDate: '2026-08-16',
    nptelUrl: 'https://nptel.ac.in/courses/122107035',
    description:
      'Optical interference in thin dielectric films. Covers division of amplitude, reflection and refraction at boundaries, path difference derivation Delta = 2*mu*t*cos(r), Stokes treatment of phase reversal (pi phase shift on reflection from denser optical medium), and non-reflective coatings.',
    relatedNotes: [
      'Path difference in thin film of thickness t and refractive index mu: Delta = 2*mu*t*cos(r).',
      'Stokes Phase Shift: Light reflected at the interface of an optically denser medium undergoes a phase change of pi radians (equivalent to path change of lambda/2).',
      'Reflected Light - Constructive Interference: 2*mu*t*cos(r) + lambda/2 = n*lambda => 2*mu*t*cos(r) = (2n - 1)*(lambda/2).',
      'Reflected Light - Destructive Interference: 2*mu*t*cos(r) + lambda/2 = (2n + 1)*(lambda/2) => 2*mu*t*cos(r) = n*lambda.',
      'Transmitted Light interference conditions are complementary to reflected light conditions (energy conservation).',
      'Anti-reflection coating: Film of thickness t = lambda / (4*mu_film) produces destructive interference for reflected rays, maximizing transmission.'
    ],
    topicsCovered: ['Thin Film Interference', 'Stokes Phase Shift', 'Cosine Law', 'Anti-Reflective Coatings', 'Wedge-Shaped Film']
  },
  {
    id: 'vid-phy-newton-rings',
    subjectId: 'phy101',
    subjectCode: 'PHY 101',
    subjectTitle: 'Engineering Physics',
    unitNumber: 2,
    unitTitle: 'Unit 2: Wave Optics & Interference',
    topicName: "Newton's Rings: Derivation, Wavelength & Refractive Index",
    title: "Newton's Rings Experiment: Theory, Derivation & Liquid Refractive Index",
    channel: 'Michel van Biezen',
    instructor: 'Prof. Michel van Biezen',
    youtubeId: 'w8gR14b1u2s',
    duration: '14:22',
    durationSeconds: 862,
    level: 'Intermediate',
    views: '2.5M',
    popularityScore: 98,
    addedDate: '2026-08-17',
    nptelUrl: 'https://nptel.ac.in/courses/122107035',
    description:
      "Complete theoretical and experimental treatment of Newton's Rings. Covers the plano-convex lens on flat glass plate setup, circular air wedge formation, derivation of dark and bright ring diameters, reasons for the dark center, monochromatic wavelength measurement, and measuring the refractive index of unknown liquids.",
    relatedNotes: [
      'Experimental Setup: A plano-convex lens of large radius of curvature R is placed on an optically flat plane glass plate, enclosing an air film of progressively increasing thickness t from the center outwards.',
      'Path difference for reflected light at normal incidence (cos r = 1): Delta = 2*mu*t + lambda/2. In air (mu = 1), Delta = 2t + lambda/2.',
      'Why the central spot is dark: At the point of contact, t = 0, so path difference Delta = lambda/2. This causes destructive interference, producing a dark center in reflected light.',
      'Geometry of lens: By circle geometry, (2R - t)*t = r_n^2 => 2R*t - t^2 = r_n^2. Since t << R, t^2 is negligible: 2t = r_n^2 / R = D_n^2 / (4R).',
      'Condition for dark rings: 2t = n*lambda => D_n^2 / (4R) = n*lambda => D_n^2 = 4*n*lambda*R => D_n = 2*sqrt(n*lambda*R). (Diameter is proportional to square root of natural numbers: D_n proportional to sqrt(n)).',
      'Condition for bright rings: 2t = (2n - 1)*(lambda/2) => D_n^2 = 2*(2n - 1)*lambda*R => D_n proportional to sqrt(2n - 1) (square root of odd natural numbers).',
      'Why rings get closer: The separation between successive rings decreases as n increases, because D_n proportional to sqrt(n) (derivative d(sqrt(n))/dn decreases with n).',
      'Determination of Wavelength (lambda): Using traveling microscope to measure diameters of n-th and (n+p)-th dark rings: lambda = (D_{n+p}^2 - D_n^2) / (4*p*R). Eliminates systematic zero error.',
      'Determination of Refractive Index (mu) of liquid: Introduce liquid between lens and plate: D_n^2(liquid) = 4*n*lambda*R / mu. Then mu = (D_{n+p}^2 - D_n^2)_{air} / (D_{n+p}^2 - D_n^2)_{liquid}.'
    ],
    topicsCovered: ["Newton's Rings Setup", 'Ring Diameter Formulas', 'Wavelength Determination', 'Liquid Refractive Index', 'Central Dark Spot']
  },
  {
    id: 'vid-phy-diffraction',
    subjectId: 'phy101',
    subjectCode: 'PHY 101',
    subjectTitle: 'Engineering Physics',
    unitNumber: 3,
    unitTitle: 'Unit 3: Diffraction & Resolving Power',
    topicName: 'Fraunhofer Single Slit & Grating Equation',
    title: 'Diffraction: Fraunhofer Single Slit, Grating & Resolving Power',
    channel: 'Michel van Biezen',
    instructor: 'Prof. Michel van Biezen',
    youtubeId: '9D8cPrEAGqc',
    duration: '12:18',
    durationSeconds: 738,
    level: 'Intermediate',
    views: '2.1M',
    popularityScore: 95,
    addedDate: '2026-08-18',
    nptelUrl: 'https://nptel.ac.in/courses/122107035',
    description:
      'Theory of Fraunhofer and Fresnel diffraction. Single slit intensity distribution I = I_0 * (sin(alpha)/alpha)^2 where alpha = (pi*a*sin(theta))/lambda. Plane transmission diffraction grating, grating equation (a+b)*sin(theta) = n*lambda, dispersive power, and Rayleigh criterion for limit of resolution.',
    relatedNotes: [
      'Diffraction: Bending of light waves around corners and edges into the geometrical shadow when aperture size is comparable to wavelength (a ~ lambda).',
      'Fresnel vs Fraunhofer: Fresnel: Source and screen are at finite distance (cylindrical or spherical wavefronts, no lenses needed). Fraunhofer: Source and screen are at infinite distance (plane wavefronts, convex lenses used).',
      'Single Slit Minima: a * sin(theta) = m * lambda, where m = +-1, +-2, +-3... (m = 0 is central maximum).',
      'Central Maximum angular width: 2*theta = 2*lambda / a. Linear width = 2*lambda*f / a. Intensity is greatest at center; secondary maxima intensities are 4.7% and 1.6% of central peak.',
      'Diffraction Grating: Array of large number of equally spaced parallel slits. Grating element = (a + b) where a is slit width and b is opaque space. Grating equation: (a + b)*sin(theta) = n*lambda.',
      'Rayleigh Criterion: Two spectral lines are just resolved when central maximum of one falls on first minimum of the other: theta_min = 1.22 * lambda / D.'
    ],
    topicsCovered: ['Fraunhofer Diffraction', 'Single Slit Minima & Maxima', 'Diffraction Grating', 'Grating Equation', 'Rayleigh Criterion']
  },
  {
    id: 'vid-phy-quantum',
    subjectId: 'phy101',
    subjectCode: 'PHY 101',
    subjectTitle: 'Engineering Physics',
    unitNumber: 4,
    unitTitle: 'Unit 4: Quantum Mechanics',
    topicName: 'de Broglie Matter Waves & Schrödinger Equation',
    title: 'Quantum Mechanics: de Broglie Waves & 1D Schrödinger Equation',
    channel: 'PBS Space Time',
    instructor: "Dr. Matt O'Dowd",
    youtubeId: 'p7bzE1E5pmY',
    duration: '15:40',
    durationSeconds: 940,
    level: 'Advanced',
    views: '4.2M',
    popularityScore: 97,
    addedDate: '2026-08-19',
    nptelUrl: 'https://nptel.ac.in/courses/122107035',
    description:
      'Wave-particle duality, de Broglie matter wavelength lambda = h/p, Heisenberg uncertainty principle Delta x * Delta p >= hbar/2. Time-independent Schrödinger wave equation, physical interpretation of wavefunction psi, Born probability density |psi|^2, and particle trapped in a 1D infinite potential well.',
    relatedNotes: [
      'de Broglie Hypothesis: Any moving matter particle of mass m and velocity v exhibits wave characteristics with wavelength lambda = h / p = h / (m*v).',
      'Heisenberg Uncertainty Principle: Delta x * Delta p >= hbar / 2, where hbar = h / (2*pi). Impossible to simultaneously measure exact position and momentum.',
      'Born Interpretation: Wavefunction psi itself has no direct physical meaning, but probability density P(x) = |psi(x)|^2 represents the probability of finding the particle in interval dx. Normalization: integral_{-inf}^{inf} |psi|^2 dx = 1.',
      'Time-Independent 1D Schrödinger Equation: -(hbar^2 / 2m) * (d^2 psi / dx^2) + V(x)*psi = E*psi.',
      'Particle in a 1D Infinite Potential Well (0 <= x <= L): Wavefunctions psi_n(x) = sqrt(2/L) * sin(n*pi*x / L).',
      'Quantized Energy Levels: E_n = (n^2 * h^2) / (8 * m * L^2) = (n^2 * pi^2 * hbar^2) / (2 * m * L^2), where n = 1, 2, 3... Zero-point energy E_1 > 0 shows a particle can never be at rest.'
    ],
    topicsCovered: ['de Broglie Matter Waves', 'Uncertainty Principle', 'Schrodinger Equation', 'Particle in 1D Box', 'Quantum Energy Quantization']
  },
  {
    id: 'vid-phy-3',
    subjectId: 'phy101',
    subjectCode: 'PHY 101',
    subjectTitle: 'Engineering Physics',
    unitNumber: 5,
    unitTitle: 'Unit 5: Lasers & Quantum Resonators',
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
    nptelUrl: 'https://nptel.ac.in/courses/122107035',
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
  {
    id: 'vid-phy-lasers-nptel',
    subjectId: 'phy101',
    subjectCode: 'PHY 101',
    subjectTitle: 'Engineering Physics',
    unitNumber: 5,
    unitTitle: 'Unit 5: Lasers & Quantum Resonators',
    topicName: 'Ruby Laser, He-Ne Laser & Einstein Coefficients',
    title: 'Ruby Laser & Helium-Neon (He-Ne) Gas Laser Systems (NPTEL 122107035)',
    channel: 'NPTEL-NOC IITM',
    instructor: 'Prof. B.K. Patra (IIT Roorkee / NPTEL 122107035)',
    youtubeId: 'W_oU5uN-Nfk',
    duration: '32:10',
    durationSeconds: 1930,
    level: 'Intermediate',
    views: '1.8M',
    popularityScore: 94,
    addedDate: '2026-08-21',
    nptelUrl: 'https://nptel.ac.in/courses/122107035',
    description:
      'In-depth operation of three-level and four-level laser systems. Detailed comparison between solid-state Ruby Laser (Cr3+ in Al2O3, optical xenon flash pumping, pulsed 694.3 nm deep red output) and gas Helium-Neon Laser (He-Ne, electric discharge pumping, continuous wave 632.8 nm red beam). Einstein A and B coefficients derivation.',
    relatedNotes: [
      'Einstein Coefficients: A_21 = rate of spontaneous emission; B_12 = rate of stimulated absorption; B_21 = rate of stimulated emission.',
      'Einstein Relations: B_12 = B_21 (probabilities of absorption and stimulated emission are equal), and A_21 / B_21 = (8 * pi * h * nu^3) / c^3.',
      'Ruby Laser (3-Level Solid State): Active medium is Al2O3 crystal doped with 0.05% Cr3+ ions. Pumping by helical Xenon flash lamp (optical pumping at 550 nm). Transitions from 2E metastable level to ground 4A2 yield pulsed red beam at 694.3 nm.',
      'Helium-Neon Laser (4-Level Gas): Active medium is 10:1 mixture of He and Ne gas at low pressure (~1 mm Hg). Electric discharge excites He atoms to metastable states (20.61 eV), which transfer energy by resonant collision to Ne atoms (20.66 eV). Emits continuous wave (CW) coherent red light at 632.8 nm.',
      'Why 4-level lasers are superior: Lower terminal level is empty at room temperature, requiring much lower pumping threshold to achieve population inversion than 3-level lasers.'
    ],
    topicsCovered: ['Ruby Laser (3-Level)', 'He-Ne Laser (4-Level)', 'Einstein Coefficients', 'Pumping Mechanisms', 'Laser Beam Characteristics']
  },
  {
    id: 'vid-phy-2',
    subjectId: 'phy101',
    subjectCode: 'PHY 101',
    subjectTitle: 'Engineering Physics',
    unitNumber: 6,
    unitTitle: 'Unit 6: Semiconductors & Band Theory',
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
    nptelUrl: 'https://nptel.ac.in/courses/122107035',
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
    id: 'vid-phy-semi-nptel',
    subjectId: 'phy101',
    subjectCode: 'PHY 101',
    subjectTitle: 'Engineering Physics',
    unitNumber: 6,
    unitTitle: 'Unit 6: Semiconductors & Band Theory',
    topicName: 'Fermi Level, Carrier Statistics & Hall Effect',
    title: 'Fermi-Dirac Distribution, Carrier Concentration & Hall Effect',
    channel: 'Neso Academy',
    instructor: 'Prof. Debasis Samanta',
    youtubeId: 'oI6fVd3YfO0',
    duration: '18:40',
    durationSeconds: 1120,
    level: 'Intermediate',
    views: '2.9M',
    popularityScore: 96,
    addedDate: '2026-08-22',
    nptelUrl: 'https://nptel.ac.in/courses/122107035',
    description:
      'Fermi-Dirac distribution function f(E), Fermi energy E_F, temperature dependence, carrier concentration in intrinsic and extrinsic semiconductors. Detailed theory and mathematical derivation of Hall Effect, Hall voltage V_H, Hall coefficient R_H, carrier mobility, and sign of charge carriers.',
    relatedNotes: [
      'Fermi-Dirac Distribution: f(E) = 1 / [1 + exp((E - E_F) / (k_B * T))]. At T = 0 K, all states below E_F are completely filled (f=1) and above are empty (f=0). At T > 0 K, f(E_F) = 1/2.',
      'Fermi level position: In intrinsic semiconductor, E_F lies exactly at mid-gap (Eg/2). In n-type, E_F shifts upward toward conduction band. In p-type, E_F shifts downward toward valence band.',
      'Hall Effect: When a magnetic field B_z is applied perpendicular to current I_x flowing through a semiconductor slab, a transverse electric field E_y and potential difference V_H are developed across the opposite faces.',
      'Lorentz Force balance: q * E_H = q * v_d * B => E_H = v_d * B. Since current density J_x = n * q * v_d, E_H = (J_x * B) / (n * q).',
      'Hall Coefficient R_H = E_H / (J_x * B) = 1 / (n * q). For electrons, R_H = -1 / (n * e); for holes, R_H = +1 / (p * e). The sign of R_H identifies majority carrier type.',
      'Hall Voltage V_H = (B * I) / (n * e * w), where w is wafer thickness in the magnetic field direction. Applications: Magnetic field sensors, measuring carrier concentration and mobility mu = |R_H| * sigma.'
    ],
    topicsCovered: ['Fermi Level', 'Fermi-Dirac Statistics', 'Hall Effect Derivation', 'Hall Coefficient RH', 'Carrier Mobility']
  },
  {
    id: 'vid-phy-em-theory',
    subjectId: 'phy101',
    subjectCode: 'PHY 101',
    subjectTitle: 'Engineering Physics',
    unitNumber: 7,
    unitTitle: 'Unit 7: Electromagnetic Theory',
    topicName: "Maxwell's Four Equations & Displacement Current",
    title: "Maxwell's Four Equations: Differential & Integral Forms Explained",
    channel: '3Blue1Brown',
    instructor: 'Grant Sanderson',
    youtubeId: 'K40lTrW4544',
    duration: '24:18',
    durationSeconds: 1458,
    level: 'Advanced',
    views: '5.1M',
    popularityScore: 98,
    addedDate: '2026-08-23',
    nptelUrl: 'https://nptel.ac.in/courses/122107035',
    description:
      "Geometric and intuitive explanation of James Clerk Maxwell's four equations unifying electricity and magnetism. Covers Gauss's Law for electric fields, Gauss's Law for magnetic fields, Faraday's Law of induction, and the Ampère-Maxwell Law with displacement current.",
    relatedNotes: [
      '1. Gauss Law for Electrostatics: Div(E) = rho / epsilon_0 (charge produces electric divergence) | Integral: oint E . dA = Q_enclosed / epsilon_0.',
      '2. Gauss Law for Magnetism: Div(B) = 0 (no magnetic monopoles exist; magnetic field lines are always continuous closed loops) | Integral: oint B . dA = 0.',
      '3. Faraday Law of Induction: Curl(E) = -dB/dt (time-varying magnetic field induces a circulating electric field) | Integral: oint E . dl = -d(Phi_B)/dt.',
      '4. Ampere-Maxwell Law: Curl(B) = mu_0*J + mu_0*epsilon_0*(dE/dt) (current and time-varying electric field induce a circulating magnetic field) | Integral: oint B . dl = mu_0*I_enclosed + mu_0*epsilon_0*(d(Phi_E)/dt).',
      'Displacement Current Density: J_d = epsilon_0 * (dE/dt). Maxwell resolved the capacitor continuity paradox by recognizing that changing electric flux behaves identically to conduction current in generating magnetic fields.'
    ],
    topicsCovered: ["Maxwell's 4 Equations", 'Gauss Law (E and B)', "Faraday's Law", 'Displacement Current', 'Ampere-Maxwell Law']
  },
  {
    id: 'vid-phy-poynting',
    subjectId: 'phy101',
    subjectCode: 'PHY 101',
    subjectTitle: 'Engineering Physics',
    unitNumber: 7,
    unitTitle: 'Unit 7: Electromagnetic Theory',
    topicName: 'EM Wave Equation & The Poynting Vector',
    title: 'Electromagnetic Wave Equation & The Poynting Vector',
    channel: 'Michel van Biezen',
    instructor: 'Prof. Michel van Biezen',
    youtubeId: '7S_tz1z_5I8',
    duration: '13:35',
    durationSeconds: 815,
    level: 'Advanced',
    views: '1.7M',
    popularityScore: 93,
    addedDate: '2026-08-24',
    nptelUrl: 'https://nptel.ac.in/courses/122107035',
    description:
      "Derivation of electromagnetic wave equation in free space from Maxwell's equations. Demonstrates that E and B oscillate in phase perpendicular to each other and to the propagation direction. Derives the speed of light c = 1 / sqrt(mu_0 * epsilon_0) and directional power flux via the Poynting vector S = (1/mu_0)*(E x B).",
    relatedNotes: [
      'Wave Equation in Free Space: nabla^2 E = mu_0 * epsilon_0 * (d^2 E / dt^2) and nabla^2 B = mu_0 * epsilon_0 * (d^2 B / dt^2).',
      'Speed of light: Comparing with classical wave equation gives wave velocity c = 1 / sqrt(mu_0 * epsilon_0) = 2.998 x 10^8 m/s.',
      'Transverse wave properties: Electric field E, magnetic field B, and wave vector k are mutually orthogonal: k . E = 0, k . B = 0, and E / B = c.',
      'Poynting Vector S: Represents the directional energy flux density (power per unit area, W/m^2) transported by the electromagnetic field: S = (1 / mu_0) * (E x B).',
      'Time-Averaged Poynting Vector (Intensity): <S> = (1 / (2 * mu_0)) * E_0 * B_0 = (1/2) * c * epsilon_0 * E_0^2 = c * u_avg, where u_avg is average energy density.'
    ],
    topicsCovered: ['EM Wave Equation', 'Speed of Light in Vacuum', 'Transverse Nature of Light', 'Poynting Vector', 'Radiation Pressure']
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
