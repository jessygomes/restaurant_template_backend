/* eslint-disable prettier/prettier */
import { Controller, Get, NotFoundException, Query } from '@nestjs/common';
import { ClientService } from './client.service';

@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get('search')
  async getClientByEmail(@Query('query') query: string) {
    const client = await this.clientService.searchClients(query);
    if (!client) throw new NotFoundException('Client introuvable');
    return client;
  }
}
