import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import useAuthStore from '../../context/authStore'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '⬡' },
  { path: '/analyzer', label: 'AI Analyzer', icon: '◈' },
  { path: '/visualizer', label: 'Visualizer', icon: '▶' },
  { path: '/history', label: 'History', icon: '◫' },
  { path: '/about', label: 'About', icon: '◉' },
]

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  return (
    <div className="flex h-screen bg-void-900 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 glass-dark border-r border-white/5 p-6 gap-6">
        {/* Logo */}
        <NavLink to="/dashboard" className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-lg bg-cyber-500/20 border border-cyber-500/40 flex items-center justify-center">
            <span className="text-cyber-400 font-display font-bold text-lg">A</span>
          </div>
          <span className="font-display font-bold text-white text-lg tracking-tight">AlgoLens</span>
        </NavLink>

        {/* Nav Links */}
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg font-body text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-cyber-500/15 text-cyber-400 border border-cyber-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User Info */}
        <div className="border-t border-white/5 pt-4">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyber-500 to-emerald-600 flex items-center justify-center text-black font-bold text-sm flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-sm font-medium truncate">{user?.name}</p>
              <p className="text-gray-500 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-400/10 rounded-lg text-sm transition-all duration-200 font-body"
          >
            Sign Out →
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 glass-dark border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <span className="font-display font-bold text-white">AlgoLens</span>
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-gray-400 hover:text-white p-2"
        >
          ☰
        </button>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="md:hidden fixed inset-0 bg-black/60 z-50"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 30 }}
              className="md:hidden fixed top-0 left-0 h-full w-64 glass-dark border-r border-white/10 z-50 p-6 flex flex-col gap-6"
            >
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-white text-lg">AlgoLens</span>
                <button onClick={() => setSidebarOpen(false)} className="text-gray-400">✕</button>
              </div>
              <nav className="flex flex-col gap-1 flex-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${
                        isActive ? 'bg-cyber-500/15 text-cyber-400 border border-cyber-500/20' : 'text-gray-400'
                      }`
                    }
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </NavLink>
                ))}
              </nav>
              <button onClick={handleLogout} className="text-red-400 text-sm text-left px-4 py-2">Sign Out →</button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto md:pt-0 pt-14">
        <Outlet />
      </main>
    </div>
  )
}
