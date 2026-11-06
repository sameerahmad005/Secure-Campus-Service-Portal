import { useEffect, useState } from 'react';
import { readLocal, writeLocal } from '../utils/localStore';

export type MediaKind = 'photo' | 'signature';

export interface StoredMedia {
  dataUrl: string;
  bytes: number;
  width: number;
  height: number;
  updatedAt: string;
}

const KEY: Record<MediaKind, string> = {
  photo: 'amu-student-photo',
  signature: 'amu-student-signature',
};

const EVENT = 'amu-media';

export const getMedia = (kind: MediaKind): StoredMedia | null => readLocal<StoredMedia | null>(KEY[kind], null);

export const saveMedia = (kind: MediaKind, media: StoredMedia) => {
  writeLocal(KEY[kind], media);
  window.dispatchEvent(new CustomEvent(EVENT));
};

/** Live view of the student's uploaded photo and signature. */
export function useStudentMedia() {
  const [state, setState] = useState(() => ({ photo: getMedia('photo'), signature: getMedia('signature') }));
  useEffect(() => {
    const refresh = () => setState({ photo: getMedia('photo'), signature: getMedia('signature') });
    window.addEventListener(EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);
  return state;
}
