import { useState } from 'react'
import { CATEGORIES, CHAMPIONS } from '../lib/supabase'

export default function Onboarding({ onComplete }) {
    const [step, setStep] = useState(1)
    const [name, setName] = useState('')
    const [category, setCategory] = useState('')
    const [champion, setChampion] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleNext = () => {
        setError('')

        if (step === 1 && !name.trim()) {
            setError('Please enter your name')
            return
        }
        if (step === 2 && !category) {
            setError('Please select a category')
            return
        }

        setStep(step + 1)
    }

    const handleBack = () => {
        setError('')
        setStep(step - 1)
    }

    const handleSubmit = async () => {
        setError('')

        if (!champion) {
            setError('Please choose your champion')
            return
        }

        setLoading(true)
        try {
            await onComplete({ name: name.trim(), category, champion })
        } catch (err) {
            setError(err.message || 'Something went wrong')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="card w-full max-w-lg fade-in">
                {/* Progress indicator */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`w-3 h-3 rounded-full transition-all ${s === step
                                    ? 'w-8 bg-[color:var(--accent)]'
                                    : s < step
                                        ? 'bg-[color:var(--accent)]'
                                        : 'bg-[color:var(--border)]'
                                }`}
                        />
                    ))}
                </div>

                {/* Step 1: Name */}
                {step === 1 && (
                    <div className="fade-in">
                        <h2 className="text-2xl font-bold text-center mb-2">Welcome, Challenger! 👋</h2>
                        <p className="text-center text-[color:var(--text-secondary)] mb-8">
                            Let's get you set up for the February 2026 challenge
                        </p>

                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2 text-[color:var(--text-secondary)]">
                                What should we call you?
                            </label>
                            <input
                                type="text"
                                className="input text-lg"
                                placeholder="Your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoFocus
                                maxLength={50}
                            />
                        </div>
                    </div>
                )}

                {/* Step 2: Category */}
                {step === 2 && (
                    <div className="fade-in">
                        <h2 className="text-2xl font-bold text-center mb-2">Choose Your Path 🎯</h2>
                        <p className="text-center text-[color:var(--text-secondary)] mb-8">
                            Pick a goal that challenges you but feels achievable
                        </p>

                        <div className="space-y-3">
                            {Object.entries(CATEGORIES).map(([key, { name: catName, goal }]) => (
                                <button
                                    key={key}
                                    onClick={() => setCategory(key)}
                                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${category === key
                                            ? 'border-[color:var(--accent)] bg-[color:var(--accent)]/10'
                                            : 'border-[color:var(--border)] hover:border-[color:var(--accent-light)]'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold">{catName}</span>
                                        <span className="text-[color:var(--accent)] font-bold">{goal} km</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 3: Champion */}
                {step === 3 && (
                    <div className="fade-in">
                        <h2 className="text-2xl font-bold text-center mb-2">Choose Your Champion 🏆</h2>
                        <p className="text-center text-[color:var(--text-secondary)] mb-8">
                            Your companion will grow as you progress!
                        </p>

                        <div className="grid grid-cols-3 gap-4">
                            {Object.entries(CHAMPIONS).map(([key, { name: champName, stages }]) => (
                                <button
                                    key={key}
                                    onClick={() => setChampion(key)}
                                    className={`champion-option ${champion === key ? 'selected' : ''}`}
                                >
                                    <span className="emoji">{stages.baby}</span>
                                    <span className="font-medium text-sm">{champName}</span>
                                </button>
                            ))}
                        </div>

                        <div className="mt-6 p-4 rounded-xl bg-[color:var(--bg-secondary)] text-center">
                            <p className="text-sm text-[color:var(--text-secondary)]">
                                🐣 Baby → 🐤 Teen → 🐦 Adult
                            </p>
                            <p className="text-xs text-[color:var(--text-muted)] mt-1">
                                Your champion evolves as you reach 40%, 80%, and 100%!
                            </p>
                        </div>
                    </div>
                )}

                {/* Error message */}
                {error && (
                    <p className="mt-4 text-sm text-center text-[color:var(--danger)]">{error}</p>
                )}

                {/* Navigation buttons */}
                <div className="flex gap-3 mt-8">
                    {step > 1 && (
                        <button onClick={handleBack} className="btn-secondary flex-1">
                            ← Back
                        </button>
                    )}

                    {step < 3 ? (
                        <button onClick={handleNext} className="btn-primary flex-1">
                            Continue →
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            className="btn-primary flex-1 flex items-center justify-center gap-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="spinner w-5 h-5 border-2"></div>
                                    Creating...
                                </>
                            ) : (
                                "Let's Go! 🚀"
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
