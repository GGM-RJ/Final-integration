import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  // FIX: Changed JSX.Element to React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
  icon: React.ReactElement;
  borderColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description, icon, borderColor }) => {
  return (
    <div className={`bg-white p-5 rounded-xl shadow-sm flex items-center justify-between border-l-4 ${borderColor}`}>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
        <p className="text-xs text-gray-400 mt-1">{description}</p>
      </div>
      <div className="text-gray-300">
        {icon}
      </div>
    </div>
  );
};

export default StatCard;