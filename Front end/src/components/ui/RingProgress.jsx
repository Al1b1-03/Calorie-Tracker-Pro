import './RingProgress.css';

/**
 * @param {{ value: number, max: number, size?: number, stroke?: number, label?: string, sublabel?: string, color?: string, className?: string }} props
 */
export default function RingProgress({
  value = 0,
  max = 100,
  size = 160,
  stroke = 12,
  label,
  sublabel,
  color = 'var(--color-primary)',
  className = '',
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const offset = circumference * (1 - pct);

  return (
    <div className={`ring-progress ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle
          className="ring-progress__track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          className="ring-progress__fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          fill="none"
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="ring-progress__center">
        {label && <span className="ring-progress__label">{label}</span>}
        {sublabel && <span className="ring-progress__sublabel">{sublabel}</span>}
      </div>
    </div>
  );
}
