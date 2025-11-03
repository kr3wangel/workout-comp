'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Workout {
  id: string
  pushups: number
  situps: number
  squats: number
  created_at: string
}

interface Stats {
  totalWorkouts: number
  latestPushups: number
  latestSitups: number
  latestSquats: number
  firstPushups: number
  firstSitups: number
  firstSquats: number
  pushupIncrease: string
  situpIncrease: string
  squatIncrease: string
}

export default function WorkoutStats({ refresh }: { refresh: number }) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchStats()
  }, [refresh])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const { data: workouts, error } = await supabase
        .from('workouts')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) throw error

      if (workouts && workouts.length > 0) {
        const first = workouts[0]
        const latest = workouts[workouts.length - 1]

        const pushupIncrease = first.pushups > 0
          ? (((latest.pushups - first.pushups) / first.pushups) * 100).toFixed(1)
          : '0'
        const situpIncrease = first.situps > 0
          ? (((latest.situps - first.situps) / first.situps) * 100).toFixed(1)
          : '0'
        const squatIncrease = first.squats > 0
          ? (((latest.squats - first.squats) / first.squats) * 100).toFixed(1)
          : '0'

        setStats({
          totalWorkouts: workouts.length,
          latestPushups: latest.pushups,
          latestSitups: latest.situps,
          latestSquats: latest.squats,
          firstPushups: first.pushups,
          firstSitups: first.situps,
          firstSquats: first.squats,
          pushupIncrease,
          situpIncrease,
          squatIncrease,
        })
      } else {
        setStats(null)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-gray-600 dark:text-gray-400">Loading stats...</p>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Your Stats
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          No workouts logged yet. Start by logging your first workout!
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Your Stats
      </h2>

      <div className="space-y-4">
        <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Workouts</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalWorkouts}</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Pushups</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.latestPushups}</p>
            <p className={`text-xs mt-1 ${parseFloat(stats.pushupIncrease) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {parseFloat(stats.pushupIncrease) >= 0 ? '+' : ''}{stats.pushupIncrease}%
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Situps</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.latestSitups}</p>
            <p className={`text-xs mt-1 ${parseFloat(stats.situpIncrease) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {parseFloat(stats.situpIncrease) >= 0 ? '+' : ''}{stats.situpIncrease}%
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Squats</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.latestSquats}</p>
            <p className={`text-xs mt-1 ${parseFloat(stats.squatIncrease) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {parseFloat(stats.squatIncrease) >= 0 ? '+' : ''}{stats.squatIncrease}%
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
