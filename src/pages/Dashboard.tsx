import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Application = {
  id: string
  company: string
  role: string
  status: string
  date_applied: string
  notes: string
}

export default function Dashboard() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('Applied')
  const [dateApplied, setDateApplied] = useState('')
  const [notes, setNotes] = useState('')
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')

  const fetchApplications = async () => {
    const { data } = await supabase.from('applications').select('*').order('created_at', { ascending: false })
    if (data) setApplications(data)
    setLoading(false)
  }

  useEffect(() => { fetchApplications() }, [])

  const resetForm = () => {
    setCompany(''); setRole(''); setStatus('Applied'); setDateApplied(''); setNotes('')
    setEditingId(null); setShowForm(false)
  }

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (editingId) {
      await supabase.from('applications').update({ company, role, status, date_applied: dateApplied, notes }).eq('id', editingId)
    } else {
      await supabase.from('applications').insert({ user_id: user?.id, company, role, status, date_applied: dateApplied, notes })
    }
    resetForm()
    fetchApplications()
  }

  const handleEdit = (app: Application) => {
    setEditingId(app.id)
    setCompany(app.company)
    setRole(app.role)
    setStatus(app.status)
    setDateApplied(app.date_applied)
    setNotes(app.notes || '')
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string) => {
    await supabase.from('applications').delete().eq('id', id)
    fetchApplications()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const statusColor: Record<string, string> = {
    Applied: 'bg-blue-500',
    Interview: 'bg-yellow-500',
    Offer: 'bg-green-500',
    Rejected: 'bg-red-500',
  }

  const filtered = applications
    .filter(a => filter === 'All' || a.status === filter)
    .filter(a => a.company.toLowerCase().includes(search.toLowerCase()) || a.role.toLowerCase().includes(search.toLowerCase()))

  const total = applications.length
  const interviews = applications.filter(a => a.status === 'Interview').length
  const offers = applications.filter(a => a.status === 'Offer').length
  const rejected = applications.filter(a => a.status === 'Rejected').length

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Job Tracker</h1>
          <button onClick={handleLogout} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm">Logout</button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[['Total', total, 'bg-indigo-600'], ['Interviews', interviews, 'bg-yellow-600'], ['Offers', offers, 'bg-green-600'], ['Rejected', rejected, 'bg-red-600']].map(([label, count, color]) => (
            <div key={label} className={`${color} rounded-xl p-4 text-center`}>
              <p className="text-3xl font-bold">{count}</p>
              <p className="text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Add Button */}
        <button onClick={() => { resetForm(); setShowForm(!showForm) }} className="bg-indigo-600 hover:bg-indigo-700 px-6 py-2 rounded-lg mb-6 font-semibold">
          {showForm && !editingId ? 'Cancel' : '+ Add Application'}
        </button>

        {/* Form */}
        {showForm && (
          <div className="bg-gray-900 p-6 rounded-xl mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="bg-gray-800 p-3 rounded-lg outline-none" placeholder="Company" value={company} onChange={e => setCompany(e.target.value)} />
            <input className="bg-gray-800 p-3 rounded-lg outline-none" placeholder="Role" value={role} onChange={e => setRole(e.target.value)} />
            <select className="bg-gray-800 p-3 rounded-lg outline-none" value={status} onChange={e => setStatus(e.target.value)}>
              <option>Applied</option>
              <option>Interview</option>
              <option>Offer</option>
              <option>Rejected</option>
            </select>
            <input className="bg-gray-800 p-3 rounded-lg outline-none" type="date" value={dateApplied} onChange={e => setDateApplied(e.target.value)} />
            <textarea className="bg-gray-800 p-3 rounded-lg outline-none md:col-span-2" placeholder="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} />
            <div className="md:col-span-2 flex gap-3">
              <button onClick={handleSave} className="flex-1 bg-indigo-600 hover:bg-indigo-700 py-3 rounded-lg font-semibold">
                {editingId ? 'Update' : 'Save'}
              </button>
              <button onClick={resetForm} className="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg">Cancel</button>
            </div>
          </div>
        )}

        {/* Search + Filter */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <input
            className="bg-gray-800 p-3 rounded-lg outline-none flex-1"
            placeholder="Search by company or role..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="flex gap-2">
            {['All', 'Applied', 'Interview', 'Offer', 'Rejected'].map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${filter === s ? 'bg-indigo-600' : 'bg-gray-800 hover:bg-gray-700'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Applications List */}
        {loading ? <p className="text-gray-400">Loading...</p> : filtered.length === 0 ? (
          <p className="text-gray-400 text-center mt-10">No applications found.</p>
        ) : (
          <div className="space-y-4">
            {filtered.map(app => (
              <div key={app.id} className="bg-gray-900 p-5 rounded-xl flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold">{app.company}</h2>
                  <p className="text-gray-400 text-sm">{app.role}</p>
                  <p className="text-gray-500 text-xs mt-1">{app.date_applied}</p>
                  {app.notes && <p className="text-gray-400 text-sm mt-2">{app.notes}</p>}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`${statusColor[app.status]} text-xs px-3 py-1 rounded-full`}>{app.status}</span>
                  <button onClick={() => handleEdit(app)} className="text-indigo-400 text-xs hover:text-indigo-300">Edit</button>
                  <button onClick={() => handleDelete(app.id)} className="text-red-400 text-xs hover:text-red-300">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}