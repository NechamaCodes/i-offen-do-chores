import { useState, useRef, useEffect } from 'react'
import { Send, Trash2, Reply, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import useStore from '../store/useStore'
import MemberAvatar from '../components/MemberAvatar'

function MessageThread({ message }) {
  const members = useStore(s => s.members)
  const activeMemberId = useStore(s => s.activeMemberId)
  const addReply = useStore(s => s.addReply)
  const deleteMessage = useStore(s => s.deleteMessage)

  const [showReplies, setShowReplies] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [showReplyBox, setShowReplyBox] = useState(false)
  const replyRef = useRef(null)

  const author = members.find(m => m.id === message.authorId)
  const isOwn = message.authorId === activeMemberId

  useEffect(() => { if (showReplyBox) replyRef.current?.focus() }, [showReplyBox])

  function submitReply(e) {
    e.preventDefault()
    if (!replyText.trim()) return
    addReply(message.id, replyText)
    setReplyText('')
    setShowReplies(true)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex gap-3">
        <MemberAvatar memberId={message.authorId} size={36} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-gray-900">{author?.name}</span>
              <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}</span>
            </div>
            {isOwn && (
              <button onClick={() => deleteMessage(message.id)} className="text-gray-300 hover:text-red-500 transition-colors shrink-0">
                <Trash2 size={14} />
              </button>
            )}
          </div>

          <p className="text-gray-800 text-sm whitespace-pre-wrap">{message.text}</p>

          <div className="flex items-center gap-4 mt-3">
            <button
              onClick={() => setShowReplyBox(v => !v)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-purple-600 transition-colors font-medium"
            >
              <Reply size={13} /> Reply
            </button>
            {message.replies.length > 0 && (
              <button
                onClick={() => setShowReplies(v => !v)}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-purple-600 transition-colors font-medium"
              >
                {showReplies ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                {message.replies.length} {message.replies.length === 1 ? 'reply' : 'replies'}
              </button>
            )}
          </div>

          {showReplyBox && (
            <form onSubmit={submitReply} className="flex gap-2 mt-3">
              <input
                ref={replyRef}
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <button type="submit" disabled={!replyText.trim()}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white px-3 py-2 rounded-lg transition-colors">
                <Send size={14} />
              </button>
            </form>
          )}

          {showReplies && message.replies.length > 0 && (
            <div className="mt-4 space-y-3 pl-4 border-l-2 border-gray-100">
              {message.replies.map(reply => {
                const replyAuthor = members.find(m => m.id === reply.authorId)
                return (
                  <div key={reply.id} className="flex gap-2">
                    <MemberAvatar memberId={reply.authorId} size={24} />
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-gray-800 text-sm">{replyAuthor?.name}</span>
                        <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}</span>
                      </div>
                      <p className="text-gray-700 text-sm mt-0.5 whitespace-pre-wrap">{reply.text}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Messages() {
  const messages = useStore(s => s.messages)
  const addMessage = useStore(s => s.addMessage)
  const activeMemberId = useStore(s => s.activeMemberId)
  const [text, setText] = useState('')
  const textareaRef = useRef(null)

  function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim()) return
    addMessage(text)
    setText('')
    textareaRef.current?.focus()
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e) }
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <MessageSquare size={22} className="text-purple-600" /> Message Board
        </h1>
        <p className="text-gray-400 text-sm mt-0.5">Discuss chores, coordinate, leave notes for the family.</p>
      </div>

      {/* Compose */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-4 mb-6 shadow-sm">
        <div className="flex gap-3">
          <MemberAvatar memberId={activeMemberId} size={36} />
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write something for the family… (Enter to send)"
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
            />
            <div className="flex justify-end mt-2">
              <button type="submit" disabled={!text.trim()}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors">
                <Send size={14} /> Post
              </button>
            </div>
          </div>
        </div>
      </form>

      {messages.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
          <MessageSquare size={48} className="mx-auto mb-3 text-gray-200" />
          <p className="font-semibold text-gray-500">No messages yet.</p>
          <p className="text-sm text-gray-400 mt-1">Be the first to post something!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map(m => <MessageThread key={m.id} message={m} />)}
        </div>
      )}
    </div>
  )
}
