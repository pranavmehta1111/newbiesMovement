import { useState } from 'react'

const SUGAR_RULES = {
    forbidden: [
        { emoji: '🥤', text: 'Sodas (Coke, Pepsi, etc.), Energy drinks' },
        { emoji: '🧃', text: 'Packaged fruit juices, Sweetened milk teas/iced teas' },
        { emoji: '🍰', text: 'Cakes, cookies, pastries, donuts, brownies' },
        { emoji: '🍫', text: 'Candies, milk chocolate, ice cream, puddings' },
        { emoji: '🍬', text: 'Traditional sweets / mithai' },
        { emoji: '☕', text: 'White/brown sugar added to tea or coffee' },
    ],
    allowed: [
        { emoji: '🍎', text: 'All whole, fresh fruits' },
        { emoji: '🥛', text: 'Plain milk, unsweetened yogurt/curd' },
        { emoji: '🍫', text: '80%+ dark chocolate (in moderation)' },
        { emoji: '🌿', text: 'Stevia, Monk fruit sweeteners' },
        { emoji: '🍯', text: 'Grace: ≤1 tsp honey/jaggery per day' },
    ]
}

export default function DailyCheckin({ currentLog, levelConfig, onSave, onClose }) {
    const [sugarMet, setSugarMet] = useState(currentLog?.sugar_rule_met || false)
    const [waterLiters, setWaterLiters] = useState(currentLog?.water_liters || 0)
    const [steps, setSteps] = useState(currentLog?.steps || 0)
    const [showRules, setShowRules] = useState(false)
    const [saving, setSaving] = useState(false)

    // Water as glasses (each glass = 250ml)
    const waterGlasses = Math.round(waterLiters * 4) // Convert liters to glasses
    const maxGlasses = Math.ceil(levelConfig.water * 4) + 4 // A few extra beyond target

    const toggleGlass = (index) => {
        const newGlasses = index + 1 === waterGlasses ? index : index + 1;
        setWaterLiters(Number((newGlasses * 0.25).toFixed(2)))
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            await onSave({
                sugar_rule_met: sugarMet,
                water_liters: waterLiters,
                steps: steps,
            })
        } catch (err) {
            console.error(err)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-content">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-extrabold">Daily Check-in</h2>
                    <button onClick={onClose} className="text-2xl text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] transition-colors cursor-pointer bg-transparent border-none">×</button>
                </div>

                {/* Sugar Section */}
                <div className="mb-5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm">🍬 Sugar Rule</span>
                        <button
                            onClick={() => setShowRules(!showRules)}
                            className="text-xs text-[color:var(--accent)] font-semibold cursor-pointer bg-transparent border-none hover:underline"
                            id="sugar-rules-toggle"
                        >
                            {showRules ? 'Hide rules ▲' : 'View rules ▼'}
                        </button>
                    </div>

                    {showRules && (
                        <div className="card mb-3 p-3 fade-in text-xs" style={{ background: 'var(--bg-secondary)' }}>
                            <p className="font-bold text-red-500 mb-1.5">🚫 FORBIDDEN</p>
                            {SUGAR_RULES.forbidden.map((r, i) => (
                                <p key={i} className="mb-1 text-[color:var(--text-secondary)]">{r.emoji} {r.text}</p>
                            ))}
                            <div className="border-t border-[color:var(--border)] my-2"></div>
                            <p className="font-bold text-green-500 mb-1.5">✅ ALLOWED</p>
                            {SUGAR_RULES.allowed.map((r, i) => (
                                <p key={i} className="mb-1 text-[color:var(--text-secondary)]">{r.emoji} {r.text}</p>
                            ))}
                        </div>
                    )}

                    <button
                        onClick={() => setSugarMet(!sugarMet)}
                        className={`sugar-check ${sugarMet ? 'checked' : ''}`}
                        id="sugar-toggle"
                    >
                        <span className="check-icon">
                            {sugarMet && <span>✓</span>}
                        </span>
                        {sugarMet ? 'No junk sugar today! 🎉' : 'I avoided junk sugar today'}
                    </button>
                </div>

                {/* Water Section */}
                <div className="mb-5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm">💧 Water Intake</span>
                        <span className="text-sm font-semibold" style={{ color: waterLiters >= levelConfig.water ? 'var(--success)' : 'var(--water-color)' }}>
                            {waterLiters.toFixed(1)}L / {levelConfig.water}L
                        </span>
                    </div>
                    <p className="text-xs text-[color:var(--text-muted)] mb-2">
                        Tap glasses to log (each glass = 250ml)
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {Array.from({ length: maxGlasses }, (_, i) => (
                            <button
                                key={i}
                                onClick={() => toggleGlass(i)}
                                className={`water-glass ${i < waterGlasses ? 'filled' : ''}`}
                            >
                                {i < waterGlasses ? '💧' : '○'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Steps Section */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm">🚶 Steps</span>
                        <span className="text-sm font-semibold" style={{ color: steps >= levelConfig.steps ? 'var(--success)' : 'var(--steps-color)' }}>
                            {steps.toLocaleString()} / {levelConfig.steps.toLocaleString()}
                        </span>
                    </div>
                    <input
                        type="number"
                        value={steps || ''}
                        onChange={(e) => setSteps(Math.max(0, parseInt(e.target.value) || 0))}
                        placeholder="Enter your step count"
                        className="input"
                        min="0"
                        max="99999"
                        id="steps-input"
                    />
                    {/* Quick buttons */}
                    <div className="flex gap-2 mt-2 flex-wrap">
                        {[3000, 5000, 7000, 10000, 12000].map(v => (
                            <button
                                key={v}
                                onClick={() => setSteps(v)}
                                className={`text-xs px-2.5 py-1.5 rounded-lg font-semibold cursor-pointer border transition-all ${steps === v
                                        ? 'bg-[color:var(--accent)] text-white border-transparent'
                                        : 'bg-[color:var(--bg-secondary)] text-[color:var(--text-secondary)] border-[color:var(--border)] hover:border-[color:var(--accent)]'
                                    }`}
                            >
                                {(v / 1000).toFixed(0)}k
                            </button>
                        ))}
                    </div>
                </div>

                {/* Completion Preview */}
                <div className="flex justify-center gap-3 mb-4">
                    <span className={`text-lg ${sugarMet ? '' : 'opacity-30'}`}>🍬✓</span>
                    <span className={`text-lg ${waterLiters >= levelConfig.water ? '' : 'opacity-30'}`}>💧✓</span>
                    <span className={`text-lg ${steps >= levelConfig.steps ? '' : 'opacity-30'}`}>🚶✓</span>
                </div>

                {/* Save */}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary w-full"
                    id="save-checkin-btn"
                >
                    {saving ? 'Saving...' : 'Save Check-in 💾'}
                </button>
            </div>
        </div>
    )
}
