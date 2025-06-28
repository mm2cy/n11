import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Supabase Configuration Check:')
console.log('- URL:', supabaseUrl ? 'Present' : 'Missing')
console.log('- Anon Key:', supabaseAnonKey ? 'Present' : 'Missing')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:')
  console.error('VITE_SUPABASE_URL:', supabaseUrl)
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present' : 'Missing')
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

if (supabaseUrl.includes('your_supabase_url') || supabaseAnonKey.includes('your_supabase_anon_key')) {
  throw new Error('Please replace placeholder values in .env file with actual Supabase credentials')
}

// Test if URL is valid
try {
  new URL(supabaseUrl)
  console.log('✓ Supabase URL is valid')
} catch (error) {
  console.error('✗ Invalid Supabase URL:', supabaseUrl)
  throw new Error('Invalid Supabase URL format')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Test database connection
supabase.from('user_profiles').select('count').limit(1)
  .then(({ data, error }) => {
    if (error) {
      console.error('✗ Database connection test failed:', error)
    } else {
      console.log('✓ Database connection test passed')
    }
  })
  .catch(error => {
    console.error('✗ Database connection error:', error)
  })