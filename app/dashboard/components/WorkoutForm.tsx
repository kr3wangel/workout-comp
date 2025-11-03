'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface WorkoutFormProps {
  onSuccess: () => void
}

export default function WorkoutForm({ onSuccess }: WorkoutFormProps) {
  const [pushups, setPushups] = useState('')
  const [pullups, setPullups] = useState('')
  const [situps, setSitups] = useState('')
  const [squats, setSquats] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('You must be logged in to submit workouts')
        return
      }

      const { error: insertError } = await supabase
        .from('workouts')
        .insert({
          user_id: user.id,
          pushups: parseInt(pushups),
          pullups: parseInt(pullups),
          situps: parseInt(situps),
          squats: parseInt(squats),
        })

      if (insertError) {
        setError(insertError.message)
      } else {
        setPushups('')
        setPullups('')
        setSitups('')
        setSquats('')
        onSuccess()
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Log Workout
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="pushups" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Pushups
          </label>
          <input
            id="pushups"
            type="number"
            min="0"
            step="1"
            required
            value={pushups}
            onChange={(e) => setPushups(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="pullups" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Pullups
          </label>
          <input
            id="pullups"
            type="number"
            min="0"
            step="1"
            required
            value={pullups}
            onChange={(e) => setPullups(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="situps" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Situps
          </label>
          <input
            id="situps"
            type="number"
            min="0"
            step="1"
            required
            value={situps}
            onChange={(e) => setSitups(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label htmlFor="squats" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Squats
          </label>
          <input
            id="squats"
            type="number"
            min="0"
            step="1"
            required
            value={squats}
            onChange={(e) => setSquats(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {error && (
          <div className="text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Workout'}
        </button>
      </form>
    </div>
  )
}
