import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Application } from '../types'
import { AnalyticsCards } from '../components/AnalyticsCards'
import { AnalyticsFunnel } from '../components/AnalyticsFunnel'
import { ApplicationForm } from '../components/ApplicationForm'
import { ApplicationList } from '../components/ApplicationList'

export default function Dashboard() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null)
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('Applied')
  const [dateApplied, setDateApplied] = useState('')
  const [notes, setNotes] = useState('')
  const [resumeVersion, setResumeVersion] = useState('Default')
  
  // Filter & Search State
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('date-desc')

  const fetchApplications = async () => {
    const { data } = await supabase.from('applications').select('*').order('created_at', { ascending: false })
    if (data) setApplications(data)
    setLoading(false)
  }

  useEffect(() => {
    // eslint-disable-next-line
    fetchApplications()
  }, [])

  const resetForm = () => {
    setCompany(''); setRole(''); setStatus('Applied'); setDateApplied(''); setNotes(''); setResumeVersion('Default')
    setEditingId(null); setShowForm(false)
  }

  const handleSave = async () => {
    if (!company || !role || !dateApplied) return
    const { data: { user } } = await supabase.auth.getUser()
    if (editingId) {
      await supabase.from('applications').update({ company, role, status, date_applied: dateApplied, notes, resume_version: resumeVersion }).eq('id', editingId)
    } else {
      await supabase.from('applications').insert({ user_id: user?.id, company, role, status, date_applied: dateApplied, notes, resume_version: resumeVersion })
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
    setResumeVersion(app.resume_version || 'Default')
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

        <AnalyticsCards applications={applications} />
        <AnalyticsFunnel applications={applications} />

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

        {showForm && (
          <ApplicationForm
            editingId={editingId}
            company={company} setCompany={setCompany}
            role={role} setRole={setRole}
            status={status} setStatus={setStatus}
            dateApplied={dateApplied} setDateApplied={setDateApplied}
            notes={notes} setNotes={setNotes}
            resumeVersion={resumeVersion} setResumeVersion={setResumeVersion}
            handleSave={handleSave}
            resetForm={resetForm}
          />
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
          <div className="flex flex-wrap gap-1.5 items-center overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {['All', 'Applied', 'Interview', 'Offer', 'Rejected'].map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-2 whitespace-nowrap rounded-lg text-xs font-medium transition-colors ${
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

        <ApplicationList
          loading={loading}
          filteredApplications={filtered}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
        />
      </div>
    </div>
  )
}