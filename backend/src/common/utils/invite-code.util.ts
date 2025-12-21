import * as crypto from 'crypto';

const BASE62_ALPHABET =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

/**
 * Encode số nguyên thành chuỗi base62
 * @param num - Số cần encode
 * @returns Chuỗi base62
 */
function base62Encode(num: number): string {
  if (num === 0) return '0';
  let result = '';
  let n = num;
  while (n > 0) {
    const rem = n % 62;
    result = BASE62_ALPHABET[rem] + result;
    n = Math.floor(n / 62);
  }
  return result;
}

/**
 * Decode chuỗi base62 thành số nguyên
 * @param str - Chuỗi base62 cần decode
 * @returns Số nguyên
 * @throws Error nếu chuỗi chứa ký tự không hợp lệ
 */
function base62Decode(str: string): number {
  let result = 0;
  for (const ch of str) {
    const idx = BASE62_ALPHABET.indexOf(ch);
    if (idx === -1) {
      throw new Error('Invalid base62 character');
    }
    result = result * 62 + idx;
  }
  return result;
}

/**
 * Lấy secret key từ environment variable để tạo/verify invite code
 * @returns Secret key
 * @throws Error nếu INVITE_CODE_SECRET không được set
 */
function getInviteSecret(): string {
  const secret = process.env.INVITE_CODE_SECRET;
  if (!secret) {
    throw new Error('INVITE_CODE_SECRET is not set');
  }
  return secret;
}

/**
 * Tạo mã mời cho event, có hạn sử dụng (expiryMs)
 */
export function generateInviteCode(
  eventId: number,
  expiryMs: number,
): string {
  const now = Date.now();
  const expiresAt = now + expiryMs;

  const eventPart = base62Encode(eventId);
  const expPart = base62Encode(expiresAt);

  const payload = `${eventPart}.${expPart}`;

  const hmac = crypto
    .createHmac('sha256', getInviteSecret())
    .update(payload)
    .digest();

  const checksumNum = hmac.readUIntBE(0, 6);
  const checksum = base62Encode(checksumNum);

  return `${payload}.${checksum}`;
}

/**
 * Giải mã & validate mã mời
 * - Trả về eventId nếu hợp lệ & chưa hết hạn
 * - Ném Error nếu mã sai / hết hạn
 */
export function decodeInviteCodeOrThrow(code: string): number {
  const parts = code.split('.');
  if (parts.length !== 3) {
    throw new Error('Mã mời không hợp lệ');
  }

  const [eventPart, expPart, checksum] = parts;
  const payload = `${eventPart}.${expPart}`;

  const hmac = crypto
    .createHmac('sha256', getInviteSecret())
    .update(payload)
    .digest();

  const checksumNum = hmac.readUIntBE(0, 6);
  const expectedChecksum = base62Encode(checksumNum);

  if (checksum !== expectedChecksum) {
    throw new Error('Mã mời không hợp lệ');
  }

  const eventId = base62Decode(eventPart);
  const expiresAt = base62Decode(expPart);

  if (Date.now() > expiresAt) {
    throw new Error('Mã mời đã hết hạn');
  }

  return eventId;
}


