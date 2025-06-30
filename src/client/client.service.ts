/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { UpdateClientDto } from './dto/update-client.dto';
import { CreateClientDto } from './dto/create-client.dto';

@Injectable()
export class ClientService {
  constructor(private prisma: PrismaService) {}

  //! GET ALL CLIENTS
  async getAllClients() {
    try {
      const clients = await this.prisma.client.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          reservation: {
            select: {
              date: true,
              arrivalTime: true,
              guests: true,
              status: true,
            },
          },
        },
      });
      return clients;
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw new Error('Could not fetch clients');
    }
  }

  //! SEARCH CLIENTS BY NAME OR EMAIL (for reservation form)
  async searchClients(query: string) {
    return this.prisma.client.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 10,
    });
  }

  //! CREATE CLIENT
  async createClient(dto: CreateClientDto) {
    console.log('DTO :', dto);
    const { firstName, lastName, email, phone, userId } = dto;

    try {
      const existingClient = await this.prisma.client.findFirst({
        where: {
          OR: [
            { email: email.toLowerCase() },
            {
              firstName: firstName.toLowerCase(),
              lastName: lastName.toLowerCase(),
            },
          ],
        },
      });
      if (existingClient) {
        throw new Error(`Un client avec le mail "${email}" existe déjà.`);
      }

      const newClient = await this.prisma.client.create({
        data: {
          firstName,
          lastName,
          email: email.toLowerCase(),
          phone,
          userId,
        },
      });

      return {
        message: `Le client ${newClient.firstName} ${newClient.lastName} a été créé avec succès.`,
      };
    } catch (error) {
      console.error('Error creating client:', error);
      throw new Error('Could not create client');
    }
  }

  //! UPDATE CLIENT
  async updateClient(id: string, dto: UpdateClientDto) {
    const { firstName, lastName, email, phone } = dto;
    try {
      // Vérifier si la table existe
      const existingClient = await this.prisma.client.findUnique({
        where: { id },
      });
      if (!existingClient) {
        throw new Error(`Aucun client trouvé avec l'ID ${id}.`);
      }

      const updateClient = await this.prisma.client.update({
        where: { id },
        data: {
          firstName,
          lastName,
          email: email.toLowerCase(),
          phone,
        },
      });

      return {
        message: `Le client ${updateClient.firstName} ${updateClient.lastName} a été mis à jour avec succès.`,
      };
    } catch (error) {
      console.error('Error updating client:', error);
      throw new Error('Could not update client');
    }
  }

  //! DELETE CLIENT
  async deleteClient(id: string) {
    try {
      // Vérifier si le client existe
      const existingClient = await this.prisma.client.findUnique({
        where: { id },
      });
      if (!existingClient) {
        throw new Error(`Aucun client trouvé avec l'ID ${id}.`);
      }

      // Supprimer le client
      await this.prisma.client.delete({
        where: { id },
      });

      return {
        message: `Le client ${existingClient.firstName} ${existingClient.lastName} a été supprimé avec succès.`,
      };
    } catch (error) {
      console.error('Error deleting client:', error);
      throw new Error('Could not delete client');
    }
  }
}
