import { useState, useEffect } from 'react'
import { CATEGORIES, getChampionEmoji, getLeaderboardByCategory, supabase } from '../lib/supabase'

export default function Leaderboard({ userCategory, userId }) {
    const [activeTab, setActiveTab] = useState(userCategory || 'normie')
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchLeaderboard = async () => {
        setLoading(true)
        const results = await getLeaderboardByCategory(activeTab)
        setData(results)
        setLoading(false)
    }

    useEffect(() => {
        fetchLeaderboard()

        // Real-time subscription
        const channel = supabase
            .channel('leaderboard-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, () => {
                fetchLeaderboard()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [activeTab])

    const getRankStyle = (rank) => {
        if (rank === 1) return 'gold'
        if (rank === 2) return 'silver'
        if (rank === 3) return 'bronze'
        return ''
    }

    const getRankEmoji = (rank) => {
        if (rank === 1) return '🥇'
        if (rank === 2) return '🥈'
        if (rank === 3) return '🥉'
        return rank
    }

    return (
        <div className="card">
            <h3 className="font-semibold text-lg mb-4">Leaderboard 🏆</h3>

            {/* Category tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
                {Object.entries(CATEGORIES).map(([key, { name, goal }]) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`tab flex-shrink-0 ${activeTab === key ? 'active' : ''}`}
                    >
                        {name.split(' ').pop()} ({goal}km)
                    </button>
                ))}
            </div>

            {/* Leaderboard content */}
            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="spinner"></div>
                </div>
            ) : data.length === 0 ? (
                <p className="text-center text-[color:var(--text-muted)] py-8">
                    No participants yet in this category. Be the first! 🚀
                </p>
            ) : (
                <div className="space-y-2">
                    {data.map((user, index) => {
                        const rank = index + 1
                        const goal = CATEGORIES[activeTab]?.goal || 50
                        const percentage = (user.totalKm / goal) * 100
                        const isCurrentUser = user.id === userId

                        return (
                            <div
                                key={user.id}
                                className={`leaderboard-row ${isCurrentUser ? 'bg-[color:var(--accent)]/10 border border-[color:var(--accent)]/30' : ''}`}
                            >
                                {/* Rank */}
                                <div className={`rank ${getRankStyle(rank)}`}>
                                    {getRankEmoji(rank)}
                                </div>

                                {/* Champion */}
                                <div className="text-2xl mx-3">
                                    {percentage >= 100 && <span className="text-sm">👑</span>}
                                    {getChampionEmoji(user.champion, percentage)}
                                </div>

                                {/* Name and stats */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">
                                        {user.name}
                                        {isCurrentUser && <span className="text-xs text-[color:var(--accent)] ml-2">(You)</span>}
                                    </p>
                                    <p className="text-sm text-[color:var(--text-secondary)]">
                                        {user.totalKm.toFixed(1)} km • {percentage.toFixed(0)}%
                                    </p>
                                </div>

                                {/* Streak */}
                                {user.streak > 0 && (
                                    <div className="streak-badge">
                                        🔥 {user.streak}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
