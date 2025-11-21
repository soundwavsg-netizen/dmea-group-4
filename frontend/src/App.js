import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AddInsight from './pages/AddInsight';
import Report from './pages/Report';
import PersonaGenerator from './pages/PersonaGenerator';
import Personas from './pages/Personas';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add-insight" element={<AddInsight />} />
        <Route path="/report" element={<Report />} />
        <Route path="/persona-generator" element={<PersonaGenerator />} />
        <Route path="/personas" element={<Personas />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
