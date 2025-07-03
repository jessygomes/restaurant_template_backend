/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateBannerDto } from './dto/create-banner.dto';

@Injectable()
export class BannerService {
  constructor(private prisma: PrismaService) {}

  //! CREATE A BANNER
  async createBanner(bannerBody: CreateBannerDto) {
    const { userId, title, image, link, startsAt, endsAt, isActive } =
      bannerBody;

    try {
      // Vérifier si la bannière existe déjà
      const existingBanner = await this.prisma.banner.findFirst({
        where: {
          title: title,
          userId: userId,
        },
      });

      if (existingBanner) {
        throw new Error('Cette bannière existe déjà.');
      }

      const newBanner = await this.prisma.banner.create({
        data: {
          userId,
          title,
          image,
          link,
          startsAt: new Date(startsAt),
          endsAt: new Date(endsAt),
          isActive, // Par défaut, la bannière est active
        },
      });

      return {
        message: `La bannière ${newBanner.title} a été créée avec succès.`,
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

  //! GET ALL BANNERS
  async getAllBanners() {
    try {
      const banners = await this.prisma.banner.findMany({
        orderBy: {
          startsAt: 'desc',
        },
      });
      return banners;
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

  //! GET BANNER BY ID
  async getBannerById(id: string) {
    try {
      const banner = await this.prisma.banner.findUnique({
        where: {
          id: id,
        },
      });

      if (!banner) {
        throw new Error('Bannière non trouvée.');
      }

      return banner;
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

  //! UPDATE BANNER
  async updateBanner(id: string, bannerBody: CreateBannerDto) {
    const { userId, title, image, link, startsAt, endsAt, isActive } =
      bannerBody;

    try {
      // Vérifier si la bannière existe
      const existingBanner = await this.prisma.banner.findUnique({
        where: { id },
      });

      if (!existingBanner) {
        throw new Error('Bannière non trouvée.');
      }

      // Mettre à jour la bannière
      const updatedBanner = await this.prisma.banner.update({
        where: { id },
        data: {
          userId,
          title,
          image,
          link,
          startsAt: new Date(startsAt),
          endsAt: new Date(endsAt),
          isActive,
        },
      });

      return {
        message: `La bannière ${updatedBanner.title} a été mise à jour avec succès.`,
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

  //! DELETE BANNER
  async deleteBanner(id: string) {
    try {
      // Vérifier si la bannière existe
      const existingBanner = await this.prisma.banner.findUnique({
        where: { id },
      });

      if (!existingBanner) {
        throw new Error('Bannière non trouvée.');
      }

      // Supprimer la bannière
      await this.prisma.banner.delete({
        where: { id },
      });

      return {
        message: `La bannière ${existingBanner.title} a été supprimée avec succès.`,
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
