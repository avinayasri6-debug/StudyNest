// Smart Notes Starter Templates and Python Note Categories
// Clearly marked as engineering templates to jumpstart study notes without fake student data

export const PYTHON_NOTE_CATEGORIES = [
  'Python Basics',
  'Variables and Data Types',
  'Operators',
  'Conditions',
  'Loops',
  'Functions',
  'Lists and Dictionaries',
  'OOP',
  'Practice Problems'
];

export const NOTE_TEMPLATES = [
  {
    id: 'tpl-python-oop',
    title: '[Template] Python OOP: Classes, Inheritance & Dunder Methods',
    subjectCode: 'CSE 101',
    subjectTitle: 'Problem Solving and Programming in Python',
    description: 'Object-Oriented Programming core principles with working runnable class code and inheritance patterns.',
    isPythonNote: true,
    pythonCategory: 'OOP',
    tags: ['Python', 'OOP', 'Classes', 'Inheritance', 'Lab'],
    content: `# Python OOP Architecture & Class Patterns

Object-Oriented Programming structures code into reusable blueprints called **Classes** with encapsulated data attributes and methods.

---

### 1. Core OOP Principles

| Principle | Meaning | Real-world Analogy |
|---|---|---|
| **Encapsulation** | Hiding internal state with private attributes | ATM machine shielding cash vault |
| **Inheritance** | Derived class acquires base class methods | ElectricCar inherits from Automobile |
| **Polymorphism** | Same method name behaving differently across types | \`shape.draw()\` works on Circle & Box |
| **Abstraction** | Presenting only necessary public interfaces | Smartphone touchscreen vs circuit board |

---

### 2. Complete Engineering Blueprint Example

\`\`\`python
class Student:
    """Represents an engineering scholar with academic record tracking."""
    university_code = "ENG-2026"

    def __init__(self, name: str, roll_number: int, branch: str):
        self.name = name
        self.roll_number = roll_number
        self.branch = branch
        self.marks = []

    def add_marks(self, score: float):
        if 0 <= score <= 100:
            self.marks.append(score)
        else:
            raise ValueError("Invalid score range: 0-100")

    def calculate_gpa(self) -> float:
        if not self.marks:
            return 0.0
        avg = sum(self.marks) / len(self.marks)
        return round(avg / 10.0, 2)

    def __repr__(self) -> str:
        return f"Student({self.name!r}, {self.branch!r}, GPA={self.calculate_gpa()})"


# Subclass demonstrating inheritance
class AIStudent(Student):
    def __init__(self, name: str, roll_number: int, specialty: str = "Deep Learning"):
        super().__init__(name, roll_number, branch="CSE-AIML")
        self.specialty = specialty

    def display_profile(self):
        print(f"Scholar: {self.name} | Focus: {self.specialty} | GPA: {self.calculate_gpa()}")


# Demonstration Run
scholar = AIStudent("Alex Chen", 1042, "Computer Vision")
scholar.add_marks(92)
scholar.add_marks(88)
scholar.add_marks(95)
scholar.display_profile()
print(f"Representation: {scholar}")
\`\`\`

---

### 3. Quick Revision Checklist
- [ ] Understand \`__init__\` self parameter binding
- [ ] Implement \`super().__init__()\` inside subclass
- [ ] Use property decorators (\`@property\`, \`@setter\`) for safe attribute access
- [ ] Test code snippet in **Python Practice Lab**
`
  },
  {
    id: 'tpl-math-eigen',
    title: '[Template] Linear Algebra: Matrices & Eigenvalues Revision',
    subjectCode: 'MATH 101',
    subjectTitle: 'Linear Algebra and Calculus',
    description: 'Comprehensive derivation template for characteristic polynomials, eigenvalues, eigenvectors, and Cayley-Hamilton theorem.',
    isPythonNote: false,
    tags: ['Linear Algebra', 'Eigenvalues', 'Diagonalization', 'Formulas', 'Unit-2'],
    content: `# Linear Algebra: Eigenvalues & Diagonalization

Exam revision cheat sheet for characteristic equation derivations, Cayley-Hamilton verification, and orthogonal matrix diagonalizations.

---

### 1. Key Definitions & Theorems

- **Characteristic Equation**: \`det(A - λI) = 0\` or \`|A - λI| = 0\`
- **Eigenvector Condition**: For each eigenvalue \`λ\`, find non-zero vector \`X\` such that \`(A - λI)X = 0\`.
- **Trace Property**: \`Sum of eigenvalues = trace(A) = a11 + a22 + a33\`
- **Determinant Property**: \`Product of eigenvalues = det(A)\`
- **Cayley-Hamilton Theorem**: Every square matrix satisfies its own characteristic equation:
  \`A^n + c_{n-1}A^{n-1} + ... + c_1A + c_0I = O\`
  *Application*: Finding matrix inverse \`A^{-1}\` and high powers \`A^8\`.

---

### 2. Characteristic Polynomial for 3x3 Matrix

For a 3x3 matrix \`A\`:
\`\`\`
λ^3 - S1*λ^2 + S2*λ - S3 = 0
\`\`\`
Where:
- **S1**: Sum of primary diagonal elements (\`a11 + a22 + a33\`)
- **S2**: Sum of minors of principal diagonal elements (\`M11 + M22 + M33\`)
- **S3**: Determinant of matrix \`A\` (\`det(A)\`)

---

### 3. Step-by-Step Diagonalization Process
1. Calculate all eigenvalues \`λ1, λ2, λ3\`.
2. Find linearly independent eigenvectors \`X1, X2, X3\`.
3. Construct modal matrix: \`P = [X1  X2  X3]\`.
4. Calculate \`P^{-1}\` (or \`P^T\` if normalized orthogonal eigenvectors).
5. Verify diagonal matrix: \`D = P^{-1} A P = diag(λ1, λ2, λ3)\`.

---

### 4. Midterm Exam Checklist
- [ ] Verify sum and product of eigenvalues match trace and determinant
- [ ] Check if matrix is symmetric (symmetric matrices always have orthogonal eigenvectors)
- [ ] Practice finding \`A^4\` using Cayley-Hamilton
`
  },
  {
    id: 'tpl-physics-optics',
    title: '[Template] Engineering Physics: Wave Optics & Laser Principles',
    subjectCode: 'PHYS 101',
    subjectTitle: 'Engineering Physics',
    description: 'Interference, diffraction grating equations, Einstein coefficients, and population inversion in He-Ne / Semiconductor lasers.',
    isPythonNote: false,
    tags: ['Physics', 'Optics', 'Lasers', 'Formulas', 'Unit-1'],
    content: `# Engineering Physics: Wave Optics & Laser Action

Core physics lecture summaries covering thin-film interference, diffraction grating resolution, and laser oscillator mechanics.

---

### 1. Essential Formulas & Equations

| Phenomenon | Governing Formula | Key Variables |
|---|---|---|
| **Thin Film Interference (Reflected)** | \`2μt cos(r) = (2n - 1)λ / 2\` (Bright) | \`μ\` = refractive index, \`t\` = thickness |
| **Thin Film Interference (Reflected)** | \`2μt cos(r) = nλ\` (Dark) | \`r\` = angle of refraction |
| **Diffraction Grating** | \`(a + b) sin(θ) = nλ\` | \`(a+b)\` = grating element, \`n\` = order |
| **Resolving Power of Grating** | \`R = λ / dλ = n * N\` | \`N\` = total ruled lines |
| **Einstein Coefficients Ratio** | \`A_{21} / B_{21} = (8π h ν^3) / c^3\` | Spontaneous vs Stimulated emission |

---

### 2. Laser Pumping & Population Inversion
To achieve coherent laser amplification:
1. **Pumping Source**: Optical (Flashlamp), Electrical Discharge, or Chemical.
2. **Metastable State**: Longer lifetime (\`~10^{-3} s\` vs normal \`~10^{-8} s\`) allows accumulation of excited atoms.
3. **Population Inversion**: Condition where higher energy level \`N2 > N1\`.
4. **Resonant Optical Cavity**: Pair of mirrors (one 100% reflective, one 98% semi-transparent output coupler).

---

### 3. Lab Viva Revision Points
- [ ] Explain why thin films show colors in sunlight (interference due to path difference)
- [ ] Differentiate between spontaneous and stimulated emission
- [ ] State Rayleigh criterion for optical limit of resolution
`
  },
  {
    id: 'tpl-digital-electronics',
    title: '[Template] Digital Electronics: Logic Gates & K-Map Minimization',
    subjectCode: 'ECE 101',
    subjectTitle: 'Fundamentals of Digital Electronics',
    description: 'Boolean algebra laws, De Morgan theorems, universal gate implementations, and 3/4-variable Karnaugh Map simplification.',
    isPythonNote: false,
    tags: ['Digital Electronics', 'Boolean Algebra', 'K-Map', 'Gates', 'Unit-2'],
    content: `# Digital Electronics: Boolean Algebra & K-Maps

Concise reference for universal logic implementations, Boolean minimization theorems, and prime implicant grouping.

---

### 1. De Morgan's Laws & Boolean Theorems

- **First Law**: \`NOT(A + B) = NOT(A) * NOT(B)\` *(NOR is equivalent to Bubbled AND)*
- **Second Law**: \`NOT(A * B) = NOT(A) + NOT(B)\` *(NAND is equivalent to Bubbled OR)*
- **Absorption Law**: \`A + A * B = A\` and \`A * (A + B) = A\`
- **Consensus Theorem**: \`A*B + NOT(A)*C + B*C = A*B + NOT(A)*C\`

---

### 2. Universal Gate Realizations (NAND / NOR)

| Desired Gate | NAND Implementation | NOR Implementation |
|---|---|---|
| **NOT** | Tie inputs together: \`NAND(A, A) = NOT(A)\` | Tie inputs together: \`NOR(A, A) = NOT(A)\` |
| **AND** | NAND followed by NAND Inverter | Invert inputs then feed to NOR |
| **OR** | Invert inputs then feed to NAND | NOR followed by NOR Inverter |
| **XOR** | Requires 4 NAND gates | Requires 5 NOR gates |

---

### 3. 4-Variable Karnaugh Map (K-Map) Rules
1. Gray code order on axes: \`00, 01, 11, 10\` (only 1 bit changes between adjacent cells).
2. Group sizes must strictly be powers of 2: **16, 8, 4, 2, or 1 cell**.
3. Always wrap around edges and corners (corner grouping: cells 0, 2, 8, 10).
4. Do not include redundant groups where all 1s are already covered by larger groups.

---

### 4. Lab Checklist
- [ ] Verify IC 7400 (NAND) and IC 7402 (NOR) pinout diagrams
- [ ] Simplify Boolean expressions to minimal SOP and POS form
- [ ] Check don't-care condition (\`X\`) exploitation for larger group formation
`
  },
  {
    id: 'tpl-quant-aptitude',
    title: '[Template] Quantitative Aptitude: Work, Time & Speed Shortcuts',
    subjectCode: 'MATH 102',
    subjectTitle: 'Quantitative Aptitude and Reasoning',
    description: 'Fast calculation formulas for time & work, pipes & cisterns, relative speed, and percentage variations for competitive tests.',
    isPythonNote: false,
    tags: ['Aptitude', 'Shortcuts', 'Time & Work', 'Formulas', 'Speed'],
    content: `# Quantitative Aptitude: Speed, Time & Work Formulas

Essential shortcut formulas and mental math strategies for placement aptitude and semester evaluations.

---

### 1. Time & Work Formulas

- **Unit Work Method**: If Person A completes work in \`x\` days, 1-day work = \`1 / x\`.
- **Combined Work**: If A takes \`x\` days and B takes \`y\` days:
  \`\`\`
  Together Time = (x * y) / (x + y) days
  \`\`\`
- **Man-Days-Hours Formula**:
  \`\`\`
  (M1 * D1 * H1) / W1 = (M2 * D2 * H2) / W2
  \`\`\`
- **Efficiency Ratio**: If A is \`k\` times as efficient as B, then ratio of times taken = \`1 : k\`.

---

### 2. Time, Speed & Distance

- **Conversion Factors**:
  - \`km/h -> m/s\`: Multiply by \`5 / 18\`
  - \`m/s -> km/h\`: Multiply by \`18 / 5\`
- **Average Speed (Equal Distances)**:
  \`\`\`
  Avg Speed = (2 * S1 * S2) / (S1 + S2)
  \`\`\`
- **Relative Speed**:
  - Moving in **same direction**: \`S_{rel} = S1 - S2\`
  - Moving in **opposite direction**: \`S_{rel} = S1 + S2\`

---

### 3. Practice Checklist
- [ ] Practice LCM method for 3-worker combined time
- [ ] Solve 5 train problem variations (pole vs platform vs moving train)
- [ ] Review negative work formula for leaking pipes
`
  },
  {
    id: 'tpl-digital-skills-git',
    title: '[Template] Digital Skill Workshop: Git Version Control & Essential CLI',
    subjectCode: 'CSE 102',
    subjectTitle: 'Digital Skill Workshop',
    description: 'Essential terminal commands, git branching workflows, merge conflict resolution, and markdown document formatting.',
    isPythonNote: false,
    tags: ['Git', 'CLI', 'Terminal', 'Workflow', 'Lab'],
    content: `# Git Version Control & CLI Master Reference

Hands-on developer workflow reference for engineering labs, team repositories, and project deployments.

---

### 1. Essential Git Workflow

\`\`\`bash
# 1. Initialize repository or clone remote
git init
git clone https://github.com/org/project.git

# 2. Stage changes & inspect status
git status
git add .

# 3. Commit with semantic message
git commit -m "feat(auth): implement student profile modal"

# 4. Branch management
git checkout -b feature/smart-notes
git branch -a

# 5. Push changes to upstream
git push -u origin feature/smart-notes
\`\`\`

---

### 2. Merge Conflict Resolution Protocol
1. Pull latest main branch changes: \`git pull origin main\`.
2. Inspect conflicting files indicated in red.
3. Open files and resolve marker blocks:
   \`\`\`
   <<<<<<< HEAD (Current change)
   const theme = "forest-green";
   =======
   const theme = "sage-cream";
   >>>>>>> main (Incoming change)
   \`\`\`
4. Remove marker lines, stage fixed files with \`git add <file>\`, and commit.

---

### 3. Laboratory Submission Checklist
- [ ] Create clean \`.gitignore\` ignoring \`node_modules/\` and environment secrets
- [ ] Ensure all commit messages follow conventional commit specifications
- [ ] Generate SSH keys for automated GitHub push authentication
`
  }
];
