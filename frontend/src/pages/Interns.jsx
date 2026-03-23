import { useEffect, useState, useContext } from 'react'
import API from '../api/axios'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import FormField, { inputStyle, selectStyle } from '../components/FormField'
import { ToastContext } from '../App'

const empty = { employeeID: '', duration: '' }

function Interns() {
  const showToast = useContext(ToastContext)
  const [data,    setData]    = useState([])
  const [emps,    setEmps]    = useState([])
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState('view')
  const [form,    setForm]    = useState(empty)
  const [errors,  setErrors]  = useState({})

  const fetchData = async () => {
    try {
      const [intern, emp] = await Promise.all([
        API.get('/interns/'),
        API.get('/employees/'),
      ])
      setData(intern.data)
      setEmps(emp.data.filter(e => e.employeeid?.startsWith('IN')))
    } catch { showToast('Failed to fetch data', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const validate = (f) => {
    const e = {}
    if (!f.employeeID) e.employeeID = 'Select an employee'
    if (!f.duration)   e.duration   = 'Duration is required'
    else if (Number(f.duration) < 2 || Number(f.duration) > 5)
      e.duration = 'Duration must be between 2 and 5 months'
    return e
  }

  const handleAdd = async () => {
    const e = validate(form)
    if (Object.keys(e).length) { setErrors(e); return }
    try {
      await API.post('/interns/', {
        ...form,
        duration: Number(form.duration),
      })
      showToast('Intern record added! ✅')
      setForm(empty)
      setErrors({})
      fetchData()
      setTab('view')
    } catch (err) {
      showToast(err.response?.data?.detail || 'Error adding record', 'error')
    }
  }

  const handleDelete = async (row) => {
    if (!confirm(`Remove intern record for ${row.employeeid}?`)) return
    try {
      await API.delete(`/interns/${row.employeeid}`)
      showToast('Intern record removed.', 'error')
      fetchData()
    } catch (err) {
      showToast(err.response?.data?.detail || 'Error deleting record', 'error')
    }
  }

  const btnStyle = (active) => ({
    padding: '8px 20px', border: 'none',
    background: active ? 'var(--lavender)' : 'transparent',
    borderRadius: '10px', cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem',
    fontWeight: active ? 600 : 500,
    color: active ? 'var(--purple)' : 'var(--subtext)',
  })

  const assignedEmpIDs = data.map(d => d.employeeid)
  const availableEmps  = emps.filter(e => !assignedEmpIDs.includes(e.employeeid))

  const columns = [
    { key: 'employeeid', label: 'Employee ID', render: v => <code>{v}</code> },
    { key: 'name',       label: 'Name',        render: v => <strong>{v}</strong> },
    { key: 'deptname',   label: 'Department',  render: v => (
      <span style={{
        background: 'var(--lavender)', color: 'var(--purple)',
        padding: '3px 10px', borderRadius: '20px',
        fontSize: '0.75rem', fontWeight: 600,
      }}>{v}</span>
    )},
    { key: 'duration',   label: 'Duration',    render: v => (
      <span style={{
        background: 'var(--sky)', color: '#4070A0',
        padding: '3px 10px', borderRadius: '20px',
        fontSize: '0.75rem', fontWeight: 600,
      }}>{v} months</span>
    )},
  ]

  return (
    <div>
      <PageHeader title="Interns" subtitle="Intern records with duration (2–5 months)" />

      <div style={{
        display: 'flex', gap: '6px', marginBottom: '28px',
        background: 'var(--white)', padding: '6px',
        borderRadius: '14px', border: '1.5px solid var(--border)',
        width: 'fit-content',
      }}>
        <button style={btnStyle(tab==='view')} onClick={() => setTab('view')}>View All</button>
        <button style={btnStyle(tab==='add')}  onClick={() => setTab('add')}>Add Record</button>
      </div>

      {tab === 'view' && (
        loading
          ? <div style={{ color: 'var(--subtext)' }}>Loading...</div>
          : <DataTable
              columns={columns}
              data={data}
              actions={(row) => (
                <button onClick={() => handleDelete(row)} style={{
                  padding: '7px 14px', border: 'none',
                  background: 'linear-gradient(135deg, #E07080, #C05060)',
                  borderRadius: '10px', cursor: 'pointer',
                  fontSize: '0.8rem', fontFamily: 'DM Sans, sans-serif',
                  fontWeight: 500, color: 'white',
                }}>🗑 Remove</button>
              )}
            />
      )}

      {tab === 'add' && (
        <div style={{
          background: 'var(--white)', borderRadius: '18px',
          border: '1.5px solid var(--border)', padding: '28px',
          boxShadow: '0 4px 20px var(--shadow)',
        }}>
          <div style={{
            fontFamily: 'DM Serif Display, serif',
            fontSize: '1.1rem', marginBottom: '20px', color: 'var(--text)',
          }}>➕ Add Intern Record</div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '16px',
          }}>
            <FormField label="Employee (IN prefix)" error={errors.employeeID}>
              <select
                style={selectStyle(!!errors.employeeID)}
                value={form.employeeID}
                onChange={e => setForm({...form, employeeID: e.target.value})}
              >
                <option value="">Select employee</option>
                {availableEmps.map(e => (
                  <option key={e.employeeid} value={e.employeeid}>
                    {e.employeeid} — {e.name}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Duration (months, 2–5)" error={errors.duration}>
              <input
                type="number"
                min="2"
                max="5"
                style={inputStyle(!!errors.duration)}
                value={form.duration}
                placeholder="e.g. 3"
                onChange={e => setForm({...form, duration: e.target.value})}
              />
            </FormField>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button onClick={handleAdd} style={{
              padding: '11px 24px', border: 'none',
              background: 'linear-gradient(135deg, var(--purple), #7B5EA7)',
              color: 'white', borderRadius: '10px', cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', fontWeight: 600,
            }}>➕ Add Record</button>
            <button onClick={() => { setForm(empty); setErrors({}) }} style={{
              padding: '11px 24px', border: 'none',
              background: 'var(--border)', color: 'var(--subtext)',
              borderRadius: '10px', cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', fontWeight: 500,
            }}>✕ Clear</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Interns