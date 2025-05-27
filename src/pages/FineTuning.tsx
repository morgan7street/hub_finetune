import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Settings, HardDrive, MemoryStick as Memory, Play, Pause, FileDown, Zap, BatteryCharging } from 'lucide-react';
import { UnslothService, UnslothFineTuningParams } from '../services/UnslothService';
// Suppression des imports non utilisés
// import TrainingMetricsChart from '../components/TrainingMetricsChart';

const FineTuning: React.FC = () => {
  const [activeTab, setActiveTab] = useState('new');
  const [unslothEnabled, setUnslothEnabled] = useState(true);

  // Example hardware stats
  const hardwareStats = {
    gpu: 'NVIDIA RTX 3080',
    vram: '10 GB',
    vramUsage: 76,
    cpuUsage: 42,
    memoryUsage: 68,
    diskUsage: 35
  };

  // Example models
  const baseModels = [
    { id: 1, name: 'LLaMa 2 (7B)', description: 'Open foundation LLM for general use cases', size: '7B parameters', format: 'GGUF' },
    { id: 2, name: 'Mistral (7B)', description: 'High-performance open model with strong reasoning', size: '7B parameters', format: 'GGUF' },
    { id: 3, name: 'OLMo (7B)', description: 'AI2\'s open language model', size: '7B parameters', format: 'GGUF' },
    { id: 4, name: 'Phi-2 (2.7B)', description: 'Microsoft\'s small language model with good performance', size: '2.7B parameters', format: 'GGUF' }
  ];

  // Training hyperparameters
  const hyperparameters = [
    { name: 'Learning Rate', value: '2e-5', options: ['1e-5', '2e-5', '5e-5', '1e-4'] },
    { name: 'Batch Size', value: '16', options: ['4', '8', '16', '32'] },
    { name: 'Epochs', value: '3', options: ['1', '2', '3', '5', '10'] },
    { name: 'Weight Decay', value: '0.1', options: ['0.01', '0.05', '0.1', '0.2'] },
    { name: 'Warmup Steps', value: '500', options: ['100', '200', '500', '1000'] },
    { name: 'Gradient Accumulation', value: '4', options: ['1', '2', '4', '8'] }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Fine-tuning</h1>

        <div className="flex space-x-2">
          <button
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'new' ? 'bg-primary text-white' : 'bg-surface text-text-secondary'
            }`}
            onClick={() => setActiveTab('new')}
          >
            New Job
          </button>
          <button
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'running' ? 'bg-primary text-white' : 'bg-surface text-text-secondary'
            }`}
            onClick={() => setActiveTab('running')}
          >
            Running Jobs
          </button>
        </div>
      </div>

      {/* Unsloth acceleration toggle */}
      <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border">
        <div className="flex items-center">
          <div className="p-2 bg-primary/10 rounded-lg mr-3">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">Unsloth Acceleration</h3>
            <p className="text-sm text-text-secondary">Enable Unsloth optimization for faster training</p>
          </div>
        </div>
        <div className="relative inline-block w-12 align-middle select-none">
          <input
            type="checkbox"
            id="unsloth-toggle"
            className="sr-only"
            checked={unslothEnabled}
            onChange={() => setUnslothEnabled(!unslothEnabled)}
          />
          <div className={`block h-6 rounded-full transition ${unslothEnabled ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
          <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${unslothEnabled ? 'transform translate-x-6' : ''}`}></div>
        </div>
      </div>

      {activeTab === 'new' && (
        <div className="space-y-6">
          {/* Hardware Stats */}
          <div className="glass-card">
            <h2 className="text-xl font-semibold mb-4">Hardware Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center mb-2">
                  <HardDrive className="h-5 w-5 text-accent mr-2" />
                  <span className="text-sm font-medium">GPU</span>
                </div>
                <div className="flex items-center">
                  <div className="w-full bg-background-light rounded-full h-2.5 mr-3">
                    <div
                      className="bg-accent h-2.5 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${hardwareStats.vramUsage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm whitespace-nowrap">{hardwareStats.vramUsage}% of {hardwareStats.vram}</span>
                </div>
                <p className="text-text-secondary text-sm mt-1">{hardwareStats.gpu}</p>
              </div>

              <div>
                <div className="flex items-center mb-2">
                  <Cpu className="h-5 w-5 text-primary mr-2" />
                  <span className="text-sm font-medium">CPU Usage</span>
                </div>
                <div className="flex items-center">
                  <div className="w-full bg-background-light rounded-full h-2.5 mr-3">
                    <div
                      className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${hardwareStats.cpuUsage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm">{hardwareStats.cpuUsage}%</span>
                </div>
              </div>

              <div>
                <div className="flex items-center mb-2">
                  <Memory className="h-5 w-5 text-secondary mr-2" />
                  <span className="text-sm font-medium">RAM Usage</span>
                </div>
                <div className="flex items-center">
                  <div className="w-full bg-background-light rounded-full h-2.5 mr-3">
                    <div
                      className="bg-secondary h-2.5 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${hardwareStats.memoryUsage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm">{hardwareStats.memoryUsage}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Model Selection */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Select Base Model</h2>
              <button className="btn-outline text-sm">
                <FileDown className="h-4 w-4 mr-1" />
                Import Custom
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {baseModels.map((model) => (
                <motion.div
                  key={model.id}
                  className="border border-border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors"
                  whileHover={{ y: -3 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <h3 className="font-medium">{model.name}</h3>
                  <p className="text-text-secondary text-sm mt-1">{model.description}</p>
                  <div className="flex justify-between mt-2 text-sm">
                    <span className="text-text-secondary">{model.size}</span>
                    <span className="badge-primary">{model.format}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Training Configuration */}
          <div className="card">
            <div className="flex items-center mb-4">
              <Settings className="h-5 w-5 text-primary mr-2" />
              <h2 className="text-xl font-semibold">Configuration d'entraînement</h2>
            </div>

            {/* Unsloth Acceleration Toggle */}
            <div className="mb-6 p-3 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Zap className="h-5 w-5 text-primary mr-2" />
                  <div>
                    <h3 className="font-medium">Accélération Unsloth</h3>
                    <p className="text-sm text-text-secondary">Optimise le fine-tuning pour être jusqu'à 3x plus rapide et utiliser 60% moins de mémoire</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={unslothEnabled}
                    onChange={() => setUnslothEnabled(!unslothEnabled)}
                  />
                  <div className="w-11 h-6 bg-background-light peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Job Name</label>
              <input
                type="text"
                className="input w-full"
                placeholder="My Fine-tuned Model"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Training Dataset</label>
              <select className="input w-full">
                <option>Customer Support Dataset (Processed)</option>
                <option>Product Reviews (Processed)</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Validation Dataset (Optional)</label>
              <select className="input w-full">
                <option>None</option>
                <option>Customer Support Validation Set</option>
              </select>
            </div>

            <h3 className="font-medium mt-6 mb-4">Hyperparameters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hyperparameters.map((param) => (
                <div key={param.name}>
                  <label className="block text-sm font-medium mb-1">{param.name}</label>
                  <select className="input w-full" defaultValue={param.value}>
                    {param.options.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button className="btn-outline mr-3">Sauvegarder la configuration</button>
              <button className="btn-primary">
                <Play className="h-4 w-4 mr-2" />
                {unslothEnabled ? 'Démarrer le fine-tuning avec Unsloth' : 'Démarrer le fine-tuning standard'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'running' && (
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Active Fine-tuning Jobs</h2>

            <div className="space-y-4">
              <div className="border border-border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Mistral-7B Customer Support</h3>
                    <div className="flex items-center mt-1">
                      <span className="inline-block w-2 h-2 bg-success rounded-full mr-2 animate-pulse"></span>
                      <span className="text-sm text-text-secondary">Running - Epoch 2/3</span>
                    </div>
                  </div>
                  <button className="btn-outline text-warning text-sm">
                    <Pause className="h-4 w-4 mr-1" />
                    Pause
                  </button>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>65% (2h 10m remaining)</span>
                  </div>
                  <div className="w-full bg-background-light rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: '65%' }}
                    ></div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-text-secondary">Training Loss:</span>
                    <span className="ml-2">0.1832</span>
                  </div>
                  <div>
                    <span className="text-text-secondary">Learning Rate:</span>
                    <span className="ml-2">2e-5</span>
                  </div>
                  <div>
                    <span className="text-text-secondary">Batch Size:</span>
                    <span className="ml-2">16</span>
                  </div>
                  <div>
                    <span className="text-text-secondary">GPU Utilization:</span>
                    <span className="ml-2">95%</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border flex justify-between">
                  <button className="text-primary text-sm">View Details</button>
                  <div className="flex space-x-2">
                    <button className="text-text-secondary text-sm hover:text-text transition-colors">Logs</button>
                    <button className="text-text-secondary text-sm hover:text-text transition-colors">Configuration</button>
                  </div>
                </div>
              </div>

              <div className="border border-border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Phi-2 Product Reviews</h3>
                    <div className="flex items-center mt-1">
                      <span className="inline-block w-2 h-2 bg-warning rounded-full mr-2"></span>
                      <span className="text-sm text-text-secondary">Paused - Epoch 1/5</span>
                    </div>
                  </div>
                  <button className="btn-outline text-success text-sm">
                    <Play className="h-4 w-4 mr-1" />
                    Resume
                  </button>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>22% (4h 45m remaining)</span>
                  </div>
                  <div className="w-full bg-background-light rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: '22%' }}
                    ></div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-text-secondary">Training Loss:</span>
                    <span className="ml-2">0.2453</span>
                  </div>
                  <div>
                    <span className="text-text-secondary">Learning Rate:</span>
                    <span className="ml-2">5e-5</span>
                  </div>
                  <div>
                    <span className="text-text-secondary">Batch Size:</span>
                    <span className="ml-2">8</span>
                  </div>
                  <div>
                    <span className="text-text-secondary">GPU Utilization:</span>
                    <span className="ml-2">0% (Paused)</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border flex justify-between">
                  <button className="text-primary text-sm">View Details</button>
                  <div className="flex space-x-2">
                    <button className="text-text-secondary text-sm hover:text-text transition-colors">Logs</button>
                    <button className="text-text-secondary text-sm hover:text-text transition-colors">Configuration</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-background/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">System Monitoring</h2>
                <span className="badge-success">Auto-scaling enabled</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-3">Resource Utilization</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>GPU (VRAM)</span>
                        <span>{hardwareStats.vramUsage}%</span>
                      </div>
                      <div className="w-full bg-background-light rounded-full h-2">
                        <div
                          className="bg-accent h-2 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${hardwareStats.vramUsage}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>CPU</span>
                        <span>{hardwareStats.cpuUsage}%</span>
                      </div>
                      <div className="w-full bg-background-light rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${hardwareStats.cpuUsage}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Memory</span>
                        <span>{hardwareStats.memoryUsage}%</span>
                      </div>
                      <div className="w-full bg-background-light rounded-full h-2">
                        <div
                          className="bg-secondary h-2 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${hardwareStats.memoryUsage}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Disk I/O</span>
                        <span>{hardwareStats.diskUsage}%</span>
                      </div>
                      <div className="w-full bg-background-light rounded-full h-2">
                        <div
                          className="bg-warning h-2 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${hardwareStats.diskUsage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">System Alerts</h3>
                  <div className="space-y-2">
                    <div className="flex items-center p-2 bg-success/10 text-success rounded">
                      <BatteryCharging className="h-4 w-4 mr-2" />
                      <span className="text-sm">GPU optimization enabled - using FP16 precision</span>
                    </div>
                    <div className="flex items-center p-2 bg-primary/10 text-primary rounded">
                      <Memory className="h-4 w-4 mr-2" />
                      <span className="text-sm">Gradient checkpointing active - reducing memory usage</span>
                    </div>
                    <div className="flex items-center p-2 bg-warning/10 text-warning rounded">
                      <Cpu className="h-4 w-4 mr-2" />
                      <span className="text-sm">CPU temperature: 72°C - consider improving cooling</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button className="btn-outline w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      System Optimization Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FineTuning;