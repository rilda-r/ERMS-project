import { useEffect, useState, useContext } from 'react'
import API from '../api/axios'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import FormField, { selectStyle } from '../components/FormField'
import { ToastContext } from '../App'

const empty = { employeeID: '', deptID: '', collegeID: '' }

function Internships() {
  const showToast = useContext(ToastContext)
  const [data,    setData]    = useState([])
  const [interns, setInterns] = useState([])
  const [depts,   setDepts]   = useState([])
  const [colleges,setColleges]= useState([])
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState('view')
  const [form,    setForm]    = useState(empty)
  const [errors,  setErrors]  = useState({})

  const fetchData = async () => {
    try {
      const [ia, intern, dept, college] = await Promise.all([
        API.get('/internships/'),
        API.get('/interns/'),
        API.get('/departments/'),
        API.get('/colleges/'),
      ])
      setData(ia.data)
      setInterns(intern.data)
      setDepts(dept.data)
      setColleges(college.data)
    } catch { showToast('Failed to fetch data', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const validate = (f) => {
    const e = {}
    if (!f.employeeID) e.employeeID = 'Select an intern'
    if (!f.deptID)     e.deptID     = 'Select a department'
    if (!f.collegeID)  e.collegeID  = 'Select a college'
    return e
  }

  const handleAdd = async () => {
    const e = validate(form)
    if (Object.keys(e).length) { setErrors(e); return }
    try {
      await API.post('/internships/', form)
      showToast('Internship assignment added! ✅')
      setForm(empty)
      setErrors({})
      fetchData()
      setTab('view')
    } catch (err) {
      showToast(err.response?.data?.detail || 'Error adding assignment', 'error')
    }
  }

  const handleDelete = async (row) => {
    if (!confirm('Remove this internship assignment?')) return
    try {
      await API.delete(`/internships/${row.employeeid}/${row.deptid}/${row.collegeid}`)
      showToast('Assignment removed.', 'error')
      fetchData()
    } catch (err) {
      showToast(err.response?.data?.detail || 'Error deleting assignment', 'error')
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
    { key: 'employeeid',  label: 'Employee ID',  render: v => <code>{v}</code> },
    { key: 'internname',  label: 'Intern Name',  render: v => <strong>{v}</strong> },
    { key: 'deptname',    label: 'Department',   render: v => (
      <span style={{
        background: 'var(--lavender)', color: 'var(--purple)',
        padding: '3px 10px', borderRadius: '20px',
        fontSize: '0.75rem', fontWeight: 600,
      }}>{v}</span>
    )},
    { key: 'collegename', label: 'College',      render: v => <strong>{v}</strong> },
    { key: 'branch',      label: 'Branch',       render: v => (
      <span style={{
        background: 'var(--sky)', color: '#4070A0',
        padding: '3px 10px', borderRadius: '20px',
        fontSize: '0.75rem', fontWeight: 600,
      }}>{v}</span>
    )},
  ]

  return (
    <div>
      <PageHeader
        title="Internship Assignments"
        subtitle="Ternary relationship — Intern · Department · College"
      />

      <div style={{
        display: 'flex', gap: '6px', marginBottom: '28px',
        background: 'var(--white)', padding: '6px',
        borderRadius: '14px', border: '1.5px solid var(--border)',
        width: 'fit-content',
      }}>
        <button style={btnStyle(tab==='view')} onClick={() => setTab('view')}>View All</button>
        <button style={btnStyle(tab==='add')}  onClick={() => setTab('add')}>Add Assignment</button>
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
          }}>➕ Add Internship Assignment</div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '16px',
          }}>
            <FormField label="Intern" error={errors.employeeID}>
              <select
                style={selectStyle(!!errors.employeeID)}
                value={form.employeeID}
                onChange={e => setForm({...form, employeeID: e.target.value})}
              >
                <option value="">Select intern</option>
                {interns.map(i => (
                  <option key={i.employeeid} value={i.employeeid}>
                    {i.employeeid} — {i.name}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Department" error={errors.deptID}>
              <select
                style={selectStyle(!!errors.deptID)}
                value={form.deptID}
                onChange={e => setForm({...form, deptID: e.target.value})}
              >
                <option value="">Select department</option>
                {depts.map(d => (
                  <option key={d.deptid} value={d.deptid}>
                    {d.deptname}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="College" error={errors.collegeID}>
              <select
                style={selectStyle(!!errors.collegeID)}
                value={form.collegeID}
                onChange={e => setForm({...form, collegeID: e.target.value})}
              >
                <option value="">Select college</option>
                {colleges.map(c => (
                  <option key={c.collegeid} value={c.collegeid}>
                    {c.collegename} — {c.branch}
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
            }}>➕ Assign</button>
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

export default Internships