import React, { useState, useEffect } from 'react';
import { BookOpen, PlusCircle, ArrowLeft, Layers, ListOrdered } from 'lucide-react';
import { LessonCard } from '../components/LessonCard';
import { Subject, Lesson, RevisionNote } from '../types';
import { getSubjects, getLessons, getNotes, subscribeToStorage } from '../lib/storage';
import { navigateToRoute } from '../lib/router';

interface SubjectViewProps {
  subjectId: string;
  grade: '10' | '11';
  onSelectLesson: (lessonId: string) => void;
  onNavigate: (view: string, params?: Record<string, any>) => void;
}

export const SubjectView: React.FC<SubjectViewProps> = ({
  subjectId,
  grade,
  onSelectLesson,
  onNavigate,
}) => {
  const [subject, setSubject] = useState<Subject | undefined>();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [notes, setNotes] = useState<RevisionNote[]>([]);

  useEffect(() => {
    const update = () => {
      const subs = getSubjects();
      setSubject(subs.find((s) => s.id === subjectId));
      const allLessons = getLessons();
      setLessons(
        allLessons
          .filter((l) => l.subject_id === subjectId && l.grade === grade)
          .sort((a, b) => a.lesson_order - b.lesson_order)
      );
      setNotes(getNotes().filter((n) => n.status === 'Approved' && n.subject_id === subjectId && n.grade === grade));
    };
    update();
    return subscribeToStorage(update);
  }, [subjectId, grade]);

  if (!subject) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-600">
        Subject not found.
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <button
          onClick={() => navigateToRoute('grade', { grade })}
          className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Grade {grade} Subjects
        </button>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-blue-100 text-blue-900 text-xs font-black px-2.5 py-0.5 rounded-md border border-blue-200">
                Grade {grade} Syllabus
              </span>
              <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-0.5 rounded-md border border-slate-200">
                {subject.category}
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{subject.name}</h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
              Select a lesson to view detailed student and teacher revision notes
            </p>
          </div>

          <button
            onClick={() => navigateToRoute('upload-note', { subject_id: subject.id, grade })}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold px-5 py-3 rounded-2xl shadow-xs transition-colors flex items-center gap-2 self-stretch sm:self-auto justify-center"
          >
            <PlusCircle className="w-4 h-4" /> Add Note for {subject.name}
          </button>
        </div>
      </div>

      {/* Lesson List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <ListOrdered className="w-5 h-5 text-blue-600" /> Syllabus Lessons ({lessons.length})
          </h2>
          <span className="text-xs text-slate-500 font-medium">Sequential Syllabus Order</span>
        </div>

        {lessons.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500">
            <p className="text-sm font-bold text-slate-700">No lessons added for this subject yet.</p>
            <p className="text-xs text-slate-500 mt-1">
              Admins can add lessons via the Admin Portal in the footer.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {lessons.map((les) => {
              const lesNotes = notes.filter((n) => n.lesson_id === les.id);
              return (
                <LessonCard
                  key={les.id}
                  lesson={les}
                  noteCount={lesNotes.length}
                  onClick={() => onSelectLesson(les.id)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
