import { useState } from 'react'
import { getCurrentMonthLabel } from '../lib/supabase'

export default function PhoneLogin({ onLogin }) {
    const [phone, setPhone] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        const cleaned = phone.replace(/\D/g, '')
        if (cleaned.length !== 10) {
            setError('Please enter a valid 10-digit phone number')
            return
        }
        setLoading(true)
        setError('')
        try {
            await onLogin(cleaned)
        } catch (err) {
            setError('Something went wrong. Please try again.')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="card w-full max-w-md fade-in-up">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="text-5xl mb-4">🌿</div>
                    <h1 className="text-3xl font-extrabold mb-2">
                        <span className="bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">
                            Newbies Wellness
                        </span>
                    </h1>
                    <p className="text-[color:var(--text-secondary)] text-sm font-medium">
                        {getCurrentMonthLabel()} • Limit Sugar · Drink Water · Walk Daily
                    </p>
                </div>

                {/* Pillars Preview */}
                <div className="flex justify-center gap-6 mb-8">
                    <div className="flex flex-col items-center gap-1 fade-in stagger-1">
                        <span className="text-2xl">🍬</span>
                        <span className="text-xs text-[color:var(--text-muted)] font-medium">No Sugar</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 fade-in stagger-2">
                        <span className="text-2xl">💧</span>
                        <span className="text-xs text-[color:var(--text-muted)] font-medium">Drink Water</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 fade-in stagger-3">
                        <span className="text-2xl">🚶</span>
                        <span className="text-xs text-[color:var(--text-muted)] font-medium">Walk Daily</span>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-[color:var(--text-secondary)]">
                            Phone Number
                        </label>
                        <div className="flex items-center gap-2">
                            <span className="text-[color:var(--text-muted)] font-semibold text-sm shrink-0">+91</span>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => {
                                    setPhone(e.target.value)
                                    setError('')
                                }}
                                placeholder="Enter your 10-digit number"
                                className="input"
                                maxLength="10"
                                autoFocus
                                id="phone-input"
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="text-[color:var(--danger)] text-sm font-medium fade-in">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading || phone.replace(/\D/g, '').length !== 10}
                        className="btn-primary w-full"
                        id="login-btn"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="spinner" style={{ width: '1rem', height: '1rem', borderWidth: '2px' }}></span>
                                Loading...
                            </span>
                        ) : (
                            'Start My Challenge 🚀'
                        )}
                    </button>
                </form>

                <p className="text-center text-xs text-[color:var(--text-muted)] mt-6">
                    Your phone number is used to save your progress
                </p>
            </div>
        </div>
    )
}
