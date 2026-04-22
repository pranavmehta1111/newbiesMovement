import { checkDayCompletion } from '../lib/supabase'

export default function StatsCard({ logs, levelConfig }) {
    if (!logs.length) {
        return (
            <div className="card fade-in text-center py-8">
                <div className="text-4xl mb-3">📊</div>
                <p className="text-sm text-[color:var(--text-muted)]">No data yet. Start checking in daily!</p>
            </div>
        )
    }

    // Compute stats
    const totalDays = logs.length
    const completedDays = logs.filter(l => checkDayCompletion(l, levelConfig).isComplete).length
    const sugarDays = logs.filter(l => l.sugar_rule_met).length
    const avgWater = logs.reduce((s, l) => s + parseFloat(l.water_liters || 0), 0) / totalDays
    const totalSteps = logs.reduce((s, l) => s + (l.steps || 0), 0)
    const avgSteps = Math.round(totalSteps / totalDays)
    const bestSteps = Math.max(...logs.map(l => l.steps || 0))
    const successRate = Math.round((completedDays / totalDays) * 100)

    // Longest streak calculation
    const sortedLogs = [...logs].sort((a, b) => new Date(a.log_date) - new Date(b.log_date))
    let longestStreak = 0
    let currentStreak = 0
    for (const log of sortedLogs) {
        if (checkDayCompletion(log, levelConfig).isComplete) {
            currentStreak++
            longestStreak = Math.max(longestStreak, currentStreak)
        } else {
            currentStreak = 0
        }
    }

    const stats = [
        { icon: '🎯', label: 'Success Rate', value: `${successRate}%` },
        { icon: '✅', label: 'Complete Days', value: completedDays },
        { icon: '🍬', label: 'Sugar-Free Days', value: sugarDays },
        { icon: '💧', label: 'Avg Water', value: `${avgWater.toFixed(1)}L` },
        { icon: '🚶', label: 'Avg Steps', value: avgSteps.toLocaleString() },
        { icon: '🏆', label: 'Best Steps', value: bestSteps.toLocaleString() },
        { icon: '📅', label: 'Days Logged', value: totalDays },
        { icon: '🔥', label: 'Longest Streak', value: `${longestStreak}d` },
        { icon: '👟', label: 'Total Steps', value: totalSteps >= 1000000 ? `${(totalSteps / 1000000).toFixed(1)}M` : `${(totalSteps / 1000).toFixed(0)}k` },
    ]

    return (
        <div className="card fade-in">
            <h2 className="text-lg font-extrabold mb-4">📊 Your Stats</h2>

            <div className="stats-grid">
                {stats.map((s, i) => (
                    <div key={i} className="stat-item fade-in" style={{ animationDelay: `${i * 0.04}s` }}>
                        <span className="text-xl mb-1">{s.icon}</span>
                        <span className="text-lg font-extrabold text-[color:var(--accent)]">{s.value}</span>
                        <span className="text-xs text-[color:var(--text-muted)] mt-0.5">{s.label}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
