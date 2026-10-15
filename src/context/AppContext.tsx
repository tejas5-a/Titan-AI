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
  UserSettings,
  FetchedModel,
  ProviderId,
} from '../types';
import { storage } from '../services/storage';

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
  addFetchedModels: (providerId: ProviderId, fetchedList: FetchedModel[]) => void;
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

  const addFetchedModels = (providerId: ProviderId, fetchedList: FetchedModel[]) => {
    const newDefinitions: ModelDefinition[] = fetchedList.map((f) => ({
      id: f.id,
      name: f.name || f.id,
      provider: providerId,
      isEnabled: true,
      isFree: true,
      contextWindow: f.contextWindow || '128k',
      capabilities: {
        vision: Boolean(f.supportsVision),
        coding: Boolean(f.supportsCoding),
        reasoning: true,
        fast: true,
        freeTier: true,
      },
      description: f.description || `${providerId.toUpperCase()} fetched model`,
    }));

    setModels((prev) => {
      const existingMap = new Map(prev.map((m) => [m.id, m]));
      newDefinitions.forEach((def) => {
        existingMap.set(def.id, def);
      });
      const updated = Array.from(existingMap.values());
      storage.saveModels(updated);
      return updated;
    });
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
      alert('Please enable at least one model in Settings or the Model Inspector.');
      return null;
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
      },
      rounds: {
        round1_independent: enabledModels.map((m) => ({
          modelId: m.id,
          modelName: m.name,
          provider: m.provider,
          status: 'running',
        })),
        round2_peerReview: [],
        round4_synthesis: {
          modelUsed: enabledModels[0].name,
          synthesisText: '',
        },
      },
      projectId: activeProject?.id,
    };

    setActiveSession(tempSession);
    setCollaborationProgress({ round: 'round1', message: `Dispatching to ${enabledModels.length} models concurrently...` });

    try {
      // Build conversation history for follow-up questions
      const historyMessages: Array<{ role: string; content: string }> = [];
      if (activeSession && activeSession.rounds.round4_synthesis.synthesisText) {
        historyMessages.push({ role: 'user', content: activeSession.userPrompt });
        historyMessages.push({ role: 'assistant', content: activeSession.rounds.round4_synthesis.synthesisText });
      }

      const payload = {
        prompt,
        models: enabledModels,
        history: historyMessages,
        roundsConfig: {
          peerReview: settings.autoPeerReview,
          maxConcurrency: settings.maxConcurrency,
          timeoutMs: settings.perRequestTimeoutSec * 1000,
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

      setSessions((prev) => [completedSession, ...prev.filter((s) => s.sessionId !== tempSession.sessionId)]);
      setActiveSession(completedSession);
      storage.saveSession(completedSession);
      setCollaborationProgress({ round: 'done', message: `Completed in ${data.totalLatencyMs}ms.` });
      return completedSession;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Collaboration aborted by user.');
      } else {
        const failedSession: CollaborationSession = {
          ...tempSession,
          status: 'failed',
          rounds: {
            ...tempSession.rounds,
            round4_synthesis: {
              modelUsed: enabledModels[0]?.name || 'Error',
              synthesisText: `### Collaboration Failed\n\n${err.message}`,
            },
          },
        };
        setActiveSession(failedSession);
      }
      return null;
    } finally {
      setIsCollaborating(false);
      setAbortController(null);
    }
  };

  // Projects
  const [projects, setProjects] = useState<Project[]>(() => storage.getProjects());
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  const createProject = (name: string, description: string, tags: string[] = []): Project => {
    const proj: Project = {
      id: 'proj_' + Date.now(),
      name,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      files: [],
      conversationIds: [],
      tags,
    };
    storage.saveProject(proj);
    setProjects((prev) => [proj, ...prev]);
    return proj;
  };

  const updateProject = (proj: Project) => {
    const updated = { ...proj, updatedAt: new Date().toISOString() };
    storage.saveProject(updated);
    setProjects((prev) => prev.map((p) => (p.id === proj.id ? updated : p)));
    if (activeProject?.id === proj.id) setActiveProject(updated);
  };

  const deleteProject = (id: string) => {
    storage.deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (activeProject?.id === id) setActiveProject(null);
  };

  // Knowledge Documents
  const [knowledgeDocs, setKnowledgeDocs] = useState<KnowledgeDocument[]>(() => storage.getDocuments());

  const addDocument = (docInput: Omit<KnowledgeDocument, 'id' | 'indexedAt'>) => {
    const doc: KnowledgeDocument = {
      ...docInput,
      id: 'doc_' + Date.now(),
      indexedAt: new Date().toISOString(),
    };
    storage.saveDocument(doc);
    setKnowledgeDocs((prev) => [doc, ...prev]);
  };

  const removeDocument = (id: string) => {
    storage.deleteDocument(id);
    setKnowledgeDocs((prev) => prev.filter((d) => d.id !== id));
  };

  // Agent Roles & Tasks
  const [agentRoles, setAgentRoles] = useState<AgentRole[]>(() => storage.getAgentRoles());
  const updateAgentRole = (role: AgentRole) => {
    storage.saveAgentRole(role);
    setAgentRoles((prev) => prev.map((r) => (r.id === role.id ? role : r)));
  };

  const reorderAgentRoles = (newRoles: AgentRole[]) => {
    setAgentRoles(newRoles);
    newRoles.forEach((r) => storage.saveAgentRole(r));
  };

  const [agentTasks, setAgentTasks] = useState<AgentTask[]>(() => storage.getAgentTasks());

  const createAgentTask = (taskInput: Omit<AgentTask, 'id' | 'createdAt' | 'status'>): AgentTask => {
    const task: AgentTask = {
      ...taskInput,
      id: 'task_' + Date.now(),
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    storage.saveAgentTask(task);
    setAgentTasks((prev) => [task, ...prev]);
    return task;
  };

  const executeAgentTask = async (taskId: string) => {
    const task = agentTasks.find((t) => t.id === taskId);
    if (!task) return;

    const role = agentRoles.find((r) => r.id === task.assignedRoleId);
    const assignedModel = models.find((m) => m.id === role?.assignedModelId);

    const updatedTask: AgentTask = { ...task, status: 'running' };
    setAgentTasks((prev) => prev.map((t) => (t.id === taskId ? updatedTask : t)));

    try {
      const res = await fetch('/api/generate-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: assignedModel?.provider || 'gemini',
          model: assignedModel?.id || 'gemini-1.5-flash',
          prompt: `${task.objective}\n\nContext:\n${task.inputContext}`,
          systemInstruction: role?.systemPrompt,
        }),
      });

      const data = await res.json();
      const completed: AgentTask = {
        ...task,
        status: res.ok ? 'completed' : 'failed',
        output: data.text || data.error || 'Execution failed',
        completedAt: new Date().toISOString(),
      };

      storage.saveAgentTask(completed);
      setAgentTasks((prev) => prev.map((t) => (t.id === taskId ? completed : t)));
    } catch (err: any) {
      const failed: AgentTask = {
        ...task,
        status: 'failed',
        error: err.message,
        completedAt: new Date().toISOString(),
      };
      storage.saveAgentTask(failed);
      setAgentTasks((prev) => prev.map((t) => (t.id === taskId ? failed : t)));
    }
  };

  const deleteAgentTask = (taskId: string) => {
    storage.deleteAgentTask(taskId);
    setAgentTasks((prev) => prev.filter((t) => t.id !== taskId));
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
        addFetchedModels,
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
