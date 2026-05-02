import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get(':code')
  async redirectToLongUrl(
    @Param('code') code: string,
    @Res() res: Response,
  ): Promise<void> {
    const longUrl = await this.appService.getOriginalUrl(code);
    res.redirect(longUrl);
  }
}

