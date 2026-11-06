import React, { useEffect, useState } from 'react';
import { RotateCw } from 'lucide-react';
import { getStudentBioData, formatDate, type StudentBioData } from '../../../../data/studentProfile';
import { useStudentMedia } from '../../../../data/studentMedia';
import { Section, DownloadButton, FormActions, useServiceSubmit, type PanelProps } from './shared';

const useQr = (text: string) => {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    import('qrcode').then((QR) =>
      (QR.default ?? QR).toDataURL(text, { margin: 0, width: 240 }).then((url: string) => alive && setSrc(url))
    );
    return () => {
      alive = false;
    };
  }, [text]);
  return src;
};

const CardField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="min-w-0">
    <div className="text-[9px] sm:text-[10px] uppercase tracking-wide text-slate-500 leading-tight">{label}</div>
    <div className="text-[11px] sm:text-xs font-semibold text-slate-900 truncate">{value}</div>
  </div>
);

const CardFront: React.FC<{ bio: StudentBioData; photo?: string }> = ({ bio, photo }) => (
  <div className="absolute inset-0 rounded-2xl overflow-hidden bg-white text-slate-900 flex flex-col [backface-visibility:hidden] shadow-xl shadow-emerald-950/15 ring-1 ring-black/5">
    <div className="bg-institutional-green text-white px-4 pt-2.5 pb-2 border-b-2 border-institutional-gold">
      <div className="text-[11px] sm:text-sm font-semibold tracking-wide">ALIGARH MUSLIM UNIVERSITY</div>
      <div className="flex justify-between text-[9px] sm:text-[10px] text-emerald-100 tracking-wider">
        <span>STUDENT IDENTITY CARD</span>
        <span>Session {bio.session}</span>
      </div>
    </div>
    <div className="flex-1 flex gap-3 sm:gap-4 px-4 pt-3">
      <div className="w-[24%] aspect-[4/5] rounded-md bg-slate-200 overflow-hidden ring-1 ring-slate-300 shrink-0 flex items-center justify-center text-2xl font-semibold text-slate-500">
        {photo ? <img src={photo} alt="" className="w-full h-full object-cover" /> : bio.fullName.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm sm:text-base font-semibold leading-tight truncate">{bio.fullName}</div>
        <div className="text-[10px] sm:text-xs text-slate-600 truncate">{bio.course}</div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2">
          <CardField label="Enrolment no." value={bio.enrolmentNo} />
          <CardField label="Faculty no." value={bio.facultyNo} />
          <CardField label="Hall" value={bio.hall.replace('Sir Syed Hall', 'SS Hall')} />
          <CardField label="Blood group" value={bio.bloodGroup} />
        </div>
      </div>
    </div>
    <div className="flex justify-end px-4 -mt-1 mb-1">
      <div className="text-center w-[28%]">
        <svg viewBox="0 0 60 14" className="w-full h-4 text-blue-900" aria-hidden="true">
          <path d="M4 10 C10 0, 16 0, 18 10 S24 12, 26 6 S32 2, 34 9 S42 8, 46 5 S54 6, 58 7" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <div className="border-t border-slate-400 text-[8px] sm:text-[9px] text-slate-500">Proctor</div>
      </div>
    </div>
    <div className="bg-institutional-green text-white text-[9px] sm:text-[10px] px-4 py-1 flex justify-between">
      <span>Valid through {bio.validThrough}</span>
      <span>amu.ac.in</span>
    </div>
  </div>
);

const CardBack: React.FC<{ bio: StudentBioData; qr: string | null; reference: string }> = ({ bio, qr, reference }) => (
  <div className="absolute inset-0 rounded-2xl overflow-hidden bg-slate-50 text-slate-900 flex flex-col [backface-visibility:hidden] [transform:rotateY(180deg)] shadow-xl shadow-emerald-950/15 ring-1 ring-black/5">
    <div className="h-1.5 bg-institutional-green" />
    <div className="flex-1 flex gap-3 px-4 pt-2.5">
      <div className="flex-1 min-w-0 space-y-1.5">
        <CardField label="Father's name" value={bio.fatherName} />
        <CardField label="Date of birth" value={formatDate(bio.dateOfBirth)} />
        <CardField label="Mobile" value={bio.mobile} />
        <div>
          <div className="text-[9px] sm:text-[10px] uppercase tracking-wide text-slate-500 leading-tight">Address</div>
          <div className="text-[11px] sm:text-xs font-semibold text-slate-900 line-clamp-2">{bio.address}</div>
        </div>
      </div>
      <div className="w-[26%] shrink-0 text-center">
        <div className="aspect-square bg-white rounded-md p-1 ring-1 ring-slate-200">
          {qr ? <img src={qr} alt="Verification QR code" className="w-full h-full" /> : <div className="skeleton w-full h-full" />}
        </div>
        <div className="text-[8px] sm:text-[9px] text-slate-500 mt-0.5">Scan to verify</div>
      </div>
    </div>
    <p className="px-4 pt-1.5 mt-1 border-t border-slate-200 text-[8px] sm:text-[9px] leading-snug text-slate-600">
      Property of Aligarh Muslim University. Carry it on campus and show it on request. If found, return to the Proctor Office, AMU, Aligarh 202002.
    </p>
    <div className="px-4 py-1.5 flex justify-between text-[8px] sm:text-[9px]">
      <span className="font-semibold">Proctor control room: +91 571 2700010</span>
      <span className="font-mono text-slate-500">{reference}</span>
    </div>
  </div>
);

const IdCardPanel: React.FC<PanelProps> = ({ service, user, onRequestCreated }) => {
  const { submit, submitting } = useServiceSubmit(service, user, onRequestCreated);
  const [reason, setReason] = useState('Lost card');
  const [gdRef, setGdRef] = useState('');
  const [side, setSide] = useState<'front' | 'back'>('front');
  const bio = getStudentBioData(user);
  const media = useStudentMedia();
  const doc = service.issuedDocuments[0].build(user);
  const qr = useQr(`https://amu.ac.in/verify?ref=${encodeURIComponent(doc.reference)}`);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await submit(
      { serviceType: reason, firDetails: gdRef, reason: 'Duplicate card requested from portal' },
      'Duplicate card requested',
      'Collect it from the Proctor counter in 3 working days.'
    );
    if (ok) setGdRef('');
  };

  return (
    <div className="space-y-6">
      <Section
        title="Your ID card"
        description="Tap the card to see the other side."
        action={<DownloadButton spec={doc} variant="primary" label="Download PDF" />}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="inline-flex p-1 rounded-lg bg-slate-100 dark:bg-slate-800" role="tablist" aria-label="Card side">
            {(['front', 'back'] as const).map((s) => (
              <button
                key={s}
                type="button"
                role="tab"
                aria-selected={side === s}
                onClick={() => setSide(s)}
                className={`h-9 px-4 rounded-md text-sm font-medium capitalize transition-[background-color,color,box-shadow] duration-200 ${
                  side === s ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setSide((s) => (s === 'front' ? 'back' : 'front'))}
            className="group w-full max-w-[430px] [perspective:1200px] rounded-2xl text-left"
            aria-label={`Showing ${side} of ID card. Flip card.`}
          >
            <div
              className={`relative w-full aspect-[85.6/54] transition-transform duration-700 ease-out [transform-style:preserve-3d] ${
                side === 'back' ? '[transform:rotateY(180deg)]' : ''
              }`}
            >
              <CardFront bio={bio} photo={media.photo?.dataUrl ?? user?.avatarUrl} />
              <CardBack bio={bio} qr={qr} reference={doc.reference} />
            </div>
          </button>
          <p className="text-xs text-slate-500 dark:text-slate-400 inline-flex items-center gap-1.5">
            <RotateCw className="w-3.5 h-3.5" /> The PDF prints at real card size, front and back.
          </p>
        </div>
      </Section>

      <Section title="Apply for a duplicate card" description="For a lost, stolen or damaged card. Processed by the Proctorial Office.">
        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="id-reason" className="field-label">Reason</label>
              <select id="id-reason" value={reason} onChange={(e) => setReason(e.target.value)} className="field">
                <option>Lost card</option>
                <option>Damaged card or chip</option>
                <option>Bio-data updated</option>
              </select>
            </div>
            <div>
              <label htmlFor="id-gd" className="field-label">
                Police or Proctor GD reference {reason === 'Lost card' && <span className="text-rose-600">*</span>}
              </label>
              <input
                id="id-gd"
                value={gdRef}
                onChange={(e) => setGdRef(e.target.value)}
                required={reason === 'Lost card'}
                placeholder="e.g. GD-2026-4402"
                className="field"
              />
            </div>
          </div>
          <FormActions submitting={submitting} label="Submit application" note="Ready in 3 working days" />
        </form>
      </Section>
    </div>
  );
};

export default IdCardPanel;
