import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Database, 
  Filter, 
  Cpu, 
  BarChart3, 
  Terminal, 
  Settings, 
  X,
  Brain 
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarProps {
  onClose?: () => void;
}

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, onClick }) => {
  return (
    <NavLink 
      to={to}
      onClick={onClick}
      className={({ isActive }) => 
        `flex items-center px-4 py-3 mb-1 text-sm font-medium rounded-lg transition-colors ${
          isActive 
            ? 'bg-primary text-white' 
            : 'text-text-secondary hover:text-text hover:bg-background-light'
        }`
      }
    >
      <div className="mr-3">{icon}</div>
      <span>{label}</span>
    </NavLink>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const navItems = [
    { to: '/', icon: <Home size={20} />, label: 'Dashboard' },
    { to: '/data', icon: <Database size={20} />, label: 'Data Ingestion' },
    { to: '/preprocessing', icon: <Filter size={20} />, label: 'Preprocessing' },
    { to: '/finetuning', icon: <Cpu size={20} />, label: 'Fine-tuning' },
    { to: '/evaluation', icon: <BarChart3 size={20} />, label: 'Evaluation' },
    { to: '/inference', icon: <Terminal size={20} />, label: 'Inference Test' },
    { to: '/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];
  
  return (
    <div className="h-full flex flex-col bg-surface border-r border-border">
      <div className="flex items-center justify-between px-4 py-5">
        <div className="flex items-center">
          <motion.div
            whileHover={{ rotate: 10 }}
            className="mr-2"
          >
            <Brain className="h-6 w-6 text-primary" />
          </motion.div>
          <span className="text-lg font-bold">Unsloth</span>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="md:hidden p-2 rounded-md text-text-secondary hover:text-text hover:bg-background-light focus:outline-none"
          >
            <X size={20} />
          </button>
        )}
      </div>
      
      <div className="flex-1 px-2 py-4 overflow-y-auto">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavItem 
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              onClick={onClose}
            />
          ))}
        </nav>
      </div>
      
      <div className="px-4 py-4 border-t border-border">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
              U
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">Unsloth User</p>
            <p className="text-xs text-text-secondary">Platform v0.1.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;