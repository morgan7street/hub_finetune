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
export interface ExportConfig {
  model_path: string;
  model_name: string;
  format: 'gguf' | 'huggingface';
  quantization?: 'q4_0' | 'q4_k_m' | 'q5_k_m' | 'q8_0';
}

export interface ExportStatus {
  task_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  model_path: string;
  model_name: string;
  format: string;
  status_message?: string;
  result?: {
    success: boolean;
    model_name: string;
    format: string;
    quantization?: string;
    file_path: string;
    file_size: number;
    timestamp: string;
    hub_url?: string;
  };
  error?: string;
  created_at: string;
  updated_at: string;
}

// Service pour l'export de modèles
const ModelExportService = {
  // Démarrer l'export
  startExport: async (config: ExportConfig) => {
    try {
      // Créer un FormData pour l'envoi
      const formData = new FormData();
      Object.entries(config).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value.toString());
        }
      });
      
      const response = await api.post('/api/export/model', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors du démarrage de l\'export:', error);
      throw error;
    }
  },
  
  // Obtenir le statut d'une tâche d'export
  getExportStatus: async (taskId: string): Promise<ExportStatus> => {
    try {
      const response = await api.get(`/api/export/${taskId}/status`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du statut d\'export:', error);
      throw error;
    }
  }
};

export default ModelExportService;
