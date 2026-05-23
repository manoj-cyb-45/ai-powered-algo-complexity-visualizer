import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Editor from '@monaco-editor/react'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { SAMPLE_CODES } from '../utils/complexity'
import AnalysisResult from '../components/analyzer/AnalysisResult'

const LANGUAGES = [
  'javascript', 'python', 'java', 'cpp', 'typescript',
  'go', 'rust', 'c', 'csharp', 'php'
]

const DEFAULT_CODE = `// Paste your algorithm here and click Analyze
// Example: Two Sum with nested loops

function twoSumBrute(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) {
        return [i, j];
      }
    }
  }
  return [];
}`

export default function AnalyzerPage() {
  const [code, setCode] = useState(DEFAULT_CODE)
  const [language, setLanguage] = useState('javascript')
  const [title, setTitle] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('editor')

  const handleAnalyze = async () => {
    if (!code.trim() || code.trim().length < 5) {
      toast.error('Please enter some code to analyze')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const { data } = await api.post('/analysis/analyze', {
        code,
        language,
        title: title || `${language} snippet`
      })
      setResult(data.analysis.result)
      toast.success('Analysis complete!')
      setActiveTab('result')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Analysis failed. Check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const loadSample = (lang, name, sampleCode) => {
    setLanguage(lang)
    setCode(sampleCode)
    setTitle(name)
    setResult(null)
    toast.success(`Loaded: ${name}`)
  }

  return (
    <div className="h-full flex flex-col p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display font-bold text-3xl text-white mb-1">Algorithm Analyzer ◈</h1>
        <p className="text-gray-400 text-sm">Paste code, select language, and get AI-powered complexity analysis.</p>
      </div>

      {/* Title + Language + Samples */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Analysis title (optional)"
          className="input-field flex-1"
        />
        <select
          value={language}
          onChange={e => setLanguage(e.target.value)}
          className="input-field w-full sm:w-44 bg-void-800/50"
        >
          {LANGUAGES.map(l => (
            <option key={l} value={l} className="bg-void-800 capitalize">{l}</option>
          ))}
        </select>
      </div>

      {/* Sample Snippets */}
      <div className="flex gap-2 flex-wrap mb-4">
        <span className="text-gray-500 text-xs self-center font-body">Quick load:</span>
        {Object.entries(SAMPLE_CODES).flatMap(([lang, samples]) =>
          Object.entries(samples).map(([name, sampleCode]) => (
            <button
              key={`${lang}-${name}`}
              onClick={() => loadSample(lang, name, sampleCode)}
              className="text-xs px-3 py-1 glass border border-white/10 text-gray-400 hover:text-cyber-400 hover:border-cyber-500/30 rounded-full transition-all"
            >
              {name}
            </button>
          ))
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
        {/* Editor Panel */}
        <div className="flex flex-col min-h-[400px]">
          {/* Mobile Tabs */}
          <div className="flex lg:hidden gap-2 mb-3">
            {['editor', 'result'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-sm font-display capitalize rounded-lg transition-all ${
                  activeTab === tab
                    ? 'bg-cyber-500/15 text-cyber-400 border border-cyber-500/20'
                    : 'text-gray-400 glass'
                }`}
              >
                {tab === 'editor' ? '◈ Editor' : '⬡ Results'}
              </button>
            ))}
          </div>

          <div className={`flex-1 flex flex-col ${activeTab === 'result' ? 'hidden lg:flex' : ''}`}>
            <div className="glass rounded-xl overflow-hidden border border-white/10 flex-1 flex flex-col">
              {/* Editor Header */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-cyber-500/60" />
                </div>
                <span className="text-gray-500 text-xs font-code">{language}</span>
                <button
                  onClick={() => { setCode(''); setResult(null) }}
                  className="text-gray-600 hover:text-gray-400 text-xs transition-colors"
                >
                  Clear
                </button>
              </div>

              {/* Monaco Editor */}
              <div className="flex-1 min-h-[300px]">
                <Editor
                  height="100%"
                  defaultLanguage={language}
                  language={language}
                  value={code}
                  onChange={v => setCode(v || '')}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    fontFamily: 'Fira Code, monospace',
                    fontLigatures: true,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    padding: { top: 12, bottom: 12 },
                    wordWrap: 'on',
                    renderLineHighlight: 'line',
                    smoothScrolling: true,
                    cursorSmoothCaretAnimation: 'on',
                  }}
                />
              </div>
            </div>

            {/* Analyze Button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleAnalyze}
              disabled={loading}
              className="btn-primary w-full mt-3 flex items-center justify-center gap-3 py-4 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <span>◈</span>
                  Analyze Complexity
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Results Panel */}
        <div className={`overflow-y-auto ${activeTab === 'editor' ? 'hidden lg:block' : ''}`}>
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-64 gap-4"
              >
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 border-2 border-cyber-500/20 rounded-full" />
                  <div className="absolute inset-0 border-2 border-t-cyber-500 rounded-full animate-spin" />
                  <div className="absolute inset-3 border-2 border-t-cyber-300 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
                </div>
                <div className="text-center">
                  <p className="text-white font-display font-bold">Analyzing...</p>
                  <p className="text-gray-400 text-sm mt-1">AI is examining your code</p>
                </div>
                {/* Animated steps */}
                <div className="space-y-2 mt-2">
                  {['Parsing code structure', 'Detecting patterns', 'Calculating complexity', 'Generating insights'].map((step, i) => (
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.4 }}
                      className="flex items-center gap-2 text-xs text-gray-500"
                    >
                      <span className="w-1 h-1 bg-cyber-500 rounded-full animate-pulse" />
                      {step}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : result ? (
              <motion.div key="result">
                <AnalysisResult result={result} />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-64 text-center"
              >
                <div className="w-20 h-20 glass rounded-2xl flex items-center justify-center text-4xl mb-4 border border-white/5">
                  ◈
                </div>
                <h3 className="text-white font-display font-bold mb-2">Results appear here</h3>
                <p className="text-gray-500 text-sm max-w-xs">
                  Enter your code in the editor and click "Analyze Complexity" to get started.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
