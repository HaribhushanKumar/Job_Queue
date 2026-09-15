import React, { useState } from 'react';
import { X, PlusCircle, Sparkles, Loader2 } from 'lucide-react';

interface JobFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, type: string) => Promise<void>;
}

const JOB_TYPE_PRESETS = [
  { label: 'Data Processing', desc: 'ETL Pipelines & Database Aggregations' },
  { label: 'Email Batch', desc: 'Newsletter & Notification Distribution' },
  { label: 'Image Resize', desc: 'WebP Compression & Thumbnail Generation' },
  { label: 'Report Generation', desc: 'PDF Analytics & Financial Summaries' },
  { label: 'Video Transcode', desc: 'H.264 & AV1 Multi-resolution Encoding' },
];

export const JobForm: React.FC<JobFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState(JOB_TYPE_PRESETS[0].label);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Job title cannot be empty.');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError(null);
      await onSubmit(title.trim(), type);
      setTitle('');
      setType(JOB_TYPE_PRESETS[0].label);
      onClose();
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit job.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickPreset = (presetTitle: string, presetType: string) => {
    setTitle(presetTitle);
    setType(presetType);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg p-6 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <PlusCircle className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Initialize New Job</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Quick Templates
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleQuickPreset('Sync Customer Contacts DB', 'Data Processing')}
              className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-md border border-slate-300 transition"
            >
              📊 Contacts Sync
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset('Weekly Digest Newsletter #42', 'Email Batch')}
              className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-md border border-slate-300 transition"
            >
              ✉️ Newsletter
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset('Batch Compress Avatar Uploads', 'Image Resize')}
              className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-md border border-slate-300 transition"
            >
              🖼️ Image Optimizer
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 text-xs text-rose-900 bg-rose-50 border border-rose-300 rounded-lg font-semibold">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Job Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Export Monthly Analytics Report"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Job Category / Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition cursor-pointer"
            >
              {JOB_TYPE_PRESETS.map((preset) => (
                <option key={preset.label} value={preset.label}>
                  {preset.label} — {preset.desc}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition shadow-md shadow-indigo-600/20 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enqueuing...</span>
                </>
              ) : (
                <span>Enqueue Job</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
