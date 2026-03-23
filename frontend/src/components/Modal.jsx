function Modal({ isOpen, title, onClose, children }) {
  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(45,38,64,0.35)',
      backdropFilter: 'blur(4px)',
      zIndex: 200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: 'var(--white)',
        borderRadius: '20px',
        padding: '32px',
        width: '90%',
        maxWidth: '560px',
        maxHeight: '85vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(45,38,64,0.2)',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}>
          <div style={{
            fontFamily: 'DM Serif Display, serif',
            fontSize: '1.3rem',
            color: 'var(--text)',
          }}>
            {title}
          </div>
          <button onClick={onClose} style={{
            background: 'var(--border)',
            border: 'none',
            borderRadius: '8px',
            width: '32px',
            height: '32px',
            cursor: 'pointer',
            fontSize: '1rem',
            color: 'var(--subtext)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default Modal