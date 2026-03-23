import { useEffect } from 'react'

function Toast({ message, type, onClose }) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [message, onClose])

  if (!message) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      padding: '14px 22px',
      borderRadius: '12px',
      fontSize: '0.9rem',
      fontWeight: 500,
      color: 'white',
      zIndex: 999,
      maxWidth: '320px',
      background: type === 'error'
        ? 'linear-gradient(135deg, #E07080, #C05060)'
        : 'linear-gradient(135deg, #5BA08A, #4A8A78)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
      animation: 'slideUp 0.3s ease',
    }}>
      {message}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default Toast