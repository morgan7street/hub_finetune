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
export interface EvaluationConfig {
  model_path: string;
  test_file: string;
  metrics: Array<'perplexity' | 'accuracy' | 'bleu'>;
}

export interface EvaluationStatus {
  task_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  model_path: string;
  test_file: string;
  metrics: string[];
  status_message?: string;
  results?: {
    perplexity?: {
      success: boolean;
      metric: string;
      value: number;
      model_path: string;
      test_file: string;
      timestamp: string;
    };
    accuracy?: {
      success: boolean;
      metric: string;
      value: number;
      model_path: string;
      test_file: string;
      timestamp: string;
      details: Array<{
        question: string;
        expected_answer: string;
        predicted_answer: string;
        is_correct: boolean;
      }>;
    };
    bleu?: {
      success: boolean;
      metric: string;
      value: number;
      model_path: string;
      test_file: string;
      timestamp: string;
      details: Array<{
        question: string;
        expected_answer: string;
        predicted_answer: string;
        bleu_score: number;
      }>;
    };
    global_score?: number;
  };
  error?: string;
  created_at: string;
  updated_at: string;
}

// Service pour l'évaluation de modèles
const ModelEvaluationService = {
  // Démarrer l'évaluation
  startEvaluation: async (config: EvaluationConfig) => {
    try {
      // Créer un FormData pour l'envoi
      const formData = new FormData();
      formData.append('model_path', config.model_path);
      formData.append('test_file', config.test_file);
      
      // Ajouter les métriques
      config.metrics.forEach(metric => {
        formData.append('metrics', metric);
      });
      
      const response = await api.post('/api/evaluate/model', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors du démarrage de l\'évaluation:', error);
      throw error;
    }
  },
  
  // Obtenir le statut d'une tâche d'évaluation
  getEvaluationStatus: async (taskId: string): Promise<EvaluationStatus> => {
    try {
      const response = await api.get(`/api/evaluate/${taskId}/status`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du statut d\'évaluation:', error);
      throw error;
    }
  }
};

export default ModelEvaluationService;
