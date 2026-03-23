import { useEffect, useState, useContext } from 'react'
import API from '../api/axios'
import PageHeader from '../components/PageHeader'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import FormField, { inputStyle } from '../components/FormField'
import { ToastContext } from '../App'

const empty = { houseID: '', housetype: '', block: '' }

function Houses() {
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
      const res = await API.get('/houses/')
      setData(res.data)
    } catch { showToast('Failed to fetch houses', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const validate = (f) => {
    const e = {}
    if (!f.houseID.trim())   e.houseID   = 'House ID is required'
    if (!f.housetype.trim()) e.housetype = 'House type is required'
    if (!f.block.trim())     e.block     = 'Block is required'
    return e
  }

  const handleAdd = async () => {
    const e = validate(form)
    if (Object.keys(e).length) { setErrors(e); return }
    try {
      await API.post('/houses/', {
        ...form,
        houseID: form.houseID.toUpperCase(),
      })
      showToast('House added successfully! ✅')
      setForm(empty)
      setErrors({})
      fetchData()
      setTab('view')
    } catch (err) {
      showToast(err.response?.data?.detail || 'Error adding house', 'error')
    }
  }

  const handleDelete = async (row) => {
    if (!confirm(`Delete house ${row.houseid}?`)) return
    try {
      await API.delete(`/houses/${row.houseid}`)
      showToast('House deleted.', 'error')
      fetchData()
    } catch (err) {
      showToast(err.response?.data?.detail || 'Error deleting house', 'error')
    }
  }

  const handleEdit = (row) => {
    setEditing({
      houseID:   row.houseid,
      housetype: row.housetype,
      block:     row.block,
    })
    setErrors({})
    setModal(true)
  }

  const handleSave = async () => {
    const e = validate(editing)
    if (Object.keys(e).length) { setErrors(e); return }
    try {
      await API.put(`/houses/${editing.houseID}`, editing)
      showToast('House updated! ✅')
      setModal(false)
      fetchData()
    } catch (err) {
      showToast(err.response?.data?.detail || 'Error updating house', 'error')
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
    { key: 'houseid',   label: 'House ID',  render: v => <code>{v}</code> },
    { key: 'housetype', label: 'Type',      render: v => <strong>{v}</strong> },
    { key: 'block',     label: 'Block' },
    { key: 'occupant',  label: 'Occupied By', render: (v) => v
      ? <strong>{v}</strong>
      : <span style={{ color: 'var(--subtext)' }}>Vacant</span>
    },
  ]

  return (
    <div>
      <PageHeader title="Houses" subtitle="Housing allocated to full-time employees" />

      <div style={{
        display: 'flex', gap: '6px', marginBottom: '28px',
        background: 'var(--white)', padding: '6px',
        borderRadius: '14px', border: '1.5px solid var(--border)',
        width: 'fit-content',
      }}>
        <button style={btnStyle(tab==='view')} onClick={() => setTab('view')}>View All</button>
        <button style={btnStyle(tab==='add')}  onClick={() => setTab('add')}>Add House</button>
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
          }}>➕ Add House</div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '16px',
          }}>
            <FormField label="House ID" error={errors.houseID}>
              <input
                style={inputStyle(!!errors.houseID)}
                value={form.houseID}
                placeholder="e.g. H005"
                onChange={e => setForm({...form, houseID: e.target.value})}
              />
            </FormField>
            <FormField label="House Type" error={errors.housetype}>
              <input
                style={inputStyle(!!errors.housetype)}
                value={form.housetype}
                placeholder="e.g. Type A"
                onChange={e => setForm({...form, housetype: e.target.value})}
              />
            </FormField>
            <FormField label="Block" error={errors.block}>
              <input
                style={inputStyle(!!errors.block)}
                value={form.block}
                placeholder="e.g. Block Z"
                onChange={e => setForm({...form, block: e.target.value})}
              />
            </FormField>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button onClick={handleAdd} style={{
              padding: '11px 24px', border: 'none',
              background: 'linear-gradient(135deg, var(--purple), #7B5EA7)',
              color: 'white', borderRadius: '10px', cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', fontWeight: 600,
            }}>➕ Add House</button>
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
        title={`Edit House — ${editing?.houseID}`}
        onClose={() => setModal(false)}
      >
        <div style={{ display: 'grid', gap: '16px' }}>
          <FormField label="House Type" error={errors.housetype}>
            <input
              style={inputStyle(!!errors.housetype)}
              value={editing?.housetype || ''}
              onChange={e => setEditing({...editing, housetype: e.target.value})}
            />
          </FormField>
          <FormField label="Block" error={errors.block}>
            <input
              style={inputStyle(!!errors.block)}
              value={editing?.block || ''}
              onChange={e => setEditing({...editing, block: e.target.value})}
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

export default Houses