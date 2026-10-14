import {
  CollaborationSession,
  KnowledgeDocument,
  ModelDefinition,
  Project,
  AgentRole,
  AgentTask,
  UsageRecord,
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
  USAGE_RECORDS: 'titan_usage_records_v1',
};

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',
  allowPaidUsage: false, // Default is strictly OFF per requirements
  autoPeerReview: true,
  autoDebate: false,
  synthesisModel: 'gemini-3.8-flash',
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
    assignedModelId: 'gemini-3.8-flash',
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
    assignedModelId: 'qwen/qwen-2.5-coder-32b-instruct:free',
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
    assignedModelId: 'deepseek/deepseek-r1:free',
    isEnabled: true,
    order: 3,
    iconName: 'CheckCircle2',
  },
  {
    id: 'role-security',
    name: 'Security Reviewer',
    title: 'Application Security Engineer',
    description: 'Audits authentication, injection vectors, key leakage risks, and input sanitization.',
    systemPrompt: 'You are an Application Security Specialist. Audit for OWASP top 10 vulnerabilities, credential leakage, and SSRF.',
    assignedModelId: 'meta-llama/llama-3.3-70b-instruct:free',
    isEnabled: true,
    order: 4,
    iconName: 'Shield',
  },
  {
    id: 'role-researcher',
    name: 'Researcher',
    title: 'Technical Intelligence Researcher',
    description: 'Investigates academic papers, industry benchmarks, and empirical literature.',
    systemPrompt: 'You are the Deep Technical Researcher. Synthesize empirical findings, cite valid sources, and detect contradictions.',
    assignedModelId: 'gemini-3.8-flash',
    isEnabled: true,
    order: 5,
    iconName: 'BookOpen',
  },
  {
    id: 'role-tester',
    name: 'Tester',
    title: 'QA & Verification Specialist',
    description: 'Designs test matrices, fuzzing scenarios, and automated verification suites.',
    systemPrompt: 'You are a QA Verification Specialist. Construct unit tests, edge-case matrices, and integration mocks.',
    assignedModelId: 'gemini-3.1-flash-lite',
    isEnabled: true,
    order: 6,
    iconName: 'Activity',
  },
  {
    id: 'role-designer',
    name: 'Designer',
    title: 'UX/UI Design Systems Lead',
    description: 'Ensures ergonomic user workflows, aesthetic elegance, and accessibility standards.',
    systemPrompt: 'You are the UX/UI Systems Lead. Enforce clean typography, visual hierarchy, responsive layouts, and WCAG AA contrast.',
    assignedModelId: 'gemini-3.8-flash',
    isEnabled: true,
    order: 7,
    iconName: 'Layers',
  },
  {
    id: 'role-writer',
    name: 'Technical Writer',
    title: 'Documentation Specialist',
    description: 'Produces publication-ready architecture decision records (ADRs) and API guides.',
    systemPrompt: 'You are the Senior Technical Writer. Create crisp, structured markdown documentation with diagrams and examples.',
    assignedModelId: 'meta-llama/llama-3.3-70b-instruct:free',
    isEnabled: true,
    order: 8,
    iconName: 'FileText',
  },
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj_collective_kernel',
    name: 'TITAN Kernel Architecture',
    description: 'Distributed multi-model reasoning pipeline with bounded worker concurrency and dynamic peer review.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
    conversationIds: [],
    tags: ['Core', 'Distributed', 'AI Orchestration'],
    files: [
      {
        id: 'file_1',
        name: 'orchestrator.ts',
        path: 'src/engine/orchestrator.ts',
        language: 'typescript',
        updatedAt: new Date().toISOString(),
        content: `// TITAN Multi-Model Orchestration Engine
export interface OrchestratorConfig {
  maxConcurrency: number;
  timeoutMs: number;
}

export class CollaborationPipeline {
  async executeRoundOne(prompt: string, models: string[]) {
    // Dispatch to eligible models
    return Promise.allSettled(models.map(m => this.callModel(m, prompt)));
  }
}`,
      },
      {
        id: 'file_2',
        name: 'contracts.ts',
        path: 'src/types/contracts.ts',
        language: 'typescript',
        updatedAt: new Date().toISOString(),
        content: `export interface ModelResult {
  modelId: string;
  response: string;
  latencyMs: number;
}`,
      },
    ],
  },
];

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
      if (!data) return INITIAL_MODELS;
      const parsed = JSON.parse(data);
      // Merge with any new initial models if missing
      const existingIds = new Set(parsed.map((m: any) => m.id));
      const merged = [...parsed];
      for (const m of INITIAL_MODELS) {
        if (!existingIds.has(m.id)) {
          merged.push(m);
        }
      }
      return merged;
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

  // Sessions (Conversations)
  getSessions(): CollaborationSession[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveSessions(sessions: CollaborationSession[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to save sessions:', e);
    }
  },
  saveSession(session: CollaborationSession): void {
    const sessions = this.getSessions();
    const idx = sessions.findIndex((s) => s.sessionId === session.sessionId);
    if (idx >= 0) {
      sessions[idx] = session;
    } else {
      sessions.unshift(session);
    }
    this.saveSessions(sessions);
  },
  deleteSession(sessionId: string): void {
    const sessions = this.getSessions().filter((s) => s.sessionId !== sessionId);
    this.saveSessions(sessions);
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

  // Usage Records
  getUsageRecords(): UsageRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USAGE_RECORDS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  addUsageRecord(record: UsageRecord): void {
    const records = this.getUsageRecords();
    records.unshift(record);
    if (records.length > 500) records.length = 500;
    try {
      localStorage.setItem(STORAGE_KEYS.USAGE_RECORDS, JSON.stringify(records));
    } catch (e) {
      console.error('Failed to save usage record:', e);
    }
  },
};
