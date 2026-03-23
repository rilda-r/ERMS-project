import { useEffect, useState, useContext } from 'react'
import API from '../api/axios'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import FormField, { inputStyle, selectStyle } from '../components/FormField'
import { ToastContext } from '../App'

const empty = { employeeID: '', dependentname: '', age: '', relation: '' }

function Dependents() {
  const showToast = useContext(ToastContext)
  const [data,    setData]    = useState([])
  const [emps,    setEmps]    = useState([])
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState('view')
  const [form,    setForm]    = useState(empty)
  const [errors,  setErrors]  = useState({})

  const fetchData = async () => {
    try {
      const [dep, emp] = await Promise.all([
        API.get('/dependents/'),
        API.get('/employees/'),
      ])
      setData(dep.data)
      setEmps(emp.data)
    } catch { showToast('Failed to fetch data', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const validate = (f) => {
    const e = {}
    if (!f.employeeID)          e.employeeID    = 'Select an employee'
    if (!f.dependentname.trim()) e.dependentname = 'Dependent name is required'
    if (!f.age || Number(f.age) <= 0 || Number(f.age) >= 120)
      e.age = 'Valid age required (1–119)'
    if (!f.relation)            e.relation      = 'Select a relation'
    return e
  }

  const handleAdd = async () => {
    const e = validate(form)
    if (Object.keys(e).length) { setErrors(e); return }
    try {
      await API.post('/dependents/', {
        ...form,
        age: Number(form.age),
      })
      showToast('Dependent added! ✅')
      setForm(empty)
      setErrors({})
      fetchData()
      setTab('view')
    } catch (err) {
      showToast(err.response?.data?.detail || 'Error adding dependent', 'error')
    }
  }

  const handleDelete = async (row) => {
    if (!confirm(`Remove dependent ${row.dependentname}?`)) return
    try {
      await API.delete(`/dependents/${row.employeeid}/${row.dependentname}`)
      showToast('Dependent removed.', 'error')
      fetchData()
    } catch (err) {
      showToast(err.response?.data?.detail || 'Error deleting dependent', 'error')
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

  const columns = [
    { key: 'employeeid',    label: 'Employee ID',    render: v => <code>{v}</code> },
    { key: 'employeename',  label: 'Employee Name',  render: v => <strong>{v}</strong> },
    { key: 'dependentname', label: 'Dependent Name', render: v => <strong>{v}</strong> },
    { key: 'age',           label: 'Age' },
    { key: 'relation',      label: 'Relation', render: v => (
      <span style={{
        background: 'var(--lavender)', color: 'var(--purple)',
        padding: '3px 10px', borderRadius: '20px',
        fontSize: '0.75rem', fontWeight: 600,
      }}>{v}</span>
    )},
  ]

  return (
    <div>
      <PageHeader title="Dependents" subtitle="Dependents of employees" />

      <div style={{
        display: 'flex', gap: '6px', marginBottom: '28px',
        background: 'var(--white)', padding: '6px',
        borderRadius: '14px', border: '1.5px solid var(--border)',
        width: 'fit-content',
      }}>
        <button style={btnStyle(tab==='view')} onClick={() => setTab('view')}>View All</button>
        <button style={btnStyle(tab==='add')}  onClick={() => setTab('add')}>Add Dependent</button>
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
          }}>➕ Add Dependent</div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '16px',
          }}>
            <FormField label="Employee" error={errors.employeeID}>
              <select
                style={selectStyle(!!errors.employeeID)}
                value={form.employeeID}
                onChange={e => setForm({...form, employeeID: e.target.value})}
              >
                <option value="">Select employee</option>
                {emps.map(e => (
                  <option key={e.employeeid} value={e.employeeid}>
                    {e.employeeid} — {e.name}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Dependent Name" error={errors.dependentname}>
              <input
                style={inputStyle(!!errors.dependentname)}
                value={form.dependentname}
                placeholder="e.g. Priya Devi"
                onChange={e => setForm({...form, dependentname: e.target.value})}
              />
            </FormField>
            <FormField label="Age" error={errors.age}>
              <input
                type="number"
                style={inputStyle(!!errors.age)}
                value={form.age}
                placeholder="e.g. 28"
                onChange={e => setForm({...form, age: e.target.value})}
              />
            </FormField>
            <FormField label="Relation" error={errors.relation}>
              <select
                style={selectStyle(!!errors.relation)}
                value={form.relation}
                onChange={e => setForm({...form, relation: e.target.value})}
              >
                <option value="">Select relation</option>
                <option>Spouse</option>
                <option>Child</option>
                <option>Parent</option>
                <option>Sibling</option>
              </select>
            </FormField>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button onClick={handleAdd} style={{
              padding: '11px 24px', border: 'none',
              background: 'linear-gradient(135deg, var(--purple), #7B5EA7)',
              color: 'white', borderRadius: '10px', cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', fontWeight: 600,
            }}>➕ Add Dependent</button>
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

export default Dependents