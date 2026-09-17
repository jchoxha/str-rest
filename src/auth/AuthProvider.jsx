import { useEffect, useState, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { AuthContext } from './auth-context'

const LOCAL_SESSION_KEY = 'str_rest_test_session'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [testSession, setTestSession] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_SESSION_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(!testSession && isSupabaseConfigured)

  useEffect(() => {
    if (testSession || !isSupabaseConfigured) return

    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession(data?.session || null)
      setLoading(false)
    }).catch(() => {
      if (mounted) setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    return () => {
      mounted = false
      sub?.subscription?.unsubscribe()
    }
  }, [testSession])

  const signInAsAdmin = useCallback(() => {
    const adminUser = {
      id: 'admin-host-001',
      email: 'admin@str.rest',
      user_metadata: { display_name: 'Admin Host', is_admin: true },
      isAdmin: true,
      isTestMode: true,
    }
    const sess = { user: adminUser, isAdmin: true }
    try {
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(sess))
    } catch (e) {
      console.warn('Could not save test session to localStorage', e)
    }
    setTestSession(sess)
    setLoading(false)
  }, [])

  const signInAsTestUser = useCallback((email = 'host@str.rest', name = 'Test Host') => {
    const isAdm = email.toLowerCase() === 'admin@str.rest'
    const testUser = {
      id: isAdm ? 'admin-host-001' : 'test-host-002',
      email,
      user_metadata: { display_name: name, is_admin: isAdm },
      isAdmin: isAdm,
      isTestMode: true,
    }
    const sess = { user: testUser, isAdmin: isAdm }
    try {
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(sess))
    } catch (e) {
      console.warn('Could not save test session to localStorage', e)
    }
    setTestSession(sess)
    setLoading(false)
  }, [])

  const signOut = useCallback(async () => {
    try {
      localStorage.removeItem(LOCAL_SESSION_KEY)
    } catch (e) {
      console.warn('Could not remove test session from localStorage', e)
    }
    setTestSession(null)
    setSession(null)
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut()
      } catch (err) {
        console.warn('Supabase signout failed', err)
      }
    }
  }, [])

  const effectiveUser = testSession?.user || session?.user || null
  const isAdmin = Boolean(
    testSession?.isAdmin ||
    effectiveUser?.isAdmin ||
    effectiveUser?.email === 'admin@str.rest' ||
    effectiveUser?.user_metadata?.is_admin
  )

  const value = {
    session: testSession || session,
    user: effectiveUser,
    isAdmin,
    loading,
    signOut,
    signInAsAdmin,
    signInAsTestUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
