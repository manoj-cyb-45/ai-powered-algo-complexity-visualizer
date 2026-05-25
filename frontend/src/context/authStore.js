import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../utils/api'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/auth/login', { email, password })
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false
          })
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
          return { success: true, message: data.message }
        } catch (error) {
          set({ isLoading: false })
          return { success: false, error: error.response?.data?.error || 'Login failed' }
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/auth/register', { name, email, password })
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false
          })
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
          return { success: true, message: data.message }
        } catch (error) {
          set({ isLoading: false })
          return { success: false, error: error.response?.data?.error || 'Registration failed' }
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
        delete api.defaults.headers.common['Authorization']
      },

      initAuth: () => {
        const { token } = get()
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        }
      }
    }),
    {
      name: 'algo-auth',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated })
    }
  )
)

export default useAuthStore
