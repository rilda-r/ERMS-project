import { useEffect, useState } from 'react'
import API from '../api/axios'
import PageHeader from '../components/PageHeader'

function StatCard({ icon, number, label, color }) {
  return (
    <div style={{
      background: 'var(--white)',
      borderRadius: '16px',
      padding: '20px',
      border: '1.5px solid var(--border)',
      boxShadow: '0 2px 12px var(--shadow)',
      transition: 'transform 0.2s',
      cursor: 'default',
    }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ fontSize: '1.4rem', marginBottom: '8px' }}>{icon}</div>
      <div style={{
        fontFamily: 'DM Serif Display, serif',
        fontSize: '2rem',
        color: 'var(--text)',
        lineHeight: 1,
        marginBottom: '4px',
      }}>
        {number}
      </div>
      <div style={{ fontSize: '0.8rem', color: 'var(--subtext)', fontWeight: 500 }}>
        {label}
      </div>
    </div>
  )
}

function Dashboard() {
  const [stats, setStats] = useState({
    employees: 0,
    departments: 0,
    houses: 0,
    fulltime: 0,
    contracts: 0,
    interns: 0,
    dependents: 0,
    colleges: 0,
  })
  const [recentEmployees, setRecentEmployees] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [emp, dept, house, ft, ct, intern, dep, col] = await Promise.all([
          API.get('/employees/'),
          API.get('/departments/'),
          API.get('/houses/'),
          API.get('/fulltime/'),
          API.get('/contracts/'),
          API.get('/interns/'),
          API.get('/dependents/'),
          API.get('/colleges/'),
        ])
        setStats({
          employees:   emp.data.length,
          departments: dept.data.length,
          houses:      house.data.length,
          fulltime:    ft.data.length,
          contracts:   ct.data.length,
          interns:     intern.data.length,
          dependents:  dep.data.length,
          colleges:    col.data.length,
        })
        setRecentEmployees(emp.data.slice(-5).reverse())
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  if (loading) return (
    <div style={{ color: 'var(--subtext)', padding: '40px' }}>Loading dashboard...</div>
  )

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Welcome to the Employee Resource Management System" />

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '16px',
        marginBottom: '28px',
      }}>
        <StatCard icon="👥" number={stats.employees}   label="Total Employees" />
        <StatCard icon="🏢" number={stats.departments} label="Departments" />
        <StatCard icon="🏠" number={stats.houses}      label="Houses" />
        <StatCard icon="⏱️" number={stats.fulltime}    label="Full Time" />
        <StatCard icon="📄" number={stats.contracts}   label="Contract" />
        <StatCard icon="🎓" number={stats.interns}     label="Interns" />
        <StatCard icon="🎒" number={stats.dependents}  label="Dependents" />
        <StatCard icon="🏫" number={stats.colleges}    label="Colleges" />
      </div>

      <div style={{
        background: 'var(--white)',
        borderRadius: '18px',
        border: '1.5px solid var(--border)',
        padding: '28px',
        boxShadow: '0 4px 20px var(--shadow)',
      }}>
        <div style={{
          fontFamily: 'DM Serif Display, serif',
          fontSize: '1.1rem',
          marginBottom: '20px',
          color: 'var(--text)',
        }}>
          👥 Recent Employees
        </div>
        <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1.5px solid var(--border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.87rem' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(135deg, var(--lavender), var(--pink))' }}>
                {['ID', 'Name', 'Gender', 'Department', 'Salary', 'Type'].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px', textAlign: 'left',
                    fontWeight: 600, fontSize: '0.78rem',
                    letterSpacing: '0.5px', textTransform: 'uppercase',
                    color: 'var(--text)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentEmployees.map(e => (
                <tr key={e.employeeid}
                  style={{ borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={ev => ev.currentTarget.style.background = '#F9F6FF'}
                  onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '12px 16px' }}><code>{e.employeeid}</code></td>
                  <td style={{ padding: '12px 16px' }}><strong>{e.name}</strong></td>
                  <td style={{ padding: '12px 16px' }}>{e.gender}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      background: 'var(--lavender)', color: 'var(--purple)',
                      padding: '3px 10px', borderRadius: '20px',
                      fontSize: '0.75rem', fontWeight: 600,
                    }}>{e.deptname}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>₹{Number(e.salary).toLocaleString()}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      background: e.employeeid?.startsWith('FT') ? 'var(--mint)'
                               : e.employeeid?.startsWith('CT') ? 'var(--peach)'
                               : 'var(--sky)',
                      color: e.employeeid?.startsWith('FT') ? 'var(--teal)'
                           : e.employeeid?.startsWith('CT') ? '#C07040'
                           : '#4070A0',
                      padding: '3px 10px', borderRadius: '20px',
                      fontSize: '0.75rem', fontWeight: 600,
                    }}>
                      {e.employeeid?.startsWith('FT') ? 'Full Time'
                     : e.employeeid?.startsWith('CT') ? 'Contract'
                     : 'Intern'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard