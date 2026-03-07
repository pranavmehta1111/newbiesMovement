import { CATEGORIES, getChampionEmoji, getGrowthStage } from '../lib/supabase'

export default function ProgressBar({
    champion,
    category,
    totalKm,
    customGoal,
    editingGoal,
    goalInput,
    onEditGoal,
    onGoalInputChange,
    onSaveGoal,
    onResetGoal,
    onCancelEdit,
}) {
    const categoryGoal = CATEGORIES[category]?.goal || 50
    const goal = customGoal || categoryGoal
    const percentage = Math.min((totalKm / goal) * 100, 150) // Cap visual at 150%
    const actualPercentage = (totalKm / goal) * 100
    const isComplete = actualPercentage >= 100
    const stage = getGrowthStage(actualPercentage)
    const emoji = getChampionEmoji(champion, actualPercentage)

    return (
        <div className="card">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="font-semibold text-lg">Your Progress</h3>
                    <p className="text-sm text-[color:var(--text-secondary)]">
                        {CATEGORIES[category]?.name || 'Unknown Category'}
                        {customGoal && <span className="text-xs text-[color:var(--accent)] ml-1">(Custom)</span>}
                    </p>
                </div>
                <div className="text-right">
                    {editingGoal ? (
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                className="input w-20 py-1 px-2 text-sm text-right"
                                value={goalInput}
                                onChange={(e) => onGoalInputChange(e.target.value)}
                                min="1"
                                max="1000"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') onSaveGoal()
                                    if (e.key === 'Escape') onCancelEdit()
                                }}
                            />
                            <span className="text-xs text-[color:var(--text-muted)]">km</span>
                            <button
                                onClick={onSaveGoal}
                                className="text-xs px-2 py-1 rounded bg-[color:var(--accent)] text-white"
                                title="Save"
                            >
                                ✓
                            </button>
                            {customGoal && (
                                <button
                                    onClick={onResetGoal}
                                    className="text-xs px-2 py-1 rounded bg-[color:var(--danger)]/20 text-[color:var(--danger)]"
                                    title="Reset to default"
                                >
                                    ↺
                                </button>
                            )}
                            <button
                                onClick={onCancelEdit}
                                className="text-xs text-[color:var(--text-muted)]"
                            >
                                ✕
                            </button>
                        </div>
                    ) : (
                        <div
                            className="cursor-pointer group"
                            onClick={onEditGoal}
                            title="Click to set a custom goal"
                        >
                            <p className="text-2xl font-bold">
                                {totalKm.toFixed(1)} <span className="text-base font-normal text-[color:var(--text-secondary)]">/ {goal} km</span>
                            </p>
                            <p className="text-sm text-[color:var(--accent)] flex items-center justify-end gap-1">
                                {actualPercentage.toFixed(0)}%
                                <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity text-[color:var(--text-muted)]">✏️</span>
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Progress bar */}
            <div className="relative h-12 bg-[color:var(--progress-bg)] rounded-full overflow-visible">
                {/* Fill */}
                <div
                    className="absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                        width: `${Math.min(percentage, 100)}%`,
                        background: 'var(--progress-fill)',
                    }}
                />

                {/* Overflow indicator (past 100%) */}
                {percentage > 100 && (
                    <div
                        className="absolute top-0 h-full rounded-r-full transition-all duration-500"
                        style={{
                            left: '100%',
                            width: `${Math.min(percentage - 100, 50)}%`,
                            background: 'linear-gradient(90deg, var(--accent), #fbbf24)',
                            opacity: 0.6,
                        }}
                    />
                )}

                {/* Champion icon */}
                <div
                    className={`absolute top-1/2 -translate-y-1/2 transition-all duration-500 ease-out ${isComplete ? 'champion-glow' : ''
                        }`}
                    style={{
                        left: `${Math.min(percentage, 100)}%`,
                        transform: `translateX(-50%) translateY(-50%)`,
                    }}
                >
                    <div className="relative">
                        {/* Crown for 100%+ */}
                        {isComplete && (
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-2xl crown-float">
                                👑
                            </span>
                        )}

                        {/* Champion emoji */}
                        <span className="text-4xl" role="img" aria-label="champion">
                            {emoji}
                        </span>
                    </div>
                </div>

                {/* Milestone markers */}
                <div className="absolute top-full left-0 w-full flex justify-between mt-2 text-xs text-[color:var(--text-muted)] px-1">
                    <span>0</span>
                    <span style={{ marginLeft: '40%' }}>40%</span>
                    <span style={{ marginLeft: '20%' }}>80%</span>
                    <span>100%</span>
                </div>
            </div>

            {/* Stage indicator */}
            <div className="mt-8 flex items-center justify-center gap-4 text-sm">
                <span className={`px-3 py-1 rounded-full ${stage === 'baby' ? 'bg-[color:var(--accent)]/20 text-[color:var(--accent)]' : 'text-[color:var(--text-muted)]'}`}>
                    🐣 Baby
                </span>
                <span className={`px-3 py-1 rounded-full ${stage === 'teen' ? 'bg-[color:var(--accent)]/20 text-[color:var(--accent)]' : 'text-[color:var(--text-muted)]'}`}>
                    🐤 Teen
                </span>
                <span className={`px-3 py-1 rounded-full ${stage === 'adult' ? 'bg-[color:var(--accent)]/20 text-[color:var(--accent)]' : 'text-[color:var(--text-muted)]'}`}>
                    🐦 Adult
                </span>
            </div>
        </div>
    )
}
