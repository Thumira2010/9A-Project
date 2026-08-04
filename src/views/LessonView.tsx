import React, { useState, useEffect } from 'react';
import { BookOpen, PlusCircle, ArrowLeft, FileText, Filter } from 'lucide-react';
import { NoteCard } from '../components/NoteCard';
import { Lesson, RevisionNote, Subject } from '../types';
import { getLessons, getNotes, getSubjects, subscribeToStorage } from '../lib/storage';
import { navigateToRoute } from '../lib/router';

interface LessonViewProps {
  lessonId: string;
  onSelectNote: (noteId: string) => void;
  onNavigate: (view: string, params?: Record<string, any>) => void;
}

export const LessonView: React.FC<LessonViewProps> = ({
  lessonId,
  onSelectNote,
  onNavigate,
}) => {
  const [lesson, setLesson] = useState<Lesson | undefined>();
  const [subject, setSubject] = useState<Subject | undefined>();
  const [notes, setNotes] = useState<RevisionNote[]>([]);
  const [sortBy, setSortBy] = useState<'helpful' | 'recent'>('helpful');

  useEffect(() => {
    const update = () => {
      const les = getLessons().find((l) => l.id === lessonId);
      setLesson(les);
      if (les) {
        const sub = getSubjects().find((s) => s.id === les.subject_id);
        setSubject(sub);
        const allNotes = getNotes().filter((n) => n.status === 'Approved' && n.lesson_id === lessonId);
        setNotes(allNotes);
      }
    };
    update();
    return subscribeToStorage(update);
  }, [lessonId]);

  if (!lesson) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-600">
        Lesson not found.
      </div>
    );
  }

  const sortedNotes = [...notes].sort((a, b) => {
    if (sortBy === 'helpful') {
      return b.helpful_count - a.helpful_count;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <button
          onClick={() =>
            navigateToRoute('subject', { subject_id: lesson.subject_id, grade: lesson.grade })
          }
          className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to {subject?.name || 'Subject'}
        </button>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-blue-100 text-blue-900 text-xs font-black px-2.5 py-0.5 rounded-md border border-blue-200">
                Grade {lesson.grade}
              </span>
              <span className="text-xs font-bold text-blue-600">{subject?.name}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {lesson.lesson_name}
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Showing student and teacher revision summaries for this lesson
            </p>
          </div>

          <button
            onClick={() =>
              navigateToRoute('upload-note', {
                subject_id: lesson.subject_id,
                lesson_id: lesson.id,
                grade: lesson.grade,
              })
            }
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold px-5 py-3 rounded-2xl shadow-xs transition-colors flex items-center gap-2 self-stretch sm:self-auto justify-center"
          >
            <PlusCircle className="w-4 h-4" /> Upload Note for This Lesson
          </button>
        </div>
      </div>

      {/* Sort & Notes Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" /> Revision Summaries ({notes.length})
          </h2>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-100 text-slate-800 border border-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none"
            >
              <option value="helpful">Most Helpful Votes</option>
              <option value="recent">Most Recent</option>
            </select>
          </div>
        </div>

        {sortedNotes.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-500">
            <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-bold text-slate-800">No notes published for this lesson yet.</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Have you studied this topic? Share your handwritten summary or PDF notes to help fellow O/L candidates!
            </p>
            <button
              onClick={() =>
                navigateToRoute('upload-note', {
                  subject_id: lesson.subject_id,
                  lesson_id: lesson.id,
                  grade: lesson.grade,
                })
              }
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-colors"
            >
              Submit First Note
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedNotes.map((note) => (
              <NoteCard key={note.id} note={note} onSelect={onSelectNote} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
