import React from 'react';

interface RichTextRendererProps {
  content: string;
}

export const RichTextRenderer: React.FC<RichTextRendererProps> = ({ content }) => {
  return (
    <div
      className="prose prose-slate max-w-none text-slate-800 text-sm sm:text-base leading-relaxed space-y-3
        [&_h2]:text-xl [&_h2]:font-black [&_h2]:text-slate-900 [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:border-b [&_h2]:border-slate-200 [&_h2]:pb-1.5
        [&_h3]:text-lg [&_h3]:font-extrabold [&_h3]:text-slate-900 [&_h3]:mt-3 [&_h3]:mb-1.5
        [&_p]:mb-2 [&_p]:leading-relaxed
        [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1
        [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1
        [&_strong]:font-extrabold [&_strong]:text-slate-900
        [&_em]:italic [&_em]:text-slate-700
        [&_code]:bg-slate-100 [&_code]:border [&_code]:border-slate-200 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-blue-700
        [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:bg-blue-50/60 [&_blockquote]:p-3 [&_blockquote]:rounded-r-lg [&_blockquote]:italic
        [&_table]:w-full [&_table]:border-collapse [&_table]:my-3 [&_table]:border [&_table]:border-slate-300
        [&_th]:bg-slate-100 [&_th]:p-2 [&_th]:text-left [&_th]:font-bold [&_th]:border [&_th]:border-slate-300
        [&_td]:p-2 [&_td]:border [&_td]:border-slate-300"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};
