export function BenixIcon({ size = 40, color = 'currentColor', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M50 96 L19 84 L7 60 L8 36 L18 20 L30 6 L38 24 L50 17 L62 24 L70 6 L82 20 L92 36 L93 60 L81 84 Z"
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinejoin="miter"
        strokeLinecap="butt"
      />
      <polygon points="50,51 37,67 63,67" fill={color} />
    </svg>
  )
}

export function BenixLogotype({ iconSize = 48, color = 'currentColor', className = '' }) {
  return (
    <div className={`benix-logotype ${className}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
      <BenixIcon size={iconSize} color={color} />
      <span style={{
        fontFamily: 'var(--font-brand)',
        fontWeight: 900,
        fontSize: iconSize * 0.75,
        color,
        letterSpacing: '-2px',
        lineHeight: 1,
      }}>
        Benix
      </span>
    </div>
  )
}

export function BenixSidebarLogo({ color = 'currentColor' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <BenixIcon size={28} color={color} />
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
        <span style={{
          fontFamily: 'var(--font-brand)',
          fontWeight: 900,
          fontSize: '22px',
          color,
          letterSpacing: '-1px',
          lineHeight: 1,
        }}>Benix</span>
        <span style={{ fontSize: '11px', color: 'rgba(237,237,229,0.35)', fontWeight: 500 }}>v0.01</span>
      </div>
    </div>
  )
}
