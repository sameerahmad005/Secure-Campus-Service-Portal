import React, { useState } from 'react';
import { Laptop, Smartphone, Tablet, Trash2, KeyRound } from 'lucide-react';
import { readLocal, writeLocal } from '../../../../utils/localStore';
import { Section, useInstantAction, type PanelProps } from './shared';
import { PasswordChangeForm } from './PasswordChangeForm';

const MAC_PATTERN = /^([0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}$/;
const DEVICE_LIMIT = 3;
const DEVICES_KEY = 'amu-wifi-devices';
const PASSWORD_KEY = 'amu-wifi-password-changed';

interface Device {
  name: string;
  mac: string;
  addedAt: string;
}

const DEFAULT_DEVICES: Device[] = [
  { name: 'MacBook Air M2', mac: 'A4:83:E7:22:90:1A', addedAt: '2026-08-02T10:00:00Z' },
  { name: 'iPhone 15', mac: 'F0:18:98:C3:54:12', addedAt: '2026-08-02T10:05:00Z' },
];

const deviceIcon = (name: string) => {
  const n = name.toLowerCase();
  if (/(phone|pixel|galaxy|redmi|oneplus|android)/.test(n)) return Smartphone;
  if (/(ipad|tab)/.test(n)) return Tablet;
  return Laptop;
};

const timeAgo = (iso: string) => {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} h ago`;
  return new Date(iso).toLocaleDateString('en-IN', { dateStyle: 'medium' });
};

const WifiPanel: React.FC<PanelProps> = ({ service, user }) => {
  const username = (user?.studentId || '2023-CS-042').replace(/-/g, '').toLowerCase();
  const devicesAction = useInstantAction(service);
  const passwordAction = useInstantAction(service);
  const [devices, setDevices] = useState<Device[]>(() => readLocal(DEVICES_KEY, DEFAULT_DEVICES));
  const [passwordChangedAt, setPasswordChangedAt] = useState<string | null>(() => readLocal<string | null>(PASSWORD_KEY, null));
  const [name, setName] = useState('');
  const [mac, setMac] = useState('');
  const [touched, setTouched] = useState(false);

  const full = devices.length >= DEVICE_LIMIT;
  const normalised = mac.trim().toUpperCase().replace(/-/g, ':');
  const duplicate = devices.some((d) => d.mac === normalised);
  const macError = touched && mac ? (!MAC_PATTERN.test(mac.trim()) ? 'Use six pairs of letters or digits separated by colons.' : duplicate ? 'This device is already registered.' : null) : null;

  const saveDevices = (next: Device[]) => {
    setDevices(next);
    writeLocal(DEVICES_KEY, next);
  };

  const addDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!name.trim() || !MAC_PATTERN.test(mac.trim()) || duplicate || full) return;
    const ok = await devicesAction.run(`${name.trim()} added`, 'It can join AMU-Secure-WiFi now.', () =>
      saveDevices([...devices, { name: name.trim(), mac: normalised, addedAt: new Date().toISOString() }])
    );
    if (ok) {
      setName('');
      setMac('');
      setTouched(false);
    }
  };

  const removeDevice = (d: Device) =>
    devicesAction.run(`${d.name} removed`, 'The slot is free for another device.', () => saveDevices(devices.filter((x) => x.mac !== d.mac)));

  const changePassword = () =>
    passwordAction.run('Wi-Fi password changed', 'Reconnect your devices with the new password.', () => {
      const now = new Date().toISOString();
      setPasswordChangedAt(now);
      writeLocal(PASSWORD_KEY, now);
    });

  return (
    <div className="space-y-6">
      <Section
        title="Wi-Fi password"
        description={`Network AMU-Secure-WiFi · Username ${username} · Last changed ${passwordChangedAt ? timeAgo(passwordChangedAt) : 'at account setup'}`}
        action={<KeyRound className="w-5 h-5 text-slate-400" />}
      >
        <PasswordChangeForm idPrefix="wifi-pass" busy={passwordAction.busy} submitLabel="Change password" onSubmit={changePassword} />
      </Section>

      <Section title="Registered devices" description={`${devices.length} of ${DEVICE_LIMIT} slots used`}>
        <ul className="divide-y divide-slate-100 dark:divide-slate-800 -my-2">
          {devices.map((d) => {
            const Icon = deviceIcon(d.name);
            return (
              <li key={d.mac} className="py-3 flex items-center gap-3 animate-fade-in">
                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-slate-900 dark:text-white truncate">{d.name}</div>
                  <div className="text-sm font-mono text-slate-500 dark:text-slate-400 truncate">{d.mac}</div>
                </div>
                <span className="hidden sm:block text-xs text-slate-500">Added {timeAgo(d.addedAt)}</span>
                <button
                  type="button"
                  onClick={() => removeDevice(d)}
                  disabled={devicesAction.busy}
                  className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  aria-label={`Remove ${d.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            );
          })}
          {devices.length === 0 && <li className="py-6 text-center text-sm text-slate-500">No devices registered.</li>}
        </ul>
      </Section>

      <Section title="Add a device" description={full ? 'All 3 slots are in use. Remove a device to add another.' : `${DEVICE_LIMIT - devices.length} slot${DEVICE_LIMIT - devices.length === 1 ? '' : 's'} left. Works straight away.`}>
        <form onSubmit={addDevice} noValidate>
          <fieldset disabled={full} className="grid grid-cols-1 sm:grid-cols-2 gap-4 disabled:opacity-50">
            <div>
              <label htmlFor="wifi-name" className="field-label">Device name</label>
              <input
                id="wifi-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. ThinkPad or Galaxy S24"
                aria-invalid={touched && !name.trim()}
                className={`field ${touched && !name.trim() ? 'border-rose-500' : ''}`}
              />
              {touched && !name.trim() && <p className="text-xs text-rose-600 mt-1">Give the device a name.</p>}
            </div>
            <div>
              <label htmlFor="wifi-mac" className="field-label">MAC address</label>
              <input
                id="wifi-mac"
                value={mac}
                onChange={(e) => setMac(e.target.value)}
                onBlur={() => setTouched(true)}
                placeholder="00:1A:2B:3C:4D:5E"
                aria-invalid={!!macError}
                aria-describedby="wifi-mac-hint"
                className={`field font-mono ${macError ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''}`}
              />
              <p id="wifi-mac-hint" className={`text-xs mt-1 ${macError ? 'text-rose-600' : 'text-slate-500'}`}>
                {macError ?? 'Find it under Wi-Fi details in your device settings. Turn off private address.'}
              </p>
            </div>
          </fieldset>
          <div className="flex justify-end pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
            <button type="submit" disabled={devicesAction.busy || full} className="btn-primary w-full sm:w-auto">
              {devicesAction.busy && <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />}
              Add device
            </button>
          </div>
        </form>
      </Section>
    </div>
  );
};

export default WifiPanel;
