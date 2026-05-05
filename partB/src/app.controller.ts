import { Controller, Get, Param, Post, Body,Res } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import type { Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @SkipThrottle()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('api/urls')
  async createUrl(@Body() body: { longUrl: string; expiresAt?: string }) {
    // String-ээр ирсэн огноог Date объект болгож хөрвүүлнэ
    const expiry = body.expiresAt ? new Date(body.expiresAt) : undefined;
    
    return this.appService.createShortLink({
      longUrl: body.longUrl,
      expiresAt: expiry,
    });
  }

  @Get('stats/:code')
  async getStats(@Param('code') code: string) {
    return this.appService.getStatsByCode(code);
  }

  /**
   * Redirect to the original URL by short code.
   *
   * Status codes:
   * - 302 on success (Express redirect)
   * - 404 if code not found
   * - 410 if expired
   */
  @Get(':code')
  async redirectToLongUrl(
    @Param('code') code: string,
    @Res() res: Response,
  ): Promise<void> {
    const longUrl = await this.appService.getOriginalUrl(code);
    res.redirect(longUrl);
  }
}

