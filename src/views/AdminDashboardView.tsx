import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  BookOpen,
  ListOrdered,
  Calendar,
  AlertCircle,
  Image as ImageIcon,
  Clock,
  Eye,
  Lock,
  LogOut,
  FileText,
  Key,
} from 'lucide-react';
import { RichTextRenderer } from '../components/RichTextRenderer';
import { RichTextEditor } from '../components/RichTextEditor';
import { Subject, Lesson, RevisionNote, AppConfig, SubjectCategory, GradeOption, NoteAttachment, getNoteAttachments } from '../types';
import {
  getSubjects,
  saveSubject,
  deleteSubject,
  getLessons,
  saveLesson,
  deleteLesson,
  updateLessonOrders,
  getNotes,
  updateNoteStatus,
  saveNote,
  deleteNote,
  getConfig,
  updateConfig,
  subscribeToStorage,
  resetToDefaults,
  isAdminLoggedIn,
  loginAdmin,
  logoutAdmin,
} from '../lib/storage';
import { navigateToRoute } from '../lib/router';

interface AdminDashboardViewProps {
  initialTab?: string;
  onNavigate: (view: string, params?: Record<string, any>) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  initialTab = 'queue',
  onNavigate,
}) => {
  const [authenticated, setAuthenticated] = useState<boolean>(isAdminLoggedIn());

  // Login Form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState<'queue' | 'subjects' | 'lessons' | 'config'>(
    (initialTab as any) || 'queue'
  );

  const [notes, setNotes] = useState<RevisionNote[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [config, setConfigState] = useState<AppConfig>(getConfig());

  // Edit note inline state (for "Edit-then-approve")
  const [editingNote, setEditingNote] = useState<RevisionNote | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  // Rejection modal state
  const [rejectingNoteId, setRejectingNoteId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Subject Modal state
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subName, setSubName] = useState('');
  const [subCategory, setSubCategory] = useState<SubjectCategory>('Main');
  const [subGrade, setSubGrade] = useState<GradeOption>('both');

  // Lesson Management State
  const [lessonFilterSub, setLessonFilterSub] = useState<string>('all');
  const [lessonFilterGrade, setLessonFilterGrade] = useState<'10' | '11'>('11');
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonNameInput, setLessonNameInput] = useState('');

  // Exam Date Config state
  const [examDateInput, setExamDateInput] = useState(config.exam_date.slice(0, 16));
  const [examTitleInput, setExamTitleInput] = useState(config.exam_title);

  // Delete confirmation modal state
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    type: 'subject' | 'lesson' | 'note';
    id: string;
    name: string;
    details?: string;
  } | null>(null);

  // Config save notification state
  const [configSaveSuccess, setConfigSaveSuccess] = useState(false);

  useEffect(() => {
    const update = () => {
      setAuthenticated(isAdminLoggedIn());
      setNotes(getNotes());
      setSubjects(getSubjects());
      setLessons(getLessons());
      const cfg = getConfig();
      setConfigState(cfg);
      setExamDateInput(cfg.exam_date.slice(0, 16));
      setExamTitleInput(cfg.exam_title);
    };
    update();
    return subscribeToStorage(update);
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await loginAdmin(loginEmail, loginPassword);
    if (success) {
      setAuthenticated(true);
      setLoginError(null);
    } else {
      setLoginError('Invalid administrator email or password.');
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    setAuthenticated(false);
  };

  const pendingNotes = notes.filter((n) => n.status === 'Pending');
  const approvedNotes = notes.filter((n) => n.status === 'Approved');

  // Review Queue Handlers
  const handleApproveNote = (noteId: string) => {
    updateNoteStatus(noteId, 'Approved');
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rejectingNoteId) {
      updateNoteStatus(rejectingNoteId, 'Rejected', rejectReason || 'Note does not meet quality guidelines.');
      setRejectingNoteId(null);
      setRejectReason('');
    }
  };

  const handleStartEditNote = (note: RevisionNote) => {
    setEditingNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  const handleSaveAndApproveNote = () => {
    if (!editingNote) return;
    const updated: RevisionNote = {
      ...editingNote,
      title: editTitle.trim(),
      content: editContent.trim(),
      status: 'Approved',
    };
    saveNote(updated);
    setEditingNote(null);
  };

  // Subject Handlers
  const handleOpenAddSubject = () => {
    setEditingSubject(null);
    setSubName('');
    setSubCategory('Main');
    setSubGrade('both');
    setShowSubjectModal(true);
  };

  const handleOpenEditSubject = (s: Subject) => {
    setEditingSubject(s);
    setSubName(s.name);
    setSubCategory(s.category);
    setSubGrade(s.available_grades);
    setShowSubjectModal(true);
  };

  const handleSaveSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim()) return;

    const subjectData: Subject = {
      id: editingSubject ? editingSubject.id : `sub-${Date.now()}`,
      name: subName.trim(),
      category: subCategory,
      available_grades: subGrade,
      icon_name: editingSubject?.icon_name || 'BookOpen',
    };

    saveSubject(subjectData);
    setShowSubjectModal(false);
  };

  const handleDeleteSubjectClick = (sub: Subject) => {
    setDeleteConfirmTarget({
      type: 'subject',
      id: sub.id,
      name: sub.name,
      details: 'Deleting this subject will permanently remove it along with all associated lessons and notes.',
    });
  };

  const handleDeleteLessonClick = (les: Lesson) => {
    setDeleteConfirmTarget({
      type: 'lesson',
      id: les.id,
      name: les.lesson_name,
      details: 'Deleting this lesson will permanently remove it and all associated revision notes.',
    });
  };

  const handleDeleteNoteClick = (note: RevisionNote) => {
    setDeleteConfirmTarget({
      type: 'note',
      id: note.id,
      name: note.title,
      details: 'Deleting this published note will remove it permanently from the student catalog.',
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmTarget) return;
    if (deleteConfirmTarget.type === 'subject') {
      deleteSubject(deleteConfirmTarget.id);
    } else if (deleteConfirmTarget.type === 'lesson') {
      deleteLesson(deleteConfirmTarget.id);
    } else if (deleteConfirmTarget.type === 'note') {
      deleteNote(deleteConfirmTarget.id);
    }
    setDeleteConfirmTarget(null);
  };

  // Lesson Handlers
  const filteredLessons = lessons
    .filter((l) => (lessonFilterSub === 'all' || l.subject_id === lessonFilterSub) && l.grade === lessonFilterGrade)
    .sort((a, b) => a.lesson_order - b.lesson_order);

  const handleOpenAddLesson = () => {
    setEditingLesson(null);
    setLessonNameInput('');
    setShowLessonModal(true);
  };

  const handleOpenEditLesson = (l: Lesson) => {
    setEditingLesson(l);
    setLessonNameInput(l.lesson_name);
    setShowLessonModal(true);
  };

  const handleSaveLessonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonNameInput.trim() || lessonFilterSub === 'all') return;

    if (editingLesson) {
      saveLesson({ ...editingLesson, lesson_name: lessonNameInput.trim() });
    } else {
      const subLessons = lessons.filter((l) => l.subject_id === lessonFilterSub && l.grade === lessonFilterGrade);
      const nextOrder = subLessons.length > 0 ? Math.max(...subLessons.map((l) => l.lesson_order)) + 1 : 1;

      saveLesson({
        id: `les-${Date.now()}`,
        subject_id: lessonFilterSub,
        grade: lessonFilterGrade,
        lesson_name: lessonNameInput.trim(),
        lesson_order: nextOrder,
      });
    }
    setShowLessonModal(false);
  };

  const handleMoveLesson = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= filteredLessons.length) return;

    const reordered = [...filteredLessons];
    const temp = reordered[index];
    reordered[index] = reordered[targetIdx];
    reordered[targetIdx] = temp;

    const updated = reordered.map((item, idx) => ({ ...item, lesson_order: idx + 1 }));
    updateLessonOrders(updated);
  };

  // Config save
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig({
      exam_date: new Date(examDateInput).toISOString(),
      exam_title: examTitleInput.trim(),
    });
    setConfigSaveSuccess(true);
    setTimeout(() => setConfigSaveSuccess(false), 4000);
  };

  // UNAUTHENTICATED LOGIN SCREEN
  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto my-12 space-y-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-md space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold mx-auto">
            <Lock className="w-6 h-6 text-amber-700" />
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Portal Authentication</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Protected moderator portal for managing subjects, lessons, and approving notes
            </p>
          </div>

          {loginError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1">Admin Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="Enter your admin email"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1">Password</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs p-3 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Log In to Admin Portal
            </button>
          </form>
        </div>
      </div>
    );
  }

  // AUTHENTICATED ADMIN DASHBOARD
  return (
    <div className="space-y-6 pb-16">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-100 text-amber-900 text-xs font-black px-2.5 py-0.5 rounded-md border border-amber-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" /> ADMIN MODERATION PORTAL
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            G.C.E. O/L Platform Administration
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage Grade 10 & 11 subjects, lessons, exam timeline, and moderate revision note submissions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetToDefaults}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-200 px-3 py-2 rounded-xl transition-colors"
            title="Reset sample database to default seed state"
          >
            Reset Seed Data
          </button>

          <button
            onClick={handleLogout}
            className="text-xs bg-red-50 hover:bg-red-100 text-red-700 font-bold border border-red-200 px-3 py-2 rounded-xl transition-colors flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 gap-1 overflow-x-auto whitespace-nowrap scrollbar-none text-xs">
        <button
          onClick={() => setActiveTab('queue')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold transition-all ${
            activeTab === 'queue'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" /> Review Queue
          {pendingNotes.length > 0 && (
            <span className="bg-slate-900 text-amber-300 font-black text-[10px] px-1.5 py-0.2 rounded-full">
              {pendingNotes.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('subjects')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold transition-all ${
            activeTab === 'subjects'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Manage Subjects ({subjects.length})
        </button>

        <button
          onClick={() => setActiveTab('lessons')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold transition-all ${
            activeTab === 'lessons'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ListOrdered className="w-4 h-4" /> Manage Lessons ({lessons.length})
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold transition-all ${
            activeTab === 'config'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" /> Countdown Config
        </button>
      </div>

      {/* TAB 1: REVIEW QUEUE */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" /> Pending Submissions ({pendingNotes.length})
            </h2>
            <span className="text-xs text-slate-500">Student submissions require admin approval</span>
          </div>

          {pendingNotes.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-500">
              <CheckCircle className="w-10 h-10 mx-auto mb-2 text-emerald-600" />
              <p className="text-sm font-bold text-slate-900">Review Queue Clear!</p>
              <p className="text-xs text-slate-500 mt-1">
                No pending revision notes awaiting approval right now.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingNotes.map((note) => (
                <div
                  key={note.id}
                  className="bg-white border-2 border-amber-300 rounded-3xl p-5 space-y-4 shadow-xs"
                >
                  {/* Note Header Info */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-amber-500 text-slate-950 font-black px-2.5 py-0.5 rounded">
                        PENDING APPROVAL
                      </span>
                      <span className="bg-blue-100 text-blue-900 font-extrabold px-2 py-0.5 rounded">
                        Grade {note.grade}
                      </span>
                      <span className="text-blue-700 font-bold">{note.subject_name}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-600">{note.lesson_name}</span>
                    </div>

                    <div className="text-slate-600 font-medium">
                      Author: <strong className="text-slate-900">{note.author_name || 'Anonymous'}</strong>
                    </div>
                  </div>

                  {/* Note Title & Content */}
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 mb-2">{note.title}</h3>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <RichTextRenderer content={note.content} />
                    </div>
                  </div>

                  {/* Attached Diagram / PDF Previews */}
                  {(() => {
                    const atts = getNoteAttachments(note);
                    if (atts.length === 0) return null;
                    return (
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                        <p className="text-xs font-black text-slate-800 uppercase tracking-wider">
                          Attached Files ({atts.length}):
                        </p>
                        <div className="space-y-2">
                          {atts.map((att, idx) => (
                            <div key={att.id} className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-2">
                              <p className="text-xs font-bold text-blue-700 flex items-center gap-1.5 truncate">
                                {att.type === 'pdf' ? (
                                  <FileText className="w-4 h-4 text-red-600 flex-shrink-0" />
                                ) : (
                                  <ImageIcon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                )}
                                <span>File {idx + 1}: {att.name} ({att.type.toUpperCase()})</span>
                              </p>
                              {att.type === 'image' && (
                                <img
                                  src={att.data}
                                  alt="Attached diagram preview"
                                  className="max-h-48 object-contain rounded-lg border border-slate-200 bg-slate-50"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Approval Action Controls */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <button
                      onClick={() => handleStartEditNote(note)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5 text-amber-600" /> Edit Before Approving
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setRejectingNoteId(note.id)}
                        className="bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold px-4 py-2 rounded-xl border border-red-200 flex items-center gap-1.5 transition-colors"
                      >
                        <XCircle className="w-4 h-4 text-red-600" /> Reject Note
                      </button>

                      <button
                        onClick={() => handleApproveNote(note.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold px-5 py-2 rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" /> Approve & Publish
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Approved Notes Reference List */}
          <div className="pt-6 border-t border-slate-200 space-y-3">
            <h3 className="text-sm font-bold text-slate-700">
              Published Approved Notes ({approvedNotes.length})
            </h3>
            <div className="space-y-2">
              {approvedNotes.map((n) => (
                <div
                  key={n.id}
                  className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="truncate">
                    <span className="font-bold text-slate-900 truncate">{n.title}</span>
                    <span className="text-slate-500 ml-2">
                      (Grade {n.grade} • {n.subject_name} • Author: {n.author_name || 'Anonymous'})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => navigateToRoute('note', { id: n.id })}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="View published note"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteNoteClick(n)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Delete note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SUBJECT MANAGEMENT */}
      {activeTab === 'subjects' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" /> Syllabus Subjects ({subjects.length})
            </h2>

            <button
              onClick={handleOpenAddSubject}
              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" /> Add New Subject
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Subject Name</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Grade Availability</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {subjects.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50">
                      <td className="p-3.5 font-extrabold text-slate-900">{sub.name}</td>
                      <td className="p-3.5">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-blue-700 font-bold border border-slate-200">
                          {sub.category}
                        </span>
                      </td>
                      <td className="p-3.5 font-medium text-slate-600">
                        {sub.available_grades === 'both' ? 'Grade 10 & 11' : `Grade ${sub.available_grades}`}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditSubject(sub)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg"
                            title="Edit subject"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSubjectClick(sub)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-lg"
                            title="Delete subject"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LESSON MANAGEMENT */}
      {activeTab === 'lessons' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white border border-slate-200 p-4 rounded-3xl shadow-xs">
            <div className="flex flex-wrap items-center gap-3 text-xs w-full sm:w-auto">
              <span className="text-slate-600 font-extrabold">Filter Subject:</span>
              <select
                value={lessonFilterSub}
                onChange={(e) => setLessonFilterSub(e.target.value)}
                className="bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none font-semibold"
              >
                <option value="all">Select Subject to Manage Lessons...</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              <span className="text-slate-600 font-extrabold ml-2">Grade:</span>
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setLessonFilterGrade('11')}
                  className={`px-3 py-1 rounded-lg font-bold text-xs ${
                    lessonFilterGrade === '11' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Gr. 11
                </button>
                <button
                  onClick={() => setLessonFilterGrade('10')}
                  className={`px-3 py-1 rounded-lg font-bold text-xs ${
                    lessonFilterGrade === '10' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Gr. 10
                </button>
              </div>
            </div>

            <button
              onClick={handleOpenAddLesson}
              disabled={lessonFilterSub === 'all'}
              className="bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 self-stretch sm:self-auto justify-center transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Lesson
            </button>
          </div>

          {lessonFilterSub === 'all' ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-500">
              <p className="text-sm font-semibold">Please select a subject above to manage its syllabus lesson list.</p>
            </div>
          ) : filteredLessons.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-500 space-y-3">
              <p className="text-sm font-bold text-slate-800">No lessons found for this subject/grade.</p>
              <button
                onClick={handleOpenAddLesson}
                className="bg-blue-600 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-xs"
              >
                Add First Lesson
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLessons.map((les, idx) => (
                <div
                  key={les.id}
                  className="bg-white border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-blue-50 text-blue-700 font-extrabold flex items-center justify-center border border-blue-200">
                      {les.lesson_order}
                    </span>
                    <span className="font-extrabold text-slate-900">{les.lesson_name}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMoveLesson(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20"
                      title="Move Up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMoveLesson(idx, 'down')}
                      disabled={idx === filteredLessons.length - 1}
                      className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20"
                      title="Move Down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEditLesson(les)}
                      className="p-1 text-amber-600 hover:text-amber-700 ml-1"
                      title="Edit Lesson"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteLessonClick(les)}
                      className="p-1 text-red-600 hover:text-red-700"
                      title="Delete Lesson"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: O/L EXAM COUNTDOWN CONFIG */}
      {activeTab === 'config' && (
        <form
          onSubmit={handleSaveConfig}
          className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 max-w-xl shadow-xs"
        >
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-600" /> Configure O/L Exam Countdown Timer
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Set the official examination target date displayed on the homepage header.
          </p>

          <div>
            <label className="block text-xs font-extrabold text-slate-800 mb-1">
              Exam Title
            </label>
            <input
              type="text"
              value={examTitleInput}
              onChange={(e) => setExamTitleInput(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 text-xs font-semibold focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-800 mb-1">
              Target Exam Date & Time
            </label>
            <input
              type="datetime-local"
              value={examDateInput}
              onChange={(e) => setExamDateInput(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 text-xs font-semibold focus:outline-none"
              required
            />
          </div>

          {configSaveSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>O/L Countdown settings updated successfully!</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors"
            >
              Save Exam Timeline
            </button>
          </div>
        </form>
      )}

      {/* MODAL 1: Edit Note Before Approving */}
      {editingNote && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-black text-lg text-slate-900">Edit & Approve Revision Note</h3>

            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1">Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-800 mb-1">Content</label>
              <RichTextEditor value={editContent} onChange={(v) => setEditContent(v)} />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingNote(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAndApproveNote}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold px-5 py-2 rounded-xl"
              >
                Save Changes & Publish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Reject Reason Modal */}
      {rejectingNoteId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-black text-lg text-slate-900">Reject Revision Note</h3>
            <p className="text-xs text-slate-600 font-medium">
              Please provide a reason for rejection (visible to student):
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Incomplete formulas / incorrect definitions."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-900 focus:outline-none"
                rows={4}
                required
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectingNoteId(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold px-5 py-2 rounded-xl"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Subject Modal */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-black text-lg text-slate-900">
              {editingSubject ? 'Edit Subject' : 'Add New Subject'}
            </h3>

            <form onSubmit={handleSaveSubjectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  placeholder="e.g. Info & Comm Technology (ICT)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-900 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1">
                  Subject Category
                </label>
                <select
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value as SubjectCategory)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-900 focus:outline-none"
                >
                  <option value="Main">Main Subject (Compulsory)</option>
                  <option value="Bucket1">Bucket 1 Subject</option>
                  <option value="Bucket2">Bucket 2 Subject</option>
                  <option value="Bucket3">Bucket 3 Subject</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1">
                  Available Grades
                </label>
                <select
                  value={subGrade}
                  onChange={(e) => setSubGrade(e.target.value as GradeOption)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-900 focus:outline-none"
                >
                  <option value="both">Both Grade 10 & 11</option>
                  <option value="11">Grade 11 Only</option>
                  <option value="10">Grade 10 Only</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSubjectModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-5 py-2 rounded-xl"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Lesson Modal */}
      {showLessonModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-black text-lg text-slate-900">
              {editingLesson ? 'Edit Lesson' : 'Add New Lesson'}
            </h3>

            <form onSubmit={handleSaveLessonSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1">
                  Lesson Title
                </label>
                <input
                  type="text"
                  value={lessonNameInput}
                  onChange={(e) => setLessonNameInput(e.target.value)}
                  placeholder="e.g. 1. Chemical Reactions & Equations"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-900 focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLessonModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-5 py-2 rounded-xl"
                >
                  Save Lesson
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: Delete Confirmation Modal */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center font-bold flex-shrink-0 border border-red-200">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900">
                  Confirm Deletion
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="bg-red-50/70 border border-red-100 rounded-2xl p-4 space-y-1">
              <p className="text-xs font-black text-slate-900">
                Delete {deleteConfirmTarget.type === 'subject' ? 'Subject' : deleteConfirmTarget.type === 'lesson' ? 'Lesson' : 'Note'}:
              </p>
              <p className="text-xs font-bold text-red-700 break-words">
                "{deleteConfirmTarget.name}"
              </p>
              {deleteConfirmTarget.details && (
                <p className="text-[11px] text-slate-600 mt-1.5 font-medium leading-relaxed">
                  {deleteConfirmTarget.details}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteConfirmTarget(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
