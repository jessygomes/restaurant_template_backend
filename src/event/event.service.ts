/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { createEventDto } from './dto/create-event.dto';

@Injectable()
export class EventService {
  constructor(private prisma: PrismaService) {}

  //! CREER UN EVENT
  async createEvent(eventBody: createEventDto) {
    const { title, description, date, image, banner, userId } = eventBody;

    try {
      // Vérifier si l'événement existe déjà
      const existingEvent = await this.prisma.event.findFirst({
        where: {
          title: title,
          userId: userId,
        },
      });

      if (existingEvent) {
        throw new Error('Cet événement existe déjà.');
      }

      const newEvent = await this.prisma.event.create({
        data: {
          title,
          description,
          date: new Date(date),
          image,
          banner,
          userId,
        },
      });

      return {
        message: `L'événement ${newEvent.title} a été créé avec succès.`,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Une erreur inconnue est survenue';
      return {
        error: true,
        message: errorMessage,
      };
    }
  }

  //! GET ALL EVENTS
  async getAllEvents() {
    try {
      const events = await this.prisma.event.findMany({
        orderBy: {
          date: 'desc',
        },
      });

      return events;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Une erreur inconnue est survenue';
      return {
        error: true,
        message: errorMessage,
      };
    }
  }

  //! GET EVENT BY ID
  async getEventById(id: string) {
    try {
      const event = await this.prisma.event.findUnique({
        where: { id },
      });

      if (!event) {
        return {
          error: true,
          message: 'Événement non trouvé',
        };
      }

      return event;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Une erreur inconnue est survenue';
      return {
        error: true,
        message: errorMessage,
      };
    }
  }

  //! UPDATE EVENT
  async updateEvent(id: string, eventBody: createEventDto) {
    const { title, description, date, image, banner, userId } = eventBody;

    try {
      const existingEvent = await this.prisma.event.findUnique({
        where: { id },
      });

      if (!existingEvent) {
        return {
          error: true,
          message: `Aucun événement trouvé avec l'ID ${id}.`,
        };
      }

      const updatedEvent = await this.prisma.event.update({
        where: { id },
        data: {
          title,
          description,
          date,
          image,
          banner,
          userId,
        },
      });

      return {
        message: `L'événement ${updatedEvent.title} a été mis à jour avec succès.`,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Une erreur inconnue est survenue';
      return {
        error: true,
        message: errorMessage,
      };
    }
  }

  //! DELETE EVENT
  async deleteEvent(id: string) {
    try {
      const existingEvent = await this.prisma.event.findUnique({
        where: { id },
      });

      if (!existingEvent) {
        return {
          error: true,
          message: `Aucun événement trouvé avec l'ID ${id}.`,
        };
      }

      await this.prisma.event.delete({
        where: { id },
      });

      return {
        message: `L'événement ${existingEvent.title} a été supprimé avec succès.`,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Une erreur inconnue est survenue';
      return {
        error: true,
        message: errorMessage,
      };
    }
  }
}
