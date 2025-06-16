import { Module } from '@nestjs/common';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';
import { PrismaModule } from 'src/database/prisma.module';
import { MailService } from 'src/mailer.service';

@Module({
  imports: [PrismaModule],
  controllers: [ReservationController],
  providers: [ReservationService, MailService],
})
export class ReservationModule {}
