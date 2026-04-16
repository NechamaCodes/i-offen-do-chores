import useStore from '../store/useStore'

function getColor(percent) {
  if (percent < 50) return 'bg-green-500'
  if (percent < 75) return 'bg-yellow-500'
  return 'bg-red-500'
}

export default function LoadMeter({ memberId, showLabel = true }) {
  const getLoadPercent = useStore(s => s.getLoadPercent)
  const getMemberLoad = useStore(s => s.getMemberLoad)
  const members = useStore(s => s.members)
  const member = members.find(m => m.id === memberId)
  const percent = getLoadPercent(memberId)
  const loadMinutes = getMemberLoad(memberId)

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-xs mb-1" style={{ color: '#6b7280' }}>
          <span>Chore Load</span>
          <span>{loadMinutes}m / {member?.loadMax}m max ({percent}%)</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-3 rounded-full transition-all duration-500 ${getColor(percent)}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      {percent >= 80 && (
        <p className="text-xs text-red-600 mt-1 font-medium">Overloaded — assign fewer chores</p>
      )}
    </div>
  )
}
