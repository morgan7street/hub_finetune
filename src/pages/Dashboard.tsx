import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Database, BarChart3, Terminal, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import StatusCard from '../components/StatusCard';
import TrainingMetricsChart from '../components/TrainingMetricsChart';

const Dashboard: React.FC = () => {
  // Mock data for the dashboard
  const activeJobs = [
    { id: 'job-1', name: 'BERT-base finetuning', progress: 65, status: 'running', timeRemaining: '1h 23m' },
    { id: 'job-2', name: 'T5-small finetuning', progress: 30, status: 'running', timeRemaining: '3h 07m' },
  ];
  
  const recentJobs = [
    { id: 'job-3', name: 'GPT-2 custom finetuning', status: 'completed', completedAt: '2 hours ago' },
    { id: 'job-4', name: 'RoBERTa base', status: 'failed', completedAt: '5 hours ago' },
    { id: 'job-5', name: 'BERT-tiny classification', status: 'completed', completedAt: '1 day ago' },
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button className="btn-primary">New Fine-tuning Job</button>
      </div>
      
      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard 
          title="Active Jobs"
          value={activeJobs.length.toString()}
          icon={<Cpu className="h-6 w-6 text-primary" />}
          trend="+1 from yesterday"
          trendUp={true}
        />
        <StatusCard 
          title="Datasets"
          value="8"
          icon={<Database className="h-6 w-6 text-secondary" />}
          trend="+3 this week"
          trendUp={true}
        />
        <StatusCard 
          title="Fine-tuned Models"
          value="12"
          icon={<BarChart3 className="h-6 w-6 text-accent" />}
          trend="+5 this month"
          trendUp={true}
        />
        <StatusCard 
          title="Inference Tests"
          value="34"
          icon={<Terminal className="h-6 w-6 text-success" />}
          trend="+12 this week"
          trendUp={true}
        />
      </div>
      
      {/* Active jobs */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Active Jobs</h2>
        {activeJobs.length > 0 ? (
          <div className="space-y-4">
            {activeJobs.map((job) => (
              <motion.div 
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-background p-4 rounded-lg border border-border"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <span className="inline-block w-2 h-2 bg-success rounded-full mr-2 animate-pulse"></span>
                    <h3 className="font-medium">{job.name}</h3>
                  </div>
                  <div className="flex items-center text-sm text-text-secondary">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{job.timeRemaining} remaining</span>
                  </div>
                </div>
                <div className="w-full bg-background-light rounded-full h-2.5 mb-2">
                  <div 
                    className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${job.progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-text-secondary">Progress: {job.progress}%</span>
                  <button className="text-primary hover:text-primary-light transition-colors">View Details</button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-text-secondary">
            <p>No active jobs</p>
          </div>
        )}
      </div>
      
      {/* Recent jobs */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Recent Jobs</h2>
        {recentJobs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Job Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Completed</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-background-light transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">{job.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        job.status === 'completed' 
                          ? 'bg-success/10 text-success' 
                          : job.status === 'failed' 
                            ? 'bg-error/10 text-error' 
                            : 'bg-warning/10 text-warning'
                      }`}>
                        {job.status === 'completed' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                        {job.status === 'failed' && <AlertCircle className="w-3 h-3 mr-1" />}
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-text-secondary text-sm">{job.completedAt}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-primary hover:text-primary-light mr-3 transition-colors">View</button>
                      {job.status === 'completed' && (
                        <button className="text-primary hover:text-primary-light transition-colors">Export</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-text-secondary">
            <p>No recent jobs</p>
          </div>
        )}
      </div>
      
      {/* Training metrics */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Training Metrics</h2>
        <div className="h-80">
          <TrainingMetricsChart />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;