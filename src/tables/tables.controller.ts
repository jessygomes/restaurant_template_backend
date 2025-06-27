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
import { TablesService } from './tables.service';
import { CreateTableDto } from './dto/create-table.dto';

@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Get()
  getAllTables() {
    return this.tablesService.getAllTables();
  }

  @Get('resa')
  getAllTablesForResa(
    @Query('date') date: string,
    @Query('arrivalTime') arrivalTime: string,
    @Query('excludeResaId') excludeResaId?: string,
  ) {
    return this.tablesService.getAllTablesForResa(
      date,
      arrivalTime,
      excludeResaId,
    );
  }

  @Post()
  createTable(@Body() tableBody: CreateTableDto) {
    return this.tablesService.createTable(tableBody);
  }

  @Patch(':id')
  updateTable(@Param('id') id: string, @Body() tableBody: CreateTableDto) {
    return this.tablesService.updateTable(id, tableBody);
  }

  @Delete(':id')
  deleteTable(@Param('id') id: string) {
    return this.tablesService.deleteTable(id);
  }
}
