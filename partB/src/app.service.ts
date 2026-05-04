import {
  GoneException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import {
  assertValidLongUrlForCreate,
  normalizeShortCodeParam,
  safeRedirectHref,
} from './url-validation';

const SHORT_CODE_LENGTH = 7;
const SHORT_CODE_ALPHABET =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const MAX_CODE_GENERATION_ATTEMPTS = 10;

function randomCode(length: number): string {
  let out = '';
  for (let i = 0; i < length; i += 1) {
    const idx = Math.floor(Math.random() * SHORT_CODE_ALPHABET.length);
    out += SHORT_CODE_ALPHABET[idx];
  }
  return out;
}

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  /**
   * Resolve a short code to its original URL.
   *
   * Rules:
   * - If code is missing/invalid format → 400
   * - If code not found → 404
   * - If expired (`expiresAt <= now`) → 410
   * - On success, increments `clicks` atomically and returns `longUrl`
   */
  async getOriginalUrl(code: string): Promise<string> {
    const normalized = normalizeShortCodeParam(code);

    const now = new Date();

    return await (this.prisma as any).$transaction(async (tx: any) => {
      const found = await tx.shortUrl.findUnique({
        where: { code: normalized },
        select: { longUrl: true, expiresAt: true },
      });

      if (!found) {
        throw new NotFoundException('Short URL not found');
      }

      if (found.expiresAt && found.expiresAt <= now) {
        throw new GoneException('Short URL expired');
      }

      const targetHref = safeRedirectHref(found.longUrl as string);

      await tx.shortUrl.update({
        where: { code: normalized },
        data: { clicks: { increment: 1 } },
        select: { code: true },
      });

      return targetHref;
    });
  }

  async createShortLink(input: {
    longUrl: string;
    expiresAt?: Date;
  }): Promise<{ code: string; longUrl: string }> {
    const parsed = assertValidLongUrlForCreate(input.longUrl ?? '');
    const longUrl = parsed.href;

    for (let attempt = 1; attempt <= MAX_CODE_GENERATION_ATTEMPTS; attempt++) {
      const code = randomCode(SHORT_CODE_LENGTH);

      try {
        const created = await (this.prisma as any).shortUrl.create({
          data: {
            code,
            longUrl,
            expiresAt: input.expiresAt,
          },
          select: { code: true, longUrl: true },
        });

        return created;
      } catch (err) {
        if ((err as any)?.code === 'P2002') {
          continue;
        }
        throw err;
      }
    }

    throw new Error(
      `Failed to generate unique short code after ${MAX_CODE_GENERATION_ATTEMPTS} attempts`,
    );
  }

  /**
   * Public stats for a short code (does not increment clicks).
   */
  async getStatsByCode(code: string): Promise<{
    clicks: number;
    originalUrl: string;
    createdAt: Date;
  }> {
    const normalized = normalizeShortCodeParam(code);

    const row = await (this.prisma as any).shortUrl.findUnique({
      where: { code: normalized },
      select: { clicks: true, longUrl: true, createdAt: true },
    });

    if (!row) {
      throw new NotFoundException('Short URL not found');
    }

    try {
      return {
        clicks: row.clicks as number,
        originalUrl: assertValidLongUrlForCreate(row.longUrl as string).href,
        createdAt: row.createdAt as Date,
      };
    } catch {
      throw new InternalServerErrorException('Stored URL failed validation');
    }
  }
}

