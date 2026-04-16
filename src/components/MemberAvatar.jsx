import useStore from '../store/useStore'

export default function MemberAvatar({ memberId, size = 36, className = '', style = {} }) {
  const members = useStore(s => s.members)
  const member = members.find(m => m.id === memberId)
  if (!member) return null

  const fontSize = size < 28 ? 10 : size < 36 ? 12 : size < 48 ? 14 : size < 72 ? 20 : 28

  if (member.avatar) {
    return (
      <img
        src={member.avatar}
        alt={member.name}
        title={member.name}
        className={`rounded-full object-cover shrink-0 ${className}`}
        style={{ width: size, height: size, ...style }}
      />
    )
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-bold shrink-0 ${className}`}
      style={{ width: size, height: size, backgroundColor: member.color, fontSize, ...style }}
      title={member.name}
    >
      {member.name[0].toUpperCase()}
    </div>
  )
}
