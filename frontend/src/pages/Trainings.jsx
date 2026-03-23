import { useEffect, useState, useContext } from 'react'
import API from '../api/axios'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import FormField, { inputStyle } from '../components/FormField'
import { ToastContext } from '../App'

const empty = { trainingID: '', duration: '', simulatorused: '' }

function Trainings() {
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
      const res = await API.get('/trainings/')
      setData(res.data)
    } catch { showToast('Failed to fetch trainings', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const validate = (f) => {
    const e = {}
    if (!f.trainingID.trim())    e.trainingID    = 'Training ID is required'
    if (!f.duration || Number(f.duration) <= 0)
      e.duration = 'Duration must be positive'
    if (!f.simulatorused.trim()) e.simulatorused = 'Simulator name is required'
    return e
  }

  const handleAdd = async () => {
    const e = validate(form)
    if (Object.keys(e).length) { setErrors(e); return }
    try {
      await API.post('/trainings/', {
        ...form,
        trainingID: form.trainingID.toUpperCase(),
        duration: Number(form.duration),
      })
      showToast('Training program added! ✅')
      setForm(empty)
      setErrors({})
      fetchData()
      setTab('view')
    } catch (err) {
      showToast(err.response?.data?.detail || 'Error adding training', 'error')
    }
  }

  const handleDelete = async (row) => {
    if (!confirm(`Delete training ${row.trainingid}?`)) return
    try {
      await API.delete(`/trainings/${row.trainingid}`)
      showToast('Training deleted.', 'error')
      fetchData()
    } catch (err) {
      showToast(err.response?.data?.detail || 'Error deleting training', 'error')
    }
  }

  const handleEdit = (row) => {
    setEditing({
      trainingID:    row.trainingid,
      duration:      row.duration,
      simulatorused: row.simulatorused,
    })
    setErrors({})
    setModal(true)
  }

  const handleSave = async () => {
    const e = validate(editing)
    if (Object.keys(e).length) { setErrors(e); return }
    try {
      await API.put(`/trainings/${editing.trainingID}`, {
        ...editing,
        duration: Number(editing.duration),
      })
      showToast('Training updated! ✅')
      setModal(false)
      fetchData()
    } catch (err) {
      showToast(err.response?.data?.detail || 'Error updating training', 'error')
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
    { key: 'trainingid',    label: 'Training ID',    render: v => <code>{v}</code> },
    { key: 'duration',      label: 'Duration',       render: v => (
      <span style={{
        background: 'var(--sky)', color: '#4070A0',
        padding: '3px 10px', borderRadius: '20px',
        fontSize: '0.75rem', fontWeight: 600,
      }}>{v} days</span>
    )},
    { key: 'simulatorused', label: 'Simulator Used', render: v => <strong>{v}</strong> },
  ]

  return (
    <div>
      <PageHeader title="Training Programs" subtitle="All training programs at the plant" />

      <div style={{
        display: 'flex', gap: '6px', marginBottom: '28px',
        background: 'var(--white)', padding: '6px',
        borderRadius: '14px', border: '1.5px solid var(--border)',
        width: 'fit-content',
      }}>
        <button style={btnStyle(tab==='view')} onClick={() => setTab('view')}>View All</button>
        <button style={btnStyle(tab==='add')}  onClick={() => setTab('add')}>Add Training</button>
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
          }}>➕ Add Training Program</div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '16px',
          }}>
            <FormField label="Training ID" error={errors.trainingID}>
              <input
                style={inputStyle(!!errors.trainingID)}
                value={form.trainingID}
                placeholder="e.g. T004"
                onChange={e => setForm({...form, trainingID: e.target.value})}
              />
            </FormField>
            <FormField label="Duration (days)" error={errors.duration}>
              <input
                type="number"
                style={inputStyle(!!errors.duration)}
                value={form.duration}
                placeholder="e.g. 30"
                onChange={e => setForm({...form, duration: e.target.value})}
              />
            </FormField>
            <FormField label="Simulator Used" error={errors.simulatorused}>
              <input
                style={inputStyle(!!errors.simulatorused)}
                value={form.simulatorused}
                placeholder="e.g. Reactor Control Sim"
                onChange={e => setForm({...form, simulatorused: e.target.value})}
              />
            </FormField>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button onClick={handleAdd} style={{
              padding: '11px 24px', border: 'none',
              background: 'linear-gradient(135deg, var(--purple), #7B5EA7)',
              color: 'white', borderRadius: '10px', cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', fontWeight: 600,
            }}>➕ Add Training</button>
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
        title={`Edit Training — ${editing?.trainingID}`}
        onClose={() => setModal(false)}
      >
        <div style={{ display: 'grid', gap: '16px' }}>
          <FormField label="Duration (days)" error={errors.duration}>
            <input
              type="number"
              style={inputStyle(!!errors.duration)}
              value={editing?.duration || ''}
              onChange={e => setEditing({...editing, duration: e.target.value})}
            />
          </FormField>
          <FormField label="Simulator Used" error={errors.simulatorused}>
            <input
              style={inputStyle(!!errors.simulatorused)}
              value={editing?.simulatorused || ''}
              onChange={e => setEditing({...editing, simulatorused: e.target.value})}
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

export default Trainings