import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine
} from 'recharts'
import { generateGraphData, COMPLEXITY_COLORS } from '../../utils/complexity'

const VISIBLE = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-lg p-3 border border-white/10 text-xs">
      <p className="text-gray-300 mb-2 font-code">n = {label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="font-code">
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
        </p>
      ))}
    </div>
  )
}

export default function ComplexityGraph({ highlight }) {
  const data = generateGraphData(16)

  return (
    <div className="w-full">
      <h3 className="font-display font-bold text-white text-base mb-4">Complexity Growth Curves</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="n"
            stroke="#4b5563"
            tick={{ fill: '#6b7280', fontSize: 11, fontFamily: 'Fira Code' }}
            label={{ value: 'n (input size)', position: 'insideBottom', offset: -5, fill: '#6b7280', fontSize: 11 }}
          />
          <YAxis
            stroke="#4b5563"
            tick={{ fill: '#6b7280', fontSize: 11 }}
            tickFormatter={v => v > 100 ? '100+' : v.toFixed(0)}
            domain={[0, 100]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '16px', fontSize: '11px', fontFamily: 'Fira Code' }}
          />
          {VISIBLE.map((key) => {
            const color = COMPLEXITY_COLORS[key]?.hex || '#22c55e'
            const isHighlighted = key === highlight
            return (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={color}
                strokeWidth={isHighlighted ? 3 : 1.5}
                dot={false}
                opacity={highlight ? (isHighlighted ? 1 : 0.25) : 0.8}
                strokeDasharray={isHighlighted ? '0' : '0'}
              />
            )
          })}
        </LineChart>
      </ResponsiveContainer>

      {highlight && (
        <div className="mt-3 flex items-center gap-2 text-sm">
          <div
            className="w-3 h-3 rounded-full"
            style={{ background: COMPLEXITY_COLORS[highlight]?.hex || '#22c55e' }}
          />
          <span className="text-gray-300 font-code">
            Your algorithm: <strong style={{ color: COMPLEXITY_COLORS[highlight]?.hex }}>{highlight}</strong>
          </span>
          <span className="text-gray-500">— {COMPLEXITY_COLORS[highlight]?.label}</span>
        </div>
      )}
    </div>
  )
}
