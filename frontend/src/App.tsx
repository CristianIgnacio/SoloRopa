import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Home from "./pages/Home"
import Admin from "./pages/Admin"
import Profile from "./pages/Profile"
import Navbar from "./components/Navbar"
import { Box } from "@mui/material"


function App() {

  return (
    <Router>
      <Box sx={{ backgroundColor: '#f8fafc', minHeight: '100vh', width: '100%', margin : 0 }}>
        <Navbar/>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/admin' element={<Admin />} />
          <Route path='/profile/:id' element={<Profile />} />
        </Routes>
      </Box>
    </Router>
  )
}

export default App
