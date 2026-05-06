// partB/src/app.service.spec.ts
import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException, GoneException } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

describe('AppService', () => {
  let service: AppService;
  let prismaMock: any;

  const createPrismaMock = () => {
    const tx = {
      shortUrl: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };
    return {
      $transaction: jest.fn(async (fn: any) => await fn(tx)),
      shortUrl: tx.shortUrl,
      __tx: tx,
    };
  };

  beforeEach(async () => {
    prismaMock = createPrismaMock();
    const moduleRef = await Test.createTestingModule({
      providers: [
        AppService,
        { provide: PrismaService, useValue: prismaMock as unknown as PrismaService },
      ],
    }).compile();
    service = moduleRef.get(AppService);
  });

  // --- createShortLink ---
  describe('createShortLink', () => {
    it('1. Success: valid URL өгвөл хадгална', async () => {
      prismaMock.shortUrl.create.mockResolvedValue({ code: 'AbC123x', longUrl: 'https://test.com' });
      const res = await service.createShortLink({ longUrl: 'https://test.com' });
      expect(res.code).toBeDefined();
    });

    it('2. Validation: хоосон URL дээр BadRequestException шиднэ', async () => {
      await expect(service.createShortLink({ longUrl: '' })).rejects.toThrow(BadRequestException);
    });

    it('3. Feature: expiresAt утгыг зөв дамжуулна', async () => {
      const date = new Date();
      prismaMock.shortUrl.create.mockImplementation(({ data }) => Promise.resolve(data));
      const res = await service.createShortLink({ longUrl: 'https://test.com', expiresAt: date });
      expect(res.expiresAt).toEqual(date);
    });

    it('4. Validation: http/https биш protocol татгалзана', async () => {
      await expect(
        service.createShortLink({ longUrl: 'ftp://evil.com' })
      ).rejects.toThrow(BadRequestException);
    });

    it('5. Feature: үүсгэсэн код 7 тэмдэгт байх ёстой', async () => {
      prismaMock.shortUrl.create.mockImplementation(({ data }) => Promise.resolve(data));
      const res = await service.createShortLink({ longUrl: 'https://test.com' });
      expect(res.code.length).toBe(7);
    });
  });

  // --- getOriginalUrl ---
  describe('getOriginalUrl', () => {
    it('6. Success: redirect URL string буцаана', async () => {
      prismaMock.$transaction.mockImplementation(async (fn: any) =>
        fn({
          shortUrl: {
            findUnique: jest.fn().mockResolvedValue({ longUrl: 'https://test.com', expiresAt: null }),
            update: jest.fn(),
          },
        })
      );
      const url = await service.getOriginalUrl('abc1234');
      expect(url).toBe('https://test.com/');
    });

    it('7. Not Found: байхгүй код → NotFoundException', async () => {
      prismaMock.$transaction.mockImplementation(async (fn: any) =>
        fn({ shortUrl: { findUnique: jest.fn().mockResolvedValue(null), update: jest.fn() } })
      );
      await expect(service.getOriginalUrl('none123')).rejects.toThrow(NotFoundException);
    });

    it('8. Analytics: clicks тоог нэмэгдүүлнэ', async () => {
      const updateMock = jest.fn();
      prismaMock.$transaction.mockImplementation(async (fn: any) =>
        fn({
          shortUrl: {
            findUnique: jest.fn().mockResolvedValue({ longUrl: 'https://test.com', expiresAt: null }),
            update: updateMock,
          },
        })
      );
      await service.getOriginalUrl('abc1234');
      expect(updateMock).toHaveBeenCalled();
    });

    it('9. Expiration: хугацаа дууссан → GoneException', async () => {
      const past = new Date('2020-01-01');
      prismaMock.$transaction.mockImplementation(async (fn: any) =>
        fn({ shortUrl: { findUnique: jest.fn().mockResolvedValue({ longUrl: 'https://t.com', expiresAt: past }), update: jest.fn() } })
      );
      await expect(service.getOriginalUrl('old1234')).rejects.toThrow(GoneException);
    });

    it('10. Expiration: хугацаа дуусаагүй → ажиллана', async () => {
      const future = new Date('2030-01-01');
      prismaMock.$transaction.mockImplementation(async (fn: any) =>
        fn({
          shortUrl: {
            findUnique: jest.fn().mockResolvedValue({ longUrl: 'https://test.com', expiresAt: future }),
            update: jest.fn(),
          },
        })
      );
      const res = await service.getOriginalUrl('fut1234');
      expect(res).toBeDefined();
    });

    it('11. Security: тусгай тэмдэгттэй код → BadRequestException', async () => {
      await expect(service.getOriginalUrl('x/y')).rejects.toThrow(BadRequestException);
    });
  });

  // --- getStatsByCode ---
  describe('getStatsByCode', () => {
    it('12. Success: байгаа код → ShortUrl объект буцаана', async () => {
      prismaMock.shortUrl.findUnique.mockResolvedValue({ code: 'abc1234', clicks: 5 });
      const res = await service.getStatsByCode('abc1234');
      expect(res.clicks).toBe(5);
    });

    it('13. Not Found: байхгүй код → NotFoundException', async () => {
      prismaMock.shortUrl.findUnique.mockResolvedValue(null);
      await expect(service.getStatsByCode('none123')).rejects.toThrow(NotFoundException);
    });
  });
});