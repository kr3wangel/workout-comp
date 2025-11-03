'use client'

import { useState } from 'react'
import WorkoutForm from './components/WorkoutForm'
import WorkoutStats from './components/WorkoutStats'
import Leaderboard from './components/Leaderboard'

export default function DashboardClient() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleWorkoutSuccess = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div>
        <WorkoutForm onSuccess={handleWorkoutSuccess} />
      </div>
      <div>
        <WorkoutStats refresh={refreshKey} />
      </div>
      <div>
        <Leaderboard refresh={refreshKey} />
      </div>
    </div>
  )
}
