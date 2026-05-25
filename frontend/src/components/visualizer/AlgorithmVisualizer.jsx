import { useMemo } from 'react'
import { motion } from 'framer-motion'

/**
 * AlgorithmVisualizer
 * Renders animated array bars driven by the current step
 * Props:
 *   array      – current array state (numbers)
 *   step       – current step object { type, indices, pivot, low, high, mid }
 *   maxValue   – max value in array (for bar height normalization)
 *   isRunning  – bool
 */
export default function AlgorithmVisualizer({ array, step, maxValue, isRunning, algorithm }) {
  const barCount = array.length
  const highlightSet = useMemo(() => new Set(step?.indices || []), [step])

  const getBarColor = (idx) => {
    if (!step) return '#1e3a2f'
    const { type, indices = [], pivot, low, high } = step

    if (type === 'found' && indices.includes(idx)) return '#22c55e'
    if (type === 'sorted' && indices.includes(idx)) return '#14532d'
    if (type === 'pivot' && idx === pivot) return '#c084fc'
    if (type === 'place_pivot' && idx === pivot) return '#c084fc'
    if (type === 'swap' && highlightSet.has(idx)) return '#fb923c'
    if (type === 'compare' && highlightSet.has(idx)) return '#fbbf24'
    if (type === 'binary_compare') {
      if (idx === step.mid) return '#fbbf24'
      if (idx >= (low ?? 0) && idx <= (high ?? array.length - 1)) return '#1e4a3a'
      return '#0f1f17'
    }
    if (type === 'divide' && (idx === indices[0] || idx === indices[2])) return '#60a5fa'
    if (type === 'place' && highlightSet.has(idx)) return '#86efac'
    if (type === 'merge_done' && idx >= indices[0] && idx <= indices[1]) return '#166534'
    return '#1e3a2f'
  }

  // Limit display bars for performance
  const displayArray = barCount > 120 ? downsample(array, 120) : array
  const displayMax = maxValue || Math.max(...displayArray, 1)

  return (
    <div className="w-full">
      <div className="flex items-end gap-px w-full" style={{ height: '160px' }}>
        {displayArray.map((val, idx) => {
          const heightPct = Math.max(4, (val / displayMax) * 100)
          const color = barCount <= 120 ? getBarColor(idx) : '#1e3a2f'
          return (
            <motion.div
              key={idx}
              layout
              style={{
                flex: 1,
                height: `${heightPct}%`,
                backgroundColor: color,
                borderRadius: '2px 2px 0 0',
                minWidth: '2px',
                transition: 'background-color 0.08s ease, height 0.1s ease'
              }}
            />
          )
        })}
      </div>

      {/* Step info */}
      <div className="mt-3 flex items-center gap-3 flex-wrap">
        {step && (
          <span className="text-xs font-code px-3 py-1 rounded-full border border-white/10 text-gray-400">
            Step: <span className="text-cyber-400">{step.type?.replace(/_/g, ' ')}</span>
            {step.indices?.length > 0 && (
              <> · idx [{step.indices.slice(0, 3).join(', ')}{step.indices.length > 3 ? '…' : ''}]</>
            )}
          </span>
        )}
        <ColorLegend algorithm={algorithm} />
      </div>
    </div>
  )
}

const ColorLegend = ({ algorithm }) => {
  const items = [
    { color: '#fbbf24', label: 'Comparing' },
    { color: '#fb923c', label: 'Swapping' },
    { color: '#c084fc', label: 'Pivot' },
    { color: '#22c55e', label: 'Found/Done' },
    { color: '#60a5fa', label: 'Range' },
  ].filter(i => {
    if (['linearSearch', 'binarySearch'].includes(algorithm) && ['Swapping', 'Pivot'].includes(i.label)) return false
    if (['bubbleSort'].includes(algorithm) && ['Pivot', 'Range'].includes(i.label)) return false
    return true
  })

  return (
    <div className="flex gap-3 flex-wrap">
      {items.map(({ color, label }) => (
        <div key={label} className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
          <span className="text-gray-500 text-xs">{label}</span>
        </div>
      ))}
    </div>
  )
}

function downsample(arr, targetLen) {
  if (arr.length <= targetLen) return arr
  const result = []
  const step = arr.length / targetLen
  for (let i = 0; i < targetLen; i++) {
    result.push(arr[Math.floor(i * step)])
  }
  return result
}
