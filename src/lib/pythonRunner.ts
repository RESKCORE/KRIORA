declare global {
  interface Window {
    pyodide?: any;
    loadPyodide?: any;
  }
}

let pyodidePromise: Promise<any> | null = null;

// Share a single Pyodide instance with the whole app (mirrors PythonCompiler's loader).
export function getPyodideInstance(): Promise<any> {
  if (window.pyodide) return Promise.resolve(window.pyodide);
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      if (!document.getElementById("pyodide-script")) {
        const script = document.createElement("script");
        script.id = "pyodide-script";
        script.src = "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js";
        document.head.appendChild(script);
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      }
      const py = await window.loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/",
      });
      window.pyodide = py;
      return py;
    })();
  }
  return pyodidePromise;
}

export const DEFAULT_EXECUTION_TIMEOUT_MS = 6000;

// Run student code with the given stdin, capture stdout/error.
// Features execution timeout watchdog to prevent browser freezing on infinite loops.
export async function runPythonWithStdin(
  code: string,
  stdin: string,
  timeoutMs: number = DEFAULT_EXECUTION_TIMEOUT_MS
): Promise<{ stdout: string; stderr: string; error: string | null }> {
  try {
    const py = await getPyodideInstance();
    const stdinLines = stdin ? stdin.split("\n") : [];
    const stdinJson = JSON.stringify(stdinLines);
    const runnerScript = `
import sys, io, json

class StdinMock:
    def __init__(self, lines):
        self.lines = lines
        self.idx = 0
    def readline(self):
        if self.idx < len(self.lines):
            val = self.lines[self.idx] + "\\n"
            self.idx += 1
            return val
        return ""

sys.stdin = StdinMock(${stdinJson})
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()

exec_err = None
try:
    exec(${JSON.stringify(code)}, {})
except Exception as e:
    import traceback
    exec_err = traceback.format_exc()

std_out_val = sys.stdout.getvalue()
std_err_val = sys.stderr.getvalue()
if exec_err:
    std_err_val = (std_err_val + "\\n" if std_err_val else "") + exec_err

json.dumps({"stdout": std_out_val, "stderr": std_err_val, "error": exec_err})
`;
    const execPromise = py.runPythonAsync(runnerScript);
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Execution timed out (exceeded ${timeoutMs}ms limit). Check for infinite loops or blocking operations.`));
      }, timeoutMs);
    });

    const resultJsonStr = await Promise.race([execPromise, timeoutPromise]);
    const result = JSON.parse(resultJsonStr);
    return {
      stdout: result.stdout || "",
      stderr: result.stderr || "",
      error: result.error || null,
    };
  } catch (err: any) {
    return {
      stdout: "",
      stderr: err?.message || "Python execution failed in Pyodide WASM environment.",
      error: err?.message || "Execution error",
    };
  }
}

// Tolerant-but-strict output comparison: normalize CRLF, trim trailing
// whitespace per line and the final newline, so "  Ravi \n" == "Ravi".
export function normalizeOutput(s: string): string {
  return s
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trimEnd();
}
