// Sagevanta Engineering Branches, Degrees & University Regulations Catalog
// Comprehensive definitions for 10 engineering disciplines + extensibility for custom specializations

export const ENGINEERING_BRANCHES = [
  {
    id: 'cse',
    code: 'CSE',
    name: 'Computer Science and Engineering',
    shortName: 'Computer Science',
    department: 'School of Computer Science & Engineering',
    category: 'Computing & Software',
    color: '#3B6E52',
    accent: '#B9CDBE',
    description: 'Foundations of computation, software design, algorithms, computer architecture, databases, and operating systems.',
    coreDomains: ['Algorithms & Data Structures', 'Operating Systems', 'Database Systems', 'Computer Networks', 'Software Engineering'],
    specializations: ['Artificial Intelligence', 'Cybersecurity', 'Cloud Computing', 'Full Stack Development', 'Distributed Systems']
  },
  {
    id: 'it',
    code: 'IT',
    name: 'Information Technology',
    shortName: 'Info Technology',
    department: 'Department of Information Technology',
    category: 'Computing & Software',
    color: '#2F6149',
    accent: '#B0C6B5',
    description: 'Applied computing, enterprise networking, web technologies, cybersecurity, cloud infrastructure, and information systems.',
    coreDomains: ['Enterprise Networking', 'Web & Mobile Systems', 'Information Security', 'Cloud Services', 'System Administration'],
    specializations: ['Cloud Architecture', 'DevOps & SRE', 'Information Security', 'Big Data Engineering']
  },
  {
    id: 'aiml',
    code: 'AIML',
    name: 'Artificial Intelligence and Machine Learning',
    shortName: 'AI & Machine Learning',
    department: 'School of Artificial Intelligence & Computing',
    category: 'Computing & Intelligent Systems',
    color: '#265C45',
    accent: '#C5D8C9',
    description: 'Deep neural networks, probabilistic modeling, computer vision, natural language processing, and autonomous intelligent systems.',
    coreDomains: ['Linear Algebra & Probability', 'Machine Learning Models', 'Deep Learning & Neural Networks', 'Computer Vision', 'NLP & LLMs'],
    specializations: ['Generative AI', 'Robotics & Autonomous Systems', 'Applied ML', 'Reinforcement Learning']
  },
  {
    id: 'ds',
    code: 'DS',
    name: 'Data Science',
    shortName: 'Data Science',
    department: 'Department of Data Science & Analytics',
    category: 'Computing & Intelligent Systems',
    color: '#34664F',
    accent: '#BAD1C1',
    description: 'Statistical modeling, predictive analytics, massive-scale data processing, visualization, and decision engineering.',
    coreDomains: ['Mathematical Statistics', 'Data Mining & Warehousing', 'Data Wrangling & Pipeline Ops', 'Predictive Modeling', 'Big Data Frameworks'],
    specializations: ['Business Analytics', 'Data Engineering', 'Time Series Analysis', 'MLOps']
  },
  {
    id: 'ece',
    code: 'ECE',
    name: 'Electronics and Communication Engineering',
    shortName: 'Electronics & Comm',
    department: 'Department of Electronics & Communication',
    category: 'Electronics & Hardware',
    color: '#385F4D',
    accent: '#CADACA',
    description: 'Semiconductor devices, analog and digital circuits, signals & systems, RF communications, embedded microcontrollers, and VLSI.',
    coreDomains: ['Signals & Systems', 'Digital Circuit Design', 'Microprocessors & Embedded C', 'Analog Electronics', 'Electromagnetic Waves'],
    specializations: ['VLSI & Chip Design', 'Wireless Communication (5G/6G)', 'Embedded IoT', 'Signal Processing']
  },
  {
    id: 'eee',
    code: 'EEE',
    name: 'Electrical and Electronics Engineering',
    shortName: 'Electrical Engineering',
    department: 'Department of Electrical & Electronics',
    category: 'Electronics & Energy',
    color: '#2F5441',
    accent: '#BDCEBF',
    description: 'Power generation, high-voltage transmission, electrical machines, power electronics, control theory, and renewable energy grids.',
    coreDomains: ['Electric Circuit Analysis', 'Electromagnetic Fields', 'Electrical Machines', 'Power Systems', 'Control Systems Engineering'],
    specializations: ['Electric Vehicles & Batteries', 'Renewable Energy Systems', 'Smart Power Grids', 'Industrial Automation']
  },
  {
    id: 'me',
    code: 'ME',
    name: 'Mechanical Engineering',
    shortName: 'Mechanical',
    department: 'Department of Mechanical Engineering',
    category: 'Mechanical & Physical Systems',
    color: '#425A4B',
    accent: '#D0DBD2',
    description: 'Thermodynamics, mechanics of materials, fluid dynamics, heat transfer, CAD/CAM manufacturing, and robotics.',
    coreDomains: ['Engineering Mechanics', 'Thermodynamics & Heat Transfer', 'Fluid Mechanics', 'Strength of Materials', 'Manufacturing Technology'],
    specializations: ['Thermal & Fluids Engineering', 'Automotive & Aerospace', 'Robotics & Mechatronics', 'Advanced CAD/CAM Design']
  },
  {
    id: 'civil',
    code: 'Civil',
    name: 'Civil Engineering',
    shortName: 'Civil Engineering',
    department: 'Department of Civil & Environmental Engineering',
    category: 'Infrastructure & Construction',
    color: '#4A5B51',
    accent: '#D7DDD7',
    description: 'Structural mechanics, geotechnical soil foundations, surveying, environmental hydraulics, and sustainable infrastructure.',
    coreDomains: ['Structural Analysis', 'Geotechnical & Soil Mechanics', 'Surveying & Geomatics', 'Fluid Mechanics & Hydrology', 'Concrete Technology'],
    specializations: ['Structural Engineering', 'Transportation & Highways', 'Environmental Engineering', 'Construction Project Management']
  },
  {
    id: 'che',
    code: 'CHE',
    name: 'Chemical Engineering',
    shortName: 'Chemical Engineering',
    department: 'Department of Chemical Engineering & Materials',
    category: 'Process & Materials',
    color: '#3D5E4D',
    accent: '#C7D4CA',
    description: 'Chemical reaction engineering, transport phenomena, mass transfer, process thermodynamics, separations, and plant safety.',
    coreDomains: ['Chemical Process Calculations', 'Thermodynamics', 'Fluid Particle Operations', 'Mass Transfer', 'Chemical Reaction Engineering'],
    specializations: ['Petrochemicals & Energy', 'Polymer Science', 'Process Simulation & Optimization', 'Environmental Process Control']
  },
  {
    id: 'bt',
    code: 'BT',
    name: 'Biotechnology',
    shortName: 'Biotechnology',
    department: 'Department of Biotechnology & Biochemical Engineering',
    category: 'Bioengineering & Life Sciences',
    color: '#346B52',
    accent: '#BFD4C6',
    description: 'Biochemical engineering, genetic manipulation, bioprocess kinetics, immunology, bioinformatics, and molecular diagnostics.',
    coreDomains: ['Biochemistry & Cell Biology', 'Microbiology & Immunology', 'Bioprocess Engineering', 'Molecular Biology & Genetic Eng', 'Bioinformatics'],
    specializations: ['Bioinformatics & Computational Bio', 'Biopharmaceutical Processing', 'Agricultural Biotechnology', 'Industrial Fermentation']
  }
];

export const STANDARD_DEGREES = [
  { id: 'btech', code: 'B.Tech', label: 'B.Tech — Bachelor of Technology' },
  { id: 'be', code: 'B.E.', label: 'B.E. — Bachelor of Engineering' },
  { id: 'diploma', code: 'Diploma', label: 'Diploma in Engineering' },
  { id: 'mtech', code: 'M.Tech', label: 'M.Tech — Master of Technology' },
  { id: 'dual', code: 'Dual Degree', label: 'Dual Degree — B.Tech + M.Tech Integrated' },
  { id: 'bsc_eng', code: 'B.S. Eng', label: 'B.S. — Bachelor of Science in Engineering' }
];

export const STANDARD_REGULATIONS = [
  { id: 'aicte', label: 'AICTE 2024 Model Curriculum' },
  { id: 'autonomous_cbcs', label: 'Autonomous College CBCS Scheme (2023 / 2024)' },
  { id: 'anna_univ', label: 'Anna University Regulation (2021 / 2023)' },
  { id: 'vtu_nep', label: 'VTU NEP 2020 / 2024 Framework' },
  { id: 'jntu_r23', label: 'JNTU R23 / R24 Curriculum' },
  { id: 'aktu', label: 'AKTU NEP Scheme' },
  { id: 'iit_nit', label: 'IIT / NIT Flexible Credit System' },
  { id: 'custom', label: 'Custom University Curriculum' }
];

export const ACADEMIC_YEARS = [
  { id: 'First Year', label: 'First Year (Freshman)', semesters: [1, 2] },
  { id: 'Second Year', label: 'Second Year (Sophomore)', semesters: [3, 4] },
  { id: 'Third Year', label: 'Third Year (Junior)', semesters: [5, 6] },
  { id: 'Final Year', label: 'Final Year (Senior)', semesters: [7, 8] }
];

export const ACADEMIC_SEMESTERS = [
  { id: 1, label: 'Semester 1', year: 'First Year', shortLabel: 'Sem 1' },
  { id: 2, label: 'Semester 2', year: 'First Year', shortLabel: 'Sem 2' },
  { id: 3, label: 'Semester 3', year: 'Second Year', shortLabel: 'Sem 3' },
  { id: 4, label: 'Semester 4', year: 'Second Year', shortLabel: 'Sem 4' },
  { id: 5, label: 'Semester 5', year: 'Third Year', shortLabel: 'Sem 5' },
  { id: 6, label: 'Semester 6', year: 'Third Year', shortLabel: 'Sem 6' },
  { id: 7, label: 'Semester 7', year: 'Final Year', shortLabel: 'Sem 7' },
  { id: 8, label: 'Semester 8', year: 'Final Year', shortLabel: 'Sem 8' }
];

export function getBranchById(branchId) {
  if (!branchId) return ENGINEERING_BRANCHES[0];
  const normalized = branchId.toLowerCase().trim();
  const found = ENGINEERING_BRANCHES.find(
    (b) => b.id === normalized || b.code.toLowerCase() === normalized || b.name.toLowerCase().includes(normalized)
  );
  return found || ENGINEERING_BRANCHES[0];
}

export function getBranchByName(name) {
  if (!name) return ENGINEERING_BRANCHES[0];
  const normalized = name.toLowerCase().trim();
  const found = ENGINEERING_BRANCHES.find(
    (b) => b.name.toLowerCase() === normalized || b.shortName.toLowerCase() === normalized || b.code.toLowerCase() === normalized
  );
  return found || null;
}
