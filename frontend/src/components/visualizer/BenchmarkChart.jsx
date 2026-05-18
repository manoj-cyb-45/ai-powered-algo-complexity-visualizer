import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceDot, Brush
} from 'recharts'
import { theoreticalPoint, ALGO_META } from '../../utils/algorithms'

const THEORY_COLORS = {
  'O(1)': '#22c55e',
  'O(log n)': '#86efac',
  'O(n)': '#fbbf24',
  'O(n log n)': '#fb923c',
  'O(n²)': '#f87171',
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-lg p-3 border border-white/10 text-xs min-w-[160px]">
      <p className="text-gray-300 mb-2 font-code">n = {Number(label).toLocaleString()}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="font-code mb-0.5">
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(4) : p.value} ms
        </p>
      ))}
    </div>
  )
}

/**
 * BenchmarkChart
 * Props:
 *   points     – [{ n, time, ops }] empirical data
 *   algorithm  – algo key (e.g. 'bubbleSort')
 *   showTheory – bool
 *   isLive     – bool (show live indicator)
 */
export default function BenchmarkChart({ points = [], algorithm, showTheory = true, isLive = false }) {
  if (points.length === 0) {
    return (
      <div className="flex items-center justify-center h-52 text-gray-600 text-sm">
        Run benchmark to see real-time graph →
      </div>
    )
  }

  const meta = ALGO_META[algorithm]
  const maxN = Math.max(...points.map(p => p.n))

  // Build chart data: empirical + theoretical curves
  const chartData = points.map(p => {
    const row = { n: p.n, 'Empirical (ms)': parseFloat(p.time.toFixed(4)) }
    if (showTheory && meta) {
      const notation = meta.timeComplexities.average
      // Scale theoretical to match empirical magnitude
      const empiricalMax = Math.max(...points.map(x => x.time), 0.001)
      const theoryMax = theoreticalPoint(maxN, notation) || 0.001
      const scale = empiricalMax / theoryMax
      Object.entries(THEORY_COLORS).forEach(([key]) => {
        row[`Theory ${key}`] = parseFloat((theoreticalPoint(p.n, key) * scale).toFixed(4))
      })
    }
    return row
  })

  const theoryKeys = showTheory ? Object.keys(THEORY_COLORS) : []

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-display font-bold text-sm">
          Empirical Growth Curve
          {isLive && (
            <span className="ml-2 inline-flex items-center gap-1 text-xs text-cyber-400">
              <span className="w-1.5 h-1.5 bg-cyber-400 rounded-full animate-pulse" />
              LIVE
            </span>
          )}
        </h3>
        {meta && (
          <span className="text-xs text-gray-500 font-code">
            Expected: {meta.timeComplexities.average}
          </span>
        )}
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="n"
            stroke="#374151"
            tick={{ fill: '#6b7280', fontSize: 10, fontFamily: 'Fira Code' }}
            tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v}
          />
          <YAxis
            stroke="#374151"
            tick={{ fill: '#6b7280', fontSize: 10 }}
            tickFormatter={v => v.toFixed(2)}
            label={{ value: 'ms', angle: -90, position: 'insideLeft', fill: '#6b7280', fontSize: 10 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'Fira Code', paddingTop: '10px' }} />

          {/* Empirical line */}
          <Line
            type="monotone"
            dataKey="Empirical (ms)"
            stroke={meta?.color || '#22c55e'}
            strokeWidth={2.5}
            dot={{ r: 3, fill: meta?.color || '#22c55e' }}
            activeDot={{ r: 5 }}
            connectNulls
          />

          {/* Theoretical overlays */}
          {theoryKeys.map(key => (
            <Line
              key={key}
              type="monotone"
              dataKey={`Theory ${key}`}
              stroke={THEORY_COLORS[key]}
              strokeWidth={1}
              strokeDasharray="4 3"
              dot={false}
              opacity={0.5}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-2 flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5" style={{ background: meta?.color || '#22c55e' }} />
          <span className="text-gray-400">Measured</span>
        </div>
        {showTheory && theoryKeys.map(key => (
          <div key={key} className="flex items-center gap-1.5">
            <div className="w-4 h-px border-t border-dashed" style={{ borderColor: THEORY_COLORS[key] }} />
            <span className="text-gray-600">{key}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
