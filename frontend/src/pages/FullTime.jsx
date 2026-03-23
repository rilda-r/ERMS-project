import { useEffect, useState, useContext } from 'react'
import API from '../api/axios'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import FormField, { selectStyle } from '../components/FormField'
import { ToastContext } from '../App'

const empty = { employeeID: '', houseID: '' }

function FullTime() {
  const showToast = useContext(ToastContext)
  const [data,    setData]    = useState([])
  const [emps,    setEmps]    = useState([])
  const [houses,  setHouses]  = useState([])
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState('view')
  const [form,    setForm]    = useState(empty)
  const [errors,  setErrors]  = useState({})

  const fetchData = async () => {
    try {
      const [ft, emp, house] = await Promise.all([
        API.get('/fulltime/'),
        API.get('/employees/'),
        API.get('/houses/'),
      ])
      setData(ft.data)
      setEmps(emp.data.filter(e => e.employeeid?.startsWith('FT')))
      setHouses(house.data)
    } catch { showToast('Failed to fetch data', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const validate = (f) => {
    const e = {}
    if (!f.employeeID) e.employeeID = 'Select an employee'
    return e
  }

  const handleAdd = async () => {
    const e = validate(form)
    if (Object.keys(e).length) { setErrors(e); return }
    try {
      await API.post('/fulltime/', form)
      showToast('Full time record added! ✅')
      setForm(empty)
      setErrors({})
      fetchData()
      setTab('view')
    } catch (err) {
      showToast(err.response?.data?.detail || 'Error adding record', 'error')
    }
  }

  const handleDelete = async (row) => {
    if (!confirm(`Remove full time record for ${row.employeeid}?`)) return
    try {
      await API.delete(`/fulltime/${row.employeeid}`)
      showToast('Record removed.', 'error')
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

  const assignedEmpIDs  = data.map(d => d.employeeid)
  const assignedHouseIDs = data.map(d => d.houseid)

  const availableEmps   = emps.filter(e => !assignedEmpIDs.includes(e.employeeid))
  const availableHouses = houses.filter(h => !assignedHouseIDs.includes(h.houseid))

  const columns = [
    { key: 'employeeid', label: 'Employee ID', render: v => <code>{v}</code> },
    { key: 'name',       label: 'Name',        render: v => <strong>{v}</strong> },
    { key: 'houseid',    label: 'House ID',    render: v => v ? <code>{v}</code> : '—' },
    { key: 'housetype',  label: 'House Type',  render: v => v || '—' },
    { key: 'block',      label: 'Block',       render: v => v || '—' },
  ]

  return (
    <div>
      <PageHeader title="Full Time Employees" subtitle="Full-time staff with housing allocation" />

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
          }}>➕ Add Full Time Record</div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '16px',
          }}>
            <FormField label="Employee (FT prefix)" error={errors.employeeID}>
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
            <FormField label="House (optional)">
              <select
                style={selectStyle(false)}
                value={form.houseID}
                onChange={e => setForm({...form, houseID: e.target.value})}
              >
                <option value="">Select house</option>
                {availableHouses.map(h => (
                  <option key={h.houseid} value={h.houseid}>
                    {h.houseid} — {h.housetype}, {h.block}
                  </option>
                ))}
              </select>
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

export default FullTime