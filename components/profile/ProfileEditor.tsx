'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface ProfileEditorProps {
  profile: any
  userEmail: string
}

export default function ProfileEditor({ profile, userEmail }: ProfileEditorProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
    website: profile?.website || '',
    linkedin_url: profile?.linkedin_url || '',
  })

  const [profileImageUrl, setProfileImageUrl] = useState<string>(
    profile?.profile_image_url || ''
  )

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/profile/upload-image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to upload image')
      }

      const data = await response.json()
      setProfileImageUrl(data.url)
      setSuccess('Profile image updated!')
      setTimeout(() => setSuccess(null), 3000)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update profile')
      }

      setSuccess('Profile updated successfully!')
      setTimeout(() => setSuccess(null), 3000)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Profile Image */}
      <div className="bg-white rounded-3xl p-6 shadow-elevated">
        <h3 className="text-lg font-bold text-black mb-4">Profile Photo</h3>
        <div className="flex items-center gap-6">
          <div className="relative">
            <div
              className="w-24 h-24 rounded-full bg-sage-gray flex items-center justify-center overflow-hidden shadow-soft cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleImageClick}
            >
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl text-white">
                  {formData.full_name?.charAt(0)?.toUpperCase() || userEmail?.charAt(0)?.toUpperCase() || '?'}
                </span>
              )}
            </div>
            {uploadingImage && (
              <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
                <span className="text-white text-xs">Uploading...</span>
              </div>
            )}
          </div>
          <div>
            <button
              type="button"
              onClick={handleImageClick}
              disabled={uploadingImage}
              className="px-4 py-2 bg-mist-teal text-black font-medium rounded-2xl shadow-soft hover:shadow-elevated transition-all text-sm disabled:opacity-50"
            >
              {profileImageUrl ? 'Change Photo' : 'Upload Photo'}
            </button>
            <p className="text-xs text-sage-gray mt-2">
              JPG, PNG or WebP. Max 5MB.
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-3xl p-6 shadow-soft space-y-4">
          <h3 className="text-lg font-bold text-black mb-4">Basic Information</h3>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={userEmail}
              disabled
              className="w-full px-4 py-3 border border-sage-gray rounded-2xl bg-sand-rose text-sage-gray cursor-not-allowed"
            />
            <p className="text-xs text-sage-gray mt-1">
              Email cannot be changed
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Enter your full name"
              className="w-full px-4 py-3 border border-sage-gray rounded-2xl focus:outline-none focus:ring-2 focus:ring-clay-rose"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              rows={3}
              className="w-full px-4 py-3 border border-sage-gray rounded-2xl focus:outline-none focus:ring-2 focus:ring-clay-rose resize-none"
            />
            <p className="text-xs text-sage-gray mt-1">
              Brief description for your profile
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., San Francisco, CA"
              className="w-full px-4 py-3 border border-sage-gray rounded-2xl focus:outline-none focus:ring-2 focus:ring-clay-rose"
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-soft space-y-4">
          <h3 className="text-lg font-bold text-black mb-4">Links</h3>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Website
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://yourwebsite.com"
              className="w-full px-4 py-3 border border-sage-gray rounded-2xl focus:outline-none focus:ring-2 focus:ring-clay-rose"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              LinkedIn URL
            </label>
            <input
              type="url"
              value={formData.linkedin_url}
              onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
              placeholder="https://linkedin.com/in/yourprofile"
              className="w-full px-4 py-3 border border-sage-gray rounded-2xl focus:outline-none focus:ring-2 focus:ring-clay-rose"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-clay-rose text-white font-bold py-4 px-6 rounded-3xl shadow-elevated hover:shadow-float transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  )
}
