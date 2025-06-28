import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import { supabase } from '../lib/supabase'
import { User, CreditCard, Calendar, Mail } from 'lucide-react'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user } = useAuth()
  const { subscription, credits, fetchUserData } = useSubscription()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [user])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getSubscriptionStatus = () => {
    if (!profile) return 'Unknown'
    
    switch (subscription) {
      case 'free':
        return 'Free Trial'
      case 'starter':
        return 'Starter Plan'
      case 'mid':
        return 'Mid Plan'
      case 'pro':
        return 'Pro Plan'
      default:
        return 'Free Trial'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-2">Manage your account settings and subscription</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Information</h2>
            
            <div className="space-y-6">
              <div className="flex items-center">
                <div className="bg-primary-100 p-3 rounded-full mr-4">
                  <User className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Email Address</p>
                  <p className="text-lg text-gray-900">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-full mr-4">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Member Since</p>
                  <p className="text-lg text-gray-900">
                    {profile?.created_at ? formatDate(profile.created_at) : 'Unknown'}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-full mr-4">
                  <Mail className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Account Status</p>
                  <p className="text-lg text-gray-900">Active</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Info */}
        <div>
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Subscription</h2>
            
            <div className="space-y-4">
              <div className="text-center">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CreditCard className="h-8 w-8 text-primary-600" />
                </div>
                <p className="text-sm font-medium text-gray-600">Current Plan</p>
                <p className="text-xl font-bold text-gray-900">{getSubscriptionStatus()}</p>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Credits Remaining</span>
                  <span className="text-lg font-semibold text-gray-900">{credits}</span>
                </div>
                
                {subscription === 'free' && (
                  <div className="mt-4">
                    <button
                      onClick={() => window.location.href = '/pricing'}
                      className="w-full btn-primary"
                    >
                      Upgrade Plan
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Usage Stats */}
          <div className="card p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Statistics</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Videos Generated</span>
                <span className="text-sm font-medium text-gray-900">
                  {profile?.videos_generated || 0}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Credits Used</span>
                <span className="text-sm font-medium text-gray-900">
                  {profile?.credits_used || 0}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Last Activity</span>
                <span className="text-sm font-medium text-gray-900">
                  {profile?.last_activity ? formatDate(profile.last_activity) : 'Never'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile