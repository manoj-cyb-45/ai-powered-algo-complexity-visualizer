import { motion } from 'framer-motion'
import { getComplexityColor } from '../../utils/complexity'

export default function StatsPanel({ stats, algorithm, caseType }) {
  if (!stats) return null

  const { time, ops, memory, timeComplexity, spaceComplexity } = stats
  const tc = getComplexityColor(timeComplexity)
  const sc = getComplexityColor(spaceComplexity)

  const metrics = [
    {
      label: 'Execution Time',
      value: time < 0.01 ? `${(time * 1000).toFixed(2)} µs` : `${time.toFixed(4)} ms`,
      icon: '⏱',
      color: 'text-cyber-400'
    },
    {
      label: 'Operations',
      value: ops >= 1_000_000 ? `${(ops / 1_000_000).toFixed(2)}M` : ops >= 1000 ? `${(ops / 1000).toFixed(1)}K` : ops.toLocaleString(),
      icon: '⚙',
      color: 'text-yellow-400'
    },
    {
      label: 'Memory (est.)',
      value: memory >= 1024 * 1024 ? `${(memory / 1024 / 1024).toFixed(2)} MB` : `${(memory / 1024).toFixed(2)} KB`,
      icon: '◫',
      color: 'text-blue-400'
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Metric Cards */}
      <div className="grid grid-cols-3 gap-3">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.07 }}
            className="glass rounded-xl p-3 border border-white/5 text-center"
          >
            <p className="text-lg mb-1">{m.icon}</p>
            <p className={`font-code font-bold text-base ${m.color}`}>{m.value}</p>
            <p className="text-gray-600 text-xs mt-0.5">{m.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Complexity Badges */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`glass rounded-xl p-3 border ${tc?.border || 'border-white/10'}`}>
          <p className="text-gray-500 text-xs mb-1">Time Complexity</p>
          <p className={`font-display font-bold text-xl ${tc?.text}`}>{timeComplexity}</p>
          <p className="text-gray-600 text-xs mt-0.5">{tc?.label}</p>
        </div>
        <div className={`glass rounded-xl p-3 border ${sc?.border || 'border-white/10'}`}>
          <p className="text-gray-500 text-xs mb-1">Space Complexity</p>
          <p className={`font-display font-bold text-xl ${sc?.text}`}>{spaceComplexity}</p>
          <p className="text-gray-600 text-xs mt-0.5">{sc?.label}</p>
        </div>
      </div>

      {/* Case indicator */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-gray-500">Case analyzed:</span>
        <span className={`px-2 py-0.5 rounded-full border font-code ${
          caseType === 'best' ? 'text-cyber-400 border-cyber-400/30 bg-cyber-400/10' :
          caseType === 'worst' ? 'text-red-400 border-red-400/30 bg-red-400/10' :
          'text-yellow-400 border-yellow-400/30 bg-yellow-400/10'
        }`}>
          {caseType} case
        </span>
      </div>
    </motion.div>
  )
}
