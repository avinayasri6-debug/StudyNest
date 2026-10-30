// Web Worker for isolated, non-blocking Python execution via Pyodide WebAssembly
// This worker allows user code to execute off the main UI thread and enables instant termination upon clicking "Stop".

/* global importScripts, loadPyodide */

let pyodideInstance = null;
let isInitializing = false;

async function getPyodide() {
  if (pyodideInstance) return pyodideInstance;
  if (!isInitializing) {
    isInitializing = true;
    importScripts('https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js');
    pyodideInstance = await loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/'
    });
    isInitializing = false;
  }
  return pyodideInstance;
}

self.onmessage = async (event) => {
  const { id, type, code, inputStr, testCases } = event.data || {};

  if (type === 'init') {
    try {
      await getPyodide();
      self.postMessage({ id, type: 'init_success' });
    } catch (err) {
      self.postMessage({
        id,
        type: 'init_error',
        error: err ? err.message || String(err) : 'Failed to load Pyodide from CDN'
      });
    }
    return;
  }

  if (type === 'run') {
    const startTime = performance.now();
    try {
      const py = await getPyodide();

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

      await py.runPythonAsync(runnerCode);

      const stdout = py.globals.get('_final_out') || '';
      const stderr = py.globals.get('_final_err') || '';
      const execError = py.globals.get('_exec_error') || null;
      const executionTimeMs = Math.round(performance.now() - startTime);

      self.postMessage({
        id,
        type: 'run_result',
        stdout,
        stderr,
        error: execError,
        executionTimeMs
      });
    } catch (err) {
      const executionTimeMs = Math.round(performance.now() - startTime);
      self.postMessage({
        id,
        type: 'run_result',
        stdout: '',
        stderr: err ? err.message || String(err) : 'Execution error',
        error: err ? err.message || String(err) : 'Execution error',
        executionTimeMs
      });
    }
    return;
  }

  if (type === 'test') {
    const startTime = performance.now();
    try {
      const py = await getPyodide();

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
    raise EOFError("EOF: End of inputs reached.")

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

      await py.runPythonAsync(runnerCode);

      const stdout = py.globals.get('_final_out') || '';
      const stderr = py.globals.get('_final_err') || '';
      const execError = py.globals.get('_exec_error') || null;

      // Evaluate test cases
      const evaluatedResults = [];
      let passedCount = 0;

      if (Array.isArray(testCases)) {
        for (const tc of testCases) {
          if (tc.codeCall) {
            // Function test case: evaluate python expression inside _user_env
            try {
              py.globals.set('__CALL_EXPR__', tc.codeCall);
              const testCallScript = `
try:
    _res_val = str(eval(__CALL_EXPR__, _user_env))
except Exception as e:
    _res_val = "Error: " + str(e)
`;
              await py.runPythonAsync(testCallScript);
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
            } catch (evalErr) {
              evaluatedResults.push({
                name: tc.name,
                call: tc.codeCall,
                expected: tc.expected,
                actual: evalErr ? evalErr.message || String(evalErr) : 'Evaluation failed',
                passed: false
              });
            }
          } else {
            // Output test case: compare stdout against expected value
            const passed = stdout.toLowerCase().includes(String(tc.expected).toLowerCase().trim());
            if (passed) passedCount++;
            evaluatedResults.push({
              name: tc.name,
              call: 'Program stdout',
              expected: tc.expected,
              actual: stdout.trim() || (execError ? `Error: ${execError}` : '(empty output)'),
              passed
            });
          }
        }
      }

      const totalTests = testCases ? testCases.length : 0;
      const allPassed = totalTests > 0 && passedCount === totalTests;
      const executionTimeMs = Math.round(performance.now() - startTime);

      self.postMessage({
        id,
        type: 'test_result',
        stdout,
        stderr,
        error: execError,
        totalTests,
        passedTests: passedCount,
        allPassed,
        results: evaluatedResults,
        executionTimeMs
      });
    } catch (err) {
      const executionTimeMs = Math.round(performance.now() - startTime);
      self.postMessage({
        id,
        type: 'test_result',
        stdout: '',
        stderr: err ? err.message || String(err) : 'Test evaluation failed',
        error: err ? err.message || String(err) : 'Test evaluation failed',
        totalTests: testCases ? testCases.length : 0,
        passedTests: 0,
        allPassed: false,
        results: (testCases || []).map((tc) => ({
          name: tc.name,
          call: tc.codeCall || 'Execution',
          expected: tc.expected,
          actual: `Runtime Error: ${err.message || String(err)}`,
          passed: false
        })),
        executionTimeMs
      });
    }
  }
};
