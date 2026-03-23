import { useEffect, useState, useContext } from 'react'
import API from '../api/axios'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import FormField, { selectStyle } from '../components/FormField'
import { ToastContext } from '../App'

const empty = { employeeID: '', trainingID: '' }

function EmployeeTraining() {
  const showToast = useContext(ToastContext)
  const [data,      setData]      = useState([])
  const [emps,      setEmps]      = useState([])
  const [trainings, setTrainings] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [tab,       setTab]       = useState('view')
  const [form,      setForm]      = useState(empty)
  const [errors,    setErrors]    = useState({})

  const fetchData = async () => {
    try {
      const [et, emp, tr] = await Promise.all([
        API.get('/employee-training/'),
        API.get('/employees/'),
        API.get('/trainings/'),
      ])
      setData(et.data)
      setEmps(emp.data)
      setTrainings(tr.data)
    } catch { showToast('Failed to fetch data', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const validate = (f) => {
    const e = {}
    if (!f.employeeID) e.employeeID = 'Select an employee'
    if (!f.trainingID) e.trainingID = 'Select a training program'
    return e
  }

  const handleAdd = async () => {
    const e = validate(form)
    if (Object.keys(e).length) { setErrors(e); return }
    try {
      await API.post('/employee-training/', form)
      showToast('Employee enrolled in training! ✅')
      setForm(empty)
      setErrors({})
      fetchData()
      setTab('view')
    } catch (err) {
      showToast(err.response?.data?.detail || 'Error enrolling employee', 'error')
    }
  }

  const handleDelete = async (row) => {
    if (!confirm(`Remove ${row.employeename} from ${row.trainingid}?`)) return
    try {
      await API.delete(`/employee-training/${row.employeeid}/${row.trainingid}`)
      showToast('Enrollment removed.', 'error')
      fetchData()
    } catch (err) {
      showToast(err.response?.data?.detail || 'Error removing enrollment', 'error')
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
    { key: 'employeeid',    label: 'Employee ID',   render: v => <code>{v}</code> },
    { key: 'employeename',  label: 'Employee Name', render: v => <strong>{v}</strong> },
    { key: 'trainingid',    label: 'Training ID',   render: v => <code>{v}</code> },
    { key: 'simulatorused', label: 'Simulator',     render: v => <strong>{v}</strong> },
    { key: 'duration',      label: 'Duration',      render: v => (
      <span style={{
        background: 'var(--sky)', color: '#4070A0',
        padding: '3px 10px', borderRadius: '20px',
        fontSize: '0.75rem', fontWeight: 600,
      }}>{v} days</span>
    )},
  ]

  return (
    <div>
      <PageHeader
        title="Employee Training"
        subtitle="M:N — employees enrolled in training programs"
      />

      <div style={{
        display: 'flex', gap: '6px', marginBottom: '28px',
        background: 'var(--white)', padding: '6px',
        borderRadius: '14px', border: '1.5px solid var(--border)',
        width: 'fit-content',
      }}>
        <button style={btnStyle(tab==='view')} onClick={() => setTab('view')}>View All</button>
        <button style={btnStyle(tab==='add')}  onClick={() => setTab('add')}>Enroll Employee</button>
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
          }}>➕ Enroll in Training</div>
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
            <FormField label="Training Program" error={errors.trainingID}>
              <select
                style={selectStyle(!!errors.trainingID)}
                value={form.trainingID}
                onChange={e => setForm({...form, trainingID: e.target.value})}
              >
                <option value="">Select training</option>
                {trainings.map(t => (
                  <option key={t.trainingid} value={t.trainingid}>
                    {t.trainingid} — {t.simulatorused}
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
            }}>➕ Enroll</button>
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

export default EmployeeTraining