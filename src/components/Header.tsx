import React from 'react';
import { Menu, Bell, Moon, Sun, User } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';

interface HeaderProps {
  onOpenSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <header className="bg-surface border-b border-border sticky top-0 z-10">
      <div className="px-4 py-3 sm:px-6 flex items-center justify-between">
        <div className="flex items-center">
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-text-secondary hover:text-text hover:bg-background-light focus:outline-none"
            onClick={onOpenSidebar}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-5 w-5" />
          </button>
          <div className="ml-4 md:ml-0">
            <h1 className="text-lg font-semibold">Unsloth Fine-tuning Platform</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-full text-text-secondary hover:text-text hover:bg-background-light focus:outline-none transition"
            onClick={() => {}}
          >
            <Bell className="h-5 w-5" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-full text-text-secondary hover:text-text hover:bg-background-light focus:outline-none transition"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </motion.button>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
              <User className="h-4 w-4" />
            </div>
          </motion.div>
        </div>
      </div>
    </header>
  );
};

export default Header;