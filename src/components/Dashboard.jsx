import { useState, useEffect, useCallback, useMemo } from 'react'
import ProgressBar from './ProgressBar'
import Calendar from './Calendar'
import ActivityLog from './ActivityLog'
import Leaderboard from './Leaderboard'
import AdminPanel from './AdminPanel'
import StatsCard from './StatsCard'
import MotivationalBanner from './MotivationalBanner'
import { getActivities, addActivity, deleteActivity, ADMIN_PHONES, CATEGORIES, getCurrentMonthLabel, getCurrentMonthRange, supabase } from '../lib/supabase'

const LEADERBOARD_KEY = 'newbies_show_leaderboard'
const CUSTOM_GOAL_KEY = 'newbies_custom_goal'

export default function Dashboard({ user, onLogout }) {
    const [activities, setActivities] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('dashboard')
    const [showAdmin, setShowAdmin] = useState(false)

    // Leaderboard toggle — persisted in localStorage
    const [showLeaderboard, setShowLeaderboard] = useState(() => {
        const saved = localStorage.getItem(LEADERBOARD_KEY)
        return saved !== null ? JSON.parse(saved) : true
    })

    // Custom goal — persisted in localStorage per user
    const [customGoal, setCustomGoal] = useState(() => {
        const saved = localStorage.getItem(`${CUSTOM_GOAL_KEY}_${user.phone}`)
        return saved ? parseFloat(saved) : null
    })
    const [editingGoal, setEditingGoal] = useState(false)
    const [goalInput, setGoalInput] = useState('')

    const isAdmin = ADMIN_PHONES.includes(user.phone)
    const monthLabel = getCurrentMonthLabel()

    // Filter activities to current month
    const currentMonthActivities = useMemo(() => {
        const { firstDay, lastDay } = getCurrentMonthRange()
        return activities.filter(a => a.logged_at >= firstDay && a.logged_at <= lastDay)
    }, [activities])

    const totalKm = currentMonthActivities.reduce((sum, a) => sum + parseFloat(a.distance_km), 0)
    const effectiveGoal = customGoal || CATEGORIES[user.category]?.goal || 50

    // Persist leaderboard toggle
    useEffect(() => {
        localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(showLeaderboard))
        // If leaderboard hidden and currently on leaderboard tab, switch back
        if (!showLeaderboard && activeTab === 'leaderboard') {
            setActiveTab('dashboard')
        }
    }, [showLeaderboard])

    const fetchActivities = useCallback(async () => {
        setLoading(true)
        const data = await getActivities(user.id)
        setActivities(data)
        setLoading(false)
    }, [user.id])

    useEffect(() => {
        fetchActivities()

        // Real-time subscription for user's activities
        const channel = supabase
            .channel(`activities-${user.id}`)
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'activities', filter: `user_id=eq.${user.id}` },
                () => fetchActivities()
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [user.id, fetchActivities])

    const handleAddActivity = async (distanceKm, loggedAt) => {
        await addActivity(user.id, distanceKm, loggedAt)
        await fetchActivities()
    }

    const handleDeleteActivity = async (activityId) => {
        await deleteActivity(activityId)
        await fetchActivities()
    }

    const handleSaveGoal = () => {
        const val = parseFloat(goalInput)
        if (!isNaN(val) && val > 0 && val <= 1000) {
            setCustomGoal(val)
            localStorage.setItem(`${CUSTOM_GOAL_KEY}_${user.phone}`, val.toString())
        }
        setEditingGoal(false)
        setGoalInput('')
    }

    const handleResetGoal = () => {
        setCustomGoal(null)
        localStorage.removeItem(`${CUSTOM_GOAL_KEY}_${user.phone}`)
        setEditingGoal(false)
        setGoalInput('')
    }

    return (
        <div className="min-h-screen pb-20">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-[color:var(--bg-primary)]/80 backdrop-blur-lg border-b border-[color:var(--border)]">
                <div className="max-w-2xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="font-bold text-lg">
                                Hey, {user.name}! 👋
                            </h1>
                            <p className="text-sm text-[color:var(--text-secondary)]">
                                {monthLabel} • Let's Move! 🏃‍♂️
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {isAdmin && (
                                <button
                                    onClick={() => setShowAdmin(!showAdmin)}
                                    className={`p-2 rounded-lg transition-colors ${showAdmin ? 'bg-[color:var(--warning)]/20 text-[color:var(--warning)]' : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)]'}`}
                                    title="Admin Panel"
                                >
                                    ⚙️
                                </button>
                            )}
                            <button
                                onClick={onLogout}
                                className="text-sm text-[color:var(--text-muted)] hover:text-[color:var(--danger)] transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>

                    {/* Leaderboard toggle */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-[color:var(--border)]">
                        <span className="text-xs text-[color:var(--text-muted)]">Show Leaderboard</span>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={showLeaderboard}
                                onChange={(e) => setShowLeaderboard(e.target.checked)}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                {/* Admin panel (if admin and toggled) */}
                {isAdmin && showAdmin && (
                    <div className="fade-in">
                        <AdminPanel currentPhone={user.phone} />
                    </div>
                )}

                {/* Tab navigation (only show if leaderboard is enabled) */}
                {showLeaderboard && (
                    <div className="flex gap-2 bg-[color:var(--bg-secondary)] p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${activeTab === 'dashboard'
                                ? 'bg-[color:var(--bg-card)] shadow-sm'
                                : 'text-[color:var(--text-secondary)]'
                                }`}
                        >
                            Dashboard
                        </button>
                        <button
                            onClick={() => setActiveTab('leaderboard')}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${activeTab === 'leaderboard'
                                ? 'bg-[color:var(--bg-card)] shadow-sm'
                                : 'text-[color:var(--text-secondary)]'
                                }`}
                        >
                            Leaderboard
                        </button>
                    </div>
                )}

                {(activeTab === 'dashboard' || !showLeaderboard) ? (
                    <div className="space-y-6 fade-in">
                        {/* Motivational Banner */}
                        <MotivationalBanner />

                        {/* Progress Bar with custom goal */}
                        <ProgressBar
                            champion={user.champion}
                            category={user.category}
                            totalKm={totalKm}
                            customGoal={customGoal}
                            editingGoal={editingGoal}
                            goalInput={goalInput}
                            onEditGoal={() => {
                                setEditingGoal(true)
                                setGoalInput(customGoal?.toString() || CATEGORIES[user.category]?.goal?.toString() || '50')
                            }}
                            onGoalInputChange={setGoalInput}
                            onSaveGoal={handleSaveGoal}
                            onResetGoal={handleResetGoal}
                            onCancelEdit={() => { setEditingGoal(false); setGoalInput('') }}
                        />

                        {/* Stats Card */}
                        <StatsCard activities={currentMonthActivities} />

                        {/* Calendar */}
                        <Calendar activities={currentMonthActivities} />

                        {/* Activity Log */}
                        <ActivityLog
                            activities={currentMonthActivities}
                            onAdd={handleAddActivity}
                            onDelete={handleDeleteActivity}
                            loading={loading}
                        />
                    </div>
                ) : (
                    <div className="fade-in">
                        <Leaderboard userCategory={user.category} userId={user.id} />
                    </div>
                )}
            </main>
        </div>
    )
}
