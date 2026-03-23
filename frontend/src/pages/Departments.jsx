import { useEffect, useState, useContext } from 'react'
import API from '../api/axios'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import FormField, { inputStyle } from '../components/FormField'
import { ToastContext } from '../App'

const empty = { deptID: '', deptname: '', location: '' }

function Departments() {
  const showToast = useContext(ToastContext)
  const [data,    setData]    = useState([])
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState('view')
  const [form,    setForm]    = useState(empty)
  const [errors,  setErrors]  = useState({})
  const [modal,   setModal]   = useState(false)
  const [editing, setEditing] = useState(null)

  const fetch = async () => {
    try {
      const res = await API.get('/departments/')
      setData(res.data)
    } catch { showToast('Failed to fetch departments', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [])

  const validate = (f) => {
    const e = {}
    if (!f.deptID.trim())   e.deptID   = 'Department ID is required'
    if (!f.deptname.trim()) e.deptname = 'Department name is required'
    if (!f.location.trim()) e.location = 'Location is required'
    return e
  }

  const handleAdd = async () => {
    const e = validate(form)
    if (Object.keys(e).length) { setErrors(e); return }
    try {
      await API.post('/departments/', form)
      showToast('Department added successfully! ✅')
      setForm(empty)
      setErrors({})
      fetch()
      setTab('view')
    } catch (err) {
      showToast(err.response?.data?.detail || 'Error adding department', 'error')
    }
  }

  const handleDelete = async (row) => {
    if (!confirm(`Delete department ${row.deptid}?`)) return
    try {
      await API.delete(`/departments/${row.deptid}`)
      showToast('Department deleted.', 'error')
      fetch()
    } catch (err) {
      showToast(err.response?.data?.detail || 'Error deleting department', 'error')
    }
  }

  const handleEdit = (row) => {
    setEditing({ deptID: row.deptid, deptname: row.deptname, location: row.location })
    setErrors({})
    setModal(true)
  }

  const handleSave = async () => {
    const e = validate(editing)
    if (Object.keys(e).length) { setErrors(e); return }
    try {
      await API.put(`/departments/${editing.deptID}`, editing)
      showToast('Department updated! ✅')
      setModal(false)
      fetch()
    } catch (err) {
      showToast(err.response?.data?.detail || 'Error updating department', 'error')
    }
  }

  const btnStyle = (active) => ({
    padding: '8px 20px', border: 'none',
    background: active ? 'var(--lavender)' : 'transparent',
    borderRadius: '10px', cursor: 'pointer',
    fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem',
    fontWeight: active ? 600 : 500,
    color: active ? 'var(--purple)' : 'var(--subtext)',
    transition: 'all 0.2s',
  })

  const columns = [
    { key: 'deptid',   label: 'Dept ID',  render: v => <code>{v}</code> },
    { key: 'deptname', label: 'Name',     render: v => <strong>{v}</strong> },
    { key: 'location', label: 'Location' },
  ]

  return (
    <div>
      <PageHeader title="Departments" subtitle="Manage power plant departments" />

      <div style={{
        display: 'flex', gap: '6px', marginBottom: '28px',
        background: 'var(--white)', padding: '6px',
        borderRadius: '14px', border: '1.5px solid var(--border)',
        width: 'fit-content',
      }}>
        <button style={btnStyle(tab==='view')} onClick={() => setTab('view')}>View All</button>
        <button style={btnStyle(tab==='add')}  onClick={() => setTab('add')}>Add Department</button>
      </div>

      {tab === 'view' && (
        loading ? <div style={{ color: 'var(--subtext)' }}>Loading...</div>
        : <DataTable
            columns={columns}
            data={data}
            actions={(row) => (<>
              <button onClick={() => handleEdit(row)} style={{
                padding: '7px 14px', border: 'none',
                background: 'var(--border)', borderRadius: '10px',
                cursor: 'pointer', fontSize: '0.8rem',
                fontFamily: 'DM Sans, sans-serif', fontWeight: 500,
                color: 'var(--subtext)',
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
          }}>➕ Add Department</div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '16px',
          }}>
            <FormField label="Department ID" error={errors.deptID}>
              <input
                style={inputStyle(!!errors.deptID)}
                value={form.deptID}
                placeholder="e.g. D005"
                onChange={e => setForm({...form, deptID: e.target.value})}
              />
            </FormField>
            <FormField label="Department Name" error={errors.deptname}>
              <input
                style={inputStyle(!!errors.deptname)}
                value={form.deptname}
                placeholder="e.g. Control Room"
                onChange={e => setForm({...form, deptname: e.target.value})}
              />
            </FormField>
            <FormField label="Location" error={errors.location}>
              <input
                style={inputStyle(!!errors.location)}
                value={form.location}
                placeholder="e.g. Block E"
                onChange={e => setForm({...form, location: e.target.value})}
              />
            </FormField>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button onClick={handleAdd} style={{
              padding: '11px 24px', border: 'none',
              background: 'linear-gradient(135deg, var(--purple), #7B5EA7)',
              color: 'white', borderRadius: '10px', cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', fontWeight: 600,
            }}>➕ Add Department</button>
            <button onClick={() => { setForm(empty); setErrors({}) }} style={{
              padding: '11px 24px', border: 'none',
              background: 'var(--border)', color: 'var(--subtext)',
              borderRadius: '10px', cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', fontWeight: 500,
            }}>✕ Clear</button>
          </div>
        </div>
      )}

      <Modal isOpen={modal} title={`Edit Department — ${editing?.deptID}`} onClose={() => setModal(false)}>
        <div style={{ display: 'grid', gap: '16px' }}>
          <FormField label="Department Name" error={errors.deptname}>
            <input
              style={inputStyle(!!errors.deptname)}
              value={editing?.deptname || ''}
              onChange={e => setEditing({...editing, deptname: e.target.value})}
            />
          </FormField>
          <FormField label="Location" error={errors.location}>
            <input
              style={inputStyle(!!errors.location)}
              value={editing?.location || ''}
              onChange={e => setEditing({...editing, location: e.target.value})}
            />
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

export default Departments