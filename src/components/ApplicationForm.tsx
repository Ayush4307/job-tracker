import { Dispatch, SetStateAction } from 'react'

type ApplicationFormProps = {
  editingId: string | null
  company: string; setCompany: Dispatch<SetStateAction<string>>
  role: string; setRole: Dispatch<SetStateAction<string>>
  status: string; setStatus: Dispatch<SetStateAction<string>>
  dateApplied: string; setDateApplied: Dispatch<SetStateAction<string>>
  notes: string; setNotes: Dispatch<SetStateAction<string>>
  resumeVersion: string; setResumeVersion: Dispatch<SetStateAction<string>>
  handleSave: () => void
  resetForm: () => void
}

export function ApplicationForm(props: ApplicationFormProps) {
  const { editingId, company, setCompany, role, setRole, status, setStatus, dateApplied, setDateApplied, notes, setNotes, resumeVersion, setResumeVersion, handleSave, resetForm } = props

  return (
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
        <select
          className="bg-white/5 border border-white/8 p-3 rounded-lg outline-none text-sm text-zinc-300 focus:border-white/20 transition-colors md:col-span-2"
          value={resumeVersion}
          onChange={e => setResumeVersion(e.target.value)}
        >
          <option value="Default">Default Resume</option>
          <option value="Frontend">Frontend Focused</option>
          <option value="Backend">Backend Focused</option>
          <option value="Fullstack">Fullstack Focused</option>
        </select>
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
  )
}
