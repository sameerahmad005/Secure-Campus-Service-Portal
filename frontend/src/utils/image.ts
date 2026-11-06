export interface FitOptions {
  maxWidth: number;
  maxHeight: number;
  maxBytes: number;
  /** Crop to this width/height ratio (centre crop) before fitting. Omit to keep the whole image. */
  cropAspect?: number;
}

export interface FitResult {
  dataUrl: string;
  bytes: number;
  width: number;
  height: number;
  originalBytes: number;
}

const loadImage = (file: File) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('unreadable'));
    };
    img.src = url;
  });

const dataUrlBytes = (d: string) => Math.round(((d.length - d.indexOf(',') - 1) * 3) / 4);

/**
 * Crops (optionally), scales down to fit the box, flattens onto white and
 * re-encodes as JPEG, lowering quality and then size until it is under maxBytes.
 */
export async function fitImage(file: File, opts: FitOptions): Promise<FitResult> {
  const img = await loadImage(file);

  let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
  if (opts.cropAspect) {
    const current = sw / sh;
    if (current > opts.cropAspect) {
      const w = sh * opts.cropAspect;
      sx = (sw - w) / 2;
      sw = w;
    } else {
      const h = sw / opts.cropAspect;
      sy = (sh - h) / 2;
      sh = h;
    }
  }

  let scale = Math.min(1, opts.maxWidth / sw, opts.maxHeight / sh);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  for (let attempt = 0; attempt < 8; attempt++) {
    canvas.width = Math.max(1, Math.round(sw * scale));
    canvas.height = Math.max(1, Math.round(sh * scale));
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

    for (const q of [0.92, 0.85, 0.75, 0.65, 0.55]) {
      const dataUrl = canvas.toDataURL('image/jpeg', q);
      const bytes = dataUrlBytes(dataUrl);
      if (bytes <= opts.maxBytes) {
        return { dataUrl, bytes, width: canvas.width, height: canvas.height, originalBytes: file.size };
      }
    }
    scale *= 0.8;
  }
  const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
  return { dataUrl, bytes: dataUrlBytes(dataUrl), width: canvas.width, height: canvas.height, originalBytes: file.size };
}

export const formatBytes = (n: number) =>
  n < 1024 ? `${n} B` : n < 1024 * 1024 ? `${Math.round(n / 1024)} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`;
