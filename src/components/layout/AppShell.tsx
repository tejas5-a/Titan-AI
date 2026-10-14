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
  Cpu,
  Sparkles,
  Search,
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
    { id: 'history', label: 'History', icon: <History className="w-4 h-4" /> },
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
    <div className="flex h-screen w-screen overflow-hidden bg-[#faf8f5] dark:bg-[#181716] text-[#1f1e1d] dark:text-[#ede8e1] font-sans antialiased">
      {/* CLAUDE STYLE SIDEBAR */}
      <aside
        className={`flex flex-col border-r border-[#e8e2d8] dark:border-[#33302c] bg-[#f5f2eb] dark:bg-[#1d1c1a] transition-all duration-200 select-none z-30 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-3.5 py-4 border-b border-[#e8e2d8]/60 dark:border-[#33302c]/70 h-16">
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-2.5 overflow-hidden">
              {/* Claude style terracotta emblem */}
              <div className="w-7 h-7 rounded-lg bg-[#c25e2e] dark:bg-[#d97757] flex items-center justify-center text-white font-serif font-bold text-sm shadow-xs flex-shrink-0">
                T
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-serif font-semibold tracking-tight text-[#1f1e1d] dark:text-[#ede8e1] text-base">
                    TITAN AI
                  </span>
                  <span className="text-[10px] uppercase font-mono px-1 py-0.2 rounded bg-[#ebe4d8] dark:bg-[#2b2824] text-[#c25e2e] dark:text-[#d97757] font-semibold border border-[#ded5c7] dark:border-[#3d3831]">
                    Collective
                  </span>
                </div>
                <p className="text-[11px] text-[#787268] dark:text-[#9c968d] truncate">
                  Intelligence, Working Together.
                </p>
              </div>
            </div>
          ) : (
            <div className="w-7 h-7 rounded-lg bg-[#c25e2e] dark:bg-[#d97757] flex items-center justify-center text-white font-serif font-bold text-sm shadow-xs mx-auto">
              T
            </div>
          )}

          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 rounded-md text-[#787268] hover:text-[#1f1e1d] dark:hover:text-[#ede8e1] hover:bg-[#e8e2d8] dark:hover:bg-[#282623] transition-colors cursor-pointer"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Primary Action: Claude style Start New Chat */}
        <div className="p-3">
          <button
            onClick={newChat}
            className={`w-full flex items-center justify-center gap-2 rounded-xl bg-white dark:bg-[#242220] hover:bg-[#ede7dc] dark:hover:bg-[#2d2a27] text-[#1f1e1d] dark:text-[#ede8e1] border border-[#e2dcd2] dark:border-[#383530] font-medium text-xs transition-all py-2.5 px-3 shadow-xs cursor-pointer ${
              sidebarCollapsed ? 'px-0' : ''
            }`}
            title="Start New Collective Chat"
          >
            <Plus className="w-4 h-4 text-[#c25e2e] dark:text-[#d97757]" />
            {!sidebarCollapsed && <span className="font-medium">New Collective Chat</span>}
          </button>
        </div>

        {/* Active Project Selector */}
        {!sidebarCollapsed && (
          <div className="px-3 pb-2">
            <div className="text-[10px] font-semibold tracking-wider uppercase text-[#8c857b] dark:text-[#8f887f] px-1 pb-1">
              Active Project
            </div>
            <select
              value={activeProject?.id || ''}
              onChange={(e) => {
                const found = projects.find((p) => p.id === e.target.value);
                setActiveProject(found || null);
              }}
              className="w-full text-xs rounded-lg bg-white dark:bg-[#242220] border border-[#e2dcd2] dark:border-[#383530] text-[#2e2c29] dark:text-[#ded8ce] px-2 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-[#c25e2e] truncate cursor-pointer"
            >
              <option value="">Global Workspace (Shared)</option>
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
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all group relative cursor-pointer ${
                  isActive
                    ? 'bg-[#eae3d6] dark:bg-[#2a2825] text-[#1f1e1d] dark:text-[#ede8e1] font-semibold shadow-2xs'
                    : 'text-[#615c54] dark:text-[#9e988e] hover:bg-[#ede7dc]/60 dark:hover:bg-[#242220] hover:text-[#1f1e1d] dark:hover:text-[#ede8e1]'
                } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <span className={isActive ? 'text-[#c25e2e] dark:text-[#d97757]' : 'text-[#878074] dark:text-[#787268] group-hover:text-[#1f1e1d] dark:group-hover:text-[#ede8e1]'}>
                  {item.icon}
                </span>

                {!sidebarCollapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}

                {!sidebarCollapsed && item.badge && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#ded7cb] dark:bg-[#33302b] text-[#524d45] dark:text-[#aba499]">
                    {item.badge}
                  </span>
                )}

                {sidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-2.5 py-1 rounded-md bg-[#22201e] text-[#ede8e1] text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-md">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Status Panel */}
        <div className="p-3 border-t border-[#e8e2d8]/80 dark:border-[#33302c]/70 bg-[#ede7dc]/40 dark:bg-[#191816]">
          {!sidebarCollapsed ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-[#5e584f] dark:text-[#a19b90]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-medium">{enabledModels.length} Models Active</span>
                </span>
                <button
                  onClick={() => setActiveView('settings')}
                  className="text-[11px] text-[#c25e2e] dark:text-[#d97757] hover:underline"
                >
                  Manage
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#857e74] dark:text-[#7d776e]">
                <span>{connectedProviders.length} Providers Ready</span>
                <span className="font-mono text-[10px]">{settings.allowPaidUsage ? 'PAID ON' : 'FREE ONLY'}</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500" title={`${enabledModels.length} models active`} />
            </div>
          )}
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#faf8f5] dark:bg-[#181716]">
        {/* Top Header - Claude style minimal */}
        <header className="h-14 border-b border-[#e8e2d8] dark:border-[#33302c] bg-[#faf8f5]/90 dark:bg-[#181716]/90 backdrop-blur-xs flex items-center justify-between px-6 z-20 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-base font-semibold text-[#1f1e1d] dark:text-[#ede8e1]">
              {navItems.find((n) => n.id === activeView)?.label || 'TITAN AI'}
            </h1>
            <span className="text-[#c4bdb2] dark:text-[#4d4841]">/</span>
            <span className="text-xs text-[#787268] dark:text-[#9e988e] hidden sm:inline">
              {activeProject ? activeProject.name : 'Shared Context'}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Quick Model Selector Pill */}
            <button
              onClick={() => setActiveView('settings')}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#ded7cb] dark:border-[#383530] bg-white dark:bg-[#22201e] text-xs text-[#2e2c29] dark:text-[#ded8ce] hover:border-[#c25e2e] dark:hover:border-[#d97757] transition-colors cursor-pointer shadow-2xs"
            >
              <Cpu className="w-3.5 h-3.5 text-[#c25e2e] dark:text-[#d97757]" />
              <span>
                <strong className="text-[#c25e2e] dark:text-[#d97757]">{enabledModels.length}</strong> of{' '}
                {models.length} models
              </span>
            </button>

            {/* Paid API Usage Shield */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${
                settings.allowPaidUsage
                  ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-900'
                  : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium hidden sm:inline">
                {settings.allowPaidUsage ? 'Paid Allowed' : 'Strictly Free'}
              </span>
            </div>

            {/* Dark/Light Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-full border border-[#ded7cb] dark:border-[#383530] text-[#6e685e] dark:text-[#9e988e] hover:text-[#1f1e1d] dark:hover:text-[#ede8e1] hover:bg-[#ede7dc] dark:hover:bg-[#262421] transition-colors cursor-pointer"
              title={`Switch to ${settings.theme === 'dark' ? 'Light' : 'Dark'} theme`}
            >
              {settings.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 min-h-0 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
