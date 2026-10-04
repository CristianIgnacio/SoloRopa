import dotenv from 'dotenv'
import dns from 'node:dns'
dotenv.config({ quiet: true })

// Atlas usa consultas SRV. Aplicar sólo al resolvedor de este proceso Node.
const MONGODB_DNS_SERVERS = (process.env.MONGODB_DNS_SERVERS || '')
  .split(',').map(server => server.trim()).filter(Boolean)
if (MONGODB_DNS_SERVERS.length > 0) dns.setServers(MONGODB_DNS_SERVERS)

type SameSitePolicy = 'lax' | 'strict' | 'none'

const PORT = process.env.PORT || 3001
const HOST = process.env.HOST || 'localhost'

const MONGODB_URI =
  process.env.NODE_ENV === 'test'
    ? process.env.TEST_MONGODB_URI
    : process.env.NODE_ENV === 'production' || process.env.MONGODB_TARGET === 'production'
      ? process.env.MONGODB_URI
      : process.env.MONGODB_URI_LOCAL

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is required')

const MONGODB_DBNAME 
  = process.env.NODE_ENV === 'test' 
    ? process.env.TEST_MONGODB_DBNAME 
    : process.env.MONGODB_DBNAME || 'SoloRopa'

const SCRAPER_MONGODB_URI = process.env.SCRAPER_MONGODB_URI

const COOKIE_SAME_SITE: SameSitePolicy = (
  process.env.COOKIE_SAME_SITE === 'none'
  || process.env.COOKIE_SAME_SITE === 'strict'
  || process.env.COOKIE_SAME_SITE === 'lax'
)
  ? process.env.COOKIE_SAME_SITE
  : 'lax'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''

export default { 
  PORT, 
  MONGODB_URI, 
  HOST, 
  JWT_SECRET, 
  MONGODB_DBNAME, 
  SCRAPER_MONGODB_URI, 
  COOKIE_SAME_SITE,
  GOOGLE_CLIENT_ID
}
