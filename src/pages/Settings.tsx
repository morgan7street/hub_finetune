import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Save, HardDrive, Cpu, MemoryStick as Memory, Database, Download, Cloud, Lock, Shield, User, Palette } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('general');
  
  const [settings, setSettings] = useState({
    hardware: {
      enableGPUAcceleration: true,
      allowMultiGPU: false,
      maxMemoryUsage: 80,
      diskCache: true,
      lowPrecision: true
    },
    models: {
      defaultExportFormat: 'gguf',
      enableQuantization: true,
      pruneModelWeights: false,
      saveCheckpoints: true,
      checkpointInterval: 30
    },
    appearance: {
      animationsEnabled: true,
      compactMode: false,
      showSystemAlerts: true,
      showMetricsOnDashboard: true
    }
  });
  
  const updateSetting = (category: keyof typeof settings, setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Tabs */}
        <div className="bg-surface rounded-xl border border-border p-4">
          <nav className="space-y-1">
            <button 
              className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'general' ? 'bg-primary text-white' : 'hover:bg-background-light text-text-secondary'
              }`}
              onClick={() => setActiveTab('general')}
            >
              <SettingsIcon className="h-4 w-4 mr-3" />
              <span>General</span>
            </button>
            
            <button 
              className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'hardware' ? 'bg-primary text-white' : 'hover:bg-background-light text-text-secondary'
              }`}
              onClick={() => setActiveTab('hardware')}
            >
              <Cpu className="h-4 w-4 mr-3" />
              <span>Hardware</span>
            </button>
            
            <button 
              className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'models' ? 'bg-primary text-white' : 'hover:bg-background-light text-text-secondary'
              }`}
              onClick={() => setActiveTab('models')}
            >
              <Database className="h-4 w-4 mr-3" />
              <span>Models</span>
            </button>
            
            <button 
              className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'appearance' ? 'bg-primary text-white' : 'hover:bg-background-light text-text-secondary'
              }`}
              onClick={() => setActiveTab('appearance')}
            >
              <Palette className="h-4 w-4 mr-3" />
              <span>Appearance</span>
            </button>
            
            <button 
              className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'storage' ? 'bg-primary text-white' : 'hover:bg-background-light text-text-secondary'
              }`}
              onClick={() => setActiveTab('storage')}
            >
              <HardDrive className="h-4 w-4 mr-3" />
              <span>Storage</span>
            </button>
            
            <button 
              className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                activeTab === 'account' ? 'bg-primary text-white' : 'hover:bg-background-light text-text-secondary'
              }`}
              onClick={() => setActiveTab('account')}
            >
              <User className="h-4 w-4 mr-3" />
              <span>Account</span>
            </button>
          </nav>
        </div>
        
        {/* Content */}
        <div className="md:col-span-4">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="card border border-border h-full"
          >
            {activeTab === 'general' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">General Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-3">Theme</h3>
                    <div className="flex items-center space-x-4">
                      <button 
                        className={`px-4 py-2 rounded-lg border ${
                          theme === 'light' ? 'border-primary text-primary' : 'border-border'
                        }`}
                        onClick={() => theme !== 'light' && toggleTheme()}
                      >
                        Light
                      </button>
                      <button 
                        className={`px-4 py-2 rounded-lg border ${
                          theme === 'dark' ? 'border-primary text-primary' : 'border-border'
                        }`}
                        onClick={() => theme !== 'dark' && toggleTheme()}
                      >
                        Dark
                      </button>
                      <button className="px-4 py-2 rounded-lg border border-border text-text-secondary">
                        System
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Application</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label htmlFor="auto-update" className="flex items-center cursor-pointer">
                          <span>Auto-update application</span>
                        </label>
                        <div className="relative inline-block w-10 align-middle select-none">
                          <input 
                            type="checkbox" 
                            id="auto-update" 
                            className="sr-only"
                            defaultChecked 
                          />
                          <div className="block h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                          <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label htmlFor="telemetry" className="flex items-center cursor-pointer">
                          <span>Send anonymous usage data</span>
                        </label>
                        <div className="relative inline-block w-10 align-middle select-none">
                          <input 
                            type="checkbox" 
                            id="telemetry" 
                            className="sr-only"
                            defaultChecked 
                          />
                          <div className="block h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                          <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label htmlFor="start-on-boot" className="flex items-center cursor-pointer">
                          <span>Start on system boot</span>
                        </label>
                        <div className="relative inline-block w-10 align-middle select-none">
                          <input 
                            type="checkbox" 
                            id="start-on-boot" 
                            className="sr-only" 
                          />
                          <div className="block h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                          <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Language</h3>
                    <select className="input w-full max-w-xs">
                      <option>English</option>
                      <option>Français</option>
                      <option>Español</option>
                      <option>Deutsch</option>
                      <option>简体中文</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'hardware' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Hardware Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-3">GPU Settings</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label htmlFor="gpu-acceleration" className="flex items-center cursor-pointer">
                          <span>Enable GPU acceleration</span>
                        </label>
                        <div className="relative inline-block w-10 align-middle select-none">
                          <input 
                            type="checkbox" 
                            id="gpu-acceleration" 
                            className="sr-only"
                            checked={settings.hardware.enableGPUAcceleration}
                            onChange={(e) => updateSetting('hardware', 'enableGPUAcceleration', e.target.checked)}
                          />
                          <div className="block h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                          <div className={`dot absolute top-1 bg-white w-4 h-4 rounded-full transition-all ${
                            settings.hardware.enableGPUAcceleration ? 'left-5' : 'left-1'
                          }`}></div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label htmlFor="multi-gpu" className="flex items-center cursor-pointer">
                          <span>Allow multi-GPU processing</span>
                        </label>
                        <div className="relative inline-block w-10 align-middle select-none">
                          <input 
                            type="checkbox" 
                            id="multi-gpu" 
                            className="sr-only"
                            checked={settings.hardware.allowMultiGPU}
                            onChange={(e) => updateSetting('hardware', 'allowMultiGPU', e.target.checked)}
                            disabled={!settings.hardware.enableGPUAcceleration}
                          />
                          <div className={`block h-6 rounded-full ${
                            settings.hardware.enableGPUAcceleration ? 'bg-gray-300 dark:bg-gray-600' : 'bg-gray-200 dark:bg-gray-700'
                          }`}></div>
                          <div className={`dot absolute top-1 bg-white w-4 h-4 rounded-full transition-all ${
                            settings.hardware.allowMultiGPU ? 'left-5' : 'left-1'
                          } ${!settings.hardware.enableGPUAcceleration && 'opacity-50'}`}></div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label htmlFor="low-precision" className="flex items-center cursor-pointer">
                          <span>Use low precision (FP16) for inference</span>
                        </label>
                        <div className="relative inline-block w-10 align-middle select-none">
                          <input 
                            type="checkbox" 
                            id="low-precision" 
                            className="sr-only"
                            checked={settings.hardware.lowPrecision}
                            onChange={(e) => updateSetting('hardware', 'lowPrecision', e.target.checked)}
                          />
                          <div className="block h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                          <div className={`dot absolute top-1 bg-white w-4 h-4 rounded-full transition-all ${
                            settings.hardware.lowPrecision ? 'left-5' : 'left-1'
                          }`}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Memory Usage</h3>
                    <label className="block text-sm text-text-secondary mb-2">
                      Maximum memory usage: {settings.hardware.maxMemoryUsage}%
                    </label>
                    <input
                      type="range"
                      min="20"
                      max="95"
                      value={settings.hardware.maxMemoryUsage}
                      onChange={(e) => updateSetting('hardware', 'maxMemoryUsage', parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-text-secondary mt-1">
                      <span>Conservative (20%)</span>
                      <span>Balanced (50%)</span>
                      <span>Aggressive (95%)</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Storage</h3>
                    <div className="flex items-center justify-between">
                      <label htmlFor="disk-cache" className="flex items-center cursor-pointer">
                        <span>Enable disk cache for large models</span>
                      </label>
                      <div className="relative inline-block w-10 align-middle select-none">
                        <input 
                          type="checkbox" 
                          id="disk-cache" 
                          className="sr-only"
                          checked={settings.hardware.diskCache}
                          onChange={(e) => updateSetting('hardware', 'diskCache', e.target.checked)}
                        />
                        <div className="block h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                        <div className={`dot absolute top-1 bg-white w-4 h-4 rounded-full transition-all ${
                          settings.hardware.diskCache ? 'left-5' : 'left-1'
                        }`}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'models' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Model Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-3">Export Settings</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm mb-2">Default Export Format</label>
                        <select 
                          className="input w-full max-w-xs"
                          value={settings.models.defaultExportFormat}
                          onChange={(e) => updateSetting('models', 'defaultExportFormat', e.target.value)}
                        >
                          <option value="gguf">GGUF (Recommended)</option>
                          <option value="ggml">GGML (Legacy)</option>
                          <option value="pytorch">PyTorch</option>
                          <option value="safetensors">SafeTensors</option>
                        </select>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label htmlFor="enable-quantization" className="flex items-center cursor-pointer">
                          <span>Enable quantization during export</span>
                        </label>
                        <div className="relative inline-block w-10 align-middle select-none">
                          <input 
                            type="checkbox" 
                            id="enable-quantization" 
                            className="sr-only"
                            checked={settings.models.enableQuantization}
                            onChange={(e) => updateSetting('models', 'enableQuantization', e.target.checked)}
                          />
                          <div className="block h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                          <div className={`dot absolute top-1 bg-white w-4 h-4 rounded-full transition-all ${
                            settings.models.enableQuantization ? 'left-5' : 'left-1'
                          }`}></div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label htmlFor="prune-weights" className="flex items-center cursor-pointer">
                          <span>Prune model weights (reduces size)</span>
                        </label>
                        <div className="relative inline-block w-10 align-middle select-none">
                          <input 
                            type="checkbox" 
                            id="prune-weights" 
                            className="sr-only"
                            checked={settings.models.pruneModelWeights}
                            onChange={(e) => updateSetting('models', 'pruneModelWeights', e.target.checked)}
                          />
                          <div className="block h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                          <div className={`dot absolute top-1 bg-white w-4 h-4 rounded-full transition-all ${
                            settings.models.pruneModelWeights ? 'left-5' : 'left-1'
                          }`}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Checkpoint Settings</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label htmlFor="save-checkpoints" className="flex items-center cursor-pointer">
                          <span>Save training checkpoints</span>
                        </label>
                        <div className="relative inline-block w-10 align-middle select-none">
                          <input 
                            type="checkbox" 
                            id="save-checkpoints" 
                            className="sr-only"
                            checked={settings.models.saveCheckpoints}
                            onChange={(e) => updateSetting('models', 'saveCheckpoints', e.target.checked)}
                          />
                          <div className="block h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                          <div className={`dot absolute top-1 bg-white w-4 h-4 rounded-full transition-all ${
                            settings.models.saveCheckpoints ? 'left-5' : 'left-1'
                          }`}></div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm mb-2">Checkpoint Interval (minutes)</label>
                        <select 
                          className="input w-full max-w-xs"
                          value={settings.models.checkpointInterval}
                          onChange={(e) => updateSetting('models', 'checkpointInterval', parseInt(e.target.value))}
                          disabled={!settings.models.saveCheckpoints}
                        >
                          <option value="5">5 minutes</option>
                          <option value="15">15 minutes</option>
                          <option value="30">30 minutes</option>
                          <option value="60">60 minutes</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'appearance' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Appearance Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-3">Interface</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label htmlFor="animations" className="flex items-center cursor-pointer">
                          <span>Enable animations</span>
                        </label>
                        <div className="relative inline-block w-10 align-middle select-none">
                          <input 
                            type="checkbox" 
                            id="animations" 
                            className="sr-only"
                            checked={settings.appearance.animationsEnabled}
                            onChange={(e) => updateSetting('appearance', 'animationsEnabled', e.target.checked)}
                          />
                          <div className="block h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                          <div className={`dot absolute top-1 bg-white w-4 h-4 rounded-full transition-all ${
                            settings.appearance.animationsEnabled ? 'left-5' : 'left-1'
                          }`}></div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label htmlFor="compact-mode" className="flex items-center cursor-pointer">
                          <span>Compact mode</span>
                        </label>
                        <div className="relative inline-block w-10 align-middle select-none">
                          <input 
                            type="checkbox" 
                            id="compact-mode" 
                            className="sr-only"
                            checked={settings.appearance.compactMode}
                            onChange={(e) => updateSetting('appearance', 'compactMode', e.target.checked)}
                          />
                          <div className="block h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                          <div className={`dot absolute top-1 bg-white w-4 h-4 rounded-full transition-all ${
                            settings.appearance.compactMode ? 'left-5' : 'left-1'
                          }`}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Dashboard</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label htmlFor="show-metrics" className="flex items-center cursor-pointer">
                          <span>Show metrics on dashboard</span>
                        </label>
                        <div className="relative inline-block w-10 align-middle select-none">
                          <input 
                            type="checkbox" 
                            id="show-metrics" 
                            className="sr-only"
                            checked={settings.appearance.showMetricsOnDashboard}
                            onChange={(e) => updateSetting('appearance', 'showMetricsOnDashboard', e.target.checked)}
                          />
                          <div className="block h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                          <div className={`dot absolute top-1 bg-white w-4 h-4 rounded-full transition-all ${
                            settings.appearance.showMetricsOnDashboard ? 'left-5' : 'left-1'
                          }`}></div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <label htmlFor="system-alerts" className="flex items-center cursor-pointer">
                          <span>Show system alerts</span>
                        </label>
                        <div className="relative inline-block w-10 align-middle select-none">
                          <input 
                            type="checkbox" 
                            id="system-alerts" 
                            className="sr-only"
                            checked={settings.appearance.showSystemAlerts}
                            onChange={(e) => updateSetting('appearance', 'showSystemAlerts', e.target.checked)}
                          />
                          <div className="block h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                          <div className={`dot absolute top-1 bg-white w-4 h-4 rounded-full transition-all ${
                            settings.appearance.showSystemAlerts ? 'left-5' : 'left-1'
                          }`}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'storage' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Storage Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <div className="bg-background rounded-lg p-4 mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">Local Storage</h3>
                        <span className="text-sm text-text-secondary">125.4 GB used of 512 GB</span>
                      </div>
                      <div className="w-full bg-background-light rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: '24.5%' }}></div>
                      </div>
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-text-secondary">Models</span>
                          <p>87.3 GB</p>
                        </div>
                        <div>
                          <span className="text-text-secondary">Datasets</span>
                          <p>32.1 GB</p>
                        </div>
                        <div>
                          <span className="text-text-secondary">Checkpoints</span>
                          <p>6.0 GB</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm mb-2">Model Storage Location</label>
                        <div className="flex">
                          <input 
                            type="text" 
                            className="input rounded-r-none flex-1" 
                            value="/home/user/models" 
                            readOnly 
                          />
                          <button className="btn-outline rounded-l-none border-l-0">Browse</button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm mb-2">Dataset Storage Location</label>
                        <div className="flex">
                          <input 
                            type="text" 
                            className="input rounded-r-none flex-1" 
                            value="/home/user/datasets" 
                            readOnly 
                          />
                          <button className="btn-outline rounded-l-none border-l-0">Browse</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Cloud Storage</h3>
                    <div className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-medium">Connect Cloud Storage</h4>
                          <p className="text-sm text-text-secondary mt-1">Backup your models and datasets to the cloud</p>
                        </div>
                        <button className="btn-outline">
                          <Cloud className="h-4 w-4 mr-2" />
                          Connect
                        </button>
                      </div>
                      <div className="text-sm text-text-secondary">
                        <p>Supported providers:</p>
                        <ul className="list-disc list-inside mt-1">
                          <li>Amazon S3</li>
                          <li>Google Cloud Storage</li>
                          <li>Azure Blob Storage</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Cache Management</h3>
                    <div className="flex space-x-3">
                      <button className="btn-outline">Clear Cache</button>
                      <button className="btn-outline text-warning">Remove All Checkpoints</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'account' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Account Settings</h2>
                
                <div className="space-y-6">
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-xl">
                        U
                      </div>
                      <div>
                        <h3 className="font-medium">Unsloth User</h3>
                        <p className="text-text-secondary">Local Account</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Security</h3>
                    <div className="space-y-3">
                      <div>
                        <button className="btn-outline">
                          <Lock className="h-4 w-4 mr-2" />
                          Set Application Password
                        </button>
                      </div>
                      <div>
                        <button className="btn-outline">
                          <Shield className="h-4 w-4 mr-2" />
                          Privacy Settings
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Import/Export</h3>
                    <div className="flex space-x-3">
                      <button className="btn-outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export Settings
                      </button>
                      <button className="btn-outline">Import Settings</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-6 pt-4 border-t border-border flex justify-end">
              <button className="btn-primary flex items-center">
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;