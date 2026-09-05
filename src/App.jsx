import { useState } from 'react'
import AuthPage from './components/AuthPage'
import HomePage from './components/HomePage'
import CleaningPage from './components/CleaningPage'
import InteriorDesignPage from './components/InteriorDesignPage'
import PlumbingPage from './components/PlumbingPage'
import GardenCarePage from './components/GardenCarePage'
import SmartSecurityPage from './components/SmartSecurityPage'
import HVACPage from './components/HVACPage'
import ServiceDetailPage from './components/ServiceDetailPage'
import MyBookingsPage from './components/MyBookingsPage'
import AdminDashboard from './components/AdminDashboard'
import './App.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [currentPage, setCurrentPage] = useState('home') 
  const [previousPage, setPreviousPage] = useState('home')
  const [selectedService, setSelectedService] = useState(null)

  const handleLogin = (userData) => {
    setUser(userData)
    setIsLoggedIn(true)
    if (userData.role === 'admin') {
      setCurrentPage('admin')
    } else {
      setCurrentPage('home')
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUser(null)
    setCurrentPage('home')
  }

  const goToCleaning = () => {
    setPreviousPage('home')
    setCurrentPage('cleaning')
    window.scrollTo(0, 0)
  }

  const goToInterior = () => {
    setPreviousPage('home')
    setCurrentPage('interior')
    window.scrollTo(0, 0)
  }

  const goToPlumbing = () => {
    setPreviousPage('home')
    setCurrentPage('plumbing')
    window.scrollTo(0, 0)
  }

  const goToGarden = () => {
    setPreviousPage('home')
    setCurrentPage('garden')
    window.scrollTo(0, 0)
  }

  const goToSecurity = () => {
    setPreviousPage('home')
    setCurrentPage('security')
    window.scrollTo(0, 0)
  }

  const goToHVAC = () => {
    setPreviousPage('home')
    setCurrentPage('hvac')
    window.scrollTo(0, 0)
  }

  const goToDetail = (serviceData, fromPage) => {
    setPreviousPage(fromPage)
    setSelectedService(serviceData)
    setCurrentPage('detail')
    window.scrollTo(0, 0)
  }

  const goBack = () => {
    setCurrentPage(previousPage)
  }

  // State-Based Route Protection:
  // If an unauthenticated user or client tries to access the admin dashboard
  if (isLoggedIn && currentPage === 'admin' && user?.role !== 'admin') {
    setCurrentPage('home')
  }

  if (!isLoggedIn) {
    return <AuthPage onLogin={handleLogin} />
  }

  return (
    <main className="app-main">
      {currentPage === 'admin' && user?.role === 'admin' && (
        <AdminDashboard user={user} onLogout={handleLogout} />
      )}
      
      {currentPage === 'bookings' && (
        <MyBookingsPage user={user} onBack={() => setCurrentPage('home')} />
      )}

      {currentPage === 'home' && (
        <HomePage 
          onLogout={handleLogout} 
          onCleaningClick={goToCleaning} 
          onInteriorClick={goToInterior} 
          onPlumbingClick={goToPlumbing}
          onGardenClick={goToGarden}
          onSecurityClick={goToSecurity}
          onHVACClick={goToHVAC}
          onBookingsClick={() => {
            setCurrentPage('bookings')
            window.scrollTo(0, 0)
          }}
        />
      )}
      {currentPage === 'cleaning' && (
        <CleaningPage 
          onBack={() => setCurrentPage('home')} 
          onServiceSelect={(data) => goToDetail(data, 'cleaning')} 
        />
      )}
      {currentPage === 'interior' && (
        <InteriorDesignPage 
          onBack={() => setCurrentPage('home')} 
          onServiceSelect={(data) => goToDetail(data, 'interior')} 
        />
      )}
      {currentPage === 'plumbing' && (
        <PlumbingPage 
          onBack={() => setCurrentPage('home')} 
          onServiceSelect={(data) => goToDetail(data, 'plumbing')} 
        />
      )}
      {currentPage === 'garden' && (
        <GardenCarePage 
          onBack={() => setCurrentPage('home')} 
          onServiceSelect={(data) => goToDetail(data, 'garden')} 
        />
      )}
      {currentPage === 'security' && (
        <SmartSecurityPage 
          onBack={() => setCurrentPage('home')} 
          onServiceSelect={(data) => goToDetail(data, 'security')} 
        />
      )}
      {currentPage === 'hvac' && (
        <HVACPage 
          onBack={() => setCurrentPage('home')} 
          onServiceSelect={(data) => goToDetail(data, 'hvac')} 
        />
      )}
      {currentPage === 'detail' && <ServiceDetailPage serviceData={selectedService} user={user} onBack={goBack} />}
    </main>
  )
}

export default App
