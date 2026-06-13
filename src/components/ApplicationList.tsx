import { Application, STATUS_COLORS } from '../types'
import { Clock } from 'lucide-react'

type ApplicationListProps = {
  loading: boolean
  filteredApplications: Application[]
  handleEdit: (app: Application) => void
  handleDelete: (id: string) => void
}

export function ApplicationList({ loading, filteredApplications, handleEdit, handleDelete }: ApplicationListProps) {
  
  // Logic to determine if an application needs follow-up
  const needsFollowUp = (app: Application) => {
    if (app.status !== 'Applied') return false
    const appliedDate = new Date(app.date_applied).getTime()
    const now = new Date().getTime()
    const daysSince = (now - appliedDate) / (1000 * 3600 * 24)
    return daysSince > 7
  }

  if (loading) {
    return <p className="text-zinc-600 text-sm">Loading applications...</p>
  }

  if (filteredApplications.length === 0) {
    return (
      <div className="text-center py-20 border border-white/5 rounded-xl border-dashed">
        <p className="text-zinc-500 text-sm">No applications found.</p>
        <p className="text-zinc-600 text-xs mt-1">Try adjusting your search or filter.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {filteredApplications.map(app => {
        const s = STATUS_COLORS[app.status] ?? STATUS_COLORS['Applied']
        const flagFollowUp = needsFollowUp(app)

        return (
          <div
            key={app.id}
            className="bg-white/3 border border-white/8 rounded-xl px-5 py-4 flex justify-between items-center hover:bg-white/5 transition-colors group relative overflow-hidden"
          >
            {flagFollowUp && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" title="Needs Follow Up" />
            )}
            <div className="flex items-center gap-4 pl-2">
              <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-sm font-semibold text-zinc-400">
                {app.company.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{app.company}</p>
                  {app.resume_version && app.resume_version !== 'Default' && (
                    <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-zinc-400">
                      {app.resume_version}
                    </span>
                  )}
                </div>
                <p className="text-zinc-500 text-xs mt-0.5">{app.role} · {app.date_applied}</p>
                {app.notes && <p className="text-zinc-600 text-xs mt-1 max-w-md truncate">{app.notes}</p>}
                {flagFollowUp && (
                   <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                     <Clock size={12} /> Action Needed: Follow up with recruiter
                   </p>
                )}
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
  )
}
