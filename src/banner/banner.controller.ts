/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { BannerService } from './banner.service';
import { CreateBannerDto } from './dto/create-banner.dto';

@Controller('banner')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Post()
  createBanner(@Body() bannerBody: CreateBannerDto) {
    return this.bannerService.createBanner(bannerBody);
  }

  @Get()
  getAllBanners() {
    return this.bannerService.getAllBanners();
  }

  @Get(':id')
  getBannerById(@Param('id') id: string) {
    return this.bannerService.getBannerById(id);
  }

  @Patch(':id')
  updateBanner(@Param('id') id: string, @Body() bannerBody: CreateBannerDto) {
    return this.bannerService.updateBanner(id, bannerBody);
  }

  @Delete(':id')
  deleteBanner(@Param('id') id: string) {
    return this.bannerService.deleteBanner(id);
  }
}
