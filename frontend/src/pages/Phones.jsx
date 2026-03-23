import { useEffect, useState, useContext } from 'react'
import API from '../api/axios'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import FormField, { inputStyle, selectStyle } from '../components/FormField'
import { ToastContext } from '../App'

const empty = { employeeID: '', phonenumber: '' }

function Phones() {
  const showToast = useContext(ToastContext)
  const [data,    setData]    = useState([])
  const [emps,    setEmps]    = useState([])
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState('view')
  const [form,    setForm]    = useState(empty)
  const [errors,  setErrors]  = useState({})

  const fetchData = async () => {
    try {
      const [phones, emp] = await Promise.all([
        API.get('/phones/'),
        API.get('/employees/'),
      ])
      setData(phones.data)
      setEmps(emp.data)
    } catch { showToast('Failed to fetch data', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const validate = (f) => {
    const e = {}
    if (!f.employeeID) e.employeeID = 'Select an employee'
    if (!f.phonenumber) e.phonenumber = 'Phone number is required'
    else if (!/^[0-9]{10}$/.test(f.phonenumber))
      e.phonenumber = 'Must be exactly 10 digits'
    return e
  }

  const handleAdd = async () => {
    const e = validate(form)
    if (Object.keys(e).length) { setErrors(e); return }
    try {
      await API.post('/phones/', form)
      showToast('Phone number added! ✅')
      setForm(empty)
      setErrors({})
      fetchData()
      setTab('view')
    } catch (err) {
      showToast(err.response?.data?.detail || 'Error adding phone number', 'error')
    }
  }

  const handleDelete = async (row) => {
    if (!confirm(`Remove phone number ${row.phonenumber}?`)) return
    try {
      await API.delete(`/phones/${row.employeeid}/${row.phonenumber}`)
      showToast('Phone number removed.', 'error')
      fetchData()
    } catch (err) {
      showToast(err.response?.data?.detail || 'Error deleting phone number', 'error')
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
    { key: 'employeeid',  label: 'Employee ID', render: v => <code>{v}</code> },
    { key: 'name',        label: 'Name',        render: v => <strong>{v}</strong> },
    { key: 'phonenumber', label: 'Phone Number', render: v => (
      <span style={{
        background: 'var(--mint)', color: 'var(--teal)',
        padding: '3px 10px', borderRadius: '20px',
        fontSize: '0.75rem', fontWeight: 600,
      }}>📱 {v}</span>
    )},
  ]

  return (
    <div>
      <PageHeader
        title="Employee Phone Numbers"
        subtitle="Multivalued attribute — employees can have multiple numbers"
      />

      <div style={{
        display: 'flex', gap: '6px', marginBottom: '28px',
        background: 'var(--white)', padding: '6px',
        borderRadius: '14px', border: '1.5px solid var(--border)',
        width: 'fit-content',
      }}>
        <button style={btnStyle(tab==='view')} onClick={() => setTab('view')}>View All</button>
        <button style={btnStyle(tab==='add')}  onClick={() => setTab('add')}>Add Phone</button>
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
          }}>➕ Add Phone Number</div>
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
            <FormField label="Phone Number (10 digits)" error={errors.phonenumber}>
              <input
                style={inputStyle(!!errors.phonenumber)}
                value={form.phonenumber}
                placeholder="e.g. 9876543210"
                maxLength={10}
                onChange={e => {
                  const val = e.target.value.replace(/[^0-9]/g, '')
                  setForm({...form, phonenumber: val})
                }}
              />
            </FormField>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button onClick={handleAdd} style={{
              padding: '11px 24px', border: 'none',
              background: 'linear-gradient(135deg, var(--purple), #7B5EA7)',
              color: 'white', borderRadius: '10px', cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', fontWeight: 600,
            }}>➕ Add Number</button>
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

export default Phones
