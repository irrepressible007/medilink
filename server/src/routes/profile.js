import express from 'express'
import { PrismaClient } from '../../generated/prisma/index.js'
import { authenticate } from '../middleware/authMiddleware.js'

const prisma = new PrismaClient()
const router = express.Router()

router.use(authenticate)

// GET /api/profile — fetch current user's full profile
router.get('/', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        specialty: true,
        dateOfBirth: true,
        bloodGroup: true,
        allergies: true,
        emergencyContact: true,
        avatarUrl: true,
        createdAt: true,
      }
    })
    if (!user) return res.status(404).json({ message: 'User not found' })
    return res.json({ user })
  } catch (error) {
    console.error('Get profile error:', error)
    return res.status(500).json({ message: error?.message || 'Internal server error' })
  }
})

// PUT /api/profile — update current user's profile
router.put('/', async (req, res) => {
  try {
    const { fullName, phone, dateOfBirth, bloodGroup, allergies, emergencyContact } = req.body

    const updated = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        ...(fullName && { fullName }),
        ...(phone !== undefined && { phone }),
        ...(dateOfBirth !== undefined && { dateOfBirth }),
        ...(bloodGroup !== undefined && { bloodGroup }),
        ...(allergies !== undefined && { allergies }),
        ...(emergencyContact !== undefined && { emergencyContact }),
      },
      select: {
        id: true, fullName: true, email: true, phone: true,
        role: true, specialty: true, dateOfBirth: true,
        bloodGroup: true, allergies: true, emergencyContact: true, avatarUrl: true
      }
    })

    return res.json({ message: 'Profile updated successfully', user: updated })
  } catch (error) {
    console.error('Update profile error:', error)
    return res.status(500).json({ message: error?.message || 'Internal server error' })
  }
})

// GET /api/profile/admin/stats — Admin-only platform statistics
router.get('/admin/stats', async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Unauthorized' })

    const [patients, doctors, appointments, emergencies, bloodDonors, bloodRequests] = await Promise.all([
      prisma.user.count({ where: { role: 'patient' } }),
      prisma.user.count({ where: { role: 'doctor' } }),
      prisma.appointment.count(),
      prisma.emergencyRequest.count(),
      prisma.bloodDonor.count(),
      prisma.bloodRequest.count({ where: { status: 'open' } }),
    ])

    const recentPatients = await prisma.user.findMany({
      where: { role: 'patient' },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, fullName: true, email: true, createdAt: true }
    })

    return res.json({ stats: { patients, doctors, appointments, emergencies, bloodDonors, bloodRequests }, recentPatients })
  } catch (error) {
    console.error('Admin stats error:', error)
    return res.status(500).json({ message: error?.message || 'Internal server error' })
  }
})

export default router
