import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  CollaborationSession,
  KnowledgeDocument,
  ModelDefinition,
  NavigationDestination,
  Project,
  Provider,
  AgentRole,
  AgentTask,
  UsageRecord,
  UserSettings,
} from '../types';
import { storage, DEFAULT_SETTINGS } from '../services/storage';

interface AppContextValue {
  activeView: NavigationDestination;
  setActiveView: (view: NavigationDestination) => void;
  providers: Provider[];
  refreshProviders: () => Promise<void>;
  models: ModelDefinition[];
  toggleModel: (modelId: string) => void;
  enableAllModels: () => void;
  disableAllModels: () => void;
  updateModel: (model: ModelDefinition) => void;
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  sessions: CollaborationSession[];
  activeSession: CollaborationSession | null;
  setActiveSession: (session: CollaborationSession | null) => void;
  newChat: () => void;
  deleteSession: (sessionId: string) => void;
  isCollaborating: boolean;
  collaborationProgress: {
    round: 'idle' | 'round1' | 'round2' | 'round3' | 'round4' | 'done';
    message: string;
  };
  runCollaboration: (prompt: string, attachedImage?: string) => Promise<CollaborationSession | null>;
  cancelCollaboration: () => void;
  projects: Project[];
  activeProject: Project | null;
  setActiveProject: (proj: Project | null) => void;
  createProject: (name: string, description: string, tags?: string[]) => Project;
  updateProject: (proj: Project) => void;
  deleteProject: (id: string) => void;
  knowledgeDocs: KnowledgeDocument[];
  addDocument: (doc: Omit<KnowledgeDocument, 'id' | 'indexedAt'>) => void;
  removeDocument: (id: string) => void;
  agentRoles: AgentRole[];
  updateAgentRole: (role: AgentRole) => void;
  reorderAgentRoles: (newRoles: AgentRole[]) => void;
  agentTasks: AgentTask[];
  createAgentTask: (task: Omit<AgentTask, 'id' | 'createdAt' | 'status'>) => AgentTask;
  executeAgentTask: (taskId: string) => Promise<void>;
  deleteAgentTask: (taskId: string) => void;
  usageRecords: UsageRecord[];
  refreshUsage: () => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  inspectorOpen: boolean;
  setInspectorOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [activeView, setActiveView] = useState<NavigationDestination>('home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [inspectorOpen, setInspectorOpen] = useState<boolean>(true);

  // Settings & Theme
  const [settings, setSettings] = useState<UserSettings>(() => storage.getSettings());
  useEffect(() => {
    storage.saveSettings(settings);
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Providers
  const [providers, setProviders] = useState<Provider[]>([]);
  const refreshProviders = useCallback(async () => {
    try {
      const res = await fetch('/api/providers');
      if (res.ok) {
        const data = await res.json();
        setProviders(data.providers || []);
      }
    } catch (e) {
      console.warn('Failed to fetch providers:', e);
    }
  }, []);

  useEffect(() => {
    refreshProviders();
  }, [refreshProviders]);

  // Models
  const [models, setModels] = useState<ModelDefinition[]>(() => storage.getModels());
  useEffect(() => {
    storage.saveModels(models);
  }, [models]);

  const toggleModel = (modelId: string) => {
    setModels((prev) =>
      prev.map((m) => (m.id === modelId ? { ...m, isEnabled: !m.isEnabled } : m))
    );
  };

  const enableAllModels = () => {
    setModels((prev) => prev.map((m) => ({ ...m, isEnabled: true })));
  };

  const disableAllModels = () => {
    setModels((prev) => prev.map((m) => ({ ...m, isEnabled: false })));
  };

  const updateModel = (updated: ModelDefinition) => {
    setModels((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  };

  // Sessions
  const [sessions, setSessions] = useState<CollaborationSession[]>(() => storage.getSessions());
  const [activeSession, setActiveSession] = useState<CollaborationSession | null>(() => {
    const list = storage.getSessions();
    return list.length > 0 ? list[0] : null;
  });

  const newChat = () => {
    setActiveSession(null);
    setActiveView('chat');
  };

  const deleteSession = (sessionId: string) => {
    storage.deleteSession(sessionId);
    const updated = sessions.filter((s) => s.sessionId !== sessionId);
    setSessions(updated);
    if (activeSession?.sessionId === sessionId) {
      setActiveSession(updated.length > 0 ? updated[0] : null);
    }
  };

  // Collaboration state
  const [isCollaborating, setIsCollaborating] = useState<boolean>(false);
  const [collaborationProgress, setCollaborationProgress] = useState<{
    round: 'idle' | 'round1' | 'round2' | 'round3' | 'round4' | 'done';
    message: string;
  }>({ round: 'idle', message: '' });

  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const cancelCollaboration = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    setIsCollaborating(false);
    setCollaborationProgress({ round: 'done', message: 'Collaboration cancelled by user.' });
    if (activeSession && activeSession.status === 'running') {
      const updated: CollaborationSession = {
        ...activeSession,
        status: 'cancelled',
      };
      setActiveSession(updated);
      storage.saveSession(updated);
      setSessions((prev) => prev.map((s) => (s.sessionId === updated.sessionId ? updated : s)));
    }
  };

  const runCollaboration = async (prompt: string, attachedImage?: string): Promise<CollaborationSession | null> => {
    const enabledModels = models.filter((m) => m.isEnabled);
    if (enabledModels.length === 0) {
      alert('Please enable at least one model to run a collaboration.');
      return null;
    }

    // Safety check for paid usage
    if (!settings.allowPaidUsage) {
      const paidModels = enabledModels.filter((m) => !m.isFree);
      if (paidModels.length > 0) {
        alert(
          `"Allow paid API usage" is turned OFF in Settings, but paid model(s) (${paidModels
            .map((p) => p.name)
            .join(', ')}) were selected. Please disable them or enable paid usage in Settings.`
        );
        return null;
      }
    }

    const controller = new AbortController();
    setAbortController(controller);
    setIsCollaborating(true);

    const tempSession: CollaborationSession = {
      sessionId: 'sess_' + Date.now(),
      timestamp: new Date().toISOString(),
      userPrompt: prompt,
      attachedImage,
      status: 'running',
      summary: {
        selectedCount: enabledModels.length,
        contactedCount: enabledModels.length,
        respondedCount: 0,
        failedCount: 0,
        peerReviewsCount: 0,
        debatesCount: 0,
      },
      rounds: {
        round1_independent: enabledModels.map((m) => ({
          modelId: m.id,
          modelName: m.name,
          provider: m.provider,
          status: 'running',
        })),
        round2_peerReview: [],
        round3_debate: [],
        round4_synthesis: {
          modelUsed: settings.synthesisModel,
          synthesisText: '',
        },
      },
      projectId: activeProject?.id,
    };

    setActiveSession(tempSession);
    setCollaborationProgress({ round: 'round1', message: `Dispatching to ${enabledModels.length} models concurrently...` });

    try {
      const payload = {
        prompt,
        models: enabledModels,
        roundsConfig: {
          peerReview: settings.autoPeerReview,
          debate: settings.autoDebate,
          synthesis: true,
          maxConcurrency: settings.maxConcurrency,
          timeoutMs: settings.perRequestTimeoutSec * 1000,
          synthesisModel: settings.synthesisModel,
        },
        attachedImage,
      };

      const res = await fetch('/api/collaborate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with ${res.status}`);
      }

      const data = await res.json();
      const completedSession: CollaborationSession = {
        sessionId: data.sessionId,
        timestamp: data.timestamp,
        userPrompt: data.userPrompt,
        attachedImage,
        totalLatencyMs: data.totalLatencyMs,
        status: 'completed',
        summary: data.summary,
        rounds: data.rounds,
        projectId: activeProject?.id,
      };

      // Record usage telemetry
      data.rounds.round1_independent.forEach((item: any) => {
        if (item.usage) {
          storage.addUsageRecord({
            id: 'usg_' + Math.random().toString(36).substring(2, 9),
            timestamp: new Date().toISOString(),
            sessionId: data.sessionId,
            modelId: item.modelId,
            modelName: item.modelName,
            provider: item.provider,
            promptTokens: item.usage.promptTokens || 0,
            completionTokens: item.usage.completionTokens || 0,
            totalTokens: item.usage.totalTokens || 0,
            latencyMs: item.latencyMs || 0,
            isPaid: false,
            estimatedCostUsd: 0,
          });
        }
      });

      setSessions((prev) => [completedSession, ...prev.filter((s) => s.sessionId !== tempSession.sessionId)]);
      setActiveSession(completedSession);
      storage.saveSession(completedSession);
      setCollaborationProgress({ round: 'done', message: `Completed in ${data.totalLatencyMs}ms.` });
      setIsCollaborating(false);
      return completedSession;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return null;
      }
      console.error('Collaboration failed:', err);
      const failedSession: CollaborationSession = {
        ...tempSession,
        status: 'failed',
      };
      setActiveSession(failedSession);
      storage.saveSession(failedSession);
      setCollaborationProgress({ round: 'done', message: `Error: ${err.message}` });
      setIsCollaborating(false);
      return failedSession;
    }
  };

  // Projects
  const [projects, setProjects] = useState<Project[]>(() => storage.getProjects());
  const [activeProject, setActiveProject] = useState<Project | null>(() => {
    const list = storage.getProjects();
    return list.length > 0 ? list[0] : null;
  });

  useEffect(() => {
    storage.saveProjects(projects);
  }, [projects]);

  const createProject = (name: string, description: string, tags: string[] = []) => {
    const newProj: Project = {
      id: 'proj_' + Date.now(),
      name,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      conversationIds: [],
      tags,
      files: [
        {
          id: 'file_' + Date.now(),
          name: 'README.md',
          path: 'README.md',
          language: 'markdown',
          updatedAt: new Date().toISOString(),
          content: `# ${name}\n\n${description}\n\n*Created in TITAN AI Project Workspace.*`,
        },
      ],
    };
    setProjects((prev) => [newProj, ...prev]);
    setActiveProject(newProj);
    return newProj;
  };

  const updateProject = (updated: Project) => {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : p)));
    if (activeProject?.id === updated.id) {
      setActiveProject(updated);
    }
  };

  const deleteProject = (id: string) => {
    const updated = projects.filter((p) => p.id !== id);
    setProjects(updated);
    if (activeProject?.id === id) {
      setActiveProject(updated.length > 0 ? updated[0] : null);
    }
  };

  // Knowledge Documents
  const [knowledgeDocs, setKnowledgeDocs] = useState<KnowledgeDocument[]>(() => storage.getDocuments());
  useEffect(() => {
    storage.saveDocuments(knowledgeDocs);
  }, [knowledgeDocs]);

  const addDocument = (docData: Omit<KnowledgeDocument, 'id' | 'indexedAt'>) => {
    const newDoc: KnowledgeDocument = {
      ...docData,
      id: 'doc_' + Date.now(),
      indexedAt: new Date().toISOString(),
    };
    setKnowledgeDocs((prev) => [newDoc, ...prev]);
  };

  const removeDocument = (id: string) => {
    setKnowledgeDocs((prev) => prev.filter((d) => d.id !== id));
  };

  // Agent Roles & Tasks
  const [agentRoles, setAgentRoles] = useState<AgentRole[]>(() => storage.getAgentRoles());
  useEffect(() => {
    storage.saveAgentRoles(agentRoles);
  }, [agentRoles]);

  const updateAgentRole = (role: AgentRole) => {
    setAgentRoles((prev) => prev.map((r) => (r.id === role.id ? role : r)));
  };

  const reorderAgentRoles = (newRoles: AgentRole[]) => {
    const ordered = newRoles.map((r, i) => ({ ...r, order: i + 1 }));
    setAgentRoles(ordered);
  };

  const [agentTasks, setAgentTasks] = useState<AgentTask[]>(() => storage.getAgentTasks());
  useEffect(() => {
    storage.saveAgentTasks(agentTasks);
  }, [agentTasks]);

  const createAgentTask = (taskData: Omit<AgentTask, 'id' | 'createdAt' | 'status'>): AgentTask => {
    const newTask: AgentTask = {
      ...taskData,
      id: 'task_' + Date.now(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setAgentTasks((prev) => [newTask, ...prev]);
    return newTask;
  };

  const executeAgentTask = async (taskId: string) => {
    const task = agentTasks.find((t) => t.id === taskId);
    if (!task) return;

    const role = agentRoles.find((r) => r.id === task.assignedRoleId);
    const assignedModel = models.find((m) => m.id === role?.assignedModelId) || models[0];

    setAgentTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'running' } : t))
    );

    try {
      const prompt = `ROLE: ${role?.title || 'Specialist'}\nINSTRUCTION: ${role?.systemPrompt || ''}\n\nTASK OBJECTIVE: ${task.objective}\nINPUT CONTEXT: ${task.inputContext || 'None'}\n\nExecute this objective comprehensively and provide structured output.`;

      const res = await fetch('/api/generate-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: assignedModel?.provider || 'gemini',
          model: assignedModel?.id || 'gemini-3.8-flash',
          prompt,
        }),
      });

      if (!res.ok) throw new Error(`Task execution failed (${res.status})`);
      const data = await res.json();

      setAgentTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: 'completed',
                output: data.text,
                completedAt: new Date().toISOString(),
              }
            : t
        )
      );
    } catch (err: any) {
      setAgentTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: 'failed',
                error: err.message,
                completedAt: new Date().toISOString(),
              }
            : t
        )
      );
    }
  };

  const deleteAgentTask = (taskId: string) => {
    setAgentTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // Usage records
  const [usageRecords, setUsageRecords] = useState<UsageRecord[]>(() => storage.getUsageRecords());
  const refreshUsage = () => {
    setUsageRecords(storage.getUsageRecords());
  };

  return (
    <AppContext.Provider
      value={{
        activeView,
        setActiveView,
        providers,
        refreshProviders,
        models,
        toggleModel,
        enableAllModels,
        disableAllModels,
        updateModel,
        settings,
        updateSettings,
        sessions,
        activeSession,
        setActiveSession,
        newChat,
        deleteSession,
        isCollaborating,
        collaborationProgress,
        runCollaboration,
        cancelCollaboration,
        projects,
        activeProject,
        setActiveProject,
        createProject,
        updateProject,
        deleteProject,
        knowledgeDocs,
        addDocument,
        removeDocument,
        agentRoles,
        updateAgentRole,
        reorderAgentRoles,
        agentTasks,
        createAgentTask,
        executeAgentTask,
        deleteAgentTask,
        usageRecords,
        refreshUsage,
        sidebarCollapsed,
        setSidebarCollapsed,
        inspectorOpen,
        setInspectorOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
