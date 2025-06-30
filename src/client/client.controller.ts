/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ClientService } from './client.service';
import { UpdateClientDto } from './dto/update-client.dto';
import { CreateClientDto } from './dto/create-client.dto';

@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get()
  async getAllClients() {
    return this.clientService.getAllClients();
  }

  @Get('search')
  async getClientByEmail(@Query('query') query: string) {
    const client = await this.clientService.searchClients(query);
    if (!client) throw new NotFoundException('Client introuvable');
    return client;
  }

  @Post('create')
  async createClient(@Body() dto: CreateClientDto) {
    return await this.clientService.createClient(dto);
  }

  @Patch('update/:id')
  async update(@Param('id') id: string, @Body() dto: UpdateClientDto) {
    return await this.clientService.updateClient(id, dto);
  }

  @Delete('delete/:id')
  deleteClient(@Param('id') id: string) {
    return this.clientService.deleteClient(id);
  }
}
