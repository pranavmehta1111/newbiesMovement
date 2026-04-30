import { useState, useEffect } from 'react'
import {
    CHALLENGE_LEVELS,
    DELETE_PHONE,
    CATEGORY_ADMIN_PHONES,
    getAllUsers,
    updateUserLevel,
    deleteUser,
    resetAllData,
} from '../lib/supabase'

const levels = Object.values(CHALLENGE_LEVELS)

export default function AdminPanel({ currentUser, onDataChange }) {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [confirmReset, setConfirmReset] = useState(false)
    const [message, setMessage] = useState('')

    const canDelete = currentUser.phone === DELETE_PHONE
    const canChangeCategory = CATEGORY_ADMIN_PHONES.includes(currentUser.phone)

    useEffect(() => {
        loadUsers()
    }, [])

    const loadUsers = async () => {
        setLoading(true)
        try {
            const data = await getAllUsers()
            setUsers(data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleLevelChange = async (userId, newLevel) => {
        try {
            await updateUserLevel(userId, newLevel)
            setMessage('Level updated!')
            await loadUsers()
            onDataChange()
            setTimeout(() => setMessage(''), 2000)
        } catch (err) {
            setMessage('Error: ' + err.message)
        }
    }

    const handleDelete = async (userId, userName) => {
        if (!window.confirm(`Delete user "${userName}"? This will remove all their data.`)) return
        try {
            await deleteUser(userId)
            setMessage(`${userName} deleted`)
            await loadUsers()
            setTimeout(() => setMessage(''), 2000)
        } catch (err) {
            setMessage('Error: ' + err.message)
        }
    }

    const handleReset = async () => {
        if (!confirmReset) {
            setConfirmReset(true)
            return
        }
        try {
            await resetAllData()
            setMessage('All daily logs have been reset!')
            setConfirmReset(false)
            onDataChange()
            setTimeout(() => setMessage(''), 3000)
        } catch (err) {
            setMessage('Error: ' + err.message)
        }
    }

    return (
        <div className="card fade-in">
            <h2 className="text-lg font-extrabold mb-4">⚙️ Admin Panel</h2>

            {message && (
                <div className="p-3 rounded-xl mb-4 text-sm font-semibold text-center fade-in"
                    style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>
                    {message}
                </div>
            )}

            {/* Reset button */}
            <div className="mb-5 p-4 rounded-xl" style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <h3 className="font-bold text-sm mb-2 text-[color:var(--danger)]">🗑️ Reset All Daily Logs</h3>
                <p className="text-xs text-[color:var(--text-muted)] mb-3">This will delete all check-in data for all users. Users themselves are not deleted.</p>
                <button onClick={handleReset} className="btn-danger text-sm" id="reset-btn">
                    {confirmReset ? '⚠️ Click again to confirm reset' : 'Reset All Data'}
                </button>
                {confirmReset && (
                    <button onClick={() => setConfirmReset(false)} className="btn-secondary text-sm ml-2">Cancel</button>
                )}
            </div>

            {/* Users list */}
            <h3 className="font-bold text-sm mb-3">
                All Users ({users.length})
            </h3>

            {loading ? (
                <div className="text-center py-4">
                    <div className="spinner mx-auto"></div>
                </div>
            ) : (
                <div className="space-y-2">
                    {users.map(u => (
                        <div key={u.id} className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm truncate">{u.name}</div>
                                <div className="text-xs text-[color:var(--text-muted)]">{u.phone}</div>
                            </div>
                            {canChangeCategory ? (
                                <select
                                    value={u.challenge_level}
                                    onChange={(e) => handleLevelChange(u.id, e.target.value)}
                                    className="text-xs p-1.5 rounded-lg bg-[color:var(--bg-card-solid)] border border-[color:var(--border)] text-[color:var(--text-primary)] cursor-pointer"
                                >
                                    {levels.map(l => (
                                        <option key={l.id} value={l.id}>{l.icon} {l.name}</option>
                                    ))}
                                </select>
                            ) : (
                                <span className="level-badge text-xs">
                                    {CHALLENGE_LEVELS[u.challenge_level]?.icon} {CHALLENGE_LEVELS[u.challenge_level]?.name}
                                </span>
                            )}
                            {canDelete && u.id !== currentUser.id && (
                                <button
                                    onClick={() => handleDelete(u.id, u.name)}
                                    className="text-xs text-[color:var(--danger)] font-semibold hover:underline cursor-pointer bg-transparent border-none"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
