import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  PlusCircle,
  ShieldCheck,
  ChevronRight,
  Home,
  GraduationCap,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { NavigationBreadcrumb } from '../types';
import { navigateToRoute } from '../lib/router';

interface HeaderProps {
  currentView: string;
  breadcrumbs: NavigationBreadcrumb[];
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  breadcrumbs,
  onOpenSearch,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileNav = (view: string, params?: Record<string, any>) => {
    setIsMobileMenuOpen(false);
    navigateToRoute(view, params);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Primary Top Bar */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          {/* Logo & Platform Title */}
          <div
            onClick={() => handleMobileNav('home')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group flex-shrink-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-sm group-hover:bg-blue-700 transition-colors">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors block leading-none">
                ShortNotesLM
              </span>
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 block mt-0.5">
                Sri Lanka Exam Revision
              </span>
            </div>
          </div>

          {/* Desktop Controls */}
          <div className="hidden md:flex items-center gap-3">
            {/* Search Button */}
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors border border-slate-200 cursor-pointer"
              title="Search revision notes"
            >
              <Search className="w-4 h-4 text-slate-500" />
              <span>Search Revision Notes...</span>
            </button>

            {/* Upload Note Button */}
            <button
              onClick={() => navigateToRoute('upload-note')}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-extrabold shadow-xs transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Revision Note</span>
            </button>

            {/* Admin Portal Header Button */}
            <button
              onClick={() => navigateToRoute('admin')}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                currentView === 'admin'
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
              title="Admin Moderation Portal"
            >
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Admin Portal</span>
            </button>
          </div>

          {/* Mobile Quick Action Bar (Search + Hamburger) */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              onClick={onOpenSearch}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
              title="Search"
            >
              <Search className="w-5 h-5 text-slate-700" />
            </button>

            <button
              onClick={() => navigateToRoute('upload-note')}
              className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-colors shadow-2xs"
              title="Add Note"
            >
              <PlusCircle className="w-5 h-5" />
            </button>

            {/* Hamburger Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors ml-0.5"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Hamburger Drawer Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleMobileNav('home')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-extrabold border ${
                  currentView === 'home'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </button>

              <button
                onClick={() => handleMobileNav('grade', { grade: '11' })}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-extrabold border ${
                  currentView === 'grade'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span>Grade 11</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleMobileNav('grade', { grade: '10' })}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-extrabold bg-slate-50 text-slate-700 border border-slate-200"
              >
                <BookOpen className="w-4 h-4 text-slate-600" />
                <span>Grade 10</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenSearch();
                }}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-extrabold bg-slate-50 text-slate-700 border border-slate-200"
              >
                <Search className="w-4 h-4 text-slate-600" />
                <span>Search Notes</span>
              </button>
            </div>

            <div className="pt-1 space-y-2">
              <button
                onClick={() => handleMobileNav('upload-note')}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-black bg-blue-600 text-white shadow-2xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Upload New Revision Note</span>
              </button>

              <button
                onClick={() => handleMobileNav('admin')}
                className={`w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-black border ${
                  currentView === 'admin'
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-amber-50 text-amber-900 border-amber-200'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Admin Moderation Portal</span>
              </button>
            </div>
          </div>
        )}

        {/* Reactive Breadcrumb Trail */}
        {breadcrumbs.length > 0 && (
          <div className="py-2 border-t border-slate-100 flex items-center gap-1 text-[11px] sm:text-xs text-slate-500 overflow-x-auto whitespace-nowrap scrollbar-none">
            <button
              onClick={() => handleMobileNav('home')}
              className="flex items-center gap-1 hover:text-blue-600 font-medium transition-colors flex-shrink-0"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>

            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                <button
                  onClick={() => handleMobileNav(crumb.view, crumb.params)}
                  className={`max-w-[140px] sm:max-w-[200px] truncate font-semibold transition-colors flex-shrink-0 ${
                    idx === breadcrumbs.length - 1
                      ? 'text-blue-700 font-bold'
                      : 'hover:text-blue-600 text-slate-600'
                  }`}
                >
                  {crumb.label}
                </button>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};

