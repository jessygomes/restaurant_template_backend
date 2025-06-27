/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { UserController } from './user/user.controller';
import { PrismaService } from './database/prisma.service';
import { UserService } from './user/user.service';
import { AuthService } from './auth/auth.service';
import { ConfigModule } from '@nestjs/config';
import { ReservationModule } from './reservation/reservation.module';
import { ReservationController } from './reservation/reservation.controller';
import { ReservationService } from './reservation/reservation.service';
import { ArticleService } from './article/article.service';
import { ArticleController } from './article/article.controller';
import { ArticleModule } from './article/article.module';
import { EventModule } from './event/event.module';
import { EventController } from './event/event.controller';
import { EventService } from './event/event.service';
import { ClientController } from './client/client.controller';
import { ClientService } from './client/client.service';
import { ClientModule } from './client/client.module';
import { MailService } from './mailer.service';
import { TablesService } from './tables/tables.service';
import { TablesController } from './tables/tables.controller';
import { TablesModule } from './tables/tables.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UserModule,
    ReservationModule,
    ArticleModule,
    EventModule,
    ClientModule,
    TablesModule,
  ],
  controllers: [
    AppController,
    AuthController,
    UserController,
    ReservationController,
    ArticleController,
    EventController,
    ClientController,
    TablesController,
  ],
  providers: [
    AppService,
    PrismaService,
    UserService,
    AuthService,
    ReservationService,
    ArticleService,
    EventService,
    ClientService,
    MailService,
    TablesService,
  ],
})
export class AppModule {}
