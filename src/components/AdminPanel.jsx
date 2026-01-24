import { useState, useEffect } from 'react'
import { CATEGORIES, getAllUsers, updateUserCategory } from '../lib/supabase'

export default function AdminPanel() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(null)
    const [search, setSearch] = useState('')

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        setLoading(true)
        const data = await getAllUsers()
        setUsers(data)
        setLoading(false)
    }

    const handleCategoryChange = async (userId, newCategory) => {
        setUpdating(userId)
        try {
            await updateUserCategory(userId, newCategory)
            setUsers(users.map(u =>
                u.id === userId ? { ...u, category: newCategory } : u
            ))
        } catch (err) {
            alert('Failed to update category: ' + err.message)
        } finally {
            setUpdating(null)
        }
    }

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.phone?.includes(search)
    )

    return (
        <div className="card">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Admin Panel 🔧</h3>
                <span className="px-2 py-1 text-xs font-medium bg-[color:var(--warning)]/20 text-[color:var(--warning)] rounded">
                    Admin Only
                </span>
            </div>

            <p className="text-sm text-[color:var(--text-secondary)] mb-4">
                Change any user's category as needed.
            </p>

            {/* Search */}
            <input
                type="text"
                className="input mb-4"
                placeholder="Search by name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="spinner"></div>
                </div>
            ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredUsers.map(user => (
                        <div
                            key={user.id}
                            className="flex items-center gap-3 p-3 rounded-lg bg-[color:var(--bg-secondary)]"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{user.name}</p>
                                <p className="text-xs text-[color:var(--text-muted)]">{user.phone}</p>
                            </div>

                            <select
                                className="select py-2 px-3 w-auto min-w-[140px]"
                                value={user.category}
                                onChange={(e) => handleCategoryChange(user.id, e.target.value)}
                                disabled={updating === user.id}
                            >
                                {Object.entries(CATEGORIES).map(([key, { name }]) => (
                                    <option key={key} value={key}>{name}</option>
                                ))}
                            </select>

                            {updating === user.id && (
                                <div className="spinner w-5 h-5 border-2"></div>
                            )}
                        </div>
                    ))}

                    {filteredUsers.length === 0 && (
                        <p className="text-center text-[color:var(--text-muted)] py-4">
                            No users found
                        </p>
                    )}
                </div>
            )}

            <button
                onClick={fetchUsers}
                className="btn-secondary w-full mt-4"
            >
                Refresh List
            </button>
        </div>
    )
}
