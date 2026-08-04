import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface ImageUploaderProps {
  value?: string;
  onChange: (base64Image: string | undefined) => void;
  maxSizeBytes?: number; // default 2MB
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  maxSizeBytes = 2 * 1024 * 1024, // 2MB
}) => {
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSizeBytes) {
      setError('Image file size exceeds 2MB limit. Please choose a smaller diagram image.');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    onChange(undefined);
    setError(null);
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-300">
        Optional Diagram or Equation Image (Max 2MB)
      </label>

      {error && (
        <div className="bg-red-950/50 border border-red-800 text-red-200 text-xs p-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {value ? (
        <div className="relative bg-slate-900 border border-slate-700 rounded-xl p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src={value}
              alt="Attached revision diagram"
              className="w-16 h-16 object-cover rounded-lg border border-slate-700 flex-shrink-0 bg-slate-950"
            />
            <div className="overflow-hidden text-xs">
              <p className="text-white font-semibold flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-emerald-400" /> Image Attached
              </p>
              <p className="text-slate-400 text-[11px] truncate mt-0.5">Ready for review</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
            title="Remove attached image"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center p-6 bg-slate-900 hover:bg-slate-850 border-2 border-dashed border-slate-700 hover:border-blue-500/60 rounded-xl cursor-pointer transition-colors group">
          <Upload className="w-8 h-8 text-slate-500 group-hover:text-blue-400 mb-2 transition-colors" />
          <span className="text-xs font-semibold text-slate-300 group-hover:text-white">
            Click to upload diagram or formula photo
          </span>
          <span className="text-[11px] text-slate-500 mt-1">PNG, JPG or WEBP up to 2MB</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
};
