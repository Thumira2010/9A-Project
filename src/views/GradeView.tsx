import React, { useState, useEffect } from 'react';
import { GraduationCap, BookOpen, Layers, PlusCircle } from 'lucide-react';
import { SubjectCard } from '../components/SubjectCard';
import { Subject, RevisionNote } from '../types';
import { getSubjects, getNotes, getLessons, subscribeToStorage } from '../lib/storage';
import { navigateToRoute } from '../lib/router';

interface GradeViewProps {
  grade: '10' | '11';
  onSelectGrade: (grade: '10' | '11') => void;
  onSelectSubject: (subjectId: string) => void;
  onNavigate: (view: string, params?: Record<string, any>) => void;
}

export const GradeView: React.FC<GradeViewProps> = ({
  grade,
  onSelectGrade,
  onSelectSubject,
  onNavigate,
}) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [notes, setNotes] = useState<RevisionNote[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);

  useEffect(() => {
    const update = () => {
      setSubjects(getSubjects());
      setNotes(getNotes().filter((n) => n.status === 'Approved'));
      setLessons(getLessons());
    };
    update();
    return subscribeToStorage(update);
  }, []);

  // Filter subjects for this grade
  const gradeSubjects = subjects.filter(
    (s) => s.available_grades === 'both' || s.available_grades === grade
  );

  const mainSubjects = gradeSubjects.filter((s) => s.category === 'Main');
  const bucketSubjects = gradeSubjects.filter((s) => s.category !== 'Main');

  return (
    <div className="space-y-8 pb-16">
      {/* Grade Selector Header Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-900 text-xs font-black px-3 py-1 rounded-lg border border-blue-200 mb-2">
            <GraduationCap className="w-4 h-4 text-blue-700" />
            <span>SYLLABUS SELECTION</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Grade {grade} O/L Revision Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
            Explore subjects and lessons tailored specifically for Grade {grade} students
          </p>
        </div>

        {/* Grade Toggle Switch */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 gap-1 self-stretch md:self-auto">
          <button
            onClick={() => onSelectGrade('11')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              grade === '11'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            Grade 11
          </button>
          <button
            onClick={() => onSelectGrade('10')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              grade === '10'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            Grade 10
          </button>
        </div>
      </div>

      {/* Main Compulsory Subjects Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" /> Compulsory Main Subjects
          </h2>
          <span className="text-xs font-semibold text-slate-500">6 Core Subjects</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {mainSubjects.map((sub) => {
            const subNotes = notes.filter((n) => n.subject_id === sub.id && n.grade === grade);
            const subLessons = lessons.filter((l) => l.subject_id === sub.id && l.grade === grade);
            return (
              <SubjectCard
                key={sub.id}
                subject={sub}
                noteCount={subNotes.length}
                lessonCount={subLessons.length}
                onClick={() => onSelectSubject(sub.id)}
              />
            );
          })}
        </div>
      </div>

      {/* Optional Bucket Subjects Grid */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-600" /> Basket / Bucket Subjects
          </h2>
          <span className="text-xs font-semibold text-slate-500">Bucket 1, 2 & 3 Options</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {bucketSubjects.map((sub) => {
            const subNotes = notes.filter((n) => n.subject_id === sub.id && n.grade === grade);
            const subLessons = lessons.filter((l) => l.subject_id === sub.id && l.grade === grade);
            return (
              <SubjectCard
                key={sub.id}
                subject={sub}
                noteCount={subNotes.length}
                lessonCount={subLessons.length}
                onClick={() => onSelectSubject(sub.id)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
