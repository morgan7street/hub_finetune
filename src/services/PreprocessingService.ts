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
export interface PreprocessingConfig {
  file_path: string;
  output_path: string;
  remove_duplicates?: boolean;
  handle_missing?: boolean;
  missing_strategy?: 'drop' | 'fill_mean' | 'fill_median' | 'fill_mode';
  remove_outliers?: boolean;
  outlier_method?: 'zscore' | 'iqr';
  filter_by_length?: boolean;
  text_column?: string;
  min_length?: number;
  max_length?: number;
}

export interface PreprocessingStatus {
  task_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  file_path: string;
  output_path: string;
  status_message?: string;
  duplicates_removed?: number;
  missing_values_handled?: number;
  outliers_removed?: number;
  filtered_by_length?: number;
  stats?: {
    original_size: number;
    current_size: number;
    duplicates: number;
    outliers: number;
    missing_values: number;
  };
  error?: string;
  created_at: string;
  updated_at: string;
}

// Service pour le prétraitement des données
const PreprocessingService = {
  // Démarrer le prétraitement
  startPreprocessing: async (config: PreprocessingConfig) => {
    try {
      // Créer un FormData pour l'envoi
      const formData = new FormData();
      Object.entries(config).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value.toString());
        }
      });
      
      const response = await api.post('/api/preprocessing/start', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors du démarrage du prétraitement:', error);
      throw error;
    }
  },
  
  // Obtenir le statut d'une tâche de prétraitement
  getPreprocessingStatus: async (taskId: string): Promise<PreprocessingStatus> => {
    try {
      const response = await api.get(`/api/preprocessing/${taskId}/status`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du statut de prétraitement:', error);
      throw error;
    }
  }
};

export default PreprocessingService;
