import React, { useState, useEffect } from "react";
import { GraduationCap, BookOpen, Layers, PlusCircle } from "lucide-react";
import { SubjectCard } from "../components/SubjectCard";
import { Subject, RevisionNote } from "../types";
import {
  getSubjects,
  getNotes,
  getLessons,
  subscribeToStorage,
} from "../lib/storage";
import { navigateToRoute } from "../lib/router";

interface GradeViewProps {
  grade: "10" | "11";
  onSelectGrade: (grade: "10" | "11") => void;
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
      setNotes(getNotes().filter((n) => n.status === "Approved"));
      setLessons(getLessons());
    };
    update();
    return subscribeToStorage(update);
  }, []);

  // Filter subjects for this grade
  const gradeSubjects = subjects.filter(
    (s) => s.available_grades === "both" || s.available_grades === grade,
  );

  const mainSubjects = gradeSubjects.filter((s) => s.category === "Main");
  const bucket1Subjects = gradeSubjects.filter((s) => s.category === "Bucket1");
  const bucket2Subjects = gradeSubjects.filter((s) => s.category === "Bucket2");
  const bucket3Subjects = gradeSubjects.filter((s) => s.category === "Bucket3");

  const subjectSections = [
    {
      title: "Main Subjects",
      description: `${mainSubjects.length} core subjects`,
      icon: BookOpen,
      iconColor: "text-blue-600",
      subjects: mainSubjects,
    },
    {
      title: "Bucket 1 Subjects",
      description: `${bucket1Subjects.length} optional subjects`,
      icon: Layers,
      iconColor: "text-amber-600",
      subjects: bucket1Subjects,
    },
    {
      title: "Bucket 2 Subjects",
      description: `${bucket2Subjects.length} optional subjects`,
      icon: Layers,
      iconColor: "text-emerald-600",
      subjects: bucket2Subjects,
    },
    {
      title: "Bucket 3 Subjects",
      description: `${bucket3Subjects.length} optional subjects`,
      icon: Layers,
      iconColor: "text-violet-600",
      subjects: bucket3Subjects,
    },
  ];

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
            Explore subjects and lessons tailored specifically for Grade {grade}{" "}
            students
          </p>
        </div>

        {/* Grade Toggle Switch */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 gap-1 self-stretch md:self-auto">
          <button
            onClick={() => onSelectGrade("11")}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              grade === "11"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
            }`}
          >
            Grade 11
          </button>
          <button
            onClick={() => onSelectGrade("10")}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              grade === "10"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
            }`}
          >
            Grade 10
          </button>
        </div>
      </div>

      {subjectSections.map(
        ({ title, description, icon: Icon, iconColor, subjects }) => (
          <div key={title} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Icon className={`w-5 h-5 ${iconColor}`} /> {title}
              </h2>
              <span className="text-xs font-semibold text-slate-500">
                {description}
              </span>
            </div>

            {subjects.length === 0 ? (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-5 text-sm text-slate-500">
                No subjects available in this section for Grade {grade}.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {subjects.map((sub) => {
                  const subNotes = notes.filter(
                    (n) => n.subject_id === sub.id && n.grade === grade,
                  );
                  const subLessons = lessons.filter(
                    (l) => l.subject_id === sub.id && l.grade === grade,
                  );
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
            )}
          </div>
        ),
      )}
    </div>
  );
};
