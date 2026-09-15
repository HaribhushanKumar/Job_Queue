import React from 'react';
import { Cpu, Plus, Radio, Zap } from 'lucide-react';

interface NavbarProps {
  socketConnected: boolean;
  onOpenNewJobModal: () => void;
  onSimulateBatch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  socketConnected,
  onOpenNewJobModal,
  onSimulateBatch,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        {/* Brand logo & title */}
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-violet-600 text-white rounded-xl shadow-md shadow-indigo-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">TaskPulse</h1>
              <span className="text-[10px] uppercase font-extrabold tracking-widest px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md">
                Job Queue
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">NestJS & React Distributed Engine</p>
          </div>
        </div>

        {/* Action Controls & WebSocket Connection Indicator */}
        <div className="flex items-center space-x-3">
          {/* WebSocket Status Indicator */}
          <div
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
              socketConnected
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-rose-50 text-rose-700 border-rose-300'
            }`}
            title={socketConnected ? 'Real-time WebSocket active' : 'Disconnected from WebSocket'}
          >
            <Radio className={`w-3.5 h-3.5 ${socketConnected ? 'animate-pulse text-emerald-600' : 'text-rose-600'}`} />
            <span className="hidden sm:inline">
              {socketConnected ? 'Live WS Connected' : 'WS Reconnecting...'}
            </span>
          </div>

          {/* Quick Demo Batch Seed Button */}
          <button
            onClick={onSimulateBatch}
            className="hidden sm:flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl border border-slate-300 transition"
            title="Enqueue a batch of sample jobs for testing"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Seed Demo Batch</span>
          </button>

          {/* Initialize New Job Button */}
          <button
            onClick={onOpenNewJobModal}
            className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Job</span>
          </button>
        </div>
      </div>
    </header>
  );
};
