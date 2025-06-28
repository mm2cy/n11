import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import { Check, Star } from 'lucide-react'
import toast from 'react-hot-toast'

const Pricing = () => {
  const { user } = useAuth()
  const { subscription } = useSubscription()
  const [loading, setLoading] = useState(null)

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: '$6',
      period: '/week',
      description: 'Perfect for getting started',
      features: [
        '10 videos per week',
        '480p & 720p resolution',
        'Multi-person conversations',
        'Audio-driven generation',
        'Email support'
      ],
      popular: false
    },
    {
      id: 'mid',
      name: 'Mid',
      price: '$12',
      period: '/2 weeks',
      description: 'Best value for regular users',
      features: [
        'Unlimited videos',
        '480p & 720p resolution',
        'Multi-person conversations',
        'Audio-driven generation',
        'Priority processing',
        'Email support'
      ],
      popular: true
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$26',
      period: '/month',
      description: 'For power users and businesses',
      features: [
        'Unlimited videos',
        '480p & 720p resolution',
        'Multi-person conversations',
        'Audio-driven generation',
        'Fastest processing',
        'Priority support',
        'API access (coming soon)'
      ],
      popular: false
    }
  ]

  const handleSubscribe = async (planId) => {
    if (!user) {
      toast.error('Please sign in to subscribe')
      return
    }

    setLoading(planId)

    try {
      // In a real implementation, you would integrate with Paddle here
      // For now, we'll simulate the subscription process
      
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          planId: planId
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create subscription')
      }

      // Redirect to Paddle checkout
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl
      } else {
        toast.success('Subscription created successfully!')
      }
    } catch (error) {
      console.error('Error creating subscription:', error)
      toast.error(error.message || 'Failed to create subscription')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Start with our free trial and upgrade when you're ready for more
        </p>
      </div>

      {/* Free Trial Card */}
      <div className="mb-8">
        <div className="card p-6 border-2 border-green-200 bg-green-50">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Free Trial</h3>
            <p className="text-3xl font-bold text-green-600 mb-2">5 Credits</p>
            <p className="text-gray-600 mb-4">Perfect for trying out MultiTalk</p>
            <ul className="text-sm text-gray-600 space-y-1 mb-4">
              <li>✓ 5 video generations</li>
              <li>✓ All features included</li>
              <li>✓ No credit card required</li>
            </ul>
            {!user && (
              <button className="btn-primary">
                Start Free Trial
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Subscription Plans */}
      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`card p-6 relative ${
              plan.popular ? 'border-2 border-primary-500 shadow-lg' : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                  <Star className="h-4 w-4 mr-1" />
                  Most Popular
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
              <div className="mb-2">
                <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                <span className="text-gray-600">{plan.period}</span>
              </div>
              <p className="text-gray-600">{plan.description}</p>
            </div>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center text-sm text-gray-600">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan.id)}
              disabled={loading === plan.id || subscription === plan.id}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                plan.popular
                  ? 'bg-primary-600 hover:bg-primary-700 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading === plan.id ? (
                <div className="flex items-center justify-center">
                  <div className="loading-spinner w-4 h-4 mr-2"></div>
                  Processing...
                </div>
              ) : subscription === plan.id ? (
                'Current Plan'
              ) : (
                'Subscribe'
              )}
            </button>
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">What is a credit?</h3>
            <p className="text-gray-600">
              One credit equals one video generation. Each video you create uses one credit.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h3>
            <p className="text-gray-600">
              Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
            <p className="text-gray-600">
              We accept all major credit cards and digital wallets through our secure payment processor Paddle.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Is there a free trial?</h3>
            <p className="text-gray-600">
              Yes! Every new user gets 5 free credits to try out MultiTalk with no credit card required.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Pricing