import { useNavigate, useLocation } from 'react-router-dom'

const links = [
  { section: 'Overview', items: [
    { label: 'Dashboard',              path: '/',                color: 'var(--lavender)' },
  ]},
  { section: 'Core', items: [
    { label: 'Employees',              path: '/employees',       color: 'var(--pink)' },
    { label: 'Departments',            path: '/departments',     color: 'var(--mint)' },
    { label: 'Houses',                 path: '/houses',          color: 'var(--peach)' },
  ]},
  { section: 'Employee Types', items: [
    { label: 'Full Time',              path: '/fulltime',        color: 'var(--mint)' },
    { label: 'Contract',               path: '/contracts',       color: 'var(--peach)' },
    { label: 'Interns',                path: '/interns',         color: 'var(--sky)' },
  ]},
  { section: 'Relations', items: [
    { label: 'Dependents',             path: '/dependents',      color: 'var(--yellow)' },
    { label: 'Training',               path: '/trainings',       color: 'var(--lavender)' },
    { label: 'Colleges',               path: '/colleges',        color: 'var(--sky)' },
    { label: 'Internship Assignment',  path: '/internships',     color: 'var(--pink)' },
    { label: 'Employee Phone',         path: '/phones',          color: 'var(--peach)' },
    { label: 'Employee Training',      path: '/employee-training', color: 'var(--mint)' },
  ]},
]

function Sidebar() {
  const navigate  = useNavigate()
  const location  = useLocation()

  return (
    <div style={{
      width: '230px',
      background: 'var(--white)',
      borderRight: '1.5px solid var(--border)',
      padding: '28px 0',
      flexShrink: 0,
      position: 'sticky',
      top: '90px',
      height: 'calc(100vh - 90px)',
      overflowY: 'auto',
    }}>
      {links.map(group => (
        <div key={group.section} style={{ padding: '0 18px', marginBottom: '6px' }}>
          <div style={{
            fontSize: '0.68rem',
            fontWeight: 600,
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            color: 'var(--subtext)',
            padding: '10px 10px 6px',
          }}>
            {group.section}
          </div>
          {group.items.map(item => {
            const active = location.pathname === item.path
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  border: 'none',
                  background: active ? 'var(--lavender)' : 'transparent',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '0.87rem',
                  color: active ? 'var(--purple)' : 'var(--subtext)',
                  fontWeight: active ? 600 : 500,
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{
                  width: '8px', height: '8px',
                  borderRadius: '50%',
                  background: item.color,
                  flexShrink: 0,
                }} />
                {item.label}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default Sidebar