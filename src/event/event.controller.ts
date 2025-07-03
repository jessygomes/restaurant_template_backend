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
import { EventService } from './event.service';
import { createEventDto } from './dto/create-event.dto';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  createEvent(@Body() eventBody: createEventDto) {
    return this.eventService.createEvent(eventBody);
  }

  @Get()
  getAllEvents() {
    return this.eventService.getAllEvents();
  }

  @Get(':id')
  getEventById(@Param('id') id: string) {
    return this.eventService.getEventById(id);
  }

  @Patch(':id')
  updateEvent(@Param('id') id: string, @Body() eventBody: createEventDto) {
    return this.eventService.updateEvent(id, eventBody);
  }

  @Delete(':id')
  deleteEvent(@Param('id') id: string) {
    return this.eventService.deleteEvent(id);
  }
}
