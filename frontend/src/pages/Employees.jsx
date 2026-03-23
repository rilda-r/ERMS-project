import { useEffect, useState, useContext } from 'react'
import API from '../api/axios'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import FormField, { inputStyle, selectStyle } from '../components/FormField'
import { ToastContext } from '../App'

const empty = {
  employeeID: '', name: '', DOB: '',
  gender: '', joindate: '', salary: '', deptID: ''
}

function Employees() {
  const showToast = useContext(ToastContext)
  const [data,    setData]    = useState([])
  const [depts,   setDepts]   = useState([])
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState('view')
  const [form,    setForm]    = useState(empty)
  const [errors,  setErrors]  = useState({})
  const [modal,   setModal]   = useState(false)
  const [editing, setEditing] = useState(null)
  const [search,  setSearch]  = useState('')

  const fetchData = async () => {
    try {
      const [emp, dept] = await Promise.all([
        API.get('/employees/'),
        API.get('/departments/'),
      ])
      setData(emp.data)
      setDepts(dept.data)
    } catch { showToast('Failed to fetch data', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const validate = (f) => {
    const e = {}
    if (!f.employeeID.trim()) e.employeeID = 'Employee ID is required'
    if (!f.name.trim())       e.name       = 'Name is required'
    if (!f.DOB)               e.DOB        = 'Date of birth is required'
    if (!f.gender)            e.gender     = 'Gender is required'
    if (!f.joindate)          e.joindate   = 'Join date is required'
    if (!f.salary || Number(f.salary) <= 0) e.salary = 'Salary must be positive'
    if (!f.deptID)            e.deptID     = 'Department is required'
    return e
  }

  const handleAdd = async () => {
    const e = validate(form)
    if (Object.keys(e).length) { setErrors(e); return }
    try {
      await API.post('/employees/', {
        ...form,
        employeeID: form.employeeID.toUpperCase(),
        salary: Number(form.salary),
      })
      showToast('Employee added successfully! ✅')
      setForm(empty)
      setErrors({})
      fetchData()
      setTab('view')
    } catch (err) {
      showToast(err.response?.data?.detail || 'Error adding employee', 'error')
    }
  }

  const handleDelete = async (row) => {
    if (!confirm(`Delete employee ${row.employeeid}? This will remove all related records.`)) return
    try {
      await API.delete(`/employees/${row.employeeid}`)
      showToast('Employee deleted.', 'error')
      fetchData()
    } catch (err) {
      showToast(err.response?.data?.detail || 'Error deleting employee', 'error')
    }
  }

  const handleEdit = (row) => {
    setEditing({
      employeeID: row.employeeid,
      name:       row.name,
      DOB:        row.dob,
      gender:     row.gender,
      joindate:   row.joindate,
      salary:     row.salary,
      deptID:     row.deptid,
    })
    setErrors({})
    setModal(true)
  }

  const handleSave = async () => {
    const e = validate(editing)
    if (Object.keys(e).length) { setErrors(e); return }
    try {
      await API.put(`/employees/${editing.employeeID}`, {
        ...editing,
        salary: Number(editing.salary),
      })
      showToast('Employee updated! ✅')
      setModal(false)
      fetchData()
    } catch (err) {
      showToast(err.response?.data?.detail || 'Error updating employee', 'error')
    }
  }

  const filtered = data.filter(e =>
    e.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.employeeid?.toLowerCase().includes(search.toLowerCase())
  )

  const typeBadge = (id) => {
    const isFT = id?.startsWith('FT')
    const isCT = id?.startsWith('CT')
    return (
      <span style={{
        background: isFT ? 'var(--mint)' : isCT ? 'var(--peach)' : 'var(--sky)',
        color: isFT ? 'var(--teal)' : isCT ? '#C07040' : '#4070A0',
        padding: '3px 10px', borderRadius: '20px',
        fontSize: '0.75rem', fontWeight: 600,
      }}>
        {isFT ? 'Full Time' : isCT ? 'Contract' : 'Intern'}
      </span>
    )
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
    { key: 'employeeid', label: 'ID',         render: v => <code>{v}</code> },
    { key: 'name',       label: 'Name',        render: v => <strong>{v}</strong> },
    { key: 'dob',        label: 'DOB' },
    { key: 'gender',     label: 'Gender' },
    { key: 'joindate',   label: 'Join Date' },
    { key: 'salary',     label: 'Salary',      render: v => `₹${Number(v).toLocaleString()}` },
    { key: 'deptname',   label: 'Department',  render: v => (
      <span style={{
        background: 'var(--lavender)', color: 'var(--purple)',
        padding: '3px 10px', borderRadius: '20px',
        fontSize: '0.75rem', fontWeight: 600,
      }}>{v}</span>
    )},
    { key: 'employeeid', label: 'Type', render: v => typeBadge(v) },
  ]

  return (
    <div>
      <PageHeader title="Employees" subtitle="Manage all employee records" />

      <div style={{
        display: 'flex', gap: '6px', marginBottom: '28px',
        background: 'var(--white)', padding: '6px',
        borderRadius: '14px', border: '1.5px solid var(--border)',
        width: 'fit-content',
      }}>
        <button style={btnStyle(tab==='view')} onClick={() => setTab('view')}>View All</button>
        <button style={btnStyle(tab==='add')}  onClick={() => setTab('add')}>Add Employee</button>
      </div>

      {tab === 'view' && (
        <>
          <input
            placeholder="🔍  Search by name or ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              ...inputStyle(false),
              marginBottom: '18px',
              maxWidth: '360px',
            }}
          />
          {loading
            ? <div style={{ color: 'var(--subtext)' }}>Loading...</div>
            : <DataTable
                columns={columns}
                data={filtered}
                actions={(row) => (<>
                  <button onClick={() => handleEdit(row)} style={{
                    padding: '7px 14px', border: 'none',
                    background: 'var(--border)', borderRadius: '10px',
                    cursor: 'pointer', fontSize: '0.8rem',
                    fontFamily: 'DM Sans, sans-serif',
                    fontWeight: 500, color: 'var(--subtext)',
                  }}>✏️ Edit</button>
                  <button onClick={() => handleDelete(row)} style={{
                    padding: '7px 14px', border: 'none',
                    background: 'linear-gradient(135deg, #E07080, #C05060)',
                    borderRadius: '10px', cursor: 'pointer',
                    fontSize: '0.8rem', fontFamily: 'DM Sans, sans-serif',
                    fontWeight: 500, color: 'white',
                  }}>🗑</button>
                </>)}
              />
          }
        </>
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
          }}>➕ Add New Employee</div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '16px',
          }}>
            <FormField label="Employee ID" error={errors.employeeID}>
              <input
                style={inputStyle(!!errors.employeeID)}
                value={form.employeeID}
                placeholder="e.g. FT004, CT003, IN004"
                onChange={e => setForm({...form, employeeID: e.target.value})}
              />
            </FormField>
            <FormField label="Full Name" error={errors.name}>
              <input
                style={inputStyle(!!errors.name)}
                value={form.name}
                placeholder="e.g. Arun Kumar"
                onChange={e => setForm({...form, name: e.target.value})}
              />
            </FormField>
            <FormField label="Date of Birth" error={errors.DOB}>
              <input
                type="date"
                style={inputStyle(!!errors.DOB)}
                value={form.DOB}
                onChange={e => setForm({...form, DOB: e.target.value})}
              />
            </FormField>
            <FormField label="Gender" error={errors.gender}>
              <select
                style={selectStyle(!!errors.gender)}
                value={form.gender}
                onChange={e => setForm({...form, gender: e.target.value})}
              >
                <option value="">Select gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </FormField>
            <FormField label="Join Date" error={errors.joindate}>
              <input
                type="date"
                style={inputStyle(!!errors.joindate)}
                value={form.joindate}
                onChange={e => setForm({...form, joindate: e.target.value})}
              />
            </FormField>
            <FormField label="Salary (₹)" error={errors.salary}>
              <input
                type="number"
                style={inputStyle(!!errors.salary)}
                value={form.salary}
                placeholder="e.g. 50000"
                onChange={e => setForm({...form, salary: e.target.value})}
              />
            </FormField>
            <FormField label="Department" error={errors.deptID}>
              <select
                style={selectStyle(!!errors.deptID)}
                value={form.deptID}
                onChange={e => setForm({...form, deptID: e.target.value})}
              >
                <option value="">Select department</option>
                {depts.map(d => (
                  <option key={d.deptid} value={d.deptid}>{d.deptname}</option>
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
            }}>➕ Add Employee</button>
            <button onClick={() => { setForm(empty); setErrors({}) }} style={{
              padding: '11px 24px', border: 'none',
              background: 'var(--border)', color: 'var(--subtext)',
              borderRadius: '10px', cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', fontWeight: 500,
            }}>✕ Clear</button>
          </div>
        </div>
      )}

      <Modal
        isOpen={modal}
        title={`Edit Employee — ${editing?.employeeID}`}
        onClose={() => setModal(false)}
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '16px',
        }}>
          <FormField label="Full Name" error={errors.name}>
            <input
              style={inputStyle(!!errors.name)}
              value={editing?.name || ''}
              onChange={e => setEditing({...editing, name: e.target.value})}
            />
          </FormField>
          <FormField label="Gender" error={errors.gender}>
            <select
              style={selectStyle(!!errors.gender)}
              value={editing?.gender || ''}
              onChange={e => setEditing({...editing, gender: e.target.value})}
            >
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </FormField>
          <FormField label="Salary (₹)" error={errors.salary}>
            <input
              type="number"
              style={inputStyle(!!errors.salary)}
              value={editing?.salary || ''}
              onChange={e => setEditing({...editing, salary: e.target.value})}
            />
          </FormField>
          <FormField label="Department" error={errors.deptID}>
            <select
              style={selectStyle(!!errors.deptID)}
              value={editing?.deptID || ''}
              onChange={e => setEditing({...editing, deptID: e.target.value})}
            >
              {depts.map(d => (
                <option key={d.deptid} value={d.deptid}>{d.deptname}</option>
              ))}
            </select>
          </FormField>
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button onClick={handleSave} style={{
            padding: '11px 24px', border: 'none',
            background: 'linear-gradient(135deg, var(--purple), #7B5EA7)',
            color: 'white', borderRadius: '10px', cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', fontWeight: 600,
          }}>💾 Save Changes</button>
          <button onClick={() => setModal(false)} style={{
            padding: '11px 24px', border: 'none',
            background: 'var(--border)', color: 'var(--subtext)',
            borderRadius: '10px', cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', fontWeight: 500,
          }}>Cancel</button>
        </div>
      </Modal>
    </div>
  )
}

export default Employees