import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

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

  async createShortLink(input: {
    longUrl: string;
    expiresAt?: Date;
  }): Promise<{ code: string; longUrl: string }> {
    const longUrl = input.longUrl?.trim();
    if (!longUrl) {
      throw new BadRequestException('longUrl is required');
    }

    try {
      // eslint-disable-next-line no-new
      new URL(longUrl);
    } catch {
      throw new BadRequestException('longUrl must be a valid URL');
    }

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
}

