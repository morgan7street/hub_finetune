import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DataIngestion from './pages/DataIngestion';
import Preprocessing from './pages/Preprocessing';
import FineTuning from './pages/FineTuning';
import ModelEvaluation from './pages/ModelEvaluation';
import InferenceTest from './pages/InferenceTest';
import Settings from './pages/Settings';

function App() {
  return (
    <ThemeProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/data" element={<DataIngestion />} />
          <Route path="/preprocessing" element={<Preprocessing />} />
          <Route path="/finetuning" element={<FineTuning />} />
          <Route path="/evaluation" element={<ModelEvaluation />} />
          <Route path="/inference" element={<InferenceTest />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </ThemeProvider>
  );
}

export default App;