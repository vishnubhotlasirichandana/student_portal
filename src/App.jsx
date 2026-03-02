import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import ToastContainer from './components/Toast';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/dashboard/Profile';
import Portfolio from './pages/dashboard/Portfolio';
import Projects from './pages/dashboard/Projects';
import MyProjects from './pages/dashboard/MyProjects';
import StudentChat from './pages/dashboard/Chat';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected dashboard routes */}
          <Route path="/dashboard" element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route index element={<Profile />} />
              <Route path="portfolio" element={<Portfolio />} />
              <Route path="projects" element={<Projects />} />
              <Route path="my-projects" element={<MyProjects />} />
              <Route path="chat" element={<StudentChat />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
      <ToastContainer />
    </AuthProvider>
  );
}

export default App;
