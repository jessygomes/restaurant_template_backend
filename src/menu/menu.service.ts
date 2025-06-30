/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateMenuDto } from './dto/create-menu.dto';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  //! CREER UNE CATEGORIE
  async createCategory(categoryBody: CreateCategoryDto) {
    const { name, type, userId } = categoryBody;

    try {
      // Vérifier si la catégorie existe déjà
      const existingCategory = await this.prisma.menuCategory.findFirst({
        where: {
          name: name,
          userId: userId,
        },
      });

      if (existingCategory) {
        throw new Error('Cette catégorie existe déjà.');
      }

      const newCategory = await this.prisma.menuCategory.create({
        data: {
          name: name,
          type: type,
          userId: userId,
        },
      });

      return {
        message: `La catégorie ${newCategory.name} a été créé avec succès.`,
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

  //! GET ALL CATEGORIES
  async getAllCategories() {
    try {
      const categories = await this.prisma.menuCategory.findMany({
        orderBy: {
          name: 'asc',
        },
      });

      return categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new Error('Could not fetch categories');
    }
  }

  //! SUPPRIMER UNE CATEGORIE
  async deleteCategory(id: string) {
    try {
      // Vérifier si la catégorie existe
      const existingCategory = await this.prisma.menuCategory.findUnique({
        where: { id },
      });

      if (!existingCategory) {
        throw new Error(`Aucune catégorie trouvée avec l'ID ${id}.`);
      }

      // Supprimer la catégorie
      await this.prisma.menuCategory.delete({
        where: { id },
      });

      return {
        message: `La catégorie ${existingCategory.name} a été supprimée avec succès.`,
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

  //! AJOUTER UN PLAT A UNE CATEGORIE
  async createMenuItem(dto: CreateMenuDto) {
    const {
      title,
      description,
      price,
      image,
      ingredients,
      available,
      categoryId,
      userId,
    } = dto;

    try {
      // Vérifier si le plat existe déjà dans la catégorie
      const existingItem = await this.prisma.menuItem.findFirst({
        where: {
          title: title,
          categoryId: categoryId,
          userId: userId,
        },
      });

      if (existingItem) {
        throw new Error('Ce plat existe déjà dans cette catégorie.');
      }

      const newItem = await this.prisma.menuItem.create({
        data: {
          title: title,
          description: description,
          price: price,
          image: image,
          ingredients: ingredients,
          available: available,
          categoryId: categoryId,
          userId: userId,
        },
      });

      return {
        message: `Le plat ${newItem.title} a été créé avec succès.`,
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

  //! VOIR TOUS LES PLATS
  async getAllMenuItems() {
    try {
      const menuItems = await this.prisma.menuItem.findMany({
        orderBy: {
          title: 'asc',
        },
        include: {
          category: true, // pour accéder à category.name
        },
      });

      return menuItems;
    } catch (error) {
      console.error('Error fetching menu items:', error);
      throw new Error('Could not fetch menu items');
    }
  }

  //! VOIR UN PLAT PAR ID
  async getMenuItemById(id: string) {
    try {
      const menuItem = await this.prisma.menuItem.findUnique({
        where: { id },
      });

      if (!menuItem) {
        throw new Error(`Aucun plat trouvé avec l'ID ${id}.`);
      }

      return menuItem;
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

  //! VOIR TOUS LES PLATS D'UNE CATEGORIE
  async getMenuItemsByCategory(categoryId: string) {
    try {
      const menuItems = await this.prisma.menuItem.findMany({
        where: { categoryId: categoryId },
        orderBy: {
          title: 'asc',
        },
      });

      if (menuItems.length === 0) {
        throw new Error(
          `Aucun plat trouvé pour la catégorie ID ${categoryId}.`,
        );
      }

      return menuItems;
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

  //! MODIFIER UN PLAT
  async updateMenuItem(id: string, dto: CreateMenuDto) {
    const {
      title,
      description,
      price,
      image,
      ingredients,
      available,
      categoryId,
    } = dto;

    try {
      // Vérifier si le plat existe
      const existingItem = await this.prisma.menuItem.findUnique({
        where: { id },
      });

      if (!existingItem) {
        throw new Error(`Aucun plat trouvé avec l'ID ${id}.`);
      }

      const updatedItem = await this.prisma.menuItem.update({
        where: { id },
        data: {
          title: title,
          description: description,
          price: price,
          image: image,
          ingredients: ingredients,
          available: available,
          categoryId: categoryId,
        },
      });

      return {
        message: `Le plat ${updatedItem.title} a été mis à jour avec succès.`,
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

  //! SUPPRIMER UN PLAT
  async deleteMenuItem(id: string) {
    try {
      // Vérifier si le plat existe
      const existingItem = await this.prisma.menuItem.findUnique({
        where: { id },
      });

      if (!existingItem) {
        throw new Error(`Aucun plat trouvé avec l'ID ${id}.`);
      }

      // Supprimer le plat
      await this.prisma.menuItem.delete({
        where: { id },
      });

      return {
        message: `Le plat ${existingItem.title} a été supprimé avec succès.`,
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
