import React, { useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Download, FileText, ImageUp, Loader2, PenLine, Upload, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { useDocumentDownload } from './services/panels/shared';
import { DOWNLOADABLE_DOCUMENTS } from '../../data/studentDocuments';
import { saveMedia, useStudentMedia, type MediaKind, type StoredMedia } from '../../data/studentMedia';
import { fitImage, formatBytes } from '../../utils/image';

type Tab = 'uploads' | 'downloads';

const UPLOADS: Record<
  MediaKind,
  { title: string; icon: typeof UserIcon; box: { w: number; h: number; bytes: number; crop?: number }; aspect: string; guidelines: string[] }
> = {
  photo: {
    title: 'Photo',
    icon: UserIcon,
    box: { w: 600, h: 800, bytes: 200 * 1024, crop: 3 / 4 },
    aspect: 'aspect-[3/4] w-36 sm:w-40',
    guidelines: [
      'Passport size photograph',
      'Any image format or file size — straight from your phone is fine',
      'Automatically resized to fit 600×800 and 200KB',
      'Clear, recent photograph with white background',
      'Face should be clearly visible',
    ],
  },
  signature: {
    title: 'Signature',
    icon: PenLine,
    box: { w: 600, h: 200, bytes: 100 * 1024 },
    aspect: 'aspect-[3/1] w-full max-w-xs',
    guidelines: [
      'Scanned signature on white paper',
      'Any image format or file size — a phone snap of the paper works',
      'Automatically resized to fit 600×200 and 100KB',
      'Use dark ink (black or blue)',
      'Signature should not be cropped',
    ],
  },
};

const formatUpdated = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });

const UploadCard: React.FC<{ kind: MediaKind; current: StoredMedia | null }> = ({ kind, current }) => {
  const cfg = UPLOADS[kind];
  const { toast } = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [lastResize, setLastResize] = useState<string | null>(null);

  const handle = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast(`${cfg.title} must be an image`, { description: 'Use a JPG, PNG, HEIC or any photo from your phone.', tone: 'error' });
      return;
    }
    setBusy(true);
    try {
      const r = await fitImage(file, { maxWidth: cfg.box.w, maxHeight: cfg.box.h, maxBytes: cfg.box.bytes, cropAspect: cfg.box.crop });
      saveMedia(kind, { dataUrl: r.dataUrl, bytes: r.bytes, width: r.width, height: r.height, updatedAt: new Date().toISOString() });
      setLastResize(`${formatBytes(r.originalBytes)} → ${formatBytes(r.bytes)}, ${r.width}×${r.height}`);
      toast(current ? `${cfg.title} updated` : `${cfg.title} uploaded`, { description: 'It will appear on your registration and admit cards.', tone: 'success' });
    } catch {
      toast(`Could not read that ${kind}`, { description: 'Try another photo or take a new one.', tone: 'error' });
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };

  return (
    <section className="card p-5 sm:p-6 animate-fade-up">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <cfg.icon className="w-5 h-5 text-campus-700 dark:text-campus-400" /> {cfg.title}
        </h2>
        {current ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400 rounded-full px-2.5 py-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-400 rounded-full px-2.5 py-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Not uploaded
          </span>
        )}
      </div>

      <div className="mt-5 grid gap-6 md:grid-cols-[auto,1fr] items-start">
        <div className="flex flex-col items-start gap-3">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              handle(e.dataTransfer.files[0]);
            }}
            className={`${cfg.aspect} rounded-lg border-2 overflow-hidden bg-white flex items-center justify-center transition-colors ${
              dragging ? 'border-campus-500 border-solid bg-campus-50' : current ? 'border-slate-200 dark:border-slate-700' : 'border-dashed border-slate-300 dark:border-slate-700 dark:bg-slate-900'
            }`}
          >
            {busy ? (
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            ) : current ? (
              <img src={current.dataUrl} alt={`Your ${kind}`} className="w-full h-full object-contain" />
            ) : (
              <div className="text-center px-3 text-xs text-slate-500">
                <ImageUp className="w-6 h-6 mx-auto mb-1.5 text-slate-400" />
                Drop {kind === 'photo' ? 'a photo' : 'your signature'} here
              </div>
            )}
          </div>
          <input ref={input} type="file" accept="image/*" className="sr-only" onChange={(e) => handle(e.target.files?.[0])} aria-label={`Choose ${kind}`} />
          <button type="button" onClick={() => input.current?.click()} disabled={busy} className={current ? 'btn-secondary' : 'btn-primary'}>
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {busy ? 'Resizing…' : current ? `Update ${kind}` : `Upload ${kind}`}
          </button>
          {current && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {lastResize ?? `${current.width}×${current.height}, ${formatBytes(current.bytes)}`}
              <br />
              Updated {formatUpdated(current.updatedAt)}
            </p>
          )}
        </div>

        <div>
          <h3 className="eyebrow">Guidelines</h3>
          <ul className="mt-2 space-y-2">
            {cfg.guidelines.map((g) => (
              <li key={g} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-campus-600 dark:text-campus-400" /> {g}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export const DocumentsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const download = useDocumentDownload();
  const media = useStudentMedia();
  const [params, setParams] = useSearchParams();
  const tab: Tab = params.get('tab') === 'downloads' ? 'downloads' : 'uploads';
  const missing = [!media.photo && 'photo', !media.signature && 'signature'].filter(Boolean) as string[];

  return (
    <div className="space-y-6 max-w-5xl">
      <header className="animate-fade-up">
        <h1 className="text-2xl sm:text-3xl font-semibold">Documents</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
          Upload your photo and signature once. They are printed on your registration card and exam admit card.
        </p>
      </header>

      <div role="tablist" className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        {([
          { id: 'uploads', label: 'Uploads', icon: Upload },
          { id: 'downloads', label: 'Downloads', icon: Download },
        ] as const).map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setParams(t.id === 'uploads' ? {} : { tab: t.id }, { replace: true })}
            className={`inline-flex items-center gap-2 h-10 px-4 rounded-lg text-sm font-medium transition-[background-color,color,box-shadow] duration-200 ${
              tab === t.id ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'uploads' ? (
        <div key="uploads" className="space-y-4">
          <UploadCard kind="photo" current={media.photo} />
          <UploadCard kind="signature" current={media.signature} />
        </div>
      ) : (
        <div key="downloads" className="space-y-4 animate-fade-in">
          {missing.length > 0 && (
            <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40 p-4 text-sm text-amber-900 dark:text-amber-200">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>
                Your {missing.join(' and ')} {missing.length > 1 ? 'are' : 'is'} missing, so the cards will print with an empty box.{' '}
                <button type="button" onClick={() => setParams({}, { replace: true })} className="font-semibold underline underline-offset-2">
                  Upload now
                </button>
              </p>
            </div>
          )}
          <ul className="card divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
            {DOWNLOADABLE_DOCUMENTS.map((d) => (
              <li key={d.id} className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5">
                <div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 bg-campus-50 text-campus-700 dark:bg-campus-950/50 dark:text-campus-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-900 dark:text-white">{d.name}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">{d.description}</div>
                  <div className="text-xs text-slate-400 mt-0.5">PDF · {d.issuedBy}</div>
                </div>
                <button type="button" onClick={() => download(d.build(currentUser))} className="btn-primary shrink-0 px-3 sm:px-4" aria-label={`Download ${d.name}`}>
                  <Download className="w-4 h-4" /> <span className="hidden sm:inline">Download</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;
