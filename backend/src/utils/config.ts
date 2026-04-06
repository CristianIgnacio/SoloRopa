import dotenv from 'dotenv'
dotenv.config()

type SameSitePolicy = 'lax' | 'strict' | 'none'

const PORT = process.env.PORT
const HOST = process.env.HOST || 'localhost'

const MONGODB_URI
  = process.env.NODE_ENV === 'test'
    ? process.env.TEST_MONGODB_URI
    : process.env.MONGODB_URI

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is required')
const MONGODB_DBNAME 
  = process.env.NODE_ENV === 'test' 
    ? process.env.TEST_MONGODB_DBNAME 
    : process.env.MONGODB_DBNAME || 'postsdb'

const SCRAPER_MONGODB_URI = process.env.SCRAPER_MONGODB_URI
const COOKIE_SAME_SITE: SameSitePolicy = (
  process.env.COOKIE_SAME_SITE === 'none'
  || process.env.COOKIE_SAME_SITE === 'strict'
  || process.env.COOKIE_SAME_SITE === 'lax'
)
  ? process.env.COOKIE_SAME_SITE
  : 'lax'

export default { PORT, MONGODB_URI, HOST, JWT_SECRET, MONGODB_DBNAME, SCRAPER_MONGODB_URI, COOKIE_SAME_SITE }
