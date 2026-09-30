import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Trash2, Edit3, X, Check } from 'lucide-react';
import { Note } from '../types';
import { noteService } from '../services/api';
import { BackButton } from './BackButton';
import { Breadcrumbs } from './Breadcrumbs';

interface NotesViewProps {
  onNavigateTab?: (tab: string) => void;
}

export const NotesView: React.FC<NotesViewProps> = ({ onNavigateTab }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const list = await noteService.getNotes();
      setNotes(list);
    } catch (e) {
      console.error('Failed to load notes', e);
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      const created = await noteService.createNote(title, content, category);
      setNotes(prev => [created, ...prev]);
      setShowAddModal(false);
      setTitle('');
      setContent('');
    } catch (e) {
      console.error('Failed to create note', e);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await noteService.deleteNote(id);
      setNotes(prev => prev.filter(n => n.id !== id));
    } catch (e) {
      console.error('Failed to delete note', e);
    }
  };

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/5 border border-white/10 px-5 py-3 rounded-2xl backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <BackButton
            label="Back to Dashboard"
            onClick={() => {
              if (onNavigateTab) onNavigateTab('dashboard');
              else {
                window.history.pushState({}, '', '/student/dashboard');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }
            }}
          />
          <Breadcrumbs
            items={[
              { label: 'Dashboard', onClick: () => onNavigateTab ? onNavigateTab('dashboard') : null },
              { label: 'Study Notes Manager', isCurrent: !showAddModal }
            ]}
          />
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {filteredNotes.length} Saved Notes
        </span>
      </div>

      {/* Header */}
      <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <FileText className="w-6 h-6 text-emerald-300" />
            <span>Personal Study Notes & Revision Aggregator</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1">Keep track of key algorithms, aptitude tricks, and course summaries.</p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search notes..."
              className="pl-9 pr-3 py-2 bg-slate-800/50 border border-white/10 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-400/50 backdrop-blur-md"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border border-white/20 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1 shadow-lg backdrop-blur-md shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Note</span>
          </button>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map(note => (
          <div key={note.id} className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-3 relative group backdrop-blur-md shadow-xl hover:border-white/20 transition-all">
            <div className="flex items-start justify-between">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase backdrop-blur-md">
                {note.category}
              </span>
              <button
                onClick={() => handleDeleteNote(note.id)}
                className="text-slate-400 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-sm font-bold text-white">{note.title}</h3>
            <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed line-clamp-4">{note.content}</p>

            <div className="pt-2 text-[10px] text-slate-400 border-t border-white/10">
              Updated: {new Date(note.updatedAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {/* Add Note Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900/90 border border-white/10 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-3">
                <BackButton
                  label="Back to Notes"
                  isDirty={Boolean(title || content)}
                  onClick={() => setShowAddModal(false)}
                />
                <Breadcrumbs
                  items={[
                    { label: 'Notes', onClick: () => setShowAddModal(false) },
                    { label: 'Create Note', isCurrent: true }
                  ]}
                />
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-base font-bold text-white">Create Study Note</h3>

            <form onSubmit={handleCreateNote} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Graph BFS Traversal Algorithm Notes"
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-400/50"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  placeholder="e.g. Computer Science / Placement"
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-400/50"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Note Content</label>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Write your study notes and key takeaways here..."
                  className="w-full h-32 p-3 bg-white/5 border border-white/10 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-400/50 resize-none"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-white/10">
                <BackButton
                  label="Cancel"
                  isDirty={Boolean(title || content)}
                  onClick={() => setShowAddModal(false)}
                />
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs rounded-xl shadow-lg"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
