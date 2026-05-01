import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {BrowserRouter as Router} from "react-router-dom"
import './index.css'
import App from './App.tsx'
import axios from 'axios'
import { SpeedInsights } from "@vercel/speed-insights/react"
import { Analytics } from "@vercel/analytics/react"
import { GoogleOAuthProvider } from "@react-oauth/google"

axios.defaults.baseURL = import.meta.env.VITE_API_URL || ""
axios.defaults.withCredentials = true

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}>
      <Router>
        <App />
      </Router>
    </GoogleOAuthProvider>
    <SpeedInsights />
    <Analytics />
  </StrictMode>,
)
