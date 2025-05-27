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
export interface InferenceConfig {
  model_path: string;
  prompt: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
}

export interface InferenceResult {
  prompt: string;
  generated_text: string;
  model_path: string;
}

// Service pour l'inférence
const InferenceService = {
  // Exécuter l'inférence
  runInference: async (config: InferenceConfig): Promise<InferenceResult> => {
    try {
      // Créer un FormData pour l'envoi
      const formData = new FormData();
      Object.entries(config).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value.toString());
        }
      });
      
      const response = await api.post('/api/inference', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'inférence:', error);
      throw error;
    }
  }
};

export default InferenceService;
