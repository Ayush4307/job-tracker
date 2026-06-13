import type { Application } from '../types'

export function AnalyticsCards({ applications }: { applications: Application[] }) {
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
    <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-10">
      {stats.map(s => (
        <div key={s.label} className="bg-white/3 border border-white/8 rounded-xl p-4 hover:bg-white/5 hover:-translate-y-1 hover:shadow-lg transition-all cursor-default group">
          <p className={`text-2xl font-semibold ${s.color}`}>{s.count}</p>
          <p className="text-zinc-500 text-xs mt-1 group-hover:text-zinc-400 transition-colors">{s.label}</p>
        </div>
      ))}
    </div>
  )
}
