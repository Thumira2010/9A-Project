import React, { useState } from 'react';
import { ThumbsUp, Calendar, User, FileText, Image as ImageIcon, ArrowRight, Share2, Check } from 'lucide-react';
import { RevisionNote, getNoteAttachments } from '../types';
import { toggleNoteHelpful } from '../lib/storage';
import { navigateToRoute, buildRouteUrl } from '../lib/router';

interface NoteCardProps {
  note: RevisionNote;
  onSelect?: (noteId: string) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, onSelect }) => {
  const [helpfulCount, setHelpfulCount] = useState(note.helpful_count);
  const [copied, setCopied] = useState(false);

  const notePageUrl = `${window.location.origin}${buildRouteUrl('note', { id: note.id })}`;

  const handleHelpful = (e: React.MouseEvent) => {
    e.stopPropagation();
    let voterToken = localStorage.getItem('voter_token');
    if (!voterToken) {
      voterToken = `voter_${Math.random().toString(36).slice(2, 11)}`;
      localStorage.setItem('voter_token', voterToken);
    }
    const isNowHelpful = toggleNoteHelpful(note.id, voterToken);
    setHelpfulCount((prev) => (isNowHelpful ? prev + 1 : Math.max(0, prev - 1)));
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

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
        navigator.clipboard.writeText(notePageUrl)
          .then(() => setCopied(true))
          .catch(() => doCopyFallback(notePageUrl));
      } else {
        doCopyFallback(notePageUrl);
      }
    } catch {
      doCopyFallback(notePageUrl);
    }

    setTimeout(() => setCopied(false), 2000);
  };

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(note.id);
    } else {
      navigateToRoute('note', { id: note.id });
    }
  };

  const authorDisplay = note.author_name?.trim() ? note.author_name.trim() : 'Anonymous';

  return (
    <div
      onClick={handleCardClick}
      className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group space-y-4"
    >
      <div>
        {/* Card Header Tags */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="bg-blue-100 text-blue-800 font-extrabold text-[11px] px-2.5 py-0.5 rounded-md border border-blue-200">
              Grade {note.grade}
            </span>
            <span className="bg-slate-100 text-slate-700 font-bold text-[11px] px-2 py-0.5 rounded-md border border-slate-200">
              {note.subject_name}
            </span>
            {(() => {
              const attachments = getNoteAttachments(note);
              if (attachments.length === 0) return null;
              return (
                <span className="bg-amber-100 text-amber-900 font-bold text-[10px] uppercase px-2 py-0.5 rounded-md flex items-center gap-1 border border-amber-200">
                  <FileText className="w-3 h-3 text-amber-700" />
                  {attachments.length === 1
                    ? `${attachments[0].type.toUpperCase()} Attached`
                    : `${attachments.length} Files Attached`}
                </span>
              );
            })()}
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(note.created_at).toLocaleDateString()}
          </div>
        </div>

        {/* Note Title */}
        <h3 className="font-extrabold text-base text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
          {note.title}
        </h3>

        {/* Lesson Name */}
        <p className="text-xs text-slate-500 font-semibold mt-1 truncate">
          Lesson: {note.lesson_name}
        </p>

        {/* Snippet preview */}
        <div
          className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: note.content.replace(/<[^>]+>/g, ' ').slice(0, 140) + '...',
          }}
        />
      </div>

      {/* Card Footer: Author & Helpful Votes */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-600 font-medium truncate">
          <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="truncate">
            By <strong className="text-slate-800">{authorDisplay}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href={buildRouteUrl('note', { id: note.id })}
            onClick={handleShare}
            title="Share direct link to note"
            className="flex items-center gap-1 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-lg font-bold transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-extrabold text-[11px]">Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Share</span>
              </>
            )}
          </a>

          <button
            onClick={handleHelpful}
            className="flex items-center gap-1 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-200 px-2.5 py-1 rounded-lg font-bold transition-colors"
            title="Mark as helpful"
          >
            <ThumbsUp className="w-3.5 h-3.5 text-blue-600" />
            <span>{helpfulCount}</span>
          </button>

          <span className="text-blue-600 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
            View <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};
