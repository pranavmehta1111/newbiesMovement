import { useState } from 'react'

export default function ActivityLog({ activities, onAdd, onDelete, loading }) {
    const [distance, setDistance] = useState('')
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [deleting, setDeleting] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        const km = parseFloat(distance)
        if (isNaN(km) || km <= 0) {
            setError('Please enter a valid distance')
            return
        }
        if (km > 100) {
            setError('Maximum 100 km per entry')
            return
        }

        // Validate date is in February 2026
        if (!date.startsWith('2026-02')) {
            setError('Date must be in February 2026')
            return
        }

        setSubmitting(true)
        try {
            await onAdd(km, date)
            setDistance('')
            setDate(new Date().toISOString().split('T')[0])
        } catch (err) {
            setError(err.message || 'Failed to log activity')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (activityId) => {
        if (!confirm('Are you sure you want to delete this entry?')) return

        setDeleting(activityId)
        try {
            await onDelete(activityId)
        } catch (err) {
            setError(err.message || 'Failed to delete')
        } finally {
            setDeleting(null)
        }
    }

    const formatDate = (dateStr) => {
        const d = new Date(dateStr + 'T00:00:00')
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    return (
        <div className="space-y-4">
            {/* Quick Log Form */}
            <div className="card">
                <h3 className="font-semibold text-lg mb-4">Log Activity 🏃</h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-[color:var(--text-secondary)]">
                                Distance (km)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                min="0.1"
                                max="100"
                                className="input"
                                placeholder="5.0"
                                value={distance}
                                onChange={(e) => setDistance(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-[color:var(--text-secondary)]">
                                Date
                            </label>
                            <input
                                type="date"
                                className="input"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                min="2026-02-01"
                                max="2026-02-28"
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-[color:var(--danger)]">{error}</p>
                    )}

                    <button
                        type="submit"
                        className="btn-primary w-full flex items-center justify-center gap-2"
                        disabled={submitting}
                    >
                        {submitting ? (
                            <>
                                <div className="spinner w-5 h-5 border-2"></div>
                                Logging...
                            </>
                        ) : (
                            '+ Add Activity'
                        )}
                    </button>
                </form>
            </div>

            {/* Activity History */}
            <div className="card">
                <h3 className="font-semibold text-lg mb-4">Activity History</h3>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="spinner"></div>
                    </div>
                ) : activities.length === 0 ? (
                    <p className="text-center text-[color:var(--text-muted)] py-8">
                        No activities yet. Start logging! 🚀
                    </p>
                ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {activities.map((activity) => (
                            <div
                                key={activity.id}
                                className="flex items-center justify-between p-3 rounded-lg bg-[color:var(--bg-secondary)] hover:bg-[color:var(--border)]/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">🏃</span>
                                    <div>
                                        <p className="font-medium">{parseFloat(activity.distance_km).toFixed(1)} km</p>
                                        <p className="text-xs text-[color:var(--text-muted)]">
                                            {formatDate(activity.logged_at)}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(activity.id)}
                                    className="p-2 rounded-lg hover:bg-[color:var(--danger)]/10 text-[color:var(--danger)] transition-colors"
                                    disabled={deleting === activity.id}
                                    title="Delete entry"
                                >
                                    {deleting === activity.id ? (
                                        <div className="spinner w-4 h-4 border-2"></div>
                                    ) : (
                                        '🗑️'
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {activities.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-[color:var(--border)] text-sm text-[color:var(--text-secondary)]">
                        Total: <span className="font-bold text-[color:var(--accent)]">
                            {activities.reduce((sum, a) => sum + parseFloat(a.distance_km), 0).toFixed(1)} km
                        </span> across {activities.length} {activities.length === 1 ? 'entry' : 'entries'}
                    </div>
                )}
            </div>
        </div>
    )
}
