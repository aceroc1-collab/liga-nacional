import { SPORTS, type SportKey } from '@/lib/config'
export default function SportBadge({ sport }: { sport: SportKey }) {
  const s = SPORTS[sport]
  return (
    <span className="badge text-white" style={{ backgroundColor: s.color }}>
      {s.icon} {s.label}
    </span>
  )
}
