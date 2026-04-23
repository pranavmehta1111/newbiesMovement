export default function ProgressRings({ sugarMet, waterLiters, waterTarget, steps, stepsTarget, optOutSugar }) {
    const ringSize = 110
    const strokeWidth = 10
    const radius = (ringSize - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius

    const waterPct = Math.min((waterLiters / waterTarget) * 100, 100)
    const stepsPct = Math.min((steps / stepsTarget) * 100, 100)
    const sugarPct = sugarMet ? 100 : 0

    const getOffset = (pct) => circumference - (pct / 100) * circumference

    const Ring = ({ pct, color, glow, icon, value, unit }) => (
        <div className="ring-container fade-in-up" style={{ width: ringSize, height: ringSize }}>
            <svg width={ringSize} height={ringSize}>
                {/* Background ring */}
                <circle
                    cx={ringSize / 2}
                    cy={ringSize / 2}
                    r={radius}
                    fill="none"
                    stroke="var(--ring-bg)"
                    strokeWidth={strokeWidth}
                />
                {/* Progress ring */}
                <circle
                    cx={ringSize / 2}
                    cy={ringSize / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={getOffset(pct)}
                    className="progress-ring-circle"
                    style={{
                        filter: pct > 0 ? `drop-shadow(0 0 6px ${glow})` : 'none',
                    }}
                />
            </svg>
            <div className="ring-label">
                <span style={{ fontSize: '1.3rem' }}>{icon}</span>
                <span className="ring-value" style={{ color }}>{value}</span>
                <span className="ring-unit">{unit}</span>
            </div>
        </div>
    )

    return (
        <div className="flex justify-center gap-4 flex-wrap">
            <Ring
                pct={sugarPct}
                color={sugarMet ? '#22c55e' : 'var(--ring-bg)'}
                glow="rgba(34, 197, 94, 0.4)"
                icon="🍬"
                value={sugarMet ? '✓' : '—'}
                unit="sugar"
            />
            <Ring
                pct={waterPct}
                color="var(--water-color)"
                glow="var(--water-glow)"
                icon="💧"
                value={waterLiters.toFixed(1)}
                unit={`/ ${waterTarget}L`}
            />
            <Ring
                pct={stepsPct}
                color="var(--steps-color)"
                glow="var(--steps-glow)"
                icon="🚶"
                value={steps >= 1000 ? `${(steps / 1000).toFixed(1)}k` : steps}
                unit={`/ ${(stepsTarget / 1000).toFixed(0)}k`}
            />
        </div>
    )
}
