import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';

// Renders the CYCLONE logo data URI. We read the trans-logo from the repo frontend assets.
// The logo is blue on transparent background.
let logoCache: string | null = null;

export function maskLogoPath(): string | null {
  const candidates = [
    path.resolve(__dirname, '..', '..', '..', 'frontend', 'public', 'trans-logo.jpeg'),
    path.resolve(__dirname, '..', '..', '..', 'frontend', 'public', 'trans-logo.png'),
    path.resolve(__dirname, '..', '..', '..', 'frontend', 'src', 'assets', 'trans-logo.jpeg'),
    path.resolve(__dirname, '..', '..', '..', 'frontend', 'src', 'assets', 'trans-logo.png'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

export function buildMask(): Buffer | undefined {
  const p = maskLogoPath();
  if (!p) return undefined;
  const ext = path.extname(p).toLowerCase();
  const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
  const b64 = fs.readFileSync(p).toString('base64');
  const dataUrl = `data:${mime};base64,${b64}`;
  // Convert data URL to a Buffer that qrcode can slice (gif/jpeg/png typically need full buffer)
  return Buffer.from(dataUrl.replace(/^data:[^;]+;base64,/, ''), 'base64');
}

export function getLogoDataUrl(): string | null {
  if (logoCache) return logoCache;
  const p = maskLogoPath();
  if (!p) return null;
  const ext = path.extname(p).toLowerCase();
  const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
  const b64 = fs.readFileSync(p).toString('base64');
  logoCache = `data:${mime};base64,${b64}`;
  return logoCache;
}

export async function generateQrDataUrl(identifier: string): Promise<string> {
  return QRCode.toDataURL(identifier, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 640,
    color: { dark: '#0B2545', light: '#FFFFFF' },
  });
}