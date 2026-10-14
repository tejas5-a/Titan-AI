import React from 'react';
import { CheckCircle2, Clock, AlertCircle, Sparkles } from 'lucide-react';

interface StatusBadgeProps {
  status: 'completed' | 'running' | 'failed' | 'pending' | 'simulated';
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className = '' }: StatusBadgeProps) {
  if (status === 'completed') {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 ${className}`}>
        <CheckCircle2 className="w-3 h-3" />
        {label || 'Responded'}
      </span>
    );
  }

  if (status === 'running') {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 animate-pulse ${className}`}>
        <Clock className="w-3 h-3 animate-spin" />
        {label || 'Evaluating...'}
      </span>
    );
  }

  if (status === 'failed') {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 ${className}`}>
        <AlertCircle className="w-3 h-3" />
        {label || 'Failed'}
      </span>
    );
  }

  if (status === 'simulated') {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 ${className}`}>
        <Sparkles className="w-3 h-3" />
        {label || 'Simulation'}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700 ${className}`}>
      <Clock className="w-3 h-3" />
      {label || 'Queued'}
    </span>
  );
}
