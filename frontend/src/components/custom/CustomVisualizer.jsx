import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Color map ──────────────────────────────────────────────────────────────────
const TYPE_COLORS = {
  compare:       { bar: '#fbbf24', glow: 'rgba(251,191,36,0.35)',  label: 'Comparing' },
  swap:          { bar: '#fb923c', glow: 'rgba(251,146,60,0.35)',  label: 'Swapping'  },
  sorted:        { bar: '#22c55e', glow: 'rgba(34,197,94,0.25)',   label: 'Sorted'    },
  found:         { bar: '#4ade80', glow: 'rgba(74,222,128,0.4)',   label: 'Found'     },
  pivot:         { bar: '#c084fc', glow: 'rgba(192,132,252,0.35)', label: 'Pivot'     },
  active:        { bar: '#60a5fa', glow: 'rgba(96,165,250,0.35)',  label: 'Active'    },
  mark:          { bar: '#f472b6', glow: 'rgba(244,114,182,0.35)', label: 'Marked'    },
  set:           { bar: '#2dd4bf', glow: 'rgba(45,212,191,0.35)',  label: 'Set'       },
  binary_compare:{ bar: '#fbbf24', glow: 'rgba(251,191,36,0.35)',  label: 'Compare'   },
  _default:      { bar: '#1e3a2f', glow: 'transparent',            label: ''          },
  _sorted_done:  { bar: '#14532d', glow: 'transparent',            label: ''          },
}

const POINTER_COLORS = ['#22c55e', '#60a5fa', '#c084fc', '#fb923c', '#f472b6']

/**
 * CustomArrayViz
 * Enhanced array visualizer showing:
 *  - colour-coded bars by step type
 *  - value labels above each bar
 *  - index labels below each bar
 *  - named pointer arrows (i, j, pivot, mid, …)
 *  - "sorted" overlay for permanently done elements
 */
export default function CustomArrayViz({ array, step, maxValue, isRunning }) {
  const n           = array.length
  const displayMax  = maxValue || Math.max(...array, 1)
  const activeSet   = useMemo(() => new Set(step?.indices || []), [step])
  const sortedSet   = useMemo(() => new Set(step?.sorted  || []), [step])
  const pointers    = step?.pointers || {}

  // ── pointer name → colour ──────────────────────────────────────────────
  const ptrNames = Object.keys(pointers)
  const ptrColor = (name) =>
    POINTER_COLORS[ptrNames.indexOf(name) % POINTER_COLORS.length]

  // ── bar colour per index ───────────────────────────────────────────────
  const barStyle = (idx) => {
    if (!step) {
      return sortedSet.has(idx)
        ? TYPE_COLORS._sorted_done
        : TYPE_COLORS._default
    }
    if (sortedSet.has(idx))      return TYPE_COLORS._sorted_done
    if (!activeSet.has(idx))     return TYPE_COLORS._default

    const c = TYPE_COLORS[step.type] || TYPE_COLORS._default
    return c
  }

  // ── show value/index labels only when array is small enough ───────────
  const showLabels = n <= 40
  const showValues = n <= 20

  // ── bar height: minimum 6 % so tiny values are still visible ──────────
  const barHeight = (val) => Math.max(6, (val / displayMax) * 92)

  return (
    <div className="w-full select-none">
      {/* ── Pointer strip (above bars) ── */}
      <div
        className="relative flex items-end"
        style={{ height: '28px', marginBottom: '4px' }}
      >
        {ptrNames.length > 0 && array.map((_, idx) => {
          const ptrs = ptrNames.filter(name => pointers[name] === idx)
          if (!ptrs.length) return <div key={idx} style={{ flex: 1 }} />
          return (
            <div
              key={idx}
              style={{ flex: 1 }}
              className="relative flex flex-col items-center"
            >
              {ptrs.map((name, pi) => (
                <motion.div
                  key={name}
                  layout
                  className="text-center"
                  style={{ lineHeight: 1 }}
                >
                  <span
                    className="text-xs font-bold font-code"
                    style={{ color: ptrColor(name), fontSize: n > 20 ? '9px' : '11px' }}
                  >
                    {name}
                  </span>
                  <div
                    className="mx-auto"
                    style={{
                      width: 2,
                      height: 6,
                      background: ptrColor(name),
                      marginTop: 2,
                    }}
                  />
                </motion.div>
              ))}
            </div>
          )
        })}
      </div>

      {/* ── Bar area ── */}
      <div
        className="flex items-end gap-px w-full rounded-t-sm overflow-hidden"
        style={{ height: '180px' }}
      >
        {array.map((val, idx) => {
          const hPct   = barHeight(val)
          const style  = barStyle(idx)
          const active = activeSet.has(idx)

          return (
            <motion.div
              key={idx}
              layout
              className="relative flex flex-col justify-end"
              style={{ flex: 1, height: '100%' }}
            >
              {/* Value label above bar */}
              {showValues && (
                <div
                  className="absolute w-full text-center"
                  style={{
                    bottom: `${hPct}%`,
                    fontSize: '9px',
                    color: active ? '#fff' : '#4b5563',
                    fontFamily: 'Fira Code, monospace',
                    pointerEvents: 'none',
                    marginBottom: 2,
                    transition: 'bottom 0.12s ease',
                  }}
                >
                  {val}
                </div>
              )}

              {/* The bar itself */}
              <motion.div
                layout
                style={{
                  height:          `${hPct}%`,
                  backgroundColor: style.bar,
                  borderRadius:    '2px 2px 0 0',
                  minWidth:        '2px',
                  boxShadow:       active ? `0 0 8px ${style.glow}` : 'none',
                  transition:      'background-color 0.1s ease, height 0.12s ease, box-shadow 0.1s ease',
                }}
              />
            </motion.div>
          )
        })}
      </div>

      {/* ── Index labels below bars ── */}
      {showLabels && (
        <div
          className="flex gap-px w-full"
          style={{ marginTop: 3 }}
        >
          {array.map((_, idx) => (
            <div
              key={idx}
              style={{
                flex: 1,
                textAlign: 'center',
                fontSize: n > 24 ? '8px' : '10px',
                color: '#374151',
                fontFamily: 'Fira Code, monospace',
              }}
            >
              {idx}
            </div>
          ))}
        </div>
      )}

      {/* ── Legend ── */}
      <div className="mt-3 flex items-center gap-3 flex-wrap">
        {step && (
          <span className="text-xs font-code px-2.5 py-1 rounded-full border border-white/10 text-gray-400">
            <span style={{ color: (TYPE_COLORS[step.type] || TYPE_COLORS._default).bar }}>
              ●
            </span>{' '}
            <span className="text-white capitalize">
              {step.type?.replace(/_/g, ' ')}
            </span>
            {step.indices?.length > 0 && (
              <span className="text-gray-600">
                {' '}[{step.indices.slice(0, 4).join(', ')}{step.indices.length > 4 ? '…' : ''}]
              </span>
            )}
          </span>
        )}

        {/* Static legend dots */}
        <div className="flex gap-3 flex-wrap">
          {[
            ['compare', 'Comparing'],
            ['swap',    'Swapping' ],
            ['pivot',   'Pivot'    ],
            ['sorted',  'Sorted'   ],
            ['found',   'Found'    ],
          ].map(([type, lbl]) => (
            <div key={type} className="flex items-center gap-1">
              <div
                className="w-2 h-2 rounded-sm"
                style={{ background: TYPE_COLORS[type]?.bar }}
              />
              <span className="text-gray-500 text-xs">{lbl}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
