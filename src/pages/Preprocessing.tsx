import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, BarChart, CheckSquare, AlertTriangle, FileText } from 'lucide-react';

const Preprocessing: React.FC = () => {
  const [datasets, setDatasets] = useState([
    { 
      id: 1, 
      name: 'Customer Support Dataset', 
      status: 'processed',
      stats: {
        originalSize: 8540,
        currentSize: 8102,
        duplicates: 438,
        outliers: 124,
        missingValues: 218
      }
    },
    { 
      id: 2, 
      name: 'Product Reviews', 
      status: 'processing',
      stats: {
        originalSize: 4200,
        currentSize: 3850,
        duplicates: 350,
        outliers: 78,
        missingValues: 145
      }
    },
    { 
      id: 3, 
      name: 'Medical Transcripts', 
      status: 'pending',
      stats: {
        originalSize: 1250,
        currentSize: 1250,
        duplicates: 0,
        outliers: 0,
        missingValues: 0
      }
    }
  ]);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Data Preprocessing</h1>
        <div className="flex space-x-3">
          <button className="btn-outline">
            <FileText className="h-4 w-4 mr-2" />
            Dataset Report
          </button>
          <button className="btn-primary">
            <Filter className="h-4 w-4 mr-2" />
            Process New Dataset
          </button>
        </div>
      </div>
      
      {/* Preprocessing options */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div 
          className="card border border-border"
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
              <Filter className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-medium">Cleaning Options</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center">
              <input type="checkbox" id="remove_duplicates" className="mr-2" defaultChecked />
              <label htmlFor="remove_duplicates">Remove duplicates</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="handle_missing" className="mr-2" defaultChecked />
              <label htmlFor="handle_missing">Handle missing values</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="remove_outliers" className="mr-2" />
              <label htmlFor="remove_outliers">Remove outliers</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="normalize_text" className="mr-2" defaultChecked />
              <label htmlFor="normalize_text">Normalize text</label>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="card border border-border"
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center mr-3">
              <BarChart className="h-5 w-5 text-secondary" />
            </div>
            <h3 className="text-lg font-medium">Processing Settings</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label htmlFor="chunk_size" className="block text-sm mb-1">Chunk Size</label>
              <select id="chunk_size" className="input w-full">
                <option>512 tokens</option>
                <option>1024 tokens</option>
                <option>2048 tokens</option>
                <option>4096 tokens</option>
              </select>
            </div>
            <div>
              <label htmlFor="overlap" className="block text-sm mb-1">Chunk Overlap</label>
              <select id="overlap" className="input w-full">
                <option>No overlap</option>
                <option>10% overlap</option>
                <option>20% overlap</option>
                <option>50% overlap</option>
              </select>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="card border border-border"
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mr-3">
              <CheckSquare className="h-5 w-5 text-accent" />
            </div>
            <h3 className="text-lg font-medium">Quality Checks</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center">
              <input type="checkbox" id="length_filter" className="mr-2" defaultChecked />
              <label htmlFor="length_filter">Filter by length (discard short samples)</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="quality_score" className="mr-2" defaultChecked />
              <label htmlFor="quality_score">Apply quality scoring</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="profanity_filter" className="mr-2" />
              <label htmlFor="profanity_filter">Apply profanity filter</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="tokenization_check" className="mr-2" defaultChecked />
              <label htmlFor="tokenization_check">Tokenization validation</label>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Dataset processing cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Processing Progress</h2>
        
        {datasets.map((dataset) => (
          <div key={dataset.id} className="card border border-border">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-4 lg:mb-0">
                <div className="flex items-center">
                  <h3 className="text-lg font-medium mr-3">{dataset.name}</h3>
                  {dataset.status === 'processed' && (
                    <span className="badge badge-success">Processed</span>
                  )}
                  {dataset.status === 'processing' && (
                    <span className="badge badge-primary">Processing</span>
                  )}
                  {dataset.status === 'pending' && (
                    <span className="badge badge-secondary">Pending</span>
                  )}
                </div>
                
                {dataset.status === 'processed' && (
                  <div className="mt-2 text-sm text-text-secondary">
                    <p>Original: {dataset.stats.originalSize.toLocaleString()} records • Processed: {dataset.stats.currentSize.toLocaleString()} records</p>
                  </div>
                )}
                
                {dataset.status === 'processing' && (
                  <div className="mt-3 w-full bg-background-light rounded-full h-2 mb-1">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-500 ease-out" 
                      style={{ width: '65%' }}
                    ></div>
                  </div>
                )}
              </div>
              
              {dataset.status === 'processed' && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-text-secondary">Duplicates Removed</p>
                    <p className="text-xl font-semibold">{dataset.stats.duplicates}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-text-secondary">Outliers</p>
                    <p className="text-xl font-semibold">{dataset.stats.outliers}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-text-secondary">Missing Values</p>
                    <p className="text-xl font-semibold">{dataset.stats.missingValues}</p>
                  </div>
                </div>
              )}
              
              <div className="flex mt-4 lg:mt-0">
                {dataset.status === 'processed' && (
                  <>
                    <button className="btn-outline mr-2">View Report</button>
                    <button className="btn-primary">Use for Fine-tuning</button>
                  </>
                )}
                {dataset.status === 'processing' && (
                  <button className="btn-outline text-warning">Cancel</button>
                )}
                {dataset.status === 'pending' && (
                  <button className="btn-primary">Start Processing</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Alerts */}
      <div className="card border-l-4 border-l-warning bg-warning/5">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-warning mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-medium">Processing Tips</h3>
            <p className="text-text-secondary">
              For optimal fine-tuning results, ensure your data is properly cleaned and normalized. 
              Consider using a higher chunk overlap for complex texts to maintain context across chunks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preprocessing;