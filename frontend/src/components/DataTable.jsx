function DataTable({ columns, data, actions }) {
  if (!data || data.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '48px 20px',
        color: 'var(--subtext)',
      }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🗃️</div>
        <div style={{ fontSize: '0.9rem' }}>No records found</div>
      </div>
    )
  }

  return (
    <div style={{
      overflowX: 'auto',
      borderRadius: '12px',
      border: '1.5px solid var(--border)',
    }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '0.87rem',
      }}>
        <thead>
          <tr style={{
            background: 'linear-gradient(135deg, var(--lavender), var(--pink))',
          }}>
            {columns.map(col => (
              <th key={col.key} style={{
                padding: '12px 16px',
                textAlign: 'left',
                fontWeight: 600,
                fontSize: '0.78rem',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                color: 'var(--text)',
              }}>
                {col.label}
              </th>
            ))}
            {actions && (
              <th style={{
                padding: '12px 16px',
                textAlign: 'left',
                fontWeight: 600,
                fontSize: '0.78rem',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                color: 'var(--text)',
              }}>
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} style={{
              borderBottom: '1px solid var(--border)',
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#F9F6FF'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {columns.map(col => (
                <td key={col.key} style={{
                  padding: '12px 16px',
                  color: 'var(--text)',
                }}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
              {actions && (
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {actions(row)}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default DataTable