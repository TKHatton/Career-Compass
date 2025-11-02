'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface PrivacyControlsProps {
  initialSettings: {
    auto_delete_sessions_after_days: number | null
    data_retention_days: number | null
  }
}

export default function PrivacyControls({ initialSettings }: PrivacyControlsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')

  const [autoDeleteDays, setAutoDeleteDays] = useState<string>(
    initialSettings.auto_delete_sessions_after_days?.toString() || 'never'
  )
  const [retentionDays, setRetentionDays] = useState<string>(
    initialSettings.data_retention_days?.toString() || 'forever'
  )

  const handleSaveSettings = async () => {
    try {
      setLoading(true)
      setMessage(null)

      const response = await fetch('/api/privacy/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auto_delete_sessions_after_days: autoDeleteDays === 'never' ? null : parseInt(autoDeleteDays),
          data_retention_days: retentionDays === 'forever' ? null : parseInt(retentionDays),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }

      setMessage({ type: 'success', text: 'Privacy settings saved successfully!' })
      router.refresh()
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save privacy settings' })
    } finally {
      setLoading(false)
    }
  }

  const handleExportData = async () => {
    try {
      setLoading(true)
      setMessage(null)

      const response = await fetch('/api/privacy/export')
      if (!response.ok) {
        throw new Error('Failed to export data')
      }

      // Trigger download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `career-compass-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setMessage({ type: 'success', text: 'Data exported successfully!' })
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to export data' })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE MY ACCOUNT') {
      setMessage({ type: 'error', text: 'Please type "DELETE MY ACCOUNT" to confirm' })
      return
    }

    try {
      setLoading(true)
      setMessage(null)

      const response = await fetch('/api/privacy/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation: deleteConfirmation }),
      })

      if (!response.ok) {
        throw new Error('Failed to delete account')
      }

      // Redirect to login page
      window.location.href = '/auth/login?deleted=true'
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete account' })
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      {/* Data Retention Settings */}
      <div className="space-y-4">
        <h3 className="font-medium text-black">Data Retention</h3>

        <div>
          <label className="block text-sm text-sage-gray mb-2">
            Auto-delete chat sessions after:
          </label>
          <select
            value={autoDeleteDays}
            onChange={(e) => setAutoDeleteDays(e.target.value)}
            className="w-full px-3 py-2 border border-sage-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-clay-rose"
          >
            <option value="never">Never delete</option>
            <option value="30">30 days</option>
            <option value="90">90 days</option>
            <option value="180">6 months</option>
            <option value="365">1 year</option>
          </select>
          <p className="text-xs text-sage-gray mt-1">
            Automatically delete old chat sessions and messages
          </p>
        </div>

        <div>
          <label className="block text-sm text-sage-gray mb-2">
            General data retention:
          </label>
          <select
            value={retentionDays}
            onChange={(e) => setRetentionDays(e.target.value)}
            className="w-full px-3 py-2 border border-sage-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-clay-rose"
          >
            <option value="forever">Keep forever</option>
            <option value="365">1 year</option>
            <option value="730">2 years</option>
            <option value="1825">5 years</option>
          </select>
          <p className="text-xs text-sage-gray mt-1">
            How long to keep your CVs, letters, and documents
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={loading}
          className="w-full bg-clay-rose text-white font-medium py-2 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Retention Settings'}
        </button>
      </div>

      <hr className="border-sage-gray" />

      {/* Export Data */}
      <div>
        <h3 className="font-medium text-black mb-2">Export Your Data</h3>
        <p className="text-sm text-sage-gray mb-4">
          Download all your data in JSON format. Includes your profile, documents, CVs, and chat history.
        </p>
        <button
          onClick={handleExportData}
          disabled={loading}
          className="w-full bg-mist-teal text-black font-medium py-2 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? 'Exporting...' : 'Export All Data'}
        </button>
      </div>

      <hr className="border-sage-gray" />

      {/* Delete Account */}
      <div>
        <h3 className="font-medium text-black mb-2 text-red-600">Danger Zone</h3>
        <p className="text-sm text-sage-gray mb-4">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="w-full bg-red-600 text-white font-medium py-2 px-4 rounded-lg hover:opacity-90 transition-opacity"
        >
          Delete Account
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-black mb-4">
              Delete Account
            </h3>
            <p className="text-sm text-sage-gray mb-4">
              This will permanently delete your account and all your data, including:
            </p>
            <ul className="text-sm text-sage-gray list-disc list-inside mb-4 space-y-1">
              <li>Your profile and preferences</li>
              <li>All uploaded documents</li>
              <li>All CV versions and cover letters</li>
              <li>All chat sessions and messages</li>
            </ul>
            <p className="text-sm text-red-600 font-medium mb-4">
              This action cannot be undone!
            </p>
            <div className="mb-4">
              <label className="block text-sm text-sage-gray mb-2">
                Type <strong>"DELETE MY ACCOUNT"</strong> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="DELETE MY ACCOUNT"
                className="w-full px-3 py-2 border border-sage-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeleteConfirmation('')
                }}
                className="flex-1 bg-mist-teal text-black font-medium py-2 px-4 rounded-lg hover:opacity-90 transition-opacity"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading || deleteConfirmation !== 'DELETE MY ACCOUNT'}
                className="flex-1 bg-red-600 text-white font-medium py-2 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
