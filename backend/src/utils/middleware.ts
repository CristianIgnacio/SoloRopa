import { NextFunction, Request, Response } from 'express'
import logger from './logger'
// import jwt from 'jsonwebtoken'

const SENSITIVE_KEYS = new Set([
  'password',
  'repeatPassword',
  'token',
  'resetPasswordToken',
  'csrfToken',
  'x-csrf-token',
])

const sanitizeLogValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(sanitizeLogValue)
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entryValue]) => {
        if (SENSITIVE_KEYS.has(key)) {
          return [key, '***OCULTA***']
        }

        return [key, sanitizeLogValue(entryValue)]
      })
    )
  }

  return value
}

const requestLogger = (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)

  logger.info('Body:  ', sanitizeLogValue(request.body) as any)

  logger.info('---')
  next()
}

const unknownEndpoint = (
  request: Request,
  response: Response,
) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (
  error: { name: string, message: string },
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  logger.error(error.message)

  logger.error(error.name)
  if (error.name === 'CastError') {
    response.status(400).send({ error: 'malformatted id' })
  }
  else if (error.name === 'ValidationError') {
    response.status(400).json({ error: error.message })
  }
  else if (
    error.name === 'MongoServerError'
    && error.message.includes('E11000 duplicate key error')
  ) {
    if (error.message.includes('email')) {
      response
        .status(400)
        .json({ error: 'email address is already in use' })
    }
    else {
      response
        .status(400)
        .json({ error: 'username is already in use' })
    }
  }
  else if (error.name === 'JsonWebTokenError') {
    response.status(401).json({ error: 'invalid token' })
  }
  else if (error.name === 'TokenExpiredError') {
    response.status(401).json({ error: 'invalid token' })
  }

  next(error)
}

export default { requestLogger, unknownEndpoint, errorHandler }
