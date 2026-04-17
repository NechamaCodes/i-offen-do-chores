import { useEffect } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import useStore from '../store/useStore'

export default function useFirestoreSync() {
  const familyCode = useStore(s => s.familyCode)
  const setMembers = useStore(s => s.setMembers)
  const setChores = useStore(s => s.setChores)
  const setMessages = useStore(s => s.setMessages)
  const setLoading = useStore(s => s.setLoading)

  useEffect(() => {
    if (!familyCode) {
      setLoading(false)
      return
    }

    setLoading(true)
    let loaded = { members: false, chores: false, messages: false }

    function checkDone() {
      if (loaded.members && loaded.chores && loaded.messages) setLoading(false)
    }

    function markLoaded(key) {
      loaded[key] = true
      checkDone()
    }

    // Safety net: never stay stuck loading more than 8 seconds
    const timeout = setTimeout(() => setLoading(false), 8000)

    const unsubMembers = onSnapshot(
      collection(db, 'families', familyCode, 'members'),
      snap => {
        setMembers(snap.docs.map(d => d.data()))
        markLoaded('members')
      },
      () => markLoaded('members')
    )

    const unsubChores = onSnapshot(
      collection(db, 'families', familyCode, 'chores'),
      snap => {
        setChores(snap.docs.map(d => d.data()))
        markLoaded('chores')
      },
      () => markLoaded('chores')
    )

    const unsubMessages = onSnapshot(
      collection(db, 'families', familyCode, 'messages'),
      snap => {
        const msgs = snap.docs
          .map(d => d.data())
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setMessages(msgs)
        markLoaded('messages')
      },
      () => markLoaded('messages')
    )

    return () => {
      clearTimeout(timeout)
      unsubMembers()
      unsubChores()
      unsubMessages()
    }
  }, [familyCode])
}
