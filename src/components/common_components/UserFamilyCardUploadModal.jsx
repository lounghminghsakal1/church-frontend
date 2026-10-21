"use client";

import React, { useRef, useState } from 'react';
import { toast } from 'sonner';
import { apiPost } from '@/services/axios';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { X, UploadCloud, FileText, RefreshCcw, Loader2, CheckCircle2, ExternalLink } from 'lucide-react';

/**
 * Generic Family Card modal.
 *
 * Props:
 * - mode: 'upload' | 'view'
 *     'upload' -> show dropzone immediately.
 *     'view'   -> show PDF preview with Replace + optional Proceed buttons.
 * - familyCardUrl: string (required when mode='view') — full URL to the PDF.
 * - fileName: string (optional) — display name for the file.
 * - showVerifyActions: boolean (default false) — when true, renders
 *     "Looks good, proceed" button in view mode.
 * - onCancel: () => void — modal dismissed without action.
 * - onReplace: (newFileData) => void — called after a successful replace upload
 *     from view mode (the Replace button opens the file picker directly and
 *     uploads as soon as a file is chosen).
 * - onSuccess: (newFileData) => void — called after a successful upload from
 *     the upload/dropzone flow.
 * - onProceed: () => void — called when "Looks good, proceed" is clicked.
 *     Only relevant when showVerifyActions=true. Modal closes after calling this.
 */
const UserFamilyCardUploadModal = ({
  mode = 'upload',
  familyCardUrl = '',
  fileName = '',
  showVerifyActions = false,
  onCancel,
  onReplace,
  onSuccess,
  onProceed,
}) => {
  useBodyScrollLock();
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const inputRef = useRef(null);
  const replaceInputRef = useRef(null);

  const isValidFile = (f) => {
    if (!f) return false;
    if (f.type !== 'application/pdf' && !f.type.startsWith('image/')) {
      toast.error('Only PDF or image files are allowed.');
      return false;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error('File must be under 10MB.');
      return false;
    }
    return true;
  };

  const pickFile = (f) => {
    if (!isValidFile(f)) return;
    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    pickFile(e.dataTransfer.files?.[0]);
  };

  const uploadFile = async (f) => {
    const formData = new FormData();
    formData.append('family_card', f);
    const res = await apiPost('/uploads/family_card', formData);
    if (res?.status === 'success') {
      return res.data;
    }
    throw new Error(res?.message);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first.');
      return;
    }
    setUploading(true);
    try {
      const data = await uploadFile(file);
      toast.success('Family card uploaded successfully.');
      onSuccess?.(data);
    } catch (err) {
      toast.error(err.message ?? 'Something went wrong while uploading.');
    } finally {
      setUploading(false);
    }
  };

  // Replace button (view mode) opens the native file picker directly.
  const handleReplaceClick = () => {
    replaceInputRef.current?.click();
  };

  const handleReplaceFileChosen = async (e) => {
    const f = e.target.files?.[0];
    // reset input value so picking the same file again still fires onChange
    e.target.value = '';
    if (!isValidFile(f)) return;

    setReplacing(true);
    try {
      const data = await uploadFile(f);
      toast.success('Family card replaced successfully.');
      onReplace?.(data);
      if (showVerifyActions) {
        onCancel?.();
      }
    } catch (err) {
      toast.error(err.message ?? 'Something went wrong while replacing.');
    } finally {
      setReplacing(false);
    }
  };

  const handleProceed = () => {
    onProceed?.();
    onCancel?.();
  };

  const isViewMode = mode === 'view';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/50 p-4">
      <div role="dialog" aria-modal="true" aria-label="Family card document" className="bg-white rounded-xl border border-line shadow-xl w-full max-w-2xl max-h-[calc(100dvh-32px)] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-soft shrink-0">
          <div>
            <div className="text-[11px] font-semibold tracking-[1.5px] uppercase text-accent-ink mb-0.5">
              Family Card
            </div>
            <div className="text-sm font-bold text-ink">
              {isViewMode ? 'View Document' : 'Upload Document'}
            </div>
          </div>
          <button
            onClick={onCancel}
            aria-label="Close family card document"
            className="size-11 shrink-0 flex items-center justify-center rounded-md text-muted hover:text-ink hover:bg-soft transition-colors cursor-pointer border-none bg-transparent"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">

          {isViewMode ? (
            <>
              <div className="rounded-lg border border-line overflow-hidden bg-soft h-[55vh] relative">
                <iframe
                  src={familyCardUrl}
                  title="Family card document"
                  className="w-full h-full"
                />
                {replacing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                    <Loader2 size={22} className="animate-spin text-accent-ink" />
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between mt-3">
                <a
                  href={familyCardUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink transition-colors"
                >
                  <ExternalLink size={12} />
                  Open in new tab
                </a>
                {fileName && (
                  <span className="text-xs text-muted truncate max-w-[55%] text-right">
                    {fileName}
                  </span>
                )}
              </div>
            </>
          ) : (
            // Upload / Replace dropzone — accepts PDF and images
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed cursor-pointer transition-colors px-6 py-14 text-center ${dragOver ? 'border-accent bg-soft' : 'border-line bg-background hover:bg-soft'}`}
            >
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf,image/*"
                className="hidden"
                onChange={(e) => pickFile(e.target.files?.[0])}
              />
              {file ? (
                <>
                  <FileText size={28} className="text-accent-ink" strokeWidth={1.5} />
                  <div>
                    <p className="text-sm font-semibold text-ink">{file.name}</p>
                    <p className="text-xs text-muted mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB · click to change</p>
                  </div>
                </>
              ) : (
                <>
                  <UploadCloud size={28} className="text-muted" strokeWidth={1.5} />
                  <div>
                    <p className="text-sm font-semibold text-ink">Drag & drop your file here</p>
                    <p className="text-xs text-muted mt-0.5">or click to browse · PDF or image, max 10MB</p>
                  </div>
                </>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-4 py-4 sm:px-6 border-t border-soft bg-background flex flex-col-reverse items-stretch justify-end gap-3 shrink-0 sm:flex-row sm:flex-wrap sm:items-center">

          {isViewMode ? (
            <>
              {/* Hidden input used by the Replace button to open the file manager directly */}
              <input
                ref={replaceInputRef}
                type="file"
                accept="application/pdf,image/*"
                className="hidden"
                onChange={handleReplaceFileChosen}
              />

              {/* Close / Cancel */}
              <button
                onClick={onCancel}
                disabled={replacing}
                className="px-4 py-2 rounded-[7px] text-xs font-semibold text-muted hover:text-ink bg-white hover:bg-soft border border-line font-[inherit] transition-colors cursor-pointer disabled:opacity-40"
              >
                Close
              </button>

              {/* "Looks good, proceed" — only shown when showVerifyActions=true */}
              {showVerifyActions && (
                <button
                  onClick={handleProceed}
                  disabled={replacing}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-[7px] text-xs font-bold uppercase tracking-[0.6px] text-ink bg-accent hover:bg-accent border-none font-[inherit] transition-colors cursor-pointer disabled:opacity-40"
                >
                  <CheckCircle2 size={13} />
                  Looks good, proceed
                </button>
              )}

              {/* Replace — always visible in view mode, opens file manager immediately */}
              <button
                onClick={handleReplaceClick}
                disabled={replacing}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-[7px] text-xs font-bold uppercase tracking-[0.6px] font-[inherit] transition-colors cursor-pointer border-none disabled:opacity-60 ${showVerifyActions
                    ? 'text-ink bg-soft hover:bg-soft'
                    : 'text-ink bg-accent hover:bg-accent'}`}
              >
                {replacing ? <Loader2 size={13} className="animate-spin" /> : <RefreshCcw size={13} />}
                {replacing ? 'Replacing…' : (showVerifyActions ? 'Replace & proceed' : 'Replace Document')}
              </button>
            </>
          ) : (
            <>
              {/* Cancel — goes back to view if there's a file, otherwise closes */}
              <button
                onClick={onCancel}
                disabled={uploading}
                className="px-4 py-2 rounded-[7px] text-xs font-semibold text-muted hover:text-ink bg-white hover:bg-soft border border-line font-[inherit] transition-colors cursor-pointer disabled:opacity-40"
              >
                Cancel
              </button>
              {/* Upload */}
              <button
                onClick={handleUpload}
                disabled={uploading || !file}
                className={`flex items-center gap-1.5 px-5 py-2 rounded-[7px] text-xs font-bold uppercase tracking-[0.6px] border-none font-[inherit] transition-colors cursor-pointer ${uploading || !file ? 'bg-accent text-white cursor-not-allowed' : 'bg-accent hover:bg-accent text-ink'}`}
              >
                {uploading ? <Loader2 size={13} className="animate-spin" /> : <UploadCloud size={13} />}
                {uploading ? 'Uploading…' : 'Upload'}
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default UserFamilyCardUploadModal;
