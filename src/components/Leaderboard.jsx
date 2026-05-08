import { useState, useEffect } from 'react'
import { CHALLENGE_LEVELS, getAllLeaderboard, getLeaderboardByLevel } from '../lib/supabase'

const levels = Object.values(CHALLENGE_LEVELS)

export default function Leaderboard({ currentUserId, currentLevel }) {
    const [view, setView] = useState('all')        // 'all' | 'bylevel'
    const [activeLevel, setActiveLevel] = useState(currentLevel)
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (view === 'all') {
            loadAll()
        } else {
            loadByLevel(activeLevel)
        }
    }, [view, activeLevel])

    const loadAll = async () => {
        setLoading(true)
        try {
            setData(await getAllLeaderboard())
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const loadByLevel = async (levelId) => {
        setLoading(true)
        try {
            setData(await getLeaderboardByLevel(levelId))
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
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-extrabold">🏆 Leaderboard</h2>

                {/* View toggle pill */}
                <div className="flex items-center p-0.5 rounded-xl gap-0.5"
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                    <button
                        onClick={() => setView('all')}
                        id="lb-toggle-all"
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                        style={view === 'all' ? {
                            background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
                            color: 'white',
                            boxShadow: '0 2px 8px var(--accent-glow)',
                        } : {
                            color: 'var(--text-secondary)',
                            background: 'transparent',
                        }}
                    >
                        🌍 All
                    </button>
                    <button
                        onClick={() => setView('bylevel')}
                        id="lb-toggle-bylevel"
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                        style={view === 'bylevel' ? {
                            background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
                            color: 'white',
                            boxShadow: '0 2px 8px var(--accent-glow)',
                        } : {
                            color: 'var(--text-secondary)',
                            background: 'transparent',
                        }}
                    >
                        🎯 By Level
                    </button>
                </div>
            </div>

            {/* Level tabs — only shown in By Level view */}
            {view === 'bylevel' && (
                <div className="flex gap-1.5 overflow-x-auto mb-4 pb-1 fade-in" style={{ scrollbarWidth: 'none' }}>
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
            )}

            <p className="text-xs text-[color:var(--text-muted)] mb-3">
                {view === 'all'
                    ? 'All challengers ranked by completed days'
                    : `${CHALLENGE_LEVELS[activeLevel]?.icon} ${CHALLENGE_LEVELS[activeLevel]?.name} — ranked by completed days`}
            </p>

            {/* List */}
            {loading ? (
                <div className="text-center py-8">
                    <div className="spinner mx-auto mb-3"></div>
                    <p className="text-sm text-[color:var(--text-muted)]">Loading...</p>
                </div>
            ) : data.length === 0 ? (
                <div className="text-center py-8">
                    <div className="text-4xl mb-3">🏜️</div>
                    <p className="text-sm text-[color:var(--text-muted)]">
                        {view === 'all' ? 'No one has checked in yet.' : 'No one on this level yet. Be the first!'}
                    </p>
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
                                        {view === 'all' && (
                                            <>
                                                <span className="text-xs" style={{ color: 'var(--accent)' }}>
                                                    {level?.icon} {level?.name}
                                                </span>
                                                <span className="text-[color:var(--border)]">·</span>
                                            </>
                                        )}
                                        <span className="text-xs text-[color:var(--text-muted)]">
                                            {user.score} day{user.score !== 1 ? 's' : ''} done
                                        </span>
                                    </div>
                                </div>
                                {user.streak > 0 && (
                                    <span className="streak-badge ml-2">🔥 {user.streak}</span>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
