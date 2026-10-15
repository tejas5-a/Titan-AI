export type ProviderId = 'gemini' | 'openrouter' | 'groq' | 'cerebras' | 'ollama' | 'custom';

export interface Provider {
  id: ProviderId;
  name: string;
  status: 'connected' | 'needs_key' | 'configurable' | 'disconnected' | 'disabled';
  hasKey: boolean;
  description: string;
  baseUrl?: string;
  apiKey?: string;
  modelsCount: number;
  supportsStreaming: boolean;
  supportsVision: boolean;
  selectedModels?: string[];
  fetchedModels?: FetchedModel[];
}

export interface FetchedModel {
  id: string;
  name: string;
  provider: ProviderId;
  description?: string;
  contextWindow?: string;
  supportsVision?: boolean;
  supportsCoding?: boolean;
}

export interface ModelCapability {
  vision: boolean;
  coding: boolean;
  reasoning: boolean;
  fast: boolean;
  freeTier: boolean;
}

export interface ModelDefinition {
  id: string;
  name: string;
  provider: ProviderId;
  isEnabled: boolean;
  isFree: boolean;
  contextWindow: string;
  capabilities: ModelCapability;
  description: string;
  family?: string;
}

export interface ModelUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface ModelResponseItem {
  modelId: string;
  modelName: string;
  provider: ProviderId;
  status: 'pending' | 'running' | 'completed' | 'failed';
  response?: string;
  error?: string;
  latencyMs?: number;
  usage?: ModelUsage;
  isSimulated?: boolean;
}

export interface PeerReviewItem {
  reviewerId: string;
  reviewerName: string;
  status: 'completed' | 'failed' | 'running';
  critique?: string;
  error?: string;
  latencyMs?: number;
}

export interface SynthesisOutput {
  modelUsed: string;
  synthesisText: string;
  latencyMs?: number;
}

export interface CollaborationSession {
  sessionId: string;
  timestamp: string;
  userPrompt: string;
  attachedImage?: string;
  totalLatencyMs?: number;
  status: 'idle' | 'running' | 'completed' | 'cancelled' | 'failed';
  summary: {
    selectedCount: number;
    contactedCount: number;
    respondedCount: number;
    failedCount: number;
    peerReviewsCount: number;
    debatesCount?: number;
  };
  rounds: {
    round1_independent: ModelResponseItem[];
    round2_peerReview: PeerReviewItem[];
    round3_debate?: any[];
    round4_synthesis: SynthesisOutput;
  };
  projectId?: string;
  isArchived?: boolean;
}

export interface ProjectFile {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  isArchived?: boolean;
  files: ProjectFile[];
  conversationIds: string[];
  tags: string[];
}

export interface AgentRole {
  id: string;
  name: string;
  title: string;
  description: string;
  systemPrompt: string;
  assignedModelId: string;
  isEnabled: boolean;
  order: number;
  iconName: string;
}

export interface AgentTask {
  id: string;
  objective: string;
  inputContext: string;
  assignedRoleId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  output?: string;
  error?: string;
  dependencies: string[];
  createdAt: string;
  completedAt?: string;
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  content: string;
  chunkCount: number;
  indexedAt: string;
  summary?: string;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  allowPaidUsage: boolean;
  autoPeerReview: boolean;
  autoDebate?: boolean;
  synthesisModel: string;
  maxConcurrency: number;
  perRequestTimeoutSec: number;
  activeProjectId?: string;
  codeAutoFormat: boolean;
  soundEffects: boolean;
}

export type NavigationDestination =
  | 'home'
  | 'chat'
  | 'research'
  | 'coding'
  | 'vision'
  | 'knowledge'
  | 'agents'
  | 'projects'
  | 'history'
  | 'settings';
