import { motion } from 'framer-motion'

/**
 * TimelineSlider
 * A scrubber bar that lets the user jump to any step in the recorded
 * execution.  Shows current step index, total steps, and step type.
 *
 * Props:
 *   stepIndex   number  – 0-based current step
 *   totalSteps  number
 *   currentStep object  – { type, indices, comparisons, swaps }
 *   disabled    bool
 *   onChange    fn(newIndex)
 */
export default function TimelineSlider({
  stepIndex,
  totalSteps,
  currentStep,
  disabled,
  onChange,
}) {
  if (!totalSteps) return null

  const pct = totalSteps > 1 ? (stepIndex / (totalSteps - 1)) * 100 : 0

  const stepTypeColor = {
    compare:  'text-yellow-400',
    swap:     'text-orange-400',
    sorted:   'text-cyber-400',
    found:    'text-cyber-400',
    pivot:    'text-purple-400',
    active:   'text-blue-400',
    mark:     'text-pink-400',
    set:      'text-teal-400',
  }[currentStep?.type] || 'text-gray-400'

  return (
    <div className="space-y-2">
      {/* Header row */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500 font-code">
          Step{' '}
          <span className="text-white font-bold">{stepIndex + 1}</span>
          {' '}/ {totalSteps}
        </span>

        {currentStep && (
          <span className={`font-code capitalize ${stepTypeColor}`}>
            {currentStep.type?.replace(/_/g, ' ')}
            {currentStep.indices?.length > 0 && (
              <span className="text-gray-600">
                {' '}[{currentStep.indices.slice(0, 3).join(', ')}
                {currentStep.indices.length > 3 ? '…' : ''}]
              </span>
            )}
          </span>
        )}

        <div className="flex items-center gap-3 text-gray-600">
          <span>⚖ {currentStep?.comparisons ?? 0}</span>
          <span>⇄ {currentStep?.swaps ?? 0}</span>
        </div>
      </div>

      {/* Slider */}
      <div className="relative h-6 flex items-center group">
        {/* Track */}
        <div className="absolute inset-x-0 h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-cyber-500/60 rounded-full"
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.05 }}
          />
        </div>

        {/* Native range input on top (invisible but interactive) */}
        <input
          type="range"
          min={0}
          max={Math.max(0, totalSteps - 1)}
          value={stepIndex}
          disabled={disabled}
          onChange={e => onChange(Number(e.target.value))}
          className="absolute inset-x-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          style={{ zIndex: 10 }}
        />

        {/* Custom thumb */}
        <motion.div
          className="absolute w-3 h-3 rounded-full bg-cyber-400 shadow-[0_0_8px_rgba(34,197,94,0.6)] pointer-events-none"
          animate={{ left: `calc(${pct}% - 6px)` }}
          transition={{ duration: 0.05 }}
          style={{ zIndex: 9 }}
        />
      </div>

      {/* Tick marks for key steps (compare/swap transitions) */}
      <div className="relative h-1">
        <div className="absolute inset-0 flex items-center">
          {totalSteps <= 200 && Array.from({ length: totalSteps }).map((_, i) => {
            const tickPct = totalSteps > 1 ? (i / (totalSteps - 1)) * 100 : 0
            return null // only show 5 markers
          })}
          {/* Milestone markers every 10% */}
          {[10,20,30,40,50,60,70,80,90].map(p => (
            <div
              key={p}
              className="absolute h-1 w-px bg-white/5"
              style={{ left: `${p}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
