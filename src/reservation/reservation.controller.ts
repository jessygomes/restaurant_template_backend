/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationService } from './reservation.service';
import { ConfirmReservationDto } from './dto/confirm-reservation.dto';
import { CreateReservationAdminDto } from './dto/create-reservation-admin.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';

@Controller('reservation')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  //! VOIR TOUTES LES RESA PAR JOUR
  @Get()
  async getByDay(@Query('userId') userId: string, @Query('date') date: string) {
    return this.reservationService.getReservationsByDay(userId, date);
  }

  //! VOIR TOUTES LES RESA
  @Get('all')
  async getAllReservations(@Query('userId') userId: string) {
    return this.reservationService.getAllReservations(userId);
  }

  //! VOIR UNE RESA PAR ID
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.reservationService.getReservationById(id);
  }

  //! VOIR TOUTES LES RESA D'UN CLIENT
  @Get('client/:clientId')
  async getByClient(@Param('clientId') clientId: string) {
    return this.reservationService.getReservationsByClient(clientId);
  }

  //! RESERVER UNE TABLE COTE CLIENT
  @Post()
  async create(@Body() reservationBody: CreateReservationDto) {
    return this.reservationService.createReservation(reservationBody);
  }

  //! CONFIRMER UNE RESERVATION COTE ADMIN
  @Patch('confirm-resa')
  async confirm(@Body() dto: ConfirmReservationDto) {
    return this.reservationService.confirmReservation(dto);
  }

  //! CREER UNE RESERVATION COTE ADMIN
  @Post('create-resa-admin')
  async createByAdmin(@Body() dto: CreateReservationAdminDto) {
    return this.reservationService.createReservationByAdmin(dto);
  }

  //! MODIFIER UNE RESERVATION
  @Patch('update/:resaId')
  async update(
    @Param('resaId') resaId: string,
    @Body() dto: UpdateReservationDto,
  ) {
    return this.reservationService.updateReservation(resaId, dto);
  }

  //! ANNULER UNE RESERVATION
  @Delete('delete/:resaId')
  async deleteReservation(@Param('resaId') resaId: string) {
    return this.reservationService.deleteReservation(resaId);
  }
}
