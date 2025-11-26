import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import AddInsight from './pages/AddInsight';
import Report from './pages/Report';
import PersonaGenerator from './pages/PersonaGenerator';
import Personas from './pages/Personas';
import ManageInsights from './pages/ManageInsights';
import DailyReflections from './pages/DailyReflections';
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
import PresentationsHome from './pages/presentations/PresentationsHome';
import FriendlyBrief from './pages/presentations/FriendlyBrief';
import ClusteringTechnical from './pages/presentations/ClusteringTechnical';
import SharedFolder from './pages/SharedFolder';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route - Login (No Layout) */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes with Layout */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <Home />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Add Insight - All Users */}
        <Route path="/add-insight" element={
          <ProtectedRoute>
            <Layout>
              <AddInsight />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Buyer Persona Module - Check permissions */}
        <Route path="/report" element={
          <ProtectedRoute adminOnly={true} requiredFeature="buyer_research" requiredModule="buyer_persona" requiredTab="report">
            <Layout>
              <Report />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/persona-generator" element={
          <ProtectedRoute adminOnly={true} requiredFeature="buyer_research" requiredModule="buyer_persona" requiredTab="persona_generator">
            <Layout>
              <PersonaGenerator />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/personas" element={
          <ProtectedRoute adminOnly={true} requiredFeature="buyer_research" requiredModule="buyer_persona" requiredTab="personas">
            <Layout>
              <Personas />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/manage-insights" element={
          <ProtectedRoute adminOnly={true} requiredModule="buyer_persona" requiredTab="manage_insights">
            <Layout>
              <ManageInsights />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Daily Reflections Module - Available to all authenticated users (private per user) */}
        <Route path="/daily-reflections" element={
          <ProtectedRoute>
            <Layout>
              <DailyReflections />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Presentations Module - Admin Only (No feature flag needed) */}
        <Route path="/presentations" element={
          <ProtectedRoute adminOnly={true}>
            <Layout>
              <PresentationsHome />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/presentations/friendly-brief" element={
          <ProtectedRoute adminOnly={true}>
            <Layout>
              <FriendlyBrief />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/presentations/clustering-technical" element={
          <ProtectedRoute adminOnly={true}>
            <Layout>
              <ClusteringTechnical />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* SEO & Content Module - Admin Only + seo_content flag */}
        <Route path="/seo" element={
          <ProtectedRoute adminOnly={true} requiredFeature="seo_content">
            <Layout>
              <SEO />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/seo/audit" element={
          <ProtectedRoute adminOnly={true} requiredFeature="seo_content">
            <Layout>
              <SEOAudit />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/seo/keywords" element={
          <ProtectedRoute adminOnly={true} requiredFeature="seo_content">
            <Layout>
              <SEOKeywords />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/seo/content" element={
          <ProtectedRoute adminOnly={true} requiredFeature="seo_content">
            <Layout>
              <SEOContent />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/seo/strategy" element={
          <ProtectedRoute adminOnly={true} requiredFeature="seo_content">
            <Layout>
              <SEOStrategy />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Social Media Module - Admin Only + social_media flag */}
        <Route path="/social/library" element={
          <ProtectedRoute adminOnly={true} requiredFeature="social_media">
            <Layout>
              <SocialMedia />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Analytics Module - Admin Only + analytics flag */}
        <Route path="/analytics/traffic" element={
          <ProtectedRoute adminOnly={true} requiredFeature="analytics">
            <Layout>
              <Analytics />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Presentation Module - Admin Only + presentation flag */}
        <Route path="/presentation/drafts" element={
          <ProtectedRoute adminOnly={true} requiredFeature="presentation">
            <Layout>
              <Presentation />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Final Capstone Module - Admin Only + final_capstone flag */}
        <Route path="/final/report" element={
          <ProtectedRoute adminOnly={true} requiredFeature="final_capstone">
            <Layout>
              <FinalCapstone />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Admin Panel - SuperAdmin Only */}
        <Route path="/admin" element={
          <ProtectedRoute superAdminOnly={true}>
            <Layout>
              <AdminPanel />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Catch all - redirect to home or login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
