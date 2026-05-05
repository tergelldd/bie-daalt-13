import {
  BadRequestException,
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
   * Богино кодыг эх URL руу хөрвүүлж, хандалтын тоог нэмнэ.
   * 
   * @param code - Хэрэглэгчийн ирүүлсэн богино код
   * @throws {NotFoundException} Код олдохгүй үед
   * @throws {GoneException} Хугацаа нь дууссан үед
   * @returns Баталгаажсан эх URL зам
   */
  async getOriginalUrl(code: string): Promise<string> {
    const normalized = normalizeShortCodeParam(code);
    const now = new Date();

    return await (this.prisma as any).$transaction(async (tx: any) => {
      const found = await tx.shortUrl.findUnique({
        where: { code: normalized },
        select: { longUrl: true, expiresAt: true, id: true },
      });

      if (!found) {
        throw new NotFoundException('Short URL not found');
      }

      if (found.expiresAt && found.expiresAt <= now) {
        throw new GoneException('Short URL expired');
      }

      const targetHref = safeRedirectHref(found.longUrl as string);

      await tx.shortUrl.update({
        where: { id: found.id },
        data: { clicks: { increment: 1 } },
      });

      return targetHref;
    });
  }

  /**
   * Шинээр богино холбоос үүсгэнэ.
   * 
   * @param input - Эх URL болон (сонголтоор) дуусах хугацаа
   * @throws {BadRequestException} Буруу URL эсвэл өнгөрсөн цаг сонгосон үед
   */
  async createShortLink(input: {
    longUrl: string;
    expiresAt?: Date;
  }): Promise<{ code: string; longUrl: string }> {

    const parsed = assertValidLongUrlForCreate(input.longUrl ?? '');
    
    if (input.expiresAt && input.expiresAt <= new Date()) {
      throw new BadRequestException('Expiration date cannot be in the past');
    }

    const longUrl = parsed.href;

    for (let attempt = 1; attempt <= MAX_CODE_GENERATION_ATTEMPTS; attempt++) {
      const code = randomCode(SHORT_CODE_LENGTH);

      try {
        return await (this.prisma as any).shortUrl.create({
          data: {
            code,
            longUrl,
            expiresAt: input.expiresAt,
          },
          select: { code: true, longUrl: true },
        });
      } catch (err) {
        if ((err as any)?.code === 'P2002') continue;
        throw err;
      }
    }

    throw new InternalServerErrorException('Failed to generate unique code');
  }

  async getStatsByCode(code: string): Promise<{
    clicks: number;
    originalUrl: string;
    createdAt: Date;
    expiresAt: Date | null;
  }> {
    const normalized = normalizeShortCodeParam(code);

    const row = await (this.prisma as any).shortUrl.findUnique({
      where: { code: normalized },
      select: { clicks: true, longUrl: true, createdAt: true, expiresAt: true },
    });

    if (!row) {
      throw new NotFoundException('Short URL not found');
    }

    return {
      clicks: row.clicks as number,
      originalUrl: row.longUrl as string,
      createdAt: row.createdAt as Date,
      expiresAt: row.expiresAt as Date | null,
    };
  }
}