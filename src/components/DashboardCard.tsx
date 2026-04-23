import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  icon: LucideIcon | React.ElementType;
  children: React.ReactNode;
  className?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, icon: Icon, children, className }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`glass-panel p-6 card-hover ${className || ''}`}
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 rounded-lg bg-blue-500/10 text-primary">
        <Icon size={20} />
      </div>
      <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider">{title}</h3>
    </div>
    {children}
  </motion.div>
);

export default DashboardCard;
