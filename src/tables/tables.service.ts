/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateTableDto } from './dto/create-table.dto';

@Injectable()
export class TablesService {
  constructor(private prisma: PrismaService) {}

  //! GET ALL TABLES
  async getAllTables() {
    const now = new Date();

    const tables = await this.prisma.table.findMany({
      include: {
        reservations: {
          include: {
            reservation: true, // On inclut les réservations liées à cette table
          },
        },
      },
    });

    // Ajout de isReserved dynamiquement
    const tablesWithStatus = tables.map((table) => {
      const activeReservations = table.reservations.filter((r) => {
        const res = r.reservation;
        if (!res) return false;

        const isToday =
          res.date.toDateString() === now.toDateString() &&
          res.status === 'Confirmée';

        const start = new Date(res.arrivalTime);
        const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // durée estimée : 2h

        return isToday && start <= now && now <= end;
      });

      return {
        id: table.id,
        name: table.name,
        type: table.type,
        capacity: table.capacity,
        userId: table.userId,
        createdAt: table.createdAt,
        updatedAt: table.updatedAt,
        isReserved: activeReservations.length > 0,
      };
    });

    return tablesWithStatus;
  }

  //! GET ALL TABLES
  async getAllTablesForResa(
    date: string,
    arrivalTime: string,
    excludeResaId?: string,
  ) {
    const requestedStart = new Date(`${date}T${arrivalTime}`);
    const requestedEnd = new Date(requestedStart.getTime() + 90 * 60 * 1000); // 1h30

    const tables = await this.prisma.table.findMany({
      include: {
        reservations: {
          include: {
            reservation: true,
          },
        },
      },
    });

    const availableTables = tables.filter((table) => {
      const conflicts = table.reservations.some((r) => {
        const res = r.reservation;
        if (!res || res.status !== 'Confirmée') return false;

        // ✅ Ignore cette résa si c’est la résa qu’on est en train de modifier
        if (excludeResaId && res.id === excludeResaId) return false;

        const resStart = new Date(
          `${res.date.toISOString().split('T')[0]}T${res.arrivalTime.toISOString().split('T')[1]}`,
        );
        const resEnd = new Date(resStart.getTime() + 90 * 60 * 1000);

        const overlap = resStart < requestedEnd && resEnd > requestedStart;

        return overlap;
      });

      return !conflicts;
    });

    // Tu peux ajouter `isReserved: false` si tu veux conserver cette info
    return availableTables.map((table) => ({
      id: table.id,
      name: table.name,
      type: table.type,
      capacity: table.capacity,
      isReserved: false,
    }));
  }

  //! CREATE TABLE
  async createTable(tableBody: CreateTableDto) {
    try {
      const { name, capacity, type } = tableBody;
      const userId = tableBody.userId;

      // Vérifier si une table avec le même nom existe déjà pour l'utilisateur
      const existingTable = await this.prisma.table.findFirst({
        where: {
          name,
          userId,
        },
      });
      if (existingTable) {
        throw new Error(`Une table avec le nom "${name}" existe déjà.`);
      }

      // Créer la nouvelle table
      const newTable = await this.prisma.table.create({
        data: {
          name,
          capacity,
          type,
          userId, // Assurez-vous que userId est passé dans le DTO
        },
      });

      return {
        message: `La table ${newTable.name} a été créé avec succès.`,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred';
      return {
        error: true,
        message: errorMessage,
      };
    }
  }

  //! UPDATE TABLE
  async updateTable(id: string, tableBody: CreateTableDto) {
    try {
      const { name, capacity, type } = tableBody;

      // Vérifier si la table existe
      const existingTable = await this.prisma.table.findUnique({
        where: { id },
      });
      if (!existingTable) {
        throw new Error(`Aucune table trouvée avec l'ID ${id}.`);
      }

      // Mettre à jour la table
      const updatedTable = await this.prisma.table.update({
        where: { id },
        data: {
          name,
          capacity,
          type,
        },
      });

      return {
        message: `La table ${updatedTable.name} a été mise à jour avec succès.`,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred';
      return {
        error: true,
        message: errorMessage,
      };
    }
  }

  //! DELETE TABLE
  async deleteTable(id: string) {
    try {
      // Vérifier si la table existe
      const existingTable = await this.prisma.table.findUnique({
        where: { id },
      });
      if (!existingTable) {
        throw new Error(`Aucune table trouvée avec l'ID ${id}.`);
      }

      // Supprimer la table
      await this.prisma.table.delete({
        where: { id },
      });

      return {
        message: `La table ${existingTable.name} a été supprimée avec succès.`,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred';
      return {
        error: true,
        message: errorMessage,
      };
    }
  }
}
