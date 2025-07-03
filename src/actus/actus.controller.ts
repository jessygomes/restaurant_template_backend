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
import { ActusService } from './actus.service';
import { CreateActusDto } from './dto/create-actus.dto';

@Controller('actus')
export class ActusController {
  constructor(private readonly actusService: ActusService) {}

  @Post()
  createActus(@Body() actusBody: CreateActusDto) {
    return this.actusService.createActus(actusBody);
  }

  @Get()
  getAllActus() {
    return this.actusService.getAllActus();
  }

  @Get(':id')
  getActusById(@Param('id') id: string) {
    return this.actusService.getActusById(id);
  }

  @Patch(':id')
  updateActus(@Param('id') id: string, @Body() actusBody: CreateActusDto) {
    return this.actusService.updateActus(id, actusBody);
  }

  @Delete(':id')
  deleteActus(@Param('id') id: string) {
    return this.actusService.deleteActus(id);
  }
}
