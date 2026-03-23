function FormField({ label, error, children, full }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      gridColumn: full ? '1 / -1' : undefined,
    }}>
      <label style={{
        fontSize: '0.78rem',
        fontWeight: 600,
        color: 'var(--subtext)',
        letterSpacing: '0.3px',
        textTransform: 'uppercase',
      }}>
        {label}
      </label>
      {children}
      {error && (
        <span style={{ fontSize: '0.75rem', color: 'var(--error)' }}>
          {error}
        </span>
      )}
    </div>
  )
}

export const inputStyle = (hasError) => ({
  padding: '10px 14px',
  border: `1.5px solid ${hasError ? 'var(--error)' : 'var(--border)'}`,
  borderRadius: '10px',
  fontFamily: 'DM Sans, sans-serif',
  fontSize: '0.9rem',
  color: 'var(--text)',
  background: 'var(--white)',
  outline: 'none',
  width: '100%',
})

export const selectStyle = (hasError) => ({
  ...inputStyle(hasError),
  cursor: 'pointer',
})

export default FormField