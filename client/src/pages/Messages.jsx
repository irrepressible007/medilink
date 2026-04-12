import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { API_BASE_URL } from '../config.js'
import { Navbar, BottomNav } from '../components/Navbar.jsx'
import './Messages.css'

/* Helper: get initials */
const initials = (name = '') => name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

function Messages() {
  const [conversations, setConversations] = useState([])
  const [activeConvo, setActiveConvo] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [socket, setSocket] = useState(null)
  const [showCompose, setShowCompose] = useState(false)
  const [availableDoctors, setAvailableDoctors] = useState([])
  const [attachment, setAttachment] = useState(null)
  const [showChat, setShowChat] = useState(false) // mobile: toggle between sidebar/chat

  const token = localStorage.getItem('medilink_token') || localStorage.getItem('medilink_doctor_token')
  const userStr = localStorage.getItem('medilink_user') || localStorage.getItem('medilink_doctor')
  const currentUser = userStr ? JSON.parse(userStr) : null
  const isDoctor = currentUser?.role === 'doctor'
  const messagesEndRef = useRef(null)

  useEffect(() => {
    fetchConversations()
    const socketUrl = API_BASE_URL.replace('/api', '')
    const sock = io(socketUrl)
    setSocket(sock)
    if (currentUser?.id) sock.emit('join_chat', currentUser.id)
    sock.on('receive_message', (msg) => setMessages(prev => [...prev, msg]))
    return () => sock.off('receive_message').disconnect()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchConversations = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setConversations(data.conversations || [])
    } catch {}
  }

  const openConversation = async (convo) => {
    setActiveConvo(convo)
    setShowCompose(false)
    setShowChat(true)
    try {
      const res = await fetch(`${API_BASE_URL}/messages/${convo.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setMessages(data.messages || [])
    } catch {}
  }

  const fetchAvailableDoctors = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/doctors`)
      const data = await res.json()
      setAvailableDoctors(data.doctors || [])
      setShowCompose(true)
      setActiveConvo(null)
      setShowChat(true)
    } catch {}
  }

  const startNewConversation = (doctor) => {
    const existing = conversations.find(c => c.otherUser?.id === doctor.id)
    if (existing) { openConversation(existing); return }
    setActiveConvo({ id: 'new', otherUser: { id: doctor.id, fullName: doctor.fullName, role: 'doctor' } })
    setMessages([])
    setShowCompose(false)
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if ((!text.trim() && !attachment) || !activeConvo) return
    const receiverId = activeConvo.otherUser.id
    try {
      const formData = new FormData()
      formData.append('receiverId', receiverId)
      if (text.trim()) formData.append('content', text)
      if (attachment) formData.append('attachment', attachment)
      const res = await fetch(`${API_BASE_URL}/messages`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })
      const saved = await res.json()
      if (!res.ok) throw new Error('Failed to send')
      setMessages(prev => [...prev, saved.message])
      if (activeConvo.id === 'new') {
        fetchConversations()
        setActiveConvo(prev => ({ ...prev, id: saved.conversationId }))
      }
      socket?.emit('send_message', { receiverId, messageData: saved.message })
      setText('')
      setAttachment(null)
    } catch (err) { console.error(err) }
  }

  const role = isDoctor ? 'doctor' : 'patient'

  return (
    <div className="messages-page">
      <Navbar role={role} />

      <div className="messages-container">
        {/* ── Sidebar ── */}
        <div className={`messages-sidebar ${showChat ? 'hidden' : ''}`}>
          <div className="messages-sidebar-header">
            <h2>Inbox</h2>
            {!isDoctor && (
              <button className="messages-new-btn" onClick={fetchAvailableDoctors}>+ New Chat</button>
            )}
          </div>

          <div className="messages-convo-list">
            {conversations.length === 0 && (
              <div className="messages-empty" style={{ marginTop: '2rem' }}>
                <span className="messages-empty-icon">💬</span>
                <span className="messages-empty-text">No conversations yet</span>
              </div>
            )}
            {conversations.map(convo => (
              <div
                key={convo.id}
                className={`messages-convo-item ${activeConvo?.otherUser?.id === convo.otherUser?.id && !showCompose ? 'active' : ''}`}
                onClick={() => openConversation(convo)}
              >
                <div className="messages-convo-avatar">
                  {initials(convo.otherUser?.fullName || '?')}
                </div>
                <div className="messages-convo-info">
                  <p className="messages-convo-name">{convo.otherUser?.fullName || 'Unknown'}</p>
                  <p className="messages-convo-role">{convo.otherUser?.role === 'doctor' ? '👨‍⚕️ Doctor' : '🧑 Patient'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Chat Area ── */}
        <div className={`messages-chat-area ${showChat ? 'visible' : ''}`}>
          {showCompose ? (
            <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
              <button
                onClick={() => { setShowCompose(false); setShowChat(false) }}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', marginBottom: '1rem' }}
              >
                ← Back
              </button>
              <h2 style={{ marginBottom: '1rem', color: 'var(--text)' }}>Select a Doctor</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {availableDoctors.map(doc => (
                  <div
                    key={doc.id}
                    className="ml-card"
                    style={{ padding: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.85rem' }}
                    onClick={() => startNewConversation(doc)}
                  >
                    <div className="messages-convo-avatar">{initials(doc.fullName)}</div>
                    <div>
                      <p style={{ fontWeight: 700, color: 'var(--text)', margin: 0 }}>{doc.fullName}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>{doc.specialty || 'General Practitioner'}</p>
                    </div>
                    <span style={{ marginLeft: 'auto', color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem' }}>Message →</span>
                  </div>
                ))}
              </div>
            </div>
          ) : activeConvo ? (
            <>
              {/* Header */}
              <div className="messages-chat-header">
                <button
                  onClick={() => setShowChat(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '1.2rem', cursor: 'pointer', marginRight: '4px' }}
                >
                  ←
                </button>
                <div className="messages-chat-header-avatar">{initials(activeConvo.otherUser?.fullName)}</div>
                <div className="messages-chat-header-info">
                  <h3>{activeConvo.otherUser?.fullName}</h3>
                  <p>🔒 Secure medical channel</p>
                </div>
              </div>

              {/* Messages */}
              <div className="messages-area">
                {messages.length === 0 && (
                  <div className="messages-empty">
                    <span className="messages-empty-icon">💬</span>
                    <span className="messages-empty-text">Start the conversation</span>
                  </div>
                )}
                {messages.map(msg => {
                  const isMe = msg.senderId === currentUser?.id
                  return (
                    <div key={msg.id} className={isMe ? 'message-my' : 'message-other'}>
                      {msg.hasAttachment && msg.fileUrl && (
                        <div style={{ marginBottom: '6px' }}>
                          <a href={msg.fileUrl} target="_blank" rel="noreferrer" style={{ color: isMe ? 'rgba(255,255,255,0.9)' : 'var(--primary)', fontWeight: 700, fontSize: '0.85rem' }}>
                            📎 View Attachment
                          </a>
                        </div>
                      )}
                      {msg.content && <div>{msg.content}</div>}
                      <div className="message-time" style={{ textAlign: isMe ? 'right' : 'left' }}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Attachment preview */}
              {attachment && (
                <div className="messages-attachment-preview">
                  <span>📎 {attachment.name}</span>
                  <button className="messages-attachment-remove" onClick={() => setAttachment(null)}>✕</button>
                </div>
              )}

              {/* Input */}
              <form className="messages-input-area" onSubmit={sendMessage}>
                <label className="messages-attach-btn">
                  📎
                  <input type="file" onChange={e => setAttachment(e.target.files[0])} style={{ display: 'none' }} />
                </label>
                <input
                  type="text"
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Type a message…"
                  className="messages-input-field"
                />
                <button type="submit" className="messages-send-btn" disabled={!text.trim() && !attachment}>
                  ➤
                </button>
              </form>
            </>
          ) : (
            <div className="messages-empty" style={{ flex: 1 }}>
              <span className="messages-empty-icon">💬</span>
              <span className="messages-empty-text">Select a conversation or start a new one</span>
            </div>
          )}
        </div>
      </div>

      <BottomNav role={role} />
    </div>
  )
}

export default Messages
