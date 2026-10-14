import React from 'react';
import { ModelDefinition } from '../../types';
import { Sparkles, Code2, Eye, Brain, Zap } from 'lucide-react';

interface ModelPillProps {
  model: ModelDefinition;
  onToggle?: () => void;
  compact?: boolean;
}

export function ModelPill({ model, onToggle, compact = false }: ModelPillProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`group relative flex items-center gap-2 rounded-xl border transition-all text-left cursor-pointer ${
        compact ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-xs'
      } ${
        model.isEnabled
          ? 'bg-white dark:bg-[#262421] border-[#c25e2e]/60 dark:border-[#d97757]/60 shadow-2xs ring-1 ring-[#c25e2e]/20 text-[#1f1e1d] dark:text-[#ede8e1]'
          : 'bg-[#f7f4ee]/70 dark:bg-[#1a1917] border-[#e8e2d8] dark:border-[#2d2a26] text-[#8c857b] opacity-75 hover:opacity-100'
      }`}
    >
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        <span
          className={`w-2 h-2 rounded-full transition-colors ${
            model.isEnabled ? 'bg-[#c25e2e] dark:bg-[#d97757]' : 'bg-[#d1c9bd] dark:bg-[#423e38]'
          }`}
        />
        <span className="font-medium truncate text-[#1f1e1d] dark:text-[#ede8e1]">
          {model.name}
        </span>
        <span className="px-1.5 py-0.2 rounded font-mono text-[9px] uppercase tracking-tight bg-[#f0ebd5] dark:bg-[#2e2a25] text-[#6b655b] dark:text-[#a19a8d] border border-[#ded7c8] dark:border-[#3d3830]">
          {model.provider}
        </span>
        {model.isFree && (
          <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
            Free
          </span>
        )}
      </div>

      {!compact && (
        <div className="flex items-center gap-1 text-[#a39c91] dark:text-[#7d776e]">
          {model.capabilities.vision && <span title="Vision modality"><Eye className="w-3 h-3" /></span>}
          {model.capabilities.coding && <span title="Code capability"><Code2 className="w-3 h-3" /></span>}
          {model.capabilities.reasoning && <span title="Extended reasoning"><Brain className="w-3 h-3" /></span>}
          {model.capabilities.fast && <span title="Ultra fast"><Zap className="w-3 h-3 text-[#c25e2e] dark:text-[#d97757]" /></span>}
        </div>
      )}
    </button>
  );
}
