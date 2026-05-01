import { Test } from '@nestjs/testing';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

describe('AppService.createShortLink', () => {
  function createPrismaMock() {
    return {
      shortUrl: {
        create: jest.fn(),
      },
    };
  }

  it('Success: valid URL өгвөл short code үүсгээд хадгална', async () => {
    const prismaMock = createPrismaMock();
    prismaMock.shortUrl.create.mockResolvedValue({
      code: 'AbC123x',
      longUrl: 'https://example.com/path',
    });

    const moduleRef = await Test.createTestingModule({
      providers: [
        AppService,
        { provide: PrismaService, useValue: prismaMock as unknown as PrismaService },
      ],
    }).compile();

    const service = moduleRef.get(AppService);

    const result = await service.createShortLink({
      longUrl: 'https://example.com/path',
    });

    expect(result).toEqual({ code: 'AbC123x', longUrl: 'https://example.com/path' });
    expect(prismaMock.shortUrl.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.shortUrl.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ longUrl: 'https://example.com/path' }),
        select: { code: true, longUrl: true },
      }),
    );
  });

  it('Validation: хоосон эсвэл буруу URL өгвөл алдаа шиднэ (Prisma дуудахгүй)', async () => {
    const prismaMock = createPrismaMock();

    const moduleRef = await Test.createTestingModule({
      providers: [
        AppService,
        { provide: PrismaService, useValue: prismaMock as unknown as PrismaService },
      ],
    }).compile();

    const service = moduleRef.get(AppService);

    await expect(service.createShortLink({ longUrl: '' })).rejects.toBeDefined();
    await expect(
      service.createShortLink({ longUrl: 'not-a-url' }),
    ).rejects.toBeDefined();

    expect(prismaMock.shortUrl.create).not.toHaveBeenCalled();
  });

  it('Retry: P2002 collision гарвал дахин оролдож амжилттай бол буцаана', async () => {
    const prismaMock = createPrismaMock();
    prismaMock.shortUrl.create
      .mockRejectedValueOnce({ code: 'P2002' })
      .mockResolvedValueOnce({
        code: 'ZyX987q',
        longUrl: 'https://example.com',
      });

    const moduleRef = await Test.createTestingModule({
      providers: [
        AppService,
        { provide: PrismaService, useValue: prismaMock as unknown as PrismaService },
      ],
    }).compile();

    const service = moduleRef.get(AppService);

    const result = await service.createShortLink({ longUrl: 'https://example.com' });
    expect(result).toEqual({ code: 'ZyX987q', longUrl: 'https://example.com' });
    expect(prismaMock.shortUrl.create).toHaveBeenCalledTimes(2);
  });
});

