import React, { useRef, useState } from 'react';
import { Upload, FileText, Image as ImageIcon, X, AlertCircle, Plus } from 'lucide-react';
import { AttachmentType, NoteAttachment } from '../types';

interface FileUploaderProps {
  onAttachmentsChange: (attachments: NoteAttachment[]) => void;
  initialAttachments?: NoteAttachment[];
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit per file

export const FileUploader: React.FC<FileUploaderProps> = ({
  onAttachmentsChange,
  initialAttachments = [],
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<NoteAttachment[]>(initialAttachments);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    setIsProcessing(true);

    const newAttachments: NoteAttachment[] = [];
    const fileList: File[] = Array.from(files);

    for (const file of fileList) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setError(`"${file.name}" exceeds the 10MB limit and was skipped.`);
        continue;
      }

      const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
      const isImg = file.type.startsWith('image/');

      if (!isPdf && !isImg) {
        setError(`"${file.name}" is not a valid PDF or image file and was skipped.`);
        continue;
      }

      try {
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        newAttachments.push({
          id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          type: (isPdf ? 'pdf' : 'image') as AttachmentType,
          data: base64Data,
          name: file.name,
        });
      } catch (err) {
        console.error('Error reading file:', err);
      }
    }

    setIsProcessing(false);

    if (newAttachments.length > 0) {
      const updatedList = [...attachments, ...newAttachments];
      setAttachments(updatedList);
      onAttachmentsChange(updatedList);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = (id: string) => {
    const updated = attachments.filter((att) => att.id !== id);
    setAttachments(updated);
    onAttachmentsChange(updated);
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Main Upload Dropzone / Button */}
      {attachments.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/40 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform border border-blue-200">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-extrabold text-slate-800">
              Click or drag to attach PDF documents & diagram images
            </p>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              You can select <span className="font-bold text-blue-700">multiple files at once</span> (PDFs, PNG, JPG up to 10MB each)
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-slate-700 tracking-wider">
              Attached Files ({attachments.length})
            </span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-xl flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add More Files</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {attachments.map((att, idx) => (
              <div
                key={att.id}
                className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-2.5 shadow-2xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 font-bold ${
                      att.type === 'pdf'
                        ? 'bg-red-100 text-red-600 border border-red-200'
                        : 'bg-blue-100 text-blue-600 border border-blue-200'
                    }`}
                  >
                    {att.type === 'pdf' ? <FileText className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-extrabold text-slate-900 text-xs truncate">
                      {idx + 1}. {att.name}
                    </p>
                    <span className="text-[10px] font-extrabold uppercase text-slate-500">
                      {att.type === 'pdf' ? 'PDF Document' : 'Image File'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemove(att.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {isProcessing && (
        <p className="text-xs text-blue-600 font-bold animate-pulse">Reading attached files...</p>
      )}

      {error && (
        <div className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200 flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}
    </div>
  );
};
