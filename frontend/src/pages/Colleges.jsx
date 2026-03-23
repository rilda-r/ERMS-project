import { useEffect, useState, useContext } from 'react'
import API from '../api/axios'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import FormField, { inputStyle } from '../components/FormField'
import { ToastContext } from '../App'

const empty = { collegeID: '', collegename: '', branch: '' }

function Colleges() {
  const showToast = useContext(ToastContext)
  const [data,    setData]    = useState([])
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState('view')
  const [form,    setForm]    = useState(empty)
  const [errors,  setErrors]  = useState({})
  const [modal,   setModal]   = useState(false)
  const [editing, setEditing] = useState(null)

  const fetchData = async () => {
    try {
      const res = await API.get('/colleges/')
      setData(res.data)
    } catch { showToast('Failed to fetch colleges', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const validate = (f) => {
    const e = {}
    if (!f.collegeID.trim())    e.collegeID    = 'College ID is required'
    if (!f.collegename.trim())  e.collegename  = 'College name is required'
    if (!f.branch.trim())       e.branch       = 'Branch is required'
    return e
  }

  const handleAdd = async () => {
    const e = validate(form)
    if (Object.keys(e).length) { setErrors(e); return }
    try {
      await API.post('/colleges/', {
        ...form,
        collegeID: form.collegeID.toUpperCase(),
      })
      showToast('College added! ✅')
      setForm(empty)
      setErrors({})
      fetchData()
      setTab('view')
    } catch (err) {
      showToast(err.response?.data?.detail || 'Error adding college', 'error')
    }
  }

  const handleDelete = async (row) => {
    if (!confirm(`Delete college ${row.collegeid}?`)) return
    try {
      await API.delete(`/colleges/${row.collegeid}`)
      showToast('College deleted.', 'error')
      fetchData()
    } catch (err) {
      showToast(err.response?.data?.detail || 'Error deleting college', 'error')
    }
  }

  const handleEdit = (row) => {
    setEditing({
      collegeID:   row.collegeid,
      collegename: row.collegename,
      branch:      row.branch,
    })
    setErrors({})
    setModal(true)
  }

  const handleSave = async () => {
    const e = validate(editing)
    if (Object.keys(e).length) { setErrors(e); return }
    try {
      await API.put(`/colleges/${editing.collegeID}`, editing)
      showToast('College updated! ✅')
      setModal(false)
      fetchData()
    } catch (err) {
      showToast(err.response?.data?.detail || 'Error updating college', 'error')
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
    { key: 'collegeid',   label: 'College ID',   render: v => <code>{v}</code> },
    { key: 'collegename', label: 'Name',          render: v => <strong>{v}</strong> },
    { key: 'branch',      label: 'Branch',        render: v => (
      <span style={{
        background: 'var(--sky)', color: '#4070A0',
        padding: '3px 10px', borderRadius: '20px',
        fontSize: '0.75rem', fontWeight: 600,
      }}>{v}</span>
    )},
  ]

  return (
    <div>
      <PageHeader title="Colleges" subtitle="Colleges affiliated with intern placements" />

      <div style={{
        display: 'flex', gap: '6px', marginBottom: '28px',
        background: 'var(--white)', padding: '6px',
        borderRadius: '14px', border: '1.5px solid var(--border)',
        width: 'fit-content',
      }}>
        <button style={btnStyle(tab==='view')} onClick={() => setTab('view')}>View All</button>
        <button style={btnStyle(tab==='add')}  onClick={() => setTab('add')}>Add College</button>
      </div>

      {tab === 'view' && (
        loading
          ? <div style={{ color: 'var(--subtext)' }}>Loading...</div>
          : <DataTable
              columns={columns}
              data={data}
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
          }}>➕ Add College</div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '16px',
          }}>
            <FormField label="College ID" error={errors.collegeID}>
              <input
                style={inputStyle(!!errors.collegeID)}
                value={form.collegeID}
                placeholder="e.g. C004"
                onChange={e => setForm({...form, collegeID: e.target.value})}
              />
            </FormField>
            <FormField label="College Name" error={errors.collegename}>
              <input
                style={inputStyle(!!errors.collegename)}
                value={form.collegename}
                placeholder="e.g. MIT Chennai"
                onChange={e => setForm({...form, collegename: e.target.value})}
              />
            </FormField>
            <FormField label="Branch" error={errors.branch}>
              <input
                style={inputStyle(!!errors.branch)}
                value={form.branch}
                placeholder="e.g. Civil Engineering"
                onChange={e => setForm({...form, branch: e.target.value})}
              />
            </FormField>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button onClick={handleAdd} style={{
              padding: '11px 24px', border: 'none',
              background: 'linear-gradient(135deg, var(--purple), #7B5EA7)',
              color: 'white', borderRadius: '10px', cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', fontWeight: 600,
            }}>➕ Add College</button>
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
        title={`Edit College — ${editing?.collegeID}`}
        onClose={() => setModal(false)}
      >
        <div style={{ display: 'grid', gap: '16px' }}>
          <FormField label="College Name" error={errors.collegename}>
            <input
              style={inputStyle(!!errors.collegename)}
              value={editing?.collegename || ''}
              onChange={e => setEditing({...editing, collegename: e.target.value})}
            />
          </FormField>
          <FormField label="Branch" error={errors.branch}>
            <input
              style={inputStyle(!!errors.branch)}
              value={editing?.branch || ''}
              onChange={e => setEditing({...editing, branch: e.target.value})}
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

export default Colleges