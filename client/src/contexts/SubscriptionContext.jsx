import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '../lib/supabase'

const SubscriptionContext = createContext({})

export const useSubscription = () => {
  const context = useContext(SubscriptionContext)
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}

export const SubscriptionProvider = ({ children }) => {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState(null)
  const [credits, setCredits] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchUserData()
    } else {
      setSubscription(null)
      setCredits(0)
      setLoading(false)
    }
  }, [user])

  const fetchUserData = async () => {
    try {
      // Fetch user profile with subscription and credits
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (profile) {
        setSubscription(profile.subscription_plan)
        setCredits(profile.credits)
      } else {
        // Create new user profile with free trial credits
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert([
            {
              user_id: user.id,
              email: user.email,
              credits: 5, // Free trial credits
              subscription_plan: 'free',
              created_at: new Date().toISOString()
            }
          ])
          .select()
          .single()

        if (createError) throw createError

        setSubscription('free')
        setCredits(5)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateCredits = async (newCredits) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ credits: newCredits })
        .eq('user_id', user.id)

      if (error) throw error
      setCredits(newCredits)
    } catch (error) {
      console.error('Error updating credits:', error)
    }
  }

  const value = {
    subscription,
    credits,
    loading,
    updateCredits,
    fetchUserData
  }

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  )
}