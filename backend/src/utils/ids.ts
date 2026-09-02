import { randomBytes, randomInt } from 'crypto';

export function genId(prefix = ''): string {
  return (prefix ? prefix + '_' : '') + randomBytes(8).toString('hex');
}

export function genBookingReference(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 6; i++) out += chars[randomInt(chars.length)];
  return out;
}

export function genSecureIdentifier(): string {
  return 'CYC_' + randomBytes(16).toString('hex');
}

export function genVoucherCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 12; i++) out += chars[randomInt(chars.length)];
  return 'CYC-' + out.match(/.{1,4}/g)!.join('-');
}
