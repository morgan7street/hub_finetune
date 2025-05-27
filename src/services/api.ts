import axios from 'axios';

// URL de base de l'API
const API_BASE_URL = 'http://localhost:8000';

// Configuration d'axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface FineTuningConfig {
  model_name: string;
  learning_rate: number;
  batch_size: number;
  epochs: number;
  max_seq_length?: number;
  lora_r?: number;
  lora_alpha?: number;
  lora_dropout?: number;
  weight_decay?: number;
  warmup_steps?: number;
  gradient_accumulation?: number;
}

export interface JobStatus {
  job_id: string;
  status: string;
  progress: number;
  metrics?: Record<string, any>;
  error?: string;
  created_at: string;
  updated_at: string;
}

// Service API
const ApiService = {
  // Upload d'un dataset
  uploadDataset: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/api/datasets/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
  
  // Démarrer un job de fine-tuning
  startFineTuning: async (config: FineTuningConfig) => {
    const response = await api.post('/api/finetune/start', config);
    return response.data;
  },
  
  // Obtenir le statut d'un job
  getJobStatus: async (jobId: string): Promise<JobStatus> => {
    const response = await api.get(`/api/finetune/${jobId}/status`);
    return response.data;
  },
  
  // Lister tous les jobs
  listJobs: async (): Promise<JobStatus[]> => {
    const response = await api.get('/api/finetune/list');
    return response.data;
  },
};

export default ApiService;