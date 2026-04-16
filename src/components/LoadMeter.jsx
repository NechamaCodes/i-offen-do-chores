import useStore from '../store/useStore'

function getBarColor(percent) {
  if (percent < 50) return '#22c55e'
  if (percent < 80) return '#f59e0b'
  return '#ef4444'
}

export default function LoadMeter({ memberId, showLabel = true }) {
  const getLoadPercent = useStore(s => s.getLoadPercent)
  const getMemberLoad = useStore(s => s.getMemberLoad)
  const members = useStore(s => s.members)
  const member = members.find(m => m.id === memberId)
  const percent = getLoadPercent(memberId)
  const loadMinutes = getMemberLoad(memberId)
  const color = getBarColor(percent)

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-xs mb-1.5 font-medium" style={{ color: '#71717a' }}>
          <span>Workload</span>
          <span style={{ color: percent >= 80 ? '#ef4444' : '#71717a' }}>{percent}%</span>
        </div>
      )}
      <div className="w-full rounded-full h-2" style={{ backgroundColor: '#e4e4e7' }}>
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>
      {percent >= 80 && (
        <p className="text-xs font-semibold mt-1" style={{ color: '#ef4444' }}>Overloaded — too many chores!</p>
      )}
    </div>
  )
}
