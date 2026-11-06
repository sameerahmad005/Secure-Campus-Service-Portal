import React, { useMemo, useRef, useState } from 'react';
import { Pencil, X, Upload, FileText, Image as ImageIcon, AlertTriangle, CheckCircle2, Undo2 } from 'lucide-react';
import { COURSES, GENDERS, formatDate, getStudentBioData, type StudentBioData } from '../../../../data/studentProfile';
import { Section, FormActions, useServiceSubmit, type PanelProps } from './shared';

type FieldKey = 'fullName' | 'email' | 'facultyNo' | 'course' | 'gender' | 'mobile' | 'dateOfBirth' | 'fatherName' | 'motherName';

interface FieldDef {
  key: FieldKey;
  label: string;
  type: 'text' | 'email' | 'tel' | 'date' | 'select';
  options?: string[];
  placeholder?: string;
  validate?: (v: string) => string | null;
  display?: (v: string) => string;
}

const FIELDS: FieldDef[] = [
  { key: 'fullName', label: 'Full name', type: 'text', placeholder: 'As on your Class X certificate', validate: (v) => (v.trim().length < 3 ? 'Enter your full name.' : null) },
  { key: 'email', label: 'Email', type: 'email', placeholder: 'name@amu.ac.in', validate: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'Enter a valid email address.') },
  { key: 'facultyNo', label: 'Faculty no.', type: 'text', placeholder: 'e.g. 23COB102', validate: (v) => (/^[0-9]{2}[A-Z]{3}[0-9]{3}$/i.test(v.trim()) ? null : 'Use the format 23COB102.') },
  { key: 'course', label: 'Course', type: 'select', options: COURSES },
  { key: 'gender', label: 'Gender', type: 'select', options: GENDERS },
  { key: 'mobile', label: 'Mobile', type: 'tel', placeholder: '10-digit mobile number', validate: (v) => (/^(\+91[\s-]?)?[6-9]\d{4}\s?\d{5}$/.test(v.trim()) ? null : 'Enter a 10-digit Indian mobile number.') },
  { key: 'dateOfBirth', label: 'Date of birth', type: 'date', display: formatDate, validate: (v) => (v ? null : 'Pick a date.') },
  { key: 'fatherName', label: 'Father’s name', type: 'text', validate: (v) => (v.trim().length < 3 ? 'Enter the full name.' : null) },
  { key: 'motherName', label: 'Mother’s name', type: 'text', validate: (v) => (v.trim().length < 3 ? 'Enter the full name.' : null) },
];

const MAX_PDF_BYTES = 2 * 1024 * 1024;
const MAX_IMAGE_EDGE = 1600;

const formatBytes = (n: number) => (n < 1024 * 1024 ? `${Math.round(n / 1024)} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`);

/** Shrinks a photo so its longest side is at most 1600 px and re-encodes it as JPEG. */
async function resizeImage(file: File): Promise<File> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });
    const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', 0.85));
    if (!blob) return file;
    const name = file.name.replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], name, { type: 'image/jpeg' });
  } finally {
    URL.revokeObjectURL(url);
  }
}

const ProfileCorrectionPanel: React.FC<PanelProps> = ({ service, user, onRequestCreated }) => {
  const { submit, submitting } = useServiceSubmit(service, user, onRequestCreated);
  const current = useMemo(() => getStudentBioData(user), [user]);

  const [edits, setEdits] = useState<Partial<Record<FieldKey, string>>>({});
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [reason, setReason] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileNote, setFileNote] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const changedKeys = (Object.keys(edits) as FieldKey[]).filter((k) => edits[k] !== undefined);

  const startEdit = (k: FieldKey) => setEdits((e) => ({ ...e, [k]: current[k as keyof StudentBioData] as string }));
  const cancelEdit = (k: FieldKey) => {
    setEdits((e) => {
      const next = { ...e };
      delete next[k];
      return next;
    });
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const clearFile = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setFileNote(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const acceptFile = async (f: File | undefined) => {
    setFileError(null);
    setFileNote(null);
    if (!f) return;
    if (f.type === 'application/pdf') {
      if (f.size > MAX_PDF_BYTES) {
        setFileError(`This PDF is ${formatBytes(f.size)}. PDFs must be 2 MB or smaller.`);
        return;
      }
      clearFile();
      setFile(f);
      return;
    }
    if (f.type.startsWith('image/')) {
      setProcessing(true);
      try {
        const resized = await resizeImage(f);
        clearFile();
        setFile(resized);
        setPreview(URL.createObjectURL(resized));
        if (resized.size < f.size) setFileNote(`Resized from ${formatBytes(f.size)} to ${formatBytes(resized.size)}.`);
      } catch {
        setFileError('That image could not be read. Try a JPG or PNG.');
      } finally {
        setProcessing(false);
      }
      return;
    }
    setFileError('Upload a PDF or a photo (JPG, PNG, HEIC).');
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const nextErrors: Partial<Record<FieldKey, string>> = {};
    const realChanges = changedKeys.filter((k) => (edits[k] ?? '').trim() !== String(current[k as keyof StudentBioData]).trim());

    changedKeys.forEach((k) => {
      const def = FIELDS.find((f) => f.key === k)!;
      const v = edits[k] ?? '';
      const err = def.validate?.(v);
      if (err) nextErrors[k] = err;
      else if (!realChanges.includes(k)) nextErrors[k] = 'This is the same as the current value.';
    });
    setErrors(nextErrors);

    if (realChanges.length === 0) {
      setFormError('Choose at least one field and enter the correct value.');
      return;
    }
    if (Object.keys(nextErrors).length > 0) return;
    if (reason.trim().length < 10) {
      setFormError('Tell the Registrar why the record is wrong (at least 10 characters).');
      return;
    }

    const formData: Record<string, string> = {
      fieldsToCorrect: realChanges.map((k) => FIELDS.find((f) => f.key === k)!.label).join(', '),
      reason: reason.trim(),
      supportingDoc: file ? `${file.name} (${formatBytes(file.size)})` : 'Not attached',
    };
    realChanges.forEach((k) => {
      formData[`${k}_current`] = String(current[k as keyof StudentBioData]);
      formData[`${k}_corrected`] = (edits[k] ?? '').trim();
    });

    const ok = await submit(formData, 'Correction request sent to the Registrar', undefined, file ? [file] : undefined);
    if (ok) {
      setEdits({});
      setReason('');
      clearFile();
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <Section
        title="Your registered details"
        description="Choose Change next to anything that is wrong. You can correct several fields in one request."
        action={
          changedKeys.length > 0 ? (
            <span className="text-sm font-medium text-campus-700 dark:text-campus-400">{changedKeys.length} selected</span>
          ) : undefined
        }
      >
        <ul className="divide-y divide-slate-100 dark:divide-slate-800 -my-3">
          {FIELDS.map((f) => {
            const value = String(current[f.key as keyof StudentBioData]);
            const editing = edits[f.key] !== undefined;
            const err = errors[f.key];
            const id = `bio-${f.key}`;
            return (
              <li key={f.key} className="py-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0 sm:grid sm:grid-cols-[180px_1fr] sm:items-center sm:gap-4">
                    <div className="text-sm text-slate-500 dark:text-slate-400">{f.label}</div>
                    <div className={`text-sm font-medium truncate ${editing ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-900 dark:text-white'}`}>
                      {f.display ? f.display(value) : value}
                    </div>
                  </div>
                  {editing ? (
                    <button type="button" onClick={() => cancelEdit(f.key)} className="btn-secondary h-9 px-3 shrink-0" aria-label={`Cancel change to ${f.label}`}>
                      <Undo2 className="w-4 h-4" /> <span className="hidden sm:inline">Undo</span>
                    </button>
                  ) : (
                    <button type="button" onClick={() => startEdit(f.key)} className="btn-secondary h-9 px-3 shrink-0" aria-label={`Change ${f.label}`}>
                      <Pencil className="w-4 h-4" /> <span className="hidden sm:inline">Change</span>
                    </button>
                  )}
                </div>
                <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${editing ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    {editing && (
                      <div className="pt-3 sm:pl-[196px]">
                        <label htmlFor={id} className="field-label">Correct {f.label.toLowerCase()}</label>
                        {f.type === 'select' ? (
                          <select id={id} value={edits[f.key]} onChange={(e) => setEdits((s) => ({ ...s, [f.key]: e.target.value }))} className="field">
                            {f.options!.map((o) => <option key={o}>{o}</option>)}
                          </select>
                        ) : (
                          <input
                            id={id}
                            type={f.type}
                            autoFocus
                            inputMode={f.type === 'tel' ? 'tel' : undefined}
                            value={edits[f.key]}
                            onChange={(e) => {
                              setEdits((s) => ({ ...s, [f.key]: e.target.value }));
                              if (err) setErrors((s) => ({ ...s, [f.key]: undefined }));
                            }}
                            placeholder={f.placeholder}
                            aria-invalid={!!err}
                            aria-describedby={err ? `${id}-err` : undefined}
                            className={`field ${err ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
                          />
                        )}
                        {err && <p id={`${id}-err`} className="text-xs text-rose-600 mt-1">{err}</p>}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section title="Reason and proof">
        <div className="space-y-5">
          <div>
            <label htmlFor="bio-reason" className="field-label">Reason for correction <span className="text-rose-600">*</span></label>
            <textarea
              id="bio-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. My father's name is spelt Ahmadulla on the portal but Ahmadullah on my Class X marksheet."
              className="field"
            />
          </div>

          <div>
            <div className="field-label">
              Supporting document <span className="font-normal text-slate-500">(optional)</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              Office order, marksheet or ID. PDF up to 2 MB, or any photo. Photos are resized for you.
            </p>

            {file ? (
              <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 animate-scale-in">
                {preview ? (
                  <img src={preview} alt="" className="w-12 h-12 rounded-md object-cover ring-1 ring-black/5" />
                ) : (
                  <div className="w-12 h-12 rounded-md bg-white flex items-center justify-center ring-1 ring-black/5">
                    <FileText className="w-6 h-6 text-rose-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900 truncate flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> {file.name}
                  </div>
                  <div className="text-xs text-slate-600">{formatBytes(file.size)}{fileNote ? ` · ${fileNote}` : ''}</div>
                </div>
                <button type="button" onClick={clearFile} className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white/70" aria-label="Remove document">
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  acceptFile(e.dataTransfer.files?.[0]);
                }}
                className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center cursor-pointer transition-colors duration-200 ${
                  dragging ? 'border-campus-600 bg-campus-50' : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 hover:bg-slate-50'
                }`}
              >
                {processing ? (
                  <span className="w-6 h-6 rounded-full border-2 border-slate-300 border-t-campus-700 animate-spin" />
                ) : (
                  <div className="flex gap-2 text-slate-400">
                    <Upload className="w-6 h-6" />
                  </div>
                )}
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {processing ? 'Resizing photo…' : 'Choose a file or drop it here'}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-3">
                  <span className="inline-flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> PDF ≤ 2 MB</span>
                  <span className="inline-flex items-center gap-1"><ImageIcon className="w-3.5 h-3.5" /> Any photo</span>
                </span>
                <input
                  ref={inputRef}
                  type="file"
                  accept="application/pdf,image/*"
                  className="sr-only"
                  onChange={(e) => acceptFile(e.target.files?.[0])}
                />
              </label>
            )}
            {fileError && <p className="text-xs text-rose-600 mt-1.5" role="alert">{fileError}</p>}

            {!file && (
              <div className="mt-3 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="note">
                <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
                <p>
                  <strong className="font-semibold">No document attached.</strong> Correction requests without a supporting document (office order, marksheet or ID) are very likely to be rejected. Attaching proof greatly improves your chances.
                </p>
              </div>
            )}
          </div>
        </div>

        {formError && (
          <p className="mt-4 text-sm text-rose-600 flex items-center gap-2" role="alert">
            <AlertTriangle className="w-4 h-4" /> {formError}
          </p>
        )}
        <FormActions
          submitting={submitting}
          label={changedKeys.length > 1 ? `Submit ${changedKeys.length} corrections` : 'Submit correction'}
          note={`Takes ${service.turnaround.toLowerCase()}. Bring the original document to the Academic Section.`}
        />
      </Section>
    </form>
  );
};

export default ProfileCorrectionPanel;
