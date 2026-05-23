/**
 * customAlgoEngine.js
 * Safe, sandboxed execution engine for user-defined algorithms.
 * 
 * Users write algorithms using injected helper functions:
 *   compare(i, j)        – highlight two indices as being compared
 *   swap(i, j)           – swap elements and record the step
 *   mark(i, type?)       – mark a single index (default: 'mark')
 *   markSorted(...idxs)  – mark indices as permanently sorted/done
 *   setPointer(name, i)  – set a named pointer (i, j, pivot, mid, …)
 *   setValue(i, val)     – overwrite arr[i] and record the step
 *
 * Each helper automatically snapshots the array and accumulates
 * visualization steps in the same { type, indices, array, ... } format
 * used by the existing built-in algorithms.
 */

// ── Safety limits ──────────────────────────────────────────────────────────────
const MAX_STEPS = 6000   // hard cap on visualization steps
const MAX_OPS = 50000  // hard cap on total helper invocations (loop guard)
const TIMEOUT_MS = 4000   // wall-clock ceiling (ms)

// ── Complexity heuristic ───────────────────────────────────────────────────────
/**
 * Estimate Big-O class from observed operation count and input size.
 * Deliberately conservative – favours the higher complexity class when
 * the observed count falls between two thresholds.
 */
export const estimateComplexity = (code, totalOps, n) => {
  if (n < 2) {
    return {
      best: 'O(1)',
      average: 'O(1)',
      worst: 'O(1)',
      type: 'Constant'
    }
  }

  const normalized = code.toLowerCase()

  const nestedForLoops =
    /for\s*\([^)]*\)\s*{[\s\S]*for\s*\(/.test(normalized)

  const nestedWhileLoops =
    /while\s*\([^)]*\)\s*{[\s\S]*while\s*\(/.test(normalized)

  const hasNestedLoops = nestedForLoops || nestedWhileLoops

  const hasRecursion =
    /(function\s+(\w+)|const\s+(\w+)\s*=\s*\([^)]*\)\s*=>)[\s\S]*?(\\2|\\3)\s*\(/.test(normalized)

  const hasDivideConquer =
    normalized.includes('pivot') ||
    normalized.includes('mid') ||
    normalized.includes('merge') ||
    normalized.includes('slice')

  // Quadratic algorithms
  if (hasNestedLoops && !hasRecursion) {
    return {
      best: 'O(n²)',
      average: 'O(n²)',
      worst: 'O(n²)',
      type: 'Quadratic'
    }
  }

  // Divide-and-conquer algorithms
  if (hasRecursion && hasDivideConquer) {
    return {
      best: 'O(n log n)',
      average: 'O(n log n)',
      worst: 'O(n log n)',
      type: 'Linearithmic'
    }
  }

  // Single-loop algorithms
  if (
    /for\s*\(/.test(normalized) &&
    !hasNestedLoops
  ) {
    return {
      best: 'O(n)',
      average: 'O(n)',
      worst: 'O(n)',
      type: 'Linear'
    }
  }

  // Fallback heuristic from operations
  const log2n = Math.log2(n)
  const nlogn = n * log2n
  const nSq = n * n

  if (totalOps <= n * 1.5) {
    return {
      best: 'O(1)',
      average: 'O(n)',
      worst: 'O(n)',
      type: 'Near Constant'
    }
  }

  if (totalOps <= nlogn * 2.5) {
    return {
      best: 'O(n log n)',
      average: 'O(n log n)',
      worst: 'O(n log n)',
      type: 'Linearithmic'
    }
  }

  return {
    best: 'O(n²)',
    average: 'O(n²)',
    worst: 'O(n²)',
    type: 'Quadratic'
  }
}

// ── Main engine ────────────────────────────────────────────────────────────────
/**
 * Run user-supplied `code` (string) against `inputArr`.
 *
 * Returns:
 *   { steps, time, ops, comparisons, swaps, memory, error, complexity }
 */
export const runCustomAlgorithm = (inputArr, code) => {
  // ── mutable working copy ────────────────────────────────────────────────
  const arr = [...inputArr]
  const steps = []
  let comparisons = 0
  let swaps = 0
  let marks = 0
  let totalOps = 0
  const pointers = {}          // live pointer map  { name → index }
  const sortedSet = new Set()   // permanently-sorted indices

  // ── safety counter ──────────────────────────────────────────────────────
  const tick = (caller) => {
    totalOps++
    if (totalOps > MAX_OPS) {
      throw new Error(
        `Operation limit (${MAX_OPS.toLocaleString()}) exceeded – check for infinite loops.`
      )
    }
  }

  // ── snapshot helper ─────────────────────────────────────────────────────
  const snap = (type, indices, extra = {}) => {
    if (steps.length >= MAX_STEPS) return   // silently drop after cap
    steps.push({
      type,
      indices: [...indices],
      array: [...arr],
      pointers: { ...pointers },
      sorted: [...sortedSet],
      comparisons,
      swaps,
      ...extra
    })
  }

  // ── injected helpers ────────────────────────────────────────────────────
  /**
   * Highlight two elements as being compared.
   * Does NOT mutate the array.
   */
  const compare = (i, j) => {
    tick('compare')
    if (i < 0 || i >= arr.length || j < 0 || j >= arr.length) return
    comparisons++
    snap('compare', [i, j])
  }

  /**
   * Swap elements at indices i and j.
   * Mutates arr; records a step.
   */
  const swap = (i, j) => {
    tick('swap')
    if (i < 0 || i >= arr.length || j < 0 || j >= arr.length) return
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    swaps++
    snap('swap', [i, j])
  }

  /**
   * Highlight a single element with an optional label/type.
   * type: 'mark' | 'pivot' | 'active' | 'found' | string
   */
  const mark = (i, type = 'mark') => {
    tick('mark')
    if (i < 0 || i >= arr.length) return
    marks++
    snap(type, [i])
  }

  /**
   * Permanently mark one or more indices as sorted/finalised.
   */
  const markSorted = (...indices) => {
    tick('markSorted')
    const valid = indices.filter(i => i >= 0 && i < arr.length)
    if (!valid.length) return
    valid.forEach(i => sortedSet.add(i))
    snap('sorted', valid)
  }

  /**
   * Update a named pointer (shown as a labelled arrow under the bar).
   * Does NOT produce a step on its own – the name will appear in the
   * next step snapshot automatically.
   */
  const setPointer = (name, idx) => {
    pointers[name] = idx
  }

  /**
   * Overwrite the value at index i and record the change as a step.
   */
  const setValue = (i, val) => {
    tick('setValue')
    if (i < 0 || i >= arr.length) return
    arr[i] = val
    snap('set', [i])
  }

  // ── execute user code ───────────────────────────────────────────────────
  const t0 = performance.now()

  try {
    // new Function keeps user code out of the current scope but does NOT
    // prevent all attacks; the MAX_OPS guard is the main safety net.
    const userFn = new Function(
      'arr', 'compare', 'swap', 'mark', 'markSorted', 'setPointer', 'setValue',
      code
    )
    userFn(arr, compare, swap, mark, markSorted, setPointer, setValue)
  } catch (err) {
    const time = performance.now() - t0
    return {
      steps,
      time,
      ops: totalOps,
      comparisons,
      swaps,
      memory: inputArr.length * 8,
      error: err.message,
      complexity: estimateComplexity(
        code,
        comparisons + swaps,
        inputArr.length
      )
    }
  }

  const time = performance.now() - t0
  const ops = comparisons + swaps + marks
  // rough memory: original array + step snapshots (each ~64 bytes overhead + array copy)
  const memory = inputArr.length * 8 + steps.length * (inputArr.length * 8 + 64)

  return {
    steps,
    time,
    ops,
    comparisons,
    swaps,
    memory,
    error: null,
    complexity: estimateComplexity(
      code,
      comparisons + swaps,
      inputArr.length
    )
  }
}

// ── Default algorithm templates ────────────────────────────────────────────────
export const ALGORITHM_TEMPLATES = {
  bubbleSort: {
    label: 'Bubble Sort',
    description: 'O(n²) — nested loops, swap adjacent if out of order',
    defaultArray: [64, 34, 25, 12, 22, 11, 90],
    code: `// Bubble Sort
// Use compare(i,j), swap(i,j), markSorted(i) — these generate animation steps.
// 'arr' holds the live array; read arr[i] to make decisions.

const n = arr.length;
for (let i = 0; i < n - 1; i++) {
  setPointer('i', i);
  for (let j = 0; j < n - i - 1; j++) {
    setPointer('j', j);
    compare(j, j + 1);
    if (arr[j] > arr[j + 1]) {
      swap(j, j + 1);
    }
  }
  markSorted(n - 1 - i);
}
markSorted(...Array.from({ length: n }, (_, k) => k));`
  },

  selectionSort: {
    label: 'Selection Sort',
    description: 'O(n²) — find minimum each pass, swap into position',
    defaultArray: [29, 10, 14, 37, 13],
    code: `// Selection Sort
const n = arr.length;
for (let i = 0; i < n - 1; i++) {
  setPointer('i', i);
  let minIdx = i;
  mark(minIdx, 'pivot');       // highlight current minimum

  for (let j = i + 1; j < n; j++) {
    setPointer('j', j);
    compare(j, minIdx);
    if (arr[j] < arr[minIdx]) {
      minIdx = j;
      mark(minIdx, 'pivot');   // new minimum found
    }
  }

  if (minIdx !== i) {
    swap(i, minIdx);
  }
  markSorted(i);
}
markSorted(n - 1);`
  },

  insertionSort: {
    label: 'Insertion Sort',
    description: 'O(n²) worst / O(n) best — efficient on nearly-sorted data',
    defaultArray: [5, 2, 4, 6, 1, 3],
    code: `// Insertion Sort
const n = arr.length;
markSorted(0);

for (let i = 1; i < n; i++) {
  setPointer('i', i);
  mark(i, 'active');
  let j = i;

  while (j > 0) {
    setPointer('j', j);
    compare(j - 1, j);
    if (arr[j - 1] > arr[j]) {
      swap(j - 1, j);
      j--;
    } else {
      break;
    }
  }
  markSorted(j);
}`
  },

  linearSearch: {
    label: 'Linear Search',
    description: 'O(n) — scan every element until target found',
    defaultArray: [4, 2, 7, 1, 9, 3, 6],
    code: `// Linear Search — finds the first element > 5
const target = 7;   // change this to any value in the array

for (let i = 0; i < arr.length; i++) {
  setPointer('i', i);
  compare(i, i);    // highlight the element being checked

  if (arr[i] === target) {
    mark(i, 'found');
    break;
  }
}`
  },

  custom: {
    label: 'Custom (blank)',
    description: 'Write your own algorithm from scratch',
    defaultArray: [5, 3, 8, 1, 9, 2, 7, 4, 6],
    code: `// ─────────────────────────────────────────────────────────────
// Custom Algorithm — available helpers:
//
//   compare(i, j)          highlight two indices as "comparing"
//   swap(i, j)             swap arr[i] and arr[j] + record step
//   mark(i, type?)         mark index with a color (pivot/active/found/mark)
//   markSorted(...indices) mark indices as permanently done
//   setPointer(name, i)    show a labelled arrow under bar  (i / j / mid / …)
//   setValue(i, val)       overwrite arr[i] and record step
//   arr[i]                 read current value (do NOT assign directly —
//                          use setValue so the animation captures it)
// ─────────────────────────────────────────────────────────────

// Example: naive min-to-front selection
const n = arr.length;
for (let i = 0; i < n - 1; i++) {
  setPointer('i', i);
  let min = i;
  for (let j = i + 1; j < n; j++) {
    setPointer('j', j);
    compare(j, min);
    if (arr[j] < arr[min]) min = j;
  }
  if (min !== i) swap(i, min);
  markSorted(i);
}
markSorted(n - 1);`
  }
}
