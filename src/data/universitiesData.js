// Sagevanta Indian Engineering Universities and Institutions Catalog
// A reusable, extensible catalog of technical universities, affiliating bodies, and institutes
// Note: Only institutions with verified syllabi configured are marked with hasVerifiedCurriculum: true.
// We NEVER falsely claim that an institution's curriculum is available when it is awaiting upload.

export const INDIAN_UNIVERSITIES = [
  {
    id: 'ggu',
    name: 'Godavari Global University',
    shortName: 'GGU',
    location: 'Rajahmundry, Andhra Pradesh',
    state: 'Andhra Pradesh',
    type: 'State Private University',
    defaultRegulation: 'Autonomous College CBCS Scheme (2023 / 2024)',
    hasVerifiedCurriculum: false,
    hasSampleTemplate: true,
    verifiedPrograms: [],
    samplePrograms: ['CSE-AIML Semester 1'],
    syllabusNote: 'Sample curriculum template available for CSE-AIML (Semester 1). Upload syllabus for official verification.',
    description: 'Autonomous multidisciplinary technical university in Andhra Pradesh (formerly GIET campus).',
    aliases: ['GGU', 'Godavari Global', 'GIET Campus', 'GIET Rajahmundry']
  },
  {
    id: 'anna_univ',
    name: 'Anna University',
    shortName: 'Anna Univ',
    location: 'Chennai, Tamil Nadu',
    state: 'Tamil Nadu',
    type: 'State Technical University & Affiliating Body',
    defaultRegulation: 'Anna University Regulation (2021 / 2023)',
    hasVerifiedCurriculum: false,
    verifiedPrograms: [],
    syllabusNote: 'Upload your college syllabus PDF or configure courses manually.',
    description: 'Premier affiliating technical university with 500+ engineering colleges across Tamil Nadu.',
    aliases: ['Anna Univ', 'AU Chennai', 'CEG', 'MIT Chromepet', 'Anna University Affiliated Colleges']
  },
  {
    id: 'jntuh',
    name: 'Jawaharlal Nehru Technological University Hyderabad (JNTUH)',
    shortName: 'JNTU Hyderabad',
    location: 'Hyderabad, Telangana',
    state: 'Telangana',
    type: 'State Technical University & Affiliating Body',
    defaultRegulation: 'JNTU R23 / R24 Curriculum',
    hasVerifiedCurriculum: false,
    verifiedPrograms: [],
    syllabusNote: 'Upload your college syllabus PDF or configure courses manually.',
    description: 'Major technical university affiliating hundreds of engineering colleges across Telangana.',
    aliases: ['JNTUH', 'JNTU Hyderabad', 'JNTU Telangana', 'JNTU-H']
  },
  {
    id: 'jntuk',
    name: 'Jawaharlal Nehru Technological University Kakinada (JNTUK)',
    shortName: 'JNTU Kakinada',
    location: 'Kakinada, Andhra Pradesh',
    state: 'Andhra Pradesh',
    type: 'State Technical University & Affiliating Body',
    defaultRegulation: 'JNTU R23 / R24 Curriculum',
    hasVerifiedCurriculum: false,
    verifiedPrograms: [],
    syllabusNote: 'Upload your college syllabus PDF or configure courses manually.',
    description: 'Apex technical university affiliating engineering colleges across coastal Andhra Pradesh.',
    aliases: ['JNTUK', 'JNTU Kakinada', 'JNTU AP', 'JNTU-K']
  },
  {
    id: 'vtu',
    name: 'Visvesvaraya Technological University (VTU Belagavi)',
    shortName: 'VTU Belagavi',
    location: 'Belagavi, Karnataka',
    state: 'Karnataka',
    type: 'State Technical University & Affiliating Body',
    defaultRegulation: 'VTU NEP 2020 / 2024 Framework',
    hasVerifiedCurriculum: false,
    verifiedPrograms: [],
    syllabusNote: 'Upload your college syllabus PDF or configure courses manually.',
    description: 'Statewide engineering university affiliating 200+ autonomous and affiliated colleges across Karnataka.',
    aliases: ['VTU', 'VTU Belagavi', 'Visvesvaraya Tech', 'VTU Affiliated Colleges']
  },
  {
    id: 'ap_affiliated',
    name: 'AP Affiliated Engineering Colleges (JNTUK / JNTUA / APSCHE)',
    shortName: 'AP Affiliated Colleges',
    location: 'Andhra Pradesh',
    state: 'Andhra Pradesh',
    type: 'Affiliated / Autonomous Colleges System',
    defaultRegulation: 'JNTU R23 / R24 Curriculum',
    hasVerifiedCurriculum: false,
    verifiedPrograms: [],
    syllabusNote: 'Upload your college syllabus PDF or configure courses manually.',
    description: 'Autonomous and non-autonomous engineering colleges affiliated to JNTUK, JNTUA, and APSCHE.',
    aliases: ['AP Colleges', 'JNTUK Affiliated', 'JNTUA Affiliated', 'APSCHE Engineering', 'AP Autonomous Colleges']
  },
  {
    id: 'aktu',
    name: 'Dr. A.P.J. Abdul Kalam Technical University (AKTU)',
    shortName: 'AKTU',
    location: 'Lucknow, Uttar Pradesh',
    state: 'Uttar Pradesh',
    type: 'State Technical University & Affiliating Body',
    defaultRegulation: 'AKTU NEP Scheme',
    hasVerifiedCurriculum: false,
    verifiedPrograms: [],
    syllabusNote: 'Upload your college syllabus PDF or configure courses manually.',
    description: 'Apex technical university affiliating 700+ engineering and technology colleges across Uttar Pradesh.',
    aliases: ['AKTU', 'UPTU', 'Abdul Kalam Technical University', 'AKTU Affiliated Colleges']
  },
  {
    id: 'mumbai_univ',
    name: 'University of Mumbai (Mumbai University)',
    shortName: 'Mumbai University',
    location: 'Mumbai, Maharashtra',
    state: 'Maharashtra',
    type: 'State University & Affiliating Body',
    defaultRegulation: 'Autonomous College CBCS Scheme (2023 / 2024)',
    hasVerifiedCurriculum: false,
    verifiedPrograms: [],
    syllabusNote: 'Upload your college syllabus PDF or configure courses manually.',
    description: 'Premier university affiliating leading engineering colleges across Mumbai and Konkan region.',
    aliases: ['MU', 'Mumbai University', 'University of Mumbai', 'VJTI Affiliated', 'SPIT Affiliated']
  },
  {
    id: 'sppu',
    name: 'Savitribai Phule Pune University (SPPU / Pune University)',
    shortName: 'SPPU',
    location: 'Pune, Maharashtra',
    state: 'Maharashtra',
    type: 'State University & Affiliating Body',
    defaultRegulation: 'Autonomous College CBCS Scheme (2023 / 2024)',
    hasVerifiedCurriculum: false,
    verifiedPrograms: [],
    syllabusNote: 'Upload your college syllabus PDF or configure courses manually.',
    description: 'Apex university affiliating top engineering colleges across Pune, Ahmednagar, and Nashik.',
    aliases: ['SPPU', 'Pune University', 'Unipune', 'Savitribai Phule Pune']
  },
  {
    id: 'ktu',
    name: 'APJ Abdul Kalam Technological University (KTU Kerala)',
    shortName: 'KTU Kerala',
    location: 'Thiruvananthapuram, Kerala',
    state: 'Kerala',
    type: 'State Technical University',
    defaultRegulation: 'AICTE 2024 Model Curriculum',
    hasVerifiedCurriculum: false,
    verifiedPrograms: [],
    syllabusNote: 'Upload your college syllabus PDF or configure courses manually.',
    description: 'State technical university affiliating all government and private engineering colleges in Kerala.',
    aliases: ['KTU', 'Kerala Technological University', 'KTU Kerala', 'APJAKTU']
  },
  {
    id: 'makaut',
    name: 'Maulana Abul Kalam Azad University of Technology (MAKAUT WB)',
    shortName: 'MAKAUT',
    location: 'Kolkata, West Bengal',
    state: 'West Bengal',
    type: 'State Technical University & Affiliating Body',
    defaultRegulation: 'AICTE 2024 Model Curriculum',
    hasVerifiedCurriculum: false,
    verifiedPrograms: [],
    syllabusNote: 'Upload your college syllabus PDF or configure courses manually.',
    description: 'State university administering engineering and technology institutions across West Bengal.',
    aliases: ['MAKAUT', 'WBUT', 'West Bengal University of Technology']
  },
  {
    id: 'iits',
    name: 'Indian Institutes of Technology (IITs)',
    shortName: 'IIT System',
    location: 'Pan-India',
    state: 'National',
    type: 'Institutes of National Importance',
    defaultRegulation: 'IIT / NIT Flexible Credit System',
    hasVerifiedCurriculum: false,
    verifiedPrograms: [],
    syllabusNote: 'Upload your department course handout / syllabus PDF or add courses manually.',
    description: 'IIT Madras, IIT Bombay, IIT Delhi, IIT Kharagpur, IIT Kanpur, IIT Roorkee, IIT Guwahati, IIT Hyderabad, and other IITs.',
    aliases: ['IIT', 'IITs', 'IIT Madras', 'IIT Bombay', 'IIT Delhi', 'IIT Kharagpur', 'IIT Kanpur', 'IIT Roorkee', 'IIT Hyderabad']
  },
  {
    id: 'nits',
    name: 'National Institutes of Technology (NITs)',
    shortName: 'NIT System',
    location: 'Pan-India',
    state: 'National',
    type: 'Institutes of National Importance',
    defaultRegulation: 'IIT / NIT Flexible Credit System',
    hasVerifiedCurriculum: false,
    verifiedPrograms: [],
    syllabusNote: 'Upload your institute syllabus PDF or add courses manually.',
    description: 'NIT Trichy, NIT Surathkal, NIT Warangal, NIT Rourkela, NIT Calicut, VNIT Nagpur, and other National Institutes of Technology.',
    aliases: ['NIT', 'NITs', 'NIT Trichy', 'NIT Surathkal', 'NIT Warangal', 'NIT Rourkela', 'NIT Calicut', 'VNIT']
  },
  {
    id: 'iiits',
    name: 'Indian Institutes of Information Technology (IIITs)',
    shortName: 'IIIT System',
    location: 'Pan-India',
    state: 'National',
    type: 'Institutes of National Importance',
    defaultRegulation: 'IIT / NIT Flexible Credit System',
    hasVerifiedCurriculum: false,
    verifiedPrograms: [],
    syllabusNote: 'Upload your institute curriculum or add courses manually.',
    description: 'IIIT Hyderabad, IIIT Bangalore, IIIT Allahabad, IIIT Delhi, and other IIITs.',
    aliases: ['IIIT', 'IIITs', 'IIIT Hyderabad', 'IIIT Bangalore', 'IIIT Delhi']
  },
  {
    id: 'bits',
    name: 'BITS Pilani (Pilani, Goa, Hyderabad Campuses)',
    shortName: 'BITS Pilani',
    location: 'Pilani / Goa / Hyderabad',
    state: 'National',
    type: 'Deemed to be University / Institute of Eminence',
    defaultRegulation: 'Autonomous College CBCS Scheme (2023 / 2024)',
    hasVerifiedCurriculum: false,
    verifiedPrograms: [],
    syllabusNote: 'Upload your BITS course handout / syllabus PDF or configure courses manually.',
    description: 'Birla Institute of Technology and Science, Pilani.',
    aliases: ['BITS', 'BITS Pilani', 'BITS Goa', 'BITS Hyderabad']
  },
  {
    id: 'autonomous_generic',
    name: 'Autonomous Engineering College (UGC / AICTE Autonomous)',
    shortName: 'Autonomous College',
    location: 'Pan-India',
    state: 'General',
    type: 'Autonomous Engineering Institution',
    defaultRegulation: 'Autonomous College CBCS Scheme (2023 / 2024)',
    hasVerifiedCurriculum: false,
    verifiedPrograms: [],
    syllabusNote: 'Upload your college academic regulation and syllabus PDF.',
    description: 'Autonomous engineering college with independent curriculum and examination board.',
    aliases: ['Autonomous', 'Autonomous College', 'UGC Autonomous', 'Autonomous Institute']
  }
];

export const POPULAR_UNIVERSITIES = [
  'Godavari Global University',
  'Anna University',
  'Jawaharlal Nehru Technological University Hyderabad (JNTUH)',
  'Jawaharlal Nehru Technological University Kakinada (JNTUK)',
  'Visvesvaraya Technological University (VTU Belagavi)',
  'AP Affiliated Engineering Colleges (JNTUK / JNTUA / APSCHE)',
  'Dr. A.P.J. Abdul Kalam Technical University (AKTU)',
  'University of Mumbai (Mumbai University)',
  'Savitribai Phule Pune University (SPPU / Pune University)',
  'APJ Abdul Kalam Technological University (KTU Kerala)',
  'Maulana Abul Kalam Azad University of Technology (MAKAUT WB)',
  'Indian Institutes of Technology (IITs)',
  'National Institutes of Technology (NITs)',
  'Autonomous Engineering College (UGC / AICTE Autonomous)'
];

/**
 * Searches the university catalog with ranking by relevance
 * @param {string} query - Student search string
 * @param {number} limit - Maximum results to return
 * @returns {Array} - Array of matching university objects
 */
export function searchUniversities(query = '', limit = 8) {
  if (!query || !query.trim()) {
    return INDIAN_UNIVERSITIES.slice(0, limit);
  }

  const cleanQuery = query.toLowerCase().trim();
  const scored = [];

  for (const uni of INDIAN_UNIVERSITIES) {
    let score = 0;
    const nameLower = uni.name.toLowerCase();
    const shortLower = uni.shortName.toLowerCase();
    const locLower = uni.location.toLowerCase();
    const stateLower = uni.state.toLowerCase();

    // Exact name or short name match
    if (nameLower === cleanQuery || shortLower === cleanQuery) {
      score += 100;
    } else if (nameLower.startsWith(cleanQuery) || shortLower.startsWith(cleanQuery)) {
      score += 60;
    } else if (nameLower.includes(cleanQuery) || shortLower.includes(cleanQuery)) {
      score += 40;
    }

    // Check aliases
    if (uni.aliases && uni.aliases.some((a) => a.toLowerCase().includes(cleanQuery))) {
      score += 35;
    }

    // Check location / state
    if (locLower.includes(cleanQuery) || stateLower.includes(cleanQuery)) {
      score += 20;
    }

    if (score > 0) {
      scored.push({ university: uni, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.university);
}

/**
 * Find university by ID
 */
export function getUniversityById(id) {
  if (!id) return null;
  const target = id.toLowerCase().trim();
  return INDIAN_UNIVERSITIES.find((u) => u.id === target) || null;
}

/**
 * Find university by name or alias
 */
export function getUniversityByName(name) {
  if (!name) return null;
  const target = name.toLowerCase().trim();
  return (
    INDIAN_UNIVERSITIES.find(
      (u) =>
        u.name.toLowerCase() === target ||
        u.shortName.toLowerCase() === target ||
        (u.aliases && u.aliases.some((a) => a.toLowerCase() === target))
    ) || null
  );
}
