import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Folder, Database, FileText, File, X, AlertCircle, CheckCircle } from 'lucide-react';

const DataIngestion: React.FC = () => {
  const [dragging, setDragging] = useState(false);
  const [datasets, setDatasets] = useState([
    { id: 1, name: 'Customer Support Dataset', format: 'CSV', size: '14.2 MB', records: 8540, date: '2023-10-15' },
    { id: 2, name: 'Product Reviews', format: 'JSON', size: '8.7 MB', records: 4200, date: '2023-11-02' },
    { id: 3, name: 'Medical Transcripts', format: 'TXT', size: '22.1 MB', records: 1250, date: '2023-12-18' }
  ]);
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };
  
  const handleDragLeave = () => {
    setDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    // Add logic to handle dropped files
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Data Ingestion</h1>
        <div className="flex space-x-3">
          <select className="input text-sm">
            <option>All Data Sources</option>
            <option>CSV</option>
            <option>JSON</option>
            <option>TXT</option>
            <option>Database</option>
          </select>
          <button className="btn-primary">
            <Database className="h-4 w-4 mr-2" />
            Connect Database
          </button>
        </div>
      </div>
      
      {/* Upload area */}
      <motion.div 
        className={`border-2 border-dashed rounded-xl p-8 text-center ${
          dragging ? 'border-primary bg-primary/5' : 'border-border'
        } transition-colors duration-200`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        whileHover={{ scale: 1.01 }}
      >
        <div className="flex flex-col items-center">
          <div className="p-4 bg-background rounded-full mb-4">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-medium mb-2">Upload your data files</h3>
          <p className="text-text-secondary mb-4 max-w-md">
            Drag and drop files, or click to select. We support CSV, JSON, TXT, and Excel files.
          </p>
          <button className="btn-outline">
            <Folder className="h-4 w-4 mr-2" />
            Browse Files
          </button>
        </div>
      </motion.div>
      
      {/* Validation messages */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center bg-error/10 text-error rounded-lg p-3">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>Some datasets may contain inconsistent formatting. Automatic cleaning recommended.</span>
        </div>
        <div className="flex items-center bg-success/10 text-success rounded-lg p-3">
          <CheckCircle className="h-5 w-5 mr-2" />
          <span>GPU acceleration detected. Processing will be optimized for your hardware.</span>
        </div>
      </div>
      
      {/* Dataset list */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Your Datasets</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Format</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Size</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Records</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Uploaded</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {datasets.map((dataset) => (
                <motion.tr 
                  key={dataset.id} 
                  className="hover:bg-background-light transition-colors"
                  whileHover={{ backgroundColor: 'rgba(var(--color-background) / 0.5)' }}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      {dataset.format === 'CSV' && <FileText className="h-4 w-4 text-green-500 mr-2" />}
                      {dataset.format === 'JSON' && <File className="h-4 w-4 text-blue-500 mr-2" />}
                      {dataset.format === 'TXT' && <File className="h-4 w-4 text-gray-500 mr-2" />}
                      {dataset.name}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="badge-primary">{dataset.format}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{dataset.size}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{dataset.records.toLocaleString()}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-text-secondary text-sm">{dataset.date}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-primary hover:text-primary-light mr-3 transition-colors">Preview</button>
                    <button className="text-primary hover:text-primary-light mr-3 transition-colors">Process</button>
                    <button className="text-error hover:text-opacity-80 transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DataIngestion;