import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { COMPLEXITY_COLORS } from '../utils/complexity'

const complexityData = [
  { notation: 'O(1)', name: 'Constant', example: 'Array access, hash lookup', good: true },
  { notation: 'O(log n)', name: 'Logarithmic', example: 'Binary search, balanced BST', good: true },
  { notation: 'O(n)', name: 'Linear', example: 'Linear search, single loop', good: true },
  { notation: 'O(n log n)', name: 'Linearithmic', example: 'Merge sort, heap sort', good: false },
  { notation: 'O(n²)', name: 'Quadratic', example: 'Bubble sort, nested loops', good: false },
  { notation: 'O(2ⁿ)', name: 'Exponential', example: 'Naive Fibonacci, subset problems', good: false },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-void-900 px-6 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Back */}
        <Link to="/" className="text-gray-400 hover:text-white text-sm mb-8 inline-flex items-center gap-2 transition-colors">
          ← Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="font-display font-bold text-4xl text-white mb-4">
            About <span className="gradient-text">AlgoLens</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed max-w-2xl">
            AlgoLens is an AI-powered tool that helps developers understand the time and space complexity
            of their algorithms using natural language analysis, visual graphs, and optimization suggestions.
          </p>
        </motion.div>

        {/* Big-O Reference */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="font-display font-bold text-2xl text-white mb-6">Big-O Complexity Reference</h2>
          <div className="space-y-3">
            {complexityData.map((c, i) => {
              const colors = COMPLEXITY_COLORS[c.notation]
              return (
                <motion.div
                  key={c.notation}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.07 }}
                  className="glass rounded-xl p-5 border border-white/5 flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span
                      className="font-code font-bold text-lg w-28 flex-shrink-0"
                      style={{ color: colors?.hex }}
                    >
                      {c.notation}
                    </span>
                    <div>
                      <p className="text-white font-medium text-sm">{c.name}</p>
                      <p className="text-gray-500 text-xs">{c.example}</p>
                    </div>
                  </div>
                  <span className={`ml-auto text-xs px-3 py-1 rounded-full flex-shrink-0 ${
                    c.good
                      ? 'bg-cyber-500/10 text-cyber-400 border border-cyber-500/20'
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {c.good ? '✓ Efficient' : '⚠ Caution'}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Tech Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="font-display font-bold text-2xl text-white mb-6">Tech Stack</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'React', desc: 'Frontend UI' },
              { label: 'Node.js', desc: 'Backend API' },
              { label: 'MongoDB', desc: 'Database' },
              { label: 'OpenRouter', desc: 'AI Analysis' },
              { label: 'Monaco', desc: 'Code Editor' },
              { label: 'Recharts', desc: 'Graphs' },
              { label: 'JWT', desc: 'Auth' },
              { label: 'Tailwind', desc: 'Styling' },
            ].map(t => (
              <div key={t.label} className="card text-center">
                <p className="font-display font-bold text-cyber-400 mb-1">{t.label}</p>
                <p className="text-gray-500 text-xs">{t.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <div className="flex gap-4">
          <Link to="/signup" className="btn-primary">Get Started Free →</Link>
          <Link to="/" className="btn-secondary">Back to Home</Link>
        </div>
      </div>
    </div>
  )
}
