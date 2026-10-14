import React from 'react';
import { ModelDefinition } from '../../types';
import { Sparkles, Code2, Eye, Brain, Zap } from 'lucide-react';

interface ModelPillProps {
  model: ModelDefinition;
  onToggle?: () => void;
  compact?: boolean;
}

export function ModelPill({ model, onToggle, compact = false }: ModelPillProps) {
  const providerColors: Record<string, string> = {
    gemini: 'border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30',
    openrouter: 'border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-950/30',
    groq: 'border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/30',
    cerebras: 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30',
    ollama: 'border-slate-500/30 text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/50',
    custom: 'border-indigo-500/30 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30',
  };

  const badgeStyle = providerColors[model.provider] || providerColors.custom;

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`group relative flex items-center gap-2 rounded-lg border transition-all text-left cursor-pointer ${
        compact ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-xs'
      } ${
        model.isEnabled
          ? 'bg-white dark:bg-slate-900 border-indigo-500/60 shadow-xs ring-1 ring-indigo-500/20'
          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400 opacity-70 hover:opacity-100'
      }`}
    >
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        <span
          className={`w-2 h-2 rounded-full transition-colors ${
            model.isEnabled ? 'bg-indigo-600 dark:bg-indigo-400' : 'bg-slate-300 dark:bg-slate-700'
          }`}
        />
        <span className="font-medium truncate text-slate-800 dark:text-slate-200">
          {model.name}
        </span>
        <span className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-mono tracking-tight border ${badgeStyle}`}>
          {model.provider}
        </span>
        {model.isFree && (
          <span className="px-1 py-0.2 rounded text-[9px] font-medium bg-emerald-100/70 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            Free
          </span>
        )}
      </div>

      {!compact && (
        <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
          {model.capabilities.vision && <span title="Vision modality"><Eye className="w-3 h-3" /></span>}
          {model.capabilities.coding && <span title="Code capability"><Code2 className="w-3 h-3" /></span>}
          {model.capabilities.reasoning && <span title="Extended reasoning"><Brain className="w-3 h-3" /></span>}
          {model.capabilities.fast && <span title="Ultra fast"><Zap className="w-3 h-3 text-amber-500" /></span>}
        </div>
      )}
    </button>
  );
}
