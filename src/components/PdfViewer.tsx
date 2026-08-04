import React, { useState, useEffect } from 'react';
import { FileText, ExternalLink, Eye, AlertCircle } from 'lucide-react';

interface PdfViewerProps {
  dataUrl: string;
  fileName?: string;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ dataUrl, fileName = 'revision_note.pdf' }) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [objectError, setObjectError] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;

    if (dataUrl.startsWith('data:')) {
      try {
        const parts = dataUrl.split(',');
        if (parts.length >= 2) {
          const mimeMatch = parts[0].match(/:(.*?);/);
          const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
          const cleanBase64 = parts[1].replace(/[\s\r\n]/g, '');
          const bstr = atob(cleanBase64);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          const blob = new Blob([u8arr], { type: mime });
          objectUrl = URL.createObjectURL(blob);
          setBlobUrl(objectUrl);
        }
      } catch (e) {
        console.error('Error creating Blob URL from base64 PDF:', e);
        setBlobUrl(null);
      }
    } else if (dataUrl.startsWith('blob:') || dataUrl.startsWith('http')) {
      setBlobUrl(dataUrl);
    }

    return () => {
      if (objectUrl && objectUrl.startsWith('blob:')) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [dataUrl]);

  const activeUrl = blobUrl || dataUrl;

  const handleOpenNewTab = () => {
    if (activeUrl) {
      window.open(activeUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold flex-shrink-0 border border-red-200">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-black text-slate-900 truncate">{fileName}</h4>
            <span className="text-[11px] font-semibold text-slate-500 block">PDF Revision Document</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleOpenNewTab}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open PDF in New Tab</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Embedded PDF Viewer / Fallback */}
      <div className="relative rounded-xl overflow-hidden border border-slate-300 bg-white min-h-[360px] sm:min-h-[480px] flex flex-col items-center justify-center">
        {activeUrl ? (
          <object
            data={activeUrl}
            type="application/pdf"
            className="w-full h-[360px] sm:h-[500px] rounded-xl"
            onError={() => setObjectError(true)}
          >
            {/* Embedded Fallback Card when browser restricts inline PDF objects */}
            <div className="p-8 text-center space-y-4 max-w-md mx-auto my-auto">
              <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">{fileName}</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Click below to read or save this PDF revision document in full resolution.
                </p>
              </div>

              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={handleOpenNewTab}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs p-3 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>View PDF in Full Screen</span>
                </button>
              </div>
            </div>
          </object>
        ) : (
          <div className="p-8 text-center text-slate-500 text-xs">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <p className="font-bold">Loading PDF Document...</p>
          </div>
        )}
      </div>
    </div>
  );
};
