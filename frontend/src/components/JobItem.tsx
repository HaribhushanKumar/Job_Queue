import React, { useState } from 'react';
import { Job } from '../services/api';
import {
  Clock,
  PlayCircle,
  CheckCircle2,
  AlertOctagon,
  Trash2,
  Check,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface JobItemProps {
  job: Job;
  onUpdateStatus: (
    id: string,
    status: 'pending' | 'running' | 'completed' | 'failed',
    expectedCurrentStatus?: string,
    progress?: number,
    errorMessage?: string,
  ) => Promise<void>;
  onRunWorker: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const JobItem: React.FC<JobItemProps> = ({
  job,
  onUpdateStatus,
  onRunWorker,
  onDelete,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showErrorDetail, setShowErrorDetail] = useState(false);

  const getStatusBadge = () => {
    switch (job.status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300 rounded-full">
            <Clock className="w-3.5 h-3.5 text-amber-700" /> Pending
          </span>
        );
      case 'running':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-sky-800 bg-sky-100 border border-sky-300 rounded-full">
            <Loader2 className="w-3.5 h-3.5 text-sky-700 animate-spin" /> Running ({job.progress}%)
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Completed
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-rose-800 bg-rose-100 border border-rose-300 rounded-full">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-700" /> Failed
          </span>
        );
      default:
        return null;
    }
  };

  const handleRun = async () => {
    try {
      setIsProcessing(true);
      await onRunWorker(job.id);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkComplete = async () => {
    try {
      setIsProcessing(true);
      await onUpdateStatus(job.id, 'completed', job.status, 100);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkFailed = async () => {
    try {
      setIsProcessing(true);
      await onUpdateStatus(
        job.id,
        'failed',
        job.status,
        job.progress,
        'Manually marked as failed from control dashboard.',
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsProcessing(true);
      await onDelete(job.id);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="group relative p-4 bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-slate-300 rounded-xl shadow-sm transition-all duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Info Column */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3 mb-1.5">
            {getStatusBadge()}
            <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200 font-mono">
              {job.type}
            </span>
            <span className="text-xs text-slate-500 font-mono font-medium">
              ID: {job.id.substring(0, 8)}
            </span>
          </div>

          <h3 className="text-base font-extrabold text-slate-900 tracking-tight truncate">
            {job.title}
          </h3>

          <div className="flex items-center space-x-4 mt-1 text-xs text-slate-600 font-medium">
            <span>Created: {formatDate(job.createdAt)}</span>
            <span>•</span>
            <span>Updated: {formatDate(job.updatedAt)}</span>
          </div>
        </div>

        {/* Progress Bar for Running Jobs */}
        {job.status === 'running' && (
          <div className="w-full md:w-48 flex flex-col justify-center">
            <div className="flex justify-between text-xs text-slate-600 mb-1 font-mono">
              <span className="font-semibold">Progress</span>
              <span className="text-sky-700 font-bold">{job.progress}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-indigo-600 transition-all duration-300 rounded-full"
                style={{ width: `${job.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Triggers Column */}
        <div className="flex items-center gap-2 flex-wrap md:flex-nowrap justify-end">
          {job.status === 'pending' && (
            <button
              onClick={handleRun}
              disabled={isProcessing}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm disabled:opacity-50"
              title="Trigger simulated background worker"
            >
              {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PlayCircle className="w-3.5 h-3.5" />}
              <span>Start Worker</span>
            </button>
          )}

          {job.status === 'running' && (
            <>
              <button
                onClick={handleMarkComplete}
                disabled={isProcessing}
                className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-lg transition"
                title="Mark as completed"
              >
                <Check className="w-3.5 h-3.5 text-emerald-700" />
                <span>Complete</span>
              </button>
              <button
                onClick={handleMarkFailed}
                disabled={isProcessing}
                className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-bold text-rose-800 bg-rose-100 hover:bg-rose-200 border border-rose-300 rounded-lg transition"
                title="Mark as failed"
              >
                <XCircle className="w-3.5 h-3.5 text-rose-700" />
                <span>Fail</span>
              </button>
            </>
          )}

          {job.status === 'failed' && job.errorMessage && (
            <button
              onClick={() => setShowErrorDetail(!showErrorDetail)}
              className="px-2.5 py-1.5 text-xs font-bold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition flex items-center gap-1"
              title="Toggle error message details"
            >
              <span>Error Info</span>
              {showErrorDetail ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}

          <button
            onClick={handleDelete}
            disabled={isProcessing}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
            title="Delete job"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expandable Error Detail Banner */}
      {job.status === 'failed' && job.errorMessage && showErrorDetail && (
        <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-mono text-rose-900 animate-in fade-in duration-150">
          <span className="font-bold text-rose-700">Error Details: </span>
          {job.errorMessage}
        </div>
      )}
    </div>
  );
};
