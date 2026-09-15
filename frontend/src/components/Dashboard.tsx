import React from 'react';
import { JobStats } from '../services/api';
import { Clock, PlayCircle, CheckCircle2, AlertOctagon, Layers } from 'lucide-react';

interface DashboardProps {
  stats: JobStats;
  currentFilter: string;
  onSelectFilter: (status: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  currentFilter,
  onSelectFilter,
}) => {
  const statCards = [
    {
      id: 'all',
      title: 'Total Queue',
      count: stats.total,
      icon: Layers,
      color: 'text-indigo-600',
      bg: 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-md',
      activeBg: 'ring-2 ring-indigo-600 bg-indigo-50/40 border-indigo-300',
      iconBg: 'bg-indigo-100',
    },
    {
      id: 'pending',
      title: 'Pending',
      count: stats.pending,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-white border-slate-200 hover:border-amber-400 hover:shadow-md',
      activeBg: 'ring-2 ring-amber-500 bg-amber-50/40 border-amber-300',
      iconBg: 'bg-amber-100',
    },
    {
      id: 'running',
      title: 'Running',
      count: stats.running,
      icon: PlayCircle,
      color: 'text-sky-600',
      bg: 'bg-white border-slate-200 hover:border-sky-400 hover:shadow-md',
      activeBg: 'ring-2 ring-sky-500 bg-sky-50/40 border-sky-300',
      iconBg: 'bg-sky-100',
      pulse: stats.running > 0,
    },
    {
      id: 'completed',
      title: 'Completed',
      count: stats.completed,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-white border-slate-200 hover:border-emerald-400 hover:shadow-md',
      activeBg: 'ring-2 ring-emerald-500 bg-emerald-50/40 border-emerald-300',
      iconBg: 'bg-emerald-100',
    },
    {
      id: 'failed',
      title: 'Failed',
      count: stats.failed,
      icon: AlertOctagon,
      color: 'text-rose-600',
      bg: 'bg-white border-slate-200 hover:border-rose-400 hover:shadow-md',
      activeBg: 'ring-2 ring-rose-500 bg-rose-50/40 border-rose-300',
      iconBg: 'bg-rose-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
      {statCards.map((card) => {
        const Icon = card.icon;
        const isActive = currentFilter === card.id;

        return (
          <button
            key={card.id}
            onClick={() => onSelectFilter(card.id)}
            className={`relative p-4 rounded-xl border transition-all duration-200 text-left flex flex-col justify-between overflow-hidden shadow-sm ${
              isActive ? card.activeBg : card.bg
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                {card.title}
              </span>
              <div className={`p-2 rounded-lg ${card.iconBg} ${card.color}`}>
                <Icon className={`w-4 h-4 ${card.pulse ? 'animate-pulse' : ''}`} />
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                {card.count}
              </span>
              {card.id !== 'all' && stats.total > 0 && (
                <span className="text-xs font-bold text-slate-500">
                  {Math.round((card.count / stats.total) * 100)}%
                </span>
              )}
            </div>

            {/* Indicator bar */}
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 opacity-90" />
            )}
          </button>
        );
      })}
    </div>
  );
};
