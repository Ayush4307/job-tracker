import { Application } from '../types'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export function AnalyticsFunnel({ applications }: { applications: Application[] }) {
  if (applications.length === 0) return null

  const applied = applications.length
  const interviews = applications.filter(a => a.status === 'Interview' || a.status === 'Offer').length
  const offers = applications.filter(a => a.status === 'Offer').length

  const data = [
    { name: 'Applied', count: applied, color: '#3b82f6' },
    { name: 'Interview', count: interviews, color: '#f59e0b' },
    { name: 'Offer', count: offers, color: '#10b981' }
  ]

  return (
    <div className="bg-white/3 border border-white/8 rounded-xl p-6 mb-10">
      <h3 className="text-sm font-medium text-zinc-300 mb-6">Conversion Funnel</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 12 }} />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
              itemStyle={{ color: '#fff' }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={32}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
