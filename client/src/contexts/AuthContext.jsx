import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })
      if (error) {
        if (error.message.includes('provider is not enabled')) {
          toast.error('Google authentication is not configured. Please use email authentication instead.')
          return
        }
        if (error.message.includes('redirect_uri_mismatch')) {
          toast.error('Google OAuth is not properly configured. Please use email authentication instead.')
          return
        }
        throw error
      }
    } catch (error) {
      toast.error('Failed to sign in with Google. Please use email authentication instead.')
      console.error('Error:', error)
    }
  }

  const signInWithEmail = async (email, password) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error
      toast.success('Signed in successfully')
    } catch (error) {
      toast.error(error.message || 'Failed to sign in')
      console.error('Error:', error)
    }
  }

  const signUpWithEmail = async (email, password) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password
      })
      if (error) throw error
      toast.success('Account created successfully! Please check your email for verification.')
    } catch (error) {
      toast.error(error.message || 'Failed to create account')
      console.error('Error:', error)
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      toast.success('Signed out successfully')
    } catch (error) {
      toast.error('Failed to sign out')
      console.error('Error:', error)
    }
  }

  const value = {
    user,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}