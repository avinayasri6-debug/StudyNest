// Pyodide WebAssembly Execution Service for StudyNest Python Academy
// Supports both isolated Web Worker execution (with instant stop capability) and main-thread fallback.

let workerInstance = null;
let currentMessageId = 0;
let pendingCallbacks = new Map();
let pyodideStatus = 'idle'; // 'idle' | 'loading' | 'ready' | 'error'
let statusListeners = new Set();
let statusMessage = 'Python runtime not initialized';
let mainThreadPyodide = null;
let isMainThreadInitializing = false;

// Register status listeners
export function subscribePyodideStatus(listener) {
  statusListeners.add(listener);
  listener({ status: pyodideStatus, message: statusMessage });
  return () => statusListeners.delete(listener);
}

function updateStatus(status, message) {
  pyodideStatus = status;
  statusMessage = message;
  statusListeners.forEach((fn) => {
    try {
      fn({ status, message });
    } catch {
      // ignore
    }
  });
}

export function getPyodideCurrentStatus() {
  return { status: pyodideStatus, message: statusMessage };
}

// Initialize Web Worker or Main Thread Pyodide
export async function initPyodideRuntime() {
  if (pyodideStatus === 'ready') {
    return { status: 'ready', message: statusMessage };
  }
  if (pyodideStatus === 'loading') {
    return new Promise((resolve) => {
      const unsub = subscribePyodideStatus((state) => {
        if (state.status === 'ready' || state.status === 'error') {
          unsub();
          resolve(state);
        }
      });
    });
  }

  updateStatus('loading', 'Initializing Python 3.12 WebAssembly runtime via Pyodide...');

  // 1. Try launching the Web Worker
  try {
    if (typeof Worker !== 'undefined') {
      const worker = getOrCreateWorker();
      const initPromise = new Promise((resolve, reject) => {
        const id = ++currentMessageId;
        const timeout = setTimeout(() => {
          pendingCallbacks.delete(id);
          reject(new Error('Pyodide Worker initialization timed out after 20 seconds.'));
        }, 20000);

        pendingCallbacks.set(id, (msg) => {
          clearTimeout(timeout);
          if (msg.type === 'init_success') {
            resolve();
          } else {
            reject(new Error(msg.error || 'Worker initialization failed'));
          }
        });

        worker.postMessage({ id, type: 'init' });
      });

      await initPromise;
      updateStatus('ready', 'Python 3.12 WebAssembly runtime ready (Worker isolation active)');
      return { status: 'ready' };
    }
  } catch (workerErr) {
    console.warn('Pyodide Web Worker failed to initialize, falling back to main-thread execution:', workerErr);
  }

  // 2. Fallback to Main Thread Pyodide
  try {
    await initMainThreadPyodide();
    updateStatus('ready', 'Python 3.12 WebAssembly runtime ready (Main thread active)');
    return { status: 'ready' };
  } catch (mainErr) {
    console.error('Failed to initialize Pyodide on main thread:', mainErr);
    const errMsg = 'Failed to load Python WebAssembly runtime. Please ensure your device has internet access to load Pyodide from CDN (jsdelivr.net).';
    updateStatus('error', errMsg);
    throw new Error(errMsg);
  }
}

function getOrCreateWorker() {
  if (workerInstance) return workerInstance;

  workerInstance = new Worker('/pyodideWorker.js');
  workerInstance.onmessage = (event) => {
    const { id } = event.data || {};
    if (id && pendingCallbacks.has(id)) {
      const cb = pendingCallbacks.get(id);
      pendingCallbacks.delete(id);
      cb(event.data);
    }
  };

  workerInstance.onerror = (err) => {
    console.error('Pyodide Worker error:', err);
    updateStatus('error', 'Pyodide Worker encountered an error: ' + (err.message || 'Script error'));
  };

  return workerInstance;
}

// Fallback: Dynamically load Pyodide on Main Thread
async function initMainThreadPyodide() {
  if (mainThreadPyodide) return mainThreadPyodide;
  if (isMainThreadInitializing) {
    while (isMainThreadInitializing) {
      await new Promise((r) => setTimeout(r, 100));
    }
    return mainThreadPyodide;
  }

  isMainThreadInitializing = true;
  try {
    if (!window.loadPyodide) {
      await new Promise((resolve, reject) => {
        const existing = document.getElementById('pyodide-cdn-script');
        if (existing) {
          existing.addEventListener('load', resolve);
          existing.addEventListener('error', reject);
          return;
        }
        const script = document.createElement('script');
        script.id = 'pyodide-cdn-script';
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Pyodide script from CDN'));
        document.head.appendChild(script);
      });
    }

    mainThreadPyodide = await window.loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/'
    });
    return mainThreadPyodide;
  } finally {
    isMainThreadInitializing = false;
  }
}

// Run Python Code
export async function executePythonCode(code, inputStr = '') {
  await initPyodideRuntime();

  // If worker is active, execute through worker
  if (workerInstance) {
    return new Promise((resolve) => {
      const id = ++currentMessageId;
      pendingCallbacks.set(id, (msg) => {
        resolve({
          stdout: msg.stdout || '',
          stderr: msg.stderr || '',
          error: msg.error || null,
          executionTimeMs: msg.executionTimeMs || 0
        });
      });

      workerInstance.postMessage({
        id,
        type: 'run',
        code,
        inputStr
      });
    });
  }

  // Otherwise, execute on main thread
  return runOnMainThread(code, inputStr);
}

// Run Test Cases against Python Code
export async function executePythonTests(code, testCases = [], functionName = null, inputStr = '') {
  await initPyodideRuntime();

  if (workerInstance) {
    return new Promise((resolve) => {
      const id = ++currentMessageId;
      pendingCallbacks.set(id, (msg) => {
        resolve({
          stdout: msg.stdout || '',
          stderr: msg.stderr || '',
          error: msg.error || null,
          totalTests: msg.totalTests || 0,
          passedTests: msg.passedTests || 0,
          allPassed: msg.allPassed || false,
          results: msg.results || [],
          executionTimeMs: msg.executionTimeMs || 0
        });
      });

      workerInstance.postMessage({
        id,
        type: 'test',
        code,
        inputStr,
        testCases,
        functionName
      });
    });
  }

  // Fallback to main thread test execution
  return runTestsOnMainThread(code, testCases, functionName, inputStr);
}

// Stop Running Execution (Terminates current worker instantly and spawns replacement)
export function stopPythonExecution() {
  if (workerInstance) {
    workerInstance.terminate();
    workerInstance = null;
    // Reject any pending callbacks
    pendingCallbacks.forEach((cb) => {
      cb({
        stdout: '',
        stderr: 'Execution stopped by user.',
        error: 'Execution cancelled',
        executionTimeMs: 0,
        totalTests: 0,
        passedTests: 0,
        allPassed: false,
        results: []
      });
    });
    pendingCallbacks.clear();

    // Re-initialize a fresh worker quietly in background
    setTimeout(() => {
      getOrCreateWorker().postMessage({ id: ++currentMessageId, type: 'init' });
    }, 50);

    return true;
  }
  return false;
}

// Main thread fallback implementation
async function runOnMainThread(code, inputStr) {
  const startTime = performance.now();
  const py = mainThreadPyodide;
  if (!py) throw new Error('Main thread Pyodide is not ready.');

  py.globals.set('__STUDYNEST_CODE__', code || '');
  py.globals.set('__STUDYNEST_INPUTS__', inputStr || '');

  const runnerCode = `
import sys
import io
import traceback
import builtins

_cap_out = io.StringIO()
_cap_err = io.StringIO()
_old_out = sys.stdout
_old_err = sys.stderr

sys.stdout = _cap_out
sys.stderr = _cap_err

_raw_inputs = __STUDYNEST_INPUTS__
_input_lines = _raw_inputs.split('\\n') if _raw_inputs else []
_input_idx = 0

def _custom_input(prompt=""):
    global _input_idx
    if prompt:
        sys.stdout.write(str(prompt))
    if _input_idx < len(_input_lines):
        val = _input_lines[_input_idx]
        _input_idx += 1
        return val
    raise EOFError("EOF: End of inputs reached. Please provide values in the Program Input Panel before running.")

builtins.input = _custom_input
_exec_error = None
_user_env = {'__name__': '__main__'}
globals()['_user_env'] = _user_env

try:
    exec(__STUDYNEST_CODE__, _user_env)
except Exception as e:
    _exec_error = str(e)
    traceback.print_exc(file=_cap_err)
finally:
    sys.stdout = _old_out
    sys.stderr = _old_err

_final_out = _cap_out.getvalue()
_final_err = _cap_err.getvalue()
`;

  try {
    await py.runPythonAsync(runnerCode);
    const stdout = py.globals.get('_final_out') || '';
    const stderr = py.globals.get('_final_err') || '';
    const error = py.globals.get('_exec_error') || null;
    const executionTimeMs = Math.round(performance.now() - startTime);

    return { stdout, stderr, error, executionTimeMs };
  } catch (err) {
    const executionTimeMs = Math.round(performance.now() - startTime);
    return {
      stdout: '',
      stderr: err.message || String(err),
      error: err.message || String(err),
      executionTimeMs
    };
  }
}

async function runTestsOnMainThread(code, testCases, functionName, inputStr) {
  const execResult = await runOnMainThread(code, inputStr);
  const py = mainThreadPyodide;
  const evaluatedResults = [];
  let passedCount = 0;

  for (const tc of testCases) {
    if (tc.codeCall) {
      try {
        py.globals.set('__CALL_EXPR__', tc.codeCall);
        await py.runPythonAsync(`
try:
    _res_val = str(eval(__CALL_EXPR__, _user_env))
except Exception as e:
    _res_val = "Error: " + str(e)
`);
        const actual = py.globals.get('_res_val') || '';
        const passed = String(actual).trim().toLowerCase() === String(tc.expected).trim().toLowerCase();
        if (passed) passedCount++;
        evaluatedResults.push({
          name: tc.name,
          call: tc.codeCall,
          expected: tc.expected,
          actual,
          passed
        });
      } catch (e) {
        evaluatedResults.push({
          name: tc.name,
          call: tc.codeCall,
          expected: tc.expected,
          actual: e.message || String(e),
          passed: false
        });
      }
    } else {
      const passed = execResult.stdout.toLowerCase().includes(String(tc.expected).toLowerCase().trim());
      if (passed) passedCount++;
      evaluatedResults.push({
        name: tc.name,
        call: 'Program stdout',
        expected: tc.expected,
        actual: execResult.stdout.trim() || (execResult.error ? `Error: ${execResult.error}` : '(empty output)'),
        passed
      });
    }
  }

  const totalTests = testCases.length;
  return {
    stdout: execResult.stdout,
    stderr: execResult.stderr,
    error: execResult.error,
    totalTests,
    passedTests: passedCount,
    allPassed: totalTests > 0 && passedCount === totalTests,
    results: evaluatedResults,
    executionTimeMs: execResult.executionTimeMs
  };
}
