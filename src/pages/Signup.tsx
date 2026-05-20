import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSignup = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setError(error.message)
    else setSuccess(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="bg-gray-900 p-8 rounded-xl w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-6">Sign Up</h1>
        {error && <p className="text-red-400 mb-4">{error}</p>}
        {success ? (
          <p className="text-green-400 text-center">Account created! Check your email to confirm.</p>
        ) : (
          <>
            <input
              className="w-full p-3 rounded-lg bg-gray-800 text-white mb-4 outline-none"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <input
              className="w-full p-3 rounded-lg bg-gray-800 text-white mb-6 outline-none"
              placeholder="Password (min 6 characters)"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button
              onClick={handleSignup}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
            <p className="text-gray-400 mt-4 text-center">
              Already have an account? <a href="/" className="text-indigo-400">Login</a>
            </p>
          </>
        )}
      </div>
    </div>
  )
}