import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRouter from './routes/auth.js'
import appointmentsRouter from './routes/appointments.js'
import doctorsRouter from './routes/doctors.js'
import followUpsRouter from './routes/followups.js'
import prescriptionsRouter from './routes/prescriptions.js'
import recordsRouter from './routes/records.js'
import messagesRouter from './routes/messages.js'
import emergencyRouter from './routes/emergency.js'
import referralsRouter from './routes/referrals.js'
import bloodRouter from './routes/blood.js'
import aiRouter from './routes/ai.js'
import { startScheduler } from './services/scheduler.js'
import { createServer } from 'http'
import { Server } from 'socket.io'

dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: true,
    credentials: true,
  }
})
const PORT = process.env.PORT || 5000

app.use(
  cors({
    origin: true, // allow any origin in development
    credentials: true,
  }),
)
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/auth', authRouter)
app.use('/api/appointments', appointmentsRouter)
app.use('/api/doctors', doctorsRouter)
app.use('/api/follow-ups', followUpsRouter)
app.use('/api/prescriptions', prescriptionsRouter)
app.use('/api/records', recordsRouter)
app.use('/api/messages', messagesRouter)
app.use('/api/emergency', emergencyRouter)
app.use('/api/referrals', referralsRouter)
app.use('/api/blood', bloodRouter)
app.use('/api/ai', aiRouter)

// Socket.io Real-time Messaging setup
io.on('connection', (socket) => {
  socket.on('join_chat', (userId) => {
    socket.join(userId)
  })

  socket.on('send_message', (data) => {
    // data = { receiverId, messageData }
    io.to(data.receiverId).emit('receive_message', data.messageData)
  })

  socket.on('disconnect', () => {
    // handled automatically
  })
})

httpServer.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${PORT}`)
  startScheduler()
})

