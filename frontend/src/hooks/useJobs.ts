import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  Job,
  JobStats,
  fetchJobs,
  fetchJobStats,
  createJob as apiCreateJob,
  updateJobStatus as apiUpdateJobStatus,
  runJobWorker as apiRunJobWorker,
  deleteJob as apiDeleteJob,
} from '../services/api';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<JobStats>({
    total: 0,
    pending: 0,
    running: 0,
    completed: 0,
    failed: 0,
  });
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);
  const [socketConnected, setSocketConnected] = useState<boolean>(false);

  // Load jobs and stats
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [jobsData, statsData] = await Promise.all([
        fetchJobs(statusFilter, searchQuery),
        fetchJobStats(),
      ]);
      setJobs(jobsData);
      setStats(statsData);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching jobs:', err);
      setError(err?.response?.data?.message || 'Failed to connect to Job Queue backend service.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Setup Socket.IO real-time synchronization
  useEffect(() => {
    const socket: Socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
    });

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      setSocketConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setSocketConnected(false);
    });

    socket.on('jobCreated', (newJob: Job) => {
      setJobs((prev) => [newJob, ...prev.filter((j) => j.id !== newJob.id)]);
      fetchJobStats().then(setStats).catch(() => {});
    });

    socket.on('jobUpdated', (updatedJob: Job) => {
      setJobs((prev) =>
        prev.map((j) => (j.id === updatedJob.id ? updatedJob : j)),
      );
      fetchJobStats().then(setStats).catch(() => {});
    });

    socket.on('jobDeleted', ({ id }: { id: string }) => {
      setJobs((prev) => prev.filter((j) => j.id !== id));
      fetchJobStats().then(setStats).catch(() => {});
    });

    socket.on('statsUpdated', (newStats: JobStats) => {
      setStats(newStats);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Action handlers
  const handleCreateJob = async (title: string, type: string) => {
    try {
      setConflictMessage(null);
      await apiCreateJob(title, type);
      await loadData();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to create job.';
      setError(msg);
      throw new Error(msg);
    }
  };

  const handleUpdateStatus = async (
    id: string,
    status: 'pending' | 'running' | 'completed' | 'failed',
    expectedCurrentStatus?: string,
    progress?: number,
    errorMessage?: string,
  ) => {
    try {
      setConflictMessage(null);
      await apiUpdateJobStatus(id, status, expectedCurrentStatus, progress, errorMessage);
    } catch (err: any) {
      if (err?.response?.status === 409) {
        // Race condition / Concurrency conflict detected!
        const conflictMsg = err.response.data.message || 'State conflict detected: Job was already updated concurrently.';
        setConflictMessage(conflictMsg);
        await loadData();
      } else {
        const msg = err?.response?.data?.message || 'Failed to update job status.';
        setError(msg);
      }
    }
  };

  const handleRunWorker = async (id: string) => {
    try {
      setConflictMessage(null);
      await apiRunJobWorker(id);
    } catch (err: any) {
      if (err?.response?.status === 409) {
        setConflictMessage('Race condition: Job is already being processed or modified elsewhere.');
        await loadData();
      } else {
        setError(err?.response?.data?.message || 'Failed to run worker process.');
      }
    }
  };

  const handleDeleteJob = async (id: string) => {
    try {
      setConflictMessage(null);
      await apiDeleteJob(id);
      setJobs((prev) => prev.filter((j) => j.id !== id));
      fetchJobStats().then(setStats).catch(() => {});
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to delete job.');
    }
  };

  return {
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
    createJob: handleCreateJob,
    updateStatus: handleUpdateStatus,
    runWorker: handleRunWorker,
    deleteJob: handleDeleteJob,
  };
}
