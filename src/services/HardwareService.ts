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
export interface HardwareInfo {
  system: {
    os: string;
    os_version: string;
    architecture: string;
    python_version: string;
  };
  cpu: {
    processor: string;
    cpu_count: number;
    model_name?: string;
  };
  memory: {
    total: number;
    available: number;
    used?: number;
    percent?: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    percent: number;
  };
  gpu: {
    nvidia: {
      available: boolean;
      devices: Array<{
        id: number;
        name: string;
        memory_total: string | number;
        memory_used?: string | number;
        memory_free?: string | number;
        temperature?: string | number;
        utilization?: string | number;
      }>;
    };
    amd: {
      available: boolean;
      devices: Array<{
        id: number;
        name: string;
        memory_total: string | number;
        memory_used?: string | number;
        temperature?: string | number;
      }>;
    };
  };
}

// Service pour la détection du hardware
const HardwareService = {
  // Obtenir les informations sur le hardware
  getHardwareInfo: async (): Promise<HardwareInfo> => {
    try {
      const response = await api.get('/api/hardware/info');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des informations hardware:', error);
      throw error;
    }
  },
  
  // Installer Unsloth
  installUnsloth: async () => {
    try {
      const response = await api.post('/api/install/unsloth');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'installation d\'Unsloth:', error);
      throw error;
    }
  }
};

export default HardwareService;
