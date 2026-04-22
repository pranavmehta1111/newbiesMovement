import { useState, useEffect } from 'react'
import { CHALLENGE_LEVELS, getLeaderboardByLevel } from '../lib/supabase'

const levels = Object.values(CHALLENGE_LEVELS)

export default function Leaderboard({ currentLevel }) {
    const [activeLevel, setActiveLevel] = useState(currentLevel)
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadLeaderboard(activeLevel)
    }, [activeLevel])

    const loadLeaderboard = async (levelId) => {
        setLoading(true)
        try {
            const result = await getLeaderboardByLevel(levelId)
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
            <h2 className="text-lg font-extrabold mb-3">🏆 Leaderboard</h2>

            {/* Level tabs */}
            <div className="flex gap-1.5 overflow-x-auto mb-4 pb-1" style={{ scrollbarWidth: 'none' }}>
                {levels.map(level => (
                    <button
                        key={level.id}
                        onClick={() => setActiveLevel(level.id)}
                        className={`tab ${activeLevel === level.id ? 'active' : ''}`}
                        id={`lb-tab-${level.id}`}
                    >
                        {level.icon} {level.name}
                    </button>
                ))}
            </div>

            {/* Leaderboard content */}
            {loading ? (
                <div className="text-center py-8">
                    <div className="spinner mx-auto mb-3"></div>
                    <p className="text-sm text-[color:var(--text-muted)]">Loading...</p>
                </div>
            ) : data.length === 0 ? (
                <div className="text-center py-8">
                    <div className="text-4xl mb-3">🏜️</div>
                    <p className="text-sm text-[color:var(--text-muted)]">No one has started this level yet. Be the first!</p>
                </div>
            ) : (
                <div className="space-y-1">
                    {data.map((user, i) => {
                        const rank = getRankDisplay(i)
                        return (
                            <div key={user.id} className="leaderboard-row fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                                <div className={`rank ${rank.class}`}>{rank.text}</div>
                                <div className="flex-1 min-w-0 ml-2">
                                    <div className="font-bold text-sm truncate">{user.name}</div>
                                    <div className="text-xs text-[color:var(--text-muted)]">
                                        {user.score} day{user.score !== 1 ? 's' : ''} completed
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
