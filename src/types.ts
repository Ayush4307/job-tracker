export type Application = {
  id: string
  company: string
  role: string
  status: string
  date_applied: string
  notes: string
  resume_version?: string
}

export const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  Applied:   { bg: 'bg-blue-500/10',   text: 'text-blue-400',   dot: 'bg-blue-400' },
  Interview: { bg: 'bg-amber-500/10',  text: 'text-amber-400',  dot: 'bg-amber-400' },
  Offer:     { bg: 'bg-emerald-500/10',text: 'text-emerald-400',dot: 'bg-emerald-400' },
  Rejected:  { bg: 'bg-red-500/10',    text: 'text-red-400',    dot: 'bg-red-400' },
}
