import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Toast from './components/Toast'

import Dashboard        from './pages/Dashboard'
import Employees        from './pages/Employees'
import Departments      from './pages/Departments'
import Houses           from './pages/Houses'
import FullTime         from './pages/FullTime'
import Contracts        from './pages/Contracts'
import Interns          from './pages/Interns'
import Dependents       from './pages/Dependents'
import Trainings        from './pages/Trainings'
import Colleges         from './pages/Colleges'
import Internships      from './pages/Internships'
import Phones           from './pages/Phones'
import EmployeeTraining from './pages/EmployeeTraining'

export const ToastContext = React.createContext(null)

function App() {
  const [toast, setToast] = useState({ message: '', type: 'success' })

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }

  return (
    <ToastContext.Provider value={showToast}>
      <Header />
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <div style={{
          flex: 1,
          padding: '36px 40px',
          overflowY: 'auto',
          minHeight: 'calc(100vh - 90px)',
        }}>
          <Routes>
            <Route path="/"                  element={<Dashboard />} />
            <Route path="/employees"         element={<Employees />} />
            <Route path="/departments"       element={<Departments />} />
            <Route path="/houses"            element={<Houses />} />
            <Route path="/fulltime"          element={<FullTime />} />
            <Route path="/contracts"         element={<Contracts />} />
            <Route path="/interns"           element={<Interns />} />
            <Route path="/dependents"        element={<Dependents />} />
            <Route path="/trainings"         element={<Trainings />} />
            <Route path="/colleges"          element={<Colleges />} />
            <Route path="/internships"       element={<Internships />} />
            <Route path="/phones"            element={<Phones />} />
            <Route path="/employee-training" element={<EmployeeTraining />} />
          </Routes>
        </div>
      </div>
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </ToastContext.Provider>
  )
}

export default App