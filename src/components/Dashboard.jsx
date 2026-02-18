import { useState, useEffect, useCallback } from 'react'
import ProgressBar from './ProgressBar'
import Calendar from './Calendar'
import ActivityLog from './ActivityLog'
import Leaderboard from './Leaderboard'
import AdminPanel from './AdminPanel'
import { getActivities, addActivity, deleteActivity, ADMIN_PHONES, supabase } from '../lib/supabase'

export default function Dashboard({ user, onLogout }) {
    const [activities, setActivities] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('dashboard')
    const [showAdmin, setShowAdmin] = useState(false)

    const isAdmin = ADMIN_PHONES.includes(user.phone)
    const totalKm = activities.reduce((sum, a) => sum + parseFloat(a.distance_km), 0)

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
                                February 2026 Challenge
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

                {/* Tab navigation */}
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

                {activeTab === 'dashboard' ? (
                    <div className="space-y-6 fade-in">
                        {/* Progress Bar */}
                        <ProgressBar
                            champion={user.champion}
                            category={user.category}
                            totalKm={totalKm}
                        />

                        {/* Calendar */}
                        <Calendar activities={activities} />

                        {/* Activity Log */}
                        <ActivityLog
                            activities={activities}
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
