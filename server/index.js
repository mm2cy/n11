import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import multer from 'multer'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import cron from 'node-cron'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3000'],
  credentials: true
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})
app.use('/api/', limiter)

// Multer configuration for file uploads
const storage = multer.memoryStorage()
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'audio') {
      if (file.mimetype.startsWith('audio/')) {
        cb(null, true)
      } else {
        cb(new Error('Only audio files are allowed for audio field'))
      }
    } else if (file.fieldname === 'image') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true)
      } else {
        cb(new Error('Only image files are allowed for image field'))
      }
    } else {
      cb(new Error('Unexpected field'))
    }
  }
})

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Generate video endpoint
app.post('/api/generate-video', upload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'image', maxCount: 1 }
]), async (req, res) => {
  try {
    const { prompt, resolution, frameNum, userId } = req.body
    const audioFile = req.files?.audio?.[0]
    const imageFile = req.files?.image?.[0]

    if (!prompt || !audioFile || !imageFile || !userId) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Verify user has credits
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('credits')
      .eq('user_id', userId)
      .single()

    if (profileError || !profile || profile.credits < 1) {
      return res.status(400).json({ error: 'Insufficient credits' })
    }

    // Upload files to Supabase Storage
    const audioFileName = `${userId}/${Date.now()}_audio.${audioFile.originalname.split('.').pop()}`
    const imageFileName = `${userId}/${Date.now()}_image.${imageFile.originalname.split('.').pop()}`

    const { data: audioUpload, error: audioError } = await supabase.storage
      .from('user-uploads')
      .upload(audioFileName, audioFile.buffer, {
        contentType: audioFile.mimetype
      })

    if (audioError) {
      throw new Error('Failed to upload audio file')
    }

    const { data: imageUpload, error: imageError } = await supabase.storage
      .from('user-uploads')
      .upload(imageFileName, imageFile.buffer, {
        contentType: imageFile.mimetype
      })

    if (imageError) {
      throw new Error('Failed to upload image file')
    }

    // Create video generation record
    const { data: videoRecord, error: videoError } = await supabase
      .from('generated_videos')
      .insert([
        {
          user_id: userId,
          prompt: prompt,
          audio_url: audioFileName,
          image_url: imageFileName,
          resolution: resolution,
          frame_num: parseInt(frameNum),
          status: 'processing',
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (videoError) {
      throw new Error('Failed to create video record')
    }

    // Deduct credit
    const { error: creditError } = await supabase
      .from('user_profiles')
      .update({ credits: profile.credits - 1 })
      .eq('user_id', userId)

    if (creditError) {
      throw new Error('Failed to deduct credit')
    }

    // In a real implementation, you would queue the video generation job here
    // For now, we'll simulate it by updating the status after a delay
    setTimeout(async () => {
      await simulateVideoGeneration(videoRecord.id)
    }, 5000)

    res.json({
      success: true,
      videoId: videoRecord.id,
      message: 'Video generation started'
    })

  } catch (error) {
    console.error('Error generating video:', error)
    res.status(500).json({ error: error.message || 'Internal server error' })
  }
})

// Create subscription endpoint (Paddle integration)
app.post('/api/create-subscription', async (req, res) => {
  try {
    const { userId, planId } = req.body

    if (!userId || !planId) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // In a real implementation, you would integrate with Paddle here
    // For now, we'll simulate the subscription creation
    
    const planPrices = {
      starter: 6.00,
      mid: 12.00,
      pro: 26.00
    }

    const price = planPrices[planId]
    if (!price) {
      return res.status(400).json({ error: 'Invalid plan ID' })
    }

    // Create subscription record
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .insert([
        {
          user_id: userId,
          plan_id: planId,
          status: 'pending',
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (subError) {
      throw new Error('Failed to create subscription')
    }

    // In a real implementation, you would create a Paddle checkout session here
    // and return the checkout URL
    
    res.json({
      success: true,
      subscriptionId: subscription.id,
      checkoutUrl: `https://checkout.paddle.com/subscription?plan=${planId}&user=${userId}`,
      message: 'Subscription created successfully'
    })

  } catch (error) {
    console.error('Error creating subscription:', error)
    res.status(500).json({ error: error.message || 'Internal server error' })
  }
})

// Paddle webhook endpoint
app.post('/api/paddle-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    // In a real implementation, you would verify the webhook signature here
    const event = JSON.parse(req.body)

    switch (event.alert_name) {
      case 'subscription_created':
        await handleSubscriptionCreated(event)
        break
      case 'subscription_updated':
        await handleSubscriptionUpdated(event)
        break
      case 'subscription_cancelled':
        await handleSubscriptionCancelled(event)
        break
      default:
        console.log('Unhandled webhook event:', event.alert_name)
    }

    res.status(200).json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    res.status(400).json({ error: 'Webhook processing failed' })
  }
})

// Helper functions

async function simulateVideoGeneration(videoId) {
  try {
    // Simulate video generation process
    await new Promise(resolve => setTimeout(resolve, 30000)) // 30 seconds

    // Update video status to completed
    const { error } = await supabase
      .from('generated_videos')
      .update({
        status: 'completed',
        video_url: `https://example.com/videos/${videoId}.mp4`,
        completed_at: new Date().toISOString()
      })
      .eq('id', videoId)

    if (error) {
      console.error('Error updating video status:', error)
    }
  } catch (error) {
    console.error('Error in video generation simulation:', error)
    
    // Update status to failed
    await supabase
      .from('generated_videos')
      .update({
        status: 'failed',
        error_message: error.message
      })
      .eq('id', videoId)
  }
}

async function handleSubscriptionCreated(event) {
  const { user_id, subscription_plan_id } = event
  
  // Update user subscription
  await supabase
    .from('user_profiles')
    .update({
      subscription_plan: subscription_plan_id,
      subscription_status: 'active'
    })
    .eq('user_id', user_id)
}

async function handleSubscriptionUpdated(event) {
  const { user_id, subscription_plan_id, status } = event
  
  await supabase
    .from('user_profiles')
    .update({
      subscription_plan: subscription_plan_id,
      subscription_status: status
    })
    .eq('user_id', user_id)
}

async function handleSubscriptionCancelled(event) {
  const { user_id } = event
  
  await supabase
    .from('user_profiles')
    .update({
      subscription_plan: 'free',
      subscription_status: 'cancelled'
    })
    .eq('user_id', user_id)
}

// Cron jobs

// Reset weekly credits for starter plan users
cron.schedule('0 0 * * 1', async () => { // Every Monday at midnight
  try {
    await supabase
      .from('user_profiles')
      .update({ credits: 10 })
      .eq('subscription_plan', 'starter')
    
    console.log('Weekly credits reset for starter plan users')
  } catch (error) {
    console.error('Error resetting weekly credits:', error)
  }
})

// Reset bi-weekly credits for mid plan users
cron.schedule('0 0 1,15 * *', async () => { // 1st and 15th of every month
  try {
    await supabase
      .from('user_profiles')
      .update({ credits: 999999 }) // Unlimited represented as large number
      .eq('subscription_plan', 'mid')
    
    console.log('Bi-weekly credits reset for mid plan users')
  } catch (error) {
    console.error('Error resetting bi-weekly credits:', error)
  }
})

// Reset monthly credits for pro plan users
cron.schedule('0 0 1 * *', async () => { // 1st of every month
  try {
    await supabase
      .from('user_profiles')
      .update({ credits: 999999 }) // Unlimited represented as large number
      .eq('subscription_plan', 'pro')
    
    console.log('Monthly credits reset for pro plan users')
  } catch (error) {
    console.error('Error resetting monthly credits:', error)
  }
})

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large' })
    }
  }
  
  console.error('Unhandled error:', error)
  res.status(500).json({ error: 'Internal server error' })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})