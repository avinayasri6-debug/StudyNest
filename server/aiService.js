/**
 * StudyNest AI Study Assistant Backend Service
 * Handles server-side API communication with Google Gemini and OpenAI.
 * Keeps API keys completely private on the server side and never exposes them to client code.
 * Provides rich pedagogical fallback responses in Demo Mode when keys are not configured.
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

// Load .env safely from project root if available
export function loadEnvironment(rootDir = process.cwd()) {
  const envPath = path.resolve(rootDir, '.env');
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split(/\r?\n/).forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"](.*)['"]$/, '$1');
          if (val) {
            process.env[key] = val;
          }
        }
      });
    } catch (err) {
      console.warn('[StudyNest AI] Fallback .env parse error:', err.message);
    }
  }
}

// Ensure environment is loaded on import
loadEnvironment();

export function getAiConfig() {
  loadEnvironment();
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
  const openaiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY || '';
  const requestedProvider = (process.env.AI_PROVIDER || '').toLowerCase();

  let provider = 'none';
  if (requestedProvider === 'gemini' && geminiKey) {
    provider = 'gemini';
  } else if (requestedProvider === 'openai' && openaiKey) {
    provider = 'openai';
  } else if (geminiKey) {
    provider = 'gemini';
  } else if (openaiKey) {
    provider = 'openai';
  }

  const geminiModel = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
  const openaiModel = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const openaiBaseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

  return {
    configured: provider !== 'none',
    provider,
    model: provider === 'gemini' ? geminiModel : provider === 'openai' ? openaiModel : 'offline-pedagogy-v1',
    hasGeminiKey: Boolean(geminiKey),
    hasOpenAiKey: Boolean(openaiKey),
    geminiKey,
    openaiKey,
    geminiModel,
    openaiModel,
    openaiBaseUrl
  };
}

export function getPublicAiStatus() {
  const config = getAiConfig();
  return {
    configured: config.configured,
    provider: config.provider,
    model: config.model,
    hasGeminiKey: config.hasGeminiKey,
    hasOpenAiKey: config.hasOpenAiKey
  };
}

/**
 * Builds a comprehensive engineering pedagogical system prompt.
 */
export function buildSystemPrompt({ subject, mode = 'intermediate', quickAction = null }) {
  const subjectName = subject?.title || 'First Year Engineering';
  const subjectCode = subject?.code || 'ENG';

  let modeInstruction = '';
  if (mode === 'beginner') {
    modeInstruction = `
EXPLANATION LEVEL: BEGINNER (Foundational & Intuitive)
- Explain as if teaching an enthusiastic student encountering this topic for the very first time.
- Use clear everyday analogies, intuitive mental models, and step-by-step guidance.
- Avoid introducing dense mathematical or academic jargon without defining it in simple terms first.
- Emphasize the "WHY" and physical meaning before formulas.
`;
  } else if (mode === 'advanced') {
    modeInstruction = `
EXPLANATION LEVEL: ADVANCED (Deep Technical & Analytical Rigor)
- Provide deep technical analysis, mathematical proofs, edge cases, and computational/hardware ramifications.
- For programming: discuss time/space algorithmic complexity (Big-O), memory layout, call stack behavior, and optimization techniques.
- For mathematics/physics: provide formal theorems, boundary conditions, and matrix properties.
- For electronics: discuss propagation delays, logic hazard conditions, fan-out, and CMOS considerations.
`;
  } else {
    modeInstruction = `
EXPLANATION LEVEL: INTERMEDIATE (Standard Engineering Undergraduate Rigor)
- Balance intuition with clear mathematical formulations and technical precision.
- Include structured formulas, clear steps, and practical engineering examples.
- Standard university undergraduate depth appropriate for semester examinations.
`;
  }

  let quickActionInstruction = '';
  if (quickAction === 'concept') {
    quickActionInstruction = `
QUICK ACTION FOCUS: EXPLAIN A CONCEPT
1. Core Intuition & One-Sentence Definition.
2. Step-by-Step Breakdown of the mechanism or principle.
3. Key Mathematical Formula or Diagrammatic description.
4. Real-World Engineering Application.
5. Common Pitfall or Misconception to watch out for.
`;
  } else if (quickAction === 'numerical') {
    quickActionInstruction = `
QUICK ACTION FOCUS: SOLVE A NUMERICAL PROBLEM
1. Given Data & Units identified explicitly.
2. Target Variable to find.
3. Governing Formula(s) or Theorems needed.
4. Step-by-Step Algebraic Substitution and Simplification.
5. Final Result with standard SI units clearly boxed or bolded.
6. Verification / Reasonableness check.
`;
  } else if (quickAction === 'questions') {
    quickActionInstruction = `
QUICK ACTION FOCUS: PRACTICE QUESTIONS
Generate 3 progressive exam-style practice questions:
- Question 1: Fundamental Conceptual / Direct Formula (Easy)
- Question 2: Multi-step Application Problem (Medium)
- Question 3: Analytical / Edge-case Question (Challenging)
Provide complete, step-by-step solutions with explanations for each question.
`;
  } else if (quickAction === 'summary') {
    quickActionInstruction = `
QUICK ACTION FOCUS: TOPIC REVISION SUMMARY
- High-level concept summary in 3-4 bullet points.
- Essential Formulas & Constants Table.
- Key Theorems / Rules to remember.
- Quick Examination Tips & High-yield focus areas.
`;
  } else if (quickAction === 'realworld') {
    quickActionInstruction = `
QUICK ACTION FOCUS: REAL-WORLD ENGINEERING EXAMPLES
Provide 3 concrete, modern industry applications of this concept (e.g. in Aerospace, Artificial Intelligence, Semiconductor Fabrication, Electric Vehicles, Cloud Architecture, or Robotics).
`;
  } else if (quickAction === 'python') {
    quickActionInstruction = `
QUICK ACTION FOCUS: PYTHON CODE BREAKDOWN & LAB HELP
- Clean, PEP-8 compliant Python snippet in a \`\`\`python code block.
- Line-by-line explanation of logic and flow.
- Expected standard output.
- Time and Space Complexity.
- Common runtime or logical errors students make with this pattern.
- Note that the student can click the "Run in Python Practice Lab" button in StudyNest to test this code immediately.
`;
  }

  return `
You are the StudyNest AI Engineering Study Assistant — an intelligent, patient, and pedagogically sound academic tutor designed specifically for first-year engineering students in Computer Science, AI & Machine Learning.

CURRENT ACADEMIC CONTEXT:
- Subject: ${subjectName} (${subjectCode})
${modeInstruction}
${quickActionInstruction}

PEDAGOGICAL TEACHING PRINCIPLES & RESPONSE CALIBRATION:
You must understand the student's question type and calibrate your answer structure, tone, and length accordingly:

1. BASIC CONCEPT / DEFINITION QUESTIONS (e.g., "What is...", "Define...", "What are Newton's Rings?"):
   - ALWAYS start directly with an easy-to-understand 1-2 sentence definition in simple English suitable for a first-year engineering student.
   - Do NOT automatically dump lengthy textbook chapters or unnecessary filler. Keep total length concise (~150-250 words).
   - Follow this concise 4-part structure:
     ### 1. Simple Definition
     (A direct, crystal-clear 1-2 sentence definition.)
     ### 2. How It Works
     (A brief, intuitive explanation of the core physical or computational mechanism.)
     ### 3. Relevant Example / Application
     (Where this concept is used in modern engineering or daily life.)
     ### 4. Important Point to Remember
     (Key takeaway, examination insight, or critical trap to avoid.)

2. DETAILED EXPLANATION QUESTIONS (e.g., "Explain the formation of...", "How does X work?", "Derive..."):
   - Provide moderate structured depth without overwhelming the student.
   - Break the explanation into logical, sequential steps (Step 1, Step 2, Step 3, etc.).
   - Explain difficult concepts (e.g. division of amplitude, optical path difference, phase inversion at denser boundaries) using clear mental models.

3. FORMULA & EQUATION QUESTIONS (e.g., "Give the formula for...", "Equation of..."):
   - State the primary governing formula prominently using LaTeX formatting enclosed in $$ ... $$ or $ ... $.
   - MANDATORY: Immediately provide a complete symbol breakdown explaining EVERY single variable, constant, and its standard SI unit (e.g. meters [m], seconds [s], radians [rad], etc.).
   - State the physical conditions of validity (e.g. normal incidence, reflected light, medium refractive index).

4. DIAGRAMS & SVG REQUESTS (e.g., "Draw an SVG diagram...", "Show diagram of...", "Draw schematic..."):
   - When a student asks for a diagram or SVG, you MUST output a complete, valid, self-contained SVG element.
   - Output the <svg ...>...</svg> directly without unnecessary Markdown code fences unless explicitly requested for raw code.
   - Use clean, concise SVG markup without bloated comments or redundant decorative elements so the diagram finishes completely within token limits.
   - MANDATORY REQUIREMENTS:
     * Standard root attributes: \`viewBox="0 0 650 360" xmlns="http://www.w3.org/2000/svg" width="100%" height="auto"\`.
     * Explicitly close EVERY tag, especially the root \`</svg>\`, container groups \`</g>\`, \`<defs>\`, and \`<marker>\`. Self-closing tags MUST end with \`/>\`.
     * Use high-contrast modern engineering styling with readable sans-serif labels (\`font-size="11px"\` to \`"13px"\`).
     * Accurately render and clearly label key components with pointers/arrows:
       - Newton's Rings: Plano-convex lens (flat top, curved bottom), flat glass plate, wedge-shaped air film (thickness t), point of contact O (t=0), incident ray, reflected interfering rays, and inset circular interference ring pattern with alternate dark and bright rings and a central dark spot.
       - Simple Pendulum: Rigid hatched support, suspension point S, vertical dashed equilibrium reference, displaced string of length L at angle θ, bob of mass m, tension vector T, gravity mg, restoring tangential component mg sin θ, radial component mg cos θ, and arc of oscillation.
       - Convex Lens Ray Diagram: Horizontal principal axis, biconvex lens with optical center O, focal points F1, 2F1 on left and F2, 2F2 on right, upright object arrow AB beyond 2F1, parallel ray refracting through F2, optical center ray passing undeflected through O, and real inverted diminished image arrow A'B'.
   - Immediately follow the SVG with a concise bulleted legend explaining the key physical components.

5. NUMERICAL PROBLEMS:
   - 1. Given Data with standard SI units.
   - 2. Target Variable to calculate.
   - 3. Governing Formula.
   - 4. Step-by-step algebraic substitution and simplification.
   - 5. Final Answer with correct SI units clearly bolded or boxed.

6. MATHEMATICAL FORMATTING & NOTATION:
   - Enclose display equations in $$ ... $$ on their own lines.
   - Enclose inline variables and symbols in single dollars (e.g. $D_n$, $\\lambda$, $R$).
   - Never output raw unescaped LaTeX backslashes without dollar delimiters.

7. TONE & EMPATHY:
   - Patient, encouraging, academically authoritative, and supportive of first-year engineering students.
`.trim();
}

/**
 * Shared deadline constants ensuring full compatibility with Vercel's 60-second limit
 */
const OVERALL_REQUEST_DEADLINE_MS = 57000; // 57 seconds total shared request budget
const PRIMARY_ATTEMPT_MAX_TIMEOUT_MS = 15000; // 15 seconds maximum for primary Gemini attempt

/**
 * Validate SVG completeness and syntactic well-formedness
 * Checks for opening <svg and closing </svg> tags, attribute quote parity, and container tag balance.
 */
export function validateSvgCompleteness(content) {
  if (!content || typeof content !== 'string') {
    return { hasSvg: false, isComplete: true };
  }

  const svgOpenIdx = content.search(/<svg[\s>]/i);
  if (svgOpenIdx === -1) {
    return { hasSvg: false, isComplete: true };
  }

  const svgCloseIdx = content.toLowerCase().lastIndexOf('</svg>');
  if (svgCloseIdx === -1) {
    return {
      hasSvg: true,
      isComplete: false,
      reason: 'Missing closing </svg> tag (SVG diagram was cut off during generation).'
    };
  }

  // Extract from the first <svg to the end of the last </svg>
  const svgSlice = content.slice(svgOpenIdx, svgCloseIdx + 6);

  // Strip XML comments before checking quote parity and tags to avoid comment noise
  const decommented = svgSlice.replace(/<!--[\s\S]*?-->/g, '');

  // Check double quote parity across attributes
  const doubleQuotes = (decommented.match(/"/g) || []).length;
  if (doubleQuotes % 2 !== 0) {
    return {
      hasSvg: true,
      isComplete: false,
      reason: 'Unmatched attribute quotes (dangling quote) detected inside SVG markup.'
    };
  }

  // Tag stack / balance check for SVG container elements
  const containerTags = new Set(['svg', 'g', 'defs', 'marker', 'lineargradient', 'radialgradient', 'pattern', 'mask']);
  const tagCounts = {};
  for (const tag of containerTags) {
    tagCounts[tag] = { open: 0, close: 0 };
  }

  const tagRegex = /<(\/)?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g;
  let match;
  while ((match = tagRegex.exec(decommented)) !== null) {
    const isClosing = Boolean(match[1]);
    const tagName = match[2].toLowerCase();
    const attrs = match[3] || '';
    const isSelfClosing = attrs.trim().endsWith('/');

    if (containerTags.has(tagName)) {
      if (isClosing) {
        tagCounts[tagName].close++;
      } else if (!isSelfClosing) {
        tagCounts[tagName].open++;
      }
    }
  }

  for (const tag of containerTags) {
    const { open, close } = tagCounts[tag];
    if (open !== close) {
      return {
        hasSvg: true,
        isComplete: false,
        reason: `Mismatched container tags: <${tag}> opened ${open} time(s) but closed ${close} time(s).`
      };
    }
  }

  return {
    hasSvg: true,
    isComplete: true,
    svgBlock: svgSlice
  };
}

/**
 * Call Google Gemini API with shared overall deadline and resilient fallback
 */
async function callGemini({
  messages,
  systemInstruction,
  apiKey,
  model,
  isFallback = false,
  overallDeadline
}) {
  const primaryModel = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
  const targetModel = model || primaryModel;
  const fallbackModel = 'gemini-3.6-flash';

  // 1. Establish or pass through the shared overall request deadline (57 seconds absolute timestamp)
  const deadline = overallDeadline || (Date.now() + OVERALL_REQUEST_DEADLINE_MS);
  const now = Date.now();
  const remainingBudgetMs = deadline - now;

  // If remaining time is critically low (< 1.5s), fail gracefully with a friendly timeout error
  if (remainingBudgetMs <= 1500) {
    throw new Error(`AI request reached the ${OVERALL_REQUEST_DEADLINE_MS / 1000}s overall execution deadline. Please try asking a more concise or specific question.`);
  }

  // 2. Compute individual timeout for this specific attempt:
  // - Primary attempt: limited to 15 seconds maximum, or remaining budget if less
  // - Fallback attempt: gets the full remaining budget up to the shared overall deadline
  const attemptTimeoutMs = isFallback
    ? remainingBudgetMs
    : Math.min(PRIMARY_ATTEMPT_MAX_TIMEOUT_MS, remainingBudgetMs);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(targetModel)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  // Convert messages to Gemini format (roles: 'user' | 'model')
  const contents = [];
  for (const m of messages) {
    const role = m.role === 'assistant' ? 'model' : 'user';
    contents.push({
      role,
      parts: [{ text: m.content }]
    });
  }

  // Ensure first message is user
  if (contents.length > 0 && contents[0].role !== 'user') {
    contents.unshift({ role: 'user', parts: [{ text: 'Hello, please assist me with my engineering studies.' }] });
  }

  const payload = {
    contents,
    systemInstruction: {
      parts: [{ text: systemInstruction }]
    },
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192
    }
  };

  const attemptStartTime = Date.now();
  // Fresh AbortController for each API attempt
  const controller = new AbortController();
  let timedOut = false;

  // Individual timer for this attempt
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, attemptTimeoutMs);

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
  } catch (fetchErr) {
    const elapsedMs = Date.now() - attemptStartTime;
    const isAbort = timedOut || controller.signal.aborted || fetchErr.name === 'AbortError';

    if (isAbort) {
      // Primary attempt timed out at 15s (or remaining budget) -> trigger fallback with remaining time up to overall deadline
      if (!isFallback && targetModel !== fallbackModel) {
        const remainingForFallback = deadline - Date.now();
        if (remainingForFallback > 2000) {
          console.warn(`[StudyNest AI] Primary model ${targetModel} timed out after ${elapsedMs}ms (primary limit: 15s). Triggering fallback to ${fallbackModel} with remaining ${(remainingForFallback / 1000).toFixed(1)}s (shared deadline: 57s total)...`);
          return callGemini({
            messages,
            systemInstruction,
            apiKey,
            model: fallbackModel,
            isFallback: true,
            overallDeadline: deadline
          });
        }
      }

      console.error(`[StudyNest AI] Model ${targetModel} timed out after ${elapsedMs}ms (attempt limit: ${attemptTimeoutMs}ms, shared deadline: 57s).`);
      throw new Error(`AI request timed out after ${(elapsedMs / 1000).toFixed(1)}s while generating the response. Please try asking a more concise question or breaking it into parts.`);
    }

    // Network level error (e.g., DNS, connection reset)
    console.error(`[StudyNest AI] Model ${targetModel} network error after ${elapsedMs}ms:`, fetchErr.message);
    if (!isFallback && targetModel !== fallbackModel) {
      const remainingForFallback = deadline - Date.now();
      if (remainingForFallback > 2000) {
        console.warn(`[StudyNest AI] Retrying network failure once with fallback model ${fallbackModel} (remaining: ${(remainingForFallback / 1000).toFixed(1)}s)...`);
        return callGemini({
          messages,
          systemInstruction,
          apiKey,
          model: fallbackModel,
          isFallback: true,
          overallDeadline: deadline
        });
      }
    }
    throw fetchErr;
  } finally {
    // Always clear individual timer
    clearTimeout(timeoutId);
  }

  const elapsedMs = Date.now() - attemptStartTime;

  if (!response.ok) {
    let errorDetail = '';
    try {
      const errJson = await response.json();
      errorDetail = errJson.error?.message || JSON.stringify(errJson);
    } catch {
      errorDetail = await response.text();
    }

    // If primary model returns 404, 503, or 429, fail over once to stable gemini-3.6-flash using remaining time
    if ((response.status === 404 || response.status === 503 || response.status === 429) && !isFallback && targetModel !== fallbackModel) {
      const remainingForFallback = deadline - Date.now();
      if (remainingForFallback > 2000) {
        console.warn(`[StudyNest AI] Primary model ${targetModel} returned HTTP ${response.status} after ${elapsedMs}ms (${errorDetail.slice(0, 100)}). Retrying once with fallback model ${fallbackModel} with remaining ${(remainingForFallback / 1000).toFixed(1)}s (deadline: 57s total)...`);
        await new Promise((resolve) => setTimeout(resolve, Math.min(800, remainingForFallback - 1500)));
        return callGemini({
          messages,
          systemInstruction,
          apiKey,
          model: fallbackModel,
          isFallback: true,
          overallDeadline: deadline
        });
      }
    }

    console.error(`[StudyNest AI] Model ${targetModel} failed with HTTP ${response.status} after ${elapsedMs}ms: ${errorDetail.slice(0, 150)}`);

    if (response.status === 400 && errorDetail.toLowerCase().includes('api key')) {
      throw new Error(`Google Gemini API Key invalid or expired. Please verify your GEMINI_API_KEY in .env.`);
    } else if (response.status === 429) {
      throw new Error(`Gemini rate limit / quota exceeded. Please wait a minute or check your quota at https://aistudio.google.com/.`);
    } else if (response.status === 503) {
      throw new Error(`Google Gemini service is temporarily unavailable or overloaded (HTTP 503). Please try again shortly.`);
    } else {
      throw new Error(`Google Gemini API error (HTTP ${response.status}): ${errorDetail}`);
    }
  }

  const data = await response.json();
  const candidate = data.candidates?.[0];
  const text = candidate?.content?.parts?.map((p) => p.text).join('') || '';

  console.log(`[StudyNest AI] Model ${targetModel} responded successfully in ${elapsedMs}ms (${text.length} chars). Total request budget remaining: ${((deadline - Date.now()) / 1000).toFixed(1)}s.`);

  if (!text) {
    if (candidate?.finishReason === 'SAFETY') {
      throw new Error('Gemini response was filtered by academic safety thresholds. Please rephrase your query.');
    }
    throw new Error('Gemini API returned an empty response. Please try rephrasing your question.');
  }

  return {
    content: text,
    provider: 'gemini',
    model: targetModel,
    finishReason: candidate?.finishReason || 'STOP'
  };
}

/**
 * Call OpenAI / OpenAI-compatible API
 */
async function callOpenAi({ messages, systemInstruction, apiKey, baseUrl, model, timeoutMs = 45000 }) {
  const url = `${baseUrl.replace(/\/+$/, '')}/chat/completions`;

  const formattedMessages = [
    { role: 'system', content: systemInstruction },
    ...messages.map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content
    }))
  ];

  const payload = {
    model,
    messages: formattedMessages,
    temperature: 0.7,
    max_tokens: 3000
  };

  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
  } catch (fetchErr) {
    const elapsedMs = Date.now() - startTime;
    if (controller.signal.aborted || fetchErr.name === 'AbortError') {
      console.error(`[StudyNest AI] OpenAI model ${model} timed out after ${elapsedMs}ms.`);
      throw new Error(`OpenAI request timed out after ${(elapsedMs / 1000).toFixed(1)}s while generating response.`);
    }
    throw fetchErr;
  } finally {
    clearTimeout(timeoutId);
  }

  const elapsedMs = Date.now() - startTime;

  if (!response.ok) {
    let errorDetail = '';
    try {
      const errJson = await response.json();
      errorDetail = errJson.error?.message || JSON.stringify(errJson);
    } catch {
      errorDetail = await response.text();
    }

    console.error(`[StudyNest AI] OpenAI model ${model} failed with HTTP ${response.status} after ${elapsedMs}ms: ${errorDetail.slice(0, 150)}`);

    if (response.status === 401) {
      throw new Error(`OpenAI API Key invalid or unauthorized. Please verify your OPENAI_API_KEY in .env.`);
    } else if (response.status === 429) {
      throw new Error(`OpenAI quota or rate limit exceeded. Check your plan at platform.openai.com.`);
    } else {
      throw new Error(`OpenAI API error (HTTP ${response.status}): ${errorDetail}`);
    }
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '';

  console.log(`[StudyNest AI] OpenAI model ${model} responded successfully in ${elapsedMs}ms.`);

  if (!text) {
    throw new Error('OpenAI API returned an empty response.');
  }

  return {
    content: text,
    provider: 'openai',
    model,
    finishReason: data.choices?.[0]?.finish_reason || 'stop'
  };
}

/**
 * Intelligent Pedagogical Offline Synthesis (Demo Mode)
 * Used when no live API key is configured.
 * Delivers dynamic, tailored, high-quality engineering responses clearly marked as demo.
 */
export function generatePedagogicalDemoResponse({ message, subject, mode = 'intermediate', quickAction = null }) {
  const q = (message || '').toLowerCase();
  const subId = subject?.id || 'math101';
  const subTitle = subject?.title || 'Linear Algebra and Calculus';

  const modeBadge = mode.toUpperCase();
  const actionNote = quickAction ? ` (Focus: ${quickAction})` : '';

  let banner = `> **[STUDYNEST DEMO MODE • ${modeBadge}${actionNote}]**\n> *An API key is not yet configured. This comprehensive explanation was synthesized by StudyNest's built-in engineering curriculum engine.*\n> *To activate live Gemini or OpenAI models, create a \`.env\` file with \`GEMINI_API_KEY=your_key\` and restart the server.*\n\n`;

  // Specific content generator based on subject & prompt
  let responseBody = '';

  // 1. Python Subject
  if (subId === 'cs103' || q.includes('python') || q.includes('code') || q.includes('loop') || q.includes('recursion') || q.includes('function') || q.includes('list') || q.includes('dictionary')) {
    responseBody = `### Problem Solving & Programming in Python: Detailed Breakdown

Let's explore how to structure this cleanly in Python, following engineering best practices.

#### 1. Intuition & Architectural Concept
In Python, writing clean and modular code requires understanding data structures, variable scope, and algorithmic efficiency.

Here is an illustrative, robust Python solution demonstrating the principle:

\`\`\`python
# StudyNest Engineering Python Lab Snippet
# Concept: Modular processing with error handling and time complexity awareness

def process_engineering_data(values, threshold=50):
    """
    Processes sensor/metric values, filters above threshold,
    and calculates statistical metrics.
    
    Time Complexity: O(n) where n is len(values)
    Space Complexity: O(n) for filtered output
    """
    if not values:
        return {"count": 0, "average": 0.0, "max": None}
    
    # List comprehension for concise, Pythonic filtering
    filtered = [v for v in values if v >= threshold]
    
    summary = {
        "total_readings": len(values),
        "qualifying_count": len(filtered),
        "average": sum(filtered) / len(filtered) if filtered else 0.0,
        "max_value": max(filtered) if filtered else None
    }
    return summary

# Test execution with sample dataset
if __name__ == '__main__':
    sensor_stream = [24.5, 52.1, 78.4, 49.0, 91.2, 63.8, 38.0]
    result = process_engineering_data(sensor_stream, threshold=50)
    
    print("--- Engineering Data Analysis ---")
    for key, val in result.items():
        print(f"  {key.replace('_', ' ').capitalize()}: {val}")
\`\`\`

#### 2. Line-by-Line Explanation
1. \`def process_engineering_data(values, threshold=50):\`: Defines a function with default parameter \`threshold=50\`.
2. \`[v for v in values if v >= threshold]\`: Pythonic list comprehension; iterates once in $O(n)$ without manual index management.
3. \`sum(filtered) / len(filtered)\`: Computes arithmetic mean with guard check for empty arrays to prevent \`ZeroDivisionError\`.
4. \`__name__ == '__main__':\`: Best practice script guard, allowing this file to be imported as a module without running test code.

#### 3. Complexity & Debugging Insights
- **Time Complexity:** $O(n)$ where $n$ is the number of measurements.
- **Space Complexity:** $O(k)$ where $k \\le n$ is the number of qualified items.
- **Common Trap:** Mutating a list while iterating over it with a \`for\` loop causes skipped elements. Always use list comprehensions or create a new list.

*Tip: Click the **"Run in Python Practice Lab"** button above this code block to execute it immediately in Pyodide!*`;
  }
  // 2. Linear Algebra and Calculus
  else if (subId === 'math101' || q.includes('matrix') || q.includes('eigen') || q.includes('calculus') || q.includes('integral') || q.includes('rank') || q.includes('gauss')) {
    responseBody = `### Linear Algebra & Calculus: Analytical Guide

#### 1. Fundamental Definition & Conceptual Intuition
Let $A$ be an $n \\times n$ matrix representing a linear transformation. An **eigenvector** $v \\ne 0$ is a vector whose direction is invariant under the transformation, meaning it is only stretched or squished by a scalar factor $\\lambda$ called the **eigenvalue**:

$$A v = \\lambda v \\iff (A - \\lambda I)v = 0$$

For non-trivial solutions ($v \\ne 0$), the determinant of the characteristic matrix must vanish:
$$\\det(A - \\lambda I) = 0$$

#### 2. Step-by-Step Procedure to Solve
1. **Find Characteristic Equation:** Compute the determinant $|A - \\lambda I| = 0$. For a $2 \\times 2$ matrix, this simplifies to $\\lambda^2 - \\text{Tr}(A)\\lambda + \\det(A) = 0$.
2. **Determine Eigenvalues:** Factor the polynomial to find the roots $\\lambda_1, \\lambda_2, \\dots$.
3. **Determine Eigenvectors:** For each eigenvalue $\\lambda_i$, solve the homogeneous system $(A - \\lambda_i I)v = 0$ using Gaussian row-reduction to find the basis of the null space.
4. **Diagonalization Check:** If an $n \\times n$ matrix has $n$ linearly independent eigenvectors, it can be decomposed as $A = P D P^{-1}$, where $D$ is the diagonal matrix of eigenvalues and $P$ is the modal matrix.

#### 3. Worked Engineering Example
Given the symmetric stress matrix:
$$A = \\begin{pmatrix} 4 & 1 \\\\ 1 & 4 \\end{pmatrix}$$

- **Trace:** $\\text{Tr}(A) = 4 + 4 = 8$
- **Determinant:** $\\det(A) = (4)(4) - (1)(1) = 15$
- **Characteristic Equation:** $\\lambda^2 - 8\\lambda + 15 = 0 \\implies (\\lambda - 5)(\\lambda - 3) = 0$
- **Eigenvalues:** $\\lambda_1 = 5, \\lambda_2 = 3$

For $\\lambda = 5$:
$$(A - 5I)v = \\begin{pmatrix} -1 & 1 \\\\ 1 & -1 \\end{pmatrix}\\begin{pmatrix} x_1 \\\\ x_2 \\end{pmatrix} = \\begin{pmatrix} 0 \\\\ 0 \\end{pmatrix} \\implies -x_1 + x_2 = 0 \\implies v_1 = \\begin{pmatrix} 1 \\\\ 1 \\end{pmatrix}$$

#### 4. Real-World Applications
- **Principal Component Analysis (PCA):** Reducing dimensional complexity of sensor datasets in Machine Learning.
- **Structural Dynamics:** Natural resonant frequencies in bridge and aircraft wing vibrations.`;
  }
  // 3. Engineering Physics & Specialized Optical / Mechanics Pedagogical Engine
  else if (
    subId === 'phy102' ||
    q.includes('newton') ||
    q.includes('ring') ||
    q.includes('physics') ||
    q.includes('pendulum') ||
    q.includes('lens') ||
    q.includes('laser') ||
    q.includes('quantum') ||
    q.includes('optic') ||
    q.includes('schrodinger') ||
    q.includes('semiconductor')
  ) {
    // 3A. Newton's Rings SVG Diagram Request
    if (
      (q.includes('newton') || q.includes('ring')) &&
      (q.includes('svg') || q.includes('diagram') || q.includes('draw') || q.includes('schematic') || q.includes('experiment'))
    ) {
      responseBody = `### Newton's Rings Experiment: Schematic Diagram

Here is the complete engineering schematic diagram of the Newton's Rings optical interference experiment, illustrating the plano-convex lens, flat glass plate, wedge-shaped air film, light ray paths, and the concentric circular interference pattern.

\`\`\`svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 650 360" width="100%" height="auto">
  <defs>
    <linearGradient id="lensGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#1d4ed8" stop-opacity="0.45"/>
    </linearGradient>
    <linearGradient id="plateGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#64748b" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#475569" stop-opacity="0.35"/>
    </linearGradient>
    <marker id="arrowRed" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="#ef4444"/>
    </marker>
    <marker id="arrowGreen" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="#10b981"/>
    </marker>
  </defs>

  <!-- Background Canvas -->
  <rect x="0" y="0" width="650" height="360" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>

  <!-- Left: Experimental Cross-Section Setup -->
  <g transform="translate(20, 20)">
    <text x="170" y="24" font-family="sans-serif" font-size="14" font-weight="700" fill="#0f172a" text-anchor="middle">
      Cross-Sectional Experimental Setup
    </text>

    <!-- Incident Light Beam -->
    <path d="M 120,40 L 120,95" stroke="#ef4444" stroke-width="2.5" marker-end="url(#arrowRed)"/>
    <text x="125" y="65" font-family="sans-serif" font-size="11" font-weight="600" fill="#dc2626">Incident Monochromatic Ray (λ)</text>

    <!-- Reflected Rays -->
    <path d="M 120,135 L 90,45" stroke="#10b981" stroke-width="2" stroke-dasharray="4,3" marker-end="url(#arrowGreen)"/>
    <path d="M 120,150 L 145,45" stroke="#10b981" stroke-width="2" stroke-dasharray="4,3" marker-end="url(#arrowGreen)"/>
    <text x="60" y="42" font-family="sans-serif" font-size="10.5" font-weight="600" fill="#059669">Ray 1 (Bottom of Lens)</text>
    <text x="155" y="42" font-family="sans-serif" font-size="10.5" font-weight="600" fill="#059669">Ray 2 (Top of Plate)</text>

    <!-- Plano-Convex Lens (Flat Top, Curved Bottom) -->
    <path d="M 30,95 L 310,95 Q 170,225 30,95 Z" fill="url(#lensGrad)" stroke="#2563eb" stroke-width="2"/>
    <text x="170" y="112" font-family="sans-serif" font-size="12" font-weight="600" fill="#1e3a8a" text-anchor="middle">
      Plano-Convex Lens (Radius R)
    </text>

    <!-- Wedge-Shaped Air Film Annotation -->
    <path d="M 60,145 L 85,175" stroke="#d97706" stroke-width="1.5"/>
    <text x="90" y="185" font-family="sans-serif" font-size="11" font-weight="600" fill="#b45309">
      Wedge-Shaped Air Film (Thickness t)
    </text>

    <!-- Flat Glass Plate -->
    <rect x="20" y="160" width="300" height="28" rx="2" fill="url(#plateGrad)" stroke="#475569" stroke-width="2"/>
    <text x="170" y="179" font-family="sans-serif" font-size="12" font-weight="600" fill="#334155" text-anchor="middle">
      Optically Flat Glass Plate
    </text>

    <!-- Contact Point O -->
    <circle cx="170" cy="160" r="4" fill="#dc2626"/>
    <path d="M 170,165 L 170,215" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="3,3"/>
    <text x="170" y="230" font-family="sans-serif" font-size="11.5" font-weight="700" fill="#dc2626" text-anchor="middle">
      Point of Contact O (t = 0)
    </text>

    <!-- Path Difference Formula Note -->
    <rect x="25" y="250" width="290" height="52" rx="6" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1"/>
    <text x="170" y="271" font-family="sans-serif" font-size="11.5" font-weight="600" fill="#1e40af" text-anchor="middle">
      Path Difference: Δ = 2t + λ/2
    </text>
    <text x="170" y="289" font-family="sans-serif" font-size="11" fill="#475569" text-anchor="middle">
      (Phase shift of π occurs at air-to-glass reflection)
    </text>
  </g>

  <!-- Divider Line -->
  <line x1="360" y1="20" x2="360" y2="340" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="6,4"/>

  <!-- Right: Microscopic View (Circular Rings Pattern) -->
  <g transform="translate(380, 20)">
    <text x="125" y="24" font-family="sans-serif" font-size="14" font-weight="700" fill="#0f172a" text-anchor="middle">
      Microscope View: Fringe Pattern
    </text>

    <!-- Rings Center: (125, 160) -->
    <circle cx="125" cy="160" r="110" fill="#0f172a" stroke="#334155" stroke-width="2"/>
    <circle cx="125" cy="160" r="95" fill="none" stroke="#f8fafc" stroke-width="6"/>
    <circle cx="125" cy="160" r="76" fill="none" stroke="#f8fafc" stroke-width="7"/>
    <circle cx="125" cy="160" r="54" fill="none" stroke="#f8fafc" stroke-width="8"/>
    <circle cx="125" cy="160" r="28" fill="none" stroke="#f8fafc" stroke-width="9"/>
    <!-- Central Dark Spot -->
    <circle cx="125" cy="160" r="12" fill="#020617"/>

    <!-- Annotations on Rings -->
    <line x1="125" y1="160" x2="195" y2="105" stroke="#e2e8f0" stroke-width="1.5"/>
    <circle cx="125" cy="160" r="2.5" fill="#ef4444"/>
    <text x="198" y="102" font-family="sans-serif" font-size="11" font-weight="700" fill="#f8fafc">
      Central Dark Spot
    </text>

    <line x1="125" y1="160" x2="225" y2="160" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="2,2"/>
    <text x="175" y="152" font-family="sans-serif" font-size="11" font-weight="600" fill="#38bdf8" text-anchor="middle">
      Dn ∝ √n
    </text>

    <!-- Rings Description Box -->
    <rect x="10" y="285" width="230" height="42" rx="5" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1"/>
    <text x="125" y="303" font-family="sans-serif" font-size="11" font-weight="600" fill="#334155" text-anchor="middle">
      Concentric Circular Interference Rings
    </text>
    <text x="125" y="318" font-family="sans-serif" font-size="10" fill="#64748b" text-anchor="middle">
      (Rings crowd closer together as n increases)
    </text>
  </g>
</svg>
\`\`\`

#### Key Components Shown in the Diagram:
1. **Plano-Convex Lens:** A lens with one flat face and one curved face of large radius of curvature $R$.
2. **Optically Flat Glass Plate:** Supports the lens from below.
3. **Wedge-Shaped Air Film:** The thickness $t$ increases symmetrically outward from the center.
4. **Point of Contact $O$:** Where $t = 0$, giving a central dark fringe.
5. **Two Interfering Beams:** Ray 1 (reflected from bottom of lens) and Ray 2 (reflected from top of plate) produce division of amplitude.`;
    }
    // 3B. Simple Pendulum SVG Diagram Request
    else if (
      (q.includes('pendulum') || (q.includes('simple') && q.includes('bob'))) &&
      (q.includes('svg') || q.includes('diagram') || q.includes('draw') || q.includes('schematic') || q.includes('show') || q.includes('oscillation'))
    ) {
      responseBody = `### Simple Pendulum: Oscillation & Restoring Force Schematic

Here is the complete engineering schematic diagram of a simple pendulum, illustrating the rigid ceiling support, suspended thread of length $L$, bob of mass $m$, angular displacement $\\theta$, weight resolution ($mg\\sin\\theta$ and $mg\\cos\\theta$), and string tension $T$.

\`\`\`svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 650 360" width="100%" height="auto">
  <defs>
    <linearGradient id="bobGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#1d4ed8"/>
    </linearGradient>
    <linearGradient id="supportGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#64748b"/>
      <stop offset="100%" stop-color="#334155"/>
    </linearGradient>
    <marker id="arrowHead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="#ef4444"/>
    </marker>
    <marker id="arrowBlue" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="#2563eb"/>
    </marker>
    <marker id="arrowEmerald" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="#10b981"/>
    </marker>
  </defs>

  <rect x="0" y="0" width="650" height="360" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>

  <g transform="translate(15, 15)">
    <text x="180" y="22" font-family="sans-serif" font-size="14" font-weight="700" fill="#0f172a" text-anchor="middle">
      Simple Pendulum: Oscillation &amp; Restoring Force
    </text>

    <rect x="70" y="32" width="220" height="12" rx="2" fill="url(#supportGrad)" stroke="#1e293b" stroke-width="1.5"/>
    <line x1="80" y1="32" x2="90" y2="24" stroke="#64748b" stroke-width="1.5"/>
    <line x1="110" y1="32" x2="120" y2="24" stroke="#64748b" stroke-width="1.5"/>
    <line x1="140" y1="32" x2="150" y2="24" stroke="#64748b" stroke-width="1.5"/>
    <line x1="170" y1="32" x2="180" y2="24" stroke="#64748b" stroke-width="1.5"/>
    <line x1="200" y1="32" x2="210" y2="24" stroke="#64748b" stroke-width="1.5"/>
    <line x1="230" y1="32" x2="240" y2="24" stroke="#64748b" stroke-width="1.5"/>
    <line x1="260" y1="32" x2="270" y2="24" stroke="#64748b" stroke-width="1.5"/>
    <text x="180" y="20" font-family="sans-serif" font-size="10" font-weight="600" fill="#64748b" text-anchor="middle">Rigid Support</text>

    <circle cx="180" cy="44" r="4.5" fill="#0f172a"/>
    <text x="165" y="52" font-family="sans-serif" font-size="11" font-weight="700" fill="#0f172a">S</text>

    <line x1="180" y1="44" x2="180" y2="230" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4,4"/>
    <circle cx="180" cy="230" r="16" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3,3"/>
    <text x="180" y="260" font-family="sans-serif" font-size="11" font-weight="600" fill="#64748b" text-anchor="middle">Mean Position (x = 0)</text>

    <line x1="180" y1="44" x2="270" y2="205" stroke="#1e293b" stroke-width="2.5"/>
    <text x="215" y="115" font-family="sans-serif" font-size="12" font-weight="700" fill="#1e293b">L</text>

    <path d="M 180,95 A 50 50 0 0 1 202,90" fill="none" stroke="#2563eb" stroke-width="1.5"/>
    <text x="195" y="80" font-family="sans-serif" font-size="12" font-weight="700" fill="#2563eb">θ</text>

    <circle cx="270" cy="205" r="16" fill="url(#bobGrad)" stroke="#1d4ed8" stroke-width="2"/>
    <text x="270" y="210" font-family="sans-serif" font-size="11" font-weight="700" fill="#ffffff" text-anchor="middle">m</text>

    <line x1="270" y1="205" x2="225" y2="125" stroke="#2563eb" stroke-width="2.5" marker-end="url(#arrowBlue)"/>
    <text x="215" y="145" font-family="sans-serif" font-size="12" font-weight="700" fill="#2563eb">T</text>

    <line x1="270" y1="205" x2="270" y2="295" stroke="#ef4444" stroke-width="2.5" marker-end="url(#arrowHead)"/>
    <text x="278" y="290" font-family="sans-serif" font-size="12" font-weight="700" fill="#ef4444">mg</text>

    <line x1="270" y1="205" x2="315" y2="285" stroke="#64748b" stroke-width="1.5" stroke-dasharray="3,3" marker-end="url(#arrowHead)"/>
    <text x="320" y="280" font-family="sans-serif" font-size="11" font-weight="600" fill="#64748b">mg cos θ</text>

    <line x1="270" y1="205" x2="205" y2="241" stroke="#10b981" stroke-width="2.5" marker-end="url(#arrowEmerald)"/>
    <text x="175" y="222" font-family="sans-serif" font-size="11" font-weight="700" fill="#059669">F = -mg sin θ</text>

    <path d="M 160,233 Q 180,235 270,205" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="3,3"/>
    <text x="225" y="248" font-family="sans-serif" font-size="10.5" font-weight="600" fill="#d97706" text-anchor="middle">Displacement x</text>
  </g>

  <line x1="380" y1="20" x2="380" y2="340" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="6,4"/>

  <g transform="translate(400, 25)">
    <text x="115" y="20" font-family="sans-serif" font-size="14" font-weight="700" fill="#0f172a" text-anchor="middle">
      Physics Summary &amp; Formulas
    </text>

    <rect x="0" y="40" width="230" height="70" rx="6" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1.5"/>
    <text x="115" y="65" font-family="sans-serif" font-size="13" font-weight="700" fill="#1e40af" text-anchor="middle">
      T = 2π √(L / g)
    </text>
    <text x="115" y="85" font-family="sans-serif" font-size="10.5" fill="#3b82f6" text-anchor="middle">
      Time Period of Oscillation
    </text>
    <text x="115" y="100" font-family="sans-serif" font-size="9.5" fill="#64748b" text-anchor="middle">
      (Independent of bob mass m)
    </text>

    <rect x="0" y="125" width="230" height="65" rx="6" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="1.5"/>
    <text x="115" y="150" font-family="sans-serif" font-size="12" font-weight="700" fill="#15803d" text-anchor="middle">
      F_restoring = - (mg / L) · x
    </text>
    <text x="115" y="170" font-family="sans-serif" font-size="10" fill="#16a34a" text-anchor="middle">
      For small angular displacement (sin θ ≈ θ)
    </text>

    <rect x="0" y="205" width="230" height="115" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
    <text x="15" y="228" font-family="sans-serif" font-size="11" font-weight="700" fill="#0f172a">Key Exam Insights:</text>
    <text x="15" y="250" font-family="sans-serif" font-size="10.5" fill="#334155">• Motion is SHM for small θ (&lt; 10°)</text>
    <text x="15" y="270" font-family="sans-serif" font-size="10.5" fill="#334155">• Restoring force provided by mg sin θ</text>
    <text x="15" y="290" font-family="sans-serif" font-size="10.5" fill="#334155">• Frequency f = (1 / 2π) √(g / L)</text>
    <text x="15" y="310" font-family="sans-serif" font-size="10.5" fill="#334155">• Tension maximum at mean position</text>
  </g>
</svg>
\`\`\`

#### Key Components Shown in the Diagram:
1. **Rigid Support ($S$):** Firm pivot from which the inextensible thread of length $L$ hangs.
2. **Mean Position ($x = 0$):** Vertical equilibrium position where gravity balances tension.
3. **Displaced Position ($\theta$):** Angular deviation $\theta$ from the vertical.
4. **Forces Acting on Bob:**
   - **Tension ($T$):** Acts along the suspension string towards pivot $S$.
   - **Weight ($mg$):** Acts vertically downward.
   - **Restoring Component ($F = -mg\\sin\\theta$):** Tangential force directed towards the mean position.
   - **Radial Component ($mg\\cos\\theta$):** Balances tension at turning points.`;
    }
    // 3C. Convex Lens Ray Diagram Request
    else if (
      (q.includes('convex') || q.includes('lens')) &&
      (q.includes('svg') || q.includes('diagram') || q.includes('draw') || q.includes('ray') || q.includes('schematic') || q.includes('image'))
    ) {
      responseBody = `### Convex Lens: Ray Optics Schematic (Object Beyond 2F₁)

Here is the complete ray optics schematic diagram for a convex lens with an object placed beyond $2F_1$, illustrating the principal axis, optical center $O$, principal foci $F_1, F_2, 2F_1, 2F_2$, principal rays, and the formation of a real, inverted, diminished image $A'B'$.

\`\`\`svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 650 360" width="100%" height="auto">
  <defs>
    <linearGradient id="lensGlass" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.3"/>
      <stop offset="50%" stop-color="#0284c7" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.3"/>
    </linearGradient>
    <marker id="rayArrowRed" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="#dc2626"/>
    </marker>
    <marker id="rayArrowBlue" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="#2563eb"/>
    </marker>
    <marker id="objArrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="#15803d"/>
    </marker>
    <marker id="imgArrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="#b91c1c"/>
    </marker>
  </defs>

  <rect x="0" y="0" width="650" height="360" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>

  <text x="325" y="28" font-family="sans-serif" font-size="14" font-weight="700" fill="#0f172a" text-anchor="middle">
    Convex Lens: Ray Diagram (Object Beyond 2F₁)
  </text>

  <line x1="20" y1="180" x2="630" y2="180" stroke="#475569" stroke-width="1.8"/>
  <text x="620" y="172" font-family="sans-serif" font-size="10.5" font-weight="600" fill="#64748b">Principal Axis</text>

  <path d="M 325,45 C 348,95 348,265 325,315 C 302,265 302,95 325,45 Z" fill="url(#lensGlass)" stroke="#0284c7" stroke-width="2"/>
  <line x1="325" y1="35" x2="325" y2="325" stroke="#0284c7" stroke-width="1" stroke-dasharray="4,3"/>

  <circle cx="325" cy="180" r="3.5" fill="#0f172a"/>
  <text x="320" y="198" font-family="sans-serif" font-size="12" font-weight="700" fill="#0f172a">O</text>

  <line x1="225" y1="175" x2="225" y2="185" stroke="#0f172a" stroke-width="2"/>
  <circle cx="225" cy="180" r="2.5" fill="#0f172a"/>
  <text x="225" y="200" font-family="sans-serif" font-size="11" font-weight="700" fill="#0f172a" text-anchor="middle">F₁</text>

  <line x1="125" y1="175" x2="125" y2="185" stroke="#0f172a" stroke-width="2"/>
  <circle cx="125" cy="180" r="2.5" fill="#0f172a"/>
  <text x="125" y="200" font-family="sans-serif" font-size="11" font-weight="700" fill="#0f172a" text-anchor="middle">2F₁</text>

  <line x1="425" y1="175" x2="425" y2="185" stroke="#0f172a" stroke-width="2"/>
  <circle cx="425" cy="180" r="2.5" fill="#0f172a"/>
  <text x="425" y="200" font-family="sans-serif" font-size="11" font-weight="700" fill="#0f172a" text-anchor="middle">F₂</text>

  <line x1="525" y1="175" x2="525" y2="185" stroke="#0f172a" stroke-width="2"/>
  <circle cx="525" cy="180" r="2.5" fill="#0f172a"/>
  <text x="525" y="200" font-family="sans-serif" font-size="11" font-weight="700" fill="#0f172a" text-anchor="middle">2F₂</text>

  <line x1="75" y1="180" x2="75" y2="108" stroke="#15803d" stroke-width="3" marker-end="url(#objArrow)"/>
  <text x="75" y="98" font-family="sans-serif" font-size="12" font-weight="700" fill="#15803d" text-anchor="middle">A</text>
  <text x="75" y="196" font-family="sans-serif" font-size="12" font-weight="700" fill="#15803d" text-anchor="middle">B</text>
  <text x="50" y="145" font-family="sans-serif" font-size="11" font-weight="600" fill="#15803d">Object</text>

  <line x1="75" y1="105" x2="210" y2="105" stroke="#dc2626" stroke-width="2" marker-end="url(#rayArrowRed)"/>
  <line x1="205" y1="105" x2="325" y2="105" stroke="#dc2626" stroke-width="2"/>
  <line x1="325" y1="105" x2="435" y2="188" stroke="#dc2626" stroke-width="2" marker-end="url(#rayArrowRed)"/>
  <line x1="430" y1="184" x2="520" y2="251" stroke="#dc2626" stroke-width="2"/>

  <line x1="75" y1="105" x2="220" y2="148" stroke="#2563eb" stroke-width="2" marker-end="url(#rayArrowBlue)"/>
  <line x1="215" y1="147" x2="325" y2="180" stroke="#2563eb" stroke-width="2"/>
  <line x1="325" y1="180" x2="445" y2="216" stroke="#2563eb" stroke-width="2" marker-end="url(#rayArrowBlue)"/>
  <line x1="440" y1="214" x2="520" y2="238" stroke="#2563eb" stroke-width="2"/>

  <line x1="475" y1="180" x2="475" y2="222" stroke="#b91c1c" stroke-width="3" marker-end="url(#imgArrow)"/>
  <text x="475" y="172" font-family="sans-serif" font-size="12" font-weight="700" fill="#b91c1c" text-anchor="middle">B'</text>
  <text x="475" y="240" font-family="sans-serif" font-size="12" font-weight="700" fill="#b91c1c" text-anchor="middle">A'</text>
  <text x="495" y="210" font-family="sans-serif" font-size="10.5" font-weight="600" fill="#b91c1c">Image (Real, Inverted)</text>

  <rect x="25" y="285" width="600" height="60" rx="6" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1.2"/>
  <text x="45" y="308" font-family="sans-serif" font-size="12" font-weight="700" fill="#1e40af">Lens Formula: 1/f = 1/v - 1/u</text>
  <text x="45" y="330" font-family="sans-serif" font-size="11" fill="#1e3a8a">Linear Magnification: m = v / u = h_i / h_o (where |m| &lt; 1 gives diminished image)</text>
  <text x="410" y="308" font-family="sans-serif" font-size="11" font-weight="600" fill="#0369a1">• Position: Between F₂ and 2F₂</text>
  <text x="410" y="330" font-family="sans-serif" font-size="11" font-weight="600" fill="#0369a1">• Nature: Real, Inverted &amp; Diminished</text>
</svg>
\`\`\`

#### Key Components Shown in the Diagram:
1. **Principal Axis:** Horizontal line passing through the optical center $O$ and focal points.
2. **Optical Center ($O$):** Central point where incident rays pass undeflected without angular deviation.
3. **Object ($AB$):** Upright object situated beyond $2F_1$.
4. **Ray 1 (Red):** Travelled parallel to principal axis, refracting through principal focus $F_2$.
5. **Ray 2 (Blue):** Travelled through optical center $O$, emerging straight without bending.
6. **Image ($A'B'$):** Formed at the intersection between $F_2$ and $2F_2$. The image is **real, inverted, and diminished**.`;
    }
    // 3D. Simple Pendulum Concept & Formula
    else if (q.includes('pendulum')) {
      responseBody = `### 1. Simple Definition
A simple pendulum consists of a point mass (called the **bob**) suspended from a rigid support by a light, inextensible, and flexible string of length $L$, which oscillates freely under the influence of gravity.

### 2. How It Works
When the bob is pulled aside by a small angle $\\theta$ and released, gravity ($mg$) pulls it back toward the central equilibrium position. The tangential component of gravity ($F = -mg\\sin\\theta$) acts as the **restoring force**. For small angles ($\\theta < 10^\\circ$), $\\sin\\theta \\approx \\theta = \\frac{x}{L}$, making the restoring force directly proportional to displacement ($F \\propto -x$). This satisfies the condition for **Simple Harmonic Motion (SHM)**.

### 3. Governing Formula & Variable Breakdown
The time period $T$ of a simple pendulum is given by:

$$T = 2\\pi \\sqrt{\\frac{L}{g}}$$

- $T$ = Time period for one complete oscillation, measured in **seconds** ($\\text{s}$).
- $L$ = Effective length of pendulum from suspension point to center of gravity of bob, in **meters** ($\\text{m}$).
- $g$ = Acceleration due to gravity ($9.81 \\text{ m/s}^2$).

### 4. Important Point to Remember
The time period $T$ is **completely independent of the mass $m$** of the bob and independent of amplitude for small angles (isochronism). A pendulum with a heavier bob will swing with the exact same period as a lighter bob of identical length!`;
    }
    // 3E. Convex Lens Concept & Formula
    else if (q.includes('convex') || (q.includes('lens') && !q.includes('newton') && !q.includes('ring'))) {
      responseBody = `### 1. Simple Definition
A convex lens (or converging lens) is a transparent optical element that is thicker at the center than at its edges, causing parallel incident light rays to refract inward and converge at a single focal point $F$.

### 2. How It Works
When light enters the curved glass surface, it refracts toward the normal upon entering the denser medium, and refracts away from the normal upon exiting into air. Because of the curvature, rays striking the top and bottom of the lens bend inward toward the central principal axis, intersecting at the principal focus.

### 3. Governing Lens Formula & Sign Convention
The relationship between focal length $f$, object distance $u$, and image distance $v$ is given by the Gaussian Lens Formula:

$$\\frac{1}{f} = \\frac{1}{v} - \\frac{1}{u}$$

- $f$ = Focal length of the lens, in **meters** ($\\text{m}$) (Always **positive** for convex lenses).
- $u$ = Distance of object from optical center $O$, in **meters** ($\\text{m}$) (Always **negative** under Cartesian convention).
- $v$ = Distance of image from optical center $O$, in **meters** ($\\text{m}$) (Positive for real images formed on the opposite side).
- $m = \\frac{v}{u} = \\frac{h_i}{h_o}$ = Linear magnification.

### 4. Important Point to Remember
When an object is placed **beyond $F$**, a convex lens always forms a **real and inverted** image. However, when an object is placed closer than the focal point (between $F$ and optical center $O$), it acts as a simple magnifying glass, forming a **virtual, erect, and magnified** image on the same side as the object.`;
    }
    // 3B. Newton's Rings Dark Rings Formula Request
    else if (
      (q.includes('newton') || q.includes('ring')) &&
      (q.includes('formula') || q.includes('diameter') || q.includes('dark'))
    ) {
      responseBody = `### Formula for the Diameter of Dark Newton's Rings

In the reflected light system, the diameter of the $n$-th dark ring is given by:

$$D_n^2 = 4n\\lambda R \\implies D_n = \\sqrt{4n\\lambda R}$$

#### Complete Variable & SI Unit Breakdown:
- $D_n$ = Diameter of the $n$-th dark ring, measured in **meters** ($\\text{m}$).
- $n$ = Ring order / integer number ($n = 0, 1, 2, 3, \\dots$).
  * For $n = 0$, $D_0 = 0$, which corresponds to the central dark spot at the point of contact.
- $\\lambda$ = Wavelength of the incident monochromatic light source, measured in **meters** ($\\text{m}$).
- $R$ = Radius of curvature of the spherical surface of the plano-convex lens, measured in **meters** ($\\text{m}$).
- $\\mu$ = Refractive index of the medium enclosed between the lens and the glass plate. For an air film, $\\mu = 1$. If a transparent liquid of refractive index $\\mu$ is placed between the lens and the plate, the diameter is modified to:
  $$D_n = \\sqrt{\\frac{4n\\lambda R}{\\mu}}$$

#### Key Observations & Examination Takeaways:
1. **Square Root Proportionality:** $D_n \\propto \\sqrt{n}$. The diameters of dark rings are directly proportional to the square roots of natural numbers ($1, \\sqrt{2}, \\sqrt{3}, \\dots$). Consequently, the distance between successive rings decreases as $n$ increases (rings get closer together outward).
2. **Wavelength Determination:** In the laboratory, the zero-point of contact may be scratched or distorted. To eliminate zero-order measurement error, the wavelength $\\lambda$ is determined by measuring the diameters of two rings of orders $n+m$ and $n$:
  $$\\lambda = \\frac{D_{n+m}^2 - D_n^2}{4mR}$$`;
    }
    // 3C. Newton's Rings Formation Explanation
    else if (
      (q.includes('newton') || q.includes('ring')) &&
      (q.includes('explain') || q.includes('formation') || q.includes('how'))
    ) {
      responseBody = `### Formation of Newton's Rings: Step-by-Step Explanation

Newton's Rings are circular interference fringes produced by the principle of **division of amplitude** in a thin wedge-shaped air film.

#### Step 1: Experimental Setup & Film Geometry
A plano-convex lens with a large radius of curvature $R$ is placed with its curved surface resting on an optically flat glass plate. This encloses a thin, wedge-shaped air film of varying thickness $t$.
- At the central point of contact $O$, the film thickness is $t = 0$.
- Moving radially outward, the thickness $t$ increases symmetrically in all directions.

#### Step 2: Division of Amplitude (Two Interfering Rays)
When monochromatic light of wavelength $\\lambda$ falls normally on the arrangement:
- **Ray 1:** Part of the light reflects at the lower curved surface of the glass lens (glass-to-air boundary).
- **Ray 2:** The transmitted portion travels through the air film of thickness $t$ and reflects from the top surface of the flat glass plate (air-to-glass boundary).
Both reflected rays travel back upward along virtually identical paths and interfere.

#### Step 3: Optical Path Difference & Stokes' Phase Inversion
The geometric extra distance traversed by Ray 2 is $2\\mu t \\cos r$. For normal incidence ($\\cos r = 1$) in air ($\\mu = 1$), this path difference is $2t$.
Crucially, Ray 2 reflects from the flat glass plate (an optically denser medium). By **Stokes' Law of Reflection**, reflection at a denser boundary introduces an abrupt phase shift of $\\pi$ radians, corresponding to an additional path difference of $\\frac{\\lambda}{2}$.
Thus, the total effective optical path difference is:
$$\\Delta = 2t + \\frac{\\lambda}{2}$$

#### Step 4: Conditions for Fringes in Reflected Light
- **Dark Rings (Destructive Interference):** Occur when $\\Delta = (2n + 1)\\frac{\\lambda}{2} \\implies 2t = n\\lambda$ (where $n = 0, 1, 2, \\dots$).
- **Bright Rings (Constructive Interference):** Occur when $\\Delta = n\\lambda \\implies 2t = (2n - 1)\\frac{\\lambda}{2}$ (where $n = 1, 2, \\dots$).

#### Step 5: Why the Fringes are Circular
Because the lens surface has spherical symmetry, the thickness $t$ of the air film is identical at all points equidistant from the contact point $O$. The loci of constant thickness are concentric circles, producing concentric circular interference rings centered at $O$.`;
    }
    // 3D. Newton's Rings Basic Concept Definition
    else if (q.includes('newton') || q.includes('ring')) {
      responseBody = `### 1. Simple Definition
Newton's Rings are circular interference fringe patterns produced when monochromatic light reflects between a curved plano-convex lens and an optically flat glass plate.

### 2. How It Works
A thin, wedge-shaped air film forms between the curved lens and the flat plate. When light shines down, part of it reflects from the lower surface of the lens and part from the upper surface of the flat glass plate. These two reflected light waves interfere with each other, creating alternate bright and dark concentric circular rings.

### 3. Relevant Example / Application
- **Optical Surface Flatness Testing:** Engineers and optical fabricators use Newton's Rings to test whether precision optical lenses and telescope mirrors are accurately polished to within fractions of a wavelength.
- **Wavelength Determination:** Used in physics and engineering laboratories to measure the exact wavelength $\\lambda$ of monochromatic laser or sodium light sources.

### 4. Important Point to Remember
The central spot in reflected light is always **dark** because light reflecting from the denser glass plate undergoes an automatic phase shift of $\\pi$ radians (an extra optical path difference of $\\frac{\\lambda}{2}$), causing destructive interference at the central point of contact where thickness $t = 0$.`;
    }
    // General Physics Response
    else {
      responseBody = `### Engineering Physics: Core Principles & Physical Meaning

#### 1. Core Physical Principle
In physical engineering systems, quantum mechanics and electromagnetic wave theory dictate how modern semiconductor and optical devices operate.

Consider the **Wave-Particle Duality** and the **Time-Independent Schrödinger Equation**:
$$-\\frac{\\hbar^2}{2m} \\nabla^2 \\psi + V(\\mathbf{r})\\psi = E\\psi$$

Where:
- $\\hbar = \\frac{h}{2\\pi}$ is the reduced Planck constant ($1.054 \\times 10^{-34} \\text{ J}\\cdot\\text{s}$)
- $\\psi(\\mathbf{r})$ is the quantum state wave function
- $V(\\mathbf{r})$ represents the potential energy landscape
- $E$ is the total quantized energy eigenvalue
- $|\\psi(\\mathbf{r})|^2$ gives the probability density of finding the electron at point $\\mathbf{r}$.

#### 2. Practical Application: Semiconductor Bandgap & Lasers
1. **Stimulated Emission in Lasers:** An incoming photon of energy $h\\nu = E_2 - E_1$ stimulates an excited electron to drop to ground state, releasing an identical, coherent, in-phase photon.
2. **Hall Effect:** When a current-carrying conductor is placed in a transverse magnetic field $B$, Lorentz forces deflect charge carriers, producing a measurable transverse Hall voltage:
   $$V_H = \\frac{I B}{n q w}$$
   This directly reveals the charge carrier type ($n$-type vs $p$-type) and carrier concentration $n$.

#### 3. Key Formulas Revision Table
| Physical Quantity | Governing Formula | Engineering Relevance |
| :--- | :--- | :--- |
| De Broglie Wavelength | $\\lambda = \\frac{h}{p} = \\frac{h}{\\sqrt{2mE}}$ | Electron microscopy & quantum tunneling |
| Numerical Aperture | $NA = \\sqrt{n_1^2 - n_2^2}$ | Optical fiber light-gathering capacity |
| Hall Coefficient | $R_H = \\frac{1}{n q}$ | Magnetic sensors and semiconductor characterization |`;
    }
  }
  // 4. Fundamentals of Digital Electronics
  else if (subId === 'ee104' || q.includes('digital') || q.includes('gate') || q.includes('flip') || q.includes('karnaugh') || q.includes('k-map') || q.includes('boolean') || q.includes('mux')) {
    responseBody = `### Fundamentals of Digital Electronics: Systematic Design

#### 1. Logic Simplification & Karnaugh Maps (K-Maps)
Boolean algebra minimization is the foundation of digital VLSI circuit design. The objective is to minimize the number of logic gates and literal inputs to reduce silicon propagation delay and power dissipation.

**De Morgan's Laws:**
1. $\\overline{A \\cdot B} = \\bar{A} + \\bar{B}$ (NAND equivalent to inverted-input OR)
2. $\\overline{A + B} = \\bar{A} \\cdot \\bar{B}$ (NOR equivalent to inverted-input AND)

#### 2. Combinational vs. Sequential Logic
- **Combinational Circuits:** Output depends strictly on current inputs at that instant (e.g., Full Adders, Decoders, Multiplexers). No memory or feedback.
- **Sequential Circuits:** Output depends on current inputs AND previous state (stored via feedback loops). Governed by clock transitions (e.g., D Flip-Flops, T Flip-Flops, Ring Counters).

#### 3. Universal Gates Realization
Both **NAND** and **NOR** gates are universal because any Boolean function (AND, OR, NOT, XOR) can be constructed solely using them:
- **Inverter (NOT) using 2-input NAND:** Tie both inputs together: $Y = \\overline{A \\cdot A} = \\bar{A}$.
- **AND using NAND:** Pass input through NAND, followed by a NAND inverter: $Y = \\overline{\\overline{A \\cdot B}} = A \\cdot B$.
- **OR using NAND:** Invert both inputs with NANDs, then feed into a NAND: $Y = \\overline{\\bar{A} \\cdot \\bar{B}} = \\bar{\\bar{A}} + \\bar{\\bar{B}} = A + B$.

#### 4. Practice Check
*Challenge Question:* Simplify $F(A,B,C) = \\sum m(1, 3, 5, 7)$ using a 3-variable K-Map.
*Answer:* Grouping all four minterms yields the single product term $F = C$, eliminating variables $A$ and $B$ entirely!`;
  }
  // 5. Digital Skill Workshop
  else if (subId === 'ds105' || q.includes('linux') || q.includes('git') || q.includes('bash') || q.includes('terminal') || q.includes('shell')) {
    responseBody = `### Digital Skill Workshop: Modern Developer Workflow

#### 1. Git & Version Control Best Practices
Git tracks snapshots of files across branches. Understanding atomic commits and branching workflows is essential for engineering teamwork:

\`\`\`bash
# 1. Inspect repository state
git status

# 2. Stage modified files atomically
git add src/components/AIAssistantView.jsx

# 3. Commit with semantic convention (feat, fix, docs, refactor)
git commit -m "feat(ai): integrate AI Study Assistant view and storage service"

# 4. Create and checkout a feature branch
git checkout -b feature/ai-tutor

# 5. Push to remote and track upstream
git push -u origin feature/ai-tutor
\`\`\`

#### 2. Essential Linux Terminal Commands
| Command | Description | Example Flag |
| :--- | :--- | :--- |
| \`grep -rnI "pattern" .\` | Search text recursively ignoring binaries | \`-r\` (recursive), \`-n\` (line number) |
| \`chmod 755 script.sh\` | Give owner read/write/exec, others read/exec | \`755\` octal representation |
| \`tail -f /var/log/app.log\` | Monitor appended file stream in real time | \`-f\` (follow) |
| \`ps aux | grep node\` | Find running processes and pipe into filter | \`|\` (pipe output to next stdin) |

#### 3. Study Tip
Always verify branch cleanliness before merging. Use \`git diff\` to inspect changes line-by-line prior to staging.`;
  }
  // 6. Quantitative Aptitude and Reasoning
  else if (subId === 'qa106' || q.includes('aptitude') || q.includes('percent') || q.includes('work') || q.includes('speed') || q.includes('probability') || q.includes('permutation')) {
    responseBody = `### Quantitative Aptitude & Logical Reasoning: Shortcuts & Method

#### 1. High-Yield Concept & Shortcut Formula
In engineering placement aptitude, the **LCM Method for Time & Work** eliminates fraction errors:
- If Person A completes a task in $12$ days and Person B in $18$ days:
  - Total Work Units = $\\text{LCM}(12, 18) = 36$ units.
  - Efficiency of A = $\\frac{36}{12} = 3$ units/day.
  - Efficiency of B = $\\frac{36}{18} = 2$ units/day.
  - Combined Efficiency $(A + B) = 3 + 2 = 5$ units/day.
  - Time taken together = $\\frac{\\text{Total Work}}{\\text{Combined Efficiency}} = \\frac{36}{5} = 7.2$ days.

#### 2. Relative Speed Shortcuts
- **Opposite Directions:** Relative Speed = $S_1 + S_2$.
- **Same Direction:** Relative Speed = $|S_1 - S_2|$.
- Conversion factor: $1 \\text{ km/h} = \\frac{5}{18} \\text{ m/s}$.

#### 3. Practice Problem with Step-by-Step Solution
*Problem:* A train $180\\text{ m}$ long crosses a platform $220\\text{ m}$ long in $20\\text{ seconds}$. What is the train's speed in $\\text{km/h}$?
1. **Total Distance to Cover:** $\\text{Length of Train} + \\text{Length of Platform} = 180 + 220 = 400\\text{ m}$.
2. **Speed in m/s:** $\\frac{\\text{Distance}}{\\text{Time}} = \\frac{400\\text{ m}}{20\\text{ s}} = 20\\text{ m/s}$.
3. **Convert to km/h:** $20 \\times \\frac{18}{5} = 4 \\times 18 = \\mathbf{72\\text{ km/h}}$.`;
  }
  // 7. English for Technical Communication
  else if (subId === 'eng107' || q.includes('english') || q.includes('communication') || q.includes('email') || q.includes('report') || q.includes('abstract') || q.includes('writing')) {
    responseBody = `### English for Technical Communication: Professional Standards

#### 1. Technical Writing: The 7 C's of Communication
1. **Clear:** Purpose and message are unambiguous.
2. **Concise:** Eliminates verbose filler words (e.g. use *"now"* instead of *"at this point in time"*).
3. **Concrete:** Specific metrics and facts rather than vague generalities.
4. **Correct:** Flawless grammatical structure and domain terminology.
5. **Coherent:** Logical sequence connecting every paragraph.
6. **Complete:** All necessary context and action items provided.
7. **Courteous:** Professional, constructive tone.

#### 2. Professional Engineering Email Structure
\`\`\`
Subject: [Project Name] Request for Lab Equipment Calibration - Team Alpha

Dear Professor / Team Lead [Name],

I am writing on behalf of Team Alpha regarding the calibration of the Digital Storage Oscilloscopes for our Semester 1 Digital Electronics Laboratory session scheduled for Thursday, Nov 5th.

Key Objectives:
- Verify frequency response up to 50 MHz
- Ensure zero-calibration offset on Channel 1 and 2 probes

Could you please confirm whether the calibration technician is available during Wednesday afternoon office hours (2:00 PM – 4:00 PM)?

Thank you for your guidance and support.

Sincerely,
[Your Name]
B.Tech CSE (AI & ML) - Semester 1
StudyNest Workspace
\`\`\`

#### 3. Active vs. Passive Voice in Engineering Reports
- **Prefer Active Voice for Directness:** *"The microcontroller executes the interrupt routine within $15\\mu\\text{s}$."* (Instead of: *"The interrupt routine is executed by the microcontroller in $15\\mu\\text{s}$."*)
- **Use Passive Voice when the action/sample is the focus:** *"The specimen was heated to $450^\\circ\\text{C}$ in an argon atmosphere."*`;
  }
  // General Engineering Fallback
  else {
    responseBody = `### ${subTitle}: Step-by-Step Tutorial & Explanation

#### 1. Concept Overview & Core Objectives
To master this topic in **${subTitle}**, break the problem down into its fundamental building blocks:
1. **Core Law/Principle:** Identify the governing scientific theorem, mathematical formulation, or algorithmic paradigm.
2. **Assumptions & Constraints:** Recognize the boundary conditions and operational constraints (e.g., linear range, steady-state, temporal constraints).
3. **Analytical Procedure:** Formulate the step-by-step mathematical or code solution.

#### 2. Structured Engineering Methodology
- **Step 1 (Decomposition):** Break complex problem statements into discrete sub-components.
- **Step 2 (Modeling):** Map the physical or software problem to formal notation (matrix equations, state diagrams, or function signatures).
- **Step 3 (Execution):** Apply systematic reduction, substitution, or iteration to reach the solution.
- **Step 4 (Validation):** Check dimensional homogeneity (units balance) and boundary values ($x \\to 0, x \\to \\infty$).

#### 3. Recommended Next Actions
- Select **"Generate Practice Questions"** from the quick actions above to test your recall on this topic.
- Use **"Smart Notes"** to bookmark this explanation directly into your personal digital notebook.`;
  }

  return banner + responseBody;
}

/**
 * Main chat dispatcher called from API endpoint
 */
export async function processChatRequest({ messages, subject, mode = 'intermediate', quickAction = null }) {
  const config = getAiConfig();

  const latestUserMessage = messages?.slice().reverse().find((m) => m.role === 'user')?.content || '';

  // If no API key configured, use intelligent pedagogical fallback
  if (!config.configured) {
    const demoContent = generatePedagogicalDemoResponse({
      message: latestUserMessage,
      subject,
      mode,
      quickAction
    });

    return {
      ok: true,
      content: demoContent,
      isDemo: true,
      configured: false,
      provider: 'offline-pedagogy',
      model: 'curriculum-engine-v1'
    };
  }

  // API Key is configured -> generate system prompt and call real LLM
  const systemInstruction = buildSystemPrompt({ subject, mode, quickAction });
  const overallDeadline = Date.now() + OVERALL_REQUEST_DEADLINE_MS;

  try {
    if (config.provider === 'gemini') {
      const result = await callGemini({
        messages,
        systemInstruction,
        apiKey: config.geminiKey,
        model: config.geminiModel,
        overallDeadline
      });

      // SVG Completeness Validation & Controlled Single Recovery
      const svgValidation = validateSvgCompleteness(result.content);
      if (svgValidation.hasSvg && (!svgValidation.isComplete || result.finishReason === 'MAX_TOKENS')) {
        console.warn(`[StudyNest AI] Incomplete SVG detected (${svgValidation.reason || 'finishReason=MAX_TOKENS'}). Checking time for controlled recovery...`);
        const timeRemaining = overallDeadline - Date.now();
        if (timeRemaining > 8000) {
          console.log(`[StudyNest AI] Attempting controlled single regeneration for complete SVG (${(timeRemaining / 1000).toFixed(1)}s remaining)...`);
          try {
            const recoveryInstruction = `You are an expert technical SVG graphics generator. Your task is to output ONLY raw, complete, valid, and self-contained SVG markup without markdown code fences, conversational prose, or introductory essays. Start immediately with <svg and end with </svg>. Ensure all tags, paths, and attributes are properly closed and scientifically accurate.`;
            const recoveryPrompt = `Provide ONLY a concise, valid, fully self-contained SVG diagram for: "${latestUserMessage}". Output pure SVG directly with no markdown fences, no explanatory preamble, and no decorative bloat. Start with <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 650 360" width="100%" height="auto"> and ensure you finish with </svg>.`;

            const recoveryResult = await callGemini({
              messages: [{ role: 'user', content: recoveryPrompt }],
              systemInstruction: recoveryInstruction,
              apiKey: config.geminiKey,
              model: config.geminiModel,
              overallDeadline
            });

            const recValidation = validateSvgCompleteness(recoveryResult.content);
            if (recValidation.isComplete) {
              console.log('[StudyNest AI] Controlled recovery succeeded with complete SVG.');
              result.content = recoveryResult.content;
            } else {
              console.warn('[StudyNest AI] Recovery attempt still produced incomplete SVG. Retaining raw code for inspection.');
              result.content = `> **[Diagram Generation Notice]**\n> The AI diagram could not be fully completed within the output token budget (${recValidation.reason || 'cut off'}).\n> You can inspect or copy the raw SVG code below, or ask: *"Generate a concise SVG diagram of ${latestUserMessage.slice(0, 40).replace(/["`]/g, '')} only"*.\n\n\`\`\`xml\n${recoveryResult.content || result.content}\n\`\`\``;
            }
          } catch (recErr) {
            console.warn('[StudyNest AI] Controlled recovery attempt failed:', recErr.message);
            result.content = `> **[Diagram Generation Notice]**\n> The AI diagram could not be fully completed within the output limit (${svgValidation.reason || 'cut off'}).\n> You can inspect or copy the raw SVG code below, or ask: *"Generate a concise SVG diagram of ${latestUserMessage.slice(0, 40).replace(/["`]/g, '')} only"*.\n\n\`\`\`xml\n${result.content}\n\`\`\``;
          }
        } else {
          console.warn('[StudyNest AI] Insufficient time remaining for recovery. Retaining raw code for inspection.');
          result.content = `> **[Diagram Generation Notice]**\n> The AI diagram could not be fully completed within the available time (${svgValidation.reason || 'cut off'}).\n> You can inspect or copy the raw SVG code below, or ask: *"Generate a concise SVG diagram of ${latestUserMessage.slice(0, 40).replace(/["`]/g, '')} only"*.\n\n\`\`\`xml\n${result.content}\n\`\`\``;
        }
      }

      return {
        ok: true,
        content: result.content,
        isDemo: false,
        configured: true,
        provider: 'gemini',
        model: result.model
      };
    } else if (config.provider === 'openai') {
      const result = await callOpenAi({
        messages,
        systemInstruction,
        apiKey: config.openaiKey,
        baseUrl: config.openaiBaseUrl,
        model: config.openaiModel
      });

      const svgValidation = validateSvgCompleteness(result.content);
      if (svgValidation.hasSvg && !svgValidation.isComplete) {
        result.content = `> **[Diagram Generation Notice]**\n> The diagram markup generated by the AI was incomplete (${svgValidation.reason}).\n> You can inspect the raw code below, or ask for a simpler diagram:\n\n\`\`\`xml\n${result.content}\n\`\`\``;
      }

      return {
        ok: true,
        content: result.content,
        isDemo: false,
        configured: true,
        provider: 'openai',
        model: result.model
      };
    } else {
      throw new Error(`Unsupported AI provider: ${config.provider}`);
    }
  } catch (err) {
    console.error('[StudyNest AI Service Error]:', err.message);
    return {
      ok: false,
      error: err.message,
      content: `> **[AI Provider Error]**\n> Live call to ${config.provider} (${config.model}) failed:\n> \`${err.message}\`\n\nPlease check your API key and quota or test connection in .env.`,
      isDemo: false,
      configured: true,
      provider: config.provider,
      model: config.model
    };
  }
}

/**
 * Offline High-Fidelity Structured Notes Synthesizer
 * Generates publication-quality 7-section engineering notes when API key is not configured.
 */
export function generateOfflineStructuredNote({ subject, topic, level = 'intermediate', length = 'standard', focus = 'all' }) {
  const subCode = subject?.code || 'ENG 101';
  const subTitle = subject?.title || 'First Year Engineering';
  const topicName = topic || 'Key Engineering Principles';
  const tLower = topicName.toLowerCase();
  const subId = (subject?.id || '').toLowerCase();
  const focusBadge = focus.toUpperCase();

  const banner = `> **[STUDYNEST DEMO MODE • AI NOTES GENERATOR (${focusBadge})]**\n> *An API key is not configured yet. This structured academic study note was synthesized by StudyNest's curriculum engine.*\n> *To activate real-time Gemini or OpenAI models, create a \`.env\` file with \`GEMINI_API_KEY=your_key\` and restart the server.*\n\n`;

  let sectionIntro = '';
  let sectionDefs = '';
  let sectionTheory = '';
  let sectionExample = '';
  let sectionKeyPoints = '';
  let sectionFormulas = '';
  let sectionSummary = '';

  // 1. Math / Linear Algebra / Calculus
  if (subId.includes('math') || tLower.includes('matrix') || tLower.includes('eigen') || tLower.includes('calculus') || tLower.includes('integral') || tLower.includes('gauss') || tLower.includes('rank') || tLower.includes('lagrange')) {
    sectionIntro = `This topic forms a cornerstone of modern computational engineering, continuous systems modeling, and scientific machine learning. It provides the analytical machinery to map multivariable physical constraints, analyze linear transformations, and decouple coupled differential equations governing dynamical physical structures.

**Target Objectives:**
- Understand matrix transformations and characteristic solution spaces.
- Compute invariants, ranks, and eigenvalues through systematic row operations.
- Apply multivariable extremum principles and coordinate changes to engineering problems.`;

    sectionDefs = `1. **Linear Transformation:** A mapping $T: \\mathbb{R}^n \\to \\mathbb{R}^m$ satisfying $T(u + v) = T(u) + T(v)$ and $T(c u) = c T(u)$ for all vectors $u, v$ and scalars $c$.
2. **Eigenvalue & Eigenvector:** A scalar $\\lambda$ and non-zero vector $v \\ne 0$ satisfying $A v = \\lambda v \\iff (A - \\lambda I)v = 0$.
3. **Characteristic Equation:** The polynomial equation $\\det(A - \\lambda I) = 0$ whose roots yield the system eigenvalues.
4. **Rank of a Matrix:** The maximum number of linearly independent row or column vectors in the matrix, equivalent to the number of non-zero rows in its Row Echelon Form (REF).
5. **Jacobian Determinant:** The determinant of the matrix of first-order partial derivatives representing the local coordinate scaling factor during multivariable substitution.`;

    sectionTheory = `#### Mathematical Derivation & Systematics

##### 1. Characteristic Polynomial and Cayley-Hamilton Theorem
Every square matrix $A \\in \\mathbb{R}^{n \\times n}$ satisfies its own characteristic equation:
$$\\Delta(\\lambda) = \\det(A - \\lambda I) = (-1)^n \\lambda^n + c_{n-1}\\lambda^{n-1} + \\dots + c_1\\lambda + \\det(A) = 0$$

By the **Cayley-Hamilton Theorem**:
$$(-1)^n A^n + c_{n-1} A^{n-1} + \\dots + c_1 A + \\det(A)I = 0$$
This theorem provides an efficient method to compute high matrix powers $A^k$ and matrix inverses $A^{-1}$ without direct cofactor expansion:
$$A^{-1} = -\\frac{1}{\\det(A)} \\left[ (-1)^n A^{n-1} + c_{n-1} A^{n-2} + \\dots + c_1 I \\right]$$

##### 2. Diagonalization Theorem
A matrix $A$ is diagonalizable if and only if it possesses $n$ linearly independent eigenvectors:
$$A = P D P^{-1}$$
Where $D = \\text{diag}(\\lambda_1, \\lambda_2, \\dots, \\lambda_n)$ is the diagonal matrix of eigenvalues, and $P = \\begin{pmatrix} v_1 & v_2 & \\dots & v_n \\end{pmatrix}$ is the invertible modal matrix whose columns are the corresponding eigenvectors.`;

    sectionExample = `#### Worked Engineering Problem: Modal Stress Analysis

**Problem Statement:**
A structural support element has the symmetric stress tensor:
$$A = \\begin{pmatrix} 5 & 2 \\\\ 2 & 2 \\end{pmatrix}$$
Find the principal stress eigenvalues $\\lambda_1, \\lambda_2$ and the normalized principal direction eigenvectors.

**Step 1: Compute Characteristic Equation**
$$\\det(A - \\lambda I) = \\begin{vmatrix} 5 - \\lambda & 2 \\\\ 2 & 2 - \\lambda \\end{vmatrix} = (5 - \\lambda)(2 - \\lambda) - 4 = \\lambda^2 - 7\\lambda + 6 = 0$$

**Step 2: Factor for Eigenvalues**
$$(\\lambda - 6)(\\lambda - 1) = 0 \\implies \\mathbf{\\lambda_1 = 6, \\quad \\lambda_2 = 1}$$

**Step 3: Determine Eigenvectors**
- For $\\lambda_1 = 6$:
$$(A - 6I)v_1 = \\begin{pmatrix} -1 & 2 \\\\ 2 & -4 \\end{pmatrix} \\begin{pmatrix} x_1 \\\\ x_2 \\end{pmatrix} = \\begin{pmatrix} 0 \\\\ 0 \\end{pmatrix} \\implies -x_1 + 2x_2 = 0 \\implies v_1 = \\begin{pmatrix} 2 \\\\ 1 \\end{pmatrix}$$
Normalized: $\\hat{v}_1 = \\frac{1}{\\sqrt{5}} \\begin{pmatrix} 2 \\\\ 1 \\end{pmatrix}$.

- For $\\lambda_2 = 1$:
$$(A - I)v_2 = \\begin{pmatrix} 4 & 2 \\\\ 2 & 1 \\end{pmatrix} \\begin{pmatrix} x_1 \\\\ x_2 \\end{pmatrix} = \\begin{pmatrix} 0 \\\\ 0 \\end{pmatrix} \\implies 2x_1 + x_2 = 0 \\implies v_2 = \\begin{pmatrix} 1 \\\\ -2 \\end{pmatrix}$$
Normalized: $\\hat{v}_2 = \\frac{1}{\\sqrt{5}} \\begin{pmatrix} 1 \\\\ -2 \\end{pmatrix}$.

**Orthogonality Verification:**
$$\\hat{v}_1 \\cdot \\hat{v}_2 = \\frac{1}{5}\\left[(2)(1) + (1)(-2)\\right] = 0 \\quad \\text{(Confirmed orthogonal)}$$`;

    sectionKeyPoints = `- **Trace Invariant:** The sum of eigenvalues equals the trace of matrix $A$: $\\sum \\lambda_i = \\text{Tr}(A)$.
- **Determinant Invariant:** The product of eigenvalues equals the determinant: $\\prod \\lambda_i = \\det(A)$.
- Symmetric real matrices always have strictly real eigenvalues and mutually orthogonal eigenvectors.
- Invertibility condition: $A$ is invertible if and only if $\\lambda = 0$ is NOT an eigenvalue.
- When transforming double integrals to polar coordinates, always include the metric factor: $dx\\,dy = r\\,dr\\,d\\theta$.`;

    sectionFormulas = `| Quantity / Equation | Mathematical Expression | Engineering Application |
| :--- | :--- | :--- |
| Characteristic Equation | $\\det(A - \\lambda I) = 0$ | Finding natural frequencies and stability |
| Cayley-Hamilton Identity | $P(A) = 0$ | Fast computation of $A^k$ and $A^{-1}$ |
| Diagonalization Relation | $A = P D P^{-1} \\implies A^k = P D^k P^{-1}$ | Decoupling systems of differential equations |
| Jacobian Transformation | $J(u, v) = \\frac{\\partial(x, y)}{\\partial(u, v)} = \\begin{vmatrix} x_u & x_v \\\\ y_u & y_v \\end{vmatrix}$ | Area integration across curvilinear grids |
| Lagrange Multiplier | $\\nabla f(x, y) = \\lambda \\nabla g(x, y)$ | Constrained design optimization |`;

    sectionSummary = `1. **High-Yield Exam Focus:** Expect characteristic equations of $3 \\times 3$ matrices with at least one zero root, Cayley-Hamilton inverse calculations, and double integral transformations ($r\\,dr\\,d\\theta$).
2. **Common Trap:** Forgetting to test algebraic multiplicity (AM) vs. geometric multiplicity (GM). A matrix fails to diagonalize if $\\text{GM}(\\lambda) < \\text{AM}(\\lambda)$.
3. **Rapid Verification Checklist:** Always sum your computed eigenvalues to check if they match $\\text{Tr}(A)$, and multiply them to check $\\det(A)$ before solving for eigenvectors!`;
  }
  // 2. Physics / Lasers / Optics / Quantum / Semiconductors
  else if (subId.includes('phy') || tLower.includes('laser') || tLower.includes('quantum') || tLower.includes('fiber') || tLower.includes('schrodinger') || tLower.includes('interference') || tLower.includes('diffraction') || tLower.includes('newton')) {
    sectionIntro = `Engineering Physics establishes the link between micro-scale quantum mechanics, electromagnetic wave interactions, and physical hardware implementations in fiber optics, photonic semiconductors, and laser instrumentation.

**Target Objectives:**
- Analyze coherent wave interference in thin films and cavity structures.
- Evaluate stimulated emission rates, optical resonators, and semiconductor laser criteria.
- Master quantum wave equations and boundary condition quantization in microscopic wells.`;

    sectionDefs = `1. **Coherence:** The property of electromagnetic waves maintaining a constant, fixed phase relationship over space and time.
2. **Stimulated Emission:** Transition of an atomic electron from an upper energy state $E_2$ to a lower state $E_1$ induced by an incident photon of resonant energy $h\\nu = E_2 - E_1$, emitting a twin photon of identical phase, frequency, and polarization.
3. **Population Inversion:** The non-equilibrium thermodynamic condition where the population density of higher energy states exceeds that of lower energy states ($N_2 > N_1$).
4. **Numerical Aperture (NA):** Dimensionless metric quantifying the light-gathering capability and optical acceptance cone of a dielectric waveguide.
5. **Wave Function $\\psi$:** Complex state vector whose modulus squared $|\\psi(\\mathbf{r}, t)|^2$ represents the spatial probability density of locating a subatomic particle.`;

    sectionTheory = `#### Physical Principles & Analytical Framework

##### 1. Wave-Particle Quantization: de Broglie Hypothesis & Schrödinger Equation
Matter possesses dual wave-particle characteristics. A particle of relativistic momentum $p$ has de Broglie wavelength:
$$\\lambda = \\frac{h}{p} = \\frac{h}{\\sqrt{2 m E}}$$

The stationary states of a non-relativistic quantum particle in an external potential $V(x)$ are governed by:
$$-\\frac{\\hbar^2}{2m} \\frac{d^2\\psi(x)}{dx^2} + V(x)\\psi(x) = E\\psi(x)$$

For an infinite potential well of width $L$ ($V(x) = 0$ for $0 \\le x \\le L$, $\\infty$ elsewhere), boundary conditions $\\psi(0) = \\psi(L) = 0$ enforce standing wave spatial quantization:
$$\\psi_n(x) = \\sqrt{\\frac{2}{L}} \\sin\\left(\\frac{n \\pi x}{L}\\right), \\qquad E_n = \\frac{n^2 \\pi^2 \\hbar^2}{2 m L^2} = \\frac{n^2 h^2}{8 m L^2}, \\quad n = 1, 2, 3, \\dots$$

##### 2. Dielectric Optical Fiber Waveguides
Light propagates down optical fibers via Total Internal Reflection (TIR) at the core-cladding boundary ($n_1 > n_2$). The maximum acceptance angle $\\theta_a$ in air ($n_0 = 1$) is:
$$\\sin \\theta_a = \\sqrt{n_1^2 - n_2^2} = NA$$`;

    sectionExample = `#### Worked Problem: Optical Fiber Design

**Problem Statement:**
An optical fiber has a core refractive index $n_1 = 1.50$ and a cladding refractive index $n_2 = 1.45$.
Calculate:
1. The critical angle $\\theta_c$ at the core-cladding interface.
2. The Numerical Aperture ($NA$).
3. The maximum acceptance angle $\\theta_a$ in air.

**Solution Steps:**
1. **Critical Angle:**
   $$\\sin \\theta_c = \\frac{n_2}{n_1} = \\frac{1.45}{1.50} = 0.9667 \\implies \\mathbf{\\theta_c = \\arcsin(0.9667) \\approx 75.16^\\circ}$$
2. **Numerical Aperture:**
   $$NA = \\sqrt{n_1^2 - n_2^2} = \\sqrt{(1.50)^2 - (1.45)^2} = \\sqrt{2.25 - 2.1025} = \\sqrt{0.1475} \\approx \\mathbf{0.384}$$
3. **Acceptance Angle:**
   $$\\theta_a = \\arcsin(NA) = \\arcsin(0.384) \\approx \\mathbf{22.58^\\circ}$$
   *Interpretation:* Light rays entering the fiber face within $\\pm 22.58^\\circ$ of the central axis will undergo sustained total internal reflection.`;

    sectionKeyPoints = `- In thin-film interference, reflection from an optically denser medium introduces an automatic $\\pi$ phase shift (path difference of $\\lambda/2$).
- The Einstein relation states that $B_{12} = B_{21}$ (stimulated absorption probability equals stimulated emission probability).
- Energy in a 1D quantum well increases quadratically with quantum number: $E_n \\propto n^2$.
- Zero-point energy: $E_1 = \\frac{h^2}{8mL^2} > 0$; a trapped quantum particle can never have zero kinetic energy due to Heisenberg's Uncertainty Principle ($\\Delta x \\Delta p \\ge \\hbar/2$).`;

    sectionFormulas = `| Physical Law / Quantity | Mathematical Formula | SI Units & Meaning |
| :--- | :--- | :--- |
| Numerical Aperture | $NA = \\sqrt{n_1^2 - n_2^2}$ | Dimensionless (guide efficiency) |
| Thin Film Path Difference | $\\Delta = 2 \\mu t \\cos r \\pm \\frac{\\lambda}{2}$ | Meters ($\\text{m}$) |
| Newton Rings Diameter | $D_n^2 = 4 n \\lambda R$ (dark rings) | $D_n$ in meters; $R$ = lens curvature |
| 1D Well Energy States | $E_n = \\frac{n^2 h^2}{8 m L^2}$ | Joules ($\\text{J}$) or electronvolts ($\\text{eV}$) |
| Hall Coefficient | $R_H = \\frac{1}{n q} = \\frac{V_H w}{I B}$ | $\\text{m}^3/\\text{C}$ |`;

    sectionSummary = `1. **High-Yield Exam Focus:** Derivation of Numerical Aperture, Newton's ring wavelength determination, and calculation of the 1D quantum infinite well eigen-energies.
2. **Common Trap:** Omitting the $\\lambda/2$ path shift for reflections at denser interfaces (Stokes' condition).
3. **Review Checklist:** Verify that $n_1 > n_2$ in all fiber problems and ensure quantum energies are converted between Joules and $\\text{eV}$ ($1 \\text{ eV} = 1.602 \\times 10^{-19} \\text{ J}$).`;
  }
  // 3. Python / Programming / Computer Science
  else if (subId.includes('cse') || subId.includes('cs') || tLower.includes('python') || tLower.includes('loop') || tLower.includes('recursion') || tLower.includes('list') || tLower.includes('dict') || tLower.includes('oop') || tLower.includes('class')) {
    sectionIntro = `Computer science programming builds the computational logic to implement algorithmic transformations, automate data operations, and design resilient software systems. Python provides high expressive power, dynamic typing, and rich data structure abstraction.

**Target Objectives:**
- Understand execution flow, memory references, and variable scopes in Python.
- Master algorithmic iteration, recursive call stacks, and collection operations.
- Implement object-oriented and functional patterns with robust exception handling.`;

    sectionDefs = `1. **Dynamic Typing:** Variable types are inferred and checked at runtime rather than compile time. Variables are pointers to heap-allocated objects.
2. **Recursion:** A programming pattern where a function calls itself directly or indirectly to solve smaller instances of the same problem until a base condition is reached.
3. **Mutable vs Immutable:** Mutable objects (lists, dictionaries, sets) can be altered in-place in memory. Immutable objects (integers, floats, strings, tuples) cannot be altered; any modification creates a new object.
4. **Time Complexity $O(n)$:** Asymptotic upper bound measuring the growth of computational operations relative to input size $n$.
5. **Context Manager (\`with\` statement):** Protocol that automatically handles resource allocation and release (e.g. file closing, socket teardown) via \`__enter__\` and \`__exit__\` hooks.`;

    sectionTheory = `#### Computational Mechanics & Memory Architecture

##### 1. Python Call Stack & Recursion Mechanics
When a recursive function executes, each recursive invocation pushes a new **Stack Frame** containing:
- Local variable values
- Parameter arguments
- Return instruction pointer

If recursive calls continue without hitting a base case, the stack grows until reaching Python's recursion limit (typically $1000$ calls), raising a \`RecursionError: maximum recursion depth exceeded\`.

##### 2. List Comprehensions & Time Complexity
List comprehensions execute in C-level bytecode loops, yielding substantial performance benefits over traditional manual append loops:
\`\`\`python
# Traditional O(n) loop:
squares = []
for x in range(n):
    if x % 2 == 0:
        squares.append(x * x)

# Equivalent optimized comprehension:
squares = [x * x for x in range(n) if x % 2 == 0]
\`\`\``;

    sectionExample = `#### Executable Python Engineering Blueprint

\`\`\`python
# StudyNest Academic Blueprint: Clean Recursion with Memoization
import time

def fibonacci_memoized(n, cache=None):
    """
    Computes nth Fibonacci number using Top-Down Dynamic Programming.
    Time Complexity: O(n) instead of naive O(2^n).
    Space Complexity: O(n) on recursion call stack.
    """
    if cache is None:
        cache = {0: 0, 1: 1}
    
    if n in cache:
        return cache[n]
    
    # Recursive step
    cache[n] = fibonacci_memoized(n - 1, cache) + fibonacci_memoized(n - 2, cache)
    return cache[n]

if __name__ == '__main__':
    test_terms = [10, 30, 50]
    print("--- StudyNest Memoized Fibonacci Evaluation ---")
    for term in test_terms:
        start = time.perf_counter()
        val = fibonacci_memoized(term)
        elapsed = (time.perf_counter() - start) * 1000
        print(f"Fib({term:2d}) = {val:<15d} | Computed in: {elapsed:.4f} ms")
\`\`\`

*Note: You can click the **"Run in Python Practice Lab"** button in StudyNest to execute this blueprint directly in your browser!*`;

    sectionKeyPoints = `- Python parameters are passed by **Object Reference** (call-by-assignment). Mutating a mutable object inside a function alters the caller's instance.
- Dictionary lookups and set membership operations are average-case $O(1)$ due to underlying hash table implementation.
- Avoid using mutable default arguments like \`def func(a, items=[])\`; default objects are created once at definition time, sharing state across calls.
- Always use \`with open(filename, 'r') as f:\` for file I/O to guarantee file descriptor cleanup even if exceptions occur.`;

    sectionFormulas = `| Operation / Method | Syntax Structure | Time Complexity |
| :--- | :--- | :--- |
| List Indexing / Append | \`arr[i]\` / \`arr.append(val)\` | $O(1)$ amortized |
| List Search / Removal | \`val in arr\` / \`arr.remove(val)\` | $O(n)$ |
| Dict Lookup / Insert | \`d[key]\` / \`d[key] = val\` | $O(1)$ average |
| Set Union / Intersection | \`s1 \\| s2\` / \`s1 & s2\` | $O(\\min(|s1|, |s2|))$ |
| Sorting (Timsort) | \`sorted(arr)\` | $O(n \\log n)$ |`;

    sectionSummary = `1. **High-Yield Exam Focus:** Tracing recursive functions with stack frame diagrams, file parsing with error handling, and class inheritance using \`super().__init__()\`.
2. **Common Trap:** Modifying a list while looping over it. Always iterate over a copy: \`for item in arr[:]:\`.
3. **Review Checklist:** Ensure every recursive function has an explicit base condition, and check data structures for mutability side effects.`;
  }
  // 4. Digital Electronics
  else if (subId.includes('ece') || subId.includes('ee') || tLower.includes('digital') || tLower.includes('gate') || tLower.includes('karnaugh') || tLower.includes('k-map') || tLower.includes('flip') || tLower.includes('multiplexer') || tLower.includes('boolean')) {
    sectionIntro = `Digital electronics forms the physical foundation of modern computing hardware, microprocessors, and embedded VLSI architectures. It formalizes Boolean algebraic reduction, logic gate realization, and state machine transitions.

**Target Objectives:**
- Minimize combinational logic functions using Boolean laws and Karnaugh Maps.
- Construct universal logic circuits utilizing solely NAND or NOR gates.
- Differentiate combinational circuits from clocked sequential memory elements.`;

    sectionDefs = `1. **Boolean Algebra:** Mathematical algebraic structure operating on binary variables $\\{0, 1\\}$ and operators AND $(\\cdot)$, OR $(+)$, and NOT $(')$.
2. **Karnaugh Map (K-Map):** Graphical tabular representation of Boolean truth tables where adjacent cells differ by a single Gray-coded bit, enabling visual minimization.
3. **Combinational Circuit:** A digital circuit whose output at any given instant is determined strictly by its current input values without memory (e.g. Adders, Encoders, Multiplexers).
4. **Sequential Circuit:** A digital circuit whose output depends on both current inputs and previous internal state stored in bistable elements (e.g. Flip-Flops, Registers, Counters).
5. **Setup Time ($t_{su}$):** Minimum duration data input must remain stable before the active clock edge arrives.`;

    sectionTheory = `#### Systematic Logic Minimization & Universal Realization

##### 1. De Morgan's Theorems
De Morgan's laws allow seamless transformation between sum-of-products (SOP) and product-of-sums (POS) representations:
$$\\overline{A \\cdot B} = \\bar{A} + \\bar{B}, \\qquad \\overline{A + B} = \\bar{A} \\cdot \\bar{B}$$

##### 2. Universal Gate Realizations (NAND Logic)
- **NOT:** $Y = \\overline{A \\cdot A} = \\bar{A}$
- **AND:** $Y = \\overline{\\overline{A \\cdot B}} = A \\cdot B$
- **OR:** $Y = \\overline{\\bar{A} \\cdot \\bar{B}} = A + B$
- **XOR:** $Y = A\\bar{B} + \\bar{A}B = \\overline{\\overline{A(A\\text{NAND}B)} \\cdot \\overline{B(A\\text{NAND}B)}}$ (4 NAND gates)

##### 3. Flip-Flop Excitation Characteristics
A **JK Flip-Flop** eliminates the undefined invalid state of SR flip-flops when both inputs are HIGH ($J=1, K=1$), toggling output state:
$$Q_{next} = J\\bar{Q} + \\bar{K}Q$$`;

    sectionExample = `#### Worked K-Map Minimization Problem

**Problem:** Minimize the 4-variable Boolean function:
$$F(A, B, C, D) = \\sum m(0, 2, 5, 7, 8, 10, 13, 15)$$

**Group Analysis in $4 \\times 4$ Gray-Coded Grid:**
1. **Four Corners Group:** Cells $(0, 2, 8, 10)$ form an adjacent 4-cell group.
   - Rows: $A=0, B=0$ and $A=1, B=0 \\implies B=0 \\implies \\bar{B}$.
   - Cols: $C=0, D=0$ and $C=1, D=0 \\implies D=0 \\implies \\bar{D}$.
   - Term: $\\mathbf{\\bar{B}\\bar{D}}$.
2. **Central Quad Group:** Cells $(5, 7, 13, 15)$ form an adjacent 4-cell group.
   - Rows: $A=0, B=1$ and $A=1, B=1 \\implies B=1 \\implies B$.
   - Cols: $C=0, D=1$ and $C=1, D=1 \\implies D=1 \\implies D$.
   - Term: $\\mathbf{BD}$.

**Minimal Sum of Products (SOP):**
$$F = \\bar{B}\\bar{D} + BD = \\mathbf{\\overline{B \\oplus D}} \\quad \\text{(XNOR equivalence)}$$`;

    sectionKeyPoints = `- K-Map groupings must strictly contain $2^k$ cells ($1, 2, 4, 8, 16$). Larger groupings yield fewer literal terms.
- Cells at opposite edges and four corners are geometrically adjacent due to toroidal wrapping.
- In synchronous sequential circuits, clock skew and propagation delays must be accounted for to prevent race hazards.
- A Master-Slave configuration prevents race-around conditions in level-triggered flip-flops.`;

    sectionFormulas = `| Circuit Element | Characteristic Equation | Excitation Table ($Q \\to Q_{next}$) |
| :--- | :--- | :--- |
| D Flip-Flop | $Q_{next} = D$ | $D = Q_{next}$ |
| T Flip-Flop | $Q_{next} = T \\oplus Q$ | $T = Q \\oplus Q_{next}$ |
| JK Flip-Flop | $Q_{next} = J\\bar{Q} + \\bar{K}Q$ | $0\\to0: J=0,K=X; \\; 0\\to1: J=1,K=X$ |
| Full Adder Sum | $S = A \\oplus B \\oplus C_{in}$ | Carry: $C_{out} = AB + BC_{in} + AC_{in}$ |`;

    sectionSummary = `1. **High-Yield Exam Focus:** 4-variable K-Map minimization with don't-care conditions, universal NAND circuit diagrams, and modulo-N counter state diagrams.
2. **Common Trap:** Mislabeling Gray code sequences on K-Map headers (Must be: 00, 01, 11, 10).
3. **Review Checklist:** Verify that no isolated 1-cells were omitted from groupings and all don't-care cells ($d$) were used only if they expanded group sizes.`;
  }
  // 5. Digital Skill Workshop / Linux / Git
  else if (subId.includes('eng103') || tLower.includes('linux') || tLower.includes('git') || tLower.includes('bash') || tLower.includes('shell') || tLower.includes('markdown')) {
    sectionIntro = `Modern software engineering demands fluency with command-line environments, automated shell scripting, and distributed version control systems. This guide establishes professional terminal workflows and collaboration standards.

**Target Objectives:**
- Navigate Unix filesystem hierarchies and manipulate file permissions.
- Construct complex data processing pipelines using standard shell I/O redirection.
- Execute clean Git branching, atomic committing, and merge conflict resolution.`;

    sectionDefs = `1. **POSIX File Hierarchy:** Standard tree architecture rooted at \`/\`, separating system binaries (\`/bin\`), user homes (\`/home\`), configuration files (\`/etc\`), and mount points (\`/mnt\`).
2. **File Permissions (rwx):** Octal access bits for User, Group, and Others (\`chmod 755\` = rwxr-xr-x).
3. **Pipeline (\`|\`):** Inter-process communication mechanism redirecting standard output (stdout) of one process to standard input (stdin) of another.
4. **Git Index (Staging Area):** Intermediate snapshot area where changes are prepared before forming an immutable commit.
5. **Merge Conflict:** Discrepancy occurring when competing commits modify the same lines in a file, requiring developer intervention to reconcile.`;

    sectionTheory = `#### Core Workflows & Terminal Engineering

##### 1. Unix Pipeline Mechanics
Unix processes interface via three standard file streams:
- \`stdin\` (File Descriptor 0)
- \`stdout\` (File Descriptor 1)
- \`stderr\` (File Descriptor 2)

\`\`\`bash
# Find all Python files, filter those modified in last 7 days, and count total lines:
find . -name "*.py" -mtime -7 | xargs wc -l | sort -n
\`\`\`

##### 2. Git Branching & Merge Topology
Git commits form a Directed Acyclic Graph (DAG) of SHA-1/SHA-256 content hashes.
- **Fast-Forward Merge:** Moves branch pointer directly forward if no diverged commits exist.
- **Three-Way Merge:** Combines two branches with a common ancestor, creating a new merge commit with two parents.`;

    sectionExample = `#### Professional Git Workflow Blueprint

\`\`\`bash
# 1. Clone project and inspect remote status
git clone https://github.com/organization/studynest-core.git
cd studynest-core

# 2. Create isolated feature branch
git checkout -b feature/ai-notes-generator

# 3. Inspect status and stage specific modified files
git status
git add src/views/AINotesGeneratorView.jsx

# 4. Commit using Conventional Commit specifications
git commit -m "feat(notes): implement AI Notes Generator with PDF export and flashcards"

# 5. Rebase against latest upstream main to prevent merge bubbles
git fetch origin
git rebase origin/main

# 6. Push to remote and establish tracking
git push -u origin feature/ai-notes-generator
\`\`\``;

    sectionKeyPoints = `- Always review \`git diff\` before staging changes to prevent accidental commit of API keys or sensitive \`.env\` files.
- Octal permission calculation: Read ($4$) + Write ($2$) + Execute ($1$). Therefore \`755\` is Owner ($7$), Group ($5$), Others ($5$).
- Use \`grep -rnI "pattern" .\` for fast recursive search across large source code trees while skipping binary files.`;

    sectionFormulas = `| Command | Options / Syntax | Functional Objective |
| :--- | :--- | :--- |
| \`chmod\` | \`chmod 755 script.sh\` | Set read/write/execute permissions |
| \`grep\` | \`grep -E "regex" file.log\` | Search text using regular expressions |
| \`tar\` | \`tar -czvf archive.tar.gz dir/\` | Compress directory using gzip |
| \`git branch\` | \`git branch -d branch-name\` | Safely delete merged branch |
| \`git stash\` | \`git stash pop\` | Temporarily shelve uncommitted work |`;

    sectionSummary = `1. **High-Yield Exam Focus:** Octal permissions conversion, piping combinations (\`grep\`, \`awk\`, \`sort\`, \`uniq\`), and Git branch conflict resolution.
2. **Common Trap:** Running \`git reset --hard\` without stashing, resulting in irreversible loss of unstaged work.
3. **Review Checklist:** Verify file executable bit (\`chmod +x\`) before running shell scripts, and check remote branch status with \`git status\`.`;
  }
  // 6. Quantitative Aptitude
  else if (subId.includes('eng104') || tLower.includes('aptitude') || tLower.includes('percent') || tLower.includes('work') || tLower.includes('speed') || tLower.includes('probability') || tLower.includes('permutation')) {
    sectionIntro = `Quantitative Aptitude develops the numerical problem-solving speed, algebraic reasoning, and data interpretation required for technical placements and engineering competitive examinations.

**Target Objectives:**
- Master LCM efficiency shortcuts for Time & Work problems.
- Analyze relative speed and distance transformations across opposing and parallel motion.
- Apply combinatorial models and probability rules to complex event spaces.`;

    sectionDefs = `1. **Unitary Work Rate:** If a person completes a job in $T$ days, their daily work efficiency is $\\frac{1}{T}$ of the total job.
2. **Relative Speed:** The rate at which the distance between two moving bodies changes. Sum speeds if moving in opposite directions ($S_1 + S_2$); subtract if in the same direction ($|S_1 - S_2|$).
3. **Permutation ($^n P_r$):** The number of ordered arrangements of $n$ distinct objects taken $r$ at a time.
4. **Combination ($^n C_r$):** The number of unordered selections of $r$ objects chosen from $n$ distinct objects.
5. **Independent Events:** Events $A$ and $B$ where occurrence of one does not alter the probability of the other: $P(A \\cap B) = P(A) \\cdot P(B)$.`;

    sectionTheory = `#### Mathematical Shortcuts & Algorithmic Methods

##### 1. The LCM Method for Time & Work
Instead of working with cumbersome fractions, assume Total Work is the **Least Common Multiple (LCM)** of the individual completion days:
- If Worker A finishes in $A$ days, Worker B in $B$ days:
  - $\\text{Total Work} = \\text{LCM}(A, B)$ units.
  - Efficiency of A = $\\frac{\\text{Total Work}}{A}$ units/day.
  - Combined Time = $\\frac{\\text{Total Work}}{\\text{Efficiency}_A + \\text{Efficiency}_B}$.

##### 2. Speed Conversion & Relative Velocity
- Standard conversion: $1 \\text{ km/h} = \\frac{5}{18} \\text{ m/s}$.
- Time to cross platform of length $L_p$ by train of length $L_t$:
  $$T = \\frac{L_t + L_p}{\\text{Speed of Train}}$$`;

    sectionExample = `#### Worked Placement Problem: Combined Time & Work

**Problem Statement:**
Worker A can complete an engineering design project in $15$ days, Worker B in $20$ days, and Worker C in $30$ days. They all work together for $3$ days, after which Worker A leaves. How many more days will B and C take to finish the remaining work?

**Step 1: Determine Total Work via LCM**
$$\\text{Total Work} = \\text{LCM}(15, 20, 30) = \\mathbf{60\\text{ units}}$$

**Step 2: Calculate Daily Efficiencies**
- $\\text{Rate}(A) = 60 / 15 = 4\\text{ units/day}$
- $\\text{Rate}(B) = 60 / 20 = 3\\text{ units/day}$
- $\\text{Rate}(C) = 60 / 30 = 2\\text{ units/day}$
- Combined $(A + B + C) = 4 + 3 + 2 = 9\\text{ units/day}$.

**Step 3: Work Completed in First 3 Days**
$$\\text{Work Done} = 3\\text{ days} \\times 9\\text{ units/day} = \\mathbf{27\\text{ units}}$$
$$\\text{Remaining Work} = 60 - 27 = \\mathbf{33\\text{ units}}$$

**Step 4: Remaining Time for B and C**
$$\\text{Rate}(B + C) = 3 + 2 = 5\\text{ units/day}$$
$$\\text{Remaining Days} = \\frac{33\\text{ units}}{5\\text{ units/day}} = \\mathbf{6.6\\text{ days}} \\quad (6\\text{ days, } 14\\text{ hours, } 24\\text{ mins})$$`;

    sectionKeyPoints = `- Base shifts in percentages: An increase of $x\\%$ followed by a decrease of $x\\%$ results in a net loss of $\\frac{x^2}{100}\\%$.
- When a train crosses a pole or standing man, the distance covered is strictly the train's own length $L_t$.
- In committee problems, keywords like *"at least one"* imply using complement probability: $1 - P(\\text{none})$.`;

    sectionFormulas = `| Concept | Governing Shortcut Formula | Key Conditions |
| :--- | :--- | :--- |
| Speed Conversion | $S_{\\text{m/s}} = S_{\\text{km/h}} \\times \\frac{5}{18}$ | Metric units |
| Two-Worker Work Time | $T = \\frac{A \\cdot B}{A + B}$ | Both workers working together |
| Relative Speed | $S_{\\text{rel}} = S_1 + S_2$ (opposite), $|S_1 - S_2|$ (same) | Relative motion |
| Permutations Formula | $^n P_r = \\frac{n!}{(n - r)!}$ | Order matters |
| Combinations Formula | $^n C_r = \\frac{n!}{r!(n - r)!}$ | Selection only |`;

    sectionSummary = `1. **High-Yield Exam Focus:** LCM time and work problems with workers joining/leaving, trains crossing bridges, and conditional committee selection.
2. **Common Trap:** Forgetting to convert km/h to m/s when distances are given in meters.
3. **Review Checklist:** Verify units balance (seconds with meters, hours with kilometers) before algebraic reduction.`;
  }
  // 7. English for Technical Communication
  else {
    sectionIntro = `Technical communication equips engineering professionals with the precision, structure, and clarity needed for formal engineering documentation, scientific reports, and stakeholder presentations.

**Target Objectives:**
- Apply the 7 C's of professional communication across workplace correspondence.
- Structure scientific laboratory reports and research abstracts.
- Master grammatical precision, active voice, and technical vocabulary.`;

    sectionDefs = `1. **7 C's of Communication:** Principles ensuring messages are Clear, Concise, Concrete, Correct, Coherent, Complete, and Courteous.
2. **Executive Summary:** A concise self-contained synthesis of a technical document providing objectives, findings, and recommendations for leadership.
3. **Active Voice:** Sentence structure where the grammatical subject performs the action, maximizing directness and impact.
4. **Passive Voice:** Sentence structure where the action or recipient is emphasized, standard in scientific methodology sections.
5. **Jargon:** Specialized terminology appropriate for domain experts but requiring simplification for interdisciplinary stakeholders.`;

    sectionTheory = `#### Formal Communication Frameworks

##### 1. Technical Report Architecture (IMRAD Format)
Undergraduate engineering research follows the standard IMRAD structure:
- **I**ntroduction: Background, motivation, and problem statement.
- **M**ethodology: Materials, experimental setup, tools, and protocols.
- **R**esults: Quantitative data, graphs, tables, and observed metrics.
- **A**nd
- **D**iscussion: Interpretation, error analysis, limitations, and future work.

##### 2. Active vs. Passive Voice Usage Guidelines
- **Use Active Voice for Executive Directness:**
  *"The microcontroller samples analog sensor pins every 10 ms."*
- **Use Passive Voice for Objective Experimental Protocol:**
  *"The synthesized sample was annealed at 600°C for three hours."*`;

    sectionExample = `#### Professional Engineering Communication Blueprint

\`\`\`text
Subject: [Urgent] Digital Electronics Laboratory Oscilloscope Calibration - Team Beta

Dear Dr. Sharma,

I am writing on behalf of Team Beta regarding our upcoming Semester 1 Laboratory session scheduled for Thursday, November 6th.

During our preliminary testing of the 4-to-1 Multiplexer circuit, Channel 2 of Oscilloscope Unit #4 exhibited a persistent 150 mV DC ground offset.

Proposed Resolution:
- Could our team obtain access to the laboratory 30 minutes prior to the session (1:30 PM) to re-zero the probe calibration?
- Alternatively, please let us know if we should transfer our breadboard prototype to Bench Station #7.

Thank you for your guidance.

Respectfully,
Aarav Patel
B.Tech CSE (AI & Machine Learning), Semester 1
StudyNest Workspace | Student ID: 2026-AIML-042
\`\`\``;

    sectionKeyPoints = `- Eliminate wordy redundancies: Replace *"at the present point in time"* with *"now"*, and *"due to the fact that"* with *"because"*.
- Ensure subject-verb agreement across collective nouns and complex prepositional phrases.
- In technical abstracts, maintain past tense for completed experiments and present tense for established scientific facts.`;

    sectionFormulas = `| Communication Component | Structural Requirement | Quality Standard |
| :--- | :--- | :--- |
| Email Subject Line | \`[Category] Specific Action Item - Sender\` | Under 50 characters, unambiguous |
| Technical Abstract | Background, Objective, Method, Result, Conclusion | 150–250 words |
| Table Captions | Placed strictly ABOVE the table with units | E.g. *"Table 1: Measured Tensile Stress"* |
| Figure Captions | Placed strictly BELOW the figure with legend | E.g. *"Figure 3: Frequency response curve"* |`;

    sectionSummary = `1. **High-Yield Exam Focus:** Formal business letters, incident reports, précis writing, and correcting grammatical modifiers.
2. **Common Trap:** Mixing British and American spelling conventions within the same technical document.
3. **Review Checklist:** Check that every acronym is defined upon first mention, and verify paragraph coherence using logical transition words.`;
  }

  return `${banner}# ${topicName}
> **Course:** ${subTitle} (${subCode}) | **Level:** ${level.toUpperCase()} | **Note Length:** ${length.toUpperCase()} | **Generated for StudyNest Workspace**

---

### 1. Topic Introduction & Objectives
${sectionIntro}

---

### 2. Important Definitions & Core Principles
${sectionDefs}

---

### 3. Detailed Explanations & Theoretical Framework
${sectionTheory}

---

### 4. Worked Engineering Examples
${sectionExample}

---

### 5. Key Points & High-Yield Takeaways
${sectionKeyPoints}

---

### 6. Important Formulas & Equations Table
${sectionFormulas}

---

### 7. Examination Summary & Common Pitfalls
${sectionSummary}
`;
}

/**
 * Handle Note Generation Dispatcher
 */
export async function processGenerateNoteRequest({ subject, topic, level = 'intermediate', length = 'standard', focus = 'all' }) {
  const config = getAiConfig();
  const subTitle = subject?.title || 'Engineering Course';
  const subCode = subject?.code || 'ENG 101';
  const topicName = topic || 'Core Curriculum Principles';

  if (!config.configured) {
    const offlineContent = generateOfflineStructuredNote({ subject, topic: topicName, level, length, focus });
    return {
      ok: true,
      isDemo: true,
      configured: false,
      title: `${topicName}`,
      description: `Structured lecture notes on ${topicName} for ${subCode}: ${subTitle}.`,
      content: offlineContent,
      subjectCode: subCode,
      subjectTitle: subTitle,
      provider: 'offline-curriculum',
      model: 'note-architect-v1'
    };
  }

  const systemInstruction = `You are StudyNest's Senior Academic Engineering Notes Architect.
Generate authoritative, structured undergraduate lecture notes in GitHub Flavored Markdown for 1st Year Engineering students.

COURSE: ${subTitle} (${subCode})
TOPIC: ${topicName}
EXPLANATION LEVEL: ${level.toUpperCase()}
NOTE LENGTH: ${length.toUpperCase()}
FOCUS AREA: ${focus.toUpperCase()}

MANDATORY SECTIONS REQUIRED:
# ${topicName}
> **Course:** ${subTitle} (${subCode}) | **Level:** ${level.toUpperCase()} | **Note Length:** ${length.toUpperCase()}

### 1. Topic Introduction & Objectives
### 2. Important Definitions & Core Principles
### 3. Detailed Explanations & Theoretical Framework
### 4. Worked Engineering Examples (with step-by-step numbers or clean Python code in \`\`\`python)
### 5. Key Points & High-Yield Takeaways
### 6. Important Formulas & Equations Table (Markdown table)
### 7. Examination Summary & Common Pitfalls
`;

  try {
    let rawContent = '';
    let usedModel = config.model;

    if (config.provider === 'gemini') {
      const result = await callGemini({
        messages: [{ role: 'user', content: `Generate the complete 7-section engineering notes for "${topicName}" in "${subTitle}" (${subCode}). Level: ${level}, Length: ${length}.` }],
        systemInstruction,
        apiKey: config.geminiKey,
        model: config.geminiModel
      });
      rawContent = result.content;
      usedModel = result.model;
    } else if (config.provider === 'openai') {
      const result = await callOpenAi({
        messages: [{ role: 'user', content: `Generate the complete 7-section engineering notes for "${topicName}" in "${subTitle}" (${subCode}). Level: ${level}, Length: ${length}.` }],
        systemInstruction,
        apiKey: config.openaiKey,
        baseUrl: config.openaiBaseUrl,
        model: config.openaiModel
      });
      rawContent = result.content;
      usedModel = result.model;
    }

    return {
      ok: true,
      isDemo: false,
      configured: true,
      title: `${topicName}`,
      description: `Structured lecture notes on ${topicName} for ${subCode}: ${subTitle}.`,
      content: rawContent,
      subjectCode: subCode,
      subjectTitle: subTitle,
      provider: config.provider,
      model: usedModel
    };
  } catch (err) {
    console.error('[StudyNest AI Note Generation Error]:', err.message);
    return {
      ok: false,
      error: err.message,
      content: `> **[AI Provider Error]**\n> Note generation with ${config.provider} (${config.model}) failed:\n> \`${err.message}\`\n\nPlease verify your API key and quota at https://aistudio.google.com/.`,
      isDemo: false,
      configured: true,
      title: `${topicName}`,
      subjectCode: subCode,
      subjectTitle: subTitle,
      provider: config.provider,
      model: config.model
    };
  }
}

/**
 * Handle Smart Revision Tools Dispatcher
 * Tools: 'summarize', 'questions', 'flashcards', 'mcqs', 'formulas', 'last_minute'
 */
export async function processRevisionToolRequest({ tool, subject, topic, noteContent = '' }) {
  const config = getAiConfig();
  const subTitle = subject?.title || 'Engineering Course';
  const subCode = subject?.code || 'ENG 101';
  const topicName = topic || 'Study Notes';

  // If live AI is configured, query LLM for structured revision artifact
  if (config.configured) {
    let promptInstruction = '';
    if (tool === 'summarize') {
      promptInstruction = `Provide a rapid 1-page executive summary of the note: core definitions, governing equations, and a 3-point exam checklist.`;
    } else if (tool === 'questions') {
      promptInstruction = `Generate 5 high-yield university examination questions based on this topic (2 short-answer, 2 numerical, 1 long-form derivation) with complete step-by-step model answers.`;
    } else if (tool === 'flashcards') {
      promptInstruction = `Generate 6 interactive flashcards for active recall. Format as a JSON array of objects with keys: "id" (number), "front" (question or concept), "back" (answer or explanation), "category" (e.g. Definition, Formula, Concept). Wrap the JSON in \`\`\`json ... \`\`\` code block.`;
    } else if (tool === 'mcqs') {
      promptInstruction = `Generate 5 multiple-choice questions (MCQs) for this topic. Format as a JSON array of objects with keys: "id" (number), "question" (string), "options" (array of 4 strings), "correctIndex" (0-3), "explanation" (string). Wrap the JSON in \`\`\`json ... \`\`\` code block.`;
    } else if (tool === 'formulas') {
      promptInstruction = `Extract and format all mathematical formulas, constants, and equations into a comprehensive reference cheat sheet Markdown table with SI units and parameter explanations.`;
    } else if (tool === 'last_minute') {
      promptInstruction = `Generate high-yield last-minute revision bullet points: quick memory aids, top 3 scoring tips, and 3 common mistakes students make on this topic.`;
    }

    try {
      const messages = [
        {
          role: 'user',
          content: `TOPIC: ${topicName} (${subCode}: ${subTitle})\nTOOL: ${tool}\n\nSTUDY CONTENT:\n${(noteContent || '').slice(0, 4000)}\n\nTASK: ${promptInstruction}`
        }
      ];

      let rawOutput = '';
      if (config.provider === 'gemini') {
        const res = await callGemini({
          messages,
          systemInstruction: `You are StudyNest's Smart Revision Engine. Return clean, precise academic responses for 1st-year engineering students.`,
          apiKey: config.geminiKey,
          model: config.geminiModel
        });
        rawOutput = res.content;
      } else if (config.provider === 'openai') {
        const res = await callOpenAi({
          messages,
          systemInstruction: `You are StudyNest's Smart Revision Engine. Return clean, precise academic responses for 1st-year engineering students.`,
          apiKey: config.openaiKey,
          baseUrl: config.openaiBaseUrl,
          model: config.openaiModel
        });
        rawOutput = res.content;
      }

      // Try parsing JSON if flashcards or mcqs
      if (tool === 'flashcards' || tool === 'mcqs') {
        const jsonMatch = rawOutput.match(/```(?:json)?([\s\S]*?)```/);
        const jsonStr = jsonMatch ? jsonMatch[1].trim() : rawOutput.trim();
        try {
          const parsed = JSON.parse(jsonStr);
          return { ok: true, isDemo: false, tool, data: parsed, rawContent: rawOutput };
        } catch {
          // Fallback to offline structured cards if JSON parse fails
        }
      }

      return { ok: true, isDemo: false, tool, content: rawOutput };
    } catch (err) {
      console.warn('[Revision Tool Live AI fallback]:', err.message);
    }
  }

  // Offline Revision Tool Synthesizer
  return generateOfflineRevisionArtifact({ tool, subject, topic: topicName, noteContent });
}

/**
 * Generate Offline Revision Materials (Flashcards, MCQs, Summaries, Formulas)
 */
function generateOfflineRevisionArtifact({ tool, subject, topic, noteContent: _noteContent }) {
  const subCode = subject?.code || 'ENG 101';
  const subTitle = subject?.title || 'Engineering Course';
  const topicName = topic || 'Engineering Principles';
  const tLower = topicName.toLowerCase();
  const subId = (subject?.id || '').toLowerCase();

  if (tool === 'summarize') {
    return {
      ok: true,
      isDemo: true,
      tool: 'summarize',
      content: `### High-Yield Executive Summary: ${topicName}
**Subject:** ${subTitle} (${subCode}) · *Generated by StudyNest Revision Engine*

#### Core Takeaways in 60 Seconds:
- **Foundational Idea:** ${topicName} establishes analytical framework and computational models for physical and software engineering systems.
- **Governing Law / Principle:** The mathematical formulations decouple complex boundary conditions into discrete, solvable linear or differential components.
- **Key Engineering Application:** Deployed in computer algorithms, structural load analysis, signal processing, and semiconductor devices.

#### Rapid Formula / Syntax Snapshot:
- Identify given constraints and boundary conditions ($x \\to 0, x \\to \\infty$).
- Apply standard normalization or consistency checks prior to final evaluation.
- Always check that computed values satisfy dimensional homogeneity.

#### 3-Point Pre-Exam Checklist:
1. Review definitions and conditions where theorems apply (and where they fail).
2. Work through at least one end-to-end numerical calculation with units.
3. Be prepared to explain physical meaning rather than just reciting final equations.`
    };
  }

  if (tool === 'questions') {
    return {
      ok: true,
      isDemo: true,
      tool: 'questions',
      content: `### University Examination Question Bank: ${topicName}
*Target Course: ${subTitle} (${subCode})*

#### Question 1 (Short Answer · 2 Marks)
**Q:** State the essential condition under which the theorem or principle of ${topicName} holds true.
**Model Answer:** The governing principle holds when the system is linear and homogenous within operational boundaries. For matrix transformations, it requires non-singular linear independence; for physical waveguides, it requires core index exceeding cladding index ($n_1 > n_2$).

---

#### Question 2 (Conceptual / Proof · 5 Marks)
**Q:** Explain the physical significance of the parameters involved in ${topicName} and contrast with its complementary counterpart.
**Model Answer:** The parameters dictate energy preservation, eigenvalues, or state transitions. In combinational circuits, outputs transition instantaneously without state memory; in sequential configurations, clock transitions gate state retention across bistable feedback paths.

---

#### Question 3 (Numerical / Analytical · 5 Marks)
**Q:** Derive the step-by-step reduction procedure used to solve standard engineering problems in ${topicName}.
**Model Answer:**
1. State the given initial conditions and target parameter.
2. Formulate the characteristic matrix or governing differential equation.
3. Apply Gaussian reduction, algebraic substitution, or K-Map grouping.
4. Calculate final values and append standard SI units.

---

#### Question 4 (Comprehensive / Derivation · 10 Marks)
**Q:** Provide a comprehensive derivation of ${topicName}, outlining all assumptions, intermediate algebraic simplifications, and practical engineering significance.
**Model Answer:** Begin by stating the governing conservation theorem. Substitute the boundary conditions, eliminate redundant terms using orthogonality, factor the characteristic polynomial, and prove that the derived solution satisfies physical invariance.`
    };
  }

  if (tool === 'flashcards') {
    let cards = [];
    if (subId.includes('math') || tLower.includes('eigen') || tLower.includes('matrix')) {
      cards = [
        { id: 1, front: 'What is the characteristic equation of an n × n matrix A?', back: 'det(A - λI) = 0. Its scalar roots λ are the eigenvalues of matrix A.', category: 'Definition' },
        { id: 2, front: 'What does the Cayley-Hamilton Theorem state?', back: 'Every square matrix satisfies its own characteristic equation: P(A) = 0. It is used to compute high matrix powers and inverses without cofactor expansion.', category: 'Theorem' },
        { id: 3, front: 'When is a matrix A diagonalizable?', back: 'A is diagonalizable if and only if it has n linearly independent eigenvectors, meaning Algebraic Multiplicity equals Geometric Multiplicity for all eigenvalues.', category: 'Condition' },
        { id: 4, front: 'What is the geometric meaning of an Eigenvector Av = λv?', back: 'The vector v does not change direction under the transformation A; it is only scaled by the factor λ.', category: 'Intuition' },
        { id: 5, front: 'What are the two fundamental matrix invariants related to eigenvalues?', back: '1. Trace Invariant: Sum of eigenvalues = Trace(A).\n2. Determinant Invariant: Product of eigenvalues = det(A).', category: 'Property' },
        { id: 6, front: 'Why does dx dy become r dr dθ in polar double integrals?', back: 'Because the Jacobian determinant J of the transformation x = r cos θ, y = r sin θ equals r, which represents the differential area element scaling.', category: 'Calculus' }
      ];
    } else if (subId.includes('cse') || tLower.includes('python')) {
      cards = [
        { id: 1, front: 'What is the difference between Mutable and Immutable objects in Python?', back: 'Mutable objects (lists, dicts, sets) can be altered in-place in memory. Immutable objects (ints, strings, tuples) cannot be altered; changes create new objects.', category: 'Python Core' },
        { id: 2, front: 'What is the average time complexity of a Python Dictionary lookup?', back: 'O(1) constant time, because dictionaries are implemented internally using hash tables.', category: 'Complexity' },
        { id: 3, front: 'What happens if a recursive function lacks a base case?', back: 'The call stack grows until reaching Python\'s recursion limit, raising RecursionError: maximum recursion depth exceeded.', category: 'Debugging' },
        { id: 4, front: 'Why should you avoid mutable default arguments like def f(a, items=[])?', back: 'Default parameter objects are evaluated only once at definition time. Subsequent calls share and mutate the same list instance.', category: 'Best Practice' },
        { id: 5, front: 'What does the `with` statement do in Python file operations?', back: 'It acts as a context manager, automatically executing __enter__ and __exit__ to ensure files and sockets are closed even if exceptions occur.', category: 'File I/O' },
        { id: 6, front: 'What is the difference between `is` and `==` in Python?', back: '`==` compares value equality (content), whereas `is` checks reference identity (whether both variables point to the exact same memory address).', category: 'Operators' }
      ];
    } else {
      cards = [
        { id: 1, front: `What is the core definition of ${topicName}?`, back: `It is the foundational engineering principle in ${subTitle} that establishes formal mathematical and operational relationships.`, category: 'Definition' },
        { id: 2, front: 'How do you verify the dimensional correctness of a derived formula?', back: 'Check that every additive term on both sides of the equation has identical fundamental SI dimensions (M, L, T).', category: 'Method' },
        { id: 3, front: 'What is the standard procedure to solve this numerical problem?', back: '1. Extract Given data with SI units.\n2. State governing formula.\n3. Substitute values algebraically.\n4. Box final answer with units.', category: 'Procedure' },
        { id: 4, front: 'What is the primary engineering application of this topic?', back: `Used in modern system optimization, signal processing, and computer-aided engineering modeling in ${subTitle}.`, category: 'Application' },
        { id: 5, front: 'What is the most common mistake students make on this topic in examinations?', back: 'Applying formulas without confirming boundary conditions, or omitting unit conversions (e.g. km/h to m/s, or degrees to radians).', category: 'Pitfall' }
      ];
    }

    return { ok: true, isDemo: true, tool: 'flashcards', data: cards };
  }

  if (tool === 'mcqs') {
    let mcqs = [];
    if (subId.includes('math') || tLower.includes('eigen') || tLower.includes('matrix')) {
      mcqs = [
        {
          id: 1,
          question: 'The characteristic equation of a square matrix A is obtained by setting which expression to zero?',
          options: ['det(A - λI)', 'Trace(A - λI)', 'adj(A) · λ', 'A² - λA'],
          correctIndex: 0,
          explanation: 'The characteristic equation is det(A - λI) = 0, derived from requiring non-trivial solutions to (A - λI)v = 0.'
        },
        {
          id: 2,
          question: 'If a 2 × 2 matrix A has eigenvalues λ₁ = 4 and λ₂ = -1, what is the determinant of A?',
          options: ['3', '-4', '4', '16'],
          correctIndex: 1,
          explanation: 'The determinant of a matrix equals the product of its eigenvalues: det(A) = (4) × (-1) = -4.'
        },
        {
          id: 3,
          question: 'Which theorem states that every square matrix satisfies its own characteristic equation?',
          options: ['Cramer’s Rule', 'Cayley-Hamilton Theorem', 'Rolle’s Theorem', 'Gauss-Jordan Theorem'],
          correctIndex: 1,
          explanation: 'The Cayley-Hamilton theorem states that substituting matrix A into its characteristic polynomial Δ(λ) yields the zero matrix Δ(A) = 0.'
        },
        {
          id: 4,
          question: 'When transforming Cartesian double integrals to Polar coordinates, dx dy is replaced by:',
          options: ['dr dθ', 'r dr dθ', 'r² dr dθ', '2πr dr dθ'],
          correctIndex: 1,
          explanation: 'The Jacobian determinant of the polar coordinate transformation is r, so the area element becomes dx dy = r dr dθ.'
        },
        {
          id: 5,
          question: 'A real symmetric matrix always possesses:',
          options: ['Purely imaginary eigenvalues', 'Strictly real eigenvalues and orthogonal eigenvectors', 'A determinant of zero', 'No inverse'],
          correctIndex: 1,
          explanation: 'By the spectral theorem, any real symmetric matrix has all real eigenvalues and mutually perpendicular (orthogonal) eigenvectors.'
        }
      ];
    } else {
      mcqs = [
        {
          id: 1,
          question: `In ${subTitle}, which of the following is essential for the validity of ${topicName}?`,
          options: ['Linearity and defined boundary conditions', 'Zero resistance and infinite bandwidth', 'Only manual execution without automation', 'Exclusive application to mechanical systems'],
          correctIndex: 0,
          explanation: 'Standard undergraduate engineering theorems assume linear, homogenous properties within operational boundary constraints.'
        },
        {
          id: 2,
          question: 'When solving engineering problems, checking dimensional homogeneity means:',
          options: ['All terms must have matching SI units', 'The answer must always be positive', 'Angles must be in degrees instead of radians', 'Fractions must be converted to decimals'],
          correctIndex: 0,
          explanation: 'Dimensional homogeneity requires that every term added, subtracted, or equated must have identical base units.'
        },
        {
          id: 3,
          question: 'Which strategy is most effective for last-minute exam revision of this topic?',
          options: ['Memorizing without understanding derivation', 'Reviewing core definitions, formulas, and working 1 numerical problem', 'Skipping boundary condition checks', 'Ignoring practice question rubrics'],
          correctIndex: 1,
          explanation: 'Reviewing core formulas alongside an illustrative worked problem reinforces procedural memory and conceptual retention.'
        },
        {
          id: 4,
          question: 'What is the primary role of algorithmic and mathematical abstraction in engineering?',
          options: ['To make problems artificially complex', 'To model real-world physical systems with predictable equations', 'To eliminate the need for computer programming', 'To prevent formula derivation'],
          correctIndex: 1,
          explanation: 'Abstraction allows engineers to represent complex physical systems with tractable mathematical and software models.'
        },
        {
          id: 5,
          question: 'What should be verified immediately after calculating an engineering numerical answer?',
          options: ['Check units and physical reasonableness of the magnitude', 'Close the exam booklet immediately', 'Delete intermediate steps', 'Change the answer if it contains fractions'],
          correctIndex: 0,
          explanation: 'Verifying order of magnitude and correct SI units catches algebraic and sign errors before submission.'
        }
      ];
    }

    return { ok: true, isDemo: true, tool: 'mcqs', data: mcqs };
  }

  if (tool === 'formulas') {
    return {
      ok: true,
      isDemo: true,
      tool: 'formulas',
      content: `### Essential Formulas & Equation Cheat Sheet: ${topicName}
**Course:** ${subTitle} (${subCode}) · *StudyNest Formula Extraction*

| Equation / Formula | Name & Purpose | Variables & Standard SI Units |
| :--- | :--- | :--- |
| $\\det(A - \\lambda I) = 0$ | Characteristic Equation | $\\lambda$ = Eigenvalue (scalar), $I$ = Identity matrix |
| $\\text{Tr}(A) = \\sum_{i=1}^n \\lambda_i$ | Trace Invariant | Sum of diagonal entries equals sum of eigenvalues |
| $\\det(A) = \\prod_{i=1}^n \\lambda_i$ | Determinant Invariant | Product of eigenvalues equals determinant |
| $A = P D P^{-1}$ | Diagonalization Relation | $D$ = Diagonal eigenvalue matrix, $P$ = Modal eigenvector matrix |
| $dx\\,dy = r\\,dr\\,d\\theta$ | Polar Area Transformation | $r$ = Radius ($\\text{m}$), $\\theta$ = Angle ($\\text{rad}$) |
| $J(u, v) = \\frac{\\partial(x, y)}{\\partial(u, v)}$ | Jacobian Determinant | Coordinate scaling factor in multivariable substitution |

#### High-Yield Examination Memory Tips:
- Verify that units on left-hand side balance units on right-hand side.
- For 2×2 matrices, use the rapid quadratic shortcut: $\\lambda^2 - \\text{Tr}(A)\\lambda + \\det(A) = 0$.`
    };
  }

  // Last minute revision
  return {
    ok: true,
    isDemo: true,
    tool: 'last_minute',
    content: `### ⚡ Last-Minute Exam Revision Cheat Sheet: ${topicName}
**Subject:** ${subTitle} (${subCode})

#### 🚀 High-Yield Key Points (Commit to Memory):
1. **Core Law:** ${topicName} relies on linear independence, conservation laws, or deterministic state transitions.
2. **Primary Equation:** Always memorize the characteristic form before entering the exam hall.
3. **Invariance:** Trace equals sum of roots; determinant equals product of roots.

#### ⚠️ Top 3 Examination Traps & How to Avoid Them:
1. **Unit Inconsistency:** Mixing m/s with km/h or radians with degrees. *Always convert to base SI units first.*
2. **Algebraic Multiplicity vs Geometric Multiplicity:** If geometric multiplicity is less than algebraic multiplicity, the matrix is defective and cannot be diagonalized.
3. **Sign Errors in Determinants:** Watch out for the alternating signs $+ - + -$ when expanding along rows or columns!

#### 🎯 5-Minute Pre-Exam Checklist:
- [ ] Can you write down the governing formula from memory in 10 seconds?
- [ ] Do you know what happens at the boundary conditions ($0$ and $\\infty$)?
- [ ] Have you verified the sign of intermediate coefficients?`
  };
}
