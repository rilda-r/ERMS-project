function Header() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, var(--lavender), var(--pink))',
      padding: '20px 40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 4px 24px var(--shadow)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div>
        <div style={{
          fontFamily: 'DM Serif Display, serif',
          fontSize: '1.9rem',
          color: 'var(--text)',
          letterSpacing: '-0.5px',
        }}>
          ERM<span style={{ color: 'var(--purple)', fontStyle: 'italic' }}>S</span>
        </div>
        <div style={{
          fontSize: '0.8rem',
          color: 'var(--subtext)',
          marginTop: '2px',
        }}>
          Employee Resource Management System · Power Plant
        </div>
      </div>
      <div style={{ fontSize: '0.8rem', color: 'var(--subtext)' }}>
        24BAI1497 · R. Rilda
      </div>
    </div>
  )
}

export default Header