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

  describe('createShortUrl', () => {
    it('1. Success: valid URL өгвөл хадгална', async () => {
      prismaMock.shortUrl.create.mockResolvedValue({ code: 'AbC123x' });
      const res = await service.createShortUrl('https://test.com');
      expect(res.code).toBeDefined();
    });

    it('2. Validation: хоосон URL дээр алдаа шиднэ', async () => {
      // Чиний AppService-д URL validation байхгүй бол энэ тест унах магадлалтай
      await expect(service.createShortUrl('')).rejects.toThrow();
    });

    it('3. Feature: expiresAt утгыг зөв хадгална', async () => {
      const date = new Date();
      prismaMock.shortUrl.create.mockImplementation(({ data }) => data);
      const res = await service.createShortUrl('https://test.com', date);
      expect(res.expiresAt).toEqual(date);
    });

    it('5. Length: үүсгэсэн код 7 тэмдэгт байх ёстой', async () => {
      prismaMock.shortUrl.create.mockImplementation(({ data }) => data);
      const res = await service.createShortUrl('https://test.com');
      expect(res.code.length).toBe(7);
    });
  });

  describe('getOriginalUrl', () => {
    it('6. Success: урт URL-ыг буцаана', async () => {
      prismaMock.shortUrl.findUnique.mockResolvedValue({ longUrl: 'https://test.com', expiresAt: null });
      const url = await service.getOriginalUrl('abc1234');
      expect(url.longUrl).toBe('https://test.com');
    });

    it('7. Not Found: байхгүй код дээр 404 шиднэ', async () => {
      prismaMock.shortUrl.findUnique.mockResolvedValue(null);
      await expect(service.getOriginalUrl('none')).rejects.toThrow(NotFoundException);
    });

    it('8. Analytics: clicks тоог нэмэгдүүлнэ', async () => {
      prismaMock.shortUrl.findUnique.mockResolvedValue({ longUrl: 't.com' });
      await service.getOriginalUrl('click');
      expect(prismaMock.shortUrl.update).toHaveBeenCalled();
    });

    it('9. Expiration: хугацаа дууссан бол 410 шиднэ', async () => {
      const past = new Date(); past.setFullYear(2020);
      prismaMock.shortUrl.findUnique.mockResolvedValue({ expiresAt: past });
      await expect(service.getOriginalUrl('old')).rejects.toThrow(GoneException);
    });

    it('10. Expiration: хугацаа дуусаагүй бол ажиллана', async () => {
      const future = new Date(); future.setFullYear(2030);
      prismaMock.shortUrl.findUnique.mockResolvedValue({ longUrl: 't.com', expiresAt: future });
      const res = await service.getOriginalUrl('new');
      expect(res).toBeDefined();
    });

    it('11. Security: буруу тэмдэгттэй код татгалзана', async () => {
      // Энэ тест чиний AppService-д regex байгаа эсэхээс хамаарна
      await expect(service.getOriginalUrl('x/y')).rejects.toThrow();
    });
  });
});