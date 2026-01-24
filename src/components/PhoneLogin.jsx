import { useState } from 'react'

export default function PhoneLogin({ onLogin, onLogout, savedPhone }) {
    const [phone, setPhone] = useState(savedPhone || '')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const validatePhone = (value) => {
        // Remove non-numeric characters
        const cleaned = value.replace(/\D/g, '')
        return cleaned
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        const cleanedPhone = validatePhone(phone)
        if (cleanedPhone.length < 10) {
            setError('Please enter a valid phone number (at least 10 digits)')
            return
        }

        setLoading(true)
        try {
            await onLogin(cleanedPhone)
        } catch (err) {
            setError(err.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="card w-full max-w-md fade-in">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">
                        <span className="bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-green-400 dark:to-emerald-500 bg-clip-text text-transparent">
                            The Newbies Movement Challenge
                        </span>
                    </h1>
                    <p className="text-[color:var(--text-secondary)]">February 2026 • Let's Move Together! 🏃‍♂️</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-[color:var(--text-secondary)]">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            className="input text-lg"
                            placeholder="Enter your phone number"
                            value={phone}
                            onChange={(e) => setPhone(validatePhone(e.target.value))}
                            maxLength={15}
                            autoFocus
                        />
                        {error && (
                            <p className="mt-2 text-sm text-[color:var(--danger)]">{error}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="btn-primary w-full text-lg flex items-center justify-center gap-2"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <div className="spinner w-5 h-5 border-2"></div>
                                Checking...
                            </>
                        ) : (
                            'Continue →'
                        )}
                    </button>
                </form>

                {savedPhone && (
                    <div className="mt-6 pt-6 border-t border-[color:var(--border)]">
                        <button
                            onClick={onLogout}
                            className="btn-secondary w-full text-sm"
                        >
                            Use a different number
                        </button>
                    </div>
                )}

                <div className="mt-8 text-center">
                    <p className="text-sm text-[color:var(--text-muted)]">
                        No password needed • Just your phone number 📱
                    </p>
                </div>
            </div>
        </div>
    )
}
