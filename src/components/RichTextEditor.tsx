import React, { useState } from 'react';
import { Bold, Italic, List, ListOrdered, Code, Heading1, Heading2, Link2, Quote } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');

  const insertTag = (startTag: string, endTag: string = '') => {
    const textarea = document.getElementById('note-editor-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const replacement = `${startTag}${selectedText || 'text'}${endTag}`;

    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + startTag.length, start + startTag.length + (selectedText.length || 4));
    }, 50);
  };

  return (
    <div className="border border-slate-300 rounded-xl overflow-hidden bg-white shadow-xs">
      {/* Editor Toolbar & Tab Selector */}
      <div className="bg-slate-100 border-b border-slate-200 p-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => insertTag('<h2>', '</h2>')}
            className="p-1.5 hover:bg-slate-200 rounded text-slate-700 text-xs font-extrabold flex items-center gap-0.5"
            title="Heading 2"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertTag('<h3>', '</h3>')}
            className="p-1.5 hover:bg-slate-200 rounded text-slate-700 text-xs font-extrabold flex items-center gap-0.5"
            title="Heading 3"
          >
            <Heading2 className="w-4 h-4" />
          </button>

          <span className="h-4 w-px bg-slate-300 mx-1" />

          <button
            type="button"
            onClick={() => insertTag('<strong>', '</strong>')}
            className="p-1.5 hover:bg-slate-200 rounded text-slate-700"
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertTag('<em>', '</em>')}
            className="p-1.5 hover:bg-slate-200 rounded text-slate-700"
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>

          <span className="h-4 w-px bg-slate-300 mx-1" />

          <button
            type="button"
            onClick={() => insertTag('<ul>\n  <li>', '</li>\n</ul>')}
            className="p-1.5 hover:bg-slate-200 rounded text-slate-700"
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertTag('<ol>\n  <li>', '</li>\n</ol>')}
            className="p-1.5 hover:bg-slate-200 rounded text-slate-700"
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <span className="h-4 w-px bg-slate-300 mx-1" />

          <button
            type="button"
            onClick={() => insertTag('<blockquote>', '</blockquote>')}
            className="p-1.5 hover:bg-slate-200 rounded text-slate-700"
            title="Quote Box"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertTag('<code>', '</code>')}
            className="p-1.5 hover:bg-slate-200 rounded text-slate-700"
            title="Code / Formula"
          >
            <Code className="w-4 h-4" />
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="flex bg-slate-200 p-0.5 rounded-lg text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('write')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              activeTab === 'write' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              activeTab === 'preview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Preview
          </button>
        </div>
      </div>

      {/* Editor Input / Preview area */}
      {activeTab === 'write' ? (
        <textarea
          id="note-editor-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write your revision note content here... You can use HTML tags or the formatting buttons above for headings, formulas, and lists."
          className="w-full p-4 min-h-[260px] text-sm text-slate-900 bg-white focus:outline-none font-mono leading-relaxed"
        />
      ) : (
        <div
          className="p-4 min-h-[260px] text-slate-800 text-sm prose max-w-none leading-relaxed bg-slate-50"
          dangerouslySetInnerHTML={{ __html: value || '<p className="text-slate-400 italic">Nothing to preview yet.</p>' }}
        />
      )}
    </div>
  );
};
