import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { getComplexityColor, formatDate } from '../utils/complexity'

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState([])
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    fetchHistory()
  }, [page])

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/history?page=${page}&limit=10`)
      setAnalyses(data.analyses)
      setPagination(data.pagination)
    } catch (err) {
      toast.error('Failed to load history')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this analysis?')) return
    try {
      await api.delete(`/analysis/${id}`)
      setAnalyses(prev => prev.filter(a => a._id !== id))
      if (selected?._id === id) setSelected(null)
      toast.success('Deleted successfully')
    } catch {
      toast.error('Failed to delete')
    }
  }

  if (loading && analyses.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-cyber-500/30 border-t-cyber-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl text-white mb-1">Analysis History ◫</h1>
          <p className="text-gray-400 text-sm">{pagination.total || 0} total analyses</p>
        </div>
        <Link to="/analyzer" className="btn-primary text-sm py-2 px-5">
          New Analysis →
        </Link>
      </div>

      {analyses.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-5xl mb-4">◫</p>
          <h3 className="text-white font-display font-bold mb-2">No analyses yet</h3>
          <p className="text-gray-500 text-sm mb-4">Your analysis history will appear here.</p>
          <Link to="/analyzer" className="btn-primary text-sm">Run First Analysis →</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* List */}
          <div className="lg:col-span-2 space-y-3">
            {analyses.map((item, i) => {
              const colors = getComplexityColor(item.result?.timeComplexity)
              const isSelected = selected?._id === item._id
              return (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelected(item)}
                  className={`glass rounded-xl p-4 border cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-cyber-500/40 bg-cyber-500/5'
                      : 'border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {item.title || 'Untitled Analysis'}
                      </p>
                      <p className="text-gray-500 text-xs mt-0.5">
                        {item.language} · {formatDate(item.createdAt)}
                      </p>
                    </div>
                    <span className={`complexity-badge border text-xs flex-shrink-0 ${colors?.text} ${colors?.bg} ${colors?.border}`}>
                      {item.result?.timeComplexity}
                    </span>
                  </div>
                  {item.result?.detectedPatterns?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.result.detectedPatterns.slice(0, 2).map(p => (
                        <span key={p} className="text-xs text-gray-600 bg-white/5 px-2 py-0.5 rounded-full">{p}</span>
                      ))}
                    </div>
                  )}
                </motion.div>
              )
            })}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex gap-2 justify-center pt-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-ghost text-sm disabled:opacity-30"
                >
                  ← Prev
                </button>
                <span className="text-gray-400 text-sm self-center">
                  {page} / {pagination.pages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="btn-ghost text-sm disabled:opacity-30"
                >
                  Next →
                </button>
              </div>
            )}
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-3">
            {selected ? (
              <motion.div
                key={selected._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="card sticky top-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-display font-bold text-white text-lg">{selected.title || 'Untitled'}</h3>
                    <p className="text-gray-500 text-sm">{selected.language} · {formatDate(selected.createdAt)}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(selected._id)}
                    className="text-red-400 hover:bg-red-400/10 text-xs px-3 py-1.5 rounded-lg transition-all"
                  >
                    Delete
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { label: 'Time', value: selected.result?.timeComplexity },
                    { label: 'Space', value: selected.result?.spaceComplexity }
                  ].map(({ label, value }) => {
                    const c = getComplexityColor(value)
                    return (
                      <div key={label} className={`rounded-xl p-4 border ${c?.border || 'border-white/10'} ${c?.bg || ''}`}>
                        <p className="text-gray-400 text-xs mb-1">{label} Complexity</p>
                        <p className={`font-display font-bold text-2xl ${c?.text}`}>{value}</p>
                      </div>
                    )
                  })}
                </div>

                {selected.result?.explanation && (
                  <div className="mb-4">
                    <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Explanation</p>
                    <p className="text-gray-300 text-sm leading-relaxed">{selected.result.explanation}</p>
                  </div>
                )}

                {selected.result?.optimizationSuggestions?.length > 0 && (
                  <div>
                    <p className="text-cyber-400 text-xs uppercase tracking-wider mb-2">Suggestions</p>
                    <ul className="space-y-2">
                      {selected.result.optimizationSuggestions.map((s, i) => (
                        <li key={i} className="flex gap-2 text-sm text-gray-300">
                          <span className="text-cyber-400 flex-shrink-0">→</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center text-gray-500">
                <p className="text-3xl mb-3">←</p>
                <p className="text-sm">Select an analysis to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
