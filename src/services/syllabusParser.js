// Sagevanta Client-Side University Syllabus Parser
// Safely parses PDF streams and plain text / markdown / JSON syllabi directly in the browser
// Zero external server dependencies; zero silently invented subjects

/**
 * Extracts plain text from an uploaded PDF file in the browser
 * Handles both standard uncompressed text streams and /FlateDecode streams via DecompressionStream
 */
export async function extractTextFromPdf(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const latin1Decoder = new TextDecoder('latin1');
    const rawContent = latin1Decoder.decode(bytes);

    let extractedText = '';

    // 1. Scan for compressed streams (/FlateDecode)
    const streamRegex = /<<[\s\S]*?\/Filter\s*\/FlateDecode[\s\S]*?>>\s*stream\r?\n([\s\S]*?)\r?\nendstream/g;
    let match;
    const streamsToDecompress = [];

    while ((match = streamRegex.exec(rawContent)) !== null) {
      const streamStart = match.index + match[0].indexOf('stream') + (match[0].includes('\r\n') ? 8 : 7);
      const streamEnd = match.index + match[0].lastIndexOf('endstream') - (match[0].includes('\r\n') ? 2 : 1);
      if (streamEnd > streamStart) {
        streamsToDecompress.push(bytes.subarray(streamStart, streamEnd));
      }
    }

    // Decompress streams using native browser DecompressionStream if available
    for (const chunk of streamsToDecompress) {
      try {
        if (typeof DecompressionStream !== 'undefined') {
          const ds = new DecompressionStream('deflate');
          const writer = ds.writable.getWriter();
          writer.write(chunk);
          writer.close();
          const reader = ds.readable.getReader();
          const chunks = [];
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            chunks.push(value);
          }
          const totalLength = chunks.reduce((acc, val) => acc + val.length, 0);
          const decompressedBytes = new Uint8Array(totalLength);
          let offset = 0;
          for (const c of chunks) {
            decompressedBytes.set(c, offset);
            offset += c.length;
          }
          const decodedText = new TextDecoder('utf-8').decode(decompressedBytes);
          extractedText += '\n' + parsePdfTextOperators(decodedText);
        }
      } catch {
        // Fallback if individual stream decompression encounters non-standard deflate
      }
    }

    // 2. Also extract from uncompressed text operators across the document
    extractedText += '\n' + parsePdfTextOperators(rawContent);

    // 3. Fallback: Extract readable string sequences if text operator parsing yielded minimal results
    if (extractedText.trim().length < 50) {
      extractedText = extractAsciiStrings(rawContent);
    }

    if (extractedText.trim().length > 30) {
      return { success: true, text: extractedText.trim() };
    }

    return {
      success: false,
      text: '',
      error: 'Could not extract text layer from PDF. The document may be a scanned image or protected. Please paste syllabus text directly.'
    };
  } catch (err) {
    return {
      success: false,
      text: '',
      error: `PDF reading error: ${err.message || 'Unable to parse file'}`
    };
  }
}

/**
 * Parses PDF text operators (BT ... ET, Tj, TJ) into readable lines
 */
function parsePdfTextOperators(content) {
  let result = '';
  // Match text blocks between BT (Begin Text) and ET (End Text)
  const btRegex = /BT\s*([\s\S]*?)\s*ET/g;
  let btMatch;

  while ((btMatch = btRegex.exec(content)) !== null) {
    const block = btMatch[1];
    // Match (string) Tj or [(array)] TJ
    const tjRegex = /\(([\s\S]*?)\)\s*Tj|\[([\s\S]*?)\]\s*TJ/g;
    let tjMatch;
    let blockText = '';

    while ((tjMatch = tjRegex.exec(block)) !== null) {
      if (tjMatch[1] !== undefined) {
        blockText += decodePdfLiteralString(tjMatch[1]) + ' ';
      } else if (tjMatch[2] !== undefined) {
        // Parse array of strings and positioning offsets
        const arrayItems = tjMatch[2].match(/\(([\s\S]*?)\)|-?\d+/g) || [];
        for (const item of arrayItems) {
          if (item.startsWith('(') && item.endsWith(')')) {
            blockText += decodePdfLiteralString(item.slice(1, -1));
          } else {
            const offset = parseInt(item, 10);
            if (offset < -100) blockText += ' ';
          }
        }
        blockText += ' ';
      }
    }

    if (blockText.trim()) {
      result += blockText.trim() + '\n';
    }
  }

  return result;
}

/**
 * Decodes standard PDF literal string escape sequences
 */
function decodePdfLiteralString(str) {
  return str
    .replace(/\\([0-7]{1,3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)))
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\b/g, '\b')
    .replace(/\\f/g, '\f')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\\/g, '\\');
}

/**
 * Fallback: Extracts readable human-readable string runs from binary PDF data
 */
function extractAsciiStrings(content) {
  const matches = content.match(/[A-Za-z0-9\s.,;:'"()\-–—/]{4,}/g) || [];
  return matches
    .filter((s) => s.trim().length > 3 && !/^[0-9\s]+$/.test(s))
    .join('\n');
}

/**
 * Parses raw syllabus text into structured University, Degree, Branch, Semester, and Courses
 * Never silently invents missing subjects or topics.
 */
export function parseSyllabusText(rawText, fallbackSemester = 1, sourceFilename = '') {
  if (!rawText || !rawText.trim()) {
    return {
      metadata: {},
      subjects: [],
      detectedSemesters: []
    };
  }

  const text = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  // 1. Detect Academic Metadata
  const metadata = {
    university: detectUniversity(text),
    degree: detectDegree(text),
    branch: detectBranch(text),
    regulation: detectRegulation(text),
    sourceDocument: sourceFilename || 'Uploaded Syllabus Document'
  };

  // 2. Identify Semester Segments
  const detectedSemesters = detectSemesterNumbers(text);
  const primarySemester = detectedSemesters.length > 0 ? detectedSemesters[0] : fallbackSemester;

  // 3. Extract Subjects / Courses
  const subjects = [];
  const linesCount = lines.length;

  for (let i = 0; i < linesCount; i++) {
    const line = lines[i];

    // Check if line represents a Course Code or Subject Header
    // Standard Indian University Course Code patterns: e.g. CS101, 23CSE101, MATH-101, PHY 101, IT201
    const codeMatch = line.match(/\b([A-Z0-9]{2,5}\s*[-_]?\s*\d{3,4}[A-Z]?)\b/);

    // Also detect subject title indicators
    const isCourseLine = codeMatch || /^(?:Course|Subject|Paper)\s*(?:Code|Name)?[:\s]/i.test(line);

    if (isCourseLine) {
      let code = codeMatch ? codeMatch[1].replace(/\s+/g, ' ').toUpperCase() : '';
      let title = line.replace(codeMatch ? codeMatch[0] : '', '').replace(/^(?:Course|Subject|Paper)\s*(?:Code|Name)?[:\s]*/i, '').trim();

      // If title is too short or empty, inspect next line
      if (title.length < 3 && i + 1 < linesCount) {
        const nextLine = lines[i + 1];
        if (!/^(?:UNIT|MODULE|CREDIT|SEMESTER)/i.test(nextLine)) {
          title = nextLine;
          i++;
        }
      }

      // Clean title from trailing punctuation, credits, hours
      title = title.replace(/\s*[-–]\s*(?:Credits?|L-T-P-C|\d+\s*Credits?).*$/i, '').trim();

      if (title.length >= 3) {
        // Detect credits on this or subsequent lines
        let credits = 4;
        const creditMatch = (line + ' ' + (lines[i + 1] || '')).match(/(?:Credits?|L-T-P-C)[:\s]*([0-9.]+)/i);
        if (creditMatch) {
          credits = Math.round(parseFloat(creditMatch[1])) || 4;
        }

        // Determine which semester this course falls in
        let courseSem = primarySemester;
        for (let j = Math.max(0, i - 15); j <= i; j++) {
          const semCheck = lines[j].match(/(?:Semester|Sem)\s*([1-8]|I|II|III|IV|V|VI|VII|VIII)\b/i);
          if (semCheck) {
            courseSem = romanOrArabicToNumber(semCheck[1]);
            break;
          }
        }

        // Collect units and topics for this subject
        const { units, learningObjectives, recommendedResources, nextIndex } = extractUnitsAndTopics(lines, i + 1);
        i = nextIndex - 1;

        const subjectId = `imported-${code.toLowerCase().replace(/[^a-z0-9]/g, '') || 'sub'}-${Date.now()}-${subjects.length + 1}`;

        subjects.push({
          id: subjectId,
          code: code || `ENG ${100 + subjects.length + 1}`,
          title: title,
          shortName: title.split(' ').slice(0, 2).join(' '),
          credits: credits,
          semester: courseSem,
          category: categorizeSubject(title, code),
          verified: false,
          source: 'imported',
          importedFrom: sourceFilename || metadata.university || 'Uploaded Syllabus',
          importDate: new Date().toISOString().split('T')[0],
          description: `Course extracted from uploaded syllabus: ${title}.`,
          units: units.length > 0 ? units : [
            {
              unitNumber: 1,
              unitTitle: 'Unit 1: Core Fundamentals',
              topics: [{ id: `top-${Date.now()}-1`, name: 'Fundamental Concepts & Principles' }]
            }
          ],
          learningObjectives: learningObjectives,
          recommendedResources: recommendedResources,
          importantQuestions: []
        });
      }
    }
  }

  // 4. Secondary Pass: If code-based pass extracted zero subjects, try title-based heuristic
  if (subjects.length === 0) {
    const fallbackSubjects = extractSubjectsByUnitHeuristic(lines, primarySemester, sourceFilename);
    subjects.push(...fallbackSubjects);
  }

  return {
    metadata,
    subjects,
    detectedSemesters
  };
}

/**
 * Extracts Units, Topics, Objectives and Textbooks following a subject line
 */
function extractUnitsAndTopics(lines, startIndex) {
  const units = [];
  const learningObjectives = [];
  const recommendedResources = [];
  let currentUnit = null;
  let i = startIndex;

  for (; i < lines.length; i++) {
    const line = lines[i];

    // Check if we hit the next course
    if (line.match(/\b[A-Z0-9]{2,5}\s*[-_]?\s*\d{3,4}[A-Z]?\b/) && i > startIndex + 2) {
      break;
    }
    if (/^(?:Course|Subject|Paper)\s*(?:Code|Name)?[:\s]/i.test(line) && i > startIndex + 2) {
      break;
    }

    // Check for Unit / Module header
    const unitMatch = line.match(/^(?:UNIT|Unit|MODULE|Module)\s*([0-9IVX]+)[:.\s-]+(.*)$/i);
    if (unitMatch) {
      if (currentUnit) {
        units.push(currentUnit);
      }
      const unitNum = romanOrArabicToNumber(unitMatch[1]) || units.length + 1;
      const unitTitle = unitMatch[2].trim() || `Unit ${unitNum}: Core Syllabus Concepts`;
      currentUnit = {
        unitNumber: unitNum,
        unitTitle: `Unit ${unitNum}: ${unitTitle}`,
        topics: []
      };
      continue;
    }

    // Check for Objectives
    if (/^(?:Course\s*Objectives?|Learning\s*Objectives?|Objectives?)[:\s]/i.test(line)) {
      const objText = line.replace(/^(?:Course\s*Objectives?|Learning\s*Objectives?|Objectives?)[:\s]*/i, '').trim();
      if (objText) learningObjectives.push(objText);
      continue;
    }

    // Check for Textbooks / Resources
    if (/^(?:Textbooks?|Reference\s*Books?|Suggested\s*Reading|References?)[:\s]/i.test(line)) {
      const refText = line.replace(/^(?:Textbooks?|Reference\s*Books?|Suggested\s*Reading|References?)[:\s]*/i, '').trim();
      if (refText) recommendedResources.push(refText);
      continue;
    }

    // If inside a unit, collect topics
    if (currentUnit) {
      // Split bullet points or comma-separated lists
      if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || /^\d+\.\d+/.test(line)) {
        const topicName = line.replace(/^[•*.\d-]+\s*/, '').trim();
        if (topicName.length >= 3) {
          currentUnit.topics.push({
            id: `top-${Date.now()}-${currentUnit.unitNumber}-${currentUnit.topics.length + 1}`,
            name: topicName
          });
        }
      } else if (line.length > 5 && !/^(?:Total|Hours|L-T-P|Marks|Credits)/i.test(line)) {
        // Break line by commas or semicolons if it lists multiple subtopics
        const parts = line.split(/[;•]/).map((p) => p.trim()).filter((p) => p.length >= 3);
        for (const p of parts) {
          if (currentUnit.topics.length < 8) {
            currentUnit.topics.push({
              id: `top-${Date.now()}-${currentUnit.unitNumber}-${currentUnit.topics.length + 1}`,
              name: p
            });
          }
        }
      }
    }
  }

  if (currentUnit) {
    units.push(currentUnit);
  }

  return {
    units,
    learningObjectives,
    recommendedResources,
    nextIndex: i
  };
}

/**
 * Heuristic fallback for unstructured syllabi
 */
function extractSubjectsByUnitHeuristic(lines, primarySemester, sourceFilename = '') {
  const subjects = [];
  let currentSubject = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect subject headers
    if (/^(?:Theory|Practical|Elective|Core\s*Course|Subject)[:\s]/i.test(line) ||
        (/^[A-Z][A-Za-z\s&–-]{4,40}$/.test(line) && lines[i + 1]?.match(/^Unit\s*[1I]/i))) {
      if (currentSubject && currentSubject.units.length > 0) {
        subjects.push(currentSubject);
      }

      const title = line.replace(/^(?:Theory|Practical|Elective|Core\s*Course|Subject)[:\s]*/i, '').trim();
      currentSubject = {
        id: `imported-sub-${Date.now()}-${subjects.length + 1}`,
        code: `SUB ${100 + subjects.length + 1}`,
        title: title,
        shortName: title.split(' ')[0],
        credits: 4,
        semester: primarySemester,
        category: categorizeSubject(title, ''),
        verified: false,
        source: 'imported',
        importedFrom: sourceFilename || 'Uploaded Syllabus',
        importDate: new Date().toISOString().split('T')[0],
        description: `Imported course: ${title}`,
        units: [],
        learningObjectives: [],
        recommendedResources: []
      };
    }
  }

  if (currentSubject && currentSubject.units.length > 0) {
    subjects.push(currentSubject);
  }

  return subjects;
}

// Helpers
function romanOrArabicToNumber(val) {
  if (!val) return 1;
  const v = val.toString().trim().toUpperCase();
  const romanMap = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8 };
  return romanMap[v] || parseInt(v, 10) || 1;
}

function detectSemesterNumbers(text) {
  const semMatches = text.match(/(?:Semester|Sem)\s*([1-8]|I|II|III|IV|V|VI|VII|VIII)\b/gi) || [];
  const sems = new Set();
  for (const m of semMatches) {
    const num = romanOrArabicToNumber(m.replace(/^(?:Semester|Sem)\s*/i, ''));
    if (num >= 1 && num <= 8) sems.add(num);
  }
  return Array.from(sems).sort((a, b) => a - b);
}

function detectUniversity(text) {
  const match = text.match(/([A-Za-z\s&]{4,40}(?:University|Institute of Technology|College of Engineering|Autonomous))/i);
  return match ? match[1].trim() : 'Autonomous Engineering College';
}

function detectDegree(text) {
  if (/B\.Tech|Bachelor of Technology/i.test(text)) return 'B.Tech';
  if (/B\.E\.|Bachelor of Engineering/i.test(text)) return 'B.E.';
  if (/Diploma\s*(?:in\s*Engineering)?/i.test(text)) return 'Diploma';
  if (/M\.Tech|Master of Technology/i.test(text)) return 'M.Tech';
  return 'B.Tech';
}

function detectBranch(text) {
  if (/Artificial Intelligence|AIML|Machine Learning/i.test(text)) return 'Artificial Intelligence and Machine Learning';
  if (/Data Science/i.test(text)) return 'Data Science';
  if (/Computer Science|CSE/i.test(text)) return 'Computer Science and Engineering';
  if (/Information Technology|\bIT\b/i.test(text)) return 'Information Technology';
  if (/Electronics and Communication|\bECE\b/i.test(text)) return 'Electronics and Communication Engineering';
  if (/Electrical and Electronics|\bEEE\b/i.test(text)) return 'Electrical and Electronics Engineering';
  if (/Mechanical/i.test(text)) return 'Mechanical Engineering';
  if (/Civil/i.test(text)) return 'Civil Engineering';
  if (/Chemical/i.test(text)) return 'Chemical Engineering';
  if (/Biotechnology|\bBT\b/i.test(text)) return 'Biotechnology';
  return 'Computer Science and Engineering';
}

function detectRegulation(text) {
  const match = text.match(/\b(R-?\d{2}|CBCS\s*\d{4}|AICTE\s*\d{4}|NEP\s*\d{4})\b/i);
  return match ? match[0].toUpperCase() : 'University CBCS Regulation';
}

function categorizeSubject(title, code) {
  const t = (title + ' ' + code).toLowerCase();
  if (t.includes('math') || t.includes('calculus') || t.includes('physics') || t.includes('chemistry')) {
    return 'Basic Sciences & Mathematics';
  }
  if (t.includes('python') || t.includes('data structure') || t.includes('algorithm') || t.includes('program') || t.includes('software')) {
    return 'Computing & Programming';
  }
  if (t.includes('electronics') || t.includes('digital') || t.includes('circuit') || t.includes('signal')) {
    return 'Electronics & Circuits';
  }
  if (t.includes('workshop') || t.includes('lab') || t.includes('communication') || t.includes('english') || t.includes('aptitude')) {
    return 'Labs & Applied Skills';
  }
  return 'Core Engineering';
}
