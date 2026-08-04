import React from 'react';
import { BookOpen, ArrowRight, Layers, Calculator, Atom, Landmark, Compass, Laptop, TrendingUp, Activity, Globe, Palette, Music, Languages } from 'lucide-react';
import { Subject } from '../types';

interface SubjectCardProps {
  subject: Subject;
  noteCount?: number;
  lessonCount?: number;
  onClick: () => void;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Atom,
  Calculator,
  Landmark,
  Compass,
  Laptop,
  TrendingUp,
  Activity,
  Globe,
  Palette,
  Music,
  Languages,
  BookOpen,
};

export const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  noteCount = 0,
  lessonCount = 0,
  onClick,
}) => {
  const IconComponent = (subject.icon_name && ICON_MAP[subject.icon_name]) || BookOpen;

  return (
    <div
      onClick={onClick}
      className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <IconComponent className="w-5 h-5" />
          </div>

          <span className="bg-slate-100 text-slate-700 font-bold text-[10px] uppercase px-2 py-0.5 rounded border border-slate-200">
            {subject.category}
          </span>
        </div>

        <h3 className="font-extrabold text-base text-slate-900 group-hover:text-blue-600 transition-colors">
          {subject.name}
        </h3>

        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-2">
          <span>{lessonCount} Syllabus Lessons</span>
          <span>•</span>
          <span>{noteCount} Notes</span>
        </div>
      </div>

      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
        <span>Explore Lessons & Notes</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
};
