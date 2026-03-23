function PageHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: '28px' }}>
      <div style={{
        fontFamily: 'DM Serif Display, serif',
        fontSize: '1.7rem',
        color: 'var(--text)',
        marginBottom: '4px',
      }}>
        {title}
      </div>
      <div style={{
        fontSize: '0.85rem',
        color: 'var(--subtext)',
      }}>
        {subtitle}
      </div>
    </div>
  )
}

export default PageHeader