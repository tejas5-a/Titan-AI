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

  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [taskObjective, setTaskObjective] = useState('');
  const [taskContext, setTaskContext] = useState('');
  const [assignedRoleId, setAssignedRoleId] = useState(agentRoles[0]?.id || '');

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
    return <FileText className="w-4 h-4 text-[#c25e2e] dark:text-[#d97757]" />;
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      {/* Claude Style Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#e8e2d8] dark:border-[#33302c]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#f5f0e6] dark:bg-[#282622] text-[#c25e2e] dark:text-[#d97757] border border-[#e5ded0] dark:border-[#38342e]">
            <Users2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-semibold text-[#1f1e1d] dark:text-[#ede8e1]">Agent Role Workspace</h2>
            <p className="text-xs text-[#736e65] dark:text-[#9e978b]">
              Configurable responsibilities with assigned underlying models, objective tracking, and transparent task execution.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
              activeTab === 'tasks'
                ? 'bg-[#c25e2e] text-white shadow-xs'
                : 'bg-white dark:bg-[#22201e] text-[#615c54] dark:text-[#9e988e] border border-[#ded7cb] dark:border-[#383530]'
            }`}
          >
            Tasks ({agentTasks.length})
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
              activeTab === 'roles'
                ? 'bg-[#c25e2e] text-white shadow-xs'
                : 'bg-white dark:bg-[#22201e] text-[#615c54] dark:text-[#9e988e] border border-[#ded7cb] dark:border-[#383530]'
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
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#8a8377] dark:text-[#8f887f]">
              <span>Task Ledger</span>
              <button
                onClick={() => setShowNewTaskModal(true)}
                className="flex items-center gap-1 text-[#c25e2e] dark:text-[#d97757] hover:underline cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Task</span>
              </button>
            </div>

            {agentTasks.length === 0 ? (
              <div className="rounded-2xl border border-[#ded7cb] dark:border-[#383530] p-6 text-center text-xs text-[#8c857b] bg-white dark:bg-[#22201e]">
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
                      className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-white dark:bg-[#282623] border-[#c25e2e]/60 dark:border-[#d97757]/60 shadow-2xs ring-1 ring-[#c25e2e]/20'
                          : 'bg-white dark:bg-[#22201e] border-[#ded7cb] dark:border-[#383530] hover:border-[#c25e2e]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-serif font-semibold text-[#1f1e1d] dark:text-[#ede8e1]">
                          {role?.name || 'Generalist'}
                        </span>
                        <StatusBadge status={task.status as any} />
                      </div>
                      <h4 className="text-xs font-medium text-[#2e2c29] dark:text-[#ded8ce] line-clamp-2">
                        {task.objective}
                      </h4>
                      <div className="text-[10px] text-[#8c857b] font-mono mt-2">
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
              <div className="rounded-2xl bg-white dark:bg-[#22201e] border border-[#ded7cb] dark:border-[#383530] p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-[#f0ebd5] dark:border-[#2d2a27] text-xs">
                  <div>
                    <span className="font-mono text-[#8c857b] text-[11px]">TASK #{selectedTask.id.slice(-6)}</span>
                    <h3 className="font-serif text-base font-semibold text-[#1f1e1d] dark:text-[#ede8e1] mt-0.5">
                      {selectedTask.objective}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedTask.status !== 'running' && (
                      <button
                        onClick={() => executeAgentTask(selectedTask.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#c25e2e] hover:bg-[#b05225] text-white text-xs font-medium cursor-pointer shadow-xs"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{selectedTask.output ? 'Re-execute' : 'Execute Task'}</span>
                      </button>
                    )}
                    <button
                      onClick={() => deleteAgentTask(selectedTask.id)}
                      className="p-1.5 rounded-lg text-[#8c857b] hover:text-rose-600 cursor-pointer"
                      title="Delete Task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="text-[#736e65] dark:text-[#9e978b] font-medium">Assigned Specialist:</div>
                  <div className="p-2.5 rounded-xl bg-[#fbfaf8] dark:bg-[#1a1917] border border-[#ded7cb] dark:border-[#383530] flex items-center justify-between">
                    <span className="font-serif font-semibold text-[#1f1e1d] dark:text-[#ede8e1]">
                      {agentRoles.find((r) => r.id === selectedTask.assignedRoleId)?.title}
                    </span>
                    <span className="font-mono text-[11px] text-[#8c857b]">
                      Model: {agentRoles.find((r) => r.id === selectedTask.assignedRoleId)?.assignedModelId}
                    </span>
                  </div>
                </div>

                {selectedTask.inputContext && (
                  <div className="space-y-1 text-xs">
                    <div className="text-[#736e65] dark:text-[#9e978b] font-medium">Input Context:</div>
                    <div className="p-3 rounded-xl bg-[#fbfaf8] dark:bg-[#1a1917] text-[#2d2b28] dark:text-[#ded8ce] font-mono text-xs whitespace-pre-wrap border border-[#ded7cb] dark:border-[#383530]">
                      {selectedTask.inputContext}
                    </div>
                  </div>
                )}

                <div className="space-y-2 text-xs pt-2">
                  <div className="text-[#736e65] dark:text-[#9e978b] font-medium flex items-center justify-between">
                    <span>Task Output & Resolution:</span>
                    <StatusBadge status={selectedTask.status as any} />
                  </div>
                  {selectedTask.status === 'running' ? (
                    <div className="p-8 text-center text-xs text-[#c25e2e] dark:text-[#d97757] animate-pulse flex items-center justify-center gap-2">
                      <Clock className="w-4 h-4 animate-spin" />
                      <span>Role specialist is executing task objective...</span>
                    </div>
                  ) : selectedTask.output ? (
                    <div className="p-4 rounded-2xl bg-[#faf8f5] dark:bg-[#1a1917] border border-[#ded7cb] dark:border-[#383530]">
                      <MarkdownView content={selectedTask.output} />
                    </div>
                  ) : selectedTask.error ? (
                    <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                      {selectedTask.error}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-[#8c857b]">
                      Task has not been run yet. Click "Execute Task" to begin.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#8c857b] border border-dashed border-[#ded7cb] dark:border-[#383530] rounded-2xl p-12">
                Select a task on the left or create a new one.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ROLES DEFINITIONS VIEW */}
      {activeTab === 'roles' && (
        <div className="space-y-4">
          <div className="text-xs text-[#736e65] dark:text-[#9e978b]">
            Roles represent distinct operational responsibilities and instructions. You can map each role to an underlying model.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agentRoles.map((role) => (
              <div
                key={role.id}
                className="rounded-2xl bg-white dark:bg-[#22201e] border border-[#ded7cb] dark:border-[#383530] p-5 space-y-3 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif text-sm font-bold text-[#1f1e1d] dark:text-[#ede8e1]">{role.title}</h4>
                    <p className="text-[11px] text-[#8c857b] font-mono">Assigned: {role.assignedModelId}</p>
                  </div>
                  <button
                    onClick={() => setEditingRole(role)}
                    className="p-1.5 rounded-lg text-[#8c857b] hover:text-[#1f1e1d] dark:hover:text-[#ede8e1] hover:bg-[#f5f0e6] dark:hover:bg-[#2a2825] cursor-pointer"
                    title="Edit Role"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-[#615c54] dark:text-[#9e988e] leading-relaxed">
                  {role.description}
                </p>

                <div className="text-[11px] p-2.5 rounded-xl bg-[#fbfaf8] dark:bg-[#1a1917] text-[#736e65] dark:text-[#9e978b] font-mono border border-[#e8e2d8] dark:border-[#2d2a26] line-clamp-2">
                  {role.systemPrompt}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 bg-[#181716]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#22201e] border border-[#ded7cb] dark:border-[#383530] p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#f0ebd5] dark:border-[#2d2a27]">
              <h3 className="font-serif text-sm font-bold text-[#1f1e1d] dark:text-[#ede8e1]">Create Specialist Task</h3>
              <button onClick={() => setShowNewTaskModal(false)} className="text-[#8c857b] hover:text-[#1f1e1d]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#615c54] dark:text-[#9e988e] font-medium mb-1">
                  Task Objective
                </label>
                <input
                  type="text"
                  required
                  value={taskObjective}
                  onChange={(e) => setTaskObjective(e.target.value)}
                  placeholder="e.g. Audit authentication middleware for timing attack vectors"
                  className="w-full rounded-xl bg-[#fbfaf8] dark:bg-[#1a1917] border border-[#ded7cb] dark:border-[#383530] px-3.5 py-2.5 text-[#1f1e1d] dark:text-[#ede8e1]"
                />
              </div>

              <div>
                <label className="block text-[#615c54] dark:text-[#9e988e] font-medium mb-1">
                  Assigned Specialist Role
                </label>
                <select
                  value={assignedRoleId}
                  onChange={(e) => setAssignedRoleId(e.target.value)}
                  className="w-full rounded-xl bg-[#fbfaf8] dark:bg-[#1a1917] border border-[#ded7cb] dark:border-[#383530] px-3 py-2 text-[#1f1e1d] dark:text-[#ede8e1]"
                >
                  {agentRoles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title} ({r.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#615c54] dark:text-[#9e988e] font-medium mb-1">
                  Input Context / Specifications
                </label>
                <textarea
                  rows={3}
                  value={taskContext}
                  onChange={(e) => setTaskContext(e.target.value)}
                  placeholder="Provide file contents, error logs, or acceptance criteria..."
                  className="w-full rounded-xl bg-[#fbfaf8] dark:bg-[#1a1917] border border-[#ded7cb] dark:border-[#383530] p-2.5 text-[#1f1e1d] dark:text-[#ede8e1] resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#f5f0e6] dark:bg-[#282623] text-[#2d2b28] dark:text-[#ded8ce] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#c25e2e] hover:bg-[#b05225] text-white font-medium"
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
        <div className="fixed inset-0 z-50 bg-[#181716]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#22201e] border border-[#ded7cb] dark:border-[#383530] p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#f0ebd5] dark:border-[#2d2a27]">
              <h3 className="font-serif text-sm font-bold text-[#1f1e1d] dark:text-[#ede8e1]">Edit Role: {editingRole.title}</h3>
              <button onClick={() => setEditingRole(null)} className="text-[#8c857b] hover:text-[#1f1e1d]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#615c54] dark:text-[#9e988e] font-medium mb-1">Role Title</label>
                <input
                  type="text"
                  value={editingRole.title}
                  onChange={(e) => setEditingRole({ ...editingRole, title: e.target.value })}
                  className="w-full rounded-xl bg-[#fbfaf8] dark:bg-[#1a1917] border border-[#ded7cb] dark:border-[#383530] px-3 py-2 text-[#1f1e1d] dark:text-[#ede8e1]"
                />
              </div>

              <div>
                <label className="block text-[#615c54] dark:text-[#9e988e] font-medium mb-1">Underlying AI Model</label>
                <select
                  value={editingRole.assignedModelId}
                  onChange={(e) => setEditingRole({ ...editingRole, assignedModelId: e.target.value })}
                  className="w-full rounded-xl bg-[#fbfaf8] dark:bg-[#1a1917] border border-[#ded7cb] dark:border-[#383530] px-3 py-2 text-[#1f1e1d] dark:text-[#ede8e1]"
                >
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.provider})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#615c54] dark:text-[#9e988e] font-medium mb-1">Specialist System Prompt</label>
                <textarea
                  rows={4}
                  value={editingRole.systemPrompt}
                  onChange={(e) => setEditingRole({ ...editingRole, systemPrompt: e.target.value })}
                  className="w-full rounded-xl bg-[#fbfaf8] dark:bg-[#1a1917] border border-[#ded7cb] dark:border-[#383530] p-2.5 text-[#1f1e1d] dark:text-[#ede8e1]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  onClick={() => setEditingRole(null)}
                  className="px-4 py-2 rounded-xl bg-[#f5f0e6] dark:bg-[#282623] text-[#2d2b28] dark:text-[#ded8ce] font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    updateAgentRole(editingRole);
                    setEditingRole(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#c25e2e] hover:bg-[#b05225] text-white font-medium"
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
