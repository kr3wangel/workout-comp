'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface UserStats {
  user_id: string
  email: string
  pushupIncrease: number
  situpIncrease: number
  squatIncrease: number
  firstPushups: number
  latestPushups: number
  firstSitups: number
  latestSitups: number
  firstSquats: number
  latestSquats: number
}

interface LeaderboardProps {
  refresh: number
}

export default function Leaderboard({ refresh }: LeaderboardProps) {
  const [stats, setStats] = useState<UserStats[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchLeaderboard()
  }, [refresh])

  const fetchLeaderboard = async () => {
    setLoading(true)
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)

      // Fetch all workouts
      const { data: workouts, error } = await supabase
        .from('workouts')
        .select('user_id, pushups, situps, squats, created_at')
        .order('created_at', { ascending: true })

      if (error) throw error

      // Group by user and calculate stats
      const userMap = new Map<string, any>()

      workouts?.forEach(workout => {
        if (!userMap.has(workout.user_id)) {
          userMap.set(workout.user_id, {
            user_id: workout.user_id,
            first: workout,
            latest: workout,
          })
        } else {
          userMap.get(workout.user_id).latest = workout
        }
      })

      // Fetch user emails
      const userIds = Array.from(userMap.keys())
      const userStats: UserStats[] = []

      for (const userId of userIds) {
        const { first, latest } = userMap.get(userId)

        // Get user email from auth.users (you might need to store this differently)
        // For now, we'll just show a masked version
        const userEmail = userId === user?.id ? user.email : `User ${userId.slice(0, 8)}`

        const pushupIncrease = first.pushups > 0
          ? ((latest.pushups - first.pushups) / first.pushups) * 100
          : 0
        const situpIncrease = first.situps > 0
          ? ((latest.situps - first.situps) / first.situps) * 100
          : 0
        const squatIncrease = first.squats > 0
          ? ((latest.squats - first.squats) / first.squats) * 100
          : 0

        userStats.push({
          user_id: userId,
          email: userEmail || 'Unknown',
          pushupIncrease,
          situpIncrease,
          squatIncrease,
          firstPushups: first.pushups,
          latestPushups: latest.pushups,
          firstSitups: first.situps,
          latestSitups: latest.situps,
          firstSquats: first.squats,
          latestSquats: latest.squats,
        })
      }

      setStats(userStats)
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRank = (userId: string, exerciseType: 'pushup' | 'situp' | 'squat') => {
    const key = `${exerciseType}Increase` as keyof UserStats
    const sorted = [...stats].sort((a, b) => (b[key] as number) - (a[key] as number))
    return sorted.findIndex(s => s.user_id === userId) + 1
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-gray-600 dark:text-gray-400">Loading leaderboard...</p>
      </div>
    )
  }

  if (stats.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Leaderboard
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          No competition data yet.
        </p>
      </div>
    )
  }

  const pushupLeaders = [...stats].sort((a, b) => b.pushupIncrease - a.pushupIncrease)
  const situpLeaders = [...stats].sort((a, b) => b.situpIncrease - a.situpIncrease)
  const squatLeaders = [...stats].sort((a, b) => b.squatIncrease - a.squatIncrease)

  const currentUserPushupRank = currentUserId ? getRank(currentUserId, 'pushup') : null
  const currentUserSitupRank = currentUserId ? getRank(currentUserId, 'situp') : null
  const currentUserSquatRank = currentUserId ? getRank(currentUserId, 'squat') : null

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Competition Standings
      </h2>

      {currentUserId && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Rankings</p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Pushups</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {currentUserPushupRank ? `#${currentUserPushupRank}` : '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Situps</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {currentUserSitupRank ? `#${currentUserSitupRank}` : '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Squats</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {currentUserSquatRank ? `#${currentUserSquatRank}` : '-'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Pushups Leaderboard */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            🏆 Pushups Leader
          </h3>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-900 dark:text-white">
                {pushupLeaders[0]?.user_id === currentUserId ? 'You' : pushupLeaders[0]?.email}
              </span>
              <span className="text-green-600 dark:text-green-400 font-bold">
                +{pushupLeaders[0]?.pushupIncrease.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Situps Leaderboard */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            🏆 Situps Leader
          </h3>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-900 dark:text-white">
                {situpLeaders[0]?.user_id === currentUserId ? 'You' : situpLeaders[0]?.email}
              </span>
              <span className="text-green-600 dark:text-green-400 font-bold">
                +{situpLeaders[0]?.situpIncrease.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Squats Leaderboard */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            🏆 Squats Leader
          </h3>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-900 dark:text-white">
                {squatLeaders[0]?.user_id === currentUserId ? 'You' : squatLeaders[0]?.email}
              </span>
              <span className="text-green-600 dark:text-green-400 font-bold">
                +{squatLeaders[0]?.squatIncrease.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
