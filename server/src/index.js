import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRouter from './routes/auth.js'
import appointmentsRouter from './routes/appointments.js'
import doctorsRouter from './routes/doctors.js'
import followUpsRouter from './routes/followups.js'
import { startScheduler } from './services/scheduler.js'

dotenv.config()

const app = express()
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

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${PORT}`)
  startScheduler()
})

