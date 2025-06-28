import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

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
      setLoading(true)
      
      // First, try to fetch existing user profile
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code === 'PGRST116') {
        // User profile doesn't exist, create it
        console.log('Creating new user profile for:', user.email)
        
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert([
            {
              user_id: user.id,
              email: user.email,
              credits: 5, // Free trial credits
              subscription_plan: 'free',
              subscription_status: 'active',
              videos_generated: 0,
              credits_used: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ])
          .select()
          .single()

        if (createError) {
          console.error('Error creating user profile:', createError)
          throw createError
        }

        console.log('User profile created successfully:', newProfile)
        setSubscription('free')
        setCredits(5)
        toast.success('Welcome! You have 5 free credits to get started.')
      } else if (error) {
        console.error('Error fetching user profile:', error)
        throw error
      } else {
        // User profile exists
        console.log('User profile found:', profile)
        setSubscription(profile.subscription_plan)
        setCredits(profile.credits)
      }
    } catch (error) {
      console.error('Error in fetchUserData:', error)
      toast.error('Failed to load user data. Please try refreshing the page.')
      
      // Set default values to prevent blank page
      setSubscription('free')
      setCredits(0)
    } finally {
      setLoading(false)
    }
  }

  const updateCredits = async (newCredits) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          credits: newCredits,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (error) throw error
      setCredits(newCredits)
    } catch (error) {
      console.error('Error updating credits:', error)
      toast.error('Failed to update credits')
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