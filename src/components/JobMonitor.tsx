import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Clock, CheckCircle, AlertCircle, BarChart } from 'lucide-react';
import ApiService, { JobStatus } from '../services/api';

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface JobMonitorProps {
  jobId: string;
}

const JobMonitor: React.FC<JobMonitorProps> = ({ jobId }) => {
  const [job, setJob] = useState<JobStatus | null>(null);
  const [error, setError] = useState<string>('');
  const [lossHistory, setLossHistory] = useState<number[]>([]);
  const [stepLabels, setStepLabels] = useState<string[]>([]);

  // Fonction pour récupérer le statut du job
  const fetchJobStatus = async () => {
    try {
      const jobData = await ApiService.getJobStatus(jobId);
      setJob(jobData);
      
      // Mettre à jour l'historique des pertes si disponible
      if (jobData.metrics && jobData.metrics.loss !== undefined) {
        setLossHistory(prev => [...prev, jobData.metrics.loss]);
        setStepLabels(prev => [...prev, `Étape ${jobData.metrics.step}`]);
      }
    } catch (err) {
      setError('Erreur lors de la récupération du statut du job');
      console.error(err);
    }
  };

  // Récupérer le statut initial et configurer un intervalle de mise à jour
  useEffect(() => {
    fetchJobStatus();
    
    const interval = setInterval(() => {
      fetchJobStatus();
    }, 2000);
    
    return () => clearInterval(interval);
  }, [jobId]);

  // Données pour le graphique
  const chartData = {
    labels: stepLabels,
    datasets: [
      {
        label: 'Perte (Loss)',
        data: lossHistory,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1,
      },
    ],
  };

  // Options du graphique
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Évolution de la perte pendant l\'entraînement',
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  // Rendu du statut
  const renderStatus = () => {
    if (!job) return null;
    
    switch (job.status) {
      case 'pending':
        return (
          <div className="flex items-center text-yellow-500">
            <Clock className="h-5 w-5 mr-2" />
            <span>En attente</span>
          </div>
        );
      case 'running':
        return (
          <div className="flex items-center text-blue-500">
            <BarChart className="h-5 w-5 mr-2" />
            <span>En cours ({Math.round(job.progress * 100)}%)</span>
          </div>
        );
      case 'completed':
        return (
          <div className="flex items-center text-green-500">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>Terminé</span>
          </div>
        );
      case 'failed':
        return (
          <div className="flex items-center text-red-500">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>Échoué</span>
          </div>
        );
      default:
        return <span>{job.status}</span>;
    }
  };

  if (error) {
    return (
      <div className="card p-6">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="card p-6">
        <div className="animate-pulse">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Job #{jobId.substring(0, 8)}</h2>
        {renderStatus()}
      </div>
      
      {/* Barre de progression */}
      <div className="mb-6">
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${job.progress * 100}%` }}
          ></div>
        </div>
        <div className="mt-2 text-sm text-text-secondary">
          Progression: {Math.round(job.progress * 100)}%
        </div>
      </div>
      
      {/* Métriques */}
      {job.metrics && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Métriques</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {job.metrics.loss !== undefined && (
              <div className="bg-background-light p-3 rounded-md">
                <div className="text-sm text-text-secondary">Perte (Loss)</div>
                <div className="text-lg font-medium">{job.metrics.loss.toFixed(4)}</div>
              </div>
            )}
            {job.metrics.epoch !== undefined && (
              <div className="bg-background-light p-3 rounded-md">
                <div className="text-sm text-text-secondary">Époque</div>
                <div className="text-lg font-medium">{job.metrics.epoch}</div>
              </div>
            )}
            {job.metrics.step !== undefined && (
              <div className="bg-background-light p-3 rounded-md">
                <div className="text-sm text-text-secondary">Étape</div>
                <div className="text-lg font-medium">{job.metrics.step}</div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Graphique */}
      {lossHistory.length > 1 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Évolution de la perte</h3>
          <div className="h-64">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      )}
      
      {/* Erreur */}
      {job.error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md">
          <div className="font-medium">Erreur:</div>
          <div>{job.error}</div>
        </div>
      )}
      
      {/* Informations supplémentaires */}
      <div className="mt-4 text-sm text-text-secondary">
        <div>Créé le: {new Date(job.created_at).toLocaleString()}</div>
        <div>Dernière mise à jour: {new Date(job.updated_at).toLocaleString()}</div>
      </div>
    </div>
  );
};

export default JobMonitor;
{jobData && jobData.metrics && (
  <div className="mt-4">
    <h3 className="text-lg font-medium mb-2">Métriques d'entraînement</h3>
    <p className="text-sm text-text-secondary mb-1">Loss: {jobData.metrics.loss.toFixed(4)}</p>
    <p className="text-sm text-text-secondary">Epoch: {jobData.metrics.epoch}/{config.epochs}</p>
  </div>
)}
{jobData && jobData.metrics && (
  <div className="mt-4">
    <h3 className="text-lg font-medium mb-2">Training Metrics</h3>
    <TrainingMetricsChart metrics={jobData.metrics} />
  </div>
)}