import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NavigationDestination } from '../../types';
import {
  LayoutDashboard,
  MessagesSquare,
  Swords,
  Compass,
  Code2,
  Eye,
  BookOpen,
  Users2,
  FolderGit2,
  History,
  FlaskConical,
  BarChart3,
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Moon,
  Sun,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const {
    activeView,
    setActiveView,
    sidebarCollapsed,
    setSidebarCollapsed,
    providers,
    models,
    settings,
    updateSettings,
    newChat,
    activeProject,
    projects,
    setActiveProject,
  } = useApp();

  const [showModelModal, setShowModelModal] = useState(false);

  const navItems: Array<{ id: NavigationDestination; label: string; icon: React.ReactNode; badge?: string }> = [
    { id: 'home', label: 'Home', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'chat', label: 'Collective Chat', icon: <MessagesSquare className="w-4 h-4" /> },
    { id: 'debate', label: 'AI Debate', icon: <Swords className="w-4 h-4" /> },
    { id: 'research', label: 'Deep Research', icon: <Compass className="w-4 h-4" /> },
    { id: 'coding', label: 'AI Coding Studio', icon: <Code2 className="w-4 h-4" /> },
    { id: 'vision', label: 'Vision Studio', icon: <Eye className="w-4 h-4" /> },
    { id: 'knowledge', label: 'Knowledge Base', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'agents', label: 'Agent Workspace', icon: <Users2 className="w-4 h-4" /> },
    { id: 'projects', label: 'Projects', icon: <FolderGit2 className="w-4 h-4" />, badge: `${projects.length}` },
    { id: 'history', label: 'Conversation History', icon: <History className="w-4 h-4" /> },
    { id: 'laboratory', label: 'Model Laboratory', icon: <FlaskConical className="w-4 h-4" /> },
    { id: 'usage', label: 'Usage & Costs', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-4 h-4" /> },
  ];

  const enabledModels = models.filter((m) => m.isEnabled);
  const connectedProviders = providers.filter((p) => p.status === 'connected' || p.hasKey);

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-[#0c0e14] text-slate-900 dark:text-slate-100 font-sans antialiased">
      {/* LEFT NAVIGATION SIDEBAR */}
      <aside
        className={`flex flex-col border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#11131a] transition-all duration-200 select-none z-30 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-3.5 py-4 border-b border-slate-100 dark:border-slate-800/70 h-16">
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-xs flex-shrink-0">
                T
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold tracking-tight text-slate-900 dark:text-white text-base">
                    TITAN AI
                  </span>
                  <span className="text-[10px] uppercase font-mono px-1 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800">
                    Pro
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                  Intelligence, Working Together.
                </p>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-xs mx-auto">
              T
            </div>
          )}

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Primary Action: New Collective Chat */}
        <div className="p-3">
          <button
            onClick={newChat}
            className={`w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs transition-colors py-2.5 px-3 shadow-xs cursor-pointer ${
              sidebarCollapsed ? 'px-0' : ''
            }`}
            title="Start New Collective Collaboration"
          >
            <Plus className="w-4 h-4" />
            {!sidebarCollapsed && <span>New Collective Chat</span>}
          </button>
        </div>

        {/* Active Project Selector */}
        {!sidebarCollapsed && (
          <div className="px-3 pb-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 px-1 pb-1 font-medium">
              <span>ACTIVE PROJECT</span>
            </div>
            <select
              value={activeProject?.id || ''}
              onChange={(e) => {
                const found = projects.find((p) => p.id === e.target.value);
                setActiveProject(found || null);
              }}
              className="w-full text-xs rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 truncate cursor-pointer"
            >
              <option value="">No Project (Global Workspace)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Nav Items List */}
        <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5 custom-scrollbar">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group relative cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50/80 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <span className={isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'}>
                  {item.icon}
                </span>

                {!sidebarCollapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}

                {!sidebarCollapsed && item.badge && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {item.badge}
                  </span>
                )}

                {/* Floating tooltip when sidebar is collapsed */}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 rounded bg-slate-900 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-md">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Status Panel */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/70 bg-slate-50/50 dark:bg-[#0f1118]">
          {!sidebarCollapsed ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{enabledModels.length} Models Active</span>
                </span>
                <button
                  onClick={() => setActiveView('settings')}
                  className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Manage
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                <span>{connectedProviders.length} Providers Ready</span>
                <span className="text-[10px] font-mono">{settings.allowPaidUsage ? 'PAID ON' : 'FREE-ONLY'}</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" title={`${enabledModels.length} Models active`} />
            </div>
          )}
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-14 border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-[#11131a]/80 backdrop-blur-sm flex items-center justify-between px-6 z-20 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold text-slate-900 dark:text-slate-100 capitalize">
              {navItems.find((n) => n.id === activeView)?.label || 'TITAN AI'}
            </h1>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
              {activeProject ? activeProject.name : 'Shared Context'}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Quick Model Selector Pill */}
            <button
              onClick={() => setActiveView('settings')}
              className="hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 hover:border-indigo-500/50 transition-colors cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>
                <strong className="text-indigo-600 dark:text-indigo-400">{enabledModels.length}</strong> of{' '}
                {models.length} models
              </span>
            </button>

            {/* Paid API Usage Shield */}
            <div
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs border ${
                settings.allowPaidUsage
                  ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                  : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              }`}
              title={
                settings.allowPaidUsage
                  ? 'Paid API Usage: Enabled (Can incur cloud API charges)'
                  : 'Paid API Usage: Disabled (Zero surprise cloud charges policy)'
              }
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium hidden sm:inline">
                {settings.allowPaidUsage ? 'Paid Allowed' : 'Strictly Free'}
              </span>
            </div>

            {/* Dark/Light Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={`Switch to ${settings.theme === 'dark' ? 'Light' : 'Dark'} theme`}
            >
              {settings.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 min-h-0 overflow-y-auto bg-slate-50/50 dark:bg-[#0c0e14]">
          {children}
        </main>
      </div>
    </div>
  );
}
