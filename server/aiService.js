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
    if (typeof process.loadEnvFile === 'function') {
      try {
        process.loadEnvFile(envPath);
      } catch (err) {
        console.warn('[StudyNest AI] Warning loading .env:', err.message);
      }
    } else {
      try {
        const content = fs.readFileSync(envPath, 'utf8');
        content.split(/\r?\n/).forEach((line) => {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) return;
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx > 0) {
            const key = trimmed.slice(0, eqIdx).trim();
            const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"](.*)['"]$/, '$1');
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        });
      } catch (err) {
        console.warn('[StudyNest AI] Fallback .env parse error:', err.message);
      }
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

  const geminiModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
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

PEDAGOGICAL TEACHING PRINCIPLES:
1. Promote Conceptual Mastery: Help students deeply understand principles rather than just memorizing answers. Guide them through the reasoning process.
2. Formatting: Use clean Markdown. Use '###' for section headings, bold text for key terms, bulleted lists for clarity, and clean LaTeX-style or ASCII formulas.
3. Code Quality: When generating code (especially Python), write clean, idiomatic code with helpful comments. Always enclose Python code in \`\`\`python blocks.
4. Tone: Encouraging, supportive, precise, and academically authoritative yet friendly.
5. University Relevance: Ensure explanations align with standard engineering syllabus expectations for Semester 1.
`.trim();
}

/**
 * Call Google Gemini API
 */
async function callGemini({ messages, systemInstruction, apiKey, model }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

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
      maxOutputTokens: 3000
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    let errorDetail = '';
    try {
      const errJson = await response.json();
      errorDetail = errJson.error?.message || JSON.stringify(errJson);
    } catch {
      errorDetail = await response.text();
    }

    if (response.status === 400 && errorDetail.toLowerCase().includes('api key')) {
      throw new Error(`Google Gemini API Key invalid or expired. Please verify your GEMINI_API_KEY in .env. Details: ${errorDetail}`);
    } else if (response.status === 429) {
      throw new Error(`Gemini rate limit reached. Please wait a minute or check your quota at https://aistudio.google.com/.`);
    } else {
      throw new Error(`Google Gemini API error (HTTP ${response.status}): ${errorDetail}`);
    }
  }

  const data = await response.json();
  const candidate = data.candidates?.[0];
  const text = candidate?.content?.parts?.map((p) => p.text).join('') || '';

  if (!text) {
    throw new Error('Gemini API returned an empty response. Please try rephrasing your question.');
  }

  return {
    content: text,
    provider: 'gemini',
    model,
    finishReason: candidate?.finishReason || 'STOP'
  };
}

/**
 * Call OpenAI / OpenAI-compatible API
 */
async function callOpenAi({ messages, systemInstruction, apiKey, baseUrl, model }) {
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

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    let errorDetail = '';
    try {
      const errJson = await response.json();
      errorDetail = errJson.error?.message || JSON.stringify(errJson);
    } catch {
      errorDetail = await response.text();
    }

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
  // 3. Engineering Physics
  else if (subId === 'phy102' || q.includes('physics') || q.includes('laser') || q.includes('quantum') || q.includes('optic') || q.includes('schrodinger') || q.includes('semiconductor')) {
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

  // If no API key configured, use intelligent pedagogical fallback
  if (!config.configured) {
    const latestUserMessage = messages?.slice().reverse().find((m) => m.role === 'user')?.content || '';
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

  try {
    if (config.provider === 'gemini') {
      const result = await callGemini({
        messages,
        systemInstruction,
        apiKey: config.geminiKey,
        model: config.geminiModel
      });

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
    // If the live call failed (e.g. invalid key, quota, or network drop),
    // return a clear error along with fallback demo response so student is never stranded!
    const latestUserMessage = messages?.slice().reverse().find((m) => m.role === 'user')?.content || '';
    const fallbackResponse = generatePedagogicalDemoResponse({
      message: latestUserMessage,
      subject,
      mode,
      quickAction
    });

    return {
      ok: false,
      error: err.message,
      content: `> **[AI Provider Notice]**\n> Live call to ${config.provider} encountered an error: *${err.message}*\n> StudyNest provided this offline pedagogical explanation in the interim:\n\n` + fallbackResponse,
      isDemo: true,
      configured: true,
      provider: config.provider
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
    const offlineFallback = generateOfflineStructuredNote({ subject, topic: topicName, level, length, focus });
    return {
      ok: false,
      error: err.message,
      content: `> **[AI Provider Notice]**\n> Live call to ${config.provider} encountered an error: *${err.message}*\n> StudyNest provided this offline structured curriculum note in the interim:\n\n` + offlineFallback,
      isDemo: true,
      configured: true,
      title: `${topicName}`,
      subjectCode: subCode,
      subjectTitle: subTitle,
      provider: config.provider
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
