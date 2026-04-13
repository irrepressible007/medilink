import { PrismaClient } from '../generated/prisma/index.js'
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding Bangladesh Medical Discovery Hub...')

  // Clear existing directory data
  console.log('Clearing old data...')
  await prisma.hospitalService.deleteMany()
  await prisma.hospital.deleteMany()
  await prisma.service.deleteMany()

  // ── 1. Create Services (Tests and Operations) ──
  console.log('Creating Services...')
  const servicesData = [
    { name: 'MRI Scan (Brain)', type: 'TEST', description: 'Detailed magnetic resonance imaging of the brain.', basePrice: 8500 },
    { name: 'CT Scan (Chest)', type: 'TEST', description: 'Computed tomography scan for chest and lungs.', basePrice: 4500 },
    { name: 'Complete Blood Count (CBC)', type: 'TEST', description: 'Standard blood test analyzing overall health.', basePrice: 400 },
    { name: 'X-Ray (Chest PA)', type: 'TEST', description: 'Radiograph of the chest.', basePrice: 600 },
    { name: 'Ultrasound (Whole Abdomen)', type: 'TEST', description: 'Diagnostic imaging of abdominal organs.', basePrice: 1500 },
    { name: 'ECG', type: 'TEST', description: 'Electrocardiogram recording the electrical signal from the heart.', basePrice: 300 },
    
    { name: 'Appendectomy', type: 'OPERATION', description: 'Surgical removal of the appendix.', basePrice: 45000 },
    { name: 'Cataract Surgery (Phaco)', type: 'OPERATION', description: 'Eye surgery to remove clouded lens.', basePrice: 20000 },
    { name: 'C-Section (Caesarean)', type: 'OPERATION', description: 'Surgical delivery of a baby.', basePrice: 50000 },
    { name: 'Cardiac Bypass (CABG)', type: 'OPERATION', description: 'Heart bypass surgery to restore blood flow.', basePrice: 350000 },
    { name: 'Total Knee Replacement', type: 'OPERATION', description: 'Joint replacement surgery for the knee.', basePrice: 250000 }
  ]
  const createdServices = []
  for (const s of servicesData) {
    const srv = await prisma.service.create({ data: s })
    createdServices.push(srv)
  }

  // ── 2. Create Hospitals across BD Regions ──
  console.log('Creating Hospitals...')
  const hospitalsData = [
    { name: 'Square Hospital', city: 'Dhaka', address: '18/F Bir Uttam Qazi Nuruzzaman Sarak, West Panthapath', contactPhone: '10616', description: 'Top tier private tertiary care hospital.' },
    { name: 'Evercare Hospital', city: 'Dhaka', address: 'Plot 81, Block E, Bashundhara R/A', contactPhone: '10678', description: 'Multidisciplinary super-specialty hospital.' },
    { name: 'Dhaka Medical College Hospital', city: 'Dhaka', address: 'Secretariat Road, Dhaka 1000', contactPhone: '+880255165088', description: 'Largest public hospital in Bangladesh.' },
    
    { name: 'Evercare Hospital Chattogram', city: 'Chittagong', address: 'Plot No. H1, Ananna Residential Area', contactPhone: '10663', description: 'Premium healthcare facility in the port city.' },
    { name: 'Chittagong Medical College Hospital', city: 'Chittagong', address: 'KB Fazlul Kader Road, Panchlaish', contactPhone: '+88031619597', description: 'Major public hospital serving Chittagong division.' },
    
    { name: 'Mount Adora Hospital', city: 'Sylhet', address: 'Noyashorok, Sylhet', contactPhone: '+880821-714081', description: 'Leading modern hospital in Sylhet area.' },
    { name: 'Sylhet MAG Osmani Medical College Hospital', city: 'Sylhet', address: 'Medical Road, Sylhet 3100', contactPhone: '+880821-713667', description: 'Government medical college and hospital.' },
    
    { name: 'Rajshahi Medical College Hospital', city: 'Rajshahi', address: 'Rajshahi 6000', contactPhone: '+880721-772150', description: 'Premier tertiary care hospital in Rajshahi.' },
    { name: 'Khulna City Medical College & Hospital', city: 'Khulna', address: 'B-25, Moilapota, Khulna', contactPhone: '+88041-731011', description: 'State-of-the-art facility serving Khulna region.' },
    { name: 'Sher-e-Bangla Medical College Hospital', city: 'Barishal', address: 'Band Road, Barishal', contactPhone: '+880431-2173541', description: 'Major medical center in the southern region.' }
  ]
  const createdHospitals = []
  for (const h of hospitalsData) {
    const hosp = await prisma.hospital.create({ data: h })
    createdHospitals.push(hosp)
  }

  // ── 3. Map Services to Hospitals (HospitalService) ──
  console.log('Mapping Services to Hospitals...')
  // Give every hospital a random subset of services with slightly varying prices
  for (const hosp of createdHospitals) {
    // Pick 5 to 10 random services for this hospital
    const numServices = Math.floor(Math.random() * 5) + 6
    const shuffledServices = [...createdServices].sort(() => 0.5 - Math.random())
    const selectedServices = shuffledServices.slice(0, numServices)

    for (const srv of selectedServices) {
      // Fluctuate price by -10% to +20% based on hospital prestige (simulated by random)
      const multiplier = 0.9 + (Math.random() * 0.3)
      const finalPrice = Math.round((srv.basePrice * multiplier) / 100) * 100

      await prisma.hospitalService.create({
        data: {
          hospitalId: hosp.id,
          serviceId: srv.id,
          price: finalPrice,
          available: Math.random() > 0.1 // 90% chance it's available
        }
      })
    }
  }

  console.log('✅ Seeding Complete!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
