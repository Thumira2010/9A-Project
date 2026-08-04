import React, { useState, useEffect } from 'react';
import {
  ThumbsUp,
  Share2,
  Calendar,
  User,
  ArrowLeft,
  FileText,
  ExternalLink,
  Check,
  Eye,
  ImageIcon,
} from 'lucide-react';
import { RichTextRenderer } from '../components/RichTextRenderer';
import { PdfViewer } from '../components/PdfViewer';
import { RevisionNote, getNoteAttachments, NoteAttachment } from '../types';
import { getNotes, toggleNoteHelpful, subscribeToStorage } from '../lib/storage';
import { navigateToRoute, buildRouteUrl } from '../lib/router';
import { getAttachmentFromDB } from '../lib/attachmentStore';

interface NoteDetailViewProps {
  noteId: string;
  onNavigate: (view: string, params?: Record<string, any>) => void;
}

export const NoteDetailView: React.FC<NoteDetailViewProps> = ({ noteId }) => {
  const [note, setNote] = useState<RevisionNote | undefined>();
  const [helpfulCount, setHelpfulCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [activeAttIndex, setActiveAttIndex] = useState<number>(0);
  const [showAllAttachments, setShowAllAttachments] = useState<boolean>(false);

  useEffect(() => {
    const update = () => {
      const n = getNotes().find((item) => item.id === noteId);
      setNote(n);
      if (n) setHelpfulCount(n.helpful_count);
    };
    update();
    return subscribeToStorage(update);
  }, [noteId]);

  useEffect(() => {
    if (!note) return;
    const atts = getNoteAttachments(note);
    const hasMissingData = atts.some((a) => !a.data);
    if (!hasMissingData) return;

    let mounted = true;
    const hydrateAttachments = async () => {
      let updated = false;
      const hydrated = await Promise.all(
        atts.map(async (att) => {
          if (!att.data && att.id) {
            const dbData = await getAttachmentFromDB(att.id);
            if (dbData) {
              updated = true;
              return { ...att, data: dbData };
            }
          }
          return att;
        })
      );
      if (mounted && updated) {
        setNote((prev) => (prev ? { ...prev, attachments: hydrated } : prev));
      }
    };
    hydrateAttachments();
    return () => {
      mounted = false;
    };
  }, [note?.id]);

  if (!note) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-600">
        <p className="font-bold">Revision note not found or pending approval.</p>
        <button
          onClick={() => navigateToRoute('home')}
          className="mt-4 bg-blue-600 text-white font-bold text-xs px-4 py-2 rounded-xl"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const handleHelpfulToggle = () => {
    let voterToken = localStorage.getItem('voter_token');
    if (!voterToken) {
      voterToken = `voter_${Math.random().toString(36).slice(2, 11)}`;
      localStorage.setItem('voter_token', voterToken);
    }
    const isNowHelpful = toggleNoteHelpful(note.id, voterToken);
    setHelpfulCount((prev) => (isNowHelpful ? prev + 1 : Math.max(0, prev - 1)));
  };

  const handleCopyShareLink = (e: React.MouseEvent) => {
    e.preventDefault();
    const fullUrl = `${window.location.origin}${buildRouteUrl('note', { id: note.id })}`;

    const doCopyFallback = (text: string) => {
      try {
        const input = document.createElement('input');
        input.value = text;
        input.style.position = 'fixed';
        input.style.opacity = '0';
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        setCopied(true);
      } catch (err) {
        console.warn('Fallback copy error:', err);
      }
    };

    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        navigator.clipboard.writeText(fullUrl)
          .then(() => setCopied(true))
          .catch(() => doCopyFallback(fullUrl));
      } else {
        doCopyFallback(fullUrl);
      }
    } catch {
      doCopyFallback(fullUrl);
    }

    setTimeout(() => setCopied(false), 2000);
  };

  const authorDisplay = note.author_name?.trim() ? note.author_name.trim() : 'Anonymous';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() =>
            navigateToRoute('lesson', { id: note.lesson_id })
          }
          className="text-xs font-bold text-slate-600 hover:text-blue-600 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Lesson Notes
        </button>

        {/* Share Button */}
        <a
          href={buildRouteUrl('note', { id: note.id })}
          onClick={handleCopyShareLink}
          title="Share direct link to this note"
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3.5 py-1.5 rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-500" />}
          <span>{copied ? 'Link Copied!' : 'Share Note'}</span>
        </a>
      </div>

      {/* Main Note Card */}
      <article className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-10 shadow-xs space-y-6">
        {/* Note Metadata Header */}
        <div className="space-y-3 border-b border-slate-100 pb-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-blue-100 text-blue-800 font-extrabold text-xs px-3 py-1 rounded-lg border border-blue-200">
              Grade {note.grade}
            </span>
            <span className="bg-slate-100 text-slate-700 font-bold text-xs px-2.5 py-1 rounded-lg border border-slate-200">
              {note.subject_name}
            </span>
            <span className="text-xs text-slate-500 font-medium truncate">• {note.lesson_name}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
            {note.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 font-medium pt-2">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-slate-800 font-bold bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                <User className="w-3.5 h-3.5 text-blue-600" /> Author: {authorDisplay}
              </span>
              <span className="flex items-center gap-1 text-slate-500">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(note.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>

            <button
              onClick={handleHelpfulToggle}
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-4 py-1.5 rounded-xl font-black flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ThumbsUp className="w-4 h-4 text-blue-600" />
              <span>Mark Helpful ({helpfulCount})</span>
            </button>
          </div>
        </div>

        {/* Note Rich Text Content */}
        <div className="bg-slate-50/50 p-3.5 sm:p-6 rounded-2xl border border-slate-200/80 overflow-x-auto">
          <RichTextRenderer content={note.content} />
        </div>

        {/* PDF / Image Attachment Viewer Section */}
        {(() => {
          const attachments = getNoteAttachments(note);
          if (attachments.length === 0) return null;

          const renderSingleAttachment = (att: NoteAttachment, index: number) => {
            if (att.type === 'pdf') {
              return (
                <PdfViewer
                  key={att.id}
                  dataUrl={att.data}
                  fileName={att.name || `${note.title}_doc_${index + 1}.pdf`}
                />
              );
            }
            return (
              <div key={att.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    Attached Image {attachments.length > 1 ? `#${index + 1}` : ''}: {att.name || 'Diagram'}
                  </span>
                </div>

                <div className="flex justify-center bg-white p-3 rounded-xl border border-slate-200 max-h-[500px] overflow-hidden">
                  <img
                    src={att.data}
                    alt={att.name || 'Attached diagram'}
                    className="max-h-[460px] object-contain rounded-lg"
                  />
                </div>
              </div>
            );
          };

          if (attachments.length === 1) {
            return (
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">
                  Attached Revision Document
                </h3>
                {renderSingleAttachment(attachments[0], 0)}
              </div>
            );
          }

          // Multiple Attachments
          const safeActiveIndex = activeAttIndex < attachments.length ? activeAttIndex : 0;
          const currentAttachment = attachments[safeActiveIndex];

          return (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                    Attached Revision Documents ({attachments.length} files included in this note)
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Select a document tab below or expand all to view every attachment inline.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAllAttachments(!showAllAttachments)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 transition-colors"
                >
                  {showAllAttachments ? 'Switch to Tab View' : 'Show All Files Below'}
                </button>
              </div>

              {/* Document Tabs */}
              {!showAllAttachments && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {attachments.map((att, idx) => (
                    <button
                      key={att.id}
                      onClick={() => setActiveAttIndex(idx)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all border flex-shrink-0 ${
                        activeAttIndex === idx
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {att.type === 'pdf' ? (
                        <FileText className="w-3.5 h-3.5" />
                      ) : (
                        <ImageIcon className="w-3.5 h-3.5" />
                      )}
                      <span className="truncate max-w-[160px]">{idx + 1}. {att.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* View Rendering */}
              {showAllAttachments ? (
                <div className="space-y-6">
                  {attachments.map((att, idx) => (
                    <div key={att.id} className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700">
                        <span className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded">File {idx + 1} of {attachments.length}</span>
                        <span>{att.name}</span>
                      </div>
                      {renderSingleAttachment(att, idx)}
                    </div>
                  ))}
                </div>
              ) : (
                currentAttachment && renderSingleAttachment(currentAttachment, safeActiveIndex)
              )}
            </div>
          );
        })()}

        {/* Footer Navigation in Article */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() =>
              navigateToRoute('lesson', { id: note.lesson_id })
            }
            className="text-xs font-bold text-slate-600 hover:text-blue-600 flex items-center gap-1"
          >
            &larr; Return to Lesson
          </button>

          <button
            onClick={handleHelpfulToggle}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Was this note helpful? Vote ({helpfulCount})
          </button>
        </div>
      </article>
    </div>
  );
};
