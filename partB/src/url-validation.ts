import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

/** Matches `ShortUrl.code` in Prisma (`VarChar(32)`). */
export const SHORT_CODE_PARAM_MAX_LENGTH = 32;

const CONTROL_OR_WHITESPACE = /[\u0000-\u001f\u007f]/;

/** Lookup params: same charset as generated codes; blocks `/`, `..`, encoded junk. */
const SHORT_CODE_PARAM_PATTERN = /^[a-zA-Z0-9]+$/;

/**
 * Validates client-supplied short code before DB lookup.
 */
export function normalizeShortCodeParam(code: string | undefined): string {
  const s = code?.trim() ?? '';
  if (
    !s ||
    s.length > SHORT_CODE_PARAM_MAX_LENGTH ||
    !SHORT_CODE_PARAM_PATTERN.test(s)
  ) {
    throw new BadRequestException('Invalid short code');
  }
  return s;
}

/**
 * URL allowed when creating a short link: `http` / `https` only, no control chars.
 */
export function assertValidLongUrlForCreate(raw: string): URL {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new BadRequestException('longUrl is required');
  }
  if (CONTROL_OR_WHITESPACE.test(trimmed)) {
    throw new BadRequestException('longUrl must not contain control characters');
  }

  let u: URL;
  try {
    u = new URL(trimmed);
  } catch {
    throw new BadRequestException('longUrl must be a valid URL');
  }

  if (u.protocol !== 'http:' && u.protocol !== 'https:') {
    throw new BadRequestException('longUrl must use http or https');
  }

  if (!u.hostname) {
    throw new BadRequestException('longUrl must include a host');
  }

  return u;
}

/**
 * Stored long URL before redirect: defense-in-depth if DB row is unexpected.
 * Fails closed (does not redirect to dangerous schemes).
 */
export function safeRedirectHref(longUrl: string): string {
  try {
    const u = assertValidLongUrlForCreate(longUrl);
    return u.href;
  } catch {
    throw new InternalServerErrorException('Stored URL failed validation');
  }
}
