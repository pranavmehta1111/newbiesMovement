import { useState, useEffect, useCallback } from 'react'
import ProgressRings from './ProgressRings'
import DailyCheckin from './DailyCheckin'
import Calendar from './Calendar'
import Leaderboard from './Leaderboard'
import StatsCard from './StatsCard'
import AdminPanel from './AdminPanel'
import {
    CHALLENGE_LEVELS,
    ADMIN_PHONES,
    getDailyLogs,
    getLogForDate,
    upsertDailyLog,
    getCurrentDateString,
    getCurrentMonthLabel,
    checkDayCompletion,
} from '../lib/supabase'

const QUOTES = [
    "Small daily improvements lead to stunning results. 🌱",
    "Your body is a temple — treat it with respect. 💚",
    "Discipline is choosing between what you want now and what you want most. ⚡",
    "Hydrate, move, repeat. You've got this! 💧",
    "Every step counts, every glass matters. 🚶",
]

export default function Dashboard({ user, onLogout }) {
    const [logs, setLogs] = useState([])
    const [todayLog, setTodayLog] = useState(null)
    const [showCheckin, setShowCheckin] = useState(false)
    const [checkinDate, setCheckinDate] = useState(getCurrentDateString())
    const [checkinLog, setCheckinLog] = useState(null)
    const [activeTab, setActiveTab] = useState('home') // home, calendar, leaderboard, stats
    const [loading, setLoading] = useState(true)
    const [quote] = useState(QUOTES[Math.floor(Math.random() * QUOTES.length)])

    const levelConfig = CHALLENGE_LEVELS[user.challenge_level]
    const isAdmin = ADMIN_PHONES.includes(user.phone)

    const loadData = useCallback(async () => {
        setLoading(true)
        try {
            const allLogs = await getDailyLogs(user.id)
            setLogs(allLogs)
            const today = getCurrentDateString()
            const tLog = allLogs.find(l => l.log_date === today) || null
            setTodayLog(tLog)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }, [user.id])

    useEffect(() => {
        loadData()
    }, [loadData])

    const handleCheckin = async (logData) => {
        const result = await upsertDailyLog(user.id, {
            log_date: checkinDate,
            ...logData
        })
        await loadData()
        setShowCheckin(false)
        return result
    }

    const openCheckinForDate = async (dateStr) => {
        setCheckinDate(dateStr)
        const log = await getLogForDate(user.id, dateStr)
        setCheckinLog(log)
        setShowCheckin(true)
    }

    const openTodayCheckin = () => {
        const today = getCurrentDateString()
        setCheckinDate(today)
        setCheckinLog(todayLog)
        setShowCheckin(true)
    }

    // Calculate stats
    const todayCompletion = todayLog ? checkDayCompletion(todayLog, levelConfig) : { isComplete: false, metCount: 0 }
    const completedDays = logs.filter(l => checkDayCompletion(l, levelConfig).isComplete).length

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="spinner mx-auto mb-4"></div>
                    <p className="text-[color:var(--text-secondary)]">Loading your progress...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen pb-20">
            {/* Header */}
            <div className="max-w-xl mx-auto px-4 pt-5 pb-3">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-xl font-extrabold">
                            Hey, {user.name}! <span className="wave">👋</span>
                        </h1>
                        <p className="text-xs text-[color:var(--text-secondary)] mt-0.5">
                            {getCurrentMonthLabel()} • {levelConfig.icon} {levelConfig.name}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="level-badge">{levelConfig.icon} {levelConfig.name}</span>
                    </div>
                </div>

                {/* Motivational quote */}
                <div className="card p-3 mb-4 fade-in" style={{ background: 'linear-gradient(135deg, var(--accent-glow), transparent)', border: '1px solid var(--accent)', borderColor: 'var(--accent)' }}>
                    <p className="text-sm font-medium text-center" style={{ color: 'var(--accent)' }}>
                        {quote}
                    </p>
                </div>
            </div>

            {/* Navigation tabs */}
            <div className="max-w-xl mx-auto px-4 mb-4">
                <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                    {[
                        { id: 'home', label: '🏠 Home' },
                        { id: 'calendar', label: '📅 Calendar' },
                        { id: 'leaderboard', label: '🏆 Leaderboard' },
                        { id: 'stats', label: '📊 Stats' },
                        ...(isAdmin ? [{ id: 'admin', label: '⚙️ Admin' }] : []),
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            className={`tab ${activeTab === t.id ? 'active' : ''}`}
                            id={`tab-${t.id}`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="max-w-xl mx-auto px-4">
                {activeTab === 'home' && (
                    <div className="space-y-4 fade-in">
                        {/* Today's Progress Rings */}
                        <div className="card">
                            <h2 className="text-sm font-bold text-center mb-4 text-[color:var(--text-secondary)]">
                                TODAY'S PROGRESS
                            </h2>
                            <ProgressRings
                                sugarMet={todayLog?.sugar_rule_met || false}
                                waterLiters={todayLog?.water_liters || 0}
                                waterTarget={levelConfig.water}
                                steps={todayLog?.steps || 0}
                                stepsTarget={levelConfig.steps}
                            />

                            {/* Completion status */}
                            <div className="text-center mt-4">
                                {todayCompletion.isComplete ? (
                                    <p className="text-sm font-bold text-[color:var(--success)] fade-in">
                                        🎉 All targets met today! You're amazing!
                                    </p>
                                ) : (
                                    <p className="text-xs text-[color:var(--text-muted)]">
                                        {todayCompletion.metCount}/3 targets met today
                                    </p>
                                )}
                            </div>

                            {/* Check-in button */}
                            <button
                                onClick={openTodayCheckin}
                                className="btn-primary w-full mt-4"
                                id="checkin-btn"
                            >
                                {todayLog ? 'Update Today\'s Check-in ✏️' : 'Log Today\'s Check-in ✨'}
                            </button>
                        </div>

                        {/* Quick stats */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="card text-center p-3">
                                <div className="text-2xl font-extrabold text-[color:var(--accent)]">{completedDays}</div>
                                <div className="text-xs text-[color:var(--text-muted)] mt-0.5">Days Complete</div>
                            </div>
                            <div className="card text-center p-3">
                                <div className="text-2xl font-extrabold text-[color:var(--accent)]">{logs.length}</div>
                                <div className="text-xs text-[color:var(--text-muted)] mt-0.5">Days Logged</div>
                            </div>
                            <div className="card text-center p-3">
                                <div className="text-2xl font-extrabold text-[color:var(--accent)]">
                                    {logs.length > 0 ? Math.round((completedDays / logs.length) * 100) : 0}%
                                </div>
                                <div className="text-xs text-[color:var(--text-muted)] mt-0.5">Success Rate</div>
                            </div>
                        </div>

                        {/* Logout */}
                        <div className="text-center pt-2">
                            <button onClick={onLogout} className="btn-secondary text-sm" id="logout-btn">
                                Sign Out
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'calendar' && (
                    <Calendar
                        logs={logs}
                        levelConfig={levelConfig}
                        onDayClick={openCheckinForDate}
                    />
                )}

                {activeTab === 'leaderboard' && (
                    <Leaderboard currentLevel={user.challenge_level} />
                )}

                {activeTab === 'stats' && (
                    <StatsCard logs={logs} levelConfig={levelConfig} />
                )}

                {activeTab === 'admin' && isAdmin && (
                    <AdminPanel currentUser={user} onDataChange={loadData} />
                )}
            </div>

            {/* Daily Checkin Modal */}
            {showCheckin && (
                <DailyCheckin
                    currentLog={checkinLog}
                    levelConfig={levelConfig}
                    onSave={handleCheckin}
                    onClose={() => setShowCheckin(false)}
                />
            )}
        </div>
    )
}
