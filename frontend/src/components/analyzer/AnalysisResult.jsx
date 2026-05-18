import { motion } from 'framer-motion'
import { getComplexityColor } from '../../utils/complexity'
import ComplexityGraph from './ComplexityGraph'

const ComplexityBadge = ({ label, value }) => {
  const colors = getComplexityColor(value)
  return (
    <div className={`glass rounded-xl p-5 border ${colors?.border || 'border-white/10'}`}>
      <p className="text-gray-400 text-xs font-body mb-2 uppercase tracking-wider">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className={`font-display font-bold text-3xl ${colors?.text || 'text-white'}`}>
          {value}
        </span>
        <span className="text-gray-500 text-sm">{colors?.label}</span>
      </div>
    </div>
  )
}

const ScoreBar = ({ score }) => {
  const pct = (score / 10) * 100
  const color = score <= 3 ? '#22c55e' : score <= 5 ? '#fbbf24' : score <= 7 ? '#fb923c' : '#f87171'
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-gray-400">Efficiency Score</span>
        <span className="font-code" style={{ color }}>{score}/10</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
      <div className="flex justify-between text-xs mt-1 text-gray-600">
        <span>Efficient</span>
        <span>Inefficient</span>
      </div>
    </div>
  )
}

export default function AnalysisResult({ result }) {
  if (!result) return null

  const {
    timeComplexity,
    spaceComplexity,
    explanation,
    optimizationSuggestions = [],
    detectedPatterns = [],
    complexityScore = 5
  } = result

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Complexity Badges */}
      <div className="grid grid-cols-2 gap-4">
        <ComplexityBadge label="Time Complexity" value={timeComplexity} />
        <ComplexityBadge label="Space Complexity" value={spaceComplexity} />
      </div>

      {/* Score Bar */}
      <div className="card">
        <ScoreBar score={complexityScore} />
      </div>

      {/* Detected Patterns */}
      {detectedPatterns.length > 0 && (
        <div className="card">
          <h3 className="font-display font-bold text-white text-sm mb-3 uppercase tracking-wider">
            Detected Patterns
          </h3>
          <div className="flex flex-wrap gap-2">
            {detectedPatterns.map((p, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="glass border border-white/10 text-gray-300 text-xs px-3 py-1.5 rounded-full font-code"
              >
                {p}
              </motion.span>
            ))}
          </div>
        </div>
      )}

      {/* Explanation */}
      <div className="card">
        <h3 className="font-display font-bold text-white text-sm mb-3 uppercase tracking-wider">
          Analysis
        </h3>
        <p className="text-gray-300 text-sm leading-relaxed font-body">{explanation}</p>
      </div>

      {/* Graph */}
      <div className="card">
        <ComplexityGraph highlight={timeComplexity} />
      </div>

      {/* Optimization Suggestions */}
      {optimizationSuggestions.length > 0 && (
        <div className="card border-cyber-500/20">
          <h3 className="font-display font-bold text-cyber-400 text-sm mb-4 uppercase tracking-wider">
            ✦ Optimization Suggestions
          </h3>
          <ul className="space-y-3">
            {optimizationSuggestions.map((s, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-3 text-sm"
              >
                <span className="text-cyber-400 mt-0.5 flex-shrink-0">→</span>
                <span className="text-gray-300 leading-relaxed">{s}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  )
}
