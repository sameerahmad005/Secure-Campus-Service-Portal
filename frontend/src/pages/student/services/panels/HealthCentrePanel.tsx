import React, { useState } from 'react';
import { CheckCircle2, Printer } from 'lucide-react';
import { Section, Callout, FormActions, useInstantAction, useDocumentDownload, type PanelProps } from './shared';

const CLINICS = ['General medicine', 'Dental', 'Eye clinic', 'Skin', 'ENT', 'Orthopaedics and physiotherapy'];
const SLOTS = ['Today, 10:30–11:30', 'Today, 12:00–13:30', 'Tomorrow, 09:00–10:30', 'Tomorrow, 11:00–12:30'];

const HealthCentrePanel: React.FC<PanelProps> = ({ service, user }) => {
  const { run, busy: submitting } = useInstantAction(service);
  const download = useDocumentDownload();
  const [clinic, setClinic] = useState(CLINICS[0]);
  const [slot, setSlot] = useState(SLOTS[0]);
  const [symptoms, setSymptoms] = useState('');
  const [token, setToken] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = `UHS-2026-${Math.floor(100 + Math.random() * 900)}`;
    const ok = await run(`Token ${t} booked`, `${clinic}, ${slot}`);
    if (ok) setToken(t);
  };

  if (token) {
    return (
      <div className="card p-6 sm:p-8 text-center animate-scale-in">
        <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
        <h3 className="text-lg font-semibold mt-3">Your OPD token</h3>
        <div className="text-4xl font-semibold font-mono tracking-tight text-slate-900 dark:text-white mt-2">{token}</div>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-3">
          {clinic} · {slot}
          <br />
          Room 12, OPD wing, University Health Centre
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <button
            type="button"
            className="btn-primary"
            onClick={() =>
              download({
                title: 'OPD Token',
                reference: token,
                issuedBy: 'University Health Centre',
                holderName: user?.name || 'Tariq Ahmad',
                rows: [
                  { label: 'Clinic', value: clinic },
                  { label: 'Slot', value: slot },
                  { label: 'Room', value: '12, OPD wing' },
                  { label: 'Reason for visit', value: symptoms },
                ],
                note: 'Bring your student ID card. Reach 10 minutes before your slot.',
              })
            }
          >
            <Printer className="w-4 h-4" /> Download OPD slip (PDF)
          </button>
          <button type="button" className="btn-secondary" onClick={() => { setToken(null); setSymptoms(''); }}>
            Book another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Callout tone="info">
        Consultation and basic medicines are free for enrolled students. For an emergency, go straight to JNMC Casualty, open 24 hours.
      </Callout>
      <Section title="Book an OPD token">
        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="opd-clinic" className="field-label">Clinic</label>
              <select id="opd-clinic" value={clinic} onChange={(e) => setClinic(e.target.value)} className="field">
                {CLINICS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="opd-slot" className="field-label">Slot</label>
              <select id="opd-slot" value={slot} onChange={(e) => setSlot(e.target.value)} className="field">
                {SLOTS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="opd-symptoms" className="field-label">Symptoms or reason <span className="text-rose-600">*</span></label>
              <textarea id="opd-symptoms" required rows={3} value={symptoms} onChange={(e) => setSymptoms(e.target.value)} placeholder="e.g. fever for 2 days, or a dental check-up" className="field" />
            </div>
          </div>
          <FormActions submitting={submitting} label="Get token" busyLabel="Booking…" note="Tokens are issued straight away" />
        </form>
      </Section>
    </div>
  );
};

export default HealthCentrePanel;
