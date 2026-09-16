import crypto from 'crypto';

// Secret key for AES-256-GCM encryption of integration refresh tokens
const MASTER_SECRET = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET || 'nexus_vault_master_key_default_32bytes_sec!';

// Derive a 32-byte key for AES-256
function getDerivedKey(): Buffer {
  return crypto.createHash('sha256').update(MASTER_SECRET).digest();
}

/**
 * Encrypt a string using AES-256-GCM
 * Returns string in format: iv:authTag:encryptedData (hex encoded)
 */
export function encryptToken(plainText: string): string {
  if (!plainText) return '';
  const key = getDerivedKey();
  const iv = crypto.randomBytes(12); // 12 bytes recommended for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypt a string encrypted with AES-256-GCM
 */
export function decryptToken(cipherText: string): string {
  if (!cipherText) return '';
  try {
    const parts = cipherText.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted token format');
    }
    const [ivHex, authTagHex, encryptedHex] = parts;
    const key = getDerivedKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err: any) {
    console.error('Failed to decrypt token:', err.message);
    throw new Error('Decryption failed for secure credentials');
  }
}

/**
 * Hash password with salt using PBKDF2
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify password against stored hash
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, originalHash] = storedHash.split(':');
    if (!salt || !originalHash) return false;
    const hashToVerify = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hashToVerify, 'hex'), Buffer.from(originalHash, 'hex'));
  } catch {
    return false;
  }
}
