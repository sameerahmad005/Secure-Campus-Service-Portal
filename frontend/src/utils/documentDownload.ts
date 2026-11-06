/**
 * Builds official-looking PDF documents in the browser.
 * jsPDF and the QR encoder are loaded only when someone downloads, so they
 * add nothing to the initial page load.
 */
import type { StudentBioData } from '../data/studentProfile';
import { formatDate } from '../data/studentProfile';

export interface DocumentRow {
  label: string;
  value: string;
}

export interface DocumentSpec {
  title: string;
  reference: string;
  issuedBy: string;
  holderName?: string;
  rows: DocumentRow[];
  table?: { headers: string[]; rows: string[][] };
  note?: string;
  /** Adds a photo box beside the details and a signature block at the end. null draws an empty box. */
  media?: { photo: string | null; signature: string | null; signatory: string };
  /** When set, renders a two-sided ID card instead of an A4 letter. */
  idCard?: { bio: StudentBioData; photoUrl?: string };
}

type RGB = [number, number, number];
const NAVY: RGB = [7, 41, 74];
const GREEN: RGB = [14, 98, 81];
const GOLD: RGB = [183, 149, 11];
const INK: RGB = [15, 23, 42];
const MUTED: RGB = [100, 116, 139];
const LINE: RGB = [226, 232, 240];

/** Standard PDF fonts only cover Latin-1; swap the few characters we use that fall outside it. */
const pdfText = (s: string) =>
  s
    .replace(/₹\s?/g, 'Rs. ')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/–|—/g, '-')
    .replace(/…/g, '...');

const slugify = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const verifyUrl = (ref: string) => `https://amu.ac.in/verify?ref=${encodeURIComponent(ref)}`;

async function loadLibs() {
  const [{ jsPDF }, QR] = await Promise.all([import('jspdf'), import('qrcode')]);
  return { jsPDF, QR: QR.default ?? QR };
}

/** Loads a remote or local image into a JPEG data URL; resolves null if it cannot be read (CORS, offline). */
export function imageToDataUrl(src: string, maxSize = 600): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function buildLetterPdf(spec: DocumentSpec) {
  const { jsPDF, QR } = await loadLibs();
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  const W = 210;
  const M = 18;
  const issued = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  // Header band
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, W, 34, 'F');
  doc.setFillColor(...GOLD);
  doc.rect(0, 34, W, 1.2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('ALIGARH MUSLIM UNIVERSITY', M, 13, { charSpace: 0.6 });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(191, 219, 254);
  doc.text(pdfText(spec.issuedBy), M, 18.5);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.text(pdfText(spec.title), M, 28);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(191, 219, 254);
  doc.text(`Ref ${pdfText(spec.reference)}`, W - M, 13, { align: 'right' });
  doc.text(`Issued ${pdfText(issued)}`, W - M, 18.5, { align: 'right' });

  let y = 48;

  // Passport photo box, top right
  const photoW = 30, photoH = 40, photoX = W - M - photoW, photoY = 44;
  const photoBottom = spec.media ? photoY + photoH + 3 : 0;
  if (spec.media) {
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.3);
    doc.rect(photoX, photoY, photoW, photoH);
    if (spec.media.photo) {
      doc.addImage(spec.media.photo, 'JPEG', photoX + 0.5, photoY + 0.5, photoW - 1, photoH - 1);
    } else {
      doc.setFontSize(8);
      doc.setTextColor(...MUTED);
      doc.text('Affix photo', photoX + photoW / 2, photoY + photoH / 2, { align: 'center' });
    }
  }
  const rightEdge = (atY: number) => (atY < photoBottom ? photoX - 4 : W - M);

  if (spec.holderName) {
    doc.setTextColor(...MUTED);
    doc.setFontSize(8.5);
    doc.text('ISSUED TO', M, y);
    doc.setTextColor(...INK);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(pdfText(spec.holderName), M, y + 6);
    doc.setFont('helvetica', 'normal');
    y += 16;
  }

  // Key-value rows
  const labelW = 58;
  doc.setFontSize(10);
  for (const row of spec.rows) {
    const lines = doc.splitTextToSize(pdfText(row.value || ' '), rightEdge(y) - M - labelW - 2) as string[];
    const h = Math.max(9, lines.length * 5 + 4);
    doc.setDrawColor(...LINE);
    doc.line(M, y + h, rightEdge(y), y + h);
    doc.setTextColor(...MUTED);
    doc.text(pdfText(row.label), M, y + 6);
    doc.setTextColor(...INK);
    doc.text(row.value ? lines : '______________________________', M + labelW, y + 6);
    y += h;
  }

  // Grid table
  if (spec.table) {
    y = Math.max(y, photoBottom) + 10;
    const cols = spec.table.headers.length;
    const colW = (W - 2 * M) / cols;
    doc.setFillColor(241, 245, 249);
    doc.rect(M, y, W - 2 * M, 9, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...INK);
    spec.table.headers.forEach((h, i) => doc.text(pdfText(h), M + i * colW + 3, y + 6));
    doc.setFont('helvetica', 'normal');
    y += 9;
    for (const r of spec.table.rows) {
      const cells = r.map((c) => doc.splitTextToSize(pdfText(c), colW - 5) as string[]);
      const h = Math.max(...cells.map((l) => l.length)) * 4.4 + 4.8;
      cells.forEach((lines, i) => doc.text(lines, M + i * colW + 3, y + 6));
      doc.setDrawColor(...LINE);
      doc.line(M, y + h, W - M, y + h);
      y += h;
    }
  }

  if (spec.note) {
    y += 10;
    doc.setFontSize(9.5);
    const lines = doc.splitTextToSize(pdfText(spec.note), W - 2 * M - 10) as string[];
    const h = lines.length * 5 + 8;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(...LINE);
    doc.roundedRect(M, y, W - 2 * M, h, 2, 2, 'FD');
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(9.5);
    doc.text(lines, M + 5, y + 7);
    y += h;
  }

  // Signature block: student on the left, issuing officer on the right
  if (spec.media) {
    const sy = Math.max(y + 14, photoBottom + 10);
    const sw = 50, sh = 16;
    if (spec.media.signature) {
      doc.addImage(spec.media.signature, 'JPEG', M, sy, sw, sh);
    }
    doc.setDrawColor(...MUTED);
    doc.setLineWidth(0.2);
    doc.line(M, sy + sh + 1, M + sw, sy + sh + 1);
    doc.line(W - M - 60 - 28, sy + sh + 1, W - M - 28, sy + sh + 1);
    doc.setFontSize(8.5);
    doc.setTextColor(...MUTED);
    doc.text(spec.media.signature ? "Student's signature" : "Student's signature (not uploaded)", M, sy + sh + 6);
    doc.text(pdfText(spec.media.signatory), W - M - 88, sy + sh + 6);
  }

  // Verification QR + footer
  const qr = await QR.toDataURL(verifyUrl(spec.reference), { margin: 0, width: 240 });
  doc.addImage(qr, 'PNG', W - M - 24, 297 - 46, 24, 24);
  doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  doc.text('Scan to verify', W - M - 12, 297 - 19, { align: 'center' });
  doc.setDrawColor(...LINE);
  doc.line(M, 297 - 14, W - M, 297 - 14);
  doc.text(
    pdfText(`Generated from AMU Campus Services. Verify at the issuing office with reference ${spec.reference}.`),
    M,
    297 - 9
  );
  return doc;
}

/** CR80 card (85.6 x 54 mm): page 1 front, page 2 back. Prints at true card size. */
async function buildIdCardPdf(spec: DocumentSpec) {
  const { jsPDF, QR } = await loadLibs();
  const { bio, photoUrl } = spec.idCard!;
  const W = 85.6;
  const H = 54;
  const doc = new jsPDF({ unit: 'mm', format: [W, H], orientation: 'landscape', compress: true });
  const photo = photoUrl ? await imageToDataUrl(photoUrl) : null;
  const qr = await QR.toDataURL(verifyUrl(spec.reference), { margin: 0, width: 300 });

  // ---------- FRONT ----------
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, W, H, 'F');
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, W, 12, 'F');
  doc.setFillColor(...GOLD);
  doc.rect(0, 12, W, 0.7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.text('ALIGARH MUSLIM UNIVERSITY', 4, 5.6, { charSpace: 0.25 });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.2);
  doc.setTextColor(209, 250, 229);
  doc.text('STUDENT IDENTITY CARD', 4, 9.4, { charSpace: 0.3 });
  doc.setFontSize(5.2);
  doc.text(pdfText(`Session ${bio.session}`), W - 4, 9.4, { align: 'right' });

  // Photo
  const px = 4, py = 15.5, pw = 19, ph = 23.5;
  doc.setDrawColor(...LINE);
  doc.setFillColor(226, 232, 240);
  doc.roundedRect(px, py, pw, ph, 1.2, 1.2, 'FD');
  if (photo) {
    doc.addImage(photo, 'JPEG', px + 0.4, py + 0.4, pw - 0.8, ph - 0.8);
  } else {
    doc.setTextColor(...MUTED);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(bio.fullName.charAt(0), px + pw / 2, py + ph / 2 + 2, { align: 'center' });
  }

  // Details
  const dx = 26.5;
  doc.setTextColor(...INK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(pdfText(bio.fullName), dx, 19);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.8);
  doc.setTextColor(71, 85, 105);
  doc.text(pdfText(bio.course), dx, 22.6);

  const field = (label: string, value: string, x: number, y: number) => {
    doc.setFontSize(4.6);
    doc.setTextColor(...MUTED);
    doc.text(label.toUpperCase(), x, y);
    doc.setFontSize(6.2);
    doc.setTextColor(...INK);
    doc.setFont('helvetica', 'bold');
    doc.text(pdfText(value), x, y + 2.8);
    doc.setFont('helvetica', 'normal');
  };
  field('Enrolment no.', bio.enrolmentNo, dx, 27);
  field('Faculty no.', bio.facultyNo, dx + 29, 27);
  field('Hall', bio.hall.replace('Sir Syed Hall', 'SS Hall'), dx, 33.5);
  field('Blood group', bio.bloodGroup, dx + 29, 33.5);

  // Signature
  doc.setDrawColor(...MUTED);
  doc.setLineWidth(0.15);
  doc.line(W - 26, 44, W - 4, 44);
  doc.setFontSize(4.6);
  doc.setTextColor(...MUTED);
  doc.text('Proctor', W - 15, 46.2, { align: 'center' });
  // Pen-style signature stroke above the line
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.3);
  doc.lines(
    [
      [1.2, -2.2, 2.4, -2.6, 3, -0.4],
      [0.5, 1.6, 1.4, 1.2, 2.2, -1.2],
      [0.6, -1.6, 1.6, -1.4, 2.4, 0.2],
      [0.8, 1.4, 2.2, 0.4, 3.6, -1],
      [1.2, -1, 2.6, -0.8, 4, 0.2],
    ],
    W - 23.5,
    42.6
  );
  doc.setLineWidth(0.2);

  // Footer band
  doc.setFillColor(...GREEN);
  doc.rect(0, H - 5, W, 5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(5);
  doc.text(pdfText(`Valid through ${bio.validThrough}`), 4, H - 1.8);
  doc.text('amu.ac.in', W - 4, H - 1.8, { align: 'right' });

  // ---------- BACK ----------
  doc.addPage([W, H], 'landscape');
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, W, H, 'F');
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, W, 2.5, 'F');

  const backRow = (label: string, value: string, y: number) => {
    doc.setFontSize(4.6);
    doc.setTextColor(...MUTED);
    doc.text(label.toUpperCase(), 4, y);
    doc.setFontSize(6);
    doc.setTextColor(...INK);
    const lines = doc.splitTextToSize(pdfText(value), 52) as string[];
    doc.text(lines, 4, y + 2.7);
    return y + 2.7 + lines.length * 2.6 + 1.6;
  };
  let y = 7;
  y = backRow("Father's name", bio.fatherName, y);
  y = backRow('Date of birth', formatDate(bio.dateOfBirth), y);
  y = backRow('Mobile', bio.mobile, y);
  y = backRow('Address', bio.address, y);

  doc.addImage(qr, 'PNG', W - 23, 6, 19, 19);
  doc.setFontSize(4.4);
  doc.setTextColor(...MUTED);
  doc.text('Scan to verify', W - 13.5, 27.6, { align: 'center' });

  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.2);
  doc.line(4, 37, W - 4, 37);
  doc.setFontSize(4.6);
  doc.setTextColor(71, 85, 105);
  doc.text(
    doc.splitTextToSize(
      'This card is the property of Aligarh Muslim University. Carry it on campus and show it on request. If found, please return to the Proctor Office, AMU, Aligarh 202002.',
      W - 8
    ) as string[],
    4,
    40
  );
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...INK);
  doc.setFontSize(5);
  doc.text('Proctor control room: +91 571 2700010', 4, H - 3);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...MUTED);
  doc.text(pdfText(spec.reference), W - 4, H - 3, { align: 'right' });

  return doc;
}

/** Builds the PDF without saving it. */
export const buildDocumentPdf = (spec: DocumentSpec) => (spec.idCard ? buildIdCardPdf(spec) : buildLetterPdf(spec));

/** Builds and downloads the PDF. Returns the file name. */
export async function downloadDocument(spec: DocumentSpec): Promise<string> {
  const doc = await buildDocumentPdf(spec);
  const fileName = `${slugify(spec.title)}-${slugify(spec.reference)}.pdf`;
  doc.save(fileName);
  return fileName;
}
