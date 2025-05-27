import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, CheckCircle, AlertTriangle, HelpCircle, Download, ArrowUpRight } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { useTheme } from '../contexts/ThemeContext';

// Import Chart.js components (from TrainingMetricsChart)
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ModelEvaluation: React.FC = () => {
  const { theme } = useTheme();
  
  const models = [
    { 
      id: 1, 
      name: 'Mistral-7B-Customer-Support-v1', 
      baseModel: 'Mistral-7B', 
      date: '2023-10-10',
      metrics: {
        accuracy: 92.3,
        bleu: 32.8,
        perplexity: 4.21,
        f1: 88.7,
        rouge: 41.2
      },
      benchmarks: {
        responseAccuracy: 87.6,
        usefulnessScore: 85.2,
        followingInstructions: 94.1,
        toxicity: 0.3,
        biasScore: 2.4
      }
    },
    { 
      id: 2, 
      name: 'LLaMa2-7B-ProductReviews-v1', 
      baseModel: 'LLaMa2-7B', 
      date: '2023-11-15',
      metrics: {
        accuracy: 88.9,
        bleu: 30.1,
        perplexity: 5.12,
        f1: 85.3,
        rouge: 38.6
      },
      benchmarks: {
        responseAccuracy: 83.2,
        usefulnessScore: 89.7,
        followingInstructions: 92.0,
        toxicity: 0.5,
        biasScore: 3.1
      }
    }
  ];
  
  // Example chart data for performance across test sets
  const chartData = {
    labels: ['General', 'Technical', 'Creative', 'Reasoning', 'Knowledge', 'Instructions'],
    datasets: [
      {
        label: 'Base Model',
        data: [68, 63, 72, 59, 76, 64],
        borderColor: theme === 'dark' ? 'rgba(148, 163, 184, 0.8)' : 'rgba(100, 116, 139, 0.8)',
        backgroundColor: theme === 'dark' ? 'rgba(148, 163, 184, 0.1)' : 'rgba(100, 116, 139, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
      {
        label: 'Fine-tuned Model',
        data: [76, 89, 74, 65, 82, 92],
        borderColor: 'rgb(79, 70, 229)',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
          color: theme === 'dark' ? '#94a3b8' : '#64748b',
          font: {
            family: "'Inter', sans-serif",
            size: 10,
          },
        },
        grid: {
          color: theme === 'dark' ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.4)',
        },
        pointLabels: {
          color: theme === 'dark' ? '#f8fafc' : '#0f172a',
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: theme === 'dark' ? '#f8fafc' : '#0f172a',
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: theme === 'dark' ? '#f8fafc' : '#0f172a',
        bodyColor: theme === 'dark' ? '#f8fafc' : '#0f172a',
        borderColor: theme === 'dark' ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.4)',
        borderWidth: 1,
      }
    },
  };
  
  const getMetricColor = (value: number, metricType: string) => {
    if (metricType === 'toxicity' || metricType === 'biasScore') {
      // For these metrics, lower is better
      if (value < 1) return 'text-success';
      if (value < 5) return 'text-warning';
      return 'text-error';
    } else {
      // For these metrics, higher is better
      if (value > 90) return 'text-success';
      if (value > 75) return 'text-primary';
      if (value > 60) return 'text-warning';
      return 'text-error';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Model Evaluation</h1>
        
        <div className="flex space-x-3">
          <select className="input text-sm">
            <option>All Models</option>
            <option>Mistral Models</option>
            <option>LLaMa Models</option>
          </select>
          <button className="btn-primary">
            <BarChart3 className="h-4 w-4 mr-2" />
            Run Benchmark
          </button>
        </div>
      </div>
      
      {/* Models evaluation cards */}
      {models.map((model) => (
        <motion.div 
          key={model.id}
          className="card border border-border"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div className="mb-6 lg:mb-0 lg:w-1/3">
              <h2 className="text-xl font-semibold">{model.name}</h2>
              <p className="text-text-secondary mt-1">Base: {model.baseModel}</p>
              <p className="text-text-secondary text-sm">Fine-tuned on {model.date}</p>
              
              <div className="flex mt-4 space-x-2">
                <button className="btn-outline text-sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export GGUF
                </button>
                <button className="btn-primary text-sm">
                  Test Inference
                </button>
              </div>
            </div>
            
            <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-3 flex items-center">
                  <span>Technical Metrics</span>
                  <HelpCircle className="h-4 w-4 ml-1 text-text-secondary" />
                </h3>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-background rounded-lg">
                    <p className="text-text-secondary text-xs">Accuracy</p>
                    <p className={`text-xl font-semibold ${getMetricColor(model.metrics.accuracy, 'accuracy')}`}>
                      {model.metrics.accuracy}%
                    </p>
                  </div>
                  <div className="p-2 bg-background rounded-lg">
                    <p className="text-text-secondary text-xs">BLEU</p>
                    <p className={`text-xl font-semibold ${getMetricColor(model.metrics.bleu, 'bleu')}`}>
                      {model.metrics.bleu}
                    </p>
                  </div>
                  <div className="p-2 bg-background rounded-lg">
                    <p className="text-text-secondary text-xs">Perplexity</p>
                    <p className="text-xl font-semibold text-primary">
                      {model.metrics.perplexity}
                    </p>
                  </div>
                  <div className="p-2 bg-background rounded-lg">
                    <p className="text-text-secondary text-xs">F1 Score</p>
                    <p className={`text-xl font-semibold ${getMetricColor(model.metrics.f1, 'f1')}`}>
                      {model.metrics.f1}%
                    </p>
                  </div>
                  <div className="p-2 bg-background rounded-lg">
                    <p className="text-text-secondary text-xs">ROUGE</p>
                    <p className={`text-xl font-semibold ${getMetricColor(model.metrics.rouge, 'rouge')}`}>
                      {model.metrics.rouge}
                    </p>
                  </div>
                  <div className="p-2 bg-background rounded-lg flex items-center justify-center">
                    <button className="text-primary text-sm flex items-center">
                      More
                      <ArrowUpRight className="h-3 w-3 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-3 flex items-center">
                  <span>Quality Benchmarks</span>
                  <HelpCircle className="h-4 w-4 ml-1 text-text-secondary" />
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Response Accuracy</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-background-light rounded-full h-2 mr-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${model.benchmarks.responseAccuracy}%` }}
                        ></div>
                      </div>
                      <span className={`text-sm font-medium ${getMetricColor(model.benchmarks.responseAccuracy, 'responseAccuracy')}`}>
                        {model.benchmarks.responseAccuracy}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Usefulness Score</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-background-light rounded-full h-2 mr-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${model.benchmarks.usefulnessScore}%` }}
                        ></div>
                      </div>
                      <span className={`text-sm font-medium ${getMetricColor(model.benchmarks.usefulnessScore, 'usefulnessScore')}`}>
                        {model.benchmarks.usefulnessScore}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Following Instructions</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-background-light rounded-full h-2 mr-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${model.benchmarks.followingInstructions}%` }}
                        ></div>
                      </div>
                      <span className={`text-sm font-medium ${getMetricColor(model.benchmarks.followingInstructions, 'followingInstructions')}`}>
                        {model.benchmarks.followingInstructions}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Toxicity Score</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-background-light rounded-full h-2 mr-2">
                        <div 
                          className="bg-success h-2 rounded-full" 
                          style={{ width: `${model.benchmarks.toxicity * 20}%` }}
                        ></div>
                      </div>
                      <span className={`text-sm font-medium ${getMetricColor(model.benchmarks.toxicity, 'toxicity')}`}>
                        {model.benchmarks.toxicity}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Bias Score</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-background-light rounded-full h-2 mr-2">
                        <div 
                          className="bg-warning h-2 rounded-full" 
                          style={{ width: `${model.benchmarks.biasScore * 10}%` }}
                        ></div>
                      </div>
                      <span className={`text-sm font-medium ${getMetricColor(model.benchmarks.biasScore, 'biasScore')}`}>
                        {model.benchmarks.biasScore}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="font-medium mb-4">Performance Across Test Sets</h3>
            <div className="h-64">
              <Line options={chartOptions} data={chartData} />
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-border flex justify-between">
            <div className="flex space-x-4">
              <div className="flex items-center text-success text-sm">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span>Ready for Production</span>
              </div>
            </div>
            <div className="flex space-x-3">
              <button className="text-text-secondary text-sm hover:text-text transition-colors">Test Set Details</button>
              <button className="text-text-secondary text-sm hover:text-text transition-colors">Training History</button>
              <button className="text-primary text-sm">Full Report</button>
            </div>
          </div>
        </motion.div>
      ))}
      
      {/* Quality Assessment */}
      <div className="card border-l-4 border-l-primary">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-medium">Evaluation Tips</h3>
            <p className="text-text-secondary">
              For the most accurate assessment, test your models on diverse datasets that represent real-world usage. 
              Consider both quantitative metrics and qualitative evaluation through manual review of model outputs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelEvaluation;