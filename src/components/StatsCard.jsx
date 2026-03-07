import { useMemo } from 'react'

export default function StatsCard({ activities }) {
    const stats = useMemo(() => {
        if (!activities || activities.length === 0) {
            return { avgKm: 0, bestDay: 0, activeDays: 0, totalKm: 0, longestStreak: 0 }
        }

        // Group by date
        const byDate = {}
        activities.forEach(a => {
            const date = a.logged_at
            byDate[date] = (byDate[date] || 0) + parseFloat(a.distance_km)
        })

        const distances = Object.values(byDate)
        const totalKm = distances.reduce((sum, d) => sum + d, 0)
        const activeDays = distances.length
        const avgKm = activeDays > 0 ? totalKm / activeDays : 0
        const bestDay = Math.max(...distances, 0)

        // Calculate longest streak
        const sortedDates = Object.keys(byDate).sort()
        let longestStreak = 0
        let currentStreak = 1
        for (let i = 1; i < sortedDates.length; i++) {
            const prev = new Date(sortedDates[i - 1])
            const curr = new Date(sortedDates[i])
            const diffDays = (curr - prev) / 86400000
            if (diffDays === 1) {
                currentStreak++
            } else {
                longestStreak = Math.max(longestStreak, currentStreak)
                currentStreak = 1
            }
        }
        longestStreak = Math.max(longestStreak, currentStreak)
        if (sortedDates.length === 0) longestStreak = 0

        return { avgKm, bestDay, activeDays, totalKm, longestStreak }
    }, [activities])

    const statItems = [
        { label: 'Avg/Day', value: `${stats.avgKm.toFixed(1)} km`, icon: '📊', color: 'var(--accent)' },
        { label: 'Best Day', value: `${stats.bestDay.toFixed(1)} km`, icon: '🏆', color: 'var(--warning)' },
        { label: 'Active Days', value: stats.activeDays, icon: '📅', color: 'var(--success)' },
        { label: 'Best Streak', value: `${stats.longestStreak}d`, icon: '🔥', color: 'var(--danger)' },
    ]

    return (
        <div className="card">
            <h3 className="font-semibold text-lg mb-4">Monthly Stats 📈</h3>
            <div className="stats-grid">
                {statItems.map((item) => (
                    <div key={item.label} className="stat-item">
                        <span className="text-2xl mb-1">{item.icon}</span>
                        <span className="text-xl font-bold" style={{ color: item.color }}>
                            {item.value}
                        </span>
                        <span className="text-xs text-[color:var(--text-muted)]">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
