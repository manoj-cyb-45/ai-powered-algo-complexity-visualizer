import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const features = [
  {
    icon: '▶',
    title: 'Algorithm Visualizer',
    desc: 'Watch Bubble Sort, Merge Sort, Quick Sort, Linear & Binary Search execute step-by-step with animated bar charts.'
  },
  {
    icon: '📊',
    title: 'Empirical Benchmarking',
    desc: 'Real performance.now() timing across input sizes 100→10K with live-updating growth curves and theoretical overlays.'
  },
  {
    icon: '⚡',
    title: 'AI-Powered Analysis',
    desc: 'Instant time & space complexity detection with natural language explanations powered by GPT.'
  },
  {
    icon: '◈',
    title: 'Monaco Code Editor',
    desc: 'Professional editor with syntax highlighting for 10+ languages, identical to VS Code.'
  },
  {
    icon: '⚖',
    title: 'Comparative Analysis',
    desc: 'Compare multiple algorithms simultaneously with real measured timings, bar charts and comparison tables.'
  },
  {
    icon: '⬇',
    title: 'PDF Reports',
    desc: 'Download full analysis reports with benchmark data, complexity tables, and optimization notes.'
  },
]

const complexities = [
  { label: 'O(1)', color: '#22c55e', desc: 'Constant' },
  { label: 'O(log n)', color: '#86efac', desc: 'Logarithmic' },
  { label: 'O(n)', color: '#fbbf24', desc: 'Linear' },
  { label: 'O(n log n)', color: '#fb923c', desc: 'Linearithmic' },
  { label: 'O(n²)', color: '#f87171', desc: 'Quadratic' },
  { label: 'O(2ⁿ)', color: '#c084fc', desc: 'Exponential' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-void-900 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyber-500/20 border border-cyber-500/40 flex items-center justify-center">
              <span className="text-cyber-400 font-display font-bold">A</span>
            </div>
            <span className="font-display font-bold text-white text-lg">AlgoLens</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/about" className="text-gray-400 hover:text-white text-sm transition-colors hidden sm:block">About</Link>
            <Link to="/login" className="text-gray-400 hover:text-white text-sm transition-colors">Login</Link>
            <Link to="/signup" className="btn-primary text-sm py-2 px-5">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-50" />
        <div className="absolute inset-0 bg-radial-glow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyber-500/5 rounded-full blur-3xl" />

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 glass border border-cyber-500/30 rounded-full px-5 py-2 mb-8"
          >
            <span className="w-2 h-2 bg-cyber-400 rounded-full animate-pulse" />
            <span className="text-cyber-400 text-sm font-display">AI-Powered Algorithm Analysis</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight"
          >
            Decode Your{' '}
            <span className="gradient-text glow-text">Algorithm's</span>
            <br />
            Complexity
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-body"
          >
            Paste your code. Get instant Big-O analysis, visual complexity graphs,
            and AI-generated optimization suggestions.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link to="/signup" className="btn-primary text-base py-4 px-8 glow-border">
              Start Analyzing Free →
            </Link>
            <Link to="/login" className="btn-secondary text-base py-4 px-8">
              Sign In
            </Link>
          </motion.div>

          {/* Complexity Pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-wrap gap-3 justify-center mt-16"
          >
            {complexities.map((c, i) => (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.08 }}
                className="glass border rounded-full px-4 py-1.5 flex items-center gap-2"
                style={{ borderColor: c.color + '40' }}
              >
                <div className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                <span className="font-code text-sm" style={{ color: c.color }}>{c.label}</span>
                <span className="text-gray-500 text-xs">{c.desc}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="section-title text-white mb-4">
              Everything You Need to{' '}
              <span className="gradient-text">Master Complexity</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              A complete toolkit for analyzing, understanding, and optimizing algorithm performance.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4, borderColor: 'rgba(34, 197, 94, 0.3)' }}
                className="card group cursor-default"
              >
                <div className="w-12 h-12 rounded-xl bg-cyber-500/10 border border-cyber-500/20 flex items-center justify-center text-2xl mb-4 group-hover:bg-cyber-500/20 transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-display font-bold text-white text-lg mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-12 border border-cyber-500/20 glow-border"
          >
            <h2 className="section-title text-white mb-4">
              Ready to Analyze Your{' '}
              <span className="gradient-text">First Algorithm?</span>
            </h2>
            <p className="text-gray-400 mb-8">
              Join developers who use AlgoLens to write faster, more efficient code.
            </p>
            <Link to="/signup" className="btn-primary text-base py-4 px-10">
              Start for Free →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 bg-black/20 backdrop-blur-sm">
  <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">

    {/* Left Section */}
    <div className="text-center md:text-left">
      <h3 className="text-cyan-400 font-bold text-xl tracking-wide">
        AlgoLens v2.0
      </h3>

      <p className="text-gray-500 text-sm mt-1 max-w-md">
        Interactive Algorithm Visualization & Complexity Analysis Platform
        with Custom Algorithm Execution and Animated Learning Experience.
      </p>
    </div>

    {/* Center Section */}
    <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-400">
      <span>Custom Visualizer</span>
      <span className="text-cyan-500">•</span>

      <span>Complexity Analyzer</span>
      <span className="text-cyan-500">•</span>

      <span>Educational Lab</span>
      <span className="text-cyan-500">•</span>

      <span>Algorithm Playground</span>
    </div>

    {/* Right Section */}
    <div className="flex flex-col items-center md:items-end gap-2">

      <div className="flex items-center gap-4">

        <a
          href="https://github.com/manoj-cyb-45"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-cyan-400 transition-colors"
        >
          GitHub
        </a>

        <a
            href="https://www.linkedin.com/in/manoj-kumar-p9972/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-cyan-400 transition-colors"
          >
            LinkedIn
          </a>

      </div>

      <p className="text-gray-500 text-sm">
        © 2026 AlgoLens · Built by{" "}
        <span className="text-cyan-400 font-medium">
          Manoj Kumar P
        </span>
      </p>

    </div>

  </div>
</footer>
    </div>
  )
}
