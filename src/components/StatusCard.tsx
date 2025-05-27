import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatusCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}

const StatusCard: React.FC<StatusCardProps> = ({ title, value, icon, trend, trendUp }) => {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="card border border-border"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-text-secondary text-sm">{title}</p>
          <p className="text-3xl font-semibold mt-2">{value}</p>
          {trend && (
            <div className="flex items-center mt-2 text-xs">
              {trendUp ? (
                <>
                  <TrendingUp className="w-3 h-3 text-success mr-1" />
                  <span className="text-success">{trend}</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-3 h-3 text-error mr-1" />
                  <span className="text-error">{trend}</span>
                </>
              )}
            </div>
          )}
        </div>
        <div className="p-3 bg-background rounded-lg">{icon}</div>
      </div>
    </motion.div>
  );
};

export default StatusCard;