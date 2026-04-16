import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { addMinutes, isPast, formatDistanceToNow } from 'date-fns'

const CHORE_PREFERENCES = [
  'Cooking', 'Dishes', 'Vacuuming', 'Laundry', 'Trash', 'Groceries',
  'Mopping', 'Dusting', 'Bathrooms', 'Yard Work', 'Car Wash', 'Windows',
  'Pet Care', 'Kids Homework Help', 'Organizing', 'Recycling',
]

const COLORS = ['#7c3aed', '#db2777', '#0891b2', '#16a34a', '#ea580c', '#9333ea']

const SAMPLE_MEMBERS = [
  { id: 'm1', name: 'Mom', color: '#7c3aed', preferences: ['Cooking', 'Groceries', 'Organizing'], loadMax: 300 },
  { id: 'm2', name: 'Dad', color: '#0891b2', preferences: ['Yard Work', 'Trash', 'Car Wash'], loadMax: 300 },
  { id: 'm3', name: 'Sam', color: '#16a34a', preferences: ['Dishes', 'Vacuuming', 'Pet Care'], loadMax: 200 },
  { id: 'm4', name: 'Leah', color: '#db2777', preferences: ['Laundry', 'Dusting'], loadMax: 180 },
]

const now = new Date()
const SAMPLE_CHORES = [
  {
    id: 'c1', title: 'Take out trash', description: 'All trash cans in the house', category: 'Trash',
    assignedTo: 'm2', createdBy: 'm1', status: 'assigned',
    estimatedMinutes: 15, actualMinutes: null,
    deadline: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(), completedAt: null,
  },
  {
    id: 'c2', title: 'Vacuum living room', description: '', category: 'Vacuuming',
    assignedTo: 'm3', createdBy: 'm1', status: 'pending_acceptance',
    estimatedMinutes: 30, actualMinutes: null,
    deadline: new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(now.getTime() - 10 * 60 * 1000).toISOString(), completedAt: null,
  },
  {
    id: 'c3', title: 'Do the dishes', description: 'Wash, dry, and put away', category: 'Dishes',
    assignedTo: 'm3', createdBy: 'm2', status: 'completed',
    estimatedMinutes: 20, actualMinutes: 25,
    deadline: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(now.getTime() - 90 * 60 * 1000).toISOString(),
  },
  {
    id: 'c4', title: 'Grocery run', description: 'Weekly groceries per the list', category: 'Groceries',
    assignedTo: 'm1', createdBy: 'm2', status: 'assigned',
    estimatedMinutes: 60, actualMinutes: null,
    deadline: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(now.getTime() - 60 * 60 * 1000).toISOString(), completedAt: null,
  },
]

function calcLoad(memberId, chores) {
  return chores
    .filter(c => c.assignedTo === memberId && ['pending_acceptance', 'assigned'].includes(c.status))
    .reduce((sum, c) => sum + c.estimatedMinutes, 0)
}

const useStore = create(
  persist(
    (set, get) => ({
      members: SAMPLE_MEMBERS,
      chores: SAMPLE_CHORES,
      activeMemberId: 'm1',
      chorePreferences: CHORE_PREFERENCES,

      setActiveMember: (id) => set({ activeMemberId: id }),

      getMemberLoad: (memberId) => {
        const { chores } = get()
        return calcLoad(memberId, chores)
      },

      getLoadPercent: (memberId) => {
        const { members, chores } = get()
        const member = members.find(m => m.id === memberId)
        if (!member) return 0
        const load = calcLoad(memberId, chores)
        return Math.min(100, Math.round((load / member.loadMax) * 100))
      },

      addMember: (name) => {
        const { members } = get()
        const id = 'm' + Date.now()
        const color = COLORS[members.length % COLORS.length]
        set({
          members: [...members, { id, name, color, preferences: [], loadMax: 240 }]
        })
      },

      updateMemberPreferences: (memberId, preferences) => {
        set(state => ({
          members: state.members.map(m => m.id === memberId ? { ...m, preferences } : m)
        }))
      },

      updateMemberLoadMax: (memberId, loadMax) => {
        set(state => ({
          members: state.members.map(m => m.id === memberId ? { ...m, loadMax } : m)
        }))
      },

      addChore: (chore) => {
        const id = 'c' + Date.now()
        set(state => ({
          chores: [...state.chores, {
            id, status: 'pending_acceptance', actualMinutes: null, completedAt: null,
            createdAt: new Date().toISOString(), ...chore,
          }]
        }))
      },

      acceptChore: (choreId) => {
        set(state => ({
          chores: state.chores.map(c =>
            c.id === choreId ? { ...c, status: 'assigned' } : c
          )
        }))
      },

      declineChore: (choreId) => {
        set(state => ({
          chores: state.chores.map(c =>
            c.id === choreId ? { ...c, status: 'declined', assignedTo: null } : c
          )
        }))
      },

      completeChore: (choreId, actualMinutes) => {
        const { chores } = get()
        const chore = chores.find(c => c.id === choreId)
        if (!chore) return
        const completedAt = new Date().toISOString()
        const onTime = !isPast(new Date(chore.deadline))
        set(state => ({
          chores: state.chores.map(c =>
            c.id === choreId ? { ...c, status: 'completed', actualMinutes, completedAt, onTime } : c
          )
        }))
      },

      deleteChore: (choreId) => {
        set(state => ({ chores: state.chores.filter(c => c.id !== choreId) }))
      },

      getChoresForMember: (memberId) => {
        return get().chores.filter(c => c.assignedTo === memberId)
      },

      getPendingForMember: (memberId) => {
        return get().chores.filter(c => c.assignedTo === memberId && c.status === 'pending_acceptance')
      },

      getCompletedForMember: (memberId) => {
        return get().chores.filter(c => c.assignedTo === memberId && c.status === 'completed')
      },
    }),
    { name: 'offen-chores-storage' }
  )
)

export default useStore
export { CHORE_PREFERENCES }
