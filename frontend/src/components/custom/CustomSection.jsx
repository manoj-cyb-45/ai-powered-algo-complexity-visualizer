import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

import { runCustomAlgorithm, ALGORITHM_TEMPLATES } from '../../utils/customAlgoEngine'
import { getComplexityColor } from '../../utils/complexity'

import CustomAlgorithmEditor from './CustomAlgorithmEditor'
import CustomArrayViz        from './CustomVisualizer'
import ExecutionControls, { SPEEDS } from './ExecutionControls'
import TimelineSlider        from './TimelineSlider'

// ── Helpers ────────────────────────────────────────────────────────────────────
const parseArray = (raw) => {
  // Accept "5,3,8,1" or "[5,3,8,1]" or "5 3 8 1"
  const cleaned = raw.replace(/[\[\]]/g, '').replace(/\s+/g, ',').replace(/,+/g, ',').trim()
  const nums = cleaned.split(',').map(Number).filter(n => !isNaN(n) && n !== null)
  if (!nums.length) throw new Error('No valid numbers found.')
  if (nums.length > 100) throw new Error('Max 100 elements for custom visualization.')
  return nums
}

const formatBytes = (bytes) => {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`
  if (bytes >= 1024)        return `${(bytes / 1024).toFixed(2)} KB`
  return `${bytes} B`
}

const formatTime = (ms) => {
  if (ms < 0.01) return `${(ms * 1000).toFixed(2)} µs`
  return `${ms.toFixed(4)} ms`
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function CustomSection() {
  const [activeTemplate, setActiveTemplate]   = useState('bubbleSort')
  const [code, setCode]                       = useState(ALGORITHM_TEMPLATES.bubbleSort.code)
  const [rawInput, setRawInput]               = useState(
    ALGORITHM_TEMPLATES.bubbleSort.defaultArray.join(', ')
  )
  const [inputError, setInputError]           = useState(null)
  const [execError, setExecError]             = useState(null)

  // Animation state
  const [array, setArray]           = useState(ALGORITHM_TEMPLATES.bubbleSort.defaultArray)
  const [steps, setSteps]           = useState([])
  const [stepIndex, setStepIndex]   = useState(0)
  const [currentStep, setCurrentStep] = useState(null)
  const [isRunning, setIsRunning]   = useState(false)
  const [isPaused, setIsPaused]     = useState(false)
  const [speed, setSpeed]           = useState(2)          // 1× by default

  // Result metrics
  const [metrics, setMetrics] = useState(null)

  const cancelRef = useRef(false)
  const pauseRef  = useRef(false)

  // ── Validate array input ───────────────────────────────────────────────
  const getParsedArray = () => {
    try {
      const arr = parseArray(rawInput)
      setInputError(null)
      return arr
    } catch (e) {
      setInputError(e.message)
      return null
    }
  }

  // ── Template switch ────────────────────────────────────────────────────
  const handleTemplateChange = (key) => {
    setActiveTemplate(key)
    setRawInput(ALGORITHM_TEMPLATES[key].defaultArray.join(', '))
    setArray(ALGORITHM_TEMPLATES[key].defaultArray)
    resetState()
  }

  const resetState = () => {
    cancelRef.current = true
    setIsRunning(false)
    setIsPaused(false)
    setSteps([])
    setCurrentStep(null)
    setStepIndex(0)
    setMetrics(null)
    setExecError(null)
  }

  // ── Run algorithm ──────────────────────────────────────────────────────
  const runAlgorithm = async () => {
    const inputArr = getParsedArray()
    if (!inputArr) return

    cancelRef.current = false
    pauseRef.current  = false
    setIsRunning(true)
    setIsPaused(false)
    setExecError(null)
    setSteps([])
    setCurrentStep(null)
    setStepIndex(0)
    setArray([...inputArr])

    // Execute (synchronous, but fast enough to not block for reasonable inputs)
    const result = runCustomAlgorithm(inputArr, code)

    if (result.error) {
      setExecError(result.error)
      setIsRunning(false)
      toast.error('Execution error — check the console for details')
      return
    }

    setSteps(result.steps)
    setMetrics({
      time:        result.time,
      ops:         result.ops,
      comparisons: result.comparisons,
      swaps:       result.swaps,
      memory:      result.memory,
      complexity:  result.complexity,
    })

    if (!result.steps.length) {
      toast('Algorithm ran with no recorded steps.\nMake sure you call compare(), swap(), or mark().', { icon: '⚠' })
      setIsRunning(false)
      return
    }

    // Animate
    const delay = SPEEDS[speed].ms
    for (let i = 0; i < result.steps.length; i++) {
      if (cancelRef.current) break

      while (pauseRef.current) {
        await new Promise(r => setTimeout(r, 50))
        if (cancelRef.current) break
      }
      if (cancelRef.current) break

      const s = result.steps[i]
      setCurrentStep(s)
      setStepIndex(i)
      if (s.array) setArray(s.array)

      if (delay > 0) await new Promise(r => setTimeout(r, delay))
    }

    if (!cancelRef.current) {
      toast.success(
        `Done! ${result.comparisons} comparisons · ${result.swaps} swaps · ${formatTime(result.time)}`
      )
    }
    setIsRunning(false)
    setIsPaused(false)
  }

  // ── Replay using already-collected steps ───────────────────────────────
  const replayAnimation = async () => {
    if (!steps.length) return
    const inputArr = getParsedArray()
    if (!inputArr) return

    cancelRef.current = false
    pauseRef.current  = false
    setIsRunning(true)
    setIsPaused(false)
    setArray([...inputArr])
    setCurrentStep(null)
    setStepIndex(0)

    const delay = SPEEDS[speed].ms
    for (let i = 0; i < steps.length; i++) {
      if (cancelRef.current) break

      while (pauseRef.current) {
        await new Promise(r => setTimeout(r, 50))
        if (cancelRef.current) break
      }
      if (cancelRef.current) break

      const s = steps[i]
      setCurrentStep(s)
      setStepIndex(i)
      if (s.array) setArray(s.array)

      if (delay > 0) await new Promise(r => setTimeout(r, delay))
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
    pauseRef.current  = false
    setIsRunning(false)
    setIsPaused(false)
  }

  // ── Timeline scrub ─────────────────────────────────────────────────────
  const handleScrub = useCallback((idx) => {
    if (!steps[idx]) return
    const s = steps[idx]
    setStepIndex(idx)
    setCurrentStep(s)
    if (s.array) setArray(s.array)
  }, [steps])

  // ── Derived ────────────────────────────────────────────────────────────
  const maxValue     = Math.max(...array, 1)
  const complexColors = {
    best:    getComplexityColor(metrics?.complexity?.best    || 'O(n)'),
    average: getComplexityColor(metrics?.complexity?.average || 'O(n)'),
    worst:   getComplexityColor(metrics?.complexity?.worst   || 'O(n)'),
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y:  0 }}
      className="space-y-5"
    >
      {/* ── Section header ── */}
      <div className="flex items-center gap-3">
        <div className="w-1 h-8 rounded-full bg-cyber-500/60" />
        <div>
          <h2 className="font-display font-bold text-white text-lg leading-tight">
            Custom Algorithm Lab
          </h2>
          <p className="text-gray-500 text-xs">
            Write any algorithm using helper functions — execution is animated step-by-step.
          </p>
        </div>
      </div>

      {/* ── Main two-column grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">

        {/* ── LEFT: Editor + input ── */}
        <div className="xl:col-span-2 space-y-4">

          {/* Code editor */}
          <div className="card">
            <h3 className="font-display font-bold text-white text-sm mb-4 uppercase tracking-wider">
              ⌨ Code Editor
            </h3>
            <CustomAlgorithmEditor
              code={code}
              onChange={setCode}
              activeTemplate={activeTemplate}
              onTemplateChange={handleTemplateChange}
              disabled={isRunning}
              error={execError}
            />
          </div>

          {/* Input array */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-white text-sm uppercase tracking-wider">
                Input Array
              </h3>
              <button
                onClick={() => {
                  const n    = Math.floor(Math.random() * 8) + 5
                  const vals = Array.from({ length: n }, () => Math.floor(Math.random() * 90) + 10)
                  setRawInput(vals.join(', '))
                  setArray(vals)
                  resetState()
                }}
                disabled={isRunning}
                className="text-xs text-gray-500 hover:text-cyber-400 transition-colors disabled:opacity-40"
              >
                ↻ Random
              </button>
            </div>

            <input
              type="text"
              value={rawInput}
              onChange={e => {
                setRawInput(e.target.value)
                setInputError(null)
                resetState()
              }}
              placeholder="e.g. 5, 3, 8, 1, 9, 2"
              disabled={isRunning}
              className={`input-field text-sm font-code ${inputError ? 'border-red-500/40' : ''}`}
            />
            {inputError && (
              <p className="text-red-400 text-xs mt-1.5 font-code">{inputError}</p>
            )}
            <p className="text-gray-600 text-xs mt-1.5">
              Comma-separated integers · max 100 elements
            </p>
          </div>

          {/* Controls */}
          <div className="card">
            <h3 className="font-display font-bold text-white text-sm mb-4 uppercase tracking-wider">
              Controls
            </h3>
            <ExecutionControls
              isRunning={isRunning}
              isPaused={isPaused}
              hasSteps={steps.length > 0}
              speed={speed}
              onRun={runAlgorithm}
              onPause={handlePause}
              onStop={handleStop}
              onReplay={replayAnimation}
              onReset={() => {
                const arr = getParsedArray()
                if (arr) { setArray(arr); resetState() }
              }}
              onSpeedChange={setSpeed}
            />
          </div>
        </div>

        {/* ── RIGHT: Visualizer + metrics ── */}
        <div className="xl:col-span-3 space-y-4">

          {/* Array visualizer */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h3 className="font-display font-bold text-white text-sm">
                  Array Visualization
                </h3>
                <span className="text-gray-600 text-xs font-code">{array.length} elements</span>
              </div>

              {isRunning && steps.length > 0 && (
                <span className="text-xs text-gray-500 font-code">
                  {stepIndex + 1} / {steps.length}
                </span>
              )}
            </div>

            <CustomArrayViz
              array={array}
              step={currentStep}
              maxValue={maxValue}
              isRunning={isRunning}
            />

            {/* Progress bar */}
            {isRunning && steps.length > 0 && (
              <div className="mt-3 h-0.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-cyber-500 rounded-full"
                  animate={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
                  transition={{ duration: 0.08 }}
                />
              </div>
            )}

            {/* Timeline scrubber */}
            {steps.length > 0 && !isRunning && (
              <div className="mt-4 pt-4 border-t border-white/5">
                <TimelineSlider
                  stepIndex={stepIndex}
                  totalSteps={steps.length}
                  currentStep={currentStep}
                  disabled={isRunning}
                  onChange={handleScrub}
                />
              </div>
            )}
          </div>

          {/* Step detail */}
          <AnimatePresence>
            {currentStep && (
              <motion.div
                key="step-detail"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="card border-white/5"
              >
                <div className="flex items-center gap-3 flex-wrap text-xs font-code">
                  <span className="text-cyber-400 font-bold">Step {stepIndex + 1}</span>
                  <span className="text-white capitalize">{currentStep.type?.replace(/_/g, ' ')}</span>
                  {currentStep.indices?.length > 0 && (
                    <span className="text-gray-500">
                      indices [{currentStep.indices.join(', ')}]
                      {' '}→ values [{currentStep.indices.map(i => array[i] ?? '?').join(', ')}]
                    </span>
                  )}
                  {Object.entries(currentStep.pointers || {}).map(([name, idx]) => (
                    <span key={name} className="text-blue-400">
                      {name}={idx}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Metrics */}
          <AnimatePresence>
            {metrics && (
              <motion.div
                key="metrics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="card"
              >
                <h3 className="font-display font-bold text-white text-sm mb-4 uppercase tracking-wider">
                  Execution Metrics
                </h3>

                {/* Stat grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
                  {[
                    { icon: '⏱', label: 'Time',         value: formatTime(metrics.time),              color: 'text-cyber-400'  },
                    { icon: '⚖', label: 'Comparisons',  value: metrics.comparisons.toLocaleString(),  color: 'text-yellow-400' },
                    { icon: '⇄', label: 'Swaps',        value: metrics.swaps.toLocaleString(),        color: 'text-orange-400' },
                    { icon: '⚙', label: 'Total Ops',    value: metrics.ops.toLocaleString(),          color: 'text-blue-400'   },
                    { icon: '◫', label: 'Memory (est.)', value: formatBytes(metrics.memory),           color: 'text-pink-400'   },
                  ].map((m, i) => (
                    <motion.div
                      key={m.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.06 }}
                      className="glass rounded-xl p-3 border border-white/5 text-center"
                    >
                      <p className="text-lg mb-1">{m.icon}</p>
                      <p className={`font-code font-bold text-sm ${m.color}`}>{m.value}</p>
                      <p className="text-gray-600 text-xs mt-0.5">{m.label}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Complexity analysis */}
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">
                    Estimated Complexity
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {['best', 'average', 'worst'].map(caseType => {
                      const cx   = metrics.complexity[caseType]
                      const col  = getComplexityColor(cx)
                      return (
                        <div
                          key={caseType}
                          className={`glass rounded-xl p-3 border ${col?.border || 'border-white/10'}`}
                        >
                          <p className="text-gray-500 text-xs mb-1 capitalize">{caseType} case</p>
                          <p className={`font-display font-bold text-lg ${col?.text}`}>{cx}</p>
                          <p className="text-gray-600 text-xs">{col?.label}</p>
                        </div>
                      )
                    })}
                  </div>
                  <p className="text-gray-600 text-xs mt-2">
                    ⚠ Complexity is heuristically estimated from observed operations on this input size.
                  </p>
                </div>

                {/* Recorded steps */}
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-4 text-xs text-gray-500 font-code">
                  <span>Recorded steps: <span className="text-white">{steps.length.toLocaleString()}</span></span>
                  <span>Input size n = <span className="text-white">{array.length}</span></span>
                  {steps.length >= 5990 && (
                    <span className="text-yellow-400">⚠ Step cap reached — output may be truncated</span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state */}
          {!metrics && !isRunning && (
            <div className="card border-dashed border-white/10 flex flex-col items-center justify-center py-10 text-center">
              <p className="text-4xl mb-3">▶</p>
              <p className="text-white font-display font-bold mb-1">Ready to Visualize</p>
              <p className="text-gray-500 text-sm max-w-xs">
                Choose a template or write your algorithm, then press{' '}
                <span className="text-cyber-400 font-bold">Run</span> to see it animated step-by-step.
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
