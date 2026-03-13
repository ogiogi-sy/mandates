import { useState, useRef, useCallback, useEffect } from 'react';
import { PenLine, Eraser, Upload, Image as ImageIcon, X, Check } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { motion } from 'motion/react';

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[var(--text-muted)] ml-0.5 mb-[var(--space-sm)]" style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
      {children}
    </p>
  );
}

interface SignaturePadProps {
  applicantName: string;
  onSignatureChange: (hasSigned: boolean) => void;
}

export function SignaturePad({ applicantName, onSignatureChange }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const [signatureMode, setSignatureMode] = useState<'draw' | 'upload'>('draw');
  const [uploadedSignature, setUploadedSignature] = useState<string | null>(null);
  const [uploadFileName, setUploadFileName] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Notify parent when signature state changes
  useEffect(() => {
    onSignatureChange(hasSigned);
  }, [hasSigned, onSignatureChange]);

  const getCanvasPoint = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      return { x: (touch.clientX - rect.left) * scaleX, y: (touch.clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }, []);

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const point = getCanvasPoint(e);
    if (!point) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    lastPointRef.current = point;
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
  }, [getCanvasPoint]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const point = getCanvasPoint(e);
    if (!point || !lastPointRef.current) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const midX = (lastPointRef.current.x + point.x) / 2;
    const midY = (lastPointRef.current.y + point.y) / 2;
    ctx.quadraticCurveTo(lastPointRef.current.x, lastPointRef.current.y, midX, midY);
    ctx.stroke();
    lastPointRef.current = point;
    if (!hasSigned) setHasSigned(true);
  }, [isDrawing, getCanvasPoint, hasSigned]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    lastPointRef.current = null;
  }, []);

  const clearSignature = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error("That file type isn't supported. Please upload a PNG, JPG, or SVG.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('That file is too large. Please upload one under 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setUploadedSignature(dataUrl);
      setUploadFileName(file.name);
      setHasSigned(true);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    e.target.value = '';
  }, [handleFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const clearUploadedSignature = useCallback(() => {
    setUploadedSignature(null);
    setUploadFileName('');
    setHasSigned(false);
  }, []);

  const switchSignatureMode = useCallback((mode: 'draw' | 'upload') => {
    if (mode === signatureMode) return;
    if (mode === 'draw') {
      clearUploadedSignature();
    } else {
      clearSignature();
    }
    setSignatureMode(mode);
  }, [signatureMode, clearSignature, clearUploadedSignature]);

  // Set up canvas context style
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  return (
    <div>
      <SectionLabel>Digital signature</SectionLabel>
      <div className="bg-[var(--background-surface)] rounded-[var(--radius-lg)] border border-[var(--divider)] shadow-[var(--shadow-card-sm)] overflow-hidden">
        {/* Header + mode tabs */}
        <div className="px-[var(--space-lg)] pt-[var(--space-lg)] pb-[var(--space-md)]">
          <div className="flex items-center gap-[var(--space-sm)] mb-1">
            <PenLine size={15} className="text-[var(--accent-primary)]" />
            <span className="text-[var(--text-primary)]" style={{ fontSize: '15px', fontWeight: 600 }}>Sign to confirm</span>
          </div>
          <p className="text-[var(--text-muted)] mb-[var(--space-md)]" style={{ fontSize: '12px', lineHeight: '16px', fontWeight: 400 }}>
            Draw or upload your signature to authorise this mandate. This counts as your digital acceptance.
          </p>

          {/* Tab switcher */}
          <div className="flex rounded-[var(--radius-sm)] bg-[var(--background-surface-soft)] p-0.5 border border-[var(--divider)]">
            <button
              type="button"
              onClick={() => switchSignatureMode('draw')}
              className={`
                flex-1 flex items-center justify-center gap-1.5 min-h-[44px] rounded-[4px] transition-all
                ${signatureMode === 'draw'
                  ? 'bg-[var(--background-surface)] shadow-sm text-[var(--accent-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}
              `}
              style={{ fontSize: '13px', fontWeight: 600 }}
            >
              <PenLine size={13} />
              Draw
            </button>
            <button
              type="button"
              onClick={() => switchSignatureMode('upload')}
              className={`
                flex-1 flex items-center justify-center gap-1.5 min-h-[44px] rounded-[4px] transition-all
                ${signatureMode === 'upload'
                  ? 'bg-[var(--background-surface)] shadow-sm text-[var(--accent-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}
              `}
              style={{ fontSize: '13px', fontWeight: 600 }}
            >
              <Upload size={13} />
              Upload
            </button>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* ── Draw mode ── */}
        {signatureMode === 'draw' && (
          <>
            <div className="mx-[var(--space-lg)] mb-[var(--space-md)]">
              <div
                className={`
                  relative rounded-[var(--radius-md)] border-2 border-dashed transition-colors overflow-hidden
                  ${hasSigned
                    ? 'border-[var(--emerald-600)]/40 bg-white'
                    : isDrawing
                      ? 'border-[var(--accent-primary)] bg-white'
                      : 'border-[var(--divider)] bg-[var(--background-surface-soft)]'}
                `}
              >
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={180}
                  className="w-full cursor-crosshair touch-none"
                  style={{ height: '140px', display: 'block' }}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />

                {/* Signature baseline */}
                <div
                  className="absolute left-[var(--space-lg)] right-[var(--space-lg)] pointer-events-none"
                  style={{ bottom: '32px' }}
                >
                  <div className="w-full border-b border-[var(--divider)]" />
                </div>

                {/* Placeholder text */}
                {!hasSigned && !isDrawing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <PenLine size={20} className="text-[var(--text-muted)] opacity-40 mb-2" />
                    <span className="text-[var(--text-muted)] opacity-60" style={{ fontSize: '13px', fontWeight: 400 }}>
                      Draw your signature here
                    </span>
                  </div>
                )}

                {/* Signed indicator */}
                {hasSigned && (
                  <div className="absolute top-2 right-2 pointer-events-none">
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-pill)] bg-[var(--emerald-50)]">
                      <Check size={10} className="text-[var(--emerald-600)]" strokeWidth={3} />
                      <span className="text-[var(--emerald-600)]" style={{ fontSize: '10px', fontWeight: 600 }}>Signed</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer with clear + name */}
            <div className="flex items-center justify-between px-[var(--space-lg)] pb-[var(--space-lg)] pt-[var(--space-sm)]">
              <button
                type="button"
                onClick={clearSignature}
                disabled={!hasSigned}
                className={`
                  flex items-center gap-1.5 transition-all min-h-[44px] py-2
                  ${hasSigned
                    ? 'text-[var(--text-secondary)] hover:text-[var(--accent-primary)]'
                    : 'text-[var(--text-muted)] cursor-not-allowed opacity-50'}
                `}
                style={{ fontSize: '13px', fontWeight: 600 }}
              >
                <Eraser size={13} />
                Clear signature
              </button>
              <div className="text-right">
                <span className="text-[var(--text-muted)]" style={{ fontSize: '11px', fontWeight: 400 }}>
                  {applicantName}
                </span>
                <span className="text-[var(--text-muted)] block" style={{ fontSize: '10px', fontWeight: 400 }}>
                  {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </>
        )}

        {/* ── Upload mode ── */}
        {signatureMode === 'upload' && (
          <div className="mx-[var(--space-lg)] mb-[var(--space-lg)]">
            {!uploadedSignature ? (
              /* Drop zone */
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  relative rounded-[var(--radius-md)] border-2 border-dashed transition-all cursor-pointer
                  ${isDragOver
                    ? 'border-[var(--accent-primary)] bg-[var(--blue-50)]'
                    : 'border-[var(--divider)] bg-[var(--background-surface-soft)] hover:border-[var(--accent-primary)]/50 hover:bg-[var(--blue-50)]/30'}
                `}
                style={{ height: '140px' }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center transition-colors
                      ${isDragOver ? 'bg-[var(--blue-50)]' : 'bg-[var(--background-surface)]'}
                    `}
                  >
                    <Upload size={18} className={isDragOver ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'} />
                  </div>
                  <div className="text-center">
                    <p className="text-[var(--text-primary)]" style={{ fontSize: '13px', fontWeight: 600 }}>
                      {isDragOver ? 'Drop your signature here' : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-[var(--text-muted)] mt-0.5" style={{ fontSize: '11px', fontWeight: 400 }}>
                      PNG, JPG, SVG or WebP (max 5MB)
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Uploaded preview */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative rounded-[var(--radius-md)] border-2 border-[var(--emerald-600)]/40 bg-white overflow-hidden"
                style={{ height: '140px' }}
              >
                <img
                  src={uploadedSignature}
                  alt="Uploaded signature"
                  className="w-full h-full object-contain p-4"
                />

                {/* Uploaded indicator */}
                <div className="absolute top-2 right-2">
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-pill)] bg-[var(--emerald-50)]">
                    <Check size={10} className="text-[var(--emerald-600)]" strokeWidth={3} />
                    <span className="text-[var(--emerald-600)]" style={{ fontSize: '10px', fontWeight: 600 }}>Uploaded</span>
                  </div>
                </div>

                {/* File info + actions */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white/90 via-white/60 to-transparent px-3 pb-2 pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <ImageIcon size={12} className="text-[var(--text-muted)] shrink-0" />
                      <span className="text-[var(--text-muted)] truncate" style={{ fontSize: '11px', fontWeight: 400, maxWidth: '160px' }}>
                        {uploadFileName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[var(--accent-primary)] hover:opacity-80 transition-opacity"
                        style={{ fontSize: '12px', fontWeight: 600 }}
                      >
                        Replace
                      </button>
                      <button
                        type="button"
                        onClick={clearUploadedSignature}
                        className="w-6 h-6 rounded-full bg-[var(--background-surface)] border border-[var(--divider)] flex items-center justify-center hover:bg-[var(--red-50)] hover:border-[var(--red-600)]/20 transition-colors"
                      >
                        <X size={12} className="text-[var(--text-muted)]" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Name + date label for upload mode */}
            <div className="flex justify-end mt-[var(--space-sm)]">
              <div className="text-right">
                <span className="text-[var(--text-muted)]" style={{ fontSize: '11px', fontWeight: 400 }}>
                  {applicantName}
                </span>
                <span className="text-[var(--text-muted)] block" style={{ fontSize: '10px', fontWeight: 400 }}>
                  {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
