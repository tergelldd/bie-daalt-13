import { Injectable, NotFoundException, GoneException } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { ShortUrl } from '@prisma/client';

/**
 * URL богиносгох үйлчилгээний үндсэн логик анги.
 * @class AppService
 */
@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  /**
   * Урт URL-ыг богиносгож, өгөгдлийн санд хадгална.
   * @param {string} longUrl - Хэрэглэгчийн оруулсан урт холбоос.
   * @param {Date} [expiresAt] - Холбоос хүчингүй болох хугацаа (сонголтоор).
   * @returns {Promise<ShortUrl>} Үүсгэгдсэн богино URL-ын мэдээлэл.
   */
  async createShortUrl(longUrl: string, expiresAt?: Date): Promise<ShortUrl> {
    const code = Math.random().toString(36).substring(2, 9);
    return this.prisma.shortUrl.create({
      data: { longUrl, code, expiresAt },
    });
  }

  /**
   * Богино кодоор үндсэн URL-ыг хайж олох.
   * @param {string} code - Богино код.
   * @throws {NotFoundException} Код олдохгүй бол.
   * @throws {GoneException} Холбоосын хугацаа дууссан бол.
   * @returns {Promise<ShortUrl>} Үндсэн URL-ын мэдээлэл.
   */
  async getOriginalUrl(code: string): Promise<ShortUrl> {
    const urlEntry = await this.prisma.shortUrl.findUnique({ where: { code } });

    if (!urlEntry) throw new NotFoundException('URL олдсонгүй');
    
    if (urlEntry.expiresAt && new Date() > urlEntry.expiresAt) {
      throw new GoneException('Энэ холбоосын хугацаа дууссан байна');
    }

    await this.prisma.shortUrl.update({
      where: { code },
      data: { clicks: { increment: 1 } },
    });

    return urlEntry;
  }
}