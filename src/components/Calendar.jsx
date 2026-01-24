import { useMemo } from 'react'

export default function Calendar({ activities, onDayClick }) {
    // February 2026 calendar data
    const calendarData = useMemo(() => {
        const year = 2026
        const month = 1 // February (0-indexed)

        // February 2026 starts on Sunday (0)
        const firstDay = new Date(year, month, 1).getDay()
        const daysInMonth = 28 // 2026 is not a leap year

        // Create activity lookup by date
        const activityByDate = {}
        activities.forEach(activity => {
            const date = activity.logged_at
            if (!activityByDate[date]) {
                activityByDate[date] = 0
            }
            activityByDate[date] += parseFloat(activity.distance_km)
        })

        // Build calendar grid
        const days = []
        const today = new Date().toISOString().split('T')[0]

        // Empty cells for days before the 1st
        for (let i = 0; i < firstDay; i++) {
            days.push({ day: null, date: null })
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = `2026-02-${String(day).padStart(2, '0')}`
            days.push({
                day,
                date,
                distance: activityByDate[date] || 0,
                isToday: date === today,
            })
        }

        return days
    }, [activities])

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    return (
        <div className="card">
            <h3 className="font-semibold text-lg mb-4">February 2026</h3>

            {/* Week day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map(day => (
                    <div key={day} className="text-center text-xs font-medium text-[color:var(--text-muted)] py-2">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
                {calendarData.map((item, index) => (
                    <div
                        key={index}
                        onClick={() => item.distance > 0 && onDayClick?.(item.date)}
                        className={`calendar-day text-sm ${item.day === null
                                ? 'other-month'
                                : item.distance > 0
                                    ? 'has-activity'
                                    : item.isToday
                                        ? 'today'
                                        : ''
                            }`}
                        title={item.distance > 0 ? `${item.distance.toFixed(1)} km` : ''}
                    >
                        {item.day}
                        {item.distance > 0 && (
                            <span className="text-[10px] ml-0.5">✓</span>
                        )}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-[color:var(--text-muted)]">
                <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-[color:var(--accent)]"></span>
                    Activity logged
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded border-2 border-[color:var(--accent)]"></span>
                    Today
                </span>
            </div>
        </div>
    )
}
