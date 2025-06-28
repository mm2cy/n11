import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import { Upload, Play, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const VideoGenerator = () => {
  const { user } = useAuth()
  const { credits, updateCredits } = useSubscription()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    prompt: '',
    audioFile: null,
    imageFile: null,
    resolution: '480p',
    frameNum: 81
  })
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        [fileType]: file
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (credits < 1) {
      toast.error('Insufficient credits. Please upgrade your plan.')
      navigate('/pricing')
      return
    }

    if (!formData.prompt.trim()) {
      toast.error('Please enter a prompt')
      return
    }

    if (!formData.audioFile) {
      toast.error('Please upload an audio file')
      return
    }

    if (!formData.imageFile) {
      toast.error('Please upload an image file')
      return
    }

    setLoading(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('prompt', formData.prompt)
      formDataToSend.append('audio', formData.audioFile)
      formDataToSend.append('image', formData.imageFile)
      formDataToSend.append('resolution', formData.resolution)
      formDataToSend.append('frameNum', formData.frameNum)
      formDataToSend.append('userId', user.id)

      const response = await fetch('/api/generate-video', {
        method: 'POST',
        body: formDataToSend
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate video')
      }

      // Deduct credit
      await updateCredits(credits - 1)
      
      toast.success('Video generation started! Check your dashboard for progress.')
      navigate('/dashboard')
    } catch (error) {
      console.error('Error generating video:', error)
      toast.error(error.message || 'Failed to generate video')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Generate Video</h1>
        <p className="text-gray-600 mt-2">Create amazing conversational videos with AI</p>
      </div>

      {/* Credits Warning */}
      {credits < 1 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-red-800">
              You don't have enough credits to generate a video. 
              <button 
                onClick={() => navigate('/pricing')}
                className="ml-1 underline hover:no-underline"
              >
                Upgrade your plan
              </button>
            </p>
          </div>
        </div>
      )}

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Prompt */}
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
              Video Prompt *
            </label>
            <textarea
              id="prompt"
              name="prompt"
              rows={4}
              value={formData.prompt}
              onChange={handleInputChange}
              placeholder="Describe the conversational video you want to create..."
              className="input-field"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Describe the scene, characters, and conversation you want to generate
            </p>
          </div>

          {/* Audio Upload */}
          <div>
            <label htmlFor="audio" className="block text-sm font-medium text-gray-700 mb-2">
              Audio File *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <div className="text-sm text-gray-600">
                {formData.audioFile ? (
                  <p className="text-green-600">{formData.audioFile.name}</p>
                ) : (
                  <>
                    <label htmlFor="audio" className="cursor-pointer text-primary-600 hover:text-primary-700">
                      Click to upload audio file
                    </label>
                    <p className="text-gray-500">WAV, MP3 files up to 10MB</p>
                  </>
                )}
              </div>
              <input
                id="audio"
                type="file"
                accept="audio/*"
                onChange={(e) => handleFileChange(e, 'audioFile')}
                className="hidden"
                required
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
              Reference Image *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <div className="text-sm text-gray-600">
                {formData.imageFile ? (
                  <p className="text-green-600">{formData.imageFile.name}</p>
                ) : (
                  <>
                    <label htmlFor="image" className="cursor-pointer text-primary-600 hover:text-primary-700">
                      Click to upload image file
                    </label>
                    <p className="text-gray-500">PNG, JPG files up to 5MB</p>
                  </>
                )}
              </div>
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'imageFile')}
                className="hidden"
                required
              />
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="resolution" className="block text-sm font-medium text-gray-700 mb-2">
                Resolution
              </label>
              <select
                id="resolution"
                name="resolution"
                value={formData.resolution}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="480p">480p (Faster)</option>
                <option value="720p">720p (Higher Quality)</option>
              </select>
            </div>

            <div>
              <label htmlFor="frameNum" className="block text-sm font-medium text-gray-700 mb-2">
                Frame Count
              </label>
              <select
                id="frameNum"
                name="frameNum"
                value={formData.frameNum}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value={41}>41 frames (~1.6s)</option>
                <option value={81}>81 frames (~3.2s)</option>
                <option value={121}>121 frames (~4.8s)</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-6 border-t">
            <div className="text-sm text-gray-600">
              <p>Cost: 1 credit • Remaining: {credits} credits</p>
            </div>
            <button
              type="submit"
              disabled={loading || credits < 1}
              className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="loading-spinner w-4 h-4 mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Generate Video
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default VideoGenerator