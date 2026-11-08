// Sagevanta Dynamic Curriculum System
// Complete hierarchy: University -> Degree -> Branch -> Academic Year -> Semester -> Subject -> Unit -> Topic
// Supports Verified Official Curricula + Student-Created Custom Curricula + Future PDF Syllabus Ingestion

import {
  SEMESTER_1_SUBJECTS,
  SAMPLE_SYLLABUS_DISCLAIMER,
  getAllSubjectTopics as baseGetAllTopics
} from './subjectsData.js';

export { SAMPLE_SYLLABUS_DISCLAIMER };

export const CURRICULUM_SOURCE_TYPES = {
  OFFICIALLY_VERIFIED: 'verified',
  SAMPLE_TEMPLATE: 'sample_template',
  IMPORTED: 'imported',
  CUSTOM: 'custom'
};

export const SYLLABUS_BADGES = {
  VERIFIED: {
    id: 'verified',
    label: 'Officially Verified',
    shortLabel: 'Verified',
    type: 'verified',
    color: 'var(--forest-800, #3B6E52)',
    bg: 'rgba(59, 110, 82, 0.12)',
    border: 'rgba(59, 110, 82, 0.3)',
    description: 'Officially verified against authoritative university syllabus documentation.'
  },
  SAMPLE_TEMPLATE: {
    id: 'sample_template',
    label: 'Sample Template',
    shortLabel: 'Sample',
    type: 'sample_template',
    color: 'var(--sage-700, #557562)',
    bg: 'rgba(104, 143, 120, 0.14)',
    border: 'rgba(104, 143, 120, 0.3)',
    description: 'Illustrative sample curriculum template for initial guidance. Customize or upload your official syllabus.'
  },
  IMPORTED: {
    id: 'imported',
    label: 'Imported Syllabus',
    shortLabel: 'Imported',
    type: 'imported',
    color: '#2B5A8F',
    bg: 'rgba(180, 205, 230, 0.25)',
    border: 'rgba(140, 175, 210, 0.4)',
    description: 'Extracted from student-uploaded syllabus PDF or document. Subject to student review.'
  },
  CUSTOM: {
    id: 'custom',
    label: 'Student Custom',
    shortLabel: 'Custom',
    type: 'custom',
    color: '#8A6D3B',
    bg: 'rgba(230, 215, 175, 0.25)',
    border: 'rgba(200, 175, 120, 0.4)',
    description: 'Created and configured directly by the student.'
  }
};
// Aliases for convenience
SYLLABUS_BADGES.SAMPLE = SYLLABUS_BADGES.SAMPLE_TEMPLATE;

/**
 * Resolves curriculum source metadata and verification status for any subject.
 * Strict verification rule:
 * Officially verified ONLY if subject.verified === true AND has supporting verification evidence
 * (e.g. subject.verificationRef or subject.verifiedBy or subject.officialSyllabusRef).
 * Never infers official verification merely from subject code or title.
 */
export function getCurriculumSourceInfo(subject) {
  if (!subject) return SYLLABUS_BADGES.CUSTOM;

  // 1. Officially Verified: Strict condition with required supporting evidence
  const hasEvidence = Boolean(
    subject.verificationRef ||
    subject.verifiedBy ||
    subject.officialSyllabusRef ||
    subject.authoritativeSource
  );
  if (
    subject.verified === true &&
    hasEvidence &&
    subject.source !== 'sample_template' &&
    subject.source !== 'custom' &&
    subject.source !== 'imported'
  ) {
    return {
      ...SYLLABUS_BADGES.VERIFIED,
      isVerified: true,
      evidence: subject.verificationRef || subject.verifiedBy || subject.officialSyllabusRef || subject.authoritativeSource,
      sourceType: 'verified'
    };
  }

  // 2. Imported Syllabus: from PDF, document, or pasted syllabus
  if (subject.source === 'imported' || subject.id?.startsWith('imported-') || subject.importedFrom) {
    return {
      ...SYLLABUS_BADGES.IMPORTED,
      isVerified: false,
      importedFrom: subject.importedFrom || subject.metadata?.filename || null,
      importDate: subject.importDate || null,
      sourceType: 'imported'
    };
  }

  // 3. Sample Template: example curriculum outline
  if (subject.source === 'sample_template' || subject.isSample === true || subject.templateName) {
    return {
      ...SYLLABUS_BADGES.SAMPLE_TEMPLATE,
      isVerified: false,
      templateName: subject.templateName || 'Sample Curriculum Template',
      sourceType: 'sample_template'
    };
  }

  // 4. Student Custom: default for user-created courses and legacy entries
  return {
    ...SYLLABUS_BADGES.CUSTOM,
    isVerified: false,
    sourceType: 'custom'
  };
}

// ============================================================================
// VERIFIED CORE SUBJECTS FOR SEMESTER 2 ACROSS BRANCH TRACKS
// ============================================================================
export const SEMESTER_2_CORE_SUBJECTS = {
  // Computing Streams: CSE, IT, AIML, DS
  computing: [
    {
      id: 'cse102',
      code: 'CSE 102',
      title: 'Data Structures and Algorithms',
      shortName: 'Data Structures',
      department: 'School of Computer Science & Engineering',
      credits: 4,
      category: 'Computing & Software',
      semester: 2,
      branchTrack: 'computing',
      verified: false,
      isSample: true,
      description: 'Abstract data types, arrays, linked lists, stacks, queues, trees, graphs, sorting, searching, and algorithmic asymptotic analysis.',
      units: [
        {
          unitNumber: 1,
          unitTitle: 'Linear Data Structures: Stacks and Queues',
          topics: [
            { id: 'cse102-u1-t1', name: 'Stack ADT: Array & Linked List Implementation' },
            { id: 'cse102-u1-t2', name: 'Infix to Postfix Conversion & Expression Evaluation' },
            { id: 'cse102-u1-t3', name: 'Queue ADT: Circular Queue and Double-Ended Queue (Deque)' },
            { id: 'cse102-u1-t4', name: 'Priority Queues and Heap Order Properties' }
          ]
        },
        {
          unitNumber: 2,
          unitTitle: 'Linked Structures: Lists and Skip Lists',
          topics: [
            { id: 'cse102-u2-t1', name: 'Singly Linked Lists and Reversal Techniques' },
            { id: 'cse102-u2-t2', name: 'Doubly and Circular Linked Lists' },
            { id: 'cse102-u2-t3', name: 'Sparse Matrix Representation using Linked Lists' },
            { id: 'cse102-u2-t4', name: 'Memory Allocation and Pointer Management' }
          ]
        },
        {
          unitNumber: 3,
          unitTitle: 'Hierarchical Structures: Trees and Binary Search Trees',
          topics: [
            { id: 'cse102-u3-t1', name: 'Binary Trees: Traversal (Pre, In, Post, Level-Order)' },
            { id: 'cse102-u3-t2', name: 'Binary Search Trees (BST): Insertion, Deletion, Search' },
            { id: 'cse102-u3-t3', name: 'AVL Trees and Self-Balancing Rotations' },
            { id: 'cse102-u3-t4', name: 'B-Trees and B+ Trees in Storage Systems' }
          ]
        },
        {
          unitNumber: 4,
          unitTitle: 'Graph Theory & Algorithm Analysis',
          topics: [
            { id: 'cse102-u4-t1', name: 'Graph Representations: Adjacency Matrix & List' },
            { id: 'cse102-u4-t2', name: 'Breadth-First Search (BFS) & Depth-First Search (DFS)' },
            { id: 'cse102-u4-t3', name: "Dijkstra's Shortest Path & Prim's Minimum Spanning Tree" },
            { id: 'cse102-u4-t4', name: 'Asymptotic Notations: Big-O, Omega, and Theta' }
          ]
        }
      ],
      importantQuestions: [
        {
          id: 'iq-dsa-1',
          question: 'Explain the rotations required to rebalance an AVL Tree after insertion.',
          answer: 'Four rotation cases: Left-Left (Single Right Rotation), Right-Right (Single Left Rotation), Left-Right (Left rotation on child, Right rotation on root), and Right-Left (Right rotation on child, Left rotation on root).'
        },
        {
          id: 'iq-dsa-2',
          question: "What is the time complexity difference between Dijkstra's algorithm with an array vs a binary min-heap?",
          answer: 'With an adjacency matrix and simple array: O(V²). With an adjacency list and binary min-heap: O((V + E) log V), making it substantially faster for sparse engineering graphs.'
        }
      ]
    },
    {
      id: 'math102',
      code: 'MATH 102',
      title: 'Discrete Mathematics and Graph Theory',
      shortName: 'Discrete Math',
      department: 'Mathematics & Computing',
      credits: 4,
      category: 'Core Engineering Mathematics',
      semester: 2,
      branchTrack: 'computing',
      verified: false,
      isSample: true,
      description: 'Propositional logic, set theory, combinatorics, recurrence relations, algebraic structures, and graph connectivity.',
      units: [
        {
          unitNumber: 1,
          unitTitle: 'Mathematical Logic and Predicates',
          topics: [
            { id: 'math102-u1-t1', name: 'Propositional Equivalence and Truth Tables' },
            { id: 'math102-u1-t2', name: 'Universal and Existential Quantifiers' },
            { id: 'math102-u1-t3', name: 'Rules of Inference and Formal Proofs' },
            { id: 'math102-u1-t4', name: 'Mathematical Induction & Well-Ordering Principle' }
          ]
        },
        {
          unitNumber: 2,
          unitTitle: 'Combinatorics and Generating Functions',
          topics: [
            { id: 'math102-u2-t1', name: 'Pigeonhole Principle and Extended Applications' },
            { id: 'math102-u2-t2', name: 'Permutations, Combinations & Binomial Coefficients' },
            { id: 'math102-u2-t3', name: 'Homogeneous & Non-Homogeneous Recurrence Relations' },
            { id: 'math102-u2-t4', name: 'Generating Functions for Sequence Analysis' }
          ]
        },
        {
          unitNumber: 3,
          unitTitle: 'Relations, Posets and Lattices',
          topics: [
            { id: 'math102-u3-t1', name: 'Equivalence Relations and Partitions' },
            { id: 'math102-u3-t2', name: 'Partial Orderings and Hasse Diagrams' },
            { id: 'math102-u3-t3', name: 'Lattices as Algebraic Systems' },
            { id: 'math102-u3-t4', name: 'Boolean Algebras and Logic Minimization' }
          ]
        },
        {
          unitNumber: 4,
          unitTitle: 'Graph Theory & Algebraic Structures',
          topics: [
            { id: 'math102-u4-t1', name: 'Eulerian and Hamiltonian Graphs' },
            { id: 'math102-u4-t2', name: 'Planar Graphs and Kuratowski Theorem' },
            { id: 'math102-u4-t3', name: 'Groups, Subgroups, and Lagrange Theorem' },
            { id: 'math102-u4-t4', name: 'Isomorphisms and Homomorphisms in Cryptography' }
          ]
        }
      ]
    },
    {
      id: 'cse103',
      code: 'CSE 103',
      title: 'Object-Oriented Programming (Java / C++)',
      shortName: 'OOP Concepts',
      department: 'School of Computer Science & Engineering',
      credits: 3,
      category: 'Computing & Software',
      semester: 2,
      branchTrack: 'computing',
      verified: false,
      isSample: true,
      description: 'Encapsulation, inheritance, polymorphism, abstract classes, exception handling, multithreading, and design patterns.',
      units: [
        {
          unitNumber: 1,
          unitTitle: 'Foundations of OOP: Classes and Objects',
          topics: [
            { id: 'cse103-u1-t1', name: 'Paradigm Shift: Procedural vs Object-Oriented' },
            { id: 'cse103-u1-t2', name: 'Encapsulation, Access Specifiers, and Constructors' },
            { id: 'cse103-u1-t3', name: 'Static Members, Garbage Collection, and Memory Lifetime' },
            { id: 'cse103-u1-t4', name: 'this Pointer / Reference and Method Overloading' }
          ]
        },
        {
          unitNumber: 2,
          unitTitle: 'Inheritance and Dynamic Polymorphism',
          topics: [
            { id: 'cse103-u2-t1', name: 'Single, Multilevel, and Hierarchical Inheritance' },
            { id: 'cse103-u2-t2', name: 'Method Overriding and Dynamic Method Dispatch' },
            { id: 'cse103-u2-t3', name: 'Abstract Classes and Interface Contracts' },
            { id: 'cse103-u2-t4', name: 'Virtual Functions and vtable Internals (C++)' }
          ]
        },
        {
          unitNumber: 3,
          unitTitle: 'Robust Programming: Exceptions and Generics',
          topics: [
            { id: 'cse103-u3-t1', name: 'Exception Hierarchy: try, catch, finally, throw' },
            { id: 'cse103-u3-t2', name: 'Custom User-Defined Exception Classes' },
            { id: 'cse103-u3-t3', name: 'Generic Programming and Collections Framework / STL' },
            { id: 'cse103-u3-t4', name: 'File I/O Streams and Object Serialization' }
          ]
        }
      ]
    },
    {
      id: 'ece102',
      code: 'ECE 102',
      title: 'Digital Logic Design & Computer Organization',
      shortName: 'Digital Logic',
      department: 'School of Computer Science & Engineering',
      credits: 4,
      category: 'Electronics & Hardware',
      semester: 2,
      branchTrack: 'computing',
      verified: false,
      isSample: true,
      description: 'Boolean algebra, Karnaugh maps, combinational adders/multiplexers, flip-flops, sequential counters, and ALU design.',
      units: [
        {
          unitNumber: 1,
          unitTitle: 'Boolean Algebra and Gate Minimization',
          topics: [
            { id: 'ece102-u1-t1', name: 'Number Systems (Binary, Hex, Twos Complement)' },
            { id: 'ece102-u1-t2', name: 'Universal Gates (NAND / NOR) Implementation' },
            { id: 'ece102-u1-t3', name: 'Karnaugh Maps (K-Map) for 3 & 4 Variables' },
            { id: 'ece102-u1-t4', name: "Quine-McCluskey Tabular Minimization Method" }
          ]
        },
        {
          unitNumber: 2,
          unitTitle: 'Combinational Logic Systems',
          topics: [
            { id: 'ece102-u2-t1', name: 'Half Adder, Full Adder, and Carry-Lookahead Adders' },
            { id: 'ece102-u2-t2', name: 'Multiplexers (MUX) and Demultiplexers (DEMUX)' },
            { id: 'ece102-u2-t3', name: 'Encoders, Priority Encoders, and Decoders' },
            { id: 'ece102-u2-t4', name: 'Arithmetic Logic Unit (ALU) Slice Design' }
          ]
        },
        {
          unitNumber: 3,
          unitTitle: 'Sequential Circuits & Flip-Flops',
          topics: [
            { id: 'ece102-u3-t1', name: 'Latches vs Flip-Flops (SR, JK, D, T)' },
            { id: 'ece102-u3-t2', name: 'Master-Slave JK Flip-Flop & Race-Around Elimination' },
            { id: 'ece102-u3-t3', name: 'Synchronous and Asynchronous Counters' },
            { id: 'ece102-u3-t4', name: 'Shift Registers: SISO, SIPO, PISO, PIPO' }
          ]
        }
      ]
    },
    {
      id: 'chem101',
      code: 'CHEM 101',
      title: 'Engineering Chemistry & Materials Science',
      shortName: 'Chemistry',
      department: 'Applied Sciences',
      credits: 3,
      category: 'Basic Sciences',
      semester: 2,
      branchTrack: 'computing',
      verified: false,
      isSample: true,
      description: 'Electrochemistry, lithium-ion battery storage, polymer semiconductors, nano-materials, and spectroscopy.',
      units: [
        {
          unitNumber: 1,
          unitTitle: 'Electrochemistry and Energy Storage',
          topics: [
            { id: 'chem101-u1-t1', name: 'Nernst Equation and Electrochemical Cells' },
            { id: 'chem101-u1-t2', name: 'Lithium-Ion Batteries: Cathode & Anode Chemistry' },
            { id: 'chem101-u1-t3', name: 'Supercapacitors and Fuel Cell Fundamentals' },
            { id: 'chem101-u1-t4', name: 'Corrosion Mechanisms and Cathodic Protection' }
          ]
        },
        {
          unitNumber: 2,
          unitTitle: 'Advanced Electronic Materials',
          topics: [
            { id: 'chem101-u2-t1', name: 'Conducting Polymers & Organic Semiconductors' },
            { id: 'chem101-u2-t2', name: 'Carbon Nanotubes (CNTs) and Graphene Properties' },
            { id: 'chem101-u2-t3', name: 'Dielectric and Piezoelectric Sensor Materials' },
            { id: 'chem101-u2-t4', name: 'UV-Vis and FTIR Spectroscopy Principles' }
          ]
        }
      ]
    }
  ],

  // Electronics Streams: ECE, EEE
  electronics: [
    {
      id: 'ece201',
      code: 'ECE 201',
      title: 'Network Analysis and Synthesis',
      shortName: 'Network Analysis',
      department: 'Department of Electronics & Communication',
      credits: 4,
      category: 'Electronics & Hardware',
      semester: 2,
      branchTrack: 'electronics',
      verified: false,
      isSample: true,
      description: 'Mesh & node analysis, network theorems, transient RL/RC/RLC response, Laplace transforms, and two-port network parameters.',
      units: [
        {
          unitNumber: 1,
          unitTitle: 'Circuit Theorems in Frequency Domain',
          topics: [
            { id: 'ece201-u1-t1', name: "Thevenin's and Norton's Theorems with Dependent Sources" },
            { id: 'ece201-u1-t2', name: 'Maximum Power Transfer Theorem in AC Circuits' },
            { id: 'ece201-u1-t3', name: 'Superposition & Reciprocity Theorems' },
            { id: 'ece201-u1-t4', name: 'Duality and Graph Theoretic Tree Formulations' }
          ]
        },
        {
          unitNumber: 2,
          unitTitle: 'Transient Analysis of Dynamic Circuits',
          topics: [
            { id: 'ece201-u2-t1', name: 'First Order RL and RC Step Responses' },
            { id: 'ece201-u2-t2', name: 'Second Order RLC Series and Parallel Damping' },
            { id: 'ece201-u2-t3', name: 'Laplace Transform Method for Transient Solutions' },
            { id: 'ece201-u2-t4', name: 'Impulse and Frequency Response Functions' }
          ]
        },
        {
          unitNumber: 3,
          unitTitle: 'Two-Port Network Parameters',
          topics: [
            { id: 'ece201-u3-t1', name: 'Impedance (Z) and Admittance (Y) Parameters' },
            { id: 'ece201-u3-t2', name: 'Hybrid (H) and Transmission (ABCD) Parameters' },
            { id: 'ece201-u3-t3', name: 'Interconnection of Two-Port Networks' },
            { id: 'ece201-u3-t4', name: 'Driving Point Impedances and Positive Real Functions' }
          ]
        }
      ]
    },
    {
      id: 'ece202',
      code: 'ECE 202',
      title: 'Electronic Devices & Semiconductor Physics',
      shortName: 'Electronic Devices',
      department: 'Department of Electronics & Communication',
      credits: 4,
      category: 'Electronics & Hardware',
      semester: 2,
      branchTrack: 'electronics',
      verified: false,
      isSample: true,
      description: 'Energy band theory, PN junctions, Zener diodes, BJT characteristics, MOSFET operation, and CMOS logic gates.',
      units: [
        {
          unitNumber: 1,
          unitTitle: 'Semiconductor Physics & PN Junctions',
          topics: [
            { id: 'ece202-u1-t1', name: 'Intrinsic and Extrinsic Semiconductors, Fermi Level' },
            { id: 'ece202-u1-t2', name: 'Carrier Drift, Diffusion, and Continuity Equations' },
            { id: 'ece202-u1-t3', name: 'Depletion Layer Capacitance and Shockley Diode Equation' },
            { id: 'ece202-u1-t4', name: 'Zener and Avalanche Breakdown Mechanisms' }
          ]
        },
        {
          unitNumber: 2,
          unitTitle: 'Bipolar Junction Transistors (BJT)',
          topics: [
            { id: 'ece202-u2-t1', name: 'CB, CE, CC Configurations and Static Characteristics' },
            { id: 'ece202-u2-t2', name: 'Transistor Biasing: Fixed Bias, Voltage Divider Bias' },
            { id: 'ece202-u2-t3', name: 'Thermal Runaway and Stability Factors' },
            { id: 'ece202-u2-t4', name: 'Small-Signal Low-Frequency h-Parameter Model' }
          ]
        },
        {
          unitNumber: 3,
          unitTitle: 'Field Effect Transistors (FET & MOSFET)',
          topics: [
            { id: 'ece202-u3-t1', name: 'JFET Construction, Pinch-off, and Transfer Characteristics' },
            { id: 'ece202-u3-t2', name: 'Enhancement and Depletion MOSFETs, Threshold Voltage' },
            { id: 'ece202-u3-t3', name: 'CMOS Inverter Transfer Curve and Noise Margins' },
            { id: 'ece202-u3-t4', name: 'Short-Channel Effects and Velocity Saturation' }
          ]
        }
      ]
    }
  ],

  // Mechanical / Civil Streams: ME, Civil
  mechanical_civil: [
    {
      id: 'me102',
      code: 'ME 102',
      title: 'Engineering Mechanics: Statics and Dynamics',
      shortName: 'Eng Mechanics',
      department: 'Department of Mechanical Engineering',
      credits: 4,
      category: 'Mechanical & Physical Systems',
      semester: 2,
      branchTrack: 'mechanical_civil',
      verified: false,
      isSample: true,
      description: 'Equilibrium of force systems, free-body diagrams, friction, trusses, centroid, moment of inertia, kinematics, and kinetics.',
      units: [
        {
          unitNumber: 1,
          unitTitle: 'Equilibrium of Rigid Bodies and Trusses',
          topics: [
            { id: 'me102-u1-t1', name: 'Coplanar Concurrent & Non-Concurrent Force Systems' },
            { id: 'me102-u1-t2', name: 'Free Body Diagrams and Equations of Equilibrium' },
            { id: 'me102-u1-t3', name: 'Analysis of Plane Trusses: Method of Joints & Sections' },
            { id: 'me102-u1-t4', name: 'Friction: Laws of Dry Friction, Wedges, and Belts' }
          ]
        },
        {
          unitNumber: 2,
          unitTitle: 'Centroid, Center of Gravity, and Moment of Inertia',
          topics: [
            { id: 'me102-u2-t1', name: 'Centroids of Composite Lines, Areas, and Volumes' },
            { id: 'me102-u2-t2', name: 'Parallel and Perpendicular Axis Theorems' },
            { id: 'me102-u2-t3', name: 'Area and Mass Moment of Inertia of Structural Shapes' },
            { id: 'me102-u2-t4', name: 'Radius of Gyration and Product of Inertia' }
          ]
        },
        {
          unitNumber: 3,
          unitTitle: 'Kinematics & Kinetics of Particles',
          topics: [
            { id: 'me102-u3-t1', name: 'Curvilinear Motion: Normal and Tangential Coordinates' },
            { id: 'me102-u3-t2', name: "Newton's Second Law & D'Alembert's Principle" },
            { id: 'me102-u3-t3', name: 'Work-Energy Principle and Conservation of Energy' },
            { id: 'me102-u3-t4', name: 'Impulse, Linear Momentum, and Direct Central Impact' }
          ]
        }
      ]
    },
    {
      id: 'me103',
      code: 'ME 103',
      title: 'Computer Aided Engineering Graphics & Modeling',
      shortName: 'Engineering Graphics',
      department: 'Department of Mechanical Engineering',
      credits: 3,
      category: 'Workshops & Soft Skills',
      semester: 2,
      branchTrack: 'mechanical_civil',
      verified: false,
      isSample: true,
      description: 'Orthographic projections of points, lines, planes, solids, sectioning, isometric views, and 3D parametric CAD modeling.',
      units: [
        {
          unitNumber: 1,
          unitTitle: 'Projections of Lines and Planes',
          topics: [
            { id: 'me103-u1-t1', name: 'First Angle vs Third Angle Projection Systems' },
            { id: 'me103-u1-t2', name: 'True Length and True Inclinations of Straight Lines' },
            { id: 'me103-u1-t3', name: 'Auxiliary Planes and Traces of Lines' },
            { id: 'me103-u1-t4', name: 'Projections of Polygons, Circular Planes, and Laminae' }
          ]
        },
        {
          unitNumber: 2,
          unitTitle: 'Projections & Sectioning of Solids',
          topics: [
            { id: 'me103-u2-t1', name: 'Prisms, Pyramids, Cylinders, and Cones' },
            { id: 'me103-u2-t2', name: 'Section Planes and True Shape of Section' },
            { id: 'me103-u2-t3', name: 'Development of Lateral Surfaces for Sheet Metal' },
            { id: 'me103-u2-t4', name: 'Isometric Projections and Conversion from Orthographic' }
          ]
        }
      ]
    }
  ],

  // Bio & Chemical Streams: CHE, BT
  bio_chemical: [
    {
      id: 'che101',
      code: 'CHE 101',
      title: 'Chemical Process Calculations & Material Balances',
      shortName: 'Process Calculations',
      department: 'Department of Chemical Engineering',
      credits: 4,
      category: 'Process & Materials',
      semester: 2,
      branchTrack: 'bio_chemical',
      verified: false,
      isSample: true,
      description: 'Stoichiometry, steady-state material balances, recycle & purge streams, humidity, psychrometric charts, and combustion calculations.',
      units: [
        {
          unitNumber: 1,
          unitTitle: 'Units, Dimensions and Steady-State Balances',
          topics: [
            { id: 'che101-u1-t1', name: 'Ideal Gas Laws, Real Gas Compressibility, Dalton Law' },
            { id: 'che101-u1-t2', name: 'Material Balance on Non-Reactive Systems' },
            { id: 'che101-u1-t3', name: 'Recycle, Bypass, and Purge Operations' },
            { id: 'che101-u1-t4', name: 'Degree of Freedom Analysis in Flowsheets' }
          ]
        },
        {
          unitNumber: 2,
          unitTitle: 'Reactive Systems and Energy Balances',
          topics: [
            { id: 'che101-u2-t1', name: 'Limiting & Excess Reactants, Fractional Conversion, Yield' },
            { id: 'che101-u2-t2', name: 'Combustion Reactions: Orsat Gas Analysis & Flue Gas' },
            { id: 'che101-u2-t3', name: 'Heat Capacity, Sensible & Latent Heat Calculations' },
            { id: 'che101-u2-t4', name: 'Standard Heat of Reaction and Hess Law Balances' }
          ]
        }
      ]
    },
    {
      id: 'bt101',
      code: 'BT 101',
      title: 'Cell Biology and Molecular Genetics',
      shortName: 'Cell Biology',
      department: 'Department of Biotechnology',
      credits: 4,
      category: 'Bioengineering & Life Sciences',
      semester: 2,
      branchTrack: 'bio_chemical',
      verified: false,
      isSample: true,
      description: 'Prokaryotic vs eukaryotic cell structure, membrane transport, cell signaling, DNA replication, transcription, and translation.',
      units: [
        {
          unitNumber: 1,
          unitTitle: 'Cellular Architecture and Organelles',
          topics: [
            { id: 'bt101-u1-t1', name: 'Fluid Mosaic Membrane Structure & Ion Channels' },
            { id: 'bt101-u1-t2', name: 'Mitochondrial Bioenergetics and ATP Synthesis' },
            { id: 'bt101-u1-t3', name: 'Endoplasmic Reticulum, Golgi, and Protein Trafficking' },
            { id: 'bt101-u1-t4', name: 'Cytoskeleton: Microfilaments, Microtubules, Motors' }
          ]
        },
        {
          unitNumber: 2,
          unitTitle: 'Molecular Genetics & Central Dogma',
          topics: [
            { id: 'bt101-u2-t1', name: 'DNA Double Helix Topology & Semiconservative Replication' },
            { id: 'bt101-u2-t2', name: 'Prokaryotic and Eukaryotic RNA Transcription' },
            { id: 'bt101-u2-t3', name: 'Genetic Code, tRNA Charging, and Ribosomal Translation' },
            { id: 'bt101-u2-t4', name: 'Gene Regulation: Lac Operon and Epigenetic Modification' }
          ]
        }
      ]
    }
  ]
};

// ============================================================================
// REPRESENTATIVE HIGHER-SEMESTER CORE COURSES FOR ALL 10 BRANCHES (SEMS 3-8)
// ============================================================================
export const BRANCH_ADVANCED_CURRICULUM_TEMPLATES = {
  cse: [
    { code: 'CSE 301', title: 'Design and Analysis of Algorithms', semester: 3, credits: 4, category: 'Computing & Software' },
    { code: 'CSE 302', title: 'Computer Organization & Architecture', semester: 3, credits: 4, category: 'Computing & Software' },
    { code: 'CSE 401', title: 'Operating Systems & System Programming', semester: 4, credits: 4, category: 'Computing & Software' },
    { code: 'CSE 402', title: 'Database Management Systems (DBMS)', semester: 4, credits: 4, category: 'Computing & Software' },
    { code: 'CSE 501', title: 'Computer Networks & Distributed Protocols', semester: 5, credits: 4, category: 'Computing & Software' },
    { code: 'CSE 502', title: 'Theory of Computation & Automata', semester: 5, credits: 3, category: 'Computing & Software' },
    { code: 'CSE 601', title: 'Compiler Design & Code Generation', semester: 6, credits: 4, category: 'Computing & Software' },
    { code: 'CSE 701', title: 'Cloud Computing & Distributed Systems', semester: 7, credits: 3, category: 'Computing & Software' },
    { code: 'CSE 801', title: 'Capstone Engineering Project', semester: 8, credits: 10, category: 'Workshops & Soft Skills' }
  ],
  it: [
    { code: 'IT 301', title: 'Enterprise Network Architecture', semester: 3, credits: 4, category: 'Computing & Software' },
    { code: 'IT 302', title: 'Web Systems & Full-Stack Engineering', semester: 3, credits: 4, category: 'Computing & Software' },
    { code: 'IT 401', title: 'Information & Network Security', semester: 4, credits: 4, category: 'Computing & Software' },
    { code: 'IT 501', title: 'Cloud Infrastructure & DevOps Automation', semester: 5, credits: 4, category: 'Computing & Software' },
    { code: 'IT 601', title: 'Mobile Computing & Android Development', semester: 6, credits: 3, category: 'Computing & Software' },
    { code: 'IT 701', title: 'Big Data Architecture & Hadoop/Spark', semester: 7, credits: 3, category: 'Computing & Software' },
    { code: 'IT 801', title: 'Capstone Industry Project', semester: 8, credits: 10, category: 'Workshops & Soft Skills' }
  ],
  aiml: [
    { code: 'AIML 301', title: 'Mathematical Foundations of Data & ML', semester: 3, credits: 4, category: 'Computing & Intelligent Systems' },
    { code: 'AIML 302', title: 'Applied Machine Learning Algorithms', semester: 3, credits: 4, category: 'Computing & Intelligent Systems' },
    { code: 'AIML 401', title: 'Deep Neural Networks & PyTorch', semester: 4, credits: 4, category: 'Computing & Intelligent Systems' },
    { code: 'AIML 501', title: 'Computer Vision & Convolutional Nets', semester: 5, credits: 4, category: 'Computing & Intelligent Systems' },
    { code: 'AIML 601', title: 'Natural Language Processing & Transformers', semester: 6, credits: 4, category: 'Computing & Intelligent Systems' },
    { code: 'AIML 701', title: 'Reinforcement Learning & Autonomous Agents', semester: 7, credits: 3, category: 'Computing & Intelligent Systems' },
    { code: 'AIML 801', title: 'Intelligent Systems Capstone Project', semester: 8, credits: 10, category: 'Workshops & Soft Skills' }
  ],
  ds: [
    { code: 'DS 301', title: 'Applied Probability & Statistical Inference', semester: 3, credits: 4, category: 'Computing & Intelligent Systems' },
    { code: 'DS 302', title: 'Data Wrangling, Mining & ETL Pipelines', semester: 3, credits: 4, category: 'Computing & Intelligent Systems' },
    { code: 'DS 401', title: 'Predictive Modeling & Regression Analysis', semester: 4, credits: 4, category: 'Computing & Intelligent Systems' },
    { code: 'DS 501', title: 'Big Data Processing with PySpark', semester: 5, credits: 4, category: 'Computing & Intelligent Systems' },
    { code: 'DS 601', title: 'Time Series Forecasting & Econometrics', semester: 6, credits: 3, category: 'Computing & Intelligent Systems' },
    { code: 'DS 701', title: 'Data Visualization & Executive Dashboards', semester: 7, credits: 3, category: 'Computing & Intelligent Systems' },
    { code: 'DS 801', title: 'Data Science Capstone Practicum', semester: 8, credits: 10, category: 'Workshops & Soft Skills' }
  ],
  ece: [
    { code: 'ECE 301', title: 'Signals and Systems (Continuous & Discrete)', semester: 3, credits: 4, category: 'Electronics & Hardware' },
    { code: 'ECE 302', title: 'Analog Circuits and Operational Amplifiers', semester: 3, credits: 4, category: 'Electronics & Hardware' },
    { code: 'ECE 401', title: 'Electromagnetic Fields and Waveguides', semester: 4, credits: 4, category: 'Electronics & Hardware' },
    { code: 'ECE 402', title: 'Microprocessors and Microcontrollers (8051 & ARM)', semester: 4, credits: 4, category: 'Electronics & Hardware' },
    { code: 'ECE 501', title: 'Analog and Digital Communication Systems', semester: 5, credits: 4, category: 'Electronics & Hardware' },
    { code: 'ECE 601', title: 'VLSI Design and Verilog HDL Modeling', semester: 6, credits: 4, category: 'Electronics & Hardware' },
    { code: 'ECE 701', title: 'Wireless and Cellular Communications (5G)', semester: 7, credits: 3, category: 'Electronics & Hardware' },
    { code: 'ECE 801', title: 'Hardware Design Capstone Project', semester: 8, credits: 10, category: 'Workshops & Soft Skills' }
  ],
  eee: [
    { code: 'EEE 301', title: 'DC Machines and Transformers', semester: 3, credits: 4, category: 'Electronics & Energy' },
    { code: 'EEE 302', title: 'Electromagnetic Field Theory', semester: 3, credits: 4, category: 'Electronics & Energy' },
    { code: 'EEE 401', title: 'Synchronous and Induction AC Machines', semester: 4, credits: 4, category: 'Electronics & Energy' },
    { code: 'EEE 402', title: 'Control Systems Engineering', semester: 4, credits: 4, category: 'Electronics & Energy' },
    { code: 'EEE 501', title: 'Power Electronics: Inverters & Converters', semester: 5, credits: 4, category: 'Electronics & Energy' },
    { code: 'EEE 601', title: 'Power System Analysis & Grid Stability', semester: 6, credits: 4, category: 'Electronics & Energy' },
    { code: 'EEE 701', title: 'Electric Vehicle Powertrain & Battery Systems', semester: 7, credits: 3, category: 'Electronics & Energy' },
    { code: 'EEE 801', title: 'Power & Energy Capstone Project', semester: 8, credits: 10, category: 'Workshops & Soft Skills' }
  ],
  me: [
    { code: 'ME 301', title: 'Strength of Materials (Mechanics of Solids)', semester: 3, credits: 4, category: 'Mechanical & Physical Systems' },
    { code: 'ME 302', title: 'Engineering Thermodynamics', semester: 3, credits: 4, category: 'Mechanical & Physical Systems' },
    { code: 'ME 401', title: 'Fluid Mechanics & Hydraulic Machinery', semester: 4, credits: 4, category: 'Mechanical & Physical Systems' },
    { code: 'ME 402', title: 'Manufacturing Processes & Machine Tools', semester: 4, credits: 4, category: 'Mechanical & Physical Systems' },
    { code: 'ME 501', title: 'Heat and Mass Transfer', semester: 5, credits: 4, category: 'Mechanical & Physical Systems' },
    { code: 'ME 601', title: 'Design of Machine Elements (Shigley)', semester: 6, credits: 4, category: 'Mechanical & Physical Systems' },
    { code: 'ME 701', title: 'Robotics and Industrial Automation', semester: 7, credits: 3, category: 'Mechanical & Physical Systems' },
    { code: 'ME 801', title: 'Mechanical Engineering Capstone Project', semester: 8, credits: 10, category: 'Workshops & Soft Skills' }
  ],
  civil: [
    { code: 'CE 301', title: 'Mechanics of Solids & Structural Materials', semester: 3, credits: 4, category: 'Infrastructure & Construction' },
    { code: 'CE 302', title: 'Surveying and Geomatics Engineering', semester: 3, credits: 4, category: 'Infrastructure & Construction' },
    { code: 'CE 401', title: 'Fluid Mechanics & Open Channel Hydraulics', semester: 4, credits: 4, category: 'Infrastructure & Construction' },
    { code: 'CE 402', title: 'Structural Analysis I: Energy Theorems', semester: 4, credits: 4, category: 'Infrastructure & Construction' },
    { code: 'CE 501', title: 'Geotechnical Soil Mechanics & Foundations', semester: 5, credits: 4, category: 'Infrastructure & Construction' },
    { code: 'CE 601', title: 'Design of Reinforced Concrete Structures (RCC)', semester: 6, credits: 4, category: 'Infrastructure & Construction' },
    { code: 'CE 701', title: 'Transportation & Highway Engineering', semester: 7, credits: 3, category: 'Infrastructure & Construction' },
    { code: 'CE 801', title: 'Civil Infrastructure Capstone Project', semester: 8, credits: 10, category: 'Workshops & Soft Skills' }
  ],
  che: [
    { code: 'CHE 301', title: 'Fluid Particle Operations & Mechanics', semester: 3, credits: 4, category: 'Process & Materials' },
    { code: 'CHE 302', title: 'Chemical Engineering Thermodynamics', semester: 3, credits: 4, category: 'Process & Materials' },
    { code: 'CHE 401', title: 'Heat Transfer Operations & Exchanger Design', semester: 4, credits: 4, category: 'Process & Materials' },
    { code: 'CHE 402', title: 'Mechanical Unit Operations', semester: 4, credits: 3, category: 'Process & Materials' },
    { code: 'CHE 501', title: 'Mass Transfer I: Diffusion & Distillation', semester: 5, credits: 4, category: 'Process & Materials' },
    { code: 'CHE 601', title: 'Chemical Reaction Engineering I (Kinetics)', semester: 6, credits: 4, category: 'Process & Materials' },
    { code: 'CHE 701', title: 'Process Dynamics and Plant Control', semester: 7, credits: 3, category: 'Process & Materials' },
    { code: 'CHE 801', title: 'Chemical Plant Design Capstone Project', semester: 8, credits: 10, category: 'Workshops & Soft Skills' }
  ],
  bt: [
    { code: 'BT 301', title: 'Biochemistry and Enzymology', semester: 3, credits: 4, category: 'Bioengineering & Life Sciences' },
    { code: 'BT 302', title: 'Microbiology and Sterile Culturing', semester: 3, credits: 4, category: 'Bioengineering & Life Sciences' },
    { code: 'BT 401', title: 'Bioprocess Principles and Stoichiometry', semester: 4, credits: 4, category: 'Bioengineering & Life Sciences' },
    { code: 'BT 402', title: 'Molecular Genetics and Recombinant DNA', semester: 4, credits: 4, category: 'Bioengineering & Life Sciences' },
    { code: 'BT 501', title: 'Downstream Processing & Separation Tech', semester: 5, credits: 4, category: 'Bioengineering & Life Sciences' },
    { code: 'BT 601', title: 'Immunology and Immunotechnology', semester: 6, credits: 4, category: 'Bioengineering & Life Sciences' },
    { code: 'BT 701', title: 'Bioinformatics and Computational Genomics', semester: 7, credits: 3, category: 'Bioengineering & Life Sciences' },
    { code: 'BT 801', title: 'Biotechnology Capstone Research Project', semester: 8, credits: 10, category: 'Workshops & Soft Skills' }
  ]
};

/**
 * Resolves the branch category track for Semester 2 curriculum
 */
export function getBranchTrack(branchId) {
  if (!branchId) return 'computing';
  const bid = branchId.toLowerCase().trim();
  if (['ece', 'eee'].includes(bid)) return 'electronics';
  if (['me', 'civil'].includes(bid)) return 'mechanical_civil';
  if (['che', 'bt'].includes(bid)) return 'bio_chemical';
  return 'computing'; // cse, it, aiml, ds default
}

/**
 * Safely parses semester number from number or string like "Semester 3", "Sem 4"
 */
export function parseSemesterNumber(semester) {
  if (typeof semester === 'number') return semester;
  if (!semester) return 1;
  const digits = String(semester).replace(/\D/g, '');
  return Number.parseInt(digits, 10) || 1;
}

/**
 * Checks whether the university corresponds to Godavari Global University (or recognized aliases).
 */
export function isGodavariGlobalUniversity({ university = '', college = '', universityId = '' } = {}) {
  const uId = (universityId || '').toLowerCase().trim();
  if (uId === 'ggu') return true;

  const raw = (university || college || '').toLowerCase().trim();
  if (!raw) return false;

  if (raw === 'ggu') return true;
  if (raw.includes('godavari')) return true;
  if (raw.includes('giet campus') || raw.includes('giet rajahmundry')) return true;

  return false;
}

/**
 * Checks whether the branch corresponds to CSE-AIML or GGU Computer Science.
 * Strictly excludes IT, standalone AIML, Data Science, and non-computing branches.
 */
export function isCseAimlBranch({ branchId = '', branch = '' } = {}) {
  const bId = (branchId || '').toLowerCase().trim();
  const rawName = (branch || '').toLowerCase().trim();

  // Normalize delimiters to simplify pattern matching
  const normalizedName = rawName
    .replace(/[()[\]{}]/g, ' ')
    .replace(/[-_/\\&+,]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const compressed = rawName.replace(/[\s-_/\\()&+,]/g, '');

  // 1. Check explicit CSE-AIML combinations FIRST (before standalone AIML rejection)
  const isExplicitCseAimlId = bId === 'cse-aiml' || bId === 'cse_aiml' || bId === 'cseaiml';

  const hasCseToken =
    compressed.includes('cse') ||
    normalizedName.includes('cse') ||
    normalizedName.includes('computer science');

  const hasAiMlToken =
    compressed.includes('aiml') ||
    compressed.includes('ai') ||
    normalizedName.includes('aiml') ||
    normalizedName.includes('ai ml') ||
    normalizedName.includes('ai and ml') ||
    normalizedName.includes('artificial intelligence') ||
    normalizedName.includes('machine learning');

  // Both CSE/Computer Science AND AI/ML must be present for a CSE-AIML combination
  const isCseAimlCombo = hasCseToken && hasAiMlToken;

  if (isExplicitCseAimlId || isCseAimlCombo) {
    return true;
  }

  // 2. Reject other engineering disciplines and standalone AIML / IT / DS
  if (['it', 'ds', 'aiml', 'ece', 'eee', 'me', 'civil', 'che', 'bt'].includes(bId)) {
    return false;
  }

  const isOtherDiscipline =
    normalizedName.includes('information technology') ||
    normalizedName.includes('info technology') ||
    normalizedName.includes('data science') ||
    normalizedName.includes('mechanical') ||
    normalizedName.includes('civil') ||
    normalizedName.includes('electrical') ||
    normalizedName.includes('electronics') ||
    normalizedName.includes('chemical') ||
    normalizedName.includes('biotech') ||
    normalizedName.includes('aerospace') ||
    normalizedName === 'artificial intelligence and machine learning' ||
    normalizedName === 'ai machine learning' ||
    normalizedName === 'aiml' ||
    normalizedName === 'ai ml';

  if (isOtherDiscipline) {
    return false;
  }

  // 3. Accept pure CSE (Computer Science and Engineering) under GGU
  if (bId === 'cse') return true;
  if (
    normalizedName.includes('computer science and engineering') ||
    normalizedName.includes('computer science') ||
    normalizedName === 'cse'
  ) {
    return true;
  }

  return false;
}

/**
 * Get standard subjects for a specific university, branch and semester.
 * Initial sample template is provided strictly for Godavari Global University CSE-AIML Semester 1.
 * Clearly identified as sample content (verified: false, isSample: true, source: 'sample_template').
 * Never automatically assigned to IT, AIML, Data Science, other universities, or other semesters.
 */
export function getStandardSubjectsForBranch(arg1 = 'cse', arg2 = 1, arg3 = '') {
  let university = '';
  let college = '';
  let universityId = '';
  let branchId = 'cse';
  let branch = '';
  let semester = 1;

  if (typeof arg1 === 'object' && arg1 !== null) {
    university = arg1.university || arg1.profile?.college || arg1.profile?.university || '';
    college = arg1.college || arg1.profile?.college || '';
    universityId = arg1.universityId || arg1.profile?.universityId || '';
    branchId = arg1.branchId || arg1.profile?.branchId || arg1.branch || 'cse';
    branch = arg1.branch || arg1.profile?.branch || '';
    semester = arg1.semester ?? arg1.profile?.semester ?? 1;
  } else {
    branchId = arg1 || 'cse';
    semester = arg2 ?? 1;
    college = typeof arg3 === 'string' ? arg3 : '';
    university = college;
  }

  const semNum = parseSemesterNumber(semester);
  const isGgu = isGodavariGlobalUniversity({ university, college, universityId });
  const isCseAiml = isCseAimlBranch({ branchId, branch });

  // Semester 1: Initial sample template specifically for Godavari Global University CSE-AIML.
  // Never automatically assigned to IT, AIML, Data Science, other universities, or other semesters.
  if (semNum === 1 && isGgu && isCseAiml) {
    return SEMESTER_1_SUBJECTS.map((s) => ({
      ...s,
      semester: 1,
      verified: false,
      isSample: true,
      source: 'sample_template',
      templateName: 'Godavari Global University · CSE-AIML Sample Template (Semester 1)'
    }));
  }

  // For unsupported university/branch/semester combinations, return only an empty array.
  // Never invent courses for other universities or higher semesters.
  return [];
}

/**
 * Combines standard subjects, student custom subjects, and local overrides.
 * Accepts university, branch, and semester (or profile object).
 */
export function getActiveCurriculumSubjects({
  university = '',
  college = '',
  universityId = '',
  branchId = '',
  branch = '',
  semester = 1,
  customSubjects = [],
  subjectOverrides = {},
  profile = null
} = {}) {
  const targetUni = university || profile?.college || profile?.university || college || '';
  const targetUniId = universityId || profile?.universityId || '';
  const targetBranchId = branchId || profile?.branchId || 'cse';
  const targetBranch = branch || profile?.branch || '';
  const semNum = parseSemesterNumber(semester ?? profile?.semester ?? 1);

  const standard = getStandardSubjectsForBranch({
    university: targetUni,
    college: targetUni,
    universityId: targetUniId,
    branchId: targetBranchId,
    branch: targetBranch,
    semester: semNum
  });

  const normalizedBranch = targetBranchId.toLowerCase().trim();

  // Filter custom subjects matching this semester and branch (or common to all)
  const userSubjects = customSubjects.filter((cs) => {
    const csSem = parseSemesterNumber(cs.semester);
    if (csSem !== semNum) return false;
    if (!cs.branchId || cs.branchId === 'all' || cs.branchId.toLowerCase().trim() === normalizedBranch) return true;
    return false;
  });

  // Combine standard and custom subjects
  const combined = [...standard, ...userSubjects];

  // Apply any student overrides (e.g. edited title, custom units, custom topics)
  return combined.map((sub) => {
    const override = subjectOverrides[sub.id];
    if (!override) return sub;

    return {
      ...sub,
      ...override,
      // Merge units if overridden
      units: override.units || sub.units
    };
  });
}

/**
 * Extracts flat list of all topics from a subject (including custom topics)
 */
export function getAllSubjectTopics(subject) {
  if (!subject) return [];
  return baseGetAllTopics(subject);
}

/**
 * Generates an empty custom subject blueprint
 */
export function createCustomSubjectTemplate({ branchId = 'cse', semester = 1 }) {
  const semNum = Number.parseInt(semester, 10) || 1;
  return {
    id: `custom-sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    code: 'ENG 199',
    title: 'Custom Engineering Subject',
    shortName: 'Custom Course',
    department: 'Engineering Department',
    credits: 3,
    category: 'Elective Course',
    semester: semNum,
    branchId,
    verified: false,
    source: 'custom',
    description: 'Custom subject configured by student according to college syllabus.',
    units: [
      {
        unitNumber: 1,
        unitTitle: 'Unit 1: Course Fundamentals',
        topics: [
          { id: `top-${Date.now()}-1`, name: 'Introduction to Course Principles' },
          { id: `top-${Date.now()}-2`, name: 'Core Methodologies and Problem Solving' }
        ]
      }
    ]
  };
}
