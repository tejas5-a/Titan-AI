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
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 ${className}`}>
        <CheckCircle2 className="w-3 h-3" />
        {label || 'Responded'}
      </span>
    );
  }

  if (status === 'running') {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#fbeee6] text-[#b04f24] dark:bg-[#2d221c] dark:text-[#e08967] border border-[#eed1c2] dark:border-[#52382c] animate-pulse ${className}`}>
        <Clock className="w-3 h-3 animate-spin text-[#c25e2e]" />
        {label || 'Evaluating...'}
      </span>
    );
  }

  if (status === 'failed') {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60 ${className}`}>
        <AlertCircle className="w-3 h-3" />
        {label || 'Failed'}
      </span>
    );
  }

  if (status === 'simulated') {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#f5f0e6] text-[#824422] dark:bg-[#282420] dark:text-[#d97757] border border-[#ded5c5] dark:border-[#423a32] ${className}`}>
        <Sparkles className="w-3 h-3 text-[#c25e2e] dark:text-[#d97757]" />
        {label || 'Simulation'}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#ede7dc]/60 text-[#6e685f] dark:bg-[#22201d] dark:text-[#9e978c] border border-[#ded7c8] dark:border-[#38332c] ${className}`}>
      <Clock className="w-3 h-3" />
      {label || 'Queued'}
    </span>
  );
}
