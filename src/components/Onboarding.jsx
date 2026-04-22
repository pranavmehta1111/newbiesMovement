import { useState } from 'react'
import { CHALLENGE_LEVELS } from '../lib/supabase'

const levels = Object.values(CHALLENGE_LEVELS)

export default function Onboarding({ onComplete }) {
    const [step, setStep] = useState(1) // 1=name, 2=level
    const [name, setName] = useState('')
    const [selectedLevel, setSelectedLevel] = useState('')
    const [error, setError] = useState('')

    const handleNameSubmit = (e) => {
        e.preventDefault()
        const trimmed = name.trim()
        if (trimmed.length < 2) {
            setError('Name must be at least 2 characters')
            return
        }
        setError('')
        setStep(2)
    }

    const handleComplete = () => {
        if (!selectedLevel) {
            setError('Please select a challenge level')
            return
        }
        onComplete({ name: name.trim(), challenge_level: selectedLevel })
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="card w-full max-w-lg fade-in-up">
                {/* Progress dots */}
                <div className="flex justify-center gap-2 mb-6">
                    <div className={`w-2.5 h-2.5 rounded-full transition-all ${step >= 1 ? 'bg-[color:var(--accent)] scale-110' : 'bg-[color:var(--border)]'}`}></div>
                    <div className={`w-2.5 h-2.5 rounded-full transition-all ${step >= 2 ? 'bg-[color:var(--accent)] scale-110' : 'bg-[color:var(--border)]'}`}></div>
                </div>

                {step === 1 && (
                    <div className="fade-in">
                        <div className="text-center mb-6">
                            <div className="text-4xl mb-3">👋</div>
                            <h2 className="text-2xl font-extrabold mb-1">Welcome aboard!</h2>
                            <p className="text-sm text-[color:var(--text-secondary)]">What should we call you?</p>
                        </div>

                        <form onSubmit={handleNameSubmit} className="space-y-4">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => { setName(e.target.value); setError('') }}
                                placeholder="Your name"
                                className="input text-center text-lg"
                                autoFocus
                                id="name-input"
                            />
                            {error && <p className="text-[color:var(--danger)] text-sm text-center">{error}</p>}
                            <button
                                type="submit"
                                disabled={name.trim().length < 2}
                                className="btn-primary w-full"
                                id="name-next-btn"
                            >
                                Next →
                            </button>
                        </form>
                    </div>
                )}

                {step === 2 && (
                    <div className="fade-in">
                        <div className="text-center mb-5">
                            <h2 className="text-2xl font-extrabold mb-1">Choose Your Level</h2>
                            <p className="text-sm text-[color:var(--text-secondary)]">
                                Pick a challenge that matches your ambition, <span className="font-semibold text-[color:var(--accent)]">{name.trim()}</span>!
                            </p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
                            {levels.map((level) => (
                                <div
                                    key={level.id}
                                    onClick={() => { setSelectedLevel(level.id); setError('') }}
                                    className={`level-card ${selectedLevel === level.id ? 'selected' : ''}`}
                                    id={`level-${level.id}`}
                                >
                                    <span className="level-icon">{level.icon}</span>
                                    <span className="level-name">{level.name}</span>
                                    <span className="level-targets">
                                        💧 {level.water}L · 🚶 {level.steps.toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Selected level preview */}
                        {selectedLevel && (
                            <div className="card mb-4 p-4 fade-in" style={{ background: 'var(--bg-secondary)' }}>
                                <h3 className="font-bold text-sm mb-2 text-center">
                                    {CHALLENGE_LEVELS[selectedLevel].icon} Daily Targets for {CHALLENGE_LEVELS[selectedLevel].name}
                                </h3>
                                <div className="flex justify-around text-center text-xs">
                                    <div>
                                        <div className="text-lg mb-0.5">🍬</div>
                                        <div className="font-semibold" style={{ color: 'var(--sugar-color)' }}>No Junk Sugar</div>
                                    </div>
                                    <div>
                                        <div className="text-lg mb-0.5">💧</div>
                                        <div className="font-semibold" style={{ color: 'var(--water-color)' }}>{CHALLENGE_LEVELS[selectedLevel].water}L Water</div>
                                    </div>
                                    <div>
                                        <div className="text-lg mb-0.5">🚶</div>
                                        <div className="font-semibold" style={{ color: 'var(--steps-color)' }}>{CHALLENGE_LEVELS[selectedLevel].steps.toLocaleString()} Steps</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {error && <p className="text-[color:var(--danger)] text-sm text-center mb-3">{error}</p>}

                        <div className="flex gap-3">
                            <button onClick={() => setStep(1)} className="btn-secondary flex-1" id="back-btn">← Back</button>
                            <button
                                onClick={handleComplete}
                                disabled={!selectedLevel}
                                className="btn-primary flex-1"
                                id="start-btn"
                            >
                                Let's Go! 🔥
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
