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
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user) {
      console.log('SubscriptionContext: User found, fetching data for:', user.email)
      fetchUserData()
    } else {
      console.log('SubscriptionContext: No user, resetting state')
      setSubscription(null)
      setCredits(0)
      setLoading(false)
      setError(null)
    }
  }, [user])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('SubscriptionContext: Fetching user profile for user ID:', user.id)
      
      // Test database connection first
      const { data: testData, error: testError } = await supabase
        .from('user_profiles')
        .select('count')
        .limit(1)
      
      if (testError) {
        console.error('Database connection test failed:', testError)
        throw new Error(`Database connection failed: ${testError.message}`)
      }
      
      console.log('Database connection test passed')
      
      // Try to fetch existing user profile
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      console.log('Profile query result:', { profile, error })

      if (error && error.code === 'PGRST116') {
        // User profile doesn't exist, create it
        console.log('SubscriptionContext: Creating new user profile for:', user.email)
        
        const newProfileData = {
          user_id: user.id,
          email: user.email,
          credits: 5,
          subscription_plan: 'free',
          subscription_status: 'active',
          videos_generated: 0,
          credits_used: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        console.log('Inserting new profile:', newProfileData)
        
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert([newProfileData])
          .select()
          .single()

        if (createError) {
          console.error('Error creating user profile:', createError)
          throw new Error(`Failed to create user profile: ${createError.message}`)
        }

        console.log('SubscriptionContext: User profile created successfully:', newProfile)
        setSubscription('free')
        setCredits(5)
        toast.success('Welcome! You have 5 free credits to get started.')
      } else if (error) {
        console.error('Error fetching user profile:', error)
        throw new Error(`Failed to fetch user profile: ${error.message}`)
      } else {
        // User profile exists
        console.log('SubscriptionContext: User profile found:', profile)
        setSubscription(profile.subscription_plan || 'free')
        setCredits(profile.credits || 0)
      }
    } catch (error) {
      console.error('SubscriptionContext: Error in fetchUserData:', error)
      setError(error.message)
      
      // Show user-friendly error message
      toast.error('Failed to load user data. Please check your internet connection and try again.')
      
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
    error,
    updateCredits,
    fetchUserData
  }

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  )
}