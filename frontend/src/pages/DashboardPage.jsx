import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../utils/api'
import useAuthStore from '../context/authStore'
import { getComplexityColor, formatDate } from '../utils/complexity'

const statVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1 } })
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const user = useAuthStore(s => s.user)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/history/stats')
      setStats(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const pieData = stats?.stats?.map(s => ({
    name: s._id || 'Unknown',
    value: s.count,
    color: getComplexityColor(s._id)?.hex || '#22c55e'
  })) || []

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-cyber-500/30 border-t-cyber-500 rounded-full animate-spin" />
          <p className="text-gray-400 font-body">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-display font-bold text-3xl text-white mb-1">
          Good {getTimeOfDay()}, {user?.name?.split(' ')[0]} ◉
        </h1>
        <p className="text-gray-400 font-body">Here's your algorithm analysis overview.</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          {
            label: 'Total Analyses',
            value: stats?.totalAnalyses || 0,
            icon: '◈',
            color: 'cyber'
          },
          {
            label: 'Most Common',
            value: stats?.stats?.[0]?._id || 'N/A',
            icon: '⬡',
            color: 'emerald'
          },
          {
            label: 'Recent (7 days)',
            value: stats?.recentActivity?.length || 0,
            icon: '◫',
            color: 'yellow'
          }
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            custom={i}
            variants={statVariants}
            initial="hidden"
            animate="visible"
            className="card"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm font-body">{stat.label}</span>
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <p className="font-display font-bold text-3xl text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Complexity Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <h2 className="font-display font-bold text-lg text-white mb-4">Complexity Distribution</h2>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} opacity={0.8} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#0d1424', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-2">
                {pieData.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                    <span className="text-gray-400 text-xs font-code">{d.name} ({d.value})</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-gray-500">
              <p className="text-4xl mb-3">◎</p>
              <p className="text-sm">No analyses yet</p>
              <Link to="/analyzer" className="text-cyber-400 text-sm mt-2 hover:underline">
                Run your first analysis →
              </Link>
            </div>
          )}
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg text-white">Recent Activity</h2>
            <Link to="/history" className="text-cyber-400 text-sm hover:text-cyber-300 transition-colors">
              View all →
            </Link>
          </div>

          {stats?.recentActivity?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentActivity.map((item) => {
                const colors = getComplexityColor(item.result?.timeComplexity)
                return (
                  <div key={item._id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="text-white text-sm font-medium truncate">{item.title || 'Untitled'}</p>
                      <p className="text-gray-500 text-xs">{item.language} · {formatDate(item.createdAt)}</p>
                    </div>
                    <span
                      className={`complexity-badge border text-xs flex-shrink-0 ${colors?.text} ${colors?.bg} ${colors?.border}`}
                    >
                      {item.result?.timeComplexity}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
              <p className="text-sm">No recent analyses</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick Start */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-xl p-6 border border-cyber-500/20 flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div>
          <h3 className="font-display font-bold text-white text-lg mb-1">Ready to analyze?</h3>
          <p className="text-gray-400 text-sm">Paste your code and get instant Big-O complexity analysis.</p>
        </div>
        <Link to="/analyzer" className="btn-primary whitespace-nowrap flex-shrink-0">
          Open Analyzer →
        </Link>
      </motion.div>
    </div>
  )
}

function getTimeOfDay() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 18) return 'afternoon'
  return 'evening'
}
