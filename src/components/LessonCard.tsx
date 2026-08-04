import React from 'react';
import { BookOpen, FileText, ArrowRight } from 'lucide-react';
import { Lesson } from '../types';

interface LessonCardProps {
  lesson: Lesson;
  noteCount: number;
  onClick: () => void;
}

export const LessonCard: React.FC<LessonCardProps> = ({ lesson, noteCount, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 hover:border-blue-500 hover:shadow-sm transition-all cursor-pointer flex items-center justify-between gap-4 group"
    >
      <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 font-black text-sm flex items-center justify-center flex-shrink-0 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
          #{lesson.lesson_order}
        </div>

        <div className="truncate">
          <h4 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-blue-600 transition-colors truncate">
            {lesson.lesson_name}
          </h4>
          <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-blue-500" />
            <span>{noteCount} {noteCount === 1 ? 'Revision Note' : 'Revision Notes'} Available</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 text-xs font-extrabold text-blue-600 group-hover:translate-x-1 transition-transform flex-shrink-0">
        <span className="hidden sm:inline">View Notes</span>
        <ArrowRight className="w-4 h-4" />
      </div>
    </div>
  );
};
