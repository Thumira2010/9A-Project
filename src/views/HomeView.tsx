import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  BookOpen,
  Search,
  PlusCircle,
  TrendingUp,
  Award,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  HelpCircle,
  FileCheck2,
} from 'lucide-react';
import { CountdownTimer } from '../components/CountdownTimer';
import { NoteCard } from '../components/NoteCard';
import { SubjectCard } from '../components/SubjectCard';
import { Subject, RevisionNote, AppConfig } from '../types';
import { getSubjects, getNotes, getConfig, subscribeToStorage } from '../lib/storage';
import { navigateToRoute } from '../lib/router';

interface HomeViewProps {
  onSelectGrade: (grade: '10' | '11') => void;
  onSelectNote: (noteId: string) => void;
  onOpenSearch: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onSelectGrade,
  onSelectNote,
  onOpenSearch,
}) => {
  const [subjects, setSubjects] = useState<Subject[]>(getSubjects());
  const [notes, setNotes] = useState<RevisionNote[]>(getNotes().filter((n) => n.status === 'Approved'));
  const [config, setConfig] = useState<AppConfig>(getConfig());
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    const update = () => {
      setSubjects(getSubjects());
      setNotes(getNotes().filter((n) => n.status === 'Approved'));
      setConfig(getConfig());
    };
    return subscribeToStorage(update);
  }, []);

  const categories = ['All', 'Main', 'Bucket1', 'Bucket2', 'Bucket3'];

  const filteredSubjects = subjects.filter((s) => {
    if (selectedCategory === 'All') return true;
    return s.category === selectedCategory;
  });

  return (
    <div className="space-y-10 pb-16">
      {/* O/L Exam Countdown Banner */}
      <CountdownTimer targetDateIso={config.exam_date} examTitle={config.exam_title} />

      {/* Hero Welcome Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-800 text-xs font-black px-3 py-1 rounded-full border border-blue-200">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Official Sri Lanka G.C.E. O/L Revision Hub</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Master Your O/L Syllabus with Student & Teacher Revision Notes
          </h1>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
            Access organized, lesson-by-lesson summaries, diagrams, and PDF study sheets for Grade 10 & 11 main subjects and bucket subjects.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => onSelectGrade('11')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm px-6 py-3 rounded-2xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <GraduationCap className="w-5 h-5" />
              <span>Explore Grade 11 Notes</span>
            </button>

            <button
              onClick={() => onSelectGrade('10')}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm px-6 py-3 rounded-2xl border border-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore Grade 10 Notes</span>
            </button>

            <button
              onClick={() => navigateToRoute('upload-note')}
              className="bg-amber-50 hover:bg-amber-100 text-amber-900 font-extrabold text-sm px-5 py-3 rounded-2xl border border-amber-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-amber-600" />
              <span>Share A Revision Note</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grade Selection Hero Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-blue-600" /> Select Your Grade Level
          </h2>
          <span className="text-xs font-semibold text-slate-500">Based on National Syllabus</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Grade 11 Card */}
          <div
            onClick={() => onSelectGrade('11')}
            className="bg-white border-2 border-blue-200 hover:border-blue-600 rounded-3xl p-6 cursor-pointer shadow-xs hover:shadow-md transition-all group relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="bg-blue-600 text-white text-xs font-black px-3 py-1 rounded-lg">
                TARGET O/L BATCH
              </span>
              <ArrowRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1.5 transition-transform" />
            </div>

            <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
              Grade 11 Syllabus Notes
            </h3>
            <p className="text-xs text-slate-600 font-medium mt-2 leading-relaxed">
              Complete revision summaries for Grade 11 Science, Mathematics, History, ICT, Sinhala, English & bucket subjects.
            </p>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
              <span>{notes.filter((n) => n.grade === '11').length} Published Notes</span>
              <span className="text-blue-600 font-extrabold">Browse Grade 11 &rarr;</span>
            </div>
          </div>

          {/* Grade 10 Card */}
          <div
            onClick={() => onSelectGrade('10')}
            className="bg-white border border-slate-200 hover:border-blue-500 rounded-3xl p-6 cursor-pointer shadow-xs hover:shadow-md transition-all group relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="bg-slate-200 text-slate-800 text-xs font-extrabold px-3 py-1 rounded-lg">
                FOUNDATION YEAR
              </span>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1.5 transition-transform" />
            </div>

            <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">
              Grade 10 Syllabus Notes
            </h3>
            <p className="text-xs text-slate-600 font-medium mt-2 leading-relaxed">
              Essential foundation notes for Grade 10 O/L subjects to build strong core conceptual understanding.
            </p>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
              <span>{notes.filter((n) => n.grade === '10').length} Published Notes</span>
              <span className="text-blue-600 font-extrabold">Browse Grade 10 &rarr;</span>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 border border-slate-200 rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black text-slate-900 block leading-none">{subjects.length}</span>
            <span className="text-[11px] font-semibold text-slate-500 mt-0.5 block">Syllabus Subjects</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black text-slate-900 block leading-none">{notes.length}</span>
            <span className="text-[11px] font-semibold text-slate-500 mt-0.5 block">Approved Notes</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black text-slate-900 block leading-none">Grade 10 & 11</span>
            <span className="text-[11px] font-semibold text-slate-500 mt-0.5 block">Target Coverage</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black text-slate-900 block leading-none">100% Peer Verified</span>
            <span className="text-[11px] font-semibold text-slate-500 mt-0.5 block">Quality Moderated</span>
          </div>
        </div>
      </div>

      {/* Interactive Subject Quick Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-600" /> Syllabus Subjects Directory
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Filter by compulsory main subjects or optional bucket categories
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap bg-slate-100 p-1 rounded-xl border border-slate-200">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {cat === 'All' ? 'All Subjects' : cat === 'Main' ? 'Main Subjects' : cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredSubjects.map((sub) => {
            const subNotes = notes.filter((n) => n.subject_id === sub.id);
            return (
              <SubjectCard
                key={sub.id}
                subject={sub}
                noteCount={subNotes.length}
                lessonCount={5}
                onClick={() => navigateToRoute('subject', { id: sub.id, grade: '11' })}
              />
            );
          })}
        </div>
      </div>

      {/* Recent Approved Notes Section */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-amber-600" /> Latest Student & Teacher Notes
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Recently published high-yield summaries for quick exam preparation
            </p>
          </div>

          <button
            onClick={onOpenSearch}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>Search All Notes</span> &rarr;
          </button>
        </div>

        {notes.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-sm">
            No approved notes published yet. Be the first to submit a revision summary!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notes.slice(0, 4).map((note) => (
              <NoteCard key={note.id} note={note} onSelect={onSelectNote} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
