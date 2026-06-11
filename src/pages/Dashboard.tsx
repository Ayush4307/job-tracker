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

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  Applied:   { bg: 'bg-blue-500/10',   text: 'text-blue-400',   dot: 'bg-blue-400' },
  Interview: { bg: 'bg-amber-500/10',  text: 'text-amber-400',  dot: 'bg-amber-400' },
  Offer:     { bg: 'bg-emerald-500/10',text: 'text-emerald-400',dot: 'bg-emerald-400' },
  Rejected:  { bg: 'bg-red-500/10',    text: 'text-red-400',    dot: 'bg-red-400' },
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
  const [sortBy, setSortBy] = useState('date-desc')

  const fetchApplications = async () => {
    const { data } = await supabase.from('applications').select('*').order('created_at', { ascending: false })
    if (data) setApplications(data)
    setLoading(false)
  }

  useEffect(() => {
  const load = async () => {
    const { data } = await supabase.from('applications').select('*').order('created_at', { ascending: false })
    if (data) setApplications(data)
    setLoading(false)
  }
  load()
}, [])

  const resetForm = () => {
    setCompany(''); setRole(''); setStatus('Applied'); setDateApplied(''); setNotes('')
    setEditingId(null); setShowForm(false)
  }

  const handleSave = async () => {
    if (!company || !role || !dateApplied) return
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
    if (!window.confirm('Delete this application?')) return
    await supabase.from('applications').delete().eq('id', id)
    fetchApplications()
  }

  const handleLogout = async () => await supabase.auth.signOut()

  const handleExportCSV = () => {
    if (applications.length === 0) return
    const headers = ['Company', 'Role', 'Status', 'Date Applied', 'Notes']
    const csvContent = [
      headers.join(','),
      ...applications.map(a => 
        [a.company, a.role, a.status, a.date_applied, `"${(a.notes || '').replace(/"/g, '""')}"`].join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'job_applications.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filtered = applications
    .filter(a => filter === 'All' || a.status === filter)
    .filter(a =>
      a.company.toLowerCase().includes(search.toLowerCase()) ||
      a.role.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date_applied).getTime() - new Date(a.date_applied).getTime()
      if (sortBy === 'date-asc') return new Date(a.date_applied).getTime() - new Date(b.date_applied).getTime()
      if (sortBy === 'company-asc') return a.company.localeCompare(b.company)
      if (sortBy === 'company-desc') return b.company.localeCompare(a.company)
      return 0
    })

  const total = applications.length
  const offers = applications.filter(a => a.status === 'Offer').length
  const interviews = applications.filter(a => a.status === 'Interview').length
  
  const successRate = total > 0 ? Math.round((offers / total) * 100) + '%' : '0%'
  const interviewRate = total > 0 ? Math.round((interviews / total) * 100) + '%' : '0%'

  const stats = [
    { label: 'Total', count: total, color: 'text-white' },
    { label: 'Applied', count: applications.filter(a => a.status === 'Applied').length, color: 'text-blue-400' },
    { label: 'Interview', count: interviews, color: 'text-amber-400' },
    { label: 'Offers', count: offers, color: 'text-emerald-400' },
    { label: 'Success Rate', count: successRate, color: 'text-emerald-400' },
    { label: 'Interview Rate', count: interviewRate, color: 'text-amber-400' },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Top Nav */}
      <nav className="border-b border-white/8 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-white rounded-md flex items-center justify-center">
            <span className="text-black text-xs font-bold">JT</span>
          </div>
          <span className="font-semibold text-sm">Job Tracker</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-zinc-400 hover:text-white transition-colors px-3 py-1.5 rounded-md hover:bg-white/5"
        >
          Sign out
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl font-semibold tracking-tight">Applications</h1>
          <p className="text-zinc-500 text-sm mt-1">Track every job you apply to</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-10">
          {stats.map(s => (
            <div key={s.label} className="bg-white/3 border border-white/8 rounded-xl p-4 hover:bg-white/5 hover:-translate-y-1 hover:shadow-lg transition-all cursor-default group">
              <p className={`text-2xl font-semibold ${s.color}`}>{s.count}</p>
              <p className="text-zinc-500 text-xs mt-1 group-hover:text-zinc-400 transition-colors">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Add Button & Export Button */}
        {!showForm && (
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-zinc-200 transition-colors"
            >
              <span className="text-lg leading-none">+</span> Add Application
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 bg-white/10 text-white border border-white/10 text-sm font-medium px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              Export CSV
            </button>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-white/3 border border-white/8 rounded-xl p-6 mb-6">
            <h2 className="text-sm font-medium mb-4 text-zinc-300">{editingId ? 'Edit Application' : 'New Application'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                className="bg-white/5 border border-white/8 p-3 rounded-lg outline-none text-sm placeholder:text-zinc-600 focus:border-white/20 transition-colors"
                placeholder="Company"
                value={company}
                onChange={e => setCompany(e.target.value)}
              />
              <input
                className="bg-white/5 border border-white/8 p-3 rounded-lg outline-none text-sm placeholder:text-zinc-600 focus:border-white/20 transition-colors"
                placeholder="Role"
                value={role}
                onChange={e => setRole(e.target.value)}
              />
              <select
                className="bg-white/5 border border-white/8 p-3 rounded-lg outline-none text-sm text-zinc-300 focus:border-white/20 transition-colors"
                value={status}
                onChange={e => setStatus(e.target.value)}
              >
                <option value="Applied">Applied</option>
                <option value="Interview">Interview</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
              </select>
              <input
                className="bg-white/5 border border-white/8 p-3 rounded-lg outline-none text-sm text-zinc-300 focus:border-white/20 transition-colors"
                type="date"
                value={dateApplied}
                onChange={e => setDateApplied(e.target.value)}
              />
              <textarea
                className="bg-white/5 border border-white/8 p-3 rounded-lg outline-none text-sm placeholder:text-zinc-600 focus:border-white/20 transition-colors md:col-span-2 resize-none"
                placeholder="Notes (optional)"
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
              <div className="md:col-span-2 flex gap-2">
                <button
                  onClick={handleSave}
                  className="bg-white text-black text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-zinc-200 transition-colors"
                >
                  {editingId ? 'Update' : 'Save'}
                </button>
                <button
                  onClick={resetForm}
                  className="text-zinc-400 hover:text-white text-sm px-5 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search + Filter */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <input
            className="bg-white/3 border border-white/8 p-3 rounded-lg outline-none text-sm placeholder:text-zinc-600 flex-1 focus:border-white/20 transition-colors"
            placeholder="Search company or role..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="bg-white/3 border border-white/8 p-3 rounded-lg outline-none text-sm text-zinc-300 focus:border-white/20 transition-colors"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="company-asc">Company (A-Z)</option>
            <option value="company-desc">Company (Z-A)</option>
          </select>
          <div className="flex flex-wrap gap-1.5 items-center">
            {['All', 'Applied', 'Interview', 'Offer', 'Rejected'].map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  filter === s
                    ? 'bg-white text-black'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {s}
              </button>
            ))}
            {(search !== '' || filter !== 'All' || sortBy !== 'date-desc') && (
              <button
                onClick={() => { setSearch(''); setFilter('All'); setSortBy('date-desc'); }}
                className="ml-2 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Applications List */}
        {loading ? (
          <p className="text-zinc-600 text-sm">Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-600 text-sm">No applications found.</p>
            <p className="text-zinc-700 text-xs mt-1">Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(app => {
              const s = STATUS_COLORS[app.status] ?? STATUS_COLORS['Applied']
              return (
                <div
                  key={app.id}
                  className="bg-white/3 border border-white/8 rounded-xl px-5 py-4 flex justify-between items-center hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-xs font-semibold text-zinc-400">
                      {app.company.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{app.company}</p>
                      <p className="text-zinc-500 text-xs mt-0.5">{app.role} · {app.date_applied}</p>
                      {app.notes && <p className="text-zinc-600 text-xs mt-1">{app.notes}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}></span>
                      {app.status}
                    </span>
                    <button
                      onClick={() => handleEdit(app)}
                      className="text-zinc-600 hover:text-zinc-300 text-xs opacity-0 group-hover:opacity-100 transition-all"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(app.id)}
                      className="text-zinc-600 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}