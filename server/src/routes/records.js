import express from 'express'
import { PrismaClient } from '../../generated/prisma/index.js'
import { authenticate } from '../middleware/authMiddleware.js'
import { upload } from '../services/upload.js'

const prisma = new PrismaClient()
const router = express.Router()

router.use(authenticate)

// ─── GET /api/records ─── Get records for the logged-in patient
router.get('/', async (req, res) => {
  try {
    // Both patients and doctors might hit this, but patients should only see their own.
    if (req.user.role === 'doctor') {
      return res.status(403).json({ message: 'Use doctor-specific routes to view patient records' })
    }

    const records = await prisma.medicalRecord.findMany({
      where: { patientId: req.user.userId },
      include: { 
        appointment: { 
          select: { doctorOrService: true, appointmentDate: true } 
        } 
      },
      orderBy: { createdAt: 'desc' }
    })
    return res.json({ records })
  } catch (error) {
    console.error('List records error:', error)
    return res.status(500).json({ message: error?.message || 'Internal server error' })
  }
})

// ─── POST /api/records ─── Patient uploads a record or Doctor adds a note
router.post('/', upload.single('document'), async (req, res) => {
  try {
    const { title, description, recordType, appointmentId, targetPatientId } = req.body

    if (!title || !recordType) {
      return res.status(400).json({ message: 'Missing required fields: title, recordType' })
    }

    // Determine the patient ID to attach the record to
    let patientId = req.user.userId
    
    // If it's a doctor adding a record
    if (req.user.role === 'doctor') {
       if (!targetPatientId) {
         return res.status(400).json({ message: 'Doctors must specify a targetPatientId' })
       }
       patientId = targetPatientId
    }

    const fileUrl = req.file ? req.file.path : null

    const record = await prisma.medicalRecord.create({
      data: {
        title,
        description,
        recordType,
        fileUrl, 
        appointmentId: appointmentId || null,
        patientId,
      }
    })

    return res.status(201).json({ message: 'Medical record added successfully', record })
  } catch (error) {
    console.error('Create record error:', error)
    return res.status(500).json({ message: error?.message || 'Internal server error' })
  }
})

export default router
