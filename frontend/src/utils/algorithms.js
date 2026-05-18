/**
 * algorithms.js
 * Real algorithm implementations that:
 * - Collect animation steps for visualization
 * - Measure actual execution time via performance.now()
 * - Count operations precisely
 */

// ─── Data Generators ──────────────────────────────────────────────────────────

export const generateArray = (size, type = 'random') => {
  const arr = Array.from({ length: size }, (_, i) => i + 1)

  switch (type) {
    case 'random':
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]]
      }
      return arr
    case 'sorted':
      return arr
    case 'reverse':
      return arr.reverse()
    case 'nearly':
      // Sorted but with ~5% elements randomly swapped
      const swaps = Math.max(1, Math.floor(size * 0.05))
      for (let i = 0; i < swaps; i++) {
        const a = Math.floor(Math.random() * size)
        const b = Math.floor(Math.random() * size);
        [arr[a], arr[b]] = [arr[b], arr[a]]
      }
      return arr
    default:
      return arr
  }
}

// ─── Step Types ────────────────────────────────────────────────────────────────
// Each step: { type, indices, found?, pivot?, low?, high?, mid?, array? }

const STEP_LIMIT = 2000 // cap steps for visualization sanity

// ─── Linear Search ─────────────────────────────────────────────────────────────

export const linearSearch = (inputArr, target) => {
  const arr = [...inputArr]
  const steps = []
  let ops = 0
  const t0 = performance.now()

  for (let i = 0; i < arr.length; i++) {
    ops++
    if (steps.length < STEP_LIMIT) {
      steps.push({ type: 'compare', indices: [i], array: [...arr] })
    }
    if (arr[i] === target) {
      if (steps.length < STEP_LIMIT) {
        steps.push({ type: 'found', indices: [i], array: [...arr] })
      }
      break
    }
  }

  const time = performance.now() - t0
  return { steps, time, ops, memory: arr.length * 8 }
}

// ─── Binary Search ──────────────────────────────────────────────────────────────

export const binarySearch = (inputArr, target) => {
  const arr = [...inputArr].sort((a, b) => a - b) // must be sorted
  const steps = []
  let ops = 0
  let low = 0, high = arr.length - 1
  const t0 = performance.now()

  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    ops++
    if (steps.length < STEP_LIMIT) {
      steps.push({ type: 'binary_compare', indices: [mid], low, high, mid, array: [...arr] })
    }
    if (arr[mid] === target) {
      if (steps.length < STEP_LIMIT) {
        steps.push({ type: 'found', indices: [mid], array: [...arr] })
      }
      break
    } else if (arr[mid] < target) {
      low = mid + 1
    } else {
      high = mid - 1
    }
  }

  const time = performance.now() - t0
  return { steps, time, ops, memory: arr.length * 8 + 24 }
}

// ─── Bubble Sort ────────────────────────────────────────────────────────────────

export const bubbleSort = (inputArr) => {
  const arr = [...inputArr]
  const steps = []
  let ops = 0
  const n = arr.length
  const t0 = performance.now()

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      ops++
      if (steps.length < STEP_LIMIT) {
        steps.push({ type: 'compare', indices: [j, j + 1], array: [...arr] })
      }
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
        ops++
        if (steps.length < STEP_LIMIT) {
          steps.push({ type: 'swap', indices: [j, j + 1], array: [...arr] })
        }
      }
    }
    if (steps.length < STEP_LIMIT) {
      steps.push({ type: 'sorted', indices: [n - 1 - i], array: [...arr] })
    }
  }

  const time = performance.now() - t0
  return { steps, time, ops, memory: arr.length * 8 + 32 }
}

// ─── Merge Sort ─────────────────────────────────────────────────────────────────

export const mergeSort = (inputArr) => {
  const arr = [...inputArr]
  const steps = []
  let ops = 0
  const t0 = performance.now()

  const merge = (a, left, mid, right) => {
    const L = a.slice(left, mid + 1)
    const R = a.slice(mid + 1, right + 1)
    let i = 0, j = 0, k = left
    while (i < L.length && j < R.length) {
      ops++
      if (steps.length < STEP_LIMIT) {
        steps.push({ type: 'compare', indices: [left + i, mid + 1 + j], array: [...a] })
      }
      if (L[i] <= R[j]) { a[k++] = L[i++] }
      else { a[k++] = R[j++] }
      if (steps.length < STEP_LIMIT) {
        steps.push({ type: 'place', indices: [k - 1], array: [...a] })
      }
    }
    while (i < L.length) { a[k++] = L[i++]; ops++ }
    while (j < R.length) { a[k++] = R[j++]; ops++ }
  }

  const sort = (a, left, right) => {
    if (left >= right) return
    const mid = Math.floor((left + right) / 2)
    if (steps.length < STEP_LIMIT) {
      steps.push({ type: 'divide', indices: [left, mid, right], array: [...a] })
    }
    sort(a, left, mid)
    sort(a, mid + 1, right)
    merge(a, left, mid, right)
    if (steps.length < STEP_LIMIT) {
      steps.push({ type: 'merge_done', indices: [left, right], array: [...a] })
    }
  }

  sort(arr, 0, arr.length - 1)
  const time = performance.now() - t0
  return { steps, time, ops, memory: arr.length * 16 + 64 } // extra for temp arrays
}

// ─── Quick Sort ──────────────────────────────────────────────────────────────────

export const quickSort = (inputArr) => {
  const arr = [...inputArr]
  const steps = []
  let ops = 0
  const t0 = performance.now()

  const partition = (a, low, high) => {
    const pivot = a[high]
    let i = low - 1
    if (steps.length < STEP_LIMIT) {
      steps.push({ type: 'pivot', indices: [high], pivot: high, array: [...a] })
    }
    for (let j = low; j < high; j++) {
      ops++
      if (steps.length < STEP_LIMIT) {
        steps.push({ type: 'compare', indices: [j, high], pivot: high, array: [...a] })
      }
      if (a[j] <= pivot) {
        i++
        ;[a[i], a[j]] = [a[j], a[i]]
        ops++
        if (steps.length < STEP_LIMIT) {
          steps.push({ type: 'swap', indices: [i, j], pivot: high, array: [...a] })
        }
      }
    }
    ;[a[i + 1], a[high]] = [a[high], a[i + 1]]
    if (steps.length < STEP_LIMIT) {
      steps.push({ type: 'place_pivot', indices: [i + 1], pivot: i + 1, array: [...a] })
    }
    return i + 1
  }

  const sort = (a, low, high) => {
    if (low >= high) return
    const pi = partition(a, low, high)
    sort(a, low, pi - 1)
    sort(a, pi + 1, high)
  }

  sort(arr, 0, arr.length - 1)
  const time = performance.now() - t0
  return { steps, time, ops, memory: arr.length * 8 + Math.log2(arr.length) * 40 }
}

// ─── Benchmark Runner (no steps, pure timing) ────────────────────────────────────

export const benchmarkAlgorithm = (algoName, inputArr) => {
  const arr = [...inputArr]
  const target = arr[Math.floor(arr.length / 2)] // for search algos

  const t0 = performance.now()
  let ops = 0

  switch (algoName) {
    case 'linearSearch': {
      for (let i = 0; i < arr.length; i++) {
        ops++
        if (arr[i] === target) break
      }
      break
    }
    case 'binarySearch': {
      const sorted = [...arr].sort((a, b) => a - b)
      let lo = 0, hi = sorted.length - 1
      while (lo <= hi) {
        ops++
        const mid = (lo + hi) >> 1
        if (sorted[mid] === target) break
        else if (sorted[mid] < target) lo = mid + 1
        else hi = mid - 1
      }
      break
    }
    case 'bubbleSort': {
      const a = [...arr]
      for (let i = 0; i < a.length - 1; i++) {
        for (let j = 0; j < a.length - i - 1; j++) {
          ops++
          if (a[j] > a[j + 1]) { [a[j], a[j + 1]] = [a[j + 1], a[j]]; ops++ }
        }
      }
      break
    }
    case 'mergeSort': {
      const mergeFn = (a) => {
        if (a.length <= 1) return a
        const mid = Math.floor(a.length / 2)
        const L = mergeFn(a.slice(0, mid))
        const R = mergeFn(a.slice(mid))
        const result = []
        let i = 0, j = 0
        while (i < L.length && j < R.length) {
          ops++
          result.push(L[i] <= R[j] ? L[i++] : R[j++])
        }
        return result.concat(L.slice(i)).concat(R.slice(j))
      }
      mergeFn([...arr])
      break
    }
    case 'quickSort': {
      const a = [...arr]
      const qSort = (lo, hi) => {
        if (lo >= hi) return
        const pivot = a[hi]
        let i = lo - 1
        for (let j = lo; j < hi; j++) {
          ops++
          if (a[j] <= pivot) { i++; [a[i], a[j]] = [a[j], a[i]] }
        }
        ;[a[i + 1], a[hi]] = [a[hi], a[i + 1]]
        qSort(lo, i)
        qSort(i + 2, hi)
      }
      qSort(0, a.length - 1)
      break
    }
    default:
      break
  }

  return {
    time: performance.now() - t0,
    ops,
    memory: arr.length * 8
  }
}

// ─── Algorithm Metadata ────────────────────────────────────────────────────────

export const ALGO_META = {
  linearSearch: {
    label: 'Linear Search',
    timeComplexities: { best: 'O(1)', average: 'O(n)', worst: 'O(n)' },
    spaceComplexity: 'O(1)',
    color: '#22c55e',
    description: 'Sequentially checks each element until the target is found.',
    category: 'search'
  },
  binarySearch: {
    label: 'Binary Search',
    timeComplexities: { best: 'O(1)', average: 'O(log n)', worst: 'O(log n)' },
    spaceComplexity: 'O(1)',
    color: '#86efac',
    description: 'Divides the sorted array in half repeatedly to find the target.',
    category: 'search'
  },
  bubbleSort: {
    label: 'Bubble Sort',
    timeComplexities: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
    spaceComplexity: 'O(1)',
    color: '#fbbf24',
    description: 'Repeatedly swaps adjacent elements that are in the wrong order.',
    category: 'sort'
  },
  mergeSort: {
    label: 'Merge Sort',
    timeComplexities: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
    spaceComplexity: 'O(n)',
    color: '#fb923c',
    description: 'Divides array into halves, sorts them, and merges the result.',
    category: 'sort'
  },
  quickSort: {
    label: 'Quick Sort',
    timeComplexities: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)' },
    spaceComplexity: 'O(log n)',
    color: '#c084fc',
    description: 'Picks a pivot and partitions the array around it recursively.',
    category: 'sort'
  }
}

// ─── Theoretical Curve Generators ─────────────────────────────────────────────

export const theoreticalPoint = (n, notation) => {
  const SCALE = 0.0001 // scale to match ms
  switch (notation) {
    case 'O(1)': return SCALE * 1
    case 'O(log n)': return SCALE * Math.log2(n)
    case 'O(n)': return SCALE * n
    case 'O(n log n)': return SCALE * n * Math.log2(n)
    case 'O(n²)': return SCALE * n * n
    default: return SCALE * n
  }
}
