import {
  CollaborationSession,
  KnowledgeDocument,
  ModelDefinition,
  Project,
  AgentRole,
  AgentTask,
  UserSettings,
} from '../types';
import { INITIAL_MODELS } from './defaultModels';

const STORAGE_KEYS = {
  SETTINGS: 'titan_settings_v1',
  MODELS: 'titan_models_v1',
  SESSIONS: 'titan_sessions_v1',
  PROJECTS: 'titan_projects_v1',
  DOCUMENTS: 'titan_documents_v1',
  AGENT_ROLES: 'titan_agent_roles_v1',
  AGENT_TASKS: 'titan_agent_tasks_v1',
};

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',
  allowPaidUsage: false,
  autoPeerReview: true,
  autoDebate: false,
  synthesisModel: 'gemini-1.5-flash',
  maxConcurrency: 4,
  perRequestTimeoutSec: 35,
  codeAutoFormat: true,
  soundEffects: false,
};

export const DEFAULT_AGENT_ROLES: AgentRole[] = [
  {
    id: 'role-architect',
    name: 'Architect',
    title: 'Principal Systems Architect',
    description: 'Deconstructs requirements into scalable patterns, interfaces, and invariant constraints.',
    systemPrompt: 'You are the Principal Systems Architect. Evaluate system topology, modular boundaries, resilience patterns, and failure modes.',
    assignedModelId: 'gemini-1.5-flash',
    isEnabled: true,
    order: 1,
    iconName: 'Compass',
  },
  {
    id: 'role-developer',
    name: 'Developer',
    title: 'Lead Software Engineer',
    description: 'Implements production-grade TypeScript/Node logic with high cohesion and defensive error handling.',
    systemPrompt: 'You are the Lead Software Engineer. Write concise, idiomatic, fully typed code with rigorous edge case checks.',
    assignedModelId: 'gemini-1.5-flash',
    isEnabled: true,
    order: 2,
    iconName: 'Code',
  },
  {
    id: 'role-reviewer',
    name: 'Reviewer',
    title: 'Senior Code Reviewer',
    description: 'Conducts adversarial code reviews checking for race conditions, leaks, and logic gaps.',
    systemPrompt: 'You are a Senior Code Reviewer. Find subtle bugs, performance bottlenecks, and architectural violations.',
    assignedModelId: 'gemini-1.5-flash',
    isEnabled: true,
    order: 3,
    iconName: 'CheckCircle2',
  },
];

export const INITIAL_PROJECTS: Project[] = [];

export const storage = {
  // Settings
  getSettings(): UserSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },
  saveSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  },

  // Models
  getModels(): ModelDefinition[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MODELS);
      return data ? JSON.parse(data) : INITIAL_MODELS;
    } catch {
      return INITIAL_MODELS;
    }
  },
  saveModels(models: ModelDefinition[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.MODELS, JSON.stringify(models));
    } catch (e) {
      console.error('Failed to save models:', e);
    }
  },

  // Sessions
  getSessions(): CollaborationSession[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveSession(session: CollaborationSession): void {
    try {
      const sessions = this.getSessions().filter((s) => s.sessionId !== session.sessionId);
      sessions.unshift(session);
      if (sessions.length > 50) sessions.length = 50;
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to save session:', e);
    }
  },
  deleteSession(sessionId: string): void {
    try {
      const sessions = this.getSessions().filter((s) => s.sessionId !== sessionId);
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to delete session:', e);
    }
  },

  // Projects
  getProjects(): Project[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      return data ? JSON.parse(data) : INITIAL_PROJECTS;
    } catch {
      return INITIAL_PROJECTS;
    }
  },
  saveProjects(projects: Project[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    } catch (e) {
      console.error('Failed to save projects:', e);
    }
  },
  saveProject(project: Project): void {
    const projects = this.getProjects().filter((p) => p.id !== project.id);
    projects.unshift(project);
    this.saveProjects(projects);
  },
  deleteProject(id: string): void {
    const projects = this.getProjects().filter((p) => p.id !== id);
    this.saveProjects(projects);
  },

  // Knowledge Documents
  getDocuments(): KnowledgeDocument[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveDocuments(docs: KnowledgeDocument[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
    } catch (e) {
      console.error('Failed to save documents:', e);
    }
  },
  saveDocument(doc: KnowledgeDocument): void {
    const docs = this.getDocuments().filter((d) => d.id !== doc.id);
    docs.unshift(doc);
    this.saveDocuments(docs);
  },
  deleteDocument(id: string): void {
    const docs = this.getDocuments().filter((d) => d.id !== id);
    this.saveDocuments(docs);
  },

  // Agent Roles
  getAgentRoles(): AgentRole[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AGENT_ROLES);
      return data ? JSON.parse(data) : DEFAULT_AGENT_ROLES;
    } catch {
      return DEFAULT_AGENT_ROLES;
    }
  },
  saveAgentRoles(roles: AgentRole[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.AGENT_ROLES, JSON.stringify(roles));
    } catch (e) {
      console.error('Failed to save agent roles:', e);
    }
  },
  saveAgentRole(role: AgentRole): void {
    const roles = this.getAgentRoles().filter((r) => r.id !== role.id);
    roles.push(role);
    this.saveAgentRoles(roles);
  },

  // Agent Tasks
  getAgentTasks(): AgentTask[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AGENT_TASKS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveAgentTasks(tasks: AgentTask[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.AGENT_TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save agent tasks:', e);
    }
  },
  saveAgentTask(task: AgentTask): void {
    const tasks = this.getAgentTasks().filter((t) => t.id !== task.id);
    tasks.unshift(task);
    this.saveAgentTasks(tasks);
  },
  deleteAgentTask(id: string): void {
    const tasks = this.getAgentTasks().filter((t) => t.id !== id);
    this.saveAgentTasks(tasks);
  },
};
