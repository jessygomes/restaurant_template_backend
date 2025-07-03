/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateActusDto } from './dto/create-actus.dto';

@Injectable()
export class ActusService {
  constructor(private prisma: PrismaService) {}

  //! CREER UNE ACTUS
  async createActus(actusBody: CreateActusDto) {
    console.log('Creating actus with body:', actusBody);
    const { userId, title, content, image } = actusBody;

    try {
      // Vérifier si l'actus existe déjà
      const existingActus = await this.prisma.article.findFirst({
        where: {
          title: title,
          userId: userId,
        },
      });

      if (existingActus) {
        throw new Error('Cette actualité existe déjà.');
      }

      const newActus = await this.prisma.article.create({
        data: {
          userId,
          title,
          content,
          image,
          // publishedAt: new Date(), // Utiliser la date actuelle si non fournie
        },
      });

      console.log('ACTUS created successfully:', newActus);

      return {
        message: `L'actualité ${newActus.title} a été créée avec succès.`,
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

  //! GET ALL ACTUS
  async getAllActus() {
    try {
      const actus = await this.prisma.article.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });

      return actus;
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

  //! GET ACTUS BY ID
  async getActusById(id: string) {
    try {
      const actus = await this.prisma.article.findUnique({
        where: {
          id: id,
        },
      });

      if (!actus) {
        return {
          error: true,
          message: 'Aucune actualité trouvée avec cet ID.',
        };
      }

      return actus;
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

  //! DELETE ACTUS
  async deleteActus(id: string) {
    try {
      const actus = await this.prisma.article.findUnique({
        where: {
          id: id,
        },
      });

      if (!actus) {
        return {
          error: true,
          message: 'Aucune actualité trouvée avec cet ID.',
        };
      }

      await this.prisma.article.delete({
        where: {
          id: id,
        },
      });

      return {
        message: `L'actualité ${actus.title} a été supprimée avec succès.`,
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

  //! UPDATE ACTUS
  async updateActus(id: string, actusBody: CreateActusDto) {
    const { userId, title, content, image } = actusBody;

    try {
      const existingActus = await this.prisma.article.findUnique({
        where: { id },
      });

      if (!existingActus) {
        return {
          error: true,
          message: 'Aucune actualité trouvée avec cet ID.',
        };
      }

      const updatedActus = await this.prisma.article.update({
        where: { id },
        data: {
          title,
          content,
          image,
          userId,
        },
      });

      return {
        message: `L'actualité ${updatedActus.title} a été mise à jour avec succès.`,
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
