import axios from 'axios';

// Interface pour les paramètres de fine-tuning
export interface UnslothFineTuningParams {
  baseModel: string;
  datasetPath: string;
  learningRate: number;
  batchSize: number;
  epochs: number;
  weightDecay: number;
  warmupSteps: number;
  gradientAccumulation: number;
}

// Service pour interagir avec l'API Unsloth
export const UnslothService = {
  // Démarrer un job de fine-tuning
  startFineTuning: async (params: UnslothFineTuningParams) => {
    try {
      const response = await axios.post('/api/unsloth/finetune', params);
      return response.data;
    } catch (error) {
      console.error('Erreur lors du démarrage du fine-tuning:', error);
      throw error;
    }
  },
  
  // Obtenir le statut d'un job de fine-tuning
  getFineTuningStatus: async (jobId: string) => {
    try {
      const response = await axios.get(`/api/unsloth/finetune/${jobId}/status`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération du statut:', error);
      throw error;
    }
  },
  
  // Obtenir les métriques d'entraînement
  getTrainingMetrics: async (jobId: string) => {
    try {
      const response = await axios.get(`/api/unsloth/finetune/${jobId}/metrics`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des métriques:', error);
      throw error;
    }
  },
  
  // Arrêter un job de fine-tuning
  stopFineTuning: async (jobId: string) => {
    try {
      const response = await axios.post(`/api/unsloth/finetune/${jobId}/stop`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'arrêt du fine-tuning:', error);
      throw error;
    }
  }
};