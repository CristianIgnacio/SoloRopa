/**
 * Seed script: crea un usuario admin en la base de datos.
 * Ejecutar con: npx ts-node src/seeds/createAdmin.ts
 */
import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'

dotenv.config()

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/SoloRopa'
const DB_NAME = process.env.MONGODB_DBNAME || 'SoloRopa'

async function createAdmin() {
  await mongoose.connect(MONGO_URI, { dbName: DB_NAME })
  console.log('✅ Conectado a MongoDB')

  const User = mongoose.model('User', new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    role: String,
    avatarUrl: String,
  }))

  // Verificar si ya existe
  const existing = await User.findOne({ username: 'admin' })
  if (existing) {
    console.log('⚠️  El usuario "admin" ya existe. No se creó duplicado.')
    await mongoose.disconnect()
    return
  }

  const passwordHash = await bcrypt.hash('admin123', 10)

  const admin = await User.create({
    username: 'admin',
    email: 'admin@soloropa.com',
    password: passwordHash,
    role: 'admin',
    avatarUrl: null,
  })

  console.log('🎉 Usuario admin creado exitosamente:')
  console.log(`   Username: admin`)
  console.log(`   Password: admin123`)
  console.log(`   Email:    admin@soloropa.com`)
  console.log(`   Role:     admin`)
  console.log(`   ID:       ${admin._id}`)

  await mongoose.disconnect()
}

createAdmin().catch((err) => {
  console.error('❌ Error:', err)
  process.exit(1)
})
