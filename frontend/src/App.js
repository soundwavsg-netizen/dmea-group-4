import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import AddInsight from './pages/AddInsight';
import Report from './pages/Report';
import PersonaGenerator from './pages/PersonaGenerator';
import Personas from './pages/Personas';
import Login from './pages/Login';
import AdminPanel from './pages/AdminPanel';
import SEO from './pages/SEO';
import SEOAudit from './pages/SEOAudit';
import SEOKeywords from './pages/SEOKeywords';
import SEOContent from './pages/SEOContent';
import SEOStrategy from './pages/SEOStrategy';
import SocialMedia from './pages/SocialMedia';
import Analytics from './pages/Analytics';
import Presentation from './pages/Presentation';
import FinalCapstone from './pages/FinalCapstone';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route - Login (No Layout) */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes - Dashboard (All Users) */}
        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        
        {/* Add Insight - All Users */}
        <Route path="/add-insight" element={
          <ProtectedRoute>
            <AddInsight />
          </ProtectedRoute>
        } />
        
        {/* Buyer Persona Module - Admin Only + buyer_research flag */}
        <Route path="/report" element={
          <ProtectedRoute adminOnly={true} requiredFeature="buyer_research">
            <Report />
          </ProtectedRoute>
        } />
        
        <Route path="/persona-generator" element={
          <ProtectedRoute adminOnly={true} requiredFeature="buyer_research">
            <PersonaGenerator />
          </ProtectedRoute>
        } />
        
        <Route path="/personas" element={
          <ProtectedRoute adminOnly={true} requiredFeature="buyer_research">
            <Personas />
          </ProtectedRoute>
        } />
        
        {/* SEO & Content Module - Admin Only + seo_content flag */}
        <Route path="/seo" element={
          <ProtectedRoute adminOnly={true} requiredFeature="seo_content">
            <SEO />
          </ProtectedRoute>
        } />
        <Route path="/seo/audit" element={
          <ProtectedRoute adminOnly={true} requiredFeature="seo_content">
            <SEOAudit />
          </ProtectedRoute>
        } />
        <Route path="/seo/keywords" element={
          <ProtectedRoute adminOnly={true} requiredFeature="seo_content">
            <SEOKeywords />
          </ProtectedRoute>
        } />
        <Route path="/seo/content" element={
          <ProtectedRoute adminOnly={true} requiredFeature="seo_content">
            <SEOContent />
          </ProtectedRoute>
        } />
        <Route path="/seo/strategy" element={
          <ProtectedRoute adminOnly={true} requiredFeature="seo_content">
            <SEOStrategy />
          </ProtectedRoute>
        } />
        
        {/* Social Media Module - Admin Only + social_media flag */}
        <Route path="/social/library" element={
          <ProtectedRoute adminOnly={true} requiredFeature="social_media">
            <SocialMedia />
          </ProtectedRoute>
        } />
        
        {/* Analytics Module - Admin Only + analytics flag */}
        <Route path="/analytics/traffic" element={
          <ProtectedRoute adminOnly={true} requiredFeature="analytics">
            <Analytics />
          </ProtectedRoute>
        } />
        
        {/* Presentation Module - Admin Only + presentation flag */}
        <Route path="/presentation/drafts" element={
          <ProtectedRoute adminOnly={true} requiredFeature="presentation">
            <Presentation />
          </ProtectedRoute>
        } />
        
        {/* Final Capstone Module - Admin Only + final_capstone flag */}
        <Route path="/final/report" element={
          <ProtectedRoute adminOnly={true} requiredFeature="final_capstone">
            <FinalCapstone />
          </ProtectedRoute>
        } />
        
        {/* Admin Panel - SuperAdmin Only */}
        <Route path="/admin" element={
          <ProtectedRoute superAdminOnly={true}>
            <AdminPanel />
          </ProtectedRoute>
        } />
        
        {/* Catch all - redirect to home or login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
