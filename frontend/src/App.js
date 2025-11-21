import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import AddInsight from './pages/AddInsight';
import Report from './pages/Report';
import PersonaGenerator from './pages/PersonaGenerator';
import Personas from './pages/Personas';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route - Login */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes - Require Authentication */}
        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        
        <Route path="/add-insight" element={
          <ProtectedRoute>
            <AddInsight />
          </ProtectedRoute>
        } />
        
        {/* Admin-Only Routes */}
        <Route path="/report" element={
          <ProtectedRoute adminOnly={true}>
            <Report />
          </ProtectedRoute>
        } />
        
        <Route path="/persona-generator" element={
          <ProtectedRoute adminOnly={true}>
            <PersonaGenerator />
          </ProtectedRoute>
        } />
        
        <Route path="/personas" element={
          <ProtectedRoute adminOnly={true}>
            <Personas />
          </ProtectedRoute>
        } />
        
        {/* Catch all - redirect to home or login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
