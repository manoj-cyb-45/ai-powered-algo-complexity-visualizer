import { motion } from 'framer-motion'

const SPEEDS = [
  { label: '0.25×', ms: 400 },
  { label: '0.5×',  ms: 200 },
  { label: '1×',    ms: 90  },
  { label: '2×',    ms: 35  },
  { label: '4×',    ms: 12  },
  { label: 'Max',   ms: 0   },
]

/**
 * ExecutionControls
 * Props:
 *   isRunning   bool
 *   isPaused    bool
 *   hasSteps    bool  – whether steps have been generated
 *   speed       number – index into SPEEDS
 *   onRun       fn
 *   onPause     fn
 *   onStop      fn
 *   onReplay    fn
 *   onReset     fn
 *   onSpeedChange fn(speedIndex)
 */
export default function ExecutionControls({
  isRunning,
  isPaused,
  hasSteps,
  speed,
  onRun,
  onPause,
  onStop,
  onReplay,
  onReset,
  onSpeedChange,
}) {
  return (
    <div className="space-y-3">
      {/* Primary action buttons */}
      <div className="flex gap-2">
        {!isRunning ? (
          <>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={onRun}
              className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5 text-sm"
            >
              ▶ Run
            </motion.button>

            {hasSteps && (
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={onReplay}
                className="btn-secondary px-4 py-2.5 text-sm flex items-center gap-1.5"
                title="Replay from step 1"
              >
                ↺ Replay
              </motion.button>
            )}

            <button
              onClick={onReset}
              className="px-3 py-2.5 glass border border-white/10 text-gray-400 hover:text-white rounded-lg text-sm transition-all"
              title="Reset array"
            >
              ⊘
            </button>
          </>
        ) : (
          <>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={onPause}
              className="btn-secondary flex-1 py-2.5 text-sm"
            >
              {isPaused ? '▶ Resume' : '⏸ Pause'}
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={onStop}
              className="px-4 py-2.5 glass border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg text-sm transition-all"
            >
              ■ Stop
            </motion.button>
          </>
        )}
      </div>

      {/* Speed selector */}
      <div>
        <p className="text-gray-500 text-xs mb-1.5 uppercase tracking-wider">Playback Speed</p>
        <div className="flex gap-1">
          {SPEEDS.map((s, i) => (
            <button
              key={s.label}
              onClick={() => onSpeedChange(i)}
              disabled={isRunning}
              className={`flex-1 py-1.5 text-xs rounded-lg border transition-all disabled:opacity-40 ${
                speed === i
                  ? 'bg-cyber-500/15 border-cyber-500/30 text-cyber-400 font-bold'
                  : 'glass border-white/5 text-gray-400 hover:border-white/20'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export { SPEEDS }
