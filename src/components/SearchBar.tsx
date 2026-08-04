import React, { useState, useEffect } from 'react';
import { Search, X, BookOpen, FileText, User, ArrowRight } from 'lucide-react';
import { getNotes } from '../lib/storage';
import { RevisionNote } from '../types';

interface SearchBarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNote: (noteId: string) => void;
}

export const SearchBarModal: React.FC<SearchBarModalProps> = ({
  isOpen,
  onClose,
  onSelectNote,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<RevisionNote[]>([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const q = query.toLowerCase().trim();
    const allNotes = getNotes().filter((n) => n.status === 'Approved');
    const matched = allNotes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.subject_name.toLowerCase().includes(q) ||
        n.lesson_name.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.author_name?.toLowerCase().includes(q)
    );
    setResults(matched);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-16 px-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Header Input */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50">
          <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search keywords, subjects, lessons, formulas, author..."
            className="w-full bg-transparent text-slate-900 text-sm font-medium focus:outline-none placeholder:text-slate-400"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg"
          >
            Esc
          </button>
        </div>

        {/* Results List */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          {!query.trim() ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="font-semibold text-slate-600">Start typing to search across all O/L subjects</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Try searching for "Newton", "Quadratic", "Enzymes", or "ICT"
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              <p className="font-bold text-slate-700">No revision notes found matching "{query}"</p>
              <p className="mt-1 text-slate-400">Try adjusting your search terms or subject category</p>
            </div>
          ) : (
            results.map((note) => (
              <div
                key={note.id}
                onClick={() => {
                  onSelectNote(note.id);
                  onClose();
                }}
                className="bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 p-3.5 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3 group"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-blue-100 text-blue-800 font-extrabold text-[10px] px-2 py-0.5 rounded">
                      Grade {note.grade}
                    </span>
                    <span className="text-xs font-bold text-blue-600">{note.subject_name}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500 font-medium truncate">{note.lesson_name}</span>
                  </div>

                  <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                    {note.title}
                  </h4>

                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Author: <strong className="text-slate-700">{note.author_name || 'Anonymous'}</strong>
                  </p>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
