import express from 'express'
import logger from './utils/logger'
import config from './utils/config'
import mongoose from 'mongoose'
import middleware from './utils/middleware'
// import cookieParser from 'cookie-parser'

const app = express()

mongoose.set('strictQuery', false)

// conexion bd
if (config.MONGODB_URI) {
  mongoose.connect(config.MONGODB_URI, { dbName: config.MONGODB_DBNAME }).catch((error) => {
    logger.error('error connecting to MongoDB:', error.message)
  }).then(() => {
    logger.info('Connected to MongoDB')
  })
}

app.use(express.static('dist'))
app.use(express.json())
// app.use(cookieParser())
app.use(middleware.requestLogger)

// routes


app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

export default app
