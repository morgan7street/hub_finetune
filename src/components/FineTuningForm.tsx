import React, { useState } from 'react';
import { Play, Upload, Settings } from 'lucide-react';
import ApiService, { FineTuningConfig } from '../services/api';

interface FineTuningFormProps {
  onJobStarted: (jobId: string) => void;
}

const FineTuningForm: React.FC<FineTuningFormProps> = ({ onJobStarted }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [config, setConfig] = useState<FineTuningConfig>({
    model_name: 'mistralai/Mistral-7B-v0.1',
    learning_rate: 2e-4,
    batch_size: 4,
    epochs: 3,
    max_seq_length: 2048,
    lora_r: 16,
    lora_alpha: 32,
    lora_dropout: 0.05,
    weight_decay: 0.01,
    warmup_steps: 50,
    gradient_accumulation: 1
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setUploadStatus('Téléchargement en cours...');
    
    try {
      const result = await ApiService.uploadDataset(file);
      setUploadStatus(`Fichier téléchargé avec succès: ${result.filename}`);
    } catch (err) {
      setUploadStatus('Erreur lors du téléchargement');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: name === 'model_name' ? value : Number(value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const result = await ApiService.startFineTuning(config);
      onJobStarted(result.job_id);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Une erreur est survenue');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Section de téléchargement de données */}
      <div className="card p-6">
        <div className="flex items-center mb-4">
          <Upload className="h-5 w-5 text-primary mr-2" />
          <h2 className="text-xl font-semibold">Téléchargement des données</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <input
              type="file"
              id="dataset-file"
              className="hidden"
              onChange={handleFileChange}
              accept=".json,.jsonl,.csv,.txt"
            />
            <label
              htmlFor="dataset-file"
              className="btn-outline flex items-center cursor-pointer"
            >
              <Upload className="h-4 w-4 mr-2" />
              Sélectionner un fichier
            </label>
            <span className="text-sm text-text-secondary">
              {file ? file.name : 'Aucun fichier sélectionné'}
            </span>
          </div>
          
          <button
            className="btn-primary"
            onClick={handleUpload}
            disabled={!file || isUploading}
          >
            {isUploading ? 'Téléchargement...' : 'Télécharger'}
          </button>
          
          {uploadStatus && (
            <div className="text-sm mt-2">
              {uploadStatus}
            </div>
          )}
        </div>
      </div>
      
      {/* Section de configuration */}
      <form onSubmit={handleSubmit} className="card p-6">
        <div className="flex items-center mb-4">
          <Settings className="h-5 w-5 text-primary mr-2" />
          <h2 className="text-xl font-semibold">Configuration du fine-tuning</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label htmlFor="model_name" className="block text-sm font-medium mb-1">
              Modèle de base
            </label>
            <select
              id="model_name"
              name="model_name"
              value={config.model_name}
              onChange={handleConfigChange}
              className="w-full p-2 border rounded-md bg-background-light"
            >
              <option value="mistralai/Mistral-7B-v0.1">Mistral 7B</option>
              <option value="meta-llama/Llama-2-7b-hf">Llama 2 7B</option>
              <option value="meta-llama/Llama-2-13b-hf">Llama 2 13B</option>
              <option value="microsoft/phi-2">Phi-2</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="learning_rate" className="block text-sm font-medium mb-1">
              Taux d'apprentissage
            </label>
            <input
              type="number"
              id="learning_rate"
              name="learning_rate"
              value={config.learning_rate}
              onChange={handleConfigChange}
              step="0.0001"
              min="0.00001"
              max="0.001"
              className="w-full p-2 border rounded-md bg-background-light"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="batch_size" className="block text-sm font-medium mb-1">
              Taille de batch
            </label>
            <input
              type="number"
              id="batch_size"
              name="batch_size"
              value={config.batch_size}
              onChange={handleConfigChange}
              min="1"
              max="32"
              className="w-full p-2 border rounded-md bg-background-light"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="epochs" className="block text-sm font-medium mb-1">
              Nombre d'époques
            </label>
            <input
              type="number"
              id="epochs"
              name="epochs"
              value={config.epochs}
              onChange={handleConfigChange}
              min="1"
              max="10"
              className="w-full p-2 border rounded-md bg-background-light"
            />
          </div>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            className="btn-primary flex items-center"
            disabled={isSubmitting}
          >
            <Play className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Démarrage...' : 'Démarrer le fine-tuning'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FineTuningForm;