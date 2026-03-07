import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if Supabase is configured
export const isSupabaseConfigured = supabaseUrl && supabaseAnonKey &&
    supabaseUrl !== 'your-supabase-url-here' &&
    supabaseAnonKey !== 'your-supabase-anon-key-here'

// Create Supabase client (or null if not configured)
export const supabase = isSupabaseConfigured
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

// Admin phone numbers (can edit any user's category)
export const ADMIN_PHONES = [
    '9314422001', // Pranav - Replace with actual number
    '7349327332', // Sudha - Replace with actual number  
    '8197898805',
    '9944069451',
    '9380936622',
    '9779497219', // Ujjwal - Replace with actual number
]

// Phone number with delete user permission
export const DELETE_PHONE = '9887922770'

// Category goals in kilometers
export const CATEGORIES = {
    underdog: { name: 'The resting Underdog', goal: 25 },
    normie: { name: 'The cool Normie', goal: 50 },
    rockstar: { name: 'The future Rockstar', goal: 75 },
    superhuman: { name: 'The Superhuman', goal: 100 },
    titan: { name: 'The Titan', goal: 200 },
}

// Champion emojis and growth stages
export const CHAMPIONS = {
    puppy: {
        name: 'Puppy',
        stages: { baby: '🐶', teen: '🐕', adult: '🦮' }
    },
    kitten: {
        name: 'Kitten',
        stages: { baby: '🐱', teen: '🐈', adult: '🐈‍⬛' }
    },
    bird: {
        name: 'Bird',
        stages: { baby: '🐣', teen: '🐤', adult: '🐦' }
    }
}

// Get growth stage based on progress percentage
export function getGrowthStage(percentage) {
    if (percentage <= 40) return 'baby'
    if (percentage <= 80) return 'teen'
    return 'adult'
}

// Get champion emoji for current progress
export function getChampionEmoji(champion, percentage) {
    const stage = getGrowthStage(percentage)
    return CHAMPIONS[champion]?.stages[stage] || '❓'
}

// Database helper functions
export async function getUserByPhone(phone) {
    if (!supabase) return null

    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('phone', phone)
        .single()

    if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user:', error)
    }
    return data
}

export async function createUser(userData) {
    if (!supabase) throw new Error('Database not configured')

    const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single()

    if (error) {
        console.error('Error creating user:', error)
        throw error
    }
    return data
}

export async function updateUserCategory(userId, category) {
    if (!supabase) throw new Error('Database not configured')

    const { data, error } = await supabase
        .from('users')
        .update({ category })
        .eq('id', userId)
        .select()
        .single()

    if (error) {
        console.error('Error updating user:', error)
        throw error
    }
    return data
}

export async function getActivities(userId) {
    if (!supabase) return []

    const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', userId)
        .order('logged_at', { ascending: false })

    if (error) {
        console.error('Error fetching activities:', error)
        return []
    }
    return data
}

export async function addActivity(userId, distanceKm, loggedAt) {
    if (!supabase) throw new Error('Database not configured')

    const { data, error } = await supabase
        .from('activities')
        .insert([{ user_id: userId, distance_km: distanceKm, logged_at: loggedAt }])
        .select()
        .single()

    if (error) {
        console.error('Error adding activity:', error)
        throw error
    }
    return data
}

export async function deleteActivity(activityId) {
    if (!supabase) throw new Error('Database not configured')

    const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', activityId)

    if (error) {
        console.error('Error deleting activity:', error)
        throw error
    }
}

export async function deleteUser(userId) {
    if (!supabase) throw new Error('Database not configured')

    const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)

    if (error) {
        console.error('Error deleting user:', error)
        throw error
    }
}

export async function getLeaderboardByCategory(category) {
    if (!supabase) return []

    const { data: users, error } = await supabase
        .from('users')
        .select(`
      id,
      name,
      champion,
      category,
      activities (distance_km, logged_at)
    `)
        .eq('category', category)

    if (error) {
        console.error('Error fetching leaderboard:', error)
        return []
    }

    // Calculate totals and streaks, then filter out users with 0km
    return users.map(user => {
        const totalKm = user.activities?.reduce((sum, a) => sum + parseFloat(a.distance_km), 0) || 0
        const streak = calculateStreak(user.activities || [])
        return { ...user, totalKm, streak }
    }).filter(user => user.totalKm > 0).sort((a, b) => b.totalKm - a.totalKm)
}

export async function getAllUsers() {
    if (!supabase) return []

    const { data, error } = await supabase
        .from('users')
        .select('id, name, phone, category, champion')
        .order('name')

    if (error) {
        console.error('Error fetching users:', error)
        return []
    }
    return data
}

// Get current month date range (for filtering)
export function getCurrentMonthRange() {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const firstDay = `${year}-${String(month + 1).padStart(2, '0')}-01`
    const lastDay = `${year}-${String(month + 1).padStart(2, '0')}-${String(new Date(year, month + 1, 0).getDate()).padStart(2, '0')}`
    return { firstDay, lastDay }
}

// Get current month label
export function getCurrentMonthLabel() {
    const now = new Date()
    return now.toLocaleString('en-US', { month: 'long', year: 'numeric' })
}

// Reset all activities (admin only)
export async function resetAllActivities() {
    if (!supabase) throw new Error('Database not configured')

    const { error } = await supabase
        .from('activities')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // delete all rows

    if (error) {
        console.error('Error resetting activities:', error)
        throw error
    }
}

function calculateStreak(activities) {
    if (!activities.length) return 0

    const dates = [...new Set(activities.map(a => a.logged_at))].sort().reverse()
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    // Streak must include today or yesterday
    if (dates[0] !== today && dates[0] !== yesterday) return 0

    let streak = 1
    for (let i = 1; i < dates.length; i++) {
        const prevDate = new Date(dates[i - 1])
        const currDate = new Date(dates[i])
        const diffDays = (prevDate - currDate) / 86400000

        if (diffDays === 1) {
            streak++
        } else {
            break
        }
    }

    return streak
}
