import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

import {
  generateArray, linearSearch, binarySearch, bubbleSort, mergeSort, quickSort,
  benchmarkAlgorithm, ALGO_META, theoreticalPoint
} from '../utils/algorithms'
import { generatePDFReport } from '../utils/pdfReport'
import { getComplexityColor } from '../utils/complexity'

import AlgorithmVisualizer from '../components/visualizer/AlgorithmVisualizer'
import InputGenerator from '../components/visualizer/InputGenerator'
import BenchmarkChart from '../components/visualizer/BenchmarkChart'
import CompareChart from '../components/visualizer/CompareChart'
import StatsPanel from '../components/visualizer/StatsPanel'

import CustomSection from '../components/custom/CustomSection'


// ── Constants ──────────────────────────────────────────────────────────────────
const ALGO_KEYS = Object.keys(ALGO_META)

const ALGO_FNS = {
  linearSearch, binarySearch, bubbleSort, mergeSort, quickSort
}


const TABS = [
  { id: 'visualize', label: '▶ Visualize', icon: '◈' },
  { id: 'benchmark', label: '📊 Benchmark', icon: '⬡' },
  { id: 'compare', label: '⚖ Compare', icon: '◫' },
  { id: 'custom', label: '⌨ Custom Lab', icon: '✦' },
]

const SPEEDS = [
  { label: '0.5×', ms: 200 },
  { label: '1×', ms: 80 },
  { label: '2×', ms: 30 },
  { label: '4×', ms: 10 },
  { label: 'Max', ms: 0 },
]

// ── Helpers ────────────────────────────────────────────────────────────────────
const getCaseArray = (size, type, algoKey, caseType) => {
  if (caseType === 'best') {
    if (algoKey === 'linearSearch') {
      // target is first element
      const arr = generateArray(size, type)
      return arr
    }
    if (algoKey === 'binarySearch') return generateArray(size, 'sorted')
    if (algoKey === 'bubbleSort') return generateArray(size, 'sorted')
    return generateArray(size, type)
  }
  if (caseType === 'worst') {
    if (algoKey === 'bubbleSort') return generateArray(size, 'reverse')
    if (algoKey === 'quickSort') return generateArray(size, 'sorted') // sorted = worst for naive pivot
    if (algoKey === 'linearSearch') return generateArray(size, 'reverse') // target at end
    return generateArray(size, 'reverse')
  }
  return generateArray(size, type)
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function VisualizerPage() {
  const [activeTab, setActiveTab] = useState('visualize')
  const [algorithm, setAlgorithm] = useState('bubbleSort')
  const [inputConfig, setInputConfig] = useState({ inputSize: 60, inputType: 'random', caseType: 'average' })
  const [speed, setSpeed] = useState(1) // index into SPEEDS
  const [array, setArray] = useState(() => generateArray(60, 'random'))
  const [currentStep, setCurrentStep] = useState(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [steps, setSteps] = useState([])
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [stats, setStats] = useState(null)
  const [benchmarkPoints, setBenchmarkPoints] = useState([])
  const [isBenchmarking, setIsBenchmarking] = useState(false)
  const [benchProgress, setBenchProgress] = useState(0)
  const [pdfLoading, setPdfLoading] = useState(false)

  const cancelRef = useRef(false)
  const pauseRef = useRef(false)
  const animFrameRef = useRef(null)

  const meta = ALGO_META[algorithm]

  // ── Generate new array on config change ──────────────────────────────────────
  const regenerate = useCallback(() => {
    cancelRef.current = true
    setIsRunning(false)
    setIsPaused(false)
    setSteps([])
    setCurrentStep(null)
    setStepIndex(0)
    setStats(null)
    const { inputSize, inputType, caseType } = inputConfig
    const newArr = getCaseArray(Math.min(inputSize, 500), inputType, algorithm, caseType)
    setArray(newArr)
  }, [inputConfig, algorithm])

  useEffect(() => { regenerate() }, [inputConfig, algorithm])

  // ── Run visualization ─────────────────────────────────────────────────────────
  const runVisualization = async () => {
    if (isRunning) return
    cancelRef.current = false
    pauseRef.current = false
    setIsRunning(true)
    setIsPaused(false)
    setCurrentStep(null)

    const vizSize = Math.min(inputConfig.inputSize, 200)
    const arr = getCaseArray(vizSize, inputConfig.inputType, algorithm, inputConfig.caseType)
    setArray(arr)

    // Get target for search algos
    let target
    if (algorithm === 'linearSearch') {
      target = inputConfig.caseType === 'best' ? arr[0] : arr[Math.floor(arr.length * 0.75)]
    } else if (algorithm === 'binarySearch') {
      const sorted = [...arr].sort((a, b) => a - b)
      target = sorted[Math.floor(sorted.length / 2)]
    }

    // Execute algorithm to collect steps
    let result
    try {
      if (algorithm === 'linearSearch') result = linearSearch(arr, target)
      else if (algorithm === 'binarySearch') result = binarySearch(arr, target)
      else result = ALGO_FNS[algorithm](arr)
    } catch (e) {
      toast.error('Algorithm error: ' + e.message)
      setIsRunning(false)
      return
    }

    const { steps: collectedSteps, time, ops, memory } = result
    setSteps(collectedSteps)

    // Store raw stats
    const tc = meta.timeComplexities[inputConfig.caseType]
    const sc = meta.spaceComplexity
    setStats({ time, ops, memory, timeComplexity: tc, spaceComplexity: sc })

    // Animate steps
    const delay = SPEEDS[speed].ms
    for (let i = 0; i < collectedSteps.length; i++) {
      if (cancelRef.current) break

      while (pauseRef.current) {
        await new Promise(r => setTimeout(r, 50))
        if (cancelRef.current) break
      }
      if (cancelRef.current) break

      setCurrentStep(collectedSteps[i])
      setStepIndex(i)
      if (collectedSteps[i].array) setArray(collectedSteps[i].array)

      if (delay > 0) await new Promise(r => setTimeout(r, delay))
    }

    if (!cancelRef.current) {
      toast.success(`Done! ${ops.toLocaleString()} ops in ${time.toFixed(3)}ms`)
    }
    setIsRunning(false)
    setIsPaused(false)
  }

  const handlePause = () => {
    pauseRef.current = !pauseRef.current
    setIsPaused(pauseRef.current)
  }

  const handleStop = () => {
    cancelRef.current = true
    pauseRef.current = false
    setIsRunning(false)
    setIsPaused(false)
  }

  // ── Benchmark ─────────────────────────────────────────────────────────────────
  const runBenchmark = async () => {
    setIsBenchmarking(true)
    setBenchmarkPoints([])
    setBenchProgress(0)

    const sizes = [100, 250, 500, 1000, 2000, 3000, 5000, 7500, 10000]
    const results = []

    for (let i = 0; i < sizes.length; i++) {
      const n = sizes[i]
      await new Promise(r => setTimeout(r, 0)) // yield
      const arr = getCaseArray(n, inputConfig.inputType, algorithm, inputConfig.caseType)
      const { time, ops, memory } = benchmarkAlgorithm(algorithm, arr)
      results.push({ n, time, ops, memory })
      setBenchmarkPoints([...results])
      setBenchProgress(Math.round(((i + 1) / sizes.length) * 100))
    }

    // Update stats with final run
    const tc = meta.timeComplexities[inputConfig.caseType]
    const last = results[results.length - 1]
    setStats({ ...last, timeComplexity: tc, spaceComplexity: meta.spaceComplexity })
    toast.success('Benchmark complete!')
    setIsBenchmarking(false)
  }

  // ── PDF Report ────────────────────────────────────────────────────────────────
  const downloadReport = async () => {
    if (!stats) { toast.error('Run a benchmark first'); return }
    setPdfLoading(true)
    try {
      const optimizationNotes = {
        linearSearch: ['Use binary search on sorted arrays for O(log n) time.', 'For repeated searches, hash maps give O(1) average lookup.'],
        binarySearch: ['Ensure array is sorted before searching — sort costs O(n log n).', 'Works only on random-access structures; not suitable for linked lists.'],
        bubbleSort: ['Replace with Merge Sort or Quick Sort for large inputs.', 'Bubble sort is only efficient on nearly-sorted data with early-exit optimization.', 'For nearly-sorted data, insertion sort has better constants than bubble sort.'],
        mergeSort: ['Merge sort is stable and guarantees O(n log n) in all cases.', 'Consider in-place merge sort variants to reduce O(n) space to O(1).', 'Use TimSort (hybrid of merge + insertion) for real-world data.'],
        quickSort: ['Choose pivot using median-of-three to avoid O(n²) on sorted input.', 'Use Introsort (quicksort + heapsort hybrid) for guaranteed O(n log n).', 'For small sub-arrays (<16 elements), switch to insertion sort.'],
      }

      await generatePDFReport({
        algorithm: meta.label,
        inputSize: inputConfig.inputSize,
        inputType: inputConfig.inputType,
        caseType: inputConfig.caseType,
        executionTime: stats.time,
        operationCount: stats.ops,
        memoryUsage: stats.memory,
        timeComplexity: stats.timeComplexity,
        spaceComplexity: stats.spaceComplexity,
        benchmarkPoints,
        optimizationNotes: optimizationNotes[algorithm] || []
      })
      toast.success('PDF downloaded!')
    } catch (e) {
      toast.error('PDF generation failed: ' + e.message)
      console.error(e)
    } finally {
      setPdfLoading(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="p-5 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-white mb-1">
            Algorithm Visualizer ▶
          </h1>
          <p className="text-gray-400 text-sm">Real-time visualization, benchmarking & comparison of sorting/searching algorithms.</p>
        </div>
        <button
          onClick={downloadReport}
          disabled={!stats || pdfLoading}
          className="btn-secondary text-sm py-2 px-5 flex items-center gap-2 disabled:opacity-40"
        >
          {pdfLoading
            ? <><span className="w-3 h-3 border border-cyber-400/30 border-t-cyber-400 rounded-full animate-spin" />Generating...</>
            : '⬇ PDF Report'}
        </button>
      </div>

      {/* Algorithm Selector */}
      <div className="flex gap-2 flex-wrap mb-5">
        {ALGO_KEYS.map(key => {
          const m = ALGO_META[key]
          return (
            <button
              key={key}
              onClick={() => setAlgorithm(key)}
              disabled={isRunning || isBenchmarking}
              className={`px-4 py-2 rounded-xl border text-sm transition-all disabled:opacity-50 ${algorithm === key
                ? 'border-2 font-display font-bold'
                : 'glass border-white/10 text-gray-400 hover:border-white/20'
                }`}
              style={algorithm === key ? { borderColor: m.color, color: m.color, background: m.color + '18' } : {}}
            >
              {m.label}
            </button>
          )
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 glass rounded-xl p-1 w-fit border border-white/5">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            disabled={(isRunning || isBenchmarking) && tab.id !== activeTab}
            className={`px-4 py-2 text-sm rounded-lg transition-all disabled:opacity-50 font-display ${activeTab === tab.id
              ? tab.id === 'custom'
                ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20'
                : 'bg-cyber-500/15 text-cyber-400 border border-cyber-500/20'
              : 'text-gray-400 hover:text-white'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── VISUALIZE TAB ─────────────────────────────────────────── */}
      {activeTab === 'visualize' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left: Controls */}
          <div className="space-y-5">
            <div className="card">
              <h3 className="font-display font-bold text-white text-sm mb-4 uppercase tracking-wider">Configuration</h3>
              <InputGenerator
                {...inputConfig}
                onChange={setInputConfig}
                disabled={isRunning}
              />
            </div>

            {/* Speed */}
            <div className="card">
              <h3 className="font-display font-bold text-white text-sm mb-3 uppercase tracking-wider">Speed</h3>
              <div className="flex gap-2">
                {SPEEDS.map((s, i) => (
                  <button
                    key={s.label}
                    onClick={() => setSpeed(i)}
                    disabled={isRunning}
                    className={`flex-1 py-1.5 text-xs rounded-lg border transition-all disabled:opacity-40 ${speed === i
                      ? 'bg-cyber-500/15 border-cyber-500/30 text-cyber-400'
                      : 'glass border-white/5 text-gray-400'
                      }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats */}
            {stats && (
              <div className="card">
                <h3 className="font-display font-bold text-white text-sm mb-3 uppercase tracking-wider">Results</h3>
                <StatsPanel stats={stats} algorithm={algorithm} caseType={inputConfig.caseType} />
              </div>
            )}

            {/* Algo Info */}
            <div className="card border-white/5">
              <p className="text-gray-400 text-xs mb-2 uppercase tracking-wider">{meta.label}</p>
              <p className="text-gray-300 text-xs leading-relaxed mb-3">{meta.description}</p>
              <div className="space-y-1">
                {Object.entries(meta.timeComplexities).map(([k, v]) => {
                  const c = getComplexityColor(v)
                  return (
                    <div key={k} className="flex justify-between text-xs">
                      <span className="text-gray-500 capitalize">{k} case:</span>
                      <span className={`font-code font-bold ${c?.text}`}>{v}</span>
                    </div>
                  )
                })}
                <div className="flex justify-between text-xs mt-1 pt-1 border-t border-white/5">
                  <span className="text-gray-500">Space:</span>
                  <span className={`font-code font-bold ${getComplexityColor(meta.spaceComplexity)?.text}`}>{meta.spaceComplexity}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Visualizer */}
          <div className="lg:col-span-2 space-y-4">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="font-display font-bold text-white text-sm">Array Visualization</h3>
                  <span className="text-gray-600 text-xs font-code">
                    {array.length} elements
                  </span>
                </div>
                {/* Progress */}
                {isRunning && steps.length > 0 && (
                  <span className="text-xs text-gray-500 font-code">
                    {stepIndex + 1} / {steps.length} steps
                  </span>
                )}
              </div>

              <AlgorithmVisualizer
                array={array}
                step={currentStep}
                maxValue={Math.max(...array, 1)}
                isRunning={isRunning}
                algorithm={algorithm}
              />

              {/* Progress bar */}
              {isRunning && steps.length > 0 && (
                <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: meta.color }}
                    animate={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              )}

              {/* Controls */}
              <div className="flex gap-2 mt-4">
                {!isRunning ? (
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={runVisualization}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 py-3"
                  >
                    ▶ Run Visualization
                  </motion.button>
                ) : (
                  <>
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={handlePause}
                      className="btn-secondary flex-1 py-3"
                    >
                      {isPaused ? '▶ Resume' : '⏸ Pause'}
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={handleStop}
                      className="px-4 py-3 glass border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg text-sm transition-all"
                    >
                      ■ Stop
                    </motion.button>
                  </>
                )}
                <button
                  onClick={regenerate}
                  disabled={isRunning}
                  className="px-4 py-3 glass border border-white/10 text-gray-400 hover:text-white rounded-lg text-sm transition-all disabled:opacity-40"
                  title="New random array"
                >
                  ↺
                </button>
              </div>
            </div>

            {/* Step detail */}
            <AnimatePresence>
              {currentStep && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="card border-white/5 text-xs font-code text-gray-400"
                >
                  <span className="text-cyber-400 font-bold mr-2">Step {stepIndex + 1}:</span>
                  <span className="text-white capitalize">{currentStep.type?.replace(/_/g, ' ')}</span>
                  {currentStep.indices?.length > 0 && (
                    <span className="text-gray-500"> at index [{currentStep.indices.join(', ')}]</span>
                  )}
                  {currentStep.pivot !== undefined && (
                    <span className="text-purple-400"> · pivot index {currentStep.pivot}</span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ── BENCHMARK TAB ─────────────────────────────────────────── */}
      {activeTab === 'benchmark' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="space-y-4">
            <div className="card">
              <h3 className="font-display font-bold text-white text-sm mb-4 uppercase tracking-wider">Benchmark Config</h3>
              <InputGenerator
                {...inputConfig}
                onChange={setInputConfig}
                disabled={isBenchmarking}
              />
            </div>

            {stats && (
              <div className="card">
                <h3 className="font-display font-bold text-white text-sm mb-3 uppercase tracking-wider">Latest Run</h3>
                <StatsPanel stats={stats} algorithm={algorithm} caseType={inputConfig.caseType} />
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-white">Empirical Benchmarking</h3>
                <span className="text-gray-500 text-xs">
                  n = 100 → 10,000 (9 data points)
                </span>
              </div>

              <BenchmarkChart
                points={benchmarkPoints}
                algorithm={algorithm}
                showTheory={true}
                isLive={isBenchmarking}
              />

              {/* Progress */}
              {isBenchmarking && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Running benchmarks...</span>
                    <span>{benchProgress}%</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-cyber-500 rounded-full"
                      animate={{ width: `${benchProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={runBenchmark}
                disabled={isBenchmarking}
                className="btn-primary w-full mt-4 flex items-center justify-center gap-2 py-3 disabled:opacity-60"
              >
                {isBenchmarking ? (
                  <><span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />Benchmarking...</>
                ) : '⬡ Run Benchmark (Real Timing)'}
              </motion.button>
            </div>

            {/* Data table */}
            {benchmarkPoints.length > 0 && (
              <div className="card">
                <h3 className="font-display font-bold text-white text-sm mb-3">Raw Data</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-2 text-gray-400 font-normal">n</th>
                        <th className="text-right py-2 text-gray-400 font-normal">Time (ms)</th>
                        <th className="text-right py-2 text-gray-400 font-normal">Operations</th>
                        <th className="text-right py-2 text-gray-400 font-normal">µs/op</th>
                      </tr>
                    </thead>
                    <tbody>
                      {benchmarkPoints.map((p, i) => (
                        <tr key={i} className="border-b border-white/5">
                          <td className="py-1.5 font-code text-gray-300">{p.n.toLocaleString()}</td>
                          <td className="py-1.5 font-code text-right text-cyber-400">{p.time.toFixed(4)}</td>
                          <td className="py-1.5 font-code text-right text-gray-400">{p.ops.toLocaleString()}</td>
                          <td className="py-1.5 font-code text-right text-gray-600">
                            {p.ops > 0 ? ((p.time / p.ops) * 1000).toFixed(4) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── COMPARE TAB ───────────────────────────────────────────── */}
      {activeTab === 'compare' && (
        <div className="card">
          <h2 className="font-display font-bold text-white text-lg mb-1">Comparative Analysis</h2>
          <p className="text-gray-400 text-sm mb-6">
            Runs actual algorithm executions across multiple input sizes and plots real measured times.
          </p>
          <CompareChart />
        </div>
      )}

      {/* ── CUSTOM LAB TAB ────────────────────────────────────────── */}
      {activeTab === 'custom' && (
        <CustomSection />
      )}
    </div>
  )
}
