import { createHash, createHmac, randomBytes, createCipheriv, createDecipheriv, timingSafeEqual } from 'crypto';
import { env } from '../config/env.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

const encryptionKey = deriveKey(env.PII_ENCRYPTION_KEY);
const hmacKey = deriveKey(env.PII_HMAC_KEY);

function deriveKey(secret: string): Buffer {
  // Derive a fixed-length key from the configured secret.
  return createHash('sha256').update(secret).digest();
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizePhone(value: string): string {
  // Keep only digits and a leading plus sign.
  const digits = value.replace(/[^\d+]/g, '');
  return digits.startsWith('+') ? digits : digits;
}

export function hashForSearch(value: string | null | undefined): string | null {
  if (value === null || value === undefined || value === '') return null;
  return createHmac('sha256', hmacKey).update(value).digest('hex');
}

export function encrypt(value: string | null | undefined): string | null {
  if (value === null || value === undefined || value === '') return null;

  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, encryptionKey, iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Store as base64(iv):base64(encrypted):base64(authTag)
  return `${iv.toString('base64')}:${encrypted.toString('base64')}:${authTag.toString('base64')}`;
}

export function decrypt(value: string | null | undefined): string | null {
  if (value === null || value === undefined || value === '') return null;

  const parts = value.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted value format');
  }

  const iv = Buffer.from(parts[0], 'base64');
  const encrypted = Buffer.from(parts[1], 'base64');
  const authTag = Buffer.from(parts[2], 'base64');

  if (iv.length !== IV_LENGTH || authTag.length !== AUTH_TAG_LENGTH) {
    throw new Error('Invalid encrypted value length');
  }

  const decipher = createDecipheriv(ALGORITHM, encryptionKey, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}

export function verifyHash(value: string, hash: string): boolean {
  const computed = hashForSearch(value);
  if (!computed) return false;
  const hashBuf = Buffer.from(hash, 'hex');
  const computedBuf = Buffer.from(computed, 'hex');
  if (hashBuf.length !== computedBuf.length) return false;
  return timingSafeEqual(hashBuf, computedBuf);
}

/**
 * One-way deterministic hash for non-search use cases (e.g. token JTIs).
 */
export function sha256Hex(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export function encryptRequired(value: string): string {
  const encrypted = encrypt(value);
  if (!encrypted) throw new Error('Attempted to encrypt an empty required value');
  return encrypted;
}
