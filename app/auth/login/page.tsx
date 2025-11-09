'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const supabase = createClient()

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)

      // Validate passwords match
      if (password !== confirmPassword) {
        setError('Passwords do not match')
        return
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters')
        return
      }

      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
        return
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        setError('Please check your email to confirm your account')
        return
      }

      // If session exists, create user and profile records
      if (data.session && data.user) {
        // Create user record
        const { error: userError } = await supabase
          .from('users')
          .upsert(
            {
              id: data.user.id,
              email: data.user.email!,
            },
            {
              onConflict: 'id',
            }
          )

        if (userError) {
          console.error('Error creating user record:', userError)
          setError('Failed to complete signup. Please try again.')
          return
        }

        // Create profile record
        const { error: profileError } = await supabase
          .from('profile')
          .upsert(
            {
              user_id: data.user.id,
            },
            {
              onConflict: 'user_id',
            }
          )

        if (profileError) {
          console.error('Error creating profile record:', profileError)
          setError('Failed to complete signup. Please try again.')
          return
        }

        // Redirect to onboarding
        router.push('/onboarding')
        router.refresh()
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)

      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.user) {
        // Ensure user and profile records exist (in case of legacy users)
        const { error: userError } = await supabase
          .from('users')
          .upsert(
            {
              id: data.user.id,
              email: data.user.email!,
            },
            {
              onConflict: 'id',
            }
          )

        if (userError) {
          console.error('Error creating user record:', userError)
        }

        // Ensure profile exists
        const { error: profileError } = await supabase
          .from('profile')
          .upsert(
            {
              user_id: data.user.id,
            },
            {
              onConflict: 'user_id',
            }
          )

        if (profileError) {
          console.error('Error creating profile record:', profileError)
        }
      }

      // Redirect to home
      router.push('/')
      router.refresh()
    } catch (err) {
      setError('An unexpected error occurred')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="min-h-screen bg-sand-rose flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 border border-mist-teal">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-black mb-2">
            Career Compass
          </h1>
          <p className="text-sage-gray">Coddle Coddle</p>
          <p className="text-sm text-sage-gray mt-4">
            Your private career management workspace
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Toggle between auth methods */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              mode === 'login'
                ? 'bg-clay-rose text-white'
                : 'bg-mist-teal text-black'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              mode === 'signup'
                ? 'bg-clay-rose text-white'
                : 'bg-mist-teal text-black'
            }`}
          >
            Sign Up
          </button>
        </div>

        {mode === 'signup' ? (
          <form onSubmit={handleEmailSignUp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-3 py-2 border border-sage-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-clay-rose"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
                className="w-full px-3 py-2 border border-sage-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-clay-rose"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
                minLength={6}
                className="w-full px-3 py-2 border border-sage-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-clay-rose"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-clay-rose text-white font-medium py-3 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

            <p className="text-xs text-sage-gray text-center mt-4">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-clay-rose hover:underline"
              >
                Sign in
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="test@example.com"
                required
                className="w-full px-3 py-2 border border-sage-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-clay-rose"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full px-3 py-2 border border-sage-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-clay-rose"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-clay-rose text-white font-medium py-3 px-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <p className="text-xs text-sage-gray text-center mt-4">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-clay-rose hover:underline"
              >
                Sign up
              </button>
            </p>

            <p className="text-xs text-sage-gray text-center border-t border-sage-gray pt-3 mt-3">
              Testing: test@example.com / testpassword123
            </p>
          </form>
        )}

        <div className="mt-8 text-center">
          <p className="text-xs text-sage-gray">
            Private by design. Your data stays yours.
          </p>
        </div>
      </div>
    </div>
  )
}
