import { create } from 'zustand'
import { isPast } from 'date-fns'
import {
  collection, doc, setDoc, updateDoc, deleteDoc
} from 'firebase/firestore'
import { db } from '../firebase'

export const CHORE_PREFERENCES = [
  'Cooking', 'Dishes', 'Vacuuming', 'Laundry', 'Trash', 'Groceries',
  'Mopping', 'Dusting', 'Bathrooms', 'Yard Work', 'Car Wash', 'Windows',
  'Pet Care', 'Kids Homework Help', 'Organizing', 'Recycling',
]

const COLORS = ['#7c3aed', '#db2777', '#0891b2', '#16a34a', '#ea580c', '#9333ea', '#b45309', '#0f766e']

async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

const localState = {
  familyCode: localStorage.getItem('offen-family-code') || null,
  activeMemberId: localStorage.getItem('offen-active-member') || null,
  myMemberId: localStorage.getItem('offen-my-member') || null,
  setupComplete: localStorage.getItem('offen-setup-complete') === 'true',
}

function familyCol(familyCode, col) {
  return collection(db, 'families', familyCode, col)
}
function familyDoc(familyCode, col, id) {
  return doc(db, 'families', familyCode, col, id)
}

function calcLoad(memberId, chores) {
  return chores
    .filter(c => c.assignedTo === memberId && ['pending_acceptance', 'assigned'].includes(c.status))
    .reduce((sum, c) => sum + (c.estimatedMinutes || 0), 0)
}

const useStore = create((set, get) => ({
  // --- Shared state (from Firestore) ---
  members: [],
  chores: [],
  messages: [],

  // --- Local state (per device) ---
  familyCode: localState.familyCode,
  activeMemberId: localState.activeMemberId,
  myMemberId: localState.myMemberId,
  setupComplete: localState.setupComplete,
  loading: true,

  // --- Firestore sync (called by useFirestoreSync hook) ---
  setMembers: (members) => set({ members }),
  setChores: (chores) => set({ chores }),
  setMessages: (messages) => set({ messages }),
  setLoading: (loading) => set({ loading }),

  // --- Local state setters ---
  setActiveMember: (id) => {
    localStorage.setItem('offen-active-member', id)
    set({ activeMemberId: id })
  },

  setFamilyCode: (code) => {
    if (code) {
      localStorage.setItem('offen-family-code', code)
    } else {
      localStorage.removeItem('offen-family-code')
    }
    set({ familyCode: code })
  },

  // --- Auth actions ---
  loginAndComplete: async (memberId, password, isFirstTime) => {
    const { familyCode, members } = get()
    const member = members.find(m => m.id === memberId)
    if (!member) return false

    const hash = await hashPassword(password)

    if (isFirstTime) {
      await updateDoc(familyDoc(familyCode, 'members', memberId), { passwordHash: hash })
    } else {
      if (hash !== member.passwordHash) return false
    }

    localStorage.setItem('offen-active-member', memberId)
    localStorage.setItem('offen-my-member', memberId)
    localStorage.setItem('offen-setup-complete', 'true')
    set({ activeMemberId: memberId, myMemberId: memberId, setupComplete: true })
    return true
  },

  logout: () => {
    localStorage.removeItem('offen-my-member')
    localStorage.removeItem('offen-setup-complete')
    set({ myMemberId: null, setupComplete: false })
  },

  resetFamily: () => {
    localStorage.removeItem('offen-family-code')
    localStorage.removeItem('offen-active-member')
    localStorage.removeItem('offen-my-member')
    localStorage.removeItem('offen-setup-complete')
    set({ familyCode: null, activeMemberId: null, myMemberId: null, setupComplete: false, members: [], chores: [], messages: [] })
  },

  // --- Computed ---
  getMemberLoad: (memberId) => calcLoad(memberId, get().chores),

  getLoadPercent: (memberId) => {
    const { members, chores } = get()
    const member = members.find(m => m.id === memberId)
    if (!member) return 0
    return Math.min(100, Math.round((calcLoad(memberId, chores) / member.loadMax) * 100))
  },

  getPendingForMember: (memberId) =>
    get().chores.filter(c => c.assignedTo === memberId && c.status === 'pending_acceptance'),

  getCompletedForMember: (memberId) =>
    get().chores.filter(c => c.assignedTo === memberId && c.status === 'completed'),

  // --- Member actions (write to Firestore) ---
  addMember: async (name) => {
    const { familyCode, members } = get()
    const color = COLORS[members.length % COLORS.length]
    const id = 'm' + Date.now()
    const member = { id, name, color, preferences: [], loadMax: 150, avatar: null, passwordHash: null }
    await setDoc(familyDoc(familyCode, 'members', id), member)
    return id
  },

  deleteMember: async (memberId) => {
    const { familyCode } = get()
    await deleteDoc(familyDoc(familyCode, 'members', memberId))
    if (get().activeMemberId === memberId) {
      const remaining = get().members.filter(m => m.id !== memberId)
      if (remaining.length > 0) get().setActiveMember(remaining[0].id)
    }
  },

  updateMemberName: async (memberId, name) => {
    const { familyCode } = get()
    await updateDoc(familyDoc(familyCode, 'members', memberId), { name })
  },

  updateMemberColor: async (memberId, color) => {
    const { familyCode } = get()
    await updateDoc(familyDoc(familyCode, 'members', memberId), { color })
  },

  updateMemberAvatar: async (memberId, avatar) => {
    const { familyCode } = get()
    await updateDoc(familyDoc(familyCode, 'members', memberId), { avatar })
  },

  updateMemberPreferences: async (memberId, preferences) => {
    const { familyCode } = get()
    await updateDoc(familyDoc(familyCode, 'members', memberId), { preferences })
  },

  updateMemberLoadMax: async (memberId, loadMax) => {
    const { familyCode } = get()
    await updateDoc(familyDoc(familyCode, 'members', memberId), { loadMax })
  },

  // --- Chore actions ---
  addChore: async (chore) => {
    const { familyCode } = get()
    const id = 'c' + Date.now()
    await setDoc(familyDoc(familyCode, 'chores', id), {
      id, status: 'pending_acceptance', actualMinutes: null,
      completedAt: null, createdAt: new Date().toISOString(), ...chore,
    })
  },

  acceptChore: async (choreId) => {
    const { familyCode } = get()
    await updateDoc(familyDoc(familyCode, 'chores', choreId), { status: 'assigned' })
  },

  declineChore: async (choreId) => {
    const { familyCode } = get()
    await updateDoc(familyDoc(familyCode, 'chores', choreId), { status: 'declined', assignedTo: null })
  },

  completeChore: async (choreId, actualMinutes) => {
    const { familyCode, chores } = get()
    const chore = chores.find(c => c.id === choreId)
    if (!chore) return
    const onTime = !isPast(new Date(chore.deadline))
    await updateDoc(familyDoc(familyCode, 'chores', choreId), {
      status: 'completed', actualMinutes,
      completedAt: new Date().toISOString(), onTime,
    })
  },

  deleteChore: async (choreId) => {
    const { familyCode } = get()
    await deleteDoc(familyDoc(familyCode, 'chores', choreId))
  },

  // --- Message actions (always authored as myMemberId) ---
  addMessage: async (text) => {
    const { familyCode, myMemberId } = get()
    if (!text.trim() || !myMemberId) return
    const id = 'msg' + Date.now()
    await setDoc(familyDoc(familyCode, 'messages', id), {
      id, authorId: myMemberId, text: text.trim(),
      createdAt: new Date().toISOString(), replies: [],
    })
  },

  addReply: async (messageId, text) => {
    const { familyCode, myMemberId, messages } = get()
    if (!text.trim() || !myMemberId) return
    const message = messages.find(m => m.id === messageId)
    if (!message) return
    const reply = {
      id: 'rep' + Date.now(), authorId: myMemberId,
      text: text.trim(), createdAt: new Date().toISOString(),
    }
    await updateDoc(familyDoc(familyCode, 'messages', messageId), {
      replies: [...(message.replies || []), reply],
    })
  },

  deleteMessage: async (messageId) => {
    const { familyCode } = get()
    await deleteDoc(familyDoc(familyCode, 'messages', messageId))
  },
}))

export default useStore
