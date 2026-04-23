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

// Admin phone numbers (can edit any user's level)
export const ADMIN_PHONES = [
    '9314422001', // Pranav
    '7349327332', // Sudha
    '8197898805',
    '9944069451',
    '9380936622',
    '9779497219', // Ujjwal
]

// Phone number with delete user permission
export const DELETE_PHONE = '9887922770'

// Challenge levels
export const CHALLENGE_LEVELS = {
    seedling: { id: 'seedling', name: 'Seedling', icon: '🌱', sugar: true, water: 2.0, steps: 5000 },
    sprout: { id: 'sprout', name: 'Sprout', icon: '🌿', sugar: true, water: 2.5, steps: 7000 },
    grower: { id: 'grower', name: 'Grower', icon: '🌳', sugar: true, water: 3.0, steps: 9000 },
    beast: { id: 'beast', name: 'Beast', icon: '⚡', sugar: true, water: 3.5, steps: 11000 },
    legend: { id: 'legend', name: 'Legend', icon: '🔥', sugar: true, water: 3.5, steps: 12000 },
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

export async function updateUserLevel(userId, challenge_level) {
    if (!supabase) throw new Error('Database not configured')

    const { data, error } = await supabase
        .from('users')
        .update({ challenge_level })
        .eq('id', userId)
        .select()
        .single()

    if (error) {
        console.error('Error updating user:', error)
        throw error
    }
    return data
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

export async function getDailyLogs(userId) {
    if (!supabase) return []

    const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', userId)
        .order('log_date', { ascending: false })

    if (error) {
        console.error('Error fetching logs:', error)
        return []
    }
    return data
}

export async function getLogForDate(userId, dateString) {
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('log_date', dateString)
        .single();

    if (error && error.code !== 'PGRST116') {
        console.error('Error fetching log:', error);
    }
    return data;
}

export async function upsertDailyLog(userId, logData) {
    if (!supabase) throw new Error('Database not configured')

    // Find if it exists to get ID if we need it, but Supabase handles upsert via unique constraints
    // Our schema has a unique constraint on (user_id, log_date)
    const { data, error } = await supabase
        .from('daily_logs')
        .upsert([{
            user_id: userId,
            ...logData
        }], { onConflict: 'user_id,log_date' })
        .select()
        .single()

    if (error) {
        console.error('Error upserting log:', error)
        throw error
    }
    return data
}

export function checkDayCompletion(log, levelConfig, optOutSugar = false) {
    if (!log || !levelConfig) return { isComplete: false, metCount: 0, totalTargets: optOutSugar ? 2 : 3 };

    let metCount = 0;
    if (!optOutSugar && log.sugar_rule_met) metCount++;
    if (log.water_liters >= levelConfig.water) metCount++;
    if (log.steps >= levelConfig.steps) metCount++;

    const required = optOutSugar ? 2 : 3;

    return {
        isComplete: metCount >= required,
        metCount,
        totalTargets: required
    };
}

export async function getLeaderboardByLevel(levelId) {
    if (!supabase) return []

    const { data: users, error } = await supabase
        .from('users')
        .select(`
            id,
            name,
            challenge_level,
            opt_out_sugar,
            daily_logs (log_date, sugar_rule_met, water_liters, steps)
        `)
        .eq('challenge_level', levelId)

    if (error) {
        console.error('Error fetching leaderboard:', error)
        return []
    }

    const levelConfig = CHALLENGE_LEVELS[levelId];

    // Calculate scores (days totally completed) and current streak
    return users.map(user => {
        let completedDays = 0;
        const validLogs = user.daily_logs || [];

        validLogs.forEach(log => {
            const { isComplete } = checkDayCompletion(log, levelConfig, user.opt_out_sugar);
            if (isComplete) completedDays++;
        });

        const streak = calculateStreak(validLogs, levelConfig, user.opt_out_sugar);

        return {
            ...user,
            score: completedDays,
            streak,
            totalLogs: validLogs.length
        }
    })
        // Only show people who have started
        .filter(u => u.totalLogs > 0)
        .sort((a, b) => b.score - a.score || b.streak - a.streak)
}

export async function getAllUsers() {
    if (!supabase) return []

    const { data, error } = await supabase
        .from('users')
        .select('id, name, phone, challenge_level, opt_out_sugar')
        .order('name')

    if (error) {
        console.error('Error fetching users:', error)
        return []
    }
    return data
}

export function getCurrentDateString() {
    // using local time to handle YYYY-MM-DD
    const d = new Date();
    const offset = d.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(d - offset)).toISOString().split('T')[0];
    return localISOTime;
}

export function getCurrentMonthLabel() {
    return 'May 2026'
}

export async function resetAllData() {
    if (!supabase) throw new Error('Database not configured')

    const { error } = await supabase
        .from('daily_logs')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')

    if (error) {
        console.error('Error resetting data:', error)
        throw error
    }
}

function calculateStreak(logs, levelConfig, optOutSugar = false) {
    if (!logs || !logs.length) return 0

    // Sort logs descending
    const sortedLogs = [...logs].sort((a, b) => new Date(b.log_date) - new Date(a.log_date))

    const todayStr = getCurrentDateString();

    let currentStreak = 0;
    let expectedDate = new Date(todayStr);

    // Convert to map for easy lookup
    const logMap = {};
    sortedLogs.forEach(l => { logMap[l.log_date] = l; });

    // Loop backwards from today
    for (let i = 0; i < 365; i++) {
        const checkStr = expectedDate.toISOString().split('T')[0];
        const log = logMap[checkStr];

        if (log) {
            const { isComplete } = checkDayCompletion(log, levelConfig, optOutSugar);
            if (isComplete) {
                currentStreak++;
            } else if (i !== 0) {
                // If not complete and it's a past day, streak breaks
                break;
            }
        } else if (i !== 0) {
            // No log and it's a past day, streak breaks
            break;
        }

        // Go back one day
        expectedDate.setDate(expectedDate.getDate() - 1);
    }

    return currentStreak;
}
