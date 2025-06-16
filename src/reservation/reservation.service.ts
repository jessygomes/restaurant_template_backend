/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { MailService } from 'src/mailer.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ConfirmReservationDto } from './dto/confirm-reservation.dto';
import { CreateReservationAdminDto } from './dto/create-reservation-admin.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { CancelReservationDto } from './dto/cancel-reservation.dto';

@Injectable()
export class ReservationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  //! RESERVER UNE TABLE
  async createReservation(dto: CreateReservationDto) {
    try {
      // Vérifier si le client existe déjà dans la base de données
      const existingClient = await this.prisma.client.findUnique({
        where: { email: dto.client.email },
      });

      // Créer un client avec les informations fournies
      const client =
        existingClient ??
        (await this.prisma.client.create({
          data: {
            email: dto.client.email,
            firstName: dto.client.firstName,
            lastName: dto.client.lastName,
            phone: dto.client.phone,
            userId: dto.userId,
          },
        }));

      // Vérifier si une réservation existe déjà pour cette date et heure
      const existingReservation = await this.prisma.reservation.findFirst({
        where: {
          date: new Date(dto.date),
          arrivalTime: new Date(dto.arrivalTime),
          clientId: client.id,
        },
      });

      if (existingReservation) {
        throw new Error(
          'Une réservation existe déjà pour cette date et heure.',
        );
      }

      // Créer une nouvelle réservation
      const reservation = await this.prisma.reservation.create({
        data: {
          date: new Date(dto.date),
          arrivalTime: new Date(dto.arrivalTime),
          guests: dto.guests,
          userId: dto.userId,
          clientId: client.id,
          status: 'Attente', // Enum
        },
      });

      return reservation;
    } catch (error) {
      console.error('Erreur lors de la création de la réservation:', error);
      throw new Error('Erreur lors de la création de la réservation');
    }
  }

  //! CONFIMER UNE RESERVATION
  async confirmReservation(dto: ConfirmReservationDto) {
    try {
      // Trouver la réservation correspondante
      const reservation = await this.prisma.reservation.findUnique({
        where: { id: dto.reservationId },
        include: {
          tables: true,
          client: true, // 👈 Ajoute ça pour récupérer le client
          user: true, // 👈 Facultatif : pour récupérer le nom du restaurant
        },
      });

      if (!reservation) {
        throw new NotFoundException('Réservation introuvable');
      }

      // Vérifie qu'elle n'est pas déjà confirmée
      if (reservation.status === 'Confirmée') {
        throw new BadRequestException('La réservation est déjà confirmée');
      }

      // Vérifie que les tables sont libres
      const conflictingTables = await this.prisma.reservationOnTable.findMany({
        where: {
          tableId: { in: dto.tableIds },
          reservation: {
            date: reservation.date,
            arrivalTime: reservation.arrivalTime,
            status: 'Confirmée',
          },
        },
      });

      if (conflictingTables.length > 0) {
        throw new ConflictException(
          'Une ou plusieurs tables sont déjà réservées à cette heure.',
        );
      }

      // Mise à jour du statut
      await this.prisma.reservation.update({
        where: { id: dto.reservationId },
        data: { status: 'Confirmée' },
      });

      // Association des tables
      await this.prisma.reservationOnTable.createMany({
        data: dto.tableIds.map((tableId) => ({
          reservationId: dto.reservationId,
          tableId,
        })),
      });

      // Envoi de l’email de confirmation
      // Vérifie que l'email du client est présent avant d'envoyer l'email
      if (reservation.client?.email) {
        await this.mailService.sendMail({
          to: reservation.client.email,
          subject: 'Votre réservation est confirmée 🍽️',
          html: `
            <h2>Bonjour ${reservation.client.firstName},</h2>
            <p>Votre réservation au restaurant <strong>${reservation.user?.restaurantName ?? 'notre établissement'}</strong> est bien confirmée.</p>
            <ul>
              <li><strong>Date :</strong> ${reservation.date.toLocaleDateString()}</li>
              <li><strong>Heure :</strong> ${reservation.arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</li>
              <li><strong>Nombre de personnes :</strong> ${reservation.guests}</li>
            </ul>
            <p>Nous vous remercions pour votre confiance et vous attendons avec plaisir !</p>
          `,
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la confirmation de la réservation:', error);
      throw new Error('Erreur lors de la confirmation de la réservation');
    }
  }

  //! RESERVER UNE TABLE COTE RESTAURATEUR
  async createReservationByAdmin(dto: CreateReservationAdminDto) {
    try {
      // Vérifier si le client existe déjà dans la base de données
      const existingClient = await this.prisma.client.findUnique({
        where: { email: dto.client.email },
      });

      const client =
        existingClient ??
        (await this.prisma.client.create({
          data: {
            email: dto.client.email,
            firstName: dto.client.firstName,
            lastName: dto.client.lastName,
            phone: dto.client.phone,
            userId: dto.userId,
          },
        }));

      const date = new Date(dto.date);
      const arrival = new Date(dto.arrivalTime);

      // Vérifier que les tables ne sont pas déjà occupées à cette heure
      const conflicts = await this.prisma.reservationOnTable.findMany({
        where: {
          tableId: { in: dto.tableIds },
          reservation: {
            date,
            arrivalTime: arrival,
            status: 'Confirmée',
          },
        },
      });

      if (conflicts.length > 0) {
        throw new ConflictException(
          'Certaines tables sont déjà réservées à cette heure.',
        );
      }

      const reservation = await this.prisma.reservation.create({
        data: {
          date,
          arrivalTime: arrival,
          guests: dto.guests,
          status: 'Confirmée',
          userId: dto.userId,
          clientId: client.id,
        },
      });

      // Liaison des tables
      await this.prisma.reservationOnTable.createMany({
        data: dto.tableIds.map((tableId) => ({
          reservationId: reservation.id,
          tableId,
        })),
      });

      // Envoi de l’email de confirmation
      await this.mailService.sendMail({
        to: client.email,
        subject: 'Confirmation de votre réservation',
        html: `
      <h2>Bonjour ${client.firstName},</h2>
      <p>Votre réservation au restaurant ${reservation.userId} est confirmée pour le <strong>${date.toLocaleDateString()}</strong> à <strong>${arrival.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>.</p>
      <p>Nombre de personnes : ${dto.guests}</p>
      <p>Merci et à très bientôt !</p>
    `,
      });

      return { success: true, reservationId: reservation.id };
    } catch (error) {
      console.error('Erreur lors de la création de la réservation:', error);
      throw new Error('Erreur lors de la création de la réservation');
    }
  }

  //! MODIFIER UNE RESERVATION
  async updateReservation(dto: UpdateReservationDto) {
    try {
      const reservation = await this.prisma.reservation.findUnique({
        where: { id: dto.reservationId },
        include: {
          tables: true,
        },
      });

      if (!reservation) throw new NotFoundException('Réservation introuvable');

      const date = dto.date ? new Date(dto.date) : reservation.date;
      const arrivalTime = dto.arrivalTime
        ? new Date(dto.arrivalTime)
        : reservation.arrivalTime;

      // Vérification des conflits si les tables sont changées
      if (dto.tableIds && dto.tableIds.length > 0) {
        const conflicts = await this.prisma.reservationOnTable.findMany({
          where: {
            tableId: { in: dto.tableIds },
            reservation: {
              NOT: { id: dto.reservationId }, // Exclure cette résa
              date,
              arrivalTime,
              status: 'Confirmée',
            },
          },
        });

        if (conflicts.length > 0) {
          throw new ConflictException(
            'Une ou plusieurs tables sont déjà réservées à cette heure.',
          );
        }

        // Supprimer les anciennes tables
        await this.prisma.reservationOnTable.deleteMany({
          where: { reservationId: dto.reservationId },
        });

        // Ajouter les nouvelles tables
        await this.prisma.reservationOnTable.createMany({
          data: dto.tableIds.map((tableId) => ({
            reservationId: dto.reservationId,
            tableId,
          })),
        });
      }

      // Mise à jour de la réservation
      await this.prisma.reservation.update({
        where: { id: dto.reservationId },
        data: {
          date,
          arrivalTime,
          guests: dto.guests ?? reservation.guests,
        },
      });

      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la réservation:', error);
      throw new Error('Erreur lors de la mise à jour de la réservation');
    }
  }

  //! ANNULER UNE RESERVATION (donner une raison ou pas)
  async cancelReservation(dto: CancelReservationDto) {
    try {
      const reservation = await this.prisma.reservation.findUnique({
        where: { id: dto.reservationId },
        include: {
          client: true,
          user: true,
          tables: true,
        },
      });

      if (!reservation) {
        throw new NotFoundException('Réservation introuvable');
      }

      if (reservation.status === 'Annulée') {
        throw new BadRequestException('La réservation est déjà annulée');
      }

      // Mettre à jour le statut
      await this.prisma.reservation.update({
        where: { id: dto.reservationId },
        data: { status: 'Annulée' },
      });

      // Supprimer les liens aux tables (nettoyage logique)
      await this.prisma.reservationOnTable.deleteMany({
        where: { reservationId: dto.reservationId },
      });

      // Envoi d’un e-mail au client
      if (reservation.client?.email) {
        await this.mailService.sendMail({
          to: reservation.client.email,
          subject: 'Annulation de votre réservation ❌',
          html: `
            <h2>Bonjour ${reservation.client.firstName},</h2>
            <p>Nous vous informons que votre réservation au restaurant <strong>${reservation.user.restaurantName ?? 'notre établissement'}</strong> a été <strong>annulée</strong>.</p>
            <ul>
              <li><strong>Date :</strong> ${reservation.date.toLocaleDateString()}</li>
              <li><strong>Heure :</strong> ${reservation.arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</li>
            </ul>
            ${dto.reason ? `<p><strong>Motif :</strong> ${dto.reason}</p>` : ''}
            <p>Nous restons à votre disposition pour toute nouvelle réservation.</p>
          `,
        });
      }

      return { success: true };
    } catch (error) {
      console.error("Erreur lors de l'annulation de la réservation:", error);
      throw new Error("Erreur lors de l'annulation de la réservation");
    }
  }

  //! VOIR TOUTES MES RESERVATIONS EN FONCTION DU JOUR
  async getReservationsByDay(userId: string, date: string) {
    const targetDate = new Date(date);

    // Optionnel : s’assurer qu’on ne récupère que les résas de ce jour-là
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    return this.prisma.reservation.findMany({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        client: true,
        tables: {
          include: { table: true },
        },
      },
      orderBy: {
        arrivalTime: 'asc',
      },
    });
  }

  //! VOIR UNE SEULE RESERVATION
  async getReservationById(reservationId: string) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        client: true,
        tables: {
          include: { table: true },
        },
      },
    });

    if (!reservation) {
      throw new NotFoundException('Réservation introuvable');
    }

    return reservation;
  }

  //! VOIR TOUTES LES RESERVATIONS D'UN CLIENT
  async getReservationsByClient(clientId: string) {
    const reservations = await this.prisma.reservation.findMany({
      where: { clientId },
      include: {
        tables: {
          include: { table: true },
        },
      },
    });

    if (!reservations) {
      throw new NotFoundException('Aucune réservation trouvée pour ce client');
    }

    return reservations;
  }
}
