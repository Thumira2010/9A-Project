import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SearchBarModal } from './components/SearchBar';
import { HomeView } from './views/HomeView';
import { GradeView } from './views/GradeView';
import { SubjectView } from './views/SubjectView';
import { LessonView } from './views/LessonView';
import { NoteDetailView } from './views/NoteDetailView';
import { UploadNoteView } from './views/UploadNoteView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { NavigationBreadcrumb } from './types';
import { getSubjects, getLessons, getNotes, initializeStorage } from './lib/storage';
import { parseCurrentRoute, navigateToRoute, buildRouteUrl } from './lib/router';
import { ShieldCheck, Heart } from 'lucide-react';

export default function App() {
  const [route, setRoute] = useState(() => parseCurrentRoute());
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Initialize storage & sync router state
  useEffect(() => {
    initializeStorage();

    const handleRouteChange = () => {
      setRoute(parseCurrentRoute());
    };

    const handleCustomNav = (e: any) => {
      setRoute({ view: e.detail.view, params: e.detail.params || {} });
    };

    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('app-navigation', handleCustomNav);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('app-navigation', handleCustomNav);
    };
  }, []);

  const { view: currentView, params: viewParams } = route;

  // Build reactive breadcrumbs
  const buildBreadcrumbs = (): NavigationBreadcrumb[] => {
    const crumbs: NavigationBreadcrumb[] = [];

    if (currentView === 'grade') {
      const g = (viewParams.grade as '10' | '11') || '11';
      crumbs.push({ label: `Grade ${g}`, view: 'grade', params: { grade: g } });
    } else if (currentView === 'subject') {
      const g = (viewParams.grade as '10' | '11') || '11';
      const subId = viewParams.id || viewParams.subject_id;
      const sub = getSubjects().find((s) => s.id === subId);
      crumbs.push({ label: `Grade ${g}`, view: 'grade', params: { grade: g } });
      crumbs.push({ label: sub ? sub.name : 'Subject', view: 'subject', params: { id: subId, grade: g } });
    } else if (currentView === 'lesson') {
      const lesId = viewParams.id || viewParams.lesson_id;
      const les = getLessons().find((l) => l.id === lesId);
      if (les) {
        const sub = getSubjects().find((s) => s.id === les.subject_id);
        crumbs.push({ label: `Grade ${les.grade}`, view: 'grade', params: { grade: les.grade } });
        crumbs.push({
          label: sub ? sub.name : 'Subject',
          view: 'subject',
          params: { id: les.subject_id, grade: les.grade },
        });
        crumbs.push({ label: les.lesson_name, view: 'lesson', params: { id: lesId } });
      }
    } else if (currentView === 'note') {
      const noteId = viewParams.id || viewParams.note_id;
      const note = getNotes().find((n) => n.id === noteId);
      if (note) {
        crumbs.push({ label: `Grade ${note.grade}`, view: 'grade', params: { grade: note.grade } });
        crumbs.push({
          label: note.subject_name,
          view: 'subject',
          params: { id: note.subject_id, grade: note.grade },
        });
        crumbs.push({ label: note.lesson_name, view: 'lesson', params: { id: note.lesson_id } });
        crumbs.push({ label: note.title, view: 'note', params: { id: noteId } });
      }
    } else if (currentView === 'upload-note') {
      crumbs.push({ label: 'Upload Revision Note', view: 'upload-note' });
    } else if (currentView === 'admin') {
      crumbs.push({ label: 'Admin Portal', view: 'admin' });
    }

    return crumbs;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white flex flex-col">
      {/* App Header */}
      <Header
        currentView={currentView}
        breadcrumbs={buildBreadcrumbs()}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {currentView === 'home' && (
          <HomeView
            onSelectGrade={(grade) => navigateToRoute('grade', { grade })}
            onSelectNote={(noteId) => navigateToRoute('note', { id: noteId })}
            onOpenSearch={() => setIsSearchOpen(true)}
          />
        )}

        {currentView === 'grade' && (
          <GradeView
            grade={(viewParams.grade as '10' | '11') || '11'}
            onSelectGrade={(grade) => navigateToRoute('grade', { grade })}
            onSelectSubject={(subjectId) =>
              navigateToRoute('subject', { id: subjectId, grade: viewParams.grade || '11' })
            }
            onNavigate={(v, p) => navigateToRoute(v, p)}
          />
        )}

        {currentView === 'subject' && (
          <SubjectView
            subjectId={viewParams.id || viewParams.subject_id}
            grade={(viewParams.grade as '10' | '11') || '11'}
            onSelectLesson={(lessonId) => navigateToRoute('lesson', { id: lessonId })}
            onNavigate={(v, p) => navigateToRoute(v, p)}
          />
        )}

        {currentView === 'lesson' && (
          <LessonView
            lessonId={viewParams.id || viewParams.lesson_id}
            onSelectNote={(noteId) => navigateToRoute('note', { id: noteId })}
            onNavigate={(v, p) => navigateToRoute(v, p)}
          />
        )}

        {currentView === 'note' && (
          <NoteDetailView
            noteId={viewParams.id || viewParams.note_id}
            onNavigate={(v, p) => navigateToRoute(v, p)}
          />
        )}

        {currentView === 'upload-note' && (
          <UploadNoteView
            initialSubjectId={viewParams.subject_id || viewParams.id}
            initialLessonId={viewParams.lesson_id}
            initialGrade={viewParams.grade as '10' | '11'}
            onNavigate={(v, p) => navigateToRoute(v, p)}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboardView
            initialTab={viewParams.tab}
            onNavigate={(v, p) => navigateToRoute(v, p)}
          />
        )}
      </main>

      {/* Global Search Modal */}
      <SearchBarModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectNote={(noteId) => navigateToRoute('note', { id: noteId })}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 text-slate-600 text-xs mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            <p className="font-extrabold text-slate-900 text-sm">
              OLNotesLM
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Providing free, peer-reviewed syllabus summaries, diagrams, and PDF guides for Sri Lankan Grade 10 & 11 students.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-end gap-5 text-xs font-bold text-slate-700">
            <button
              onClick={() => navigateToRoute('home')}
              className="hover:text-blue-600 transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => navigateToRoute('grade', { grade: '11' })}
              className="hover:text-blue-600 transition-colors"
            >
              Grade 11
            </button>
            <button
              onClick={() => navigateToRoute('grade', { grade: '10' })}
              className="hover:text-blue-600 transition-colors"
            >
              Grade 10
            </button>
            <button
              onClick={() => navigateToRoute('upload-note')}
              className="hover:text-blue-600 transition-colors"
            >
              Upload Note
            </button>

            {/* Required Footer Admin Portal Link */}
            <button
              onClick={() => navigateToRoute('admin')}
              className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-extrabold px-3 py-1.5 rounded-lg border border-amber-300 flex items-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              <span>Admin Portal Login</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
