/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ActusService } from './actus.service';
import { PrismaService } from 'src/database/prisma.service';
import { ActusController } from './actus.controller';

@Module({
  providers: [ActusService, PrismaService],
  controllers: [ActusController],
})
export class ActusModule {}
