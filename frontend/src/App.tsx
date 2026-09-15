import React, { useState } from 'react';
import { useJobs } from './hooks/useJobs';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { JobList } from './components/JobList';
import { JobForm } from './components/JobForm';
import { AlertCircle } from 'lucide-react';

export function App() {
  const {
    jobs,
    stats,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    loading,
    error,
    conflictMessage,
    setConflictMessage,
    socketConnected,
    loadData,
    createJob,
    updateStatus,
    runWorker,
    deleteJob,
  } = useJobs();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSimulateBatch = async () => {
    try {
      await createJob('Batch Video Encoding (4K HDR)', 'Video Transcode');
      await createJob('Sync Stripe Transactions Log', 'Data Processing');
      await createJob('Generate User Tax Invoices Q3', 'Report Generation');
    } catch (e) {
      console.error('Failed to seed batch:', e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        socketConnected={socketConnected}
        onOpenNewJobModal={() => setIsModalOpen(true)}
        onSimulateBatch={handleSimulateBatch}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Network / Connection Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-300 rounded-xl flex items-center justify-between gap-3 text-rose-900 shadow-sm">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span className="text-xs sm:text-sm font-bold">{error}</span>
            </div>
            <button
              onClick={loadData}
              className="text-xs font-bold px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Dashboard Status Counters */}
        <Dashboard
          stats={stats}
          currentFilter={statusFilter}
          onSelectFilter={setStatusFilter}
        />

        {/* Main Job Queue List & Actions */}
        <JobList
          jobs={jobs}
          loading={loading}
          statusFilter={statusFilter}
          onFilterChange={setStatusFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onUpdateStatus={updateStatus}
          onRunWorker={runWorker}
          onDeleteJob={deleteJob}
          conflictMessage={conflictMessage}
          onClearConflict={() => setConflictMessage(null)}
          onRefresh={loadData}
        />
      </main>

      {/* Initialize New Job Modal */}
      <JobForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={createJob}
      />
    </div>
  );
}

export default App;
