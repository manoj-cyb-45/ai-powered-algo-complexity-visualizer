import { useState, useCallback } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts'
import { motion } from 'framer-motion'
import { ALGO_META, benchmarkAlgorithm, generateArray } from '../../utils/algorithms'
import toast from 'react-hot-toast'

const COMPARISON_GROUPS = [
  {
    id: 'search',
    label: 'Search Algorithms',
    algos: ['linearSearch', 'binarySearch'],
    desc: 'Linear vs Binary Search performance comparison'
  },
  {
    id: 'sort',
    label: 'Sorting Algorithms',
    algos: ['bubbleSort', 'mergeSort', 'quickSort'],
    desc: 'Bubble vs Merge vs Quick Sort performance'
  },
  {
    id: 'all',
    label: 'All Algorithms',
    algos: ['linearSearch', 'binarySearch', 'bubbleSort', 'mergeSort', 'quickSort'],
    desc: 'Full comparison across all implemented algorithms'
  }
]

const TEST_SIZES = [100, 500, 1000, 2000, 5000, 10000]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-lg p-3 border border-white/10 text-xs">
      <p className="text-gray-300 mb-1 font-code">n = {Number(label).toLocaleString()}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="font-code">
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(4) : 0} ms
        </p>
      ))}
    </div>
  )
}

export default function CompareChart() {
  const [group, setGroup] = useState('sort')
  const [inputType, setInputType] = useState('random')
  const [chartData, setChartData] = useState([])
  const [barData, setBarData] = useState([])
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)

  const runComparison = useCallback(async () => {
    const selected = COMPARISON_GROUPS.find(g => g.id === group)
    if (!selected) return

    setRunning(true)
    setChartData([])
    setBarData([])
    setProgress(0)

    const results = {} // { algoKey: [{ n, time }] }
    selected.algos.forEach(a => { results[a] = [] })

    const total = TEST_SIZES.length * selected.algos.length
    let done = 0

    try {
      for (const n of TEST_SIZES) {
        const arr = generateArray(n, inputType)
        for (const algoKey of selected.algos) {
          // Yield to UI between runs
          await new Promise(r => setTimeout(r, 0))
          const { time, ops } = benchmarkAlgorithm(algoKey, arr)
          results[algoKey].push({ n, time, ops })
          done++
          setProgress(Math.round((done / total) * 100))
        }

        // Build chart row after each size
        const row = { n }
        selected.algos.forEach(a => {
          const last = results[a][results[a].length - 1]
          row[ALGO_META[a].label] = parseFloat(last.time.toFixed(4))
        })
        setChartData(prev => [...prev, row])
      }

      // Bar chart data (final n)
      const finalN = TEST_SIZES[TEST_SIZES.length - 1]
      const bars = selected.algos.map(a => ({
        name: ALGO_META[a].label,
        time: parseFloat(results[a][results[a].length - 1].time.toFixed(4)),
        ops: results[a][results[a].length - 1].ops,
        complexity: ALGO_META[a].timeComplexities.average,
        color: ALGO_META[a].color
      }))
      setBarData(bars)
      toast.success(`Comparison complete at n=${finalN.toLocaleString()}`)
    } catch (err) {
      toast.error('Comparison failed: ' + err.message)
    } finally {
      setRunning(false)
      setProgress(100)
    }
  }, [group, inputType])

  const selectedGroup = COMPARISON_GROUPS.find(g => g.id === group)

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label className="text-gray-400 text-xs mb-1.5 block uppercase tracking-wider">Comparison Group</label>
          <div className="flex gap-2 flex-wrap">
            {COMPARISON_GROUPS.map(g => (
              <button
                key={g.id}
                onClick={() => setGroup(g.id)}
                disabled={running}
                className={`text-xs px-3 py-2 rounded-lg border transition-all disabled:opacity-40 ${
                  group === g.id
                    ? 'bg-cyber-500/15 border-cyber-500/30 text-cyber-400'
                    : 'glass border-white/5 text-gray-400 hover:border-white/15'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-gray-400 text-xs mb-1.5 block uppercase tracking-wider">Array Type</label>
          <select
            value={inputType}
            onChange={e => setInputType(e.target.value)}
            disabled={running}
            className="input-field text-sm w-40 py-2 bg-void-800/50 disabled:opacity-40"
          >
            <option value="random">Random</option>
            <option value="sorted">Sorted</option>
            <option value="reverse">Reverse</option>
            <option value="nearly">Nearly Sorted</option>
          </select>
        </div>
      </div>

      {/* Run Button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={runComparison}
        disabled={running}
        className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-60"
      >
        {running ? (
          <>
            <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            Running comparison... {progress}%
          </>
        ) : '⚖ Run Comparison'}
      </motion.button>

      {/* Progress Bar */}
      {running && (
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-cyber-500 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}

      {/* Growth Curves */}
      {chartData.length > 0 && (
        <div>
          <h4 className="text-white font-display font-bold text-sm mb-3">
            Runtime Growth Curves
            <span className="text-gray-500 font-normal font-body text-xs ml-2">
              (n = 100 → {TEST_SIZES[TEST_SIZES.length-1].toLocaleString()})
            </span>
          </h4>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="n"
                stroke="#374151"
                tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'Fira Code' }}
                tickFormatter={v => v >= 1000 ? `${v/1000}K` : v}
              />
              <YAxis
                stroke="#374151"
                tick={{ fill: '#6b7280', fontSize: 10 }}
                tickFormatter={v => v.toFixed(2)}
                label={{ value: 'ms', angle: -90, position: 'insideLeft', fill: '#6b7280', fontSize: 10 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'Fira Code', paddingTop: '8px' }} />
              {selectedGroup?.algos.map(a => (
                <Line
                  key={a}
                  type="monotone"
                  dataKey={ALGO_META[a].label}
                  stroke={ALGO_META[a].color}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Bar Chart + Table at final n */}
      {barData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Bar Chart */}
          <div>
            <h4 className="text-white font-display font-bold text-sm mb-3">
              At n = {TEST_SIZES[TEST_SIZES.length-1].toLocaleString()}
            </h4>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={barData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 9 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 9 }} tickFormatter={v => v.toFixed(2)} />
                <Tooltip contentStyle={{ background: '#0d1424', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="time" name="Time (ms)" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} opacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Comparison Table */}
          <div>
            <h4 className="text-white font-display font-bold text-sm mb-3">Comparison Table</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 text-gray-400 font-normal">Algorithm</th>
                    <th className="text-right py-2 text-gray-400 font-normal">Time (ms)</th>
                    <th className="text-right py-2 text-gray-400 font-normal">Ops</th>
                    <th className="text-right py-2 text-gray-400 font-normal">Complexity</th>
                  </tr>
                </thead>
                <tbody>
                  {barData
                    .slice()
                    .sort((a, b) => a.time - b.time)
                    .map((row, i) => (
                      <tr key={row.name} className="border-b border-white/5">
                        <td className="py-2 flex items-center gap-2">
                          {i === 0 && <span className="text-cyber-400">★</span>}
                          <span style={{ color: row.color }}>{row.name}</span>
                        </td>
                        <td className="py-2 text-right font-code text-gray-300">{row.time.toFixed(4)}</td>
                        <td className="py-2 text-right font-code text-gray-500">{row.ops.toLocaleString()}</td>
                        <td className="py-2 text-right font-code text-gray-400">{row.complexity}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
