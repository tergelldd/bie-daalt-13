import {
  Injectable,
  NotFoundException,
  GoneException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { ShortUrl } from '@prisma/client';
import {
  assertValidLongUrlForCreate,
  normalizeShortCodeParam,
  safeRedirectHref,
} from './url-validation';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  getHello(): string {
    return 'URL Shortener API is running.';
  }

  /**
   * Урт URL-ыг богиносгож, өгөгдлийн санд хадгална.
   * @param longUrl - Хэрэглэгчийн оруулсан урт холбоос
   * @param expiresAt - Холбоос хүчингүй болох хугацаа (сонголтоор)
   */
  async createShortLink(params: {
    longUrl: string;
    expiresAt?: Date;
  }): Promise<ShortUrl> {
    assertValidLongUrlForCreate(params.longUrl);

    const code = Math.random().toString(36).substring(2, 9);
    return this.prisma.shortUrl.create({
      data: {
        longUrl: params.longUrl,
        code,
        expiresAt: params.expiresAt,
      },
    });
  }

  /**
   * Богино кодоор үндсэн URL-ыг олж, click тоог нэмэгдүүлнэ.
   * Transaction ашиглан race condition-оос хамгаална.
   */
  async getOriginalUrl(rawCode: string): Promise<string> {
    // url-validation.ts ашиглан code-г шалгана
    const code = normalizeShortCodeParam(rawCode);

    return this.prisma.$transaction(async (tx) => {
      const urlEntry = await tx.shortUrl.findUnique({ where: { code } });

      if (!urlEntry) throw new NotFoundException('URL олдсонгүй');

      if (urlEntry.expiresAt && new Date() > urlEntry.expiresAt) {
        throw new GoneException('Энэ холбоосын хугацаа дууссан байна');
      }

      await tx.shortUrl.update({
        where: { code },
        data: { clicks: { increment: 1 } },
      });

      return safeRedirectHref(urlEntry.longUrl);
    });
  }
  
  async getStatsByCode(rawCode: string): Promise<ShortUrl> {
    const code = normalizeShortCodeParam(rawCode);

    const urlEntry = await this.prisma.shortUrl.findUnique({ where: { code } });
    if (!urlEntry) throw new NotFoundException('URL олдсонгүй');

    return urlEntry;
  }
}