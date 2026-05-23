export const COMPLEXITY_COLORS = {
  'O(1)': { text: 'text-cyber-400', bg: 'bg-cyber-400/10', border: 'border-cyber-400/30', hex: '#22c55e', label: 'Constant' },
  'O(log n)': { text: 'text-emerald-300', bg: 'bg-emerald-300/10', border: 'border-emerald-300/30', hex: '#86efac', label: 'Logarithmic' },
  'O(n)': { text: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30', hex: '#fbbf24', label: 'Linear' },
  'O(n log n)': { text: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/30', hex: '#fb923c', label: 'Linearithmic' },
  'O(n²)': { text: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30', hex: '#f87171', label: 'Quadratic' },
  'O(2ⁿ)': { text: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/30', hex: '#c084fc', label: 'Exponential' },
  'O(n!)': { text: 'text-pink-400', bg: 'bg-pink-400/10', border: 'border-pink-400/30', hex: '#f472b6', label: 'Factorial' },
}

export const getComplexityColor = (complexity) => {
  return COMPLEXITY_COLORS[complexity] || COMPLEXITY_COLORS['O(n)']
}

// Generate graph data points for complexity visualization
export const generateGraphData = (maxN = 20) => {
  const data = []
  for (let n = 1; n <= maxN; n++) {
    data.push({
      n,
      'O(1)': 1,
      'O(log n)': Math.log2(n),
      'O(n)': n,
      'O(n log n)': n * Math.log2(n),
      'O(n²)': n * n,
      'O(2ⁿ)': Math.min(Math.pow(2, n), 1000),
    })
  }
  return data
}

export const COMPLEXITY_ORDER = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)', 'O(2ⁿ)', 'O(n!)']

export const getComplexityRank = (complexity) => {
  return COMPLEXITY_ORDER.indexOf(complexity)
}

export const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const SAMPLE_CODES = {
  javascript: {
    'Linear Search': `function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}`,
    'Bubble Sort': `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`,
    'Binary Search': `function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
    'Fibonacci (Recursive)': `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}`,
  },
  python: {
    'Two Sum': `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
    'Merge Sort': `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i]); i += 1
        else:
            result.append(right[j]); j += 1
    result.extend(left[i:]); result.extend(right[j:])
    return result`,
  }
}
