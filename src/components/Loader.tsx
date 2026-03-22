interface LoaderProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  fullPage?: boolean
}

export default function Loader({ size = 'md', text, fullPage = false }: LoaderProps) {
  const dim = { sm: 14, md: 24, lg: 36 }[size]
  const stroke = size === 'lg' ? 2 : 1.5

  const spinner = (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 24 24"
      fill="none"
      style={{
        animation: 'spin 0.8s linear infinite',
        flexShrink: 0,
      }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle
        cx="12" cy="12" r="9"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth={stroke}
      />
      <path
        d="M12 3a9 9 0 0 1 9 9"
        stroke="rgba(255,255,255,0.7)"
        strokeWidth={stroke}
        strokeLinecap="round"
      />
    </svg>
  )

  if (fullPage) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5,5,5,0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
        }}
      >
        {spinner}
        {text && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--ink-3)', letterSpacing: '0.06em' }}>
            {text}
          </span>
        )}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '24px 0' }}>
      {spinner}
      {text && (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--ink-3)', letterSpacing: '0.04em' }}>
          {text}
        </span>
      )}
    </div>
  )
}