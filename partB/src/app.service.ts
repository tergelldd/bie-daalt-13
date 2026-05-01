import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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

  async createShortLink(input: {
    longUrl: string;
    expiresAt?: Date;
  }): Promise<{ code: string; longUrl: string }> {
    for (let attempt = 1; attempt <= MAX_CODE_GENERATION_ATTEMPTS; attempt++) {
      const code = randomCode(SHORT_CODE_LENGTH);

      try {
        const created = await this.prisma.shortUrl.create({
          data: {
            code,
            longUrl: input.longUrl,
            expiresAt: input.expiresAt,
          },
          select: { code: true, longUrl: true },
        });

        return created;
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === 'P2002'
        ) {
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

