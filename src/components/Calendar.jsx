import { useState } from 'react'
import { checkDayCompletion } from '../lib/supabase'

export default function Calendar({ logs, levelConfig, onDayClick }) {
    const [viewDate, setViewDate] = useState(new Date())

    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    const monthName = viewDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })

    const firstDayOfMonth = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    // Create a map of date -> log
    const logMap = {}
    logs.forEach(l => { logMap[l.log_date] = l })

    const prevMonth = () => setViewDate(new Date(year, month - 1, 1))
    const nextMonth = () => setViewDate(new Date(year, month + 1, 1))

    const getDayClass = (day) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        const log = logMap[dateStr]
        const isToday = dateStr === todayStr

        let cls = 'calendar-day'
        if (isToday) cls += ' today'

        if (log) {
            const { metCount } = checkDayCompletion(log, levelConfig)
            cls += ` complete-${metCount}`
        }

        return cls
    }

    const handleDayClick = (day) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        onDayClick(dateStr)
    }

    return (
        <div className="card fade-in">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="btn-secondary py-1.5 px-3 text-sm">◀</button>
                <h2 className="text-lg font-bold">{monthName}</h2>
                <button onClick={nextMonth} className="btn-secondary py-1.5 px-3 text-sm">▶</button>
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-3 mb-3 text-xs">
                <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-sm inline-block" style={{ background: 'var(--steps-color)' }}></span> 3/3
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-sm inline-block" style={{ background: 'var(--sugar-color)' }}></span> 2/3
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-sm inline-block" style={{ background: '#f97316' }}></span> 1/3
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-sm inline-block" style={{ background: 'var(--bg-secondary)' }}></span> None
                </span>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                    <div key={d} className="text-center text-xs font-semibold text-[color:var(--text-muted)] py-1">
                        {d}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for days before 1st */}
                {Array.from({ length: firstDayOfMonth }, (_, i) => (
                    <div key={`empty-${i}`} className="calendar-day other-month"></div>
                ))}
                {/* Days */}
                {Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1
                    return (
                        <div
                            key={day}
                            className={getDayClass(day)}
                            onClick={() => handleDayClick(day)}
                        >
                            {day}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
