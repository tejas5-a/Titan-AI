import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AgentRole, AgentTask } from '../../types';
import { MarkdownView } from '../common/MarkdownView';
import { StatusBadge } from '../common/StatusBadge';
import {
  Users2,
  Plus,
  Play,
  Trash2,
  Edit2,
  Check,
  X,
  Compass,
  Code2,
  CheckCircle2,
  Shield,
  BookOpen,
  Activity,
  Layers,
  FileText,
  Clock,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

export function AgentWorkspace() {
  const {
    agentRoles,
    updateAgentRole,
    agentTasks,
    createAgentTask,
    executeAgentTask,
    deleteAgentTask,
    models,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'tasks' | 'roles'>('tasks');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(
    agentTasks[0]?.id || null
  );

  // New task form state
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [taskObjective, setTaskObjective] = useState('');
  const [taskContext, setTaskContext] = useState('');
  const [assignedRoleId, setAssignedRoleId] = useState(agentRoles[0]?.id || '');

  // Edit role modal state
  const [editingRole, setEditingRole] = useState<AgentRole | null>(null);

  const selectedTask = agentTasks.find((t) => t.id === selectedTaskId);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskObjective.trim()) return;

    const newTask = createAgentTask({
      objective: taskObjective,
      inputContext: taskContext,
      assignedRoleId: assignedRoleId || agentRoles[0]?.id,
      dependencies: [],
    });

    setTaskObjective('');
    setTaskContext('');
    setShowNewTaskModal(false);
    setSelectedTaskId(newTask.id);
  };

  const getRoleIcon = (iconName: string) => {
    switch (iconName) {
      case 'Compass':
        return <Compass className="w-4 h-4 text-indigo-500" />;
      case 'Code':
        return <Code2 className="w-4 h-4 text-emerald-500" />;
      case 'CheckCircle2':
        return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
      case 'Shield':
        return <Shield className="w-4 h-4 text-rose-500" />;
      case 'BookOpen':
        return <BookOpen className="w-4 h-4 text-cyan-500" />;
      case 'Activity':
        return <Activity className="w-4 h-4 text-amber-500" />;
      case 'Layers':
        return <Layers className="w-4 h-4 text-purple-500" />;
      default:
        return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            <Users2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Agent Role Workspace</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configurable responsibilities with assigned underlying models, objective tracking, and transparent task execution.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
              activeTab === 'tasks'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            Tasks ({agentTasks.length})
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
              activeTab === 'roles'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            Role Definitions ({agentRoles.length})
          </button>
        </div>
      </div>

      {/* TASKS VIEW */}
      {activeTab === 'tasks' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Task list left column */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
              <span>Task Ledger</span>
              <button
                onClick={() => setShowNewTaskModal(true)}
                className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Task</span>
              </button>
            </div>

            {agentTasks.length === 0 ? (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-6 text-center text-xs text-slate-400 bg-white dark:bg-[#131620]">
                No tasks dispatched yet. Click "New Task" to assign an objective to an agent role.
              </div>
            ) : (
              <div className="space-y-2">
                {agentTasks.map((task) => {
                  const role = agentRoles.find((r) => r.id === task.assignedRoleId);
                  const isSelected = selectedTaskId === task.id;
                  return (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTaskId(task.id)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-500/60 shadow-xs'
                          : 'bg-white dark:bg-[#131620] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          {getRoleIcon(role?.iconName || 'FileText')}
                          {role?.name || 'Generalist'}
                        </span>
                        <StatusBadge status={task.status as any} />
                      </div>
                      <h4 className="text-xs font-medium text-slate-900 dark:text-slate-100 line-clamp-2">
                        {task.objective}
                      </h4>
                      <div className="text-[10px] text-slate-400 font-mono mt-2">
                        {new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Task detail right pane */}
          <div className="md:col-span-2">
            {selectedTask ? (
              <div className="rounded-2xl bg-white dark:bg-[#131620] border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <span className="font-mono text-slate-400 text-[11px]">TASK #{selectedTask.id.slice(-6)}</span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                      {selectedTask.objective}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedTask.status !== 'running' && (
                      <button
                        onClick={() => executeAgentTask(selectedTask.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium cursor-pointer shadow-xs"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{selectedTask.output ? 'Re-execute' : 'Execute Task'}</span>
                      </button>
                    )}
                    <button
                      onClick={() => deleteAgentTask(selectedTask.id)}
                      className="p-1.5 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                      title="Delete Task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="text-slate-500 font-medium">Assigned Specialist:</div>
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getRoleIcon(agentRoles.find((r) => r.id === selectedTask.assignedRoleId)?.iconName || '')}
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {agentRoles.find((r) => r.id === selectedTask.assignedRoleId)?.title}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-400">
                      Model: {agentRoles.find((r) => r.id === selectedTask.assignedRoleId)?.assignedModelId}
                    </span>
                  </div>
                </div>

                {selectedTask.inputContext && (
                  <div className="space-y-1 text-xs">
                    <div className="text-slate-500 font-medium">Input Context:</div>
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-mono text-xs whitespace-pre-wrap">
                      {selectedTask.inputContext}
                    </div>
                  </div>
                )}

                <div className="space-y-2 text-xs pt-2">
                  <div className="text-slate-500 font-medium flex items-center justify-between">
                    <span>Task Output & Resolution:</span>
                    <StatusBadge status={selectedTask.status as any} />
                  </div>
                  {selectedTask.status === 'running' ? (
                    <div className="p-8 text-center text-xs text-indigo-600 dark:text-indigo-400 animate-pulse flex items-center justify-center gap-2">
                      <Clock className="w-4 h-4 animate-spin" />
                      <span>Role specialist is executing task objective...</span>
                    </div>
                  ) : selectedTask.output ? (
                    <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                      <MarkdownView content={selectedTask.output} />
                    </div>
                  ) : selectedTask.error ? (
                    <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                      {selectedTask.error}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-400">
                      Task has not been run yet. Click "Execute Task" to begin.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-12">
                Select a task on the left or create a new one.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ROLES DEFINITION VIEW */}
      {activeTab === 'roles' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-500">
            Roles represent distinct operational responsibilities and instructions. You can map each role to an underlying model.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agentRoles.map((role) => (
              <div
                key={role.id}
                className="rounded-xl bg-white dark:bg-[#131620] border border-slate-200 dark:border-slate-800 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                      {getRoleIcon(role.iconName)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{role.title}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">Assigned: {role.assignedModelId}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingRole(role)}
                    className="p-1.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                    title="Edit Role Configuration"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {role.description}
                </p>

                <div className="text-[11px] p-2.5 rounded bg-slate-50 dark:bg-slate-900 text-slate-500 font-mono line-clamp-2">
                  {role.systemPrompt}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#131620] border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Create Specialist Task</h3>
              <button onClick={() => setShowNewTaskModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                  Task Objective
                </label>
                <input
                  type="text"
                  required
                  value={taskObjective}
                  onChange={(e) => setTaskObjective(e.target.value)}
                  placeholder="e.g. Audit authentication middleware for timing attack vectors"
                  className="w-full rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                  Assigned Specialist Role
                </label>
                <select
                  value={assignedRoleId}
                  onChange={(e) => setAssignedRoleId(e.target.value)}
                  className="w-full rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100"
                >
                  {agentRoles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title} ({r.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                  Input Context / Specifications (Optional)
                </label>
                <textarea
                  rows={3}
                  value={taskContext}
                  onChange={(e) => setTaskContext(e.target.value)}
                  placeholder="Provide file contents, error logs, or acceptance criteria..."
                  className="w-full rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 text-slate-900 dark:text-slate-100 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ROLE MODAL */}
      {editingRole && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#131620] border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Edit Role: {editingRole.title}</h3>
              <button onClick={() => setEditingRole(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Role Title</label>
                <input
                  type="text"
                  value={editingRole.title}
                  onChange={(e) => setEditingRole({ ...editingRole, title: e.target.value })}
                  className="w-full rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Underlying AI Model</label>
                <select
                  value={editingRole.assignedModelId}
                  onChange={(e) => setEditingRole({ ...editingRole, assignedModelId: e.target.value })}
                  className="w-full rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100"
                >
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.provider})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Specialist System Prompt</label>
                <textarea
                  rows={4}
                  value={editingRole.systemPrompt}
                  onChange={(e) => setEditingRole({ ...editingRole, systemPrompt: e.target.value })}
                  className="w-full rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  onClick={() => setEditingRole(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    updateAgentRole(editingRole);
                    setEditingRole(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
