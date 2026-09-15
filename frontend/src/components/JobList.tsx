import React from 'react';
import { Job } from '../services/api';
import { JobItem } from './JobItem';
import { Search, Inbox, AlertTriangle, RefreshCw } from 'lucide-react';

interface JobListProps {
  jobs: Job[];
  loading: boolean;
  statusFilter: string;
  onFilterChange: (status: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onUpdateStatus: (
    id: string,
    status: 'pending' | 'running' | 'completed' | 'failed',
    expectedCurrentStatus?: string,
    progress?: number,
    errorMessage?: string,
  ) => Promise<void>;
  onRunWorker: (id: string) => Promise<void>;
  onDeleteJob: (id: string) => Promise<void>;
  conflictMessage: string | null;
  onClearConflict: () => void;
  onRefresh: () => void;
}

export const JobList: React.FC<JobListProps> = ({
  jobs,
  loading,
  statusFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  onUpdateStatus,
  onRunWorker,
  onDeleteJob,
  conflictMessage,
  onClearConflict,
  onRefresh,
}) => {
  const filterTabs = [
    { id: 'all', label: 'All Jobs' },
    { id: 'pending', label: 'Pending' },
    { id: 'running', label: 'Running' },
    { id: 'completed', label: 'Completed' },
    { id: 'failed', label: 'Failed' },
  ];

  return (
    <div className="space-y-4">
      {/* Race Condition / Conflict Alert Banner */}
      {conflictMessage && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-start justify-between gap-3 text-amber-900 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-extrabold text-amber-900">Concurrency Race Condition Guarded</h4>
              <p className="text-xs text-amber-800 mt-0.5 font-medium">{conflictMessage}</p>
            </div>
          </div>
          <button
            onClick={onClearConflict}
            className="text-xs font-bold px-2.5 py-1 bg-amber-200 hover:bg-amber-300 border border-amber-400 rounded-lg text-amber-900 transition"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Control Bar: Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        {/* Status Filter Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onFilterChange(tab.id)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input & Refresh Button */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search title or type..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
          <button
            onClick={onRefresh}
            className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition"
            title="Refresh queue manually"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Job Items List Container */}
      <div className="space-y-2.5">
        {loading && jobs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
            <p className="text-sm font-semibold text-slate-700">Fetching job queue database...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
            <Inbox className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No jobs found</h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {searchQuery
                ? `No results match "${searchQuery}" under ${statusFilter} filter.`
                : 'Click "New Job" to add a job to the processing queue.'}
            </p>
          </div>
        ) : (
          jobs.map((job) => (
            <JobItem
              key={job.id}
              job={job}
              onUpdateStatus={onUpdateStatus}
              onRunWorker={onRunWorker}
              onDelete={onDeleteJob}
            />
          ))
        )}
      </div>
    </div>
  );
};
