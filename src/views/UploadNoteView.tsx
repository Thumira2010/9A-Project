import React, { useState, useEffect } from 'react';
import { PlusCircle, Upload, CheckCircle2, ArrowLeft, User, AlertCircle } from 'lucide-react';
import { RichTextEditor } from '../components/RichTextEditor';
import { FileUploader } from '../components/FileUploader';
import { Subject, Lesson, RevisionNote, NoteAttachment } from '../types';
import { getSubjects, getLessons, saveNote, subscribeToStorage } from '../lib/storage';
import { navigateToRoute } from '../lib/router';

interface UploadNoteViewProps {
  initialSubjectId?: string;
  initialLessonId?: string;
  initialGrade?: '10' | '11';
  onNavigate: (view: string, params?: Record<string, any>) => void;
}

export const UploadNoteView: React.FC<UploadNoteViewProps> = ({
  initialSubjectId = '',
  initialLessonId = '',
  initialGrade = '11',
}) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  // Form State
  const [grade, setGrade] = useState<'10' | '11'>(initialGrade);
  const [subjectId, setSubjectId] = useState<string>(initialSubjectId);
  const [lessonId, setLessonId] = useState<string>(initialLessonId);
  const [authorName, setAuthorName] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [attachments, setAttachments] = useState<NoteAttachment[]>([]);

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      setSubjects(getSubjects());
      setLessons(getLessons());
    };
    update();
    return subscribeToStorage(update);
  }, []);

  // Filter lessons based on selected subject and grade
  const availableLessons = lessons.filter(
    (l) => l.subject_id === subjectId && l.grade === grade
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!subjectId) {
      setError('Please select a subject.');
      return;
    }
    if (!lessonId) {
      setError('Please select a lesson.');
      return;
    }
    if (!title.trim()) {
      setError('Please enter a note title.');
      return;
    }
    if (!content.trim() && attachments.length === 0) {
      setError('Please enter note text content or attach at least one document/image.');
      return;
    }

    setIsSubmitting(true);

    try {
      const selSub = subjects.find((s) => s.id === subjectId);
      const selLes = lessons.find((l) => l.id === lessonId);

      const newNote: RevisionNote = {
        id: `note-${Date.now()}`,
        author_name: authorName.trim() || 'Anonymous',
        subject_id: subjectId,
        subject_name: selSub ? selSub.name : 'General',
        lesson_id: lessonId,
        lesson_name: selLes ? selLes.lesson_name : 'General',
        grade: grade,
        title: title.trim(),
        content: content.trim() || '<p>Detailed summary attachments included below.</p>',
        attachments: attachments,
        attachment_type: attachments[0]?.type,
        attachment_data: attachments[0]?.data,
        attachment_name: attachments[0]?.name,
        helpful_count: 0,
        helpful_voters: [],
        status: 'Pending', // Requires admin approval
        created_at: new Date().toISOString(),
      };

      await saveNote(newNote);
      setSubmitted(true);
    } catch (err: any) {
      console.error('Submit note error:', err);
      setError('Failed to save note: ' + (err?.message || 'Unknown error occurred. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto my-10 bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Submission Received!</h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
          Thank you for contributing to the G.C.E. O/L Revision platform! Your note has been placed in the moderator review queue and will be published once approved.
        </p>
        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => navigateToRoute('home')}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold px-6 py-2.5 rounded-xl shadow-xs transition-colors"
          >
            Back to Home
          </button>
          <button
            onClick={() => {
              setSubmitted(false);
              setTitle('');
              setContent('');
              setAttachments([]);
            }}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-5 py-2.5 rounded-xl border border-slate-200 transition-colors"
          >
            Submit Another Note
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-3">
        <button
          onClick={() => navigateToRoute('home')}
          className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>

        <div>
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-900 text-xs font-black px-3 py-0.5 rounded-md border border-blue-200 mb-1">
            <PlusCircle className="w-3.5 h-3.5 text-blue-700" />
            <span>COMMUNITY REVISION CONTRIBUTION</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Upload Student / Teacher Revision Summary
          </h1>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Share short notes, diagrams, or PDF study guides to help fellow Sri Lankan students prepare for O/L exams.
          </p>
        </div>
      </div>

      {/* Submission Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-8 shadow-xs space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Grade & Subject Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-extrabold text-slate-800 mb-1">Target Grade Level</label>
            <select
              value={grade}
              onChange={(e) => {
                const g = e.target.value as '10' | '11';
                setGrade(g);
                setLessonId('');
              }}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:border-blue-500"
            >
              <option value="11">Grade 11</option>
              <option value="10">Grade 10</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-800 mb-1">Syllabus Subject</label>
            <select
              value={subjectId}
              onChange={(e) => {
                setSubjectId(e.target.value);
                setLessonId('');
              }}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:border-blue-500"
              required
            >
              <option value="">Select Subject...</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.category})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Lesson Selector */}
        <div>
          <label className="block text-xs font-extrabold text-slate-800 mb-1">Syllabus Lesson</label>
          <select
            value={lessonId}
            onChange={(e) => setLessonId(e.target.value)}
            disabled={!subjectId}
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:border-blue-500 disabled:opacity-50"
            required
          >
            <option value="">
              {!subjectId ? 'Select a subject first...' : availableLessons.length === 0 ? 'No lessons found for this subject/grade' : 'Select Lesson...'}
            </option>
            {availableLessons.map((l) => (
              <option key={l.id} value={l.id}>
                {l.lesson_name}
              </option>
            ))}
          </select>
        </div>

        {/* Author Name Input (Optional) */}
        <div>
          <label className="block text-xs font-extrabold text-slate-800 mb-1">
            Contributor Name <span className="text-slate-400 font-normal">(Optional - Leave blank to show "Anonymous")</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="e.g. Ruwan Silva or leave blank for Anonymous"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 pl-9 text-xs font-semibold focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Note Title */}
        <div>
          <label className="block text-xs font-extrabold text-slate-800 mb-1">Note Title / Topic Heading</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Quick Formula Sheet for Quadratic Equations & Discriminant"
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        {/* Rich Text Content Editor */}
        <div>
          <label className="block text-xs font-extrabold text-slate-800 mb-1">
            Note Content / Explanatory Text
          </label>
          <RichTextEditor value={content} onChange={setContent} />
        </div>

        {/* PDF / Image Attachment Upload */}
        <div>
          <label className="block text-xs font-extrabold text-slate-800 mb-1">
            Attach PDF Documents or Diagram Photos (Multiple files allowed, up to 10MB each)
          </label>
          <FileUploader onAttachmentsChange={setAttachments} />
        </div>

        {/* Submit Action */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigateToRoute('home')}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold px-5 py-3 rounded-xl border border-slate-200 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-extrabold text-xs px-6 py-3 rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            <Upload className={`w-4 h-4 ${isSubmitting ? 'animate-bounce' : ''}`} />
            <span>{isSubmitting ? 'Submitting Note...' : 'Submit Note for Moderation'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
