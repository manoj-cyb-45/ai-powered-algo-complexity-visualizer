import { useState } from 'react'
import { motion } from 'framer-motion'

const INPUT_TYPES = [
  { value: 'random', label: 'Random', desc: 'Shuffled elements' },
  { value: 'sorted', label: 'Sorted', desc: 'Ascending order' },
  { value: 'reverse', label: 'Reverse', desc: 'Descending order' },
  { value: 'nearly', label: 'Nearly Sorted', desc: '~5% swapped' },
]

const CASE_TYPES = [
  { value: 'best', label: 'Best Case' },
  { value: 'average', label: 'Average Case' },
  { value: 'worst', label: 'Worst Case' },
]

const PRESETS = [100, 500, 1000, 5000, 10000, 50000]

export default function InputGenerator({ inputSize, inputType, caseType, onChange, disabled }) {
  const [manualVal, setManualVal] = useState(String(inputSize))

  const update = (key, val) => onChange({ inputSize, inputType, caseType, [key]: val })

  const handleManual = (e) => {
    const raw = e.target.value
    setManualVal(raw)
    const n = parseInt(raw)
    if (!isNaN(n) && n >= 10 && n <= 1000000) {
      onChange({ inputSize: n, inputType, caseType })
    }
  }

  return (
    <div className="space-y-5">
      {/* Input Size Slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-gray-300 text-sm font-body">Input Size</label>
          <span className="font-code text-cyber-400 text-sm">{inputSize.toLocaleString()}</span>
        </div>
        <input
          type="range"
          min={10}
          max={100000}
          step={10}
          value={inputSize}
          onChange={e => { const v = parseInt(e.target.value); setManualVal(String(v)); update('inputSize', v) }}
          disabled={disabled}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-cyber-500 disabled:opacity-40"
          style={{ background: `linear-gradient(to right, #22c55e ${(inputSize/100000)*100}%, #1e293b ${(inputSize/100000)*100}%)` }}
        />
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>10</span><span>50K</span><span>100K</span>
        </div>

        {/* Preset Buttons */}
        <div className="flex flex-wrap gap-2 mt-3">
          {PRESETS.map(p => (
            <button
              key={p}
              onClick={() => { setManualVal(String(p)); update('inputSize', p) }}
              disabled={disabled}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all disabled:opacity-40 ${
                inputSize === p
                  ? 'bg-cyber-500/20 border-cyber-500/40 text-cyber-400'
                  : 'glass border-white/10 text-gray-400 hover:border-white/20'
              }`}
            >
              {p >= 1000 ? `${p/1000}K` : p}
            </button>
          ))}
          {/* Manual Input */}
          <input
            type="number"
            value={manualVal}
            onChange={handleManual}
            disabled={disabled}
            placeholder="Custom"
            min={10}
            max={1000000}
            className="text-xs px-3 py-1.5 rounded-lg border border-white/10 bg-void-800/50 text-white placeholder-gray-600 w-24 outline-none focus:border-cyber-500/40 disabled:opacity-40"
          />
        </div>
      </div>

      {/* Array Type */}
      <div>
        <label className="text-gray-300 text-sm font-body mb-2 block">Array Type</label>
        <div className="grid grid-cols-2 gap-2">
          {INPUT_TYPES.map(t => (
            <button
              key={t.value}
              onClick={() => update('inputType', t.value)}
              disabled={disabled}
              className={`text-left px-3 py-2.5 rounded-lg border transition-all disabled:opacity-40 ${
                inputType === t.value
                  ? 'bg-cyber-500/15 border-cyber-500/30 text-cyber-400'
                  : 'glass border-white/5 text-gray-400 hover:border-white/15'
              }`}
            >
              <p className="text-xs font-medium">{t.label}</p>
              <p className="text-xs text-gray-600 mt-0.5">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Case Type */}
      <div>
        <label className="text-gray-300 text-sm font-body mb-2 block">Test Case</label>
        <div className="flex gap-2">
          {CASE_TYPES.map(c => (
            <button
              key={c.value}
              onClick={() => update('caseType', c.value)}
              disabled={disabled}
              className={`flex-1 py-2 text-xs rounded-lg border transition-all disabled:opacity-40 ${
                caseType === c.value
                  ? 'bg-cyber-500/15 border-cyber-500/30 text-cyber-400'
                  : 'glass border-white/5 text-gray-400 hover:border-white/15'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-1.5">
          {caseType === 'best' ? 'Generates most favorable input for the algorithm.' :
           caseType === 'worst' ? 'Generates least favorable input (max operations).' :
           'Generates typical/random input for average-case behavior.'}
        </p>
      </div>
    </div>
  )
}
