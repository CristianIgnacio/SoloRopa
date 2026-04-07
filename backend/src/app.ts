import express from 'express'
import cors from 'cors'
import logger from './utils/logger'
import config from './utils/config'
import mongoose from 'mongoose'
import middleware from './utils/middleware'
import routes from "./routes"
import cookieParser from 'cookie-parser'

const app = express()

// Confiar en el proxy (necesario para obtener la IP real del cliente detrás de Nginx/Heroku/Cloudflare)
app.set('trust proxy', true)

mongoose.set('strictQuery', false)

// conexion bd
if (config.MONGODB_URI) {
  mongoose.connect(config.MONGODB_URI, { dbName: config.MONGODB_DBNAME })
    .then(() => {
      logger.info('Connected to MongoDB')
    })
    .catch((error) => {
      logger.error('error connecting to MongoDB:', error.message)
    })
}

// CORS — en producción reemplazar origin por el dominio real via FRONTEND_URL env var
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,                   // necesario para enviar cookies httpOnly
  exposedHeaders: ['X-CSRF-Token'],    // necesario para que el frontend lea el token CSRF
}))

app.use("/uploads", express.static("uploads")); 
app.use(express.static('dist'))
app.use(express.json())
app.use(cookieParser())
app.use(middleware.requestLogger)

// routes
app.use(routes)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

export default app
