import { MessageSquare, Globe } from 'lucide-react'

export default function Messages() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2 mb-2">
        <MessageSquare size={24} className="text-purple-600" />
        Message Board
      </h1>
      <p className="text-gray-500 text-sm mb-8">Discuss chores, coordinate schedules, and leave notes for the family.</p>

      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4">
          <Globe size={40} className="text-purple-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-700 mb-2">Coming Soon</h2>
        <p className="text-gray-500 text-sm max-w-sm">
          The family message board will be available once we add multi-user support
          and localization. Stay tuned!
        </p>
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          {['Discuss chore assignments', 'Leave notes for family', 'Coordinate schedules', 'Multi-language support'].map(f => (
            <span key={f} className="text-xs bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full border border-purple-200">
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
