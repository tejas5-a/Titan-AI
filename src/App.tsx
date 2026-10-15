import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AppShell } from './components/layout/AppShell';
import { HomeDashboard } from './components/views/HomeDashboard';
import { CollectiveChat } from './components/views/CollectiveChat';
import { DeepResearchStudio } from './components/views/DeepResearchStudio';
import { CodingStudio } from './components/views/CodingStudio';
import { VisionStudio } from './components/views/VisionStudio';
import { KnowledgeBaseView } from './components/views/KnowledgeBaseView';
import { AgentWorkspace } from './components/views/AgentWorkspace';
import { ProjectsView } from './components/views/ProjectsView';
import { HistoryView } from './components/views/HistoryView';
import { SettingsView } from './components/views/SettingsView';

function ViewRouter() {
  const { activeView } = useApp();

  switch (activeView) {
    case 'home':
      return <HomeDashboard />;
    case 'chat':
      return <CollectiveChat />;
    case 'research':
      return <DeepResearchStudio />;
    case 'coding':
      return <CodingStudio />;
    case 'vision':
      return <VisionStudio />;
    case 'knowledge':
      return <KnowledgeBaseView />;
    case 'agents':
      return <AgentWorkspace />;
    case 'projects':
      return <ProjectsView />;
    case 'history':
      return <HistoryView />;
    case 'settings':
      return <SettingsView />;
    default:
      return <HomeDashboard />;
  }
}

export default function App() {
  return (
    <AppProvider>
      <AppShell>
        <ViewRouter />
      </AppShell>
    </AppProvider>
  );
}
