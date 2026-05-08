import { useState, useEffect } from 'react'
import { CHALLENGE_LEVELS, getAllLeaderboard } from '../lib/supabase'

export default function Leaderboard({ currentUserId }) {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadLeaderboard()
    }, [])

    const loadLeaderboard = async () => {
        setLoading(true)
        try {
            const result = await getAllLeaderboard()
            setData(result)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const getRankDisplay = (index) => {
        if (index === 0) return { text: '🥇', class: 'gold' }
        if (index === 1) return { text: '🥈', class: 'silver' }
        if (index === 2) return { text: '🥉', class: 'bronze' }
        return { text: `${index + 1}`, class: '' }
    }

    return (
        <div className="card fade-in">
            <h2 className="text-lg font-extrabold mb-1">🏆 Leaderboard</h2>
            <p className="text-xs text-[color:var(--text-muted)] mb-4">All challengers ranked by completed days</p>

            {loading ? (
                <div className="text-center py-8">
                    <div className="spinner mx-auto mb-3"></div>
                    <p className="text-sm text-[color:var(--text-muted)]">Loading...</p>
                </div>
            ) : data.length === 0 ? (
                <div className="text-center py-8">
                    <div className="text-4xl mb-3">🏜️</div>
                    <p className="text-sm text-[color:var(--text-muted)]">No one has checked in yet. Be the first!</p>
                </div>
            ) : (
                <div className="space-y-1">
                    {data.map((user, i) => {
                        const rank = getRankDisplay(i)
                        const level = CHALLENGE_LEVELS[user.challenge_level]
                        const isCurrentUser = user.id === currentUserId
                        return (
                            <div
                                key={user.id}
                                className="leaderboard-row fade-in"
                                style={{
                                    animationDelay: `${i * 0.05}s`,
                                    ...(isCurrentUser ? {
                                        background: 'linear-gradient(135deg, var(--accent-glow), transparent)',
                                        borderRadius: '0.875rem',
                                        border: '1px solid var(--accent)',
                                    } : {})
                                }}
                            >
                                <div className={`rank ${rank.class}`}>{rank.text}</div>
                                <div className="flex-1 min-w-0 ml-2">
                                    <div className="font-bold text-sm truncate">
                                        {user.name}
                                        {isCurrentUser && (
                                            <span className="ml-1.5 text-[0.65rem] font-semibold text-[color:var(--accent)] opacity-80">(you)</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="text-xs" style={{ color: 'var(--accent)' }}>
                                            {level?.icon} {level?.name}
                                        </span>
                                        <span className="text-[color:var(--border)]">·</span>
                                        <span className="text-xs text-[color:var(--text-muted)]">
                                            {user.score} day{user.score !== 1 ? 's' : ''} done
                                        </span>
                                    </div>
                                </div>
                                {user.streak > 0 && (
                                    <span className="streak-badge ml-2">
                                        🔥 {user.streak}
                                    </span>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
