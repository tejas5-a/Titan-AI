import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Project } from '../../types';
import {
  FolderGit2,
  Plus,
  Trash2,
  Edit2,
  Search,
  FileCode,
  X,
} from 'lucide-react';

export function ProjectsView() {
  const {
    projects,
    activeProject,
    setActiveProject,
    createProject,
    updateProject,
    deleteProject,
    setActiveView,
  } = useApp();

  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTags, setNewTags] = useState('');

  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const tags = newTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    createProject(newName.trim(), newDesc.trim(), tags);
    setNewName('');
    setNewDesc('');
    setNewTags('');
    setShowCreateModal(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete project "${name}"? This cannot be undone.`)) {
      deleteProject(id);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      {/* Claude Style Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#e8e2d8] dark:border-[#33302c]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#f5f0e6] dark:bg-[#282622] text-[#c25e2e] dark:text-[#d97757] border border-[#e5ded0] dark:border-[#38342e]">
            <FolderGit2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-semibold text-[#1f1e1d] dark:text-[#ede8e1]">Projects & Workspaces</h2>
            <p className="text-xs text-[#736e65] dark:text-[#9e978b]">
              Isolate code files, research context, and collective conversations into dedicated project domains.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#c25e2e] hover:bg-[#b05225] text-white font-medium text-xs transition-colors cursor-pointer shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Project</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects by name or tag..."
          className="w-full text-xs rounded-xl bg-white dark:bg-[#22201e] border border-[#ded7cb] dark:border-[#383530] pl-9 pr-3.5 py-2.5 text-[#1f1e1d] dark:text-[#ede8e1] focus:outline-hidden focus:ring-2 focus:ring-[#c25e2e]/30 focus:border-[#c25e2e]"
        />
        <Search className="w-4 h-4 text-[#8c857b] absolute left-3 top-3" />
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.map((proj) => {
          const isActive = activeProject?.id === proj.id;
          return (
            <div
              key={proj.id}
              className={`rounded-2xl border p-5 flex flex-col justify-between transition-all bg-white dark:bg-[#22201e] ${
                isActive
                  ? 'border-[#c25e2e] dark:border-[#d97757] ring-1 ring-[#c25e2e]/20 shadow-xs'
                  : 'border-[#ded7cb] dark:border-[#383530] hover:border-[#c25e2e]/40'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-[#f5f0e6] dark:bg-[#282622] text-[#c25e2e] dark:text-[#d97757]">
                      <FolderGit2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-serif text-sm font-bold text-[#1f1e1d] dark:text-[#ede8e1]">{proj.name}</h3>
                      {isActive && (
                        <span className="text-[10px] uppercase font-mono font-semibold text-[#c25e2e] dark:text-[#d97757]">
                          Active Workspace
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingProject(proj)}
                      className="p-1 rounded-lg text-[#8c857b] hover:text-[#1f1e1d] dark:hover:text-[#ede8e1] cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(proj.id, proj.name)}
                      className="p-1 rounded-lg text-[#8c857b] hover:text-rose-600 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-[#615c54] dark:text-[#9e988e] leading-relaxed line-clamp-2">
                  {proj.description || 'No description provided.'}
                </p>

                {proj.tags && proj.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {proj.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#f5f0e6] dark:bg-[#282622] text-[#736e65] dark:text-[#9e978b] border border-[#e5ded0] dark:border-[#38342e]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-[#f0ebd5] dark:border-[#2d2a27] flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-[#8c857b] text-[11px] font-mono">
                  <FileCode className="w-3.5 h-3.5" />
                  {proj.files.length} files
                </span>

                <div className="flex items-center gap-1.5">
                  {!isActive && (
                    <button
                      onClick={() => setActiveProject(proj)}
                      className="px-2.5 py-1 text-xs rounded-lg bg-[#f5f0e6] dark:bg-[#282622] hover:bg-[#ede5d5] text-[#2d2b28] dark:text-[#ded8ce] font-medium cursor-pointer"
                    >
                      Set Active
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setActiveProject(proj);
                      setActiveView('coding');
                    }}
                    className="px-2.5 py-1 text-xs rounded-lg bg-[#c25e2e] hover:bg-[#b05225] text-white font-medium cursor-pointer"
                  >
                    Open Studio
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE PROJECT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-[#181716]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#22201e] border border-[#ded7cb] dark:border-[#383530] p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#f0ebd5] dark:border-[#2d2a27]">
              <h3 className="font-serif text-sm font-bold text-[#1f1e1d] dark:text-[#ede8e1]">Create New Project</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-[#8c857b] hover:text-[#1f1e1d]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#615c54] dark:text-[#9e988e] font-medium mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Distributed Consensus Engine"
                  className="w-full rounded-xl bg-[#fbfaf8] dark:bg-[#1a1917] border border-[#ded7cb] dark:border-[#383530] px-3 py-2 text-[#1f1e1d] dark:text-[#ede8e1]"
                />
              </div>

              <div>
                <label className="block text-[#615c54] dark:text-[#9e988e] font-medium mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Brief summary of goals and architecture..."
                  className="w-full rounded-xl bg-[#fbfaf8] dark:bg-[#1a1917] border border-[#ded7cb] dark:border-[#383530] p-2 text-[#1f1e1d] dark:text-[#ede8e1]"
                />
              </div>

              <div>
                <label className="block text-[#615c54] dark:text-[#9e988e] font-medium mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="Backend, AI, TypeScript"
                  className="w-full rounded-xl bg-[#fbfaf8] dark:bg-[#1a1917] border border-[#ded7cb] dark:border-[#383530] px-3 py-2 text-[#1f1e1d] dark:text-[#ede8e1]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#f5f0e6] dark:bg-[#282622] text-[#2d2b28] dark:text-[#ded8ce] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#c25e2e] hover:bg-[#b05225] text-white font-medium"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingProject && (
        <div className="fixed inset-0 z-50 bg-[#181716]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#22201e] border border-[#ded7cb] dark:border-[#383530] p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#f0ebd5] dark:border-[#2d2a27]">
              <h3 className="font-serif text-sm font-bold text-[#1f1e1d] dark:text-[#ede8e1]">Edit Project</h3>
              <button onClick={() => setEditingProject(null)} className="text-[#8c857b] hover:text-[#1f1e1d]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#615c54] dark:text-[#9e988e] font-medium mb-1">Project Name</label>
                <input
                  type="text"
                  value={editingProject.name}
                  onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                  className="w-full rounded-xl bg-[#fbfaf8] dark:bg-[#1a1917] border border-[#ded7cb] dark:border-[#383530] px-3 py-2 text-[#1f1e1d] dark:text-[#ede8e1]"
                />
              </div>

              <div>
                <label className="block text-[#615c54] dark:text-[#9e988e] font-medium mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingProject.description}
                  onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                  className="w-full rounded-xl bg-[#fbfaf8] dark:bg-[#1a1917] border border-[#ded7cb] dark:border-[#383530] p-2 text-[#1f1e1d] dark:text-[#ede8e1]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2 rounded-xl bg-[#f5f0e6] dark:bg-[#282622] text-[#2d2b28] dark:text-[#ded8ce] font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    updateProject(editingProject);
                    setEditingProject(null);
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
